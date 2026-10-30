// Personajes que juegan solos dentro del Mapa. Usan las mismas acciones que un jugador (moverse, pegar, hablar con NPCs,
// comprar, armar puestos, hermandades) y las mismas reglas; lo único distinto es que ganan menos experiencia, así van a
// un ritmo más tranquilo. Solo andan mientras haya una persona conectada. Se suman a la clase Mapa con Object.assign.
import * as R from '../../js/reglas.js';
import * as C from '../../js/clases.js';
import * as O from '../../js/objetos.js';
import * as MI from '../../js/misiones.js';

const RITMO = 0.3;           // parte de la experiencia que ganan
const MAX_ONLINE = 8, MIN_ONLINE = 5;
const CAMINA = 5.2;
const az = (a, b) => a + Math.random() * (b - a);
const uno = l => l[Math.floor(Math.random() * l.length)];
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const tierra = (x, z) => R.islaDe(x, z)?.id || 'paramo';
const limpio = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// [nombre, clase, nivel inicial, forma de ser, número de clan]
const ELENCO = [
  ['Nahuel', 'guardian', 64, 'charla', 0], ['Brisa', 'arcanista', 58, 'mision', 1], ['Facu77', 'barbaro', 52, 'caza', 2],
  ['Morena', 'cazadora', 47, 'tienda', 0], ['ElTano', 'guardian', 41, 'caza', 1], ['Yamila', 'nigromante', 38, 'mision', 2],
  ['Drakar', 'barbaro', 34, 'caza', 0], ['Sombrita', 'sombra', 30, 'charla', 1], ['Lucho', 'cazadora', 27, 'mision', null],
  ['Ailen', 'arcanista', 23, 'tienda', 2], ['Kiko', 'sombra', 20, 'charla', null], ['Valen', 'nigromante', 16, 'mision', 0],
  ['Tordo', 'guardian', 13, 'caza', null], ['Renata', 'cazadora', 10, 'charla', 1], ['Zeta', 'barbaro', 74, 'tienda', null], ['Gonza', 'arcanista', 88, 'caza', 2],
].map(([nombre, clase, nivel, forma, clan]) => ({ nombre, clase, nivel, forma, clan }));
// El primero de cada clan que llegue a nivel 30 lo funda.
const CLANES = [{ nombre: 'Los Sin Farol', simbolo: '☽', color: '#8fb2d8', lider: 'Nahuel' }, { nombre: 'Orden del Hueso', simbolo: '☠', color: '#e8e0d0', lider: 'Brisa' },
  { nombre: 'Cuervos del Sur', simbolo: '✶', color: '#c0392b', lider: 'Facu77' }];

const SUELTAS = ['alguien sabe cuándo abre el pozo?', 'qué lento cae el legendario hoy', 'estoy juntando para unas alas, cuesta una banda', 'vendo gemas, pasen por el puesto',
  'este mapa de noche da miedo', 'me quedé sin pociones en el peor momento', 'la forja me rompió el alma', 'alguien para hacer grupo un rato?', 'buenas, recién llego',
  'hoy no me cae nada eh', 'ya casi subo, último empujón', 'cuidado con los campeones, pegan el doble', 'mañana sigo con las misiones, hoy solo caza', 'me falta poco para el ranking de la semana'];
const CHARLAS = [['qué clase conviene para arrancar?', 'guardián si querés aguantar, cazadora si querés no morirte tanto'], ['alguien fundió en el caldero?', 'perdí tres excelentes jaja, pero uno me salió legendario'],
  ['dónde consigo velas?', 'la boticaria las vende, o te caen de los bichos'], ['qué pega más, fuego o rayo?', 'depende del bicho, fijate a qué es débil'], ['vale la pena forjar a +7?', 'sí, pero tené escudos a mano, duele cuando falla'],
  ['alguien vio al heraldo?', 'sale en la noche roja, hay que ir de a varios'], ['cuánto falta para renacer?', 'a mí una banda todavía'], ['hay algo bueno en el puesto?', 'pasá y mirá, dejé unas cosas']];
const TEMAS = [
  [/\bpozo|sello\b/, 'el pozo abre cada 2 horas. le comprás un sello a oria y bajás con ella, son 8 oleadas y un jefe'],
  [/\bforj/, 'la forja es con el herrero, gastás gemas de forja. después del +6 te conviene tener cuidado'],
  [/\balas?\b/, 'las alas te las arma oria: pide oro, gemas y un equipo para sacrificar'],
  [/\bcaldero\b/, 'el caldero está en el herrero: tres equipos de la misma rareza y puede salir uno mejor, si no, los perdés'],
  [/\brenac|reset/, 'se renace en nivel 150, con oria. volvés a 1 pero con puntos de regalo'],
  [/\bgema|engarc/, 'las gemas se engarzan con el herrero, en armas y armaduras con agujero'],
  [/\b(mascota|montura)/, 'mascotas y monturas las vende la domadora'],
  [/\bvela/, 'las velas te llevan a lugares que ya conocés, las compra la boticaria'],
  [/\batributo|punto|stat/, 'poné casi todo en tu atributo principal y algo en vitalidad'],
];

