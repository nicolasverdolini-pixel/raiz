// Reglas compartidas entre el celu y el servidor: números del juego, monstruos, mapa.
// Si cambiás un número acá, cambia en los dos lados (el servidor es el que manda).

export const VERSION = 2;
export const TICK = 0.1;                 // el servidor actualiza 10 veces por segundo
export const MUNDO = 125;                // el mapa va de -125 a 125
// Atalayas: pueblos seguros (los monstruos no entran). Se viaja entre las que ya visitaste.
// nivel: para qué nivel es lo que venden sus NPCs (1 a 4).
export const PUEBLOS = [
  { nombre: 'Atalaya del Farol', x: 0, z: 0, r: 9, tier: 1, frase: 'El último farol que todavía arde.' },
  { nombre: 'Atalaya Ahogada', x: -62, z: 46, r: 8, tier: 2, frase: 'El agua le llega a las rodillas. Nadie se acuerda de cuándo subió.' },
  { nombre: 'Atalaya de los Huesos', x: 78, z: -46, r: 8, tier: 3, frase: 'Construida con lo que el Osario no quiso.' },
  { nombre: 'Atalaya Hundida', x: -60, z: -74, r: 8, tier: 3, frase: 'La torre se va tragando a sí misma, piedra por piedra.' },
  { nombre: 'Atalaya Roja', x: 60, z: 70, r: 8, tier: 4, frase: 'El farol arde rojo. Dicen que lo alimentan con Éter del Foso.' },
  { nombre: 'Atalaya de Sal', x: 600, z: 0, r: 8, tier: 5, frase: 'Al otro lado de la Senda Negra. Acá el mar también está muerto.' },
  { nombre: 'Atalaya Calcinada', x: 0, z: 600, r: 8, tier: 6, frase: 'Arde sin leña. Nadie sabe qué la alimenta.' },
  { nombre: 'Atalaya del Último Rey', x: -600, z: 0, r: 8, tier: 7, frase: 'El rey murió de pie. Su guardia todavía lo espera.' },
];
// La Costa de la Sal Negra: una isla aparte, al otro lado de la Senda Negra.
export const COSTA = { x: 600, z: 0, r: 92, nivel: 45 };
// Regiones aparte (islas), cada una al otro lado de una Senda Negra y con su atalaya.
export const ISLAS = [
  { id: 'costa', nombre: 'Costa de la Sal Negra', ...COSTA, atalaya: 5, frase: 'El mar también está muerto.', niveles: '48 a 75' },
  { id: 'yermo', nombre: 'Yermo Calcinado', x: 0, z: 600, r: 100, nivel: 75, atalaya: 6, frase: 'La tierra todavía arde debajo de la ceniza.', niveles: '78 a 112' },
  { id: 'trono', nombre: 'Ciudad del Trono Hundido', x: -600, z: 0, r: 104, nivel: 110, atalaya: 7, frase: 'Acá reinó el último rey del Sol. Todavía reina.', niveles: '114 a 155' },
];
export const islaDe = (x, z) => (Math.abs(x) > 400 || Math.abs(z) > 400 ? ISLAS.find(i => Math.hypot(x - i.x, z - i.z) < i.r + 20) || null : null);
export const enCosta = (x, z) => !!islaDe(x, z);
export const PUEBLO = PUEBLOS[0];
export const enAtalaya = (x, z) => PUEBLOS.findIndex(p => Math.hypot(x - p.x, z - p.z) < p.r);
export const atalayaCercana = (x, z, visitadas) => {
  let mejor = 0, md = 1e9;
  PUEBLOS.forEach((p, i) => { if (visitadas && !visitadas.includes(i)) return; const d = Math.hypot(x - p.x, z - p.z); if (d < md) { md = d; mejor = i; } });
  return mejor;
};
// Recompensa por entrar cada día (hora argentina). La racha sube si venís días seguidos; al 7° vuelve a empezar.
export const hoyAR = (ms = Date.now()) => new Date(ms - 3 * 3600000).toISOString().slice(0, 10);
export const DIARIA = [
  { oro: 300, items: [{ b: 'pocion', c: 10 }] },
  { oro: 500, items: [{ b: 'eter', c: 10 }] },
  { oro: 800, items: [{ b: 'forja', c: 3 }] },
  { oro: 1200, items: [{ b: 'vela', c: 3 }, { b: 'pocion', c: 15 }] },
  { oro: 1600, items: [{ b: 'destino', c: 2 }], gema: 1 },
  { oro: 2200, items: [{ b: 'sello', c: 1 }, { b: 'eter', c: 15 }] },
  { oro: 3500, items: [{ b: 'abismo', c: 1 }, { b: 'guardiana', c: 1 }], gema: 2 },
];
// ---------- Logros y títulos ----------
// cont: qué se cuenta · meta: cuánto · titulo: lo que podés mostrar arriba del nombre · premio: oro (se multiplica por el nivel) y cosas.
const LG = (id, cont, meta, titulo, desc, oro, items = []) => ({ id, cont, meta, titulo, desc, premio: { oro, items } });
export const LOGROS = [
  LG('caza1', 'muertes', 100, 'Cazador', 'Matá 100 monstruos.', 50), LG('caza2', 'muertes', 1000, 'Matarife', 'Matá 1.000 monstruos.', 150, [{ b: 'destino', c: 2 }]),
  LG('caza3', 'muertes', 10000, 'Azote del Páramo', 'Matá 10.000 monstruos.', 600, [{ b: 'abismo', c: 3 }]),
  LG('jefe1', 'jefes', 1, 'Matajefes', 'Vencé a un jefe.', 100, [{ b: 'forja', c: 3 }]), LG('jefe2', 'jefes', 25, 'Verdugo de Reyes', 'Vencé a 25 jefes.', 500, [{ b: 'guardiana', c: 2 }]),
  LG('expl1', 'lugares', 15, 'Caminante', 'Descubrí 15 lugares.', 80, [{ b: 'vela', c: 5 }]), LG('expl2', 'lugares', 45, 'Cartógrafo', 'Descubrí 45 lugares.', 300, [{ b: 'vela', c: 10 }]),
  LG('forja1', 'forja', 7, 'Herrero', 'Forjá un equipo a +7.', 100), LG('forja2', 'forja', 10, 'Maestro Forjador', 'Forjá un equipo a +10.', 300, [{ b: 'guardiana', c: 1 }]),
  LG('forja3', 'forja', 13, 'Mano del Abismo', 'Forjá un equipo a +13.', 800, [{ b: 'abismo', c: 3 }]),
  LG('nivel50', 'nivel', 50, 'Veterano', 'Llegá al nivel 50.', 200), LG('nivel100', 'nivel', 100, 'Leyenda', 'Llegá al nivel 100.', 500), LG('nivel150', 'nivel', 150, 'Inmortal', 'Llegá al nivel 150.', 1000, [{ b: 'abismo', c: 2 }]),
  LG('ren1', 'renaceres', 1, 'Renacido', 'Renacé una vez.', 400), LG('ren5', 'renaceres', 5, 'El que Vuelve', 'Renacé cinco veces.', 1500, [{ b: 'abismo', c: 5 }]),
  LG('mis10', 'misiones', 10, 'Confiable', 'Terminá 10 misiones.', 150), LG('mis30', 'misiones', 30, 'Héroe del Luto', 'Terminá 30 misiones.', 600, [{ b: 'guardiana', c: 2 }]),
  LG('enc25', 'encargos', 25, 'Mercenario', 'Cumplí 25 encargos del tablón.', 300, [{ b: 'destino', c: 3 }]),
  LG('leg1', 'legendarios', 1, 'Afortunado', 'Encontrá un objeto legendario.', 200), LG('mit1', 'miticos', 1, 'Tocado por el Sol', 'Encontrá un objeto mítico.', 600),
  LG('ase1', 'asedios', 1, 'Señor del Bastión', 'Ganá un Asedio con tu hermandad.', 500), LG('san20', 'santuarios', 20, 'Devoto', 'Usá 20 santuarios.', 120),
  LG('alas3', 'alas', 3, 'Alado del Sol', 'Conseguí las Alas del Sol Hondo.', 800),
];
// Objetivos del día: tres por día y por personaje. Cumplidos los tres, se abre un cofre.
export const OBJETIVOS = [
  { cont: 'muertes', meta: [40, 80, 120], texto: n => `Matá ${n} monstruos` },
  { cont: 'jefes', meta: [1, 1, 2], texto: n => `Vencé ${n === 1 ? 'a un jefe' : `a ${n} jefes`}`, desde: 20 },
  { cont: 'encargos', meta: [1, 2, 2], texto: n => `Cumplí ${n === 1 ? 'un encargo' : n + ' encargos'} del tablón` },
  { cont: 'santuarios', meta: [2, 3, 4], texto: n => `Usá ${n} santuarios` },
  { cont: 'forjas', meta: [1, 2, 3], texto: n => `Forjá ${n === 1 ? 'una vez' : n + ' veces'}` },
  { cont: 'misionesHoy', meta: [1, 1, 2], texto: n => `Terminá ${n === 1 ? 'una misión' : n + ' misiones'}` },
  { cont: 'oroJuntado', meta: [800, 3000, 9000], texto: n => `Juntá ${n.toLocaleString('es-AR')} de oro de los monstruos` },
];
export function objetivosDelDia(nivel, rnd) {
  const pool = OBJETIVOS.filter(o => !o.desde || nivel >= o.desde), t = nivel < 30 ? 0 : nivel < 90 ? 1 : 2, lista = [];
  while (lista.length < 3 && pool.length) { const o = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; lista.push({ cont: o.cont, meta: o.meta[t], prog: 0 }); }
  return lista;
}
export const textoObjetivo = o => OBJETIVOS.find(x => x.cont === o.cont)?.texto(o.meta) || '';

