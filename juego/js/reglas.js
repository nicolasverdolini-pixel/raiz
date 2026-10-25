// Campanas de Bruma — reglas: partida guardada, personajes, atributos, clases, equipo, gemas y mascotas.
'use strict';

const PC_NIVELES = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500];
const NIVEL_MAX = 99;
let SLOT = 0;
try { SLOT = +(localStorage.getItem('cb:slot') || 0); } catch (e) {}
const claveSlot = i => i ? `cb:partida:${i}` : 'cb:partida';
function usarSlot(i) { SLOT = i; try { localStorage.setItem('cb:slot', i); } catch (e) {} }
function resumenSlot(i) {
  try { const g = JSON.parse(localStorage.getItem(claveSlot(i)) || 'null'); if (!g) return null;
    const nv = Math.round(g.unidades.slice().sort((a, b) => b.nivel - a.nivel).slice(0, 5).reduce((a, u) => a + u.nivel, 0) / Math.min(5, g.unidades.length));
    return { paso:g.paso, nv, oro:g.oro, fin:!!g.flags?.fin, nombre:g.nombre || '' };
  } catch (e) { return null; }
}

let G = null; // la partida en curso

const uid = () => Math.random().toString(36).slice(2, 9);
const azar = (a, b) => a + Math.random() * (b - a);
const elegir = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function nivelClase(tot) { let n = 1; for (let i = 1; i < PC_NIVELES.length; i++) if (tot >= PC_NIVELES[i]) n = i + 1; return n; }
function pcParaSiguiente(tot) { const n = nivelClase(tot); return n >= PC_NIVELES.length ? null : PC_NIVELES[n] - tot; }

// ---------- Partida ----------
function nuevaPartida() {
  G = { v:1, oro:300, paso:0, unidades:[], equipo:[], obj:{ pocion:5, remedio:1, fenix:1 }, mat:{ hierro:0, plata:0, esquirla:0 }, gemas:{}, mascotas:[], flags:{}, creada:Date.now(), batallas:0 };
  ['lior', 'mara', 'tobias', 'nela'].forEach(unirPersonaje);
  guardar();
}
function guardar() { try { localStorage.setItem(claveSlot(SLOT), JSON.stringify(G)); } catch (e) {} }
function cargar() {
  try { const s = localStorage.getItem(claveSlot(SLOT)); if (s) { G = JSON.parse(s); return true; } } catch (e) {}
  return false;
}
function hayPartida(i = SLOT) { try { return !!localStorage.getItem(claveSlot(i)); } catch (e) { return false; } }
function borrarSlot(i) { try { localStorage.removeItem(claveSlot(i)); } catch (e) {} }

function nuevoItem(id, mejora = 0, rareza = 0) {
  const def = EQ[id], R = RAREZAS[rareza];
  const it = { uid:uid(), id, mejora, rareza, bonos:{}, gemas: Array(Math.min(3, (def.gemas || 0) + R.gemas)).fill(null) };
  // Atributos extra al azar según la rareza.
  const t = Math.min(4, def.tier || 4);
  const claves = Object.keys(BONOS_EQ).filter(k => !(def.slot === 'arma' && k === 'def'));
  for (let i = 0; i < R.bonos; i++) {
    const k = elegir(claves);
    const v = { atk:1 + t, def:1 + t, mag:1 + t, res:1 + t, hp:6 + t * 6, mp:4 + t * 3, spd:0.5, eva:3 }[k];
    it.bonos[k] = (it.bonos[k] || 0) + v;
  }
  if (R.el && def.slot === 'arma' && !def.el) it.el = elegir(Object.keys(ELEMENTOS));
  G.equipo.push(it);
  return it;
}
// Tira la rareza de un botín. extra sube las chances (jefes).
function tirarRareza(extra = 0) {
  const r = Math.random() * 100 - extra;
  return r < 0.6 ? 4 : r < 5 ? 3 : r < 17 ? 2 : r < 45 ? 1 : 0;
}
function equipoAzar(tier) {
  const ids = Object.keys(EQ).filter(k => EQ[k].tier <= tier && EQ[k].precio && !EQ[k].forja);
  const altos = ids.filter(k => EQ[k].tier >= tier - 1);
  return elegir(altos.length ? altos : ids);
}
function precioVenta(it) { return Math.round((EQ[it.id].precio || 800) * 0.5 * (1 + RAREZAS[it.rareza || 0].m * 2) + it.mejora * 60); }
function item(uidItem) { return G.equipo.find(i => i.uid === uidItem) || null; }
function dueñoDe(uidItem) { return G.unidades.find(u => Object.values(u.eq).includes(uidItem)) || null; }

