// Torre de la Bruma sin fin: después de cumplir la misión de la torre, se puede seguir subiendo.
// Cada piso es más difícil; cada 5 pisos hay un jefe y cada 10, premio mítico.
'use strict';

const TORRE = {
  // Batallas que prestan su mapa y sus posiciones a los pisos.
  bases:['b14', 'b17', 'b20', 'b22', 'b25', 'b30', 'b33', 'b35', 'b36', 'b38'],
  comunes:[['lobo', 'bestia', 'arana', 'gargola', 'esqueleto', 'espectro', 'sabueso', 'salamandra', 'murcielago'],
           ['demonio', 'lich', 'wyvern', 'golem', 'sirena', 'diablillo', 'berserker:coro', 'nigromante:coro', 'medium:coro'],
           ['demonio', 'lich', 'wyvern', 'sirena', 'berserker:coro', 'cantor:coro', 'alquimista:coro', 'domador:coro', 'trovador:coro']],
  jefes:['voz', 'guardian', 'grakk', 'cancerbero', 'thanatyr', 'dragon_anciano', 'vaelgor', 'dragon_marino', 'eco', 'vaelgor2'],
};
function pisoTorre() { return (G.flags.torrePiso || 0) + 1; }
function defPiso(n) {
  const base = BATALLAS[TORRE.bases[(n * 7) % TORRE.bases.length]];
  const nv = Math.min(150, 58 + n * 2);
  const pool = TORRE.comunes[n < 10 ? 0 : n < 25 ? 1 : 2];
  const jefe = n % 5 === 0;
  const pos = base.e.map(e => [e.x, e.y]);
  const cant = Math.min(pos.length, 4 + Math.min(2, Math.floor(n / 8)));
  const e = pos.slice(0, cant).map(([x, y], i) => {
    if (jefe && i === 0) { const c = TORRE.jefes[(n / 5 - 1) % TORRE.jefes.length]; return { c, nv:nv + 4, x, y, n:`${CLASES[c].n} (piso ${n})`, jefe:true }; }
    const [c, t] = pool[(n * 3 + i * 5) % pool.length].split(':');
    return { c, t, nv:nv + (i % 2), x, y };
  });
  return { n:`Torre de la Bruma — Piso ${n}`, mapa:base.mapa, musica:jefe ? 'final' : 'jefe', aliados:base.aliados, e, oro:800 + n * 250,
    objetivo: jefe ? 'Derrotá al guardián del piso' : 'Derrotá a todos los enemigos', jefeGana:jefe, torre:n,
    premio:{ oro:0, mat: n % 5 === 0 ? { perla_eco:2, esquirla:2, escama:1 } : { esquirla:1 },
      equipo: n % 10 === 0 ? [{ id:equipoAzar(6), rareza:4 }] : n % 5 === 0 ? [{ id:equipoAzar(6), rareza:3 }] : [] } };
}
function subirTorre() {
  const n = pisoTorre(), def = defPiso(n);
  preparar(def, { alVolver:pantallaMapa }, ids => batallar(def, ids, res => {
    if (!res.gano) { pantallaDerrota(def, ids, subirTorre); return; }
    G.flags.torrePiso = Math.max(G.flags.torrePiso || 0, n);
    guardar();
    const p = aplicarPremios(def, res);
    pantallaResultados(p, () => dialogo([[null, n % 10 === 0 ? `¡Piso ${n} superado! La niebla se abre un poco más. Récord: piso ${n}.` : `Piso ${n} superado. Arriba, la escalera sigue.`]], pantallaMapa));
  }));
}
// La torre ofrece seguir subiendo una vez cumplida su misión.
const _tocarNodo = tocarNodo;
tocarNodo = id => {
  if (id !== 'torre' || !G.flags.sec_torre_ok) { _tocarNodo(id); return; }
  const n = pisoTorre(), def = defPiso(n);
  const nv = Math.max(...def.e.map(e => e.nv));
  modal(`<h3>La Torre de la Bruma</h3>
    <p class="sub centro">Récord: piso ${G.flags.torrePiso || 0}. Cada 5 pisos hay un guardián y cada 10, equipo mítico.</p>
    <button data-x="subir" class="ok">🗼 Subir al piso ${n} (nivel ${nv}${n % 5 === 0 ? ' · guardián' : ''})</button>
    <button data-x="patrulla">⚔️ Patrullar la torre</button>
    <button data-x="cerrar" class="sec">Cancelar</button>`, {
    subir: (d, c) => { c(); subirTorre(); },
    patrulla: (d, c) => { c(); patrullar('torre'); },
  });
};
