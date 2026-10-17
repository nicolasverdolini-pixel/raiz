// Primera pantalla en el celular: instalar Raíz como app antes de empezar,
// así nadie juega en el navegador y después arranca de cero en la app instalada.

const Instalar = (() => {
  const CLAVE = 'raiz:instalar-saltado';
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua);
  const android = /Android/.test(ua);
  const instalada = () => navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  let aviso = null; // el pedido de instalación de Android
  let alSeguir = null;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    aviso = e;
    if (document.getElementById('instalar')) mostrar(alSeguir);
  });

  const saltado = () => { try { return localStorage.getItem(CLAVE) === '1'; } catch { return false; } };
  const debeMostrar = () => (ios || android) && !instalada() && !E.bienvenida && !saltado();

  const compartir = '<svg viewBox="0 0 24 24" class="intro-ico"><path d="M12 15V3M8 7l4-4 4 4M5 11v9h14v-9"/></svg>';
  const sumar = '<svg viewBox="0 0 24 24" class="intro-ico"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
  const abrirIco = '<svg viewBox="0 0 24 24" class="intro-ico"><path d="M12 21V11M12 11c0-4 3-7 7-7 0 4-3 7-7 7zM12 14c0-3-2.5-5.5-6-5.5 0 3.5 2.5 5.5 6 5.5z"/></svg>';

  function pasos() {
    if (android) {
      return `<div class="intro-lista">
        <div>${sumar}<span><b>Tocá "Instalar Raíz"</b>Si el botón no aparece, abrí el menú ⋮ de Chrome y elegí "Instalar app" o "Agregar a pantalla principal".</span></div>
        <div>${abrirIco}<span><b>Abrila desde tu pantalla de inicio</b>Ahí empezás a jugar.</span></div>
      </div>`;
    }
    const otroNavegador = /CriOS|FxiOS|EdgiOS/.test(ua);
    return `<div class="intro-lista">
      <div>${compartir}<span><b>Tocá el botón Compartir</b>${otroNavegador ? 'Está arriba, en la barra de la dirección.' : 'Es el cuadrado con la flecha, en la barra de Safari.'}</span></div>
      <div>${sumar}<span><b>Elegí "Agregar a inicio"</b>Si no lo ves, deslizá la lista hacia abajo.</span></div>
      <div>${abrirIco}<span><b>Abrí Raíz desde tu pantalla de inicio</b>Ahí empezás a jugar, con su ícono y en pantalla completa.</span></div>
    </div>`;
  }

  function mostrar(siguiente) {
    alSeguir = siguiente;
    let el = document.getElementById('instalar');
    if (!el) {
      el = document.createElement('div');
      el.id = 'instalar';
      el.className = 'intro';
      document.body.append(el);
    }
    document.body.classList.add('con-intro');
    el.innerHTML = `
      <div class="intro-top"></div>
      <div class="intro-paso">
        <div class="intro-arte" style="margin-top:12px"><img src="icons/icon-180.png" alt="" class="instalar-icono"></div>
        <h1 class="intro-titulo">Primero, instalala</h1>
        <p class="intro-texto">Raíz funciona como una app: con su ícono, en pantalla completa y con avisos. Instalala antes de empezar, así no arrancás dos veces.</p>
        ${pasos()}
      </div>
      <div class="intro-pie">
        <button class="btn ghost" data-instalar="seguir">Seguir en el navegador</button>
        ${android && aviso ? '<button class="btn primary" data-instalar="android">Instalar Raíz</button>' : ''}
      </div>`;
  }

  function seguir() {
    try { localStorage.setItem(CLAVE, '1'); } catch { /* sin almacenamiento */ }
    document.getElementById('instalar')?.remove();
    document.body.classList.remove('con-intro');
    alSeguir?.();
  }

  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-instalar]');
    if (!b) return;
    if (b.dataset.instalar === 'seguir') seguir();
    else if (b.dataset.instalar === 'android' && aviso) {
      aviso.prompt();
      await aviso.userChoice;
      aviso = null;
      mostrar(alSeguir);
    }
  });

  return { debeMostrar, mostrar };
})();

// Orden de arranque: instalar (si hace falta) → ingresar (si hay servidor) → introducción.
function arrancar() {
  if (Instalar.debeMostrar()) return Instalar.mostrar(arrancar);
  if (Nube.necesitaIngreso()) return Nube.mostrarIngreso();
  Nube.iniciar();
  if (!E.bienvenida) Intro.abrir();
}
arrancar();