function facAzar() { const f = {}; ['hp', 'mp', 'atk', 'def', 'mag', 'res', 'spd'].forEach(k => f[k] = +azar(0.93, 1.07).toFixed(3)); return f; }
const FAC_UNICOS = {
  lior:   { hp:1.0, mp:1.08, atk:0.98, def:1.0, mag:1.06, res:1.05, spd:1.03 },
  mara:   { hp:0.98, mp:0.95, atk:1.06, def:0.96, mag:0.95, res:0.98, spd:1.06 },
  brann:  { hp:1.1, mp:0.9, atk:1.08, def:1.08, mag:0.9, res:0.95, spd:0.98 },
  ysolde: { hp:0.98, mp:1.1, atk:0.92, def:0.97, mag:1.08, res:1.08, spd:1.0 },
  fenn:   { hp:0.96, mp:0.95, atk:1.05, def:0.95, mag:0.98, res:0.96, spd:1.1 },
  aldous: { hp:1.08, mp:1.02, atk:1.06, def:1.1, mag:1.0, res:1.04, spd:0.97 },
};

function crearUnidad({ nombre, clase, nivel = 1, look, unico = null, fac }) {
  const u = { id:uid(), nombre, unico, look: look || { pelo:elegir(PELOS), piel:elegir(PIELES), estilo:Math.floor(Math.random() * 3), semilla:uid() }, nivel, exp:0,
    fac: fac || facAzar(), clase, sec:null, pasiva:null, cl:{}, apr:[], eq:{ arma:null, armadura:null, acc:null }, mascota:null };
  u.cl[clase] = { pc:0, tot:0 };
  return u;
}

function nivelPromedio() {
  const us = G.unidades.slice().sort((a, b) => b.nivel - a.nivel).slice(0, 5);
  return us.length ? Math.round(us.reduce((s, u) => s + u.nivel, 0) / us.length) : 1;
}

function unirPersonaje(clave) {
  if (G.unidades.some(u => u.unico === clave)) return;
  const pj = PJ[clave], r = RECLUTAS_HISTORIA[clave];
  const nv = clave === 'lior' || clave === 'mara' || clave === 'tobias' || clave === 'nela' ? r.nv : Math.max(r.nv, nivelPromedio());
  const u = crearUnidad({ nombre:pj.n, clase:pj.clase, nivel:nv, look:pj.look, unico:clave, fac:FAC_UNICOS[clave] || facAzar() });
  for (const [c, pc] of Object.entries(r.clases)) u.cl[c] = { pc:Math.round(pc * 0.3), tot:pc };
  u.apr = r.apr.slice();
  r.eq.forEach(id => { const it = nuevoItem(id); u.eq[EQ[id].slot] = it.uid; });
  G.unidades.push(u);
  return u;
}

// ---------- Clases ----------
function claseDesbloqueada(u, cid) {
  const C = CLASES[cid];
  if (!C || C.mon) return false;
  if (C.unico) return u.unico === C.unico;
  return Object.entries(C.req).every(([k, v]) => nivelClase(u.cl[k]?.tot || 0) >= v);
}
function clasesJugables() { return Object.keys(CLASES).filter(k => !CLASES[k].mon); }
function cambiarClase(u, cid) {
  if (!claseDesbloqueada(u, cid)) return false;
  u.clase = cid;
  if (!u.cl[cid]) u.cl[cid] = { pc:0, tot:0 };
  if (u.sec === cid) u.sec = null;
  // Saca el equipo que la nueva clase no puede usar.
  ['arma', 'armadura'].forEach(slot => { const it = item(u.eq[slot]); if (it && !puedeEquipar(u, it.id)) u.eq[slot] = null; });
  return true;
}
function puedeEquipar(u, id) {
  const def = EQ[id], C = CLASES[u.clase];
  if (def.slot === 'arma') return C.armas.includes(def.tipo);
  if (def.slot === 'armadura') return C.armad.includes(def.tipo);
  return true;
}
function habsActivasDe(u, cid) {
  return (CLASES[cid]?.habs || []).filter(h => HAB[h].tipo !== 'pasiva' && u.apr.includes(h));
}
function habsDeBatalla(u) {
  return { principal: habsActivasDe(u, u.clase), secundaria: u.sec ? habsActivasDe(u, u.sec) : [] };
}
function pasivasAprendidas(u) { return u.apr.filter(h => HAB[h].tipo === 'pasiva'); }
function aprender(u, hid) {
  const cid = Object.keys(CLASES).find(c => CLASES[c].habs.includes(hid));
  const H = HAB[hid];
  if (!cid || u.apr.includes(hid) || H.historia) return false;
  const cl = u.cl[cid];
  if (!cl || cl.pc < H.pc) return false;
  cl.pc -= H.pc;
  u.apr.push(hid);
  return true;
}

