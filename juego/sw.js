// Guarda el juego para que abra rápido y funcione sin conexión.
const CACHE = 'campanas-v11';
const ARCHIVOS = ['./', 'index.html', 'estilos.css', 'manifest.webmanifest', 'icono.png',
  'js/datos.js', 'js/historia.js', 'js/mundo.js', 'js/sprites.js', 'js/iconos.js', 'js/acto2.js', 'js/oficios.js', 'js/maestria.js', 'js/lpc_datos.js', 'js/lpc.js', 'js/pueblo.js', 'js/audio.js', 'js/reglas.js', 'js/batalla.js', 'js/menus.js', 'js/interfaz.js', 'js/main.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('campanas-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Primero la red (para recibir mejoras) y, sin conexión, lo guardado.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request))
  );
});
