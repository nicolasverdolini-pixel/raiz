// Íconos del juego, todos con el mismo estilo: medallón de hierro, fondo del color de la rama y una figura de hueso.
// Se usan para habilidades, ataques, objetos y botones. Dibujados a mano en SVG (no usan arte de nadie).
import * as O from './objetos.js';
import * as C from './clases.js';

// Figuras (viewBox 0 0 64 64), rellenas.
const F = {
  espada: '<path d="M44 8h12v12L30 46l-4-4-4 4 4 4-4 4-4-4-6 6-4-4 6-6-4-4 4-4 4 4 4-4-4-4z"/>',
  ballesta: '<path d="M10 30h44v4H10z"/><path d="M32 10c-10 4-16 12-16 22s6 18 16 22l2-4c-8-4-12-10-12-18s4-14 12-18z"/><path d="M50 26l8 6-8 6z"/>',
  baculo: '<path d="M16 54 38 22l4 3-22 32z"/><circle cx="44" cy="18" r="9"/><circle cx="44" cy="18" r="4" fill="#0b0a0b"/>',
  hachas: '<path d="M14 54 40 18l4 3-26 36z"/><path d="M38 10c8 0 14 6 16 14-8 2-14 0-18-6z"/><path d="M50 54 24 18l-4 3 26 36z" opacity=".75"/>',
  dagas: '<path d="M18 52 42 16l6-6-2 8-24 36z"/><path d="M46 52 22 16l-6-6 2 8 24 36z" opacity=".8"/>',
  cetro: '<path d="M30 58h4V26h-4z"/><path d="M22 18c0-6 4-10 10-10s10 4 10 10c0 4-2 6-4 8h-12c-2-2-4-4-4-8z"/><circle cx="28" cy="17" r="2.5" fill="#0b0a0b"/><circle cx="36" cy="17" r="2.5" fill="#0b0a0b"/>',
  garras: '<path d="M16 46c0-10 6-16 16-16s16 6 16 16v8H16z"/><path d="M20 30 16 12l8 16zM30 28 30 8l4 20zM40 28l8-16-4 18z"/>',
  escudo: '<path d="M32 6 54 14v16c0 13-9 22-22 28C19 52 10 43 10 30V14z"/>',
  torbellino: '<path d="M32 8a24 24 0 0 1 24 24h-6a18 18 0 0 0-18-18zM56 32a24 24 0 0 1-24 24v-6a18 18 0 0 0 18-18zM32 56A24 24 0 0 1 8 32h6a18 18 0 0 0 18 18zM8 32A24 24 0 0 1 32 8v6a18 18 0 0 0-18 18z"/><circle cx="32" cy="32" r="6"/>',
  salto: '<path d="M8 36h30v-8l18 14-18 14v-8H8z"/><path d="M8 14h16v6H8zM8 24h10v6H8z" opacity=".7"/>',
  martillo: '<path d="M30 58V28h4v30z"/><path d="M16 12h32v16H16z"/>',
  flecha: '<path d="M8 56 46 18l-8-2 18-8-8 18-2-8L18 56z"/>',
  lluvia: '<path d="M14 8l-4 18h4l4-18zM30 8l-4 18h4l4-18zM46 8l-4 18h4l4-18zM22 30l-4 18h4l4-18zM38 30l-4 18h4l4-18zM14 46h40v4H14z"/>',
  estrella: '<path d="M32 4l6 20 20-6-14 14 14 14-20-6-6 20-6-20-20 6 14-14L6 18l20 6z"/>',
  copo: '<path d="M30 4h4v56h-4zM4 30h56v4H4zM11 13l3-3 40 40-3 3zM50 10l3 3-40 40-3-3z"/><circle cx="32" cy="32" r="7"/>',
  llama: '<path d="M32 4c4 10 16 16 16 32a16 16 0 0 1-32 0c0-8 4-12 8-16 0 6 2 10 6 10-2-10 0-18 2-26z"/>',
  calavera: '<path d="M32 6C18 6 10 15 10 27c0 8 4 12 8 14v9h28v-9c4-2 8-6 8-14C54 15 46 6 32 6z"/><circle cx="24" cy="28" r="5" fill="#0b0a0b"/><circle cx="40" cy="28" r="5" fill="#0b0a0b"/><path d="M28 50v8h3v-8zM33 50v8h3v-8z"/>',
  mano: '<path d="M18 58V28l-6-6 4-4 8 8V10h5v18h2V6h5v22h2V10h5v20h2V16h5v28c0 8-6 14-14 14z"/>',
  gota: '<path d="M32 6c8 14 18 22 18 34a18 18 0 0 1-36 0c0-12 10-20 18-34z"/>',
  cruz: '<path d="M26 8h12v18h18v12H38v18H26V38H8V26h18z"/>',
  ojo: '<path d="M4 32c8-12 18-18 28-18s20 6 28 18c-8 12-18 18-28 18S12 44 4 32z"/><circle cx="32" cy="32" r="9" fill="#0b0a0b"/><circle cx="32" cy="32" r="4"/>',
  luna: '<path d="M40 6a26 26 0 1 0 18 40A22 22 0 0 1 40 6z"/>',
  meteoro: '<circle cx="40" cy="40" r="14"/><path d="M6 6l26 22-4 4zM14 4l22 20-3 3zM4 14l20 22-3 3z" opacity=".7"/>',
  rayo: '<path d="M36 4 14 36h14l-6 24 28-34H36z"/>',
  frasco: '<path d="M26 6h12v4h-2v10l12 18c4 8-2 18-10 18H26c-8 0-14-10-10-18l12-18V10h-2z"/>',
  estandarte: '<path d="M14 6h4v54h-4z"/><path d="M18 8h34l-8 12 8 12H18z"/>',
  corazon: '<path d="M32 56 8 32C2 26 4 12 16 10c7-1 12 4 16 8 4-4 9-9 16-8 12 2 14 16 8 22z"/>',
  diente: '<path d="M10 12h44l-6 18-6-10-4 30-6-30-4 30-4-30-6 10z"/>',
  pocion: '<path d="M26 6h12v4h-2v10l12 18c4 8-2 18-10 18H26c-8 0-14-10-10-18l12-18V10h-2z"/>',
  vela: '<path d="M26 26h12v30H26z"/><path d="M32 6c4 6 6 10 0 16-6-6-4-10 0-16z"/>',
  gema: '<path d="M14 24 22 10h20l8 14-18 30z"/><path d="M14 24h36M22 10l10 14 10-14" stroke="#0b0a0b" stroke-width="2" fill="none"/>',
  oro: '<circle cx="32" cy="32" r="22"/><path d="M32 18v28M24 24h12a5 5 0 0 1 0 10h-8a5 5 0 0 0 0 10h12" stroke="#0b0a0b" stroke-width="4" fill="none"/>',
  casco: '<path d="M12 40c0-16 9-28 20-28s20 12 20 28v10H12z"/><path d="M30 26h4v18h-4z" fill="#0b0a0b"/>',
  armadura: '<path d="M22 8 8 16l6 16 6-2v26h24V30l6 2 6-16-14-8-5 6h-10z"/>',
  guantes: '<path d="M18 58V38l-4-8V14h5v14h2V10h5v18h2V8h5v20h2V12h5v28l-6 18z"/>',
  botas: '<path d="M20 6h16v28l18 8v14H14v-8l6-4z"/>',
  herradura: '<path d="M14 10h10v22c0 6 4 10 8 10s8-4 8-10V10h10v22c0 12-8 22-18 22S14 44 14 32z"/><circle cx="19" cy="18" r="1.8" fill="#0b0a0b"/><circle cx="45" cy="18" r="1.8" fill="#0b0a0b"/><circle cx="19" cy="28" r="1.8" fill="#0b0a0b"/><circle cx="45" cy="28" r="1.8" fill="#0b0a0b"/>',
  pata: '<ellipse cx="32" cy="42" rx="13" ry="11"/><ellipse cx="15" cy="27" rx="5.5" ry="7"/><ellipse cx="25" cy="16" rx="5.5" ry="7.5"/><ellipse cx="39" cy="16" rx="5.5" ry="7.5"/><ellipse cx="49" cy="27" rx="5.5" ry="7"/>',
  mochila: '<path d="M16 22h32l4 34H12z"/><path d="M24 22v-6a8 8 0 0 1 16 0v6h-4v-6a4 4 0 0 0-8 0v6z"/><path d="M24 36h16v4H24z" fill="#0b0a0b"/>',
};