// ---------- Gemas ----------
function gemaInfo(clave) { // 'rubi2' -> { id:'rubi', nv:2, def }
  const m = /^([a-z_]+)(\d)$/.exec(clave || '');
  return m ? { id:m[1], nv:+m[2], def:GEMAS[m[1]] } : null;
}
function nombreGema(clave) { const g = gemaInfo(clave); return g ? `${g.def.n} ${'I'.repeat(g.nv)}` : ''; }
function sumarGema(clave, n = 1) { G.gemas[clave] = (G.gemas[clave] || 0) + n; if (G.gemas[clave] <= 0) delete G.gemas[clave]; }

// ---------- Mascotas ----------
function nuevaMascota(id) {
  const m = { uid:uid(), id, nombre:MASCOTAS[id].n.split(' ')[0], nivel:1, exp:0 };
  G.mascotas.push(m);
  return m;
}
function mascota(uidM) { return G.mascotas.find(m => m.uid === uidM) || null; }
function dueñoMascota(uidM) { return G.unidades.find(u => u.mascota === uidM) || null; }

// ---------- Atributos ----------
// u puede ser un personaje del grupo o un enemigo (con u._eq: instancias de equipo ya resueltas).
function equipoDe(u) {
  if (u._eq) return u._eq;
  return { arma:item(u.eq.arma), armadura:item(u.eq.armadura), acc:item(u.eq.acc) };
}
function calcStats(u) {
  const C = CLASES[u.clase], lv = u.nivel, f = u.fac || {};
  const base = { hp:38 + lv * 7, mp:12 + lv * 2.5, atk:6 + lv * 0.9, def:4 + lv * 0.7, mag:6 + lv * 0.9, res:4 + lv * 0.7, spd:6 + lv * 0.12 };
  const s = {};
  for (const k in base) s[k] = base[k] * (f[k] || 1) * (C.m[k] || 1);
  s.mov = C.mov; s.salto = C.salto; s.eva = C.eva || 5; s.vuela = !!C.vuela;
  s.resEl = Object.assign({}, C.resEl || {}); s.raza = C.raza || null; s.inmune = new Set(); s.efectos = {}; s.armaEl = null; s.armaVeneno = 0; s.armaLento = 0;
  const eq = equipoDe(u);
  const arma = eq.arma, ad = arma ? EQ[arma.id] : null;
  const puños = (C.armas || []).includes('puños');
  s.armaTipo = ad ? ad.tipo : (puños ? 'puños' : 'nada');
  s.armaPoder = ad ? ad.poder * (1 + RAREZAS[arma.rareza || 0].m) + 2 * arma.mejora : (C.mon ? (C.poder || 5) + lv * 0.5 : puños ? 3 + lv * 0.45 : 2);
  if (puños && ad) s.armaPoder += lv * 0.3;
  s.rango = (ARMA_INFO[s.armaTipo] || { r:[1, 1] }).r.slice();
  if (ad?.el) s.armaEl = ad.el;
  if (arma?.el) s.armaEl = s.armaEl || arma.el;
  if (ad?.veneno) s.armaVeneno = ad.veneno;
  if (s.armaTipo === 'daga') s.eva += 5;
  let hpExtra = 0;
  const sumar = (d, mejora = 0, it = null) => {
    if (!d) return;
    const m = 1 + RAREZAS[it?.rareza || 0].m;
    ['atk', 'mag', 'res', 'def', 'spd'].forEach(k => { if (d[k]) s[k] += (k === 'def' || k === 'res') && d.slot === 'armadura' ? d[k] * m : d[k]; });
    for (const [k, v] of Object.entries(it?.bonos || {})) { if (k === 'hp') hpExtra += v; else if (k === 'mp') s.mp += v; else if (k === 'eva') s.eva += v; else s[k] += v; }
    if (d.slot === 'armadura' && mejora) { s.def += mejora; s.res += mejora; }
    if (d.mp) s.mp += d.mp;
    if (d.mov) s.mov += d.mov;
    if (d.salto) s.salto += d.salto;
    if (d.eva) s.eva += d.eva;
    (d.inmune || []).forEach(e => s.inmune.add(e));
  };
  ['arma', 'armadura', 'acc'].forEach(slot => { const it = eq[slot]; if (it) sumar(EQ[it.id], it.mejora, it); });
  // Rasgos del equipo
  s.rasgos = new Set();
  ['arma', 'armadura', 'acc'].forEach(slot => { const it = eq[slot]; if (it) (EQ[it.id].rasgos || []).forEach(r => s.rasgos.add(r)); });
  if (s.rasgos.has('esquiva')) s.eva += 8;
  if (s.rasgos.has('alcance') && s.rango[1] > 1) s.rango[1] += 1;
  ['regen', 'vampiro', 'contra'].forEach(r => { if (s.rasgos.has(r)) s.efectos[r] = (s.efectos[r] || 0) + 1; });
  // Gemas
  let hpMult = 1;
  ['arma', 'armadura', 'acc'].forEach(slot => {
    const it = eq[slot]; if (!it) return;
    (it.gemas || []).forEach(clave => {
      const g = gemaInfo(clave); if (!g) return;
      const nv = g.nv, d = g.def;
      if (d.el) {
        if (slot === 'arma') { if (!s.armaEl) s.armaEl = d.el; s.armaElNv = Math.max(s.armaElNv || 0, nv); if (d.el === 'hielo') s.armaLento = 10 * nv; }
        else s.resEl[d.el] = Math.min(0.9, (s.resEl[d.el] || 0) + [0, 0.25, 0.5, 0.75][nv]);
      }
      if (d.st === 'atk') s.atk += [0, 2, 4, 7][nv];
      if (d.st === 'mag') s.mag += [0, 2, 4, 7][nv];
      if (d.st === 'spd') s.spd += [0, 0.5, 1, 1.5][nv];
      if (d.st === 'hp') hpMult += [0, 0.08, 0.15, 0.25][nv];
      if (d.efecto) s.efectos[d.efecto] = (s.efectos[d.efecto] || 0) + nv;
    });
  });
  // Mascota
  const m = u._mascota !== undefined ? u._mascota : (u.mascota ? mascota(u.mascota) : null);
  if (m) {
    const M = MASCOTAS[m.id], k = (1 + (m.nivel - 1) * 0.25) * (u.pasiva && HAB[u.pasiva]?.pv === 'bestias' ? 2 : 1);
    for (const [st, v] of Object.entries(M.bon)) {
      if (st === 'mov') s.mov += v; else if (st === 'eva') s.eva += Math.round(v * k); else if (st === 'hp') s.hp += v * k; else s[st] += v * k;
    }
    if (M.accion === 'vista') s.vista = true;
    s.mascotaAccion = M.accion;
  }
  // Pasiva equipada
  const pv = u.pasiva ? HAB[u.pasiva]?.pv : null;
  if (pv === 'aguante') hpMult += 0.15;
  if (pv === 'mente') s.mp *= 1.2;
  if (pv === 'mov1') s.mov += 1;
  if (pv === 'salto') { s.salto += 2; s.mov += 1; }
  if (pv === 'halcon' && s.armaTipo === 'arco') s.rango[1] += 1;
  if (pv === 'inmune') ['veneno', 'dormido', 'ciego'].forEach(e => s.inmune.add(e));
  if (pv === 'voz') { s.inmune.add('silencio'); s.mp *= 1.1; }
  if (pv === 'sexto') s.eva += 10;
  if (pv === 'vampiro') s.efectos.vampiro = (s.efectos.vampiro || 0) + 1;
  if (pv === 'rabia') { s.atk *= 1.15; s.def *= 0.9; }
  if (pv === 'sangre') { hpMult += 0.1; s.resEl.fuego = Math.min(0.9, (s.resEl.fuego || 0) + 0.5); }
  s.pasiva = pv;
  s.hp = (s.hp + hpExtra) * hpMult;
  if (u.jefe) s.hp *= 1.5;
  s.hpMax = Math.round(s.hp); s.mpMax = Math.round(s.mp);
  ['atk', 'def', 'mag', 'res'].forEach(k => s[k] = Math.round(s[k]));
  s.spd = Math.round(s.spd * 10) / 10;
  s.debil = C.debil || []; s.resFis = C.resFis || 1;
  return s;
}

