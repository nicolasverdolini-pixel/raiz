// Sendas del Éter: une el mundo 3D, la conexión, los controles y la pantalla.
import * as THREE from 'three';
import * as R from './reglas.js';
import { cargarTodo, crear, VISUAL } from './modelos.js';
import { crearEscena } from './escena.js';
import { crearEfectos } from './efectos.js';
import { Red } from './red.js';
import { Hud } from './hud.js';
import * as O from './objetos.js';
import * as C from './clases.js';
import { Paneles } from './paneles.js';
import { Seleccion } from './seleccion.js';

const E = crearEscena(document.getElementById('mundo'));
const FX = crearEfectos(E.scene);
const lienzo = document.getElementById('textos'), tc = lienzo.getContext('2d');
const RETRASO = 130;                 // ms de atraso para que los demás se muevan suave
const entes = new Map();
let yoId = null, yo = null, estado = null, objetivo = null, destino = null, listo = false, mio = null, npcPendiente = null;
const drops = new Map(), npcs = [];
let lx = 0, lz = 0, ldir = 0, ultEnvio = 0, enviado = { x: 0, z: 0 }, temblor = 0;
const numeros = [];
const v3 = new THREE.Vector3();

// ---------- conexión ----------
const red = new Red(alMensaje, estadoRed => {
  if (estadoRed === 'reconectando') hud.toast('Se cortó la conexión. Reconectando…');
  if (estadoRed === 'reemplazado') { hud.toast('Entraste desde otro lado.', 'grande'); }
  if (estadoRed === 'sin-servidor') errorEntrar('No se pudo conectar con el servidor.');
});
const hud = new Hud({
  atacar: atacarCercano,
  hab: id => usarHabilidad(id),
  pocion: () => red.mandar({ t: 'pot' }),
  eter: () => red.mandar({ t: 'eter' }),
  personaje: tab => paneles.personaje(tab),
  comerciar: id => red.mandar({ t: 'com', a: 'pedir', id }),
  aceptarComercio: de => red.mandar({ t: 'com', a: 'acepta', de }),
  punto: (s, n) => red.mandar({ t: 'punto', s, n }),
  invitar: id => red.mandar({ t: 'inv', id }),
  aceptar: de => red.mandar({ t: 'acepta', de }),
  rechazar: de => red.mandar({ t: 'rechaza', de }),
  salirGrupo: () => red.mandar({ t: 'salir' }),
});
const npcCerca = id => { const n = O.NPCS.find(x => x.id === id); return n && Math.hypot(lx - n.x, lz - n.z) < O.DIST_NPC + 1; };
const rolCerca = rol => yo && O.NPCS.find(n => n.rol === rol && Math.hypot(lx - n.x, lz - n.z) < O.DIST_NPC + 1);
const paneles = new Paneles({
  mio: () => mio, mandar: o => red.mandar(o), npcCerca, rolCerca, toast: t => hud.toast(t), cambiarPj: () => red.salirPj(),
  comerciando: () => !!paneles.com, ofrecido: i => !!paneles.com?.mio.items.some(o => o.i === i),
});
const seleccion = new Seleccion(E, {
  jugar: nombre => red.jugar(nombre),
  crear: (nombre, clase) => red.crearPj(nombre, clase),
  salir: () => { try { red.ws?.close(); } catch (e) {} red.cerrado = true; seleccion.ocultar(); document.getElementById('entrada').hidden = false; document.getElementById('btn-entrar').disabled = false; },
});

// ---------- entrada ----------
const form = document.getElementById('form-entrar');
try { document.getElementById('nombre').value = localStorage.getItem('sendas-nombre') || ''; } catch (e) {}
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!listo) return;
  const nombre = document.getElementById('nombre').value.trim(), clave = document.getElementById('clave').value;
  try { localStorage.setItem('sendas-nombre', nombre); } catch (err) {}
  document.getElementById('btn-entrar').disabled = true; errorEntrar('');
  red.login(nombre, clave);
});
function errorEntrar(t) { document.getElementById('error-entrar').textContent = t; if (t) document.getElementById('btn-entrar').disabled = false; }

cargarTodo(k => { document.getElementById('cargando').textContent = `Cargando el mundo… ${Math.round(k * 100)}%`; }).then(() => {
  E.poblar(); ponerNpcs(); listo = true; document.getElementById('cargando').textContent = '';
}).catch(err => { document.getElementById('cargando').textContent = 'No se pudo cargar el mundo. Recargá la página.'; console.error(err); });

// ---------- entidades ----------
function crearEnte(id, tipo, esJugador) {
  const vis = crear(tipo);
  E.scene.add(vis.raiz);
  const e = { id, tipo, esJ: esJugador, vis, buf: [], hp: 100, nivel: 1, nombre: '', st: 0, visto: 0, muerto: false, muertoT: 0, flash: 0,
    radio: esJugador ? 0.45 : R.MONSTRUOS[tipo]?.radio || 0.5, def: esJugador ? null : R.MONSTRUOS[tipo] || { nombre: 'Siervo', radio: 0.5, nivel: 0, aliado: true } };
  if (esJugador) { e.aura = FX.crearAura(); e.aura.position.y = 1; vis.raiz.add(e.aura); e.brillo = 0; }
  entes.set(id, e);
  return e;
}
function quitarEnte(id) { const e = entes.get(id); if (!e) return; E.scene.remove(e.vis.raiz); entes.delete(id); if (objetivo === id) objetivo = null; }

