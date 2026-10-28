// Reglas compartidas entre el celu y el servidor: números del juego, monstruos, mapa.
// Si cambiás un número acá, cambia en los dos lados (el servidor es el que manda).

export const VERSION = 1;
export const TICK = 0.1;                 // el servidor actualiza 10 veces por segundo
export const MUNDO = 60;                 // el mapa va de -60 a 60
export const PUEBLO = { x: 0, z: 0, r: 9 };   // zona segura: los monstruos no entran
export const VEL_JUGADOR = 5.2;
export const MAX_GRUPO = 5;
export const BONUS_GRUPO = 0.1;          // +10% de experiencia por cada compañero
export const DIST_GRUPO = 22;            // hay que estar cerca para compartir experiencia
export const PUNTOS_POR_NIVEL = 5;
export const NIVEL_MAX = 400;

// ---------- Personaje ----------
export const STATS = ['fue', 'agi', 'vit', 'ene'];
export const NOMBRE_STAT = { fue: 'Fuerza', agi: 'Agilidad', vit: 'Vitalidad', ene: 'Energía' };
export const CLASES = {
  guardian: { nombre: 'Guardián', base: { fue: 26, agi: 20, vit: 24, ene: 12 } },
};

export function nuevoPersonaje(nombre) {
  return { nombre, clase: 'guardian', nivel: 1, exp: 0, puntos: 0, ...CLASES.guardian.base, version: VERSION };
}

export const expParaSubir = n => Math.round(30 * n * n + 70 * n);

export function derivados(p) {
  const n = p.nivel;
  return {
    maxHp: Math.round(50 + p.vit * 2 + (n - 1) * 3),
    maxMp: Math.round(15 + p.ene * 1.5 + (n - 1)),
    dmin: Math.round(p.fue / 7 + 3 + n * 0.5),
    dmax: Math.round(p.fue / 5 + 6 + n * 0.5),
    def: Math.round(p.agi / 5 + p.vit / 10),
    cadencia: Math.max(0.42, 0.95 - p.agi * 0.0035),
    alcance: 1.7,
  };
}

// Habilidades del Guardián. mp = energía que gasta, cd = segundos de espera.
export const HABILIDADES = [
  { id: 'giro', nombre: 'Tajo giratorio', mp: 8, cd: 3.5, mult: 1.5, radio: 3.2, anim: 'spin',
    desc: 'Golpea a todos los monstruos alrededor.' },
  { id: 'muralla', nombre: 'Muralla', mp: 12, cd: 18, dura: 6, reduce: 0.5, anim: 'muralla',
    desc: 'Durante 6 segundos recibís la mitad de daño.' },
  { id: 'embestida', nombre: 'Embestida', mp: 10, cd: 7, mult: 2.4, salto: 8, anim: 'stab',
    desc: 'Salta hacia el monstruo marcado y le pega fuerte.' },
];
export const POCION = { cargas: 3, recarga: 25, cura: 0.45 };

// ---------- Monstruos ----------
// zona: dónde aparecen (centro x,z y radio). jefe: necesita grupo.
export const MONSTRUOS = {
  rata:     { nombre: 'Rata de Peste', nivel: 1, hp: 45, dano: [3, 6], def: 0, exp: 10, vel: 2.6, alcance: 1.2, cadencia: 1.6, agresivo: false, radio: 0.45,
              zona: { x: 0, z: 0, rmin: 12, rmax: 26 }, cantidad: 16, reaparece: 7 },
  sapo:     { nombre: 'Sapo de Ciénaga', nivel: 3, hp: 95, dano: [5, 9], def: 1, exp: 22, vel: 2.2, alcance: 1.3, cadencia: 1.7, agresivo: false, radio: 0.5,
              zona: { x: -32, z: 14, r: 10 }, cantidad: 9, reaparece: 8 },
  arana:    { nombre: 'Tejedora', nivel: 6, hp: 190, dano: [9, 14], def: 3, exp: 48, vel: 3.0, alcance: 1.4, cadencia: 1.5, agresivo: true, vista: 6, radio: 0.6,
              zona: { x: 36, z: 8, r: 13 }, cantidad: 12, reaparece: 9 },
  avispon:  { nombre: 'Avispón de Carroña', nivel: 10, hp: 320, dano: [14, 20], def: 6, exp: 95, vel: 3.4, alcance: 1.5, cadencia: 1.3, agresivo: true, vista: 7, radio: 0.55,
              zona: { x: -6, z: -38, r: 13 }, cantidad: 12, reaparece: 10 },
  huesudo:  { nombre: 'Huesudo', nivel: 15, hp: 680, dano: [22, 32], def: 10, exp: 210, vel: 2.8, alcance: 1.6, cadencia: 1.5, agresivo: true, vista: 7, radio: 0.6,
              zona: { x: 38, z: -36, r: 12 }, cantidad: 10, reaparece: 12 },
  centinela:{ nombre: 'Centinela Hueco', nivel: 25, hp: 16000, dano: [45, 70], def: 18, exp: 7000, vel: 2.6, alcance: 2.6, cadencia: 2.0, agresivo: true, vista: 9, radio: 1.2,
              zona: { x: 42, z: -42, r: 1 }, cantidad: 1, reaparece: 240, jefe: true,
              pisoton: { cada: 7, radio: 4.5, dano: [35, 55] } },
};
export const TIPOS = Object.keys(MONSTRUOS);

// ---------- Mapa: Páramo del Luto ----------
export const MAPA = {
  nombre: 'Páramo del Luto',
  lugares: [
    { nombre: 'Atalaya del Farol', x: 0, z: 0 },
    { nombre: 'Ciénaga Podrida', x: -32, z: 14 },
    { nombre: 'Colmena Negra', x: -6, z: -38 },
    { nombre: 'Nido de Tejedoras', x: 36, z: 8 },
    { nombre: 'Osario', x: 40, z: -38 },
  ],
};

// Altura del piso: suave, plana en la atalaya y en la ciénaga. La usan los dos lados.
export function altura(x, z) {
  let h = Math.sin(x * 0.11) * 0.45 + Math.cos(z * 0.09 + x * 0.04) * 0.5 + Math.sin((x + z) * 0.23) * 0.15;
  const dp = Math.hypot(x, z);
  if (dp < 14) h *= Math.max(0, (dp - 9) / 5);
  const dc = Math.hypot(x + 32, z - 14);
  if (dc < 9) h = h * Math.max(0, (dc - 6) / 3) - (dc < 6 ? 0.25 : 0);
  const borde = Math.max(0, Math.abs(x) - 52) + Math.max(0, Math.abs(z) - 52);
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
