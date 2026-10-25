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
      case 'lanza':
        rr(ctx, -1.6, -52, 3.2, 64, 1.5); relleno(ctx, grad(ctx, -52, 12, '#b08048', '#6a4428'));
        ctx.beginPath(); ctx.moveTo(-4.5, -50); ctx.lineTo(0, -64); ctx.lineTo(4.5, -50); ctx.lineTo(0, -46); ctx.closePath(); relleno(ctx, metal());
        rr(ctx, -4, -48, 8, 3, 1.5); relleno(ctx, P.A);
        break;
    }
    ctx.restore();
  }

  // ---------- Pelo y gorros ----------
  function peloAtras(ctx, P, estilo, vista) {
    ctx.beginPath();
    if (estilo === 2) { rr(ctx, 27, 26, 46, 42, 16); }
    else if (estilo === 1) { ctx.arc(50, 37, 24.5, Math.PI * 0.9, Math.PI * 2.1); ctx.lineTo(74, 54); ctx.quadraticCurveTo(50, 60, 26, 54); ctx.closePath(); }
    else circulo(ctx, 50, 35.5, 23);
    relleno(ctx, grad(ctx, 14, 68, luz(P.H, 0.12), luz(P.H, -0.25)));
    if (vista === 'b') {
      ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = luz(P.H, 0.5); ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(50, 35, 16, Math.PI * 1.15, Math.PI * 1.55); ctx.stroke(); ctx.restore();
    }
  }
  function peloDelante(ctx, P, estilo) {
    ctx.beginPath();
    ctx.moveTo(28.5, 41);
    ctx.bezierCurveTo(26, 18, 40, 13.5, 50, 13.5);
    ctx.bezierCurveTo(60, 13.5, 74, 18, 71.5, 41);
    if (estilo === 0) { // flequillo en puntas
      ctx.lineTo(67, 31); ctx.lineTo(63, 35); ctx.lineTo(59, 28); ctx.lineTo(54, 33); ctx.lineTo(50, 27); ctx.lineTo(45, 33); ctx.lineTo(40, 28); ctx.lineTo(36, 35); ctx.lineTo(32, 30);
    } else if (estilo === 1) { // flequillo recto
      ctx.quadraticCurveTo(70, 32, 66, 31); ctx.lineTo(34, 31); ctx.quadraticCurveTo(30, 32, 28.5, 41);
    } else { // raya al costado
      ctx.quadraticCurveTo(66, 26, 56, 27); ctx.quadraticCurveTo(44, 30, 34, 37); ctx.quadraticCurveTo(30, 39, 28.5, 41);
    }
    ctx.closePath();
    relleno(ctx, grad(ctx, 13, 40, luz(P.H, 0.18), luz(P.H, -0.12)));
    ctx.save(); ctx.globalAlpha = 0.45; ctx.strokeStyle = luz(P.H, 0.6); ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(50, 34, 15, Math.PI * 1.2, Math.PI * 1.45); ctx.stroke(); ctx.restore();
  }
  function gorro(ctx, g, P, vista) {
    const metal = () => grad(ctx, 12, 44, '#f4f6fa', '#8a94a8');
    switch (g) {
      case 'casco':
        ctx.beginPath(); ctx.arc(50, 36, 23.5, Math.PI, 0); ctx.lineTo(73.5, 37); ctx.lineTo(26.5, 37); ctx.closePath(); relleno(ctx, metal());
        rr(ctx, 25, 33, 50, 6, 3); relleno(ctx, '#8a94a8');
        if (vista !== 'b') { rr(ctx, 48, 33, 4, 12, 2); relleno(ctx, '#aab2c4'); }
        circulo(ctx, 50, 14.5, 3); relleno(ctx, P.A);
        break;
      case 'yelmo':
        rr(ctx, 26, 13, 48, 46, 19); relleno(ctx, metal());
        if (vista !== 'b') {
          rr(ctx, 32, 37, 36, 6, 3); relleno(ctx, '#2a2438');
          rr(ctx, 48.5, 43, 3, 12, 1.5); ctx.fillStyle = '#7a8498'; ctx.fill();
        }
        ctx.beginPath(); ctx.moveTo(50, 13); ctx.bezierCurveTo(46, 2, 58, -2, 66, 4); ctx.bezierCurveTo(60, 4, 56, 8, 54, 14); ctx.closePath(); relleno(ctx, P.A);
        ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(50, 34, 17, Math.PI * 1.15, Math.PI * 1.4); ctx.stroke(); ctx.restore();
        break;
      case 'capucha': case 'mitra': {
        ctx.beginPath();
        if (g === 'mitra') { ctx.moveTo(25, 46); ctx.bezierCurveTo(22, 22, 40, 4, 50, 2); ctx.bezierCurveTo(60, 4, 78, 22, 75, 46); }
        else { ctx.moveTo(24, 48); ctx.bezierCurveTo(20, 18, 38, 10, 50, 10); ctx.bezierCurveTo(62, 10, 80, 18, 76, 48); }
        if (vista === 'b') { ctx.quadraticCurveTo(50, 56, 24, 48); }
        else { ctx.lineTo(68, 48); ctx.bezierCurveTo(70, 30, 62, 25, 50, 25); ctx.bezierCurveTo(38, 25, 30, 30, 32, 48); }
        ctx.closePath();
        relleno(ctx, grad(ctx, 4, 50, luz(P.C, 0.15), luz(P.C, -0.2)));
        if (g === 'mitra') {
          ctx.save(); ctx.strokeStyle = P.A; ctx.lineWidth = 3; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(50, 9); ctx.lineTo(50, 21); ctx.moveTo(45, 14); ctx.lineTo(55, 14); ctx.stroke(); ctx.restore();
        }
        break;
      }
      case 'sombrero':
        elipse(ctx, 50, 25, 31, 7.5); relleno(ctx, grad(ctx, 18, 32, luz(P.C, 0.1), luz(P.C, -0.3)));
        ctx.beginPath(); ctx.moveTo(34, 24); ctx.bezierCurveTo(38, 10, 46, 2, 62, -4); ctx.bezierCurveTo(58, 6, 64, 14, 66, 24); ctx.quadraticCurveTo(50, 28, 34, 24);
        relleno(ctx, grad(ctx, -4, 26, luz(P.C, 0.2), luz(P.C, -0.15)));
        ctx.beginPath(); ctx.moveTo(35, 21); ctx.quadraticCurveTo(50, 25, 65, 21); ctx.lineTo(65.5, 24); ctx.quadraticCurveTo(50, 28, 34.5, 24); ctx.closePath(); relleno(ctx, P.A, false);
        break;
      case 'boina':
        ctx.beginPath(); ctx.ellipse(50, 22, 25, 11, -0.12, Math.PI, 0); ctx.quadraticCurveTo(74, 28, 50, 28); ctx.quadraticCurveTo(26, 28, 25.5, 22); ctx.closePath();
        relleno(ctx, grad(ctx, 10, 28, luz(P.C, 0.2), luz(P.C, -0.15)));
        ctx.beginPath(); ctx.moveTo(66, 18); ctx.bezierCurveTo(78, 4, 86, 4, 90, 0); ctx.bezierCurveTo(86, 10, 78, 16, 68, 21); ctx.closePath(); relleno(ctx, P.A);
        break;
      case 'panuelo':
        ctx.beginPath(); ctx.arc(50, 37, 22.5, Math.PI * 1.04, Math.PI * 1.96); ctx.lineTo(72, 31); ctx.quadraticCurveTo(50, 26, 28, 31); ctx.closePath();
        relleno(ctx, grad(ctx, 14, 32, luz(P.A, 0.15), luz(P.A, -0.2)));
        ctx.beginPath(); ctx.moveTo(70, 28); ctx.quadraticCurveTo(82, 30, 84, 40); ctx.quadraticCurveTo(78, 36, 72, 34); ctx.closePath(); relleno(ctx, P.A);
        break;
      case 'cinta':
        ctx.beginPath(); ctx.moveTo(27.5, 30); ctx.quadraticCurveTo(50, 22, 72.5, 30); ctx.lineTo(72.5, 34.5); ctx.quadraticCurveTo(50, 27, 27.5, 34.5); ctx.closePath(); relleno(ctx, P.A);
        if (vista === 'b') { ctx.beginPath(); ctx.moveTo(50, 28); ctx.quadraticCurveTo(46, 40, 42, 46); ctx.lineTo(46, 46); ctx.quadraticCurveTo(50, 40, 52, 30); relleno(ctx, P.A); }
        break;
      case 'cofia':
        elipse(ctx, 50, 26, 35, 8.5); relleno(ctx, grad(ctx, 18, 34, luz(P.C, 0.1), luz(P.C, -0.3)));
        ctx.beginPath(); ctx.moveTo(34, 26); ctx.bezierCurveTo(32, 8, 68, 8, 66, 26); ctx.quadraticCurveTo(50, 30, 34, 26); relleno(ctx, grad(ctx, 8, 28, luz(P.C, 0.25), P.C));
        rr(ctx, 34, 20, 32, 4.5, 2); relleno(ctx, P.A, false);
        break;
      case 'cuernos':
        [[1, 30], [-1, 70]].forEach(([s, x]) => {
          ctx.beginPath(); ctx.moveTo(x, 26); ctx.bezierCurveTo(x - s * 12, 18, x - s * 12, 6, x - s * 6, 0); ctx.bezierCurveTo(x - s * 4, 8, x - s * 2, 16, x + s * 6, 22); ctx.closePath();
          relleno(ctx, grad(ctx, 0, 26, '#fff8e8', '#c8b890'));
        });
        ctx.beginPath(); ctx.arc(50, 36, 23.5, Math.PI, 0); ctx.lineTo(73.5, 37); ctx.lineTo(26.5, 37); ctx.closePath(); relleno(ctx, grad(ctx, 12, 40, luz(P.C, 0.3), P.D));
        rr(ctx, 25, 33, 50, 6, 3); relleno(ctx, P.A);
        break;
    }
  }

  // ---------- Caras ----------
  // Cada personaje tiene rasgos propios: forma y color de ojos, cejas, boca y detalles (pecas, cicatriz, parche, lentes...).
  const IRIS = ['#4a3020', '#2a6aa8', '#3a8a4a', '#8a5a2a', '#5a5a6a', '#8a3a9a', '#2a8a8a', '#a8402a'];
  function caraDe(look) {
    const c = look.cara || {};
    const h = hash((look.pelo || '') + (look.piel || '') + (look.estilo ?? '') + (look.semilla || '') + (look.barba ? 'b' : ''));
    const r = n => (hash(h + ':' + n) % 1000) / 1000;
    return {
      ojos: c.ojos ?? Math.floor(r(1) * 5),
      iris: c.iris ?? IRIS[Math.floor(r(2) * IRIS.length)],
      cejas: c.cejas ?? Math.floor(r(3) * 5),
      boca: c.boca ?? Math.floor(r(4) * 5),
      pecas: c.pecas ?? r(5) < 0.22,
      pestanas: c.pestanas ?? (look.estilo === 2 && r(6) < 0.7),
      cicatriz: c.cicatriz ?? r(7) < 0.08,
      lunar: c.lunar ?? r(8) < 0.12,
      arrugas: c.arrugas ?? false,
      parche: c.parche ?? false,
      lentes: c.lentes ?? r(9) < 0.07,
      bigote: c.bigote ?? false,
      rubor: c.rubor ?? (0.15 + r(10) * 0.25),
    };
  }
  function dibujarCara(ctx, P, f, expr, look) {
    const ojoY = 42.5;
    const cerrados = expr === 'parpadeo' || expr === 'feliz';
    const enojo = expr === 'enojo' || expr === 'dolor';
    const triste = expr === 'triste';
    const sorpresa = expr === 'sorpresa';
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // Arrugas y rubor
    if (f.arrugas) { ctx.strokeStyle = 'rgba(90,50,40,.45)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(36, 31); ctx.quadraticCurveTo(50, 29, 64, 31); ctx.moveTo(35, 44); ctx.lineTo(33, 46); ctx.moveTo(65, 44); ctx.lineTo(67, 46); ctx.stroke(); }
    ctx.fillStyle = `rgba(255,110,110,${enojo ? 0.12 : f.rubor})`; elipse(ctx, 37, 48.5, 3.6, 2); ctx.fill(); elipse(ctx, 63, 48.5, 3.6, 2); ctx.fill();
    if (f.pecas) { ctx.fillStyle = 'rgba(150,80,50,.55)'; [[35, 47], [37.5, 48.5], [39.5, 46.8], [61, 47], [63.5, 48.5], [65, 46.6]].forEach(([x, y]) => { circulo(ctx, x, y, 0.55); ctx.fill(); }); }
    // Ojos
    [[42.5, -1], [57.5, 1]].forEach(([x, lado]) => {
      if (f.parche && lado === 1) return;
      if (cerrados) {
        ctx.strokeStyle = '#2a1f2e'; ctx.lineWidth = 1.7; ctx.beginPath();
        if (expr === 'feliz') ctx.arc(x, ojoY + 1.2, 2.8, Math.PI * 1.1, Math.PI * 1.9); else ctx.arc(x, ojoY - 0.6, 2.8, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke(); return;
      }
      if (expr === 'dolor') { ctx.strokeStyle = '#2a1f2e'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.moveTo(x + lado * 2.4, ojoY - 2); ctx.lineTo(x - lado * 1.8, ojoY); ctx.lineTo(x + lado * 2.4, ojoY + 2); ctx.stroke(); return; }
      let rx = 2.9, ry = 3.9;
      if (f.ojos === 1) { rx = 3.5; ry = 4.6; }
      if (f.ojos === 3) { rx = 3; ry = 1.9; }
      if (sorpresa) { rx += 0.6; ry += 0.8; }
      ctx.beginPath();
      if (f.ojos === 2) { ctx.moveTo(x - 3.6, ojoY); ctx.quadraticCurveTo(x, ojoY - 4.6, x + 3.6, ojoY - 0.6 * lado); ctx.quadraticCurveTo(x, ojoY + 3.6, x - 3.6, ojoY); }
      else ctx.ellipse(x, ojoY, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fbf7ee'; ctx.fill();
      ctx.save(); ctx.clip();
      circulo(ctx, x + lado * 0.2, ojoY + 0.4, f.ojos === 3 ? 1.9 : Math.min(rx, ry) * 0.86); ctx.fillStyle = f.iris; ctx.fill();
      circulo(ctx, x + lado * 0.2, ojoY + 0.4, f.ojos === 3 ? 1.1 : Math.min(rx, ry) * 0.48); ctx.fillStyle = '#1e1a2a'; ctx.fill();
      circulo(ctx, x + 0.9, ojoY - 1.3, 1.05); ctx.fillStyle = '#fff'; ctx.fill();
      if (f.ojos === 1) { circulo(ctx, x - 1, ojoY + 1.4, 0.55); ctx.fill(); }
      if (f.ojos === 4) { ctx.fillStyle = P.S; ctx.fillRect(x - 5, ojoY - 6, 10, 5.6); }
      ctx.restore();
      ctx.strokeStyle = '#2a1f2e'; ctx.lineWidth = 1.2; ctx.beginPath();
      if (f.ojos === 2) { ctx.moveTo(x - 3.6, ojoY); ctx.quadraticCurveTo(x, ojoY - 4.6, x + 3.6, ojoY - 0.6 * lado); }
      else if (f.ojos === 4) { ctx.moveTo(x - rx, ojoY - 0.4); ctx.lineTo(x + rx, ojoY - 0.4); }
      else ctx.ellipse(x, ojoY, rx, ry, 0, Math.PI * 1.05, Math.PI * 1.95);
      ctx.lineWidth = 1.6; ctx.stroke();
      if (f.pestanas) { ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(x + lado * 2.6, ojoY - 2.6); ctx.lineTo(x + lado * 4.4, ojoY - 3.8); ctx.moveTo(x + lado * 3.2, ojoY - 1.4); ctx.lineTo(x + lado * 4.9, ojoY - 2); ctx.stroke(); }
    });
    if (triste && !cerrados) { ctx.fillStyle = 'rgba(140,200,255,.85)'; ctx.beginPath(); ctx.ellipse(39.5, 48, 1, 1.7, 0, 0, Math.PI * 2); ctx.fill(); }
    // Parche
    if (f.parche) {
      ctx.strokeStyle = '#1e1a2a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(30, 34); ctx.lineTo(70, 40); ctx.stroke();
      elipse(ctx, 57.5, 42.5, 4.4, 4); ctx.fillStyle = '#1e1a2a'; ctx.fill();
    }
    // Cejas
    const cc = luz(P.H, -0.35);
    ctx.strokeStyle = cc; ctx.lineWidth = f.cejas === 1 ? 2.6 : 1.6;
    const tipo = enojo ? 2 : triste ? 3 : sorpresa ? 4 : f.cejas;
    [[42.5, -1], [57.5, 1]].forEach(([x, lado]) => {
      ctx.beginPath();
      const y = sorpresa ? 34.5 : 36.4;
      if (tipo === 2) { ctx.moveTo(x + lado * 3, y - 1.6); ctx.lineTo(x - lado * 2.6, y + 1); }
      else if (tipo === 3) { ctx.moveTo(x + lado * 3, y + 0.6); ctx.lineTo(x - lado * 2.6, y - 1.6); }
      else if (tipo === 4) { ctx.moveTo(x - 3, y); ctx.quadraticCurveTo(x, y - 2.4, x + 3, y); }
      else ctx.moveTo(x - 2.8, y), ctx.lineTo(x + 2.8, y - (lado * 0.3));
      ctx.stroke();
    });
    // Nariz
    ctx.strokeStyle = 'rgba(120,60,40,.45)'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(50, 46, 1.2, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
    // Boca
    if (!look.barba || f.bigote) {
      const b = expr === 'habla' ? 'habla' : expr === 'feliz' ? 2 : enojo ? 'enojo' : triste ? 4 : sorpresa ? 'o' : f.boca;
      ctx.strokeStyle = '#7a3036'; ctx.lineWidth = 1.4; ctx.fillStyle = '#7a3036';
      if (b === 'habla' || b === 'o') { elipse(ctx, 50, 50.2, b === 'o' ? 1.8 : 2.4, b === 'o' ? 2.2 : 1.7); ctx.fill(); }
      else if (b === 'enojo') { ctx.beginPath(); ctx.moveTo(47, 50.4); ctx.quadraticCurveTo(50, 48.8, 53, 50.4); ctx.stroke(); }
      else if (b === 0) { ctx.beginPath(); ctx.arc(50, 48.5, 2.6, 0.2, Math.PI - 0.2); ctx.stroke(); }
      else if (b === 1) { ctx.beginPath(); ctx.moveTo(47.8, 50); ctx.lineTo(52.2, 50); ctx.stroke(); }
      else if (b === 2) { ctx.beginPath(); ctx.moveTo(46.6, 48.8); ctx.quadraticCurveTo(50, 53.8, 53.4, 48.8); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(47.6, 48.8, 4.8, 1.1); }
      else if (b === 3) { ctx.beginPath(); ctx.moveTo(47.4, 50); ctx.quadraticCurveTo(51, 50.8, 53, 48.4); ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(50, 52, 2.4, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); }
    }
    if (f.bigote) { ctx.beginPath(); ctx.moveTo(50, 47.6); ctx.quadraticCurveTo(45, 46.2, 43, 49.4); ctx.quadraticCurveTo(46.6, 48.6, 50, 49); ctx.quadraticCurveTo(53.4, 48.6, 57, 49.4); ctx.quadraticCurveTo(55, 46.2, 50, 47.6); ctx.fillStyle = luz(P.H, -0.1); ctx.fill(); }
    if (f.lunar) { circulo(ctx, 60.5, 50, 0.7); ctx.fillStyle = '#4a2a20'; ctx.fill(); }
    if (f.cicatriz) { ctx.strokeStyle = 'rgba(160,70,70,.8)'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(38, 37); ctx.lineTo(41.5, 47.5); ctx.moveTo(38.6, 40); ctx.lineTo(40.6, 39.4); ctx.moveTo(39.6, 43); ctx.lineTo(41.6, 42.4); ctx.stroke(); }
    if (f.lentes) { ctx.strokeStyle = '#3a3040'; ctx.lineWidth = 1.2; circulo(ctx, 42.5, 42.5, 4.6); ctx.stroke(); circulo(ctx, 57.5, 42.5, 4.6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(47.1, 42); ctx.lineTo(52.9, 42); ctx.stroke(); ctx.fillStyle = 'rgba(200,230,255,.18)'; circulo(ctx, 42.5, 42.5, 4.6); ctx.fill(); circulo(ctx, 57.5, 42.5, 4.6); ctx.fill(); }
    ctx.restore();
  }

  // ---------- Personaje humano ----------
  function humano(ctx, P, vis, vista, frame, expr) {
    const C = CLASES[vis.clase] || {};
    const asp = P.asp;
    const look = vis.look || {};
    const estilo = look.estilo ?? (hash((look.pelo || '') + (look.piel || '')) % 3);
    const tunica = TUNICAS.includes(vis.clase);
    const paso = frame === 1 ? 1 : frame === 2 ? -1 : 0;
    const atras = vista === 'b';

    // Arma detrás del cuerpo cuando mira de espaldas
    if (atras && vis.arma) dibujarArma(ctx, vis.arma, 33, 74, P);

    // Pelo de atrás (largo)
    if (!asp.calvo && (estilo === 2 || atras)) peloAtras(ctx, P, estilo, vista);

    // Piernas y botas
    [[42, paso], [58, -paso]].forEach(([x, p]) => {
      rr(ctx, x - 5, 74 - p * 2, 10, 16, 4); relleno(ctx, grad(ctx, 74, 90, P.D, luz(P.D, -0.25)));
      rr(ctx, x - 6, 85 - p * 2, 12, 8, 4); relleno(ctx, grad(ctx, 85, 93, luz(P.B, 0.2), P.B));
    });

    // Brazo izquierdo (detrás)
    capsula(ctx, 35, 61, 31 + paso * 2, 75, 4.2, atras ? P.C : luz(P.C, -0.1));
    circulo(ctx, 31 + paso * 2, 77, 4.2); relleno(ctx, P.S);

    // Torso / túnica
    ctx.beginPath();
    if (tunica) { ctx.moveTo(37, 55); ctx.quadraticCurveTo(50, 52, 63, 55); ctx.quadraticCurveTo(70, 72, 71, 88); ctx.quadraticCurveTo(50, 92, 29, 88); ctx.quadraticCurveTo(30, 72, 37, 55); }
    else rr(ctx, 34, 54, 32, 26, 9);
    relleno(ctx, grad(ctx, 54, tunica ? 90 : 80, luz(P.C, 0.18), luz(P.C, -0.22)));
    if (!atras) {
      // Detalles del frente
      if (tunica) { ctx.save(); ctx.strokeStyle = P.A; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(50, 56); ctx.lineTo(50, 89); ctx.stroke(); ctx.restore(); }
      ctx.beginPath(); ctx.moveTo(42, 55); ctx.lineTo(50, 63); ctx.lineTo(58, 55); ctx.closePath(); relleno(ctx, P.A, true, 1.6);
      rr(ctx, 34.5, 69, 31, 5, 2); relleno(ctx, luz(P.D, -0.15), false);
      rr(ctx, 46.5, 68.5, 7, 6, 1.5); relleno(ctx, P.A, true, 1.4);
      if (asp.g === 'campana') { // campanita colgando del cinto
        ctx.beginPath(); ctx.moveTo(57, 74); ctx.quadraticCurveTo(57, 68, 61, 68); ctx.quadraticCurveTo(65, 68, 65, 74); ctx.closePath(); relleno(ctx, grad(ctx, 68, 74, '#fff2b0', '#c8962a'), true, 1.4);
      }
    }
    // Hombros redondeados
    circulo(ctx, 35.5, 58.5, 5.5); relleno(ctx, luz(P.C, 0.05));
    circulo(ctx, 64.5, 58.5, 5.5); relleno(ctx, luz(P.C, 0.05));

    // Cabeza
    circulo(ctx, 28.5, 42, 3.6); relleno(ctx, P.S);
    circulo(ctx, 71.5, 42, 3.6); relleno(ctx, P.S);
    circulo(ctx, 50, 38, 21.5); relleno(ctx, gradR(ctx, 50, 38, 21.5, luz(P.S, 0.25), luz(P.S, -0.12)));
    if (atras && !asp.calvo) peloAtras(ctx, P, estilo === 2 ? 2 : 0, vista);
    else if (!asp.calvo) peloDelante(ctx, P, estilo);

    const g = asp.g || 'ninguno';
    if (g !== 'campana' && g !== 'ninguno') gorro(ctx, g, P, vista);

    // Cara
    if (!atras && g !== 'yelmo') {
      if (look.barba) {
        ctx.beginPath(); ctx.moveTo(32, 44); ctx.quadraticCurveTo(34, 64, 50, 63); ctx.quadraticCurveTo(66, 64, 68, 44); ctx.quadraticCurveTo(60, 52, 50, 51); ctx.quadraticCurveTo(40, 52, 32, 44);
        relleno(ctx, grad(ctx, 44, 64, luz(P.H, 0.1), luz(P.H, -0.2)), true, 1.8);
      }
      if (asp.ojosBrillan) { brillo(ctx, 42.5, 42, 2.8, P.E); brillo(ctx, 57.5, 42, 2.8, P.E); }
      else dibujarCara(ctx, P, caraDe(look), expr, look);
    }

    // Brazo derecho (delante) con el arma
    const mx = 69 - paso * 2, my = 76;
    capsula(ctx, 65, 61, mx, my - 1, 4.2, atras ? P.C : luz(P.C, 0.05));
    if (!atras && vis.arma) dibujarArma(ctx, vis.arma, mx, my, P);
    circulo(ctx, mx, my, 4.4); relleno(ctx, P.S);
  }

  // ---------- Monstruos ----------
  function lobo(ctx, P, frame) {
    const p = frame ? (frame === 1 ? 2 : -2) : 0;
    // Cola
    ctx.beginPath(); ctx.moveTo(26, 64); ctx.bezierCurveTo(10, 60, 6, 44, 14, 38); ctx.bezierCurveTo(16, 48, 22, 54, 30, 58); ctx.closePath(); relleno(ctx, grad(ctx, 38, 64, luz(P.C, 0.2), P.D));
    // Patas
    [[32, p], [42, -p], [60, p], [70, -p]].forEach(([x, o], i) => { rr(ctx, x - 4, 68 + (i % 2 ? 1 : 0), 8, 24 - Math.abs(o), 4); relleno(ctx, grad(ctx, 68, 92, i % 2 ? P.D : P.C, luz(P.D, -0.2))); });
    // Cuerpo
    elipse(ctx, 50, 66, 27, 14); relleno(ctx, grad(ctx, 52, 80, luz(P.C, 0.22), luz(P.C, -0.15)));
    elipse(ctx, 50, 72, 18, 6); ctx.fillStyle = luz(P.A || P.C, 0.1); ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1;
    // Melena
    ctx.beginPath(); ctx.moveTo(62, 52); ctx.quadraticCurveTo(70, 46, 76, 52); ctx.quadraticCurveTo(80, 64, 70, 72); ctx.quadraticCurveTo(62, 68, 60, 60); ctx.closePath(); relleno(ctx, luz(P.C, 0.3));
    // Cabeza
    circulo(ctx, 76, 50, 12); relleno(ctx, gradR(ctx, 76, 50, 12, luz(P.C, 0.35), P.C));
    ctx.beginPath(); ctx.moveTo(84, 48); ctx.quadraticCurveTo(96, 50, 95, 56); ctx.quadraticCurveTo(88, 60, 82, 58); ctx.closePath(); relleno(ctx, luz(P.C, 0.15));
    circulo(ctx, 95, 54.5, 2.2); relleno(ctx, OUT, false);
    [[70, -1], [79, 1]].forEach(([x]) => { ctx.beginPath(); ctx.moveTo(x - 4, 42); ctx.lineTo(x, 30); ctx.lineTo(x + 4, 42); ctx.closePath(); relleno(ctx, P.D); });
    brillo(ctx, 80, 48, 2.4, P.E);
  }
  function arana(ctx, P, frame) {
    const p = frame ? (frame === 1 ? 2 : -2) : 0;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 0; i < 4; i++) {
      [[-1, 0], [1, 1]].forEach(([s]) => {
        const bx = 54 + s * 4, by = 70, ang = -0.9 + i * 0.55;
        const kx = bx + s * (18 + i * 2), ky = by - 16 + i * 6 + (i % 2 ? p : -p);
        const fx = bx + s * (26 + i * 3), fy = 92;
        ctx.strokeStyle = OUT; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
        ctx.strokeStyle = P.D; ctx.lineWidth = 3.5; ctx.stroke();
      });
    }
    ctx.restore();
    elipse(ctx, 40, 66, 22, 18); relleno(ctx, gradR(ctx, 40, 66, 22, luz(P.C, 0.3), luz(P.C, -0.25)));
    ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = P.E; ctx.beginPath(); ctx.moveTo(40, 54); ctx.lineTo(44, 62); ctx.lineTo(40, 70); ctx.lineTo(36, 62); ctx.closePath(); ctx.fill(); ctx.restore();
    circulo(ctx, 66, 72, 11); relleno(ctx, gradR(ctx, 66, 72, 11, luz(P.C, 0.3), P.C));
    [[64, 69], [70, 69], [62, 74], [72, 74]].forEach(([x, y]) => brillo(ctx, x, y, 1.8, P.E));
  }
  function murcielago(ctx, P, frame) {
    const a = frame === 1 ? -6 : frame === 2 ? 6 : 0;
    [[-1], [1]].forEach(([s]) => {
      ctx.beginPath(); ctx.moveTo(50 + s * 8, 48);
      ctx.bezierCurveTo(50 + s * 22, 30 + a, 50 + s * 40, 30 + a, 50 + s * 46, 40 + a);
      ctx.quadraticCurveTo(50 + s * 40, 46, 50 + s * 38, 54); ctx.quadraticCurveTo(50 + s * 32, 50, 50 + s * 28, 58); ctx.quadraticCurveTo(50 + s * 22, 54, 50 + s * 16, 62);
      ctx.closePath(); relleno(ctx, grad(ctx, 30, 62, luz(P.D, 0.25), P.D));
    });
    elipse(ctx, 50, 52, 12, 14); relleno(ctx, gradR(ctx, 50, 52, 14, luz(P.C, 0.3), P.C));
    [[-1], [1]].forEach(([s]) => { ctx.beginPath(); ctx.moveTo(50 + s * 4, 40); ctx.lineTo(50 + s * 9, 30); ctx.lineTo(50 + s * 10, 42); ctx.closePath(); relleno(ctx, P.C); });
    brillo(ctx, 45.5, 49, 2.2, P.E); brillo(ctx, 54.5, 49, 2.2, P.E);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(47, 57); ctx.lineTo(48.5, 61); ctx.lineTo(50, 57); ctx.moveTo(50, 57); ctx.lineTo(51.5, 61); ctx.lineTo(53, 57); ctx.fill();
  }
  function espectro(ctx, P, frame, corona) {
    const o = frame === 1 ? 2 : frame === 2 ? -2 : 0;
    ctx.beginPath();
    ctx.moveTo(26, 86); ctx.bezierCurveTo(22, 60, 26, 16, 50, 16); ctx.bezierCurveTo(74, 16, 78, 60, 74, 86);
    for (let i = 0; i < 5; i++) { const x0 = 74 - i * 9.6; ctx.quadraticCurveTo(x0 - 4.8, 94 + (i % 2 ? o : -o), x0 - 9.6, 86); }
    ctx.closePath();
    ctx.save(); ctx.globalAlpha = 0.92; relleno(ctx, grad(ctx, 16, 92, luz(P.C, 0.3), luz(P.D, -0.1))); ctx.restore();
    // Brazos
    capsula(ctx, 30, 54, 20, 66 + o, 4, luz(P.C, 0.1)); capsula(ctx, 70, 54, 80, 66 - o, 4, luz(P.C, 0.1));
    // Cara hueca
    elipse(ctx, 50, 40, 14, 13); ctx.fillStyle = luz(P.D, -0.55); ctx.fill();
    brillo(ctx, 44.5, 40, 2.8, P.E); brillo(ctx, 55.5, 40, 2.8, P.E);
    if (corona) {
      for (let i = 0; i < 5; i++) {
        const x = 34 + i * 8, y = i === 2 ? 6 : i % 2 ? 12 : 10;
        ctx.beginPath(); ctx.moveTo(x - 3, y + 6); ctx.quadraticCurveTo(x - 3, y, x, y); ctx.quadraticCurveTo(x + 3, y, x + 3, y + 6); ctx.closePath(); relleno(ctx, grad(ctx, y, y + 6, '#fff2b0', '#c8962a'), true, 1.4);
      }
    }
  }
  function golem(ctx, P, frame) {
    const p = frame ? (frame === 1 ? 2 : -2) : 0;
    rr(ctx, 33, 76 - p, 14, 17, 5); relleno(ctx, P.D);
    rr(ctx, 53, 76 + p, 14, 17, 5); relleno(ctx, P.D);
    rr(ctx, 14, 46, 18, 32, 8); relleno(ctx, grad(ctx, 46, 78, luz(P.C, 0.15), P.D));
    rr(ctx, 68, 46, 18, 32, 8); relleno(ctx, grad(ctx, 46, 78, luz(P.C, 0.15), P.D));
    rr(ctx, 28, 40, 44, 40, 12); relleno(ctx, grad(ctx, 40, 80, luz(P.C, 0.25), luz(P.C, -0.2)));
    ctx.save(); ctx.strokeStyle = luz(P.D, -0.3); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(36, 50); ctx.lineTo(42, 58); ctx.lineTo(40, 66); ctx.moveTo(62, 46); ctx.lineTo(58, 56); ctx.stroke(); ctx.restore();
    brillo(ctx, 50, 62, 3.5, P.A);
    rr(ctx, 36, 18, 28, 24, 9); relleno(ctx, grad(ctx, 18, 42, luz(P.C, 0.3), P.C));
    brillo(ctx, 44, 30, 2.4, P.E); brillo(ctx, 56, 30, 2.4, P.E);
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
  const cache = new Map();
  // vis: { clase, look:{pelo,piel,barba,estilo}, t: tinte, arma, mascota }. vista: 'f' frente | 'b' espalda. frame: 0 quieto, 1-2 caminando.
  function personaje(vis, vista = 'f', frame = 0, expr = '') {
    const key = JSON.stringify([vis.clase, vis.look, vis.t, vis.arma, vista, vis.mascota, frame, vis.asp, expr]);
    if (cache.has(key)) return cache.get(key);
    const C = vis.mascota ? MASCOTAS[vis.mascota] : (CLASES[vis.clase] || CLASES.recluta);
    const asp = Object.assign({}, C.asp, vis.t ? TINTES[vis.t] : null, vis.asp);
    const look = vis.look || {};
    const P = { asp, H: look.pelo || asp.H || '#3a2a1e', S: asp.S || look.piel || '#f2c9a0', C: asp.C, D: asp.D || luz(asp.C, -0.3), A: asp.A || '#e8c86a', E: asp.E || '#2a1f2e', B: asp.B || '#4a3426' };
    const cv = lienzo(S, S), ctx = cv.getContext('2d');
    ctx.scale(U, U);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (vis.mascota) mascotaDibujo(ctx, C.spr, P, frame);
    else {
      const spr = C.spr || 'humano';
      if (spr === 'humano') humano(ctx, P, vis, vista, frame, expr);
      else if (spr === 'lobo') lobo(ctx, P, frame);
      else if (spr === 'arana') arana(ctx, P, frame);
      else if (spr === 'murcielago') murcielago(ctx, P, frame);
      else if (spr === 'espectro') espectro(ctx, P, frame, vis.clase === 'voz');
      else if (spr === 'golem') golem(ctx, P, frame);
    }
    cache.set(key, cv);
    return cv;
  }
  function retrato(vis, expr = '') {
    const key = 'r' + JSON.stringify(vis) + expr;
    if (cache.has(key)) return cache.get(key);
    const cv = lienzo(S, S), ctx = cv.getContext('2d');
    const humanoide = !CLASES[vis.clase]?.spr || CLASES[vis.clase].spr === 'humano';
    if (humanoide) ctx.drawImage(personaje(Object.assign({}, vis, { arma:null }), 'f', 0, expr), -S * 0.25, -S * 0.02, S * 1.5, S * 1.5);
    else ctx.drawImage(personaje(vis, 'f'), 0, 0);
    cache.set(key, cv);
    return cv;
  }

  // ---------- Terreno ----------
  const TERRENO = {
    g: { top:['#62ad4e', '#78c25e', '#4f9440'], side:['#8a6440', '#6e4e30'], pasa:true, pasto:true },
    f: { top:['#62ad4e', '#78c25e', '#4f9440'], side:['#8a6440', '#6e4e30'], pasa:true, pasto:true, flores:true },
    d: { top:['#d2ae72', '#e0be86', '#bc9a60'], side:['#9a744a', '#7e5c38'], pasa:true },
    c: { top:['#b4b4ac', '#c8c8c0', '#8e8e88'], side:['#76766e', '#5e5e58'], pasa:true, adoquin:true },
    s: { top:['#9a9aa4', '#aeaeb8', '#80808a'], side:['#686872', '#50505a'], pasa:true, piedra:true },
    k: { top:['#545066', '#625e76', '#46425a'], side:['#34303e', '#28242f'], pasa:true, adoquin:true },
    p: { top:['#6a4c8e', '#7c5ca2', '#583e78'], side:['#36244c', '#2a1c3c'], pasa:true, adoquin:true, brillo:true },
    b: { top:['#b07c44', '#c48c52', '#94663a'], side:['#744a26', '#5e3c1e'], pasa:true, tablas:true },
    a: { top:['#e6d496', '#f0e0a8', '#d4c084'], side:['#bca268', '#a48c56'], pasa:true },
    n: { top:['#f2f6fc', '#ffffff', '#dce4f0'], side:['#a4b2c4', '#8c9aac'], pasa:true, nieve:true },
    w: { top:['#4a8ad8', '#6aa8ee', '#3a74c0'], side:['#2e62a8', '#24508c'], pasa:true, costo:2, agua:true },
    W: { top:['#2e62b4', '#3e74cc', '#24529c'], side:['#204892', '#1a3c7c'], pasa:false, agua:true },
    t: { top:['#58a046', '#6eb658', '#468a3a'], side:['#8a6440', '#6e4e30'], pasa:false, deco:'arbol', pasto:true },
    r: { top:['#62ad4e', '#78c25e', '#4f9440'], side:['#8a6440', '#6e4e30'], pasa:false, deco:'roca', pasto:true },
    R: { top:['#c0503e', '#d4644e', '#963a2c'], side:['#efe2c6', '#dccaa8'], pasa:false, techo:true },
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
      bolas.forEach(([x, y, r2]) => { circulo(ctx, x, y, r2); ctx.fillStyle = gradR(ctx, x, y, r2, '#8ad06a', '#2e7434'); ctx.fill(); });
      [[42, 30, 6], [62, 54, 5], [30, 60, 4]].forEach(([x, y, r2]) => { circulo(ctx, x, y, r2); ctx.fillStyle = 'rgba(220,255,190,.35)'; ctx.fill(); });
    } else if (tipo === 'roca') {
      ctx.beginPath(); ctx.moveTo(18, 128); ctx.bezierCurveTo(10, 100, 30, 84, 52, 86); ctx.bezierCurveTo(78, 86, 92, 104, 84, 128); ctx.closePath();
      relleno(ctx, gradR(ctx, 50, 104, 40, '#c8c8d0', '#6a6a74'), true, 3);
      ctx.strokeStyle = '#5a5a64'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(44, 92); ctx.lineTo(50, 106); ctx.lineTo(46, 118); ctx.stroke();
      circulo(ctx, 36, 98, 5); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fill();
    }
    cache.set(key, cv);
    return cv;
  }

  return { personaje, retrato, texturaTop, texturaLado, flecos, deco, TERRENO, oscurecer, luz, TINTES };
})();
