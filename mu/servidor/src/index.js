// Servidor de Sendas del Éter (Cloudflare Worker + Durable Objects).
//
// Mapa: una sala por mapa/canal. Es el juez: mueve a los monstruos, calcula el daño, reparte la
//       experiencia (también en grupo) y le manda a cada celu lo que pasa, 10 veces por segundo.
// Personaje: un objeto por nombre que guarda la clave (cifrada) y los datos del personaje.
//
// Mensajes del celu → servidor:
//   entrar {nombre, clave} · pos {x,z,dir} · atk {id} · hab {n,id} · pot · punto {s,n}
//   inv {id} · acepta {de} · rechaza {de} · salir · ping
// Servidor → celu:
//   bienvenida {id, datos} · error {msg} · inv {de, nombre} · s {j, m, ev, yo} (foto del mapa) · pong
// Eventos dentro de "ev": ['g', de, a, daño, tipo] golpe · ['a', id, acción, objetivo] animación ·
//   ['m', id] muere · ['n', id, nivel] sube · ['x', cantidad] exp propia · ['tp', id, x, z] salto ·
//   ['rv', id, x, z] revive · ['aviso', texto] · ['msg', texto] (para todos)

import { DurableObject } from 'cloudflare:workers';
import * as R from '../../js/reglas.js';
import * as C from '../../js/clases.js';
import * as O from '../../js/objetos.js';
import * as MI from '../../js/misiones.js';

const CORS = { 'Access-Control-Allow-Origin': '*' };
const MAX_JUGADORES = 40;
const VISTA = 45;                    // cada celu recibe lo que está a esta distancia
const GUARDAR_CADA = 30;             // segundos
const NOMBRE_OK = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ]{3,14}$/;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/') return new Response('Sendas del Éter: servidor funcionando', { headers: CORS });
    const m = url.pathname.match(/^\/mapa\/([a-z0-9-]{1,20})$/);
    if (!m) return new Response('No encontrado', { status: 404, headers: CORS });
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('Se espera WebSocket', { status: 426, headers: CORS });
    return env.MAPAS.get(env.MAPAS.idFromName(m[1])).fetch(req);
  },
};

// ---------------- Personaje: clave y datos guardados ----------------
const enc = new TextEncoder();
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
async function hashClave(clave, sal) {
  const k = await crypto.subtle.importKey('raw', enc.encode(clave), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: sal, iterations: 100000 }, k, 256));
}
function iguales(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }

// Un objeto por CUENTA (clave + personajes + baúl compartido). También se usa, con la clave "pj:<nombre>",
// como registro para que dos cuentas no tengan personajes con el mismo nombre.
const MAX_PJ = 6, BAUL = 60;
export class Personaje extends DurableObject {
  async leer() {
    let c = await this.ctx.storage.get('cuenta');
    if (!c) {
      c = { personajes: {}, baul: Array(BAUL).fill(null) };
      const viejo = await this.ctx.storage.get('datos');   // formato anterior: un personaje por cuenta
      if (viejo) { c.personajes[viejo.nombre.toLowerCase()] = viejo; c.migrado = viejo.nombre; }
    }
    while (c.baul.length < BAUL) c.baul.push(null);
    return c;
  }
  lista(c) { return Object.values(c.personajes).map(d => ({ nombre: d.nombre, clase: d.clase || 'guardian', nivel: d.nivel })); }

  async entrarCuenta(cuenta, clave) {
    const guardada = await this.ctx.storage.get('clave');
    if (!guardada) {
      const sal = crypto.getRandomValues(new Uint8Array(16));
      await this.ctx.storage.put('clave', { sal: hex(sal), hash: await hashClave(clave, sal) });
      const c = await this.leer(); await this.ctx.storage.put('cuenta', c);
      return { ok: true, nueva: true, personajes: this.lista(c) };
    }
    const fallos = (await this.ctx.storage.get('fallos')) || { n: 0, t: 0 };
    if (fallos.n >= 5 && Date.now() - fallos.t < 60_000) return { error: 'Demasiados intentos. Esperá un minuto.' };
    const sal = new Uint8Array(guardada.sal.match(/../g).map(h => parseInt(h, 16)));
    if (!iguales(await hashClave(clave, sal), guardada.hash)) {
      await this.ctx.storage.put('fallos', { n: fallos.n + 1, t: Date.now() });
      return { error: 'Esa cuenta ya existe y la clave no coincide.' };
    }
    if (fallos.n) await this.ctx.storage.delete('fallos');
    const c = await this.leer(); await this.ctx.storage.put('cuenta', c);
    return { ok: true, personajes: this.lista(c), migrado: c.migrado };
  }
  async crearPj(nombre, clase) {
    const c = await this.leer();
    if (Object.keys(c.personajes).length >= MAX_PJ) return { error: `Una cuenta puede tener hasta ${MAX_PJ} personajes.` };
    c.personajes[nombre.toLowerCase()] = { ...R.nuevoPersonaje(nombre, clase), creado: Date.now() };
    await this.ctx.storage.put('cuenta', c);
    return { ok: true, personajes: this.lista(c) };
  }
  async cargar(nombre) {
    const c = await this.leer(), d = c.personajes[nombre.toLowerCase()];
    return d ? { datos: R.normalizar(d), baul: c.baul } : { error: 'Ese personaje no es de esta cuenta.' };
  }
  async guardar(nombre, datos, baul) {
    const c = await this.leer(); c.personajes[nombre.toLowerCase()] = datos; if (baul) c.baul = baul;
    await this.ctx.storage.put('cuenta', c);
  }
  // Ranking (este objeto es "#ranking"): los mejores 100 por renacimientos, nivel y experiencia.
  async rankingPoner(fila) {
    const lista = ((await this.ctx.storage.get('lista')) || []).filter(f => f.nombre !== fila.nombre);
    lista.push(fila);
    lista.sort((a, b) => b.resets - a.resets || b.nivel - a.nivel || b.exp - a.exp);
    await this.ctx.storage.put('lista', lista.slice(0, 100));
  }
  async rankingVer() { return (await this.ctx.storage.get('lista')) || []; }

  // Registro de nombres (este objeto es "pj:<nombre>").
  async reservar(cuenta) {
    const dueno = await this.ctx.storage.get('dueno');
    if (dueno && dueno !== cuenta) return false;
    if (!dueno) await this.ctx.storage.put('dueno', cuenta);
    return true;
  }
}

// ---------------- Mapa: la sala donde se juega ----------------
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const enPueblo = p => R.enAtalaya(p.x, p.z) >= 0;
const r2 = n => Math.round(n * 100) / 100;
const entre = (a, b) => a + Math.random() * (b - a);
// Qué tan bien equipado se ve: arma excelente o +7 brilla.
const brillo = q => {
  const a = q.d.equipo?.arma; let ra = 0;
  for (const it of Object.values(q.d.equipo || {})) ra = Math.max(ra, O.rareza(it));
  return ((a?.n || 0) >= 7 ? 1 : 0) | (ra << 1) | (O.rareza(a) << 3);
};