export const VEL_JUGADOR = 5.2;
export const MAX_GRUPO = 5;
export const BONUS_GRUPO = 0.1;          // +10% de experiencia por cada compañero
export const DIST_GRUPO = 22;            // hay que estar cerca para compartir experiencia
// Hermandades: se fundan en una atalaya; los hermanos que cazan cerca ganan un poco más de experiencia.
export const HERMANDAD = {
  nivel: 30, oro: 50000, max: 30, bonus: 0.04, bonusMax: 0.2,
  nombreOk: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{1,16}[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]$/,
  simbolos: ['✠', '☩', '⚜', '☠', '✦', '☽', '♆', '⚚', '✶', '♜'],
  colores: ['#c0392b', '#d4a24a', '#8fb2d8', '#8fd16e', '#b07ad8', '#e8e0d0', '#e07a3a', '#5ac8b8'],
};
export const PUNTOS_POR_NIVEL = 6;
export const NIVEL_MAX = 400;

// ---------- Personaje ----------
import { CLASES, ARBOL, calcular } from './clases.js';
import { MOCHILA, BASES } from './objetos.js';
export const STATS = ['fue', 'agi', 'vit', 'ene', 'sue', 'tem'];
export const NOMBRE_STAT = { fue: 'Fuerza', agi: 'Agilidad', vit: 'Vitalidad', ene: 'Energía', sue: 'Suerte', tem: 'Temple' };
// Qué hace cada atributo para TU clase: solo uno sube el daño (el de tu arma).
// Redistribuir atributos: la primera vez es gratis, después cuesta según el nivel.
export const costoRedistribuir = d => (d.redistrib ? Math.max(1000, d.nivel * 400) : 0);
export function explicaStat(s, atributo) {
  const base = { fue: 'La piden los escudos y las armas de fuerza.', agi: 'Pegás más rápido y defendés más.', vit: 'Más vida y algo de defensa. La piden las armaduras.', ene: 'Más energía para las habilidades.',
    sue: 'Más golpes críticos, críticos más fuertes y más oro. Sirve a todas las clases.', tem: 'Resistencia a fuego, hielo, rayo, veneno y sombra, y la vida vuelve más rápido. Sirve a todas las clases.' }[s];
  return s === atributo ? `<b class="principal">Tu daño sale de acá.</b> ${base}` : s === 'fue' ? 'A tu clase no le sirve: no sube tu daño ni la pide tu equipo.' : base;
}

export function nuevoPersonaje(nombre, clase) {
  if (!CLASES[clase]) clase = 'guardian';
  return normalizar({ nombre, clase, nivel: 1, exp: 0, puntos: 0, ...CLASES[clase].base, version: VERSION }, true);
}

// Completa lo que le falte a un personaje (los viejos no tenían clase, equipo ni mochila).
export function normalizar(d, nuevo) {
  if (!CLASES[d.clase]) d.clase = 'guardian';
  if (!d.arbol) d.arbol = { [ARBOL[d.clase][nuevo ? 0 : 1].hab[0].id]: 1 };
  if (!Array.isArray(d.inv)) {
    d.inv = Array(MOCHILA).fill(null);
    d.inv[0] = { b: 'pocion', c: 10 }; d.inv[1] = { b: 'eter', c: 5 }; d.inv[2] = { b: 'vela', c: 1 };
  }
  while (d.inv.length < MOCHILA) d.inv.push(null);
  if (!d.equipo) { d.equipo = {}; for (const [r, b] of Object.entries(CLASES[d.clase].inicio)) d.equipo[r] = { b, n: 0 }; }
  if (d.oro == null) d.oro = 150;
  if (!d.lugares) d.lugares = ['Atalaya del Farol'];
  if (!d.atalayas) d.atalayas = [0];
  if (!d.misiones) d.misiones = { activas: {}, hechas: [], encargos: {} };
  // Versión 2: Suerte y Temple, y un punto más por nivel (se devuelve el de los niveles ya hechos).
  if ((d.version || 1) < 2) {
    const b = CLASES[d.clase].base;
    if (d.sue == null) d.sue = b.sue; if (d.tem == null) d.tem = b.tem;
    if (!nuevo) d.puntos = (d.puntos || 0) + Math.max(0, d.nivel - 1);
    d.version = 2;
  }
  return d;
}

export const expParaSubir = n => Math.round(30 * n * n + 70 * n);
export const derivados = d => calcular(d);

