// Ventanas del juego, todas con el mismo estilo: personaje (equipo, mochila, habilidades, atributos),
// NPCs (tienda, forja, vidente), baúl de la cuenta, viajes desde el farol y comercio.
import * as R from './reglas.js';
import * as O from './objetos.js';
import * as C from './clases.js';
import { iconoObjeto, iconoHab } from './iconos.js';
import { foto, alTerminar } from './miniaturas.js';
import * as MI from './misiones.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NOMBRE_STAT = { fue: 'Fuerza', agi: 'Agilidad', vit: 'Vitalidad', ene: 'Energía' };
const RANGO = ['comun', 'exc', 'leg', 'mit'];
export const claseObjeto = it => (it ? 'r-' + RANGO[O.rareza(it)] + ((it.n || 0) >= 7 ? ' alto' : '') : '');

// Imagen del objeto: foto 3D si es arma o escudo, si no el ícono.
export function imagen(it) {
  const url = foto(it);
  return url ? `<img src="${url}" alt="" draggable="false">` : iconoObjeto(it.b, it);
}

// Casillero de objeto (mismo en mochila, tienda, baúl, forja y comercio).
function casilla(it, attrs = '', extra = '') {
  if (!it) return `<button class="slot" ${attrs}>${extra}</button>`;
  const cant = it.c > 1 ? `<small class="cant">${it.c}</small>` : it.n ? `<small class="mas-n">+${it.n}</small>` : '';
  return `<button class="slot ${claseObjeto(it)}" ${attrs}>${imagen(it)}${cant}${extra}</button>`;
}

// Ficha con todo lo que importa del objeto. d = personaje (para requisitos y comparación).
function ficha(it, d, acciones = '') {
  const b = O.BASES[it.b], v = O.valores(it), ra = O.rareza(it), lineas = [];
  if (v.dmg) {
    const puesto = d?.equipo?.[b.r], vp = puesto && puesto !== it ? O.valores(puesto).dmg : null;
    const dif = vp ? Math.round((v.dmg[0] + v.dmg[1] - vp[0] - vp[1]) / 2) : null;
    lineas.push(`<span class="dato">Daño <b>${v.dmg[0]}–${v.dmg[1]}</b>${dif ? ` <em class="${dif > 0 ? 'mejor' : 'peor'}">${dif > 0 ? '▲' : '▼'} ${Math.abs(dif)}</em>` : ''}</span>`);
  }
  if (v.def != null && b.r) {
    const puesto = d?.equipo?.[b.r], dif = puesto && puesto !== it ? v.def - O.valores(puesto).def : null;
    lineas.push(`<span class="dato">Defensa <b>${v.def}</b>${dif ? ` <em class="${dif > 0 ? 'mejor' : 'peor'}">${dif > 0 ? '▲' : '▼'} ${Math.abs(dif)}</em>` : ''}</span>`);
  }
  const q = b.r ? O.requisitos(it) : null, req = [];
  if (b.clase) req.push(`<span class="${d && b.clase !== d.clase ? 'falta' : ''}">${C.CLASES[b.clase].nombre}</span>`);
  if (q) {
    req.push(`<span class="${d && d.nivel < q.nivel ? 'falta' : ''}">Nivel ${q.nivel}</span>`);
    for (const [k, val] of Object.entries(q.stat)) req.push(`<span class="${d && (d[k] || 0) < val ? 'falta' : ''}">${NOMBRE_STAT[k]} ${val}</span>`);
  }
  return `<div class="ficha ${claseObjeto(it)}">
    <div class="ficha-top"><div class="ficha-img ${claseObjeto(it)}">${imagen(it)}</div>
      <div><b>${esc(O.nombreObjeto(it))}${it.c > 1 ? ' × ' + it.c : ''}</b><span class="rareza">${b.r ? O.RAREZAS[ra].nombre + (b.r ? ' · ' + O.NOMBRE_RANURA[b.r] : '') : b.gema ? 'Gema' : 'Consumible'}</span></div></div>
    ${lineas.join('')}
    ${O.textoExcelente(it).map(t => `<span class="exc-op">◆ ${t}</span>`).join('')}
    ${req.length ? `<div class="req">Pide: ${req.join(' · ')}</div>` : ''}
    ${b.desc ? `<p class="nota">${b.desc}</p>` : ''}
    ${acciones ? `<div class="acciones">${acciones}</div>` : ''}</div>`;
}

