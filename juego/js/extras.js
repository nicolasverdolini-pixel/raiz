// Bestiario (monstruos derrotados) y logros con premio.
'use strict';

// ---------- Registro al terminar cada batalla ----------
const _batallar = batallar;
batallar = (def, ids, alTerminar, escena) => _batallar(def, ids, res => {
  if (res.gano) {
    G.bestiario = G.bestiario || {};
    (res.derrotados || []).forEach(c => { G.bestiario[c] = (G.bestiario[c] || 0) + 1; });
    G.flags.derrotados = (G.flags.derrotados || 0) + (res.derrotados || []).length;
    if (res.sinBajas && !def.patrulla) G.flags.sinBajas = (G.flags.sinBajas || 0) + 1;
    guardar();
  }
  alTerminar(res);
}, escena);

// ---------- Bestiario ----------
function pantallaBestiario() {
  const B = G.bestiario || {};
  const lista = Object.keys(CLASES).filter(k => CLASES[k].mon);
  const vistos = lista.filter(k => B[k]).length;
  const tarjeta = k => {
    const C = CLASES[k], n = B[k] || 0;
    if (!n) return `<div class="bes bloq"><span class="bes-img">?</span><b>???</b><small>Sin descubrir</small></div>`;
    const debil = (C.debil || []).map(e => ELEMENTOS[e]?.n).filter(Boolean).join(', ');
    const resiste = Object.entries(C.resEl || {}).map(([e, v]) => `${ELEMENTOS[e]?.n} ${Math.round(v * 100)}%`).join(', ');
    const habs = (C.habs || []).map(h => HAB[h]?.n).filter(Boolean).join(', ');
    return `<div class="bes"><span class="bes-img">${spriteHTML({ clase:k, look:{} }, 64)}</span><b>${esc(C.n)}</b>
      <small>Derrotados: ${n}${C.raza ? ' · ' + esc(C.raza) : ''}</small>
      ${debil ? `<small class="bes-d">Débil a: ${esc(debil)}</small>` : ''}${resiste ? `<small class="bes-r">Resiste: ${esc(resiste)}</small>` : ''}
      ${habs ? `<small>Usa: ${esc(habs)}</small>` : ''}</div>`;
  };
  modal(`<h3>Bestiario</h3><p class="sub centro">Descubiertos: ${vistos} de ${lista.length}. Derrotaste ${G.flags.derrotados || 0} enemigos en total.</p>
    <div class="bestiario">${lista.map(tarjeta).join('')}</div><button data-x="cerrar" class="sec">Cerrar</button>`, {});
}