// ---------- Monstruos ----------
// zona: dónde aparecen. agresivo + vista: te atacan si te acercás. jefe: hace falta grupo.
// habs (habilidades): pisoton (golpe en área), invocar (llama ayudantes), rayo (ataque a distancia), carga (embiste).
// veneno: al pegar puede envenenar. distancia: ataca de lejos. furia: con poca vida pega más rápido.
const M = (o) => ({ agresivo: true, vista: 7, radio: 0.55, vel: 3, alcance: 1.4, cadencia: 1.5, reaparece: 10, cantidad: 10, ...o });
export const MONSTRUOS = {
  // ----- comunes -----
  rata:      M({ nombre: 'Rata de Peste', nivel: 1, hp: 45, dano: [3, 6], def: 0, exp: 10, vel: 2.6, alcance: 1.2, cadencia: 1.6, vista: 3, radio: 0.45,
               zona: { x: 0, z: 0, rmin: 12, rmax: 28 }, cantidad: 18, reaparece: 7, desc: 'Se alimentan de lo que el Éter dejó tirado.' }),
  sapo:      M({ nombre: 'Sapo de Ciénaga', nivel: 3, hp: 95, dano: [5, 9], def: 1, exp: 22, vel: 2.2, alcance: 1.3, cadencia: 1.7, vista: 3,
               zona: { x: -32, z: 14, r: 10 }, cantidad: 10, reaparece: 8, desc: 'Se tragaron a los ahogados y croan con sus voces.' }),
  arana:     M({ nombre: 'Tejedora', nivel: 6, hp: 190, dano: [9, 14], def: 3, exp: 48, vista: 6, radio: 0.6,
               zona: { x: 36, z: 8, r: 13 }, cantidad: 13, reaparece: 9, veneno: { prob: 0.2, dps: 3, dura: 4 }, desc: 'Tejen con hilo de Éter. Lo que cae en su tela, queda.' }),
  sierpe:    M({ nombre: 'Sierpe de Brea', nivel: 9, hp: 270, dano: [11, 16], def: 4, exp: 80, vel: 2.8, vista: 6,
               zona: { x: -40, z: 24, r: 14 }, cantidad: 10, veneno: { prob: 0.35, dps: 5, dura: 5 }, desc: 'Nadan en la brea y escupen podredumbre.' }),
  avispon:   M({ nombre: 'Avispón de Carroña', nivel: 10, hp: 320, dano: [14, 20], def: 6, exp: 95, vel: 3.4, cadencia: 1.3,
               zona: { x: -6, z: -38, r: 13 }, cantidad: 13, desc: 'Zumban con las voces de los que se comieron.' }),
  lobo:      M({ nombre: 'Lobo Famélico', nivel: 13, hp: 430, dano: [18, 26], def: 8, exp: 140, vel: 4.2, cadencia: 1.2, vista: 9, radio: 0.6,
               zona: { x: -52, z: 52, r: 16 }, cantidad: 14, desc: 'Cazan en manada. El hambre es lo único que les queda.' }),
  huesudo:   M({ nombre: 'Huesudo', nivel: 15, hp: 680, dano: [22, 32], def: 10, exp: 210, vel: 2.8,
               zona: { x: 40, z: -38, r: 13 }, cantidad: 12, reaparece: 12, desc: 'Muertos que nadie veló. Se levantan solos.' }),
  ciervo:    M({ nombre: 'Ciervo Hueco', nivel: 17, hp: 820, dano: [26, 36], def: 12, exp: 270, vel: 3.6, cadencia: 1.8, radio: 0.8,
               zona: { x: -60, z: 40, r: 14 }, cantidad: 9, reaparece: 14, habs: [{ t: 'carga', cada: 8, alcance: 10, dano: [40, 55] }], desc: 'Tiene el pecho vacío. Embiste igual.' }),
  anima:     M({ nombre: 'Ánima de Cripta', nivel: 22, hp: 900, dano: [30, 42], def: 12, exp: 380, vel: 2.4, alcance: 8, cadencia: 2.2, distancia: 'violeta', vista: 10,
               zona: { x: 62, z: -66, r: 14 }, cantidad: 11, reaparece: 14, desc: 'Magos que siguieron rezando después de morir.' }),
  degollador:M({ nombre: 'Degollador', nivel: 26, hp: 1250, dano: [34, 46], def: 16, exp: 520, vel: 3.8, cadencia: 0.9,
               zona: { x: 66, z: -58, r: 14 }, cantidad: 10, reaparece: 15, desc: 'Rápidos y en silencio. Nunca vienen solos.' }),
  bruto:     M({ nombre: 'Bruto Cenagoso', nivel: 30, hp: 2300, dano: [52, 72], def: 22, exp: 780, vel: 2.4, alcance: 1.8, cadencia: 2.1, radio: 0.9,
               zona: { x: -62, z: -58, r: 15 }, cantidad: 10, reaparece: 16, habs: [{ t: 'pisoton', cada: 9, radio: 3.5, dano: [40, 55] }], desc: 'Carne que se niega a pudrirse.' }),
  acechador: M({ nombre: 'Acechador', nivel: 34, hp: 1900, dano: [46, 62], def: 20, exp: 920, vel: 4.8, cadencia: 1.0, vista: 11, radio: 0.7,
               zona: { x: -54, z: -70, r: 14 }, cantidad: 10, reaparece: 16, habs: [{ t: 'carga', cada: 7, alcance: 12, dano: [55, 75] }], desc: 'Te huele desde lejos. Cuando lo ves, ya es tarde.' }),
  engendro:  M({ nombre: 'Engendro del Éter', nivel: 40, hp: 3300, dano: [66, 90], def: 28, exp: 1450, vel: 3.2, alcance: 1.7, cadencia: 1.5, radio: 0.9,
               zona: { x: 60, z: 62, r: 16 }, cantidad: 12, reaparece: 18, habs: [{ t: 'rayo', cada: 6, alcance: 9, dano: [50, 70], color: 'rojo' }], desc: 'Lo que nace donde el Éter se junta. No debería existir.' }),

  // ----- jefes (hace falta grupo) -----
  ratareina: M({ nombre: 'Rata Reina', nivel: 8, hp: 5000, dano: [24, 34], def: 6, exp: 2600, vel: 2.8, alcance: 2, cadencia: 1.6, radio: 1.1, jefe: true, vista: 8,
               zona: { x: -20, z: -22, r: 1 }, cantidad: 1, reaparece: 180, habs: [{ t: 'pisoton', cada: 8, radio: 4, dano: [20, 30] }, { t: 'invocar', cada: 14, cual: 'rata', n: 4, max: 8 }],
               furia: 0.3, desc: 'Madre de la peste. Sus crías nunca se terminan.' }),
  madretejedora: M({ nombre: 'Madre Tejedora', nivel: 14, hp: 12000, dano: [36, 50], def: 10, exp: 6500, vel: 2.6, alcance: 2.4, cadencia: 1.7, radio: 1.4, jefe: true, vista: 9,
               zona: { x: 42, z: 14, r: 1 }, cantidad: 1, reaparece: 240, veneno: { prob: 0.5, dps: 8, dura: 6 },
               habs: [{ t: 'invocar', cada: 15, cual: 'arana', n: 3, max: 6 }, { t: 'rayo', cada: 7, alcance: 10, dano: [30, 40], color: 'verde', radio: 2.5 }], furia: 0.3,
               desc: 'Teje el Páramo entero. Algún día va a llegar al Farol.' }),
  reinacolmena: M({ nombre: 'Reina de la Colmena', nivel: 18, hp: 16000, dano: [40, 56], def: 12, exp: 9500, vel: 3, alcance: 2.2, cadencia: 1.5, radio: 1.2, jefe: true, vista: 10,
               zona: { x: -8, z: -46, r: 1 }, cantidad: 1, reaparece: 300, habs: [{ t: 'invocar', cada: 12, cual: 'avispon', n: 3, max: 6 }, { t: 'rayo', cada: 5, alcance: 11, dano: [35, 50], color: 'ambar' }],
               furia: 0.3, desc: 'Su zumbido es un rezo al revés.' }),
  centinela: M({ nombre: 'Centinela Hueco', nivel: 25, hp: 22000, dano: [45, 70], def: 18, exp: 14000, vel: 2.6, alcance: 2.6, cadencia: 2.0, radio: 1.2, jefe: true, vista: 9,
               zona: { x: 44, z: -44, r: 1 }, cantidad: 1, reaparece: 300, habs: [{ t: 'pisoton', cada: 7, radio: 4.5, dano: [35, 55] }, { t: 'invocar', cada: 18, cual: 'huesudo', n: 2, max: 4 }],
               furia: 0.25, desc: 'Fue un Guardián. Se cansó de volver al Farol.' }),
  archimago: M({ nombre: 'Archimago de la Cripta', nivel: 32, hp: 30000, dano: [55, 75], def: 20, exp: 22000, vel: 2.2, alcance: 9, cadencia: 2.4, radio: 1.1, jefe: true, vista: 12, distancia: 'violeta',
               zona: { x: 64, z: -72, r: 1 }, cantidad: 1, reaparece: 360, habs: [{ t: 'rayo', cada: 6, alcance: 12, dano: [60, 85], color: 'violeta', radio: 3.5 }, { t: 'invocar', cada: 16, cual: 'anima', n: 2, max: 4 }],
               furia: 0.3, desc: 'Rompió los sellos desde adentro. Todavía sigue rezando.' }),
  bestia:    M({ nombre: 'Bestia del Foso', nivel: 45, hp: 60000, dano: [90, 130], def: 32, exp: 50000, vel: 3.4, alcance: 3.2, cadencia: 2.0, radio: 2, jefe: true, vista: 12,
               zona: { x: 64, z: 66, r: 1 }, cantidad: 1, reaparece: 480, habs: [{ t: 'pisoton', cada: 8, radio: 6, dano: [70, 100] }, { t: 'carga', cada: 11, alcance: 14, dano: [110, 150] }],
               furia: 0.3, desc: 'El Foso la escupió. Nadie sabe qué más hay abajo.' }),
  heraldo:   M({ nombre: 'Heraldo del Éter', nivel: 50, hp: 90000, dano: [100, 150], def: 34, exp: 80000, vel: 3.2, alcance: 2.6, cadencia: 1.8, radio: 1.4, jefe: true, vista: 14,
               zona: { x: 0, z: 0, r: 1 }, cantidad: 0, reaparece: 0, soloEvento: true,
               habs: [{ t: 'rayo', cada: 5, alcance: 14, dano: [80, 110], color: 'rojo', radio: 3 }, { t: 'pisoton', cada: 9, radio: 5, dano: [70, 100] }, { t: 'invocar', cada: 20, cual: 'engendro', n: 2, max: 4 }],
               furia: 0.3, desc: 'Llega con la Noche Roja. Viene a buscar Guardianes.' }),
};
export const TIPOS = Object.keys(MONSTRUOS);   // (se le suman los de la Costa más abajo)
const K = 1.45;   // el mapa es más grande: todo lo que no es el centro se aleja
for (const m of Object.values(MONSTRUOS)) if (m.zona.x || m.zona.z) { m.zona.x = Math.round(m.zona.x * K); m.zona.z = Math.round(m.zona.z * K); if (m.zona.r > 1) m.zona.r = Math.round(m.zona.r * 1.2); }
// ----- monstruos de la Costa de la Sal Negra (nivel 48 a 75) -----
Object.assign(MONSTRUOS, {
  ahogado:   M({ nombre: 'Ahogado', nivel: 48, hp: 4200, dano: [80, 105], def: 32, exp: 2100, vel: 2.6, alcance: 1.7, radio: 0.8, vista: 9,
               zona: { x: 640, z: -40, r: 18 }, cantidad: 14, reaparece: 16, desc: 'Salió del mar caminando. No sabe que está muerto.' }),
  marinero:  M({ nombre: 'Marinero Hueco', nivel: 52, hp: 4600, dano: [88, 115], def: 34, exp: 2500, vel: 3, zona: { x: 560, z: -50, r: 17 }, cantidad: 12, reaparece: 16,
               desc: 'Todavía canta las canciones del barco. Sin lengua.' }),
  abisal:    M({ nombre: 'Tejedora Abisal', nivel: 55, hp: 5200, dano: [95, 125], def: 36, exp: 2900, radio: 0.7, zona: { x: 550, z: 40, r: 17 }, cantidad: 12, reaparece: 16,
               veneno: { prob: 0.3, dps: 30, dura: 5 }, desc: 'Teje con algas negras. El veneno huele a sal.' }),
  farero:    M({ nombre: 'Farero Ánima', nivel: 58, hp: 5000, dano: [100, 130], def: 34, exp: 3200, vel: 2.4, alcance: 9, cadencia: 2.1, distancia: 'azul', vista: 11,
               zona: { x: 620, z: 60, r: 15 }, cantidad: 10, reaparece: 17, desc: 'Sigue encendiendo un faro que ya no existe.' }),
  pirata:    M({ nombre: 'Pirata Degollado', nivel: 60, hp: 6800, dano: [110, 145], def: 38, exp: 3600, vel: 4, cadencia: 0.9, zona: { x: 652, z: 48, r: 15 }, cantidad: 10, reaparece: 17,
               desc: 'Le cortaron el cuello por traidor. No le importó.' }),
  brutosal:  M({ nombre: 'Bruto de Sal', nivel: 62, hp: 9500, dano: [130, 170], def: 44, exp: 4300, vel: 2.4, alcance: 1.9, cadencia: 2.1, radio: 0.9,
               zona: { x: 600, z: -72, r: 16 }, cantidad: 10, reaparece: 18, habs: [{ t: 'pisoton', cada: 9, radio: 4, dano: [110, 140] }], desc: 'La sal lo conservó. Demasiado bien.' }),
  leviatanmenor: M({ nombre: 'Leviatán Menor', nivel: 66, hp: 9000, dano: [140, 180], def: 44, exp: 5000, vel: 4.6, cadencia: 1.1, vista: 12, radio: 0.8,
               zona: { x: 668, z: -12, r: 16 }, cantidad: 10, reaparece: 18, habs: [{ t: 'carga', cada: 7, alcance: 13, dano: [170, 220] }, { t: 'rayo', cada: 8, alcance: 9, dano: [120, 150], color: 'azul' }],
               desc: 'Cría de algo que todavía duerme en la Fosa.' }),
  reinaahogada: M({ nombre: 'Reina Ahogada', nivel: 60, hp: 120000, dano: [150, 200], def: 40, exp: 90000, vel: 2.6, alcance: 2.6, cadencia: 1.8, radio: 1.6, jefe: true, vista: 11,
               zona: { x: 646, z: -58, r: 1 }, cantidad: 1, reaparece: 480, veneno: { prob: 0.4, dps: 40, dura: 6 },
               habs: [{ t: 'invocar', cada: 15, cual: 'ahogado', n: 3, max: 6 }, { t: 'pisoton', cada: 9, radio: 5, dano: [130, 170] }], furia: 0.3,
               desc: 'Se tragó a la flota entera. Todavía tiene hambre.' }),
  capitan:   M({ nombre: 'Capitán sin Rostro', nivel: 68, hp: 160000, dano: [170, 230], def: 46, exp: 130000, vel: 2.8, alcance: 2.8, cadencia: 1.9, radio: 1.3, jefe: true, vista: 12,
               zona: { x: 664, z: 64, r: 1 }, cantidad: 1, reaparece: 540, habs: [{ t: 'invocar', cada: 16, cual: 'pirata', n: 2, max: 4 }, { t: 'pisoton', cada: 8, radio: 5, dano: [150, 190] }], furia: 0.25,
               desc: 'Perdió la cara en la tormenta. Busca una nueva.' }),
  leviatan:  M({ nombre: 'Leviatán', nivel: 75, hp: 260000, dano: [220, 300], def: 52, exp: 220000, vel: 3.6, alcance: 3.6, cadencia: 2.0, radio: 2.2, jefe: true, vista: 14,
               zona: { x: 684, z: -22, r: 1 }, cantidad: 1, reaparece: 600,
               habs: [{ t: 'carga', cada: 10, alcance: 15, dano: [260, 340] }, { t: 'pisoton', cada: 8, radio: 6.5, dano: [200, 260] }, { t: 'rayo', cada: 6, alcance: 14, dano: [180, 230], color: 'azul', radio: 3.5 }], furia: 0.3,
               desc: 'Lo que dormía en la Fosa. Ya no duerme.' }),
});
TIPOS.push(...['ahogado', 'marinero', 'abisal', 'farero', 'pirata', 'brutosal', 'leviatanmenor', 'reinaahogada', 'capitan', 'leviatan']);
// ----- Yermo Calcinado (75 a 110) y Ciudad del Trono Hundido (110 a 150) -----
Object.assign(MONSTRUOS, {
  calcinado: M({ nombre: 'Calcinado', nivel: 78, hp: 10800, dano: [168, 216], def: 52, exp: 6210, zona: { x: -40, z: 570, r: 18 }, cantidad: 14, reaparece: 18, vel: 2.8,
               desc: 'Ardió hasta el hueso y siguió caminando.' }),
  perrobrasa: M({ nombre: 'Perro de Brasa', nivel: 82, hp: 9700, dano: [164, 211], def: 55, exp: 5640, zona: { x: 35, z: 562, r: 17 }, cantidad: 14, reaparece: 18, vel: 4.6, cadencia: 1.0, radio: 0.6, vista: 10,
               desc: 'Corre en jauría. Donde muerde, quema.' }),
  tejedoraceniza: M({ nombre: 'Tejedora de Ceniza', nivel: 86, hp: 12000, dano: [187, 241], def: 57, exp: 7050, zona: { x: -55, z: 620, r: 17 }, cantidad: 12, reaparece: 18, radio: 0.7, veneno: { prob: 0.35, dps: 60, dura: 5 },
               desc: 'Su tela es de ceniza caliente. Se pega y arde.' }),
  diablo: M({ nombre: 'Diablo Menor', nivel: 90, hp: 12700, dano: [197, 253], def: 60, exp: 7480, zona: { x: 50, z: 610, r: 16 }, cantidad: 12, reaparece: 18, vel: 3.4, alcance: 1.7,
               desc: 'Lo echaron del Foso por ser chico. Se vengó con todos.' }),
  devorador: M({ nombre: 'Devorador de Escoria', nivel: 95, hp: 14800, dano: [219, 282], def: 63, exp: 8830, zona: { x: 10, z: 655, r: 17 }, cantidad: 10, reaparece: 18, vel: 4.2, vista: 12, radio: 0.8, habs: [{ t: 'carga', cada: 7, alcance: 13, dano: [380, 470] }],
               desc: 'Come piedra caliente. También come gente.' }),
  coloso: M({ nombre: 'Coloso de Escoria', nivel: 100, hp: 19900, dano: [262, 336], def: 67, exp: 12010, zona: { x: -30, z: 660, r: 16 }, cantidad: 9, reaparece: 20, vel: 2.4, alcance: 2.0, cadencia: 2.1, radio: 1.0, habs: [{ t: 'pisoton', cada: 9, radio: 4.5, dano: [360, 440] }],
               desc: 'Una montaña de metal fundido que aprendió a odiar.' }),
  sacerdoteazufre: M({ nombre: 'Sacerdote de Azufre', nivel: 104, hp: 14800, dano: [231, 297], def: 69, exp: 9030, zona: { x: 62, z: 648, r: 15 }, cantidad: 10, reaparece: 20, vel: 2.4, alcance: 9, cadencia: 2.1, distancia: 'rojo', vista: 11,
               desc: 'Reza al fuego. El fuego le contesta.' }),
  senorbrasas: M({ nombre: 'Señor de las Brasas', nivel: 106, hp: 447000, dano: [354, 454], def: 82, exp: 417000, jefe: true, vista: 13, radio: 1.6, alcance: 3, cadencia: 1.9, vel: 2.8,
               zona: { x: -62, z: 545, r: 1 }, cantidad: 1, reaparece: 600, furia: 0.3, habs: [{ t: 'invocar', cada: 15, cual: 'diablo', n: 3, max: 6 }, { t: 'pisoton', cada: 8, radio: 6, dano: [520, 640] }],
               desc: 'Se sentó en el trono del Foso. Ahora quiere el mundo.' }),
  grandevorador: M({ nombre: 'Gran Devorador', nivel: 112, hp: 580000, dano: [375, 483], def: 86, exp: 447000, jefe: true, vista: 13, radio: 1.6, alcance: 3, cadencia: 1.9, vel: 2.8,
               zona: { x: 18, z: 668, r: 1 }, cantidad: 1, reaparece: 660, furia: 0.3, habs: [{ t: 'carga', cada: 9, alcance: 16, dano: [640, 780] }, { t: 'pisoton', cada: 8, radio: 7, dano: [560, 680] }, { t: 'rayo', cada: 6, alcance: 14, dano: [480, 560], color: 'rojo', radio: 3.5 }],
               desc: 'Se comió un volcán entero. Todavía tiene hambre.' }),
  guardiareal: M({ nombre: 'Guardia Real', nivel: 114, hp: 16400, dano: [255, 328], def: 76, exp: 10180, zona: { x: -560, z: -35, r: 18 }, cantidad: 14, reaparece: 18, alcance: 1.8,
               desc: 'Juró cuidar al rey. La muerte no le pareció excusa.' }),
  espectrocorte: M({ nombre: 'Espectro de la Corte', nivel: 118, hp: 14500, dano: [245, 314], def: 79, exp: 9050, zona: { x: -635, z: -40, r: 17 }, cantidad: 12, reaparece: 18, vel: 2.6, alcance: 9, cadencia: 2.0, distancia: 'azul', vista: 11,
               desc: 'Bailaba en el salón. Sigue bailando, sin cuerpo.' }),
  sabueso: M({ nombre: 'Sabueso del Rey', nivel: 122, hp: 15000, dano: [254, 326], def: 81, exp: 9450, zona: { x: -545, z: 20, r: 17 }, cantidad: 14, reaparece: 18, vel: 4.8, cadencia: 1.0, radio: 0.6, vista: 10,
               desc: 'Lo dejaron atado en la puerta. Se soltó.' }),
  verdugo: M({ nombre: 'Verdugo', nivel: 127, hp: 18500, dano: [288, 370], def: 85, exp: 11710, zona: { x: -655, z: 15, r: 16 }, cantidad: 12, reaparece: 18, vel: 3.6, cadencia: 1.2,
               desc: 'Cortó mil cabezas por orden del rey. Le faltan algunas.' }),
  gargola: M({ nombre: 'Gárgola', nivel: 132, hp: 19300, dano: [300, 386], def: 88, exp: 12310, zona: { x: -585, z: 58, r: 17 }, cantidad: 12, reaparece: 18, vel: 3.8, vista: 11,
               desc: 'Era de piedra. Ya no.' }),
  caballerohueco: M({ nombre: 'Caballero Hueco', nivel: 138, hp: 26300, dano: [359, 462], def: 92, exp: 16960, zona: { x: -620, z: 62, r: 15 }, cantidad: 10, reaparece: 20, vel: 3.0, alcance: 2.0, radio: 0.9, habs: [{ t: 'carga', cada: 8, alcance: 13, dano: [600, 740] }],
               desc: 'La armadura está vacía. Pega igual.' }),
  arzobispo: M({ nombre: 'Arzobispo Muerto', nivel: 144, hp: 25500, dano: [362, 465], def: 96, exp: 16540, zona: { x: -540, z: -60, r: 15 }, cantidad: 9, reaparece: 22, vel: 2.4, alcance: 10, cadencia: 2.2, distancia: 'violeta', vista: 12, habs: [{ t: 'invocar', cada: 18, cual: 'guardiareal', n: 2, max: 4 }],
               desc: 'Coronó al último rey. Ahora lo sirve de otra forma.' }),
  reinahueca: M({ nombre: 'La Reina Hueca', nivel: 140, hp: 660000, dano: [480, 618], def: 107, exp: 598000, jefe: true, vista: 13, radio: 1.6, alcance: 3, cadencia: 1.9, vel: 2.8,
               zona: { x: -662, z: -62, r: 1 }, cantidad: 1, reaparece: 660, furia: 0.3, habs: [{ t: 'invocar', cada: 15, cual: 'espectrocorte', n: 3, max: 6 }, { t: 'rayo', cada: 6, alcance: 14, dano: [700, 820], color: 'violeta', radio: 3.5 }],
               desc: 'Sobrevivió al rey cien años. Sola, en el salón vacío.' }),
  ultimorey: M({ nombre: 'El Último Rey', nivel: 155, hp: 1012000, dano: [537, 690], def: 118, exp: 683000, jefe: true, vista: 13, radio: 1.6, alcance: 3, cadencia: 1.9, vel: 2.8,
               zona: { x: -606, z: 86, r: 1 }, cantidad: 1, reaparece: 720, furia: 0.3, habs: [{ t: 'invocar', cada: 14, cual: 'caballerohueco', n: 2, max: 4 }, { t: 'carga', cada: 9, alcance: 16, dano: [900, 1080] }, { t: 'pisoton', cada: 7, radio: 7, dano: [800, 960] }],
               desc: 'El rey del Sol Hondo. Murió cuando se apagó. No se enteró.' }),
});
TIPOS.push('calcinado', 'perrobrasa', 'tejedoraceniza', 'diablo', 'devorador', 'coloso', 'sacerdoteazufre', 'senorbrasas', 'grandevorador',
  'guardiareal', 'espectrocorte', 'sabueso', 'verdugo', 'gargola', 'caballerohueco', 'arzobispo', 'reinahueca', 'ultimorey');
