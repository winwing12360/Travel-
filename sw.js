const CACHE = 'travel-ledger-v1';
const ASSETS = [
  '/Travel-/',
  '/Travel-/index.html',
  '/Travel-/manifest.json',
  '/Travel-/icon-192.png',
  '/Travel-/icon-512.png',
];

// Install: cache app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for app shell, network-first for API calls
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Always go to network for Supabase and exchange rate APIs
  if (url.hostname.includes('supabase') || url.hostname.includes('jsdelivr') || url.hostname.includes('anthropic')) {
    e.respondWith(fetch(e.request).catch(() => new Response('offline', { status: 503 })));
    return;
  }
  // Cache-first for app assets
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }))
  );
});
