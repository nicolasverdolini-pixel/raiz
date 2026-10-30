// Objetos, equipo, gemas, forja, tiendas y lo que tiran los monstruos. Compartido celu ↔ servidor.

export const RANURAS = ['arma', 'escudo', 'casco', 'armadura', 'guantes', 'botas', 'alas', 'mascota', 'montura'];
export const NOMBRE_RANURA = { arma: 'Arma', escudo: 'Escudo', casco: 'Casco', armadura: 'Armadura', guantes: 'Guantes', botas: 'Botas', alas: 'Alas', mascota: 'Mascota', montura: 'Montura' };
export const MOCHILA = 40;          // casilleros de la mochila
export const PILA = 50;             // cuántas pociones o gemas entran en un casillero

// ---------- bases ----------
// r: ranura · req: nivel para usar · dmg o def · precio en oro (la tienda vende a ese precio y compra a un quinto)
const B = {};
// clase: solo esa clase lo puede usar
const arma = (id, nombre, clase, req, dmg, precio) => B[id] = { id, nombre, r: 'arma', clase, req, dmg, precio };
const escudo = (id, nombre, req, def, precio) => B[id] = { id, nombre, r: 'escudo', clase: 'guardian', req, def, precio };
const ARMAS = {
  guardian: [['espada', ['Espada Oxidada', 'Hoja de Vigía', 'Mandoble del Luto', 'Filo del Éter', 'Hoja del Velo', 'Hoja de Escoria', 'Espada del Último Rey']], [[4, 7], [10, 15], [20, 30], [34, 48], [50, 70], [70, 98], [96, 134]]],
  cazadora: [['ballesta', ['Ballesta de Caza', 'Ballesta de Vigía', 'Ballesta del Luto', 'Ballesta del Éter', 'Ballesta del Velo', 'Ballesta de Escoria', 'Ballesta del Último Rey']], [[3, 6], [8, 13], [17, 26], [29, 42], [43, 61], [61, 86], [84, 118]]],
  arcanista: [['baculo', ['Bastón de Fresno', 'Báculo de Vigía', 'Báculo del Luto', 'Báculo del Éter', 'Báculo del Velo', 'Báculo de Escoria', 'Báculo del Último Rey']], [[3, 6], [9, 14], [19, 28], [32, 45], [47, 66], [66, 92], [90, 126]]],
  barbaro: [['hacha', ['Hachas Melladas', 'Hachas de Vigía', 'Hachas del Luto', 'Hachas del Éter', 'Hachas del Velo', 'Hachas de Escoria', 'Hachas del Último Rey']], [[5, 8], [11, 17], [22, 33], [37, 52], [54, 76], [76, 106], [104, 146]]],
  sombra: [['dagas', ['Dagas Oxidadas', 'Dagas de Vigía', 'Dagas del Luto', 'Dagas del Éter', 'Dagas del Velo', 'Dagas de Escoria', 'Dagas del Último Rey']], [[4, 6], [9, 14], [18, 27], [31, 44], [46, 64], [64, 90], [88, 123]]],
  nigromante: [['cetro', ['Cetro de Hueso', 'Cetro de Vigía', 'Cetro del Luto', 'Cetro del Éter', 'Cetro del Velo', 'Cetro de Escoria', 'Cetro del Último Rey']], [[3, 6], [8, 13], [18, 27], [30, 43], [45, 63], [63, 88], [86, 121]]],
  desterrado: [['garras', ['Garras de Hierro', 'Garras de Vigía', 'Garras del Luto', 'Garras del Éter', 'Garras del Velo', 'Garras de Escoria', 'Garras del Último Rey']], [[5, 8], [10, 16], [21, 31], [35, 50], [51, 73], [72, 102], [99, 140]]],
};
const REQ = [1, 10, 24, 38, 55, 80, 115, 155, 200], PRECIO = [60, 900, 6000, 30000, 120000, 450000, 1500000, 4000000, 10000000];
// Las dos últimas tandas de armas (Glaciar y Dragón) salen de la anterior: mismo arma, más daño.
for (const [clase, [[pref, nombres], dmgs]] of Object.entries(ARMAS)) {
  const base = nombres[6].split(' ')[0], ult = dmgs[6];
  nombres.push(`${base} de Escarcha`, `${base} del Dragón`);
  dmgs.push(ult.map(v => Math.round(v * 1.38)), ult.map(v => Math.round(v * 1.86)));
  nombres.forEach((n, i) => arma(pref + (i + 1), n, clase, REQ[i], dmgs[i], PRECIO[i]));
}
escudo('escudo1', 'Rodela de Pino', 1, 3, 50);
escudo('escudo2', 'Escudo de Atalaya', 10, 8, 800);
escudo('escudo3', 'Égida Hueca', 24, 16, 5500);
escudo('escudo4', 'Baluarte Negro', 38, 26, 28000);
escudo('escudo5', 'Muro del Velo', 55, 38, 110000);
escudo('escudo6', 'Égida de Escoria', 80, 54, 420000);
escudo('escudo7', 'Pavés del Último Rey', 115, 74, 1400000);
escudo('escudo8', 'Muro de Escarcha', 155, 100, 3800000);
escudo('escudo9', 'Escama del Dragón', 200, 132, 9500000);
const SETS = [
  ['cuero', 'de Cuero Gastado', 1, 1],
  ['vigia', 'de Vigía', 12, 2.4],
  ['osario', 'del Osario', 24, 4.6],
  ['foso', 'del Foso', 38, 7.4],
  ['velo', 'del Velo', 55, 11],
  ['escoria', 'de Escoria', 80, 15.5],
  ['rey', 'del Último Rey', 115, 21.5],
  ['escarcha', 'de Escarcha', 155, 29],
  ['draco', 'del Dragón', 200, 38],
];
const PIEZAS = [['casco', 'Capucha', 2, 40], ['armadura', 'Cota', 4, 80], ['guantes', 'Guanteletes', 1, 30], ['botas', 'Botas', 1, 30]];
for (const [sid, sn, req, k] of SETS) for (const [r, pn, def, precio] of PIEZAS) {
  B[`${r}_${sid}`] = { id: `${r}_${sid}`, nombre: `${pn} ${sn}`, r, req, def: Math.round(def * k), precio: Math.round(precio * k ** 3.1) };
}
// consumibles y gemas
B.pocion = { id: 'pocion', nombre: 'Poción de Sangre', uso: 'cura', valor: 0.45, precio: 20, pila: true, desc: 'Cura casi la mitad de tu vida.' };
B.eter = { id: 'eter', nombre: 'Poción de Éter', uso: 'mana', valor: 0.5, precio: 25, pila: true, desc: 'Devuelve la mitad de tu energía.' };
B.vela = { id: 'vela', nombre: 'Vela de Paso', uso: 'viaje', precio: 120, pila: true, desc: 'Te lleva a cualquier lugar del Páramo que ya conozcas.' };
B.forja = { id: 'forja', nombre: 'Gema de Forja', gema: true, precio: 0, pila: true, desc: 'Mejora un equipo de +0 a +6. Nunca falla.' };
B.destino = { id: 'destino', nombre: 'Gema del Destino', gema: true, precio: 0, pila: true, desc: 'Mejora de +6 a +9. Puede fallar: si falla, baja un nivel.' };
B.abismo = { id: 'abismo', nombre: 'Gema del Abismo', gema: true, precio: 0, pila: true, desc: 'Mejora de +9 a +15. Si falla vuelve a +0, y desde +12 el equipo se rompe.' };
B.sello = { id: 'sello', nombre: 'Sello del Pozo', precio: 500, pila: true, desc: 'Entrada al Pozo de las Almas. Se gasta al entrar.' };
B.guardiana = { id: 'guardiana', nombre: 'Piedra Guardiana', precio: 0, pila: true, desc: 'Si la tenés en la mochila, evita que un equipo se rompa en la forja (se gasta).' };
// Mascotas (te siguen) y monturas (vas arriba, más rápido). ef: lo que dan. No se forjan ni salen excelentes.
const bestia = (id, nombre, r, req, precio, ef, desc) => B[id] = { id, nombre, r, req, precio, ef, desc, bestia: true, especial: true };
bestia('tabano', 'Tábano de Ceniza', 'mascota', 5, 4000, { junta: 1, oroPct: 10 }, 'Te sigue zumbando y junta solo el oro que cae cerca. +10% de oro.');
bestia('anima_g', 'Ánima Guardiana', 'mascota', 12, 15000, { menos: 12 }, 'Un alma vieja que se pone en el medio. Recibís 12% menos de daño.');
bestia('diablillo', 'Diablillo de Brasa', 'mascota', 28, 60000, { dmgPct: 12 }, 'Chiquito, malo y con hambre. Hacés 12% más de daño.');
bestia('lobo_m', 'Lobo Gris', 'montura', 15, 12000, { velMov: 25 }, 'Lo criaron en la Atalaya. Corrés 25% más rápido.');
bestia('ciervo_m', 'Ciervo Negro', 'montura', 35, 70000, { velMov: 35, defPct: 5 }, 'No le teme a nada. Corrés 35% más rápido y +5% de defensa.');
bestia('acechador_m', 'Acechador Domado', 'montura', 50, 0, { velMov: 45, dmgPct: 5 }, 'Solo lo sueltan los jefes. Corrés 45% más rápido y +5% de daño.');
B.acechador_m.valor = 200000;
// Alas: no se compran ni caen. Se forjan con Oria (ver ALAS) y se ven en la espalda.
const ala = (id, nombre, nivel, req, ef, desc, valor) => B[id] = { id, nombre, r: 'alas', ala: nivel, req, ef, desc, valor, especial: true };
ala('alas1', 'Alas de Ceniza', 1, 60, { dmgPct: 12, menos: 10 }, 'Membrana gris, rota en los bordes. +12% de daño y 10% menos de daño recibido.', 150000);
ala('alas2', 'Alas del Luto', 2, 120, { dmgPct: 22, menos: 18, hpPct: 5 }, 'Negras, con venas que todavía laten. +22% de daño, 18% menos de daño recibido y +5% de vida.', 800000);
ala('alas3', 'Alas del Sol Hondo', 3, 150, { dmgPct: 32, menos: 26, hpPct: 10, velMov: 10 }, 'Arden con la última luz del Sol que se apagó. +32% de daño, 26% menos de daño recibido, +10% de vida y +10% de velocidad.', 3000000);
// Receta de cada nivel de alas: oro, gemas, un equipo que se sacrifica y (desde el 2) las alas anteriores.
export const ALAS = [
  { b: 'alas1', oro: 100000, gema: 'destino', gemas: 5, sacrificio: { n: 7 }, texto: 'un equipo +7 o más', chance: 0.7 },
  { b: 'alas2', oro: 600000, gema: 'abismo', gemas: 3, sacrificio: { ra: 1 }, previa: 'alas1', texto: 'un equipo excelente', chance: 0.55 },
  { b: 'alas3', oro: 2000000, gema: 'abismo', gemas: 5, sacrificio: { ra: 2 }, previa: 'alas2', texto: 'un equipo legendario o mítico', chance: 0.4, renacido: 1 },
];
// Qué equipo de la mochila se usa en la receta (el más flojo que sirva). Devuelve el índice o -1.
export function sacrificioAlas(inv, receta) {
  let mejor = -1, peor = 1e9;
  inv.forEach((it, i) => {
    const b = it && BASES[it.b]; if (!b?.r || b.especial) return;
    const s = receta.sacrificio;
    if ((s.n && (it.n || 0) < s.n) || (s.ra && rareza(it) < s.ra)) return;
    const v = rareza(it) * 100 + (it.n || 0); if (v < peor) { peor = v; mejor = i; }
  });
  return mejor;
}
// Gemas para engarzar (como en Diablo): en el arma suman daño de su elemento; en la armadura, resistencia.
// El Ojo de Halcón da crítico. Se ponen en los engarces del equipo con el herrero.
// Cada gema tiene cuatro calidades: tres iguales se combinan en la Joyera y dan una de la calidad siguiente.
export const CALIDADES = [
  { nombre: 'Común', fem: '', mas: '', efecto: 1 },
  { nombre: 'Rara', fem: 'rara', mas: 'raro', efecto: 2, oro: 5000 },
  { nombre: 'Legendaria', fem: 'legendaria', mas: 'legendario', efecto: 3.5, oro: 50000 },
  { nombre: 'Mítica', fem: 'mítica', mas: 'mítico', efecto: 6, oro: 300000 },
];
const gemaEngarce = (id, nombre, elem, fem) => CALIDADES.forEach((c, i) => {
  const k = i ? id + (i + 1) : id, n = c.efecto, pct = Math.round(10 * n), res = Math.round(12 * n);
  B[k] = { id: k, nombre: i ? `${nombre} ${fem ? c.fem : c.mas}` : nombre, engarce: true, elem, pila: true, precio: 0, valor: 4000, de: id, calidad: i,
    desc: elem ? `En el arma: +${pct}% del daño como ${elem === 'sombra' ? 'sombra' : elem}. En la armadura: +${res}% de resistencia ${elem === 'sombra' ? 'a la sombra' : `al ${elem}`}.` : `En el arma: +${Math.round(4 * n)}% de crítico y +${Math.round(20 * n)}% de daño crítico. En la armadura: +${Math.round(2 * n)}% de crítico.` };
});
gemaEngarce('rubi', 'Rubí de Brasa', 'fuego');
gemaEngarce('zafiro', 'Zafiro de Escarcha', 'hielo');
gemaEngarce('topacio', 'Topacio de Tormenta', 'rayo');
gemaEngarce('esmeralda', 'Esmeralda Podrida', 'veneno', true);
gemaEngarce('onix', 'Ónix de Sombra', 'sombra');
gemaEngarce('ojo', 'Ojo de Halcón', null);
// La gema que sale al combinar tres de esta (null si ya es la mejor).
export const gemaSiguiente = g => { const b = B[g]; return b?.engarce && b.calidad < CALIDADES.length - 1 ? b.de + (b.calidad + 2) : null; };
export const GEMAS = ['rubi', 'zafiro', 'topacio', 'esmeralda', 'onix', 'ojo'];
// Engarces: cuántos puede tener según la rareza, y lo que cuesta abrir uno más.
export const ENGARCES = { max: [1, 2, 2, 3], abrir: n => 3000 * (n + 1) ** 2, sacar: 1500 };
export const maxEngarces = it => (BASES[it.b]?.especial ? 0 : ENGARCES.max[rareza(it)]);
export function efectoGema(g, enArma) {
  const b = BASES[g]; if (!b) return {};
  const k = CALIDADES[b.calidad || 0].efecto;
  if (b.de === 'ojo') return enArma ? { crit: Math.round(4 * k), critDano: Math.round(20 * k) } : { crit: Math.round(2 * k) };
  return enArma ? { elem: { [b.elem]: Math.round(10 * k) } } : { res: { [b.elem]: Math.round(12 * k) } };
}
export const BASES = B;
// Nivel visual de lo que tiene puesto (0 = Cuero / nivel 1 ... 6 = Último Rey), para vestir al personaje. -1 = nada.
const SETS_VIS = ['cuero', 'vigia', 'osario', 'foso', 'velo', 'escoria', 'rey', 'escarcha', 'draco'];
export function nivelVisual(it) {
  const b = it && B[it.b]; if (!b?.r || b.especial) return -1;
  if (b.r === 'arma' || b.r === 'escudo') return (+it.b.match(/(\d+)$/)?.[1] || 1) - 1;
  return SETS_VIS.indexOf(it.b.split('_')[1]);
}
// Bonus de set: llevar varias piezas (casco, armadura, guantes, botas) del mismo set suma extra. Más fuerte cuanto más alto el set.
export const SETS_BONUS = SETS_VIS.map((id, t) => ({
  id, nombre: { cuero: 'Cuero Gastado', vigia: 'Vigía', osario: 'Osario', foso: 'Foso', velo: 'Velo', escoria: 'Escoria', rey: 'Último Rey', escarcha: 'Escarcha', draco: 'Dragón' }[id],
  2: { defPct: 6 + t * 3, hpPct: 2 + t },
  4: { dmgPct: 5 + t * 3, crit: 1 + Math.floor(t / 2), resTodo: 4 + t * 3, ...(t >= 5 ? { velMov: 5 } : {}) },
}));
export function setsPuestos(eq) {
  const cuenta = {};
  for (const r of ['casco', 'armadura', 'guantes', 'botas']) { const t = SETS_VIS.indexOf(eq?.[r]?.b?.split('_')[1]); if (t >= 0) cuenta[t] = (cuenta[t] || 0) + 1; }
  return Object.entries(cuenta).filter(([, n]) => n >= 2).map(([t, n]) => ({ set: SETS_BONUS[t], n }));
}
export function textoBonus(ef) {
  const T = { defPct: v => `Defensa +${v}%`, hpPct: v => `Vida +${v}%`, dmgPct: v => `Daño +${v}%`, crit: v => `Crítico +${v}%`, resTodo: v => `Resistencias +${v}%`, velMov: v => `Velocidad +${v}%` };
  return Object.entries(ef).map(([k, v]) => T[k]?.(v) || '').filter(Boolean).join(' · ');
}
export const vistaEquipo = eq => ['casco', 'armadura', 'guantes', 'botas', 'arma', 'escudo'].map(r => nivelVisual(eq?.[r])).join(',');
export const esEquipo = b => !!BASES[b]?.r;
export const forjable = b => esEquipo(b) && !BASES[b].especial;
export const puedeUsar = (b, clase) => !BASES[b]?.clase || BASES[b].clase === clase;

