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

export class Personaje extends DurableObject {
  async entrar(nombre, clave) {
    const datos = await this.ctx.storage.get('datos');
    if (!datos) {
      const sal = crypto.getRandomValues(new Uint8Array(16));
      await this.ctx.storage.put('clave', { sal: hex(sal), hash: await hashClave(clave, sal) });
      const nuevo = { ...R.nuevoPersonaje(nombre), creado: Date.now() };
      await this.ctx.storage.put('datos', nuevo);
      return { ok: true, datos: nuevo, nuevo: true };
    }
    const fallos = (await this.ctx.storage.get('fallos')) || { n: 0, t: 0 };
    if (fallos.n >= 5 && Date.now() - fallos.t < 60_000) return { error: 'Demasiados intentos. Esperá un minuto.' };
    const c = await this.ctx.storage.get('clave');
    const sal = new Uint8Array(c.sal.match(/../g).map(h => parseInt(h, 16)));
    if (!iguales(await hashClave(clave, sal), c.hash)) {
      await this.ctx.storage.put('fallos', { n: fallos.n + 1, t: Date.now() });
      return { error: 'Ese nombre ya existe y la clave no coincide.' };
    }
    if (fallos.n) await this.ctx.storage.delete('fallos');
    return { ok: true, datos };
  }
  async guardar(datos) { await this.ctx.storage.put('datos', datos); }
}

// ---------------- Mapa: la sala donde se juega ----------------
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const enPueblo = p => Math.hypot(p.x - R.PUEBLO.x, p.z - R.PUEBLO.z) < R.PUEBLO.r;
const r2 = n => Math.round(n * 100) / 100;
const entre = (a, b) => a + Math.random() * (b - a);

