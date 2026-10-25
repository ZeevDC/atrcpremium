/**
 * ATRC PMLeBoards Service Worker — Step 7 Offline Support
 *
 * This service worker does NOT intercept /api/materials/serve/* requests
 * because those are short-lived signed tokens that expire in 5 minutes.
 * Offline access is handled entirely in the browser via IndexedDB (OfflineLibrary.tsx).
 *
 * This SW only handles:
 *  - Caching static assets for faster loads
 *  - Providing a basic offline fallback for navigation requests
 */

const CACHE_NAME = 'atrc-v1';
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([OFFLINE_URL]).catch(() => {})
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never intercept API calls — always go to network
  if (url.pathname.startsWith('/api/')) return;

  // For navigation requests, try network first, fall back to cached index
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(OFFLINE_URL).then(r => r ?? new Response('Offline', { status: 503 }))
      )
    );
    return;
  }

  // For static assets, try cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
