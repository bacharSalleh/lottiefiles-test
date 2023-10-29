declare const self: ServiceWorkerGlobalScope;

import CryptoJS from "crypto-js";
import localforage from "localforage";
import { ExpirationPlugin } from "workbox-expiration";
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";
import {
  SYNC_BACKGROUND_SEARCH_QUERY_RESULT,
  SYNC_BACKGROUND_SEARCH_QUERY_TAG,
  SYNC_REMOVE_ANIMATION_TAG,
  SYNC_SAVE_ANIMATION_TAG,
} from "../helpers/constants";
import {
  postSearch,
  removeAnimationFromServer,
  saveAnimationToServer,
} from "../helpers/http";
import { SaveAnimationPayload } from "../helpers/types";
import { CacheService } from "./cacheService";

const graphqlResCache = new CacheService("graphql-res");

/**
 * Cleanup outdated caches for space conservation.
 * Precache assets listed in the manifest for offline access.
 */
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

/**
 * On `install`, ensure service worker takes control immediately.
 * On `activate`, ensure service worker takes control of all clients.
 */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());

registerRoute(
  ({ request }) => request.mode === "navigate",
  createHandlerBoundToURL("/index.html")
);

registerRoute(
  /^https:\/\/assets-v2\.lottiefiles\.com\/a\/.*\.json$/,
  new CacheFirst({
    cacheName: "api-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200, // Only keep 60 entries.
        purgeOnQuotaError: true,
      }),
    ],
  })
);

self.addEventListener("fetch", async (event) => {
  const url = new URL(event.request.url);

  if (
    url.href === "https://graphql.lottiefiles.com/" &&
    event.request.method === "POST"
  ) {
    event.respondWith(searchForAnimationsWithFetch(event));
  }

  if (url.pathname === "/api" && event.request.method === "POST") {
    event.respondWith(saveAnimationWithFetch(event));
  }

  if (/^\/api\/.+$/.test(url.pathname) && event.request.method === "DELETE") {
    event.respondWith(removeAnimationWithFetch(event));
  }
});

/**
 * Listener for the 'sync' event.
 * This event is triggered when a background sync is registered.
 * It's used here to fetch and cache the results of a search query that was made while offline.
 */
self.addEventListener("sync", (event) => {
  if (event.tag === SYNC_BACKGROUND_SEARCH_QUERY_TAG) {
    event.waitUntil(syncSearchAnimations());
  }
  if (event.tag === SYNC_SAVE_ANIMATION_TAG) {
    event.waitUntil(syncSaveAnimation());
  }
  if (event.tag === SYNC_REMOVE_ANIMATION_TAG) {
    event.waitUntil(syncRemoveAnimation());
  }
});

async function searchForAnimationsWithFetch(event: FetchEvent) {
  const body = await event.request.clone().text();
  const hash = CryptoJS.SHA256(body).toString();

  // on offline
  if (!navigator.onLine) {
    requestBackgroundSyncForSearchQuery(body);

    // check if there is cached data for this request
    const cachedResponse = await graphqlResCache.get(hash);
    if (cachedResponse) {
      return cachedResponse;
    }

    // No cached data
    const adjustedResponse = new Response(
      "The request could not be completed as the device is offline. The request will be retried once the device is back online.",
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );
    return adjustedResponse;
  }

  const response = await postSearch(body);

  // update cache with fresh data
  if (response.status == 200) {
    await graphqlResCache.add(hash, response);
  }

  return response;
}

async function saveAnimationWithFetch(event: FetchEvent) {
  if (!navigator.onLine) {
    const animationsToSave =
      (await localforage.getItem<SaveAnimationPayload[]>(
        "animations-to-save"
      )) || [];
    animationsToSave.push(await event.request.json());
    await localforage.setItem("animations-to-save", animationsToSave);
    await self.registration.sync.register(SYNC_SAVE_ANIMATION_TAG);
    return new Response(null, { status: 200 });
  } else {
    const response = await fetch(event.request);
    return response;
  }
}

async function removeAnimationWithFetch(event: FetchEvent) {
  if (!navigator.onLine) {
    const animationsToRemove =
      (await localforage.getItem<string[]>("animations-to-remove")) || [];
    animationsToRemove.push(
      new URL(event.request.url).pathname.split("/").pop()
    );
    await localforage.setItem("animations-to-remove", animationsToRemove);
    await self.registration.sync.register(SYNC_REMOVE_ANIMATION_TAG);
    return new Response(null, { status: 200 });
  } else {
    const response = await fetch(event.request);
    return response;
  }
}

async function syncSaveAnimation() {
  const animations = await localforage.getItem<SaveAnimationPayload[]>(
    "animations-to-save"
  );
  if (!animations || animations.length === 0) {
    return;
  }

  for (const animation of animations) {
    try {
      await saveAnimationToServer(animation); 
      animations.splice(animations.indexOf(animation), 1);
      await localforage.setItem("animations-to-save", animations);
    } catch (error) {
      console.error("Failed to save animation:", error);
      // If an error occurs, exit the function to keep the remaining animations in the list
      return;
    }
  }
}

async function syncRemoveAnimation() {
  const animations = await localforage.getItem<string[]>(
    "animations-to-remove"
  );
  if (!animations || animations.length === 0) {
    return;
  }

  for (const animation of animations) {
    try {
      await removeAnimationFromServer(animation);

      animations.splice(animations.indexOf(animation), 1);

      await localforage.setItem("animations-to-remove", animations);
    } catch (error) {
      console.error("Failed to remove animation:", error);
      return;
    }
  }
}

async function syncSearchAnimations() {
  const payload = await localforage.getItem<string>(
    SYNC_BACKGROUND_SEARCH_QUERY_TAG
  );

  if (!payload) {
    return;
  }

  await localforage.removeItem(SYNC_BACKGROUND_SEARCH_QUERY_TAG);

  const response = await postSearch(payload);
  const hash = CryptoJS.SHA256(payload).toString();
  await graphqlResCache.add(hash, response);

  const responseJson = await response.json();
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage({
      type: SYNC_BACKGROUND_SEARCH_QUERY_RESULT,
      msg: responseJson.data,
    });
  }
}

async function requestBackgroundSyncForSearchQuery(body: string) {
  if (!self.registration.sync) {
    return;
  }
  try {
    await self.registration.sync.register(SYNC_BACKGROUND_SEARCH_QUERY_TAG);
    await localforage.setItem(SYNC_BACKGROUND_SEARCH_QUERY_TAG, body);
  } catch (error) {
    console.error("Error registering sync or setting item:", error);
  }
}
