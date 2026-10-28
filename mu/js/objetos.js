// Objetos, equipo, gemas, forja, tiendas y lo que tiran los monstruos. Compartido celu ↔ servidor.

export const RANURAS = ['arma', 'escudo', 'casco', 'armadura', 'guantes', 'botas'];
export const NOMBRE_RANURA = { arma: 'Arma', escudo: 'Escudo', casco: 'Casco', armadura: 'Armadura', guantes: 'Guantes', botas: 'Botas' };
export const MOCHILA = 40;          // casilleros de la mochila
export const PILA = 50;             // cuántas pociones o gemas entran en un casillero

// ---------- bases ----------
// r: ranura · req: nivel para usar · dmg o def · precio en oro (la tienda vende a ese precio y compra a un quinto)
const B = {};
// clase: solo esa clase lo puede usar
const arma = (id, nombre, clase, req, dmg, precio) => B[id] = { id, nombre, r: 'arma', clase, req, dmg, precio };
const escudo = (id, nombre, req, def, precio) => B[id] = { id, nombre, r: 'escudo', clase: 'guardian', req, def, precio };
const ARMAS = {
  guardian: [['espada', ['Espada Oxidada', 'Hoja de Vigía', 'Mandoble del Luto', 'Filo del Éter']], [[4, 7], [10, 15], [20, 30], [34, 48]]],
  cazadora: [['ballesta', ['Ballesta de Caza', 'Ballesta de Vigía', 'Ballesta del Luto', 'Ballesta del Éter']], [[3, 6], [8, 13], [17, 26], [29, 42]]],
  arcanista: [['baculo', ['Bastón de Fresno', 'Báculo de Vigía', 'Báculo del Luto', 'Báculo del Éter']], [[3, 6], [9, 14], [19, 28], [32, 45]]],
  barbaro: [['hacha', ['Hachas Melladas', 'Hachas de Vigía', 'Hachas del Luto', 'Hachas del Éter']], [[5, 8], [11, 17], [22, 33], [37, 52]]],
};
const REQ = [1, 10, 24, 38], PRECIO = [60, 900, 6000, 30000];
for (const [clase, [[pref, nombres], dmgs]] of Object.entries(ARMAS)) nombres.forEach((n, i) => arma(pref + (i + 1), n, clase, REQ[i], dmgs[i], PRECIO[i]));
escudo('escudo1', 'Rodela de Pino', 1, 3, 50);
escudo('escudo2', 'Escudo de Atalaya', 10, 8, 800);
escudo('escudo3', 'Égida Hueca', 24, 16, 5500);
escudo('escudo4', 'Baluarte Negro', 38, 26, 28000);
const SETS = [
  ['cuero', 'de Cuero Gastado', 1, 1],
  ['vigia', 'de Vigía', 12, 2.4],
  ['osario', 'del Osario', 24, 4.6],
  ['foso', 'del Foso', 38, 7.4],
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
B.guardiana = { id: 'guardiana', nombre: 'Piedra Guardiana', precio: 0, pila: true, desc: 'Si la tenés en la mochila, evita que un equipo se rompa en la forja (se gasta).' };
export const BASES = B;
export const esEquipo = b => !!BASES[b]?.r;
export const puedeUsar = (b, clase) => !BASES[b]?.clase || BASES[b].clase === clase;

// ---------- opciones excelentes (brillan) ----------
export const EXCELENTES = {
  arma: [['dmgPct', 'Daño +10%', 10], ['vel', 'Velocidad de ataque +8%', 8], ['vidaKill', 'Recuperás vida al matar', 8], ['manaKill', 'Recuperás energía al matar', 8], ['exc', 'Más golpes excelentes', 10]],
  defensa: [['hpPct', 'Vida +5%', 5], ['menos', 'Daño recibido −4%', 4], ['refleja', 'Devuelve 5% del daño', 5], ['mpPct', 'Energía +5%', 5], ['defPct', 'Defensa +10%', 10]],
};
const opcionesDe = it => EXCELENTES[BASES[it.b].r === 'arma' ? 'arma' : 'defensa'];
export function textoExcelente(it) { return (it.x || []).map(i => opcionesDe(it)[i][1]); }

export function nombreObjeto(it) {
  const b = BASES[it.b]; if (!b) return '¿?';
  return `${it.x?.length ? 'Excelente ' : ''}${b.nombre}${it.n ? ' +' + it.n : ''}`;
}

// Daño o defensa del objeto con su mejora.
export function valores(it) {
  const b = BASES[it.b], n = it.n || 0, extra = n <= 9 ? n : 9 + (n - 9) * 2;
  if (b.dmg) return { dmg: [b.dmg[0] + extra * 3, b.dmg[1] + extra * 3] };
  if (b.def != null) return { def: b.def + extra * 2 };
  return {};
}

// Suma todo lo que da el equipo puesto.
export function bonusEquipo(equipo) {
  const t = { dmg: [0, 0], def: 0, dmgPct: 0, vel: 0, vidaKill: 0, manaKill: 0, exc: 0, hpPct: 0, menos: 0, refleja: 0, mpPct: 0, defPct: 0 };
  for (const r of RANURAS) {
    const it = equipo?.[r]; if (!it || !BASES[it.b]) continue;
    const v = valores(it);
    if (v.dmg) { t.dmg[0] += v.dmg[0]; t.dmg[1] += v.dmg[1]; }
    if (v.def) t.def += v.def;
    for (const i of it.x || []) { const [k, , val] = opcionesDe(it)[i]; t[k] += val; }
  }
  return t;
}

// ---------- forja ----------
export const FORJA = {
  gemaPara: n => (n < 6 ? 'forja' : n < 9 ? 'destino' : n < 15 ? 'abismo' : null),
  chance: n => (n < 6 ? 1 : n < 9 ? [0.65, 0.55, 0.45][n - 6] : [0.5, 0.45, 0.4, 0.35, 0.3, 0.25][n - 9]),
  oro: n => Math.round(10 * (n + 1) ** 2),
};

// ---------- NPCs en la Atalaya ----------
export const NPCS = [
  { id: 'mercader', nombre: 'Úrsula la Boticaria', modelo: 'npc_mercader.glb', x: -4.2, z: -2.8, giro: 0.9,
    frase: 'La sangre se compra. La tuya también, si no te cuidás.', vende: ['pocion', 'eter', 'vela'] },
  { id: 'herrero', nombre: 'Tordo el Herrero', modelo: 'npc_herrero.glb', x: 4.4, z: -2.4, giro: -0.9,
    frase: 'El hierro no miente. Las gemas sí, a veces.', vende: ['espada1', 'ballesta1', 'baculo1', 'hacha1', 'escudo1', 'casco_cuero', 'armadura_cuero', 'guantes_cuero', 'botas_cuero',
      'espada2', 'ballesta2', 'baculo2', 'hacha2', 'escudo2', 'casco_vigia', 'armadura_vigia', 'guantes_vigia', 'botas_vigia'], forja: true },
  { id: 'vidente', nombre: 'Oria la Vidente', modelo: 'npc_vidente.glb', x: 0, z: 4.6, giro: Math.PI,
    frase: 'Veo la Marea antes que llegue. Veo el rojo de la noche. Preguntame.', eventos: true, vende: ['vela'] },
];
export const DIST_NPC = 4.5;

// ---------- lo que tiran los monstruos ----------
// Devuelve una lista de cosas para tirar al piso: { oro } o { item }.
export function tirada(def, rnd, extra = 1) {
  const sale = [], nv = def.nivel;
  const rolls = def.jefe ? 7 : 1;
  for (let i = 0; i < rolls; i++) {
    if (!def.jefe && rnd() > 0.45 * extra) continue;
    const r = rnd();
    if (r < 0.42) sale.push({ oro: Math.round(nv * (3 + rnd() * 6) * (def.jefe ? 5 : 1)) });
    else if (r < 0.58) sale.push({ item: { b: rnd() < 0.7 ? 'pocion' : 'eter', c: 1 + Math.floor(rnd() * 2) } });
    else if (r < 0.72) sale.push({ item: { b: 'forja', c: 1 } });
    else if (r < 0.78 && nv >= 8) sale.push({ item: { b: 'destino', c: 1 } });
    else if (r < 0.805 && nv >= 18) sale.push({ item: { b: 'abismo', c: 1 } });
    else if (r < 0.82 && nv >= 12) sale.push({ item: { b: 'guardiana', c: 1 } });
    else if (r < 0.86) sale.push({ item: { b: 'vela', c: 1 } });
    else sale.push({ item: equipoAlAzar(nv, rnd, def.jefe ? 0.25 : 0.03) });
  }
  if (def.jefe) sale.push({ item: equipoAlAzar(nv + 4, rnd, 0.35) }, { item: { b: nv >= 18 ? 'abismo' : 'destino', c: 1 } });
  return sale;
}

export function equipoAlAzar(nv, rnd, probExc, clase) {
  const posibles = Object.values(BASES).filter(b => b.r && b.req <= nv + 3 && (!clase || !b.clase || b.clase === clase || rnd() < 0.25));
  const maxReq = Math.max(...posibles.map(b => b.req));
  const lista = posibles.filter(b => b.req >= maxReq - 12);
  const b = lista[Math.floor(rnd() * lista.length)];
  const it = { b: b.id, n: rnd() < 0.3 ? Math.floor(rnd() * 3) + 1 : 0 };
  if (rnd() < probExc) {
    const ops = EXCELENTES[b.r === 'arma' ? 'arma' : 'defensa'];
    const a = Math.floor(rnd() * ops.length); it.x = [a];
    if (rnd() < 0.3) { const c = (a + 1 + Math.floor(rnd() * (ops.length - 1))) % ops.length; it.x.push(c); }
  }
  return it;
}

export function precioVenta(it) {
  const b = BASES[it.b]; if (!b) return 0;
  const base = b.precio || (b.gema ? 800 : 300);
  return Math.max(1, Math.round(base / 5 * (1 + (it.n || 0) * 0.5) * (it.x?.length ? 3 : 1)));
}