// ---------- Elementos ----------
// Cada habilidad y cada ataque de monstruo puede ser de un elemento. Contra uno débil pega 50% más; contra uno que resiste, la mitad.
export const ELEMENTOS = {
  fuego: { nombre: 'Fuego', color: '#ff6a2a' }, hielo: { nombre: 'Hielo', color: '#8fd0ff' }, rayo: { nombre: 'Rayo', color: '#f0e060' },
  veneno: { nombre: 'Veneno', color: '#7fd04a' }, sombra: { nombre: 'Sombra', color: '#b07ad8' },
};
export const DEBIL = 1.5, RESISTE = 0.5;
// atk: elemento de su ataque · debil / resiste: contra qué.
const AF = (atk, debil, resiste) => ({ atk, debil, resiste });
const AFIN = {
  rata: AF(null, 'fuego', null), sapo: AF('veneno', 'fuego', 'veneno'), arana: AF('veneno', 'fuego', 'veneno'), sierpe: AF('veneno', 'hielo', 'veneno'),
  avispon: AF('veneno', 'fuego', 'veneno'), lobo: AF(null, 'rayo', null), huesudo: AF(null, 'fuego', 'sombra'), ciervo: AF(null, 'rayo', null),
  anima: AF('sombra', 'fuego', 'sombra'), degollador: AF(null, 'fuego', 'sombra'), bruto: AF(null, 'hielo', 'veneno'), acechador: AF(null, 'rayo', null),
  engendro: AF('fuego', 'hielo', 'fuego'), ratareina: AF('veneno', 'fuego', 'veneno'), madretejedora: AF('veneno', 'fuego', 'veneno'), reinacolmena: AF('veneno', 'fuego', 'veneno'),
  centinela: AF(null, 'fuego', 'sombra'), archimago: AF('sombra', 'fuego', 'sombra'), bestia: AF('fuego', 'hielo', 'fuego'), heraldo: AF('fuego', 'hielo', 'fuego'),
  ahogado: AF('hielo', 'rayo', 'hielo'), marinero: AF('hielo', 'rayo', 'hielo'), abisal: AF('veneno', 'fuego', 'veneno'), farero: AF('hielo', 'fuego', 'hielo'),
  pirata: AF(null, 'rayo', 'hielo'), brutosal: AF('hielo', 'fuego', 'hielo'), leviatanmenor: AF('rayo', 'rayo', 'hielo'), reinaahogada: AF('veneno', 'rayo', 'hielo'),
  capitan: AF('hielo', 'rayo', 'hielo'), leviatan: AF('rayo', 'rayo', 'hielo'),
  calcinado: AF('fuego', 'hielo', 'fuego'), perrobrasa: AF('fuego', 'hielo', 'fuego'), tejedoraceniza: AF('fuego', 'hielo', 'fuego'), diablo: AF('fuego', 'hielo', 'fuego'),
  devorador: AF('fuego', 'hielo', 'fuego'), coloso: AF('fuego', 'rayo', 'fuego'), sacerdoteazufre: AF('fuego', 'hielo', 'fuego'), senorbrasas: AF('fuego', 'hielo', 'fuego'), grandevorador: AF('fuego', 'hielo', 'fuego'),
  guardiareal: AF(null, 'rayo', 'sombra'), espectrocorte: AF('sombra', 'fuego', 'hielo'), sabueso: AF('hielo', 'fuego', 'hielo'), verdugo: AF('sombra', 'rayo', 'sombra'),
  gargola: AF(null, 'rayo', 'veneno'), caballerohueco: AF('sombra', 'rayo', 'sombra'), arzobispo: AF('sombra', 'fuego', 'sombra'), reinahueca: AF('hielo', 'fuego', 'hielo'), ultimorey: AF('sombra', 'rayo', 'sombra'),
};
for (const [k, a] of Object.entries(AFIN)) if (MONSTRUOS[k]) Object.assign(MONSTRUOS[k], { elem: a.atk, debil: a.debil, resiste: a.resiste });
export const multElemento = (def, elem) => (!elem ? 1 : def.debil === elem ? DEBIL : def.resiste === elem ? RESISTE : 1);