// Qué figura usa cada habilidad.
const FIGURA = {
  muralla: 'escudo', piel: 'escudo', juramento: 'estandarte', giro: 'torbellino', templado: 'espada', juicio: 'martillo', embestida: 'salto', aliento: 'corazon', estandarte: 'estandarte',
  perforante: 'flecha', halcon: 'ojo', ocaso: 'flecha', lluvia: 'lluvia', carcaj: 'flecha', tormenta: 'lluvia', sombrio: 'luna', sigilo: 'luna', marca: 'ojo',
  bola: 'llama', brasa: 'llama', meteoro: 'meteoro', nova: 'copo', mente: 'copo', tumba: 'copo', escudo: 'escudo', velaEterna: 'vela', rezo: 'cruz',
  torbellino: 'torbellino', sed: 'gota', carniceria: 'hachas', grito: 'diente', ciega: 'diente', frenesi: 'gota', hachazo: 'martillo', cuero: 'escudo', terremoto: 'martillo',
  punalada: 'dagas', sangrado: 'gota', milcortes: 'torbellino', nube: 'frasco', toxinas: 'frasco', plaga: 'calavera', desvanecer: 'luna', evasion: 'luna', danza: 'dagas',
  levantar: 'calavera', ejercito: 'calavera', legion: 'calavera', rayohueso: 'rayo', fragiles: 'rayo', lluviahuesos: 'lluvia', sifon: 'gota', pactoscuro: 'mano', velo: 'luna',
  punoigneo: 'garras', hirviente: 'llama', erupcion: 'llama', hambre: 'gota', pielceniza: 'escudo', forma: 'mano', alientofuego: 'llama', calor: 'llama', azufre: 'meteoro',
};
// Arma de cada clase para el botón de ataque.
const ARMA = { guardian: 'espada', cazadora: 'ballesta', arcanista: 'baculo', barbaro: 'hachas', sombra: 'dagas', nigromante: 'cetro', desterrado: 'garras' };
// Color de cada rama (la misma posición en todas las clases): sangre, hueso dorado, éter.
const RAMA = ['#9e2a20', '#a8873a', '#3d6a9e'];

