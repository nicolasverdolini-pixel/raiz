// Sendas del Éter: une el mundo 3D, la conexión, los controles y la pantalla.
import * as THREE from 'three';
import * as R from './reglas.js';
import { cargarTodo, crear, VISUAL } from './modelos.js';
import { crearAlas, animarAlas } from './alas.js';
import { vestir } from './vestir.js';
import { Mapa } from './mapa.js';
import { foto as fotoObjeto } from './miniaturas.js';
import { crearEscena } from './escena.js';
import { crearEfectos } from './efectos.js';
import { Red } from './red.js';
import { Hud } from './hud.js';
import * as O from './objetos.js';
import * as C from './clases.js';
import { Paneles } from './paneles.js';
import { Seleccion } from './seleccion.js';
import * as MI from './misiones.js';
import { Chat, soloEmoji } from './chat.js';
import * as SND from './sonido.js';

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
  lideroHerm: () => paneles.herm?.lider === mio?.nombre,
  invitarHerm: id => red.mandar({ t: 'herm', a: 'inv', id }),
  verPuesto: id => red.mandar({ t: 'puesto', a: 'ver', id }),
  aceptarHerm: h => red.mandar({ t: 'herm', a: 'acepta', h }),
  mapa: () => (mapa.abierto() ? mapa.cerrar() : mapa.abrir()),
  dejarBastion: () => { if (confirm('¿Dejar el Bastión? Volvés a la Atalaya del Farol.')) red.mandar({ t: 'bastion', a: 'salir' }); },
});
const npcCerca = id => { const n = O.NPCS.find(x => x.id === id) || MI.NPC_MISION.find(x => x.id === id); return n && Math.hypot(lx - n.x, lz - n.z) < O.DIST_NPC + 1; };
const rolCerca = rol => yo && O.NPCS.find(n => n.rol === rol && Math.hypot(lx - n.x, lz - n.z) < O.DIST_NPC + 1);
const paneles = new Paneles({
  mio: () => mio, mandar: o => red.mandar(o), npcCerca, rolCerca, senor: () => estado?.senor, enAtalaya: () => R.enAtalaya(lx, lz) >= 0, toast: t => hud.toast(t), cambiarPj: () => red.salirPj(),
  comerciando: () => !!paneles.com, ofrecido: i => !!paneles.com?.mio.items.some(o => o.i === i),
});
const chat = new Chat(o => red.mandar(o));
const mapa = new Mapa(() => mio && {
  yo: { x: lx, z: lz, dir: ldir }, nivel: mio.nivel, atalayas: mio.atalayas || [0], lugares: mio.lugares || [],
  sendas: O.NPCS.filter(n => n.rol === 'senda'),
  misiones: marcasMision,
  npcs: MI.NPC_MISION.map(n => ({ x: n.x, z: n.z, nombre: n.nombre, est: MI.estadoNpc(mio, n.id) })),
  grupo: (estado?.grupo || []).map(g => entes.get(g[0])).filter(e => e && e !== yo).map(e => ({ x: pos(e).x, z: pos(e).z })),
});
const seleccion = new Seleccion(E, {
  jugar: nombre => red.jugar(nombre),
  crear: (nombre, clase) => red.crearPj(nombre, clase),
  salir: () => { try { red.ws?.close(); } catch (e) {} red.cerrado = true; seleccion.ocultar(); document.getElementById('entrada').hidden = false; document.getElementById('btn-entrar').disabled = false; },
});

// El sonido arranca con el primer toque (lo pide el navegador).
addEventListener('pointerdown', () => SND.despertar(), { capture: true });
addEventListener('keydown', () => SND.despertar(), { capture: true });
let ultimaPelea = -99;
const sonar = (p, f) => { if (!yo || !p) return; const dx = p.x - lx, dz = p.z - lz; f(Math.hypot(dx, dz), Math.max(-1, Math.min(1, dx / 14))); };
const HUESO = new Set(['huesudo', 'centinela', 'anima', 'degollador', 'archimago', 'siervo']);

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
function quitarEnte(id) { const e = entes.get(id); if (!e) return; E.scene.remove(e.vis.raiz); if (e.pet) E.scene.remove(e.pet.raiz); entes.delete(id); if (objetivo === id) objetivo = null; }

