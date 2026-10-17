// Recordatorios en el celular (Web Push), con el servicio de Cloudflare (ver avisos/).

const URL_AVISOS = 'https://raiz-avisos.raizapp.workers.dev';
const VAPID_PUBLICA = 'BKefXAGvyZ3jEpQxwxJS6MtVRNb9spebqPgVsGipNgxkR2YdsYFdqHbWUWWfHYD_8-SLgr_5BIAvtsX-jfrai20';

const Avisos = (() => {
  const CLAVE = 'raiz:avisos';
  let p = { activo: false, manana: '08:30', noche: '21:00' };
  try { p = { ...p, ...JSON.parse(localStorage.getItem(CLAVE) || '{}') }; } catch { /* sin almacenamiento */ }
  let ultimo = '', espera = null, ocupado = false;

  const guardarP = () => { try { localStorage.setItem(CLAVE, JSON.stringify(p)); } catch { /* sin almacenamiento */ } };
  const soportado = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const instalada = () => navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  const tz = () => -new Date().getTimezoneOffset();

  const aBytes = b64 => {
    const s = atob(b64.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64.length + 3) % 4));
    return Uint8Array.from(s, c => c.charCodeAt(0));
  };

  async function post(ruta, datos) {
    const r = await fetch(URL_AVISOS + ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
    return r.json();
  }

  // Lo que el servicio necesita saber para avisar: raíces del día y cuáles faltan.
  function estadoDelDia() {
    const d = hoy();
    const raices = raicesDe(d);
    return {
      fecha: d, tz: tz(), manana: p.manana || null, noche: p.noche || null,
      raices: raices.map(m => m.titulo),
      pendientes: E.invierno || E.lluvia[d] ? [] : raices.filter(m => !hechas(d, m.id)).map(m => m.titulo),
    };
  }

  async function activar() {
    if (ocupado) return;
    if (!soportado() || (ios && !instalada())) return toast('Para recibir avisos, instalá Raíz en tu pantalla de inicio.');
    ocupado = true;
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== 'granted') { toast('Sin permiso no te puedo avisar. Lo cambiás en los ajustes del celular.'); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: aBytes(VAPID_PUBLICA) });
      const r = await post('/suscribir', { suscripcion: sub.toJSON(), email: typeof Nube !== 'undefined' ? Nube.sesion?.email : null, ...estadoDelDia() });
      if (!r.ok) throw new Error(r.error);
      p.activo = true;
      p.endpoint = sub.endpoint;
      guardarP();
      ultimo = '';
      Sonido.dia();
      toast('Listo: te voy a avisar 🌱');
    } catch {
      toast('No pude activar los avisos. Probá de nuevo en un rato.');
    } finally {
      ocupado = false;
      render();
    }
  }

  async function desactivar() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) { await post('/desuscribir', { endpoint: sub.endpoint }).catch(() => {}); await sub.unsubscribe(); }
    } catch { /* igual se apaga localmente */ }
    p.activo = false;
    delete p.endpoint;
    guardarP();
    render();
    toast('Avisos apagados');
  }

  async function probar() {
    if (!p.endpoint) return;
    try {
      const r = await post('/probar', { endpoint: p.endpoint });
      toast(r.ok ? 'Te mandé uno de prueba. Debería llegarte en unos segundos.' : r.error || 'No llegó. Desactivá y activá de nuevo.');
    } catch {
      toast('No hay conexión. Probá de nuevo.');
    }
  }

  // Después de cada cambio en la app, avisa al servicio (solo si cambió algo relevante).
  function reportar() {
    if (!p.activo || !p.endpoint) return;
    const estado = estadoDelDia();
    const firma = JSON.stringify(estado);
    if (firma === ultimo) return;
    clearTimeout(espera);
    espera = setTimeout(async () => {
      try {
        await post('/estado', { endpoint: p.endpoint, ...estado });
        ultimo = firma;
      } catch { /* se reintenta en el próximo cambio */ }
    }, 2500);
  }

  function ajustesHTML() {
    let cuerpo;
    if (!soportado() || (ios && !instalada())) {
      cuerpo = `<div class="item"><span class="t"><span>Recordatorios</span><small>${ios ? 'Instalá Raíz en tu pantalla de inicio (Compartir → Agregar a inicio) y abrila desde ahí para activar avisos.' : 'Este navegador no permite avisos.'}</small></span></div>`;
    } else if (!p.activo) {
      cuerpo = `<button class="item" data-avisos="activar"><span class="t"><span>Activar recordatorios</span><small>Un aviso a la mañana con tus raíces y otro a la noche si te falta alguna.</small></span><span class="xp">Activar</span></button>`;
    } else {
      cuerpo = `
        <label class="item"><span class="t"><span>Aviso de la mañana</span><small>Tus raíces del día</small></span><input type="time" class="hora" data-avisos-hora="manana" value="${esc(p.manana || '')}"></label>
        <label class="item"><span class="t"><span>Aviso de la noche</span><small>Solo si te queda alguna raíz</small></span><input type="time" class="hora" data-avisos-hora="noche" value="${esc(p.noche || '')}"></label>
        <button class="item" data-avisos="probar"><span class="t"><span>Mandarme uno de prueba</span></span><span class="xp">Probar</span></button>
        <button class="item" data-avisos="desactivar"><span class="t"><span>Apagar recordatorios</span></span><span class="xp">Apagar</span></button>`;
    }
    return `<div class="section"><div class="eyebrow"><span>Recordatorios</span></div><div class="list">${cuerpo}</div></div>`;
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-avisos]');
    if (!b) return;
    const a = b.dataset.avisos;
    if (a === 'activar') activar();
    else if (a === 'desactivar') desactivar();
    else if (a === 'probar') probar();
  });

  document.addEventListener('change', e => {
    const campo = e.target.dataset?.avisosHora;
    if (!campo) return;
    p[campo] = e.target.value || null;
    guardarP();
    reportar();
    toast(e.target.value ? `Aviso de la ${campo === 'manana' ? 'mañana' : 'noche'} a las ${e.target.value}` : 'Aviso apagado');
  });

  return { ajustesHTML, reportar };
})();