// ---------- Experiencia ----------
// Devuelve una lista de mensajes ("¡Nivel 5!", "Guerrero nivel 3", ...).
function darExp(u, exp, pc) {
  const msgs = [];
  if (!u || u.nivel >= NIVEL_MAX && !pc) return msgs;
  if (u.nivel < NIVEL_MAX) {
    u.exp += exp;
    while (u.exp >= 100 && u.nivel < NIVEL_MAX) { u.exp -= 100; u.nivel++; msgs.push({ t:'nivel', txt:`¡Nivel ${u.nivel}!` }); }
  }
  if (pc) {
    const cl = u.cl[u.clase] || (u.cl[u.clase] = { pc:0, tot:0 });
    const antes = nivelClase(cl.tot);
    cl.pc += pc; cl.tot += pc;
    const desp = nivelClase(cl.tot);
    if (desp > antes) {
      msgs.push({ t:'clase', txt:`${CLASES[u.clase].n} Nv ${desp}` });
      // ¿Se desbloqueó alguna clase nueva?
      clasesJugables().forEach(c => {
        const C = CLASES[c];
        if (C.req[u.clase] && !claseDesbloqueadaAntes(u, c, antes) && claseDesbloqueada(u, c)) msgs.push({ t:'nueva', txt:`¡Nueva clase: ${C.n}!` });
      });
    }
  }
  return msgs;
}
function claseDesbloqueadaAntes(u, cid, nivelAnterior) {
  const C = CLASES[cid];
  return Object.entries(C.req).every(([k, v]) => (k === u.clase ? nivelAnterior : nivelClase(u.cl[k]?.tot || 0)) >= v);
}