// ---------- mascotas y monturas ----------
// La mascota es un muñeco aparte que sigue al jugador; la montura va dentro del jugador y el jinete se sienta arriba.
function ponerMascota(e, b) {
  if (e.pet) { E.scene.remove(e.pet.raiz); e.pet = null; }
  e.mascotaB = b || null;
  if (!b || !VISUAL['pet_' + b]) return;
  e.pet = crear('pet_' + b); e.pet.vuela = VISUAL['pet_' + b].vuela || 0;
  const p = e.vis.raiz.position; e.pet.raiz.position.set(p.x - 1, p.y, p.z - 1);
  E.scene.add(e.pet.raiz);
}
function ponerMontura(e, b) {
  if (e.mon) { e.vis.raiz.remove(e.mon.raiz); e.vis.alto -= e.mon.silla; e.mon = null; }
  e.monturaB = b || null; e.vis.cuerpo.position.y = 0;
  if (!b || !VISUAL['mon_' + b]) return;
  const v = VISUAL['mon_' + b];
  e.mon = crear('mon_' + b); e.mon.silla = v.tam * v.silla;
  e.vis.raiz.add(e.mon.raiz); e.vis.alto += e.mon.silla;
  if (!e.piernas) {
    const h = n => { let r = null; e.vis.cuerpo.traverse(o => { if (!r && o.isBone && o.name.toLowerCase() === n) r = o; }); return r; };
    e.piernas = [h('upperlegl'), h('upperlegr'), h('lowerlegl'), h('lowerlegr')];   // el cargador les saca los puntos
  }
}
// Alas: cuelgan del cuerpo (que ya viene escalado), así suben con la montura y caen con el personaje.
function ponerAlas(e, n) {
  if (e.alas) { e.alas.parent?.remove(e.alas); e.alas = null; }
  e.alasN = n; if (!n) return;
  const v = VISUAL[e.tipo], k = 1 / e.vis.cuerpo.scale.x;
  e.alas = crearAlas(n); if (!e.alas) return;
  e.alas.scale.setScalar(k); e.alas.position.set(0, v.tam * 0.55 * k, -0.2 * k);
  e.vis.cuerpo.add(e.alas);
}
// Después de animar: jinete sentado (piernas dobladas y abiertas) y la bestia corre o espera.
function animarBestias(e, dt, corre) {
  if (e.mon) {
    const montado = !e.muerto;
    e.mon.raiz.visible = montado;
    e.vis.cuerpo.position.y = montado ? e.mon.silla : 0;
    e.mon.muneco.ponerBase(corre ? 'run' : 'idle'); e.mon.muneco.update(dt);
    if (montado && e.piernas) {
      const [ul, ur, ll, lr] = e.piernas;
      if (ul) ul.rotation.set(-1.35, 0, -0.55 - 0.25); if (ur) ur.rotation.set(-1.35, 0, 0.55 + 0.25);
      if (ll) ll.rotation.set(1.45, 0, 0); if (lr) lr.rotation.set(1.45, 0, 0);
    }
  }
  if (e.pet) {
    const r = e.vis.raiz, pr = e.pet.raiz, a = r.rotation.y;
    const tx = r.position.x - Math.sin(a) * 1.3 + Math.cos(a) * 0.9, tz = r.position.z - Math.cos(a) * 1.3 - Math.sin(a) * 0.9;
    const dx = tx - pr.position.x, dz = tz - pr.position.z, d = Math.hypot(dx, dz);
    if (d > 25) pr.position.set(tx, 0, tz);
    else if (d > 0.15) { const k = Math.min(1, dt * (d > 3 ? 6 : 3)); pr.position.x += dx * k; pr.position.z += dz * k; pr.rotation.y = angulo(pr.rotation.y, Math.atan2(dx, dz), Math.min(1, dt * 8)); }
    else pr.rotation.y = angulo(pr.rotation.y, a, Math.min(1, dt * 3));
    pr.position.y = R.altura(pr.position.x, pr.position.z);
    if (e.pet.vuela) e.pet.cuerpo.position.y = e.pet.vuela + Math.sin(performance.now() / 400 + e.id) * 0.15;
    pr.visible = e.vis.raiz.visible;
    e.pet.muneco.ponerBase(d > 0.6 ? 'run' : 'idle'); e.pet.muneco.update(dt);
  }
}

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
    hud.mostrar(mio); hud.ponerHabilidades(mio); actualizarSeguimiento();
    if (m.nuevo) hud.lore(() => hud.tutorial(mio.clase));
    return;
  }
  if (m.t === 'inv') return hud.invitacion(m.de, m.nombre, m.nivel);
  if (m.t === 'diaria') return hud.diaria(m);
  if (m.t === 'mipuesto') return paneles.mipuesto(m);
  if (m.t === 'puesto') return paneles.puestoAjeno(m);
  if (m.t === 'invherm') return hud.invitacionHerm(m.de, m.h);
  if (m.t === 'herm') return paneles.hermandad(m.h, m.online);
  if (m.t === 'compide') return hud.pedidoComercio(m.de, m.nombre);
  if (m.t === 'com') return paneles.comercio(m);
  if (m.t === 'ranking') return paneles.ranking(m.lista);
  if (m.t === 'chat') {
    chat.recibir(m); SND.sfx.chat();
    const e = entes.get(m.de);
    if (e) e.globo = { txt: m.txt, emoji: soloEmoji(m.txt), t: soloEmoji(m.txt) ? 4 : 6 };
    return;
  }
  if (m.t === 's') return foto(m);
}

// Elegir personaje: se limpia el mundo y se muestran los personajes al pie de la Atalaya.
function entrarSeleccion(m) {
  for (const id of [...entes.keys()]) quitarEnte(id);
  for (const d of drops.values()) E.scene.remove(d.obj); drops.clear();
  yo = null; yoId = null; mio = null; estado = null; objetivo = null; destino = null;
  paneles.cerrar(); paneles.herm = null; document.getElementById('hud').hidden = true;
  document.getElementById('entrada').hidden = true;
  for (const n of npcs) n.vis.raiz.visible = false;
  seleccion.mostrar(m.personajes, m.creado);
}

