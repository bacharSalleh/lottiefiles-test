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
```

View online
```
https://vercel.com/bacharsalleh/lottiefiles-test
```

## Directory Structure

- `src/`: Source files for the application.
  - `components/`: React components.
  - `hooks/`: Custom hooks.
  - `helpers/`: Helper functions and constants.
  - `service-worker/`: Service worker setup for caching and offline capabilities.

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
- Helper function `postSearch` from `../helpers/http`.
- Constants from `../helpers/constants`.
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
- `searchForAnimationsWithFetch`: Handles fetching animations with offline support.
- `requestBackgroundSyncForSearchQuery`: Registers a background sync task for search queries.

### Cache Management
- Utilize `graphqlResCache` and `localforage` to manage cached data, and `CryptoJS` to generate hash keys for cache entries.

<br>
<br>
<br>
       

## Hook Documentation `useLottieAnimations` 

This custom React hook facilitates querying Lottie animations, handling pagination, and communicating with a service worker for offline support.


