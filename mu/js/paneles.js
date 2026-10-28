// Ventanas: personaje (equipo, mochila, habilidades, atributos), NPCs (tienda, forja, vidente) y comercio.
import * as R from './reglas.js';
import * as O from './objetos.js';
import * as C from './clases.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- íconos dibujados (no hay arte de ítems) ----------
const P = {
  espada: '<path d="M6 18 18 6M15 5h4v4M5 15l4 4M7 17l-3 3"/>',
  ballesta: '<path d="M4 12h16M12 4c-4 2-6 5-6 8s2 6 6 8M12 4c4 2 6 5 6 8s-2 6-6 8M17 9l3 3-3 3"/>',
  baculo: '<path d="M7 21 16 8M15 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>',
  hacha: '<path d="M6 20 16 6M12 4c3 0 6 2 7 5-3 1-6 0-8-2M8 10c-2 1-3 4-2 6"/>',
  escudo: '<path d="M12 3 20 6v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/>',
  casco: '<path d="M5 15c0-5 3-9 7-9s7 4 7 9v3H5zM9 18v2M15 18v2M12 6v6"/>',
  armadura: '<path d="M8 4 4 7l2 5 2-1v9h8v-9l2 1 2-5-4-3-2 2h-4z"/>',
  guantes: '<path d="M8 21v-6L6 10V6h2v4M8 6V4h2v6M10 4V3h2v7M12 4h2v6M14 6h2v8l-2 7"/>',
  botas: '<path d="M8 3h5v9l6 3v5H6v-3l2-1z"/>',
  pocion: '<path d="M9 3h6M10 3v5l-4 6a5 5 0 0 0 4 7h4a5 5 0 0 0 4-7l-4-6V3"/>',
  vela: '<path d="M10 9h4v12h-4zM12 3c1 2 2 3 0 5-2-2-1-3 0-5z"/>',
  gema: '<path d="M6 9 9 4h6l3 5-6 11z M6 9h12M9 4l3 5 3-5"/>',
  oro: '<circle cx="12" cy="12" r="7"/><path d="M12 8v8M9.5 10h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4"/>',
};
const COLOR_B = { pocion: '#d0453a', eter: '#5f8fd8', vela: '#e9c37a', forja: '#c9b47a', destino: '#9b6cff', abismo: '#ff4a6a', guardiana: '#8fd0ff' };
export function icono(b) {
  const base = O.BASES[b];
  let k = 'gema';
  if (b === 'oro') k = 'oro';
  else if (base?.r === 'arma') k = C.CLASES[base.clase]?.arma || 'espada';
  else if (base?.r) k = base.r;
  else if (b === 'pocion' || b === 'eter') k = 'pocion';
  else if (b === 'vela') k = 'vela';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="${COLOR_B[b] || 'currentColor'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${P[k]}</svg>`;
}
export const claseObjeto = it => (it?.x?.length ? 'exc' : (it?.n || 0) >= 7 ? 'alto' : (it?.n || 0) > 0 ? 'mejor' : '');

function ficha(it, extra = '') {
  const b = O.BASES[it.b], v = O.valores(it), lineas = [];
  if (v.dmg) lineas.push(`Daño ${v.dmg[0]}–${v.dmg[1]}`);
  if (v.def != null && b.r) lineas.push(`Defensa ${v.def}`);
  if (b.req) lineas.push(`Nivel ${b.req}${b.clase ? ' · ' + C.CLASES[b.clase].nombre : ''}`);
  return `<div class="ficha ${claseObjeto(it)}"><b>${esc(O.nombreObjeto(it))}${it.c > 1 ? ' × ' + it.c : ''}</b>
    ${lineas.map(l => `<span>${l}</span>`).join('')}
    ${O.textoExcelente(it).map(t => `<span class="exc-op">${t}</span>`).join('')}
    ${b.desc ? `<p class="nota">${b.desc}</p>` : ''}${extra}</div>`;
}

