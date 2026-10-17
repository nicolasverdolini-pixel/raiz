// Cuenta y guardado en la nube: ingreso con email + código, y sincronización del progreso.
// El servidor es una aplicación web de Google Apps Script (ver servidor/Codigo.gs).

const URL_SERVIDOR = 'https://script.google.com/macros/s/AKfycby10S1lKMa5-pTjh6L7duDCKV1YrW1txR-qTE8MOB7ClesoEcD0afTVgisntHMiHB__3A/exec';

const Nube = (() => {
  const CLAVE = 'raiz:sesion';
  let s = null;
  try { s = JSON.parse(localStorage.getItem(CLAVE)); } catch { s = null; }
  let espera = null, enviando = false, pendiente = false;
  let emailIngreso = '', cambiando = false;

  const activa = () => !!URL_SERVIDOR || !!llamar.prueba;
  const guardarSesion = () => { try { s ? localStorage.setItem(CLAVE, JSON.stringify(s)) : localStorage.removeItem(CLAVE); } catch { /* sin almacenamiento */ } };

  async function llamar(accion, datos = {}) {
    if (llamar.prueba) return llamar.prueba(accion, datos);
    const r = await fetch(URL_SERVIDOR, { method: 'POST', body: JSON.stringify({ accion, ...datos }) });
    return r.json();
  }

  // ---------- Sincronización ----------

  function subir() {
    if (!s) return;
    pendiente = true;
    clearTimeout(espera);
    espera = setTimeout(enviar, 1500);
  }

  async function enviar() {
    if (!s || enviando) return;
    if (!navigator.onLine) { espera = setTimeout(enviar, 10000); return; }
    enviando = true;
    pendiente = false;
    try {
      const r = await llamar('guardar', { token: s.token, progreso: E, version: s.version || 0 });
      if (r.error === 'sesion') return sesionVencida();
      if (r.conflicto) {
        adoptar(r.progreso, r.version);
        toast('Se actualizó con lo que hiciste en otro dispositivo');
      } else if (r.ok) {
        s.version = r.version;
        s.ultimo = Date.now();
        guardarSesion();
      }
    } catch {
      pendiente = true;
    } finally {
      enviando = false;
    }
    if (pendiente) espera = setTimeout(enviar, 8000);
  }

  // Trae lo más nuevo del servidor (por ejemplo, al volver a abrir la app).
  async function bajar() {
    if (!s || pendiente || enviando) return;
    try {
      const r = await llamar('cargar', { token: s.token });
      if (r.error === 'sesion') return sesionVencida();
      if (r.progreso && r.version > (s.version || 0)) adoptar(r.progreso, r.version);
      else if (!r.progreso) subir();
    } catch { /* sin conexión: se usa lo local */ }
  }

  function adoptar(progreso, version) {
    E = progreso;
    s.version = version;
    s.ultimo = Date.now();
    guardarSesion();
    guardarLocal();
    procesar();
    render();
  }

  function sesionVencida() {
    s = null;
    guardarSesion();
    toast('Tu sesión venció. Entrá de nuevo.');
    mostrarIngreso();
  }

  // ---------- Pantalla de ingreso ----------

  function pantalla(html) {
    let el = document.getElementById('ingreso');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ingreso';
      el.className = 'intro';
      document.body.append(el);
    }
    document.body.classList.add('con-intro');
    el.innerHTML = html;
    const input = el.querySelector('input');
    if (input) setTimeout(() => input.focus(), 350);
  }

  function mostrarIngreso() {
    cambiando = false;
    pantalla(`
      <div class="intro-top"></div>
      <div class="intro-paso">
        <div class="intro-arte">${treeSVG(1, 100, false, { especie: E.especie })}</div>
        <h1 class="intro-titulo">Entrá a Raíz</h1>
        <p class="intro-texto">Poné tu email y te mandamos un código. Sin contraseñas.</p>
        <input id="ingreso-email" class="intro-input" type="email" inputmode="email" autocomplete="email" placeholder="tu@email.com" value="${esc(emailIngreso)}">
        <div class="intro-lista" style="margin-top:14px">
          <div><span><b>¿Ya tenés cuenta?</b>Usá el mismo email y recuperás tu árbol tal como lo dejaste.</span></div>
          <div><span><b>¿Es tu primera vez?</b>Con tu email se crea tu cuenta y tu árbol queda guardado.</span></div>
        </div>
        <p class="intro-error" id="ingreso-error"></p>
      </div>
      <div class="intro-pie">
        <button class="btn ghost" data-nube="sin-cuenta">Sin cuenta</button>
        <button class="btn primary" data-nube="pedir">Mandarme el código</button>
      </div>`);
  }

  function mostrarCodigo() {
    pantalla(`
      <div class="intro-top"></div>
      <div class="intro-paso">
        <div class="eyebrow">${cambiando ? 'Cambiar email' : 'Revisá tu mail'}</div>
        <h2 class="intro-titulo">Escribí el código</h2>
        <p class="intro-chico" style="margin-top:0">Lo mandamos a <b>${esc(emailIngreso)}</b>. Si no aparece, mirá en spam o promociones.</p>
        <input id="ingreso-codigo" class="intro-input codigo" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="······">
        <p class="intro-error" id="ingreso-error"></p>
        <div class="btns" style="margin-top:14px"><button class="btn small ghost" data-nube="reenviar">Reenviar código</button><button class="btn small ghost" data-nube="otro-email">Usar otro email</button></div>
      </div>
      <div class="intro-pie">
        <button class="btn ghost" data-nube="${cambiando ? 'cancelar' : 'volver'}">${cambiando ? 'Cancelar' : 'Atrás'}</button>
        <button class="btn primary" data-nube="${cambiando ? 'confirmar-cambio' : 'verificar'}">${cambiando ? 'Cambiar' : 'Entrar'}</button>
      </div>`);
  }

  function mostrarCambio() {
    cambiando = true;
    emailIngreso = '';
    pantalla(`
      <div class="intro-top"></div>
      <div class="intro-paso">
        <div class="eyebrow">Tu cuenta</div>
        <h2 class="intro-titulo">Cambiar email</h2>
        <p class="intro-chico" style="margin-top:0">Ahora usás <b>${esc(s?.email || '')}</b>. Tu progreso pasa completo al email nuevo.</p>
        <input id="ingreso-email" class="intro-input" type="email" inputmode="email" autocomplete="email" placeholder="nuevo@email.com">
        <p class="intro-error" id="ingreso-error"></p>
      </div>
      <div class="intro-pie">
        <button class="btn ghost" data-nube="cancelar">Cancelar</button>
        <button class="btn primary" data-nube="pedir">Mandarme el código</button>
      </div>`);
  }

  function cerrarPantalla() {
    document.getElementById('ingreso')?.remove();
    if (!document.getElementById('intro')) document.body.classList.remove('con-intro');
  }

  const error = t => { const e = document.getElementById('ingreso-error'); if (e) e.textContent = t || ''; };
  function ocupado(btn, si, texto) {
    if (!btn) return;
    btn.disabled = si;
    if (texto) btn.textContent = texto;
  }

  async function pedir(btn) {
    const v = document.getElementById('ingreso-email')?.value.trim().toLowerCase();
    if (v) emailIngreso = v;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailIngreso)) return error('Escribí un email válido.');
    ocupado(btn, true, 'Mandando…');
    try {
      const r = await llamar('pedirCodigo', { email: emailIngreso });
      if (r.error) { ocupado(btn, false, 'Mandarme el código'); return error(r.error); }
      mostrarCodigo();
      toast('Código enviado');
    } catch {
      ocupado(btn, false, 'Mandarme el código');
      error('No hay conexión. Probá de nuevo.');
    }
  }

  async function verificar(btn) {
    const codigo = document.getElementById('ingreso-codigo')?.value.replace(/\D/g, '');
    if (!codigo || codigo.length !== 6) return error('El código tiene 6 números.');
    ocupado(btn, true, 'Entrando…');
    try {
      const r = await llamar('verificar', { email: emailIngreso, codigo });
      if (r.error) { ocupado(btn, false, 'Entrar'); return error(r.error); }
      s = { token: r.token, email: r.email, version: r.version || 0 };
      guardarSesion();
      if (r.progreso) {
        // Ya jugaba: se trae su árbol.
        E = r.progreso;
        guardarLocal();
        procesar();
      } else {
        // Cuenta nueva: si ya venía jugando en este dispositivo, ese progreso se sube.
        delete E.sinCuenta;
        guardarLocal();
        subir();
      }
      cerrarPantalla();
      render();
      if (!E.bienvenida) Intro.abrir();
      else toast(`Hola de nuevo, <b>${esc(E.nombre)}</b>`);
      Sonido.cumplir();
    } catch {
      ocupado(btn, false, 'Entrar');
      error('No hay conexión. Probá de nuevo.');
    }
  }

  async function confirmarCambio(btn) {
    const codigo = document.getElementById('ingreso-codigo')?.value.replace(/\D/g, '');
    if (!codigo || codigo.length !== 6) return error('El código tiene 6 números.');
    ocupado(btn, true, 'Cambiando…');
    try {
      const r = await llamar('cambiarEmail', { token: s.token, email: emailIngreso, codigo });
      if (r.error === 'sesion') return sesionVencida();
      if (r.error) { ocupado(btn, false, 'Cambiar'); return error(r.error); }
      s.email = r.email;
      guardarSesion();
      cambiando = false;
      cerrarPantalla();
      render();
      toast(`Listo: ahora entrás con <b>${esc(r.email)}</b>`);
    } catch {
      ocupado(btn, false, 'Cambiar');
      error('No hay conexión. Probá de nuevo.');
    }
  }

  async function salir() {
    if (!confirm('¿Cerrar sesión? Tu árbol queda guardado en la nube y en este dispositivo se borra.')) return;
    clearTimeout(espera);
    if (pendiente) await enviar();
    llamar('cerrarSesion', { token: s.token }).catch(() => {});
    s = null;
    guardarSesion();
    E = estadoNuevo();
    guardarLocal();
    tab = 'hoy';
    render();
    mostrarIngreso();
  }

  // ---------- Ajustes ----------

  function ajustesHTML() {
    if (!activa()) return '';
    if (!s) {
      return `<div class="section"><div class="eyebrow"><span>Tu cuenta</span></div><div class="list">
        <button class="item" data-nube="entrar"><span class="t"><span>Crear cuenta o entrar</span><small>Guardá tu árbol en la nube y no lo pierdas nunca.</small></span><span class="xp">Entrar</span></button>
      </div></div>`;
    }
    const cuando = s.ultimo ? new Date(s.ultimo).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'pendiente';
    return `<div class="section"><div class="eyebrow"><span>Tu cuenta</span></div><div class="list">
      <div class="item"><span class="t"><span>${esc(s.email)}</span><small>Guardado en la nube · ${esc(cuando)}</small></span></div>
      <button class="item" data-nube="cambiar"><span class="t"><span>Cambiar email</span></span><span class="xp">Cambiar</span></button>
      <button class="item" data-nube="salir"><span class="t"><span>Cerrar sesión</span></span><span class="xp">Salir</span></button>
    </div></div>`;
  }

  // ---------- Eventos ----------

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-nube]');
    if (!b) return;
    const a = b.dataset.nube;
    if (a === 'pedir') pedir(b);
    else if (a === 'verificar') verificar(b);
    else if (a === 'confirmar-cambio') confirmarCambio(b);
    else if (a === 'reenviar') pedir(b);
    else if (a === 'otro-email' || a === 'volver') { cambiando ? mostrarCambio() : mostrarIngreso(); }
    else if (a === 'cancelar') { cambiando = false; cerrarPantalla(); render(); }
    else if (a === 'entrar') mostrarIngreso();
    else if (a === 'cambiar') mostrarCambio();
    else if (a === 'salir') salir();
    else if (a === 'sin-cuenta') {
      E.sinCuenta = true;
      guardarLocal();
      cerrarPantalla();
      if (!E.bienvenida) Intro.abrir();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (e.target.id === 'ingreso-email') pedir(document.querySelector('[data-nube="pedir"]'));
    if (e.target.id === 'ingreso-codigo') {
      const b = document.querySelector('[data-nube="verificar"], [data-nube="confirmar-cambio"]');
      cambiando ? confirmarCambio(b) : verificar(b);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (pendiente) enviar(); }
    else bajar();
  });
  window.addEventListener('online', () => { if (pendiente) enviar(); });

  // Al abrir: si hay servidor y no hay cuenta, se pide ingresar (salvo que eligió jugar sin cuenta).
  function iniciar() {
    if (!activa()) return;
    if (s) bajar();
    else if (!E.sinCuenta) mostrarIngreso();
  }

  return {
    activa, subir, bajar, iniciar, ajustesHTML, mostrarIngreso,
    get sesion() { return s; },
    necesitaIngreso: () => activa() && !s && !E.sinCuenta,
    probar(fn) { llamar.prueba = fn; },
  };
})();

Nube.iniciar();