function morir(e) {
  if (e.muerto) return;
  e.muerto = true; e.muertoT = 0;
  if (!e.vis.muneco.hacer('muere', { quedarse: true })) e.vis.muneco.muerto = true;
  if (objetivo === e.id) objetivo = null;
}
function revivir(e) { e.muerto = false; e.muertoT = 0; e.vis.raiz.visible = true; e.vis.cuerpo.position.y = 0; e.vis.muneco.revivir(); if (e.tipo === 'avispon') e.vis.cuerpo.position.y = 1.1; }

// ---------- mensajes del servidor ----------
function alMensaje(m) {
  if (m.t === 'error') { if (seleccion.activa) return seleccion.error(m.msg); if (yo) return hud.toast(m.msg); return errorEntrar(m.msg); }
  if (m.t === 'cuenta') return entrarSeleccion(m);
  if (m.t === 'bienvenida') {
    seleccion.ocultar(); for (const n of npcs) n.vis.raiz.visible = true;
    yoId = m.id; lx = m.x; lz = m.z;
    for (const id of [...entes.keys()]) quitarEnte(id);
    mio = m.datos;
    yo = crearEnte(yoId, mio.clase, true); yo.nombre = mio.nombre;
    document.getElementById('entrada').hidden = true;
    hud.mostrar(mio); hud.ponerHabilidades(mio);
    if (m.nuevo) hud.lore();
    return;
  }
  if (m.t === 'inv') return hud.invitacion(m.de, m.nombre, m.nivel);
  if (m.t === 'compide') return hud.pedidoComercio(m.de, m.nombre);
  if (m.t === 'com') return paneles.comercio(m);
  if (m.t === 's') return foto(m);
}

// Elegir personaje: se limpia el mundo y se muestran los personajes al pie de la Atalaya.
function entrarSeleccion(m) {
  for (const id of [...entes.keys()]) quitarEnte(id);
  for (const d of drops.values()) E.scene.remove(d.obj); drops.clear();
  yo = null; yoId = null; mio = null; estado = null; objetivo = null; destino = null;
  paneles.cerrar(); document.getElementById('hud').hidden = true;
  document.getElementById('entrada').hidden = true;
  for (const n of npcs) n.vis.raiz.visible = false;
  seleccion.mostrar(m.personajes, m.creado);
}

function foto(s) {
  if (!mio) return;
  const ahora = performance.now();
  for (const [id, nombre, x, z, dir, hp, nivel, st, grupo, fl, clase, brillo] of s.j) {
    const muralla = fl & 1, veneno = fl & 2;
    let e = entes.get(id);
    if (e && e.tipo !== clase && VISUAL[clase]) { quitarEnte(id); e = null; }
    if (!e) { e = crearEnte(id, VISUAL[clase] ? clase : 'guardian', true); e.vis.raiz.position.set(x, R.altura(x, z), z); if (id === yoId) yo = e; }
    if (brillo !== e.brillo) { e.brillo = brillo; brillarArma(e); }
    Object.assign(e, { nombre, hp, nivel, st, grupo, muralla, veneno, visto: ahora });
    if (id !== yoId) { e.buf.push({ t: ahora, x, z, dir }); if (e.buf.length > 30) e.buf.shift(); }
    if (st === 4 && !e.muerto) morir(e);
  }
  for (const [id, ti, x, z, dir, hp, st, fl] of s.m) {
    const tipo = R.TIPOS[ti];
    let e = entes.get(id);
    if (!e) { e = crearEnte(id, tipo, false); e.vis.raiz.position.set(x, R.altura(x, z), z); e.vis.raiz.rotation.y = dir; e.nombre = e.def.nombre; e.nivel = e.def.nivel; if (st === 4) { morir(e); e.muertoT = 9; } }
    if (e.muerto && st !== 4) { revivir(e); e.buf = []; e.vis.raiz.position.set(x, R.altura(x, z), z); }
    Object.assign(e, { hp, st, visto: ahora });
    if (fl !== e.flags) {
      e.flags = fl; e.campeon = !!(fl & 1); e.furioso = !!(fl & 2);
      const k = e.campeon ? R.CAMPEON.escala : 1;
      e.vis.cuerpo.scale.setScalar(VISUAL[tipo].escala * k); e.radio = e.def.radio * k;
      e.nombre = (e.campeon ? 'Campeón · ' : '') + e.def.nombre;
    }
    e.buf.push({ t: ahora, x, z, dir }); if (e.buf.length > 30) e.buf.shift();
    if (st === 4 && !e.muerto) morir(e);
  }
  for (const [id, x, z, dir, st, dueno] of s.sv || []) {
    let e = entes.get(id);
    if (!e) { e = crearEnte(id, 'siervo', false); e.vis.raiz.position.set(x, R.altura(x, z), z); e.nombre = 'Siervo'; e.aliado = true; }
    Object.assign(e, { st, visto: ahora, dueno });
    e.buf.push({ t: ahora, x, z, dir }); if (e.buf.length > 30) e.buf.shift();
  }
  for (const [id, e] of entes) if (id !== yoId && ahora - e.visto > 1500) quitarEnte(id);
  if (s.inv) { Object.assign(mio, s.inv); mio.der = s.inv.der; hud.ponerHabilidades(mio); paneles.refrescar(); }
  actualizarDrops(s.d || []);
  for (const ev of s.ev) evento(ev);
  estado = s.yo; mio.nivel = s.yo.nivel; mio.puntos = s.yo.puntos; for (const k of R.STATS) mio[k] = s.yo[k];
  const evt = s.yo.evt; E.ambiente(evt && evt[0][0] !== '-' ? evt[0] : 'normal');
  if (objetivo && s.yo.obj == null && !entes.get(objetivo)) objetivo = null;
}