export class Paneles {
  constructor(ctx) {
    // ctx: { mio(), mandar(obj), npcCerca(id), toast(t) }
    this.ctx = ctx; this.abierto = null; this.sel = null;
    const el = document.createElement('div'); el.id = 'panel'; el.className = 'caja panel'; el.hidden = true;
    document.getElementById('hud').appendChild(el); this.el = el;
    el.addEventListener('pointerdown', e => e.stopPropagation());
  }
  cerrar() { this.el.hidden = true; this.abierto = null; this.sel = null; }
  refrescar() { if (this.abierto) this[this.abierto.f](...this.abierto.args); }
  marco(titulo, tabs, actual, cuerpo, f, args) {
    this.abierto = { f, args };
    this.el.innerHTML = `<header><h2>${titulo}</h2><button class="x" id="p-cerrar" aria-label="Cerrar">✕</button></header>
      ${tabs ? `<nav>${tabs.map(([id, n]) => `<button data-tab="${id}" class="${id === actual ? 'on' : ''}">${n}</button>`).join('')}</nav>` : ''}
      <div class="cuerpo">${cuerpo}</div>`;
    this.el.hidden = false;
    $('#p-cerrar', this.el).onclick = () => this.cerrar();
    this.el.querySelectorAll('nav button').forEach(b => b.onclick = () => { this.sel = null; if (f === 'npc') this.npc(args[0], b.dataset.tab); else this[f](b.dataset.tab); });
  }

  // ---------- personaje ----------
  personaje(tab = 'equipo') {
    const d = this.ctx.mio(); if (!d) return;
    const tabs = [['equipo', 'Equipo'], ['habilidades', 'Habilidades'], ['atributos', 'Atributos']];
    let cuerpo = '';
    if (tab === 'equipo') cuerpo = this.htmlEquipo(d);
    if (tab === 'habilidades') cuerpo = this.htmlArbol(d);
    if (tab === 'atributos') cuerpo = this.htmlAtributos(d);
    this.marco(`${esc(d.nombre)} · ${C.CLASES[d.clase].nombre} ${d.nivel}`, tabs, tab, cuerpo, 'personaje', [tab]);
    this.conectarMochila(d, tab);
    this.enlazarExtras();
  }

  htmlEquipo(d) {
    const ranuras = O.RANURAS.filter(r => r !== 'escudo' || C.CLASES[d.clase].escudo);
    const eq = ranuras.map(r => { const it = d.equipo[r]; return `<button class="slot ${claseObjeto(it)} ${this.sel === 'e:' + r ? 'sel' : ''}" data-e="${r}">${it ? icono(it.b) : ''}<small>${it ? (it.n ? '+' + it.n : '') : O.NOMBRE_RANURA[r]}</small></button>`; }).join('');
    const inv = d.inv.map((it, i) => `<button class="slot ${claseObjeto(it)} ${this.sel === 'i:' + i ? 'sel' : ''} ${this.ctx.ofrecido?.(i) ? 'ofrecido' : ''}" data-i="${i}">${it ? icono(it.b) : ''}${it?.c > 1 ? `<small>${it.c}</small>` : it?.n ? `<small>+${it.n}</small>` : ''}</button>`).join('');
    return `<div class="equipo-grid"><div class="col-eq"><h3>Puesto</h3><div class="eq">${eq}</div>
      <p class="oro">${icono('oro')} ${d.oro.toLocaleString('es-AR')} de oro</p><div id="p-ficha">${this.htmlFicha(d)}</div></div>
      <div class="col-inv"><h3>Mochila</h3><div class="inv">${inv}</div></div></div>`;
  }

  htmlFicha(d) {
    if (!this.sel) return '<p class="nota">Tocá un objeto para ver qué es.</p>';
    const [tipo, k] = this.sel.split(':');
    const it = tipo === 'e' ? d.equipo[k] : d.inv[+k]; if (!it) return '';
    const b = O.BASES[it.b], acc = [];
    if (tipo === 'e') acc.push(['quitar', 'Sacar']);
    else if (b.r) acc.push(['equipar', 'Ponerse']);
    else if (b.uso === 'cura' || b.uso === 'mana') acc.push(['usar', 'Usar']);
    if (b.r && this.ctx.npcCerca('herrero')) acc.push(['forjar', 'Forjar']);
    if (tipo === 'i' && (this.ctx.npcCerca('herrero') || this.ctx.npcCerca('mercader'))) acc.push(['vender', `Vender (${O.precioVenta(it) * (it.c || 1)} oro)`]);
    if (tipo === 'i' && this.ctx.comerciando?.()) acc.push(['ofrecer', this.ctx.ofrecido(+k) ? 'Sacar del comercio' : 'Ofrecer en el comercio']);
    return ficha(it, `<div class="acciones">${acc.map(([a, n]) => `<button class="btn chico" data-a="${a}">${n}</button>`).join('')}</div>`);
  }

