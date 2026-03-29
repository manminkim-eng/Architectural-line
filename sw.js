/* ═══════════════════════════════════════════
   일조사선 — Service Worker Ver 1.0
   MANMIN ARCHITECT
═══════════════════════════════════════════ */
const CACHE_NAME = 'iljo-saseon-v1.0';
const OFFLINE_PAGE = './index.html';

const PRECACHE = [
  './index.html',
  './manifest.json',
];

/* ── Install: 핵심 파일 캐시 ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE).catch(err => {
        console.warn('[SW] 캐시 실패:', err);
      });
    })
  );
  self.skipWaiting();
});

/* ── Activate: 구버전 캐시 정리 ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch: 캐시 우선 / 네트워크 폴백 ── */
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  if(!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if(cached) return cached;
      return fetch(event.request).then(response => {
        if(!response || response.status !== 200 || response.type !== 'basic') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        if(event.request.destination === 'document') return caches.match(OFFLINE_PAGE);
      });
    })
  );
});

/* ── skipWaiting 메시지 처리 ── */
self.addEventListener('message', event => {
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