// ---------- Tienda ----------
function tierActual() { return G.paso >= 12 ? 5 : [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4][G.paso]; }
function capituloActual() { return G.paso >= 11 ? [6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10, 10, 10][Math.min(G.paso - 11, 16)] : [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5][G.paso]; }
function costoReclutar(nv) { return 200 + nv * 40; }
function costoMejora(it) {
  const n = it.mejora + 1, def = EQ[it.id];
  const oro = Math.round(n * 90 + (def.precio || 1500) * 0.15 * n);
  const mat = n <= 2 ? { hierro:1 } : n === 3 ? { hierro:2 } : n === 4 ? { plata:1 } : { plata:2, esquirla:1 };
  return { oro, mat };
}
function alcanza(mat) { return Object.entries(mat).every(([k, v]) => (G.mat[k] || 0) >= v); }

// ---------- Enemigos ----------
function equipoEnemigo(cid, nv) {
  const C = CLASES[cid];
  const tier = Math.min(nv >= 30 ? 5 : 4, 1 + Math.floor(nv / 4));
  const mejor = (filtro) => Object.entries(EQ).filter(([id, d]) => d.tier <= tier && filtro(d)).sort((a, b) => b[1].tier - a[1].tier)[0];
  const eq = { arma:null, armadura:null, acc:null };
  if (C.mon) return eq;
  const a = mejor(d => d.slot === 'arma' && d.tipo === C.armas[0]);
  if (a) eq.arma = { id:a[0], mejora:Math.floor(nv / 8), gemas:[] };
  const r = mejor(d => d.slot === 'armadura' && d.tipo === C.armad[0]);
  if (r) eq.armadura = { id:r[0], mejora:Math.floor(nv / 8), gemas:[] };
  return eq;
}
function crearEnemigo(e, facil = false) {
  const C = CLASES[e.c];
  const habs = e.habs || C.habs.filter(h => HAB[h].tipo !== 'pasiva' && !HAB[h].historia && (C.mon || HAB[h].pc <= 120 + e.nv * 30));
  return { nombre: e.n || C.n, clase:e.c, nivel:e.nv, fac: facil ? { hp:0.85, atk:0.9, mag:0.9, def:0.95, res:0.95, spd:0.95 } : { hp:1.05, atk:1.03, mag:1.03, def:1.02, res:1.02, spd:1 }, jefe:!!e.jefe, t:e.t || null, habsE:habs, _eq:equipoEnemigo(e.c, e.nv), _mascota:null, look: e.look || PJ_LOOK_ENEMIGO(e) };
}
function PJ_LOOK_ENEMIGO(e) {
  const pj = Object.values(PJ).find(p => p.n === e.n);
  if (pj?.look) return pj.look;
  return { pelo:elegir(PELOS), piel:elegir(PIELES), estilo:Math.floor(Math.random() * 3), semilla:uid() };
}