export class Paneles {
  constructor(ctx) {
    // ctx: { mio(), mandar(obj), npcCerca(id), rolCerca(rol), toast(t), cambiarPj() }
    this.ctx = ctx; this.abierto = null; this.sel = null;
    const el = document.createElement('div'); el.id = 'panel'; el.className = 'caja panel'; el.hidden = true;
    document.getElementById('hud').appendChild(el); this.el = el;
    el.addEventListener('pointerdown', e => e.stopPropagation());
    alTerminar(() => this.refrescar());
  }
  cerrar() { this.el.hidden = true; this.abierto = null; this.sel = null; }
  refrescar() { if (this.abierto && !this.el.hidden) this[this.abierto.f](...this.abierto.args); }
  marco(titulo, sub, tabs, actual, cuerpo, f, args) {
    const scroll = this.el.querySelector('.cuerpo')?.scrollTop || 0, mismo = this.abierto?.f === f && this.abierto?.args[0] === args[0];
    this.abierto = { f, args };
    this.el.innerHTML = `<header><div><h2>${titulo}</h2>${sub ? `<span class="sub">${sub}</span>` : ''}</div><button class="x" id="p-cerrar" aria-label="Cerrar">✕</button></header>
      ${tabs ? `<nav>${tabs.map(([id, n]) => `<button data-tab="${id}" class="${id === actual ? 'on' : ''}">${n}</button>`).join('')}</nav>` : ''}
      <div class="cuerpo">${cuerpo}</div>`;
    this.el.hidden = false;
    if (mismo) this.el.querySelector('.cuerpo').scrollTop = scroll;
    $('#p-cerrar', this.el).onclick = () => this.cerrar();
    this.el.querySelectorAll('nav button').forEach(b => b.onclick = () => { this.sel = null; if (f === 'npc') this.npc(args[0], b.dataset.tab); else this[f](b.dataset.tab); });
  }
  oro(d) { return `<span class="oro">${iconoObjeto('oro')} ${d.oro.toLocaleString('es-AR')}</span>`; }

  // ---------- personaje ----------
  personaje(tab = 'equipo') {
    const d = this.ctx.mio(); if (!d) return;
    const libres = C.puntosArbol(d) - C.gastados(d);
    const tabs = [['equipo', 'Equipo'], ['habilidades', `Habilidades${libres ? ' ●' : ''}`], ['atributos', `Atributos${d.puntos ? ' ●' : ''}`], ['misiones', 'Misiones']];
    let cuerpo = '';
    if (tab === 'equipo') cuerpo = this.htmlEquipo(d);
    if (tab === 'habilidades') cuerpo = this.htmlArbol(d);
    if (tab === 'atributos') cuerpo = this.htmlAtributos(d);
    if (tab === 'misiones') cuerpo = this.htmlDiario(d);
    this.marco(esc(d.nombre), `${C.CLASES[d.clase].nombre} · Nivel ${d.nivel}`, tabs, tab, cuerpo, 'personaje', [tab]);
    if (tab === 'equipo') this.conectarMochila(d);
    this.el.querySelectorAll('[data-h]').forEach(b => b.onclick = () => this.ctx.mandar({ t: 'aprender', h: b.dataset.h }));
    this.el.querySelectorAll('.mas').forEach(b => b.onclick = () => this.ctx.mandar({ t: 'punto', s: b.dataset.s, n: +b.dataset.n }));
    const cp = $('#p-cambiar', this.el); if (cp) cp.onclick = () => { this.cerrar(); this.ctx.cambiarPj(); };
  }

  htmlEquipo(d) {
    const ranuras = O.RANURAS.filter(r => r !== 'escudo' || C.CLASES[d.clase].escudo);
    const eq = ranuras.map(r => casilla(d.equipo[r], `data-e="${r}" class-sel="${this.sel === 'e:' + r}"`, d.equipo[r] ? '' : `<small class="vacio">${O.NOMBRE_RANURA[r]}</small>`)).join('');
    const inv = d.inv.map((it, i) => casilla(it, `data-i="${i}"`, this.ctx.ofrecido?.(i) ? '<small class="cant">✓</small>' : '')).join('');
    return `<div class="equipo-grid">
      <div class="col-eq"><div class="eq">${eq}</div><div class="fila-oro">${this.oro(d)}<button class="btn chico sec" id="p-cambiar">Cambiar de personaje</button></div>
        <div id="p-ficha">${this.htmlFicha(d)}</div></div>
      <div class="col-inv"><h3>Mochila</h3><div class="inv">${inv}</div></div></div>`;
  }

