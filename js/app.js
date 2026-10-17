'use strict';

// ---------- Utilidades de fechas y texto ----------
const CLAVE = 'raiz:v1';
const z = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const sumar = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
const hoy = () => ymd(new Date());
const lunes = s => { const d = parse(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return ymd(d); };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x';
const $ = (s, el = document) => el.querySelector(s);

// ---------- Niveles ----------
const BASE = 150, FACTOR = 1.08, NIVEL_MAX = 50;

function nivelDe(savia, base = BASE, factor = FACTOR, max = NIVEL_MAX) {
  let nivel = 1, piso = 0, falta = base;
  while (nivel < max && savia >= piso + falta) {
    piso += falta;
    nivel++;
    falta = Math.round(base * Math.pow(factor, nivel - 1));
  }
  return { nivel, piso, falta, dentro: savia - piso };
}
const nivelArea = savia => nivelDe(savia, 40, 1.1, 99);
const etapaDe = nivel => ETAPAS.reduce((i, e, k) => (nivel >= e.desde ? k : i), 0);
const semillasDe = g => Math.max(1, Math.round(g / 10));

// ---------- Estado ----------
function estadoNuevo() {
  const h = hoy();
  return {
    v: 1, nombre: 'Nico', creado: h, procesado: sumar(h, -1),
    savia: 0, semillas: 0, vitalidad: 100, racha: 0, mejorRacha: 0, cumplidas: 0, diasCompletos: 0,
    areas: structuredClone(AREAS_INICIALES), saviaArea: {},
    misiones: MISIONES_INICIALES.map(m => ({ ...m, creada: h })),
    premios: structuredClone(PREMIOS_INICIALES), canjes: [],
    registro: {}, rescate: null, lluvia: {}, invierno: false, otonoHasta: null, logros: {}, reporte: null,
  };
}

let E;
try { E = JSON.parse(localStorage.getItem(CLAVE)); } catch { E = null; }
if (!E || E.v !== 1) E = estadoNuevo();
const guardarLocal = () => { try { localStorage.setItem(CLAVE, JSON.stringify(E)); } catch { /* sin almacenamiento */ } };
// Guarda en el dispositivo y, si hay cuenta, también en la nube.
const guardar = () => { guardarLocal(); if (typeof Nube !== 'undefined') Nube.subir(); };

let tab = 'hoy';
let diaRender = hoy();
// Lo que acaba de pasar, para que render() y los efectos sepan qué animar.
let anim = {};
const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Reglas ----------
const activas = () => E.misiones.filter(m => !m.archivada);
const raicesDe = d => activas().filter(m => m.tipo === 'raiz' && m.creada <= d);
const hechas = (d, id) => (E.registro[d]?.[id] || []).length;
const cadena = area => area.split('/').map((_, i, p) => p.slice(0, i + 1).join('/'));
const nombreArea = id => E.areas.find(a => a.id === id)?.nombre || id;
const lluviasDelMes = d => Object.keys(E.lluvia).filter(k => k.slice(0, 7) === d.slice(0, 7)).length;
const enOtono = () => E.otonoHasta && E.otonoHasta >= hoy();
const brotesHoy = d => Object.values(E.registro[d] || {}).reduce((a, v) => a + (Array.isArray(v) ? v.length : v && typeof v === 'object' && 'g' in v ? 1 : 0), 0);
const diaCompleto = d => { const r = raicesDe(d); return r.length > 0 && r.every(m => hechas(d, m.id) > 0); };

function mover(g, s, area) {
  E.savia = Math.max(0, E.savia + g);
  E.semillas = Math.max(0, E.semillas + s);
  if (area) for (const a of cadena(area)) E.saviaArea[a] = Math.max(0, (E.saviaArea[a] || 0) + g);
}

function desbloquear(id) {
  if (E.logros[id]) return;
  E.logros[id] = hoy();
  const l = LOGROS.find(x => x.id === id);
  if (l) setTimeout(() => toast(`Nueva lámina en tu herbario: <b>${esc(l.planta)}</b>`), 900);
}

function revisarRacha() {
  if (E.racha >= 7) desbloquear('racha7');
  if (E.racha >= 30) desbloquear('racha30');
  if (E.racha >= 66) desbloquear('racha66');
}

function marcar(id, o = 0, el = null) {
  const m = E.misiones.find(x => x.id === id);
  if (!m) return;
  const d = hoy();
  const reg = (E.registro[d] ||= {});
  const lista = (reg[id] ||= []);
  const antes = nivelDe(E.savia).nivel;
  const barraAntes = pctBarra();
  const origen = (el?.querySelector('.check') || el)?.getBoundingClientRect();
  const i = lista.findIndex(x => x.o === o);

  if (i >= 0) {
    const [x] = lista.splice(i, 1);
    mover(-x.g, -x.s, m.area);
    E.cumplidas = Math.max(0, E.cumplidas - 1);
    // Si se deshace la primera opción, la siguiente pasa a valer completa.
    if (i === 0 && lista.length) {
      const p = lista[0], ng = m.savia, ns = semillasDe(ng);
      mover(ng - p.g, ns - p.s, m.area);
      p.g = ng; p.s = ns;
    }
    if (!lista.length) delete reg[id];
    if (m.tipo === 'fruto' && !lista.length) delete m.hecha;
    if (reg._completo && !diaCompleto(d)) delete reg._completo;
    guardar();
    Sonido.deshacer();
    render();
    return;
  }

  const g = lista.length === 0 ? m.savia : Math.round(m.savia / 2);
  const s = semillasDe(g);
  lista.push({ o, g, s });
  mover(g, s, m.area);
  E.cumplidas++;
  if (m.tipo === 'fruto') { m.hecha = d; desbloquear('fruto'); }

  const extra = lista.length > 1;
  toast(`<b>+${g} savia</b> · ${esc(nombreArea(m.area))} — ${esc(frase(extra ? 'extra' : 'cumplir'))}`);

  desbloquear('primera');
  if (lista.length >= 3) desbloquear('extra');
  if (E.cumplidas >= 100) desbloquear('cien');
  let completo = false;
  if (!reg._completo && diaCompleto(d)) {
    reg._completo = true;
    completo = true;
    desbloquear('dia');
    setTimeout(() => toast(esc(frase('diaCompleto'))), 1000);
  }

  guardar();
  extra ? Sonido.extra() : Sonido.cumplir();
  anim = { nuevo: true, opcion: o };
  render(id);
  efectosDeSavia(origen, antes, completo, barraAntes);
}

// Porcentaje actual de la barra de savia del nivel.
function pctBarra() {
  const nv = nivelDe(E.savia);
  return nv.nivel >= NIVEL_MAX ? 100 : Math.round((nv.dentro / nv.falta) * 100);
}

// La gota vuela hasta la barra, la barra se llena, y si corresponde: destello o celebración.
function efectosDeSavia(origen, nivelAntes, completo, barraAntes) {
  const subio = nivelDe(E.savia).nivel > nivelAntes;
  const barra = $('.hero .bar > i');
  if (barra) {
    const meta = subio ? 100 : pctBarra();
    barra.style.transition = 'none';
    barra.style.width = barraAntes + '%';
    void barra.offsetWidth;
    setTimeout(() => {
      barra.style.transition = '';
      barra.style.width = meta + '%';
      barra.parentElement.classList.add('pulso');
    }, reducido() ? 0 : 650);
  }
  volarGota(origen, () => {
    Sonido.gota();
    if (completo) destello();
    if (subio) setTimeout(() => revisarNivel(nivelAntes), completo ? 900 : 350);
  });
}

function volarGota(desde, alFinal) {
  const barra = $('.hero .bar');
  if (!barra || !desde || reducido() || !Element.prototype.animate) { alFinal(); return; }
  const b = barra.getBoundingClientRect();
  const x0 = desde.left + desde.width / 2, y0 = desde.top + desde.height / 2;
  const x1 = b.left + (b.width * pctBarra()) / 100, y1 = Math.max(b.top + b.height / 2, 10);
  const mx = (x0 + x1) / 2 + 40, my = Math.max(Math.min(y0, y1) - 70, 10);
  const g = document.createElement('div');
  g.className = 'gota';
  document.body.append(g);
  g.animate([
    { left: x0 + 'px', top: y0 + 'px', opacity: 0, transform: 'rotate(-45deg) scale(.4)' },
    { left: mx + 'px', top: my + 'px', opacity: 1, transform: 'rotate(-45deg) scale(1.15)', offset: 0.45 },
    { left: x1 + 'px', top: y1 + 'px', opacity: 0.9, transform: 'rotate(-45deg) scale(.5)' },
  ], { duration: 650, easing: 'cubic-bezier(.5,0,.6,1)' }).onfinish = () => { g.remove(); alFinal(); };
}

// Día completo: brillo dorado y chispas sobre el árbol.
function destello() {
  Sonido.dia();
  const hero = $('.hero');
  if (!hero || reducido()) return;
  hero.classList.remove('brillo');
  void hero.offsetWidth;
  hero.classList.add('brillo');
  for (let i = 0; i < 9; i++) {
    const c = document.createElement('span');
    c.className = 'chispa';
    c.style.left = 20 + Math.random() * 90 + 'px';
    c.style.top = 15 + Math.random() * 90 + 'px';
    c.style.animationDelay = i * 0.08 + 's';
    hero.append(c);
    setTimeout(() => c.remove(), 2200);
  }
}

// Hojas que caen dentro de un contenedor.
function hojasCayendo(cont, n, colores, alto) {
  if (!cont || reducido()) return;
  for (let i = 0; i < n; i++) {
    const h = document.createElement('span');
    h.className = 'hoja-cae';
    h.style.left = 8 + Math.random() * (cont.clientWidth - 30) + 'px';
    h.style.setProperty('--c', colores[i % colores.length]);
    h.style.setProperty('--d', 3.5 + Math.random() * 2.5 + 's');
    h.style.setProperty('--h', (alto || cont.clientHeight) + 'px');
    h.style.animationDelay = (n > 1 ? Math.random() * 1.6 : 0) + 's';
    cont.append(h);
    setTimeout(() => h.remove(), 8000);
  }
}

const coloresHoja = () => (enOtono() || E.vitalidad < 30 ? PALETAS.otono : E.vitalidad < 60 ? PALETAS.cansado : PALETAS.sano);

function marcarRescate() {
  const r = E.rescate;
  if (!r || r.fecha !== hoy()) return;
  const reg = (E.registro[hoy()] ||= {});
  const m = E.misiones.find(x => x.id === r.mision);
  const antes = nivelDe(E.savia).nivel;
  if (reg._rescate) {
    mover(-reg._rescate.g, -reg._rescate.s, m?.area);
    delete reg._rescate;
  } else {
    const g = r.savia, s = semillasDe(g);
    reg._rescate = { g, s };
    mover(g, s, m?.area);
    desbloquear('rescate');
    Sonido.rescate();
    toast(`<b>+${g} savia</b> — ${esc(frase('rescate'))}`);
  }
  guardar();
  render();
  revisarNivel(antes);
}

function revisarNivel(antes) {
  const n = nivelDe(E.savia).nivel;
  if (n <= antes) return;
  if (n >= 5) desbloquear('nivel5');
  if (n >= 10) desbloquear('nivel10');
  if (n >= 20) desbloquear('nivel20');
  guardar();
  const cambioEtapa = etapaDe(n) !== etapaDe(antes);
  celebrar(n, cambioEtapa, antes);
}

// Evalúa los días que pasaron desde la última vez que se abrió la app.
function procesar() {
  const h = hoy();
  const dias = [];
  for (let d = sumar(E.procesado, 1); d < h; d = sumar(d, 1)) dias.push(d);
  if (!dias.length) return;

  const rep = { fecha: h, dias: dias.length, fallos: [], completos: 0, perdida: 0, otono: false, regreso: dias.length > 3, visto: false };
  const vitAntes = E.vitalidad;
  dias.forEach((d, i) => {
    // Si no abriste la app varios días, solo cuentan los 2 primeros: el resto el árbol hiberna.
    if (rep.regreso && i >= 2) return;
    evaluar(d, rep);
  });
  if (E.rescate && E.rescate.fecha < h) E.rescate = null;
  rep.vitalidad = E.vitalidad - vitAntes;
  E.procesado = sumar(h, -1);
  if (rep.fallos.length || rep.completos || rep.otono || rep.regreso) E.reporte = rep;
  guardar();
}

function evaluar(d, rep) {
  if (E.invierno || E.lluvia[d]) return;
  const reg = E.registro[d] || {};

  if (E.rescate && E.rescate.fecha === d) {
    if (reg._rescate) E.racha = Math.max(E.racha, E.rescate.rachaPrevia);
    E.rescate = null;
  }

  const raices = raicesDe(d);
  if (!raices.length) return;
  const fallidas = raices.filter(m => !hechas(d, m.id));

  if (!fallidas.length) {
    E.racha++;
    E.mejorRacha = Math.max(E.mejorRacha, E.racha);
    E.vitalidad = Math.min(100, E.vitalidad + 5);
    E.diasCompletos++;
    rep.completos++;
    revisarRacha();
    return;
  }

  const n = nivelDe(E.savia);
  const perdida = Math.min(fallidas.reduce((a, m) => a + Math.round(m.savia / 2), 0), E.savia - n.piso);
  E.savia -= perdida;
  rep.perdida += perdida;
  E.vitalidad = Math.max(0, E.vitalidad - 10 * fallidas.length);
  rep.fallos.push(...fallidas.map(m => m.titulo));

  const f = fallidas[0];
  E.rescate = { fecha: sumar(d, 1), mision: f.id, titulo: f.titulo, savia: f.savia * 2, rachaPrevia: E.racha };
  E.racha = 0;

  if (E.vitalidad <= 0) {
    E.savia = nivelDe(E.savia).piso;
    E.vitalidad = 50;
    E.otonoHasta = sumar(d, 7);
    rep.otono = true;
  }
}

// ---------- Interfaz ----------
function toast(html) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = html;
  $('#toasts').append(t);
  setTimeout(() => t.remove(), 2800);
}

