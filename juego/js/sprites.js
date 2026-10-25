// Campanas de Bruma — gráficos en alta definición dibujados en código: personajes chibi, monstruos, mascotas y terreno.
'use strict';

const SPR = (() => {
  const S = 160;          // tamaño del lienzo de cada personaje (en píxeles reales)
  const U = S / 100;      // los dibujos se piensan en una caja de 100x100; los pies quedan en y = 92.5
  const OUT = '#1e1a2a';  // color del contorno

  // ---------- Utilidades de color ----------
  function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgbHex(r, g, b) { return '#' + ((1 << 24) + (clamp8(r) << 16) + (clamp8(g) << 8) + clamp8(b)).toString(16).slice(1); }
  const clamp8 = v => Math.max(0, Math.min(255, Math.round(v)));
  function luz(hex, f) { // f > 0 aclara, f < 0 oscurece
    const [r, g, b] = hexRgb(hex);
    return f >= 0 ? rgbHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f) : rgbHex(r * (1 + f), g * (1 + f), b * (1 + f));
  }
  function oscurecer(hex, f) { return luz(hex, f >= 1 ? Math.min(0.9, (f - 1) * 0.5) : f - 1); }

  // ---------- Utilidades de dibujo ----------
  function lienzo(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function relleno(ctx, fill, borde = true, ancho = 2.4) {
    ctx.fillStyle = fill; ctx.fill();
    if (borde) { ctx.lineWidth = ancho; ctx.strokeStyle = OUT; ctx.stroke(); }
  }
  function grad(ctx, y0, y1, c0, c1) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; }
  function gradR(ctx, x, y, r, c0, c1) { const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; }
  function capsula(ctx, x1, y1, x2, y2, r, fill) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = OUT; ctx.lineWidth = r * 2 + 2.4;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.strokeStyle = fill; ctx.lineWidth = r * 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.restore();
  }
  function circulo(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }
  function elipse(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); }
  function brillo(ctx, x, y, r, color) { ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = r * 3; circulo(ctx, x, y, r); ctx.fillStyle = color; ctx.fill(); ctx.restore(); }
  function hash(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }

  const TINTES = {
    orden:       { C:'#7c7c86', D:'#55555e', A:'#b03a3a' },
    reina:       { C:'#3c5a9a', D:'#26406e', A:'#e6c45a' },
    contrabando: { C:'#6a5a3a', D:'#4a3e28', A:'#3a9a9a' },
  };
  const TUNICAS = ['novicio', 'clerigo', 'hechicero', 'cronomante', 'campanero'];

  // ---------- Armas ----------
  function dibujarArma(ctx, tipo, x, y, P) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.25);
    const metal = g => grad(ctx, -40, 0, '#ffffff', '#9aa4b8');
    switch (tipo) {
      case 'espada':
        rr(ctx, -2.6, -40, 5.2, 34, 2); relleno(ctx, metal());
        ctx.beginPath(); ctx.moveTo(-2.6, -40); ctx.lineTo(0, -45); ctx.lineTo(2.6, -40); relleno(ctx, '#fff');
        rr(ctx, -8, -7, 16, 4, 2); relleno(ctx, P.A);
        rr(ctx, -2, -3, 4, 9, 1.5); relleno(ctx, '#6a4428');
        circulo(ctx, 0, 7, 2.6); relleno(ctx, P.A);
        break;
      case 'hacha':
        rr(ctx, -1.8, -36, 3.6, 44, 1.5); relleno(ctx, grad(ctx, -36, 8, '#a0703a', '#6a4428'));
        ctx.beginPath(); ctx.moveTo(1, -34); ctx.quadraticCurveTo(16, -36, 15, -22); ctx.quadraticCurveTo(10, -18, 1, -20); ctx.closePath(); relleno(ctx, metal());
        break;
      case 'daga':
        ctx.beginPath(); ctx.moveTo(-2.4, -6); ctx.lineTo(0, -24); ctx.lineTo(2.4, -6); ctx.closePath(); relleno(ctx, metal());
        rr(ctx, -6, -7, 12, 3.5, 1.5); relleno(ctx, P.A);
        rr(ctx, -1.8, -4, 3.6, 8, 1.5); relleno(ctx, '#6a4428');
        break;
      case 'arco':
        ctx.beginPath(); ctx.moveTo(4, -34); ctx.quadraticCurveTo(18, -12, 4, 10); ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 3.6; ctx.strokeStyle = '#a0703a'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(4, -34); ctx.lineTo(4, 10); ctx.lineWidth = 1; ctx.strokeStyle = '#f4f0e6'; ctx.stroke();
        break;
      case 'vara':
        rr(ctx, -1.8, -40, 3.6, 50, 1.8); relleno(ctx, grad(ctx, -40, 10, '#b08048', '#6a4428'));
        brillo(ctx, 0, -43, 5.5, P.A); circulo(ctx, 0, -43, 5.5); relleno(ctx, gradR(ctx, 0, -43, 5.5, '#ffffff', P.A));
        break;
      case 'maza': // campanilla, colgando a un costado para no tapar la cara
        ctx.rotate(0.9);
        rr(ctx, -1.6, -14, 3.2, 20, 1.5); relleno(ctx, '#6a4428');
        ctx.beginPath(); ctx.moveTo(-8, -14); ctx.quadraticCurveTo(-8, -28, 0, -28); ctx.quadraticCurveTo(8, -28, 8, -14); ctx.quadraticCurveTo(10, -12, 0, -12); ctx.quadraticCurveTo(-10, -12, -8, -14);
        relleno(ctx, grad(ctx, -28, -12, '#fff2b0', '#c8962a'));
        circulo(ctx, 0, -10.5, 2.2); relleno(ctx, '#c8962a');
        break;
      case 'instrumento': // laúd colgado en diagonal
        ctx.rotate(-0.5);
        rr(ctx, -1.6, -34, 3.2, 22, 1.2); relleno(ctx, '#5a3418');
        rr(ctx, -3, -38, 6, 6, 1.5); relleno(ctx, '#3a2010');
        ctx.beginPath(); ctx.ellipse(0, -4, 8, 10, 0, 0, Math.PI * 2); relleno(ctx, grad(ctx, -14, 6, '#d89a50', '#8a5224'));
        circulo(ctx, 0, -6, 2.4); relleno(ctx, '#2a1408');
        break;
      case 'lanza':
        rr(ctx, -1.6, -52, 3.2, 64, 1.5); relleno(ctx, grad(ctx, -52, 12, '#b08048', '#6a4428'));
        ctx.beginPath(); ctx.moveTo(-4.5, -50); ctx.lineTo(0, -64); ctx.lineTo(4.5, -50); ctx.lineTo(0, -46); ctx.closePath(); relleno(ctx, metal());
        rr(ctx, -4, -48, 8, 3, 1.5); relleno(ctx, P.A);
        break;
    }
    ctx.restore();
  }

  // ---------- Estilo realista: sombreado con volumen ----------
  const LIN = '#17121c';
  function cil(ctx, x0, x1, c) { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, luz(c, -0.38)); g.addColorStop(0.42, c); g.addColorStop(0.72, luz(c, 0.16)); g.addColorStop(1, luz(c, -0.2)); return g; }
  function trazo(ctx, fill, lw = 1.3) { ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = LIN; ctx.stroke(); }
  function metal(ctx, x0, x1, c = '#c8ccd6') { return cil(ctx, x0, x1, c); }
  function linea(ctx, pts, color, lw = 1) { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.lineWidth = lw; ctx.strokeStyle = color; ctx.stroke(); }

  // ---------- Caras ----------
  const IRIS = ['#4a3020', '#2a6aa8', '#3a8a4a', '#8a5a2a', '#5a5a6a', '#8a3a9a', '#2a8a8a', '#a8402a'];
  function caraDe(look) {
    const c = look.cara || {};
    const h = hash((look.pelo || '') + (look.piel || '') + (look.estilo ?? '') + (look.semilla || '') + (look.barba ? 'b' : ''));
    const r = n => (hash(h + ':' + n) % 1000) / 1000;
    return {
      ojos: c.ojos ?? Math.floor(r(1) * 5), iris: c.iris ?? IRIS[Math.floor(r(2) * IRIS.length)], cejas: c.cejas ?? Math.floor(r(3) * 5), boca: c.boca ?? Math.floor(r(4) * 5),
      pecas: c.pecas ?? r(5) < 0.22, pestanas: c.pestanas ?? (look.estilo === 2 && r(6) < 0.7), cicatriz: c.cicatriz ?? r(7) < 0.08, lunar: c.lunar ?? r(8) < 0.12,
      arrugas: c.arrugas ?? false, parche: c.parche ?? false, lentes: c.lentes ?? r(9) < 0.07, bigote: c.bigote ?? false, rubor: (c.rubor ?? (0.1 + r(10) * 0.15)) * 0.35,
    };
  }
  // Cabeza: centro (50, 19.5). Ojos en y≈20, a 3.4 del centro.
  function dibujarCara(ctx, P, f, expr, look) {
    const y = 20.2, xs = [46.6, 53.4];
    const cerr = expr === 'parpadeo' || expr === 'feliz';
    const enojo = expr === 'enojo' || expr === 'dolor', triste = expr === 'triste', sorp = expr === 'sorpresa';
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // Sombra de pómulos y mentón para dar forma
    const sh = ctx.createRadialGradient(50, 18, 3, 50, 21, 9.5); sh.addColorStop(0.6, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(60,20,20,.22)');
    ctx.fillStyle = sh; ctx.beginPath(); ctx.ellipse(50, 20, 7.6, 8.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(220,90,90,${f.rubor})`; elipse(ctx, 45.4, 23.2, 1.6, 0.9); ctx.fill(); elipse(ctx, 54.6, 23.2, 1.6, 0.9); ctx.fill();
    if (f.pecas) { ctx.fillStyle = 'rgba(140,70,40,.6)'; [[44.6, 22.4], [45.6, 23.4], [46.4, 22.2], [53.6, 22.2], [54.4, 23.4], [55.4, 22.4]].forEach(([a, b]) => { circulo(ctx, a, b, 0.3); ctx.fill(); }); }
    if (f.arrugas) { linea(ctx, [43.6, 20.4, 42.8, 21.4], 'rgba(90,40,30,.5)', 0.5); linea(ctx, [56.4, 20.4, 57.2, 21.4], 'rgba(90,40,30,.5)', 0.5); linea(ctx, [46, 14.8, 54, 14.8], 'rgba(90,40,30,.35)', 0.5); }
    // Ojos
    xs.forEach((x, i) => {
      const lado = i ? 1 : -1;
      if (f.parche && i === 1) return;
      if (cerr) { ctx.beginPath(); if (expr === 'feliz') ctx.arc(x, y + 0.6, 1.4, Math.PI * 1.15, Math.PI * 1.85); else { ctx.moveTo(x - 1.5, y); ctx.quadraticCurveTo(x, y + 0.7, x + 1.5, y); } ctx.lineWidth = 0.8; ctx.strokeStyle = LIN; ctx.stroke(); return; }
      if (expr === 'dolor') { linea(ctx, [x + lado * 1.4, y - 0.9, x - lado * 0.9, y, x + lado * 1.4, y + 0.9], LIN, 0.8); return; }
      const w = f.ojos === 1 ? 1.75 : f.ojos === 3 ? 1.6 : 1.55, h = (f.ojos === 1 ? 1.25 : f.ojos === 3 ? 0.6 : f.ojos === 4 ? 0.8 : 1.0) * (sorp ? 1.4 : 1);
      ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x - w * 0.2, y - h * 1.6 - (f.ojos === 2 ? 0.2 : 0), x + w, y - (f.ojos === 2 ? lado * 0.3 : 0)); ctx.quadraticCurveTo(x, y + h * 1.2, x - w, y); ctx.closePath();
      ctx.fillStyle = '#f4efe6'; ctx.fill();
      ctx.save(); ctx.clip();
      circulo(ctx, x + lado * 0.1, y - 0.1, h * 0.95 + 0.2); ctx.fillStyle = f.iris; ctx.fill();
      circulo(ctx, x + lado * 0.1, y - 0.1, 0.42); ctx.fillStyle = '#0e0a10'; ctx.fill();
      circulo(ctx, x + 0.35, y - 0.55, 0.28); ctx.fillStyle = '#fff'; ctx.fill();
      if (f.ojos === 4) { ctx.fillStyle = luz(P.S, -0.1); ctx.fillRect(x - 2, y - 2.4, 4, 2.2); }
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(x - w - 0.2, y + 0.1); ctx.quadraticCurveTo(x - w * 0.2, y - h * 1.6 - 0.1, x + w + 0.2, y - (f.ojos === 2 ? lado * 0.3 : 0));
      ctx.lineWidth = f.pestanas ? 0.95 : 0.7; ctx.strokeStyle = LIN; ctx.stroke();
      if (f.pestanas) linea(ctx, [x + lado * w, y - 0.4, x + lado * (w + 0.9), y - 1.2], LIN, 0.6);
    });
    if (triste && !cerr) { ctx.fillStyle = 'rgba(150,210,255,.85)'; ctx.beginPath(); ctx.ellipse(45.6, 22.4, 0.4, 0.8, 0, 0, Math.PI * 2); ctx.fill(); }
    if (f.parche) { linea(ctx, [43, 15.6, 57.6, 19.4], LIN, 0.6); elipse(ctx, 53.4, 20.2, 2.3, 1.9); ctx.fillStyle = '#1a141e'; ctx.fill(); }
    // Cejas
    const tipo = enojo ? 2 : triste ? 3 : sorp ? 4 : f.cejas;
    ctx.strokeStyle = luz(P.H, -0.4); ctx.lineWidth = tipo === 1 || f.cejas === 1 ? 1.15 : 0.75;
    xs.forEach((x, i) => {
      const lado = i ? 1 : -1, yb = sorp ? 16.4 : 17.4;
      ctx.beginPath();
      if (tipo === 2) { ctx.moveTo(x + lado * 1.9, yb - 0.6); ctx.lineTo(x - lado * 1.6, yb + 0.7); }
      else if (tipo === 3) { ctx.moveTo(x + lado * 1.9, yb + 0.4); ctx.lineTo(x - lado * 1.6, yb - 0.7); }
      else if (tipo === 4) { ctx.moveTo(x - 1.9, yb + 0.3); ctx.quadraticCurveTo(x, yb - 1, x + 1.9, yb + 0.3); }
      else { ctx.moveTo(x - 1.9, yb + 0.2); ctx.quadraticCurveTo(x, yb - 0.5, x + 1.9, yb + 0.1); }
      ctx.stroke();
    });
    // Nariz con sombra
    ctx.beginPath(); ctx.moveTo(50.3, 20.6); ctx.quadraticCurveTo(51.4, 23, 50.6, 23.6); ctx.quadraticCurveTo(50, 24, 49.3, 23.6); ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(100,45,35,.65)'; ctx.stroke();
    // Boca
    if (!look.barba || f.bigote) {
      const b = expr === 'habla' ? 'habla' : expr === 'feliz' ? 2 : enojo ? 'e' : triste ? 4 : sorp ? 'o' : f.boca;
      ctx.lineWidth = 0.75; ctx.strokeStyle = '#6a2a2e'; ctx.fillStyle = '#5a1e24';
      ctx.beginPath();
      if (b === 'habla' || b === 'o') { ctx.ellipse(50, 26, b === 'o' ? 0.9 : 1.4, b === 'o' ? 1.1 : 0.8, 0, 0, Math.PI * 2); ctx.fill(); }
      else if (b === 'e') { ctx.moveTo(48.4, 26.2); ctx.quadraticCurveTo(50, 25.4, 51.6, 26.2); ctx.stroke(); }
      else if (b === 2) { ctx.moveTo(48.2, 25.5); ctx.quadraticCurveTo(50, 27.4, 51.8, 25.5); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#f4efe6'; ctx.fillRect(48.8, 25.5, 2.4, 0.5); }
      else if (b === 3) { ctx.moveTo(48.4, 26); ctx.quadraticCurveTo(50.4, 26.4, 51.8, 25.2); ctx.stroke(); }
      else if (b === 4) { ctx.moveTo(48.4, 26.4); ctx.quadraticCurveTo(50, 25.6, 51.6, 26.4); ctx.stroke(); }
      else if (b === 0) { ctx.moveTo(48.4, 25.6); ctx.quadraticCurveTo(50, 26.6, 51.6, 25.6); ctx.stroke(); }
      else { ctx.moveTo(48.5, 26); ctx.lineTo(51.5, 26); ctx.stroke(); }
      linea(ctx, [49.2, 27.2, 50.8, 27.2], 'rgba(120,50,40,.3)', 0.5);
    }
    if (f.bigote) { ctx.beginPath(); ctx.moveTo(50, 24.4); ctx.quadraticCurveTo(47.4, 23.8, 46.6, 25.8); ctx.quadraticCurveTo(48.4, 25.2, 50, 25.4); ctx.quadraticCurveTo(51.6, 25.2, 53.4, 25.8); ctx.quadraticCurveTo(52.6, 23.8, 50, 24.4); ctx.fillStyle = luz(P.H, -0.15); ctx.fill(); }
    if (f.lunar) { circulo(ctx, 53.6, 25.4, 0.32); ctx.fillStyle = '#3a2018'; ctx.fill(); }
    if (f.cicatriz) linea(ctx, [44.6, 16.8, 46.4, 23.4], 'rgba(150,60,60,.85)', 0.6);
    if (f.lentes) { ctx.lineWidth = 0.6; ctx.strokeStyle = '#3a3040'; circulo(ctx, 46.6, 20.2, 2.2); ctx.stroke(); circulo(ctx, 53.4, 20.2, 2.2); ctx.stroke(); linea(ctx, [48.8, 20, 51.2, 20], '#3a3040', 0.6); }
    ctx.restore();
  }

  // ---------- Pelo ----------
  function peloAtras(ctx, P, estilo) {
    ctx.beginPath();
    if (estilo === 2) { ctx.moveTo(41.5, 16); ctx.quadraticCurveTo(39, 32, 40, 44); ctx.quadraticCurveTo(50, 47, 60, 44); ctx.quadraticCurveTo(61, 32, 58.5, 16); ctx.closePath(); }
    else if (estilo === 1) { ctx.moveTo(41.6, 15); ctx.quadraticCurveTo(40.4, 25, 42.6, 29); ctx.lineTo(57.4, 29); ctx.quadraticCurveTo(59.6, 25, 58.4, 15); ctx.closePath(); }
    else { ctx.ellipse(50, 17.6, 8.4, 8.6, 0, 0, Math.PI * 2); }
    trazo(ctx, cil(ctx, 40, 60, P.H), 1.1);
    if (estilo === 2) for (let i = 0; i < 4; i++) linea(ctx, [44 + i * 4, 30, 43.6 + i * 4.2, 43], luz(P.H, -0.3), 0.5);
  }
  function peloDelante(ctx, P, estilo) {
    ctx.beginPath();
    ctx.moveTo(42, 20);
    ctx.bezierCurveTo(40.6, 11, 45, 9.2, 50, 9.2);
    ctx.bezierCurveTo(55, 9.2, 59.4, 11, 58, 20);
    if (estilo === 0) { ctx.lineTo(57, 16.4); ctx.lineTo(55.6, 17.6); ctx.lineTo(54.6, 14.6); ctx.lineTo(52.8, 16.6); ctx.lineTo(51, 14); ctx.lineTo(49, 16.4); ctx.lineTo(47.2, 14.4); ctx.lineTo(45.6, 17.2); ctx.lineTo(44, 15.4); ctx.lineTo(43, 18); }
    else if (estilo === 1) { ctx.quadraticCurveTo(57, 15.4, 54.6, 15); ctx.quadraticCurveTo(50, 14, 45.4, 15); ctx.quadraticCurveTo(43, 15.4, 42, 20); }
    else { ctx.quadraticCurveTo(56, 13.6, 52, 14); ctx.quadraticCurveTo(46, 15, 43.4, 18.6); ctx.lineTo(42, 22); }
    ctx.closePath();
    trazo(ctx, cil(ctx, 41, 59, P.H), 1);
    ctx.save(); ctx.globalAlpha = 0.5;
    for (let i = 0; i < 5; i++) linea(ctx, [45 + i * 2.4, 10.6, 44.4 + i * 2.6, 14.6], luz(P.H, 0.45), 0.4);
    ctx.restore();
    if (estilo === 1 || estilo === 2) { [[42.2, -1], [57.8, 1]].forEach(([x, s]) => { ctx.beginPath(); ctx.moveTo(x, 16); ctx.quadraticCurveTo(x - s * 1.2, 24, x + s * 0.4, estilo === 2 ? 34 : 27); ctx.lineTo(x + s * 1.8, estilo === 2 ? 30 : 25); ctx.quadraticCurveTo(x + s * 0.6, 22, x + s * 1.6, 17); ctx.closePath(); trazo(ctx, cil(ctx, x - 2, x + 2, P.H), 0.8); }); }
  }

  // ---------- Gorros y cascos ----------
  function gorro(ctx, g, P, vista) {
    const fr = vista !== 'b';
    switch (g) {
      case 'casco':
        ctx.beginPath(); ctx.ellipse(50, 17.4, 9, 9.2, 0, Math.PI, 0); ctx.lineTo(59, 19); ctx.lineTo(41, 19); ctx.closePath(); trazo(ctx, metal(ctx, 41, 59));
        rr(ctx, 40.6, 16.6, 18.8, 2.8, 1.2); trazo(ctx, metal(ctx, 40, 60, '#9aa2b2'), 1);
        if (fr) { rr(ctx, 49.2, 17, 1.6, 6.4, 0.6); trazo(ctx, metal(ctx, 49, 51), 0.8); }
        linea(ctx, [50, 8.4, 50, 16.4], 'rgba(255,255,255,.5)', 0.6);
        break;
      case 'yelmo':
        ctx.beginPath(); ctx.moveTo(41, 30); ctx.lineTo(40.6, 16); ctx.bezierCurveTo(40.6, 7, 59.4, 7, 59.4, 16); ctx.lineTo(59, 30); ctx.quadraticCurveTo(50, 32.6, 41, 30); ctx.closePath();
        trazo(ctx, metal(ctx, 40, 60, P.asp.metal || '#c8ccd6'));
        if (fr) {
          rr(ctx, 43, 18.6, 14, 1.8, 0.8); ctx.fillStyle = '#100c14'; ctx.fill();
          linea(ctx, [50, 9, 50, 29], 'rgba(0,0,0,.35)', 0.7);
          for (let i = 0; i < 3; i++) { circulo(ctx, 47.4 + i * 2.6, 24.4, 0.45); ctx.fillStyle = '#100c14'; ctx.fill(); }
        }
        ctx.beginPath(); ctx.moveTo(50, 8.6); ctx.bezierCurveTo(52, 2, 60, 1, 64, 6); ctx.bezierCurveTo(60, 5, 56, 7, 53, 10); ctx.closePath(); trazo(ctx, cil(ctx, 50, 64, P.A), 0.9);
        break;
      case 'capucha': case 'mitra': {
        ctx.beginPath(); ctx.moveTo(38.6, 32); ctx.bezierCurveTo(37.4, 14, 42, 6.6, 50, 6.4); ctx.bezierCurveTo(58, 6.6, 62.6, 14, 61.4, 32);
        if (fr) { ctx.lineTo(57.4, 31); ctx.bezierCurveTo(58.6, 18, 55, 12.4, 50, 12.4); ctx.bezierCurveTo(45, 12.4, 41.4, 18, 42.6, 31); }
        else ctx.quadraticCurveTo(50, 36, 38.6, 32);
        ctx.closePath(); trazo(ctx, cil(ctx, 38, 62, P.C));
        if (fr) { ctx.save(); ctx.beginPath(); ctx.ellipse(50, 20, 8, 9.4, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 2.2; ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.stroke(); ctx.restore(); }
        if (g === 'mitra') { linea(ctx, [39.4, 31, 41.8, 14, 50, 7.6, 58.2, 14, 60.6, 31], P.A, 1.1); if (fr) { linea(ctx, [50, 7.8, 50, 11.6], P.A, 1); linea(ctx, [48.4, 9.4, 51.6, 9.4], P.A, 1); } }
        break;
      }
      case 'sombrero':
        ctx.beginPath(); ctx.ellipse(50, 13.6, 15.5, 3.8, -0.04, 0, Math.PI * 2); trazo(ctx, cil(ctx, 34, 66, luz(P.C, -0.1)));
        ctx.beginPath(); ctx.moveTo(42, 13.4); ctx.bezierCurveTo(44, 6, 50, 2, 61, -1); ctx.bezierCurveTo(57, 3, 58, 8, 58.4, 13.4); ctx.quadraticCurveTo(50, 15.6, 42, 13.4); trazo(ctx, cil(ctx, 42, 60, P.C));
        ctx.beginPath(); ctx.moveTo(42.4, 11.6); ctx.quadraticCurveTo(50, 13.6, 58.2, 11.4); ctx.lineTo(58.4, 13.2); ctx.quadraticCurveTo(50, 15.4, 42.2, 13.3); ctx.closePath(); ctx.fillStyle = P.A; ctx.fill();
        break;
      case 'boina':
        ctx.beginPath(); ctx.ellipse(49, 12.6, 10, 4.6, -0.12, Math.PI, 0); ctx.quadraticCurveTo(60, 15.4, 50, 15.6); ctx.quadraticCurveTo(40, 15.6, 39, 12.6); ctx.closePath(); trazo(ctx, cil(ctx, 39, 60, P.C));
        ctx.beginPath(); ctx.moveTo(56.4, 11); ctx.bezierCurveTo(62, 4, 66, 2, 70, 0); ctx.bezierCurveTo(67, 5, 62, 9, 57.4, 12.6); ctx.closePath(); trazo(ctx, cil(ctx, 56, 70, P.A), 0.8);
        break;
      case 'panuelo':
        ctx.beginPath(); ctx.ellipse(50, 17.6, 8.8, 8.8, 0, Math.PI * 1.02, Math.PI * 1.98); ctx.lineTo(58.6, 16); ctx.quadraticCurveTo(50, 14, 41.4, 16); ctx.closePath(); trazo(ctx, cil(ctx, 41, 59, P.A));
        ctx.beginPath(); ctx.moveTo(58, 14.6); ctx.quadraticCurveTo(64, 16, 65, 22); ctx.quadraticCurveTo(62, 19, 58.6, 18); ctx.closePath(); trazo(ctx, P.A, 0.8);
        if (fr) { ctx.beginPath(); ctx.moveTo(42.6, 22.6); ctx.quadraticCurveTo(50, 21.4, 57.4, 22.6); ctx.lineTo(56.6, 27); ctx.quadraticCurveTo(50, 30.4, 43.4, 27); ctx.closePath(); trazo(ctx, cil(ctx, 42, 58, luz(P.D, -0.1)), 0.9); }
        break;
      case 'cinta':
        ctx.beginPath(); ctx.moveTo(41.6, 15); ctx.quadraticCurveTo(50, 12.4, 58.4, 15); ctx.lineTo(58.4, 17); ctx.quadraticCurveTo(50, 14.4, 41.6, 17); ctx.closePath(); trazo(ctx, cil(ctx, 41, 59, P.A), 0.8);
        if (!fr || true) { ctx.beginPath(); ctx.moveTo(58, 15.4); ctx.quadraticCurveTo(62, 18, 61.4, 24); ctx.lineTo(60, 23.6); ctx.quadraticCurveTo(60.4, 19, 57.6, 17); ctx.closePath(); trazo(ctx, P.A, 0.7); }
        break;
      case 'cofia':
        ctx.beginPath(); ctx.ellipse(50, 13.4, 17, 3.6, 0, 0, Math.PI * 2); trazo(ctx, cil(ctx, 33, 67, luz(P.C, -0.1)));
        ctx.beginPath(); ctx.moveTo(42.4, 13.4); ctx.bezierCurveTo(42, 4, 58, 4, 57.6, 13.4); ctx.quadraticCurveTo(50, 15, 42.4, 13.4); trazo(ctx, cil(ctx, 42, 58, P.C));
        rr(ctx, 42.6, 10.4, 14.8, 2, 0.8); ctx.fillStyle = P.A; ctx.fill();
        break;
      case 'cuernos':
        [[-1], [1]].forEach(([s]) => { const x = 50 + s * 7.4; ctx.beginPath(); ctx.moveTo(x, 13); ctx.bezierCurveTo(x + s * 6, 10, x + s * 7, 2, x + s * 3, -3); ctx.bezierCurveTo(x + s * 3.6, 3, x + s * 2.6, 7, x - s * 1.8, 10); ctx.closePath(); trazo(ctx, cil(ctx, x - 4, x + 4, '#e8dcc0'), 0.9); });
        ctx.beginPath(); ctx.ellipse(50, 17.4, 9, 9.2, 0, Math.PI, 0); ctx.lineTo(59, 22); ctx.lineTo(56.6, 25); ctx.lineTo(56.6, 19); ctx.lineTo(43.4, 19); ctx.lineTo(43.4, 25); ctx.lineTo(41, 22); ctx.closePath(); trazo(ctx, cil(ctx, 41, 59, luz(P.C, 0.15)));
        rr(ctx, 40.6, 16.6, 18.8, 2.4, 1); trazo(ctx, P.A, 0.8);
        break;
      case 'astas':
        [[-1], [1]].forEach(([s]) => { const x = 50 + s * 5; ctx.beginPath(); ctx.moveTo(x, 12); ctx.bezierCurveTo(x + s * 5, 8, x + s * 8, 2, x + s * 5, -4); ctx.bezierCurveTo(x + s * 4.6, 2, x + s * 3, 6, x - s * 1.2, 10); ctx.closePath(); trazo(ctx, cil(ctx, x - 4, x + 4, '#3a2030'), 0.9); });
        break;
    }
  }

  // ---------- Personaje humano (proporciones reales) ----------
  const PESADOS = ['guerrero', 'caballero', 'paladin', 'lancero', 'draconiana'];
  const CAPAS = ['caballero', 'paladin', 'hechicero', 'cronomante', 'invocador', 'cazademonios', 'campanero'];
  const TUNICAS2 = ['novicio', 'clerigo', 'hechicero', 'cronomante', 'campanero', 'invocador'];
  function humano(ctx, P, vis, vista, frame, expr) {
    const asp = P.asp, look = vis.look || {}, clase = vis.clase;
    const estilo = look.estilo ?? (hash((look.pelo || '') + (look.piel || '')) % 3);
    const atras = vista === 'b';
    const paso = frame === 1 ? 1 : frame === 2 ? -1 : 0;
    const pesado = PESADOS.includes(clase), tunica = TUNICAS2.includes(clase), capa = CAPAS.includes(clase);
    const M = asp.metal || (clase === 'paladin' ? '#e8e0c8' : clase === 'draconiana' ? '#b84a3a' : '#c8ccd6');
    const g = asp.g || 'ninguno';
    // Proporción de táctico clásico: cabeza grande y cuerpo corto y robusto.
    const cuerpoT = () => { ctx.translate(50, 93); ctx.scale(1.26, 0.78); ctx.translate(-50, -93); };
    const cabezaT = () => { ctx.translate(50, 41.6); ctx.scale(1.66, 1.66); ctx.translate(-50, -29.2); };
    ctx.save(); ctx.translate(50, 93); ctx.scale(0.9, 0.9); ctx.translate(-50, -93);
    ctx.save(); cuerpoT();

    // Alas (demonios con forma humana)
    if (asp.alas) [[-1], [1]].forEach(([s]) => { ctx.beginPath(); ctx.moveTo(50 + s * 6, 36); ctx.bezierCurveTo(50 + s * 18, 18, 50 + s * 34, 16, 50 + s * 40, 24); ctx.quadraticCurveTo(50 + s * 32, 30, 50 + s * 30, 42); ctx.quadraticCurveTo(50 + s * 24, 38, 50 + s * 20, 46); ctx.quadraticCurveTo(50 + s * 14, 42, 50 + s * 8, 46); ctx.closePath(); trazo(ctx, cil(ctx, 50 - 40, 50 + 40, P.D)); });
    // Capa por detrás
    if (capa && !atras) { ctx.beginPath(); ctx.moveTo(38, 33); ctx.quadraticCurveTo(31, 60, 33, 88); ctx.lineTo(67, 88); ctx.quadraticCurveTo(69, 60, 62, 33); ctx.closePath(); trazo(ctx, cil(ctx, 32, 68, luz(asp.capa || P.D, -0.15))); }
    if (atras && vis.arma) { ctx.save(); ctx.translate(36, 58); ctx.scale(-0.82, 0.82); dibujarArma(ctx, vis.arma, 0, 0, P); ctx.restore(); }
    if (clase === 'arquero' || clase === 'cazademonios') { // carcaj
      ctx.save(); ctx.translate(atras ? 50 : 58, 34); ctx.rotate(atras ? 0.3 : 0.4); rr(ctx, -2.6, -10, 5.2, 20, 1.6); trazo(ctx, cil(ctx, -3, 3, '#6a4428'), 0.9);
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-1.6 + i * 1.6, -10); ctx.lineTo(-2 + i * 1.6, -14); ctx.lineTo(-0.6 + i * 1.6, -13); ctx.closePath(); ctx.fillStyle = '#e8e0c8'; ctx.fill(); }
      ctx.restore();
    }
    ctx.restore();
    if (!asp.calvo && (estilo === 2 || atras)) { ctx.save(); cabezaT(); peloAtras(ctx, P, estilo); ctx.restore(); }
    ctx.save(); cuerpoT();

    // Piernas y botas
    if (!tunica) {
      [[40.2, 49.4, paso], [50.6, 59.8, -paso]].forEach(([a, b, p]) => {
        ctx.beginPath(); ctx.moveTo(a, 53); ctx.lineTo(b, 53); ctx.lineTo(b - 1, 82 - p); ctx.lineTo(a + 1.4, 82 - p); ctx.closePath(); trazo(ctx, cil(ctx, a, b, pesado ? M : P.D));
        if (pesado) { rr(ctx, a + 0.6, 64 - p, b - a - 1.6, 4, 1.4); trazo(ctx, metal(ctx, a, b, M), 0.8); }
      });
    }
    [[40.6, paso], [50.8, -paso]].forEach(([x, p]) => {
      ctx.beginPath(); ctx.moveTo(x, 78 - p); ctx.lineTo(x + 8.6, 78 - p); ctx.lineTo(x + 8.8, 90); ctx.quadraticCurveTo(x + 9.4, 93, x + 6, 93); ctx.lineTo(x - 0.6, 93); ctx.quadraticCurveTo(x - 1, 91, x, 89); ctx.closePath();
      trazo(ctx, cil(ctx, x, x + 9, pesado ? luz(M, -0.15) : P.B));
      linea(ctx, [x + 0.2, 80 - p, x + 8.6, 80 - p], 'rgba(255,255,255,.18)', 0.7);
    });
    // Túnica / falda larga
    if (tunica) {
      ctx.beginPath(); ctx.moveTo(39.4, 50); ctx.lineTo(60.6, 50); ctx.quadraticCurveTo(64, 70, 66, 89); ctx.quadraticCurveTo(50, 91.6, 34, 89); ctx.quadraticCurveTo(36, 70, 39.4, 50); ctx.closePath();
      trazo(ctx, cil(ctx, 34, 66, P.C));
      [[44, 54, 41, 88], [50, 54, 50, 90], [56, 54, 59, 88]].forEach(([a, b, c, d]) => linea(ctx, [a, b, c, d], 'rgba(0,0,0,.2)', 0.7));
      if (!atras) linea(ctx, [50, 50, 50, 90], P.A, 1.2);
    }
    // Torso
    ctx.beginPath(); ctx.moveTo(37, 33.4); ctx.quadraticCurveTo(50, 30.6, 63, 33.4); ctx.lineTo(60.6, 52.6); ctx.lineTo(39.4, 52.6); ctx.closePath();
    trazo(ctx, cil(ctx, 37, 63, pesado ? M : P.C));
    if (!atras) {
      if (pesado) {
        ctx.beginPath(); ctx.moveTo(41, 35); ctx.quadraticCurveTo(50, 33, 59, 35); ctx.lineTo(57.4, 46); ctx.quadraticCurveTo(50, 49, 42.6, 46); ctx.closePath(); trazo(ctx, metal(ctx, 41, 59, luz(M, 0.08)), 0.9);
        linea(ctx, [50, 34.6, 50, 48], 'rgba(0,0,0,.3)', 0.7); linea(ctx, [44, 38, 47, 45], 'rgba(255,255,255,.45)', 0.8);
        if (clase === 'guerrero') { ctx.save(); ctx.beginPath(); ctx.rect(39, 46, 22, 7); ctx.clip(); for (let y = 46; y < 53; y += 1.6) for (let x = 39; x < 61; x += 1.8) { circulo(ctx, x + (y % 3.2 ? 0.9 : 0), y, 0.6); ctx.strokeStyle = 'rgba(40,40,60,.5)'; ctx.lineWidth = 0.3; ctx.stroke(); } ctx.restore(); }
      } else {
        ctx.beginPath(); ctx.moveTo(45, 32); ctx.lineTo(50, 38); ctx.lineTo(55, 32); ctx.lineWidth = 0.9; ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.stroke();
        if (clase === 'clerigo') { rr(ctx, 48.4, 34, 3.2, 18, 0.8); ctx.fillStyle = P.A; ctx.fill(); linea(ctx, [47, 40, 53, 40], P.A, 1.2); }
        if (clase === 'monje') { ctx.beginPath(); ctx.moveTo(40, 34); ctx.lineTo(58, 50); ctx.lineWidth = 2; ctx.strokeStyle = P.A; ctx.stroke(); }
        if (clase === 'cronomante') { circulo(ctx, 50, 42, 3); ctx.lineWidth = 0.8; ctx.strokeStyle = P.A; ctx.stroke(); linea(ctx, [50, 42, 50, 40, 50, 42, 51.6, 42.8], P.A, 0.6); }
        if (clase === 'invocador') { for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(50, 41, 2 + i * 1.6, 0, Math.PI * 2); ctx.lineWidth = 0.4; ctx.strokeStyle = P.A; ctx.stroke(); } }
      }
      // Cinturón
      rr(ctx, 39.2, 49.6, 21.6, 3.6, 1); trazo(ctx, cil(ctx, 39, 61, luz(P.D, -0.25)), 0.8);
      rr(ctx, 48.4, 49.2, 3.2, 4.2, 0.8); trazo(ctx, P.A, 0.6);
      if (asp.g === 'campana') { ctx.beginPath(); ctx.moveTo(55, 56); ctx.quadraticCurveTo(55, 52.4, 57, 52.4); ctx.quadraticCurveTo(59, 52.4, 59, 56); ctx.closePath(); trazo(ctx, grad(ctx, 52, 56, '#fff2b0', '#c8962a'), 0.7); }
    }
    // Brazo izquierdo
    const brazo = (x0, y0, x1, y1, x2, y2, c) => {
      ctx.save(); ctx.lineCap = 'round';
      [[x0, y0, x1, y1, 3.4], [x1, y1, x2, y2, 3]].forEach(([a, b, cc, d, w]) => {
        ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(cc, d); ctx.lineWidth = w * 2 + 1.4; ctx.strokeStyle = LIN; ctx.stroke();
        ctx.lineWidth = w * 2; ctx.strokeStyle = c; ctx.stroke();
      });
      ctx.restore();
    };
    const mangaC = pesado ? M : P.C;
    brazo(37.4, 35.4, 34.2 + paso, 46, 35 + paso * 1.4, 56.4, mangaC);
    if (pesado || clase === 'monje' || clase === 'espadachin') { circulo(ctx, 35 + paso * 1.4, 55.8, 3.2); trazo(ctx, pesado ? metal(ctx, 32, 38, M) : P.A, 0.8); }
    circulo(ctx, 35 + paso * 1.4, 58.4, 2.5); trazo(ctx, P.S, 0.8);
    // Hombreras
    if (pesado) [[37, -1], [63, 1]].forEach(([x, s]) => { ctx.beginPath(); ctx.ellipse(x, 34.6, 5.2, 3.6, s * 0.35, 0, Math.PI * 2); trazo(ctx, metal(ctx, x - 5, x + 5, M), 1); linea(ctx, [x - 3, 33.6, x + 2, 32.8], 'rgba(255,255,255,.5)', 0.6); });

    // Cuello y cabeza
    rr(ctx, 47, 25.6, 6, 6.6, 1.6); trazo(ctx, cil(ctx, 47, 53, luz(P.S, -0.12)), 0.8);
    ctx.restore();
    ctx.save(); cabezaT();
    if (!atras) { circulo(ctx, 42.2, 20.6, 1.4); trazo(ctx, P.S, 0.7); circulo(ctx, 57.8, 20.6, 1.4); trazo(ctx, P.S, 0.7); }
    ctx.beginPath(); ctx.moveTo(42.2, 16); ctx.bezierCurveTo(42, 8.6, 58, 8.6, 57.8, 16); ctx.lineTo(57.6, 21); ctx.bezierCurveTo(57.2, 26, 53.4, 29, 50, 29.2); ctx.bezierCurveTo(46.6, 29, 42.8, 26, 42.4, 21); ctx.closePath();
    trazo(ctx, cil(ctx, 42, 58, P.S), 1.1);
    if (atras && !asp.calvo) peloAtras(ctx, P, estilo === 2 ? 2 : 0);
    else if (!asp.calvo && g !== 'yelmo') peloDelante(ctx, P, estilo);
    if (!atras && g !== 'yelmo') {
      if (look.barba) { ctx.beginPath(); ctx.moveTo(42.6, 21); ctx.bezierCurveTo(43, 30, 47, 32.4, 50, 32.4); ctx.bezierCurveTo(53, 32.4, 57, 30, 57.4, 21); ctx.quadraticCurveTo(55, 25.4, 50, 25.2); ctx.quadraticCurveTo(45, 25.4, 42.6, 21); ctx.closePath(); trazo(ctx, cil(ctx, 42, 58, P.H), 0.9); for (let i = 0; i < 4; i++) linea(ctx, [46 + i * 2.6, 27, 46.4 + i * 2.4, 31], luz(P.H, -0.3), 0.4); }
      if (asp.ojosBrillan) { brillo(ctx, 46.6, 20.2, 1.2, P.E); brillo(ctx, 53.4, 20.2, 1.2, P.E); }
      else dibujarCara(ctx, P, caraDe(look), expr, look);
    }
    if (g !== 'campana' && g !== 'ninguno') gorro(ctx, g, P, vista);
    ctx.restore();
    ctx.save(); cuerpoT();

    // Brazo derecho con el arma
    const hx = 65 - paso * 1.4, hy = 58.4;
    brazo(62.6, 35.4, 65.8 - paso, 46, hx, hy - 2, mangaC);
    if (!atras && vis.arma) { ctx.save(); ctx.translate(hx, hy); ctx.scale(0.82, 0.82); dibujarArma(ctx, vis.arma, 0, 0, P); ctx.restore(); }
    if (pesado || clase === 'monje' || clase === 'espadachin') { circulo(ctx, hx, hy - 2.6, 3.2); trazo(ctx, pesado ? metal(ctx, hx - 3, hx + 3, M) : P.A, 0.8); }
    circulo(ctx, hx, hy, 2.5); trazo(ctx, P.S, 0.8);
    ctx.restore();
    ctx.restore();
  }

  // ---------- Monstruos (estilo realista) ----------
  function ojoBrillante(ctx, x, y, r, c) { ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = r * 5; ctx.beginPath(); ctx.ellipse(x, y, r * 1.3, r * 0.8, -0.2, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); ctx.restore(); ctx.beginPath(); ctx.ellipse(x, y, r * 0.5, r * 0.35, 0, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); }
  function dientes(ctx, x0, y0, x1, n, h, arriba = true) { ctx.fillStyle = '#f4ecd8'; ctx.strokeStyle = LIN; ctx.lineWidth = 0.5; for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * (i + 0.5) / n, w = (x1 - x0) / n * 0.45; ctx.beginPath(); ctx.moveTo(x - w, y0); ctx.lineTo(x, y0 + (arriba ? h : -h) * (i % 2 ? 0.6 : 1)); ctx.lineTo(x + w, y0); ctx.closePath(); ctx.fill(); ctx.stroke(); } }
  function pelaje(ctx, pts, c, lw = 0.6) { ctx.save(); ctx.globalAlpha = 0.55; for (let i = 0; i < pts.length; i += 4) linea(ctx, [pts[i], pts[i + 1], pts[i + 2], pts[i + 3]], c, lw); ctx.restore(); }
  function cuerpoGrad(ctx, y0, y1, c) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, luz(c, 0.22)); g.addColorStop(0.5, c); g.addColorStop(1, luz(c, -0.45)); return g; }

  function lobo(ctx, P, frame, grande) {
    const p = frame ? (frame === 1 ? 2 : -2) : 0;
    // Cola tupida
    ctx.beginPath(); ctx.moveTo(30, 58); ctx.bezierCurveTo(18, 54, 10, 46, 8, 36); ctx.lineTo(12, 40); ctx.lineTo(11, 33); ctx.lineTo(16, 40); ctx.lineTo(16, 34); ctx.bezierCurveTo(20, 46, 26, 50, 33, 52); ctx.closePath(); trazo(ctx, cuerpoGrad(ctx, 33, 58, P.C));
    // Patas de atrás (lejos)
    const pata = (x, o, c) => { ctx.beginPath(); ctx.moveTo(x - 4, 62); ctx.quadraticCurveTo(x - 6, 72, x - 2 + o, 78); ctx.lineTo(x - 3 + o, 90); ctx.lineTo(x + 2.6 + o, 90); ctx.lineTo(x + 2 + o, 78); ctx.quadraticCurveTo(x + 4, 70, x + 4, 62); ctx.closePath(); trazo(ctx, cil(ctx, x - 6, x + 5, c), 1); ctx.beginPath(); ctx.ellipse(x + o, 90.6, 3.4, 1.6, 0, 0, Math.PI * 2); trazo(ctx, luz(c, -0.3), 0.8); };
    pata(36, -p, luz(P.D, -0.2)); pata(62, p, luz(P.D, -0.2));
    // Cuerpo con lomo erizado
    ctx.beginPath(); ctx.moveTo(30, 56);
    for (let i = 0; i <= 8; i++) ctx.lineTo(30 + i * 5, 48 - Math.sin(i * 0.9) * 2 - (i % 2 ? 3 : 0));
    ctx.quadraticCurveTo(74, 48, 74, 58); ctx.quadraticCurveTo(70, 70, 60, 68); ctx.quadraticCurveTo(48, 72, 38, 68); ctx.quadraticCurveTo(28, 66, 30, 56); ctx.closePath();
    trazo(ctx, cuerpoGrad(ctx, 46, 72, P.C), 1.2);
    pelaje(ctx, [36, 54, 39, 58, 44, 52, 47, 57, 52, 53, 55, 58, 60, 52, 62, 57], luz(P.C, -0.4));
    // Patas de adelante (cerca)
    pata(42, p, P.D); pata(68, -p, P.D);
    // Cuello y melena
    ctx.beginPath(); ctx.moveTo(64, 50); ctx.lineTo(66, 42); ctx.lineTo(69, 46); ctx.lineTo(72, 38); ctx.lineTo(74, 44); ctx.lineTo(78, 40); ctx.quadraticCurveTo(84, 54, 76, 64); ctx.lineTo(68, 62); ctx.closePath(); trazo(ctx, cuerpoGrad(ctx, 38, 64, luz(P.C, 0.1)));
    // Cabeza: hocico largo y fauces abiertas
    ctx.beginPath(); ctx.moveTo(72, 42); ctx.quadraticCurveTo(80, 36, 86, 40); ctx.lineTo(97, 46); ctx.quadraticCurveTo(99, 49, 96, 50); ctx.lineTo(86, 50); ctx.quadraticCurveTo(78, 52, 74, 50); ctx.closePath(); trazo(ctx, cuerpoGrad(ctx, 36, 52, P.C), 1.1);
    ctx.beginPath(); ctx.moveTo(77, 52); ctx.lineTo(95, 53.4); ctx.quadraticCurveTo(94, 57, 90, 57); ctx.lineTo(80, 56); ctx.closePath(); trazo(ctx, cuerpoGrad(ctx, 52, 57, luz(P.C, -0.1)), 1);
    ctx.beginPath(); ctx.moveTo(80, 50.4); ctx.lineTo(96, 50.2); ctx.lineTo(94, 53.4); ctx.lineTo(80, 52.6); ctx.closePath(); ctx.fillStyle = '#3a0e14'; ctx.fill();
    dientes(ctx, 82, 50.2, 95, 6, 1.8, true); dientes(ctx, 82, 53.2, 93, 5, 1.6, false);
    circulo(ctx, 97.2, 47.4, 1.1); ctx.fillStyle = '#100c10'; ctx.fill();
    [[74, 40], [79, 38]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x - 2, y + 2); ctx.lineTo(x - 4, y - 8); ctx.lineTo(x + 3, y + 1); ctx.closePath(); trazo(ctx, cil(ctx, x - 4, x + 3, P.D), 0.9); });
    ctx.beginPath(); ctx.moveTo(79, 44); ctx.lineTo(84, 42.4); ctx.lineWidth = 1.4; ctx.strokeStyle = LIN; ctx.stroke();
    ojoBrillante(ctx, 82, 44.4, 1.3, P.E);
    if (grande) { ctx.save(); ctx.globalCompositeOperation = 'destination-over'; const g = ctx.createRadialGradient(50, 60, 4, 50, 60, 46); g.addColorStop(0, P.E + '55'); g.addColorStop(1, P.E + '00'); ctx.fillStyle = g; ctx.fillRect(0, 10, 100, 90); ctx.restore(); }
  }
  function arana(ctx, P, frame) {
    const p = frame ? (frame === 1 ? 2 : -2) : 0;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 0; i < 4; i++) [[-1], [1]].forEach(([s]) => {
      const bx = 58 + s * 3, by = 70, kx = bx + s * (14 + i * 4), ky = 50 + i * 5 + (i % 2 ? p : -p), fx = bx + s * (20 + i * 5), fy = 92;
      [[6, LIN], [4, luz(P.D, 0.1)]].forEach(([w, c]) => { ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.stroke(); });
      circulo(ctx, kx, ky, 2); trazo(ctx, P.D, 0.8);
      pelaje(ctx, [kx, ky, kx + s * 2, ky - 2, (kx + fx) / 2, (ky + fy) / 2, (kx + fx) / 2 + s * 2, (ky + fy) / 2 - 2], luz(P.D, 0.4), 0.8);
    });
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(38, 62, 22, 18, -0.15, 0, Math.PI * 2); trazo(ctx, cuerpoGrad(ctx, 44, 80, P.C), 1.2);
    ctx.save(); ctx.globalAlpha = 0.75; ctx.fillStyle = P.E;
    ctx.beginPath(); ctx.moveTo(38, 50); ctx.quadraticCurveTo(46, 56, 40, 64); ctx.quadraticCurveTo(34, 56, 38, 50); ctx.fill();
    circulo(ctx, 33, 58, 2.2); ctx.fill(); circulo(ctx, 43, 58, 2.2); ctx.fill(); ctx.restore();
    pelaje(ctx, [20, 60, 17, 57, 24, 50, 22, 46, 30, 46, 29, 42, 50, 50, 53, 47], luz(P.C, 0.4));
    ctx.beginPath(); ctx.ellipse(62, 70, 11, 9, 0, 0, Math.PI * 2); trazo(ctx, cuerpoGrad(ctx, 61, 79, P.C), 1.1);
    [[60, 66], [64, 65], [67, 67], [62, 69], [66, 70]].forEach(([x, y], i) => ojoBrillante(ctx, x, y, i < 2 ? 1.1 : 0.8, P.E));
    [[66, -1], [70, 1]].forEach(([x, s]) => { ctx.beginPath(); ctx.moveTo(x, 75); ctx.quadraticCurveTo(x + s * 3, 80, x + s, 84); ctx.lineWidth = 2.4; ctx.strokeStyle = '#f0e0d0'; ctx.stroke(); });
  }
  function murcielago(ctx, P, frame) {
    const a = frame === 1 ? -7 : frame === 2 ? 5 : 0;
    [[-1], [1]].forEach(([s]) => {
      ctx.beginPath(); ctx.moveTo(50 + s * 6, 46);
      ctx.lineTo(50 + s * 20, 30 + a); ctx.lineTo(50 + s * 34, 24 + a); ctx.lineTo(50 + s * 47, 34 + a);
      ctx.quadraticCurveTo(50 + s * 40, 40 + a * 0.5, 50 + s * 41, 50); ctx.quadraticCurveTo(50 + s * 34, 44, 50 + s * 30, 54); ctx.quadraticCurveTo(50 + s * 24, 48, 50 + s * 18, 58); ctx.quadraticCurveTo(50 + s * 12, 52, 50 + s * 7, 56); ctx.closePath();
      const g = ctx.createLinearGradient(50, 24, 50 + s * 47, 58); g.addColorStop(0, luz(P.D, 0.2)); g.addColorStop(1, luz(P.D, -0.35)); trazo(ctx, g, 1.1);
      [[20, 30, 30, 54], [34, 24, 41, 50], [47, 34, 41, 50], [34, 24, 18, 58]].forEach(([x1, y1, x2, y2]) => linea(ctx, [50 + s * x1, y1 + a * (y1 < 40 ? 1 : 0), 50 + s * x2, y2], luz(P.D, -0.5), 0.7));
    });
    ctx.beginPath(); ctx.ellipse(50, 52, 9, 12, 0, 0, Math.PI * 2); trazo(ctx, cuerpoGrad(ctx, 40, 64, P.C), 1.1);
    pelaje(ctx, [44, 46, 43, 50, 47, 48, 46, 53, 53, 48, 54, 53, 56, 46, 57, 50], luz(P.C, -0.4));
    [[-1], [1]].forEach(([s]) => { ctx.beginPath(); ctx.moveTo(50 + s * 3, 38); ctx.lineTo(50 + s * 8, 26); ctx.lineTo(50 + s * 8.6, 40); ctx.closePath(); trazo(ctx, cil(ctx, 50 + s * 3, 50 + s * 9, P.C), 0.9); });
    ctx.beginPath(); ctx.ellipse(50, 42, 7, 6, 0, 0, Math.PI * 2); trazo(ctx, cuerpoGrad(ctx, 36, 48, P.C), 1);
    ojoBrillante(ctx, 47, 41, 1.1, P.E); ojoBrillante(ctx, 53, 41, 1.1, P.E);
    ctx.beginPath(); ctx.moveTo(46.6, 45); ctx.quadraticCurveTo(50, 48.4, 53.4, 45); ctx.closePath(); ctx.fillStyle = '#3a0e14'; ctx.fill();
    dientes(ctx, 47, 45, 53, 3, 2, true);
    [[46], [54]].forEach(([x]) => { linea(ctx, [x, 63, x - 1, 67], LIN, 1.2); });
  }
  function espectro(ctx, P, frame, corona) {
    const o = frame === 1 ? 2 : frame === 2 ? -2 : 0;
    // Jirones de la túnica que se desvanecen
    const g = ctx.createLinearGradient(0, 20, 0, 94); g.addColorStop(0, luz(P.C, 0.15)); g.addColorStop(0.6, P.D); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.moveTo(30, 40); ctx.bezierCurveTo(28, 18, 40, 10, 50, 10); ctx.bezierCurveTo(60, 10, 72, 18, 70, 40); ctx.quadraticCurveTo(74, 60, 72, 74);
    for (let i = 0; i < 6; i++) { const x = 72 - i * 7.4; ctx.lineTo(x - 2, 94 + (i % 2 ? o : -o) - (i % 3) * 4); ctx.lineTo(x - 5, 80 + (i % 2) * 3); }
    ctx.quadraticCurveTo(26, 60, 30, 40); ctx.closePath();
    ctx.save(); ctx.globalAlpha = 0.92; ctx.fillStyle = g; ctx.fill(); ctx.restore();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(20,16,30,.6)'; ctx.stroke();
    [[38, 30, 34, 80], [50, 34, 50, 84], [62, 30, 66, 80]].forEach(([a, b, c, d]) => linea(ctx, [a, b, c, d], 'rgba(0,0,0,.25)', 0.9));
    // Capucha y oscuridad interior
    ctx.beginPath(); ctx.moveTo(35, 36); ctx.bezierCurveTo(34, 16, 44, 12, 50, 12); ctx.bezierCurveTo(56, 12, 66, 16, 65, 36); ctx.quadraticCurveTo(50, 32, 35, 36); trazo(ctx, cuerpoGrad(ctx, 12, 36, P.C), 1);
    ctx.beginPath(); ctx.ellipse(50, 28, 9, 10, 0, 0, Math.PI * 2); const gg = ctx.createRadialGradient(50, 30, 1, 50, 28, 10); gg.addColorStop(0, '#000'); gg.addColorStop(1, luz(P.D, -0.6)); ctx.fillStyle = gg; ctx.fill();
    ojoBrillante(ctx, 46.4, 28, 1.4, P.E); ojoBrillante(ctx, 53.6, 28, 1.4, P.E);
    // Manos huesudas con garras
    [[-1, o], [1, -o]].forEach(([s, oo]) => {
      ctx.beginPath(); ctx.moveTo(50 + s * 16, 42); ctx.quadraticCurveTo(50 + s * 26, 52 + oo, 50 + s * 26, 60 + oo); ctx.lineWidth = 6; ctx.strokeStyle = LIN; ctx.stroke(); ctx.lineWidth = 4.4; ctx.strokeStyle = luz(P.C, 0.05); ctx.stroke();
      for (let k = -1; k <= 1; k++) linea(ctx, [50 + s * 26 + k * 1.6, 61 + oo, 50 + s * 27 + k * 2.4, 67 + oo], '#d8d4c8', 1);
    });
    if (corona) for (let i = 0; i < 5; i++) { const x = 40 + i * 5, yy = i === 2 ? 4 : 8; ctx.beginPath(); ctx.moveTo(x - 2.2, yy + 7); ctx.lineTo(x, yy); ctx.lineTo(x + 2.2, yy + 7); ctx.closePath(); trazo(ctx, grad(ctx, yy, yy + 7, '#fff2b0', '#a8762a'), 0.8); }
  }
  function golem(ctx, P, frame) {
    const p = frame ? (frame === 1 ? 2 : -2) : 0;
    const roca = (pts, c) => { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); trazo(ctx, cuerpoGrad(ctx, Math.min(...pts.filter((_, i) => i % 2)), Math.max(...pts.filter((_, i) => i % 2)), c), 1.2); };
    roca([32, 74 - p, 46, 72 - p, 47, 92, 30, 92], P.D); roca([54, 72 + p, 68, 74 + p, 70, 92, 53, 92], P.D);
    roca([12, 44, 28, 40, 32, 62, 26, 82, 12, 80, 8, 60], P.C); roca([72, 40, 88, 44, 92, 60, 88, 80, 74, 82, 68, 62], P.C);
    roca([28, 36, 50, 30, 72, 36, 76, 58, 66, 76, 34, 76, 24, 58], P.C);
    linea(ctx, [38, 42, 44, 52, 41, 62], luz(P.D, -0.4), 1); linea(ctx, [62, 40, 57, 50, 61, 58], luz(P.D, -0.4), 1); linea(ctx, [16, 54, 22, 62], luz(P.D, -0.4), 0.9);
    ctx.save(); ctx.fillStyle = '#5a8a3a'; ctx.globalAlpha = 0.7; [[30, 38, 6], [70, 40, 5], [12, 46, 4]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.5, 0, 0, Math.PI * 2); ctx.fill(); }); ctx.restore();
    ctx.save(); ctx.shadowColor = P.A; ctx.shadowBlur = 10; ctx.strokeStyle = P.A; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(46, 54); ctx.lineTo(50, 48); ctx.lineTo(54, 54); ctx.lineTo(50, 60); ctx.closePath(); ctx.stroke(); linea(ctx, [50, 48, 50, 60], P.A, 1); ctx.restore();
    roca([38, 16, 62, 16, 64, 34, 50, 38, 36, 34], P.C);
    ojoBrillante(ctx, 45, 26, 1.6, P.E); ojoBrillante(ctx, 55, 26, 1.6, P.E);
    linea(ctx, [41, 22, 48, 24], LIN, 1.4); linea(ctx, [59, 22, 52, 24], LIN, 1.4);
  }

  // ---------- Demonios, dragones y no-muertos ----------
  function alasDemonio(ctx, P, cx, cy, ancho, alto, a) {
    [[-1], [1]].forEach(([s]) => {
      const hx = cx + s * ancho * 0.18, hy = cy - alto * 0.55 + a;
      const puntas = [[cx + s * ancho * 0.55, cy - alto + a], [cx + s * ancho, cy - alto * 0.62 + a], [cx + s * ancho * 0.92, cy - alto * 0.08], [cx + s * ancho * 0.7, cy + alto * 0.18]];
      ctx.beginPath(); ctx.moveTo(cx + s * 4, cy); ctx.lineTo(hx, hy);
      puntas.forEach(([x, y], i) => { const prev = i ? puntas[i - 1] : [hx, hy]; ctx.quadraticCurveTo((prev[0] + x) / 2 - s * 3, (prev[1] + y) / 2 + 6, x, y); });
      ctx.quadraticCurveTo(cx + s * ancho * 0.4, cy + alto * 0.05, cx + s * 6, cy + alto * 0.25); ctx.closePath();
      const g = ctx.createLinearGradient(cx, cy - alto, cx + s * ancho, cy); g.addColorStop(0, luz(P.D, 0.15)); g.addColorStop(1, luz(P.D, -0.4)); trazo(ctx, g, 1.1);
      puntas.forEach(([x, y]) => linea(ctx, [hx, hy, x, y], luz(P.D, -0.55), 1.1));
      linea(ctx, [cx + s * 4, cy, hx, hy], luz(P.D, -0.55), 1.6);
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + s * 2, hy - 4); ctx.lineTo(hx + s * 3, hy + 1); ctx.closePath(); trazo(ctx, '#e8dcc0', 0.6);
    });
  }
  function cuernosR(ctx, cx, cy, tam, c = '#d8ccb0') {
    [[-1], [1]].forEach(([s]) => {
      ctx.beginPath(); ctx.moveTo(cx + s * tam * 0.4, cy);
      ctx.bezierCurveTo(cx + s * tam * 1.6, cy - tam * 0.1, cx + s * tam * 1.8, cy - tam * 1.3, cx + s * tam * 1.1, cy - tam * 1.9);
      ctx.bezierCurveTo(cx + s * tam * 1.25, cy - tam * 1.2, cx + s * tam, cy - tam * 0.6, cx + s * tam * 0.05, cy - tam * 0.35); ctx.closePath();
      trazo(ctx, cil(ctx, cx - tam * 2, cx + tam * 2, c), 1);
      for (let i = 1; i < 5; i++) { const t = i / 5; linea(ctx, [cx + s * tam * (0.4 + t * 0.9), cy - tam * t * 1.2, cx + s * tam * (0.15 + t * 1.0), cy - tam * (0.35 + t * 1.1)], luz(c, -0.4), 0.5); }
    });
  }
  function llamas(ctx, cx, cy, ancho) {
    for (let i = 0; i < 6; i++) {
      const x = cx - ancho / 2 + i * ancho / 5, h = 10 + ((i * 7) % 5) * 2.4;
      ctx.beginPath(); ctx.moveTo(x - 3.6, cy); ctx.bezierCurveTo(x - 4, cy - h * 0.5, x + 1, cy - h * 0.6, x, cy - h); ctx.bezierCurveTo(x + 4, cy - h * 0.5, x + 3, cy - h * 0.3, x + 3.6, cy); ctx.closePath();
      ctx.save(); ctx.globalAlpha = 0.88; ctx.fillStyle = grad(ctx, cy - h, cy, '#fff4b0', '#ff4a10'); ctx.shadowColor = '#ff6a1a'; ctx.shadowBlur = 6; ctx.fill(); ctx.restore();
    }
  }
  function diablillo(ctx, P, frame) {
    const a = frame === 1 ? -6 : frame === 2 ? 5 : 0;
    alasDemonio(ctx, P, 50, 56, 30, 22, a);
    ctx.beginPath(); ctx.moveTo(44, 72); ctx.bezierCurveTo(28, 82, 20, 72, 16, 60); ctx.lineWidth = 3; ctx.strokeStyle = LIN; ctx.stroke(); ctx.lineWidth = 1.8; ctx.strokeStyle = P.C; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(16, 54); ctx.lineTo(20, 62); ctx.lineTo(12, 62); ctx.closePath(); trazo(ctx, P.D, 0.8);
    [[45, 1], [55, -1]].forEach(([x, s]) => { ctx.beginPath(); ctx.moveTo(x - 3, 70); ctx.quadraticCurveTo(x - 5 * s, 80, x - s, 84); ctx.lineTo(x - s * 2, 91); ctx.lineTo(x + 2.4 - s, 91); ctx.lineTo(x + 2, 84); ctx.quadraticCurveTo(x + 3, 78, x + 3, 70); ctx.closePath(); trazo(ctx, cil(ctx, x - 4, x + 4, P.D), 0.9); });
    ctx.beginPath(); ctx.moveTo(42, 56); ctx.quadraticCurveTo(50, 52, 58, 56); ctx.quadraticCurveTo(60, 66, 56, 72); ctx.lineTo(44, 72); ctx.quadraticCurveTo(40, 66, 42, 56); trazo(ctx, cil(ctx, 40, 60, P.C), 1.1);
    linea(ctx, [50, 57, 50, 70], luz(P.C, -0.4), 0.6); linea(ctx, [45, 62, 49, 63], luz(P.C, -0.4), 0.5); linea(ctx, [55, 62, 51, 63], luz(P.C, -0.4), 0.5);
    [[-1], [1]].forEach(([s]) => { ctx.beginPath(); ctx.moveTo(50 + s * 7, 58); ctx.quadraticCurveTo(50 + s * 14, 64, 50 + s * 15, 70); ctx.lineWidth = 4.6; ctx.strokeStyle = LIN; ctx.stroke(); ctx.lineWidth = 3.2; ctx.strokeStyle = P.C; ctx.stroke(); for (let k = -1; k <= 1; k++) linea(ctx, [50 + s * 15 + k, 70, 50 + s * 15.6 + k * 1.6, 74], '#f0e6d0', 0.8); });
    cuernosR(ctx, 50, 38, 5);
    ctx.beginPath(); ctx.moveTo(42, 42); ctx.bezierCurveTo(42, 34, 58, 34, 58, 42); ctx.quadraticCurveTo(58, 52, 50, 54); ctx.quadraticCurveTo(42, 52, 42, 42); trazo(ctx, cil(ctx, 42, 58, P.C), 1.1);
    [[-1], [1]].forEach(([s]) => { ctx.beginPath(); ctx.moveTo(50 + s * 7.6, 42); ctx.lineTo(50 + s * 15, 37); ctx.lineTo(50 + s * 8.4, 47); ctx.closePath(); trazo(ctx, cil(ctx, 50, 50 + s * 15, P.C), 0.8); });
    linea(ctx, [44.6, 41.6, 48.4, 43], LIN, 1); linea(ctx, [55.4, 41.6, 51.6, 43], LIN, 1);
    ojoBrillante(ctx, 46.6, 44, 1, P.E); ojoBrillante(ctx, 53.4, 44, 1, P.E);
    ctx.beginPath(); ctx.moveTo(45, 48.4); ctx.quadraticCurveTo(50, 52, 55, 48.4); ctx.quadraticCurveTo(50, 50, 45, 48.4); ctx.fillStyle = '#2a0810'; ctx.fill();
    dientes(ctx, 45.6, 48.6, 54.4, 6, 1.4, true);
  }
  function demonio(ctx, P, frame, extra = {}) {
    const p = frame ? (frame === 1 ? 2 : -2) : 0;
    alasDemonio(ctx, P, 50, 44, 48, 34, frame === 1 ? -4 : 0);
    if (extra.capa) { ctx.beginPath(); ctx.moveTo(34, 40); ctx.quadraticCurveTo(22, 72, 26, 92); ctx.lineTo(74, 92); ctx.quadraticCurveTo(78, 72, 66, 40); ctx.closePath(); trazo(ctx, cil(ctx, 24, 76, '#3a0e2a'), 1.1); }
    // Patas de cabra con pezuñas
    [[41, p, 1], [59, -p, -1]].forEach(([x, o, s]) => {
      ctx.beginPath(); ctx.moveTo(x - 6, 64); ctx.quadraticCurveTo(x - 8, 74 + o, x - 2 * s, 78); ctx.quadraticCurveTo(x - 4 * s, 84, x - 2, 88); ctx.lineTo(x + 4, 88); ctx.quadraticCurveTo(x + 4 * s, 82, x + 4, 78); ctx.quadraticCurveTo(x + 7, 72, x + 6, 64); ctx.closePath();
      trazo(ctx, cil(ctx, x - 8, x + 7, P.D), 1.1);
      pelaje(ctx, [x - 4, 70, x - 5, 75, x, 70, x - 1, 76, x + 3, 69, x + 3, 74], luz(P.D, -0.45), 0.7);
      ctx.beginPath(); ctx.moveTo(x - 3, 87); ctx.lineTo(x + 5, 87); ctx.lineTo(x + 6, 93); ctx.lineTo(x - 4, 93); ctx.closePath(); trazo(ctx, '#1e1418', 0.9); linea(ctx, [x + 1, 88, x + 1, 93], '#3a2a30', 0.6);
    });
    // Taparrabo
    ctx.beginPath(); ctx.moveTo(38, 60); ctx.lineTo(62, 60); ctx.lineTo(58, 72); ctx.lineTo(50, 69); ctx.lineTo(42, 72); ctx.closePath(); trazo(ctx, cil(ctx, 38, 62, '#3a2a24'), 0.9);
    // Torso musculoso
    ctx.beginPath(); ctx.moveTo(30, 36); ctx.quadraticCurveTo(50, 30, 70, 36); ctx.quadraticCurveTo(72, 50, 63, 62); ctx.lineTo(37, 62); ctx.quadraticCurveTo(28, 50, 30, 36); trazo(ctx, cil(ctx, 30, 70, P.C), 1.3);
    ctx.save(); ctx.strokeStyle = luz(P.C, -0.45); ctx.lineWidth = 0.9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(50, 37); ctx.lineTo(50, 60); ctx.moveTo(38, 42); ctx.quadraticCurveTo(44, 46, 50, 43); ctx.quadraticCurveTo(56, 46, 62, 42);
    ctx.moveTo(44, 50); ctx.lineTo(48, 50.6); ctx.moveTo(52, 50.6); ctx.lineTo(56, 50); ctx.moveTo(44.6, 55.4); ctx.lineTo(48, 56); ctx.moveTo(52, 56); ctx.lineTo(55.4, 55.4); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(58, 40, 5, 3, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // Brazos con garras
    [[-1, p], [1, -p]].forEach(([s, o]) => {
      ctx.beginPath(); ctx.moveTo(50 + s * 18, 38); ctx.quadraticCurveTo(50 + s * 27, 46, 50 + s * 26, 54 + o); ctx.quadraticCurveTo(50 + s * 27, 62, 50 + s * 25, 68 + o);
      ctx.lineWidth = 11.4; ctx.strokeStyle = LIN; ctx.stroke(); ctx.lineWidth = 10; ctx.strokeStyle = s < 0 ? luz(P.C, -0.15) : luz(P.C, 0.05); ctx.stroke();
      linea(ctx, [50 + s * 25, 46, 50 + s * 27, 54], luz(P.C, -0.45), 0.7);
      for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(50 + s * 25 + k * 2.4, 71 + o); ctx.quadraticCurveTo(50 + s * 25 + k * 3, 75 + o, 50 + s * 24 + k * 3.4, 78 + o); ctx.lineWidth = 1.6; ctx.strokeStyle = '#efe6d2'; ctx.stroke(); }
    });
    // Cabeza
    cuernosR(ctx, 50, 25, extra.grande ? 9 : 8);
    ctx.beginPath(); ctx.moveTo(41, 24); ctx.bezierCurveTo(41, 13, 59, 13, 59, 24); ctx.quadraticCurveTo(59, 33, 54, 37); ctx.lineTo(46, 37); ctx.quadraticCurveTo(41, 33, 41, 24); trazo(ctx, cil(ctx, 41, 59, P.C), 1.2);
    ctx.beginPath(); ctx.moveTo(43, 22); ctx.lineTo(48.4, 25); ctx.moveTo(57, 22); ctx.lineTo(51.6, 25); ctx.lineWidth = 1.8; ctx.strokeStyle = LIN; ctx.stroke();
    ojoBrillante(ctx, 46.4, 26.4, 1.4, P.E); ojoBrillante(ctx, 53.6, 26.4, 1.4, P.E);
    linea(ctx, [49, 28, 48.6, 31, 51.4, 31, 51, 28], 'rgba(0,0,0,.4)', 0.6);
    ctx.beginPath(); ctx.moveTo(44, 33); ctx.quadraticCurveTo(50, 37.4, 56, 33); ctx.lineTo(55, 35); ctx.quadraticCurveTo(50, 37.6, 45, 35); ctx.closePath(); ctx.fillStyle = '#2a0810'; ctx.fill();
    dientes(ctx, 44.6, 33.2, 55.4, 7, 1.8, true);
    if (extra.corona) for (let i = 0; i < 5; i++) { const x = 42 + i * 4, yy = i === 2 ? 4 : 8; ctx.beginPath(); ctx.moveTo(x - 1.8, 15); ctx.lineTo(x, yy); ctx.lineTo(x + 1.8, 15); ctx.closePath(); trazo(ctx, grad(ctx, yy, 15, '#fff2b0', '#a8762a'), 0.7); }
    if (extra.llamas) { llamas(ctx, 50, 15, 22); llamas(ctx, 31, 38, 10); llamas(ctx, 69, 38, 10); }
  }
  function gargola(ctx, P, frame) {
    const a = frame === 1 ? -4 : 0;
    alasDemonio(ctx, P, 50, 50, 38, 26, a);
    const piedra = c => cil(ctx, 20, 80, c);
    [[38, 1], [62, -1]].forEach(([x, s]) => { ctx.beginPath(); ctx.moveTo(x - 8, 70); ctx.quadraticCurveTo(x - 10, 86, x - 4, 90); ctx.lineTo(x + 8, 90); ctx.quadraticCurveTo(x + 6, 78, x + 6, 70); ctx.closePath(); trazo(ctx, piedra(P.D), 1.1); for (let k = 0; k < 3; k++) linea(ctx, [x - 3 + k * 3, 90, x - 3 + k * 3.4, 93], '#2a2a30', 1.4); });
    ctx.beginPath(); ctx.moveTo(34, 52); ctx.quadraticCurveTo(50, 44, 66, 52); ctx.quadraticCurveTo(70, 66, 62, 76); ctx.lineTo(38, 76); ctx.quadraticCurveTo(30, 66, 34, 52); trazo(ctx, piedra(P.C), 1.2);
    linea(ctx, [40, 56, 45, 64, 43, 72], luz(P.D, -0.4), 0.8); linea(ctx, [60, 54, 56, 62], luz(P.D, -0.4), 0.8);
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 20; i++) { circulo(ctx, 36 + (i * 37) % 28, 52 + (i * 23) % 22, 0.7); ctx.fill(); } ctx.restore();
    [[-1], [1]].forEach(([s]) => { ctx.beginPath(); ctx.moveTo(50 + s * 14, 54); ctx.quadraticCurveTo(50 + s * 20, 66, 50 + s * 18, 80); ctx.lineWidth = 7.4; ctx.strokeStyle = LIN; ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = P.C; ctx.stroke(); for (let k = -1; k <= 1; k++) linea(ctx, [50 + s * 18 + k * 1.8, 81, 50 + s * 18 + k * 2.4, 85], '#d8d8e0', 1.1); });
    cuernosR(ctx, 50, 38, 5.5, '#9a9aa4');
    ctx.beginPath(); ctx.moveTo(42, 40); ctx.bezierCurveTo(42, 31, 58, 31, 58, 40); ctx.quadraticCurveTo(58, 46, 54, 48); ctx.lineTo(50, 54); ctx.lineTo(46, 48); ctx.quadraticCurveTo(42, 46, 42, 40); trazo(ctx, piedra(P.C), 1.1);
    linea(ctx, [44, 38.6, 48.4, 40.6], LIN, 1.4); linea(ctx, [56, 38.6, 51.6, 40.6], LIN, 1.4);
    ojoBrillante(ctx, 46.6, 41.6, 1.1, P.E); ojoBrillante(ctx, 53.4, 41.6, 1.1, P.E);
    dientes(ctx, 46.6, 48, 53.4, 4, 2, true);
  }
  function esqueleto(ctx, P, frame, lich) {
    const p = frame ? (frame === 1 ? 2 : -2) : 0;
    const hueso = '#e8dfca', sombraH = '#9a8e76';
    const hb = (x1, y1, x2, y2, w) => { ctx.save(); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineWidth = w + 1.4; ctx.strokeStyle = LIN; ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = hueso; ctx.stroke(); [[x1, y1], [x2, y2]].forEach(([x, y]) => { circulo(ctx, x, y, w * 0.75); trazo(ctx, hueso, 0.6); }); ctx.restore(); };
    if (lich) {
      const g = ctx.createLinearGradient(0, 30, 0, 94); g.addColorStop(0, luz(P.C, 0.1)); g.addColorStop(1, luz(P.D, -0.4));
      ctx.beginPath(); ctx.moveTo(36, 34); ctx.quadraticCurveTo(28, 62, 28, 88); for (let i = 0; i < 6; i++) ctx.lineTo(30 + i * 8, 92 - (i % 2) * 5); ctx.quadraticCurveTo(72, 62, 64, 34); ctx.quadraticCurveTo(50, 30, 36, 34); trazo(ctx, g, 1.1);
      [[40, 38, 36, 88], [50, 40, 50, 90], [60, 38, 64, 88]].forEach(([a, b, c, d]) => linea(ctx, [a, b, c, d], 'rgba(0,0,0,.3)', 0.8));
      linea(ctx, [44, 34, 50, 56, 56, 34], P.A, 1.2);
      ctx.save(); ctx.translate(70, 50); rr(ctx, -1.4, -36, 2.8, 80, 1.2); trazo(ctx, cil(ctx, -2, 2, '#3a2a30'), 0.9);
      ctx.beginPath(); ctx.moveTo(-4, -34); ctx.quadraticCurveTo(-6, -40, 0, -44); ctx.quadraticCurveTo(6, -40, 4, -34); ctx.lineWidth = 1.4; ctx.strokeStyle = '#3a2a30'; ctx.stroke();
      ojoBrillante(ctx, 0, -39, 2.6, P.E); ctx.restore();
      hb(36, 40, 30, 56, 2.6); hb(64, 40, 68, 52, 2.6);
      for (let k = -1; k <= 1; k++) { linea(ctx, [30 + k * 1.4, 57, 29 + k * 2, 62], hueso, 0.9); linea(ctx, [68 + k * 1.4, 53, 70 + k * 1.2, 57], hueso, 0.9); }
    } else {
      hb(44, 60, 42 - p, 76, 2.6); hb(42 - p, 76, 43 - p, 90, 2.3); hb(56, 60, 58 + p, 76, 2.6); hb(58 + p, 76, 57 + p, 90, 2.3);
      ctx.beginPath(); ctx.moveTo(40, 58); ctx.quadraticCurveTo(50, 54, 60, 58); ctx.lineTo(56, 63); ctx.lineTo(44, 63); ctx.closePath(); trazo(ctx, hueso, 0.9);
      ctx.save(); ctx.lineCap = 'round'; for (let i = 0; i < 9; i++) { circulo(ctx, 50, 32 + i * 3, 1.3); trazo(ctx, hueso, 0.5); } ctx.restore();
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(50, 37 + i * 4, 10 - i * 1.2, 2.6, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 3.4; ctx.strokeStyle = LIN; ctx.stroke(); ctx.lineWidth = 2.2; ctx.strokeStyle = hueso; ctx.stroke(); }
      linea(ctx, [38, 33, 62, 33], hueso, 2.2);
      hb(38, 34, 34, 47, 2.2); hb(34, 47, 33, 58, 2); hb(62, 34, 66, 47, 2.2); hb(66, 47, 66, 58, 2);
      ctx.save(); ctx.translate(66, 58); ctx.scale(0.85, 0.85); dibujarArma(ctx, 'espada', 0, 0, { A:'#6a5a4a', m1:'#a8a090' }); ctx.restore();
      ctx.beginPath(); ctx.arc(29, 54, 9, 0, Math.PI * 2); trazo(ctx, cil(ctx, 20, 38, '#6a4a2a'), 1.1); circulo(ctx, 29, 54, 6); ctx.lineWidth = 1.2; ctx.strokeStyle = '#8a8a92'; ctx.stroke(); circulo(ctx, 29, 54, 2.2); trazo(ctx, '#9a9aa2', 0.7);
      linea(ctx, [24, 50, 27, 55], 'rgba(0,0,0,.4)', 0.8);
    }
    // Calavera
    ctx.beginPath(); ctx.moveTo(42, 22); ctx.bezierCurveTo(42, 11, 58, 11, 58, 22); ctx.quadraticCurveTo(58, 27, 55, 29); ctx.lineTo(55, 32); ctx.lineTo(45, 32); ctx.lineTo(45, 29); ctx.quadraticCurveTo(42, 27, 42, 22); trazo(ctx, cil(ctx, 42, 58, hueso), 1.1);
    [[46.4], [53.6]].forEach(([x]) => { ctx.beginPath(); ctx.ellipse(x, 22.4, 2.4, 2.8, 0, 0, Math.PI * 2); ctx.fillStyle = '#120c14'; ctx.fill(); ojoBrillante(ctx, x, 22.6, 0.8, P.E); });
    ctx.beginPath(); ctx.moveTo(50, 25); ctx.lineTo(48.8, 27.6); ctx.lineTo(51.2, 27.6); ctx.closePath(); ctx.fillStyle = '#120c14'; ctx.fill();
    for (let i = 0; i < 5; i++) linea(ctx, [46 + i * 2, 29.4, 46 + i * 2, 32], sombraH, 0.5);
    linea(ctx, [44, 16, 47, 19], 'rgba(0,0,0,.3)', 0.5);
    if (lich) { ctx.beginPath(); ctx.moveTo(38, 30); ctx.bezierCurveTo(36, 12, 44, 8, 50, 8); ctx.bezierCurveTo(56, 8, 64, 12, 62, 30); ctx.quadraticCurveTo(58, 18, 50, 16); ctx.quadraticCurveTo(42, 18, 38, 30); trazo(ctx, cil(ctx, 36, 64, P.C), 1); for (let i = 0; i < 5; i++) { const x = 42 + i * 4, yy = i === 2 ? 3 : 6; ctx.beginPath(); ctx.moveTo(x - 1.6, 12); ctx.lineTo(x, yy); ctx.lineTo(x + 1.6, 12); ctx.closePath(); trazo(ctx, grad(ctx, yy, 12, '#d8ffd0', P.A), 0.6); } }
  }
  function salamandra(ctx, P, frame) {
    const p = frame ? (frame === 1 ? 3 : -3) : 0;
    ctx.beginPath(); ctx.moveTo(30, 70); ctx.bezierCurveTo(16, 74, 8, 66, 2, 58); ctx.bezierCurveTo(10, 62, 18, 64, 32, 64); ctx.closePath(); trazo(ctx, cuerpoGrad(ctx, 58, 74, P.C), 1);
    [[34, p], [44, -p], [60, p], [70, -p]].forEach(([x, o]) => { ctx.beginPath(); ctx.moveTo(x, 70); ctx.quadraticCurveTo(x + o - 6, 78, x + o - 4, 88); ctx.lineWidth = 5.4; ctx.strokeStyle = LIN; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = P.D; ctx.stroke(); for (let k = -1; k <= 1; k++) linea(ctx, [x + o - 4, 88, x + o - 4 + k * 2.4, 91], LIN, 0.9); });
    ctx.beginPath(); ctx.ellipse(52, 68, 24, 8.6, 0, 0, Math.PI * 2); trazo(ctx, cuerpoGrad(ctx, 60, 77, P.C), 1.2);
    ctx.save(); ctx.beginPath(); ctx.ellipse(52, 68, 24, 8.6, 0, 0, Math.PI * 2); ctx.clip(); for (let y = 60; y < 78; y += 3) for (let x = 28; x < 78; x += 4) { ctx.beginPath(); ctx.arc(x + (y % 6 ? 2 : 0), y, 2, 0, Math.PI); ctx.strokeStyle = luz(P.C, -0.35); ctx.lineWidth = 0.4; ctx.stroke(); } ctx.restore();
    ctx.beginPath(); ctx.moveTo(72, 62); ctx.quadraticCurveTo(80, 58, 92, 62); ctx.quadraticCurveTo(94, 66, 90, 68); ctx.lineTo(76, 70); ctx.closePath(); trazo(ctx, cuerpoGrad(ctx, 58, 70, P.C), 1.1);
    linea(ctx, [80, 66.4, 91, 65.6], LIN, 0.8); ojoBrillante(ctx, 82, 62, 1.2, '#ffe25a');
    llamas(ctx, 50, 60, 36);
  }
  function dragon(ctx, P, frame, extra = {}) {
    ctx.save(); ctx.translate(3, 9); ctx.scale(0.86, 0.86); // que entre entero en el cuadro
    dragonCuerpo(ctx, P, frame, extra);
    ctx.restore();
  }
  function dragonCuerpo(ctx, P, frame, extra) {
    const a = frame === 1 ? -6 : frame === 2 ? 4 : 0;
    // Aura oscura detrás de los dragones grandes
    if (extra.fuego || extra.ojos) { const g = ctx.createRadialGradient(56, 50, 6, 56, 50, 52); g.addColorStop(0, 'rgba(255,60,20,.22)'); g.addColorStop(0.5, 'rgba(60,0,20,.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 100, 100); }
    const ala = (x0, y0, puntas, c) => {
      ctx.beginPath(); ctx.moveTo(x0, y0);
      puntas.forEach(([x, y], i) => {
        if (!i) { ctx.lineTo(x, y); return; }
        const pr = puntas[i - 1], mx = (pr[0] + x) / 2 + 2, my = (pr[1] + y) / 2 + 8;
        // Membrana desgarrada: muescas entre los dedos del ala
        ctx.lineTo((pr[0] + mx) / 2, (pr[1] + my) / 2 + 2); ctx.lineTo(mx - 1, my - 3); ctx.lineTo(mx + 1.5, my + 1); ctx.lineTo((mx + x) / 2, (my + y) / 2 + 2); ctx.lineTo(x, y);
      });
      ctx.closePath(); const g = ctx.createLinearGradient(x0, y0, puntas[0][0], puntas[0][1]); g.addColorStop(0, luz(c, -0.35)); g.addColorStop(1, luz(c, 0.05)); trazo(ctx, g, 1.2);
      puntas.slice(1).forEach(([x, y]) => { linea(ctx, [puntas[0][0], puntas[0][1], x, y], luz(c, -0.6), 1.1); linea(ctx, [(puntas[0][0] + x) / 2, (puntas[0][1] + y) / 2, (puntas[0][0] + x) / 2 + 4, (puntas[0][1] + y) / 2 + 5], luz(c, -0.5), 0.4); });
      linea(ctx, [x0, y0, puntas[0][0], puntas[0][1]], luz(c, -0.6), 2.4);
      ctx.beginPath(); ctx.moveTo(puntas[0][0], puntas[0][1]); ctx.lineTo(puntas[0][0] - 2, puntas[0][1] - 5); ctx.lineTo(puntas[0][0] + 2, puntas[0][1] - 1); ctx.closePath(); trazo(ctx, '#e8dcc0', 0.6);
    };
    ala(52, 52, [[30, 6 + a], [10, 14 + a], [6, 32], [16, 44], [32, 50]], luz(P.D, -0.2));
    // Cola larga con púas y punta de lanza
    ctx.beginPath(); ctx.moveTo(34, 72); ctx.bezierCurveTo(20, 84, 4, 80, 0, 64); ctx.bezierCurveTo(8, 72, 20, 71, 32, 64); ctx.closePath(); trazo(ctx, cuerpoGrad(ctx, 62, 82, P.C), 1.1);
    ctx.beginPath(); ctx.moveTo(0, 64); ctx.lineTo(-6, 54); ctx.lineTo(4, 61); ctx.lineTo(-3, 72); ctx.closePath(); trazo(ctx, cil(ctx, -6, 4, P.A), 0.9);
    for (let i = 0; i < 5; i++) { const x = 6 + i * 5.4, y = 71 + Math.sin(i) * 1.5; ctx.beginPath(); ctx.moveTo(x - 2, y - 1); ctx.lineTo(x + 1, y - 7); ctx.lineTo(x + 2.4, y - 1); ctx.closePath(); trazo(ctx, P.A, 0.6); }
    // Patas con garras largas
    [[40, 0], [62, 1]].forEach(([x, i]) => {
      const o = frame ? (i ? 2 : -2) : 0;
      ctx.beginPath(); ctx.moveTo(x - 7, 70); ctx.quadraticCurveTo(x - 9, 80 + o, x - 3, 84); ctx.lineTo(x - 4, 90); ctx.lineTo(x + 6, 90); ctx.lineTo(x + 4, 82); ctx.quadraticCurveTo(x + 8, 76, x + 7, 70); ctx.closePath(); trazo(ctx, cil(ctx, x - 9, x + 8, P.D), 1.1);
      for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(x - 3 + k * 3.8, 89); ctx.quadraticCurveTo(x - 1 + k * 3.8, 93, x - 5 + k * 3.8, 96); ctx.lineWidth = 2.2; ctx.strokeStyle = LIN; ctx.stroke(); ctx.lineWidth = 1.4; ctx.strokeStyle = '#efe4cc'; ctx.stroke(); }
    });
    // Cuerpo escamado con fuego interior
    ctx.beginPath(); ctx.ellipse(50, 66, 24, 13, -0.08, 0, Math.PI * 2); trazo(ctx, cuerpoGrad(ctx, 53, 79, P.C), 1.3);
    ctx.save(); ctx.beginPath(); ctx.ellipse(50, 66, 24, 13, -0.08, 0, Math.PI * 2); ctx.clip();
    for (let y = 53; y < 76; y += 3) for (let x = 24; x < 76; x += 3.8) { ctx.beginPath(); ctx.arc(x + (Math.round(y) % 2 ? 1.9 : 0), y, 2.1, 0.15, Math.PI - 0.15); ctx.strokeStyle = luz(P.C, -0.5); ctx.lineWidth = 0.55; ctx.stroke(); }
    ctx.fillStyle = cil(ctx, 34, 70, P.A); ctx.beginPath(); ctx.ellipse(53, 74, 18, 5.4, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 8; i++) linea(ctx, [38 + i * 4, 69, 38 + i * 4, 80], luz(P.A, -0.45), 0.7);
    if (extra.fuego) { ctx.save(); ctx.shadowColor = '#ff5a10'; ctx.shadowBlur = 8; [[46, 70, 50, 77], [54, 69, 52, 78], [60, 70, 63, 76]].forEach(([x1, y1, x2, y2]) => linea(ctx, [x1, y1, (x1 + x2) / 2 + 1.5, (y1 + y2) / 2, x2, y2], '#ffb040', 1.2)); ctx.restore(); }
    ctx.restore();
    linea(ctx, [36, 60, 46, 62], 'rgba(255,255,255,.25)', 1.4);
    // Cuello grueso con espinas grandes
    ctx.beginPath(); ctx.moveTo(60, 60); ctx.bezierCurveTo(68, 52, 68, 40, 72, 28); ctx.lineTo(82, 31); ctx.bezierCurveTo(79, 44, 79, 58, 71, 70); ctx.closePath(); trazo(ctx, cuerpoGrad(ctx, 28, 70, P.C), 1.3);
    for (let i = 0; i < 6; i++) { const x = 64 + i * 1.6, y = 60 - i * 6.2; ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x - 7, y - 3); ctx.lineTo(x + 1.6, y - 3); ctx.closePath(); trazo(ctx, cil(ctx, x - 7, x + 2, P.A), 0.7); }
    for (let i = 0; i < 6; i++) linea(ctx, [71 + i * 0.9, 60 - i * 5, 78 + i * 0.5, 59 - i * 5], luz(P.A, -0.25), 0.9);
    // Cabeza angular, mandíbula abierta
    const hx = 0;
    ctx.beginPath(); ctx.moveTo(68, 28); ctx.lineTo(74, 20); ctx.lineTo(84, 19); ctx.lineTo(92, 23); ctx.lineTo(100, 27); ctx.lineTo(99, 30); ctx.lineTo(90, 31); ctx.lineTo(80, 32); ctx.quadraticCurveTo(72, 34, 68, 28); ctx.closePath();
    trazo(ctx, cuerpoGrad(ctx, 18, 34, P.C), 1.3);
    // Mandíbula inferior bien abierta
    ctx.beginPath(); ctx.moveTo(76, 33); ctx.lineTo(96, 39); ctx.lineTo(95, 42); ctx.quadraticCurveTo(88, 43, 80, 39); ctx.closePath(); trazo(ctx, cuerpoGrad(ctx, 33, 43, luz(P.C, -0.15)), 1.2);
    // Boca: brasa adentro y colmillos largos
    ctx.beginPath(); ctx.moveTo(78, 31.6); ctx.lineTo(99, 30); ctx.lineTo(96, 39); ctx.lineTo(78, 34); ctx.closePath();
    const bg = ctx.createLinearGradient(78, 32, 98, 36); bg.addColorStop(0, '#2a0408'); bg.addColorStop(1, extra.fuego ? '#ff7a20' : '#6a1018'); ctx.fillStyle = bg; ctx.fill();
    dientes(ctx, 81, 31.3, 98, 7, 2.4, true); dientes(ctx, 81, 36.6, 95, 6, 2.2, false);
    ctx.beginPath(); ctx.moveTo(83, 31.6); ctx.lineTo(84, 36.4); ctx.lineTo(85.4, 31.4); ctx.closePath(); trazo(ctx, '#f8f0dc', 0.5);
    // Fosas con humo
    circulo(ctx, 98, 26.4, 0.9); ctx.fillStyle = '#100a10'; ctx.fill();
    ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#c8c0c8'; [[101, 22, 2.4], [104, 18, 3], [106, 13, 3.6]].forEach(([x, y, r]) => { circulo(ctx, x, y, r); ctx.fill(); }); ctx.restore();
    // Cuernos hacia atrás (varios)
    [[72, 21, 56, 12], [76, 19, 62, 4], [80, 19, 70, 2]].forEach(([x1, y1, x2, y2]) => { ctx.beginPath(); ctx.moveTo(x1 - 2, y1 + 2); ctx.quadraticCurveTo(x2 + 2, y2 + 8, x2, y2); ctx.quadraticCurveTo(x2 + 6, y2 + 6, x1 + 3, y1); ctx.closePath(); trazo(ctx, cil(ctx, x2 - 3, x1 + 3, extra.corona ? '#fff0c0' : '#d8c8a8'), 0.9); for (let k = 1; k < 4; k++) linea(ctx, [x1 + (x2 - x1) * k / 4, y1 + (y2 - y1) * k / 4, x1 + (x2 - x1) * k / 4 + 2.4, y1 + (y2 - y1) * k / 4 + 1], 'rgba(60,40,20,.5)', 0.5); });
    // Cresta ósea sobre el ojo y ojo de reptil
    ctx.beginPath(); ctx.moveTo(78, 23.4); ctx.lineTo(88, 22.6); ctx.lineTo(86, 25.4); ctx.closePath(); trazo(ctx, luz(P.C, -0.3), 0.8);
    const ojo = (x, y, r) => { ctx.save(); ctx.shadowColor = P.E; ctx.shadowBlur = 8; ctx.beginPath(); ctx.moveTo(x - r * 1.6, y); ctx.quadraticCurveTo(x, y - r * 1.3, x + r * 1.6, y + 0.3); ctx.quadraticCurveTo(x, y + r * 0.8, x - r * 1.6, y); ctx.fillStyle = P.E; ctx.fill(); ctx.restore(); ctx.beginPath(); ctx.ellipse(x, y, r * 0.22, r * 0.75, 0, 0, Math.PI * 2); ctx.fillStyle = '#0a0408'; ctx.fill(); };
    if (extra.ojos) { ojo(79, 26, 1.2); ojo(84, 25.4, 1.4); ojo(88.6, 27, 1.1); } else ojo(84, 26, 1.6);
    linea(ctx, [90, 29, 96, 28], luz(P.C, -0.5), 0.6); linea(ctx, [74, 30, 78, 32.4], luz(P.C, -0.5), 0.6);
    if (extra.fuego) { ctx.save(); ctx.globalAlpha = 0.9; ctx.shadowColor = '#ff6a1a'; ctx.shadowBlur = 10; ctx.fillStyle = grad(ctx, 28, 46, '#fff4b0', '#ff3a08'); ctx.beginPath(); ctx.moveTo(98, 33); ctx.quadraticCurveTo(106, 28, 104, 35); ctx.quadraticCurveTo(110, 38, 104, 41); ctx.quadraticCurveTo(106, 46, 98, 39); ctx.closePath(); ctx.fill(); ctx.restore(); }
    // Ala de adelante
    ala(56, 56, [[38, 0 + a], [18, 6 + a], [14, 26], [24, 40], [40, 48]], luz(P.D, -0.05));
  }
  function cancerbero(ctx, P, frame) {
    const p = frame ? (frame === 1 ? 2 : -2) : 0;
    ctx.beginPath(); ctx.moveTo(24, 60); ctx.bezierCurveTo(10, 54, 6, 40, 12, 32); ctx.bezierCurveTo(16, 44, 22, 50, 30, 54); ctx.closePath(); trazo(ctx, cuerpoGrad(ctx, 32, 60, P.C), 1.1);
    llamas(ctx, 12, 34, 8);
    const pata = (x, o, c) => { ctx.beginPath(); ctx.moveTo(x - 5, 64); ctx.quadraticCurveTo(x - 7, 76, x - 2 + o, 80); ctx.lineTo(x - 3 + o, 91); ctx.lineTo(x + 3 + o, 91); ctx.lineTo(x + 3 + o, 80); ctx.quadraticCurveTo(x + 5, 72, x + 5, 64); ctx.closePath(); trazo(ctx, cil(ctx, x - 7, x + 5, c), 1.1); for (let k = 0; k < 3; k++) linea(ctx, [x - 2 + o + k * 2.2, 91, x - 2.4 + o + k * 2.4, 94], '#efe6d0', 1); };
    pata(32, -p, luz(P.D, -0.2)); pata(62, p, luz(P.D, -0.2));
    ctx.beginPath(); ctx.moveTo(24, 58); for (let i = 0; i <= 9; i++) ctx.lineTo(24 + i * 5.4, 46 - (i % 2 ? 3 : 0)); ctx.quadraticCurveTo(78, 50, 76, 62); ctx.quadraticCurveTo(70, 74, 58, 72); ctx.quadraticCurveTo(40, 76, 30, 70); ctx.quadraticCurveTo(22, 66, 24, 58); ctx.closePath();
    trazo(ctx, cuerpoGrad(ctx, 44, 76, P.C), 1.3);
    pelaje(ctx, [30, 54, 33, 59, 38, 52, 41, 58, 46, 52, 49, 58, 54, 52, 56, 58, 62, 54, 64, 60], luz(P.C, -0.45), 0.7);
    llamas(ctx, 48, 48, 34);
    pata(40, p, P.D); pata(70, -p, P.D);
    const cabeza = (cx, cy, s) => {
      ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
      ctx.beginPath(); ctx.moveTo(-8, -2); ctx.quadraticCurveTo(-2, -10, 6, -6); ctx.lineTo(16, 0); ctx.quadraticCurveTo(17, 3, 14, 4); ctx.lineTo(4, 4); ctx.quadraticCurveTo(-4, 6, -8, 4); ctx.closePath(); trazo(ctx, cuerpoGrad(ctx, -10, 6, P.C), 1.1);
      ctx.beginPath(); ctx.moveTo(-2, 6); ctx.lineTo(14, 6.4); ctx.quadraticCurveTo(13, 10, 9, 10); ctx.lineTo(0, 9); ctx.closePath(); trazo(ctx, luz(P.C, -0.15), 1);
      ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(15, 4); ctx.lineTo(13.6, 6.6); ctx.lineTo(0, 6); ctx.closePath(); ctx.fillStyle = '#2a0810'; ctx.fill();
      dientes(ctx, 1, 4, 14, 6, 1.6, true); dientes(ctx, 1, 6.2, 12.6, 5, 1.4, false);
      ctx.beginPath(); ctx.moveTo(-4, -6); ctx.lineTo(-7, -15); ctx.lineTo(0, -7); ctx.closePath(); trazo(ctx, P.D, 0.8);
      ojoBrillante(ctx, 4, -2, 1.3, P.E); linea(ctx, [1, -4, 7, -4.6], LIN, 1.2);
      ctx.restore();
    };
    cabeza(66, 40, 1); cabeza(74, 52, 1.1); cabeza(68, 28, 0.9);
    rr(ctx, 58, 52, 20, 4.4, 2); trazo(ctx, '#2a2a34', 1);
    for (let i = 0; i < 4; i++) { const x = 60 + i * 5; ctx.beginPath(); ctx.moveTo(x - 1.6, 52); ctx.lineTo(x, 47.6); ctx.lineTo(x + 1.6, 52); ctx.closePath(); trazo(ctx, '#c8c8d0', 0.6); }
  }

  // ---------- Mascotas ----------
  function mascotaDibujo(ctx, tipo, P, frame) {
    const b = frame === 1 ? -2 : 0;
    ctx.save(); ctx.translate(0, b);
    if (tipo === 'zorro' || tipo === 'gato') {
      // Cola
      ctx.beginPath();
      if (tipo === 'zorro') { ctx.moveTo(32, 74); ctx.bezierCurveTo(10, 76, 8, 54, 20, 48); ctx.bezierCurveTo(22, 60, 30, 64, 38, 68); }
      else { ctx.moveTo(32, 74); ctx.bezierCurveTo(18, 70, 18, 52, 24, 44); ctx.bezierCurveTo(28, 52, 28, 64, 38, 70); }
      ctx.closePath(); relleno(ctx, grad(ctx, 44, 76, luz(P.C, 0.2), P.D));
      if (tipo === 'zorro') { circulo(ctx, 18, 52, 5); relleno(ctx, '#fff8ee'); }
      [[38], [46], [58], [66]].forEach(([x]) => { rr(ctx, x - 3.5, 76, 7, 16, 3.5); relleno(ctx, P.D); });
      elipse(ctx, 52, 74, 20, 10); relleno(ctx, grad(ctx, 64, 84, luz(P.C, 0.25), P.C));
      circulo(ctx, 68, 60, 13); relleno(ctx, gradR(ctx, 68, 60, 13, luz(P.C, 0.35), P.C));
      [[60], [74]].forEach(([x]) => { ctx.beginPath(); ctx.moveTo(x - 5, 52); ctx.lineTo(x, 40); ctx.lineTo(x + 5, 52); ctx.closePath(); relleno(ctx, P.C); });
      if (tipo === 'zorro') { ctx.beginPath(); ctx.moveTo(72, 62); ctx.quadraticCurveTo(84, 62, 84, 66); ctx.quadraticCurveTo(76, 70, 68, 68); ctx.closePath(); relleno(ctx, '#fff8ee'); circulo(ctx, 84, 65, 1.8); relleno(ctx, OUT, false); }
      [63.5, 72.5].forEach(x => { elipse(ctx, x, 58, 2.2, 3); ctx.fillStyle = tipo === 'gato' ? P.E : '#2a1f2e'; ctx.fill(); circulo(ctx, x + 0.7, 57, 0.9); ctx.fillStyle = '#fff'; ctx.fill(); });
      if (tipo === 'gato') { circulo(ctx, 64, 74, 3.5); relleno(ctx, grad(ctx, 70, 78, '#fff2b0', '#c8962a'), true, 1.4); }
    } else if (tipo === 'buho') {
      elipse(ctx, 50, 66, 20, 24); relleno(ctx, gradR(ctx, 50, 66, 24, luz(P.C, 0.3), P.D));
      elipse(ctx, 50, 72, 12, 14); ctx.fillStyle = luz(P.A, -0.05); ctx.fill();
      [[-1], [1]].forEach(([s]) => { ctx.beginPath(); ctx.moveTo(50 + s * 10, 46); ctx.lineTo(50 + s * 16, 36); ctx.lineTo(50 + s * 18, 50); ctx.closePath(); relleno(ctx, P.D); });
      [42, 58].forEach(x => { circulo(ctx, x, 56, 7); relleno(ctx, '#fff8ee', true, 1.6); circulo(ctx, x, 56, 4); ctx.fillStyle = P.E; ctx.fill(); circulo(ctx, x, 56, 2); ctx.fillStyle = OUT; ctx.fill(); });
      ctx.beginPath(); ctx.moveTo(47, 62); ctx.lineTo(50, 68); ctx.lineTo(53, 62); ctx.closePath(); relleno(ctx, '#ffb84a', true, 1.4);
      [44, 56].forEach(x => { rr(ctx, x - 3, 88, 6, 5, 2); relleno(ctx, '#ffb84a', true, 1.4); });
    } else if (tipo === 'tortuga') {
      [[34], [64]].forEach(([x]) => { rr(ctx, x - 4, 80, 8, 12, 4); relleno(ctx, P.A); });
      circulo(ctx, 80, 72, 8); relleno(ctx, P.A);
      circulo(ctx, 83, 70, 1.6); ctx.fillStyle = OUT; ctx.fill();
      ctx.beginPath(); ctx.moveTo(24, 82); ctx.bezierCurveTo(24, 50, 76, 50, 76, 82); ctx.closePath(); relleno(ctx, gradR(ctx, 50, 70, 26, luz(P.C, 0.35), P.D));
      ctx.save(); ctx.strokeStyle = luz(P.D, -0.2); ctx.lineWidth = 1.8;
      [[50, 64], [38, 72], [62, 72]].forEach(([x, y]) => { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.lineTo(x + Math.cos(a) * 6, y + Math.sin(a) * 5); } ctx.closePath(); ctx.stroke(); });
      ctx.restore();
    } else if (tipo === 'perro') {
      ctx.beginPath(); ctx.moveTo(30, 70); ctx.quadraticCurveTo(18, 60, 22, 50); ctx.quadraticCurveTo(28, 58, 34, 64); ctx.closePath(); relleno(ctx, P.D);
      [[36], [44], [58], [66]].forEach(([x]) => { rr(ctx, x - 4, 74, 8, 18, 4); relleno(ctx, grad(ctx, 74, 92, P.C, P.D)); });
      elipse(ctx, 50, 72, 21, 11); relleno(ctx, grad(ctx, 61, 83, luz(P.C, 0.25), P.C));
      elipse(ctx, 50, 77, 12, 5); ctx.fillStyle = P.A; ctx.globalAlpha = 0.7; ctx.fill(); ctx.globalAlpha = 1;
      circulo(ctx, 68, 56, 13); relleno(ctx, gradR(ctx, 68, 56, 13, luz(P.C, 0.35), P.C));
      ctx.beginPath(); ctx.moveTo(72, 58); ctx.quadraticCurveTo(86, 58, 85, 64); ctx.quadraticCurveTo(78, 68, 70, 66); ctx.closePath(); relleno(ctx, P.A);
      circulo(ctx, 85, 61.5, 2.2); relleno(ctx, OUT, false);
      [[58, -0.5], [72, 0.5]].forEach(([x, r]) => { ctx.beginPath(); ctx.ellipse(x, 52, 4.5, 10, r, 0, Math.PI * 2); relleno(ctx, P.D); });
      [64, 73].forEach(x => { elipse(ctx, x, 54, 2.2, 2.8); ctx.fillStyle = OUT; ctx.fill(); circulo(ctx, x + 0.6, 53, 0.9); ctx.fillStyle = '#fff'; ctx.fill(); });
      rr(ctx, 58, 64, 14, 4, 2); relleno(ctx, '#c83a3a', true, 1.4);
    } else if (tipo === 'halcon') {
      const a = frame === 1 ? -4 : 0;
      ctx.beginPath(); ctx.moveTo(44, 64); ctx.bezierCurveTo(26, 50 + a, 14, 52 + a, 8, 60 + a); ctx.quadraticCurveTo(20, 64, 30, 72); ctx.closePath(); relleno(ctx, grad(ctx, 50, 72, luz(P.C, 0.2), P.D));
      ctx.beginPath(); ctx.moveTo(42, 78); ctx.lineTo(34, 92); ctx.lineTo(48, 86); ctx.closePath(); relleno(ctx, P.D);
      elipse(ctx, 52, 70, 14, 17); relleno(ctx, gradR(ctx, 52, 70, 17, luz(P.C, 0.3), P.C));
      elipse(ctx, 54, 74, 8, 10); ctx.fillStyle = P.A; ctx.fill();
      circulo(ctx, 58, 50, 10); relleno(ctx, gradR(ctx, 58, 50, 10, luz(P.C, 0.3), P.C));
      ctx.beginPath(); ctx.moveTo(66, 50); ctx.quadraticCurveTo(74, 50, 72, 57); ctx.lineTo(66, 54); ctx.closePath(); relleno(ctx, '#ffc84a', true, 1.4);
      brillo(ctx, 61, 48, 2, P.E); circulo(ctx, 61, 48, 1); ctx.fillStyle = OUT; ctx.fill();
      [[48], [56]].forEach(([x]) => { rr(ctx, x - 2, 86, 4, 6, 2); relleno(ctx, '#ffc84a', true, 1.4); });
    } else if (tipo === 'conejo') {
      [[44, -0.25], [56, 0.25]].forEach(([x, r]) => { ctx.beginPath(); ctx.ellipse(x, 36, 5.5, 16, r, 0, Math.PI * 2); relleno(ctx, P.C); ctx.beginPath(); ctx.ellipse(x, 37, 2.5, 11, r, 0, Math.PI * 2); ctx.fillStyle = P.A; ctx.fill(); });
      elipse(ctx, 50, 76, 18, 15); relleno(ctx, gradR(ctx, 50, 76, 18, '#ffffff', P.D));
      circulo(ctx, 32, 80, 6); relleno(ctx, '#ffffff');
      circulo(ctx, 50, 56, 13); relleno(ctx, gradR(ctx, 50, 56, 13, '#ffffff', P.C));
      [45, 55].forEach(x => { elipse(ctx, x, 55, 2.2, 3); ctx.fillStyle = P.E; ctx.fill(); circulo(ctx, x + 0.6, 54, 0.9); ctx.fillStyle = '#fff'; ctx.fill(); });
      circulo(ctx, 50, 60, 1.8); ctx.fillStyle = '#ff8aa8'; ctx.fill();
      [[42], [58]].forEach(([x]) => { elipse(ctx, x, 90, 6, 3); relleno(ctx, '#ffffff', true, 1.6); });
    } else if (tipo === 'dragon') {
      const a = frame === 1 ? -5 : 0;
      ctx.beginPath(); ctx.moveTo(34, 76); ctx.bezierCurveTo(14, 80, 12, 64, 18, 60); ctx.bezierCurveTo(20, 68, 26, 70, 36, 70); ctx.closePath(); relleno(ctx, P.D);
      [[-1, 40], [1, 54]].forEach(([s, x]) => { ctx.beginPath(); ctx.moveTo(x, 62); ctx.bezierCurveTo(x - 6, 44 + a, x - 18, 40 + a, x - 22, 44 + a); ctx.quadraticCurveTo(x - 14, 50, x - 8, 66); ctx.closePath(); relleno(ctx, grad(ctx, 40, 66, luz(P.A, 0.2), P.A)); });
      [[42], [60]].forEach(([x]) => { rr(ctx, x - 4, 80, 8, 12, 4); relleno(ctx, P.D); });
      elipse(ctx, 50, 74, 17, 12); relleno(ctx, gradR(ctx, 50, 74, 17, luz(P.C, 0.3), P.C));
      elipse(ctx, 52, 78, 9, 6); ctx.fillStyle = luz(P.A, 0.3); ctx.fill();
      circulo(ctx, 66, 58, 12); relleno(ctx, gradR(ctx, 66, 58, 12, luz(P.C, 0.35), P.C));
      [[60], [70]].forEach(([x]) => { ctx.beginPath(); ctx.moveTo(x - 2, 48); ctx.lineTo(x + 1, 38); ctx.lineTo(x + 4, 48); ctx.closePath(); relleno(ctx, '#fff2d8', true, 1.4); });
      [62, 71].forEach(x => { elipse(ctx, x, 57, 2.4, 3.2); ctx.fillStyle = P.E; ctx.fill(); circulo(ctx, x + 0.6, 56, 0.9); ctx.fillStyle = '#fff'; ctx.fill(); });
    }
    ctx.restore();
  }

  // ---------- Entrada principal ----------
  function paleta(vis) {
    const C = vis.mascota ? MASCOTAS[vis.mascota] : (CLASES[vis.clase] || CLASES.recluta);
    const asp = Object.assign({}, C.asp, vis.t ? TINTES[vis.t] : null, vis.asp);
    const look = vis.look || {};
    const P = { asp, H: look.pelo || asp.H || '#3a2a1e', S: asp.S || look.piel || '#f2c9a0', C: asp.C, D: asp.D || luz(asp.C, -0.3), A: asp.A || '#e8c86a', E: asp.E || '#2a1f2e', B: asp.B || '#4a3426' };
    return { C, P };
  }
  const cache = new Map();
  // vis: { clase, look:{pelo,piel,barba,estilo}, t: tinte, arma, mascota }. vista: 'f' frente | 'b' espalda. frame: 0 quieto, 1-2 caminando.
  function personaje(vis, vista = 'f', frame = 0, expr = '') {
    const key = JSON.stringify([vis.clase, vis.look, vis.t, vis.arma, vista, vis.mascota, frame, vis.asp, expr]);
    if (cache.has(key)) return cache.get(key);
    const { C, P } = paleta(vis);
    const cv = lienzo(S, S), ctx = cv.getContext('2d');
    ctx.scale(U, U);
    dibujarVis(ctx, vis, vista, frame, expr, C, P);
    cache.set(key, cv);
    return cv;
  }
  function dibujarVis(ctx, vis, vista, frame, expr, C, P) {
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (vis.mascota) mascotaDibujo(ctx, C.spr, P, frame);
    else {
      const spr = C.spr || 'humano';
      if (spr === 'humano') humano(ctx, P, vis, vista, frame, expr);
      else if (spr === 'lobo') lobo(ctx, P, frame, (C.tam || 1) > 1.1);
      else if (spr === 'arana') arana(ctx, P, frame);
      else if (spr === 'murcielago') murcielago(ctx, P, frame);
      else if (spr === 'espectro') espectro(ctx, P, frame, vis.clase === 'voz');
      else if (spr === 'golem') golem(ctx, P, frame);
      else if (spr === 'diablillo') diablillo(ctx, P, frame);
      else if (spr === 'demonio') demonio(ctx, P, frame, C.extra || {});
      else if (spr === 'gargola') gargola(ctx, P, frame);
      else if (spr === 'esqueleto') esqueleto(ctx, P, frame, false);
      else if (spr === 'lich') esqueleto(ctx, P, frame, true);
      else if (spr === 'salamandra') salamandra(ctx, P, frame);
      else if (spr === 'dragon') dragon(ctx, P, frame, C.extra || {});
      else if (spr === 'cancerbero') cancerbero(ctx, P, frame);
    }
  }
  function retrato(vis, expr = '') {
    const key = 'r' + JSON.stringify(vis) + expr;
    if (cache.has(key)) return cache.get(key);
    const cv = lienzo(S, S), ctx = cv.getContext('2d');
    const { C, P } = paleta(vis);
    const humanoide = !vis.mascota && (!C.spr || C.spr === 'humano');
    if (humanoide) {
      // En el retrato se ve la cara: el yelmo cerrado pasa a ser un casco abierto.
      if (P.asp.g === 'yelmo') P.asp = Object.assign({}, P.asp, { g:'casco' });
      ctx.scale(U * 1.62, U * 1.62); ctx.translate(-19.2, -7); dibujarVis(ctx, Object.assign({}, vis, { arma:null }), 'f', 0, expr, C, P);
    }
    else { ctx.scale(U, U); dibujarVis(ctx, vis, 'f', 0, expr, C, P); }
    cache.set(key, cv);
    return cv;
  }

  // ---------- Terreno ----------
  const TERRENO = {
    g: { top:['#4e6e34', '#5e7e3c', '#40602a'], side:['#5a4430', '#4a3826'], pasa:true, pasto:true },
    f: { top:['#4e6e34', '#5e7e3c', '#40602a'], side:['#5a4430', '#4a3826'], pasa:true, pasto:true, flores:true },
    d: { top:['#8a7250', '#9a8058', '#76603e'], side:['#5e4a34', '#4e3e2a'], pasa:true },
    c: { top:['#86827a', '#96928a', '#6e6c66'], side:['#5a5852', '#4a4844'], pasa:true, adoquin:true },
    s: { top:['#74747c', '#84848c', '#606068'], side:['#4c4c54', '#3c3c44'], pasa:true, piedra:true },
    k: { top:['#3e3a48', '#4a4656', '#322e3c'], side:['#26222e', '#1e1a26'], pasa:true, adoquin:true },
    p: { top:['#4e3a66', '#5c4676', '#3e2e56'], side:['#2a1c3a', '#20142e'], pasa:true, adoquin:true, brillo:true },
    b: { top:['#7a5634', '#8a6440', '#68482a'], side:['#4e341e', '#40291a'], pasa:true, tablas:true },
    a: { top:['#b0a070', '#bcac7c', '#9c8c5e'], side:['#857650', '#756640'], pasa:true },
    n: { top:['#d4dae4', '#e4eaf2', '#c0c8d4'], side:['#848ea0', '#747e90'], pasa:true, nieve:true },
    w: { top:['#2e5a8a', '#3e6a9a', '#244c78'], side:['#1e3e66', '#18345a'], pasa:true, costo:2, agua:true },
    W: { top:['#20446e', '#2c527e', '#1a3a62'], side:['#163460', '#122c52'], pasa:false, agua:true },
    t: { top:['#46642e', '#547436', '#3a5626'], side:['#5a4430', '#4a3826'], pasa:false, deco:'arbol', pasto:true },
    r: { top:['#4e6e34', '#5e7e3c', '#40602a'], side:['#5a4430', '#4a3826'], pasa:false, deco:'roca', pasto:true },
    R: { top:['#8a3a2e', '#9a4636', '#70302a'], side:['#bcae90', '#ac9e80'], pasa:false, techo:true },
    x: { pasa:false, vacio:true },
  };
  function rnd(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const TX = 96, TY = 72;

  function texturaTop(letra, variante) {
    const key = 't' + letra + variante;
    if (cache.has(key)) return cache.get(key);
    const tr = TERRENO[letra], cv = lienzo(TX, TY), ctx = cv.getContext('2d'), r = rnd(letra.charCodeAt(0) * 97 + variante * 13 + 7);
    ctx.fillStyle = grad(ctx, 0, TY, luz(tr.top[0], 0.06), luz(tr.top[0], -0.06)); ctx.fillRect(0, 0, TX, TY);
    // Manchas suaves
    for (let i = 0; i < 10; i++) {
      const x = r() * TX, y = r() * TY, rad = 6 + r() * 14;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, (i % 2 ? tr.top[1] : tr.top[2]) + '88'); g.addColorStop(1, (i % 2 ? tr.top[1] : tr.top[2]) + '00');
      ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    if (tr.pasto) {
      ctx.lineCap = 'round';
      for (let i = 0; i < 46; i++) {
        const x = r() * TX, y = 4 + r() * (TY - 6), h = 3 + r() * 5;
        ctx.strokeStyle = r() < 0.5 ? luz(tr.top[0], 0.25) : luz(tr.top[0], -0.18); ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 1, y - h * 0.6, x + (r() - 0.5) * 3, y - h); ctx.stroke();
      }
    }
    if (tr.flores) for (let i = 0; i < 7; i++) {
      const x = 6 + r() * (TX - 12), y = 6 + r() * (TY - 12), c = ['#ffd84a', '#ff8ac0', '#ffffff', '#9ad0ff'][i % 4];
      for (let p = 0; p < 5; p++) { const a = p * Math.PI * 0.4; circulo(ctx, x + Math.cos(a) * 2.2, y + Math.sin(a) * 2.2, 1.7); ctx.fillStyle = c; ctx.fill(); }
      circulo(ctx, x, y, 1.3); ctx.fillStyle = '#ffb030'; ctx.fill();
    }
    if (tr.adoquin) {
      for (let fy = 0; fy < 4; fy++) for (let fx = -1; fx < 5; fx++) {
        const w = 24, h = 18, x = fx * w + (fy % 2 ? 12 : 0) + 1.5, y = fy * h + 1.5;
        rr(ctx, x, y, w - 3, h - 3, 5);
        ctx.fillStyle = grad(ctx, y, y + h, luz(tr.top[1], 0.08 + r() * 0.06), luz(tr.top[0], -0.08)); ctx.fill();
        ctx.strokeStyle = luz(tr.top[2], -0.25); ctx.lineWidth = 1.2; ctx.stroke();
      }
      if (tr.brillo) for (let i = 0; i < 6; i++) brillo(ctx, r() * TX, r() * TY, 1, '#e8c8ff');
    }
    if (tr.piedra) {
      ctx.strokeStyle = luz(tr.top[2], -0.25); ctx.lineWidth = 1.2;
      for (let i = 0; i < 4; i++) { const x = r() * TX, y = r() * TY; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6 + r() * 6, y + (r() - 0.5) * 8); ctx.lineTo(x + 10 + r() * 8, y + (r() - 0.5) * 10); ctx.stroke(); }
    }
    if (tr.tablas) {
      for (let i = 0; i < 4; i++) {
        const y = i * 18;
        rr(ctx, 0.5, y + 1, TX - 1, 16, 4); ctx.fillStyle = grad(ctx, y, y + 18, luz(tr.top[1], (i % 2) * 0.06), tr.top[0]); ctx.fill();
        ctx.strokeStyle = luz(tr.top[2], -0.3); ctx.lineWidth = 1.2; ctx.stroke();
        ctx.strokeStyle = luz(tr.top[2], -0.12); ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(8, y + 6); ctx.bezierCurveTo(30, y + 4, 50, y + 10, 88, y + 8); ctx.stroke();
        circulo(ctx, 6, y + 9, 1.4); circulo(ctx, TX - 6, y + 9, 1.4); ctx.fillStyle = '#3a2614'; ctx.fill();
      }
    }
    if (tr.techo) {
      for (let fy = 0; fy < 6; fy++) for (let fx = 0; fx < 7; fx++) {
        const x = fx * 16 - (fy % 2 ? 8 : 0), y = fy * 12;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 16, y); ctx.lineTo(x + 16, y + 8); ctx.arc(x + 8, y + 8, 8, 0, Math.PI); ctx.closePath();
        ctx.fillStyle = grad(ctx, y, y + 16, luz(tr.top[1], 0.05), luz(tr.top[0], -0.15)); ctx.fill();
        ctx.strokeStyle = luz(tr.top[2], -0.3); ctx.lineWidth = 1; ctx.stroke();
      }
    }
    if (tr.nieve) for (let i = 0; i < 18; i++) brillo(ctx, r() * TX, r() * TY, 0.8, '#ffffff');
    if (tr.ascuas) for (let i = 0; i < 9; i++) brillo(ctx, r() * TX, r() * TY, 0.9, i % 3 ? '#ff7a2a' : '#ffd24a');
    if (tr.lava) {
      ctx.strokeStyle = '#7a1a0a'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) { const x = r() * TX, y = r() * TY; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 10, y + (r() - 0.5) * 12, x + 18 + r() * 10, y + (r() - 0.5) * 10); ctx.stroke(); }
      for (let i = 0; i < 6; i++) brillo(ctx, r() * TX, r() * TY, 2, '#fff2a0');
    }
    if (tr.agua) {
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) { const x = r() * (TX - 20), y = 8 + r() * (TY - 16); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 6, y - 3, x + 12, y); ctx.quadraticCurveTo(x + 18, y + 3, x + 22, y); ctx.stroke(); }
    }
    cache.set(key, cv);
    return cv;
  }
  function texturaLado(letra) {
    const key = 's' + letra;
    if (cache.has(key)) return cache.get(key);
    const tr = TERRENO[letra], cv = lienzo(TX, 30), ctx = cv.getContext('2d'), r = rnd(letra.charCodeAt(0) * 31);
    ctx.fillStyle = grad(ctx, 0, 30, tr.side[0], luz(tr.side[1], -0.1)); ctx.fillRect(0, 0, TX, 30);
    if (tr.techo) {
      // Pared con ventana y viga
      ctx.fillStyle = '#8a5a34'; ctx.fillRect(0, 0, TX, 3);
      rr(ctx, 36, 7, 24, 16, 4); relleno(ctx, grad(ctx, 7, 23, '#a8d0f8', '#5a8ac0'), true, 1.6);
      ctx.strokeStyle = '#6a4428'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(48, 7); ctx.lineTo(48, 23); ctx.moveTo(36, 15); ctx.lineTo(60, 15); ctx.stroke();
    } else {
      ctx.strokeStyle = luz(tr.side[1], -0.2); ctx.lineWidth = 1;
      for (let i = 0; i < 9; i++) { const x = r() * TX, y = 4 + r() * 22; rr(ctx, x, y, 8 + r() * 10, 4 + r() * 3, 2); ctx.fillStyle = luz(tr.side[0], (r() - 0.5) * 0.2); ctx.fill(); }
    }
    cache.set(key, cv);
    return cv;
  }
  // Borde de pasto que cuelga sobre los costados (más orgánico).
  function flecos(color) {
    const key = 'fl' + color;
    if (cache.has(key)) return cache.get(key);
    const cv = lienzo(TX, 14), ctx = cv.getContext('2d');
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(TX, 0);
    for (let x = TX; x >= 0; x -= 8) ctx.quadraticCurveTo(x - 4, 7 + ((x / 8) % 2) * 5, x - 8, 2);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, 0, 12, color, luz(color, -0.25)); ctx.fill();
    cache.set(key, cv);
    return cv;
  }
  function deco(tipo) {
    const key = 'd' + tipo;
    if (cache.has(key)) return cache.get(key);
    const cv = lienzo(160, 220), ctx = cv.getContext('2d');
    ctx.scale(1.6, 1.6); ctx.lineJoin = 'round';
    if (tipo === 'arbol') {
      rr(ctx, 43, 90, 14, 40, 5); relleno(ctx, grad(ctx, 90, 130, '#9a6a3c', '#5e3c1e'));
      const bolas = [[50, 40, 30], [28, 66, 24], [72, 66, 24], [50, 74, 28], [36, 44, 18], [66, 46, 18]];
      bolas.forEach(([x, y, r2]) => { circulo(ctx, x, y, r2 + 1.4); ctx.fillStyle = '#163a1c'; ctx.fill(); });
      bolas.forEach(([x, y, r2]) => { circulo(ctx, x, y, r2); ctx.fillStyle = gradR(ctx, x, y, r2, '#6a8a4a', '#1e3618'); ctx.fill(); });
      [[42, 30, 6], [62, 54, 5], [30, 60, 4]].forEach(([x, y, r2]) => { circulo(ctx, x, y, r2); ctx.fillStyle = 'rgba(200,230,170,.15)'; ctx.fill(); });
    } else if (tipo === 'roca') {
      ctx.beginPath(); ctx.moveTo(18, 128); ctx.bezierCurveTo(10, 100, 30, 84, 52, 86); ctx.bezierCurveTo(78, 86, 92, 104, 84, 128); ctx.closePath();
      relleno(ctx, gradR(ctx, 50, 104, 40, '#9a968e', '#4a4844'), true, 3);
      ctx.strokeStyle = '#5a5a64'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(44, 92); ctx.lineTo(50, 106); ctx.lineTo(46, 118); ctx.stroke();
      circulo(ctx, 36, 98, 5); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fill();
    }
    cache.set(key, cv);
    return cv;
  }

  return { personaje, retrato, texturaTop, texturaLado, flecos, deco, TERRENO, oscurecer, luz, TINTES };
})();
