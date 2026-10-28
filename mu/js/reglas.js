// Reglas compartidas entre el celu y el servidor: números del juego, monstruos, mapa.
// Si cambiás un número acá, cambia en los dos lados (el servidor es el que manda).

export const VERSION = 1;
export const TICK = 0.1;                 // el servidor actualiza 10 veces por segundo
export const MUNDO = 90;                 // el mapa va de -90 a 90
export const PUEBLO = { x: 0, z: 0, r: 9 };   // zona segura: los monstruos no entran
export const VEL_JUGADOR = 5.2;
export const MAX_GRUPO = 5;
export const BONUS_GRUPO = 0.1;          // +10% de experiencia por cada compañero
export const DIST_GRUPO = 22;            // hay que estar cerca para compartir experiencia
export const PUNTOS_POR_NIVEL = 5;
export const NIVEL_MAX = 400;

// ---------- Personaje ----------
import { CLASES, ARBOL, calcular } from './clases.js';
import { MOCHILA } from './objetos.js';
export const STATS = ['fue', 'agi', 'vit', 'ene'];
export const NOMBRE_STAT = { fue: 'Fuerza', agi: 'Agilidad', vit: 'Vitalidad', ene: 'Energía' };
export const EXPLICA_STAT = { fue: 'Más daño para Guardián y Bárbaro.', agi: 'Pegás más rápido y defendés. Más daño para la Cazadora.', vit: 'Más vida.', ene: 'Más energía. Más daño para el Arcanista.' };

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
export const TIPOS = Object.keys(MONSTRUOS);
export const CAMPEON = { prob: 0.06, probNoche: 0.25, hp: 3, dano: 1.4, exp: 3.5, escala: 1.3 };

// ---------- Eventos con horario (hora del servidor) ----------
// cada: cada cuántos minutos · desfase: minuto en que arranca · dura: minutos
export const EVENTOS = [
  { id: 'marea', nombre: 'Marea de Éter', cada: 30, desfase: 0, dura: 5, exp: 2,
    desc: 'El Éter desborda: doble experiencia y los monstruos vuelven más rápido.' },
  { id: 'noche', nombre: 'Noche Roja', cada: 120, desfase: 15, dura: 10, exp: 1.5,
    desc: 'El cielo sangra. Aparecen campeones por todos lados y llega el Heraldo del Éter.' },
];
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

// Altura del piso: suave, plana en la atalaya y en la ciénaga. La usan los dos lados.
export function altura(x, z) {
  let h = Math.sin(x * 0.11) * 0.45 + Math.cos(z * 0.09 + x * 0.04) * 0.5 + Math.sin((x + z) * 0.23) * 0.15;
  const dp = Math.hypot(x, z);
  if (dp < 14) h *= Math.max(0, (dp - 9) / 5);
  const dc = Math.hypot(x + 32, z - 14);
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