// ---------- Detalle con números de cada habilidad ----------
const EFECTO_ESTADO = {
  veneno:'pierde 8% de vida por turno', dormido:'pierde turnos hasta que le peguen', lento:'actúa 50% menos seguido', detenido:'no actúa',
  aturdido:'pierde 1 turno', silencio:'no puede usar magia', ciego:'50% menos puntería', quebrado:'−40% defensa', debil:'−30% ataque',
  prisa:'actúa 50% más seguido', protegido:'−26% de daño físico recibido', coraza:'−26% de daño mágico recibido', valor:'+25% ataque',
  foco:'+30% poder mágico', regen:'recupera 6% de vida por turno',
};
function detalleHab(id, u) {
  const H = HAB[id], p = [];
  if (!H) return '';
  if (H.tipo === 'pasiva') return '';
  const s = u ? calcStats(u) : null;
  const alcance = H.r === 'arma' ? (s ? s.rango.join('–') : 'del arma') : (H.r[1] === 0 ? 'sobre sí' : `${H.r[0]}–${H.r[1]}`);
  if (H.tipo === 'fis') {
    const fuerza = s ? Math.round(((s.atk + (H.sinArma ? 3 : s.armaPoder)) * 1.6) * (H.p || 1) * (s.pasiva === 'critico' ? 1.2 : 1)) : null;
    p.push(`Daño físico ×${H.p}${H.golpes ? ` (${H.golpes} golpes)` : ''}${fuerza ? ` ≈ ${fuerza * (H.golpes || 1)} antes de defensa` : ''}`);
    if (H.precisa) p.push('nunca falla');
    if (H.espalda) p.push('×1.6 por la espalda');
  } else if (H.tipo === 'mag') {
    const f = s ? Math.round(H.p * (0.5 + s.mag / 14) * (s.pasiva === 'magia' ? 1.2 : 1)) : null;
    p.push(`Daño mágico ${H.p}${f ? ` ≈ ${f} antes de resistencia` : ''}`);
    if (H.antidemonio) p.push('×2 contra demonios');
    if (H.drena) p.push(`te cura ${Math.round(H.drena * 100)}% del daño`);
  } else if (H.tipo === 'cura') {
    const f = s ? Math.round(H.p * (0.5 + s.mag / 14)) : null;
    p.push(`Cura ${f ? f + ' de vida' : 'poder ' + H.p}`);
  } else if (H.tipo === 'revivir') p.push(`Levanta a un caído con ${Math.round(H.p * 100)}% de vida${H.prob ? ` (${H.prob}% de chance)` : ''}`);
  const esp = { primeros:'Cura 30% de su vida', meditar:'Recupera 12 + 10% de su magia', chakra:'Cura 20% de vida y 10% de magia', juramento:'Cura 30% de vida y da Valor (+25% ataque)',
    gravedad:'Quita 25% de la vida actual (no a jefes)', purificar:'Quita todos los estados malos', robar_oro:'Roba 20 + 12 × nivel del enemigo en oro (más fácil por la espalda)', robar_obj:'Roba un material, poción o gema',
    muerte:'35% de matar de un golpe (no a jefes)', canalizar:'Le da 10 + magia/3 de magia a un aliado', elixir:'Cura 35% de vida y 15 de magia', furia:'Pierde 15% de vida; gana Valor y Prisa 3 turnos', desesperado:'Daño = ataque × 1.5 + la vida que le falta' }[H.esp];
  if (esp) p.push(esp);
  if (H.el) p.push(`elemento ${ELEMENTOS[H.el].n.toLowerCase()} (×1.5 si es débil)`);
  (H.est || []).forEach(e => p.push(`${H.tipo === 'apoyo' && (H.af || 'e') === 'a' ? '' : e.prob + '% '}${ESTADOS[e.id].n} ${e.dur || 3} turnos: ${EFECTO_ESTADO[e.id]}`));
  p.push(`alcance ${alcance}`);
  if (H.a) p.push(`área de ${H.a} casilla${H.a > 1 ? 's' : ''} alrededor`);
  if (H.carga) p.push(`tarda en salir (${H.carga >= 25 ? 'rápido' : H.carga >= 18 ? 'medio' : 'lento'})`);
  return p.join(' · ');
}