export class Mapa extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.jug = new Map();      // id → jugador
    this.mons = new Map();     // id → monstruo
    this.grupos = new Map();   // id → { id, lider, miembros: [ids] }
    this.ev = [];
    this.sigId = 1; this.sigMon = 1000; this.sigGrupo = 1;
    this.t = 0; this.reloj = null;
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
    if (!s.p) { if (m.t === 'entrar' && !s.entrando) await this.entrar(s, m); return; }
    const p = s.p;
    switch (m.t) {
      case 'pos': return this.moverJugador(p, m);
      case 'atk': return this.marcar(p, m.id);
      case 'hab': return this.habilidad(p, m.n | 0, m.id);
      case 'pot': return this.pocion(p);
      case 'punto': return this.repartir(p, m.s, m.n | 0);
      case 'inv': return this.invitar(p, m.id);
      case 'acepta': return this.aceptar(p, m.de);
      case 'rechaza': { const q = this.jug.get(m.de); if (q) this.aviso(q, `${p.nombre} no aceptó el grupo.`); return; }
      case 'salir': return this.dejarGrupo(p);
      case 'ping': return this.enviar(s, { t: 'pong', c: m.c });
    }
  }

  async entrar(s, m) {
    const nombre = String(m.nombre || '').trim(), clave = String(m.clave || '');
    if (!NOMBRE_OK.test(nombre)) return this.enviar(s, { t: 'error', msg: 'El nombre va de 3 a 14 letras o números, sin espacios.' });
    if (clave.length < 4 || clave.length > 40) return this.enviar(s, { t: 'error', msg: 'La clave tiene que tener al menos 4 caracteres.' });
    if (this.jug.size >= MAX_JUGADORES) return this.enviar(s, { t: 'error', msg: 'El mapa está lleno. Probá en un rato.' });
    s.entrando = true;
    const r = await this.env.PERSONAJES.get(this.env.PERSONAJES.idFromName(nombre.toLowerCase())).entrar(nombre, clave);
    s.entrando = false;
    if (r.error) return this.enviar(s, { t: 'error', msg: r.error });
    // Si ya estaba conectado (otro celu o se le cortó), se cierra la conexión vieja.
    for (const q of this.jug.values()) if (q.nombre.toLowerCase() === nombre.toLowerCase()) { this.salir(q.s); try { q.s.ws.close(4000, 'Entraste desde otro lado'); } catch (e) {} }
    const a = Math.random() * Math.PI * 2;
    const p = {
      id: this.sigId++, s, nombre: r.datos.nombre, d: r.datos,
      x: Math.cos(a) * 3, z: Math.sin(a) * 3, dir: 0, mueve: false,
      hp: 0, mp: 0, objetivo: null, cdAtk: 0, cds: [0, 0, 0], pot: R.POCION.cargas, potT: 0, muralla: 0, muerto: 0,
      grupo: null, invitacion: null, ultPos: Date.now(), guardadoT: 0, priv: [],
    };
    p.der = R.derivados(p.d); p.hp = p.der.maxHp; p.mp = p.der.maxMp;
    s.p = p; this.jug.set(p.id, p);
    this.enviar(s, { t: 'bienvenida', id: p.id, datos: p.d, nuevo: !!r.nuevo, x: p.x, z: p.z });
    this.msgTodos(`${p.nombre} llegó al ${R.MAPA.nombre}.`);
    if (!this.reloj) { this.reloj = setInterval(() => this.tick(), R.TICK * 1000); }
  }

  salir(s) {
    const p = s.p; if (!p || !this.jug.has(p.id)) return;
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
    this.env.PERSONAJES.get(this.env.PERSONAJES.idFromName(p.nombre.toLowerCase())).guardar(p.d).catch(() => {});
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
    x = Math.max(-R.MUNDO + 2, Math.min(R.MUNDO - 2, x)); z = Math.max(-R.MUNDO + 2, Math.min(R.MUNDO - 2, z));
    p.mueve = Math.hypot(x - p.x, z - p.z) > 0.01;
    p.x = x; p.z = z; p.ultPos = ahora;
    if (isFinite(+m.dir)) p.dir = +m.dir;
  }

  marcar(p, id) {
    const m = this.mons.get(id);
    p.objetivo = m && !m.muerto ? id : null;
  }

  habilidad(p, n, id) {
    const h = R.HABILIDADES[n];
    if (!h || p.muerto) return;
    if (p.cds[n] > 0) return;
    if (p.mp < h.mp) return this.aviso(p, 'No te alcanza la energía.');
    if (h.id === 'embestida') {
      const m = this.mons.get(id ?? p.objetivo);
      if (!m || m.muerto) return this.aviso(p, 'Marcá un monstruo primero.');
      const d = dist(p, m);
      if (d > h.salto + 2) return this.aviso(p, 'Está muy lejos.');
      const k = Math.max(0, d - (p.der.alcance + m.def.radio) * 0.8) / (d || 1);
      p.x += (m.x - p.x) * k; p.z += (m.z - p.z) * k; p.ultPos = Date.now();
      p.dir = Math.atan2(m.x - p.x, m.z - p.z);
      this.ev.push(['tp', p.id, r2(p.x), r2(p.z)], ['a', p.id, h.anim, m.id]);
      p.mp -= h.mp; p.cds[n] = h.cd; p.objetivo = m.id; p.cdAtk = p.der.cadencia;
      this.golpear(p, m, h.mult, true);
      return;
    }
    p.mp -= h.mp; p.cds[n] = h.cd;
    this.ev.push(['a', p.id, h.anim]);
    if (h.id === 'giro') {
      for (const m of this.mons.values()) if (!m.muerto && dist(p, m) < h.radio + m.def.radio) this.golpear(p, m, h.mult, true);
      p.cdAtk = Math.max(p.cdAtk, 0.5);
    } else if (h.id === 'muralla') p.muralla = h.dura;
  }

  pocion(p) {
    if (p.muerto || p.pot < 1) return;
    p.pot--; if (!p.potT) p.potT = R.POCION.recarga;
    p.hp = Math.min(p.der.maxHp, p.hp + p.der.maxHp * R.POCION.cura);
    this.ev.push(['a', p.id, 'pot']);
  }

  repartir(p, stat, n) {
    if (!R.STATS.includes(stat) || n < 1) return;
    n = Math.min(n, p.d.puntos); if (!n) return;
    p.d.puntos -= n; p.d[stat] += n;
    const antes = p.der; p.der = R.derivados(p.d);
    p.hp += p.der.maxHp - antes.maxHp; p.mp += p.der.maxMp - antes.maxMp;
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
    let tipo = hab ? R.GOLPE.HABILIDAD : R.GOLPE.NORMAL, f = mult;
    const r = Math.random();
    if (r < 0.04) { tipo = R.GOLPE.EXCELENTE; f *= 2; } else if (r < 0.12) { tipo = hab ? tipo : R.GOLPE.CRITICO; f *= 1.5; }
    const dano = Math.max(1, Math.round(entre(p.der.dmin, p.der.dmax) * f - m.def.def * 0.5));
    m.hp -= dano;
    const bando = p.grupo ? 'g' + p.grupo : 'p' + p.id;
    m.danos.set(bando, (m.danos.get(bando) || 0) + dano);
    if (!m.obj || !m.def.jefe) m.obj = p.id;
    m.frenado = 0.25;
    this.ev.push(['g', p.id, m.id, dano, tipo]);
    if (m.hp <= 0) this.matar(m);
  }

  matar(m) {
    m.muerto = true; m.hp = 0; m.reaparece = m.def.reaparece; m.obj = null;
    this.ev.push(['m', m.id]);
    if (m.def.jefe) this.msgTodos(`¡Cayó el ${m.def.nombre}! Vuelve en ${Math.round(m.def.reaparece / 60)} minutos.`);
    let total = 0; for (const v of m.danos.values()) total += v;
    for (const [bando, d] of m.danos) {
      const parte = m.def.exp * d / total;
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
    const dif = p.d.nivel - m.def.nivel;
    if (dif > 10) cant *= Math.max(0.2, 1 - (dif - 10) * 0.08);
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

  herirJugador(p, dano, m) {
    if (p.muerto) return;
    dano = Math.max(1, Math.round(dano - p.der.def * 0.5));
    if (p.muralla > 0) dano = Math.max(1, Math.round(dano * 0.5));
    p.hp -= dano;
    this.ev.push(['g', m.id, p.id, dano, 4]);
    if (p.hp <= 0) {
      p.hp = 0; p.muerto = 5; p.objetivo = null; p.mueve = false;
      this.ev.push(['m', p.id]);
      this.aviso(p, `Te venció ${m.def.nombre}. Volvés a la Atalaya en 5 segundos.`);
      for (const x of this.mons.values()) if (x.obj === p.id) x.obj = null;
    }
  }

  // ----- monstruos -----
  lugarLibre(def) {
    const z = def.zona;
    for (let i = 0; i < 30; i++) {
      let x, y;
      if (z.rmax) { const a = Math.random() * Math.PI * 2, r = entre(z.rmin, z.rmax); x = z.x + Math.cos(a) * r; y = z.z + Math.sin(a) * r; }
      else { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * z.r; x = z.x + Math.cos(a) * r; y = z.z + Math.sin(a) * r; }
      if (Math.hypot(x, y) > R.PUEBLO.r + 2 && Math.abs(x) < R.MUNDO - 4 && Math.abs(y) < R.MUNDO - 4) return { x, z: y };
    }
    return { x: z.x, z: z.z };
  }

  crearMonstruo(tipo) {
    const def = R.MONSTRUOS[tipo], l = this.lugarLibre(def);
    const m = { id: this.sigMon++, tipo, ti: R.TIPOS.indexOf(tipo), def, casa: l, x: l.x, z: l.z, dir: Math.random() * 6, hp: def.hp,
      muerto: false, reaparece: 0, obj: null, cd: 0, paseo: 0, destino: null, volviendo: false, mueve: false, frenado: 0, pisoton: def.pisoton?.cada || 0, danos: new Map() };
    this.mons.set(m.id, m);
  }

  revivirMonstruo(m) {
    const l = this.lugarLibre(m.def);
    Object.assign(m, { casa: l, x: l.x, z: l.z, hp: m.def.hp, muerto: false, obj: null, volviendo: false, destino: null });
    this.ev.push(['a', m.id, 'nace']);
    if (m.def.jefe) this.msgTodos(`¡Apareció el ${m.def.nombre} en el Osario! Hace falta un grupo.`);
  }

  caminar(m, x, z, vel, dt) {
    const dx = x - m.x, dz = z - m.z, d = Math.hypot(dx, dz);
    if (d < 0.05) return true;
    const paso = Math.min(d, vel * dt);
    m.x += dx / d * paso; m.z += dz / d * paso; m.dir = Math.atan2(dx, dz); m.mueve = true;
    return paso >= d;
  }

  tickMonstruo(m, dt) {
    m.mueve = false;
    if (m.muerto) { m.reaparece -= dt; if (m.reaparece <= 0) this.revivirMonstruo(m); return; }
    m.cd -= dt;
    if (m.frenado > 0) { m.frenado -= dt; return; }
    const def = m.def;
    let p = m.obj ? this.jug.get(m.obj) : null;
    if (p && (p.muerto || enPueblo(p))) { p = null; m.obj = null; }
    if (!p && def.agresivo && !m.volviendo) {
      let mejor = def.vista;
      for (const q of this.jug.values()) { if (q.muerto || enPueblo(q)) continue; const d = dist(q, m); if (d < mejor) { mejor = d; p = q; } }
      if (p) m.obj = p.id;
    }
    if (dist(m, m.casa) > (def.jefe ? 20 : 16)) { m.obj = null; p = null; m.volviendo = true; }
    if (m.volviendo) {
      if (this.caminar(m, m.casa.x, m.casa.z, def.vel * 1.3, dt)) { m.volviendo = false; m.hp = def.hp; m.danos.clear(); }
      return;
    }
    if (p) {
      const d = dist(m, p);
      if (d > def.alcance + 0.4) this.caminar(m, p.x, p.z, def.vel, dt);
      else {
        m.dir = Math.atan2(p.x - m.x, p.z - m.z);
        if (m.cd <= 0) { m.cd = def.cadencia; this.ev.push(['a', m.id, 'atk', p.id]); this.herirJugador(p, entre(def.dano[0], def.dano[1]), m); }
      }
      if (def.pisoton) {
        m.pisoton -= dt;
        if (m.pisoton <= 0) {
          m.pisoton = def.pisoton.cada;
          this.ev.push(['a', m.id, 'pisoton']);
          for (const q of this.jug.values()) if (dist(q, m) < def.pisoton.radio) this.herirJugador(q, entre(def.pisoton.dano[0], def.pisoton.dano[1]), m);
        }
      }
      return;
    }
    // Pasea cerca de su casa.
    m.paseo -= dt;
    if (m.paseo <= 0) { m.paseo = entre(3, 8); const a = Math.random() * 6.3, r = Math.random() * 4; m.destino = { x: m.casa.x + Math.cos(a) * r, z: m.casa.z + Math.sin(a) * r }; }
    if (m.destino && this.caminar(m, m.destino.x, m.destino.z, def.vel * 0.35, dt)) m.destino = null;
  }

  // ----- reloj del mapa -----
  tick() {
    const dt = R.TICK; this.t += dt;
    for (const p of this.jug.values()) {
      if (p.muerto) {
        p.muerto -= dt;
        if (p.muerto <= 0) {
          p.muerto = 0; p.hp = p.der.maxHp; p.mp = p.der.maxMp;
          const a = Math.random() * 6.3; p.x = Math.cos(a) * 3; p.z = Math.sin(a) * 3; p.ultPos = Date.now();
          this.ev.push(['rv', p.id, r2(p.x), r2(p.z)]);
        }
        continue;
      }
      for (let i = 0; i < 3; i++) if (p.cds[i] > 0) p.cds[i] = Math.max(0, p.cds[i] - dt);
      if (p.muralla > 0) p.muralla = Math.max(0, p.muralla - dt);
      if (p.potT > 0) { p.potT -= dt; if (p.potT <= 0) { p.pot = Math.min(R.POCION.cargas, p.pot + 1); p.potT = p.pot < R.POCION.cargas ? R.POCION.recarga : 0; } }
      p.hp = Math.min(p.der.maxHp, p.hp + p.der.maxHp * 0.005 * dt);
      p.mp = Math.min(p.der.maxMp, p.mp + 2 * dt);
      p.cdAtk -= dt;
      if (p.objetivo) {
        const m = this.mons.get(p.objetivo);
        if (!m || m.muerto) p.objetivo = null;
        else if (dist(p, m) <= p.der.alcance + m.def.radio + 0.6 && p.cdAtk <= 0) {
          p.cdAtk = p.der.cadencia; p.dir = Math.atan2(m.x - p.x, m.z - p.z);
          this.ev.push(['a', p.id, 'atk', m.id]);
          this.golpear(p, m, 1, false);
        }
      }
      p.guardadoT += dt; if (p.guardadoT > GUARDAR_CADA) this.guardar(p);
    }
    const mons = [...this.mons.values()];
    for (const m of mons) this.tickMonstruo(m, dt);
    // Que no se encimen.
    for (let i = 0; i < mons.length; i++) {
      const a = mons[i]; if (a.muerto) continue;
      if (Math.hypot(a.x, a.z) < R.PUEBLO.r + 1) { const d = Math.hypot(a.x, a.z) || 1; a.x = a.x / d * (R.PUEBLO.r + 1); a.z = a.z / d * (R.PUEBLO.r + 1); }
      for (let j = i + 1; j < mons.length; j++) {
        const b = mons[j]; if (b.muerto) continue;
        const min = a.def.radio + b.def.radio, dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
        if (d < min && d > 0.001) { const k = (min - d) / d * 0.5; a.x -= dx * k; a.z -= dz * k; b.x += dx * k; b.z += dz * k; }
      }
    }
    this.enviarFotos();
  }

  enviarFotos() {
    const ev = this.ev; this.ev = [];
    const filaJ = q => [q.id, q.nombre, r2(q.x), r2(q.z), r2(q.dir), Math.round(q.hp / q.der.maxHp * 100), q.d.nivel, q.muerto ? 4 : q.mueve ? 1 : 0, q.grupo || 0, q.muralla > 0 ? 1 : 0];
    const filaM = m => [m.id, m.ti, r2(m.x), r2(m.z), r2(m.dir), Math.round(Math.max(0, m.hp) / m.def.hp * 100), m.muerto ? 4 : m.mueve ? 1 : 0];
    for (const p of this.jug.values()) {
      const j = [], m = [];
      for (const q of this.jug.values()) if (q === p || dist(q, p) < VISTA) j.push(filaJ(q));
      for (const x of this.mons.values()) if (dist(x, p) < VISTA || x.def.jefe) m.push(filaM(x));
      const g = p.grupo && this.grupos.get(p.grupo);
      const yo = {
        hp: Math.round(p.hp), mp: Math.round(p.mp), maxHp: p.der.maxHp, maxMp: p.der.maxMp, nivel: p.d.nivel, exp: p.d.exp, sig: R.expParaSubir(p.d.nivel),
        puntos: p.d.puntos, fue: p.d.fue, agi: p.d.agi, vit: p.d.vit, ene: p.d.ene, dmin: p.der.dmin, dmax: p.der.dmax, def: p.der.def,
        cds: p.cds.map(r2), pot: p.pot, potT: r2(p.potT), muralla: r2(p.muralla), muerto: r2(p.muerto), obj: p.objetivo,
        grupo: g ? g.miembros.map(id => { const x = this.jug.get(id); return x ? [x.id, x.nombre, Math.round(x.hp / x.der.maxHp * 100), x.d.nivel, x.id === g.lider ? 1 : 0] : null; }).filter(Boolean) : null,
      };
      this.enviar(p.s, { t: 's', j, m, ev: p.priv.length ? ev.concat(p.priv) : ev, yo });
      p.priv = [];
    }
  }
}