function pos(e) { return e.vis.raiz.position; }

function evento(ev) {
  const [tipo, a, b, c, d] = ev;
  if (tipo === 'g') {
    const t = entes.get(b), atacante = entes.get(a);
    if (!t) return;
    const p = pos(t), alto = t.vis.alto * 0.6;
    const color = d === 5 ? '#8fd14a' : d === 4 ? '#d23b3b' : d === 1 ? '#ffb347' : d === 2 ? '#7fe0c2' : d === 3 ? '#c7a5ff' : '#e9e1cf';
    numeros.push({ x: p.x + (Math.random() - 0.5) * 0.6, y: p.y + t.vis.alto + 0.2, z: p.z, txt: String(c), color, grande: d === 1 || d === 2, t: 0, mio: a === yoId || b === yoId });
    if (d === 5) FX.chispas(p.x, p.y + alto, p.z, '#6fdc5a', 6);
    else if (t.esJ) FX.sangre(p.x, p.y + alto, p.z, false);
    else if (t.tipo === 'huesudo' || t.tipo === 'centinela') FX.chispas(p.x, p.y + alto, p.z, '#e8dcc0', d ? 16 : 8);
    else FX.sangre(p.x, p.y + alto, p.z, d === 1 || d === 2);
    t.flash = 0.14;
    if (!t.esJ && !t.vis.muneco.unaVez && Math.random() < 0.5) t.vis.muneco.hacer('hit');
    if (b === yoId && d !== 5) { hud.dolor(); temblor = Math.max(temblor, 0.12); }
    if (a === yoId && (d === 1 || d === 2)) temblor = Math.max(temblor, 0.1);
    if (atacante && atacante !== yo && atacante.esJ) atacante.vis.raiz.rotation.y = Math.atan2(p.x - pos(atacante).x, p.z - pos(atacante).z);
  } else if (tipo === 'a') {
    const e = entes.get(a); if (!e) return;
    const p = pos(e), mu = e.vis.muneco;
    if (b === 'atk') {
      const dur = mu.duracion('atk') || 1, cad = e.esJ ? (e === yo ? mio?.der?.cadencia || 0.8 : 0.8) : e.def.cadencia;
      mu.hacer('atk', { vel: Math.max(1, dur / (cad * 0.9)) });
      if (e === yo && c != null) { const t = entes.get(c); if (t) ldir = Math.atan2(pos(t).x - lx, pos(t).z - lz); }
    } else if (b === 'spin') mu.hacer('spin', { vel: 1.4 });
    else if (['tiro2', 'hechizo', 'hechizo2', 'esquiva', 'hachazo', 'festeja'].includes(b)) mu.hacer(b, { vel: 1.3 });
    else if (b === 'muralla') { mu.hacer('muralla'); FX.golpeSuelo(p.x, p.y, p.z, '#7f95b8'); }
    else if (b === 'stab') { mu.hacer('stab', { vel: 1.3 }); FX.polvo(p.x, p.y, p.z); }
    else if (b === 'pot') { mu.hacer('pot', { vel: 1.5 }); FX.chispas(p.x, p.y + 1, p.z, '#c43b3b', 14); }
    else if (b === 'nace') { mu.hacer('nace'); FX.nace(p.x, p.y, p.z); }
    else if (b === 'lanza') { if (!mu.hacer('lanza', { vel: 1.3 })) mu.hacer('atk'); }
    else if (b === 'carga') { mu.hacer('carga'); FX.polvo(p.x, p.y, p.z); }
    else if (b === 'invoca') { mu.hacer('invoca'); FX.invocar(p.x, p.y, p.z); }
    else if (b === 'furia') { FX.furia(p.x, p.y, p.z); if (e.def?.jefe && Math.hypot(lx - p.x, lz - p.z) < 20) temblor = 0.3; }
    else if (b === 'pisoton') { mu.hacer('pisoton'); setTimeout(() => { FX.polvo(p.x, p.y, p.z); if (yo && Math.hypot(lx - p.x, lz - p.z) < 14) temblor = 0.35; }, 550); }
  } else if (tipo === 'p') {
    const o = entes.get(a), t = entes.get(b); if (!o || !t) return;
    const po = pos(o), pt = pos(t);
    FX.proyectil({ x: po.x, y: po.y + o.vis.alto * 0.7, z: po.z }, { x: pt.x, y: pt.y + 1, z: pt.z }, c, d);
  } else if (tipo === 'm') { const e = entes.get(a); if (e) morir(e); }
  else if (tipo === 'n') {
    const e = entes.get(a); if (!e) return;
    const p = pos(e); FX.nivel(p.x, p.y, p.z); e.vis.muneco.hacer('festeja');
    if (a === yoId) hud.toast(`Nivel ${b}. Tenés ${R.PUNTOS_POR_NIVEL} puntos nuevos para repartir.`, 'grande');
  }
  else if (tipo === 'x') hud.exp(a);
  else if (tipo === 'tp') { if (a === yoId) { lx = b; lz = c; enviado = { x: b, z: c }; } else { const e = entes.get(a); if (e) e.buf = [{ t: performance.now(), x: b, z: c, dir: e.vis.raiz.rotation.y }]; } }
  else if (tipo === 'rv') { const e = entes.get(a); if (e) revivir(e); if (a === yoId) { lx = b; lz = c; objetivo = null; destino = null; } }
  else if (tipo === 'aviso') hud.toast(a);
  else if (tipo === 'oro') hud.toast(`+${a} de oro`, 'exp');
  else if (tipo === 'recoge') hud.toast(`Recogiste ${a}`, ['exp', 'excelente', 'legendario', 'mitico'][b] || 'exp');
  else if (tipo === 'forja') { hud.toast(b, a === 'ok' ? 'grande' : 'malo'); const n = O.NPCS.find(x => x.id === 'herrero'); if (a === 'ok') FX.nivel(n.x, 0, n.z); else FX.chispas(n.x, 1.2, n.z, a === 'roto' ? '#ff3b2a' : '#8c7f6a', 30); }
  else if (tipo === 'fx') {
    const y = R.altura(b, c);
    if (a === 'hielo') { FX.golpeSuelo(b, y, c, '#9fd8ff'); FX.chispas(b, y + 0.5, c, '#bfe8ff', 30); }
    else if (a === 'lluvia') FX.golpeSuelo(b, y, c, '#c9b47a');
    else if (a === 'buff') FX.golpeSuelo(b, y, c, '#c9b47a');
    else if (a === 'cura') { FX.golpeSuelo(b, y, c, '#7fe07a'); FX.chispas(b, y + 1, c, '#9fef8a', 16); }
    else if (a === 'tajo') FX.tajo(b, y, c);
  }
  else if (tipo === 'msg') hud.toast(a, 'anuncio');
  else if (tipo === 'bye') quitarEnte(a);
}

