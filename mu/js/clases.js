// Clases y árbol de habilidades. Compartido celu ↔ servidor.
import { bonusEquipo } from './objetos.js';

// atributo: con qué atributo pega · alcance: de lejos o de cerca · proyectil: color del ataque a distancia
export const CLASES = {
  guardian: {
    nombre: 'Guardián', desc: 'Espada y escudo. Aguanta lo que otros no aguantan y protege al grupo.',
    base: { fue: 26, agi: 20, vit: 24, ene: 12, sue: 10, tem: 16 }, atributo: 'fue', arma: 'espada', escudo: true, alcance: 1.7,
    vida: [60, 2.4, 3], energia: [15, 1.5, 1], dano: [7, 5], defensa: [5, 8], cadencia: [0.95, 0.0035],
    inicio: { arma: 'espada1', escudo: 'escudo1', armadura: 'armadura_cuero' },
  },
  cazadora: {
    nombre: 'Cazadora', desc: 'Ballesta. Pega desde lejos y muy rápido, pero aguanta poco.',
    base: { fue: 16, agi: 30, vit: 18, ene: 14, sue: 16, tem: 10 }, atributo: 'agi', arma: 'ballesta', alcance: 9, proyectil: 'saeta',
    vida: [45, 2, 2.2], energia: [18, 1.6, 1], dano: [7, 4.5], defensa: [6, 12], cadencia: [1.0, 0.004],
    inicio: { arma: 'ballesta1', armadura: 'armadura_cuero' },
  },
  arcanista: {
    nombre: 'Arcanista', desc: 'Báculo. Magia de Éter que golpea a muchos a la vez. Frágil.',
    base: { fue: 12, agi: 18, vit: 18, ene: 30, sue: 10, tem: 14 }, atributo: 'ene', arma: 'baculo', alcance: 8, proyectil: 'azul',
    vida: [40, 1.8, 2], energia: [25, 2.5, 1.5], dano: [6, 4], defensa: [7, 12], cadencia: [1.15, 0.003],
    inicio: { arma: 'baculo1', armadura: 'armadura_cuero' },
  },
  barbaro: {
    nombre: 'Bárbaro', desc: 'Dos hachas. El que más daño hace de cerca, el que menos se cuida.',
    base: { fue: 30, agi: 22, vit: 22, ene: 8, sue: 12, tem: 10 }, atributo: 'fue', arma: 'hacha', alcance: 1.8,
    vida: [55, 2.2, 2.8], energia: [12, 1.4, 0.8], dano: [6.5, 4.2], defensa: [7, 12], cadencia: [0.85, 0.004],
    inicio: { arma: 'hacha1', armadura: 'armadura_cuero' },
  },
  sombra: {
    nombre: 'Sombra', desc: 'Dos dagas. Golpes críticos, veneno y desaparecer. Muy rápida, muy frágil.',
    base: { fue: 18, agi: 32, vit: 18, ene: 12, sue: 18, tem: 8 }, atributo: 'agi', arma: 'dagas', alcance: 1.6, crit: 8,
    vida: [45, 2, 2.3], energia: [15, 1.5, 1], dano: [6.5, 4.2], defensa: [6, 12], cadencia: [0.78, 0.0045],
    inicio: { arma: 'dagas1', armadura: 'armadura_cuero' },
  },
  nigromante: {
    nombre: 'Nigromante', desc: 'Un muerto que volvió del Éter. Levanta siervos de hueso que pelean por él.',
    base: { fue: 10, agi: 16, vit: 20, ene: 32, sue: 10, tem: 16 }, atributo: 'ene', arma: 'cetro', alcance: 8, proyectil: 'verde',
    vida: [42, 1.9, 2.1], energia: [24, 2.4, 1.4], dano: [6.5, 4.2], defensa: [7, 12], cadencia: [1.15, 0.003],
    inicio: { arma: 'cetro1', armadura: 'armadura_cuero' },
  },
  desterrado: {
    nombre: 'Desterrado', desc: 'Mitad demonio. Pega con los puños en llamas y se cura con la sangre que derrama.',
    base: { fue: 26, agi: 20, vit: 26, ene: 14, sue: 12, tem: 12 }, atributo: 'fue', arma: 'garras', alcance: 1.7, robo: 3,
    vida: [58, 2.3, 2.9], energia: [14, 1.5, 1], dano: [7, 4.6], defensa: [6, 10], cadencia: [0.9, 0.0035],
    inicio: { arma: 'garras1', armadura: 'armadura_cuero' },
  },
};
export const LISTA_CLASES = Object.keys(CLASES);