// ---------- requisitos para ponerse un equipo ----------
// Nivel y atributos mínimos. Suben con la rareza y con la forja: un nivel 1 no puede usar un mítico.
const STAT_ARMA = { guardian: 'fue', barbaro: 'fue', desterrado: 'fue', cazadora: 'agi', sombra: 'agi', arcanista: 'ene', nigromante: 'ene' };
const TIER = req => (req >= 200 ? 8 : req >= 155 ? 7 : req >= 115 ? 6 : req >= 80 ? 5 : req >= 55 ? 4 : req >= 38 ? 3 : req >= 24 ? 2 : req >= 10 ? 1 : 0);
export function requisitos(it) {
  const b = BASES[it.b]; if (!b?.r) return null;
  if (b.especial) return { nivel: b.req, stat: {} };
  const t = TIER(b.req), ra = rareza(it), n = it.n || 0;
  const nivel = b.req + [0, 0, 8, 15][ra] + Math.floor(n / 3) + (ra === 3 ? Math.max(0, 40 - b.req - 15) : 0);
  const base = b.r === 'arma' ? [0, 45, 90, 150, 220, 320, 450, 620, 820][t] : b.r === 'escudo' ? [0, 35, 70, 120, 180, 260, 360, 500, 660][t] : [0, 30, 60, 100, 150, 220, 300, 400, 520][t];
  const k = b.r === 'arma' ? STAT_ARMA[b.clase] || 'fue' : b.r === 'escudo' ? 'fue' : 'vit';
  const valor = Math.round(base * (1 + 0.2 * ra) + n * 2 + (ra === 3 ? 40 : 0));
  return { nivel, stat: valor ? { [k]: valor } : {} };
}
export function motivoNoPuede(d, it) {
  const b = BASES[it.b]; if (!b?.r) return null;
  if (!puedeUsar(it.b, d.clase)) return `Tu clase no puede usar ${b.nombre}.`;
  const q = requisitos(it);
  if (d.nivel < q.nivel) return `Necesitás nivel ${q.nivel}.`;
  for (const [k, v] of Object.entries(q.stat)) if ((d[k] || 0) < v) return `Necesitás ${v} de ${{ fue: 'Fuerza', agi: 'Agilidad', vit: 'Vitalidad', ene: 'Energía' }[k]}.`;
  return null;
}

