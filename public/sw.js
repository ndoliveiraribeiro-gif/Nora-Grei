// Service Worker — Nora Grei
// Muda este número em cada deploy para forçar actualização imediata
const CACHE_VERSION = 'v20261020-2';
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

// Share Target: interceta o POST de /publicar com fotos partilhadas
self.addEventListener('fetch', e => {
  if (
    e.request.method === 'POST' &&
    e.request.url.includes('/publicar')
  ) {
    e.respondWith((async () => {
      try {
        const formData = await e.request.formData();
        const files = formData.getAll('fotos');
        const fotosBase64 = await Promise.all(files.map(async f => {
          const buf = await f.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
          return { name: f.name, type: f.type, base64: btoa(binary) };
        }));
        // Guardar em sessionStorage via postMessage para o cliente
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        // Abrir /publicar e passar fotos via URL + broadcast
        const url = new URL('/publicar', self.location.origin).href;
        // Guardar temporariamente em cache de SW para o cliente ler
        const cache = await caches.open('ng-share-target');
        await cache.put('/_share_fotos', new Response(JSON.stringify(fotosBase64), { headers: { 'Content-Type': 'application/json' } }));
        // Notificar clientes abertos
        for (const client of clients) {
          client.postMessage({ type: 'NG_SHARE_FOTOS', fotos: fotosBase64 });
        }
        return Response.redirect('/publicar', 303);
      } catch (err) {
        return Response.redirect('/publicar', 303);
      }
    })());
    return;
  }
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