// ---------- Árbol ----------
// tipo: area (alrededor tuyo) · golpe (a un monstruo, con salto opcional) · proyectil (de lejos) · lluvia (área donde está el monstruo)
//       buff (mejora por un rato; grupo: también a los compañeros cerca) · cura (vida al grupo) · pasiva (siempre activa)
// max: rangos · def: true = definitiva (pide nivel 30 y 10 puntos en la rama)
const A = (id, nombre, o) => ({ id, nombre, max: 5, ...o });
export const ARBOL = {
  guardian: [
    { rama: 'Bastión', hab: [
      A('muralla', 'Muralla', { tipo: 'buff', mp: 12, cd: 18, dura: 6, efecto: r => ({ menos: 30 + r * 5 }), desc: r => `Recibís ${30 + r * 5}% menos daño por 6 s.`, anim: 'muralla' }),
      A('piel', 'Piel de Hierro', { tipo: 'pasiva', efecto: r => ({ defPct: r * 4, hpPct: r * 2 }), desc: r => `+${r * 4}% defensa y +${r * 2}% vida.` }),
      A('juramento', 'Juramento del Farol', { tipo: 'buff', grupo: true, def: true, max: 3, mp: 30, cd: 60, dura: 8, efecto: r => ({ menos: 20 + r * 5 }), desc: r => `Todo el grupo recibe ${20 + r * 5}% menos daño por 8 s.`, anim: 'festeja' }),
    ] },
    { rama: 'Acero', hab: [
      A('giro', 'Tajo giratorio', { tipo: 'area', mp: 8, cd: 3.5, radio: 3.2, mult: r => 1.3 + r * 0.15, desc: r => `Golpea a todos alrededor (${Math.round((1.3 + r * 0.15) * 100)}%).`, anim: 'spin' }),
      A('templado', 'Filo Templado', { tipo: 'pasiva', efecto: r => ({ dmgPct: r * 4 }), desc: r => `+${r * 4}% daño.` }),
      A('juicio', 'Juicio', { tipo: 'lluvia', def: true, max: 3, mp: 30, cd: 35, radio: 3.5, alcance: 4, mult: r => 3 + r, desc: r => `Golpe brutal en área (${(3 + r) * 100}%).`, anim: 'stab' }),
    ] },
    { rama: 'Vigilia', hab: [
      A('embestida', 'Embestida', { tipo: 'golpe', mp: 10, cd: 7, salto: 8, mult: r => 2 + r * 0.2, desc: r => `Saltás al monstruo y le pegás (${Math.round((2 + r * 0.2) * 100)}%).`, anim: 'stab' }),
      A('aliento', 'Segundo Aliento', { tipo: 'pasiva', efecto: r => ({ vidaKill: r * 2 }), desc: r => `Recuperás ${r * 2}% de vida al matar.` }),
      A('estandarte', 'Estandarte', { tipo: 'cura', grupo: true, def: true, max: 3, mp: 30, cd: 45, valor: r => 20 + r * 10, desc: r => `Cura ${20 + r * 10}% de vida a todo el grupo.`, anim: 'festeja' }),
    ] },
  ],
  cazadora: [
    { rama: 'Puntería', hab: [
      A('perforante', 'Disparo Perforante', { tipo: 'proyectil', mp: 8, cd: 4, mult: r => 2 + r * 0.25, desc: r => `Un tiro fuerte (${Math.round((2 + r * 0.25) * 100)}%).`, anim: 'tiro2' }),
      A('halcon', 'Ojo de Halcón', { tipo: 'pasiva', efecto: r => ({ crit: r * 3, alcance: r * 0.5 }), desc: r => `+${r * 3}% de críticos y +${r * 0.5} de alcance.` }),
      A('ocaso', 'Flecha del Ocaso', { tipo: 'proyectil', def: true, max: 3, mp: 30, cd: 30, mult: r => 6 + r * 2, desc: r => `Un solo tiro devastador (${(6 + r * 2) * 100}%).`, anim: 'tiro2' }),
    ] },
    { rama: 'Lluvia', hab: [
      A('lluvia', 'Lluvia de Saetas', { tipo: 'lluvia', mp: 12, cd: 6, radio: 3.5, alcance: 10, mult: r => 1.1 + r * 0.15, desc: r => `Saetas en área (${Math.round((1.1 + r * 0.15) * 100)}%).`, anim: 'tiro2' }),
      A('carcaj', 'Carcaj Hondo', { tipo: 'pasiva', efecto: r => ({ vel: r * 5 }), desc: r => `+${r * 5}% velocidad de ataque.` }),
      A('tormenta', 'Tormenta de Saetas', { tipo: 'lluvia', def: true, max: 3, mp: 35, cd: 40, radio: 6, alcance: 12, mult: r => 2 + r, desc: r => `Lluvia enorme (${(2 + r) * 100}%).`, anim: 'tiro2' }),
    ] },
    { rama: 'Sombra', hab: [
      A('sombrio', 'Paso Sombrío', { tipo: 'buff', mp: 12, cd: 20, dura: 6, efecto: r => ({ vel: 20 + r * 4, dmgPct: 10 + r * 3 }), desc: r => `+${20 + r * 4}% velocidad y +${10 + r * 3}% daño por 6 s.`, anim: 'esquiva' }),
      A('sigilo', 'Sigilo', { tipo: 'pasiva', efecto: r => ({ menos: r * 4 }), desc: r => `Recibís ${r * 4}% menos daño.` }),
      A('marca', 'Marca de Caza', { tipo: 'buff', grupo: true, def: true, max: 3, mp: 30, cd: 60, dura: 10, efecto: r => ({ dmgPct: 15 + r * 5 }), desc: r => `Todo el grupo pega ${15 + r * 5}% más por 10 s.`, anim: 'festeja' }),
    ] },
  ],
  arcanista: [
    { rama: 'Llama', hab: [
      A('bola', 'Bola de Éter', { tipo: 'lluvia', mp: 7, cd: 2.5, radio: 2, alcance: 9, mult: r => 1.6 + r * 0.2, desc: r => `Explota donde cae (${Math.round((1.6 + r * 0.2) * 100)}%).`, anim: 'hechizo' }),
      A('brasa', 'Brasa Interior', { tipo: 'pasiva', efecto: r => ({ dmgPct: r * 5 }), desc: r => `+${r * 5}% daño.` }),
      A('meteoro', 'Meteoro Negro', { tipo: 'lluvia', def: true, max: 3, mp: 45, cd: 45, radio: 6, alcance: 12, mult: r => 4 + r, desc: r => `Cae un meteoro (${(4 + r) * 100}%).`, anim: 'hechizo2' }),
    ] },
    { rama: 'Escarcha', hab: [
      A('nova', 'Nova Helada', { tipo: 'area', mp: 12, cd: 8, radio: 4, frena: 1.5, mult: r => 1 + r * 0.15, desc: r => `Congela alrededor 1,5 s (${Math.round((1 + r * 0.15) * 100)}%).`, anim: 'hechizo2' }),
      A('mente', 'Mente Fría', { tipo: 'pasiva', efecto: r => ({ mpPct: r * 6, regen: r * 0.6 }), desc: r => `+${r * 6}% energía y más recuperación.` }),
      A('tumba', 'Tumba de Hielo', { tipo: 'area', def: true, max: 3, mp: 40, cd: 50, radio: 6.5, frena: 4, mult: r => 1.5 + r * 0.5, desc: r => `Congela todo 4 s (${Math.round((1.5 + r * 0.5) * 100)}%).`, anim: 'hechizo2' }),
    ] },
    { rama: 'Vela', hab: [
      A('escudo', 'Escudo de Éter', { tipo: 'buff', mp: 15, cd: 20, dura: 8, efecto: r => ({ menos: 20 + r * 5 }), desc: r => `Recibís ${20 + r * 5}% menos daño por 8 s.`, anim: 'muralla' }),
      A('velaEterna', 'Vela Eterna', { tipo: 'pasiva', efecto: r => ({ manaKill: r * 3 }), desc: r => `Recuperás ${r * 3}% de energía al matar.` }),
      A('rezo', 'Rezo del Farol', { tipo: 'cura', grupo: true, def: true, max: 3, mp: 40, cd: 50, valor: r => 25 + r * 10, desc: r => `Cura ${25 + r * 10}% de vida a todo el grupo.`, anim: 'hechizo2' }),
    ] },
  ],
  barbaro: [
    { rama: 'Sangre', hab: [
      A('torbellino', 'Torbellino', { tipo: 'area', mp: 8, cd: 3, radio: 3, mult: r => 1.25 + r * 0.15, desc: r => `Gira con las hachas (${Math.round((1.25 + r * 0.15) * 100)}%).`, anim: 'spin' }),
      A('sed', 'Sed', { tipo: 'pasiva', efecto: r => ({ vidaKill: r * 3 }), desc: r => `Recuperás ${r * 3}% de vida al matar.` }),
      A('carniceria', 'Carnicería', { tipo: 'area', def: true, max: 3, mp: 30, cd: 35, radio: 5, mult: r => 3 + r, desc: r => `Destroza todo alrededor (${(3 + r) * 100}%).`, anim: 'spin' }),
    ] },
    { rama: 'Rabia', hab: [
      A('grito', 'Grito de Guerra', { tipo: 'buff', grupo: true, mp: 10, cd: 25, dura: 8, efecto: r => ({ dmgPct: 12 + r * 3 }), desc: r => `El grupo pega ${12 + r * 3}% más por 8 s.`, anim: 'festeja' }),
      A('ciega', 'Furia Ciega', { tipo: 'pasiva', efecto: r => ({ vel: r * 4, dmgPct: r * 3 }), desc: r => `+${r * 4}% velocidad y +${r * 3}% daño.` }),
      A('frenesi', 'Frenesí', { tipo: 'buff', def: true, max: 3, mp: 25, cd: 60, dura: 10, efecto: r => ({ vel: 35 + r * 5, dmgPct: 20 + r * 5 }), desc: r => `+${35 + r * 5}% velocidad y +${20 + r * 5}% daño por 10 s.`, anim: 'festeja' }),
    ] },
    { rama: 'Tierra', hab: [
      A('hachazo', 'Hachazo', { tipo: 'golpe', mp: 9, cd: 5, frena: 1, mult: r => 2.4 + r * 0.25, desc: r => `Golpe que aturde 1 s (${Math.round((2.4 + r * 0.25) * 100)}%).`, anim: 'hachazo' }),
      A('cuero', 'Cuero Duro', { tipo: 'pasiva', efecto: r => ({ hpPct: r * 4 }), desc: r => `+${r * 4}% vida.` }),
      A('terremoto', 'Terremoto', { tipo: 'area', def: true, max: 3, mp: 35, cd: 45, radio: 7, frena: 2, mult: r => 2 + r * 0.5, desc: r => `Parte el piso y aturde 2 s (${Math.round((2 + r * 0.5) * 100)}%).`, anim: 'hachazo' }),
    ] },
  ],
  sombra: [
    { rama: 'Filo', hab: [
      A('punalada', 'Puñalada', { tipo: 'golpe', mp: 8, cd: 4, mult: r => 2.4 + r * 0.25, desc: r => `Una puñalada por la espalda (${Math.round((2.4 + r * 0.25) * 100)}%).`, anim: 'apunala' }),
      A('sangrado', 'Sangrado', { tipo: 'pasiva', efecto: r => ({ crit: r * 3 }), desc: r => `+${r * 3}% de críticos.` }),
      A('milcortes', 'Mil Cortes', { tipo: 'area', def: true, max: 3, mp: 30, cd: 35, radio: 3.5, mult: r => 4 + r, desc: r => `Corta todo alrededor (${(4 + r) * 100}%).`, anim: 'spin' }),
    ] },
    { rama: 'Veneno', hab: [
      A('nube', 'Nube Tóxica', { tipo: 'lluvia', mp: 10, cd: 6, radio: 3.5, alcance: 7, mult: r => 1.3 + r * 0.15, desc: r => `Tira un frasco que revienta en veneno (${Math.round((1.3 + r * 0.15) * 100)}%).`, anim: 'tira' }),
      A('toxinas', 'Toxinas', { tipo: 'pasiva', efecto: r => ({ dmgPct: r * 4 }), desc: r => `+${r * 4}% daño.` }),
      A('plaga', 'Plaga', { tipo: 'lluvia', def: true, max: 3, mp: 35, cd: 40, radio: 6, alcance: 9, mult: r => 3 + r * 0.6, desc: r => `Una nube enorme (${Math.round((3 + r * 0.6) * 100)}%).`, anim: 'tira' }),
    ] },
    { rama: 'Sombra', hab: [
      A('desvanecer', 'Desvanecerse', { tipo: 'buff', mp: 12, cd: 18, dura: 4, efecto: r => ({ menos: 35 + r * 5, vel: 25 }), desc: r => `Recibís ${35 + r * 5}% menos daño y atacás más rápido por 4 s.`, anim: 'esquiva' }),
      A('evasion', 'Evasión', { tipo: 'pasiva', efecto: r => ({ menos: r * 3 }), desc: r => `Recibís ${r * 3}% menos daño.` }),
      A('danza', 'Danza Sombría', { tipo: 'buff', def: true, max: 3, mp: 30, cd: 60, dura: 8, efecto: r => ({ vel: 40 + r * 5, dmgPct: 30 + r * 5 }), desc: r => `+${40 + r * 5}% velocidad y +${30 + r * 5}% daño por 8 s.`, anim: 'festeja' }),
    ] },
  ],
  nigromante: [
    { rama: 'Muerte', hab: [
      A('levantar', 'Levantar Muertos', { tipo: 'invocar', mp: 20, cd: 22, dura: 30, n: r => 1 + Math.floor(r / 2), desc: r => `Levanta ${1 + Math.floor(r / 2)} siervo${r > 1 ? 's' : ''} de hueso por 30 s.`, anim: 'invoca' }),
      A('ejercito', 'Ejército', { tipo: 'pasiva', efecto: r => ({ siervos: r * 12 }), desc: r => `Tus siervos pegan ${r * 12}% más.` }),
      A('legion', 'Legión', { tipo: 'invocar', def: true, max: 3, mp: 45, cd: 60, dura: 30, n: r => 4 + r, desc: r => `Levanta ${4 + r} siervos de golpe.`, anim: 'invoca' }),
    ] },
    { rama: 'Plaga', hab: [
      A('rayohueso', 'Rayo de Hueso', { tipo: 'proyectil', mp: 7, cd: 2.5, mult: r => 1.9 + r * 0.25, desc: r => `Dispara una astilla de hueso (${Math.round((1.9 + r * 0.25) * 100)}%).`, anim: 'hechizo' }),
      A('fragiles', 'Huesos Frágiles', { tipo: 'pasiva', efecto: r => ({ dmgPct: r * 4 }), desc: r => `+${r * 4}% daño.` }),
      A('lluviahuesos', 'Lluvia de Huesos', { tipo: 'lluvia', def: true, max: 3, mp: 40, cd: 45, radio: 6, alcance: 11, mult: r => 3.5 + r, desc: r => `Llueven huesos (${Math.round((3.5 + r) * 100)}%).`, anim: 'hechizo2' }),
    ] },
    { rama: 'Pacto', hab: [
      A('sifon', 'Sifón de Vida', { tipo: 'proyectil', mp: 10, cd: 6, robo: 40, mult: r => 1.4 + r * 0.15, desc: r => `Roba vida: te curás 40% de lo que pega (${Math.round((1.4 + r * 0.15) * 100)}%).`, anim: 'hechizo' }),
      A('pactoscuro', 'Pacto Oscuro', { tipo: 'pasiva', efecto: r => ({ vidaKill: r * 3 }), desc: r => `Recuperás ${r * 3}% de vida al matar.` }),
      A('velo', 'Velo de los Muertos', { tipo: 'buff', grupo: true, def: true, max: 3, mp: 35, cd: 60, dura: 8, efecto: r => ({ menos: 20 + r * 5 }), desc: r => `El grupo recibe ${20 + r * 5}% menos daño por 8 s.`, anim: 'festeja' }),
    ] },
  ],
  desterrado: [
    { rama: 'Brasa', hab: [
      A('punoigneo', 'Puño Ígneo', { tipo: 'golpe', mp: 8, cd: 4, mult: r => 2.2 + r * 0.22, desc: r => `Un golpe en llamas (${Math.round((2.2 + r * 0.22) * 100)}%).`, anim: 'puno' }),
      A('hirviente', 'Sangre Hirviente', { tipo: 'pasiva', efecto: r => ({ dmgPct: r * 4 }), desc: r => `+${r * 4}% daño.` }),
      A('erupcion', 'Erupción', { tipo: 'area', def: true, max: 3, mp: 35, cd: 40, radio: 5, mult: r => 3.5 + r, desc: r => `El piso explota alrededor (${Math.round((3.5 + r) * 100)}%).`, anim: 'puno' }),
    ] },
    { rama: 'Pacto', hab: [
      A('hambre', 'Hambre', { tipo: 'buff', mp: 12, cd: 20, dura: 8, efecto: r => ({ robo: 12 + r * 3 }), desc: r => `Te curás ${12 + r * 3}% de lo que pegás por 8 s.`, anim: 'festeja' }),
      A('pielceniza', 'Piel Calcinada', { tipo: 'pasiva', efecto: r => ({ hpPct: r * 4, defPct: r * 2 }), desc: r => `+${r * 4}% vida y +${r * 2}% defensa.` }),
      A('forma', 'Forma Demoníaca', { tipo: 'buff', def: true, max: 3, mp: 30, cd: 60, dura: 10, efecto: r => ({ dmgPct: 30 + r * 5, menos: 20 + r * 5 }), desc: r => `+${30 + r * 5}% daño y ${20 + r * 5}% menos daño recibido por 10 s.`, anim: 'festeja' }),
    ] },
    { rama: 'Infierno', hab: [
      A('alientofuego', 'Aliento de Fuego', { tipo: 'lluvia', mp: 10, cd: 5, radio: 3, alcance: 6, mult: r => 1.4 + r * 0.15, desc: r => `Escupe fuego (${Math.round((1.4 + r * 0.15) * 100)}%).`, anim: 'puno' }),
      A('calor', 'Calor', { tipo: 'pasiva', efecto: r => ({ vel: r * 4 }), desc: r => `+${r * 4}% velocidad de ataque.` }),
      A('azufre', 'Lluvia de Azufre', { tipo: 'lluvia', def: true, max: 3, mp: 40, cd: 45, radio: 6, alcance: 10, mult: r => 3 + r * 0.8, desc: r => `Cae fuego del cielo (${Math.round((3 + r * 0.8) * 100)}%).`, anim: 'puno' }),
    ] },
  ],
};