// ---------- opciones excelentes (brillan) ----------
export const EXCELENTES = {
  arma: [['dmgPct', 'Daño +10%', 10], ['vel', 'Velocidad de ataque +8%', 8], ['vidaKill', 'Recuperás vida al matar', 8], ['manaKill', 'Recuperás energía al matar', 8], ['exc', 'Más golpes excelentes', 10],
    ['crit', 'Crítico +5%', 5], ['critDano', 'Daño crítico +30%', 30], ['atr', 'Tu atributo principal +20', 20]],
  defensa: [['hpPct', 'Vida +5%', 5], ['menos', 'Daño recibido −4%', 4], ['refleja', 'Devuelve 5% del daño', 5], ['mpPct', 'Energía +5%', 5], ['defPct', 'Defensa +10%', 10],
    ['resTodo', 'Resistencia a los elementos +10%', 10], ['vit', 'Vitalidad +15', 15], ['crit', 'Crítico +2%', 2]],
};
const opcionesDe = it => EXCELENTES[BASES[it.b].r === 'arma' ? 'arma' : 'defensa'];
export function textoExcelente(it) { return (it.x || []).map(i => opcionesDe(it)[i][1]); }

// Rareza: 0 común · 1 excelente (verde) · 2 legendario (dorado) · 3 mítico (carmesí)
export const RAREZAS = [
  { nombre: 'Común', color: '#d8cfbd' },
  { nombre: 'Excelente', color: '#6fe0a0', opciones: [1, 2], poder: 1 },
  { nombre: 'Legendario', color: '#ffb84a', opciones: [3, 3], poder: 1.35 },
  { nombre: 'Mítico', color: '#ff3b4a', opciones: [4, 4], poder: 1.7 },
];
export const rareza = it => it?.ra || (it?.x?.length ? 1 : 0) || BASES[it?.b]?.calidad || 0;