// ---------- controles ----------
let stick = null, toque = null;
const teclas = new Set();
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  teclas.add(e.key.toLowerCase());
  if (e.key === ' ') { e.preventDefault(); atacarCercano(); }
  if (['1', '2', '3', '4'].includes(e.key)) { const h = hud.habs[+e.key - 1]; if (h) usarHabilidad(h.id); }
  if (e.key.toLowerCase() === 'q') red.mandar({ t: 'pot' });
  if (e.key.toLowerCase() === 'p') paneles.personaje('atributos');
  if (e.key.toLowerCase() === 'i') paneles.personaje('equipo');
  if (e.key.toLowerCase() === 'k') paneles.personaje('habilidades');
  if (e.key.toLowerCase() === 'e') red.mandar({ t: 'eter' });
});
addEventListener('keyup', e => teclas.delete(e.key.toLowerCase()));
addEventListener('blur', () => teclas.clear());

lienzo.addEventListener('pointerdown', e => {
  if (seleccion.activa) return seleccion.tocar(e.clientX, e.clientY, E.camara);
  if (!yo) return;
  document.getElementById('menu-jug').hidden = true;
  if (e.pointerType !== 'mouse' && !stick && e.clientX < innerWidth * 0.45 && e.clientY > innerHeight * 0.3) {
    stick = { id: e.pointerId, x0: e.clientX, y0: e.clientY, kx: 0, ky: 0 };
    hud.stick(true, e.clientX, e.clientY);
  } else toque = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
});
addEventListener('pointermove', e => {
  if (stick && e.pointerId === stick.id) {
    let kx = (e.clientX - stick.x0) / 55, ky = (e.clientY - stick.y0) / 55; const l = Math.hypot(kx, ky);
    if (l > 1) { kx /= l; ky /= l; }
    stick.kx = kx; stick.ky = ky; hud.stick(true, stick.x0, stick.y0, kx, ky);
  }
});
const soltar = e => {
  if (stick && e.pointerId === stick.id) { stick = null; hud.stick(false); }
  if (toque && e.pointerId === toque.id) {
    if (Math.hypot(e.clientX - toque.x, e.clientY - toque.y) < 16 && performance.now() - toque.t < 500) elegir(e.clientX, e.clientY);
    toque = null;
  }
};
addEventListener('pointerup', soltar); addEventListener('pointercancel', soltar);

