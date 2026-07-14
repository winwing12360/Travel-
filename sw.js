// 不快取，直接從網路抓
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request));
});