export function nombreObjeto(it) {
  const b = BASES[it.b]; if (!b) return '¿?';
  if (b.engarce) return b.nombre;
  const ra = rareza(it);
  const nombre = ra === 1 ? `Excelente ${b.nombre}` : ra === 2 ? `${b.nombre} de los Antiguos` : ra === 3 ? `${b.nombre} del Sol Hondo` : b.nombre;
  return `${nombre}${it.n ? ' +' + it.n : ''}`;
}

// Daño o defensa del objeto con su mejora.
export function valores(it) {
  const b = BASES[it.b], n = it.n || 0, extra = n <= 9 ? n : 9 + (n - 9) * 2, k = RAREZAS[rareza(it)].poder || 1;
  if (b.dmg) return { dmg: [Math.round(b.dmg[0] * k) + extra * 3, Math.round(b.dmg[1] * k) + extra * 3] };
  if (b.def != null) return { def: Math.round(b.def * k) + extra * 2 };
  return {};
}

// Suma todo lo que da el equipo puesto.
export function bonusEquipo(equipo) {
  const t = { dmg: [0, 0], def: 0, dmgPct: 0, vel: 0, vidaKill: 0, manaKill: 0, exc: 0, hpPct: 0, menos: 0, refleja: 0, mpPct: 0, defPct: 0, velMov: 0, oroPct: 0, junta: 0,
    crit: 0, critDano: 0, atr: 0, vit: 0, resTodo: 0, elem: {}, res: {} };
  const sumar = ef => { for (const [k, v] of Object.entries(ef)) { if (k === 'elem' || k === 'res') for (const [e, n] of Object.entries(v)) t[k][e] = (t[k][e] || 0) + n; else t[k] += v; } };
  for (const r of RANURAS) {
    const it = equipo?.[r]; if (!it || !BASES[it.b]) continue;
    if (BASES[it.b].ef) for (const [k, val] of Object.entries(BASES[it.b].ef)) t[k] += val;
    for (const g of it.g || []) if (g) sumar(efectoGema(g, r === 'arma'));
    const v = valores(it);
    if (v.dmg) { t.dmg[0] += v.dmg[0]; t.dmg[1] += v.dmg[1]; }
    if (v.def) t.def += v.def;
    for (const i of it.x || []) { const [k, , val] = opcionesDe(it)[i]; t[k] += val; }
  }
  for (const { set, n } of setsPuestos(equipo)) { sumar(set[2]); if (n >= 4) sumar(set[4]); }
  return t;
}

