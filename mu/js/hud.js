// La pantalla de juego: vida, energía, experiencia, habilidades, grupo, puntos, avisos.
import * as R from './reglas.js';

const IC = {
  atk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 19 19 5M14 5h5v5M4 15l5 5M7 17l-3 3"/></svg>',
  giro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4a8 8 0 1 1-8 8M12 8a4 4 0 1 1-4 4"/></svg>',
  muralla: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3 20 6v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/></svg>',
  embestida: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h13M12 6l6 6-6 6M20 5v14"/></svg>',
  pot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M9 3h6M10 3v5l-4 6a5 5 0 0 0 4 7h4a5 5 0 0 0 4-7l-4-6V3"/></svg>',
};
const $ = (sel, raiz = document) => raiz.querySelector(sel);

export class Hud {
  constructor(cb) {
    this.cb = cb; this.yo = null; this.lugar = ''; this.toastsVivos = 0;
    const h = document.getElementById('hud');
    h.innerHTML = `
      <div class="caja arriba-izq"><div id="h-yo"><b id="h-nombre"></b><span id="h-nivel"></span></div><div id="h-grupo"></div></div>
      <div id="h-obj" class="caja" hidden><b id="h-obj-nombre"></b><div class="barra"><i id="h-obj-vida"></i></div></div>
      <div id="h-jefe" hidden><b id="h-jefe-nombre"></b><div class="barra"><i id="h-jefe-vida"></i></div></div>
      <div class="arriba-der"><canvas id="h-mini" width="140" height="140"></canvas><span id="h-lugar"></span><span id="h-ping"></span></div>
      <div class="abajo">
        <div class="orbe vida"><i id="h-vida"></i><span id="h-vida-n"></span></div>
        <div class="expw"><span id="h-exp-n"></span><div class="exp"><i id="h-exp"></i></div></div>
        <div class="orbe mana"><i id="h-mana"></i><span id="h-mana-n"></span></div>
      </div>
      <button id="b-atk" class="hb grande" aria-label="Atacar al más cercano">${IC.atk}</button>
      ${R.HABILIDADES.map((x, i) => `<button id="b-h${i}" class="hb hab h${i}" aria-label="${x.nombre}">${IC[x.id]}<em></em></button>`).join('')}
      <button id="b-pot" class="hb pot" aria-label="Poción">${IC.pot}<em></em><small id="h-pot">3</small></button>
      <button id="b-puntos" class="boton-puntos" hidden>Puntos <b id="h-puntos">0</b></button>
      <div id="stick" hidden><i></i></div>
      <div id="toasts" aria-live="polite"></div>
      <div id="titulo-lugar"></div>
      <div id="h-muerte" hidden><b>Caíste</b><span id="h-muerte-n"></span></div>
      <div id="h-dolor"></div>
      <div id="menu-jug" class="caja menu" hidden></div>
      <div id="modal" class="caja modal" hidden></div>`;
    this.el = h;
    const tocar = (id, f) => $(id).addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); f(); });
    tocar('#b-atk', () => cb.atacar());
    R.HABILIDADES.forEach((_, i) => tocar('#b-h' + i, () => cb.hab(i)));
    tocar('#b-pot', () => cb.pocion());
    tocar('#b-puntos', () => this.panelPuntos());
    h.addEventListener('pointerdown', e => { if (e.target.closest('.caja, button')) e.stopPropagation(); });
    this.mini = $('#h-mini').getContext('2d');
  }

  mostrar(datos) { this.el.hidden = false; $('#h-nombre').textContent = datos.nombre; }

  actualizar(yo, extra) {
    this.yo = yo;
    $('#h-nivel').textContent = `Guardián · Nv ${yo.nivel}`;
    $('#h-vida').style.height = (yo.hp / yo.maxHp * 100) + '%'; $('#h-vida-n').textContent = yo.hp;
    $('#h-mana').style.height = (yo.mp / yo.maxMp * 100) + '%'; $('#h-mana-n').textContent = yo.mp;
    const pe = yo.exp / yo.sig * 100; $('#h-exp').style.width = pe + '%'; $('#h-exp-n').textContent = `${pe.toFixed(1)}%`;
    R.HABILIDADES.forEach((x, i) => {
      const b = $('#b-h' + i), cd = yo.cds[i];
      b.querySelector('em').style.setProperty('--k', cd > 0 ? cd / x.cd : 0);
      b.classList.toggle('sin-mp', yo.mp < x.mp);
    });
    $('#b-pot em').style.setProperty('--k', yo.pot < 1 ? yo.potT / R.POCION.recarga : 0); $('#h-pot').textContent = yo.pot;
    $('#b-puntos').hidden = !yo.puntos; $('#h-puntos').textContent = yo.puntos;
    if (this.panelAbierto) this.panelPuntos(true);
    $('#h-muerte').hidden = !(yo.muerto > 0); if (yo.muerto > 0) $('#h-muerte-n').textContent = `Volvés a la Atalaya en ${Math.ceil(yo.muerto)}…`;
    // Grupo
    const g = $('#h-grupo');
    if (!yo.grupo) g.innerHTML = '';
    else g.innerHTML = yo.grupo.map(([id, n, hp, nv, lider]) => `<div class="miembro"><span>${lider ? '♛ ' : ''}${n} <small>Nv ${nv}</small></span><div class="barra chica"><i style="width:${hp}%"></i></div></div>`).join('')
      + `<button class="link" id="b-salir">Salir del grupo</button>`;
    const bs = $('#b-salir'); if (bs) bs.onclick = () => this.cb.salirGrupo();
    // Objetivo y jefe
    const o = extra.objetivo;
    $('#h-obj').hidden = !o;
    if (o) { $('#h-obj-nombre').textContent = `${o.nombre} · Nv ${o.nivel}`; $('#h-obj-vida').style.width = o.hp + '%'; }
    const j = extra.jefe;
    $('#h-jefe').hidden = !j;
    if (j) { $('#h-jefe-nombre').textContent = j.nombre; $('#h-jefe-vida').style.width = j.hp + '%'; }
    $('#h-ping').textContent = extra.ping ? `${extra.ping} ms` : '';
    if (extra.lugar !== this.lugar) { this.lugar = extra.lugar; $('#h-lugar').textContent = extra.lugar; this.tituloLugar(extra.lugar); }
    this.dibujarMini(extra.mini);
  }

  tituloLugar(n) {
    const t = $('#titulo-lugar'); t.textContent = n; t.classList.remove('ver'); void t.offsetWidth; t.classList.add('ver');
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

  toast(texto, tipo = '') {
    const t = document.createElement('div'); t.className = 'toast ' + tipo; t.textContent = texto;
    $('#toasts').appendChild(t); setTimeout(() => t.remove(), tipo === 'grande' ? 4200 : 3200);
  }
  exp(cant) { this.toast(`+${cant} experiencia`, 'exp'); }
  dolor() { const d = $('#h-dolor'); d.classList.remove('ver'); void d.offsetWidth; d.classList.add('ver'); }

  stick(ver, x0, y0, kx = 0, ky = 0) {
    const s = $('#stick'); s.hidden = !ver; if (!ver) return;
    s.style.left = x0 + 'px'; s.style.top = y0 + 'px'; s.firstElementChild.style.transform = `translate(${kx * 38}px, ${ky * 38}px)`;
  }

  invitacion(de, nombre, nivel) {
    const m = $('#modal'); this.panelAbierto = false; this.clavePanel = null;
    m.innerHTML = `<p><b>${esc(nombre)}</b> (Nv ${nivel}) te invita a su grupo.</p><p class="nota">La experiencia se reparte entre los que estén cerca, con un 10% extra por cada compañero.</p>
      <div class="fila"><button class="btn" id="m-si">Unirme</button><button class="btn sec" id="m-no">No, gracias</button></div>`;
    m.hidden = false;
    $('#m-si').onclick = () => { m.hidden = true; this.cb.aceptar(de); };
    $('#m-no').onclick = () => { m.hidden = true; this.cb.rechazar(de); };
  }

  menuJugador(e, x, y) {
    const m = $('#menu-jug');
    m.innerHTML = `<b>${esc(e.nombre)}</b><small>Nv ${e.nivel}</small><button class="btn" id="mj-inv">Invitar al grupo</button><button class="btn sec" id="mj-no">Cerrar</button>`;
    m.style.left = Math.min(innerWidth - 190, Math.max(10, x - 90)) + 'px'; m.style.top = Math.min(innerHeight - 150, Math.max(10, y - 140)) + 'px';
    m.hidden = false;
    $('#mj-inv').onclick = () => { m.hidden = true; this.cb.invitar(e.id); };
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
