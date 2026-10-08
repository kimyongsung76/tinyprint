// 미니 프린터 PWA 서비스워커: 설치 가능 조건 충족 + 오프라인 실행용 캐시
const CACHE = 'tinyprint-v1';
const FILES = ['./tinyprint.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// 네트워크 우선, 실패하면 캐시 (공유 시 붙는 ?title=&text= 는 무시하고 매칭)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok && new URL(e.request.url).origin === location.origin) {
        const copy = r.clone(); const u = new URL(e.request.url); u.search = '';
        caches.open(CACHE).then(c => c.put(u.toString(), copy));
      }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