const ray = new THREE.Raycaster();
function elegir(sx, sy) {
  let mejor = null, md = 60;
  for (const e of entes.values()) {
    if (e === yo || e.muerto || e.aliado) continue;
    const p = pos(e); v3.set(p.x, p.y + e.vis.alto * 0.5, p.z).project(E.camara);
    if (v3.z > 1) continue;
    const x = (v3.x * 0.5 + 0.5) * innerWidth, y = (-v3.y * 0.5 + 0.5) * innerHeight;
    const d = Math.hypot(x - sx, y - sy) - (e.esJ ? 0 : 8) - (e.def?.jefe ? 30 : 0);
    if (d < md) { md = d; mejor = e; }
  }
  for (const n of O.NPCS) {
    if (Math.hypot(n.x - lx, n.z - lz) > 30) continue;
    v3.set(n.x, R.altura(n.x, n.z) + (n.rol === 'farol' ? 2.5 : 1), n.z).project(E.camara);
    const x = (v3.x * 0.5 + 0.5) * innerWidth, y = (-v3.y * 0.5 + 0.5) * innerHeight;
    if (Math.hypot(x - sx, y - sy) < 46) { if (npcCerca(n.id)) abrirNpc(n.id); else { destino = { x: n.x, z: n.z }; npcPendiente = n.id; soltarObjetivo(); } return; }
  }
  for (const d of drops.values()) {
    const p = d.obj.position; v3.set(p.x, p.y, p.z).project(E.camara);
    const x = (v3.x * 0.5 + 0.5) * innerWidth, y = (-v3.y * 0.5 + 0.5) * innerHeight;
    if (Math.hypot(x - sx, y - sy) < 36) { destino = { x: d.x, z: d.z }; soltarObjetivo(); return; }
  }
  if (mejor && !mejor.esJ) { marcarObjetivo(mejor.id); return; }
  if (mejor && mejor.esJ) { hud.menuJugador(mejor, sx, sy); return; }
  ray.setFromCamera({ x: sx / innerWidth * 2 - 1, y: -(sy / innerHeight) * 2 + 1 }, E.camara);
  const hit = ray.intersectObject(E.terreno)[0];
  if (hit) { destino = { x: hit.point.x, z: hit.point.z }; soltarObjetivo(); FX.golpeSuelo(hit.point.x, hit.point.y, hit.point.z, '#8c7f6a'); }
}
function marcarObjetivo(id) { objetivo = id; destino = null; red.mandar({ t: 'atk', id }); }
function soltarObjetivo() { if (objetivo !== null) { objetivo = null; red.mandar({ t: 'atk', id: null }); } }
function cercano(max) {
  let mejor = null, md = max;
  for (const e of entes.values()) { if (e.esJ || e.muerto || e.aliado) continue; const d = Math.hypot(pos(e).x - lx, pos(e).z - lz); if (d < md) { md = d; mejor = e; } }
  return mejor;
}
function atacarCercano() { const e = cercano(14); if (e) marcarObjetivo(e.id); else hud.toast('No hay monstruos cerca.'); }
function usarHabilidad(id) {
  const h = C.buscarHab(mio.clase, id); if (!h) return;
  if (['golpe', 'proyectil', 'lluvia'].includes(h.tipo)) {
    const t = (objetivo && entes.get(objetivo)) || cercano(14);
    if (!t) return hud.toast('No hay monstruos cerca.');
    marcarObjetivo(t.id); red.mandar({ t: 'hab', h: id, id: t.id });
  } else red.mandar({ t: 'hab', h: id });
}

// ---------- mi movimiento ----------
function moverme(dt) {
  if (!yo || yo.muerto || (estado && estado.muerto > 0)) { yo?.vis.muneco.ponerBase('idle'); return; }
  let ix = 0, iz = 0;
  if (stick && Math.hypot(stick.kx, stick.ky) > 0.18) { ix = stick.kx; iz = stick.ky; }
  if (teclas.has('w') || teclas.has('arrowup')) iz -= 1; if (teclas.has('s') || teclas.has('arrowdown')) iz += 1;
  if (teclas.has('a') || teclas.has('arrowleft')) ix -= 1; if (teclas.has('d') || teclas.has('arrowright')) ix += 1;
  let mx = 0, mz = 0;
  if (ix || iz) { const l = Math.hypot(ix, iz); mx = ix / Math.max(1, l); mz = iz / Math.max(1, l); soltarObjetivo(); destino = null; npcPendiente = null; }
  else if (objetivo) {
    const t = entes.get(objetivo);
    if (!t || t.muerto) objetivo = null;
    else {
      const dx = pos(t).x - lx, dz = pos(t).z - lz, d = Math.hypot(dx, dz);
      if (d > (estado?.alcance || 1.7) + t.radio - 0.15) { mx = dx / d; mz = dz / d; } else ldir = Math.atan2(dx, dz);
    }
  } else if (destino) {
    const dx = destino.x - lx, dz = destino.z - lz, d = Math.hypot(dx, dz);
    if (d < 0.25 || (npcPendiente && npcCerca(npcPendiente))) { destino = null; if (npcPendiente) { abrirNpc(npcPendiente); npcPendiente = null; } } else { mx = dx / d; mz = dz / d; }
  }
  const atacando = !!yo.vis.muneco.unaVez;
  const vel = R.VEL_JUGADOR * (atacando && !(ix || iz) ? 0.3 : 1);
  if (mx || mz) {
    lx = Math.max(-R.MUNDO + 2, Math.min(R.MUNDO - 2, lx + mx * vel * dt));
    lz = Math.max(-R.MUNDO + 2, Math.min(R.MUNDO - 2, lz + mz * vel * dt));
    ldir = Math.atan2(mx, mz);
  }
  yo.vis.muneco.ponerBase(mx || mz ? 'run' : 'idle');
  const ahora = performance.now();
  if (ahora - ultEnvio > 100 && (Math.hypot(lx - enviado.x, lz - enviado.z) > 0.02)) {
    red.mandar({ t: 'pos', x: +lx.toFixed(2), z: +lz.toFixed(2), dir: +ldir.toFixed(2) });
    ultEnvio = ahora; enviado = { x: lx, z: lz };
  }
}