export const CAMPEON = { prob: 0.06, probNoche: 0.25, hp: 3, dano: 1.4, exp: 3.5, escala: 1.3 };

// ---------- Eventos con horario (hora del servidor) ----------
// cada: cada cuántos minutos · desfase: minuto en que arranca · dura: minutos
export const EVENTOS = [
  { id: 'marea', nombre: 'Marea de Éter', cada: 90, desfase: 0, dura: 5, exp: 2,
    desc: 'El Éter desborda: doble experiencia y los monstruos vuelven más rápido.' },
  { id: 'noche', nombre: 'Noche Roja', cada: 240, desfase: 105, dura: 10, exp: 1.5,
    desc: 'El cielo sangra. Aparecen campeones por todos lados y llega el Heraldo del Éter.' },
  { id: 'pozo', nombre: 'Pozo de las Almas', cada: 120, desfase: 45, dura: 13, entrada: 3,
    desc: 'Se abre la entrada por 3 minutos (hace falta un Sello del Pozo, lo vende Oria). Adentro: oleadas cada vez peores y un jefe al final.' },
  { id: 'asedio', nombre: 'Asedio del Bastión', cada: 240, desfase: 225, dura: 12,
    desc: 'Las hermandades pelean por el Bastión Caído (se entra con Oria). La que domine el altar manda hasta el próximo asedio.' },
];
// Bastión Caído: arena de las hermandades. Solo ahí los jugadores se pueden pegar entre sí.
export const BASTION = { x: -300, z: 300, r: 24, altar: 5, nivelMin: 30, porSegundo: 1, porMuerte: 3, minimo: 10,
  premio: { ganador: 30000, otros: 5000 }, bonusExp: 0.1, pvp: 0.5 };
