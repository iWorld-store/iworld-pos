// Service Worker for offline functionality
const CACHE_NAME = 'phone-pos-v4';
const OLD_CACHE_NAMES = ['phone-pos-v1', 'phone-pos-v2', 'phone-pos-v3'];

// Install event - cache resources
self.addEventListener('install', (event) => {
  // Force activation of new service worker immediately
  self.skipWaiting();
  
  event.waitUntil(
    // Delete all old caches first
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (OLD_CACHE_NAMES.includes(cacheName) || cacheName.startsWith('phone-pos-')) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Then create new cache
      return caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache only the root page and essential assets
        return cache.addAll([
          '/',
        ]).catch((error) => {
          // Silently fail - app will still work
          console.warn('Some resources could not be cached:', error);
          });
        });
      })
  );
});

// Activate event - clean up old caches aggressively
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Delete ALL old caches, not just specific ones
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  
  // Don't cache Next.js internal files and API routes
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('layout.css') ||
    url.pathname.includes('main-app.js') ||
    url.pathname.includes('app-pages-internals.js') ||
    url.pathname.includes('page.js') ||
    url.pathname.includes('page.tsx')
  ) {
    // Always fetch from network for Next.js internal files
    return fetch(event.request).catch(() => {
      return new Response('Network error', { status: 503 });
    });
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache successful GET requests (but not Next.js internals)
            if (
              !url.pathname.startsWith('/_next/') &&
              !url.pathname.startsWith('/api/') &&
              !url.pathname.includes('page.js') &&
              !url.pathname.includes('page.tsx') &&
              !url.pathname.includes('layout.css') &&
              !url.pathname.includes('main-app.js') &&
              !url.pathname.includes('app-pages-internals.js')
            ) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }

            return response;
          })
          .catch(() => {
            // If network fails and it's a document request, try to return cached root
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
            // Otherwise return a basic error response
            return new Response('Offline', { status: 503 });
          });
      })
  );
});