  htmlFicha(d) {
    if (!this.sel) return '<p class="nota">Tocá un objeto para ver qué es.</p>';
    const [tipo, k] = this.sel.split(':');
    const it = tipo === 'e' ? d.equipo[k] : d.inv[+k]; if (!it) return '';
    const b = O.BASES[it.b], acc = [];
    if (tipo === 'e') acc.push(['quitar', 'Sacar']);
    else if (b.r) { const m = O.motivoNoPuede(d, it); acc.push(['equipar', m ? 'No podés usarlo' : 'Ponerse', !!m]); }
    else if (b.uso === 'cura' || b.uso === 'mana') acc.push(['usar', 'Usar']);
    if (b.r && this.ctx.rolCerca('herrero')) acc.push(['forjar', 'Forjar']);
    if (tipo === 'i' && (this.ctx.rolCerca('herrero') || this.ctx.rolCerca('mercader'))) acc.push(['vender', `Vender · ${O.precioVenta(it) * (it.c || 1)} oro`]);
    if (tipo === 'i' && this.ctx.rolCerca('baul')) acc.push(['baul', 'Guardar en el baúl']);
    if (tipo === 'i' && this.ctx.comerciando?.()) acc.push(['ofrecer', this.ctx.ofrecido(+k) ? 'Sacar del comercio' : 'Ofrecer']);
    return ficha(it, d, acc.map(([a, n, off]) => `<button class="btn chico" data-a="${a}" ${off ? 'disabled' : ''}>${n}</button>`).join(''));
  }

