// Mapa grande: se abre tocando el minimapa. Muestra atalayas, lugares, campamentos, zonas de monstruos con su nivel,
// tu grupo, tus misiones y vos. Lo que todavía no descubriste aparece como «?». Se agranda con dos dedos (o la ruedita)
// y se arrastra para mirar otra parte.
import * as R from './reglas.js';

const $ = (s, r = document) => r.querySelector(s);
const ZONAS = Object.values(R.MONSTRUOS).filter(m => m.zona && !m.soloEvento && !m.pozo);

export class Mapa {
  constructor(datos) {
    this.datos = datos; this.region = 'paramo';
    const el = document.createElement('div'); el.id = 'mapa'; el.className = 'caja'; el.hidden = true;
    el.innerHTML = `<header><b>Mapa</b><span class="tabs"><button data-r="paramo" class="on">Páramo del Luto</button><button data-r="costa">Costa de la Sal Negra</button></span><span class="zoom"><button data-z="-1" aria-label="Alejar">−</button><button data-z="1" aria-label="Acercar">+</button><button data-z="0">Yo</button></span><button class="x" aria-label="Cerrar">✕</button></header>
      <canvas></canvas><p class="nota leyenda"><span class="ley mi">! misión</span><span class="ley yo">▲ vos</span><span class="ley gr">● tu grupo</span><span class="ley at">◆ atalaya</span><span class="ley ca">✦ campamento</span><span class="ley zn">○ monstruos (nivel)</span></p>`;
    document.getElementById('hud').appendChild(el); this.el = el;
    el.addEventListener('pointerdown', e => e.stopPropagation());
    $('.x', el).onclick = () => this.cerrar();
    el.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { this.region = b.dataset.r; this.vista = null; this.dibujar(); });
    el.querySelectorAll('[data-z]').forEach(b => b.onclick = () => { const z = +b.dataset.z; if (!z) { const d = this.datos(); this.vista = { ...this.vista, x: d.yo.x, z: d.yo.z, zoom: Math.max(2.5, this.vista?.zoom || 1) }; } else this.acercar(z > 0 ? 1.5 : 1 / 1.5); this.dibujar(); });
    this.cv = $('canvas', el); this.c = this.cv.getContext('2d');
    // Arrastrar para mover, dos dedos o ruedita para acercar.
    const dedos = new Map(); let dist0 = 0, zoom0 = 1;
    this.cv.addEventListener('pointerdown', e => { this.cv.setPointerCapture(e.pointerId); dedos.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (dedos.size === 2) { const [a, b] = [...dedos.values()]; dist0 = Math.hypot(a.x - b.x, a.y - b.y); zoom0 = this.vista.zoom; } });
    this.cv.addEventListener('pointermove', e => {
      const p = dedos.get(e.pointerId); if (!p) return;
      if (dedos.size === 1) { this.vista.x -= (e.clientX - p.x) / this.k; this.vista.z -= (e.clientY - p.y) / this.k; }
      p.x = e.clientX; p.y = e.clientY;
      if (dedos.size === 2) { const [a, b] = [...dedos.values()]; this.vista.zoom = Math.max(1, Math.min(8, zoom0 * Math.hypot(a.x - b.x, a.y - b.y) / (dist0 || 1))); }
      this.dibujar();
    });
    const fin = e => dedos.delete(e.pointerId);
    this.cv.addEventListener('pointerup', fin); this.cv.addEventListener('pointercancel', fin);
    this.cv.addEventListener('wheel', e => { e.preventDefault(); this.acercar(e.deltaY < 0 ? 1.2 : 1 / 1.2); this.dibujar(); }, { passive: false });
    addEventListener('resize', () => { if (!this.el.hidden) this.dibujar(); });
  }
  abierto() { return !this.el.hidden; }
  acercar(f) { this.vista.zoom = Math.max(1, Math.min(8, this.vista.zoom * f)); }
  abrir() {
    const d = this.datos(); if (!d) return;
    const region = d.yo.x > 400 ? 'costa' : 'paramo';
    if (region !== this.region || !this.vista) { this.region = region; this.vista = null; }
    this.el.hidden = false; this.dibujar();
  }
  cerrar() { this.el.hidden = true; }

  dibujar() {
    const d = this.datos(); if (!d) return;
    const costaVista = d.atalayas.includes(5);
    this.el.querySelectorAll('[data-r]').forEach(b => { b.classList.toggle('on', b.dataset.r === this.region); b.hidden = b.dataset.r === 'costa' && !costaVista; });
    const caja = this.cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    const W = Math.max(200, Math.round(caja.width)), H = Math.max(200, Math.round(caja.height));
    this.cv.width = W * dpr; this.cv.height = H * dpr;
    const c = this.c; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    const costa = this.region === 'costa';
    const medio = costa ? R.COSTA.r + 12 : R.MUNDO;
    if (!this.vista) this.vista = { x: costa ? R.COSTA.x : 0, z: 0, zoom: 1 };
    const V = this.vista, base = costa ? R.COSTA.x : 0;
    V.x = Math.max(base - medio, Math.min(base + medio, V.x)); V.z = Math.max(-medio, Math.min(medio, V.z));
    const cx = V.x, cz = V.z, k = Math.min(W, H) / 2 / medio * 0.96 * V.zoom, ox = W / 2, oz = H / 2;
    this.k = k;
    const P = (x, z) => [ox + (x - cx) * k, oz + (z - cz) * k];
    const dentro = (x, z) => Math.abs(x - base) <= medio + 5 && Math.abs(z) <= medio + 5;
    const grande = V.zoom >= 2;
    // Fondo: tierra gastada y borde.
    c.fillStyle = '#16120f';
    if (costa) { c.beginPath(); c.arc(...P(R.COSTA.x, 0), R.COSTA.r * k, 0, 7); c.fill(); c.strokeStyle = '#3a5a6a'; c.lineWidth = 3; c.stroke(); }
    else { const [x0, z0] = P(-R.MUNDO, -R.MUNDO); c.fillRect(x0, z0, R.MUNDO * 2 * k, R.MUNDO * 2 * k); c.strokeStyle = '#4a4038'; c.lineWidth = 2; c.strokeRect(x0, z0, R.MUNDO * 2 * k, R.MUNDO * 2 * k); }
    c.strokeStyle = 'rgba(216,207,189,.05)'; c.lineWidth = 1;
    for (let g = -150; g <= 150; g += 25) { const [a] = P(base + g, 0), [, b] = P(0, g); c.beginPath(); c.moveTo(a, 0); c.lineTo(a, H); c.moveTo(0, b); c.lineTo(W, b); c.stroke(); }
    const fz = Math.min(1.5, 0.85 + V.zoom * 0.15), letra = (n, t = '600') => `${t} ${Math.round(n * fz)}px Spectral, Georgia, serif`;
    // Zonas de monstruos: verde si son fáciles para vos, amarillo parejas, rojo peligrosas.
    c.font = letra(11); c.textAlign = 'center'; c.textBaseline = 'middle';
    const zonas = [...ZONAS.map(m => ({ x: m.zona.x, z: m.zona.z, r: m.zona.r || m.zona.rmax, nv: m.nivel, jefe: m.jefe, nombre: m.nombre })),
      ...R.CAMPAMENTOS.map(cp => ({ x: cp.x, z: cp.z, r: 10, nv: Math.max(...cp.mons.map(([t]) => R.MONSTRUOS[t].nivel)) }))];
    for (const z of zonas) {
      if (!dentro(z.x, z.z)) continue;
      const dif = z.nv - d.nivel, col = dif <= -5 ? '111,174,79' : dif <= 5 ? '233,195,122' : '214,74,58';
      const [x, y] = P(z.x, z.z);
      if (z.jefe) { c.fillStyle = `rgba(${col},.9)`; c.font = '14px serif'; c.fillText('☠', x, y); c.font = letra(11); continue; }
      c.fillStyle = `rgba(${col},.13)`; c.strokeStyle = `rgba(${col},.45)`; c.lineWidth = 1;
      c.beginPath(); c.arc(x, y, Math.max(6, z.r * k), 0, 7); c.fill(); c.stroke();
      c.fillStyle = `rgba(${col},.9)`; c.fillText('Nv ' + z.nv, x, y + Math.max(6, z.r * k) - 8);
    }
    // Lugares y campamentos.
    for (const l of R.MAPA.lugares) {
      if (!dentro(l.x, l.z) || R.PUEBLOS.some(p => p.nombre === l.nombre)) continue;
      const visto = d.lugares.includes(l.nombre), [x, y] = P(l.x, l.z);
      if (l.campamento) {
        const S = R.SANTUARIOS[R.CAMPAMENTOS.find(cp => cp.nombre === l.nombre)?.santuario];
        c.fillStyle = visto ? (S?.color || '#e9c37a') : 'rgba(216,207,189,.35)'; c.font = '15px serif'; c.fillText('✦', x, y); c.font = letra(11);
      }
      c.fillStyle = visto ? '#d8cfbd' : 'rgba(216,207,189,.35)';
      c.strokeStyle = 'rgba(0,0,0,.8)'; c.lineWidth = 3;
      const t = visto ? l.nombre : '?'; c.strokeText(t, x, y + (l.campamento ? 13 : 0)); c.fillText(t, x, y + (l.campamento ? 13 : 0));
    }
    // Atalayas: las encendidas brillan.
    c.font = `700 ${Math.round(12 * fz)}px "Spectral SC", Spectral, Georgia, serif`;
    R.PUEBLOS.forEach((p, i) => {
      if (!dentro(p.x, p.z)) return;
      const ok = d.atalayas.includes(i), [x, y] = P(p.x, p.z);
      if (ok) { const g = c.createRadialGradient(x, y, 0, x, y, 16); g.addColorStop(0, 'rgba(255,150,70,.7)'); g.addColorStop(1, 'rgba(255,150,70,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 16, 0, 7); c.fill(); }
      c.fillStyle = ok ? '#ffb070' : '#6a625a'; c.save(); c.translate(x, y); c.rotate(Math.PI / 4); c.fillRect(-5, -5, 10, 10); c.restore();
      c.strokeStyle = 'rgba(0,0,0,.85)'; c.lineWidth = 3; c.fillStyle = ok ? '#f0d0a0' : '#8a8278';
      c.strokeText(p.nombre, x, y - 14); c.fillText(p.nombre, x, y - 14);
    });
    // Portal de la Senda Negra.
    for (const n of d.sendas) { if (!dentro(n.x, n.z)) continue; const [x, y] = P(n.x, n.z); c.fillStyle = '#b07ad8'; c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); }
    // Misiones activas: «!» dorado (o «✓» verde si ya está para cobrar), con el nombre al acercar.
    for (const m of d.misiones || []) {
      if (!dentro(m.x, m.z)) continue;
      const [x, y] = P(m.x, m.z);
      c.fillStyle = m.lista ? '#7fe07a' : '#ffd24a'; c.strokeStyle = '#000'; c.lineWidth = 3;
      c.beginPath(); c.arc(x, y - 16, 9, 0, 7); c.fillStyle = 'rgba(10,8,8,.85)'; c.fill(); c.strokeStyle = m.lista ? '#7fe07a' : '#ffd24a'; c.lineWidth = 2; c.stroke();
      c.fillStyle = m.lista ? '#7fe07a' : '#ffd24a'; c.font = '700 13px Spectral, Georgia, serif'; c.fillText(m.lista ? '✓' : '!', x, y - 15);
      if (grande) { c.font = letra(11, 'italic 600'); c.strokeStyle = 'rgba(0,0,0,.85)'; c.lineWidth = 3; c.strokeText(m.nombre, x, y - 32); c.fillText(m.nombre, x, y - 32); }
    }
    // Grupo y vos.
    for (const g of d.grupo) { if (!dentro(g.x, g.z)) continue; const [x, y] = P(g.x, g.z); c.fillStyle = '#8fd16e'; c.beginPath(); c.arc(x, y, 4.5, 0, 7); c.fill(); }
    if (dentro(d.yo.x, d.yo.z)) {
      const [x, y] = P(d.yo.x, d.yo.z);
      c.save(); c.translate(x, y); c.rotate(-d.yo.dir + Math.PI);
      c.fillStyle = '#fff'; c.strokeStyle = '#000'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -9); c.lineTo(6, 7); c.lineTo(0, 3); c.lineTo(-6, 7); c.closePath(); c.stroke(); c.fill(); c.restore();
    } else {
      c.fillStyle = 'rgba(216,207,189,.7)'; c.font = 'italic 13px Spectral, Georgia, serif'; c.fillText(R.enPozo(d.yo.x, d.yo.z) ? 'Estás en el Pozo de las Almas' : R.enBastion(d.yo.x, d.yo.z) ? 'Estás en el Bastión Caído' : 'Estás en otra región', W / 2, 18);
    }
  }
}