// ---------- armar un personaje ----------
const stats = (d, n) => {
  const a = C.CLASES[d.clase].atributo, pesos = [[a, 0.6], ['vit', 0.28], ['sue', 0.06], ['tem', 0.06]];
  if (C.CLASES[d.clase].escudo) { pesos[0][1] = 0.48; pesos.push(['fue', 0]); }
  for (const [s, k] of pesos) d[s] += Math.round(n * k);
};
function habilidades(d) {
  const hab = C.ARBOL[d.clase].flatMap(r => r.hab);
  for (let i = 0; i < 300; i++) {
    const libres = hab.filter(h => !C.puedeAprender(d, h.id)); if (!libres.length) return;
    const h = libres.find(x => x.tipo !== 'pasiva' && !d.arbol[x.id]) || uno(libres);
    d.arbol[h.id] = (d.arbol[h.id] || 0) + 1;
  }
}
function vestirBot(d) {
  for (const r of ['arma', 'escudo', 'casco', 'armadura', 'guantes', 'botas']) {
    if (r === 'escudo' && !C.CLASES[d.clase].escudo) continue;
    const l = Object.values(O.BASES).filter(b => b.r === r && !b.especial && O.puedeUsar(b.id, d.clase) && (r !== 'arma' || b.clase)).sort((a, b) => b.req - a.req);
    const n = Math.floor(Math.random() * 6), b = l.find(x => !O.motivoNoPuede(d, { b: x.id, n }));
    if (b) d.equipo[r] = { b: b.id, n };
  }
  for (const r of ['alas', 'mascota', 'montura']) {
    if (Math.random() > 0.5) continue;
    const l = Object.values(O.BASES).filter(b => b.r === r && !O.motivoNoPuede(d, { b: b.id, n: 0 }));
    if (l.length) d.equipo[r] = { b: uno(l).id, n: 0 };
  }
}
function crearBot(f) {
  const d = R.nuevoPersonaje(f.nombre, f.clase);
  d.nivel = f.nivel; stats(d, (f.nivel - 1) * R.PUNTOS_POR_NIVEL); habilidades(d); vestirBot(d);
  d.oro = f.nivel * f.nivel * 40 + 3000 + (CLANES.some(c => c.lider === f.nombre) ? R.HERMANDAD.oro : 0);
  d.atalayas = [0, 1, 2, 3, 4]; d.visto = true;
  d.inv[0] = { b: 'pocion', c: 20 }; d.inv[1] = { b: 'eter', c: 12 };
  if (f.forma === 'tienda') for (let i = 0; i < 4; i++) d.inv[3 + i] = O.equipoAlAzar(f.nivel, Math.random, 0.4, null, 0.08, 0);
  return d;
}
const valor = it => { const b = O.BASES[it.b]; return (b.req || 0) + (it.n || 0) * 2 + O.rareza(it) * 15; };