export const enBastion = (x, z) => Math.hypot(x - BASTION.x, z - BASTION.z) < BASTION.r + 4;
// Arena del Pozo: un lugar aparte, lejos del Páramo.
export const POZO = { x: 300, z: 300, r: 17, oleadas: 8, nivelMin: 10 };
export const enPozo = (x, z) => Math.hypot(x - POZO.x, z - POZO.z) < POZO.r + 4;
// Renacer: volver a nivel 1 con puntos de regalo que se suman cada vez.
export const RENACER = { nivel: 150, puntos: 150, habilidad: 10, oro: n => 20000 * (n + 1) };
export function estadoEventos(ms) {
  const min = ms / 60000;
  let activo = null, proximo = null;
  for (const e of EVENTOS) {
    const fase = ((min - e.desfase) % e.cada + e.cada) % e.cada;
    if (fase < e.dura) { if (!activo) activo = { ...e, resta: (e.dura - fase) * 60 }; }
    const en = (e.cada - fase) * 60;
    if (!proximo || en < proximo.en) proximo = { ...e, en };
  }
  return { activo, proximo };
}

// ---------- Historia ----------
export const LORE = [
  'Hace siglos se apagó el Sol Hondo, y la noche no terminó más.',
  'El Éter, lo que queda de las almas, ya no sube al cielo: se queda en la tierra y la pudre. De ahí salen los monstruos.',
  'Vos sos un Guardián. No podés morir del todo: cada vez que caés, despertás junto al Farol.',
  'Cada monstruo que matás suelta su Éter. Lo absorbés, y te hacés más fuerte.',
  'Las Sendas unen los faroles apagados. Cada uno que se encienda va a abrir una tierra nueva, más podrida que la anterior.',
  'No hay final. La noche no se termina. Solo se resiste.',
];

