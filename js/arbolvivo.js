// El árbol de tu vida: el tronco sos vos, cada rama es un área (Cuerpo, Mente…),
// cada ramita una subárea, y las hojas crecen con la savia que le diste.
// Se puede acercar, alejar y tocar una rama para ver su detalle.

const ArbolVivo = (() => {
  let zoom = null, elegida = null;
  const rad = g => (g * Math.PI) / 180;

  function hijasDe(id) {
    return E.areas.filter(a => a.id.startsWith(id + '/') && a.id.split('/').length === id.split('/').length + 1);
  }

  // Punto y dirección sobre una curva cuadrática.
  const bez = (a, c, b, t) => ({ x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x, y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y });
  const bezD = (a, c, b, t) => ({ x: 2 * (1 - t) * (c.x - a.x) + 2 * t * (b.x - c.x), y: 2 * (1 - t) * (c.y - a.y) + 2 * t * (b.y - c.y) });

  // Rama que se afina: un contorno relleno a lo largo de la curva.
  function ramaFina(a, c, b, w0, w1, color) {
    const izq = [], der = [];
    for (let k = 0; k <= 14; k++) {
      const t = k / 14, p = bez(a, c, b, t), d = bezD(a, c, b, t);
      const len = Math.hypot(d.x, d.y) || 1, w = (w0 + (w1 - w0) * t) / 2;
      const nx = -d.y / len, ny = d.x / len;
      izq.push(`${(p.x + nx * w).toFixed(1)} ${(p.y + ny * w).toFixed(1)}`);
      der.unshift(`${(p.x - nx * w).toFixed(1)} ${(p.y - ny * w).toFixed(1)}`);
    }
    return `<path d="M${izq.join(' L')} L${der.join(' L')}Z" fill="${color}"/>`;
  }

  // Copa de hojas: silueta oscura y luces encima (como el árbol de Hoy).
  function copa(x, y, r, pal, semilla, flor) {
    if (r <= 0) return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="#b89c74"/><path d="M${x.toFixed(1)} ${(y - 4).toFixed(1)} q2 -5 6 -6" stroke="${pal[1]}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    const n = 5 + Math.round(r / 12);
    const bolas = Array.from({ length: n }, (_, i) => {
      const a = semilla + i * 2.39996, d = i === 0 ? 0 : r * (0.35 + ((i * 7 + semilla) % 5) * 0.08);
      return { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d * 0.8, r: r * (i === 0 ? 0.62 : 0.42 + ((i * 3) % 4) * 0.05) };
    });
    let s = bolas.map(b => `<circle cx="${b.x.toFixed(1)}" cy="${(b.y + 2).toFixed(1)}" r="${(b.r + 3).toFixed(1)}" fill="${pal[0]}"/>`).join('');
    s += bolas.map((b, i) => `<circle cx="${(b.x - b.r * 0.2).toFixed(1)}" cy="${(b.y - b.r * 0.22).toFixed(1)}" r="${(b.r * 0.72).toFixed(1)}" fill="${pal[1 + (i % 2)]}" opacity=".9"/>`).join('');
    if (flor) bolas.slice(1, 4).forEach(b => { s += `<circle cx="${(b.x + b.r * 0.3).toFixed(1)}" cy="${(b.y - b.r * 0.4).toFixed(1)}" r="${Math.max(2.5, r * 0.08).toFixed(1)}" fill="${flor}"/>`; });
    return s;
  }

  function dibujar() {
    const esp = ESPECIES.find(e => e.id === E.especie) || ESPECIES[0];
    const pal = enOtono() || E.vitalidad < 30 ? PALETAS.otono : E.vitalidad < 60 ? PALETAS.cansado : esp.hojas;
    const tronco = esp.tronco || '#8a6a45';
    const oscuro = '#6e5236';
    const tops = E.areas.filter(a => !a.id.includes('/'));
    const nivel = nivelDe(E.savia).nivel;
    const base = { x: 300, y: 600 }, cima = { x: 300, y: 450 };
    const ancho = 30 + Math.min(nivel, 30) * 0.7;
    const caja = { x0: 300, x1: 300, y0: 600, y1: 640 };
    const ver = (x, y, r = 0) => { caja.x0 = Math.min(caja.x0, x - r); caja.x1 = Math.max(caja.x1, x + r); caja.y0 = Math.min(caja.y0, y - r); caja.y1 = Math.max(caja.y1, y + r); };

    // Suelo, raíces y tronco.
    let fondo = `<ellipse cx="300" cy="606" rx="150" ry="18" fill="#cfd9b8"/>`;
    const raices = activas().filter(m => m.tipo === 'raiz');
    raices.forEach((m, i) => {
      const dx = (i - (raices.length - 1) / 2) * 30;
      fondo += `<path d="M${300 + dx * 0.25} 598 Q${300 + dx * 0.9} 612 ${300 + dx * 1.7} 622" stroke="${tronco}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    });
    fondo += ramaFina(base, { x: 300, y: 520 }, cima, ancho, ancho * 0.6, tronco);
    fondo += `<path d="M${300 - ancho * 0.15} 590 Q${300 - ancho * 0.1} 520 ${300 - ancho * 0.05} 470" stroke="${oscuro}" stroke-width="2" fill="none" opacity=".35"/>`;

    let ramas = '', textos = '';
    tops.forEach((a, i) => {
      const est = estiloDe(a.id);
      const sv = E.saviaArea[a.id] || 0;
      const nv = nivelArea(sv).nivel;
      const ang = tops.length === 1 ? 0 : -62 + (i * 124) / (tops.length - 1);
      const largo = Math.min(210, 120 + nv * 9);
      const ini = { x: cima.x + Math.sin(rad(ang)) * 8, y: cima.y + 22 - (Math.abs(ang) < 20 ? 30 : 0) };
      const fin = { x: ini.x + Math.sin(rad(ang)) * largo, y: ini.y - Math.cos(rad(ang)) * largo * 0.92 };
      const ctrl = { x: ini.x + Math.sin(rad(ang * 0.45)) * largo * 0.55, y: ini.y - Math.cos(rad(ang * 0.45)) * largo * 0.6 };
      const w0 = Math.min(ancho * 0.55, 10 + nv * 1.1);
      const rCopa = sv > 0 ? Math.min(78, 30 + nv * 5) : 0;

      let tallos = ramaFina(ini, ctrl, fin, w0, Math.max(3, w0 * 0.35), tronco);
      // La copa principal va atrás; las ramitas, por delante, para que se vean.
      let hojas = copa(fin.x, fin.y, rCopa, pal, i * 5, nv >= 5 ? (esp.flor || '#f3e6c8') : null);
      let rotulos = '';
      const hijas = hijasDe(a.id);
      hijas.forEach((h, k) => {
        const t = 0.3 + (k + 0.5) * (0.5 / hijas.length);
        const p = bez(ini, ctrl, fin, t), d = bezD(ini, ctrl, fin, t);
        const len = Math.hypot(d.x, d.y) || 1;
        const lado = k % 2 ? 1 : -1;
        const svh = E.saviaArea[h.id] || 0, nvh = nivelArea(svh).nivel;
        const largoH = 52 + Math.min(36, nvh * 5);
        const q = { x: p.x + (-d.y / len) * lado * largoH + (d.x / len) * 16, y: p.y + (d.x / len) * lado * largoH + (d.y / len) * 16 };
        const c2 = { x: (p.x + q.x) / 2 + (d.x / len) * 8, y: (p.y + q.y) / 2 + (d.y / len) * 8 };
        tallos += ramaFina(p, c2, q, Math.max(3, w0 * 0.45), 2, tronco);
        const r = svh > 0 ? Math.min(40, 16 + nvh * 3.5) : 0;
        // Ramitas de la ramita (ej. Salud → Bucal, Pies…).
        hijasDe(h.id).forEach((n2, z) => {
          const sv2 = E.saviaArea[n2.id] || 0;
          const a2 = Math.atan2(q.y - p.y, q.x - p.x) + (z - (hijasDe(h.id).length - 1) / 2) * 0.7;
          const l2 = (r || 10) + 14;
          const n2p = { x: q.x + Math.cos(a2) * l2, y: q.y + Math.sin(a2) * l2 };
          tallos += `<path d="M${q.x.toFixed(1)} ${q.y.toFixed(1)} L${n2p.x.toFixed(1)} ${n2p.y.toFixed(1)}" stroke="${tronco}" stroke-width="2" stroke-linecap="round"/>`;
          const r2 = sv2 > 0 ? Math.min(20, 9 + nivelArea(sv2).nivel * 2) : 0;
          hojas += copa(n2p.x, n2p.y, r2, pal, z + k + i, null);
          ver(n2p.x, n2p.y, r2 + 10);
          rotulos += `<text x="${n2p.x.toFixed(1)}" y="${(n2p.y + (r2 || 6) + 13).toFixed(1)}" text-anchor="middle" class="t-mini">${esc(n2.nombre)}</text>`;
        });
        hojas += copa(q.x, q.y, r, pal, k * 3 + i, null);
        ver(q.x, q.y, r + 10);
        rotulos += `<text x="${q.x.toFixed(1)}" y="${(q.y + (r || 6) + 15).toFixed(1)}" text-anchor="middle" class="t-ramita">${esc(h.nombre)} · ${nvh}</text>`;
      });
      ver(fin.x, fin.y, Math.max(rCopa, 20) + 10);
      textos += `<g class="t-de" data-de="${esc(a.id)}">${rotulos}</g>`;
      ramas += `<g class="rama" data-rama="${esc(a.id)}" tabindex="0" role="button" aria-label="${esc(a.nombre)}, nivel ${nv}">${tallos}${hojas}</g>`;

      const ly = fin.y - (rCopa || 12) - 14;
      const etiqueta = `${a.nombre.split(' ')[0]} · ${nv}`;
      const w = etiqueta.length * 9 + 22;
      ver(fin.x, ly - 16, w / 2);
      textos += `<g class="t-rama-g" data-rama="${esc(a.id)}"><rect x="${(fin.x - w / 2).toFixed(1)}" y="${(ly - 17).toFixed(1)}" width="${w}" height="30" rx="15" fill="#fff" stroke="${est.fg}" stroke-width="2"/>
        <text x="${fin.x.toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="middle" class="t-rama" fill="${est.fg}">${esc(etiqueta)}</text></g>`;
    });

    textos += `<text x="300" y="${base.y - 40}" text-anchor="middle" class="t-tronco">${esc(E.nombre)}</text>`;
    const pad = 20;
    const vb = `${(caja.x0 - pad).toFixed(0)} ${(caja.y0 - pad).toFixed(0)} ${(caja.x1 - caja.x0 + pad * 2).toFixed(0)} ${(caja.y1 - caja.y0 + pad * 2).toFixed(0)}`;
    return `<svg class="arbol-vivo" viewBox="${vb}" role="img" aria-label="Tu árbol con sus ramas">${fondo}${ramas}${textos}</svg>`;
  }

  function vista() {
    return `<div class="arbol-vivo-marco card section">${dibujar()}
      <div class="mundo-botones">
        <button class="btn small" data-av="acercar" aria-label="Acercar">+</button>
        <button class="btn small" data-av="alejar" aria-label="Alejar">−</button>
        <button class="btn small" data-av="todo">Ver todo</button>
      </div>
      <div class="arbol-pista">Tocá una rama para acercarte. Pellizcá o arrastrá para moverte.</div>
    </div>
    <div id="rama-elegida"></div>`;
  }

  function montar() {
    const svg = document.querySelector('svg.arbol-vivo');
    if (!svg) return;
    zoom = crearZoom(svg, { min: 0.8, max: 6, alCambiar: esc => svg.classList.toggle('cerca', esc > 1.6) });
    if (elegida) elegir(elegida, false);
  }

  function elegir(id, mover = true) {
    const g = document.querySelector(`svg.arbol-vivo .rama[data-rama="${CSS.escape(id)}"]`);
    if (!g) return;
    elegida = id;
    document.querySelectorAll('svg.arbol-vivo .rama, svg.arbol-vivo .t-rama-g').forEach(r => r.classList.toggle('apagada', r.dataset.rama !== id));
    document.querySelectorAll('svg.arbol-vivo .t-de').forEach(r => r.classList.toggle('activa', r.dataset.de === id));
    document.querySelector('svg.arbol-vivo')?.classList.add('con-eleccion');
    if (mover) {
      const b = g.getBBox();
      zoom?.irA({ x: b.x - 30, y: b.y - 60, w: b.width + 60, h: b.height + 90 });
    }
    const a = E.areas.find(x => x.id === id);
    const sv = E.saviaArea[id] || 0;
    const n = nivelArea(sv);
    const caja = document.getElementById('rama-elegida');
    if (caja) caja.innerHTML = `<div class="card rama-elegida section" style="--fg:${estiloDe(id).fg};--bg:${estiloDe(id).bg}">
      <div class="row">${iconoRama(id)}<div style="flex:1"><b class="serif" style="font-size:19px;font-weight:400">${esc(a.nombre)}</b><div class="muted" style="font-size:14px">Nivel ${n.nivel} · ${sv} de savia</div></div>
      <button class="btn small" data-ui="rama" data-id="${esc(id)}">Ver detalle</button></div>
    </div>`;
    Sonido.tab();
  }

  function soltar() {
    elegida = null;
    document.querySelectorAll('svg.arbol-vivo .rama, svg.arbol-vivo .t-rama-g').forEach(r => r.classList.remove('apagada'));
    document.querySelector('svg.arbol-vivo')?.classList.remove('con-eleccion');
    const caja = document.getElementById('rama-elegida');
    if (caja) caja.innerHTML = '';
    zoom?.todo();
  }

  document.addEventListener('click', e => {
    const r = e.target.closest('svg.arbol-vivo [data-rama]');
    if (r) { elegir(r.dataset.rama); return; }
    const b = e.target.closest('[data-av]');
    if (!b) return;
    if (b.dataset.av === 'acercar') zoom?.acercar();
    else if (b.dataset.av === 'alejar') zoom?.alejar();
    else if (b.dataset.av === 'todo') soltar();
  });

  return { vista, montar };
})();