// Elemento de cada habilidad que pega (las demás son físicas).
const ELEM_HAB = {
  juicio: 'rayo', ocaso: 'sombra', tormenta: 'rayo', bola: 'fuego', meteoro: 'fuego', nova: 'hielo', tumba: 'hielo',
  nube: 'veneno', plaga: 'veneno', rayohueso: 'sombra', lluviahuesos: 'sombra', sifon: 'sombra',
  punoigneo: 'fuego', erupcion: 'fuego', alientofuego: 'fuego', azufre: 'fuego',
};
for (const ramas of Object.values(ARBOL)) for (const r of ramas) for (const h of r.hab) if (ELEM_HAB[h.id]) h.elem = ELEM_HAB[h.id];

export function buscarHab(clase, id) {
  for (const rama of ARBOL[clase] || []) for (const h of rama.hab) if (h.id === id) return h;
  return null;
}
export const puntosArbol = d => d.nivel + (d.resets || 0) * 10; // 1 por nivel (el primero, de regalo) + 10 por renacer
export const gastados = d => Object.values(d.arbol || {}).reduce((a, b) => a + b, 0);
export function enRama(d, rama) { return rama.hab.reduce((a, h) => a + (d.arbol?.[h.id] || 0), 0); }

// ¿Se puede subir esta habilidad? Devuelve el motivo si no.
export function puedeAprender(d, id) {
  const h = buscarHab(d.clase, id); if (!h) return 'No existe.';
  const r = d.arbol?.[id] || 0;
  if (r >= h.max) return 'Ya está al máximo.';
  if (gastados(d) >= puntosArbol(d)) return 'No te quedan puntos de habilidad.';
  if (h.def) {
    const rama = ARBOL[d.clase].find(x => x.hab.includes(h));
    if (d.nivel < 30) return 'Las definitivas se abren en el nivel 30.';
    if (enRama(d, rama) - r < 10) return `Necesitás 10 puntos en ${rama.rama}.`;
  }
  return null;
}