export const BOTS = {
  humanos() { let n = 0; for (const p of this.jug.values()) if (!p.bot) n++; return n; },
  botsOnline() { return [...this.jug.values()].filter(p => p.bot); },

  // ----- llegar y dejar el juego -----
  async botEntrar(f) {
    const cuenta = 'bot-' + f.nombre.toLowerCase(), c = this.cuenta(cuenta);
    let r = await c.cargar(f.nombre);
    if (r.error) {
      if (!(await this.cuenta('pj:' + f.nombre).reservar(cuenta))) { f.ocupado = true; return; }
      await c.guardar(f.nombre, crearBot(f), null);
      r = await c.cargar(f.nombre); if (r.error) return;
    }
    if (!this.humanos() || [...this.jug.values()].some(q => q.nombre === f.nombre)) return;
    const d = r.datos;
    for (const I of R.ISLAS) if (d.nivel >= I.nivel && !d.atalayas.includes(I.atalaya)) d.atalayas.push(I.atalaya);
    const ult = d.pos || { x: 0, z: 0 }, at = R.PUEBLOS[R.atalayaCercana(ult.x, ult.z, d.atalayas)], a = Math.random() * 6.3;
    const s = { ws: { send() {}, close() {} }, p: null, bot: true };
    const p = { id: this.sigId++, s, cuenta, nombre: d.nombre, d, baul: r.baul, x: at.x + Math.cos(a) * 3, z: at.z + Math.sin(a) * 3, dir: 0, mueve: false,
      hp: 0, mp: 0, objetivo: null, cdAtk: 0, cds: {}, buffs: [], muerto: 0, com: null, cambioInv: false, lugarT: 0, grupo: null, invitacion: null, ultPos: Date.now(), guardadoT: 0, priv: [] };
    p.der = R.derivados(d); p.hp = p.der.maxHp; p.mp = p.der.maxMp;
    p.bot = { f, ritmo: RITMO, dest: null, piensa: az(1, 3), modo: 'pueblo', paso: 0, pausa: az(5, 25), habT: az(2, 6), racha: az(6, 14), sesion: az(20, 50) * 60, plaza: 0, saltar: new Set(), muertes: 0, invito: {}, chat: az(60, 300) };
    s.p = p; this.jug.set(p.id, p);
    // Lo que "jugó" mientras no había nadie: unos pocos niveles como mucho.
    if (d.botFuera) { const h = Math.min(72, (Date.now() - d.botFuera) / 3600000); if (h > 1) this.darExp(p, R.expParaSubir(d.nivel) * h * 0.04, null); }
    if (d.hermandad) await this.cargarHerm(p);
  },
  botIrse(p) { p.d.botFuera = Date.now(); this.salir(p.s); },

  botsTick(dt) {
    const online = this.botsOnline();
    this.botRevisarT = (this.botRevisarT || 0) - dt;
    if (this.botRevisarT <= 0 && !this.botEntrando) {
      this.botRevisarT = az(15, 40);
      this.botMeta = this.botMeta && Math.random() > 0.1 ? this.botMeta : Math.round(az(MIN_ONLINE, MAX_ONLINE));
      const libres = ELENCO.filter(f => !f.ocupado && !online.some(p => p.bot.f === f));
      if (online.length < this.botMeta && libres.length) {
        this.botEntrando = true;
        this.botEntrar(uno(libres)).catch(e => console.log('bot', e?.stack || e)).finally(() => { this.botEntrando = false; });
      }
    }
    for (const p of online) { try { this.botTick(p, dt); } catch (e) { console.log('bot', p.nombre, e?.stack || e); p.bot.dest = null; p.bot.piensa = 5; } }
    if (this.botDichos?.length) {
      for (const x of this.botDichos) x.t -= dt;
      for (const x of this.botDichos.filter(y => y.t <= 0)) { const q = this.jug.get(x.id); if (q) this.chat(q, x.txt); }
      this.botDichos = this.botDichos.filter(y => y.t > 0);
    }
    this.botCharlaT = (this.botCharlaT || 120) - dt;
    if (this.botCharlaT <= 0 && online.length) {
      this.botCharlaT = az(150, 300);
      const a = uno(online), b = uno(online.filter(p => p !== a));
      if (b && Math.random() < 0.45) { const [x, y] = uno(CHARLAS); this.botDecir(a, x, 0.5); this.botDecir(b, y, az(6, 11)); }
      else this.botDecir(a, uno(SUELTAS), 0.5);
    }
  },
  botDecir(p, txt, t = 2) { (this.botDichos || (this.botDichos = [])).push({ id: p.id, txt, t }); },

  botTick(p, dt) {
    const b = p.bot;
    if (p.muerto) { if (b.dest || !b.muerto) { b.dest = null; b.muerto = true; b.muertes++; p.mueve = false; } return; }
    b.muerto = false;
    if (b.dest) {
      const dx = b.dest.x - p.x, dz = b.dest.z - p.z, d = Math.hypot(dx, dz), paso = CAMINA * (1 + (p.der.velMov || 0) / 100) * dt;
      if (d <= paso) { p.x = b.dest.x; p.z = b.dest.z; b.dest = null; p.mueve = false; }
      else { p.x += dx / d * paso; p.z += dz / d * paso; p.dir = Math.atan2(dx, dz); p.mueve = true; }
    } else p.mueve = false;
    b.sesion -= dt; b.piensa -= dt;
    if (b.piensa <= 0) { b.piensa = az(0.7, 1.3); this.botPensar(p, b); }
  },

  // ----- la cabeza -----
  botPensar(p, b) {
    this.botResponder(p, b);
    if (p.hp < p.der.maxHp * 0.4 && this.cuantos(p, 'pocion')) this.beber(p, 'pocion');
    if (p.mp < p.der.maxMp * 0.25 && this.cuantos(p, 'eter')) this.beber(p, 'eter');
    if (p.enPozo) return this.botPozo(p, b);
    if (p.enBastion) return this.botBastion(p, b);
    if (b.volvioDe) { b.volvioDe = false; b.dest = null; b.modo = 'pueblo'; b.paso = 0; }
    if (b.sesion <= 0 && !p.puesto && !this.botConHumano(p)) { this.dejarGrupo(p, true); return this.botIrse(p); }
    if (p.puesto) return this.botPuesto(p, b);
    if (p.grupo && this.botSiguiendo(p, b)) return;
    if (b.pausa > 0) { b.pausa -= 1; return; }
    if (b.buscar != null) return this.botBuscar(p, b);
    if (this.botIrEvento(p, b)) return;
    if (b.modo === 'pueblo') return this.botPueblo(p, b);
    if (p.hp < p.der.maxHp * 0.25 && !this.cuantos(p, 'pocion')) { b.modo = 'pueblo'; b.paso = 0; p.objetivo = null; return; }
    if (this.cuantos(p, 'pocion') < 2 || !p.d.inv.includes(null)) { b.modo = 'pueblo'; b.paso = 0; p.objetivo = null; return; }
    this.botSocial(p, b);
    this.botTarea(p, b);
  },
  botConHumano(p) { const g = p.grupo && this.grupos.get(p.grupo); return !!g && g.miembros.some(id => { const q = this.jug.get(id); return q && !q.bot; }); },

  botResponder(p, b) {
    if (p.invitacion) {
      const q = this.jug.get(p.invitacion.de), de = p.invitacion.de; b.invEspera = (b.invEspera || 0) + 1;
      if (q && b.invEspera > 2) {
        b.invEspera = 0;
        if (Math.abs(q.d.nivel - p.d.nivel) > 60 && !q.bot) { p.invitacion = null; this.botDecir(p, 'estamos muy lejos de nivel, otro día'); }
        else { this.aceptar(p, de); if (!q.bot) this.botDecir(p, uno(['dale, vamos', 'de una', 'me sumo'])); }
      } else if (!q) p.invitacion = null;
    }
    if (p.invHerm && !p.d.hermandad) { b.hermEspera = (b.hermEspera || 0) + 1; if (b.hermEspera > 3) { b.hermEspera = 0; this.aceptarHerm(p, p.invHerm).catch(() => {}); } }
  },

  // Va a un punto. Si queda en otra región, primero pasa por el farol y viaja. Devuelve true cuando llegó.
  botIr(p, x, z, cerca = 1) {
    const b = p.bot;
    if (Math.hypot(x - p.x, z - p.z) <= cerca) { b.dest = null; return true; }
    if (tierra(x, z) !== tierra(p.x, p.z)) {
      const destino = R.atalayaCercana(x, z, p.d.atalayas), at = R.PUEBLOS[destino];
      if (tierra(at.x, at.z) !== tierra(x, z)) return false;
      if (R.enAtalaya(p.x, p.z) >= 0) { if (p.puesto) this.cerrarPuesto(p, ''); b.dest = null; this.viajar(p, destino); return false; }
      const mio = R.PUEBLOS[R.atalayaCercana(p.x, p.z, p.d.atalayas)];
      b.dest = { x: mio.x + az(-2, 2), z: mio.z + az(-2, 2) }; return false;
    }
    b.dest = { x, z }; return false;
  },
  botNpc(p, rol) {
    const i = R.atalayaCercana(p.x, p.z, p.d.atalayas);
    return O.NPCS.find(n => n.rol === rol && n.atalaya === i) || O.NPCS.filter(n => n.rol === rol).sort((a, c) => dist(a, p) - dist(c, p))[0];
  },

  // Rutina en la atalaya: comprar, vender, ponerse lo nuevo, repartir puntos y quedarse un rato.
  botPueblo(p, b) {
    if (b.paso === 0) {
      if (p.d.puntos) { stats(p.d, p.d.puntos); p.d.puntos = 0; }
      habilidades(p.d);
      for (let i = 0; i < p.d.inv.length; i++) {
        const it = p.d.inv[i], ba = it && O.BASES[it.b];
        if (!ba?.r || !O.puedeUsar(it.b, p.d.clase) || O.motivoNoPuede(p.d, it) || (ba.r === 'escudo' && !C.CLASES[p.d.clase].escudo)) continue;
        const ya = p.d.equipo[ba.r]; if (!ya || valor(it) > valor(ya)) this.equipar(p, i);
      }
      this.recalcular(p); b.paso = 1;
    }
    if (b.paso === 1) {
      const n = this.botNpc(p, 'mercader'); if (!this.botIr(p, n.x, n.z, 2.5)) return;
      const faltan = 20 - this.cuantos(p, 'pocion'), faltaE = 12 - this.cuantos(p, 'eter');
      if (faltan > 0) this.comprar(p, n.id, 'pocion', Math.min(faltan, Math.floor(p.d.oro / 2 / O.BASES.pocion.precio)));
      if (faltaE > 0) this.comprar(p, n.id, 'eter', Math.min(faltaE, Math.floor(p.d.oro / 4 / O.BASES.eter.precio)));
      for (let i = 0; i < p.d.inv.length; i++) {
        const it = p.d.inv[i]; if (!it || !O.BASES[it.b]?.r) continue;
        if (p.bot.f.forma === 'tienda' && O.rareza(it) >= 1) continue;
        this.vender(p, i);
      }
      b.paso = 2; b.plaza = p.bot.f.forma === 'charla' ? az(50, 130) : az(15, 60); return;
    }
    const at = R.PUEBLOS[R.atalayaCercana(p.x, p.z, p.d.atalayas)];
    if (b.paso === 2) { b.paso = 3; b.dest = { x: at.x + az(-at.r + 2, at.r - 2), z: at.z + az(-at.r + 2, at.r - 2) }; return; }
    b.plaza -= 1;
    this.botClan(p, b); this.botComprarAHumano(p, b);
    if (b.f.forma === 'tienda' && !b.yaPuesto) { b.yaPuesto = true; if (this.botAbrirPuesto(p, b)) return; }
    this.botSocial(p, b);
    if (b.plaza <= 0) { b.modo = 'campo'; b.yaPuesto = false; b.paso = 0; b.racha = az(6, 14); }
  },
  botAbrirPuesto(p, b) {
    const items = []; p.d.inv.forEach((it, i) => { if (it && O.BASES[it.b]?.r && O.rareza(it) >= 1 && items.length < 6) items.push({ i, precio: Math.round(O.precioVenta(it) * az(2, 3.5)) }); });
    if (!items.length) return false;
    this.puesto(p, { a: 'abrir', titulo: uno(['Equipo barato', 'Vendo cosas buenas', 'Liquidación', `Lo de ${p.nombre}`]), items });
    b.cierra = az(4, 8) * 60; return true;
  },
  botPuesto(p, b) { b.cierra -= 1; if (b.cierra <= 0) this.cerrarPuesto(p, ''); },
  botComprarAHumano(p, b) {
    if ((b.comproT || 0) > Date.now() || Math.random() > 0.2) return;
    const v = [...this.jug.values()].find(q => !q.bot && q.puesto && dist(q, p) < 25); if (!v) return;
    const k = v.puesto.items.findIndex(x => { const it = JSON.parse(x.it); return x.precio <= O.precioVenta(it) * 8 && x.precio * 2 <= p.d.oro; });
    if (k < 0) return;
    b.comproT = Date.now() + 15 * 60000;
    if (!this.botIr(p, v.x + 2, v.z + 2, 6)) { b.comproT = 0; return; }
    const it = JSON.parse(v.puesto.items[k].it);
    this.puesto(p, { a: 'comprar', id: v.id, k });
    this.botDecir(p, `${v.nombre}, te compré ${O.nombreObjeto(it)}, gracias`);
  },

  // ----- hermandades -----
  botClan(p, b) {
    const clan = b.f.clan == null ? null : CLANES[b.f.clan];
    if (!clan || clan.lider !== p.nombre) return this.botInvitarHumano(p, b);
    if (!p.d.hermandad) {
      if (p.d.nivel >= R.HERMANDAD.nivel && p.d.oro >= R.HERMANDAD.oro && !b.fundo) { b.fundo = true; this.hermandad(p, { a: 'crear', nombre: clan.nombre, simbolo: clan.simbolo, color: clan.color }).catch(() => {}); }
      return;
    }
    const q = this.botsOnline().find(x => x !== p && x.bot.f.clan === b.f.clan && !x.d.hermandad);
    if (q) {
      const at = R.PUEBLOS[R.atalayaCercana(p.x, p.z, p.d.atalayas)];
      if (dist(p, q) <= 12) this.hermandad(p, { a: 'inv', id: q.id }).catch(() => {});
      else if (q.d.atalayas.includes(R.PUEBLOS.indexOf(at))) { q.bot.modo = 'pueblo'; q.bot.paso = 3; q.bot.plaza = 40; this.botIr(q, at.x + az(-3, 3), at.z + az(-3, 3), 3); b.plaza = Math.max(b.plaza, 20); }
    }
    this.botInvitarHumano(p, b);
  },
  botInvitarHumano(p, b) {
    const h = p.d.hermandad && this.herm.get(p.d.hermandad.toLowerCase()); if (!h || h.lider !== p.nombre) return;
    const q = [...this.jug.values()].find(x => !x.bot && !x.d.hermandad && dist(x, p) <= 12 && !b.invito['h' + x.id]); if (!q) return;
    b.invito['h' + q.id] = true;
    this.hermandad(p, { a: 'inv', id: q.id }).catch(() => {}); this.botDecir(p, `${q.nombre}, te sumás a ${h.nombre}?`, 1);
  },
  // Un jugador pidió algo y este personaje va hasta donde está.
  botBuscar(p, b) {
    const q = this.jug.get(b.buscar); b.buscarT = (b.buscarT || 90) - 1;
    if (!q || q.muerto || q.enPozo || q.enBastion || b.buscarT <= 0) { b.buscar = null; b.buscarT = 0; return; }
    if (!this.botIr(p, q.x + 2, q.z + 1, 8)) return;
    if (b.pide === 'clan') this.hermandad(p, { a: 'inv', id: q.id }).catch(() => {}); else if (!q.grupo || q.grupo === p.grupo) this.invitar(p, q.id);
    b.buscar = null; b.buscarT = 0;
  },

  // ----- charlar y juntarse -----
  botSocial(p, b) {
    b.chat -= 1;
    if (b.chat > 0) return; b.chat = az(240, 480);
    const h = [...this.jug.values()].filter(q => !q.bot && dist(q, p) < 16)[0];
    if (!h) {
      const c = this.botsOnline().find(q => q !== p && !q.grupo && dist(q, p) < 18 && Math.abs(q.d.nivel - p.d.nivel) < 25);
      if (c && !p.grupo && Math.random() < 0.5) this.invitar(p, c.id);
      return;
    }
    if ((h.botT || 0) > Date.now()) return; h.botT = Date.now() + 240000;
    const it = Object.values(h.d.equipo || {}).find(x => O.rareza(x) >= 2), mismo = Math.abs(h.d.nivel - p.d.nivel) < 25;
    if (!h.grupo && !p.grupo && mismo && !b.invito[h.id] && Math.random() < 0.4) { b.invito[h.id] = true; this.botDecir(p, `${h.nombre}, hacemos grupo?`, 1); return this.invitar(p, h.id); }
    if (it) return this.botDecir(p, `${h.nombre}, qué bueno ${O.BASES[it.b].nombre}, dónde te cayó?`);
    this.botDecir(p, uno([`hola ${h.nombre}`, `${h.nombre}, cómo va?`, 'buenas, se puede cazar acá?', `ey ${h.nombre}, venís seguido por acá?`]));
  },
  // En grupo sigue al que manda (o a la persona que esté en el grupo) y le da una mano.
  botSiguiendo(p, b) {
    const g = this.grupos.get(p.grupo); if (!g) return false;
    b.grupoT = (b.grupoT || az(900, 1800)) - 1;
    if (b.grupoT <= 0 && !this.botConHumano(p)) { b.grupoT = 0; this.dejarGrupo(p, true); return false; }
    const lider = g.miembros.map(id => this.jug.get(id)).find(q => q && !q.bot) || this.jug.get(g.lider);
    if (!lider || lider === p) return false;
    if (lider.enPozo || lider.enBastion) return false;
    const m = [...this.mons.values()].filter(x => !x.muerto && !x.def.soloEvento && dist(x, lider) < 11 && (x.obj === lider.id || dist(x, p) < 8)).sort((a, c) => dist(a, p) - dist(c, p))[0];
    const cura = C.activasAprendidas(p.d).map(id => C.buscarHab(p.d.clase, id)).find(h => h.tipo === 'cura' && h.grupo);
    if (cura && lider.hp < lider.der.maxHp * 0.5 && dist(p, lider) < R.DIST_GRUPO && !p.cds[cura.id]) this.habilidad(p, cura.id);
    if (m) { this.botPegar(p, b, m); return true; }
    this.botIr(p, lider.x + az(-3, 3), lider.z + az(-3, 3), 4);
    return true;
  },
  botPegar(p, b, m) {
    p.objetivo = m.id;
    const alcance = p.der.alcance + m.def.radio * (m.campeon ? R.CAMPEON.escala : 1) + 0.3;
    if (dist(p, m) > alcance) { const d = dist(p, m), k = (d - alcance * 0.8) / d; b.dest = { x: p.x + (m.x - p.x) * k, z: p.z + (m.z - p.z) * k }; } else b.dest = null;
    b.habT -= 1;
    if (b.habT <= 0) {
      b.habT = az(3, 8);
      const hab = C.activasAprendidas(p.d).filter(id => !p.cds[id] && C.buscarHab(p.d.clase, id).mp <= p.mp);
      if (hab.length) this.habilidad(p, uno(hab), m.id);
    }
  },

  // ----- qué hacer en el campo: misiones primero, si no, cazar -----
  botTarea(p, b) {
    const ms = p.d.misiones;
    if (b.mision && !ms.activas[b.mision] && ms.activas[b.mision] !== 0) b.mision = null;
    for (const id of Object.keys(ms.activas)) {
      const mi = MI.MISIONES[id];
      if (!mi || !MI.completa(mi, ms.activas[id])) continue;
      const n = MI.NPC_MISION.find(x => x.id === mi.npc);
      if (this.botIr(p, n.x, n.z, 4)) { this.mision(p, { id, a: 'entregar' }); b.pausa = az(2, 5); this.botRecibir(p, mi); }
      return;
    }
    const activa = Object.keys(ms.activas).find(id => !b.saltar.has(id));
    if (activa) {
      const o = MI.MISIONES[activa].obj;
      if (b.muertes >= 3) { b.saltar.add(activa); b.muertes = 0; this.mision(p, { id: activa, a: 'abandonar' }); return; }
      if (o.tipo === 'visitar') { const l = R.MAPA.lugares.find(x => x.nombre === o.lugar); if (l) this.botIr(p, l.x, l.z, 8); else b.saltar.add(activa); return; }
      return this.botCazar(p, b, [o.mon]);
    }
    if ((b.buscaMision || 0) < Date.now()) {
      const mi = Object.values(MI.MISIONES).find(x => MI.disponible(p.d, x) && !b.saltar.has(x.id) && this.botPuede(p, x));
      if (mi) {
        const n = MI.NPC_MISION.find(x => x.id === mi.npc);
        if (this.botIr(p, n.x, n.z, 4)) { this.mision(p, { id: mi.id, a: 'aceptar' }); b.pausa = az(3, 8); }
        return;
      }
      b.buscaMision = Date.now() + 300000;
    }
    this.botCazar(p, b, this.botPresas(p));
  },
  botRecibir(p, mi) { if (Math.random() < 0.15) this.botDecir(p, uno([`terminé «${mi.nombre}»`, `listo «${mi.nombre}», qué alivio`, `por fin «${mi.nombre}»`]), 2); },
  botPuede(p, mi) {
    const o = mi.obj, n = MI.NPC_MISION.find(x => x.id === mi.npc);
    if (!p.d.atalayas.some(i => tierra(R.PUEBLOS[i].x, R.PUEBLOS[i].z) === tierra(n.x, n.z))) return false;
    if (o.tipo === 'visitar') return true;
    const m = R.MONSTRUOS[o.mon]; if (!m || m.soloEvento) return false;
    if (m.zona && !p.d.atalayas.some(i => tierra(R.PUEBLOS[i].x, R.PUEBLOS[i].z) === tierra(m.zona.x, m.zona.z))) return false;
    return o.tipo === 'jefe' ? p.d.nivel >= m.nivel + 12 : m.nivel <= p.d.nivel + 1;
  },
  botPresas(p) {
    const l = R.TIPOS.filter(t => { const m = R.MONSTRUOS[t]; return !m.jefe && !m.soloEvento && m.zona && m.nivel <= Math.max(1, p.d.nivel - 2) && p.d.atalayas.some(i => tierra(R.PUEBLOS[i].x, R.PUEBLOS[i].z) === tierra(m.zona.x, m.zona.z)); })
      .sort((a, c) => R.MONSTRUOS[c].nivel - R.MONSTRUOS[a].nivel).slice(0, 3);
    return l.length ? l : ['rata'];
  },
  botCazar(p, b, tipos) {
    // Lo que soltó un bicho propio se levanta.
    for (const d of this.drops.values()) if (dist(d, p) < 9 && (d.dueno === 'p' + p.id || d.dueno === 'g' + p.grupo) && (!d.item || p.d.inv.includes(null))) { p.objetivo = null; b.dest = { x: d.x, z: d.z }; return; }
    let m = p.objetivo && this.mons.get(p.objetivo);
    if (m && (m.muerto || !tipos.includes(m.tipo))) {
      if (m.muerto) { b.racha -= 1; if (b.racha <= 0) { b.racha = az(6, 14); b.pausa = az(4, 18); } }
      m = null; p.objetivo = null;
    }
    if (!m) {
      let md = 28;
      for (const x of this.mons.values()) {
        if (x.muerto || !tipos.includes(x.tipo) || x.pozo) continue;
        // No le roba el bicho a nadie: si ya tiene dueño, busca otro.
        if (x.obj && x.obj !== p.id && !this.jug.get(x.obj)?.bot) continue;
        const d = dist(x, p); if (d < md) { md = d; m = x; }
      }
    }
    if (m) { b.zona = null; return this.botPegar(p, b, m); }
    if (!b.zona || !tipos.includes(b.zona.tipo)) { const t = uno(tipos), l = this.lugarLibre(R.MONSTRUOS[t]); b.zona = { tipo: t, ...l }; }
    if (this.botIr(p, b.zona.x, b.zona.z, 3)) b.zona = null;
  },

  // ----- eventos -----
  botIrEvento(p, b) {
    if (p.grupo && this.botConHumano(p)) return false;
    let quiere = null;
    if (this.pozo?.fase === 'entrada' && p.d.nivel >= R.POZO.nivelMin && b.vaPozo !== this.pozo.inicio) { b.vaPozo = this.pozo.inicio; b.quierePozo = Math.random() < 0.4; }
    if (this.pozo?.fase === 'entrada' && b.quierePozo) quiere = 'pozo';
    if (this.asedio && p.d.hermandad && p.d.nivel >= R.BASTION.nivelMin) { if (!b.pensoAsedio) { b.pensoAsedio = true; b.quiereAsedio = Math.random() < 0.6; } if (b.quiereAsedio) quiere = 'asedio'; }
    if (!this.asedio) b.pensoAsedio = false;
    if (!quiere) return false;
    const n = O.NPCS.find(x => x.rol === 'vidente'); p.objetivo = null;
    if (!this.botIr(p, n.x, n.z, 3)) return true;
    if (quiere === 'pozo') {
      b.quierePozo = false;
      if (!this.cuantos(p, 'sello')) this.comprar(p, n.id, 'sello', 1);
      this.entrarPozo(p);
    } else { b.quiereAsedio = false; this.entrarBastion(p); }
    b.dest = null; return true;
  },
  botPozo(p, b) {
    b.volvioDe = true; if (p.objetivo && this.mons.get(p.objetivo)?.muerto) p.objetivo = null;
    const m = [...this.mons.values()].filter(x => x.pozo && !x.muerto).sort((a, c) => dist(a, p) - dist(c, p))[0];
    if (m) this.botPegar(p, b, m); else b.dest = null;
  },
  botBastion(p, b) {
    b.volvioDe = true; b.quiereAsedio = false;
    const q = [...this.jug.values()].filter(x => this.enemigos(p, x)).sort((a, c) => dist(a, p) - dist(c, p))[0];
    if (q && dist(q, p) < 14) {
      p.objetivoJ = q.id;
      const d = dist(q, p), alc = p.der.alcance + 0.5;
      b.dest = d > alc ? { x: p.x + (q.x - p.x) * ((d - alc * 0.8) / d), z: p.z + (q.z - p.z) * ((d - alc * 0.8) / d) } : null;
      b.habT -= 1;
      if (b.habT <= 0) { b.habT = az(3, 7); const hab = C.activasAprendidas(p.d).filter(id => !p.cds[id] && C.buscarHab(p.d.clase, id).mp <= p.mp); if (hab.length) this.habilidad(p, uno(hab), q.id); }
      return;
    }
    p.objetivoJ = null;
    if (Math.hypot(p.x - R.BASTION.x, p.z - R.BASTION.z) > R.BASTION.altar - 1) b.dest = { x: R.BASTION.x + az(-2, 2), z: R.BASTION.z + az(-2, 2) };
  },

  // ----- responderle a la gente -----
  botsOyen(q, txt) {
    const online = this.botsOnline(); if (!online.length) return;
    const privado = txt.startsWith('/g ') ? '/g ' : txt.startsWith('/h ') ? '/h ' : '';
    const t = limpio(privado ? txt.slice(3) : txt);
    const nombrado = online.find(p => new RegExp(`\\b${limpio(p.nombre)}\\b`).test(t));
    const cerca = [...online].sort((a, c) => dist(a, q) - dist(c, q));
    const decir = (p, x) => this.botDecir(p, privado + x, az(2.5, 6));
    const quien = nombrado || cerca[0];

    if (/\b(sos|son|eres) (un |una )?(bot|maquina|humano|persona|real|ia)\b|\bbots?\b/.test(t) && (nombrado || /\bbots?\b/.test(t))) return decir(quien, 'sí, soy un bot del juego. juego igual que vos eh');
    if (/\b(grupo|party|pt)\b/.test(t)) {
      const l = online.filter(p => !p.grupo && Math.abs(p.d.nivel - q.d.nivel) < 40).sort((a, c) => dist(a, q) - dist(c, q));
      const p = (nombrado && l.includes(nombrado)) ? nombrado : l[0]; if (!p) return;
      if (tierra(p.x, p.z) === tierra(q.x, q.z) && dist(p, q) < 70) { p.bot.buscar = q.id; p.bot.pide = 'grupo'; p.bot.buscarT = 90; return decir(p, 'dale, voy para allá y te invito'); }
      return decir(p, `estoy lejos, en ${this.botLugar(p)}. si venís, me invitás`);
    }
    if (/\b(clan|hermandad|guild)\b/.test(t) && !q.d.hermandad) {
      const lider = online.find(p => { const h = p.d.hermandad && this.herm.get(p.d.hermandad.toLowerCase()); return h?.lider === p.nombre; });
      if (!lider) return decir(quien, 'el que lidera no está ahora, volvé a preguntar más tarde');
      if (tierra(lider.x, lider.z) === tierra(q.x, q.z)) { lider.bot.buscar = q.id; lider.bot.pide = 'clan'; lider.bot.buscarT = 120; return decir(lider, `en ${lider.d.hermandad} hay lugar, esperame que voy`); }
      return decir(lider, `en ${lider.d.hermandad} hay lugar, estoy en ${this.botLugar(lider)}, vení y te invito`);
    }
    for (const [re, resp] of TEMAS) if (re.test(t)) return decir(quien, resp);
    if (/\b(donde|adonde) (cazo|subo|levear|levelear|farmear)|\b(subir|levear|farmear)\b/.test(t)) {
      const ti = this.botPresas(q)[0], m = R.MONSTRUOS[ti];
      return decir(quien, `a tu nivel, ${m.nombre.toLowerCase()} rinde bien. andá a ${this.lugarDe({ x: m.zona.x, z: m.zona.z })}`);
    }
    if (/\b(hola|holaa+|buenas|wenas|que tal|como va|como andan)\b/.test(t)) return decir(quien, uno(['buenas!', 'hola, qué tal', `hola ${q.nombre}`, 'ey, cómo va']));
    if (nombrado) {
      if (/\b(que haces|en que andas|que estas)\b/.test(t)) return decir(nombrado, this.botActividad(nombrado));
      if (/\b(donde estas|por donde)\b/.test(t)) return decir(nombrado, `estoy en ${this.botLugar(nombrado)}`);
      if (/\b(nivel|lvl)\b/.test(t)) return decir(nombrado, `voy por el ${nombrado.d.nivel}, de a poco`);
      return decir(nombrado, uno(['decime', 'qué necesitás?', 'perdón, estaba peleando, qué decías?']));
    }
  },
  botLugar(p) { const i = R.enAtalaya(p.x, p.z); return i >= 0 ? R.PUEBLOS[i].nombre : this.lugarDe(p); },
  botActividad(p) {
    const id = Object.keys(p.d.misiones.activas)[0];
    if (p.puesto) return 'acá con el puesto, a ver si vendo algo';
    if (id) return `con la misión «${MI.MISIONES[id].nombre}»`;
    const m = p.objetivo && this.mons.get(p.objetivo);
    return m ? `cazando ${m.def.nombre.toLowerCase()}` : 'descansando un toque';
  },
};
