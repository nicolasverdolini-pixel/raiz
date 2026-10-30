// Guarda el juego para que abra rápido. El juego necesita conexión para jugar online.
const CACHE = 'sendas-v38';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('sendas-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Primero la red (para recibir mejoras) y, si falla, lo guardado. "no-cache" pregunta siempre si hay versión nueva:
// sin eso el celu usa lo que tiene guardado hasta 10 minutos y mezcla archivos viejos con nuevos.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
});
