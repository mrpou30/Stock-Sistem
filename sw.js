// ===============================
// 🔧 Random Check V6 - Service Worker
// ===============================

const CACHE_NAME = "rc-v6-cache-v1";

// Masukkan semua file yang perlu disimpan offline
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// ===============================
// 📌 Install Service Worker
// ===============================
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching app shell...");
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// ===============================
// 📌 Activate Service Worker
// Hapus cache lama jika ada update
// ===============================
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");

  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// ===============================
// 📌 Fetch Handler
// Strategy: Cache First + Online Update
// ===============================
self.addEventListener("fetch", (event) => {
  // Hanya handle GET request
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Update cache dengan versi terbaru
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        })
        .catch(() => cachedResponse);

      // Jika offline → ambil dari cache
      return cachedResponse || fetchPromise;
    })
  );
});