// ---------- forja ----------
export const FORJA = {
  gemaPara: n => (n < 6 ? 'forja' : n < 9 ? 'destino' : n < 15 ? 'abismo' : null),
  chance: n => (n < 6 ? 1 : n < 9 ? [0.65, 0.55, 0.45][n - 6] : [0.5, 0.45, 0.4, 0.35, 0.3, 0.25][n - 9]),
  oro: n => Math.round(10 * (n + 1) ** 2),
};

// ---------- NPCs de cada atalaya ----------
// Cada atalaya vende el equipo de su nivel (tier 1 a 4).
const SETS_ID = ['cuero', 'vigia', 'osario', 'foso', 'velo', 'escoria', 'rey', 'escarcha', 'draco'];
const equipoDeTier = t => ['espada', 'ballesta', 'baculo', 'hacha', 'dagas', 'cetro', 'garras'].map(a => a + t).concat(['escudo' + t, ...['casco', 'armadura', 'guantes', 'botas'].map(r => `${r}_${SETS_ID[t - 1]}`)]);
// Trampitas para que haya que viajar: no todo está en la capital.
export const JOYERAS = [3, 6];    // Atalaya Hundida y Atalaya Calcinada: las gemas se trabajan solo acá
export const CALDEROS = [1, 5];   // Atalaya Ahogada y Atalaya de Sal: solo estos herreros tienen caldero
const ATALAYAS = [
  { x: 0, z: 0, tier: 1, nombres: ['Úrsula la Boticaria', 'Tordo el Herrero'], vidente: true, domadora: 'Mastín el Domador', bestias: ['tabano', 'anima_g', 'lobo_m'] },
  { x: -62, z: 46, tier: 2, nombres: ['Bruma la Ahogada', 'Garfio el Herrero'] },
  { x: 78, z: -46, tier: 3, nombres: ['Hueso Viejo', 'Maese Ceniciento'] },
  { x: -60, z: -74, tier: 3, nombres: ['La Hundida', 'Sargo el Herrero'] },
  { x: 60, z: 70, tier: 4, nombres: ['Madre Brasa', 'Yunque Rojo'], domadora: 'Cardo el Domador', bestias: ['tabano', 'anima_g', 'diablillo', 'lobo_m', 'ciervo_m'] },
  { x: 600, z: 0, tier: 5, nombres: ['Sal la Mercadera', 'Ancla el Herrero'] },
  { x: 0, z: 600, tier: 6, nombres: ['Hollín la Mercadera', 'Fragua el Herrero'] },
  { x: -600, z: 0, tier: 7, nombres: ['La Copera del Rey', 'Herrero de la Corte'] },
  { x: 600, z: 600, tier: 8, nombres: ['Nieve la Mercadera', 'Témpano el Herrero'] },
  { x: -600, z: 600, tier: 9, nombres: ['Escama la Mercadera', 'Colmillo el Herrero'] },
];
export const NPCS = ATALAYAS.flatMap((a, i) => {
  const lista = [
    { id: 'mercader' + i, rol: 'mercader', atalaya: i, nombre: a.nombres[0], modelo: 'npc_mercader.glb', x: a.x - 4.2, z: a.z - 2.8, giro: 0.9,
      frase: i ? 'Hasta acá llegan pocos. Los que llegan, compran.' : 'La sangre se compra. La tuya también, si no te cuidás.', vende: ['pocion', 'eter', 'vela'] },
    { id: 'herrero' + i, rol: 'herrero', atalaya: i, nombre: a.nombres[1], modelo: 'npc_herrero.glb', x: a.x + 4.4, z: a.z - 2.4, giro: -0.9,
      frase: i ? 'Acá el hierro es mejor. Y más caro. Lo vale.' : 'El hierro no miente. Las gemas sí, a veces.', vende: equipoDeTier(a.tier), forja: true },
  ];
  if (JOYERAS.includes(i)) lista.push({ id: 'joyera' + i, rol: 'joyera', atalaya: i, nombre: 'La Joyera', modelo: 'npc_vidente.glb', tinte: '#3a2a5a', x: a.x - 5.2, z: a.z + 1.4, giro: 1.4, frase: 'Tres piedras iguales valen más juntas. Dámelas y te muestro.' });
  lista.push({ id: 'baul' + i, rol: 'baul', atalaya: i, nombre: 'Baúl de la cuenta', x: a.x + 1.8, z: a.z + 1.6, giro: 0.6, frase: 'Lo que guardes acá lo ven todos tus personajes.' });
  lista.push({ id: 'tablon' + i, rol: 'tablon', atalaya: i, nombre: 'Tablón de Encargos', x: a.x - 2.6, z: a.z + 3.4, giro: 2.4, frase: 'Pedidos clavados con cuchillo. Siempre hay uno nuevo.' });
  lista.push({ id: 'farol' + i, rol: 'farol', atalaya: i, nombre: 'Farol', x: a.x, z: a.z, frase: 'Desde acá se viaja a las atalayas que ya encendiste.' });
  if (a.domadora) lista.push({ id: 'domadora' + i, rol: 'domadora', atalaya: i, nombre: a.domadora, modelo: 'npc_herrero.glb', tinte: '#34402a', x: a.x + 4.6, z: a.z + 3.4, giro: -2.3,
    frase: i ? 'Estas bestias ya probaron sangre. Por eso sirven.' : 'Ninguna bestia es mansa en el Luto. Algunas, por lo menos, son leales.', vende: a.bestias });
  if (a.vidente) lista.push({ id: 'vidente', rol: 'vidente', atalaya: i, nombre: 'Oria la Vidente', modelo: 'npc_vidente.glb', x: a.x, z: a.z + 4.6, giro: Math.PI,
    frase: 'Veo la Marea antes que llegue. Veo el rojo de la noche. Preguntame.', eventos: true, vende: ['vela', 'sello'] });
  return lista;
});
// La Senda Negra: portal entre la Atalaya Roja y la Atalaya de Sal.
NPCS.push(
  { id: 'senda4', rol: 'senda', atalaya: 4, destino: 5, nombre: 'Senda Negra', x: 63.5, z: 66.5, frase: 'Un camino que no está en ningún mapa. Lleva a la Costa de la Sal Negra (nivel 45).' },
  { id: 'senda5', rol: 'senda', atalaya: 5, destino: 4, nombre: 'Senda Negra', x: 596.5, z: 3.5, frase: 'Vuelve al Páramo, a la Atalaya Roja.' },
  { id: 'senda5y', rol: 'senda', atalaya: 5, destino: 6, nombre: 'Senda de Brasa', x: 605.2, z: 2.6, frase: 'Huele a azufre. Lleva al Yermo Calcinado (nivel 75).' },
  { id: 'senda6', rol: 'senda', atalaya: 6, destino: 5, nombre: 'Senda de Brasa', x: -5.4, z: 600.8, frase: 'Vuelve a la Costa, a la Atalaya de Sal.' },
  { id: 'senda6t', rol: 'senda', atalaya: 6, destino: 7, nombre: 'Senda del Rey', x: 5.2, z: 602.6, frase: 'Una escalera de piedra que baja. Lleva a la Ciudad del Trono Hundido (nivel 110).' },
  { id: 'senda7', rol: 'senda', atalaya: 7, destino: 6, nombre: 'Senda del Rey', x: -594.8, z: 2.6, frase: 'Vuelve al Yermo, a la Atalaya Calcinada.' },
  { id: 'senda7h', rol: 'senda', atalaya: 7, destino: 8, nombre: 'Senda de Escarcha', x: -605.2, z: 2.6, frase: 'Una puerta de hielo que no se derrite. Lleva al Glaciar del Silencio (nivel 150).' },
  { id: 'senda8', rol: 'senda', atalaya: 8, destino: 7, nombre: 'Senda de Escarcha', x: 594.8, z: 602.6, frase: 'Vuelve a la Ciudad, a la Atalaya del Último Rey.' },
  { id: 'senda8c', rol: 'senda', atalaya: 8, destino: 9, nombre: 'Senda del Dragón', x: 605.2, z: 602.6, frase: 'El aire quema aunque estés en el hielo. Lleva al Cráter del Dragón (nivel 195).' },
  { id: 'senda9', rol: 'senda', atalaya: 9, destino: 8, nombre: 'Senda del Dragón', x: -594.8, z: 602.6, frase: 'Vuelve al Glaciar, a la Atalaya de Escarcha.' });
