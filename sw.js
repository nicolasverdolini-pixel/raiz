// Guarda la app para que abra rápido y funcione sin conexión.
const CACHE = 'raiz-v1.5';
const ARCHIVOS = ['./', 'index.html', 'styles.css', 'js/data.js', 'js/frases.js', 'js/tree.js', 'js/sonido.js', 'js/catalogo.js', 'js/progresion.js', 'js/iconos.js', 'js/diseno.js', 'js/zoom.js', 'js/arbolvivo.js', 'js/bosque.js', 'js/jardin.js', 'js/juego.js', 'js/app.js', 'js/intro.js', 'js/nube.js', 'js/avisos.js', 'js/instalar.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Primero la red (para recibir mejoras), y si no hay conexión, lo guardado.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request))
  );
});

// Recordatorios: el servicio de avisos manda { titulo, cuerpo }.
self.addEventListener('push', e => {
  let datos = {};
  try { datos = e.data ? e.data.json() : {}; } catch { datos = { cuerpo: e.data?.text() }; }
  e.waitUntil(self.registration.showNotification(datos.titulo || 'Raíz', {
    body: datos.cuerpo || 'Tu árbol te espera.',
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    data: { url: datos.url || './' },
  }));
});

// Al tocar la notificación, abre la app (o la trae al frente si ya estaba abierta).
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ventanas => {
    const abierta = ventanas.find(v => 'focus' in v);
    return abierta ? abierta.focus() : self.clients.openWindow(e.notification.data?.url || './');
  }));
});