function abrir(html) {
  const dlg = $('#sheet');
  dlg.innerHTML = html;
  if (!dlg.open) dlg.showModal();
}
const cerrar = () => $('#sheet').close();

function celebrar(nivel, cambioEtapa, nivelAntes = nivel - 1) {
  const etapa = ETAPAS[etapaDe(nivel)].nombre;
  const arbol = (et, clase) => treeSVG(et, E.vitalidad, enOtono(), { especie: E.especie }).replace('class="tree"', `class="tree ${clase}"`);
  const escena = cambioEtapa
    ? arbol(etapaDe(nivelAntes), 'viejo') + arbol(etapaDe(nivel), 'nuevo-arbol')
    : arbol(etapaDe(nivel), 'solo');
  Sonido.nivel();
  setTimeout(() => hojasCayendo($('.celebrate'), 18, ['#c9a96e', '#9db67f', '#5c7a4a', '#d99a7e'], 460), cambioEtapa ? 900 : 300);
  abrir(`<div class="celebrate">
    <div class="escena">${escena}</div>
    <div class="eyebrow">${cambioEtapa ? 'Nueva etapa' : 'Nuevo nivel'}</div>
    <h2>${cambioEtapa ? esc(etapa) : `Nivel ${nivel}`}</h2>
    <p class="quote" style="margin-top:10px">${esc(frase(cambioEtapa ? 'etapa' : 'nivel'))}</p>
    ${cambioEtapa ? `<p class="muted" style="font-size:13px">${esc(textoEtapa(nivelAntes, nivel))}</p>` : ''}
    <div class="btns" style="justify-content:center"><button class="btn primary" data-act="cerrar">Seguir creciendo</button></div>
  </div>`);
}

