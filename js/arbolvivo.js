// El árbol de tu vida: el tronco sos vos, cada rama es un área (Cuerpo, Mente…),
// cada ramita una subárea, y las hojas crecen con la savia que le diste.
// Se puede acercar, alejar y tocar una rama para ver su detalle.

const ArbolVivo = (() => {
  let zoom = null, elegida = null;
  const rad = g => (g * Math.PI) / 180;

  function hijasDe(id) {
    return E.areas.filter(a => a.id.startsWith(id + '/') && a.id.split('/').length === id.split('/').length + 1);
  }

  // Racimo de hojas: más savia, más hojas.
  function hojas(x, y, savia, pal, semilla, escala = 1) {
    const n = Math.min(9, savia > 0 ? 2 + Math.floor(savia / 25) : 0);
    if (!n) return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(3 * escala).toFixed(1)}" fill="#b89c74"/>`; // brote cerrado
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = semilla + i * 2.4;
      const d = (i === 0 ? 0 : 5 + (i % 3) * 3) * escala;
      const r = (7 + ((i * 13 + semilla) % 4)) * escala;
      s += `<circle cx="${(x + Math.cos(a) * d).toFixed(1)}" cy="${(y + Math.sin(a) * d * 0.8).toFixed(1)}" r="${r.toFixed(1)}" fill="${pal[i % 3]}" opacity=".92"/>`;
    }
    return s;
  }

  function dibujar() {
    const esp = ESPECIES.find(e => e.id === E.especie) || ESPECIES[0];
    const pal = enOtono() || E.vitalidad < 30 ? PALETAS.otono : E.vitalidad < 60 ? PALETAS.cansado : esp.hojas;
    const tronco = esp.tronco || '#8a6a45';
    const tops = E.areas.filter(a => !a.id.includes('/'));
    const nivel = nivelDe(E.savia).nivel;
    const grosor = 18 + Math.min(nivel, 30) * 0.6;
    const base = { x: 300, y: 560 }, cima = { x: 300, y: 330 };

    let fondo = `<ellipse cx="300" cy="566" rx="260" ry="26" fill="#d9ccb0" opacity=".6"/>`;
    // Raíces: una por cada raíz que tenés.
    const raices = activas().filter(m => m.tipo === 'raiz');
    raices.forEach((m, i) => {
      const dx = (i - (raices.length - 1) / 2) * 34;
      fondo += `<path d="M${300 + dx * 0.2} 556 Q${300 + dx} 580 ${300 + dx * 1.6} 596" stroke="${tronco}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`;
    });
    let ramas = '', capaHojas = '', textos = '';
    fondo += `<path d="M${base.x - grosor} ${base.y} Q${base.x - grosor * 0.4} 440 ${cima.x - grosor * 0.35} ${cima.y} L${cima.x + grosor * 0.35} ${cima.y} Q${base.x + grosor * 0.4} 440 ${base.x + grosor} ${base.y}Z" fill="${tronco}"/>`;
    textos += `<text x="300" y="${base.y - 30}" text-anchor="middle" class="t-tronco">${esc(E.nombre)}</text>`;

    tops.forEach((a, i) => {
      const est = estiloDe(a.id);
      const sv = E.saviaArea[a.id] || 0;
      const nv = nivelArea(sv).nivel;
      const ang = tops.length === 1 ? 0 : -72 + (i * 144) / (tops.length - 1);
      const largo = Math.min(230, 120 + nv * 9);
      const inicio = { x: cima.x + Math.sin(rad(ang)) * 10, y: cima.y + 30 + Math.abs(ang) * 0.9 };
      const fin = { x: inicio.x + Math.sin(rad(ang)) * largo, y: inicio.y - Math.cos(rad(ang)) * largo };
      const ctrl = { x: inicio.x + Math.sin(rad(ang * 0.6)) * largo * 0.5, y: inicio.y - Math.cos(rad(ang * 0.6)) * largo * 0.55 };
      const ancho = Math.min(16, 6 + nv * 0.9);
      let g = `<g class="rama" data-rama="${esc(a.id)}" tabindex="0" role="button" aria-label="${esc(a.nombre)}, nivel ${nv}">`;
      g += `<path d="M${inicio.x.toFixed(1)} ${inicio.y.toFixed(1)} Q${ctrl.x.toFixed(1)} ${ctrl.y.toFixed(1)} ${fin.x.toFixed(1)} ${fin.y.toFixed(1)}" stroke="${tronco}" stroke-width="${ancho}" fill="none" stroke-linecap="round"/>`;

      // Ramitas a lo largo de la rama.
      const hijas = hijasDe(a.id);
      let hojasRama = hojas(fin.x, fin.y, sv, pal, i * 7, 1.25);
      hijas.forEach((h, k) => {
        const t = 0.4 + (k + 1) * (0.55 / (hijas.length + 1));
        const px = (1 - t) * (1 - t) * inicio.x + 2 * (1 - t) * t * ctrl.x + t * t * fin.x;
        const py = (1 - t) * (1 - t) * inicio.y + 2 * (1 - t) * t * ctrl.y + t * t * fin.y;
        const lado = k % 2 ? 1 : -1;
        const angH = ang + lado * (38 + (k % 3) * 8);
        const svh = E.saviaArea[h.id] || 0;
        const nvh = nivelArea(svh).nivel;
        const lh = Math.min(95, 42 + nvh * 6);
        const fx = px + Math.sin(rad(angH)) * lh, fy = py - Math.cos(rad(angH)) * lh;
        g += `<path d="M${px.toFixed(1)} ${py.toFixed(1)} L${fx.toFixed(1)} ${fy.toFixed(1)}" stroke="${tronco}" stroke-width="${Math.max(2.5, ancho * 0.45).toFixed(1)}" stroke-linecap="round"/>`;
        hojasRama += hojas(fx, fy, svh, pal, i * 7 + k * 3);
        // Ramitas de la ramita (ej. Salud → Bucal, Pies…).
        hijasDe(h.id).forEach((n, q) => {
          const angN = angH + (q % 2 ? 30 : -30) + q * 4;
          const svn = E.saviaArea[n.id] || 0;
          const ln = 22 + Math.min(30, nivelArea(svn).nivel * 4);
          const nx = fx + Math.sin(rad(angN)) * ln, ny = fy - Math.cos(rad(angN)) * ln;
          g += `<path d="M${fx.toFixed(1)} ${fy.toFixed(1)} L${nx.toFixed(1)} ${ny.toFixed(1)}" stroke="${tronco}" stroke-width="2" stroke-linecap="round"/>`;
          hojasRama += hojas(nx, ny, svn, pal, q + k, 0.7);
          textos += `<text x="${nx.toFixed(1)}" y="${(ny + 16).toFixed(1)}" text-anchor="middle" class="t-mini">${esc(n.nombre)}</text>`;
        });
        textos += `<text x="${fx.toFixed(1)}" y="${(fy + 22).toFixed(1)}" text-anchor="middle" class="t-ramita">${esc(h.nombre)} · ${nvh}</text>`;
      });
      if (nv >= 5) hojasRama += `<circle cx="${(fin.x + 8).toFixed(1)}" cy="${(fin.y - 6).toFixed(1)}" r="4" fill="${esp.flor || '#f3e6c8'}"/>`;
      g += hojasRama + '</g>';
      ramas += g;
      textos += `<g class="t-rama-g" data-rama="${esc(a.id)}"><rect x="${(fin.x - 46).toFixed(1)}" y="${(fin.y - 52).toFixed(1)}" width="92" height="26" rx="13" fill="${est.bg}"/>
        <text x="${fin.x.toFixed(1)}" y="${(fin.y - 34).toFixed(1)}" text-anchor="middle" class="t-rama" fill="${est.fg}">${esc(a.nombre.split(' ')[0])} · ${nv}</text></g>`;
    });

    return `<svg class="arbol-vivo" viewBox="0 0 600 620" role="img" aria-label="Tu árbol con sus ramas">${fondo}${ramas}${textos}</svg>`;
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
    document.querySelectorAll('svg.arbol-vivo .rama').forEach(r => r.classList.toggle('apagada', r !== g));
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
    document.querySelectorAll('svg.arbol-vivo .rama').forEach(r => r.classList.remove('apagada'));
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