// ---------- dibujar ----------
const angulo = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * k; };
function actualizarEntes(dt) {
  const rt = performance.now() - RETRASO;
  for (const e of entes.values()) {
    const r = e.vis.raiz;
    if (e === yo) { r.position.set(lx, R.altura(lx, lz), lz); r.rotation.y = angulo(r.rotation.y, ldir, Math.min(1, dt * 14)); }
    else if (e.buf.length) {
      let a = e.buf[0], b = a;
      for (let i = e.buf.length - 1; i >= 0; i--) if (e.buf[i].t <= rt) { a = e.buf[i]; b = e.buf[i + 1] || a; break; }
      const k = b.t > a.t ? Math.min(1, (rt - a.t) / (b.t - a.t)) : 1;
      const x = a.x + (b.x - a.x) * k, z = a.z + (b.z - a.z) * k;
      const antes = r.position.clone();
      r.position.set(x, R.altura(x, z), z);
      r.rotation.y = angulo(r.rotation.y, b.dir, Math.min(1, dt * 12));
      const corre = e.st === 1 || Math.hypot(x - antes.x, z - antes.z) > 0.5 * dt;
      e.vis.muneco.ponerBase(corre ? 'run' : 'idle');
    }
    if (e.aura) e.aura.visible = !!e.muralla && !e.muerto;
    if (e.flash > 0) e.flash -= dt;
    const f = Math.max(0, e.flash) / 0.14 + (e.campeon ? 0.22 : 0) + (e.furioso ? 0.25 + Math.sin(performance.now() / 120) * 0.15 : 0);
    if (f > 0 || e.brillaba) { e.brillaba = f > 0; for (const m of e.vis.mats) if (m.emissive && m.name !== 'Glow') m.emissive.setRGB(f * 0.7, f * 0.08, f * 0.05); }
    if (e.muerto && !e.esJ) {
      e.muertoT += dt;
      if (e.muertoT > 2.4) e.vis.cuerpo.position.y = (e.tipo === 'avispon' ? 0 : 0) - (e.muertoT - 2.4) * 0.7;
      if (e.muertoT > 4) r.visible = false;
    }
    e.vis.muneco.update(dt);
  }
}