// ---------- Mapa: Páramo del Luto ----------
export const MAPA = {
  nombre: 'Páramo del Luto',
  lugares: [
    { nombre: 'Atalaya del Farol', x: 0, z: 0, frase: 'El último farol que todavía arde.' },
    { nombre: 'Ciénaga Podrida', x: -34, z: 18, frase: 'El agua recuerda a los que se ahogaron.' },
    { nombre: 'Colmena Negra', x: -6, z: -40, frase: 'Zumban con las voces de los muertos.' },
    { nombre: 'Nido de Tejedoras', x: 38, z: 10, frase: 'Todo lo que cae en la tela, queda.' },
    { nombre: 'Osario', x: 42, z: -40, frase: 'Los huesos no descansan si nadie los vela.' },
    { nombre: 'Bosque de los Colgados', x: -56, z: 48, frase: 'Los árboles dan frutos que nadie quiere nombrar.' },
    { nombre: 'Cripta Abierta', x: 64, z: -66, frase: 'Alguien rompió los sellos desde adentro.' },
    { nombre: 'Pantano de los Brutos', x: -60, z: -62, frase: 'Acá la carne todavía pelea por seguir viva.' },
    { nombre: 'Foso del Éter', x: 62, z: 64, frase: 'Donde el Éter se junta, la tierra sangra.' },
  ],
};
for (const l of MAPA.lugares) { l.x = Math.round(l.x * K); l.z = Math.round(l.z * K); }
MAPA.lugares.push(
  { nombre: 'Playa de los Ahogados', x: 640, z: -40, frase: 'La marea trae cuerpos. A veces se van caminando.' },
  { nombre: 'Arrecife de Huesos', x: 560, z: -50, frase: 'El coral creció sobre los que se hundieron.' },
  { nombre: 'Coral Muerto', x: 550, z: 40, frase: 'Un bosque bajo el agua que se quedó sin agua.' },
  { nombre: 'Faro Caído', x: 630, z: 58, frase: 'Su luz se apagó la misma noche que el Sol Hondo.' },
  { nombre: 'Fosa de la Sal', x: 676, z: -18, frase: 'El mar se abre hacia abajo. Algo respira ahí.' },
  { nombre: 'Salinas', x: 600, z: -72, frase: 'Sal blanca, cuerpos blancos. Nadie viene a buscarla.' });
MAPA.lugares.push(
  { nombre: 'Campo de los Calcinados', x: -40, z: 570, frase: 'Quedaron parados donde los alcanzó el fuego.' },
  { nombre: 'Grieta de Brasa', x: 35, z: 562, frase: 'La tierra se abrió y nunca se volvió a cerrar.' },
  { nombre: 'Nido de Ceniza', x: -55, z: 620, frase: 'Las telas cuelgan como humo quieto.' },
  { nombre: 'Trono del Foso', x: -62, z: 545, frase: 'Alguien se sentó acá. Todavía está caliente.' },
  { nombre: 'Fundición Muerta', x: -30, z: 660, frase: 'El metal se fundió solo. Después se levantó.' },
  { nombre: 'Boca del Volcán', x: 18, z: 668, frase: 'Respira. Despacio, pero respira.' },
  { nombre: 'Templo del Azufre', x: 62, z: 648, frase: 'Rezan con los ojos cerrados para no ver lo que rezan.' },
  { nombre: 'Puerta de la Ciudad', x: -560, z: -35, frase: 'Las puertas están abiertas. Nadie entra igual.' },
  { nombre: 'Salón de Baile', x: -635, z: -40, frase: 'La música terminó hace cien años. Ellos no.' },
  { nombre: 'Perreras Reales', x: -545, z: 20, frase: 'Las cadenas están rotas desde adentro.' },
  { nombre: 'Patíbulo', x: -655, z: 15, frase: 'La soga todavía se mueve sin viento.' },
  { nombre: 'Tejados de Piedra', x: -585, z: 58, frase: 'Las estatuas miran para abajo. Esperan.' },
  { nombre: 'Aposentos de la Reina', x: -662, z: -62, frase: 'Un espejo roto en cada pared.' },
  { nombre: 'Catedral Hundida', x: -540, z: -60, frase: 'La campana suena sola a medianoche.' },
  { nombre: 'Sala del Trono', x: -606, z: 86, frase: 'El rey sigue sentado. Te está mirando.' });
MAPA.lugares.push(...PUEBLOS.slice(1).map(p => ({ nombre: p.nombre, x: p.x, z: p.z, frase: p.frase, atalaya: true })));
// Campamentos: llenan los huecos del Páramo. Cada uno tiene su manada y un santuario que da fuerzas por un rato.
export const SANTUARIOS = {
  furia: { nombre: 'Santuario de la Furia', color: '#ff5a3a', ef: { dmgPct: 25 }, texto: '+25% de daño' },
  prisa: { nombre: 'Santuario de la Prisa', color: '#e9c37a', ef: { vel: 25 }, texto: 'pegás 25% más rápido' },
  piedra: { nombre: 'Santuario de la Piedra', color: '#8fb2d8', ef: { menos: 20 }, texto: '20% menos de daño recibido' },
  sed: { nombre: 'Santuario de la Sed', color: '#c0304a', ef: { robo: 6 }, texto: 'robás 6% de vida al pegar' },
};
export const SANTUARIO = { dura: 60, espera: 150, radio: 2.6 };
export const CAMPAMENTOS = [
  { nombre: 'Campamento de los Desertores', x: -105, z: -30, frase: 'Huyeron de la guerra. La guerra los encontró igual.', mons: [['huesudo', 4], ['lobo', 3]], santuario: 'furia' },
  { nombre: 'Ermita Quemada', x: -100, z: 15, frase: 'Rezaban para que no llegara la noche. Llegó.', mons: [['sierpe', 4], ['ciervo', 2]], santuario: 'piedra' },
  { nombre: 'Charca de Brea', x: -62, z: -18, frase: 'Lo que se hunde acá no flota nunca más.', mons: [['sierpe', 3], ['avispon', 3]], santuario: 'prisa' },
  { nombre: 'Tumbas sin Nombre', x: -105, z: 105, frase: 'Nadie talló los nombres. Nadie los extraña.', mons: [['ciervo', 3], ['bruto', 2]], santuario: 'sed' },
  { nombre: 'Puente de los Ahorcados', x: -10, z: 95, frase: 'El río se secó. Las sogas siguen.', mons: [['lobo', 4], ['ciervo', 2]], santuario: 'prisa' },
  { nombre: 'Mojón del Peregrino', x: 25, z: 60, frase: 'Una piedra marca el camino. Nadie sabe adónde.', mons: [['sapo', 4], ['arana', 3]], santuario: 'piedra' },
  { nombre: 'Hondonada Gris', x: 30, z: 112, frase: 'La niebla se junta acá y no se va.', mons: [['degollador', 3], ['anima', 3]], santuario: 'furia' },
  { nombre: 'Hondonada de las Cruces', x: 15, z: -105, frase: 'Cruces torcidas, todas mirando para el mismo lado.', mons: [['huesudo', 4], ['anima', 2]], santuario: 'sed' },
  { nombre: 'Torre del Vigía Loco', x: 105, z: 0, frase: 'Vigiló tanto que se olvidó de qué.', mons: [['degollador', 3], ['acechador', 3]], santuario: 'furia' },
  { nombre: 'Cantera Abandonada', x: 110, z: 40, frase: 'Sacaron piedra hasta que la piedra empezó a sangrar.', mons: [['bruto', 3], ['engendro', 2]], santuario: 'piedra' },
];
for (const c of CAMPAMENTOS) { c.sx = c.x + 3.5; c.sz = c.z + 2.5; MAPA.lugares.push({ nombre: c.nombre, x: c.x, z: c.z, frase: c.frase, campamento: true }); }
export const CIENAGA = { x: MONSTRUOS.sapo.zona.x, z: MONSTRUOS.sapo.zona.z };