// Los 4 botones: la activa de cada rama (si la aprendiste) y la primera definitiva.
export function botones(d) {
  const out = [];
  for (const rama of ARBOL[d.clase] || []) { const a = rama.hab[0]; if (a.tipo !== 'pasiva' && d.arbol?.[a.id]) out.push(a.id); }
  for (const rama of ARBOL[d.clase] || []) { const u = rama.hab[2]; if (d.arbol?.[u.id]) { out.push(u.id); break; } }
  return out;
}

// Pasivas sumadas.
function pasivas(d) {
  const t = {};
  for (const rama of ARBOL[d.clase] || []) for (const h of rama.hab) {
    const r = d.arbol?.[h.id]; if (!r || h.tipo !== 'pasiva') continue;
    for (const [k, v] of Object.entries(h.efecto(r))) t[k] = (t[k] || 0) + v;
  }
  return t;
}

// Todos los números del personaje: atributos + clase + equipo + pasivas.
export function calcular(d) {
  const c = CLASES[d.clase] || CLASES.guardian, n = d.nivel;
  const eq = bonusEquipo(d.equipo), pa = pasivas(d);
  const pct = k => 1 + ((eq[k] || 0) + (pa[k] || 0)) / 100;
  const at = d[c.atributo] + (eq.atr || 0), vitT = d.vit + (eq.vit || 0);
  const maxHp = Math.round((c.vida[0] + vitT * c.vida[1] + (n - 1) * c.vida[2]) * pct('hpPct'));
  const maxMp = Math.round((c.energia[0] + d.ene * c.energia[1] + (n - 1) * c.energia[2]) * pct('mpPct'));
  const dm = pct('dmgPct');
  return {
    maxHp, maxMp,
    dmin: Math.round((at / c.dano[0] + 3 + n * 0.5 + eq.dmg[0]) * dm),
    dmax: Math.round((at / c.dano[1] + 6 + n * 0.5 + eq.dmg[1]) * dm),
    def: Math.round((d.agi / c.defensa[0] + vitT / c.defensa[1] + eq.def) * pct('defPct')),
    cadencia: Math.max(0.35, (c.cadencia[0] - d.agi * c.cadencia[1]) / pct('vel')),
    alcance: c.alcance + (pa.alcance || 0),
    // Suerte: más crítico, más daño crítico y más oro. Temple: resistencia a los elementos y vida que vuelve sola.
    crit: Math.min(75, 8 + (c.crit || 0) + (pa.crit || 0) + (eq.crit || 0) + (d.sue || 0) * 0.06), critDano: Math.round(50 + (eq.critDano || 0) + (d.sue || 0) * 0.3),
    elem: eq.elem || {}, oroSuerte: Math.min(100, (d.sue || 0) * 0.4), regenVida: 0.005 * (1 + (d.tem || 0) / 150),
    res: Object.fromEntries(['fuego', 'hielo', 'rayo', 'veneno', 'sombra'].map(e => [e, Math.min(75, Math.round((eq.res?.[e] || 0) + (eq.resTodo || 0) + (d.tem || 0) * 0.12))])), exc: 4 + (eq.exc || 0) / 2, robo: (c.robo || 0) + (pa.robo || 0), siervos: pa.siervos || 0,
    menos: Math.min(60, (eq.menos || 0) + (pa.menos || 0)), refleja: eq.refleja || 0,
    vidaKill: (eq.vidaKill || 0) + (pa.vidaKill || 0), manaKill: (eq.manaKill || 0) + (pa.manaKill || 0),
    velMov: eq.velMov || 0, oroPct: eq.oroPct || 0, junta: eq.junta || 0,
    regenMp: 2 + (pa.regen || 0), distancia: !!c.proyectil, proyectil: c.proyectil,
  };
}