  conectarMochila(d, tab) {
    if (tab !== 'equipo') return;
    this.el.querySelectorAll('.slot').forEach(b => b.onclick = () => {
      this.sel = b.dataset.e ? 'e:' + b.dataset.e : 'i:' + b.dataset.i;
      if (!b.dataset.e && !d.inv[+b.dataset.i]) this.sel = null;
      this.personaje('equipo');
    });
    this.el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const [tipo, k] = this.sel.split(':'), a = b.dataset.a, m = this.ctx.mandar;
      if (a === 'quitar') m({ t: 'quitar', r: k });
      if (a === 'equipar' || a === 'usar') m({ t: a, i: +k });
      if (a === 'vender') { m({ t: 'vender', i: +k }); this.sel = null; }
      if (a === 'forjar') return this.npc('herrero', 'forja', tipo === 'e' ? { r: k } : { i: +k });
      if (a === 'ofrecer') m({ t: 'com', a: this.ctx.ofrecido(+k) ? 'sacar' : 'poner', i: +k });
    });
  }

  htmlArbol(d) {
    const libres = C.puntosArbol(d) - C.gastados(d);
    return `<p class="nota">Puntos de habilidad: <b>${libres}</b> (ganás uno por nivel). Las definitivas se abren en el nivel 30 con 10 puntos en su rama.</p>
      <div class="arbol">${C.ARBOL[d.clase].map(rama => `<div class="rama"><h3>${rama.rama}</h3>${rama.hab.map(h => {
        const r = d.arbol[h.id] || 0, motivo = C.puedeAprender(d, h.id);
        return `<div class="nodo ${r ? 'tiene' : ''} ${h.def ? 'def' : ''} ${h.tipo === 'pasiva' ? 'pas' : ''}">
          <b>${h.nombre}</b><small>${h.tipo === 'pasiva' ? 'Pasiva' : h.def ? 'Definitiva' : 'Activa'} · ${r}/${h.max}${h.mp ? ` · ${h.mp} energía` : ''}</small>
          <span>${h.desc(Math.max(1, r))}</span>
          <button class="btn chico" data-h="${h.id}" ${motivo ? 'disabled' : ''} title="${motivo || ''}">${r ? 'Mejorar' : 'Aprender'}</button></div>`;
      }).join('')}</div>`).join('')}</div>`;
  }

  htmlAtributos(d) {
    const v = d.der || {};
    return `<p class="nota">Puntos para repartir: <b>${d.puntos}</b> (5 por nivel).</p>${R.STATS.map(s => `<div class="stat"><span>${R.NOMBRE_STAT[s]}<small>${R.EXPLICA_STAT[s]}</small></span><b>${d[s]}</b>
      <button class="mas" data-s="${s}" data-n="1" ${d.puntos ? '' : 'disabled'}>+1</button><button class="mas" data-s="${s}" data-n="5" ${d.puntos >= 5 ? '' : 'disabled'}>+5</button></div>`).join('')}
      <p class="nota">Daño ${v.dmin}–${v.dmax} · Defensa ${v.def} · Vida ${v.maxHp} · Energía ${v.maxMp} · Críticos ${v.crit}%</p>`;
  }

  // Botones de árbol y atributos (se conectan después de dibujar).
  enlazarExtras() {
    this.el.querySelectorAll('[data-h]').forEach(b => b.onclick = () => this.ctx.mandar({ t: 'aprender', h: b.dataset.h }));
    this.el.querySelectorAll('.mas').forEach(b => b.onclick = () => this.ctx.mandar({ t: 'punto', s: b.dataset.s, n: +b.dataset.n }));
  }

  // ---------- NPCs ----------
  npc(id, tab, elegido) {
    const n = O.NPCS.find(x => x.id === id), d = this.ctx.mio(); if (!n || !d) return;
    if (elegido) this.forjaSel = elegido;
    const tabs = id === 'herrero' ? [['tienda', 'Comprar'], ['forja', 'Forja']] : id === 'vidente' ? [['eventos', 'Eventos'], ['viajes', 'Viajar']] : null;
    tab = tab || (tabs ? tabs[0][0] : 'tienda');
    let cuerpo = `<p class="frase">«${n.frase}»</p>`;
    if (tab === 'tienda') {
      cuerpo += `<p class="oro">${icono('oro')} ${d.oro.toLocaleString('es-AR')} de oro</p><div class="tienda">${n.vende.map(b => {
        const base = O.BASES[b], noPuede = base.clase && base.clase !== d.clase;
        return `<div class="fila-t ${noPuede ? 'gris' : ''}"><span class="ic">${icono(b)}</span><span><b>${base.nombre}</b><small>${base.req ? 'Nivel ' + base.req + (base.clase ? ' · ' + C.CLASES[base.clase].nombre : '') : base.desc || ''}</small></span>
          <span class="precio">${base.precio}</span>${base.pila ? `<button class="btn chico" data-b="${b}" data-c="10">×10</button>` : ''}<button class="btn chico" data-b="${b}" data-c="1">Comprar</button></div>`;
      }).join('')}</div><p class="nota">Para vender, abrí tu mochila y tocá el objeto.</p>`;
    }
    if (tab === 'forja') cuerpo += this.htmlForja(d);
    if (tab === 'eventos') cuerpo += this.htmlEventos();
    if (tab === 'viajes') cuerpo += `<p class="nota">Velas de Paso: <b>${d.inv.reduce((a, x) => a + (x?.b === 'vela' ? x.c : 0), 0)}</b>. Solo podés ir a lugares que ya conocés.</p>
      <div class="tienda">${R.MAPA.lugares.map(l => `<div class="fila-t ${d.lugares.includes(l.nombre) ? '' : 'gris'}"><span><b>${l.nombre}</b><small>${l.frase}</small></span>
        <button class="btn chico" data-lugar="${l.nombre}" ${d.lugares.includes(l.nombre) ? '' : 'disabled'}>Ir</button></div>`).join('')}</div>`;
    this.marco(n.nombre, tabs, tab, cuerpo, 'npc', [id, tab]);
    this.el.querySelectorAll('[data-b]').forEach(b => b.onclick = () => this.ctx.mandar({ t: 'comprar', npc: id, b: b.dataset.b, c: +b.dataset.c }));
    this.el.querySelectorAll('[data-lugar]').forEach(b => b.onclick = () => { this.ctx.mandar({ t: 'vela', lugar: b.dataset.lugar }); this.cerrar(); });
    this.el.querySelectorAll('[data-fsel]').forEach(b => b.onclick = () => { const [t, k] = b.dataset.fsel.split(':'); this.forjaSel = t === 'e' ? { r: k } : { i: +k }; this.npc('herrero', 'forja'); });
    const bf = $('#p-forjar', this.el); if (bf) bf.onclick = () => this.ctx.mandar({ t: 'forjar', ...this.forjaSel });
  }

  htmlForja(d) {
    const lista = [...O.RANURAS.filter(r => d.equipo[r]).map(r => ['e:' + r, d.equipo[r]]), ...d.inv.map((it, i) => ['i:' + i, it]).filter(([, it]) => it && O.esEquipo(it.b))];
    const s = this.forjaSel, it = s ? (s.r ? d.equipo[s.r] : d.inv[s.i]) : null;
    let det = '<p class="nota">Elegí qué querés mejorar.</p>';
    if (it && O.esEquipo(it.b)) {
      const n = it.n || 0, gema = O.FORJA.gemaPara(n);
      if (!gema) det = '<p>Ya está en +15.</p>';
      else {
        const tiene = d.inv.reduce((a, x) => a + (x?.b === gema ? x.c : 0), 0), riesgo = n < 6 ? 'Nunca falla.' : n < 9 ? 'Si falla, baja un nivel.' : n < 12 ? 'Si falla, vuelve a +0.' : 'Si falla, SE ROMPE (salvo que tengas una Piedra Guardiana).';
        det = `${ficha(it)}<div class="forja-det"><span>Pasa a <b>+${n + 1}</b></span><span>Gema: ${icono(gema)} ${O.BASES[gema].nombre} (tenés ${tiene})</span>
          <span>Chance: <b>${Math.round(O.FORJA.chance(n) * 100)}%</b> · Cuesta ${O.FORJA.oro(n)} de oro</span><span class="${n >= 12 ? 'peligro' : ''}">${riesgo}</span>
          <button class="btn" id="p-forjar" ${tiene ? '' : 'disabled'}>Forjar</button></div>`;
      }
    }
    return `<div class="forja"><div class="inv">${lista.map(([k, x]) => `<button class="slot ${claseObjeto(x)} ${s && (s.r ? 'e:' + s.r : 'i:' + s.i) === k ? 'sel' : ''}" data-fsel="${k}">${icono(x.b)}<small>${x.n ? '+' + x.n : ''}</small></button>`).join('')}</div>${det}</div>`;
  }

  htmlEventos() {
    const ahora = Date.now();
    return `<div class="tienda">${R.EVENTOS.map(e => {
      const fase = ((ahora / 60000 - e.desfase) % e.cada + e.cada) % e.cada, activo = fase < e.dura;
      const min = activo ? e.dura - fase : e.cada - fase;
      return `<div class="fila-t"><span><b>${e.nombre}</b><small>${e.desc}</small></span><span class="precio">${activo ? 'Ahora · quedan ' : 'En '}${Math.floor(min)}:${String(Math.floor(min % 1 * 60)).padStart(2, '0')}</span></div>`;
    }).join('')}</div><p class="nota">Los jefes del Páramo vuelven solos después de caer: la Rata Reina cada 3 minutos, la Bestia del Foso cada 8.</p>`;
  }

  // ---------- comercio ----------
  comercio(e) {
    if (e.fin) { this.com = null; if (this.abierto?.f === 'comercio' || this.abierto?.f === 'personaje') this.cerrar(); return; }
    this.com = e; this.dibujarComercio();
  }
  dibujarComercio() {
    const e = this.com; if (!e) return;
    const lista = of => of.items.map(o => `<div class="fila-t"><span class="ic">${icono(o.it.b)}</span><span class="${claseObjeto(o.it)}"><b>${esc(O.nombreObjeto(o.it))}${o.it.c > 1 ? ' × ' + o.it.c : ''}</b>${O.textoExcelente(o.it).map(t => `<small class="exc-op">${t}</small>`).join('')}</span></div>`).join('') || '<p class="nota">Nada todavía.</p>';
    const cuerpo = `<div class="comercio"><div><h3>Vos das</h3>${lista(e.mio)}<label class="oro-in">Oro <input id="c-oro" type="number" min="0" inputmode="numeric" value="${e.mio.oro}"></label>
        <button class="btn chico sec" id="c-agregar">Agregar de la mochila</button></div>
      <div><h3>${esc(e.otro)} da</h3>${lista(e.suyo)}<p class="oro">${icono('oro')} ${e.suyo.oro} de oro</p></div></div>
      <p class="nota">Primero los dos tocan "Listo". Después los dos "Confirmar". Si alguien cambia algo, se vuelve a empezar.</p>
      <div class="fila"><button class="btn" id="c-listo" ${e.listo[0] ? 'disabled' : ''}>${e.listo[0] ? 'Listo ✓' : 'Listo'}</button>
        <button class="btn" id="c-conf" ${e.listo[0] && e.listo[1] && !e.conf[0] ? '' : 'disabled'}>${e.conf[0] ? 'Confirmado ✓' : 'Confirmar'}</button>
        <button class="btn sec" id="c-cancelar">Cancelar</button></div>
      <p class="nota">${esc(e.otro)}: ${e.conf[1] ? 'confirmó' : e.listo[1] ? 'está listo' : 'todavía elige'}.</p>`;
    this.marco('Comercio', null, null, cuerpo, 'dibujarComercio', []);
    const m = this.ctx.mandar;
    $('#c-oro', this.el).onchange = ev => m({ t: 'com', a: 'oro', n: +ev.target.value || 0 });
    $('#c-agregar', this.el).onclick = () => this.personaje('equipo');
    $('#c-listo', this.el).onclick = () => m({ t: 'com', a: 'listo' });
    $('#c-conf', this.el).onclick = () => m({ t: 'com', a: 'confirmar' });
    $('#c-cancelar', this.el).onclick = () => m({ t: 'com', a: 'cancelar' });
  }
}
