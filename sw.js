const CACHE_NAME = 'jkt-trip-v1';

// Daftar file yang mau di-save ke memory HP (cache)
const ASSETS_TO_CACHE = [
  './maps.html',
  './data.json',
  // Cache library Leaflet & Font Google biar hemat kuota dan bisa offline
  'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,700;1,400&family=IBM+Plex+Sans:wght@300;400;500&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Install Event: Nge-save semua aset di atas ke Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Fetch Event: Ambil dari Cache kalau offline, kalau online ambil dari server
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return response dari cache kalau ada
      if (response) {
        return response;
      }
      // Kalau nggak ada di cache, request ke network
      return fetch(event.request);
    })
  );
});