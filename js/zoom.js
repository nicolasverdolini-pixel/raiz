// Zoom y arrastre sobre un SVG (pellizcar, rueda, arrastrar y botones),
// moviendo su viewBox. Se usa en el árbol de la pestaña Árbol y en el mundo del Bosque.

function crearZoom(svg, { min = 0.25, max = 6, alCambiar } = {}) {
  const [x0, y0, w0, h0] = svg.getAttribute('viewBox').split(/\s+/).map(Number);
  const inicio = { x: x0, y: y0, w: w0, h: h0 };
  let vb = { ...inicio };
  let animacion = null;

  const aplicar = () => {
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    alCambiar?.(inicio.w / vb.w);
  };

  const limitar = v => {
    const esc = inicio.w / v.w;
    if (esc < min) { const k = inicio.w / min / v.w; v.x -= (v.w * k - v.w) / 2; v.y -= (v.h * k - v.h) / 2; v.w *= k; v.h *= k; }
    if (esc > max) { const k = inicio.w / max / v.w; v.x -= (v.w * k - v.w) / 2; v.y -= (v.h * k - v.h) / 2; v.w *= k; v.h *= k; }
    return v;
  };

  // Punto de la pantalla → coordenadas del dibujo.
  function aDibujo(cx, cy) {
    const r = svg.getBoundingClientRect();
    return { x: vb.x + ((cx - r.left) / r.width) * vb.w, y: vb.y + ((cy - r.top) / r.height) * vb.h };
  }

  function zoomEn(factor, cx, cy) {
    const p = cx == null ? { x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 } : aDibujo(cx, cy);
    const n = { w: vb.w / factor, h: vb.h / factor };
    n.x = p.x - (p.x - vb.x) / factor;
    n.y = p.y - (p.y - vb.y) / factor;
    vb = limitar(n);
    aplicar();
  }

  // Lleva la vista a un rectángulo del dibujo con una animación suave.
  function irA(dest, ms = 600) {
    cancelAnimationFrame(animacion);
    const desde = { ...vb };
    const r = svg.getBoundingClientRect();
    const prop = r.height / r.width || inicio.h / inicio.w;
    const d = { ...dest };
    if (d.h / d.w > prop) { const w = d.h / prop; d.x -= (w - d.w) / 2; d.w = w; } else { const h = d.w * prop; d.y -= (h - d.h) / 2; d.h = h; }
    const meta = limitar(d);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { vb = meta; aplicar(); return; }
    const t0 = performance.now();
    const paso = t => {
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      vb = { x: desde.x + (meta.x - desde.x) * e, y: desde.y + (meta.y - desde.y) * e, w: desde.w + (meta.w - desde.w) * e, h: desde.h + (meta.h - desde.h) * e };
      aplicar();
      if (k < 1) animacion = requestAnimationFrame(paso);
    };
    animacion = requestAnimationFrame(paso);
  }

  // Dedos y mouse.
  const punteros = new Map();
  let distancia = 0, movido = false;
  svg.addEventListener('pointerdown', e => {
    punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
    movido = false;
    if (punteros.size === 2) { const [a, b] = [...punteros.values()]; distancia = Math.hypot(a.x - b.x, a.y - b.y); }
  });
  svg.addEventListener('pointermove', e => {
    const antes = punteros.get(e.pointerId);
    if (!antes) return;
    const ahora = { x: e.clientX, y: e.clientY };
    punteros.set(e.pointerId, ahora);
    if (punteros.size === 1) {
      const dx = ahora.x - antes.x, dy = ahora.y - antes.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) movido = true;
      if (!movido) return;
      if (!svg.hasPointerCapture(e.pointerId)) svg.setPointerCapture(e.pointerId);
      const r = svg.getBoundingClientRect();
      vb.x -= (dx / r.width) * vb.w;
      vb.y -= (dy / r.height) * vb.h;
      aplicar();
    } else if (punteros.size === 2) {
      movido = true;
      const [a, b] = [...punteros.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (distancia) zoomEn(d / distancia, (a.x + b.x) / 2, (a.y + b.y) / 2);
      distancia = d;
    }
  });
  const soltar = e => { punteros.delete(e.pointerId); if (punteros.size < 2) distancia = 0; };
  svg.addEventListener('pointerup', soltar);
  svg.addEventListener('pointercancel', soltar);
  // Si hubo arrastre, el toque no cuenta como "tocar" una rama o un jardín.
  svg.addEventListener('click', e => { if (movido) { e.stopPropagation(); e.preventDefault(); movido = false; } }, true);
  svg.addEventListener('wheel', e => { e.preventDefault(); zoomEn(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });

  aplicar();
  return {
    acercar: () => zoomEn(1.5),
    alejar: () => zoomEn(1 / 1.5),
    todo: () => irA(inicio),
    irA,
  };
}