function foto(s) {
  if (!mio) return;
  const ahora = performance.now();
  for (const [id, nombre, x, z, dir, hp, nivel, st, grupo, fl, clase, brillo, herm, mascota, montura, alas, vista, puesto] of s.j) {
    const muralla = fl & 1, veneno = fl & 2;
    let e = entes.get(id);
    if (e && e.tipo !== clase && VISUAL[clase]) { quitarEnte(id); e = null; }
    if (!e) { e = crearEnte(id, VISUAL[clase] ? clase : 'guardian', true); e.vis.raiz.position.set(x, R.altura(x, z), z); if (id === yoId) yo = e; }
    if (brillo !== e.brillo) { e.brillo = brillo; brillarArma(e); }
    Object.assign(e, { nombre, hp, nivel, st, grupo, muralla, veneno, herm: herm || null, puesto: puesto || null, visto: ahora });
    if ((mascota || null) !== (e.mascotaB || null)) ponerMascota(e, mascota);
    if ((montura || null) !== (e.monturaB || null)) ponerMontura(e, montura);
    if ((alas || 0) !== (e.alasN || 0)) ponerAlas(e, alas || 0);
    if (vista && vista !== e.vista) { e.vista = vista; const [casco, armadura, guantes, botas, arma, escudo] = vista.split(',').map(Number); e.vis.alCambiarArma = () => brillarArma(e); vestir(e.vis, e.tipo, { casco, armadura, guantes, botas, arma, escudo }); }
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
  // Atributos primero, para que la ventana que se redibuja abajo ya tenga los valores nuevos.
  const claveAtr = [s.yo.nivel, s.yo.puntos, ...R.STATS.map(k => s.yo[k])].join();
  estado = s.yo; mio.nivel = s.yo.nivel; mio.puntos = s.yo.puntos; for (const k of R.STATS) if (s.yo[k] != null) mio[k] = s.yo[k];
  if (claveAtr !== ultimaClaveAtr) { ultimaClaveAtr = claveAtr; if (paneles.abierto?.f === 'personaje' && !s.inv) paneles.refrescar(); }
  if (s.mis) { mio.misiones = s.mis; actualizarSeguimiento(); if (['misionNpc', 'tablon'].includes(paneles.abierto?.f) || paneles.abierto?.args[0] === 'misiones') paneles.refrescar(); }
  if (s.inv) { Object.assign(mio, s.inv); mio.der = s.inv.der; hud.ponerHabilidades(mio); paneles.refrescar(); }
  actualizarDrops(s.d || []);
  if (s.sa) santuariosListos = s.sa;
  for (const ev of s.ev) evento(ev);
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
    const [, , , , , el, debil] = ev, E = el && R.ELEMENTOS[el];
    const color = d === 5 ? '#8fd14a' : d === 4 ? '#d23b3b' : E ? E.color : d === 1 ? '#ffb347' : d === 2 ? '#7fe0c2' : d === 3 ? '#c7a5ff' : '#e9e1cf';
    numeros.push({ x: p.x + (Math.random() - 0.5) * 0.6, y: p.y + t.vis.alto + 0.2, z: p.z, txt: String(c) + (debil === 1 ? ' ¡débil!' : debil === -1 ? ' resiste' : ''), color, grande: d === 1 || d === 2 || debil === 1, t: 0, mio: a === yoId || b === yoId });
    if (E && debil === 1) FX.chispas(p.x, p.y + alto, p.z, E.color, 14);
    if (d === 5) FX.chispas(p.x, p.y + alto, p.z, '#6fdc5a', 6);
    else if (t.esJ) FX.sangre(p.x, p.y + alto, p.z, false);
    else if (t.tipo === 'huesudo' || t.tipo === 'centinela') FX.chispas(p.x, p.y + alto, p.z, '#e8dcc0', d ? 16 : 8);
    else FX.sangre(p.x, p.y + alto, p.z, d === 1 || d === 2);
    t.flash = 0.14;
    if (a === yoId || b === yoId) ultimaPelea = performance.now();
    if (b === yoId && d !== 5) SND.sfx.dolor();
    else if (d !== 5) sonar(p, (dd, pan) => SND.sfx.golpe(HUESO.has(t.tipo) ? 'hueso' : 'carne', d === 1 || d === 2 || (t.def?.jefe), dd, pan));
    if (!t.esJ && !t.vis.muneco.unaVez && Math.random() < 0.5) t.vis.muneco.hacer('hit');
    if (b === yoId && d !== 5) { hud.dolor(); temblor = Math.max(temblor, 0.12); }
    if (a === yoId && (d === 1 || d === 2)) temblor = Math.max(temblor, 0.1);
    if (atacante && atacante !== yo && atacante.esJ) atacante.vis.raiz.rotation.y = Math.atan2(p.x - pos(atacante).x, p.z - pos(atacante).z);
  } else if (tipo === 'a') {
    const e = entes.get(a); if (!e) return;
    const p = pos(e), mu = e.vis.muneco;
    sonar(p, (dd, pan) => {
      if (['spin', 'hachazo', 'apunala'].includes(b)) SND.sfx.hechizo('area', dd, pan);
      else if (['lanza', 'tiro2', 'hechizo', 'tira'].includes(b)) SND.sfx.hechizo('proyectil', dd, pan);
      else if (b === 'hechizo2') SND.sfx.hechizo('lluvia', dd, pan);
      else if (b === 'invoca') SND.sfx.hechizo('invocar', dd, pan);
      else if (b === 'pisoton') setTimeout(() => SND.sfx.hechizo('pisoton', dd, pan), 500);
      else if (b === 'carga' || b === 'furia') SND.sfx.rugido(dd, pan);
      else if (b === 'atk' && e.esJ && !C.CLASES[e.tipo]?.proyectil) SND.sfx.tajo(dd, pan);
      else if (b === 'pot' && e === yo) SND.sfx.pocion();
      else if (b === 'muralla' || b === 'esquiva' || b === 'festeja') SND.sfx.hechizo('buff', dd, pan);
    });
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
    if (!o.esJ) sonar(pos(o), (dd, pan) => SND.sfx.hechizo('rayo', dd, pan));
    const po = pos(o), pt = pos(t);
    FX.proyectil({ x: po.x, y: po.y + o.vis.alto * 0.7, z: po.z }, { x: pt.x, y: pt.y + 1, z: pt.z }, c, d);
  } else if (tipo === 'm') {
    const e = entes.get(a); if (!e) return;
    if (e === yo) SND.sfx.morir(); else if (!e.esJ && !e.aliado) sonar(pos(e), (dd, pan) => SND.sfx.muerteMonstruo(!!e.def?.jefe || e.campeon, dd, pan));
    morir(e);
  }
  else if (tipo === 'n') {
    const e = entes.get(a); if (!e) return;
    const p = pos(e); FX.nivel(p.x, p.y, p.z); e.vis.muneco.hacer('festeja');
    if (a === yoId) SND.sfx.nivel();
    if (a === yoId) hud.toast(`Nivel ${b}. Tenés ${R.PUNTOS_POR_NIVEL} puntos nuevos para repartir.`, 'grande');
  }
  else if (tipo === 'x') hud.exp(a);
  else if (tipo === 'tp') { if (a === yoId) { lx = b; lz = c; enviado = { x: b, z: c }; } else { const e = entes.get(a); if (e) e.buf = [{ t: performance.now(), x: b, z: c, dir: e.vis.raiz.rotation.y }]; } }
  else if (tipo === 'rv') { const e = entes.get(a); if (e) revivir(e); if (a === yoId) { lx = b; lz = c; objetivo = null; destino = null; } }
  else if (tipo === 'aviso') hud.toast(a);
  else if (tipo === 'mision') { SND.sfx.nivel(); hud.toast(`${a}. «${b}»`, 'grande'); if (yo) { const p = pos(yo); FX.nivel(p.x, p.y, p.z); } }
  else if (tipo === 'oro') { hud.ganancia(0, a); SND.sfx.oro(); }
  else if (tipo === 'recoge') { SND.sfx.recoger(b); hud.botin(a, b); if (b >= 1) hud.toast(`Recogiste ${a}`, ['', 'excelente', 'legendario', 'mitico'][b]); }
  else if (tipo === 'alas') { SND.sfx.forja(a === 'ok'); hud.toast(b, a === 'ok' ? 'grande' : 'malo'); if (a === 'ok') SND.sfx.nivel(); }
  else if (tipo === 'junta') { FX.chispas(b, R.altura(b, c) + 0.4, c, '#f0c040', 8); }
  else if (tipo === 'forja') { SND.sfx.forja(a === 'ok'); hud.toast(b, a === 'ok' ? 'grande' : 'malo'); const n = rolCerca('herrero') || { x: lx, z: lz }; if (a === 'ok') FX.nivel(n.x, 0, n.z); else FX.chispas(n.x, 1.2, n.z, a === 'roto' ? '#ff3b2a' : '#8c7f6a', 30); }
  else if (tipo === 'fx') {
    const y = R.altura(b, c);
    if (a === 'santuario') { const S = R.SANTUARIOS[R.CAMPAMENTOS[d]?.santuario]; FX.nivel(b, y, c); FX.chispas(b, y + 2.5, c, S?.color || '#fff', 30); SND.sfx.nivel(); }
    if (a === 'alas') { FX.nivel(b, y, c); FX.chispas(b, y + 1.6, c, ['#bbb2a8', '#ff3020', '#ffb030'][d - 1] || '#fff', 50); }
    if (a === 'hielo') { FX.golpeSuelo(b, y, c, '#9fd8ff'); FX.chispas(b, y + 0.5, c, '#bfe8ff', 30); }
    else if (a === 'lluvia') FX.golpeSuelo(b, y, c, '#c9b47a');
    else if (a === 'buff') FX.golpeSuelo(b, y, c, '#c9b47a');
    else if (a === 'cura') { if (Math.hypot(b - lx, c - lz) < 20) SND.sfx.hechizo('cura'); FX.golpeSuelo(b, y, c, '#7fe07a'); FX.chispas(b, y + 1, c, '#9fef8a', 16); }
    else if (a === 'tajo') FX.tajo(b, y, c);
  }
  else if (tipo === 'msg') { if (b) { hud.toast(a, 'anuncio'); SND.sfx.anuncio(); } chat.recibir({ txt: a, sistema: true }); }
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
  if (e.key.toLowerCase() === 'm') { if (mapa.abierto()) mapa.cerrar(); else mapa.abrir(); }
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
// Qué dice el globito de cada cosa y a qué altura sale.
const GLOBO = { mercader: '🧪 Pociones', herrero: '⚒ Armas y forja', vidente: '🔮 Eventos y más', domadora: '🐺 Bestias', baul: '📦 Baúl', tablon: '📜 Encargos', farol: '🔥 Viajar', senda: '🌀 Cruzar' };
const ALTO_GLOBO = { baul: 1.6, tablon: 2.5, farol: 4.6, senda: 3.4 };
let globos = [];
function elegir(sx, sy) {
  const g = globos.find(b => sx >= b.x - 6 && sx <= b.x + b.w + 6 && sy >= b.y - 6 && sy <= b.y + b.h + 6);
  if (g) { if (npcCerca(g.id)) abrirNpc(g.id); else { destino = { x: g.def.x, z: g.def.z }; npcPendiente = g.id; soltarObjetivo(); } return; }
  let mejor = null, md = 60;
  for (const e of entes.values()) {
    if (e === yo || e.muerto || e.aliado) continue;
    const p = pos(e); v3.set(p.x, p.y + e.vis.alto * 0.5, p.z).project(E.camara);
    if (v3.z > 1) continue;
    const x = (v3.x * 0.5 + 0.5) * innerWidth, y = (-v3.y * 0.5 + 0.5) * innerHeight;
    const d = Math.hypot(x - sx, y - sy) - (e.esJ ? 0 : 8) - (e.def?.jefe ? 30 : 0);
    if (d < md) { md = d; mejor = e; }
  }
  for (const n of [...O.NPCS, ...MI.NPC_MISION]) {
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
  if (mejor && mejor.esJ && enemigo(mejor)) { marcarObjetivo(mejor.id); return; }
  if (mejor && mejor.esJ) { hud.menuJugador(mejor, sx, sy); return; }
  ray.setFromCamera({ x: sx / innerWidth * 2 - 1, y: -(sy / innerHeight) * 2 + 1 }, E.camara);
  const hit = ray.intersectObjects(E.terrenos)[0];
  if (hit) { destino = { x: hit.point.x, z: hit.point.z }; soltarObjetivo(); FX.golpeSuelo(hit.point.x, hit.point.y, hit.point.z, '#8c7f6a'); }
}
function marcarObjetivo(id) { objetivo = id; destino = null; red.mandar({ t: 'atk', id }); }
function soltarObjetivo() { if (objetivo !== null) { objetivo = null; red.mandar({ t: 'atk', id: null }); } }
// En el Bastión, durante el asedio, los de otra hermandad son enemigos.
function enemigo(e) {
  if (!e?.esJ || e === yo || e.muerto || !estado?.asedio || !e.herm) return false;
  const p = pos(e); return R.enBastion(p.x, p.z) && e.herm[0] !== paneles.herm?.nombre;
}
function cercano(max) {
  let mejor = null, md = max;
  for (const e of entes.values()) { if ((e.esJ && !enemigo(e)) || e.muerto || e.aliado) continue; const d = Math.hypot(pos(e).x - lx, pos(e).z - lz); if (d < md) { md = d; mejor = e; } }
  return mejor;
}
function atacarCercano() { const e = cercano(14); if (e) marcarObjetivo(e.id); else hud.toast(estado?.asedio ? 'No hay enemigos cerca.' : 'No hay monstruos cerca.'); }
function usarHabilidad(id) {
  const h = C.buscarHab(mio.clase, id); if (!h) return;
  if (['golpe', 'proyectil', 'lluvia'].includes(h.tipo)) {
    const t = (objetivo && entes.get(objetivo)) || cercano(14);
    if (!t) return hud.toast('No hay monstruos cerca.');
    marcarObjetivo(t.id); red.mandar({ t: 'hab', h: id, id: t.id });
  } else red.mandar({ t: 'hab', h: id });
}

let santuariosListos = null, ultimaClaveAtr = '';
// ---------- mi movimiento ----------
let yoCorre = false;
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
  const vel = R.VEL_JUGADOR * (1 + (mio.der?.velMov || 0) / 100) * (atacando && !(ix || iz) ? 0.3 : 1);
  if (mx || mz) {
    lx += mx * vel * dt; lz += mz * vel * dt;
    if (R.enBastion(lx, lz)) { const dx = lx - R.BASTION.x, dz = lz - R.BASTION.z, d = Math.hypot(dx, dz); if (d > R.BASTION.r) { lx = R.BASTION.x + dx / d * R.BASTION.r; lz = R.BASTION.z + dz / d * R.BASTION.r; } }
    else if (R.enPozo(lx, lz)) { const dx = lx - R.POZO.x, dz = lz - R.POZO.z, d = Math.hypot(dx, dz); if (d > R.POZO.r) { lx = R.POZO.x + dx / d * R.POZO.r; lz = R.POZO.z + dz / d * R.POZO.r; } }
    else if (R.islaDe(lx, lz)) { const I = R.islaDe(lx, lz), dx = lx - I.x, dz = lz - I.z, d = Math.hypot(dx, dz); if (d > I.r) { lx = I.x + dx / d * I.r; lz = I.z + dz / d * I.r; } }
    else { lx = Math.max(-R.MUNDO + 2, Math.min(R.MUNDO - 2, lx)); lz = Math.max(-R.MUNDO + 2, Math.min(R.MUNDO - 2, lz)); }
    ldir = Math.atan2(mx, mz);
  }
  yo.vis.muneco.ponerBase((mx || mz) && !yo.mon ? 'run' : 'idle'); yoCorre = !!(mx || mz);
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
      e.vis.muneco.ponerBase(corre && !e.mon ? 'run' : 'idle'); e.corre = corre;
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
    if (e.esJ && (e.mon || e.pet)) animarBestias(e, dt, e === yo ? yoCorre : e.corre);
    if (e.alas) animarAlas(e.alas, dt, e === yo ? yoCorre : e.corre);
  }
}