// ---------- Logros ----------
const dominadas = () => G.unidades.reduce((a, u) => a + Object.keys(MAESTRIA).filter(c => dominada(u, c)).length, 0);
const LOGROS = [
  { id:'primera', n:'Primera campanada', d:'Ganá tu primera batalla.', ok:() => G.batallas >= 1, oro:200 },
  { id:'cien', n:'Veterano de guerra', d:'Peleá 100 batallas.', ok:() => G.batallas >= 100, oro:5000 },
  { id:'trescientas', n:'Leyenda de Aldmora', d:'Peleá 300 batallas.', ok:() => G.batallas >= 300, oro:20000 },
  { id:'sin_bajas', n:'Nadie se queda atrás', d:'Ganá una batalla sin que caiga nadie del grupo.', ok:() => (G.flags.sinBajas || 0) >= 1, oro:1500 },
  { id:'sin_bajas20', n:'Guardianes perfectos', d:'Ganá 20 batallas sin bajas.', ok:() => (G.flags.sinBajas || 0) >= 20, oro:15000 },
  { id:'cazador', n:'Cazador curioso', d:'Descubrí 12 monstruos en el bestiario.', ok:() => Object.keys(G.bestiario || {}).filter(k => CLASES[k]?.mon).length >= 12, oro:4000 },
  { id:'cazador_total', n:'El bestiario completo', d:'Descubrí todos los monstruos.', ok:() => Object.keys(CLASES).filter(k => CLASES[k].mon).every(k => (G.bestiario || {})[k]), oro:30000, eq:{ id:'amuleto_eco', rareza:4 } },
  { id:'mil', n:'Mil enemigos', d:'Derrotá 1000 enemigos.', ok:() => (G.flags.derrotados || 0) >= 1000, oro:25000 },
  { id:'maestro', n:'Maestro de oficios', d:'Dominá 5 oficios entre todo el grupo.', ok:() => dominadas() >= 5, oro:6000 },
  { id:'gran_maestro', n:'Gran maestro de oficios', d:'Dominá 20 oficios entre todo el grupo.', ok:() => dominadas() >= 20, oro:30000, eq:{ id:'anillo_marea', rareza:4 } },
  { id:'nivel99', n:'Al tope', d:'Llevá un personaje al nivel 99.', ok:() => G.unidades.some(u => u.nivel >= 99), oro:20000 },
  { id:'acto1', n:'Las siete campanas', d:'Terminá el Acto I.', ok:() => G.paso >= 11, oro:3000 },
  { id:'acto2', n:'El Devorador cae', d:'Terminá el Acto II.', ok:() => G.paso >= 27, oro:10000 },
  { id:'acto3', n:'La nota que recuerda', d:'Terminá el Acto III.', ok:() => G.paso >= 39, oro:25000 },
  { id:'secretas', n:'Oído de vecino', d:'Cumplí 5 misiones secretas.', ok:() => Object.keys(SECRETAS).filter(k => G.flags['sec_' + k + '_ok']).length >= 5, oro:8000 },
  { id:'torre10', n:'Torre: piso 10', d:'Subí hasta el piso 10 de la Torre de la Bruma.', ok:() => (G.flags.torrePiso || 0) >= 10, oro:10000 },
  { id:'torre25', n:'Torre: piso 25', d:'Subí hasta el piso 25.', ok:() => (G.flags.torrePiso || 0) >= 25, oro:30000, eq:{ id:'arpa_sirena', rareza:4 } },
  { id:'torre50', n:'Sobre la niebla', d:'Subí hasta el piso 50.', ok:() => (G.flags.torrePiso || 0) >= 50, oro:80000 },
  { id:'mitico', n:'Brillo mítico', d:'Conseguí un equipo mítico.', ok:() => G.equipo.some(i => i.rareza >= 4), oro:3000 },
  { id:'mascotas', n:'Arca de Brezal', d:'Juntá 6 mascotas distintas.', ok:() => new Set(G.mascotas.map(m => m.id)).size >= 6, oro:6000 },
  { id:'rico', n:'Bolsillos llenos', d:'Juntá 100.000 de oro.', ok:() => G.oro >= 100000, oro:0, eq:{ id:'daga_eco', rareza:4 } },
];
// Da los logros nuevos (una sola vez cada uno) y avisa.
function revisarLogros() {
  if (!G) return;
  G.logros = G.logros || {};
  const nuevos = LOGROS.filter(L => !G.logros[L.id] && L.ok());
  nuevos.forEach((L, i) => {
    G.logros[L.id] = Date.now();
    G.oro += L.oro || 0;
    if (L.eq && EQ[L.eq.id]) G.equipo.push(nuevoItem(L.eq.id, 0, L.eq.rareza));
    setTimeout(() => { toast(`🏅 Logro: ${L.n}${L.oro ? ` (+${L.oro} oro)` : ''}${L.eq ? ` + ${EQ[L.eq.id].n}` : ''}`, 'bien'); Sonido.fx('nivel'); }, 800 + i * 1800);
  });
  if (nuevos.length) guardar();
}
function pantallaLogros() {
  revisarLogros();
  const hechos = LOGROS.filter(L => G.logros?.[L.id]).length;
  modal(`<h3>Logros</h3><p class="sub centro">${hechos} de ${LOGROS.length}</p>
    <div class="logros">${LOGROS.map(L => { const ok = G.logros?.[L.id]; return `<div class="logro ${ok ? 'ok' : ''}"><span>${ok ? '🏅' : '🔒'}</span><div><b>${esc(L.n)}</b><small>${esc(L.d)}</small><small class="premio">${L.oro ? L.oro + ' oro' : ''}${L.eq && EQ[L.eq.id] ? (L.oro ? ' + ' : '') + EQ[L.eq.id].n + ' mítico' : ''}</small></div></div>`; }).join('')}</div>
    <button data-x="cerrar" class="sec">Cerrar</button>`, {});
}
const _pantallaMapa = pantallaMapa;
pantallaMapa = region => { _pantallaMapa(region); revisarLogros(); };
const _pantallaAjustes = pantallaAjustes;
pantallaAjustes = () => {
  _pantallaAjustes();
  const v = document.querySelector('.modal:last-child .ventana'); if (!v) return;
  const caja = document.createElement('div');
  caja.innerHTML = '<button data-x="bestiario">📖 Bestiario</button><button data-x="logros">🏅 Logros</button>';
  v.insertBefore(caja, v.querySelector('h3').nextSibling);
  caja.addEventListener('click', e => { const b = e.target.closest('[data-x]'); if (!b) return; e.stopPropagation(); v.parentElement.remove(); b.dataset.x === 'bestiario' ? pantallaBestiario() : pantallaLogros(); });
};
