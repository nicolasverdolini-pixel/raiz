// Ventanas del juego, todas con el mismo estilo: personaje (equipo, mochila, habilidades, atributos),
// NPCs (tienda, forja, vidente), baúl de la cuenta, viajes desde el farol y comercio.
import * as R from './reglas.js';
import * as O from './objetos.js';
import * as C from './clases.js';
import { iconoObjeto, iconoHab } from './iconos.js';
import { foto, alTerminar } from './miniaturas.js';
import * as MI from './misiones.js';
import * as SND from './sonido.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NOMBRE_STAT = { fue: 'Fuerza', agi: 'Agilidad', vit: 'Vitalidad', ene: 'Energía', sue: 'Suerte', tem: 'Temple' };
const RANGO = ['comun', 'exc', 'leg', 'mit'];
export const claseObjeto = it => (it ? 'r-' + RANGO[O.BASES[it.b]?.ala || O.rareza(it)] + ((it.n || 0) >= 7 ? ' alto' : '') : '');

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

// Qué hace una gema según dónde está engarzada.
export function textoGema(g, enArma) {
  const ef = O.efectoGema(g, enArma), E = R.ELEMENTOS;
  if (O.BASES[g].de === 'ojo') return enArma ? `+${ef.crit}% crítico, +${ef.critDano}% daño crítico` : `+${ef.crit}% crítico`;
  const e = O.BASES[g].elem, al = { fuego: 'al fuego', hielo: 'al hielo', rayo: 'al rayo', veneno: 'al veneno', sombra: 'a la sombra' }[e];
  return ef.elem ? `+${ef.elem[e]}% del daño como ${E[e].nombre.toLowerCase()}` : `+${ef.res[e]}% de resistencia ${al}`;
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
      <div><b>${esc(O.nombreObjeto(it))}${it.c > 1 ? ' × ' + it.c : ''}</b><span class="rareza">${b.engarce ? `Gema · ${O.CALIDADES[b.calidad].nombre}` : b.ala ? `Alas · nivel ${b.ala}` : b.bestia ? O.NOMBRE_RANURA[b.r] : b.r ? O.RAREZAS[ra].nombre + ' · ' + O.NOMBRE_RANURA[b.r] : b.gema ? 'Gema' : 'Consumible'}</span></div></div>
    ${lineas.join('')}
    ${O.textoExcelente(it).map(t => `<span class="exc-op">◆ ${t}</span>`).join('')}
    ${(() => { const t = ['casco', 'armadura', 'guantes', 'botas'].includes(b.r) ? O.SETS_BONUS.findIndex(x => x.id === it.b.split('_')[1]) : -1; if (t < 0) return '';
      const S = O.SETS_BONUS[t], n = d ? O.setsPuestos(d.equipo).find(x => x.set === S)?.n || ['casco', 'armadura', 'guantes', 'botas'].filter(r => d.equipo[r]?.b?.endsWith('_' + S.id)).length : 0;
      return `<div class="set-bonus"><b>Set ${S.nombre}</b> <small>(tenés ${n} de 4 puestas)</small><span class="${n >= 2 ? 'activo' : ''}">2 piezas: ${O.textoBonus(S[2])}</span><span class="${n >= 4 ? 'activo' : ''}">4 piezas: ${O.textoBonus(S[4])}</span></div>`; })()}
    ${it.s ? `<div class="engarces">${Array.from({ length: it.s }, (_, k) => { const g = it.g?.[k]; return g ? `<span class="eng lleno" style="--c:${R.ELEMENTOS[O.BASES[g].elem]?.color || '#e8e8f0'}">◆ ${O.BASES[g].nombre}: ${textoGema(g, b.r === 'arma')}</span>` : '<span class="eng">◇ Engarce libre</span>'; }).join('')}</div>` : ''}
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
    this.el.innerHTML = `<header><div><h2>${titulo}</h2>${sub ? `<span class="sub">${sub}</span>` : ''}</div><span class="sonido"><button id="p-mus" class="${SND.estado().musica ? '' : 'off'}" aria-label="Música">♪</button><button id="p-sfx" class="${SND.estado().efectos ? '' : 'off'}" aria-label="Efectos">♫</button></span><button class="x" id="p-cerrar" aria-label="Cerrar">✕</button></header>
      ${tabs ? `<nav>${tabs.map(([id, n]) => `<button data-tab="${id}" class="${id === actual ? 'on' : ''}">${n}</button>`).join('')}</nav>` : ''}
      <div class="cuerpo">${cuerpo}</div>`;
    this.el.hidden = false;
    if (mismo) this.el.querySelector('.cuerpo').scrollTop = scroll;
    $('#p-cerrar', this.el).onclick = () => this.cerrar();
    $('#p-mus', this.el).onclick = e => { SND.alternar('musica'); e.currentTarget.classList.toggle('off'); };
    $('#p-sfx', this.el).onclick = e => { SND.alternar('efectos'); e.currentTarget.classList.toggle('off'); };
    this.el.querySelectorAll('.cuerpo button').forEach(b => b.addEventListener('click', () => SND.sfx.boton()));
    this.el.querySelectorAll('nav button').forEach(b => b.onclick = () => { this.sel = null; if (f === 'npc') this.npc(args[0], b.dataset.tab); else this[f](b.dataset.tab); });
  }
  oro(d) { return `<span class="oro">${iconoObjeto('oro')} ${d.oro.toLocaleString('es-AR')}</span>`; }

  // ---------- personaje ----------
  personaje(tab = 'equipo') {
    const d = this.ctx.mio(); if (!d) return;
    const libres = C.puntosLibres(d);
    const tabs = [['equipo', 'Equipo'], ['habilidades', `Habilidades${libres ? ' ●' : ''}`], ['atributos', `Atributos${d.puntos ? ' ●' : ''}`], ['misiones', 'Misiones'], ['logros', 'Logros'], ['ranking', 'Ranking'], ['puesto', `Puesto${this.miPuesto?.abierto ? ' ●' : ''}`], ['hermandad', 'Hermandad']];
    let cuerpo = '';
    if (tab === 'equipo') cuerpo = this.htmlEquipo(d);
    if (tab === 'habilidades') cuerpo = this.htmlArbol(d);
    if (tab === 'atributos') cuerpo = this.htmlAtributos(d);
    if (tab === 'misiones') cuerpo = this.htmlObjetivos(d) + this.htmlDiario(d);
    if (tab === 'hermandad') cuerpo = this.htmlHermandad(d);
    if (tab === 'puesto') cuerpo = this.htmlMiPuesto(d);
    if (tab === 'logros') cuerpo = this.htmlLogros(d);
    if (tab === 'ranking') { cuerpo = this.htmlRanking(d); this.pedirRanking(); }
    this.marco(esc(d.nombre), `${C.CLASES[d.clase].nombre} · Nivel ${d.nivel}`, tabs, tab, cuerpo, 'personaje', [tab]);
    if (tab === 'equipo') this.conectarMochila(d);
    this.el.querySelectorAll('[data-h]').forEach(b => b.onclick = () => this.ctx.mandar({ t: 'aprender', h: b.dataset.h }));
    this.el.querySelectorAll('[data-bot]').forEach(b => b.onclick = () => { const i = +b.dataset.bot; this.botonSel = this.botonSel === i ? null : i; this.personaje('habilidades'); });
    this.el.querySelectorAll('[data-elige]').forEach(b => b.onclick = () => { this.ctx.mandar({ t: 'barra', k: this.botonSel, id: b.dataset.elige }); this.botonSel = null; this.personaje('habilidades'); });
    this.el.querySelectorAll('.mas').forEach(b => b.onclick = () => this.ctx.mandar({ t: 'punto', s: b.dataset.s, n: +b.dataset.n }));
    const cp = $('#p-cambiar', this.el); if (cp) cp.onclick = () => { this.cerrar(); this.ctx.cambiarPj(); };
    const pt = $('#p-tuto', this.el); if (pt) pt.onclick = () => { this.cerrar(); this.ctx.tutorial(); };
    if (tab === 'hermandad') this.conectarHermandad();
    if (tab === 'puesto') this.conectarMiPuesto(d);
    this.el.querySelectorAll('[data-rk]').forEach(b => b.onclick = () => { this.vistaRanking = b.dataset.rk; this.pedidoRanking = 0; this.personaje('ranking'); });
    this.el.querySelectorAll('[data-titulo]').forEach(b => b.onclick = () => this.ctx.mandar({ t: 'titulo', id: b.dataset.titulo }));
    const rd = $('#p-redis', this.el); if (rd) rd.onclick = () => { if (confirm('¿Devolver todos los puntos de atributos para repartirlos de nuevo?')) this.ctx.mandar({ t: 'redistribuir' }); };
  }

  // ---------- logros y objetivos del día ----------
  htmlObjetivos(d) {
    const O2 = d.logros?.objetivos; if (!O2 || O2.dia !== R.hoyAR()) return '';
    return `<div class="mision ${O2.cobrado ? 'lista' : ''}"><b>Objetivos del día</b><span class="m-texto">${O2.cobrado ? 'Cumpliste los tres: ya abriste el cofre de hoy. Mañana hay otros.' : 'Cumplí los tres y se abre un cofre con oro, gemas y a veces un equipo raro.'}</span>
      ${O2.lista.map(o => `<div class="obj ${o.prog >= o.meta ? 'hecho' : ''}"><span>${o.prog >= o.meta ? '✓' : '◦'} ${R.textoObjetivo(o)}</span><span>${Math.min(o.prog, o.meta).toLocaleString('es-AR')}/${o.meta.toLocaleString('es-AR')}</span><div class="barra chica"><i style="width:${Math.min(100, o.prog / o.meta * 100)}%"></i></div></div>`).join('')}</div>`;
  }
  htmlLogros(d) {
    const L = d.logros || { c: {}, hechos: [] }, tit = d.titulo;
    const hechos = R.LOGROS.filter(l => L.hechos.includes(l.id));
    return `${this.htmlObjetivos(d)}
      <p class="nota">Logros: <b>${hechos.length}</b> de ${R.LOGROS.length}. Cada uno te da oro, a veces cosas, y un título para mostrar arriba de tu nombre.</p>
      <div class="titulos"><span>Título:</span><button class="btn chico ${!tit ? '' : 'sec'}" data-titulo="">Ninguno</button>${hechos.map(l => `<button class="btn chico ${tit === l.id ? '' : 'sec'}" data-titulo="${l.id}">«${l.titulo}»</button>`).join('')}</div>
      <div class="lista">${R.LOGROS.map(l => { const v = Math.min(L.c[l.cont] || 0, l.meta), ok = L.hechos.includes(l.id);
        return `<div class="fila-t logro ${ok ? 'hecho' : ''}"><span class="ic">${ok ? '🏆' : '◇'}</span><span><b>«${l.titulo}»</b><small>${l.desc} ${ok ? '· Conseguido' : `· ${v.toLocaleString('es-AR')}/${l.meta.toLocaleString('es-AR')}`}</small>${ok ? '' : `<div class="barra chica"><i style="width:${v / l.meta * 100}%"></i></div>`}</span></div>`; }).join('')}</div>`;
  }

  // ---------- puesto de venta ----------
  mipuesto(m) { this.miPuesto = m; if (!m.abierto) this.precios = null; if (this.abierto?.f === 'personaje') this.refrescar(); }
  htmlMiPuesto(d) {
    const P = this.miPuesto, enAt = this.ctx.enAtalaya();
    if (P?.abierto) return `<p class="nota">Tu puesto <b>«${esc(P.titulo)}»</b> está abierto. Los demás te tocan y eligen «Ver puesto». Si te movés, se cierra.</p>
      <div class="lista">${P.items.map(x => { const it = d.inv[x.i]; return it ? `<div class="fila-t"><span class="ic">${imagen(it)}</span><span><b>${esc(O.nombreObjeto(it))}</b><small>${x.precio.toLocaleString('es-AR')} de oro</small></span></div>` : ''; }).join('')}</div>
      <div class="acciones"><button class="btn sec" id="pu-cerrar">Cerrar el puesto</button></div>`;
    this.precios = this.precios || {};
    const lista = d.inv.map((it, i) => [it, i]).filter(([it]) => it);
    return `<p class="nota">Elegí qué vender, ponele precio y abrí el puesto. Te quedás quieto en la atalaya y los demás te compran aunque no estés mirando. ${enAt ? '' : '<span class="peligro">Tenés que estar en una atalaya.</span>'}</p>
      <label>Nombre del puesto<input id="pu-titulo" maxlength="30" value="${esc(this.tituloPuesto || '')}" placeholder="Puesto de ${esc(d.nombre)}"></label>
      <div class="lista">${lista.map(([it, i]) => `<div class="fila-t ${this.precios[i] != null ? '' : 'gris'}"><span class="ic">${imagen(it)}</span><span><b>${esc(O.nombreObjeto(it))}${it.c > 1 ? ' × ' + it.c : ''}</b><small>Al herrero: ${(O.precioVenta(it) * (it.c || 1)).toLocaleString('es-AR')}</small></span>
        <input class="pu-precio" data-i="${i}" type="number" min="1" inputmode="numeric" placeholder="Precio" value="${this.precios[i] ?? ''}"></div>`).join('')}</div>
      <div class="acciones"><button class="btn" id="pu-abrir" ${enAt ? '' : 'disabled'}>Abrir el puesto</button></div>`;
  }
  conectarMiPuesto(d) {
    const c = $('#pu-cerrar', this.el); if (c) c.onclick = () => this.ctx.mandar({ t: 'puesto', a: 'cerrar' });
    const t = $('#pu-titulo', this.el); if (t) { t.oninput = () => { this.tituloPuesto = t.value; }; t.addEventListener('keydown', e => e.stopPropagation()); }
    this.el.querySelectorAll('.pu-precio').forEach(inp => {
      inp.addEventListener('keydown', e => e.stopPropagation());
      inp.oninput = () => { const v = Math.floor(+inp.value); if (v >= 1) this.precios[inp.dataset.i] = v; else delete this.precios[inp.dataset.i]; inp.closest('.fila-t').classList.toggle('gris', !(v >= 1)); };
    });
    const a = $('#pu-abrir', this.el); if (a) a.onclick = () => this.ctx.mandar({ t: 'puesto', a: 'abrir', titulo: this.tituloPuesto || '', items: Object.entries(this.precios || {}).map(([i, precio]) => ({ i: +i, precio })) });
  }
  // Puesto de otro jugador.
  puestoAjeno(m) {
    const d = this.ctx.mio(); if (!d) return;
    if (!m.abierto) { this.cerrar(); return this.ctx.toast(`${m.nombre} cerró el puesto.`); }
    const cuerpo = `<p class="nota">Tenés ${this.oro(d)}. Tocá «Comprar» y es tuyo.</p><div class="lista">${m.items.map((x, k) => `<div class="puesto-item">${ficha(x.item, d, `<span class="precio">${x.precio.toLocaleString('es-AR')} de oro</span><button class="btn chico" data-comprar="${k}" ${d.oro >= x.precio ? '' : 'disabled'}>Comprar</button>`)}</div>`).join('') || '<p class="nota">No le queda nada.</p>'}</div>`;
    this.marco(esc(m.titulo), `Puesto de ${esc(m.nombre)}`, null, null, cuerpo, 'puestoAjeno', [m]);
    this.el.querySelectorAll('[data-comprar]').forEach(b => b.onclick = () => this.ctx.mandar({ t: 'puesto', a: 'comprar', id: m.id, k: +b.dataset.comprar }));
  }

  // ---------- hermandad ----------
  hermandad(h, online) {
    this.herm = h; this.hermOnline = online || [];
    if (this.abierto?.f === 'personaje' && this.abierto.args[0] === 'hermandad') this.refrescar();
  }
  htmlHermandad(d) {
    const H = R.HERMANDAD, h = this.herm;
    if (!h) {
      const enAt = this.ctx.enAtalaya(), puede = (d.nivel >= H.nivel || d.resets) && d.oro >= H.oro;
      const sim = this.hSim || H.simbolos[0], col = this.hCol || H.colores[0];
      return `<p class="frase">«Nadie sobrevive solo al Luto. Los que juran juntos, cazan juntos y caen juntos.»</p>
        <p class="nota">Una hermandad lleva su emblema arriba del nombre de cada miembro, tiene su propio chat (escribí <b>/h</b> y el mensaje) y da <b>+${Math.round(H.bonus * 100)}% de experiencia por cada hermano que cace cerca</b> (hasta +${Math.round(H.bonusMax * 100)}%). Hasta ${H.max} miembros. Para entrar a una, pedile a quien la lidera que te invite.</p>
        <div class="mision"><b>Fundar una hermandad</b>
          <span class="m-texto">Se funda en cualquier atalaya. Pide nivel ${H.nivel} (o haber renacido) y ${H.oro.toLocaleString('es-AR')} de oro.</span>
          <label>Nombre<input id="h-nombre" maxlength="18" autocomplete="off" value="${esc(this.hNombre || '')}"></label>
          <span class="nota">Emblema</span>
          <div class="h-elegir">${H.simbolos.map(x => `<button type="button" class="h-sim ${x === sim ? 'on' : ''}" data-sim="${x}" style="color:${col}">${x}&#xFE0E;</button>`).join('')}</div>
          <div class="h-elegir">${H.colores.map(c => `<button type="button" class="h-col ${c === col ? 'on' : ''}" data-col="${c}" style="background:${c}"></button>`).join('')}</div>
          ${!enAt ? '<span class="peligro">Tenés que estar en una atalaya.</span>' : !puede ? `<span class="peligro">${d.oro < H.oro ? 'No te alcanza el oro.' : `Hace falta nivel ${H.nivel}.`}</span>` : ''}
          <div class="acciones"><button class="btn" id="h-fundar" ${enAt && puede ? '' : 'disabled'}>Fundar (${H.oro.toLocaleString('es-AR')} de oro)</button></div>
        </div>`;
    }
    const lider = h.lider === d.nombre, on = new Set(this.hermOnline);
    const lista = [...h.miembros].sort((a, b) => (b === h.lider) - (a === h.lider) || on.has(b) - on.has(a) || a.localeCompare(b));
    return `<div class="h-cabeza"><span class="h-emblema" style="color:${h.color};border-color:${h.color}">${h.simbolo}&#xFE0E;</span><div><b style="color:${h.color}">${esc(h.nombre)}</b><small>${h.miembros.length} de ${R.HERMANDAD.max} miembros · ${on.size} conectados</small></div></div>
      <p class="nota">Chat de la hermandad: escribí <b>/h</b> y el mensaje. Cada hermano que cace cerca tuyo te da +${Math.round(R.HERMANDAD.bonus * 100)}% de experiencia.${lider ? ' Para invitar a alguien, tocalo en el mapa.' : ''}</p>
      <div class="h-lista">${lista.map(n => `<div class="fila-t ${on.has(n) ? '' : 'gris'}"><span class="ic h-punto">${on.has(n) ? '●' : '○'}</span><span><b>${esc(n)}</b><small>${n === h.lider ? 'Lidera' : 'Hermano'}${on.has(n) ? ' · conectado' : ''}</small></span>
        ${lider && n !== d.nombre ? `<button class="btn chico sec" data-hlider="${esc(n)}">Pasar mando</button><button class="btn chico sec" data-hechar="${esc(n)}">Echar</button>` : ''}</div>`).join('')}</div>
      <div class="acciones"><button class="btn sec" id="h-salir">${h.miembros.length === 1 ? 'Disolver la hermandad' : 'Dejar la hermandad'}</button></div>`;
  }
  conectarHermandad() {
    const n = $('#h-nombre', this.el); if (n) n.oninput = () => { this.hNombre = n.value; };
    if (n) n.addEventListener('keydown', e => e.stopPropagation());
    this.el.querySelectorAll('[data-sim]').forEach(b => b.onclick = () => { this.hSim = b.dataset.sim; this.personaje('hermandad'); });
    this.el.querySelectorAll('[data-col]').forEach(b => b.onclick = () => { this.hCol = b.dataset.col; this.personaje('hermandad'); });
    const f = $('#h-fundar', this.el); if (f) f.onclick = () => this.ctx.mandar({ t: 'herm', a: 'crear', nombre: n.value, simbolo: this.hSim || R.HERMANDAD.simbolos[0], color: this.hCol || R.HERMANDAD.colores[0] });
    this.el.querySelectorAll('[data-hechar]').forEach(b => b.onclick = () => { if (confirm(`¿Echar a ${b.dataset.hechar} de la hermandad?`)) this.ctx.mandar({ t: 'herm', a: 'echar', n: b.dataset.hechar }); });
    this.el.querySelectorAll('[data-hlider]').forEach(b => b.onclick = () => { if (confirm(`¿Pasarle el mando a ${b.dataset.hlider}? Vos quedás como hermano.`)) this.ctx.mandar({ t: 'herm', a: 'lider', n: b.dataset.hlider }); });
    const s = $('#h-salir', this.el); if (s) s.onclick = () => { if (confirm(this.herm.miembros.length === 1 ? '¿Disolver la hermandad? El nombre queda libre.' : '¿Dejar la hermandad?')) this.ctx.mandar({ t: 'herm', a: 'salir' }); };
  }

  htmlEquipo(d) {
    const ranuras = O.RANURAS.filter(r => r !== 'escudo' || C.CLASES[d.clase].escudo);
    const eq = ranuras.map(r => casilla(d.equipo[r], `data-e="${r}" class-sel="${this.sel === 'e:' + r}"`, d.equipo[r] ? '' : `<small class="vacio">${O.NOMBRE_RANURA[r]}</small>`)).join('');
    const comunes = d.inv.filter(it => it && O.BASES[it.b]?.r && !O.BASES[it.b].ala && !O.BASES[it.b].bestia && !O.rareza(it) && !it.g?.length).length;
    const inv = d.inv.map((it, i) => casilla(it, `data-i="${i}"`, this.ctx.ofrecido?.(i) ? '<small class="cant">✓</small>' : '')).join('');
    // Tres columnas que entran en la pantalla: lo puesto, la ficha del objeto elegido (siempre a la vista) y la mochila.
    return `<div class="equipo-grid">
      <div class="col-eq"><div class="eq">${eq}</div><div class="fila-oro">${this.oro(d)}</div><button class="btn chico sec" id="p-cambiar">Cambiar de personaje</button><button class="link" id="p-tuto">¿Cómo se juega?</button></div>
      <div class="col-ficha" id="p-ficha">${this.htmlFicha(d)}</div>
      <div class="col-inv"><div class="inv">${inv}</div>
        <div class="fila-inv"><button class="btn chico sec" id="p-ordenar">Ordenar</button><button class="btn chico sec" id="p-comunes" ${comunes ? '' : 'disabled'}>Tirar comunes${comunes ? ` (${comunes})` : ''}</button></div>
        <label class="filtro-inv">Levantar equipo <select id="p-filtro">${O.FILTROS.map((t, i) => `<option value="${i}" ${(d.filtro || 0) === i ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div></div>`;
  }

  htmlFicha(d) {
    if (!this.sel) return '<p class="nota">Tocá un objeto para ver qué es.</p>';
    const [tipo, k] = this.sel.split(':');
    const it = tipo === 'e' ? d.equipo[k] : d.inv[+k]; if (!it) return '';
    const b = O.BASES[it.b], acc = [];
    if (tipo === 'e') acc.push(['quitar', 'Sacar']);
    else if (b.r) { const m = O.motivoNoPuede(d, it); acc.push(['equipar', m ? 'No podés usarlo' : 'Ponerse', !!m]); }
    else if (b.uso === 'cura' || b.uso === 'mana') acc.push(['usar', 'Usar']);
    else if (b.uso === 'viaje') acc.push(['vela', 'Prender (viajar)']);
    if (b.r && this.ctx.rolCerca('herrero')) acc.push(['forjar', 'Forjar']);
    if (tipo === 'i' && (this.ctx.rolCerca('herrero') || this.ctx.rolCerca('mercader'))) acc.push(['vender', `Vender · ${O.precioVenta(it) * (it.c || 1)} oro`]);
    if (tipo === 'i' && this.ctx.rolCerca('baul')) acc.push(['baul', 'Guardar en el baúl']);
    if (tipo === 'i') acc.push(['tirar', 'Tirar']);
    if (tipo === 'i' && this.ctx.comerciando?.()) acc.push(['ofrecer', this.ctx.ofrecido(+k) ? 'Sacar del comercio' : 'Ofrecer']);
    return ficha(it, d, acc.map(([a, n, off]) => `<button class="btn chico" data-a="${a}" ${off ? 'disabled' : ''}>${n}</button>`).join(''));
  }

  // Arrastrar un objeto de la mochila a otro casillero, o a la columna del equipo para ponérselo.
  arrastrable(b, d) {
    const de = +b.dataset.i; if (!d.inv[de]) return;
    b.onpointerdown = e => {
      const x0 = e.clientX, y0 = e.clientY; let copia = null;
      const mover = ev => {
        if (!copia) {
          if (Math.hypot(ev.clientX - x0, ev.clientY - y0) < 8) return;
          copia = b.cloneNode(true); copia.classList.add('arrastrando'); copia.style.width = b.offsetWidth + 'px'; document.body.appendChild(copia); b.classList.add('origen');
        }
        ev.preventDefault();
        copia.style.left = ev.clientX + 'px'; copia.style.top = ev.clientY + 'px';
      };
      const soltar = ev => {
        removeEventListener('pointermove', mover); removeEventListener('pointerup', soltar); removeEventListener('pointercancel', soltar);
        if (!copia) return;
        copia.remove(); b.classList.remove('origen'); this.ignorarToque = true; setTimeout(() => { this.ignorarToque = false; }, 50);
        if (ev.type !== 'pointerup') return;
        const dest = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.slot');
        if (dest?.dataset.i != null) { this.sel = null; this.ctx.mandar({ t: 'mover', de, a: +dest.dataset.i }); }
        else if (dest?.dataset.e) { this.sel = null; this.ctx.mandar({ t: 'equipar', i: de }); }
      };
      addEventListener('pointermove', mover, { passive: false }); addEventListener('pointerup', soltar); addEventListener('pointercancel', soltar);
    };
  }

  conectarMochila(d) {
    this.el.querySelectorAll('.slot[data-e], .slot[data-i]').forEach(b => {
      const k = b.dataset.e ? 'e:' + b.dataset.e : 'i:' + b.dataset.i;
      if (this.sel === k) b.classList.add('sel');
      b.onclick = () => { if (this.ignorarToque) return; this.sel = (b.dataset.e ? d.equipo[b.dataset.e] : d.inv[+b.dataset.i]) ? k : null; this.personaje('equipo'); };
      if (b.dataset.i != null) this.arrastrable(b, d);
    });
    const ord = $('#p-ordenar', this.el); if (ord) ord.onclick = () => { this.sel = null; this.ctx.mandar({ t: 'ordenar' }); };
    const com = $('#p-comunes', this.el); if (com) com.onclick = () => { if (confirm('¿Tirar todo el equipo común de la mochila? No se recupera. Lo que tiene gemas se salva.')) { this.sel = null; this.ctx.mandar({ t: 'tirar', comunes: true }); } };
    const fil = $('#p-filtro', this.el); if (fil) fil.onchange = () => this.ctx.mandar({ t: 'filtro', n: +fil.value });
    this.el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const [tipo, k] = this.sel.split(':'), a = b.dataset.a, m = this.ctx.mandar;
      if (a === 'quitar') m({ t: 'quitar', r: k });
      if (a === 'equipar' || a === 'usar') m({ t: a, i: +k });
      if (a === 'vender') { m({ t: 'vender', i: +k }); this.sel = null; }
      if (a === 'tirar') { if (confirm(`¿Tirar ${O.nombreObjeto(d.inv[+k])}? No se recupera.`)) { m({ t: 'tirar', i: +k }); this.sel = null; } }
      if (a === 'baul') { m({ t: 'baul', a: 'poner', i: +k }); this.sel = null; }
      if (a === 'forjar') return this.npc(this.ctx.rolCerca('herrero').id, 'forja', tipo === 'e' ? { r: k } : { i: +k });
      if (a === 'ofrecer') m({ t: 'com', a: this.ctx.ofrecido(+k) ? 'sacar' : 'poner', i: +k });
      if (a === 'vela') return this.velas();
    });
  }

  htmlArbol(d) {
    const libres = C.puntosLibres(d), mae = C.maestria(d), bot = C.botones(d), act = C.activasAprendidas(d);
    return `<p class="nota">Puntos de habilidad: <b>${libres}</b> (uno por nivel). Las definitivas se abren en el nivel 30 con 10 puntos en su rama.</p>
      ${mae ? `<p class="nota maestria">Maestría: <b>${mae}</b> puntos de más · <b>+${(mae * C.MAESTRIA).toFixed(1)}%</b> de daño y de vida. Los puntos que no entran en el árbol se suman acá solos.</p>` : ''}
      ${act.length ? `<div class="barra-hab"><span>Tus botones: tocá uno y elegí qué habilidad va ahí.</span><div class="fila-bot">${bot.map((id, i) => `<button class="bot-hab ${this.botonSel === i ? 'sel' : ''}" data-bot="${i}">${id ? iconoHab(d.clase, id) : '<span class="mas">+</span>'}<small>${i + 1}</small></button>`).join('')}</div>
        ${this.botonSel != null ? `<div class="elige-hab">${act.map(id => `<button class="btn chico ${bot[this.botonSel] === id ? '' : 'sec'}" data-elige="${id}">${C.buscarHab(d.clase, id).nombre}</button>`).join('')}<button class="btn chico sec" data-elige="">Dejar vacío</button></div>` : ''}</div>` : ''}
      <div class="arbol">${C.ARBOL[d.clase].map(rama => `<div class="rama"><h3>${rama.rama}</h3>${rama.hab.map(h => {
        const r = d.arbol[h.id] || 0, motivo = C.puedeAprender(d, h.id);
        return `<div class="nodo ${r ? 'tiene' : ''} ${h.def ? 'def' : ''}"><span class="nodo-ic">${iconoHab(d.clase, h.id)}</span>
          <div><b>${h.nombre}${h.elem ? ` <em class="elem" style="color:${R.ELEMENTOS[h.elem].color}">${R.ELEMENTOS[h.elem].nombre}</em>` : ''}</b><small>${h.tipo === 'pasiva' ? 'Pasiva' : h.def ? 'Definitiva' : 'Activa'} · ${r}/${h.max}${h.mp ? ` · ${h.mp} energía` : ''}</small>
          <span>${h.desc(Math.max(1, r))}</span>
          <button class="btn chico" data-h="${h.id}" ${motivo ? 'disabled' : ''} title="${motivo || ''}">${r ? 'Mejorar' : 'Aprender'}</button></div></div>`;
      }).join('')}</div>`).join('')}</div>`;
  }

  htmlAtributos(d) {
    const v = d.der || {};
    return `<p class="nota">Puntos para repartir: <b>${d.puntos}</b> (${R.PUNTOS_POR_NIVEL} por nivel).</p>${R.STATS.map(s => `<div class="stat"><span>${R.NOMBRE_STAT[s]}<small>${R.explicaStat(s, C.CLASES[d.clase].atributo)}</small></span><b>${d[s]}</b>
      <button class="mas" data-s="${s}" data-n="1" ${d.puntos ? '' : 'disabled'}>+1</button><button class="mas" data-s="${s}" data-n="5" ${d.puntos >= 5 ? '' : 'disabled'}>+5</button></div>`).join('')}
      <div class="fila-oro"><span class="nota">¿Te equivocaste? Podés devolver todos los puntos y repartirlos de nuevo.</span><button class="btn chico sec" id="p-redis">Redistribuir (${R.costoRedistribuir(d) ? R.costoRedistribuir(d).toLocaleString('es-AR') + ' de oro' : 'gratis la primera vez'})</button></div>
      <div class="totales"><span>Daño <b>${v.dmin}–${v.dmax}</b></span><span>Defensa <b>${v.def}</b></span><span>Vida <b>${v.maxHp}</b></span><span>Energía <b>${v.maxMp}</b></span><span>Crítico <b>${v.crit}%</b></span><span>Daño crítico <b>+${v.critDano || 50}%</b></span></div>
      ${O.setsPuestos(d.equipo).map(({ set, n }) => `<div class="set-bonus"><b>Set ${set.nombre} (${n} de 4)</b><span class="activo">${O.textoBonus(set[2])}</span>${n >= 4 ? `<span class="activo">${O.textoBonus(set[4])}</span>` : `<span>Con 4 piezas: ${O.textoBonus(set[4])}</span>`}</div>`).join('')}
      <div class="totales elem">${Object.entries(R.ELEMENTOS).map(([k, e]) => `<span style="color:${e.color}">${e.nombre}: <b>${v.elem?.[k] ? `+${v.elem[k]}% daño · ` : ''}${v.res?.[k] || 0}% resist.</b></span>`).join('')}</div>`;
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
    const tabs = n.rol === 'joyera' ? [['gemas', 'Combinar'], ['engarces', 'Engarzar']] : n.rol === 'herrero' ? [['tienda', 'Comprar'], ['forja', 'Forja'], ['caldero', 'Caldero'], ['vender', 'Vender']]
      : n.rol === 'vidente' ? [['eventos', 'Eventos'], ['pozo', 'Pozo'], ['tienda', 'Comprar'], ['asedio', 'Asedio'], ['alas', 'Alas'], ['renacer', 'Renacer'], ['ranking', 'Ranking'], ['viajes', 'Velas']] : [['tienda', 'Comprar'], ['vender', 'Vender']];
    tab = tab || tabs[0][0];
    let cuerpo = `<p class="frase">«${n.frase}»</p>`;
    if (tab === 'tienda') cuerpo += this.htmlTienda(n, d);
    if (tab === 'vender') cuerpo += this.htmlVender(d);
    if (tab === 'forja') cuerpo += this.htmlForja(d);
    const lugares = l => l.map(i => R.PUEBLOS[i].nombre).join(' y ');
    if (tab === 'engarces') cuerpo += this.htmlEngarces(d);
    if (tab === 'gemas') cuerpo += this.htmlGemas(d);
    if (tab === 'caldero') cuerpo += O.CALDEROS.includes(n.atalaya) ? this.htmlCaldero(d) : `<p class="nota">Acá no hay caldero. Quedan dos: ${lugares(O.CALDEROS)}.</p>`;
    if (tab === 'eventos') cuerpo += this.htmlEventos();
    if (tab === 'viajes') cuerpo += this.htmlVelas(d);
    if (tab === 'pozo') cuerpo += this.htmlPozo(d);
    if (tab === 'renacer') cuerpo += this.htmlRenacer(d);
    if (tab === 'alas') cuerpo += this.htmlAlas(d);
    if (tab === 'asedio') cuerpo += this.htmlAsedio(d);
    if (tab === 'ranking') { cuerpo += this.htmlRanking(d); this.pedirRanking(); }
    this.marco(n.nombre, R.PUEBLOS[n.atalaya]?.nombre, tabs, tab, cuerpo, 'npc', [id, tab]);
    const m = this.ctx.mandar;
    this.el.querySelectorAll('[data-tsel]').forEach(b => b.onclick = () => { this.sel = 't:' + b.dataset.tsel; this.npc(id, tab); });
    this.el.querySelectorAll('[data-rk]').forEach(b => b.onclick = () => { this.vistaRanking = b.dataset.rk; this.pedidoRanking = 0; this.npc(id, 'ranking'); });
    this.el.querySelectorAll('[data-alas]').forEach(b => b.onclick = () => { const a = O.BASES[O.ALAS[+b.dataset.alas].b]; if (confirm(`¿Pedirle a Oria ${a.nombre}? Si falla, perdés lo que entregás.`)) this.ctx.mandar({ t: 'alas', n: +b.dataset.alas }); });
    this.el.querySelectorAll('[data-comprar]').forEach(b => b.onclick = () => m({ t: 'comprar', npc: id, b: b.dataset.comprar, c: +b.dataset.c }));
    this.el.querySelectorAll('[data-vsel]').forEach(b => b.onclick = () => { this.sel = 'v:' + b.dataset.vsel; this.npc(id, tab); });
    this.el.querySelectorAll('[data-vender]').forEach(b => b.onclick = () => { m({ t: 'vender', i: +b.dataset.vender }); this.sel = null; });
    this.el.querySelectorAll('[data-lugar]').forEach(b => b.onclick = () => { m({ t: 'vela', lugar: b.dataset.lugar }); this.cerrar(); });
    this.el.querySelectorAll('[data-fsel]').forEach(b => b.onclick = () => { const [t, k] = b.dataset.fsel.split(':'); this.forjaSel = t === 'e' ? { r: k } : { i: +k }; this.npc(id, 'forja'); });
    const bf = $('#p-forjar', this.el); if (bf) bf.onclick = () => m({ t: 'forjar', ...this.forjaSel });
    this.el.querySelectorAll('[data-csel]').forEach(b => b.onclick = () => { const i = +b.dataset.csel, s = this.calSel = (this.calSel || []).filter(x => d.inv[x]); if (s.includes(i)) s.splice(s.indexOf(i), 1); else if (s.length < 3) s.push(i); this.npc(id, 'caldero'); });
    const bc = $('#p-caldero', this.el); if (bc) bc.onclick = () => { if (confirm('Los tres equipos se pierden, salga bien o mal. ¿Seguís?')) { m({ t: 'caldero', is: this.calSel }); this.calSel = []; } };
    this.el.querySelectorAll('[data-esel]').forEach(b => b.onclick = () => { const [t, k] = b.dataset.esel.split(':'); this.engSel = t === 'e' ? { r: k } : { i: +k }; this.npc(id, 'engarces'); });
    const ab = $('#p-abrir', this.el); if (ab) ab.onclick = () => m({ t: 'engarce', a: 'abrir', ...this.engSel });
    // Tocar una gema solo la muestra: se engarza recién con el botón.
    this.el.querySelectorAll('[data-poner]').forEach(b => b.onclick = () => { this.engGema = b.dataset.poner; this.npc(id, 'engarces'); });
    const ep = $('#p-engarzar', this.el); if (ep) ep.onclick = () => { m({ t: 'engarce', a: 'poner', gema: this.engGema, ...this.engSel }); this.engGema = null; };
    this.el.querySelectorAll('[data-gsel]').forEach(b => b.onclick = () => { this.gemaSel = b.dataset.gsel; this.npc(id, 'gemas'); });
    this.el.querySelectorAll('[data-combinar]').forEach(b => b.onclick = () => m({ t: 'gemas', g: this.gemaSel, todas: b.dataset.combinar === 'todas' }));
    this.el.querySelectorAll('[data-sacar]').forEach(b => b.onclick = () => m({ t: 'engarce', a: 'sacar', k: +b.dataset.sacar, ...this.engSel }));
    const bb = $('#p-bastion', this.el); if (bb) bb.onclick = () => { m({ t: 'bastion' }); this.cerrar(); };
    const bp = $('#p-pozo', this.el); if (bp) bp.onclick = () => { m({ t: 'pozo' }); this.cerrar(); };
    const br = $('#p-renacer', this.el); if (br) br.onclick = () => { if (br.dataset.ok) { m({ t: 'renacer' }); this.cerrar(); } else { br.dataset.ok = 1; br.textContent = 'Tocá otra vez para confirmar'; } };
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
    const lista = [...O.RANURAS.filter(r => d.equipo[r]).map(r => ['e:' + r, d.equipo[r]]), ...d.inv.map((it, i) => ['i:' + i, it]).filter(([, it]) => it && O.forjable(it.b))].filter(([, it]) => O.forjable(it.b));
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

  htmlCaldero(d) {
    const sel = (this.calSel || []).filter(i => d.inv[i]), lista = d.inv.map((it, i) => [it, i]).filter(([it]) => it && O.forjable(it.b) && !it.g?.length);
    const elegidos = sel.map(i => d.inv[i]), info = O.calderoListo(elegidos), R2 = O.RAREZAS;
    return `<p class="nota">Tirá <b>tres equipos de la misma rareza</b> al Caldero del Caos. Si sale bien, aparece uno de la rareza siguiente, para tu clase y del nivel del mejor que pusiste. Los tres se pierden siempre; si falla, te devuelve un poco de oro.</p>
      <div class="lista caldero-info">${O.CALDERO.chance.map((c, r) => `<div class="fila-t"><span><b style="color:${r ? R2[r].color : ''}">${R2[r].nombre}</b> → <b style="color:${R2[r + 1].color}">${R2[r + 1].nombre}</b><small>${Math.round(c * 100)}% · ${O.CALDERO.oro[r].toLocaleString('es-AR')} de oro</small></span></div>`).join('')}</div>
      <div class="tienda-grid"><div><div class="grilla">${lista.map(([it, i]) => casilla(it, `data-csel="${i}"`).replace('class="slot ', `class="slot ${sel.includes(i) ? 'sel ' : ''}`)).join('') || '<p class="nota">No tenés equipos libres en la mochila.</p>'}</div></div>
      <div class="forja-det"><span>Elegidos: <b>${sel.length}</b> de 3</span>
        ${sel.length === 3 && !info ? '<span class="peligro">Tienen que ser de la misma rareza (hasta legendario).</span>' : ''}
        ${info ? `<span>Sale <b>${Math.round(info.chance * 100)}%</b> de las veces · ${info.oro.toLocaleString('es-AR')} de oro</span>` : ''}
        <button class="btn" id="p-caldero" ${info && d.oro >= info.oro ? '' : 'disabled'}>Fundir</button></div></div>`;
  }

  // Joyera: elegís una gema, ves lo que da y lo que daría la de la calidad siguiente, y combinás.
  htmlGemas(d) {
    const cant = g => d.inv.reduce((a, x) => a + (x?.b === g ? x.c || 1 : 0), 0);
    const lista = [...new Set(d.inv.filter(x => O.BASES[x?.b]?.engarce).map(x => x.b))].sort((a, c) => O.BASES[a].de.localeCompare(O.BASES[c].de) || O.BASES[c].calidad - O.BASES[a].calidad);
    if (!lista.length) return '<p class="nota">No tenés gemas. Caen de los monstruos desde el nivel 15 y de los jefes.</p>';
    const g = lista.includes(this.gemaSel) ? this.gemaSel : lista[0], b = O.BASES[g], sig = O.gemaSiguiente(g), s = sig && O.BASES[sig];
    const oro = s ? O.CALIDADES[s.calidad].oro : 0, n = cant(g), veces = s ? Math.min(Math.floor(n / 3), Math.floor(d.oro / oro)) : 0;
    this.gemaSel = g;
    const efecto = x => `<small><b>En el arma:</b> ${textoGema(x, true)}<br><b>En la armadura:</b> ${textoGema(x, false)}</small>`;
    return `<div class="tienda-grid"><div><div class="grilla">${lista.map(x => casilla({ b: x, c: cant(x) }, `data-gsel="${x}"`).replace('class="slot ', `class="slot ${x === g ? 'sel ' : ''}`)).join('')}</div></div>
      <div><div class="fila-t"><span class="ic">${imagen({ b: g })}</span><span><b>${b.nombre}</b>${efecto(g)}</span></div>
      ${s ? `<p class="nota">Tres de estas dan una mejor. No falla nunca.</p>
        <div class="fila-t"><span class="ic">${imagen({ b: sig })}</span><span><b>${s.nombre}</b>${efecto(sig)}</span></div>
        <p>Tenés <b>${n}</b> de 3 · Cuesta <b>${oro.toLocaleString('es-AR')}</b> de oro</p>
        <div class="acciones"><button class="btn chico" data-combinar="una" ${veces ? '' : 'disabled'}>Combinar 3</button>${veces > 1 ? `<button class="btn chico sec" data-combinar="todas">Combinar todas (${veces})</button>` : ''}</div>`
      : '<p class="nota">Esta gema ya es de la mejor calidad.</p>'}</div></div>`;
  }

  htmlEngarces(d) {
    const lista = [...O.RANURAS.filter(r => d.equipo[r]).map(r => ['e:' + r, d.equipo[r]]), ...d.inv.map((it, i) => ['i:' + i, it]).filter(([, it]) => it && O.forjable(it.b))].filter(([, it]) => O.forjable(it.b));
    const s = this.engSel, it = s ? (s.r ? d.equipo[s.r] : d.inv[s.i]) : null;
    let det = '<p class="nota">Elegí un equipo. En los engarces van las gemas: en el arma suman daño de su elemento; en la armadura, resistencia. El Ojo de Halcón da crítico.</p>';
    if (it && O.esEquipo(it.b)) {
      const max = O.maxEngarces(it), n = it.s || 0, gs = it.g || [], arma = O.BASES[it.b].r === 'arma';
      const gemas = d.inv.map((x, i) => [x, i]).filter(([x]) => x && O.BASES[x.b]?.engarce);
      const elegida = gemas.some(([x]) => x.b === this.engGema) ? this.engGema : null;
      det = ficha(it, d) + `<div class="forja-det">
        <span>Engarces: <b>${n}</b> de ${max} posibles ${n < max ? `· <button class="btn chico" id="p-abrir" ${d.oro >= O.ENGARCES.abrir(n) ? '' : 'disabled'}>Abrir uno (${O.ENGARCES.abrir(n).toLocaleString('es-AR')} de oro)</button>` : ''}</span>
        ${gs.map((g, k) => `<div class="fila-t"><span class="ic">${imagen({ b: g })}</span><span><b>${O.BASES[g].nombre}</b><small>${textoGema(g, arma)}</small></span><button class="btn chico sec" data-sacar="${k}">Sacar (${O.ENGARCES.sacar.toLocaleString('es-AR')})</button></div>`).join('')}
        ${!n ? '<span class="nota">No tiene engarces. Abrí uno para poner gemas.</span>' : ''}
        ${n ? `<span class="nota">${n > gs.length ? `Engarces libres: ${n - gs.length}.` : 'No le quedan engarces libres.'} Tocá una gema para ver qué suma:</span>
          <div class="grilla">${gemas.length ? gemas.map(([x]) => casilla(x, `data-poner="${x.b}" title="${O.BASES[x.b].nombre}"`).replace('class="slot ', `class="slot ${x.b === this.engGema ? 'sel ' : ''}`)).join('') : '<span class="nota">No tenés gemas. Caen de los monstruos desde el nivel 15 y de los jefes.</span>'}</div>
          ${elegida ? `<div class="fila-t"><span class="ic">${imagen({ b: elegida })}</span><span><b>${O.BASES[elegida].nombre}</b><small>En ${arma ? 'esta arma' : 'este equipo'}: ${textoGema(elegida, arma)}</small></span><button class="btn chico" id="p-engarzar" ${n > gs.length ? '' : 'disabled'}>Engarzar</button></div>` : ''}` : ''}
      </div>`;
    }
    const k = s ? (s.r ? 'e:' + s.r : 'i:' + s.i) : null;
    return `<div class="tienda-grid"><div><div class="grilla">${lista.map(([kk, x]) => casilla(x, `data-esel="${kk}"`).replace('class="slot ', `class="slot ${kk === k ? 'sel ' : ''}`)).join('')}</div></div><div>${det}</div></div>`;
  }

  htmlEventos() {
    const ahora = Date.now();
    return `<div class="lista">${R.EVENTOS.map(e => {
      const fase = ((ahora / 60000 - e.desfase) % e.cada + e.cada) % e.cada, activo = fase < e.dura, min = activo ? e.dura - fase : e.cada - fase;
      return `<div class="fila-t"><span><b>${e.nombre}</b><small>${e.desc}</small></span><span class="precio">${activo ? 'Ahora · quedan ' : 'En '}${Math.floor(min)}:${String(Math.floor(min % 1 * 60)).padStart(2, '0')}</span></div>`;
    }).join('')}</div>`;
  }

  // La Vela de Paso se prende desde la mochila, en cualquier lado: lista los lugares conocidos, por región.
  velas() {
    const d = this.ctx.mio(); if (!d) return;
    this.marco('Vela de Paso', 'Te lleva a cualquier lugar que ya descubriste', null, null, this.htmlVelas(d), 'velas', []);
    this.el.querySelectorAll('[data-lugar]').forEach(b => b.onclick = () => { this.ctx.mandar({ t: 'vela', lugar: b.dataset.lugar }); this.cerrar(); });
  }
  htmlVelas(d) {
    const velas = d.inv.reduce((a, x) => a + (x?.b === 'vela' ? x.c : 0), 0);
    return `<p class="nota">Velas de Paso: <b>${velas}</b>. Te llevan a cualquier lugar que ya conozcas, no solo a las atalayas.</p>
      ${[['Páramo del Luto', null], ...R.ISLAS.map(i => [i.nombre, i.id])].map(([titulo, id]) => {
        const ls = R.MAPA.lugares.filter(l => (R.islaDe(l.x, l.z)?.id || null) === id && d.lugares.includes(l.nombre));
        return ls.length ? `<h3>${titulo}</h3><div class="lista">${ls.map(l => `<div class="fila-t"><span><b>${l.nombre}</b><small>${l.frase}</small></span>
          <button class="btn chico" data-lugar="${l.nombre}" ${velas ? '' : 'disabled'}>Ir</button></div>`).join('')}</div>` : '';
      }).join('')}
      <p class="nota">Descubrís lugares caminando cerca. Las velas se compran con Úrsula y en las otras mercaderas.</p>`;
  }

  htmlPozo(d) {
    const e = R.EVENTOS.find(x => x.id === 'pozo'), fase = ((Date.now() / 60000 - e.desfase) % e.cada + e.cada) % e.cada;
    const abierta = fase < e.entrada, sellos = d.inv.reduce((a, x) => a + (x?.b === 'sello' ? x.c : 0), 0);
    const min = abierta ? e.entrada - fase : e.cada - fase;
    return `<div class="mision"><b>Pozo de las Almas</b><span class="m-texto">${e.desc}</span>
      <span class="m-obj">${abierta ? `Entrada abierta · se cierra en ${Math.floor(min)}:${String(Math.floor(min % 1 * 60)).padStart(2, '0')}` : `Abre en ${Math.floor(min)}:${String(Math.floor(min % 1 * 60)).padStart(2, '0')}`}</span>
      <span class="nota">${R.POZO.oleadas} oleadas, una más dura que la otra, y un jefe al final. Cada oleada da experiencia; el jefe deja un tesoro para cada uno. Nivel mínimo ${R.POZO.nivelMin}. Si caés, quedás afuera.</span>
      <span>Sellos del Pozo: <b>${sellos}</b> (los vende Oria en "Comprar")</span>
      <div class="acciones"><button class="btn" id="p-pozo" ${abierta && sellos ? '' : 'disabled'}>Bajar al Pozo</button></div></div>`;
  }
  htmlAsedio(d) {
    const e = R.EVENTOS.find(x => x.id === 'asedio'), B = R.BASTION, fase = ((Date.now() / 60000 - e.desfase) % e.cada + e.cada) % e.cada;
    const abierto = fase < e.dura, min = abierto ? e.dura - fase : e.cada - fase, mm = R.textoTiempo(min * 60);
    const s = this.ctx.senor?.(), h = this.herm, puede = abierto && h && (d.nivel >= B.nivelMin || d.resets);
    return `${s ? `<div class="h-cabeza"><span class="h-emblema" style="color:${s.color};border-color:${s.color}">${s.simbolo}&#xFE0E;</span><div><small>Mandan en el Bastión</small><b style="color:${s.color}">♛&#xFE0E; ${esc(s.nombre)}</b><small>Ganaron con ${s.puntos} puntos</small></div></div>` : '<p class="nota">El Bastión no tiene dueño todavía.</p>'}
      <div class="mision"><b>Asedio del Bastión Caído</b><span class="m-texto">${e.desc}</span>
      <span class="m-obj">${abierto ? `En curso · termina en ${mm}` : `Empieza en ${mm} (dura ${e.dura} minutos)`}</span>
      <span class="nota">· Solo entran hermandades (nivel ${B.nivelMin} o renacidos). Adentro, los de otra hermandad son enemigos: tocalos para atacar.<br>
      · Cada segundo que tu hermandad esté sola en el círculo del altar suma ${B.porSegundo} punto; cada enemigo que caiga, ${B.porMuerte}. Si caés, volvés al borde.<br>
      · Gana la que más puntos tenga (mínimo ${B.minimo}). Premio: ${B.premio.ganador.toLocaleString('es-AR')} de oro y una Gema del Abismo para cada miembro adentro (${B.premio.otros.toLocaleString('es-AR')} de oro para los demás), y +${Math.round(B.bonusExp * 100)}% de experiencia para toda la hermandad hasta el próximo asedio.</span>
      ${!h ? '<span class="peligro">Necesitás una hermandad.</span>' : ''}
      <div class="acciones"><button class="btn" id="p-bastion" ${puede ? '' : 'disabled'}>Ir al Bastión</button></div></div>`;
  }
  htmlAlas(d) {
    const tiene = b => d.equipo.alas?.b === b || d.inv.some(x => x?.b === b);
    const cant = b => d.inv.reduce((a, x) => a + (x?.b === b ? x.c || 1 : 0), 0);
    return `<p class="nota">Oria cose alas con lo que le traigas. Puede fallar: si falla, se pierden el oro, las gemas y el equipo que entregaste (las alas anteriores no). Usa el equipo más flojo que sirva de tu mochila.</p>
      ${O.ALAS.map((rec, n) => {
        const a = O.BASES[rec.b], it = { b: rec.b, n: 0 };
        const reqs = [
          [d.nivel >= a.req && (!rec.renacido || d.resets >= rec.renacido), `Nivel ${a.req}${rec.renacido ? ' y haber renacido' : ''}`],
          [d.oro >= rec.oro, `${rec.oro.toLocaleString('es-AR')} de oro`],
          [cant(rec.gema) >= rec.gemas, `${rec.gemas} × ${O.BASES[rec.gema].nombre} (tenés ${cant(rec.gema)})`],
          [O.sacrificioAlas(d.inv, rec) >= 0, `${rec.texto[0].toUpperCase() + rec.texto.slice(1)} en la mochila`],
          ...(rec.previa ? [[tiene(rec.previa), O.BASES[rec.previa].nombre]] : []),
        ];
        const ok = reqs.every(r => r[0]);
        return `<div class="mision alas-rec"><div class="ficha-top"><div class="ficha-img ${claseObjeto(it)}">${imagen(it)}</div><div><b>${a.nombre}</b><span class="rareza">Alas · nivel ${a.ala}</span></div></div>
          <span class="m-texto">${a.desc}</span>
          <ul class="req-lista">${reqs.map(([v, t]) => `<li class="${v ? 'si' : 'no'}">${v ? '✓' : '✗'} ${t}</li>`).join('')}</ul>
          <div class="acciones"><span class="precio">Sale ${Math.round(rec.chance * 100)}% de las veces</span><button class="btn" data-alas="${n}" ${ok ? '' : 'disabled'}>${tiene(rec.b) ? 'Hacer otras' : 'Pedírselas a Oria'}</button></div></div>`;
      }).join('')}`;
  }

  htmlRenacer(d) {
    const n = d.resets || 0, oro = R.RENACER.oro(n), puede = d.nivel >= R.RENACER.nivel && d.oro >= oro;
    return `<div class="mision"><b>Renacer</b><span class="m-texto">El Farol te devuelve al nivel 1, pero no te olvidás de lo que aprendiste: renacés con puntos de regalo.</span>
      <span>Renacimientos: <b>${n}</b></span>
      <span>Pide nivel <b>${R.RENACER.nivel}</b> y <b>${oro.toLocaleString('es-AR')}</b> de oro.</span>
      <span class="nota">Al renacer: nivel 1, atributos de base + ${R.RENACER.puntos} puntos por cada renacimiento (${(n + 1) * R.RENACER.puntos} en total), y +${R.RENACER.habilidad} puntos de habilidad por renacimiento. El árbol se reinicia. El equipo se queda.</span>
      <div class="acciones"><button class="btn" id="p-renacer" ${puede ? '' : 'disabled'}>Renacer</button></div></div>`;
  }
  pedirRanking() { if (!this.pedidoRanking || Date.now() - this.pedidoRanking > 10000) { this.pedidoRanking = Date.now(); this.ctx.mandar({ t: this.vistaRanking === 'historico' ? 'ranking' : 'semana' }); } }
  enRanking() { return this.abierto && ((this.abierto.f === 'npc' && this.abierto.args[1] === 'ranking') || (this.abierto.f === 'personaje' && this.abierto.args[0] === 'ranking')); }
  ranking(lista) { this.listaRanking = lista; if (this.enRanking()) this.refrescar(); }
  semana(m) { this.datosSemana = m; if (this.enRanking()) this.refrescar(); }
  htmlRanking(d) {
    const vista = this.vistaRanking || 'semana';
    const pest = `<div class="titulos"><button class="btn chico ${vista === 'semana' ? '' : 'sec'}" data-rk="semana">Esta semana</button><button class="btn chico ${vista === 'historico' ? '' : 'sec'}" data-rk="historico">De siempre</button></div>`;
    if (vista === 'semana') {
      const S = this.datosSemana; if (!S) return pest + '<p class="nota">Buscando…</p>';
      const falta = Math.max(0, S.fin - Date.now()), dias = Math.floor(falta / 86400000), horas = Math.floor(falta % 86400000 / 3600000);
      const camp = S.campeones?.campeones ? Object.entries(S.campeones.campeones).map(([n, c]) => `${esc(n)} (${c.puesto}° · ${R.SEMANAL.find(x => x.id === c.tabla).nombre.toLowerCase()})`).join(', ') : '';
      return pest + `<p class="nota">Cierra en <b>${dias ? dias + ' días y ' : ''}${horas} horas</b> (el lunes a las 0, hora argentina). Los tres primeros de cada tabla cobran por correo y llevan su título toda la semana siguiente.</p>
        <p class="nota premios">Premios: 1° ${R.PREMIO_SEMANAL[0].oro.toLocaleString('es-AR')} de oro, 3 Gemas del Abismo y una Piedra Guardiana · 2° ${R.PREMIO_SEMANAL[1].oro.toLocaleString('es-AR')} y 2 Abismo · 3° ${R.PREMIO_SEMANAL[2].oro.toLocaleString('es-AR')} y 1 Abismo.</p>
        ${camp ? `<p class="nota">Campeones de la semana pasada: ${camp}.</p>` : ''}
        <div class="semana">${R.SEMANAL.map(T => { const l = S.tablas?.[T.id] || [], yo = l.findIndex(f => f.nombre === d.nombre);
          return `<div class="ranking"><h3>${T.nombre}</h3><small class="nota">Título: «${T.titulo}»</small>
            ${l.length ? l.slice(0, 10).map((f, i) => `<div class="rk ${f.nombre === d.nombre ? 'yo' : ''}"><span>${i + 1}${i < 3 ? ' ★' : ''}</span><span>${esc(f.nombre)}</span><span>${f.v.toLocaleString('es-AR')}</span></div>`).join('') : '<p class="nota">Nadie todavía. Puede ser tuyo.</p>'}
            ${yo >= 10 ? `<div class="rk yo"><span>${yo + 1}</span><span>${esc(d.nombre)}</span><span>${l[yo].v.toLocaleString('es-AR')}</span></div>` : ''}</div>`; }).join('')}</div>`;
    }
    const l = this.listaRanking;
    if (!l) return pest + '<p class="nota">Buscando…</p>';
    return pest + `<div class="ranking"><div class="rk cab"><span>#</span><span>Nombre</span><span>Clase</span><span>Renac.</span><span>Nivel</span></div>
      ${l.map((f, i) => `<div class="rk ${f.nombre === d.nombre ? 'yo' : ''}"><span>${i + 1}</span><span>${esc(f.nombre)}</span><span>${C.CLASES[f.clase]?.nombre || ''}</span><span>${f.resets}</span><span>${f.nivel}</span></div>`).join('')}</div>`;
  }

  senda(n) {
    const d = this.ctx.mio(); if (!d) return;
    const destino = R.ISLAS.find(i => i.atalaya === n.destino), origen = R.ISLAS.find(i => i.atalaya === n.atalaya);
    const adelante = destino && (!origen || destino.nivel > origen.nivel), puede = !adelante || d.nivel >= destino.nivel || d.resets > 0;
    const TXT = {
      costa: 'Una isla rodeada de mar muerto. Ahogados, piratas sin cuello y algo enorme en la Fosa.',
      yermo: 'Tierra quemada que todavía arde. Calcinados, perros de brasa, colosos de escoria y un volcán que respira.',
      trono: 'La ciudad del último rey del Sol. Su guardia sigue de ronda, los espectros siguen bailando y el rey sigue en el trono.',
      hielo: 'Un desierto de hielo donde nada hace ruido. Yetis, cazadores que bajaron del cielo y máscaras que flotan solas.',
      crater: 'El lugar donde se encendió el Sol Hondo. Dragones, simios de fuego y el que empezó todo.',
    };
    const titulo = destino ? destino.nombre : R.PUEBLOS[n.destino]?.nombre || 'Páramo del Luto';
    const cuerpo = `<p class="frase">«${n.frase}»</p><div class="mision"><b>${titulo}</b>
      <span class="m-texto">${destino && adelante ? `${TXT[destino.id]} Monstruos de nivel ${destino.niveles}.` : `De vuelta a ${R.PUEBLOS[n.destino]?.nombre || 'la Atalaya'}.`}</span>
      ${!puede ? `<span class="peligro">Hace falta nivel ${destino.nivel}.</span>` : ''}
      <div class="acciones"><button class="btn" id="p-senda" ${puede ? '' : 'disabled'}>Cruzar</button></div></div>`;
    this.marco(n.nombre, null, null, null, cuerpo, 'senda', [n]);
    const b = $('#p-senda', this.el); if (b) b.onclick = () => { this.ctx.mandar({ t: 'senda', id: n.id }); this.cerrar(); };
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
    const correo = d.correo || [], deMochila = tipo === 'i' ? +k : null;
    const cartas = `<div class="correo"><h3>Correo${correo.length ? ` (${correo.length})` : ''}</h3>
      ${correo.length ? correo.map((c, i) => `<div class="fila-t"><span class="ic">${c.it ? imagen(c.it) : iconoObjeto('oro')}</span><span><b>${c.it ? esc(O.nombreObjeto(c.it)) + (c.it.c > 1 ? ' × ' + c.it.c : '') : ''}${c.it && c.oro ? ' + ' : ''}${c.oro ? c.oro.toLocaleString('es-AR') + ' de oro' : ''}</b><small>De ${esc(c.de)}</small></span><button class="btn chico" data-carta="${i}">Retirar</button></div>`).join('') : '<p class="nota">No tenés cartas. Acá queda lo que no te entra en la mochila y lo que te mandan otros.</p>'}
      <h3>Mandar una carta</h3><p class="nota">${deMochila != null ? `Va: <b>${esc(O.nombreObjeto(d.inv[deMochila]))}</b>.` : 'Tocá algo de tu mochila para mandarlo, o mandá solo oro.'} Cuesta 100 de oro.</p>
      <div class="fila"><input id="co-para" maxlength="14" placeholder="Nombre del personaje" value="${esc(this.coPara || '')}"><input id="co-oro" type="number" min="0" inputmode="numeric" placeholder="Oro" value="${this.coOro || ''}"></div>
      <div class="acciones"><button class="btn chico" id="co-enviar">Mandar</button></div></div>`;
    this.marco('Baúl de la cuenta', null, null, null, cuerpo + cartas, 'baul', []);
    this.el.querySelectorAll('[data-carta]').forEach(b => b.onclick = () => this.ctx.mandar({ t: 'correo', a: 'tomar', k: +b.dataset.carta }));
    const cp = $('#co-para', this.el), co = $('#co-oro', this.el);
    for (const x of [cp, co]) x.addEventListener('keydown', e => e.stopPropagation());
    cp.oninput = () => { this.coPara = cp.value; }; co.oninput = () => { this.coOro = co.value; };
    $('#co-enviar', this.el).onclick = () => { this.ctx.mandar({ t: 'correo', a: 'enviar', para: cp.value, oro: +co.value || 0, i: deMochila ?? '' }); this.sel = null; };
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