export const DIST_NPC = 4.5;

// ---------- lo que tiran los monstruos ----------
// Devuelve una lista de cosas para tirar al piso: { oro } o { item }.
// clase: la de quien lo ganó; el equipo que cae sale casi siempre para esa clase.
export function tirada(def, rnd, extra = 1, clase = null) {
  const sale = [], nv = def.nivel;
  const rolls = def.jefe ? 7 : 1;
  for (let i = 0; i < rolls; i++) {
    if (!def.jefe && rnd() > 0.45 * extra) continue;
    const r = rnd();
    if (r < 0.36) sale.push({ oro: Math.round(nv * (3 + rnd() * 6) * (def.jefe ? 5 : 1)) });
    else if (r < 0.5) sale.push({ item: { b: rnd() < 0.7 ? 'pocion' : 'eter', c: 1 + Math.floor(rnd() * 2) } });
    else if (r < 0.62) sale.push({ item: { b: 'forja', c: 1 } });
    else if (r < 0.68 && nv >= 8) sale.push({ item: { b: 'destino', c: 1 } });
    else if (r < 0.705 && nv >= 18) sale.push({ item: { b: 'abismo', c: 1 } });
    else if (r < 0.72 && nv >= 12) sale.push({ item: { b: 'guardiana', c: 1 } });
    else if (r < 0.76) sale.push({ item: rnd() < 0.5 && nv >= 15 ? { b: GEMAS[Math.floor(rnd() * GEMAS.length)], c: 1 } : { b: 'vela', c: 1 } });
    else sale.push({ item: equipoAlAzar(nv, rnd, def.jefe ? 0.25 : 0.03 * extra, clase, def.jefe ? 0.06 : 0.002 * extra * extra, def.jefe ? 0.008 : 0) });
  }
  if (def.jefe && nv >= 40 && rnd() < 0.05) sale.push({ item: { b: 'acechador_m', n: 0 } });
  if (def.jefe && nv >= 15) sale.push({ item: { b: GEMAS[Math.floor(rnd() * GEMAS.length)], c: 1 + Math.floor(rnd() * 2) } });
  if (def.jefe) sale.push({ item: equipoAlAzar(nv + 4, rnd, 0.35, clase, def.soloEvento ? 0.25 : 0.1, def.soloEvento ? 0.06 : 0.015) }, { item: { b: nv >= 18 ? 'abismo' : 'destino', c: 1 } });
  return sale;
}