function dibujarTextos(dt) {
  const d = Math.min(devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
  // Ancho y alto: en el celu el alto cambia solo (la barra del navegador aparece y desaparece) y si no se acomoda,
  // los nombres quedan corridos respecto de los personajes.
  if (lienzo.width !== Math.round(W * d) || lienzo.height !== Math.round(H * d)) { lienzo.width = Math.round(W * d); lienzo.height = Math.round(H * d); }
  tc.setTransform(d, 0, 0, d, 0, 0); tc.globalAlpha = 1; tc.clearRect(0, 0, W, H);
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
      tc.fillStyle = e === yo ? '#efe6d2' : enemigo(e) ? '#ff5a4a' : mismo ? '#a8d48f' : '#b9c1c9';
      tc.strokeText(t, s[0], s[1]); tc.fillText(t, s[0], s[1]);
      if (e.puesto) {
        tc.font = '600 13px "Spectral SC", Spectral, Georgia, serif'; const w = tc.measureText(e.puesto).width + 16, y0 = s[1] - (e.herm ? 46 : 32);
        tc.fillStyle = 'rgba(42,26,14,.92)'; tc.fillRect(s[0] - w / 2, y0 - 10, w, 20); tc.strokeStyle = '#c9a24a'; tc.lineWidth = 1.5; tc.strokeRect(s[0] - w / 2, y0 - 10, w, 20);
        tc.fillStyle = '#f0d9a0'; tc.fillText(e.puesto, s[0], y0 + 1); tc.font = '600 14px "Spectral SC", Spectral, Georgia, serif'; tc.lineWidth = 3; tc.strokeStyle = 'rgba(0,0,0,.8)';
      }
      if (e.herm) {
        const [hn, hs, hc, senor] = e.herm, ht = `${senor ? '♛\uFE0E ' : ''}${hs}\uFE0E ${hn}`;
        tc.font = 'italic 600 10.5px Spectral, Georgia, serif'; tc.fillStyle = hc;
        tc.lineWidth = 2.5; tc.strokeText(ht, s[0], s[1] - 13); tc.fillText(ht, s[0], s[1] - 13); tc.lineWidth = 3;
      }
      if (e !== yo) barra(s[0], s[1] + 11, 46, 4, e.hp, mismo ? '#6fae4f' : '#a33');
      if (e.id === objetivo) { tc.strokeStyle = '#ff5a4a'; tc.lineWidth = 2; tc.strokeRect(s[0] - 26, s[1] + 7, 52, 12); }
    } else if (e.id === objetivo || e.hp < 100 || e.def.jefe || e.campeon) {
      barra(s[0], s[1], e.def.jefe ? 90 : 50, e.def.jefe ? 6 : 4, e.hp, '#9c1f1f');
      if (e.id === objetivo || e.def.jefe || e.campeon) {
        tc.font = `600 ${e.def.jefe ? 17 : 14}px "Spectral SC", Spectral, Georgia, serif`; tc.lineWidth = 3; tc.strokeStyle = 'rgba(0,0,0,.85)';
        tc.fillStyle = e.def.jefe ? '#e0543f' : e.campeon ? '#f0a050' : '#d8cfbd';
        tc.strokeText(e.nombre, s[0], s[1] - 13); tc.fillText(e.nombre, s[0], s[1] - 13);
      }
    }
  }
  for (const e of entes.values()) {
    if (!e.globo) continue;
    e.globo.t -= dt; if (e.globo.t <= 0) { e.globo = null; continue; }
    const p = pos(e), s = proy(p.x, p.y + e.vis.alto + 0.9, p.z); if (!s) continue;
    if (e.herm) s[1] -= 14;
    tc.globalAlpha = Math.min(1, e.globo.t * 2);
    if (e.globo.emoji) {
      tc.font = '40px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
      tc.fillText(e.globo.txt, s[0], s[1] - 18 - Math.sin(Math.min(1, (4 - e.globo.t) * 3) * Math.PI) * 10);
    } else {
      tc.font = '14px Spectral, Georgia, serif';
      const palabras = e.globo.txt.split(' '), lineas = []; let l = '';
      for (const w of palabras) { const t = l ? l + ' ' + w : w; if (tc.measureText(t).width > 190 && l) { lineas.push(l); l = w; } else l = t; } lineas.push(l);
      const lin = lineas.slice(0, 3), ancho = Math.max(...lin.map(x => tc.measureText(x).width)) + 18, alto = lin.length * 17 + 10;
      const x0 = s[0] - ancho / 2, y0 = s[1] - alto - 14;
      tc.fillStyle = 'rgba(10,9,11,.88)'; tc.strokeStyle = 'rgba(216,207,189,.35)'; tc.lineWidth = 1;
      tc.beginPath(); tc.roundRect ? tc.roundRect(x0, y0, ancho, alto, 6) : tc.rect(x0, y0, ancho, alto); tc.fill(); tc.stroke();
      tc.beginPath(); tc.moveTo(s[0] - 6, y0 + alto); tc.lineTo(s[0], y0 + alto + 7); tc.lineTo(s[0] + 6, y0 + alto); tc.fill();
      tc.fillStyle = '#e9e1cf'; lin.forEach((x, i) => tc.fillText(x, s[0], y0 + 14 + i * 17));
    }
    tc.globalAlpha = 1;
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
    const deMision = MI.NPC_MISION.includes(n.def);
    tc.font = '600 15px "Spectral SC", Spectral, Georgia, serif'; tc.fillStyle = deMision ? '#c9c0ae' : '#e9c37a';
    tc.strokeText(n.def.nombre, s[0], s[1]); tc.fillText(n.def.nombre, s[0], s[1]);
    const est = deMision && mio ? MI.estadoNpc(mio, n.def.id) : null;
    if (est === 'nueva' || est === 'lista') {
      tc.font = '700 30px "Spectral SC", Spectral, Georgia, serif'; tc.lineWidth = 5; tc.fillStyle = est === 'lista' ? '#7fe07a' : '#f0c040';
      const y = s[1] - 26 + Math.sin(performance.now() / 300) * 3;
      tc.strokeText(est === 'lista' ? '?' : '!', s[0], y); tc.fillText(est === 'lista' ? '?' : '!', s[0], y); tc.lineWidth = 3;
    }
  }
  // Globitos: cuando estás cerca, cada NPC, tablón, farol, baúl y portal muestra qué hace. Se pueden tocar.
  globos = [];
  if (yo) for (const def of [...O.NPCS, ...MI.NPC_MISION]) {
    const d = Math.hypot(def.x - lx, def.z - lz); if (d > 13) continue;
    let txt = GLOBO[def.rol], color = '#e9c37a';
    if (!def.rol) { const est = mio ? MI.estadoNpc(mio, def.id) : null; txt = est === 'nueva' ? '! Tiene una misión' : est === 'lista' ? '✓ Entregar misión' : est === 'curso' ? '… Misión en curso' : '💬 Hablar'; color = est === 'lista' ? '#7fe07a' : est === 'nueva' ? '#f0c040' : '#d8cfbd'; }
    if (!txt) continue;
    const alto = ALTO_GLOBO[def.rol] ?? 2.75, s = proy(def.x, R.altura(def.x, def.z) + alto, def.z); if (!s) continue;
    const y = s[1] - (def.modelo || !def.rol ? 30 : 0) + Math.sin(performance.now() / 400 + def.x) * 2;
    tc.font = '600 13px Spectral, Georgia, serif'; const w = tc.measureText(txt).width + 18, h = 22;
    tc.globalAlpha = Math.min(1, (13 - d) / 3);
    tc.fillStyle = 'rgba(14,11,10,.88)'; tc.strokeStyle = color; tc.lineWidth = 1.5;
    tc.beginPath(); tc.roundRect ? tc.roundRect(s[0] - w / 2, y - h, w, h, 8) : tc.rect(s[0] - w / 2, y - h, w, h); tc.fill(); tc.stroke();
    tc.beginPath(); tc.moveTo(s[0] - 5, y); tc.lineTo(s[0], y + 6); tc.lineTo(s[0] + 5, y); tc.fill();
    tc.fillStyle = color; tc.fillText(txt, s[0], y - h / 2 + 1);
    tc.globalAlpha = 1; tc.lineWidth = 3; tc.strokeStyle = 'rgba(0,0,0,.8)';
    globos.push({ x: s[0] - w / 2, y: y - h, w, h: h + 6, id: def.id, def });
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
  const isla = R.islaDe(lx, lz);
  let lugar = isla ? { nombre: isla.nombre, frase: isla.frase } : { nombre: R.MAPA.nombre, frase: 'La noche no se termina.' };
  if (R.enPozo(lx, lz)) lugar = { nombre: 'Pozo de las Almas', frase: estado?.pozo > 0 ? `Oleada ${estado.pozo} de ${R.POZO.oleadas}` : 'Esperá a que se cierre la entrada.' };
  if (R.enBastion(lx, lz)) lugar = { nombre: 'Bastión Caído', frase: estado?.asedio ? 'Quien tenga el altar, tiene el Bastión.' : 'Piedra vieja. Sangre nueva.' };
  if (!R.enPozo(lx, lz) && !R.enBastion(lx, lz)) for (const l of R.MAPA.lugares) if (Math.hypot(l.x - lx, l.z - lz) < (l.x || l.z ? 14 : R.PUEBLO.r)) lugar = l;
  const puntos = [];
  for (const e of entes.values()) {
    if (e === yo || (e.muerto && !e.esJ)) continue;
    const p = pos(e);
    puntos.push(e.esJ ? { x: p.x, z: p.z, r: 3, c: estado?.grupo?.some(g => g[0] === e.id) ? '#8fd16e' : '#8fb2d8' } : { x: p.x, z: p.z, r: e.def.jefe ? 5 : e.campeon ? 3 : 1.8, c: e.def.jefe ? '#ff4a2a' : e.campeon ? '#f0a050' : '#a8382c' });
  }
  const puntosHab = mio ? C.puntosArbol(mio) - C.gastados(mio) : 0;
  for (const n of MI.NPC_MISION) { const est = mio && MI.estadoNpc(mio, n.id); if (est === 'nueva' || est === 'lista') puntos.push({ x: n.x, z: n.z, r: 3.5, c: est === 'lista' ? '#7fe07a' : '#f0c040' }); }
  return { puntosHab, objetivo: o && !o.muerto ? (o.esJ ? { nombre: o.nombre, nivel: o.nivel, hp: o.hp, desc: 'Enemigo del Bastión' } : { nombre: o.nombre, nivel: o.def.nivel, hp: o.hp, desc: o.def.desc, debil: o.def.debil, resiste: o.def.resiste }) : null, jefe, lugar, ping: red.ping, mini: { yo: { x: lx, z: lz }, puntos } };
}