function saludo() {
  const h = new Date().getHours();
  return h < 13 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
}

function fechaLarga(d) {
  const t = parse(d).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// Ramas en el orden en que se crearon, cada una seguida de sus ramitas.
function areasOrdenadas() {
  const out = [];
  const visitar = padre => E.areas
    .filter(a => (a.id.includes('/') ? a.id.slice(0, a.id.lastIndexOf('/')) : '') === padre)
    .forEach(a => { out.push(a); visitar(a.id); });
  visitar('');
  return out;
}

function filaMision(m, d, recien) {
  const n = hechas(d, m.id);
  const lista = E.registro[d]?.[m.id] || [];
  const gan = lista.reduce((a, x) => a + x.g, 0);
  let sub = esc(nombreArea(m.area));
  let derecha = n ? `+${gan}` : `+${m.savia}`;
  let extraHtml = '';

  if (m.tipo === 'rama') {
    let semana = 0;
    for (let k = 0, l = lunes(d); k < 7; k++) semana += hechas(sumar(l, k), m.id);
    const meta = m.meta || 1;
    sub = `${esc(m.nota || nombreArea(m.area))}`;
    derecha = `<span class="weekly">${Array.from({ length: meta }, (_, k) => `<i class="${k < semana ? 'on' : ''}"></i>`).join('')}</span>`;
  }
  if (m.opciones?.length) {
    sub = n > 1 ? `${n} tareas hoy · bonus incluido` : 'Elegí cualquiera. Cada extra suma.';
    extraHtml = `<div class="chips">${m.opciones.map((op, k) => `<button class="chip ${lista.some(x => x.o === k) ? 'on' : ''} ${recien === m.id && anim.opcion === k ? 'pop' : ''}" data-act="marcar" data-id="${esc(m.id)}" data-o="${k}">${esc(op)}</button>`).join('')}</div>`;
  }

  const fila = m.opciones?.length
    ? `<div class="item ${n ? 'done' : ''} ${recien === m.id ? 'pop' : ''}"><span class="check"></span><span class="t"><span>${esc(m.titulo)}</span><small>${sub}</small></span><span class="xp">${derecha}</span></div>`
    : `<button class="item ${n ? 'done' : ''} ${recien === m.id ? 'pop' : ''}" data-act="marcar" data-id="${esc(m.id)}" data-o="0"><span class="check"></span><span class="t"><span>${esc(m.titulo)}</span><small>${sub}</small></span><span class="xp">${derecha}</span></button>`;
  return `<div>${fila}${extraHtml}</div>`;
}

function vistaHoy(recien) {
  const d = hoy();
  const nv = nivelDe(E.savia);
  const et = etapaDe(nv.nivel);
  const raices = raicesDe(d);
  const faltan = raices.filter(m => !hechas(d, m.id)).length;
  const diaN = Math.round((parse(d) - parse(E.creado)) / 864e5) + 1;
  const tops = E.areas.filter(a => !a.id.includes('/'));
  const otono = enOtono();

  let estado = faltan ? `Te ${faltan === 1 ? 'queda 1 raíz' : `quedan ${faltan} raíces`}.` : 'Raíces regadas.';
  if (E.invierno) estado = 'El árbol descansa.';
  else if (E.lluvia[d]) estado = 'Hoy es día de lluvia.';

  let h = `<div class="top"><span>${esc(fechaLarga(d))} · día ${diaN}</span><span class="pill">racha ${E.racha}</span></div>
  <h1 class="greet">${saludo()}, ${esc(E.nombre)}.<br><em>${estado}</em></h1>

  <div class="card dark hero">
    ${treeSVG(et, E.vitalidad, otono, { especie: E.especie, brotes: brotesHoy(d), nuevo: anim.nuevo })}
    <div style="flex:1;min-width:0">
      <div class="lvl">Nivel ${nv.nivel} · ${esc(ETAPAS[et].nombre)}</div>
      <div class="num">${nv.nivel >= NIVEL_MAX ? E.savia : `${nv.dentro} <small>/ ${nv.falta} savia</small>`}</div>
      <div class="bar"><i style="width:${nv.nivel >= NIVEL_MAX ? 100 : Math.round((nv.dentro / nv.falta) * 100)}%"></i></div>
      <div class="stats"><span>Vitalidad <b>${E.vitalidad}</b></span><span>Semillas <b>${E.semillas}</b></span></div>
    </div>
  </div>`;

  if (/iPhone|iPad|iPod/.test(navigator.userAgent) && !navigator.standalone && !E.sinAvisoInstalar) {
    h += `<div class="card soft" style="margin-top:12px;font-size:13px"><div class="row between"><b>Tenela como app</b><button class="btn ghost small" data-act="sin-instalar" aria-label="Cerrar">✕</button></div>En Safari tocá <b>Compartir</b> y después <b>Agregar a inicio</b>. Se abre en pantalla completa, con su ícono.</div>`;
  }

  const rep = E.reporte;
  if (rep && !rep.visto) {
    let titulo, cuerpo;
    if (rep.regreso) { titulo = frase('regreso'); cuerpo = `Pasaron ${rep.dias} días. Solo contaron los dos primeros; el resto, el árbol hibernó.`; }
    else if (rep.fallos.length) { titulo = frase('fallo', hash(rep.fecha)); cuerpo = `Quedó pendiente: ${esc(rep.fallos.join(', '))}. Perdiste ${rep.perdida} de savia y ${-rep.vitalidad} de vitalidad.`; }
    else { titulo = frase('diaCompleto', hash(rep.fecha)); cuerpo = `Racha de ${E.racha} ${E.racha === 1 ? 'día' : 'días'}. Vitalidad +${rep.vitalidad}.`; }
    if (rep.otono) cuerpo += ' ' + frase('otono');
    h += `<div class="card reporte ${rep.fallos.length ? 'warn' : 'soft'}" style="margin-top:12px"><div class="row between"><div class="eyebrow" style="color:inherit">Desde la última vez</div><button class="btn ghost small" data-act="visto" aria-label="Cerrar">✕</button></div><p class="quote" style="margin:6px 0 4px">${esc(titulo)}</p><div style="font-size:13px">${cuerpo}</div></div>`;
  }

  if (E.rescate && E.rescate.fecha === d) {
    const ok = !!E.registro[d]?._rescate;
    h += `<div class="card dark" style="margin-top:12px"><div class="eyebrow">Misión de rescate</div>
      <p class="quote" style="margin:6px 0">${esc(E.rescate.titulo)}, en versión larga</p>
      <div class="muted" style="font-size:13px">Hacelo hoy con un extra (más tiempo, más páginas, más ganas) y ${E.rescate.rachaPrevia ? `recuperás tu racha de ${E.rescate.rachaPrevia}` : 'ganás el doble de savia'}.</div>
      <div class="btns" style="margin-top:10px"><button class="btn ${ok ? '' : 'primary'} small" data-act="rescate" style="${ok ? '' : 'background:var(--dorado);border-color:var(--dorado);color:var(--bosque)'}">${ok ? '✓ Rescate cumplido' : `Lo hice · +${E.rescate.savia} savia`}</button></div></div>`;
  }
  if (otono) h += `<div class="card warn" style="margin-top:12px;font-size:13px"><b>Otoño</b> hasta el ${esc(fechaLarga(E.otonoHasta))}. Semana suave: con las raíces alcanza.</div>`;
  if (E.invierno) h += `<div class="card soft" style="margin-top:12px;font-size:13px">${esc(frase('invierno'))} Lo desactivás en Ajustes.</div>`;
  h += progresionArriba();

  h += `<div class="areas">${tops.map(a => `<div><b>${nivelArea(E.saviaArea[a.id] || 0).nivel}</b>${esc(a.nombre.split(' ')[0])}</div>`).join('')}</div>`;

  for (const tipo of ['raiz', 'rama', 'hoja', 'fruto']) {
    let ms = activas().filter(m => m.tipo === tipo);
    if (tipo === 'fruto') ms = ms.filter(m => !m.hecha || m.hecha === d);
    if (!ms.length) continue;
    const info = TIPOS[tipo];
    const cont = tipo === 'raiz' ? `${raices.length - faltan} de ${raices.length}` : info.ayuda;
    h += `<div class="section"><div class="eyebrow"><span>${info.nombre}</span><span style="text-transform:none;letter-spacing:0">${cont}</span></div>
      <div class="list">${ms.map(m => filaMision(m, d, recien)).join('')}</div>${tipo === 'raiz' ? lugarLibre() : ''}</div>`;
  }

  h += progresionAbajo(d);
  h += `<div class="card soft section quote">“${esc(frase('manana', hash(d)))}”</div>`;

  const quedan = 2 - lluviasDelMes(d);
  if (!E.invierno) {
    h += `<div class="section row between"><span class="muted" style="font-size:13px">${E.lluvia[d] ? 'Hoy no penaliza. Descansá.' : `Días de lluvia este mes: ${quedan}`}</span>
      ${E.lluvia[d] ? `<button class="btn small ghost" data-act="lluvia">Deshacer</button>` : `<button class="btn small" data-act="lluvia" ${quedan <= 0 ? 'disabled' : ''}>Usar día de lluvia</button>`}</div>`;
  }
  return h;
}

function vistaArbol() {
  const nv = nivelDe(E.savia);
  const et = etapaDe(nv.nivel);
  const prox = ETAPAS[et + 1];
  const nodos = areasOrdenadas();

  let h = `<h1 class="greet" style="margin-top:0">Tu árbol</h1>
  <div class="card dark section arbol-card" style="text-align:center">
    ${treeSVG(et, E.vitalidad, enOtono(), { especie: E.especie, brotes: brotesHoy(hoy()) }).replace('class="tree"', 'class="tree" style="width:170px;height:190px"')}
    <div class="lvl eyebrow" style="color:var(--dorado)">${esc(especieActual().nombre)} · Nivel ${nv.nivel} · ${esc(ETAPAS[et].nombre)}</div>
    <div class="muted" style="font-size:13px;margin-top:4px">${prox ? `Próxima etapa: ${esc(prox.nombre)} en el nivel ${prox.desde}` : 'Llegaste al bosque.'}</div>
    <div class="stats" style="justify-content:center"><span>Savia total <b>${E.savia}</b></span><span>Mejor racha <b>${E.mejorRacha}</b></span><span>Misiones <b>${E.cumplidas}</b></span></div>
  </div>

  <div class="section"><div class="eyebrow"><span>Ramas y ramitas</span></div><div class="list tree-list">`;
  for (const a of nodos) {
    const prof = a.id.split('/').length - 1;
    const sv = E.saviaArea[a.id] || 0;
    const n = nivelArea(sv);
    h += `<div class="node" style="padding-left:${14 + prof * 18}px">
      <div class="row between"><span class="${prof ? '' : 'serif'}" style="${prof ? 'font-size:14px' : 'font-size:17px'}">${esc(a.nombre)}</span><span class="lvl-tag">nv ${n.nivel} · ${sv} savia</span></div>
      ${prof ? '' : `<div class="bar light"><i style="width:${Math.round((n.dentro / n.falta) * 100)}%"></i></div>`}
    </div>`;
  }
  h += `</div></div>

  <div class="section"><div class="eyebrow"><span>Herbario</span><span>${Object.keys(E.logros).length} de ${LOGROS.length}</span></div>
    <div class="herbario">${LOGROS.map(l => {
      const ok = E.logros[l.id];
      return `<div class="lamina ${ok ? '' : 'locked'}">${laminaSVG(l.forma)}<b>${ok ? esc(l.planta) : '?'}</b><span class="muted">${esc(l.texto)}</span></div>`;
    }).join('')}</div></div>`;
  return h;
}

function vistaPremios() {
  let h = `<h1 class="greet" style="margin-top:0">Premios</h1>
  <div class="card dark section row between"><div><div class="eyebrow">Tus semillas</div><div class="serif" style="font-size:34px">${E.semillas}</div></div>
    <div class="muted" style="font-size:13px;max-width:180px;text-align:right">Ganás 1 semilla cada 10 de savia. Canjealas por cosas que te hagan bien.</div></div>
  <div class="section"><div class="eyebrow"><span>Para canjear</span></div><div class="list">`;
  h += E.premios.map(p => `<div class="item"><span class="t"><span>${esc(p.titulo)}</span><small>${p.costo} semillas</small></span>
    <button class="btn small" data-act="canjear" data-id="${esc(p.id)}" ${E.semillas < p.costo ? 'disabled' : ''}>Canjear</button>
    <button class="btn small ghost" data-act="borrar-premio" data-id="${esc(p.id)}" aria-label="Borrar">✕</button></div>`).join('') || '<div class="empty">Todavía no hay premios.</div>';
  h += `</div><div class="btns" style="margin-top:10px"><button class="btn" data-act="nuevo-premio">+ Nuevo premio</button></div></div>`;
  if (E.canjes.length) {
    h += `<div class="section"><div class="eyebrow"><span>Canjeados</span></div><div class="list">${E.canjes.slice(-10).reverse().map(c => `<div class="item"><span class="t"><span>${esc(c.titulo)}</span><small>${esc(fechaLarga(c.fecha))}</small></span><span class="xp">−${c.costo}</span></div>`).join('')}</div></div>`;
  }
  return h;
}

function vistaAjustes() {
  let h = `<h1 class="greet" style="margin-top:0">Ajustes</h1>
  <div class="section"><div class="eyebrow"><span>Tus misiones</span></div>`;
  for (const tipo of ['raiz', 'rama', 'hoja', 'fruto']) {
    const ms = activas().filter(m => m.tipo === tipo);
    if (!ms.length) continue;
    h += `<div class="muted" style="font-size:12px;margin:12px 2px 6px">${TIPOS[tipo].nombre}</div><div class="list">${ms.map(m => `<button class="item" data-act="editar" data-id="${esc(m.id)}"><span class="t"><span>${esc(m.titulo)}</span><small>${esc(nombreArea(m.area))} · ${m.savia} savia${m.meta ? ` · ${m.meta}×/semana` : ''}${m.opciones?.length ? ` · ${m.opciones.length} opciones` : ''}${m.hecha ? ' · cumplido' : ''}</small></span><span class="xp">Editar</span></button>`).join('')}</div>`;
  }
  h += `<div class="btns" style="margin-top:10px"><button class="btn primary" data-prog="catalogo">+ Del catálogo</button><button class="btn" data-act="editar">+ Misión propia</button><button class="btn" data-act="nueva-area">+ Nueva ramita</button></div></div>

  ${typeof Nube !== 'undefined' ? Nube.ajustesHTML() : ''}

  <div class="section"><div class="eyebrow"><span>Tu árbol</span></div><div class="list">
    <button class="item" data-act="elegir-especie"><span class="t"><span>Tu árbol</span><small>${esc(especieActual().nombre)} · ${esc(especieActual().rasgo)}</small></span><span class="xp">Cambiar</span></button>
    <button class="item" data-act="ver-intro"><span class="t"><span>Cómo se juega</span><small>Volver a ver la introducción.</small></span><span class="xp">Ver</span></button>
    <label class="item"><span class="t"><span>Tu nombre</span></span><input id="nombre" value="${esc(E.nombre)}" style="border:1px solid var(--linea);border-radius:8px;padding:6px 10px;width:130px;background:var(--crema)"></label>
    <label class="item"><span class="t"><span>Modo invierno</span><small>Pausa todo sin penalidad (enfermedad, viaje).</small></span><span class="toggle"><input type="checkbox" id="invierno" ${E.invierno ? 'checked' : ''}><span></span></span></label>
    <label class="item"><span class="t"><span>Sonidos</span><small>En el iPhone se escuchan si no está en silencio.</small></span><span class="toggle"><input type="checkbox" id="sonido" ${E.sonido !== false ? 'checked' : ''}><span></span></span></label>
    <div class="item"><span class="t"><span>Recordatorios</span><small>Próximamente: avisos en el iPhone.</small></span></div>
  </div></div>

  <div class="section"><div class="eyebrow"><span>Tus datos</span></div>
    <div class="muted" style="font-size:13px;margin:0 2px 8px">${typeof Nube !== 'undefined' && Nube.sesion ? 'Se guardan en la nube y en este dispositivo. Igual podés descargar un respaldo.' : 'Se guardan en este dispositivo. Descargá un respaldo de vez en cuando.'}</div>
    <div class="btns"><button class="btn" data-act="exportar">Descargar respaldo</button><button class="btn" data-act="importar">Restaurar respaldo</button><button class="btn danger ghost" data-act="reiniciar">Empezar de cero</button></div>
    <input type="file" id="archivo" accept="application/json" hidden>
  </div>
  <p class="muted" style="text-align:center;font-size:12px;margin-top:28px">Raíz · versión 0.6</p>`;
  return h;
}

function opcionesArea(sel) {
  return areasOrdenadas()
    .map(a => `<option value="${esc(a.id)}" ${a.id === sel ? 'selected' : ''}>${'  '.repeat(a.id.split('/').length - 1).replace(/ /g, '&nbsp;')}${esc(a.nombre)}</option>`).join('');
}

function editarMision(id) {
  const m = E.misiones.find(x => x.id === id) || { tipo: 'hoja', area: 'mente', savia: 10 };
  abrir(`<form class="sheet" id="form-mision">
    <h2>${id ? 'Editar misión' : 'Nueva misión'}</h2>
    <label class="field">Qué vas a hacer<input name="titulo" required value="${esc(m.titulo || '')}" placeholder="Leer 10 páginas"></label>
    <label class="field">Tipo<select name="tipo">${Object.entries(TIPOS).map(([k, t]) => `<option value="${k}" ${k === m.tipo ? 'selected' : ''}>${t.singular} — ${t.ayuda}</option>`).join('')}</select></label>
    <label class="field">Rama<select name="area">${opcionesArea(m.area)}</select></label>
    <label class="field">Dificultad<select name="savia">${DIFICULTAD.map(x => `<option value="${x.valor}" ${x.valor === m.savia ? 'selected' : ''}>${x.nombre} · ${x.valor} savia</option>`).join('')}</select></label>
    <label class="field">Veces por semana (solo ramas)<input name="meta" type="number" min="1" max="7" value="${m.meta || 3}"></label>
    <label class="field">Opciones (una por línea, opcional)<textarea name="opciones" placeholder="Barrer&#10;Pasar el trapo">${esc((m.opciones || []).join('\n'))}</textarea></label>
    <label class="field">Nota (opcional)<input name="nota" value="${esc(m.nota || '')}"></label>
    <div class="btns">${id ? `<button type="button" class="btn danger ghost" data-act="archivar" data-id="${esc(id)}">Borrar</button>` : ''}<button type="button" class="btn ghost" data-act="cerrar">Cancelar</button><button class="btn primary">Guardar</button></div>
    <input type="hidden" name="id" value="${esc(id || '')}">
  </form>`);
}

function guardarMision(f) {
  const datos = Object.fromEntries(new FormData(f));
  const titulo = datos.titulo.trim();
  if (!titulo) return;
  const opciones = datos.opciones.split('\n').map(s => s.trim()).filter(Boolean);
  const base = {
    titulo, tipo: datos.tipo, area: datos.area, savia: Number(datos.savia),
    meta: datos.tipo === 'rama' ? Math.max(1, Math.min(7, Number(datos.meta) || 1)) : undefined,
    opciones: opciones.length ? opciones : undefined,
    nota: datos.nota.trim() || undefined,
  };
  const previa = datos.id && E.misiones.find(x => x.id === datos.id);
  if (base.tipo === 'raiz' && previa?.tipo !== 'raiz' && raicesActivas() >= maxRaices()) {
    toast(`En ${ETAPAS[etapaDe(nivelDe(E.savia).nivel)].nombre} podés tener hasta ${maxRaices()} raíces. Sumala como hoja o esperá a crecer.`);
    return;
  }
  if (datos.id) {
    Object.assign(previa, base);
  } else {
    let nid = slug(titulo);
    while (E.misiones.some(x => x.id === nid)) nid += '-1';
    E.misiones.push({ id: nid, creada: hoy(), ...base });
  }
  guardar();
  cerrar();
  render();
  toast('Misión guardada');
}

function nuevaArea() {
  abrir(`<form class="sheet" id="form-area">
    <h2>Nueva ramita</h2>
    <label class="field">Nombre<input name="nombre" required placeholder="Espalda"></label>
    <label class="field">Dentro de<select name="padre"><option value="">(rama principal)</option>${opcionesArea('')}</select></label>
    <div class="btns"><button type="button" class="btn ghost" data-act="cerrar">Cancelar</button><button class="btn primary">Agregar</button></div>
  </form>`);
}

const especieActual = () => ESPECIES.find(x => x.id === E.especie) || ESPECIES[0];

function elegirEspecie() {
  abrir(`<div class="sheet">
    <h2>Tu árbol</h2>
    <p class="muted" style="font-size:13px;margin-top:-6px">Tu progreso no cambia: solo la especie.</p>
    <div class="intro-especies">${ESPECIES.map(x => `<button class="esp ${x.id === especieActual().id ? 'on' : ''}" data-act="especie" data-esp="${x.id}">${treeSVG(5, 100, false, { especie: x.id })}<b>${esc(x.nombre)}</b><small>${esc(x.rasgo)}</small></button>`).join('')}</div>
    <div class="btns"><button type="button" class="btn ghost" data-act="cerrar">Cancelar</button></div>
  </div>`);
}

// Tocar el árbol: se sacude, caen hojas y te dice algo.
function tocarArbol(svg) {
  if (svg.classList.contains('sacudir')) return;
  svg.classList.add('sacudir');
  setTimeout(() => svg.classList.remove('sacudir'), 700);
  Sonido.hojas();
  const cont = svg.closest('.hero, .arbol-card');
  hojasCayendo(cont, 3, coloresHoja(), cont?.clientHeight);
  toast(esc(frase('manana')));
}

function nuevoPremio() {
  abrir(`<form class="sheet" id="form-premio">
    <h2>Nuevo premio</h2>
    <label class="field">Premio<input name="titulo" required placeholder="Zapatillas nuevas"></label>
    <label class="field">Cuesta (semillas)<input name="costo" type="number" min="1" required value="100"></label>
    <div class="btns"><button type="button" class="btn ghost" data-act="cerrar">Cancelar</button><button class="btn primary">Agregar</button></div>
  </form>`);
}

// ---------- Render y eventos ----------
function render(recien) {
  diaRender = hoy();
  const vistas = { hoy: vistaHoy, arbol: vistaArbol, premios: vistaPremios, ajustes: vistaAjustes };
  $('#view').innerHTML = vistas[tab](recien);
  anim = {};
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  // Al ver un fallo, caen algunas hojas (una vez por reporte).
  const r = $('.reporte.warn');
  if (r && E.reporte && !E.reporte.animado) {
    E.reporte.animado = true;
    guardar();
    setTimeout(() => hojasCayendo(r, 6, PALETAS.otono), 400);
  }
}

// De vez en cuando cae una hoja del árbol. En otoño, más seguido.
let ritmo = 0;
setInterval(() => {
  if (document.hidden || $('#sheet').open) return;
  ritmo++;
  if (ritmo % (enOtono() || E.vitalidad < 30 ? 1 : 3)) return;
  const cont = $('.hero') || $('.arbol-card');
  if (cont) hojasCayendo(cont, 1, coloresHoja(), cont.clientHeight);
}, 4000);

document.querySelector('.tabs').addEventListener('click', e => {
  const b = e.target.closest('button[data-tab]');
  if (!b) return;
  if (tab === b.dataset.tab) return;
  tab = b.dataset.tab;
  Sonido.tab();
  render();
  const v = $('#view');
  v.classList.remove('entrar');
  void v.offsetWidth;
  v.classList.add('entrar');
  window.scrollTo(0, 0);
});

document.addEventListener('click', e => {
  const arbol = e.target.closest('.hero .tree, .arbol-card .tree');
  if (arbol) { tocarArbol(arbol); return; }
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const { act, id } = el.dataset;
  if (act === 'marcar') marcar(id, Number(el.dataset.o || 0), el);
  else if (act === 'rescate') marcarRescate();
  else if (act === 'cerrar') cerrar();
  else if (act === 'visto') { E.reporte.visto = true; guardar(); render(); }
  else if (act === 'lluvia') {
    const d = hoy();
    if (E.lluvia[d]) delete E.lluvia[d];
    else if (lluviasDelMes(d) < 2) { E.lluvia[d] = true; toast(esc(frase('lluvia'))); }
    guardar(); render();
  }
  else if (act === 'editar') editarMision(id);
  else if (act === 'sin-instalar') { E.sinAvisoInstalar = true; guardar(); render(); }
  else if (act === 'ver-intro') Intro.abrir(true);
  else if (act === 'elegir-especie') elegirEspecie();
  else if (act === 'especie') {
    E.especie = el.dataset.esp;
    guardar(); cerrar(); render();
    Sonido.cumplir();
    toast(`Ahora tu árbol es un <b>${esc(especieActual().nombre.toLowerCase())}</b>`);
  }
  else if (act === 'archivar') {
    if (!confirm('¿Borrar esta misión? Tu historial y tu savia se conservan.')) return;
    E.misiones.find(x => x.id === id).archivada = true;
    guardar(); cerrar(); render();
  }
  else if (act === 'nueva-area') nuevaArea();
  else if (act === 'nuevo-premio') nuevoPremio();
  else if (act === 'borrar-premio') { E.premios = E.premios.filter(p => p.id !== id); guardar(); render(); }
  else if (act === 'canjear') {
    const p = E.premios.find(x => x.id === id);
    if (!p || E.semillas < p.costo || !confirm(`¿Canjear "${p.titulo}" por ${p.costo} semillas?`)) return;
    E.semillas -= p.costo;
    E.canjes.push({ titulo: p.titulo, costo: p.costo, fecha: hoy() });
    guardar(); render();
    Sonido.canje();
    toast(`Disfrutalo: <b>${esc(p.titulo)}</b>. Te lo ganaste.`);
  }
  else if (act === 'exportar') {
    const blob = new Blob([JSON.stringify(E, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `raiz-respaldo-${hoy()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  else if (act === 'importar') $('#archivo').click();
  else if (act === 'reiniciar') {
    if (!confirm('¿Empezar de cero? Se borra todo tu progreso en este dispositivo.')) return;
    E = estadoNuevo(); guardar(); tab = 'hoy'; render();
  }
});

document.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  if (f.id === 'form-mision') guardarMision(f);
  else if (f.id === 'form-area') {
    const { nombre, padre } = Object.fromEntries(new FormData(f));
    if (!nombre.trim()) return;
    let nid = (padre ? padre + '/' : '') + slug(nombre);
    while (E.areas.some(a => a.id === nid)) nid += '-1';
    E.areas.push({ id: nid, nombre: nombre.trim() });
    guardar(); cerrar(); render(); toast('Ramita agregada');
  }
  else if (f.id === 'form-premio') {
    const { titulo, costo } = Object.fromEntries(new FormData(f));
    if (!titulo.trim() || !(Number(costo) > 0)) return;
    E.premios.push({ id: slug(titulo) + '-' + Date.now().toString(36), titulo: titulo.trim(), costo: Math.round(Number(costo)) });
    guardar(); cerrar(); render();
  }
});

document.addEventListener('change', e => {
  if (e.target.id === 'invierno') { E.invierno = e.target.checked; guardar(); if (E.invierno) toast(esc(frase('invierno'))); }
  else if (e.target.id === 'sonido') { E.sonido = e.target.checked; guardar(); if (E.sonido) Sonido.cumplir(); }
  else if (e.target.id === 'nombre') { E.nombre = e.target.value.trim() || 'vos'; guardar(); }
  else if (e.target.id === 'archivo') {
    const file = e.target.files[0];
    if (!file) return;
    file.text().then(txt => {
      const datos = JSON.parse(txt);
      if (datos?.v !== 1 || !datos.misiones) throw new Error('formato');
      if (!confirm('¿Reemplazar tu progreso actual por este respaldo?')) return;
      E = datos; guardar(); procesar(); tab = 'hoy'; render(); toast('Respaldo restaurado');
    }).catch(() => toast('Ese archivo no es un respaldo de Raíz.'));
  }
});

$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') cerrar(); });

// Si la app queda abierta y cambia el día, se procesa al volver.
function revisarDia() {
  if (hoy() !== diaRender) { procesar(); render(); }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) revisarDia(); });
setInterval(revisarDia, 60000);

document.addEventListener('pointerdown', () => Sonido.despertar(), { once: true });

vincularCatalogo();
procesar();
render();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