  conectarMochila(d) {
    this.el.querySelectorAll('.slot[data-e], .slot[data-i]').forEach(b => {
      const k = b.dataset.e ? 'e:' + b.dataset.e : 'i:' + b.dataset.i;
      if (this.sel === k) b.classList.add('sel');
      b.onclick = () => { this.sel = (b.dataset.e ? d.equipo[b.dataset.e] : d.inv[+b.dataset.i]) ? k : null; this.personaje('equipo'); };
    });
    this.el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const [tipo, k] = this.sel.split(':'), a = b.dataset.a, m = this.ctx.mandar;
      if (a === 'quitar') m({ t: 'quitar', r: k });
      if (a === 'equipar' || a === 'usar') m({ t: a, i: +k });
      if (a === 'vender') { m({ t: 'vender', i: +k }); this.sel = null; }
      if (a === 'baul') { m({ t: 'baul', a: 'poner', i: +k }); this.sel = null; }
      if (a === 'forjar') return this.npc(this.ctx.rolCerca('herrero').id, 'forja', tipo === 'e' ? { r: k } : { i: +k });
      if (a === 'ofrecer') m({ t: 'com', a: this.ctx.ofrecido(+k) ? 'sacar' : 'poner', i: +k });
    });
  }

  htmlArbol(d) {
    const libres = C.puntosArbol(d) - C.gastados(d);
    return `<p class="nota">Puntos de habilidad: <b>${libres}</b> (uno por nivel). Las definitivas se abren en el nivel 30 con 10 puntos en su rama.</p>
      <div class="arbol">${C.ARBOL[d.clase].map(rama => `<div class="rama"><h3>${rama.rama}</h3>${rama.hab.map(h => {
        const r = d.arbol[h.id] || 0, motivo = C.puedeAprender(d, h.id);
        return `<div class="nodo ${r ? 'tiene' : ''} ${h.def ? 'def' : ''}"><span class="nodo-ic">${iconoHab(d.clase, h.id)}</span>
          <div><b>${h.nombre}</b><small>${h.tipo === 'pasiva' ? 'Pasiva' : h.def ? 'Definitiva' : 'Activa'} · ${r}/${h.max}${h.mp ? ` · ${h.mp} energía` : ''}</small>
          <span>${h.desc(Math.max(1, r))}</span>
          <button class="btn chico" data-h="${h.id}" ${motivo ? 'disabled' : ''} title="${motivo || ''}">${r ? 'Mejorar' : 'Aprender'}</button></div></div>`;
      }).join('')}</div>`).join('')}</div>`;
  }

  htmlAtributos(d) {
    const v = d.der || {};
    return `<p class="nota">Puntos para repartir: <b>${d.puntos}</b> (5 por nivel).</p>${R.STATS.map(s => `<div class="stat"><span>${R.NOMBRE_STAT[s]}<small>${R.EXPLICA_STAT[s]}</small></span><b>${d[s]}</b>
      <button class="mas" data-s="${s}" data-n="1" ${d.puntos ? '' : 'disabled'}>+1</button><button class="mas" data-s="${s}" data-n="5" ${d.puntos >= 5 ? '' : 'disabled'}>+5</button></div>`).join('')}
      <div class="totales"><span>Daño <b>${v.dmin}–${v.dmax}</b></span><span>Defensa <b>${v.def}</b></span><span>Vida <b>${v.maxHp}</b></span><span>Energía <b>${v.maxMp}</b></span><span>Críticos <b>${v.crit}%</b></span></div>`;
  }

  // ---------- misiones ----------
  htmlPremio(pr) {
    const partes = [];
    if (pr.exp) partes.push(`<span>${pr.exp.toLocaleString('es-AR')} de experiencia</span>`);
    if (pr.oro) partes.push(`<span>${iconoObjeto('oro')} ${pr.oro.toLocaleString('es-AR')}</span>`);
    for (const it of pr.items || []) partes.push(`<span class="pr-item">${iconoObjeto(it.b, it)} ${O.BASES[it.b].nombre}${it.c > 1 ? ' × ' + it.c : ''}</span>`);
    if (pr.equipo) partes.push(`<span class="pr-item ${pr.equipo.mit ? 'r-mit-t' : pr.equipo.leg ? 'r-leg-t' : 'r-exc-t'}">Equipo para tu clase${pr.equipo.leg ? ` (puede ser legendario${pr.equipo.mit ? ' o mítico' : ''})` : ''}</span>`);
    return `<div class="premio">${partes.join('')}</div>`;
  }
  htmlMision(mi, d, botones) {
    const prog = d.misiones?.activas?.[mi.id];
    return `<div class="mision ${prog != null && MI.completa(mi, prog) ? 'lista' : ''}"><b>${mi.nombre}</b><span class="m-texto">${mi.texto}</span>
      <span class="m-obj">${MI.textoObjetivo(mi, prog || 0)}</span>${this.htmlPremio(mi.premio)}<div class="acciones">${botones}</div></div>`;
  }
  misionNpc(id) {
    const npc = MI.NPC_MISION.find(n => n.id === id), d = this.ctx.mio(); if (!npc || !d) return;
    const lista = MI.misionesDe(id).filter(mi => d.misiones?.activas?.[mi.id] != null || MI.disponible(d, mi));
    const proxima = MI.misionesDe(id).find(mi => !d.misiones?.hechas?.includes(mi.id) && !lista.includes(mi));
    const cuerpo = `<p class="frase">«${npc.saludo}»</p>${lista.map(mi => {
      const prog = d.misiones?.activas?.[mi.id];
      const bot = prog == null ? `<button class="btn chico" data-m="aceptar:${mi.id}">Aceptar</button>`
        : MI.completa(mi, prog) ? `<button class="btn chico" data-m="entregar:${mi.id}">Entregar</button>` : `<button class="btn chico sec" data-m="abandonar:${mi.id}">Abandonar</button>`;
      return this.htmlMision(mi, d, bot);
    }).join('') || `<p class="nota">${proxima ? `Volvé cuando seas nivel ${proxima.nivel}${proxima.req && !d.misiones?.hechas?.includes(proxima.req) ? ' y hayas terminado lo anterior' : ''}.` : 'No tengo nada más para pedirte. Gracias, Guardián.'}</p>`}`;
    this.marco(npc.nombre, 'Misiones', null, null, cuerpo, 'misionNpc', [id]);
    this.el.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { const [a, mid] = b.dataset.m.split(':'); this.ctx.mandar({ t: 'mision', a, id: mid }); });
  }
  tablon(at) {
    const d = this.ctx.mio(); if (!d) return;
    const e = d.misiones?.encargos?.[at];
    let cuerpo = `<p class="frase">«Pedidos clavados con cuchillo. Cuando cumplís uno, aparece otro.»</p>`;
    if (!e) cuerpo += `<p class="nota">Tocá para ver qué piden hoy.</p><div class="acciones"><button class="btn" data-e="ver">Leer el tablón</button></div>`;
    else {
      const mon = R.MONSTRUOS[e.mon];
      cuerpo += `<div class="mision ${e.prog >= e.n ? 'lista' : ''}"><b>Encargo: ${mon.nombre}</b><span class="m-texto">Matá ${e.n} ${mon.nombre}. Pagan los de la atalaya.</span>
        <span class="m-obj">${e.tomado ? `${Math.min(e.prog, e.n)}/${e.n}` : 'Sin tomar'}</span>${this.htmlPremio({ exp: e.exp, oro: e.oro, items: e.gema ? [{ b: d.nivel >= 20 ? 'destino' : 'forja', c: 1 }] : [] })}
        <div class="acciones">${!e.tomado ? '<button class="btn chico" data-e="tomar">Tomar</button><button class="btn chico sec" data-e="cambiar">Otro pedido</button>' : e.prog >= e.n ? '<button class="btn chico" data-e="entregar">Cobrar</button>' : ''}</div></div>`;
    }
    this.marco('Tablón de Encargos', R.PUEBLOS[at].nombre, null, null, cuerpo, 'tablon', [at]);
    this.el.querySelectorAll('[data-e]').forEach(b => b.onclick = () => this.ctx.mandar({ t: 'encargo', a: b.dataset.e === 'ver' ? 'cambiar' : b.dataset.e, at }));
  }
  htmlDiario(d) {
    const act = Object.entries(d.misiones?.activas || {}), enc = Object.values(d.misiones?.encargos || {}).filter(e => e?.tomado);
    if (!act.length && !enc.length) return '<p class="nota">No tenés misiones. Buscá a la gente que anda por el Páramo (tienen un signo ! arriba) o mirá el Tablón de Encargos de cada atalaya.</p>';
    return act.map(([id, prog]) => { const mi = MI.MISIONES[id], npc = MI.NPC_MISION.find(n => n.id === mi.npc);
      return this.htmlMision(mi, d, `<small class="nota">${MI.completa(mi, prog) ? 'Lista: volvé con' : 'La pidió'} ${npc.nombre}</small>`); }).join('')
      + enc.map(e => `<div class="mision ${e.prog >= e.n ? 'lista' : ''}"><b>Encargo · ${R.PUEBLOS[e.atalaya].nombre}</b><span class="m-obj">${R.MONSTRUOS[e.mon].nombre}: ${Math.min(e.prog, e.n)}/${e.n}</span></div>`).join('')
      + `<p class="nota">Misiones terminadas: ${d.misiones?.hechas?.length || 0} de ${Object.keys(MI.MISIONES).length}.</p>`;
  }

  // ---------- NPCs ----------
  npc(id, tab, elegido) {
    const n = O.NPCS.find(x => x.id === id), d = this.ctx.mio(); if (!n || !d) return;
    if (elegido) { this.forjaSel = elegido; this.sel = null; }
    const tabs = n.rol === 'herrero' ? [['tienda', 'Comprar'], ['forja', 'Forja'], ['vender', 'Vender']]
      : n.rol === 'vidente' ? [['eventos', 'Eventos'], ['viajes', 'Velas de Paso']] : [['tienda', 'Comprar'], ['vender', 'Vender']];
    tab = tab || tabs[0][0];
    let cuerpo = `<p class="frase">«${n.frase}»</p>`;
    if (tab === 'tienda') cuerpo += this.htmlTienda(n, d);
    if (tab === 'vender') cuerpo += this.htmlVender(d);
    if (tab === 'forja') cuerpo += this.htmlForja(d);
    if (tab === 'eventos') cuerpo += this.htmlEventos();
    if (tab === 'viajes') cuerpo += this.htmlVelas(d);
    this.marco(n.nombre, R.PUEBLOS[n.atalaya]?.nombre, tabs, tab, cuerpo, 'npc', [id, tab]);
    const m = this.ctx.mandar;
    this.el.querySelectorAll('[data-tsel]').forEach(b => b.onclick = () => { this.sel = 't:' + b.dataset.tsel; this.npc(id, tab); });
    this.el.querySelectorAll('[data-comprar]').forEach(b => b.onclick = () => m({ t: 'comprar', npc: id, b: b.dataset.comprar, c: +b.dataset.c }));
    this.el.querySelectorAll('[data-vsel]').forEach(b => b.onclick = () => { this.sel = 'v:' + b.dataset.vsel; this.npc(id, tab); });
    this.el.querySelectorAll('[data-vender]').forEach(b => b.onclick = () => { m({ t: 'vender', i: +b.dataset.vender }); this.sel = null; });
    this.el.querySelectorAll('[data-lugar]').forEach(b => b.onclick = () => { m({ t: 'vela', lugar: b.dataset.lugar }); this.cerrar(); });
    this.el.querySelectorAll('[data-fsel]').forEach(b => b.onclick = () => { const [t, k] = b.dataset.fsel.split(':'); this.forjaSel = t === 'e' ? { r: k } : { i: +k }; this.npc(id, 'forja'); });
    const bf = $('#p-forjar', this.el); if (bf) bf.onclick = () => m({ t: 'forjar', ...this.forjaSel });
  }

  htmlTienda(n, d) {
    const lista = n.vende.filter(b => !O.BASES[b].clase || O.BASES[b].clase === d.clase || this.verTodo);
    const sel = this.sel?.startsWith('t:') ? this.sel.slice(2) : lista[0];
    const it = { b: sel, n: 0, c: 1 }, base = O.BASES[sel];
    return `<div class="tienda-grid"><div><div class="grilla">${lista.map(b => casilla({ b, n: 0 }, `data-tsel="${b}" class="${b === sel ? 'sel' : ''}"`, `<small class="precio-s">${O.BASES[b].precio}</small>`).replace('class="slot ', `class="slot ${b === sel ? 'sel ' : ''}`)).join('')}</div>
        <p class="nota">Ves lo que puede usar tu clase. ${this.oro(d)}</p></div>
      <div>${ficha(it, d, `<span class="precio">${base.precio.toLocaleString('es-AR')} de oro</span>
        ${base.pila ? `<button class="btn chico" data-comprar="${sel}" data-c="10">Comprar 10</button>` : ''}<button class="btn chico" data-comprar="${sel}" data-c="1" ${d.oro < base.precio ? 'disabled' : ''}>Comprar</button>`)}</div></div>`;
  }

  htmlVender(d) {
    const sel = this.sel?.startsWith('v:') ? +this.sel.slice(2) : null, it = sel != null ? d.inv[sel] : null;
    return `<div class="tienda-grid"><div><div class="grilla">${d.inv.map((x, i) => x ? casilla(x, `data-vsel="${i}"`).replace('class="slot ', `class="slot ${i === sel ? 'sel ' : ''}`) : '').join('')}</div><p class="nota">${this.oro(d)}</p></div>
      <div>${it ? ficha(it, d, `<span class="precio">Te pagan ${(O.precioVenta(it) * (it.c || 1)).toLocaleString('es-AR')}</span><button class="btn chico" data-vender="${sel}">Vender</button>`) : '<p class="nota">Elegí qué vender.</p>'}</div></div>`;
  }

  htmlForja(d) {
    const lista = [...O.RANURAS.filter(r => d.equipo[r]).map(r => ['e:' + r, d.equipo[r]]), ...d.inv.map((it, i) => ['i:' + i, it]).filter(([, it]) => it && O.esEquipo(it.b))];
    const s = this.forjaSel, it = s ? (s.r ? d.equipo[s.r] : d.inv[s.i]) : null;
    let det = '<p class="nota">Elegí qué querés mejorar: lo que tenés puesto o algo de la mochila.</p>';
    if (it && O.esEquipo(it.b)) {
      const n = it.n || 0, gema = O.FORJA.gemaPara(n);
      if (!gema) det = ficha(it, d) + '<p>Ya está en +15. No se puede más.</p>';
      else {
        const tiene = d.inv.reduce((a, x) => a + (x?.b === gema ? x.c : 0), 0), riesgo = n < 6 ? 'Nunca falla.' : n < 9 ? 'Si falla, baja un nivel.' : n < 12 ? 'Si falla, vuelve a +0.' : 'Si falla, SE ROMPE (salvo que tengas una Piedra Guardiana).';
        det = ficha(it, d) + `<div class="forja-det"><div class="gema">${iconoObjeto(gema)}<span><b>${O.BASES[gema].nombre}</b><small>Tenés ${tiene}</small></span></div>
          <span>+${n} → <b>+${n + 1}</b> · Chance <b>${Math.round(O.FORJA.chance(n) * 100)}%</b> · ${O.FORJA.oro(n)} de oro</span><span class="${n >= 12 ? 'peligro' : 'nota'}">${riesgo}</span>
          <button class="btn" id="p-forjar" ${tiene && d.oro >= O.FORJA.oro(n) ? '' : 'disabled'}>Forjar</button></div>`;
      }
    }
    const k = s ? (s.r ? 'e:' + s.r : 'i:' + s.i) : null;
    return `<div class="tienda-grid"><div><div class="grilla">${lista.map(([kk, x]) => casilla(x, `data-fsel="${kk}"`).replace('class="slot ', `class="slot ${kk === k ? 'sel ' : ''}`)).join('')}</div></div><div>${det}</div></div>`;
  }

  htmlEventos() {
    const ahora = Date.now();
    return `<div class="lista">${R.EVENTOS.map(e => {
      const fase = ((ahora / 60000 - e.desfase) % e.cada + e.cada) % e.cada, activo = fase < e.dura, min = activo ? e.dura - fase : e.cada - fase;
      return `<div class="fila-t"><span><b>${e.nombre}</b><small>${e.desc}</small></span><span class="precio">${activo ? 'Ahora · quedan ' : 'En '}${Math.floor(min)}:${String(Math.floor(min % 1 * 60)).padStart(2, '0')}</span></div>`;
    }).join('')}</div>`;
  }

  htmlVelas(d) {
    const velas = d.inv.reduce((a, x) => a + (x?.b === 'vela' ? x.c : 0), 0);
    return `<p class="nota">Velas de Paso: <b>${velas}</b>. Te llevan a cualquier lugar que ya conozcas, no solo a las atalayas.</p>
      <div class="lista">${R.MAPA.lugares.map(l => `<div class="fila-t ${d.lugares.includes(l.nombre) ? '' : 'gris'}"><span><b>${l.nombre}</b><small>${l.frase}</small></span>
        <button class="btn chico" data-lugar="${l.nombre}" ${d.lugares.includes(l.nombre) && velas ? '' : 'disabled'}>Ir</button></div>`).join('')}</div>`;
  }

  // ---------- farol: viajar entre atalayas ----------
  viajes() {
    const d = this.ctx.mio(); if (!d) return;
    const cuerpo = `<p class="frase">Desde el farol se viaja gratis a las atalayas que ya encendiste.</p>
      <div class="lista">${R.PUEBLOS.map((p, i) => {
        const tiene = d.atalayas?.includes(i);
        return `<div class="fila-t ${tiene ? '' : 'gris'}"><span><b>${tiene ? p.nombre : 'Atalaya sin encender'}</b><small>${tiene ? p.frase : 'Encontrala caminando para poder viajar.'}</small></span>
          <span class="nivel-t">${['', 'Nivel 1–12', 'Nivel 10–24', 'Nivel 20–36', 'Nivel 36+'][p.tier]}</span>
          <button class="btn chico" data-viajar="${i}" ${tiene ? '' : 'disabled'}>Viajar</button></div>`;
      }).join('')}</div>`;
    this.marco('Farol', 'Viajar entre atalayas', null, null, cuerpo, 'viajes', []);
    this.el.querySelectorAll('[data-viajar]').forEach(b => b.onclick = () => { this.ctx.mandar({ t: 'viajar', i: +b.dataset.viajar }); this.cerrar(); });
  }

  // ---------- baúl de la cuenta ----------
  baul() {
    const d = this.ctx.mio(); if (!d?.baul) return;
    const sel = this.sel;
    const [tipo, k] = sel ? sel.split(':') : [];
    const it = tipo === 'b' ? d.baul[+k] : tipo === 'i' ? d.inv[+k] : null;
    const cuerpo = `<p class="frase">Lo que guardes acá lo ven todos los personajes de tu cuenta, en cualquier atalaya.</p>
      <div class="tienda-grid"><div><h3>Baúl</h3><div class="grilla">${d.baul.map((x, i) => casilla(x, `data-bsel="b:${i}"`).replace('class="slot', `class="slot ${sel === 'b:' + i ? 'sel' : ''}`)).join('')}</div>
        <h3>Mochila</h3><div class="grilla">${d.inv.map((x, i) => casilla(x, `data-bsel="i:${i}"`).replace('class="slot', `class="slot ${sel === 'i:' + i ? 'sel' : ''}`)).join('')}</div></div>
      <div>${it ? ficha(it, d, `<button class="btn chico" id="b-mover">${tipo === 'b' ? 'Sacar a la mochila' : 'Guardar en el baúl'}</button>`) : '<p class="nota">Tocá algo del baúl o de tu mochila.</p>'}</div></div>`;
    this.marco('Baúl de la cuenta', null, null, null, cuerpo, 'baul', []);
    this.el.querySelectorAll('[data-bsel]').forEach(b => b.onclick = () => { const [t, i] = b.dataset.bsel.split(':'); this.sel = (t === 'b' ? d.baul[+i] : d.inv[+i]) ? b.dataset.bsel : null; this.baul(); });
    const mv = $('#b-mover', this.el);
    if (mv) mv.onclick = () => { this.ctx.mandar(tipo === 'b' ? { t: 'baul', a: 'sacar', j: +k } : { t: 'baul', a: 'poner', i: +k }); this.sel = null; };
  }

  // ---------- comercio ----------
  comercio(e) {
    if (e.fin) { this.com = null; if (this.abierto?.f === 'dibujarComercio' || this.abierto?.f === 'personaje') this.cerrar(); return; }
    this.com = e; this.dibujarComercio();
  }
  dibujarComercio() {
    const e = this.com; if (!e) return;
    const d = this.ctx.mio();
    const lista = of => `<div class="grilla">${of.items.map(o => casilla(o.it)).join('') || '<p class="nota">Nada todavía.</p>'}</div>`;
    const cuerpo = `<div class="comercio"><div><h3>Vos das</h3>${lista(e.mio)}<label class="oro-in">Oro <input id="c-oro" type="number" min="0" inputmode="numeric" value="${e.mio.oro}"></label>
        <button class="btn chico sec" id="c-agregar">Agregar de la mochila</button></div>
      <div><h3>${esc(e.otro)} da</h3>${lista(e.suyo)}<p>${iconoObjeto('oro')} ${e.suyo.oro} de oro</p>
        ${e.suyo.items.map(o => ficha(o.it, d)).join('')}</div></div>
      <p class="nota">Primero los dos tocan "Listo". Después los dos "Confirmar". Si alguien cambia algo, se vuelve a empezar.</p>
      <div class="fila"><button class="btn" id="c-listo" ${e.listo[0] ? 'disabled' : ''}>${e.listo[0] ? 'Listo ✓' : 'Listo'}</button>
        <button class="btn" id="c-conf" ${e.listo[0] && e.listo[1] && !e.conf[0] ? '' : 'disabled'}>${e.conf[0] ? 'Confirmado ✓' : 'Confirmar'}</button>
        <button class="btn sec" id="c-cancelar">Cancelar</button></div>
      <p class="nota">${esc(e.otro)}: ${e.conf[1] ? 'confirmó' : e.listo[1] ? 'está listo' : 'todavía elige'}.</p>`;
    this.marco('Comercio', `con ${esc(e.otro)}`, null, null, cuerpo, 'dibujarComercio', []);
    const m = this.ctx.mandar;
    $('#c-oro', this.el).onchange = ev => m({ t: 'com', a: 'oro', n: +ev.target.value || 0 });
    $('#c-agregar', this.el).onclick = () => this.personaje('equipo');
    $('#c-listo', this.el).onclick = () => m({ t: 'com', a: 'listo' });
    $('#c-conf', this.el).onclick = () => m({ t: 'com', a: 'confirmar' });
    $('#c-cancelar', this.el).onclick = () => m({ t: 'com', a: 'cancelar' });
  }
}