export function equipoAlAzar(nv, rnd, probExc, clase, probLeg = 0, probMit = 0) {
  const posibles = Object.values(BASES).filter(b => b.r && !b.especial && b.req <= nv + 3 && (!clase || !b.clase || b.clase === clase || rnd() < 0.25));
  const maxReq = Math.max(...posibles.map(b => b.req));
  const lista = posibles.filter(b => b.req >= maxReq - 12);
  const b = lista[Math.floor(rnd() * lista.length)];
  const it = { b: b.id, n: rnd() < 0.3 ? Math.floor(rnd() * 3) + 1 : 0 };
  const r = rnd(), ra = r < probMit ? 3 : r < probMit + probLeg ? 2 : r < probMit + probLeg + probExc ? 1 : 0;
  if (ra) {
    const ops = EXCELENTES[b.r === 'arma' ? 'arma' : 'defensa'], [mn, mx] = RAREZAS[ra].opciones;
    const n = mn + (rnd() < 0.3 ? mx - mn : 0), mezcla = ops.map((_, i) => i).sort(() => rnd() - 0.5);
    it.x = mezcla.slice(0, n); if (ra > 1) it.ra = ra;
  }
  // Engarces vacíos: los comunes a veces traen uno; los raros, más.
  const s = ra === 3 ? 3 : ra === 2 ? 2 : ra === 1 ? 1 + (rnd() < 0.3 ? 1 : 0) : rnd() < 0.25 ? 1 : 0;
  if (s) it.s = s;
  return it;
}

