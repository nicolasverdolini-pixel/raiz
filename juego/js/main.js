// Campanas de Bruma — arranque.
'use strict';

window.addEventListener('error', e => {
  const d = document.createElement('div');
  d.className = 'error-caja';
  d.textContent = 'Algo falló: ' + (e.message || e.error);
  d.onclick = () => d.remove();
  document.body.appendChild(d);
});

// El sonido en el celular solo arranca después del primer toque.
document.addEventListener('pointerdown', () => Sonido.iniciar(), { passive:true });
// Evita el zoom por doble toque y el menú de mantener apretado.
document.addEventListener('dblclick', e => e.preventDefault());
document.addEventListener('contextmenu', e => e.preventDefault());

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

pantallaTitulo();