// ---------- seguimiento de misiones (arriba a la izquierda) ----------
// A dónde ir por cada misión: la zona del monstruo, el lugar a visitar o, si ya está lista, quien la dio.
const lugarCerca = (x, z) => { let m = null, md = 1e9; for (const l of R.MAPA.lugares) { const d = Math.hypot(l.x - x, l.z - z); if (d < md) { md = d; m = l; } } return m?.nombre || ''; };
function destinoMision(mi, prog) {
  const npc = MI.NPC_MISION.find(n => n.id === mi.npc);
  if (MI.completa(mi, prog)) return npc ? { x: npc.x, z: npc.z, donde: `Volvé con ${npc.nombre}` } : null;
  const o = mi.obj;
  if (o.tipo === 'visitar') { const l = R.MAPA.lugares.find(x => x.nombre === o.lugar); return l ? { x: l.x, z: l.z, donde: 'Andá hasta ahí' } : null; }
  const z = R.MONSTRUOS[o.mon]?.zona; return z ? { x: z.x, z: z.z, donde: `En ${lugarCerca(z.x, z.z)}` } : null;
}
let marcasMision = [];
function actualizarSeguimiento() {
  const ms = mio?.misiones; if (!ms) return;
  const lineas = Object.entries(ms.activas).map(([id, prog]) => { const mi = MI.MISIONES[id], d = destinoMision(mi, prog); return { texto: MI.textoObjetivo(mi, prog), lista: MI.completa(mi, prog), nombre: mi.nombre, ...d }; });
  for (const e of Object.values(ms.encargos || {})) {
    if (!e?.tomado) continue;
    const lista = e.prog >= e.n, z = R.MONSTRUOS[e.mon].zona, at = R.PUEBLOS[e.atalaya];
    lineas.push({ texto: `Encargo · ${R.MONSTRUOS[e.mon].nombre}: ${Math.min(e.prog, e.n)}/${e.n}`, lista, nombre: 'Encargo del Tablón',
      ...(lista ? { x: at.x, z: at.z, donde: `Cobralo en el tablón de ${at.nombre}` } : { x: z.x, z: z.z, donde: `En ${lugarCerca(z.x, z.z)}` }) });
  }
  marcasMision = lineas.filter(l => l.x != null);
  hud.seguimiento(lineas);
}