// Caldero del Caos: tres equipos de la misma rareza (y sin gemas) se funden en uno de la rareza siguiente, si sale bien.
export const CALDERO = { chance: [0.6, 0.35, 0.15], oro: [2000, 25000, 150000], devuelve: 0.2 };
export function calderoListo(lista) {
  if (lista.length !== 3 || lista.some(it => !forjable(it?.b) || it.g?.length)) return null;
  const ra = rareza(lista[0]); if (ra > 2 || lista.some(it => rareza(it) !== ra)) return null;
  return { ra, chance: CALDERO.chance[ra], oro: CALDERO.oro[ra], nivel: Math.max(...lista.map(it => BASES[it.b].req)) };
}
// El resultado: un equipo al azar del nivel del mejor que entró, con la rareza siguiente.
export function fundir(ra, nivel, clase, rnd) {
  const pedida = ra + 1;
  for (let i = 0; i < 50; i++) { const it = equipoAlAzar(nivel, rnd, pedida === 1 ? 1 : 0, clase, pedida === 2 ? 1 : 0, pedida === 3 ? 1 : 0); if (puedeUsar(it.b, clase)) return it; }
  return { b: `armadura_${SETS_VIS[Math.max(0, SETS.findIndex(x => x[2] > nivel) - 1)] || 'cuero'}`, n: 0 };
}

// Orden de la mochila: pociones, gemas, lo demás que se apila y el equipo, de lo mejor a lo peor en cada tipo.
const PESO_RANURA = Object.fromEntries(RANURAS.map((r, i) => [r, 10 + i]));
const pesoObjeto = b => (b?.r ? PESO_RANURA[b.r] : b?.uso === 'cura' ? 0 : b?.uso === 'mana' ? 1 : b?.gema ? 2 : b?.engarce ? 3 : 4);
export const ordenMochila = (x, y) => {
  const a = BASES[x.b], b = BASES[y.b];
  return pesoObjeto(a) - pesoObjeto(b) || rareza(y) - rareza(x) || (b?.req || 0) - (a?.req || 0) || (y.n || 0) - (x.n || 0) || x.b.localeCompare(y.b);
};

export function precioVenta(it) {
  const b = BASES[it.b]; if (!b) return 0;
  const base = b.precio || b.valor || (b.gema ? 800 : 300);
  return Math.max(1, Math.round(base / 5 * (1 + (it.n || 0) * 0.5) * [1, 3, 10, 30][rareza(it)]));
}