let n = 0;
function medallon(figura, color, { def = false, forma = 'circulo' } = {}) {
  const id = 'g' + (n++);
  const borde = def ? '#c9a24a' : '#4a4440';
  const fondo = forma === 'circulo'
    ? `<circle cx="32" cy="32" r="30" fill="url(#${id})"/><circle cx="32" cy="32" r="29" fill="none" stroke="${borde}" stroke-width="2.5"/><circle cx="32" cy="32" r="25" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="1.5"/>`
    : `<rect x="2" y="2" width="60" height="60" rx="6" fill="url(#${id})"/><rect x="3" y="3" width="58" height="58" rx="5" fill="none" stroke="${borde}" stroke-width="2"/>`;
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="${id}" cx="50%" cy="38%" r="65%"><stop offset="0" stop-color="${color}" stop-opacity=".9"/><stop offset=".7" stop-color="#140f0f"/><stop offset="1" stop-color="#070606"/></radialGradient>
    <filter id="${id}b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2" result="b"/><feFlood flood-color="${color}"/><feComposite in2="b" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    ${fondo}<g transform="translate(32 32) scale(.62) translate(-32 -32)" fill="#e9dfca" filter="url(#${id}b)">${F[figura] || F.estrella}</g>${def ? `<path d="M32 1l3 5h-6z M32 63l3-5h-6z" fill="#c9a24a"/>` : ''}</svg>`;
}

export function iconoHab(clase, id) {
  const ramas = C.ARBOL[clase] || [];
  const ri = ramas.findIndex(r => r.hab.some(h => h.id === id));
  const h = C.buscarHab(clase, id);
  return medallon(FIGURA[id] || 'estrella', RAMA[Math.max(0, ri)], { def: !!h?.def });
}
export const iconoAtaque = clase => medallon(ARMA[clase] || 'espada', '#7a1a14');
export const iconoBoton = (fig, color = '#3a3330') => medallon(fig, color);

const COLOR_OBJ = { pocion: '#8e1b1b', eter: '#2f4f86', vela: '#8a6b32', forja: '#8a7a40', destino: '#5a3a9e', abismo: '#8e1b3a', guardiana: '#2f6a8e', oro: '#8a6b20',
  tabano: '#4a4038', anima_g: '#3a5a7e', diablillo: '#8e2a1a', lobo_m: '#5a5650', ciervo_m: '#2a2430', acechador_m: '#6a2a1a' };
export function iconoObjeto(b, it) {
  const base = O.BASES[b];
  let fig = 'gema';
  if (b === 'oro') fig = 'oro';
  else if (base?.r === 'arma') fig = ARMA[base.clase] || 'espada';
  else if (base?.r === 'montura') fig = 'herradura';
  else if (base?.r === 'mascota') fig = 'pata';
  else if (base?.r) fig = base.r;
  else if (b === 'pocion' || b === 'eter') fig = 'pocion';
  else if (b === 'vela') fig = 'vela';
  const ra = it ? O.rareza(it) : 0;
  const color = ra ? O.RAREZAS[ra].color : COLOR_OBJ[b] || '#3a3330';
  return medallon(fig, color, { forma: 'cuadro', def: ra >= 2 });
}