// ---------- NPCs de la Atalaya ----------
function ponerNpcs() {
  for (const def of [...O.NPCS.filter(n => n.modelo), ...MI.NPC_MISION]) {
    const vis = crear(def.modelo.replace('.glb', ''));
    if (def.tinte) vis.mats.forEach(m => m.color?.lerp(new THREE.Color(def.tinte), 0.6));
    vis.raiz.position.set(def.x, R.altura(def.x, def.z), def.z); vis.raiz.rotation.y = def.giro;
    E.scene.add(vis.raiz); npcs.push({ def, vis, t: Math.random() * 5 });
  }
}
function abrirNpc(id) {
  if (MI.NPC_MISION.some(n => n.id === id)) { const n = npcs.find(x => x.def.id === id); n?.vis.muneco.hacer('saluda'); return paneles.misionNpc(id); }
  const def = O.NPCS.find(x => x.id === id); if (!def) return;
  if (def.rol === 'tablon') return paneles.tablon(def.atalaya);
  if (def.rol === 'senda') return paneles.senda(def);
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
// Los equipos tirados se ven con su foto (la misma de la mochila), flotando y del color de su calidad.
function ponerFotoDrop(dd) {
  const url = fotoObjeto(dd.item); if (!url) return;
  const tex = new THREE.TextureLoader().load(url); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sp.material.userData.outlineParameters = { visible: false };
  sp.scale.setScalar(1.15); sp.position.y = 0.45; dd.obj.add(sp); dd.sprite = sp;
  const viejo = dd.obj.children[0]; if (viejo?.geometry === geoObjeto) viejo.scale.setScalar(0.45);
}
function actualizarDrops(lista) {
  const vistos = new Set();
  for (const [id, x, z, b, n, exc] of lista) {
    vistos.add(id);
    if (drops.has(id)) { const dd = drops.get(id); if (dd.item && !dd.sprite) ponerFotoDrop(dd); continue; }
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
    const dd = { id, x, z, obj: g, nombre, color, esOro, item: base?.r ? { b, n, x: exc ? [0] : null, ra: exc > 1 ? exc : 0 } : null };
    drops.set(id, dd); if (dd.item) ponerFotoDrop(dd);
  }
  for (const [id, d] of drops) if (!vistos.has(id)) { E.scene.remove(d.obj); drops.delete(id); }
}

// ---------- música según dónde estás ----------
let ambT = 0;
function ambienteMusical() {
  if (!yo) return 'menu';
  if (R.enPozo(lx, lz) || R.enBastion(lx, lz)) return 'pozo';
  for (const e of entes.values()) if (e.def?.jefe && !e.muerto && Math.hypot(pos(e).x - lx, pos(e).z - lz) < 26) return 'jefe';
  if (estado?.evt?.[0] === 'noche') return 'noche';
  if (performance.now() - ultimaPelea < 6000) return 'pelea';
  if (R.enAtalaya(lx, lz) >= 0) return 'atalaya';
  return 'paramo';
}

// ---------- bucle ----------
const reloj = new THREE.Clock();
const foco = new THREE.Vector3(), mira = new THREE.Vector3();
let angIntro = 0;
function cuadro() {
  requestAnimationFrame(cuadro);
  const dt = Math.min(0.1, reloj.getDelta());
  ambT += dt;
  if (ambT > 0.5) { ambT = 0; SND.ponerAmbiente(ambienteMusical()); }
  if (seleccion.activa) {
    seleccion.update(dt, E.camara); foco.set(0, 0, 0);
  } else if (yo) {
    moverme(dt); actualizarEntes(dt);
    for (const e of entes.values()) if (e.aureola && !e.muerto && Math.random() < dt * 14) { const p = pos(e); FX.chispas(p.x + (Math.random() - 0.5) * 0.8, p.y + 0.3 + Math.random() * 1.4, p.z + (Math.random() - 0.5) * 0.8, e.aureola, 1); }
    v3.set(lx, R.altura(lx, lz), lz); if (foco.distanceTo(v3) > 25) foco.copy(v3); else foco.lerp(v3, Math.min(1, dt * 6));
    const vertical = innerWidth < innerHeight;
    E.camara.position.set(foco.x, foco.y + (vertical ? 15 : 12.5), foco.z + (vertical ? 12 : 10.5));
    if (temblor > 0) { temblor -= dt; E.camara.position.x += (Math.random() - 0.5) * temblor; E.camara.position.y += (Math.random() - 0.5) * temblor; }
    mira.set(foco.x, foco.y + 1, foco.z); E.camara.lookAt(mira);
    const o = objetivo && entes.get(objetivo); FX.marcar(o && !o.muerto ? o.vis.raiz : null, o ? o.radio * 1.6 + 0.4 : 1);
    if (estado) hud.actualizar(estado, datosHud());
    E.campos.actualizar(performance.now() / 1000, santuariosListos);
    if (estado?.asedio || R.enBastion(lx, lz)) E.bastion.actualizar(performance.now() / 1000, (() => { const d = estado?.asedio?.dueno; if (d === '') return ''; if (!d) return null; return estado.asedio.lista.find(x => x[0] === d)?.[3] || '#d4a24a'; })());
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
if (['localhost', '127.0.0.1'].includes(location.hostname)) window.__sendas = { E, entes, FX, red, paneles, mio: () => mio, pos: () => [lx, lz] };
