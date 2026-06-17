const CACHE = 'coffee-order-v2-3';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 네트워크 우선 → 실패 시 캐시 → 그래도 없으면 오프라인
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 정상 응답이면 캐시에 저장 후 반환
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() =>
        // 네트워크 실패 시 캐시에서 반환 (오프라인)
        caches.match(e.request).then(r => r || caches.match('./index.html'))
      )
  );
});