// Altura del piso: suave, plana en la atalaya y en la ciénaga. La usan los dos lados.
export function altura(x, z) {
  const isla = (Math.abs(x) > 400 || Math.abs(z) > 400) && ISLAS.find(i => Math.hypot(x - i.x, z - i.z) < i.r + 80);
  if (isla) {   // islas: la Costa con dunas, el Yermo con lomas quebradas, el Trono casi plano (era una ciudad)
    const lx = x - isla.x, lz = z - isla.z, d = Math.hypot(lx, lz);
    let h = isla.id === 'costa' ? Math.sin(lx * 0.07) * 0.6 + Math.cos(lz * 0.06 + lx * 0.03) * 0.5 + Math.sin((lx - lz) * 0.17) * 0.12
      : isla.id === 'yermo' ? Math.abs(Math.sin(lx * 0.06) + Math.cos(lz * 0.05 + lx * 0.02)) * 0.9 - 0.4 + Math.sin((lx + lz) * 0.21) * 0.15
      : Math.sin(lx * 0.05) * 0.25 + Math.cos(lz * 0.04) * 0.2;
    for (const p of PUEBLOS) { const dp = Math.hypot(x - p.x, z - p.z); if (dp < p.r + 5) h *= Math.max(0, (dp - p.r) / 5); }
    if (d > isla.r - 8) h -= (d - (isla.r - 8)) * 0.35;
    return h;
  }
  if (Math.abs(x) > 200) return 0;
  let h = Math.sin(x * 0.11) * 0.45 + Math.cos(z * 0.09 + x * 0.04) * 0.5 + Math.sin((x + z) * 0.23) * 0.15;
  for (const p of PUEBLOS) { const dp = Math.hypot(x - p.x, z - p.z); if (dp < p.r + 5) h *= Math.max(0, (dp - p.r) / 5); }
  const dc = Math.hypot(x + 46, z - 20);
  if (dc < 9) h = h * Math.max(0, (dc - 6) / 3) - (dc < 6 ? 0.25 : 0);
  const borde = Math.max(0, Math.abs(x) - (MUNDO - 8)) + Math.max(0, Math.abs(z) - (MUNDO - 8));
  return h + borde * borde * 0.35;
}

// Número al azar repetible (el mismo mapa en todos los celus).
export function azar(semilla) {
  let a = semilla | 0;
  return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// Caminos de tierra desde el pueblo a cada zona.
export function enCamino(x, z) {
  for (const l of MAPA.lugares) {
    if (!l.x && !l.z) continue;
    const L = Math.hypot(l.x, l.z), t = Math.max(0, Math.min(1, (x * l.x + z * l.z) / (L * L)));
    const curva = Math.sin(t * Math.PI) * 3;
    const px = l.x * t - l.z / L * curva, pz = l.z * t + l.x / L * curva;
    if (Math.hypot(x - px, z - pz) < 1.6) return true;
  }
  return false;
}

// Tipos de golpe: 0 normal, 1 crítico, 2 excelente, 3 habilidad, 4 recibido.
export const GOLPE = { NORMAL: 0, CRITICO: 1, EXCELENTE: 2, HABILIDAD: 3 };

// ---------- Equilibrio de dificultad ----------
// La vida y el daño de cada monstruo se calculan contra un personaje de referencia de su nivel (equipo de esa época,
// algo forjado, puntos repartidos con sentido), para que en cualquier región un monstruo común muera en unos segundos
// y te dure lo mismo. Cada monstruo conserva su carácter: los que eran más duros o más dañinos que sus vecinos lo siguen siendo.
{
  const REQS = [1, 10, 24, 38, 55, 80, 115], SET = ['cuero', 'vigia', 'osario', 'foso', 'velo', 'escoria', 'rey'];
  const ref = (clase, L) => {
    const c = CLASES[clase], d = { clase, nivel: L, ...c.base, puntos: 0 }, pts = (L - 1) * PUNTOS_POR_NIVEL;
    d[c.atributo] += Math.round(pts * 0.55); d.vit += Math.round(pts * 0.3); d.sue += Math.round(pts * 0.1); d.tem += Math.round(pts * 0.05);
    let t = 0; REQS.forEach((r, i) => { if (L >= r) t = i; });
    const arma = BASES[c.arma + (t + 1)];
    d.equipo = { arma: { b: arma.id, n: Math.min(9, 2 + t) } };
    for (const r of ['casco', 'armadura', 'guantes', 'botas']) d.equipo[r] = { b: `${r}_${SET[t]}`, n: Math.min(7, 1 + t) };
    return calcular(d);
  };
  const cache = {};
  const medio = L => cache[L] || (cache[L] = (() => {
    const vs = ['guardian', 'arcanista', 'cazadora'].map(c => ref(c, L));
    const prom = k => vs.reduce((a, v) => a + k(v), 0) / vs.length;
    return { dano: prom(v => (v.dmin + v.dmax) / 2 * (1 + v.crit / 100 * v.critDano / 100) * 1.6 / v.cadencia), dmg: prom(v => (v.dmin + v.dmax) / 2), hp: prom(v => v.maxHp), def: prom(v => v.def) };
  })());
  const SEG_MATAR = nv => 2 + 2.5 * Math.min(1, nv / 100);          // de 2 s al principio a 4,5 s arriba (con habilidades, menos)
  const SEG_AGUANTAR = nv => 100 - 75 * Math.min(1, nv / 60);       // de 100 s al principio (para aprender) a 25 s desde el nivel 60
  const comunes = Object.entries(MONSTRUOS).filter(([, m]) => !m.jefe && !m.soloEvento);
  const vecinos = m => comunes.map(([, x]) => x).filter(x => Math.abs(x.nivel - m.nivel) <= 8);
  const mediana = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const caracter = {};
  for (const [k, m] of comunes) {
    const v = vecinos(m), fh = m.hp / mediana(v.map(x => x.hp)), fd = (m.dano[0] + m.dano[1]) / mediana(v.map(x => x.dano[0] + x.dano[1]));
    caracter[k] = { hp: Math.max(0.6, Math.min(1.6, fh)), dano: Math.max(0.7, Math.min(1.4, fd)) };
  }
  const poner = (m, kHp, kDano) => {
    const R0 = medio(Math.min(160, m.nivel + (m.nivel < 10 ? 0 : 2))), cad = m.cadencia || 1.5;
    m.hp = Math.round(R0.dano * SEG_MATAR(m.nivel) * kHp / 10) * 10 + Math.round(m.def * 0.5 * 4);
    // Al principio el jugador tiene poca armadura: la parte que «come» la defensa crece de a poco hasta el nivel 20.
    const golpe = (R0.hp / SEG_AGUANTAR(m.nivel)) * cad * kDano + R0.def * 0.5 * (0.3 + 0.7 * Math.min(1, m.nivel / 20)), r = m.dano[1] / m.dano[0];
    m.dano = [Math.round(golpe * 2 / (1 + r)), Math.round(golpe * 2 * r / (1 + r))];
  };
  for (const [k, m] of comunes) poner(m, caracter[k].hp, caracter[k].dano);
  // Jefes: pensados para un grupo. Mucha más vida y pegan como dos monstruos y medio.
  for (const m of Object.values(MONSTRUOS)) if (m.jefe) poner(m, m.soloEvento ? 40 : 28, 2.5);
}