export class Mapa extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.jug = new Map();      // id → jugador
    this.mons = new Map();     // id → monstruo
    this.grupos = new Map();   // id → { id, lider, miembros: [ids] }
    this.ev = [];
    this.sigId = 1; this.sigMon = 1000; this.sigGrupo = 1;
    this.t = 0; this.reloj = null;
    this.evento = null; this.proximo = null;
    this.drops = new Map(); this.sigDrop = 1; this.siervos = new Map(); this.sigSiervo = 5000000;
    for (const tipo of R.TIPOS) for (let i = 0; i < R.MONSTRUOS[tipo].cantidad; i++) this.crearMonstruo(tipo);
  }

  // ----- conexiones -----
  async fetch(req) {
    const [cliente, servidor] = Object.values(new WebSocketPair());
    servidor.accept();
    const s = { ws: servidor, p: null, entrando: false };
    servidor.addEventListener('message', e => this.mensaje(s, e.data).catch(err => console.log('error', err?.stack || err)));
    servidor.addEventListener('close', () => this.salir(s));
    servidor.addEventListener('error', () => this.salir(s));
    return new Response(null, { status: 101, webSocket: cliente });
  }

  enviar(s, obj) { try { s.ws.send(JSON.stringify(obj)); } catch (e) {} }

  async mensaje(s, raw) {
    if (typeof raw !== 'string' || raw.length > 2000) return;
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (!s.p) {
      if (s.ocupado) return;
      s.ocupado = true;
      try {
        if (m.t === 'cuenta') await this.loginCuenta(s, m);
        else if (m.t === 'crearPj' && s.cuenta) await this.crearPj(s, m);
        else if (m.t === 'jugar' && s.cuenta) await this.entrar(s, m);
      } finally { s.ocupado = false; }
      return;
    }
    const p = s.p;
    switch (m.t) {
      case 'pos': return this.moverJugador(p, m);
      case 'atk': return this.marcar(p, m.id);
      case 'hab': return this.habilidad(p, String(m.h || ''), m.id);
      case 'pot': return this.beber(p, 'pocion');
      case 'eter': return this.beber(p, 'eter');
      case 'usar': return this.usar(p, m.i | 0);
      case 'equipar': return this.equipar(p, m.i | 0);
      case 'quitar': return this.quitar(p, String(m.r || ''));
      case 'comprar': return this.comprar(p, String(m.npc || ''), String(m.b || ''), m.c | 0);
      case 'vender': return this.vender(p, m.i | 0);
      case 'forjar': return this.forjar(p, m.i, m.r);
      case 'aprender': return this.aprender(p, String(m.h || ''));
      case 'vela': return this.vela(p, String(m.lugar || ''));
      case 'viajar': return this.viajar(p, m.i | 0);
      case 'com': return this.comercio(p, m);
      case 'baul': return this.usarBaul(p, m);
      case 'mision': return this.mision(p, m);
      case 'chat': return this.chat(p, String(m.txt || ''));
      case 'renacer': return this.renacer(p);
      case 'ranking': return this.enviar(s, { t: 'ranking', lista: (await this.cuenta('#ranking').rankingVer()).slice(0, 50) });
      case 'pozo': return this.entrarPozo(p);
      case 'encargo': return this.encargo(p, m);
      case 'salirPj': { this.salir(s); await new Promise(r => setTimeout(r, 300)); return this.mandarLista(s); }
      case 'punto': return this.repartir(p, m.s, m.n | 0);
      case 'inv': return this.invitar(p, m.id);
      case 'acepta': return this.aceptar(p, m.de);
      case 'rechaza': { const q = this.jug.get(m.de); if (q) this.aviso(q, `${p.nombre} no aceptó el grupo.`); return; }
      case 'salir': return this.dejarGrupo(p);
      case 'ping': return this.enviar(s, { t: 'pong', c: m.c });
    }
  }

  cuenta(nombre) { return this.env.PERSONAJES.get(this.env.PERSONAJES.idFromName(nombre.toLowerCase())); }

  async loginCuenta(s, m) {
    const cuenta = String(m.cuenta || '').trim(), clave = String(m.clave || '');
    if (!NOMBRE_OK.test(cuenta)) return this.enviar(s, { t: 'error', msg: 'La cuenta va de 3 a 14 letras o números, sin espacios.' });
    if (clave.length < 4 || clave.length > 40) return this.enviar(s, { t: 'error', msg: 'La clave tiene que tener al menos 4 caracteres.' });
    const r = await this.cuenta(cuenta).entrarCuenta(cuenta, clave);
    if (r.error) return this.enviar(s, { t: 'error', msg: r.error });
    if (r.migrado) await this.cuenta('pj:' + r.migrado).reservar(cuenta.toLowerCase());
    s.cuenta = cuenta.toLowerCase();
    this.enviar(s, { t: 'cuenta', personajes: r.personajes, nueva: !!r.nueva });
  }

  async mandarLista(s) {
    const c = await this.cuenta(s.cuenta).leer();
    this.enviar(s, { t: 'cuenta', personajes: Object.values(c.personajes).map(d => ({ nombre: d.nombre, clase: d.clase || 'guardian', nivel: d.nivel })) });
  }

  async crearPj(s, m) {
    const nombre = String(m.nombre || '').trim(), clase = String(m.clase || '');
    if (!NOMBRE_OK.test(nombre)) return this.enviar(s, { t: 'error', msg: 'El nombre va de 3 a 14 letras o números, sin espacios.' });
    if (!C.CLASES[clase]) return this.enviar(s, { t: 'error', msg: 'Elegí una clase.' });
    if (!(await this.cuenta('pj:' + nombre).reservar(s.cuenta))) return this.enviar(s, { t: 'error', msg: 'Ese nombre ya lo usa otro jugador.' });
    const r = await this.cuenta(s.cuenta).crearPj(nombre, clase);
    if (r.error) return this.enviar(s, { t: 'error', msg: r.error });
    this.enviar(s, { t: 'cuenta', personajes: r.personajes, creado: nombre });
  }

  async entrar(s, m) {
    if (this.jug.size >= MAX_JUGADORES) return this.enviar(s, { t: 'error', msg: 'El mapa está lleno. Probá en un rato.' });
    const r = await this.cuenta(s.cuenta).cargar(String(m.nombre || ''));
    if (r.error) return this.enviar(s, { t: 'error', msg: r.error });
    // Una cuenta juega con un personaje a la vez: si ya estaba adentro (otro celu o se le cortó), se cierra lo viejo.
    for (const q of this.jug.values()) if (q.cuenta === s.cuenta) { this.salir(q.s); try { q.s.ws.close(4000, 'Entraste desde otro lado'); } catch (e) {} }
    const at = R.PUEBLOS[R.atalayaCercana(0, 0, r.datos.atalayas)], a = Math.random() * Math.PI * 2;
    const p = {
      id: this.sigId++, s, cuenta: s.cuenta, nombre: r.datos.nombre, d: r.datos, baul: r.baul,
      x: at.x + Math.cos(a) * 3, z: at.z + Math.sin(a) * 3, dir: 0, mueve: false,
      hp: 0, mp: 0, objetivo: null, cdAtk: 0, cds: {}, buffs: [], muerto: 0, com: null, cambioInv: true, lugarT: 0,
      grupo: null, invitacion: null, ultPos: Date.now(), guardadoT: 0, priv: [],
    };
    p.der = R.derivados(p.d); p.hp = p.der.maxHp; p.mp = p.der.maxMp;
    s.p = p; this.jug.set(p.id, p);
    this.enviar(s, { t: 'bienvenida', id: p.id, datos: p.d, nuevo: !p.d.visto, x: p.x, z: p.z });
    if (!p.d.visto) p.d.visto = true;
    this.msgTodos(`${p.nombre} llegó al ${R.MAPA.nombre}.`);
    if (!this.reloj) { this.reloj = setInterval(() => this.tick(), R.TICK * 1000); }
  }

  salir(s) {
    const p = s.p; if (!p || !this.jug.has(p.id)) return;
    this.cancelarComercio(p, `${p.nombre} se fue.`);
    if (p.enPozo) { p.enPozo = false; this.pozo?.dentro.delete(p.id); p.x = 0; p.z = 0; }
    this.dejarGrupo(p, true);
    this.guardar(p);
    this.jug.delete(p.id);
    for (const m of this.mons.values()) if (m.obj === p.id) m.obj = null;
    this.ev.push(['bye', p.id]);
    s.p = null;
    if (!this.jug.size && this.reloj) { clearInterval(this.reloj); this.reloj = null; }
  }

  guardar(p) {
    p.guardadoT = 0;
    this.cuenta(p.cuenta).guardar(p.nombre, p.d, p.baul).catch(() => {});
    this.cuenta('#ranking').rankingPoner({ nombre: p.nombre, clase: p.d.clase, nivel: p.d.nivel, resets: p.d.resets || 0, exp: p.d.exp }).catch(() => {});
  }

  aviso(p, texto) { p.priv.push(['aviso', texto]); }
  msgTodos(texto) { this.ev.push(['msg', texto]); }

  // ----- acciones del jugador -----
  moverJugador(p, m) {
    if (p.muerto) return;
    let x = +m.x, z = +m.z;
    if (!isFinite(x) || !isFinite(z)) return;
    const ahora = Date.now(), dt = Math.min(1, (ahora - p.ultPos) / 1000);
    const max = R.VEL_JUGADOR * dt * 1.5 + 0.7;
    if (Math.hypot(x - p.x, z - p.z) > max) { p.priv.push(['tp', p.id, r2(p.x), r2(p.z)]); p.ultPos = ahora; return; }
    if (p.enPozo) { const dx = x - R.POZO.x, dz = z - R.POZO.z, d = Math.hypot(dx, dz); if (d > R.POZO.r) { x = R.POZO.x + dx / d * R.POZO.r; z = R.POZO.z + dz / d * R.POZO.r; } }
    else { x = Math.max(-R.MUNDO + 2, Math.min(R.MUNDO - 2, x)); z = Math.max(-R.MUNDO + 2, Math.min(R.MUNDO - 2, z)); }
    p.mueve = Math.hypot(x - p.x, z - p.z) > 0.01;
    p.x = x; p.z = z; p.ultPos = ahora;
    if (isFinite(+m.dir)) p.dir = +m.dir;
  }

  marcar(p, id) {
    const m = this.mons.get(id);
    p.objetivo = m && !m.muerto ? id : null;
  }

  // Suma lo que dan las mejoras temporales (buffs) activas.
  buff(p, k) { let t = 0; for (const b of p.buffs) t += b.ef[k] || 0; return t; }
  cadencia(p) { return p.der.cadencia / (1 + this.buff(p, 'vel') / 100); }

  habilidad(p, id, objId) {
    const h = C.buscarHab(p.d.clase, id), rk = p.d.arbol?.[id];
    if (!h || !rk || h.tipo === 'pasiva' || p.muerto) return;
    if (p.cds[id] > 0) return;
    if (p.mp < h.mp) return this.aviso(p, 'No te alcanza la energía.');
    const objetivo = () => {
      let m = this.mons.get(objId ?? p.objetivo);
      if (!m || m.muerto) { let md = 12; for (const x of this.mons.values()) { if (x.muerto) continue; const d = dist(p, x); if (d < md) { md = d; m = x; } } }
      return m && !m.muerto ? m : null;
    };
    let m = null;
    if (['golpe', 'proyectil', 'lluvia'].includes(h.tipo)) {
      m = objetivo(); if (!m) return this.aviso(p, 'No hay a quién pegarle.');
      const lim = h.tipo === 'golpe' ? (h.salto ? h.salto + 2 : p.der.alcance + m.def.radio + 1.2) : h.tipo === 'lluvia' ? h.alcance + 1 : p.der.alcance + 3;
      if (dist(p, m) > lim) return this.aviso(p, 'Está muy lejos.');
    }
    p.mp -= h.mp; p.cds[id] = h.cd;
    const mult = h.mult ? h.mult(rk) : 1;
    this.ev.push(['a', p.id, h.anim, m?.id ?? null]);
    if (h.tipo === 'area') {
      for (const x of this.mons.values()) if (!x.muerto && dist(p, x) < h.radio + x.def.radio) { this.golpear(p, x, mult, true); if (h.frena) x.frenado = Math.max(x.frenado || 0, h.frena); }
      this.ev.push(['fx', h.frena ? 'hielo' : 'tajo', r2(p.x), r2(p.z), h.radio]);
    } else if (h.tipo === 'golpe') {
      if (h.salto) {
        const d = dist(p, m), k = Math.max(0, d - (p.der.alcance + m.def.radio) * 0.8) / (d || 1);
        p.x += (m.x - p.x) * k; p.z += (m.z - p.z) * k; p.ultPos = Date.now();
        this.ev.push(['tp', p.id, r2(p.x), r2(p.z)]);
      }
      p.dir = Math.atan2(m.x - p.x, m.z - p.z); p.objetivo = m.id;
      this.golpear(p, m, mult, true); if (h.frena) m.frenado = Math.max(m.frenado || 0, h.frena);
    } else if (h.tipo === 'proyectil') {
      this.ev.push(['p', p.id, m.id, h.robo ? 'rojo' : p.der.proyectil || 'saeta', 0]);
      p.objetivo = m.id; this.roboHab = h.robo || 0; this.golpear(p, m, mult, true); this.roboHab = 0;
    } else if (h.tipo === 'invocar') {
      const n = h.n(rk);
      const mios = [...this.siervos.values()].filter(s => s.dueno === p.id).sort((a, b) => a.t - b.t);
      while (mios.length + n > 8) { const s = mios.shift(); this.siervos.delete(s.id); this.ev.push(['bye', s.id]); }
      for (let i = 0; i < n; i++) {
        const a = Math.random() * 6.3, s = { id: this.sigSiervo++, dueno: p.id, x: p.x + Math.cos(a) * 2, z: p.z + Math.sin(a) * 2, dir: 0, t: h.dura, cd: 0, obj: null, mueve: false };
        this.siervos.set(s.id, s); this.ev.push(['a', s.id, 'nace']);
      }
    } else if (h.tipo === 'lluvia') {
      const cx = m.x, cz = m.z;
      this.ev.push(['p', p.id, m.id, p.der.proyectil || 'saeta', h.radio], ['fx', 'lluvia', r2(cx), r2(cz), h.radio]);
      for (const x of this.mons.values()) if (!x.muerto && Math.hypot(x.x - cx, x.z - cz) < h.radio + x.def.radio) this.golpear(p, x, mult, true);
    } else if (h.tipo === 'buff' || h.tipo === 'cura') {
      const quienes = [p];
      const g = h.grupo && p.grupo && this.grupos.get(p.grupo);
      if (g) for (const id2 of g.miembros) { const q = this.jug.get(id2); if (q && q !== p && !q.muerto && dist(p, q) < R.DIST_GRUPO) quienes.push(q); }
      for (const q of quienes) {
        if (h.tipo === 'buff') { q.buffs = q.buffs.filter(b => b.id !== h.id); q.buffs.push({ id: h.id, ef: h.efecto(rk), t: h.dura }); }
        else q.hp = Math.min(q.der.maxHp, q.hp + q.der.maxHp * h.valor(rk) / 100);
        this.ev.push(['fx', h.tipo, r2(q.x), r2(q.z), 1.5]);
        if (q !== p) this.aviso(q, `${p.nombre} usó ${h.nombre} en vos.`);
      }
    }
  }

  // ----- mochila -----
  agregar(p, it) {
    const b = O.BASES[it.b]; if (!b) return false;
    if (b.pila) {
      for (const x of p.d.inv) if (x && x.b === it.b && (x.c || 1) < O.PILA) { const cabe = O.PILA - (x.c || 1), pone = Math.min(cabe, it.c || 1); x.c = (x.c || 1) + pone; it.c = (it.c || 1) - pone; if (it.c <= 0) { p.cambioInv = true; return true; } }
    }
    const i = p.d.inv.indexOf(null); if (i < 0) return false;
    p.d.inv[i] = b.pila ? { b: it.b, c: it.c || 1 } : { b: it.b, n: it.n || 0, ...(it.x ? { x: it.x } : {}) };
    p.cambioInv = true; return true;
  }
  cuantos(p, b) { return p.d.inv.reduce((a, x) => a + (x && x.b === b ? (x.c || 1) : 0), 0); }
  gastar(p, b, n = 1) {
    for (let i = 0; i < p.d.inv.length && n > 0; i++) { const x = p.d.inv[i]; if (!x || x.b !== b) continue; const usa = Math.min(n, x.c || 1); x.c = (x.c || 1) - usa; n -= usa; if (x.c <= 0) p.d.inv[i] = null; }
    p.cambioInv = true; return n === 0;
  }
  bloqueado(p, i) { return p.com && p.com.ofertas[p.id].items.includes(i); }
  recalcular(p) { const antes = p.der; p.der = R.derivados(p.d); p.hp = Math.min(p.der.maxHp, p.hp + Math.max(0, p.der.maxHp - antes.maxHp)); p.mp = Math.min(p.der.maxMp, p.mp); p.cambioInv = true; }

  beber(p, b) {
    if (p.muerto) return;
    if (!this.gastar(p, b, 1)) return this.aviso(p, b === 'pocion' ? 'No te quedan Pociones de Sangre. Comprá en la Atalaya.' : 'No te quedan Pociones de Éter.');
    const base = O.BASES[b];
    if (base.uso === 'cura') p.hp = Math.min(p.der.maxHp, p.hp + p.der.maxHp * base.valor);
    else p.mp = Math.min(p.der.maxMp, p.mp + p.der.maxMp * base.valor);
    this.ev.push(['a', p.id, 'pot']);
  }

  usar(p, i) {
    const it = p.d.inv[i]; if (!it || this.bloqueado(p, i)) return;
    const b = O.BASES[it.b];
    if (b.uso === 'cura' || b.uso === 'mana') return this.beber(p, it.b);
    if (b.r) return this.equipar(p, i);
  }

  equipar(p, i) {
    const it = p.d.inv[i]; if (!it || this.bloqueado(p, i)) return;
    const b = O.BASES[it.b]; if (!b?.r) return;
    const motivo = O.motivoNoPuede(p.d, it); if (motivo) return this.aviso(p, motivo);
    const viejo = p.d.equipo[b.r] || null;
    p.d.equipo[b.r] = it; p.d.inv[i] = viejo;
    this.recalcular(p);
  }

  quitar(p, r) {
    const it = p.d.equipo[r]; if (!it) return;
    const i = p.d.inv.indexOf(null); if (i < 0) return this.aviso(p, 'La mochila está llena.');
    p.d.inv[i] = it; delete p.d.equipo[r];
    this.recalcular(p);
  }

  npcCerca(p, id) { const n = O.NPCS.find(x => x.id === id); return n && Math.hypot(p.x - n.x, p.z - n.z) < O.DIST_NPC + 1.5 ? n : null; }
  rolCerca(p, rol) { return O.NPCS.find(n => n.rol === rol && Math.hypot(p.x - n.x, p.z - n.z) < O.DIST_NPC + 1.5) || null; }

  viajar(p, i) {
    const at = R.PUEBLOS[i];
    if (!at || !p.d.atalayas.includes(i)) return this.aviso(p, 'Todavía no encendiste ese farol.');
    if (p.muerto || !enPueblo(p)) return this.aviso(p, 'Se viaja desde el farol de una atalaya.');
    const a = Math.random() * 6.3; p.x = at.x + Math.cos(a) * 2.5; p.z = at.z + Math.sin(a) * 2.5; p.ultPos = Date.now(); p.objetivo = null;
    this.cancelarComercio(p, 'El comercio se cerró por un viaje.');
    this.ev.push(['tp', p.id, r2(p.x), r2(p.z)], ['fx', 'cura', r2(p.x), r2(p.z), 2]);
    this.aviso(p, `Llegaste a ${at.nombre}.`);
  }

  comprar(p, npcId, b, c) {
    const n = this.npcCerca(p, npcId); if (!n || !n.vende.includes(b)) return this.aviso(p, 'Acercate al vendedor.');
    const base = O.BASES[b]; c = base.pila ? Math.max(1, Math.min(50, c || 1)) : 1;
    const total = base.precio * c;
    if (p.d.oro < total) return this.aviso(p, 'No te alcanza el oro.');
    if (!this.agregar(p, base.pila ? { b, c } : { b, n: 0 })) return this.aviso(p, 'La mochila está llena.');
    p.d.oro -= total; p.cambioInv = true;
    this.aviso(p, `Compraste ${c > 1 ? c + ' × ' : ''}${base.nombre}.`);
  }

  vender(p, i) {
    if (!this.rolCerca(p, 'herrero') && !this.rolCerca(p, 'mercader')) return this.aviso(p, 'Para vender, acercate a un mercader o a un herrero.');
    const it = p.d.inv[i]; if (!it || this.bloqueado(p, i)) return;
    const oro = O.precioVenta(it) * (it.c || 1);
    p.d.inv[i] = null; p.d.oro += oro; p.cambioInv = true;
    this.aviso(p, `Vendiste ${O.nombreObjeto(it)} por ${oro} de oro.`);
  }

  forjar(p, i, r) {
    if (!this.rolCerca(p, 'herrero')) return this.aviso(p, 'Para forjar, acercate a un herrero.');
    const enInv = i != null && i !== '';
    const it = enInv ? p.d.inv[i | 0] : p.d.equipo[String(r)];
    if (!it || !O.esEquipo(it.b) || (enInv && this.bloqueado(p, i | 0))) return;
    const n = it.n || 0, gema = O.FORJA.gemaPara(n);
    if (!gema) return this.aviso(p, 'Ya está en +15. No se puede más.');
    if (!this.cuantos(p, gema)) return this.aviso(p, `Necesitás una ${O.BASES[gema].nombre}.`);
    const oro = O.FORJA.oro(n); if (p.d.oro < oro) return this.aviso(p, `La forja cuesta ${oro} de oro.`);
    this.gastar(p, gema, 1); p.d.oro -= oro;
    let res;
    if (Math.random() < O.FORJA.chance(n)) { it.n = n + 1; res = ['ok', `¡Salió! ${O.nombreObjeto(it)}.`]; }
    else if (n < 9) { it.n = Math.max(0, n - 1); res = ['mal', `Falló. Bajó a +${it.n}.`]; }
    else if (n >= 12 && !this.cuantos(p, 'guardiana')) {
      if (enInv) p.d.inv[i | 0] = null; else delete p.d.equipo[String(r)];
      res = ['roto', `Falló y ${O.BASES[it.b].nombre} se rompió.`];
    } else {
      if (n >= 12) this.gastar(p, 'guardiana', 1);
      it.n = 0; res = ['mal', n >= 12 ? 'Falló. La Piedra Guardiana lo salvó, pero volvió a +0.' : 'Falló. Volvió a +0.'];
    }
    p.priv.push(['forja', res[0], res[1]]);
    if (res[0] === 'ok' && it.n >= 10) this.msgTodos(`${p.nombre} forjó ${O.nombreObjeto(it)}.`);
    this.recalcular(p); this.guardar(p);
  }

  aprender(p, id) {
    const motivo = C.puedeAprender(p.d, id);
    if (motivo) return this.aviso(p, motivo);
    p.d.arbol[id] = (p.d.arbol[id] || 0) + 1;
    this.recalcular(p);
  }

  vela(p, lugar) {
    const l = R.MAPA.lugares.find(x => x.nombre === lugar);
    if (!l || !p.d.lugares.includes(lugar)) return this.aviso(p, 'Todavía no conocés ese lugar.');
    if (p.muerto) return;
    if (!this.gastar(p, 'vela', 1)) return this.aviso(p, 'No tenés Velas de Paso.');
    const a = Math.random() * 6.3; p.x = l.x + Math.cos(a) * 2; p.z = l.z + Math.sin(a) * 2; p.ultPos = Date.now(); p.objetivo = null;
    this.ev.push(['tp', p.id, r2(p.x), r2(p.z)], ['fx', 'cura', r2(p.x), r2(p.z), 2]);
  }

  // ----- chat -----
  chat(p, txt) {
    txt = txt.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 140);
    if (!txt) return;
    const ahora = Date.now();
    if (ahora - (p.ultChat || 0) < 900) return this.aviso(p, 'Más despacio.');
    p.ultChat = ahora;
    if (txt.startsWith('/g ')) {
      const g = p.grupo && this.grupos.get(p.grupo); if (!g) return this.aviso(p, 'No estás en un grupo.');
      for (const id of g.miembros) { const q = this.jug.get(id); if (q) this.enviar(q.s, { t: 'chat', de: p.id, nombre: p.nombre, txt: txt.slice(3), grupo: 1 }); }
      return;
    }
    for (const q of this.jug.values()) this.enviar(q.s, { t: 'chat', de: p.id, nombre: p.nombre, txt });
  }

  // ----- renacer -----
  renacer(p) {
    if (!this.rolCerca(p, 'vidente')) return this.aviso(p, 'Para renacer hablá con Oria la Vidente.');
    const n = p.d.resets || 0, oro = R.RENACER.oro(n);
    if (p.d.nivel < R.RENACER.nivel) return this.aviso(p, `Se renace desde el nivel ${R.RENACER.nivel}.`);
    if (p.d.oro < oro) return this.aviso(p, `Renacer cuesta ${oro.toLocaleString('es-AR')} de oro.`);
    p.d.oro -= oro; p.d.resets = n + 1;
    const base = C.CLASES[p.d.clase].base;
    Object.assign(p.d, { nivel: 1, exp: 0, ...base, puntos: p.d.resets * R.RENACER.puntos, arbol: {} });
    p.d.arbol[C.ARBOL[p.d.clase][0].hab[0].id] = 1;
    this.recalcular(p); p.hp = p.der.maxHp; p.mp = p.der.maxMp;
    this.ev.push(['n', p.id, 1]);
    this.msgTodos(`${p.nombre} renació por ${p.d.resets}ª vez.`);
    this.guardar(p);
  }

  // ----- Pozo de las Almas -----
  entrarPozo(p) {
    if (!this.rolCerca(p, 'vidente')) return this.aviso(p, 'La entrada al Pozo la abre Oria la Vidente.');
    if (this.pozo?.fase !== 'entrada') return this.aviso(p, 'La entrada al Pozo está cerrada. Abre cada hora, en el minuto 45.');
    if (p.d.nivel < R.POZO.nivelMin && !(p.d.resets > 0)) return this.aviso(p, `Hace falta nivel ${R.POZO.nivelMin}.`);
    if (!this.gastar(p, 'sello', 1)) return this.aviso(p, 'Necesitás un Sello del Pozo.');
    const a = Math.random() * 6.3; p.x = R.POZO.x + Math.cos(a) * 4; p.z = R.POZO.z + Math.sin(a) * 4; p.enPozo = true; p.objetivo = null; p.ultPos = Date.now();
    this.pozo.dentro.add(p.id);
    this.ev.push(['tp', p.id, r2(p.x), r2(p.z)]);
    this.aviso(p, 'Bajaste al Pozo. Cuando se cierre la entrada empiezan las oleadas.');
  }

  sacarDelPozo(p) {
    if (!p.enPozo) return;
    p.enPozo = false; this.pozo?.dentro.delete(p.id);
    const a = Math.random() * 6.3; p.x = Math.cos(a) * 3; p.z = Math.sin(a) * 3; p.ultPos = Date.now();
    this.ev.push(['tp', p.id, r2(p.x), r2(p.z)]);
  }

  tickPozo() {
    const P = this.pozo; if (!P) return;
    const dentro = [...P.dentro].map(id => this.jug.get(id)).filter(p => p && p.enPozo);
    if (P.fase === 'entrada' && Date.now() - P.inicio > R.EVENTOS.find(e => e.id === 'pozo').entrada * 60000) {
      if (!dentro.length) { P.fase = 'vacio'; return; }
      P.fase = 'corriendo'; P.oleada = 0; P.espera = 2;
      this.msgPozo('Se cerró la entrada. Que empiece.');
    }
    if (P.fase !== 'corriendo') return;
    if (!dentro.length) { P.fase = 'vacio'; this.limpiarPozo(); return; }
    const vivos = [...this.mons.values()].filter(m => m.pozo && !m.muerto).length;
    if (vivos) return;
    if (P.oleada && !P.pagada) {
      P.pagada = true;
      for (const p of dentro) if (!p.muerto) this.darExp(p, Math.round(R.expParaSubir(p.d.nivel) * 0.02 * P.oleada), null);
      if (P.oleada >= R.POZO.oleadas) {
        this.msgPozo('¡El Pozo quedó vacío! El premio cae al centro.');
        const jefe = R.MONSTRUOS[P.jefe] || R.MONSTRUOS.ratareina;
        for (const p of dentro) this.soltar({ x: R.POZO.x, z: R.POZO.z }, O.tirada(jefe, Math.random, 1.5), 'p' + p.id);
        P.fase = 'fin'; return;
      }
      this.msgPozo(`Oleada ${P.oleada} superada.`);
      P.espera = 4;
    }
    P.espera -= R.TICK; if (P.espera > 0) return;
    P.oleada++; P.pagada = false; this.oleada(P, dentro);
  }

  oleada(P, dentro) {
    const nv = Math.round(dentro.reduce((a, p) => a + p.d.nivel, 0) / dentro.length);
    const comunes = R.TIPOS.filter(t => !R.MONSTRUOS[t].jefe && R.MONSTRUOS[t].nivel <= nv + 2).sort((a, b) => R.MONSTRUOS[b].nivel - R.MONSTRUOS[a].nivel).slice(0, 3);
    if (!comunes.length) comunes.push('rata');
    const k = P.oleada, n = Math.min(20, 3 + k * 2 + dentro.length), mult = 1 + k * 0.15;
    const poner = (tipo, hp, campeon) => {
      const a = Math.random() * 6.3, rr = 9 + Math.random() * 6;
      const m = this.crearMonstruo(tipo, { x: R.POZO.x + Math.cos(a) * rr, z: R.POZO.z + Math.sin(a) * rr }, true);
      m.pozo = true; m.campeon = !!campeon; m.maxHp = m.hp = Math.round(m.def.hp * hp); m.casa = { x: R.POZO.x, z: R.POZO.z };
      m.obj = dentro[Math.floor(Math.random() * dentro.length)].id;
      this.ev.push(['a', m.id, 'nace']);
    };
    for (let i = 0; i < n; i++) poner(comunes[i % comunes.length], mult);
    if (k === 4) poner(comunes[0], mult * 3, true);
    if (k === R.POZO.oleadas) {
      const jefes = R.TIPOS.filter(t => R.MONSTRUOS[t].jefe && !R.MONSTRUOS[t].soloEvento && R.MONSTRUOS[t].nivel <= nv + 5);
      P.jefe = jefes.sort((a, b) => R.MONSTRUOS[b].nivel - R.MONSTRUOS[a].nivel)[0] || 'ratareina';
      poner(P.jefe, 0.4 + 0.15 * dentro.length);
      this.msgPozo(`Última oleada: ${R.MONSTRUOS[P.jefe].nombre}.`);
    } else this.msgPozo(`Oleada ${k} de ${R.POZO.oleadas}.`);
  }

  msgPozo(t) { for (const id of this.pozo?.dentro || []) { const p = this.jug.get(id); if (p) p.priv.push(['msg', t]); } }
  limpiarPozo() { for (const m of [...this.mons.values()]) if (m.pozo) { this.mons.delete(m.id); this.ev.push(['bye', m.id]); } }

  // ----- misiones -----
  progreso(p, m) {
    const ms = p.d.misiones; let cambio = false;
    for (const [id, prog] of Object.entries(ms.activas)) {
      const mi = MI.MISIONES[id], o = mi?.obj; if (!o || o.mon !== m.tipo || MI.completa(mi, prog)) continue;
      if (o.tipo === 'matar') ms.activas[id] = prog + 1;
      else if (o.tipo === 'jefe') ms.activas[id] = 1;
      else if (o.tipo === 'juntar') { if (Math.random() >= o.prob) continue; ms.activas[id] = prog + 1; this.aviso(p, `${o.cosa}: ${prog + 1}/${o.n}`); }
      else continue;
      cambio = true;
      if (MI.completa(mi, ms.activas[id])) this.aviso(p, `Misión lista: «${mi.nombre}». Volvé con ${MI.NPC_MISION.find(n => n.id === mi.npc).nombre}.`);
    }
    for (const e of Object.values(ms.encargos)) {
      if (!e?.tomado || e.mon !== m.tipo || e.prog >= e.n) continue;
      e.prog++; cambio = true;
      if (e.prog >= e.n) this.aviso(p, `Encargo cumplido. Volvé al Tablón de ${R.PUEBLOS[e.atalaya].nombre}.`);
    }
    if (cambio) p.cambioMis = true;
  }

  premiar(p, premio, x, z) {
    if (premio.exp) this.darExp(p, premio.exp, null);
    if (premio.oro) { p.d.oro += premio.oro; p.priv.push(['oro', premio.oro]); }
    const cosas = [...(premio.items || []).map(i => ({ ...i }))];
    if (premio.equipo) cosas.push(O.equipoAlAzar(p.d.nivel, Math.random, premio.equipo.exc || 0, p.d.clase, premio.equipo.leg || 0, premio.equipo.mit || 0));
    for (const it of cosas) {
      if (this.agregar(p, { ...it })) { p.priv.push(['recoge', O.nombreObjeto(it), O.rareza(it)]); if (O.rareza(it) === 3) this.msgTodos(`¡${p.nombre} recibió un objeto MÍTICO: ${O.nombreObjeto(it)}!`); }
      else this.soltar({ x, z }, [{ item: it }], 'p' + p.id);
    }
    p.cambioInv = true; this.guardar(p);
  }

  mision(p, m) {
    const mi = MI.MISIONES[m.id]; if (!mi) return;
    const npc = MI.NPC_MISION.find(n => n.id === mi.npc);
    if (Math.hypot(p.x - npc.x, p.z - npc.z) > 6) return this.aviso(p, `Acercate a ${npc.nombre}.`);
    const ms = p.d.misiones;
    if (m.a === 'aceptar') {
      if (!MI.disponible(p.d, mi)) return;
      if (Object.keys(ms.activas).length >= 8) return this.aviso(p, 'Ya tenés 8 misiones. Terminá alguna primero.');
      ms.activas[mi.id] = 0; this.aviso(p, `Misión aceptada: «${mi.nombre}».`);
    } else if (m.a === 'entregar') {
      const prog = ms.activas[mi.id]; if (prog == null || !MI.completa(mi, prog)) return;
      delete ms.activas[mi.id]; ms.hechas.push(mi.id);
      p.priv.push(['mision', mi.nombre, mi.fin]);
      this.premiar(p, mi.premio, npc.x, npc.z);
    } else if (m.a === 'abandonar') { delete ms.activas[mi.id]; }
    p.cambioMis = true;
  }

  encargo(p, m) {
    const at = m.at | 0, t = this.rolCerca(p, 'tablon');
    if (!t || t.atalaya !== at) return this.aviso(p, 'Acercate al Tablón de Encargos.');
    const ms = p.d.misiones;
    let e = ms.encargos[at];
    if (!e) e = ms.encargos[at] = MI.nuevoEncargo(at, p.d.nivel);
    if (m.a === 'tomar') { e.tomado = true; this.aviso(p, 'Encargo tomado.'); }
    else if (m.a === 'cambiar' && !e.tomado) ms.encargos[at] = MI.nuevoEncargo(at, p.d.nivel);
    else if (m.a === 'entregar' && e.tomado && e.prog >= e.n) {
      const premio = { exp: e.exp, oro: e.oro, items: e.gema ? [{ b: p.d.nivel >= 20 ? 'destino' : 'forja', c: 1 }] : [] };
      ms.encargos[at] = MI.nuevoEncargo(at, p.d.nivel);
      p.priv.push(['mision', 'Encargo cumplido', 'El tablón ya tiene otro pedido clavado.']);
      this.premiar(p, premio, t.x, t.z);
    }
    p.cambioMis = true;
  }

  // ----- baúl de la cuenta (en cada atalaya) -----
  usarBaul(p, m) {
    if (!this.rolCerca(p, 'baul')) return this.aviso(p, 'El baúl está junto al farol de cada atalaya.');
    if (m.a === 'poner') {
      const i = m.i | 0, it = p.d.inv[i]; if (!it || this.bloqueado(p, i)) return;
      const j = p.baul.indexOf(null); if (j < 0) return this.aviso(p, 'El baúl está lleno.');
      p.baul[j] = it; p.d.inv[i] = null;
    } else if (m.a === 'sacar') {
      const j = m.j | 0, it = p.baul[j]; if (!it) return;
      const i = p.d.inv.indexOf(null); if (i < 0) return this.aviso(p, 'La mochila está llena.');
      p.d.inv[i] = it; p.baul[j] = null;
    } else return;
    p.cambioInv = true; this.guardar(p);
  }

  // ----- comercio entre jugadores -----
  comercio(p, m) {
    const T = p.com;
    if (m.a === 'pedir') {
      const q = this.jug.get(m.id); if (!q || q === p) return;
      if (dist(p, q) > 10) return this.aviso(p, 'Acercate para comerciar.');
      if (q.com || p.com) return this.aviso(p, 'Ya hay un comercio abierto.');
      q.pedidoCom = { de: p.id, t: Date.now() };
      this.enviar(q.s, { t: 'compide', de: p.id, nombre: p.nombre });
      return this.aviso(p, `Le ofreciste comerciar a ${q.nombre}.`);
    }
    if (m.a === 'acepta') {
      const q = this.jug.get(m.de);
      if (!q || p.pedidoCom?.de !== q.id || Date.now() - p.pedidoCom.t > 60_000 || q.com || p.com) return this.aviso(p, 'El pedido ya no vale.');
      p.pedidoCom = null;
      const N = { a: q.id, b: p.id, ofertas: { [q.id]: { items: [], oro: 0 }, [p.id]: { items: [], oro: 0 } }, listo: {}, conf: {} };
      p.com = q.com = N; return this.mandarComercio(N);
    }
    if (!T) return;
    const otro = this.jug.get(T.a === p.id ? T.b : T.a);
    if (m.a === 'cancelar') return this.cancelarComercio(p, `${p.nombre} cerró el comercio.`);
    const mia = T.ofertas[p.id];
    if (m.a === 'poner') { const i = m.i | 0; const it = p.d.inv[i]; if (!it || mia.items.includes(i) || mia.items.length >= 8) return; mia.items.push(i); }
    else if (m.a === 'sacar') mia.items = mia.items.filter(x => x !== (m.i | 0));
    else if (m.a === 'oro') mia.oro = Math.max(0, Math.min(p.d.oro, m.n | 0));
    else if (m.a === 'listo') { T.listo[p.id] = true; return this.mandarComercio(T); }
    else if (m.a === 'confirmar') {
      if (!T.listo[T.a] || !T.listo[T.b]) return;
      T.conf[p.id] = true;
      if (T.conf[T.a] && T.conf[T.b]) return this.cerrarComercio(T);
      return this.mandarComercio(T);
    } else return;
    T.listo = {}; T.conf = {};   // si algo cambió, los dos vuelven a confirmar
    this.mandarComercio(T);
  }

  mandarComercio(T) {
    for (const id of [T.a, T.b]) {
      const p = this.jug.get(id), oId = id === T.a ? T.b : T.a, q = this.jug.get(oId); if (!p || !q) continue;
      const ver = (x, of) => ({ items: of.items.map(i => ({ i, it: x.d.inv[i] })).filter(o => o.it), oro: of.oro });
      this.enviar(p.s, { t: 'com', otro: q.nombre, mio: ver(p, T.ofertas[id]), suyo: ver(q, T.ofertas[oId]), listo: [!!T.listo[id], !!T.listo[oId]], conf: [!!T.conf[id], !!T.conf[oId]] });
    }
  }

  cancelarComercio(p, motivo) {
    const T = p.com; if (!T) return;
    for (const id of [T.a, T.b]) { const x = this.jug.get(id); if (x) { x.com = null; this.enviar(x.s, { t: 'com', fin: true }); this.aviso(x, motivo); } }
  }

  cerrarComercio(T) {
    const a = this.jug.get(T.a), b = this.jug.get(T.b);
    if (!a || !b) return;
    const sacar = (x, of) => of.items.map(i => x.d.inv[i]).filter(Boolean);
    const ia = sacar(a, T.ofertas[a.id]), ib = sacar(b, T.ofertas[b.id]);
    const libres = x => x.d.inv.filter(v => v === null).length;
    if (libres(a) + ia.length < ib.length || libres(b) + ib.length < ia.length) { this.cancelarComercio(a, 'No hay lugar en la mochila para el cambio.'); return; }
    if (a.d.oro < T.ofertas[a.id].oro || b.d.oro < T.ofertas[b.id].oro) { this.cancelarComercio(a, 'Alguien no tiene el oro que ofreció.'); return; }
    for (const i of T.ofertas[a.id].items) a.d.inv[i] = null;
    for (const i of T.ofertas[b.id].items) b.d.inv[i] = null;
    for (const it of ib) a.d.inv[a.d.inv.indexOf(null)] = it;
    for (const it of ia) b.d.inv[b.d.inv.indexOf(null)] = it;
    a.d.oro += T.ofertas[b.id].oro - T.ofertas[a.id].oro; b.d.oro += T.ofertas[a.id].oro - T.ofertas[b.id].oro;
    a.cambioInv = b.cambioInv = true; a.com = b.com = null;
    for (const x of [a, b]) { this.enviar(x.s, { t: 'com', fin: true }); this.aviso(x, 'Comercio hecho.'); this.guardar(x); }
  }

  // ----- objetos en el piso -----
  soltar(m, cosas, bando) {
    for (const c of cosas) {
      const a = Math.random() * 6.3, r = 0.4 + Math.random() * 1.4;
      const d = { id: this.sigDrop++, x: m.x + Math.cos(a) * r, z: m.z + Math.sin(a) * r, oro: c.oro || 0, item: c.item || null, dueno: bando, t: 0 };
      this.drops.set(d.id, d);
    }
  }

  recoger(p) {
    for (const d of this.drops.values()) {
      if (Math.hypot(d.x - p.x, d.z - p.z) > 1.5) continue;
      const mio = !d.dueno || d.t > 15 || d.dueno === 'p' + p.id || d.dueno === 'g' + p.grupo;
      if (!mio) continue;
      if (d.oro) { p.d.oro += d.oro; p.cambioInv = true; p.priv.push(['oro', d.oro]); this.drops.delete(d.id); continue; }
      if (this.agregar(p, { ...d.item })) {
        this.drops.delete(d.id); p.priv.push(['recoge', O.nombreObjeto(d.item), O.rareza(d.item)]);
        const ra = O.rareza(d.item);
        if (ra === 3) this.msgTodos(`¡${p.nombre} encontró un objeto MÍTICO: ${O.nombreObjeto(d.item)}!`);
        else if (ra === 2) this.msgTodos(`${p.nombre} encontró ${O.nombreObjeto(d.item)}.`);
        else if (ra === 1) this.msgCerca(p, `${p.nombre} encontró ${O.nombreObjeto(d.item)}.`);
      } else if (!p.avisoLleno || this.t - p.avisoLleno > 5) { p.avisoLleno = this.t; this.aviso(p, 'La mochila está llena.'); }
    }
  }

  repartir(p, stat, n) {
    if (!R.STATS.includes(stat) || n < 1) return;
    n = Math.min(n, p.d.puntos); if (!n) return;
    p.d.puntos -= n; p.d[stat] += n;
    this.recalcular(p);
    this.guardar(p);
  }

  // ----- grupo -----
  invitar(p, id) {
    const q = this.jug.get(id);
    if (!q || q === p) return;
    const g = p.grupo && this.grupos.get(p.grupo);
    if (g && g.miembros.includes(q.id)) return;
    if (q.grupo) return this.aviso(p, `${q.nombre} ya está en otro grupo.`);
    if (g && g.miembros.length >= R.MAX_GRUPO) return this.aviso(p, 'El grupo está completo (5).');
    q.invitacion = { de: p.id, t: Date.now() };
    this.enviar(q.s, { t: 'inv', de: p.id, nombre: p.nombre, nivel: p.d.nivel });
    this.aviso(p, `Invitaste a ${q.nombre}.`);
  }

  aceptar(q, de) {
    const p = this.jug.get(de);
    if (!p || !q.invitacion || q.invitacion.de !== de || Date.now() - q.invitacion.t > 60_000) return this.aviso(q, 'La invitación ya no vale.');
    q.invitacion = null;
    if (q.grupo) this.dejarGrupo(q, true);
    let g = p.grupo && this.grupos.get(p.grupo);
    if (!g) { g = { id: this.sigGrupo++, lider: p.id, miembros: [p.id] }; this.grupos.set(g.id, g); p.grupo = g.id; }
    if (g.miembros.length >= R.MAX_GRUPO) return this.aviso(q, 'El grupo está completo.');
    g.miembros.push(q.id); q.grupo = g.id;
    for (const id of g.miembros) { const x = this.jug.get(id); if (x) this.aviso(x, `${q.nombre} se unió al grupo.`); }
  }

  dejarGrupo(p, callado) {
    const g = p.grupo && this.grupos.get(p.grupo);
    p.grupo = null;
    if (!g) return;
    g.miembros = g.miembros.filter(id => id !== p.id);
    if (!callado) this.aviso(p, 'Saliste del grupo.');
    for (const id of g.miembros) { const x = this.jug.get(id); if (x) this.aviso(x, `${p.nombre} salió del grupo.`); }
    if (g.miembros.length < 2) {
      for (const id of g.miembros) { const x = this.jug.get(id); if (x) x.grupo = null; }
      this.grupos.delete(g.id);
    } else if (g.lider === p.id) g.lider = g.miembros[0];
  }

  // ----- combate -----
  golpear(p, m, mult, hab) {
    if (m.muerto) return;
    let tipo = hab ? R.GOLPE.HABILIDAD : R.GOLPE.NORMAL, f = mult * (1 + this.buff(p, 'dmgPct') / 100);
    const r = Math.random() * 100;
    if (r < p.der.exc) { tipo = R.GOLPE.EXCELENTE; f *= 2; } else if (r < p.der.exc + p.der.crit) { tipo = hab ? tipo : R.GOLPE.CRITICO; f *= 1.5; }
    const dano = Math.max(1, Math.round(entre(p.der.dmin, p.der.dmax) * f - m.def.def * 0.5));
    m.hp -= dano;
    const bando = p.grupo ? 'g' + p.grupo : 'p' + p.id;
    m.danos.set(bando, (m.danos.get(bando) || 0) + dano);
    if (!m.obj || !m.def.jefe) m.obj = p.id;
    if (!m.def.jefe) m.frenado = 0.25;
    this.ev.push(['g', p.id, m.id, dano, tipo]);
    const robo = (p.der.robo || 0) + this.buff(p, 'robo') + (this.roboHab || 0);
    if (robo) p.hp = Math.min(p.der.maxHp, p.hp + dano * robo / 100);
    if (m.hp <= 0) {
      if (p.der.vidaKill) p.hp = Math.min(p.der.maxHp, p.hp + p.der.maxHp * p.der.vidaKill / 100);
      if (p.der.manaKill) p.mp = Math.min(p.der.maxMp, p.mp + p.der.maxMp * p.der.manaKill / 100);
      this.matar(m, bando);
    }
  }

  matar(m, bandoFinal) {
    let mayor = bandoFinal, md = -1; for (const [b, v] of m.danos) if (v > md) { md = v; mayor = b; }
    if (!m.temporal) this.soltar(m, O.tirada(m.def, Math.random, m.campeon ? 2.2 : 1), mayor);
    m.muerto = true; m.hp = 0; m.obj = null; m.muertoT = 0; m.carga = null;
    const marea = this.evento?.id === 'marea';
    m.reaparece = m.def.reaparece * (marea ? 0.4 : 1);
    this.ev.push(['m', m.id]);
    if (m.def.jefe) this.msgTodos(m.def.soloEvento ? `¡Cayó el ${m.def.nombre}! La Noche Roja pierde fuerza.` : `¡Cayó ${m.def.nombre}! Vuelve en ${Math.round(m.def.reaparece / 60)} minutos.`);
    else if (m.campeon) this.msgCerca(m, `Cayó un campeón: ${m.def.nombre}.`);
    let total = 0; for (const v of m.danos.values()) total += v;
    const base = m.def.exp * (m.campeon ? R.CAMPEON.exp : 1) * (m.temporal && !m.pozo ? 0.3 : 1) * (m.pozo ? 1.5 : 1) * (this.evento?.exp || 1);
    for (const [bando, d] of m.danos) {
      const parte = base * d / total;
      if (bando[0] === 'p') { const p = this.jug.get(+bando.slice(1)); if (p && !p.muerto) this.darExp(p, parte, m); continue; }
      const g = this.grupos.get(+bando.slice(1)); if (!g) continue;
      const cerca = g.miembros.map(id => this.jug.get(id)).filter(p => p && !p.muerto && dist(p, m) < R.DIST_GRUPO);
      if (!cerca.length) continue;
      const bonus = 1 + R.BONUS_GRUPO * (cerca.length - 1);
      for (const p of cerca) this.darExp(p, parte * bonus / cerca.length, m);
    }
    m.danos.clear();
  }

  darExp(p, cant, m) {
    if (m) {
      this.progreso(p, m);
      const dif = p.d.nivel - m.def.nivel;
      if (dif > 10) cant *= Math.max(0.2, 1 - (dif - 10) * 0.08);
    }
    cant = Math.max(1, Math.round(cant));
    p.d.exp += cant; p.priv.push(['x', cant]);
    let subio = false;
    while (p.d.nivel < R.NIVEL_MAX && p.d.exp >= R.expParaSubir(p.d.nivel)) {
      p.d.exp -= R.expParaSubir(p.d.nivel); p.d.nivel++; p.d.puntos += R.PUNTOS_POR_NIVEL; subio = true;
    }
    if (subio) {
      p.der = R.derivados(p.d); p.hp = p.der.maxHp; p.mp = p.der.maxMp;
      this.ev.push(['n', p.id, p.d.nivel]);
      this.guardar(p);
    }
  }

  danoDe(m, rango) {
    return entre(rango[0], rango[1]) * (m.campeon ? R.CAMPEON.dano : 1) * (this.evento?.id === 'noche' ? 1.3 : 1) * (m.furioso ? 1.15 : 1);
  }

  herirJugador(p, dano, m, tipo = 4) {
    if (p.muerto) return;
    dano = tipo === 5 ? Math.round(dano) : Math.max(1, Math.round(dano - p.der.def * 0.5));
    const menos = Math.min(75, p.der.menos + this.buff(p, 'menos'));
    if (menos) dano = Math.max(1, Math.round(dano * (1 - menos / 100)));
    if (m && p.der.refleja && !m.muerto) { m.hp -= Math.round(dano * p.der.refleja / 100); if (m.hp <= 0) this.matar(m, 'p' + p.id); }
    p.hp -= dano;
    this.ev.push(['g', m?.id || 0, p.id, dano, tipo]);
    if (m && tipo === 4 && m.def.veneno && Math.random() < m.def.veneno.prob) { p.veneno = { dps: m.def.veneno.dps, t: m.def.veneno.dura }; this.aviso(p, 'Estás envenenado.'); }
    if (p.hp <= 0) {
      p.hp = 0; p.muerto = 5; p.objetivo = null; p.mueve = false; p.veneno = null;
      this.ev.push(['m', p.id]);
      this.aviso(p, `Te venció ${m ? m.def.nombre : 'el veneno'}. Despertás junto al Farol en 5 segundos.`);
      for (const x of this.mons.values()) if (x.obj === p.id) x.obj = null;
    }
  }

  msgCerca(m, texto) { for (const p of this.jug.values()) if (dist(p, m) < VISTA) this.aviso(p, texto); }

  // ----- monstruos -----
  lugarLibre(def) {
    const z = def.zona;
    for (let i = 0; i < 30; i++) {
      let x, y;
      if (z.rmax) { const a = Math.random() * Math.PI * 2, r = entre(z.rmin, z.rmax); x = z.x + Math.cos(a) * r; y = z.z + Math.sin(a) * r; }
      else { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * z.r; x = z.x + Math.cos(a) * r; y = z.z + Math.sin(a) * r; }
      if (R.PUEBLOS.every(at => Math.hypot(x - at.x, y - at.z) > at.r + 3) && Math.abs(x) < R.MUNDO - 6 && Math.abs(y) < R.MUNDO - 6) return { x, z: y };
    }
    return { x: z.x, z: z.z };
  }

  crearMonstruo(tipo, donde, temporal) {
    const def = R.MONSTRUOS[tipo];
    const m = { id: this.sigMon++, tipo, ti: R.TIPOS.indexOf(tipo), def, temporal: !!temporal, danos: new Map(), timers: {} };
    this.mons.set(m.id, m);
    this.ponerVivo(m, donde);
    return m;
  }

  ponerVivo(m, donde) {
    const def = m.def, l = donde || this.lugarLibre(def);
    const noche = this.evento?.id === 'noche';
    m.campeon = !def.jefe && !m.temporal && Math.random() < (noche ? R.CAMPEON.probNoche : R.CAMPEON.prob);
    m.maxHp = def.hp * (m.campeon ? R.CAMPEON.hp : 1);
    Object.assign(m, { casa: { x: l.x, z: l.z }, x: l.x, z: l.z, dir: Math.random() * 6, hp: m.maxHp, muerto: false, reaparece: 0, obj: null, cd: 0, paseo: 0,
      destino: null, volviendo: false, mueve: false, frenado: 0, furioso: false, carga: null, muertoT: 0 });
    m.danos.clear();
    for (const h of def.habs || []) m.timers[h.t] = h.cada * (0.5 + Math.random() * 0.5);
  }

  revivirMonstruo(m) {
    this.ponerVivo(m);
    this.ev.push(['a', m.id, 'nace']);
    if (m.def.jefe) this.msgTodos(`${m.def.nombre} despertó en ${this.lugarDe(m)}. Hace falta un grupo.`);
  }

  lugarDe(m) {
    let mejor = R.MAPA.lugares[0], md = 1e9;
    for (const l of R.MAPA.lugares) { const d = Math.hypot(l.x - m.x, l.z - m.z); if (d < md) { md = d; mejor = l; } }
    return mejor.nombre;
  }

  caminar(m, x, z, vel, dt) {
    const dx = x - m.x, dz = z - m.z, d = Math.hypot(dx, dz);
    if (d < 0.05) return true;
    const paso = Math.min(d, vel * dt);
    m.x += dx / d * paso; m.z += dz / d * paso; m.dir = Math.atan2(dx, dz); m.mueve = true;
    return paso >= d;
  }

  usarHabilidades(m, p, dt) {
    const def = m.def;
    for (const h of def.habs || []) {
      m.timers[h.t] -= dt * (m.furioso ? 1.4 : 1);
      if (m.timers[h.t] > 0) continue;
      if (h.t === 'pisoton') {
        if (dist(m, p) > h.radio + 1) continue;
        m.timers[h.t] = h.cada;
        this.ev.push(['a', m.id, 'pisoton']);
        for (const q of this.jug.values()) if (dist(q, m) < h.radio) this.herirJugador(q, this.danoDe(m, h.dano), m);
      } else if (h.t === 'rayo') {
        if (dist(m, p) > h.alcance) continue;
        m.timers[h.t] = h.cada;
        m.dir = Math.atan2(p.x - m.x, p.z - m.z);
        this.ev.push(['a', m.id, 'lanza'], ['p', m.id, p.id, h.color || 'violeta', h.radio || 0]);
        if (h.radio) { for (const q of this.jug.values()) if (dist(q, p) < h.radio) this.herirJugador(q, this.danoDe(m, h.dano), m); }
        else this.herirJugador(p, this.danoDe(m, h.dano), m);
      } else if (h.t === 'carga') {
        const d = dist(m, p);
        if (d < 3 || d > h.alcance) continue;
        m.timers[h.t] = h.cada;
        m.carga = { obj: p.id, t: 1.2, dano: h.dano };
        this.ev.push(['a', m.id, 'carga']);
      } else if (h.t === 'invocar') {
        m.timers[h.t] = h.cada;
        const vivos = [...this.mons.values()].filter(x => x.temporal && x.dueno === m.id && !x.muerto).length;
        const n = Math.min(h.n, h.max - vivos);
        if (n <= 0) continue;
        this.ev.push(['a', m.id, 'invoca']);
        for (let i = 0; i < n; i++) {
          const a = Math.random() * 6.3, x = this.crearMonstruo(h.cual, { x: m.x + Math.cos(a) * 2.5, z: m.z + Math.sin(a) * 2.5 }, true);
          x.dueno = m.id; x.obj = p.id; x.casa = { x: m.x, z: m.z };
          this.ev.push(['a', x.id, 'nace']);
        }
      }
    }
  }

  tickMonstruo(m, dt) {
    m.mueve = false;
    if (m.muerto) {
      m.muertoT += dt;
      if (m.temporal || m.def.soloEvento) { if (m.muertoT > 3) this.mons.delete(m.id); return; }
      m.reaparece -= dt; if (m.reaparece <= 0) this.revivirMonstruo(m);
      return;
    }
    m.cd -= dt;
    const def = m.def;
    if (def.furia && !m.furioso && m.hp < m.maxHp * def.furia) { m.furioso = true; this.ev.push(['a', m.id, 'furia']); if (def.jefe) this.msgCerca(m, `${def.nombre} entra en furia.`); }
    if (m.frenado > 0) { m.frenado -= dt; return; }
    let p = m.obj ? this.jug.get(m.obj) : null;
    if (p && (p.muerto || enPueblo(p))) { p = null; m.obj = null; }
    if (!p && def.agresivo && !m.volviendo) {
      let mejor = def.vista;
      for (const q of this.jug.values()) { if (q.muerto || enPueblo(q)) continue; const d = dist(q, m); if (d < mejor) { mejor = d; p = q; } }
      if (p) m.obj = p.id;
    }
    const correa = def.jefe ? 24 : m.temporal ? 30 : 18;
    if (m.pozo && !p) { let md = 1e9; for (const q of this.jug.values()) { if (!q.enPozo || q.muerto) continue; const d = dist(q, m); if (d < md) { md = d; p = q; } } if (p) m.obj = p.id; }
    if (!def.soloEvento && !m.pozo && dist(m, m.casa) > correa) { m.obj = null; p = null; m.volviendo = true; m.carga = null; }
    if (m.volviendo) {
      if (this.caminar(m, m.casa.x, m.casa.z, def.vel * 1.4, dt)) { m.volviendo = false; m.hp = m.maxHp; m.furioso = false; m.danos.clear(); }
      return;
    }
    if (m.carga) {
      const q = this.jug.get(m.carga.obj);
      m.carga.t -= dt;
      if (!q || q.muerto || m.carga.t <= 0) { m.carga = null; }
      else if (this.caminar(m, q.x, q.z, def.vel * 3.2, dt) || dist(m, q) < def.alcance) {
        this.herirJugador(q, this.danoDe(m, m.carga.dano), m); m.carga = null; m.cd = def.cadencia;
      }
      return;
    }
    if (p) {
      const d = dist(m, p);
      const cadencia = def.cadencia * (m.furioso ? 0.65 : 1), vel = def.vel * (m.furioso ? 1.25 : 1);
      if (d > def.alcance + 0.4) this.caminar(m, p.x, p.z, vel, dt);
      else {
        m.dir = Math.atan2(p.x - m.x, p.z - m.z);
        if (m.cd <= 0) {
          m.cd = cadencia;
          if (def.distancia) this.ev.push(['a', m.id, 'lanza'], ['p', m.id, p.id, def.distancia, 0]);
          else this.ev.push(['a', m.id, 'atk', p.id]);
          this.herirJugador(p, this.danoDe(m, def.dano), m);
        }
      }
      if (this.jug.has(p.id)) this.usarHabilidades(m, p, dt);
      return;
    }
    // Pasea cerca de su casa.
    m.paseo -= dt;
    if (m.paseo <= 0) { m.paseo = entre(3, 8); const a = Math.random() * 6.3, r = Math.random() * 4; m.destino = { x: m.casa.x + Math.cos(a) * r, z: m.casa.z + Math.sin(a) * r }; }
    if (m.destino && this.caminar(m, m.destino.x, m.destino.z, def.vel * 0.35, dt)) m.destino = null;
  }

  // ----- eventos con horario -----
  revisarEventos() {
    const { activo, proximo } = R.estadoEventos(Date.now());
    this.proximo = proximo;
    const antes = this.evento?.id || null, ahora = activo?.id || null;
    this.evento = activo;
    if (antes === ahora) return;
    if (antes === 'noche') {
      for (const m of this.mons.values()) if (m.def.soloEvento && !m.muerto) { this.mons.delete(m.id); this.ev.push(['bye', m.id]); this.msgTodos('El Heraldo del Éter se retira. Volverá con la próxima Noche Roja.'); }
    }
    if (antes === 'pozo') {
      this.msgPozo('El Pozo se cierra. Volvés a la Atalaya.');
      for (const id of this.pozo?.dentro || []) { const p = this.jug.get(id); if (p) this.sacarDelPozo(p); }
      this.limpiarPozo(); this.pozo = null;
    }
    if (activo?.id === 'pozo') this.pozo = { fase: 'entrada', inicio: Date.now() - (activo.dura * 60 - activo.resta) * 1000, dentro: new Set() };
    if (activo) {
      this.msgTodos(`${activo.nombre}: ${activo.desc}`);
      if (activo.id === 'noche') {
        const l = R.MAPA.lugares[1 + Math.floor(Math.random() * (R.MAPA.lugares.length - 1))];
        const h = this.crearMonstruo('heraldo', { x: l.x, z: l.z });
        this.ev.push(['a', h.id, 'nace']);
        this.msgTodos(`El Heraldo del Éter apareció en ${l.nombre}.`);
      }
    } else if (antes) this.msgTodos('El evento terminó.');
  }

  // ----- reloj del mapa -----
  tick() {
    const dt = R.TICK; this.t += dt;
    if (!this.evT || this.t - this.evT > 1) { this.evT = this.t; this.revisarEventos(); }
    this.tickPozo();
    for (const p of this.jug.values()) {
      if (p.muerto) {
        p.muerto -= dt;
        if (p.muerto <= 0) {
          p.muerto = 0; p.hp = p.der.maxHp; p.mp = p.der.maxMp;
          if (p.enPozo) { p.enPozo = false; this.pozo?.dentro.delete(p.id); p.x = 0; p.z = 0; }
          const at = R.PUEBLOS[R.atalayaCercana(p.x, p.z, p.d.atalayas)], a = Math.random() * 6.3;
          p.x = at.x + Math.cos(a) * 3; p.z = at.z + Math.sin(a) * 3; p.ultPos = Date.now();
          this.ev.push(['rv', p.id, r2(p.x), r2(p.z)]);
        }
        continue;
      }
      for (const k in p.cds) { p.cds[k] -= dt; if (p.cds[k] <= 0) delete p.cds[k]; }
      if (p.buffs.length) { for (const b of p.buffs) b.t -= dt; p.buffs = p.buffs.filter(b => b.t > 0); }
      this.recoger(p);
      p.lugarT += dt;
      if (p.lugarT > 1) {
        p.lugarT = 0;
        R.PUEBLOS.forEach((at, i) => { if (!p.d.atalayas.includes(i) && Math.hypot(at.x - p.x, at.z - p.z) < at.r + 3) { p.d.atalayas.push(i); this.aviso(p, `Encendiste el farol de ${at.nombre}. Ya podés viajar acá desde cualquier atalaya.`); p.cambioInv = true; this.guardar(p); } });
        for (const [id, prog] of Object.entries(p.d.misiones.activas)) {
          const o = MI.MISIONES[id]?.obj; if (o?.tipo !== 'visitar' || prog) continue;
          const l = R.MAPA.lugares.find(x => x.nombre === o.lugar);
          if (l && Math.hypot(l.x - p.x, l.z - p.z) < 14) { p.d.misiones.activas[id] = 1; p.cambioMis = true; this.aviso(p, `Misión lista: «${MI.MISIONES[id].nombre}».`); }
        }
        for (const l of R.MAPA.lugares) if (!p.d.lugares.includes(l.nombre) && Math.hypot(l.x - p.x, l.z - p.z) < 14) { p.d.lugares.push(l.nombre); this.aviso(p, `Descubriste ${l.nombre}. Ya podés volver con una Vela de Paso.`); p.cambioInv = true; }
        if (p.com) { const o = this.jug.get(p.com.a === p.id ? p.com.b : p.com.a); if (!o || dist(o, p) > 14) this.cancelarComercio(p, 'Se alejaron demasiado: el comercio se cerró.'); }
      }
      if (p.veneno) {
        p.veneno.t -= dt; p.venT = (p.venT || 0) + dt;
        if (p.venT >= 1) { p.venT = 0; this.herirJugador(p, p.veneno.dps, null, 5); }
        if (p.veneno && p.veneno.t <= 0) p.veneno = null;
        if (p.muerto) continue;
      }
      p.hp = Math.min(p.der.maxHp, p.hp + p.der.maxHp * (enPueblo(p) ? 0.04 : 0.005) * dt);
      p.mp = Math.min(p.der.maxMp, p.mp + (enPueblo(p) ? 6 : p.der.regenMp) * dt);
      p.cdAtk -= dt;
      if (p.objetivo) {
        const m = this.mons.get(p.objetivo);
        if (!m || m.muerto) p.objetivo = null;
        else if (dist(p, m) <= p.der.alcance + m.def.radio * (m.campeon ? R.CAMPEON.escala : 1) + 0.6 && p.cdAtk <= 0) {
          p.cdAtk = this.cadencia(p); p.dir = Math.atan2(m.x - p.x, m.z - p.z);
          this.ev.push(['a', p.id, 'atk', m.id]);
          if (p.der.distancia) this.ev.push(['p', p.id, m.id, p.der.proyectil, 0]);
          this.golpear(p, m, 1, false);
        }
      }
      p.guardadoT += dt; if (p.guardadoT > GUARDAR_CADA) this.guardar(p);
    }
    for (const d of this.drops.values()) { d.t += dt; if (d.t > 90) this.drops.delete(d.id); }
    for (const s of this.siervos.values()) this.tickSiervo(s, dt);
    const mons = [...this.mons.values()];
    for (const m of mons) this.tickMonstruo(m, dt);
    // Que no se encimen.
    for (let i = 0; i < mons.length; i++) {
      const a = mons[i]; if (a.muerto) continue;
      for (const n of MI.NPC_MISION) { const dx = a.x - n.x, dz = a.z - n.z, d = Math.hypot(dx, dz); if (d < 3) { const k = 3 / (d || 1); a.x = n.x + dx * k; a.z = n.z + dz * k; } }
      if (a.pozo) continue;
      for (const at of R.PUEBLOS) { const dx = a.x - at.x, dz = a.z - at.z, d = Math.hypot(dx, dz); if (d < at.r + 1) { const k = (at.r + 1) / (d || 1); a.x = at.x + dx * k; a.z = at.z + dz * k; } }
      for (let j = i + 1; j < mons.length; j++) {
        const b = mons[j]; if (b.muerto) continue;
        const min = a.def.radio + b.def.radio, dx = b.x - a.x, dz = b.z - a.z;
        if (Math.abs(dx) > min || Math.abs(dz) > min) continue;
        const d = Math.hypot(dx, dz);
        if (d < min && d > 0.001) { const k = (min - d) / d * 0.5; a.x -= dx * k; a.z -= dz * k; b.x += dx * k; b.z += dz * k; }
      }
    }
    this.enviarFotos();
  }

  // Siervos del Nigromante: no se los puede lastimar, duran un rato y pelean por su dueño.
  tickSiervo(s, dt) {
    const p = this.jug.get(s.dueno);
    s.t -= dt; s.cd -= dt; s.mueve = false;
    if (!p || p.muerto || s.t <= 0) { this.siervos.delete(s.id); this.ev.push(['m', s.id]); return; }
    let m = s.obj && this.mons.get(s.obj);
    if (!m || m.muerto || dist(m, p) > 14) {
      m = null; let md = 10;
      for (const x of this.mons.values()) { if (x.muerto) continue; const d = dist(x, p); if (d < md) { md = d; m = x; } }
      s.obj = m?.id || null;
    }
    const ir = (x, z, vel) => { const dx = x - s.x, dz = z - s.z, d = Math.hypot(dx, dz); if (d < 0.05) return; const k = Math.min(d, vel * dt) / d; s.x += dx * k; s.z += dz * k; s.dir = Math.atan2(dx, dz); s.mueve = true; };
    if (m) {
      if (dist(s, m) > 1.5 + m.def.radio) ir(m.x, m.z, 4.5);
      else if (s.cd <= 0) {
        s.cd = 1.1; s.dir = Math.atan2(m.x - s.x, m.z - s.z);
        const dano = Math.max(1, Math.round(entre(p.der.dmin, p.der.dmax) * 0.45 * (1 + (p.der.siervos || 0) / 100) - m.def.def * 0.5));
        m.hp -= dano; m.danos.set(p.grupo ? 'g' + p.grupo : 'p' + p.id, (m.danos.get(p.grupo ? 'g' + p.grupo : 'p' + p.id) || 0) + dano);
        if (!m.obj) m.obj = p.id;
        this.ev.push(['a', s.id, 'atk', m.id], ['g', s.id, m.id, dano, 0]);
        if (m.hp <= 0) this.matar(m, 'p' + p.id);
      }
    } else if (dist(s, p) > 3) ir(p.x, p.z, 5.5);
  }

  enviarFotos() {
    const ev = this.ev; this.ev = [];
    const filaJ = q => [q.id, q.nombre, r2(q.x), r2(q.z), r2(q.dir), Math.round(q.hp / q.der.maxHp * 100), q.d.nivel, q.muerto ? 4 : q.mueve ? 1 : 0, q.grupo || 0, (q.buffs.some(b => b.ef.menos) ? 1 : 0) | (q.veneno ? 2 : 0) | (q.buffs.some(b => b.ef.dmgPct || b.ef.vel) ? 4 : 0), q.d.clase, brillo(q)];
    const filaM = m => [m.id, m.ti, r2(m.x), r2(m.z), r2(m.dir), Math.round(Math.max(0, m.hp) / m.maxHp * 100), m.muerto ? 4 : m.mueve ? 1 : 0, (m.campeon ? 1 : 0) | (m.furioso ? 2 : 0) | (m.temporal ? 4 : 0)];
    const evt = this.evento ? [this.evento.id, Math.round(this.evento.resta)] : this.proximo ? ['-' + this.proximo.id, Math.round(this.proximo.en)] : null;
    for (const p of this.jug.values()) {
      const j = [], m = [], dr = [];
      for (const d of this.drops.values()) if (Math.hypot(d.x - p.x, d.z - p.z) < VISTA) dr.push([d.id, r2(d.x), r2(d.z), d.oro ? 'oro' : d.item.b, d.oro || d.item.n || d.item.c || 0, d.item ? O.rareza(d.item) : 0]);
      for (const q of this.jug.values()) if (q === p || dist(q, p) < VISTA) j.push(filaJ(q));
      for (const x of this.mons.values()) if (dist(x, p) < VISTA) m.push(filaM(x));
      const g = p.grupo && this.grupos.get(p.grupo);
      const yo = {
        hp: Math.round(p.hp), mp: Math.round(p.mp), maxHp: p.der.maxHp, maxMp: p.der.maxMp, nivel: p.d.nivel, exp: p.d.exp, sig: R.expParaSubir(p.d.nivel),
        puntos: p.d.puntos, fue: p.d.fue, agi: p.d.agi, vit: p.d.vit, ene: p.d.ene, dmin: p.der.dmin, dmax: p.der.dmax, def: p.der.def,
        cds: Object.fromEntries(Object.entries(p.cds).map(([k, v]) => [k, r2(v)])), muerto: r2(p.muerto), obj: p.objetivo, veneno: p.veneno ? r2(p.veneno.t) : 0, evt,
        atalaya: R.enAtalaya(p.x, p.z), resets: p.d.resets || 0, pozo: p.enPozo ? (this.pozo?.oleada || 0) : -1, pociones: this.cuantos(p, 'pocion'), eteres: this.cuantos(p, 'eter'), buffs: p.buffs.map(b => [b.id, r2(b.t)]), alcance: p.der.alcance, clase: p.d.clase,
        grupo: g ? g.miembros.map(id => { const x = this.jug.get(id); return x ? [x.id, x.nombre, Math.round(x.hp / x.der.maxHp * 100), x.d.nivel, x.id === g.lider ? 1 : 0] : null; }).filter(Boolean) : null,
      };
      const sv = [];
      for (const x of this.siervos.values()) if (dist(x, p) < VISTA) sv.push([x.id, r2(x.x), r2(x.z), r2(x.dir), x.mueve ? 1 : 0, x.dueno]);
      const foto = { t: 's', j, m, d: dr, sv, ev: p.priv.length ? ev.concat(p.priv) : ev, yo };
      if (p.cambioMis || p.cambioInv) { p.cambioMis = false; foto.mis = p.d.misiones; }
      if (p.cambioInv) { p.cambioInv = false; foto.inv = { oro: p.d.oro, inv: p.d.inv, equipo: p.d.equipo, arbol: p.d.arbol, lugares: p.d.lugares, atalayas: p.d.atalayas, der: p.der, baul: p.baul }; }
      this.enviar(p.s, foto);
      p.priv = [];
    }
  }
}
