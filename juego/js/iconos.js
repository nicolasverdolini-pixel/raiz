// Campanas de Bruma — íconos propios dibujados en código (reemplazan a los emojis).
'use strict';

const ICO = (() => {
  const OUT = '#1e1a2a';
  const cache = new Map();
  const T = 72;

  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function f(c, fill, lw = 3) { c.fillStyle = fill; c.fill(); c.lineWidth = lw; c.strokeStyle = OUT; c.stroke(); }
  function g(c, y0, y1, a, b) { const k = c.createLinearGradient(0, y0, 0, y1); k.addColorStop(0, a); k.addColorStop(1, b); return k; }
  function gr(c, x, y, r, a, b) { const k = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); k.addColorStop(0, a); k.addColorStop(1, b); return k; }
  function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }
  function brillo(c, x, y, r = 3) { circ(c, x, y, r); c.fillStyle = 'rgba(255,255,255,.75)'; c.fill(); }
  function frasco(c, liq, liq2, alto = false) {
    rr(c, 26, 8, 12, 8, 3); f(c, '#c89a5a');
    c.beginPath(); c.moveTo(28, 16); c.lineTo(36, 16); c.lineTo(36, alto ? 26 : 24); c.quadraticCurveTo(52, 30, 52, 44); c.quadraticCurveTo(52, 58, 32, 58); c.quadraticCurveTo(12, 58, 12, 44); c.quadraticCurveTo(12, 30, 28, alto ? 26 : 24); c.closePath();
    f(c, 'rgba(220,240,255,.55)');
    c.save(); c.clip(); c.fillStyle = g(c, 34, 58, liq, liq2); c.fillRect(0, 36, 64, 30); c.restore();
    c.beginPath(); c.moveTo(28, 16); c.lineTo(36, 16); c.lineTo(36, alto ? 26 : 24); c.quadraticCurveTo(52, 30, 52, 44); c.quadraticCurveTo(52, 58, 32, 58); c.quadraticCurveTo(12, 58, 12, 44); c.quadraticCurveTo(12, 30, 28, alto ? 26 : 24); c.closePath();
    c.lineWidth = 3; c.strokeStyle = OUT; c.stroke();
    brillo(c, 22, 40, 3.5);
  }

  const DIB = {
    oro(c) { [[24, 42], [40, 38], [32, 26]].forEach(([x, y]) => { circ(c, x, y, 14); f(c, gr(c, x, y, 14, '#fff3a0', '#d89a1a')); circ(c, x, y, 9); c.lineWidth = 2; c.strokeStyle = '#b07810'; c.stroke(); brillo(c, x - 5, y - 5, 2.5); }); },
    pocion(c) { frasco(c, '#ff6a8a', '#c02a4a'); },
    hipocion(c) { frasco(c, '#ffb04a', '#d0601a', true); circ(c, 46, 14, 5); f(c, '#fff3a0', 2); },
    eter(c) { frasco(c, '#6ac8ff', '#2a6ad0'); },
    remedio(c) { c.beginPath(); c.moveTo(32, 58); c.bezierCurveTo(8, 44, 10, 18, 32, 8); c.bezierCurveTo(54, 18, 56, 44, 32, 58); f(c, g(c, 8, 58, '#9ae86a', '#3a9a3a')); c.beginPath(); c.moveTo(32, 54); c.lineTo(32, 16); c.lineWidth = 2.5; c.strokeStyle = '#2a6a2a'; c.stroke(); },
    fenix(c) { c.beginPath(); c.moveTo(16, 58); c.bezierCurveTo(18, 34, 34, 12, 54, 6); c.bezierCurveTo(52, 26, 38, 46, 16, 58); f(c, g(c, 6, 58, '#ffe25a', '#ff4a2a')); c.beginPath(); c.moveTo(16, 58); c.quadraticCurveTo(34, 34, 52, 8); c.lineWidth = 2; c.strokeStyle = '#a8301a'; c.stroke(); },
    bomba(c) { circ(c, 30, 38, 20); f(c, gr(c, 30, 38, 20, '#6a6a7a', '#1e1e28')); rr(c, 38, 12, 10, 10, 3); f(c, '#8a8a98'); c.beginPath(); c.moveTo(44, 12); c.quadraticCurveTo(50, 4, 56, 6); c.lineWidth = 3; c.strokeStyle = '#a07040'; c.stroke(); circ(c, 57, 6, 4); c.fillStyle = '#ffb030'; c.fill(); brillo(c, 22, 30, 4); },
    elixir(c) { frasco(c, '#ffffff', '#c88aff', true); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; c.fillStyle = '#fff6b0'; circ(c, 48 + Math.cos(a) * 6, 14 + Math.sin(a) * 6, 2); c.fill(); } },
    hierro(c) { c.beginPath(); c.moveTo(10, 46); c.lineTo(20, 26); c.lineTo(54, 26); c.lineTo(58, 46); c.closePath(); f(c, g(c, 26, 46, '#d0d6e0', '#7a8496')); c.beginPath(); c.moveTo(20, 26); c.lineTo(24, 18); c.lineTo(50, 18); c.lineTo(54, 26); c.closePath(); f(c, '#e8ecf4'); },
    plata(c) { c.beginPath(); c.moveTo(32, 6); c.lineTo(54, 28); c.lineTo(32, 58); c.lineTo(10, 28); c.closePath(); f(c, g(c, 6, 58, '#ffffff', '#9ab0e0')); c.beginPath(); c.moveTo(10, 28); c.lineTo(54, 28); c.moveTo(32, 6); c.lineTo(24, 28); c.lineTo(32, 58); c.lineTo(40, 28); c.closePath(); c.lineWidth = 1.5; c.strokeStyle = '#6a80b0'; c.stroke(); },
    esquirla(c) { c.beginPath(); c.moveTo(14, 52); c.lineTo(22, 14); c.lineTo(40, 8); c.lineTo(52, 30); c.lineTo(44, 56); c.closePath(); f(c, g(c, 8, 56, '#fff2b0', '#c8962a')); c.beginPath(); c.moveTo(22, 14); c.lineTo(34, 32); c.lineTo(44, 56); c.lineWidth = 1.5; c.strokeStyle = '#a07020'; c.stroke(); brillo(c, 28, 22, 3); },
    espada(c) { c.save(); c.translate(32, 32); c.rotate(Math.PI / 4); rr(c, -4, -28, 8, 36, 3); f(c, g(c, -28, 8, '#ffffff', '#9aa4b8')); rr(c, -12, 6, 24, 6, 3); f(c, '#e8c86a'); rr(c, -3, 12, 6, 12, 2); f(c, '#7a4a28'); c.restore(); },
    hacha(c) { c.save(); c.translate(32, 32); c.rotate(Math.PI / 5); rr(c, -3, -26, 6, 52, 3); f(c, '#a0703a'); c.beginPath(); c.moveTo(2, -24); c.quadraticCurveTo(26, -26, 24, -6); c.quadraticCurveTo(16, -2, 2, -6); c.closePath(); f(c, g(c, -26, -2, '#ffffff', '#9aa4b8')); c.restore(); },
    daga(c) { c.save(); c.translate(32, 32); c.rotate(Math.PI / 4); c.beginPath(); c.moveTo(-5, 2); c.lineTo(0, -26); c.lineTo(5, 2); c.closePath(); f(c, g(c, -26, 2, '#ffffff', '#9aa4b8')); rr(c, -11, 2, 22, 6, 3); f(c, '#e8c86a'); rr(c, -3, 8, 6, 12, 2); f(c, '#7a4a28'); c.restore(); },
    arco(c) { c.beginPath(); c.moveTo(20, 8); c.quadraticCurveTo(58, 32, 20, 56); c.lineWidth = 8; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 5; c.strokeStyle = '#b07a40'; c.stroke(); c.beginPath(); c.moveTo(20, 8); c.lineTo(20, 56); c.lineWidth = 1.6; c.strokeStyle = '#f4f0e6'; c.stroke(); c.beginPath(); c.moveTo(12, 32); c.lineTo(46, 32); c.lineWidth = 2.5; c.strokeStyle = '#6a4428'; c.stroke(); c.beginPath(); c.moveTo(46, 27); c.lineTo(54, 32); c.lineTo(46, 37); c.closePath(); f(c, '#dfe4ec', 2); },
    vara(c) { c.save(); c.translate(32, 32); c.rotate(Math.PI / 6); rr(c, -3, -18, 6, 46, 3); f(c, '#9a6a3a'); circ(c, 0, -22, 9); f(c, gr(c, 0, -22, 9, '#ffffff', '#8a6aff')); c.restore(); },
    maza(c) { rr(c, 29, 34, 6, 24, 2); f(c, '#7a4a28'); c.beginPath(); c.moveTo(14, 36); c.quadraticCurveTo(14, 8, 32, 8); c.quadraticCurveTo(50, 8, 50, 36); c.quadraticCurveTo(54, 40, 32, 40); c.quadraticCurveTo(10, 40, 14, 36); f(c, g(c, 8, 40, '#fff2b0', '#c8962a')); circ(c, 32, 43, 4); f(c, '#c8962a', 2); brillo(c, 24, 18, 3); },
    lanza(c) { c.save(); c.translate(32, 32); c.rotate(Math.PI / 4); rr(c, -2.5, -16, 5, 46, 2); f(c, '#9a6a3a'); c.beginPath(); c.moveTo(-7, -14); c.lineTo(0, -30); c.lineTo(7, -14); c.lineTo(0, -10); c.closePath(); f(c, g(c, -30, -10, '#ffffff', '#9aa4b8')); c.restore(); },
    'puños'(c) { rr(c, 12, 20, 40, 30, 12); f(c, g(c, 20, 50, '#ffd8b0', '#d89a6a')); [20, 30, 40].forEach(x => { c.beginPath(); c.moveTo(x, 22); c.lineTo(x, 34); c.lineWidth = 2; c.strokeStyle = '#a06a40'; c.stroke(); }); rr(c, 10, 40, 44, 12, 5); f(c, '#c84a3a'); },
    tela(c) { c.beginPath(); c.moveTo(20, 10); c.lineTo(44, 10); c.lineTo(54, 22); c.lineTo(48, 28); c.lineTo(46, 56); c.lineTo(18, 56); c.lineTo(16, 28); c.lineTo(10, 22); c.closePath(); f(c, g(c, 10, 56, '#8a9ae8', '#3a4aa8')); c.beginPath(); c.moveTo(32, 14); c.lineTo(32, 56); c.lineWidth = 2.5; c.strokeStyle = '#e8c86a'; c.stroke(); },
    cuero(c) { c.beginPath(); c.moveTo(18, 10); c.lineTo(46, 10); c.lineTo(52, 24); c.lineTo(48, 54); c.lineTo(16, 54); c.lineTo(12, 24); c.closePath(); f(c, g(c, 10, 54, '#c8925a', '#7a4a28')); rr(c, 14, 34, 36, 6, 2); f(c, '#4a2a18', 2); rr(c, 28, 33, 8, 8, 2); f(c, '#e8c86a', 2); },
    malla(c) { c.beginPath(); c.moveTo(16, 12); c.quadraticCurveTo(32, 6, 48, 12); c.lineTo(52, 30); c.quadraticCurveTo(50, 50, 32, 58); c.quadraticCurveTo(14, 50, 12, 30); c.closePath(); f(c, g(c, 6, 58, '#ffffff', '#8a94a8')); c.beginPath(); c.moveTo(32, 12); c.lineTo(32, 54); c.lineWidth = 2; c.strokeStyle = '#6a7488'; c.stroke(); brillo(c, 22, 20, 3.5); },
    acc(c) { circ(c, 32, 38, 16); c.lineWidth = 9; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 6; c.strokeStyle = '#e8c86a'; c.stroke(); c.beginPath(); c.moveTo(32, 8); c.lineTo(42, 18); c.lineTo(32, 28); c.lineTo(22, 18); c.closePath(); f(c, g(c, 8, 28, '#ff9ad0', '#c82a7a')); },
    mover(c) { [[18, 30], [38, 18]].forEach(([x, y]) => { c.beginPath(); c.ellipse(x + 6, y + 10, 9, 14, -0.2, 0, Math.PI * 2); f(c, g(c, y - 4, y + 24, '#c8925a', '#7a4a28')); [0, 1, 2].forEach(i => { circ(c, x + i * 5, y - 8 + (i % 2) * -2, 3.2); f(c, '#c8925a', 2); }); }); },
    atacar(c) { DIB.espada(c); },
    habilidad(c) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 11 : 26; c.lineTo(32 + Math.cos(a) * r, 33 + Math.sin(a) * r); } c.closePath(); f(c, gr(c, 32, 33, 26, '#fff6c0', '#e8a82a')); },
    objeto(c) { c.beginPath(); c.moveTo(14, 26); c.quadraticCurveTo(12, 58, 32, 58); c.quadraticCurveTo(52, 58, 50, 26); c.closePath(); f(c, g(c, 26, 58, '#d8a060', '#8a5a2a')); rr(c, 12, 18, 40, 10, 4); f(c, '#a0703a'); c.beginPath(); c.moveTo(24, 18); c.quadraticCurveTo(32, 4, 40, 18); c.lineWidth = 3; c.strokeStyle = OUT; c.stroke(); rr(c, 27, 34, 10, 8, 2); f(c, '#e8c86a', 2); },
    terminar(c) { c.beginPath(); c.moveTo(16, 8); c.lineTo(48, 8); c.lineTo(48, 14); c.quadraticCurveTo(48, 28, 34, 32); c.quadraticCurveTo(48, 36, 48, 50); c.lineTo(48, 56); c.lineTo(16, 56); c.lineTo(16, 50); c.quadraticCurveTo(16, 36, 30, 32); c.quadraticCurveTo(16, 28, 16, 14); c.closePath(); f(c, 'rgba(220,240,255,.6)'); c.beginPath(); c.moveTo(22, 52); c.lineTo(42, 52); c.lineTo(32, 40); c.closePath(); c.fillStyle = '#e8c86a'; c.fill(); rr(c, 12, 4, 40, 6, 3); f(c, '#a0703a', 2); rr(c, 12, 54, 40, 6, 3); f(c, '#a0703a', 2); },
    deshacer(c) { c.beginPath(); c.arc(34, 36, 16, Math.PI * 1.1, Math.PI * 0.6, false); c.lineWidth = 10; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 6; c.strokeStyle = '#8ad0ff'; c.stroke(); c.beginPath(); c.moveTo(8, 26); c.lineTo(24, 14); c.lineTo(26, 32); c.closePath(); f(c, '#8ad0ff', 2.5); },
    grupo(c) { [[22, 26, '#5a8ae8'], [42, 26, '#e85a6a']].forEach(([x, y, col]) => { rr(c, x - 12, y + 12, 24, 22, 10); f(c, col); circ(c, x, y, 10); f(c, '#ffd8b0'); }); },
    mapa(c) { c.beginPath(); c.moveTo(8, 14); c.lineTo(24, 8); c.lineTo(40, 14); c.lineTo(56, 8); c.lineTo(56, 50); c.lineTo(40, 56); c.lineTo(24, 50); c.lineTo(8, 56); c.closePath(); f(c, g(c, 8, 56, '#f8ecc8', '#d8c090')); c.beginPath(); c.moveTo(24, 8); c.lineTo(24, 50); c.moveTo(40, 14); c.lineTo(40, 56); c.lineWidth = 2; c.strokeStyle = '#a89060'; c.stroke(); c.beginPath(); c.moveTo(14, 40); c.quadraticCurveTo(26, 24, 46, 26); c.setLineDash([3, 3]); c.lineWidth = 2.5; c.strokeStyle = '#c84a3a'; c.stroke(); c.setLineDash([]); },
    ajustes(c) { c.beginPath(); for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = i % 2 ? 20 : 26; c.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } c.closePath(); f(c, g(c, 6, 58, '#e0e4ee', '#8a94a8')); circ(c, 32, 32, 8); f(c, '#3a3a4a'); },
    tienda(c) { DIB.pocion(c); },
    herreria(c) { c.beginPath(); c.moveTo(8, 26); c.lineTo(50, 26); c.quadraticCurveTo(58, 26, 58, 18); c.lineTo(58, 32); c.lineTo(44, 36); c.lineTo(40, 48); c.lineTo(48, 56); c.lineTo(16, 56); c.lineTo(24, 48); c.lineTo(20, 36); c.lineTo(8, 32); c.closePath(); f(c, g(c, 18, 56, '#8a8aa0', '#3a3a4a')); brillo(c, 18, 30, 3); },
    joyeria(c) { c.beginPath(); c.moveTo(16, 22); c.lineTo(26, 10); c.lineTo(38, 10); c.lineTo(48, 22); c.lineTo(32, 56); c.closePath(); f(c, g(c, 10, 56, '#b8f0ff', '#3a8ad8')); c.beginPath(); c.moveTo(16, 22); c.lineTo(48, 22); c.moveTo(26, 10); c.lineTo(24, 22); c.lineTo(32, 56); c.lineTo(40, 22); c.lineTo(38, 10); c.lineWidth = 1.5; c.strokeStyle = '#2a6aa8'; c.stroke(); brillo(c, 26, 16, 2.5); },
    criadero(c) { circ(c, 32, 40, 13); f(c, '#e8a0b8'); [[16, 22], [27, 13], [38, 13], [49, 22]].forEach(([x, y]) => { circ(c, x, y, 6.5); f(c, '#e8a0b8'); }); },
    taberna(c) { rr(c, 12, 16, 32, 40, 6); f(c, g(c, 16, 56, '#ffd060', '#c8862a')); rr(c, 10, 10, 36, 12, 6); f(c, '#ffffff'); c.beginPath(); c.arc(46, 34, 9, -Math.PI / 2, Math.PI / 2); c.lineWidth = 8; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 5; c.strokeStyle = '#c8862a'; c.stroke(); },
    hablar(c) { c.beginPath(); c.moveTo(10, 14); c.quadraticCurveTo(10, 8, 18, 8); c.lineTo(48, 8); c.quadraticCurveTo(56, 8, 56, 14); c.lineTo(56, 36); c.quadraticCurveTo(56, 42, 48, 42); c.lineTo(26, 42); c.lineTo(14, 54); c.lineTo(18, 42); c.quadraticCurveTo(10, 42, 10, 36); c.closePath(); f(c, '#ffffff'); [22, 33, 44].forEach(x => { circ(c, x, 25, 3.5); c.fillStyle = '#3a3a4a'; c.fill(); }); },
    mision(c) { rr(c, 14, 8, 36, 48, 4); f(c, g(c, 8, 56, '#fff4d0', '#e0c890')); [18, 26, 34].forEach(y => { c.beginPath(); c.moveTo(20, y); c.lineTo(44, y); c.lineWidth = 2.5; c.strokeStyle = '#a08050'; c.stroke(); }); circ(c, 44, 46, 9); f(c, '#c83a3a', 2.5); },
    secreto(c) { circ(c, 32, 32, 24); f(c, gr(c, 32, 32, 24, '#d8b0ff', '#5a2a9a')); c.font = 'bold 34px Fredoka, sans-serif'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.fillText('?', 32, 44); },
    pueblo(c) { c.beginPath(); c.moveTo(8, 30); c.lineTo(32, 8); c.lineTo(56, 30); c.closePath(); f(c, g(c, 8, 30, '#ff8a6a', '#c0402a')); rr(c, 14, 28, 36, 28, 3); f(c, '#f4e4c4'); rr(c, 26, 38, 12, 18, 3); f(c, '#7a4a28'); },
    batalla(c) { c.save(); c.translate(32, 32); [-1, 1].forEach(s => { c.save(); c.scale(s, 1); c.rotate(Math.PI / 4); rr(c, -3, -26, 6, 34, 2); f(c, g(c, -26, 8, '#ffffff', '#9aa4b8'), 2.5); rr(c, -9, 6, 18, 5, 2); f(c, '#e8c86a', 2.5); c.restore(); }); c.restore(); },
    alerta(c) { circ(c, 32, 32, 24); f(c, gr(c, 32, 32, 24, '#ffb08a', '#d02a1a')); rr(c, 28, 14, 8, 24, 4); c.fillStyle = '#fff'; c.fill(); circ(c, 32, 46, 4.5); c.fill(); },
    auto(c) { rr(c, 14, 18, 36, 32, 10); f(c, g(c, 18, 50, '#c8d8f0', '#6a7ab0')); [26, 38].forEach(x => { circ(c, x, 32, 5); c.fillStyle = '#5affd0'; c.fill(); }); rr(c, 24, 41, 16, 3, 1.5); c.fillStyle = OUT; c.fill(); c.beginPath(); c.moveTo(32, 18); c.lineTo(32, 8); c.lineWidth = 3; c.strokeStyle = OUT; c.stroke(); circ(c, 32, 7, 4); f(c, '#ff5a6a', 2); },
    velocidad(c) { [[10], [30]].forEach(([x]) => { c.beginPath(); c.moveTo(x, 14); c.lineTo(x + 22, 32); c.lineTo(x, 50); c.closePath(); f(c, g(c, 14, 50, '#8ae8ff', '#2a8ad8')); }); },
    menu(c) { [18, 32, 46].forEach(y => { rr(c, 12, y - 4, 40, 8, 4); f(c, '#e8ecff', 2.5); }); },
    volver(c) { c.beginPath(); c.moveTo(10, 32); c.lineTo(30, 12); c.lineTo(30, 24); c.lineTo(54, 24); c.lineTo(54, 40); c.lineTo(30, 40); c.lineTo(30, 52); c.closePath(); f(c, '#e8ecff'); },
    musica(c) { c.beginPath(); c.moveTo(22, 46); c.lineTo(22, 14); c.lineTo(50, 8); c.lineTo(50, 40); c.lineWidth = 4; c.strokeStyle = OUT; c.stroke(); circ(c, 16, 46, 7); f(c, '#c9a6ff'); circ(c, 44, 40, 7); f(c, '#c9a6ff'); },
    corazon(c) { c.beginPath(); c.moveTo(32, 56); c.bezierCurveTo(4, 36, 10, 10, 32, 22); c.bezierCurveTo(54, 10, 60, 36, 32, 56); f(c, gr(c, 26, 28, 26, '#ff9aaa', '#d02a4a')); brillo(c, 22, 24, 3); },
    llave(c) { circ(c, 22, 22, 12); f(c, '#e8c86a'); circ(c, 22, 22, 5); c.fillStyle = '#1a2468'; c.fill(); c.beginPath(); c.moveTo(30, 30); c.lineTo(54, 54); c.lineWidth = 9; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 6; c.strokeStyle = '#e8c86a'; c.stroke(); rr(c, 42, 44, 8, 6, 2); f(c, '#e8c86a', 2); },
    estrella(c) { DIB.habilidad(c); },
    fuego(c) { c.beginPath(); c.moveTo(32, 58); c.bezierCurveTo(10, 56, 10, 30, 26, 8); c.bezierCurveTo(28, 22, 36, 24, 38, 16); c.bezierCurveTo(56, 30, 56, 56, 32, 58); f(c, g(c, 8, 58, '#ffe25a', '#ff4a1a')); c.beginPath(); c.moveTo(32, 54); c.bezierCurveTo(22, 52, 22, 40, 30, 30); c.bezierCurveTo(34, 38, 44, 42, 32, 54); c.fillStyle = '#fff6b0'; c.fill(); },
    hielo(c) { c.lineCap = 'round'; for (let i = 0; i < 3; i++) { c.save(); c.translate(32, 32); c.rotate(i * Math.PI / 3); c.beginPath(); c.moveTo(0, -26); c.lineTo(0, 26); c.moveTo(-8, -18); c.lineTo(0, -10); c.lineTo(8, -18); c.moveTo(-8, 18); c.lineTo(0, 10); c.lineTo(8, 18); c.lineWidth = 8; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 4.5; c.strokeStyle = '#9ae8ff'; c.stroke(); c.restore(); } },
    rayo(c) { c.beginPath(); c.moveTo(38, 4); c.lineTo(14, 36); c.lineTo(30, 36); c.lineTo(24, 60); c.lineTo(50, 26); c.lineTo(34, 26); c.closePath(); f(c, g(c, 4, 60, '#fff6a0', '#f0b020')); },
    luz(c) { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.beginPath(); c.moveTo(32 + Math.cos(a) * 16, 32 + Math.sin(a) * 16); c.lineTo(32 + Math.cos(a) * 28, 32 + Math.sin(a) * 28); c.lineWidth = 6; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 3; c.strokeStyle = '#ffe680'; c.stroke(); } circ(c, 32, 32, 13); f(c, gr(c, 32, 32, 13, '#ffffff', '#ffd040')); },
    sonido(c) { DIB.musica(c); },
    perro(c) { circ(c, 32, 36, 18); f(c, gr(c, 32, 36, 18, '#e8c098', '#a06a3a')); [[16, 26], [48, 26]].forEach(([x, y]) => { c.beginPath(); c.ellipse(x, y, 6, 12, x < 32 ? 0.4 : -0.4, 0, Math.PI * 2); f(c, '#7a4a28'); }); [26, 38].forEach(x => { circ(c, x, 34, 3); c.fillStyle = OUT; c.fill(); }); circ(c, 32, 42, 4); c.fillStyle = OUT; c.fill(); },
  };

  // Reemplaza los emojis que haya en un elemento por íconos propios.
  const EMOJI = { '💰':'oro', '🧪':'pocion', '⚗️':'hipocion', '💧':'eter', '🌿':'remedio', '🪶':'fenix', '💣':'bomba', '✨':'estrella',
    '⚔️':'batalla', '⚔':'batalla', '🪓':'hacha', '🗡️':'daga', '🏹':'arco', '🪄':'vara', '🔔':'maza', '🔱':'lanza', '👊':'puños', '🥋':'tela', '🦺':'cuero', '🛡️':'malla', '💍':'acc',
    '⛏️':'hierro', '🎁':'objeto', '🐾':'criadero', '👣':'mover', '🎒':'objeto', '⏳':'terminar', '⏩':'velocidad', '☰':'menu', '🤖':'auto', '🔊':'musica', '🔇':'musica', '🔕':'maza',
    '🏳':'volver', '❗':'alerta', '🏠':'pueblo', '👥':'grupo', '⚙️':'ajustes', '❓':'secreto', '🏁':'mapa', '🗑':'bomba', '⚒️':'herreria', '💎':'joyeria', '🍺':'taberna', '🗺️':'mapa',
    '✏️':'mision', '🔒':'llave', '🔥':'fuego', '🔨':'herreria', '↩':'deshacer', '❄':'hielo', '⚡':'rayo', '♪':'sonido', '💬':'hablar', '📜':'mision', '❤️':'corazon', '🐶':'perro' };
  const RE = new RegExp(Object.keys(EMOJI).sort((a, b) => b.length - a.length).map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  function iconizar(raiz) {
    if (!raiz) return;
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    const nodos = [];
    while (w.nextNode()) { RE.lastIndex = 0; if (RE.test(w.currentNode.nodeValue)) nodos.push(w.currentNode); }
    nodos.forEach(n => {
      const frag = document.createDocumentFragment();
      let ultimo = 0; const txt = n.nodeValue;
      txt.replace(RE, (m, i) => {
        if (i > ultimo) frag.appendChild(document.createTextNode(txt.slice(ultimo, i)));
        const img = document.createElement('img'); img.className = 'ico'; img.alt = ''; img.src = canvasDe(EMOJI[m]);
        frag.appendChild(img); ultimo = i + m.length; return m;
      });
      if (ultimo < txt.length) frag.appendChild(document.createTextNode(txt.slice(ultimo)));
      n.parentNode.replaceChild(frag, n);
    });
  }

  function canvasDe(nombre) {
    if (cache.has(nombre)) return cache.get(nombre);
    const cv = document.createElement('canvas'); cv.width = cv.height = T;
    const c = cv.getContext('2d');
    c.scale(T / 64, T / 64); c.lineJoin = 'round'; c.lineCap = 'round';
    (DIB[nombre] || DIB.estrella)(c);
    const url = cv.toDataURL();
    cache.set(nombre, url);
    return url;
  }
  // Devuelve un <img> listo para meter en HTML.
  function html(nombre, px = 22, clase = '') { return `<img class="ico ${clase}" src="${canvasDe(nombre)}" style="width:${px}px;height:${px}px" alt="">`; }
  function deItem(id) { const d = EQ[id]; return d.slot === 'arma' ? d.tipo : d.slot === 'armadura' ? d.tipo : 'acc'; }
  return { html, url:canvasDe, deItem, iconizar, existe: n => !!DIB[n] };
})();