function dibujarTextos(dt) {
  const d = Math.min(devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
  if (lienzo.width !== Math.round(W * d)) { lienzo.width = Math.round(W * d); lienzo.height = Math.round(H * d); }
  tc.setTransform(d, 0, 0, d, 0, 0); tc.clearRect(0, 0, W, H);
  if (!yo) return;
  tc.textAlign = 'center'; tc.textBaseline = 'middle';
  const proy = (x, y, z) => { v3.set(x, y, z).project(E.camara); return v3.z > 1 ? null : [(v3.x * 0.5 + 0.5) * W, (-v3.y * 0.5 + 0.5) * H]; };
  for (const e of entes.values()) {
    if (!e.vis.raiz.visible || (e.muerto && !e.esJ)) continue;
    const p = pos(e), s = proy(p.x, p.y + e.vis.alto + 0.35, p.z); if (!s) continue;
    if (Math.hypot(p.x - lx, p.z - lz) > 30) continue;
    if (e.esJ) {
      const mismo = estado?.grupo?.some(g => g[0] === e.id);
      tc.font = '600 14px "Spectral SC", Spectral, Georgia, serif';
      tc.lineWidth = 3; tc.strokeStyle = 'rgba(0,0,0,.8)';
      const t = `${e.nombre} · ${e.nivel}`;
      tc.fillStyle = e === yo ? '#efe6d2' : mismo ? '#a8d48f' : '#b9c1c9';
      tc.strokeText(t, s[0], s[1]); tc.fillText(t, s[0], s[1]);
      if (e !== yo) barra(s[0], s[1] + 11, 46, 4, e.hp, mismo ? '#6fae4f' : '#a33');
    } else if (e.id === objetivo || e.hp < 100 || e.def.jefe || e.campeon) {
      barra(s[0], s[1], e.def.jefe ? 90 : 50, e.def.jefe ? 6 : 4, e.hp, '#9c1f1f');
      if (e.id === objetivo || e.def.jefe || e.campeon) {
        tc.font = `600 ${e.def.jefe ? 17 : 14}px "Spectral SC", Spectral, Georgia, serif`; tc.lineWidth = 3; tc.strokeStyle = 'rgba(0,0,0,.85)';
        tc.fillStyle = e.def.jefe ? '#e0543f' : e.campeon ? '#f0a050' : '#d8cfbd';
        tc.strokeText(e.nombre, s[0], s[1] - 13); tc.fillText(e.nombre, s[0], s[1] - 13);
      }
    }
  }
  tc.font = '600 13px Spectral, Georgia, serif'; tc.lineWidth = 3; tc.strokeStyle = 'rgba(0,0,0,.85)';
  for (const d of drops.values()) {
    if (Math.hypot(d.x - lx, d.z - lz) > 16) continue;
    const s = proy(d.x, d.obj.position.y + 0.45, d.z); if (!s) continue;
    tc.fillStyle = d.color; tc.strokeText(d.nombre, s[0], s[1]); tc.fillText(d.nombre, s[0], s[1]);
  }
  for (const n of npcs) {
    const p = n.vis.raiz.position; if (Math.hypot(p.x - lx, p.z - lz) > 25) continue;
    const s = proy(p.x, p.y + 2.25, p.z); if (!s) continue;
    tc.font = '15px "Spectral SC", Spectral, Georgia, serif'; tc.fillStyle = '#e9c37a';
    tc.strokeText(n.def.nombre, s[0], s[1]); tc.fillText(n.def.nombre, s[0], s[1]);
  }
  for (let i = numeros.length - 1; i >= 0; i--) {
    const n = numeros[i]; n.t += dt;
    if (n.t > 1) { numeros.splice(i, 1); continue; }
    const s = proy(n.x, n.y + n.t * 1.3, n.z); if (!s) continue;
    const tam = (n.grande ? 30 : 21) * (n.mio ? 1 : 0.75) * (n.t < 0.12 ? 1 + (0.12 - n.t) * 4 : 1);
    tc.globalAlpha = Math.min(1, (1 - n.t) * 3);
    tc.font = `700 ${tam}px Spectral, Georgia, serif`; tc.lineWidth = 4; tc.strokeStyle = 'rgba(0,0,0,.85)';
    tc.strokeText(n.txt, s[0], s[1]); tc.fillStyle = n.color; tc.fillText(n.txt, s[0], s[1]);
    tc.globalAlpha = 1;
  }
  function barra(x, y, w, h, pct, color) {
    tc.fillStyle = 'rgba(0,0,0,.7)'; tc.fillRect(x - w / 2 - 1, y - 1, w + 2, h + 2);
    tc.fillStyle = color; tc.fillRect(x - w / 2, y, w * pct / 100, h);
  }
}

function datosHud() {
  const o = objetivo && entes.get(objetivo);
  let jefe = null;
  for (const e of entes.values()) if (e.def?.jefe && !e.muerto && Math.hypot(pos(e).x - lx, pos(e).z - lz) < 26) jefe = { nombre: e.def.nombre + (e.furioso ? ' · en furia' : ''), hp: e.hp };
  let lugar = { nombre: R.MAPA.nombre, frase: 'La noche no se termina.' };
  for (const l of R.MAPA.lugares) if (Math.hypot(l.x - lx, l.z - lz) < (l.x || l.z ? 14 : R.PUEBLO.r)) lugar = l;
  const puntos = [];
  for (const e of entes.values()) {
    if (e === yo || (e.muerto && !e.esJ)) continue;
    const p = pos(e);
    puntos.push(e.esJ ? { x: p.x, z: p.z, r: 3, c: estado?.grupo?.some(g => g[0] === e.id) ? '#8fd16e' : '#8fb2d8' } : { x: p.x, z: p.z, r: e.def.jefe ? 5 : e.campeon ? 3 : 1.8, c: e.def.jefe ? '#ff4a2a' : e.campeon ? '#f0a050' : '#a8382c' });
  }
  const puntosHab = mio ? C.puntosArbol(mio) - C.gastados(mio) : 0;
  return { puntosHab, objetivo: o && !o.muerto ? { nombre: o.nombre, nivel: o.def.nivel, hp: o.hp, desc: o.def.desc } : null, jefe, lugar, ping: red.ping, mini: { yo: { x: lx, z: lz }, puntos } };
}

// ---------- NPCs de la Atalaya ----------
function ponerNpcs() {
  for (const def of O.NPCS.filter(n => n.modelo)) {
    const vis = crear(def.modelo.replace('.glb', ''));
    vis.raiz.position.set(def.x, R.altura(def.x, def.z), def.z); vis.raiz.rotation.y = def.giro;
    E.scene.add(vis.raiz); npcs.push({ def, vis, t: Math.random() * 5 });
  }
}
function abrirNpc(id) {
  const def = O.NPCS.find(x => x.id === id); if (!def) return;
  if (def.rol === 'farol') return paneles.viajes();
  if (def.rol === 'baul') { paneles.sel = null; return paneles.baul(); }
  const n = npcs.find(x => x.def.id === id); if (n) n.vis.muneco.hacer('saluda');
  paneles.sel = null; paneles.npc(id);
}

// ---------- brillo del arma (+7 o excelente) ----------
const COLOR_RAREZA = [null, '#4fdf90', '#ffb13a', '#ff2a3a'];
function brillarArma(e) {
  const raArma = (e.brillo >> 3) & 3, raMax = (e.brillo >> 1) & 3, mas7 = e.brillo & 1;
  e.aureola = raMax >= 2 ? COLOR_RAREZA[raMax] : null;
  const color = raArma ? new THREE.Color(COLOR_RAREZA[raArma]) : mas7 ? new THREE.Color('#6f90ff') : new THREE.Color(0, 0, 0);
  const k = raArma ? 0.6 + raArma * 0.25 : 0.7;
  for (const nombre of ['handslotr', 'handslotl']) {
    const mano = e.vis.cuerpo.getObjectByName(nombre); if (!mano) continue;
    mano.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); if (o.material.emissive) { o.material.emissive.copy(color); o.material.emissiveIntensity = k; } } });
  }
}

