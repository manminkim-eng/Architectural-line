/* ═══════════════════════════════════════════════════════
   Service Worker — 일조권·사선제한 계산기
   MANMIN Ver1.0  |  Cache-First + Stale-While-Revalidate
═══════════════════════════════════════════════════════ */

const CACHE_NAME = 'jiljo-v1.0';
const OFFLINE_URL = './index.html';

/* 앱 시작 시 반드시 캐시할 파일 목록 */
const PRECACHE_ASSETS = [
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico'
];

/* ── Install: 핵심 파일 사전 캐시 ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: 구버전 캐시 삭제 ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: Cache-First (네트워크 실패 시 캐시 반환) ── */
self.addEventListener('fetch', event => {
  /* POST, chrome-extension 등은 무시 */
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  /* Google Fonts 등 외부 리소스: Stale-While-Revalidate */
  const isExternal = !event.request.url.includes(self.location.origin);

  if (isExternal) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  /* 로컬 파일: Cache-First */
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          /* 오프라인 폴백 */
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
    })
  );
});

function staleWhileRevalidate(request) {
  return caches.open(CACHE_NAME).then(cache =>
    cache.match(request).then(cached => {
      const networkFetch = fetch(request).then(response => {
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(() => cached);

      return cached || networkFetch;
    })
  );
}

/* ── Push 메시지 수신 (향후 확장용) ── */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
