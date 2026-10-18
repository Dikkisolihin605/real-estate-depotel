// DEPOTEL PWA Service Worker
// Version: 1.1.0 - Auto Update & Offline Support

const CACHE_NAME = 'depotel-cache-v1.1.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/depotel-logo.svg',
  '/favicon.svg',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png'
];

// Offline HTML Fallback Page
const OFFLINE_HTML = `<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DEPOTEL - Mode Offline</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
    }
    .card {
      background: #ffffff;
      padding: 32px 24px;
      border-radius: 24px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);
      max-width: 420px;
      border: 1px solid #e2e8f0;
    }
    .logo {
      width: 72px;
      height: 72px;
      margin-bottom: 16px;
      border-radius: 20px;
      border: 2px solid #0e2a6d;
      padding: 4px;
      background: #ffffff;
    }
    h1 {
      font-size: 20px;
      font-weight: 900;
      color: #0e2a6d;
      margin: 0 0 8px 0;
    }
    p {
      font-size: 13px;
      line-height: 1.6;
      color: #64748b;
      margin: 0 0 20px 0;
    }
    .badge {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 16px;
      border: 1px solid #fde68a;
    }
    .btn {
      background: #0e2a6d;
      color: #ffffff;
      border: none;
      padding: 12px 24px;
      font-size: 13px;
      font-weight: 800;
      border-radius: 14px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(14, 42, 109, 0.25);
    }
  </style>
</head>
<body>
  <div class="card">
    <img src="/depotel-logo.svg" alt="DEPOTEL GROUP" class="logo">
    <div class="badge">Koneksi Internet Terputus</div>
    <h1>DEPOTEL Offline Mode</h1>
    <p>Aplikasi DEPOTEL berjalan secara lokal di perangkat Anda. Data yang tersimpan di cache tetap dapat diakses. Hubungkan kembali ke internet untuk menyinkronkan data terbaru ke server.</p>
    <button class="btn" onclick="window.location.reload()">Coba Muat Ulang</button>
  </div>
</body>
</html>`;

// Install event: Precache core static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache core assets safely
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('PWA Precache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event: Clean up obsolete caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('PWA: Clearing outdated cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Network-First for API with safe fallback; Cache-First for static assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore non-GET requests (mutations go directly or queued by application logic)
  if (req.method !== 'GET') {
    return;
  }

  // 1. API Endpoints: Network-First (Do NOT cache auth tokens / credentials)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          // If valid response for public data endpoint, cache a safe read-only copy
          if (networkResponse.ok && (url.pathname === '/api/data' || url.pathname === '/api/app-info')) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cache for read-only data endpoints
          return caches.match(req).then((cached) => {
            if (cached) return cached;
            return new Response(JSON.stringify({ error: 'offline', message: 'Koneksi offline' }), {
              headers: { 'Content-Type': 'application/json' },
              status: 503,
            });
          });
        })
    );
    return;
  }

  // 2. Navigation Requests (HTML Pages): Network-first with Offline HTML fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .catch(() => {
          return caches.match('/index.html').then((cachedIndex) => {
            if (cachedIndex) return cachedIndex;
            return new Response(OFFLINE_HTML, {
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
          });
        })
    );
    return;
  }

  // 3. Static Assets (CSS, JS, Fonts, Images): Stale-While-Revalidate / Cache-First
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

// Message listener for skipWaiting from app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
