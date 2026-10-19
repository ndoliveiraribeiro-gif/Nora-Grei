// Service Worker — Nora Grei
// Muda este número em cada deploy para forçar actualização imediata
const CACHE_VERSION = 'v20261019-3';
const CACHE_NAME = `nora-grei-${CACHE_VERSION}`;

// Instala e activa imediatamente, sem esperar por tabs antigas
self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Apaga todas as caches antigas
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first: sempre vai buscar a versão mais recente
self.addEventListener('fetch', e => {
  // Só intercept requests da mesma origem
  if (!e.request.url.startsWith(self.location.origin)) return;
  // HTML sempre da rede — nunca de cache
  if (e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // Resto: network-first com fallback para cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
