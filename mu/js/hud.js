// La pantalla de juego: vida, energía, experiencia, habilidades, grupo, puntos, avisos.
import * as R from './reglas.js';
import * as C from './clases.js';
import { iconoHab, iconoAtaque, iconoObjeto, iconoBoton } from './iconos.js';
import { foto, retrato } from './miniaturas.js';

const IC = {
  atk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 19 19 5M14 5h5v5M4 15l5 5M7 17l-3 3"/></svg>',
  giro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4a8 8 0 1 1-8 8M12 8a4 4 0 1 1-4 4"/></svg>',
  muralla: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3 20 6v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/></svg>',
  embestida: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h13M12 6l6 6-6 6M20 5v14"/></svg>',
  mochila: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 8h12l1 12H5zM9 8V6a3 3 0 0 1 6 0v2M9 13h6"/></svg>',
  area: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4a8 8 0 1 1-8 8M12 8a4 4 0 1 1-4 4"/></svg>',
  golpe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h13M12 6l6 6-6 6M20 5v14"/></svg>',
  proyectil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 20 4M14 4h6v6M4 14l2 2M8 18l-2-2"/></svg>',
  lluvia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 3l-2 6M12 3l-2 6M18 3l-2 6M8 13l-2 6M14 13l-2 6M20 13l-2 6"/></svg>',
  buff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3 20 6v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/></svg>',
  cura: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  eter: '<svg viewBox="0 0 24 24" fill="none" stroke="#6f8fd8" stroke-width="2" stroke-linejoin="round"><path d="M9 3h6M10 3v5l-4 6a5 5 0 0 0 4 7h4a5 5 0 0 0 4-7l-4-6V3"/></svg>',
  pot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M9 3h6M10 3v5l-4 6a5 5 0 0 0 4 7h4a5 5 0 0 0 4-7l-4-6V3"/></svg>',
};
const $ = (sel, raiz = document) => raiz.querySelector(sel);

