# Lottie Animations Explorer Documentation

## Overview
This React application allows users to search, preview Lottie animations. The application is built with offline-first capabilities ensuring a seamless user experience even without network connectivity.

## Features

- **Search Animations**: Users can search for Lottie animations using a search bar.
- **Preview Animations**: Display a list of animations based on the search query.
- **Offline Access**: Caching of animations for offline access and preview.
- **Pagination**: Navigate through multiple pages of animation results.

## Setup

Clone the repository and install the dependencies:
```bash
git clone https://github.com/bacharSalleh/lottiefiles-test
cd lottiefiles-test
npm install
```

Run the application:
```bash
npm run dev
npx wrangler dev
```

View online
```
https://lottiefiles-test.vercel.app/
```

## Directory Structure
- `cloud-worker/`: Source file for cloudflare worker.
- `src/`: Source files for the application.
  - `components/`: React components.
  - `pages/`: React components.
  - `hooks/`: Custom hooks.
  - `helpers/`: Helper functions and constants.
  - `service-worker/`: Service worker setup for caching and offline capabilities.

## Application Pages

The application is structured around two main pages which are essential for the user interaction:

1. **Home Page**:
   - This is the landing page where users can search and preview animations.
   
2. **Library Page**:
   - This page allows users to view, save, or remove animations to and from their personal library. The animations saved here can be managed even when offline, thanks to the service worker's background synchronization capabilities.
   - 
## Offline Capabilities
The application uses a service worker to cache assets and API responses, enabling offline access to cached animations.

## Pagination
Users can navigate through different pages of animation results using the Next and Back buttons.



<br>
<br>
<br>
<br>

## Service Worker Documentation  `src/service-worker/sw.ts` 

This script configures a Service Worker to enable caching, routing, and background synchronization in the application, enhancing offline capabilities.

### Imports
- Various [Workbox](https://github.com/GoogleChrome/workbox) libraries for precaching, routing, and cache expiration.
- `localforage` for local storage management.
- `CryptoJS` for generating hash values.
- `CacheService` for cache management.

### Cache Initialization
- Create `graphqlResCache` instance of `CacheService`.
- Call `cleanupOutdatedCaches` and `precacheAndRoute` to manage caches.

### Event Listeners
- `install` and `activate` listeners for service worker lifecycle management.
- `fetch` listener to handle network requests and respond with cached data or fetch from the network.
- `sync` listener to handle background synchronization tasks.

### Route Registrations
- Register routes for navigation requests and caching Lottie animation JSON files.

### Helper Functions
1. **`searchForAnimationsWithFetch` Function:**
   - Handles animation fetch requests, especially when offline, by registering a background sync or returning cached data.

2. **`saveAnimationWithFetch` Function:**
   - Manages the saving of animations when offline by storing them locally and registering a background sync for later synchronization.

3. **`removeAnimationWithFetch` Function:**
   - Manages removal of animations when offline by storing the animation identifiers locally and registering a background sync for later synchronization.

4. **`syncSaveAnimation`, `syncRemoveAnimation`, and `syncSearchAnimations` Functions:**
   - These functions handle the synchronization of saved, removed, and searched animations respectively once online connectivity is restored.

5. **`requestBackgroundSyncForSearchQuery` Function:**
   - Registers a background sync for search queries when offline and stores the search query locally for later synchronization.


### Cache Management
- Utilize `graphqlResCache` and `localforage` to manage cached data, and `CryptoJS` to generate hash keys for cache entries.

<br>
<br>
<br>


## Server Architecture

The Lottie Animations Explorer utilizes a server architecture powered by Cloudflare Workers and TurboDB (edge database) for managing user libraries. 

- **Cloudflare Workers:** 
   - Hosts two API endpoints, one for posting and another for removing animations. 
   - Interacts with TurboDB for data persistence.
   
- **TurboDB (Edge Database):** 
   - Utilized for storing and managing animation data efficiently at the edge.

- **API Interaction:** 
   - `saveAnimationToServer` and `removeAnimationFromServer` functions in the service worker script send requests to the respective endpoints hosted on Cloudflare Workers.
   - These functions handle the posting and removing of animations, enabling users to manage their library even while offline, with changes synchronized when back online. 

- **Offline Capabilities:**
   - Service Worker scripts ensure seamless offline functionality, with background synchronization to update the server once the app regains network connectivity.

- **Environment Configuration:** 
   - Utilizes an environment variable `VITE_API_URL` to manage the base URL for server endpoints, ensuring flexibility between development and production environments.

This architecture leverages edge computing and efficient database management to provide a robust and user-friendly experience.