// ---------- objetos en el piso ----------
const geoMoneda = new THREE.CylinderGeometry(0.16, 0.16, 0.05, 10), geoObjeto = new THREE.OctahedronGeometry(0.2, 0);
const geoRayo = new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6, 1, true);
function actualizarDrops(lista) {
  const vistos = new Set();
  for (const [id, x, z, b, n, exc] of lista) {
    vistos.add(id);
    if (drops.has(id)) continue;
    const g = new THREE.Group(); g.position.set(x, R.altura(x, z) + 0.25, z);
    const esOro = b === 'oro', base = O.BASES[b];
    const color = esOro ? '#e6b84a' : exc ? COLOR_RAREZA[exc] : base?.gema ? '#b48cff' : base?.r ? (n >= 7 ? '#8fb2ff' : '#d8cfbd') : '#d0453a';
    const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.4 });
    mat.userData.outlineParameters = { visible: false };
    if (esOro) for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(geoMoneda, mat); m.position.set((k - 1) * 0.12, k * 0.05 - 0.15, (k % 2) * 0.1); g.add(m); }
    else g.add(new THREE.Mesh(geoObjeto, mat));
    if (exc || (base?.r && n >= 7) || b === 'abismo') {
      const rm = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
      rm.userData.outlineParameters = { visible: false };
      const rayo = new THREE.Mesh(geoRayo, rm); rayo.position.y = 1.2; g.add(rayo);
    }
    E.scene.add(g);
    const nombre = esOro ? `${n} de oro` : O.nombreObjeto({ b, n: base?.r ? n : 0, x: exc ? [0] : null, ra: exc > 1 ? exc : 0 }) + (!base?.r && n > 1 ? ` × ${n}` : '');
    if (exc >= 2) { FX.nivel(x, R.altura(x, z), z); }
    drops.set(id, { id, x, z, obj: g, nombre, color, esOro });
  }
  for (const [id, d] of drops) if (!vistos.has(id)) { E.scene.remove(d.obj); drops.delete(id); }
}

// ---------- bucle ----------
const reloj = new THREE.Clock();
const foco = new THREE.Vector3(), mira = new THREE.Vector3();
let angIntro = 0;
function cuadro() {
  requestAnimationFrame(cuadro);
  const dt = Math.min(0.1, reloj.getDelta());
  if (seleccion.activa) {
    seleccion.update(dt, E.camara); foco.set(0, 0, 0);
  } else if (yo) {
    moverme(dt); actualizarEntes(dt);
    for (const e of entes.values()) if (e.aureola && !e.muerto && Math.random() < dt * 14) { const p = pos(e); FX.chispas(p.x + (Math.random() - 0.5) * 0.8, p.y + 0.3 + Math.random() * 1.4, p.z + (Math.random() - 0.5) * 0.8, e.aureola, 1); }
    foco.lerp(v3.set(lx, R.altura(lx, lz), lz), Math.min(1, dt * 6));
    const vertical = innerWidth < innerHeight;
    E.camara.position.set(foco.x, foco.y + (vertical ? 15 : 12.5), foco.z + (vertical ? 12 : 10.5));
    if (temblor > 0) { temblor -= dt; E.camara.position.x += (Math.random() - 0.5) * temblor; E.camara.position.y += (Math.random() - 0.5) * temblor; }
    mira.set(foco.x, foco.y + 1, foco.z); E.camara.lookAt(mira);
    const o = objetivo && entes.get(objetivo); FX.marcar(o && !o.muerto ? o.vis.raiz : null, o ? o.radio * 1.6 + 0.4 : 1);
    if (estado) hud.actualizar(estado, datosHud());
  } else {
    // Antes de entrar: la cámara gira lento alrededor de la Atalaya.
    angIntro += dt * 0.08; foco.set(0, 0, 0);
    E.camara.position.set(Math.sin(angIntro) * 16, 9, Math.cos(angIntro) * 16); E.camara.lookAt(0, 2, 0);
  }
  for (const n of npcs) n.vis.muneco.update(dt);
  for (const d of drops.values()) { d.obj.rotation.y += dt * 1.5; d.obj.children[0].position.y = d.esOro ? -0.15 : Math.sin(performance.now() / 400 + d.id) * 0.06; }
  E.actualizar(dt, foco); FX.update(dt);
  E.efecto.render(E.scene, E.camara);
  dibujarTextos(dt);
}
cuadro();
if (['localhost', '127.0.0.1'].includes(location.hostname)) window.__sendas = { E, entes, FX };