export class Hud {
  constructor(cb) {
    this.cb = cb; this.yo = null; this.lugar = ''; this.toastsVivos = 0;
    const h = document.getElementById('hud');
    h.innerHTML = `
      <div class="caja arriba-izq"><div id="h-yo"><b id="h-nombre"></b><span id="h-nivel"></span><span id="h-buffs"></span></div><div id="h-grupo"></div><div id="h-mis"></div></div>
      <button id="b-mochila" class="hb mochila" aria-label="Personaje y mochila">${iconoBoton('mochila', '#5a3a20')}</button>
      <div id="h-obj" class="caja" hidden><b id="h-obj-nombre"></b><div class="barra"><i id="h-obj-vida"></i></div><small id="h-obj-desc"></small><small id="h-obj-elem"></small></div>
      <div id="h-asedio" hidden></div>
      <div id="h-jefe" hidden><b id="h-jefe-nombre"></b><div class="barra"><i id="h-jefe-vida"></i></div></div>
      <div class="arriba-der"><canvas id="h-mini" width="140" height="140"></canvas><span id="h-lugar"></span><span id="h-evento"></span><span id="h-ping"></span></div>
      <div class="abajo">
        <div class="orbe vida"><i id="h-vida"></i><span id="h-vida-n"></span></div>
        <div class="expw"><span id="h-ganancia"></span><span id="h-exp-n"></span><div class="exp"><i id="h-exp"></i></div></div>
        <div class="orbe mana"><i id="h-mana"></i><span id="h-mana-n"></span></div>
      </div>
      <button id="b-atk" class="hb grande" aria-label="Atacar al más cercano"><span class="ic"></span></button>
      ${[0, 1, 2, 3].map(i => `<button id="b-h${i}" class="hb hab h${i} vacia"><span class="ic"></span><em></em><b class="cd"></b><i class="mp"></i></button>`).join('')}
      <button id="b-pot" class="hb pot" aria-label="Poción de Sangre"><span class="ic3">${iconoObjeto('pocion')}</span><small id="h-pot" class="cuenta">0</small></button>
      <button id="b-eter" class="hb eter" aria-label="Poción de Éter"><span class="ic3">${iconoObjeto('eter')}</span><small id="h-eter" class="cuenta">0</small></button>
      <button id="b-puntos" class="boton-puntos" hidden>Puntos <b id="h-puntos">0</b></button>
      <div id="stick" hidden><i></i></div>
      <div id="toasts" aria-live="polite"></div>
      <div id="h-botin"></div>
      <div id="titulo-lugar"><b></b><small></small></div>
      <div id="h-muerte" hidden><b>Caíste</b><span id="h-muerte-n"></span></div>
      <div id="h-dolor"></div>
      <div id="menu-jug" class="caja menu" hidden></div>
      <div id="modal" class="caja modal" hidden></div>`;
    this.el = h;
    const tocar = (id, f) => $(id).addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); f(); });
    tocar('#b-atk', () => cb.atacar());
    [0, 1, 2, 3].forEach(i => tocar('#b-h' + i, () => {
      const h = this.habs[i], b = $('#b-h' + i);
      if (!h) return cb.personaje('habilidades');
      if ((this.yo?.cds?.[h.id] || 0) > 0) return;
      if (this.yo && this.yo.mp < h.mp) { b.classList.remove('falta'); void b.offsetWidth; b.classList.add('falta'); return this.toast('No te alcanza la energía.'); }
      b.classList.remove('usa'); void b.offsetWidth; b.classList.add('usa');
      cb.hab(h.id);
    }));
    tocar('#b-atk', () => { const b = $('#b-atk'); b.classList.remove('usa'); void b.offsetWidth; b.classList.add('usa'); });
    tocar('#b-pot', () => cb.pocion());
    tocar('#b-eter', () => cb.eter());
    tocar('#b-puntos', () => cb.personaje('atributos'));
    tocar('#b-mochila', () => cb.personaje('equipo'));
    this.habs = [];
    h.addEventListener('pointerdown', e => { if (e.target.closest('.caja, button')) e.stopPropagation(); });
    this.mini = $('#h-mini').getContext('2d');
    $('#h-mis').addEventListener('click', () => $('#h-mis').classList.toggle('grande'));
    tocar('#h-mini', () => cb.mapa());
  }

  // Cambia los dibujos por fotos 3D cuando están listas: pociones y retrato del personaje.
  ponerFotos() {
    if (this.fotosOk) return;
    const p = foto({ b: 'pocion' }), e = foto({ b: 'eter' }), r = this.clase && retrato(this.clase);
    if (p && !this.fp) { this.fp = 1; $('#b-pot .ic3').innerHTML = `<img src="${p}" alt="">`; }
    if (e && !this.fe) { this.fe = 1; $('#b-eter .ic3').innerHTML = `<img src="${e}" alt="">`; }
    if (r && !this.fr) { this.fr = 1; $('#b-mochila').innerHTML = `<img src="${r}" alt="">`; }
    this.fotosOk = this.fp && this.fe && this.fr;
  }

  mostrar(datos) { this.el.hidden = false; $('#h-nombre').textContent = datos.nombre; if (this.clase !== datos.clase) { this.fr = 0; this.fotosOk = false; $('#b-mochila').innerHTML = iconoBoton('mochila', '#5a3a20'); } this.clase = datos.clase; $('#b-atk .ic').innerHTML = iconoAtaque(datos.clase); }

  // Pone las habilidades aprendidas en los 4 botones.
  ponerHabilidades(d) {
    const ids = C.botones(d);
    this.habs = ids.map(id => C.buscarHab(d.clase, id));
    [0, 1, 2, 3].forEach(i => {
      const b = $('#b-h' + i), h = this.habs[i];
      b.classList.toggle('vacia', !h);
      if (!h) { b.dataset.h = ''; b.querySelector('.ic').innerHTML = '<span class="mas">+</span>'; b.querySelector('.mp').textContent = ''; b.setAttribute('aria-label', 'Lugar libre: aprendé una habilidad'); return; }
      b.setAttribute('aria-label', h.nombre); b.classList.toggle('def', !!h.def);
      if (b.dataset.h !== h.id) { b.dataset.h = h.id; b.querySelector('.ic').innerHTML = iconoHab(d.clase, h.id); }
      b.querySelector('.mp').textContent = h.mp || '';
    });
  }

  actualizar(yo, extra) {
    this.yo = yo;
    $('#h-nivel').textContent = `${C.CLASES[yo.clase]?.nombre || ''} · Nv ${yo.nivel}`;
    $('#h-vida').style.height = (yo.hp / yo.maxHp * 100) + '%'; $('#h-vida-n').textContent = yo.hp;
    $('#h-mana').style.height = (yo.mp / yo.maxMp * 100) + '%'; $('#h-mana-n').textContent = yo.mp;
    const pe = yo.exp / yo.sig * 100; $('#h-exp').style.width = pe + '%'; $('#h-exp-n').textContent = `${pe.toFixed(1)}%`;
    this.habs.forEach((x, i) => {
      const b = $('#b-h' + i), cd = yo.cds[x.id] || 0;
      b.querySelector('em').style.setProperty('--k', cd > 0 ? cd / x.cd : 0);
      b.querySelector('.cd').textContent = cd > 0 ? (cd < 1 ? cd.toFixed(1) : Math.ceil(cd)) : '';
      b.classList.toggle('sin-mp', yo.mp < x.mp); b.classList.toggle('lista', !(cd > 0) && yo.mp >= x.mp);
    });
    $('#h-pot').textContent = yo.pociones; $('#h-eter').textContent = yo.eteres;
    $('#b-pot').classList.toggle('sin', !yo.pociones); $('#b-eter').classList.toggle('sin', !yo.eteres);
    this.ponerFotos();
    const libres = extra.puntosHab || 0;
    $('#b-puntos').hidden = !yo.puntos && !libres; $('#h-puntos').textContent = yo.puntos + libres;
    const bf = yo.buffs?.map(b => b[0]).join(',') || '';
    if (bf !== this.bfAntes) { this.bfAntes = bf; $('#h-buffs').textContent = yo.buffs?.length ? '✦ ' + yo.buffs.map(b => C.buscarHab(yo.clase, b[0])?.nombre || b[0]).join(' · ') : ''; }
    $('#h-muerte').hidden = !(yo.muerto > 0); if (yo.muerto > 0) $('#h-muerte-n').textContent = `Volvés a la Atalaya en ${Math.ceil(yo.muerto)}…`;
    // Grupo
    const g = $('#h-grupo'), gk = JSON.stringify(yo.grupo);
    if (gk === this.gk) {} else if (!yo.grupo) { g.innerHTML = ''; this.gk = gk; }
    else this.gk = gk, g.innerHTML = yo.grupo.map(([id, n, hp, nv, lider]) => `<div class="miembro"><span>${lider ? '♛ ' : ''}${n} <small>Nv ${nv}</small></span><div class="barra chica"><i style="width:${hp}%"></i></div></div>`).join('')
      + `<button class="link" id="b-salir">Salir del grupo</button>`;
    const bs = $('#b-salir'); if (bs) bs.onclick = () => this.cb.salirGrupo();
    // Objetivo y jefe
    const o = extra.objetivo;
    $('#h-obj').hidden = !o;
    if (o) { $('#h-obj-nombre').textContent = `${o.nombre} · Nv ${o.nivel}`; $('#h-obj-vida').style.width = o.hp + '%'; $('#h-obj-desc').textContent = o.desc || '';
      const E = R.ELEMENTOS, ek = (o.debil || '') + (o.resiste || '');
      if (ek !== this.ekAntes) { this.ekAntes = ek; $('#h-obj-elem').innerHTML = [o.debil ? `Débil a <b style="color:${E[o.debil].color}">${E[o.debil].nombre}</b>` : '', o.resiste ? `resiste <b style="color:${E[o.resiste].color}">${E[o.resiste].nombre}</b>` : ''].filter(Boolean).join(' · '); } }
    const j = extra.jefe;
    $('#h-jefe').hidden = !j;
    if (j) { $('#h-jefe-nombre').textContent = j.nombre; $('#h-jefe-vida').style.width = j.hp + '%'; }
    // Marcador del asedio
    const as = yo.asedio, ak = JSON.stringify(as);
    if (ak !== this.ak) {
      this.ak = ak; const el = $('#h-asedio'); el.hidden = !as;
      if (as) {
        el.innerHTML = `<b>Asedio del Bastión</b><small>${as.dueno ? `Altar: <span style="color:${as.lista.find(x => x[0] === as.dueno)?.[3] || '#d4a24a'}">${esc(as.dueno)}</span>` : as.dueno === '' ? '<span class="peligro">Altar disputado</span>' : 'Altar libre'}</small>
          ${as.lista.map(([n, pts, sim, col]) => `<div class="as-fila"><span style="color:${col}">${sim}&#xFE0E; ${esc(n)}</span><b>${pts}</b></div>`).join('')}
          <button class="link" id="b-dejar-bastion">Dejar el Bastión</button>`;
        $('#b-dejar-bastion').onclick = () => this.cb.dejarBastion();
      }
    }
    $('#h-ping').textContent = extra.ping ? `${extra.ping} ms` : '';
    if (extra.lugar.nombre !== this.lugar) { this.lugar = extra.lugar.nombre; $('#h-lugar').textContent = extra.lugar.nombre; this.tituloLugar(extra.lugar.nombre, extra.lugar.frase); }
    const ev = yo.evt, he = $('#h-evento');
    if (!ev) he.textContent = '';
    else {
      const prox = ev[0][0] === '-', def = R.EVENTOS.find(x => x.id === ev[0].replace('-', '')), seg = Math.max(0, ev[1]);
      const mm = Math.floor(seg / 60) + ':' + String(Math.floor(seg % 60)).padStart(2, '0');
      he.textContent = prox ? `${def.nombre} en ${mm}` : `${def.nombre} · quedan ${mm}`;
      he.className = prox ? '' : 'activo ' + def.id;
    }
    $('.orbe.vida').classList.toggle('veneno', yo.veneno > 0);
    this.dibujarMini(extra.mini);
  }

  tituloLugar(n, frase) {
    const t = $('#titulo-lugar'); t.querySelector('b').textContent = n; t.querySelector('small').textContent = frase || '';
    t.classList.remove('ver'); void t.offsetWidth; t.classList.add('ver');
  }

  lore(despues) {
    const m = $('#modal'); this.panelAbierto = false;
    m.innerHTML = `<h2>El Sol Hondo se apagó</h2>${R.LORE.map(l => `<p>${l}</p>`).join('')}<button class="btn" id="m-despertar">Despertar</button>`;
    m.classList.add('lore'); m.hidden = false;
    $('#m-despertar').onclick = () => { m.hidden = true; m.classList.remove('lore'); despues?.(); };
  }

  // Regalo del día: los 7 días de la racha, el de hoy resaltado.
  diaria(m) {
    const caja = document.createElement('div'); caja.className = 'caja diaria';
    caja.innerHTML = `<b>Regalo del día</b><small>${m.racha === 1 ? 'Entrá mañana para seguir la racha.' : `Racha de ${m.racha} días. No la cortes.`}</small>
      <div class="dias">${R.DIARIA.map((_, i) => `<span class="${i + 1 < m.racha ? 'hecho' : i + 1 === m.racha ? 'hoy' : ''}">${i + 1}</span>`).join('')}</div>
      <p>+${m.oro.toLocaleString('es-AR')} de oro${m.cosas.length ? ' · ' + m.cosas.join(' · ') : ''}</p><button class="btn">Tomar</button>`;
    caja.addEventListener('pointerdown', e => e.stopPropagation());
    caja.querySelector('button').onclick = () => caja.remove();
    const poner = () => { if ($('#tuto') || !$('#modal').hidden) return setTimeout(poner, 1500); this.el.appendChild(caja); setTimeout(() => caja.remove(), 20000); };
    poner();
  }

  // Tutorial corto para personajes nuevos: un cartel por paso, señalando el botón del que habla.
  tutorial(clase) {
    const atr = { fue: 'Fuerza', agi: 'Agilidad', ene: 'Energía' }[C.CLASES[clase]?.atributo] || 'Fuerza';
    const pasos = [
      ['Moverte', 'Tocá cualquier parte de la pantalla y arrastrá el dedo: aparece un joystick invisible. También podés tocar el piso para caminar hasta ahí.', null],
      ['Atacar', 'Tocá un monstruo para pelear con él, o este botón para atacar al más cercano. Tu personaje sigue pegando solo.', '#b-atk'],
      ['Habilidades', 'Alrededor del ataque van tus habilidades. Tocá un «+» para aprender una nueva. Gastan energía (la bola azul) y tardan en recargarse.', '#b-h1'],
      ['Pociones', 'La roja cura vida, la azul devuelve energía. Comprá más con Úrsula la Boticaria, en la Atalaya.', '#b-pot'],
      ['Tu personaje', 'Tocá tu retrato para ver el equipo, la mochila, las habilidades y las misiones. Cuando subas de nivel, poné los puntos en ' + atr + ': de ahí sale tu daño.', '#b-mochila'],
      ['Mapa', 'Tocá el mapa chico para verlo grande. Con dos dedos lo acercás. Ahí ves las misiones, los campamentos y el nivel de cada zona.', '#h-mini'],
      ['Tu primera misión', 'La Viuda Marga está cerca del farol, abajo a la derecha. Hablale (tocala) y empezá por ahí. Si caés, despertás en la Atalaya. Suerte.', null],
    ];
    let i = 0;
    const caja = document.createElement('div'); caja.id = 'tuto'; caja.className = 'caja'; this.el.appendChild(caja);
    const aro = document.createElement('div'); aro.id = 'tuto-aro'; this.el.appendChild(aro);
    caja.addEventListener('pointerdown', e => e.stopPropagation());
    const fin = () => { caja.remove(); aro.remove(); };
    const mostrar = () => {
      const [t, txt, sel] = pasos[i];
      caja.innerHTML = `<small>${i + 1} de ${pasos.length}</small><b>${t}</b><p>${txt}</p><div class="fila"><button class="btn" id="tuto-sig">${i < pasos.length - 1 ? 'Siguiente' : 'A jugar'}</button>${i < pasos.length - 1 ? '<button class="btn sec" id="tuto-no">Saltar</button>' : ''}</div>`;
      const el = sel && $(sel);
      if (el) { const r = el.getBoundingClientRect(); Object.assign(aro.style, { left: r.left - 6 + 'px', top: r.top - 6 + 'px', width: r.width + 12 + 'px', height: r.height + 12 + 'px' }); aro.hidden = false; }
      else aro.hidden = true;
      $('#tuto-sig').onclick = () => { i++; if (i >= pasos.length) fin(); else mostrar(); };
      const no = $('#tuto-no'); if (no) no.onclick = fin;
    };
    mostrar();
  }

  dibujarMini({ yo, puntos }) {
    const c = this.mini, W = 140, k = W / 2 / 30;
    c.clearRect(0, 0, W, W);
    c.save(); c.beginPath(); c.arc(70, 70, 68, 0, 7); c.clip();
    c.fillStyle = 'rgba(12,12,14,.72)'; c.fillRect(0, 0, W, W);
    c.fillStyle = 'rgba(255,150,70,.5)'; const ax = 70 - yo.x * k, az = 70 - yo.z * k; c.beginPath(); c.arc(ax, az, R.PUEBLO.r * k, 0, 7); c.fill();
    for (const p of puntos) { c.fillStyle = p.c; c.beginPath(); c.arc(70 + (p.x - yo.x) * k, 70 + (p.z - yo.z) * k, p.r, 0, 7); c.fill(); }
    c.fillStyle = '#efe6d2'; c.beginPath(); c.arc(70, 70, 3.5, 0, 7); c.fill();
    c.restore();
    c.strokeStyle = 'rgba(216,207,189,.35)'; c.lineWidth = 1.5; c.beginPath(); c.arc(70, 70, 68, 0, 7); c.stroke();
  }

  // Avisos del medio: sin repetidos y como mucho dos a la vez (los importantes empujan a los comunes).
  toast(texto, tipo = '') {
    const ahora = Date.now(); this.vistos = this.vistos || new Map();
    if (ahora - (this.vistos.get(texto) || 0) < 5000) return;
    this.vistos.set(texto, ahora);
    const caja = $('#toasts');
    while (caja.children.length >= 2) caja.firstChild.remove();
    const t = document.createElement('div'); t.className = 'toast ' + tipo; t.textContent = texto;
    caja.appendChild(t); setTimeout(() => t.remove(), ['grande', 'anuncio', 'legendario', 'mitico'].includes(tipo) ? 4500 : 2600);
  }
  // Experiencia y oro de cada monstruo: no tapan la pantalla, se suman en una línea chiquita arriba de la barra.
  ganancia(exp, oro) {
    this.gan = this.gan || { exp: 0, oro: 0 }; this.gan.exp += exp || 0; this.gan.oro += oro || 0;
    const el = $('#h-ganancia'); el.textContent = [this.gan.exp ? `+${this.gan.exp.toLocaleString('es-AR')} exp` : '', this.gan.oro ? `+${this.gan.oro.toLocaleString('es-AR')} oro` : ''].filter(Boolean).join('   ');
    el.classList.remove('ver'); void el.offsetWidth; el.classList.add('ver');
    clearTimeout(this.ganT); this.ganT = setTimeout(() => { this.gan = { exp: 0, oro: 0 }; }, 2500);
  }
  exp(cant) { this.ganancia(cant, 0); }
  // Lo que levantás del piso: una lista corta abajo a la izquierda. Lo raro sale además en el medio.
  botin(texto, rareza) {
    const b = $('#h-botin'), d = document.createElement('div');
    d.className = 'r' + (rareza || 0); d.textContent = texto; b.appendChild(d);
    while (b.children.length > 4) b.firstChild.remove();
    setTimeout(() => d.remove(), 5000);
  }
  dolor() { const d = $('#h-dolor'); d.classList.remove('ver'); void d.offsetWidth; d.classList.add('ver'); }

  stick(ver, x0, y0, kx = 0, ky = 0) {
    const s = $('#stick'); s.hidden = !ver; if (!ver) return;
    s.style.left = x0 + 'px'; s.style.top = y0 + 'px'; s.firstElementChild.style.transform = `translate(${kx * 38}px, ${ky * 38}px)`;
  }

  seguimiento(lineas) {
    const k = JSON.stringify(lineas); if (k === this.misK) return; this.misK = k;
    $('#h-mis').innerHTML = lineas.length ? `<b class="mis-tit">Misiones <small>(tocá para ${'agrandar'})</small></b>` + lineas.map(l => `<div class="${l.lista ? 'lista' : ''}">${l.lista ? '✓ ' : '◦ '}${l.texto}${l.donde ? `<small class="donde">${l.donde}</small>` : ''}</div>`).join('') : '';
  }

  pedidoComercio(de, nombre) {
    const m = $('#modal'); this.panelAbierto = false;
    m.innerHTML = `<p><b>${esc(nombre)}</b> quiere comerciar con vos.</p><div class="fila"><button class="btn" id="m-si">Comerciar</button><button class="btn sec" id="m-no">No</button></div>`;
    m.hidden = false;
    $('#m-si').onclick = () => { m.hidden = true; this.cb.aceptarComercio(de); };
    $('#m-no').onclick = () => { m.hidden = true; };
  }

  invitacion(de, nombre, nivel) {
    const m = $('#modal'); this.panelAbierto = false; this.clavePanel = null;
    m.innerHTML = `<p><b>${esc(nombre)}</b> (Nv ${nivel}) te invita a su grupo.</p><p class="nota">La experiencia se reparte entre los que estén cerca, con un 10% extra por cada compañero.</p>
      <div class="fila"><button class="btn" id="m-si">Unirme</button><button class="btn sec" id="m-no">No, gracias</button></div>`;
    m.hidden = false;
    $('#m-si').onclick = () => { m.hidden = true; this.cb.aceptar(de); };
    $('#m-no').onclick = () => { m.hidden = true; this.cb.rechazar(de); };
  }

  invitacionHerm(de, h) {
    const m = $('#modal'); this.panelAbierto = false; this.clavePanel = null;
    m.innerHTML = `<p><b>${esc(de)}</b> te invita a la hermandad</p><p class="h-inv" style="color:${h.color}">${h.simbolo}&#xFE0E; ${esc(h.nombre)}</p><p class="nota">Vas a llevar su emblema, tener su chat (/h) y ganar más experiencia cazando cerca de tus hermanos.</p>
      <div class="fila"><button class="btn" id="m-si">Jurar</button><button class="btn sec" id="m-no">No, gracias</button></div>`;
    m.hidden = false;
    $('#m-si').onclick = () => { m.hidden = true; this.cb.aceptarHerm(h.nombre); };
    $('#m-no').onclick = () => { m.hidden = true; };
  }

  menuJugador(e, x, y) {
    const m = $('#menu-jug');
    m.innerHTML = `<b>${esc(e.nombre)}</b><small>${C.CLASES[e.tipo]?.nombre || ''} · Nv ${e.nivel}</small><button class="btn" id="mj-inv">Invitar al grupo</button>${this.cb.lideroHerm?.() && !e.herm ? '<button class="btn" id="mj-herm">Invitar a la hermandad</button>' : ''}<button class="btn" id="mj-com">Comerciar</button><button class="btn sec" id="mj-no">Cerrar</button>`;
    m.style.left = Math.min(innerWidth - 190, Math.max(10, x - 90)) + 'px'; m.style.top = Math.min(innerHeight - 150, Math.max(10, y - 140)) + 'px';
    m.hidden = false;
    $('#mj-inv').onclick = () => { m.hidden = true; this.cb.invitar(e.id); };
    $('#mj-com').onclick = () => { m.hidden = true; this.cb.comerciar(e.id); };
    const mh = $('#mj-herm'); if (mh) mh.onclick = () => { m.hidden = true; this.cb.invitarHerm(e.id); };
    $('#mj-no').onclick = () => { m.hidden = true; };
  }

  panelPuntos(refrescar) {
    const y = this.yo; if (!y) return;
    const m = $('#modal');
    if (refrescar && m.hidden) { this.panelAbierto = false; return; }
    const clave = [y.puntos, ...R.STATS.map(s => y[s])].join();
    if (refrescar && clave === this.clavePanel) return;
    this.clavePanel = clave; this.panelAbierto = true;
    const fila = s => `<div class="stat"><span>${R.NOMBRE_STAT[s]}</span><b>${y[s]}</b>
      <button class="mas" data-s="${s}" data-n="1" ${y.puntos ? '' : 'disabled'}>+1</button><button class="mas" data-s="${s}" data-n="5" ${y.puntos >= 5 ? '' : 'disabled'}>+5</button></div>`;
    m.innerHTML = `<h2>Atributos</h2><p class="nota">Puntos para repartir: <b>${y.puntos}</b></p>${R.STATS.map(fila).join('')}
      <p class="nota">Daño ${y.dmin}–${y.dmax} · Defensa ${y.def} · Vida ${y.maxHp} · Energía ${y.maxMp}</p>
      <p class="nota">Fuerza: más daño. Agilidad: pegás más rápido y defendés. Vitalidad: más vida. Energía: más energía para habilidades.</p>
      <button class="btn sec" id="m-cerrar">Cerrar</button>`;
    m.hidden = false;
    m.querySelectorAll('.mas').forEach(b => b.onclick = () => this.cb.punto(b.dataset.s, +b.dataset.n));
    $('#m-cerrar').onclick = () => { m.hidden = true; this.panelAbierto = false; };
  }
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
