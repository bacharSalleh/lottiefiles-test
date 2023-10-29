declare const self: ServiceWorkerGlobalScope;

import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { postSearch } from "../helpers/http";
import {
  BACKGROUND_SEARCH_QUERY_RESULT,
  BACKGROUND_SEARCH_QUERY_TAG,
} from "../helpers/constants";
import localforage from "localforage";
import CryptoJS from "crypto-js";
import { CacheService } from "./cacheService";

const graphqlResCache = new CacheService("graphql-res");

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

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
        maxAgeSeconds: 2 * 24 * 60 * 60, // Only keep entries for 30 days.
        // Automatically cleanup if quota is exceeded.
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
});

self.addEventListener("sync", (event) => {
  if (event.tag === BACKGROUND_SEARCH_QUERY_TAG) {
    event.waitUntil(
      (async () => {
        const payload = await localforage.getItem<string>(
          BACKGROUND_SEARCH_QUERY_TAG
        );

        if (!payload) {
          return;
        }

        await localforage.removeItem(BACKGROUND_SEARCH_QUERY_TAG);

        const response = await postSearch(payload);
        const hash = CryptoJS.SHA256(payload).toString();
        await graphqlResCache.add(hash, response);

        const responseJson = await response.json();
        const clients = await self.clients.matchAll();
        for (const client of clients) {
          client.postMessage({
            type: BACKGROUND_SEARCH_QUERY_RESULT,
            msg: responseJson.data,
          });
        }
      })()
    );
  }
});

async function searchForAnimationsWithFetch(event: FetchEvent) {
  const body = await event.request.clone().text();
  const hash = CryptoJS.SHA256(body).toString();

  if (!navigator.onLine) {
    requestBackgroundSyncForSearchQuery(body);

    // check if there is cached data for this request
    const cachedResponse = await graphqlResCache.get(hash);
    if (cachedResponse) {
      return cachedResponse;
    }

    // No Data at all
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

  if (response.status == 200) {
    await graphqlResCache.add(hash, response);
  }

  return response;
}

async function requestBackgroundSyncForSearchQuery(body: string) {
  if (!self.registration.sync) {
    return;
  }
  try {
    await self.registration.sync.register(BACKGROUND_SEARCH_QUERY_TAG);
    await localforage.setItem(BACKGROUND_SEARCH_QUERY_TAG, body);
  } catch (error) {
    console.error("Error registering sync or setting item:", error);
  }
}
