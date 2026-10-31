/* global caches, clients, self */

// Keep this cache limited to public, non-user-specific resources. Authenticated
// pages and API responses always use the network and are never stored here.
const CACHE_NAME = "edorax-pwa-v1";
const OFFLINE_URL = "/offline.html";
const INSTALL_ASSETS = [
  OFFLINE_URL,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(INSTALL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("edorax-pwa-") && key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Never cache account-specific HTML. If navigation cannot reach the server,
  // show a generic offline screen instead.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Next's content-hashed JS/CSS files are immutable. Caching only these keeps
  // repeat app launches fast without storing API responses or learner content.
  if (!url.pathname.startsWith("/_next/static/")) return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;

      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    })(),
  );
});
