// Campanas de Bruma — pantallas: título, mapa del mundo, pueblos, tienda, herrería, taberna, grupo, diálogos y resultados.
'use strict';

const app = () => document.getElementById('app');
const ICON_OBJ = new Proxy({}, { get:(o, k) => ICO.html(k, 34) });

function montar(html, acciones = {}) {
  const a = app();
  a.innerHTML = html;
  ICO.iconizar(a);
  a.onclick = e => {
    const b = e.target.closest('[data-x]');
    if (!b || b.disabled || b.classList.contains('off')) return;
    Sonido.iniciar();
    const f = acciones[b.dataset.x];
    if (f) { Sonido.fx(b.dataset.x === 'volver' ? 'atras' : 'sel'); f(b.dataset, b); }
  };
  a.scrollTop = 0;
}
function toast(txt, tipo = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + tipo; t.textContent = txt;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('fuera'), 1800);
  setTimeout(() => t.remove(), 2300);
}
function modal(html, acciones = {}) {
  const d = document.createElement('div');
  d.className = 'modal';
  d.innerHTML = `<div class="ventana">${html}</div>`;
  ICO.iconizar(d);
  document.body.appendChild(d);
  const cerrar = () => d.remove();
  d.addEventListener('click', e => {
    if (e.target === d) { cerrar(); return; }
    const b = e.target.closest('[data-x]'); if (!b || b.disabled) return;
    Sonido.fx(b.dataset.x === 'cerrar' ? 'atras' : 'sel');
    if (b.dataset.x === 'cerrar') { cerrar(); return; }
    acciones[b.dataset.x]?.(b.dataset, cerrar);
  });
  return cerrar;
}
function confirmar(txt, si) { modal(`<p>${txt}</p><div class="fila"><button data-x="si" class="ok">Sí</button><button data-x="cerrar">No</button></div>`, { si:(d, c) => { c(); si(); } }); }
function spriteHTML(vis, px = 48, vista = 'f') {
  const c = SPR.personaje(vis, vista);
  return `<img class="spr" src="${c.toDataURL()}" style="width:${px}px;height:${px}px" alt="">`;
}
function visDe(u) {
  const a = item(u.eq.arma);
  const tipo = a ? EQ[a.id].tipo : null;
  return { clase:u.clase, look:u.look, unico:u.unico, eqv:eqVisual(u), maestro:dominada(u, u.clase), arma: ['espada', 'hacha', 'daga', 'arco', 'vara', 'maza', 'lanza'].includes(tipo) ? tipo : null };
}
function cabecera(titulo, volver = true) {
  return `<header class="cab">${volver ? '<button data-x="volver" class="mini">←</button>' : '<span></span>'}<h2>${esc(titulo)}</h2><span class="oro">💰 ${G.oro}</span></header>`;
}
function gemaHTML(clave) {
  const g = gemaInfo(clave);
  return g ? `<span class="gema" style="--c:${g.def.c}" title="${esc(nombreGema(clave))}">◆</span>` : '<span class="gema vacia">◇</span>';
}
function nombreItem(it) { return EQ[it.id].n + (it.mejora ? ` +${it.mejora}` : ''); }
function nombreItemHTML(it) { const R = RAREZAS[it.rareza || 0]; return `<span class="rz rz${it.rareza || 0}" style="color:${R.c}">${esc(nombreItem(it))}</span>`; }
function statsInst(it) {
  const d = EQ[it.id], R = RAREZAS[it.rareza || 0], p = [];
  if (d.slot === 'arma') p.push(`Poder ${Math.round(d.poder * (1 + R.m)) + it.mejora * 2}`);
  if (d.def) p.push(`Def ${Math.round(d.def * (1 + (d.slot === 'armadura' ? R.m : 0))) + (d.slot === 'armadura' ? it.mejora : 0)}`);
  if (d.res) p.push(`Res ${Math.round(d.res * (1 + (d.slot === 'armadura' ? R.m : 0))) + (d.slot === 'armadura' ? it.mejora : 0)}`);
  ['atk', 'mag', 'mp', 'spd', 'mov', 'salto', 'eva'].forEach(k => { if (d[k]) p.push(`${{ atk:'Atq', mag:'Mag', mp:'PM', spd:'Vel', mov:'Mov', salto:'Salto', eva:'Eva' }[k]} +${d[k]}`); });
  for (const [k, v] of Object.entries(it.bonos || {})) p.push(`<span style="color:${R.c}">${BONOS_EQ[k]} +${v}</span>`);
  (d.rasgos || []).forEach(r => p.push(`<span class="rasgo" title="${RASGOS[r].d}">★ ${RASGOS[r].n}: ${RASGOS[r].d}</span>`));
  const el = d.el || it.el; if (el) p.push(ELEMENTOS[el].i + ' ' + ELEMENTOS[el].n);
  if (d.inmune) p.push('Inmune: ' + d.inmune.map(e => ESTADOS[e].n).join(', '));
  if (it.gemas.length) p.push(`${it.gemas.length} engarce${it.gemas.length > 1 ? 's' : ''}`);
  return p.join(' · ');
}
function statsItem(id, mejora = 0) {
  const d = EQ[id], p = [];
  if (d.slot === 'arma') p.push(`Poder ${d.poder + mejora * 2}`);
  if (d.def) p.push(`Def ${d.def + (d.slot === 'armadura' ? mejora : 0)}`);
  if (d.res) p.push(`Res ${d.res + (d.slot === 'armadura' ? mejora : 0)}`);
  ['atk', 'mag', 'mp', 'spd', 'mov', 'salto', 'eva'].forEach(k => { if (d[k]) p.push(`${{ atk:'Atq', mag:'Mag', mp:'PM', spd:'Vel', mov:'Mov', salto:'Salto', eva:'Eva' }[k]} +${d[k]}`); });
  if (d.el) p.push(ELEMENTOS[d.el].i + ' ' + ELEMENTOS[d.el].n);
  if (d.inmune) p.push('Inmune: ' + d.inmune.map(e => ESTADOS[e].n).join(', '));
  if (d.veneno) p.push('Envenena');
  if (d.gemas) p.push(`${d.gemas} engarce${d.gemas > 1 ? 's' : ''}`);
  (d.rasgos || []).forEach(r => p.push(`<span class="rasgo">★ ${RASGOS[r].n}</span>`));
  return p.join(' · ');
}
function iconoItem(id) { return ICO.html(ICO.deItem(id), 34); }

// ---------- Título ----------
function pantallaTitulo() {
  Sonido.musica('titulo');
  montar(`
    <div class="titulo">
      <canvas id="tit-cv"></canvas>
      <div class="tit-txt">
        <div class="tit-camp">🔔</div>
        <h1>Campanas<br>de Bruma</h1>
        <p class="tit-sub">Un juego de tácticas</p>
      </div>
      <div class="tit-botones">
        <button data-x="jugar" class="ok grande">Jugar</button>
        <button data-x="ayuda" class="sec">Cómo se juega</button>
        <button data-x="creditos" class="sec">Créditos</button>
      </div>
      <div class="tit-pie">Tocá para activar el sonido</div>
    </div>`, {
    jugar: elegirRanura,
    ayuda: mostrarAyuda,
    creditos: mostrarCreditos,
  });
  animarTitulo();
}
// Los personajes usan arte LPC: la licencia pide nombrar a cada artista.
function mostrarCreditos() {
  const cerrar = modal(`<h3>Créditos</h3><p class="sub centro">Cargando…</p><button data-x="cerrar" class="sec">Volver</button>`, {});
  Promise.all(['arte/lpc/creditos.json', 'arte/monstruos/creditos.json'].map(u => fetch(u).then(r => r.json()))).then(([a, b]) => {
    const d = Object.assign({}, a, b);
    const autores = new Map();
    Object.values(d).forEach(c => c.autores.forEach(a => { if (!autores.has(a)) autores.set(a, new Set()); autores.get(a).add(c.n); }));
    const lic = [...new Set(Object.values(d).flatMap(c => c.licencias))].sort();
    cerrar();
    modal(`<h3>Créditos</h3>
      <div class="creditos">
        <p>Juego, historia, mapa del mundo, música y efectos: hechos para este juego.</p>
        <p><b>Personajes, monstruos, mascotas, suelos, casas, árboles, ropa, armaduras y armas:</b> sprites del Liberated Pixel Cup (LPC), del Universal LPC Spritesheet Character Generator y de OpenGameArt, de estos artistas:</p>
        <ul>${[...autores.keys()].sort((a, b) => a.localeCompare(b)).map(a => `<li>${esc(a)}</li>`).join('')}</ul>
        <p class="sub">Licencias: ${lic.map(esc).join(', ')}. Detalle en <code>arte/lpc/creditos.json</code> y <code>arte/monstruos/creditos.json</code>. Más info: opengameart.org y github.com/LiberatedPixelCup.</p>
        <p class="sub">Juego sin fines comerciales.</p>
      </div>
      <button data-x="cerrar" class="sec">Volver</button>`, {});
  }).catch(() => {});
}
// Tres partidas guardadas por celular: cada uno juega la suya sin pisar las otras.
function elegirRanura() {
  const fila = i => {
    const r = resumenSlot(i);
    return `<div class="ranura"><div class="ran-dat"><b>Partida ${i + 1}${r && r.nombre ? ' · ' + esc(r.nombre) : ''}</b><small>${r ? (r.paso >= HISTORIA.length ? 'Historia terminada' : 'Capítulo ' + (() => { const g = G; G = { paso:r.paso }; try { return capituloActual(); } finally { G = g; } })()) + ` · nivel ${r.nv} · ${r.oro} oro` : 'Vacía'}</small></div>
      ${r ? `<button data-x="cont" data-i="${i}" class="ok mini">Seguir</button><button data-x="borrar" data-i="${i}" class="peligro mini">🗑</button>` : `<button data-x="nueva" data-i="${i}" class="mini">Nueva</button>`}</div>`;
  };
  modal(`<h3>Elegí tu partida</h3><p class="sub centro">Cada partida se guarda aparte en este celular. Si jugás con amigos, cada uno usa la suya (o juega en su propio teléfono).</p>${[0, 1, 2].map(fila).join('')}<button data-x="importar">📥 Cargar una partida con código</button><button data-x="cerrar" class="sec">Volver</button>`, {
    importar: (d, c) => { c(); cargarCodigo(); },
    cont: (d, c) => { c(); usarSlot(+d.i); cargar(); pantallaMapa(); },
    nueva: (d, c) => {
      c(); usarSlot(+d.i);
      const n = (prompt('¿Cómo se llama quien juega esta partida?', '') || '').trim().slice(0, 16);
      nuevaPartida(); G.nombre = n; guardar(); jugarPaso(0);
    },
    borrar: (d, c) => { c(); confirmar(`¿Borrar la partida ${+d.i + 1}? No se puede deshacer.`, () => { borrarSlot(+d.i); elegirRanura(); }); },
  });
}
function animarTitulo() {
  const cv = document.getElementById('tit-cv'); if (!cv) return;
  const ctx = cv.getContext('2d');
  const r = cv.getBoundingClientRect(); cv.width = r.width; cv.height = r.height;
  const nieblas = Array.from({ length:18 }, () => ({ x:Math.random(), y:0.4 + Math.random() * 0.6, v:azar(0.0002, 0.0008), s:azar(0.2, 0.5) }));
  const estrellas = Array.from({ length:60 }, () => ({ x:Math.random(), y:Math.random() * 0.5, f:Math.random() * 6 }));
  const step = t => {
    if (!document.getElementById('tit-cv')) return;
    const W = cv.width, H = cv.height;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0b1030'); g.addColorStop(0.6, '#2a2050'); g.addColorStop(1, '#4a3a6a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    estrellas.forEach(e => { ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.sin(t / 600 + e.f) * 0.4})`; ctx.fillRect(e.x * W, e.y * H, 2, 2); });
    // Torres con campanas
    [[0.12, 0.55], [0.3, 0.42], [0.5, 0.36], [0.7, 0.42], [0.88, 0.55]].forEach(([x, y], i) => {
      const tx = x * W, ty = y * H, w = W * 0.07;
      ctx.fillStyle = '#1a1430'; ctx.fillRect(tx - w / 2, ty, w, H - ty);
      ctx.beginPath(); ctx.moveTo(tx - w * 0.7, ty); ctx.lineTo(tx, ty - w * 1.2); ctx.lineTo(tx + w * 0.7, ty); ctx.fill();
      const sw = Math.sin(t / 700 + i) * 0.25;
      ctx.save(); ctx.translate(tx, ty + w * 0.3); ctx.rotate(sw);
      ctx.fillStyle = '#e8c86a'; ctx.beginPath(); ctx.moveTo(-w * 0.25, w * 0.35); ctx.quadraticCurveTo(-w * 0.22, -w * 0.05, 0, -w * 0.1); ctx.quadraticCurveTo(w * 0.22, -w * 0.05, w * 0.25, w * 0.35); ctx.fill();
      ctx.restore();
      ctx.fillStyle = 'rgba(255,220,140,.12)'; ctx.beginPath(); ctx.arc(tx, ty + w * 0.4, w * 0.9, 0, Math.PI * 2); ctx.fill();
    });
    nieblas.forEach(n => {
      n.x += n.v; if (n.x > 1.3) n.x = -0.3;
      const rg = ctx.createRadialGradient(n.x * W, n.y * H, 0, n.x * W, n.y * H, n.s * W);
      rg.addColorStop(0, 'rgba(230,230,250,.16)'); rg.addColorStop(1, 'rgba(230,230,250,0)');
      ctx.fillStyle = rg; ctx.fillRect(n.x * W - n.s * W, n.y * H - n.s * W, n.s * W * 2, n.s * W * 2);
    });
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function mostrarAyuda() {
  modal(`<h3>Cómo se juega</h3><div class="ayuda">
    <p><b>Batallas por turnos.</b> Cada personaje actúa cuando le llega el turno (los más rápidos, más seguido). En tu turno podés <b>mover</b> y <b>actuar</b> una vez cada cosa, en el orden que quieras.</p>
    <p><b>Alturas y espaldas.</b> Pegarle a alguien por la espalda hace más daño y casi nunca falla. Al terminar el turno elegís para dónde mira tu personaje. Desde lo alto los arcos llegan más lejos.</p>
    <p><b>Clases.</b> Cada acción da <b>EXP</b> (nivel del personaje) y <b>PC</b> (puntos de la clase que tiene puesta). Con PC aprendés habilidades, y subiendo de nivel las clases se destraban clases nuevas.</p>
    <p><b>Secundaria y pasiva.</b> Además de su clase, cada personaje puede usar las habilidades de otra clase (secundaria) y llevar habilidades pasivas aprendidas: varias a la vez si son del mismo oficio, pero no mezcladas entre oficios.</p>
    <p><b>Herrería.</b> Mejorá armas y armaduras con oro y minerales, engarzá <b>gemas</b> (dan elemento, atributos o una habilidad extra) y forjá equipo especial.</p>
    <p><b>Mascotas.</b> Acompañan a su dueño, le suben atributos y a veces actúan solas. Suben de nivel con las batallas.</p>
    <p><b>Patrullas.</b> En las zonas que ya ganaste podés volver a pelear para juntar experiencia, oro y materiales.</p>
    <p><b>Pueblos.</b> Arrastrá el dedo para caminar. Entrá a las tiendas por la puerta y hablá con la gente: algunos cuentan cosas según cómo vas, y otros te dan <b>misiones secretas</b> que aparecen en el mapa.</p>
    <p><b>Hechizos con carga.</b> Los hechizos grandes no salen al instante: se ven en la fila de turnos (✦) y caen donde apuntaste. Si el enemigo se mueve, lo esquiva.</p>
    <p><b>Rarezas.</b> El equipo puede ser común, raro, especial, legendario o mítico: más poder, atributos extra y más engarces.</p>
    <p><b>Es difícil a propósito.</b> Si un jefe te gana, entrená, mejorá el equipo y probá otras clases.</p>
  </div><button data-x="cerrar" class="ok">Entendido</button>`);
}

// ---------- Mapa del mundo ----------
// Mapa del mundo ilustrado: costas marcadas, bosques, montañas y volcanes dibujados como íconos.
const imgMundo = {};
const REGIONES = { norte:'Aldmora', sur:'Tierras del Sur', este:'Islas del Eco' };
function pintarMundo(region = 'norte') {
  if (imgMundo[region]) return imgMundo[region];
  const W = 720, H = 1120, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(W, H);
  const semilla = region === 'sur' ? 777 : region === 'este' ? 4242 : 12345;
  const r = (() => { let s = semilla; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })();
  const G0 = 16, grid = Array.from({ length:(G0 + 1) * (G0 + 1) }, r), grid2 = Array.from({ length:(G0 + 1) * (G0 + 1) }, r);
  const ruido = (g, x, y, f) => {
    const gx = x * f, gy = y * f, ix = Math.floor(gx) % G0, iy = Math.floor(gy) % G0, fx = gx - Math.floor(gx), fy = gy - Math.floor(gy);
    const v = (a, b) => g[((b % G0) * (G0 + 1)) + (a % G0)];
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    return (v(ix, iy) * (1 - sx) + v(ix + 1, iy) * sx) * (1 - sy) + (v(ix, iy + 1) * (1 - sx) + v(ix + 1, iy + 1) * sx) * sy;
  };
  const nodos = Object.values(NODOS).filter(n => n.region === region).concat(Object.values(SECRETAS).filter(S => (S.region || 'norte') === region));
  const alto = new Float32Array(W * H), hum = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const nx = x / W, ny = y / H;
    let h = ruido(grid, nx, ny, 3) * 0.55 + ruido(grid, nx, ny, 7) * 0.3 + ruido(grid, nx, ny, 15) * 0.15;
    h -= Math.max(0, 0.13 - Math.min(nx, 1 - nx, ny, 1 - ny)) * 2.6;
    let cerca = 0;
    for (const n of nodos) { const d = Math.hypot(nx - n.x / 100, (ny - n.y / 100) * 1.55); if (d < 0.12) cerca = Math.max(cerca, 1 - d / 0.12); }
    h = h * (1 - cerca * 0.85) + 0.55 * cerca * 0.85 + 0.06;
    alto[y * W + x] = h; hum[y * W + x] = ruido(grid2, nx, ny, 5);
  }
  // Pergamino: el agua es un lavado más oscuro y la tierra papel claro con un toque de color.
  const PAL = region === 'este'
    ? { mar:[112, 138, 148], marClaro:[132, 160, 166], costa:[30, 46, 54], arena:[226, 214, 176], pasto:[206, 210, 172], bosque:[176, 196, 150], monte:[196, 192, 176], nieve:[236, 236, 228] }
    : region === 'sur'
    ? { mar:[116, 70, 52], marClaro:[138, 90, 66], costa:[48, 24, 16], arena:[212, 182, 140], pasto:[204, 172, 132], bosque:[186, 152, 112], monte:[176, 136, 104], nieve:[160, 112, 90] }
    : { mar:[168, 150, 112], marClaro:[184, 166, 126], costa:[66, 46, 28], arena:[228, 212, 168], pasto:[218, 206, 156], bosque:[196, 196, 136], monte:[204, 186, 148], nieve:[238, 230, 204] };
  const tierra = h => h >= 0.42;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = y * W + x, h = alto[k];
    let c;
    if (!tierra(h)) {
      // Agua: más clara cerca de la costa.
      let costa = false;
      for (let d = 4; d <= 14 && !costa; d += 5) { const a = alto[Math.min(H - 1, y + d) * W + x], b = alto[Math.max(0, y - d) * W + x], cc = alto[y * W + Math.min(W - 1, x + d)], dd = alto[y * W + Math.max(0, x - d)]; if (tierra(a) || tierra(b) || tierra(cc) || tierra(dd)) costa = true; }
      c = costa ? PAL.marClaro : PAL.mar;
    } else {
      // Borde de la costa bien marcado.
      const borde = !tierra(alto[k + 1]) || !tierra(alto[k - 1]) || !tierra(alto[k + W]) || !tierra(alto[k - W]) || !tierra(alto[k + 2]) || !tierra(alto[k - 2 * W]);
      if (borde) c = PAL.costa;
      else if (h < 0.455) c = PAL.arena;
      else if (h > 0.74) c = PAL.nieve;
      else if (h > 0.66) c = PAL.monte;
      else c = hum[k] > 0.56 ? PAL.bosque : PAL.pasto;
    }
    const v = ((x * 7 + y * 13) % 5) - 2; // grano muy fino para que no se vea plano
    img.data[k * 4] = c[0] + v; img.data[k * 4 + 1] = c[1] + v; img.data[k * 4 + 2] = c[2] + v; img.data[k * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  // Olas
  ctx.strokeStyle = 'rgba(70,46,26,.45)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (let i = 0; i < 70; i++) {
    const x = r() * W, y = r() * H;
    if (tierra(alto[Math.floor(y) * W + Math.floor(x)])) continue;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 7, y - 4, x + 14, y); ctx.quadraticCurveTo(x + 21, y + 4, x + 28, y); ctx.stroke();
  }
  // Íconos de terreno (lejos de los lugares, para que los nombres se lean bien)
  const libre = (x, y) => nodos.every(n => Math.hypot(x - n.x / 100 * W, y - n.y / 100 * H) > 46);
  const arbol = (x, y, s) => {
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x, y + s * 0.9, s * 0.7, s * 0.25, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#3e2a18'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y + s * 0.9); ctx.lineTo(x, y + s * 0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - s * 0.8); ctx.lineTo(x + s * 0.55, y + s * 0.3); ctx.lineTo(x - s * 0.55, y + s * 0.3); ctx.closePath();
    ctx.fillStyle = region === 'sur' ? 'rgba(120,80,60,.55)' : 'rgba(110,130,70,.55)'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#3e2a18'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - s * 0.15, y - s * 0.3); ctx.lineTo(x - s * 0.35, y + s * 0.2); ctx.lineWidth = 0.8; ctx.stroke();
  };
  const monte = (x, y, s, volcan) => {
    ctx.beginPath(); ctx.moveTo(x - s, y + s * 0.7); ctx.lineTo(x - s * 0.1, y - s * 0.8); ctx.lineTo(x + s, y + s * 0.7); ctx.closePath();
    ctx.fillStyle = volcan ? 'rgba(150,70,50,.35)' : 'rgba(150,130,100,.25)'; ctx.fill(); ctx.lineWidth = 1.8; ctx.strokeStyle = '#3e2a18'; ctx.stroke();
    // Sombreado a rayitas del lado derecho, como en los mapas dibujados a mano
    ctx.save(); ctx.clip(); ctx.lineWidth = 0.9; ctx.strokeStyle = 'rgba(62,42,24,.6)';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x - s * 0.05 + i * s * 0.18, y - s * 0.6 + i * s * 0.2); ctx.lineTo(x + i * s * 0.18 - s * 0.3, y + s * 0.7); ctx.stroke(); }
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(x - s * 0.36, y - s * 0.22); ctx.lineTo(x - s * 0.1, y - s * 0.8); ctx.lineTo(x + s * 0.26, y - s * 0.22); ctx.lineTo(x, y - s * 0.32); ctx.closePath();
    ctx.fillStyle = volcan ? 'rgba(200,60,30,.75)' : 'rgba(255,252,240,.85)'; ctx.fill();
    if (volcan) { ctx.strokeStyle = 'rgba(62,42,24,.6)'; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x - s * 0.1 + i * 3, y - s * 1.1 - i * 5, 3 + i, 0, 7); ctx.stroke(); } }
  };
  for (let gy = 16; gy < H; gy += 30) for (let gx = 16; gx < W; gx += 30) {
    const x = gx + (r() - 0.5) * 14, y = gy + (r() - 0.5) * 14;
    const k = Math.floor(y) * W + Math.floor(x), h = alto[k];
    if (!tierra(h) || !libre(x, y)) continue;
    if (h > 0.66) { if (r() < (h > 0.72 ? 0.55 : 0.3)) monte(x, y, 13 + r() * 6, region === 'sur' && r() < 0.35); }
    else if (hum[k] > 0.56 && h > 0.46) { if (r() < 0.8) arbol(x, y, 9 + r() * 3); }
    else if (region === 'sur' && r() < 0.06) { ctx.strokeStyle = 'rgba(180,50,30,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x - 2, y + 3); ctx.lineTo(x + 6, y - 2); ctx.stroke(); }
  }
  // Niebla al norte (Aldmora) o el Abismo al sur
  const g = ctx.createLinearGradient(0, region === 'sur' ? H : 0, 0, region === 'sur' ? H * 0.62 : H * 0.3);
  g.addColorStop(0, region === 'sur' ? 'rgba(60,10,10,.35)' : 'rgba(120,110,140,.28)'); g.addColorStop(1, 'rgba(120,110,140,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Manchas del papel y bordes quemados
  for (let i = 0; i < 26; i++) { const x = r() * W, y = r() * H, rad = 20 + r() * 70; const m = ctx.createRadialGradient(x, y, 0, x, y, rad); m.addColorStop(0, 'rgba(120,80,40,.10)'); m.addColorStop(1, 'rgba(120,80,40,0)'); ctx.fillStyle = m; ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  const q = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.62);
  q.addColorStop(0, 'rgba(60,30,10,0)'); q.addColorStop(0.8, 'rgba(70,40,15,.35)'); q.addColorStop(1, 'rgba(40,18,6,.85)');
  ctx.fillStyle = q; ctx.fillRect(0, 0, W, H);
  // Marco y rosa de los vientos
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(62,42,24,.8)'; ctx.strokeRect(14, 14, W - 28, H - 28); ctx.strokeRect(20, 20, W - 40, H - 40);
  const rx = W - 60, ry = H - 70;
  ctx.fillStyle = 'rgba(255,248,230,.9)'; ctx.beginPath(); ctx.arc(rx, ry, 30, 0, 7); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#2a2016'; ctx.stroke();
  ctx.fillStyle = '#c83a3a'; ctx.beginPath(); ctx.moveTo(rx, ry - 26); ctx.lineTo(rx + 7, ry); ctx.lineTo(rx - 7, ry); ctx.fill();
  ctx.fillStyle = '#2a2016'; ctx.beginPath(); ctx.moveTo(rx, ry + 26); ctx.lineTo(rx + 7, ry); ctx.lineTo(rx - 7, ry); ctx.fill();
  ctx.font = 'bold 14px Fredoka, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('N', rx, ry - 32);
  imgMundo[region] = cv.toDataURL('image/jpeg', 0.9);
  return imgMundo[region];
}
function regionSig(r) { const l = G.paso >= 28 ? ['norte', 'sur', 'este'] : ['norte', 'sur']; return l[(l.indexOf(r) + 1) % l.length]; }
function nodoVisible(id) { return G.paso >= NODOS[id].desde || (G.flags.fin && !NODOS[id].acto); }
// Los lugares secretos aparecen cuando algún vecino te cuenta de ellos.
function nodosSecretos(region) {
  return Object.entries(SECRETAS).filter(([id, S]) => G.flags['sec_' + id] && (S.region || 'norte') === region).map(([id, S]) => [id, { n:S.n, tipo:'secreto', x:S.x, y:S.y, secreto:id, region:S.region || 'norte' }]);
}
function nodoDe(id) { return NODOS[id] || (SECRETAS[id] && { n:SECRETAS[id].n, tipo:'secreto', x:SECRETAS[id].x, y:SECRETAS[id].y, secreto:id, region:SECRETAS[id].region || 'norte' }); }
function pasoActual() { return HISTORIA[G.paso] || null; }
function batallaGanada(bid) { const i = HISTORIA.findIndex(p => p.b === bid); return i >= 0 && i < G.paso; }

function pantallaMapa(region) {
  if (G.batallas - (G.flags.respaldo ?? 0) >= 25) { G.flags.respaldo = G.batallas; guardar(); setTimeout(() => toast('Hace rato que no guardás un respaldo. Ajustes ⚙️ → 💾 Respaldo de la partida.'), 1200); }
  const paso = pasoActual();
  const sig = paso ? paso.nodo : null;
  region = region || G.region || (sig && NODOS[sig].region) || 'norte';
  if (sig && !region) region = NODOS[sig].region;
  G.region = region;
  Sonido.musica(region === 'este' ? 'mar' : 'mapa');
  const nodos = Object.entries(NODOS).filter(([id, n]) => n.region === region && nodoVisible(id)).concat(nodosSecretos(region));
  const ids = new Set(nodos.map(([id]) => id));
  const caminos = CAMINOS.filter(([a, b]) => ids.has(a) && ids.has(b)).map(([a, b]) => `<line x1="${NODOS[a].x}" y1="${NODOS[a].y}" x2="${NODOS[b].x}" y2="${NODOS[b].y}" />`).join('');
  const sigAca = sig && NODOS[sig].region === region;
  const titulo = REGIONES[region] || 'Aldmora';
  montar(`
    ${cabecera(G.flags.fin && !pasoActual() ? titulo + ' (epílogo)' : titulo + ' — Capítulo ' + capituloActual(), false)}
    <div class="mundo ${region}">
      <img class="mundo-img" src="${pintarMundo(region)}" alt="">
      <svg class="mundo-caminos" viewBox="0 0 100 100" preserveAspectRatio="none">${caminos.replace(/<line/g, '<line class="sombra"')}${caminos}</svg>
      ${nodos.map(([id, n]) => `
        <button class="nodo ${n.tipo} ${n.portal ? 'portal' : ''} ${id === sig ? 'sig' : ''} ${(n.batalla && batallaGanada(n.batalla)) || (n.secreto && G.flags['sec_' + id + '_ok']) ? 'ganado' : ''}" style="left:${n.x}%;top:${n.y}%" data-x="nodo" data-id="${id}">
          <span class="nodo-ic">${n.portal ? '🗺️' : n.tipo === 'pueblo' ? '🏠' : n.secreto ? (G.flags['sec_' + id + '_ok'] ? '⚔️' : '❓') : id === sig ? '❗' : '⚔️'}</span><span class="nodo-n">${esc(n.n)}</span>
        </button>`).join('')}
    </div>
    <div class="mapa-pie">
      ${paso ? `<div class="mision">Siguiente: <b>${esc(BATALLAS[paso.b].n)}</b> en ${esc(NODOS[paso.nodo].n)}${sigAca ? '' : ` <i>(en ${REGIONES[NODOS[paso.nodo].region]})</i>`}</div>` : '<div class="mision">La historia terminó. ¡Seguí entrenando!</div>'}
      <div class="fila">
        <button data-x="grupo">👥 Grupo</button>
        ${paso ? `<button data-x="ir" class="ok">❗ Ir</button>` : ''}
        ${G.paso >= 12 ? `<button data-x="region" class="sec">🗺️ ${REGIONES[regionSig(region)]}</button>` : ''}
        <button data-x="ajustes" class="sec">⚙️</button>
      </div>
    </div>`, {
    nodo: d => tocarNodo(d.id),
    ir: () => { if (!sigAca) pantallaMapa(NODOS[sig].region); else tocarNodo(sig); },
    region: () => pantallaMapa(regionSig(region)),
    grupo: () => pantallaGrupo(() => pantallaMapa(region)),
    ajustes: pantallaAjustes,
  });
}
function tocarNodo(id) {
  const n = nodoDe(id), paso = pasoActual();
  const opciones = [];
  if (n.portal) { Sonido.fx('pagina'); pantallaMapa(n.portal); return; }
  if (n.secreto) {
    const S = SECRETAS[id], hecho = G.flags['sec_' + id + '_ok'];
    const nv = Math.max(...S.batalla.e.map(e => e.nv));
    if (!hecho) opciones.push(`<button data-x="secreta" class="ok">❓ ${esc(S.n)} (enemigos nivel ${nv})</button>`);
    else opciones.push(`<button data-x="patrulla">⚔️ Patrullar (nivel ~${Math.max(nivelPromedio(), nv - 2)})</button>`);
  }
  if (paso && paso.nodo === id) opciones.push(`<button data-x="historia" class="ok">❗ ${esc(BATALLAS[paso.b].n)} (historia)</button>`);
  if (n.tipo === 'pueblo') opciones.push('<button data-x="pueblo">🏠 Entrar al pueblo</button>');
  if (n.batalla && batallaGanada(n.batalla) && n.patrulla) opciones.push(`<button data-x="patrulla">⚔️ Patrullar (nivel ~${nivelPromedio()})</button>`);
  if (!opciones.length) { toast('Todavía no hay nada que hacer acá.'); return; }
  if (opciones.length === 1 && n.tipo === 'pueblo' && !(paso && paso.nodo === id)) { pantallaPueblo(id); return; }
  modal(`<h3>${esc(n.n)}</h3>${opciones.join('')}<button data-x="cerrar" class="sec">Cancelar</button>`, {
    historia: (d, c) => { c(); jugarPaso(G.paso); },
    pueblo: (d, c) => { c(); pantallaPueblo(id); },
    patrulla: (d, c) => { c(); patrullar(id); },
    secreta: (d, c) => { c(); jugarSecreta(id); },
  });
}
// ---------- Respaldo: la partida como un código de texto para guardarla fuera del celular ----------
const b64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); };
const desB64 = txt => Uint8Array.from(atob(txt), c => c.charCodeAt(0));
async function codigoPartida(g) {
  const datos = new TextEncoder().encode(JSON.stringify(g));
  if (window.CompressionStream) {
    try { const comp = await new Response(new Blob([datos]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer(); return 'CB2:' + b64(new Uint8Array(comp)); } catch (e) {}
  }
  return 'CB1:' + b64(datos);
}
async function leerCodigo(txt) {
  txt = (txt || '').replace(/\s+/g, '');
  const m = /^(CB[12]):(.+)$/.exec(txt); if (!m) throw new Error('formato');
  let datos = desB64(m[2]);
  if (m[1] === 'CB2') datos = new Uint8Array(await new Response(new Blob([datos]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
  const g = JSON.parse(new TextDecoder().decode(datos));
  if (!g || !Array.isArray(g.unidades) || typeof g.paso !== 'number') throw new Error('datos');
  return g;
}
async function pantallaRespaldo() {
  guardar();
  const cod = await codigoPartida(G);
  const cerrar = modal(`<h3>Respaldo de la partida</h3>
    <p class="sub">Tu avance vive solo en este celular. Copiá este código y guardalo en Notas o mandatelo por WhatsApp: con él recuperás la partida si se borra, o la pasás a otro teléfono.</p>
    <textarea class="codigo" readonly>${cod}</textarea>
    <button data-x="copiar" class="ok">📋 Copiar código</button>
    ${navigator.share ? '<button data-x="compartir">📤 Compartir</button>' : ''}
    <button data-x="cerrar" class="sec">Cerrar</button>`, {
    copiar: async () => {
      try { await navigator.clipboard.writeText(cod); toast('Código copiado. Pegalo en Notas o en WhatsApp.', 'bien'); }
      catch (e) { const t = document.querySelector('.codigo'); t.select(); document.execCommand('copy'); toast('Código copiado.', 'bien'); }
      G.flags.respaldo = G.batallas; guardar();
    },
    compartir: async () => { try { await navigator.share({ title:'Campanas de Bruma — partida', text:cod }); G.flags.respaldo = G.batallas; guardar(); } catch (e) {} },
  });
  setTimeout(() => document.querySelector('.codigo')?.select(), 50);
  return cerrar;
}
function cargarCodigo(volver = elegirRanura) {
  modal(`<h3>Cargar una partida</h3>
    <p class="sub">Pegá el código de respaldo (empieza con CB1: o CB2:) y elegí en qué lugar guardarla.</p>
    <textarea class="codigo" placeholder="CB2:..."></textarea>
    <div class="fila">${[0, 1, 2].map(i => `<button data-x="en" data-i="${i}">${hayPartida(i) ? '⚠️ ' : ''}Partida ${i + 1}</button>`).join('')}</div>
    <button data-x="cerrar" class="sec">Volver</button>`, {
    en: async (d, c) => {
      const txt = document.querySelector('.codigo').value;
      let g; try { g = await leerCodigo(txt); } catch (e) { toast('Ese código no sirve. Fijate que esté completo.'); Sonido.fx('error'); return; }
      const ok = () => { try { localStorage.setItem(claveSlot(+d.i), JSON.stringify(g)); } catch (e) { toast('No se pudo guardar.'); return; } c(); toast(`Partida cargada en la ${+d.i + 1}.`, 'bien'); Sonido.fx('nivel'); volver(); };
      if (hayPartida(+d.i)) confirmar(`La partida ${+d.i + 1} ya tiene datos. ¿Reemplazarla por la del código?`, ok); else ok();
    },
  });
}

function pantallaAjustes() {
  modal(`<h3>Ajustes</h3>
    <button data-x="musica">${Sonido.musicaOn ? '🔊 Música: sí' : '🔇 Música: no'}</button>
    <button data-x="fx">${Sonido.fxOn ? '🔔 Efectos: sí' : '🔕 Efectos: no'}</button>
    <button data-x="respaldo">💾 Respaldo de la partida</button>
    <button data-x="ayuda">❓ Cómo se juega</button>
    <button data-x="titulo">🏁 Ir al título</button>
    <button data-x="borrar" class="peligro">🗑 Borrar partida</button>
    <button data-x="cerrar" class="ok">Cerrar</button>`, {
    musica: (d, c) => { Sonido.setMusica(!Sonido.musicaOn); c(); pantallaAjustes(); },
    fx: (d, c) => { Sonido.setFx(!Sonido.fxOn); c(); pantallaAjustes(); },
    respaldo: (d, c) => { c(); pantallaRespaldo(); },
    ayuda: (d, c) => { c(); mostrarAyuda(); },
    titulo: (d, c) => { c(); guardar(); pantallaTitulo(); },
    borrar: (d, c) => { c(); confirmar('¿Borrar esta partida para siempre?', () => { borrarSlot(SLOT); pantallaTitulo(); }); },
  });
}

// ---------- Historia ----------
function jugarPaso(i) {
  const paso = HISTORIA[i];
  if (!paso) { pantallaMapa(); return; }
  const def = BATALLAS[paso.b];
  const seguir = () => {
    (paso.une_antes || []).forEach(k => { const u = unirPersonaje(k); if (u) toast(`${u.nombre} se unió al grupo`, 'bien'); });
    guardar();
    preparar(def, { historia:true, alVolver:pantallaMapa }, ids => batallar(def, ids, res => {
      if (!res.gano) { pantallaDerrota(def, ids, () => jugarPaso(i)); return; }
      const premios = aplicarPremios(def, res);
      pantallaResultados(premios, () => {
        dialogo(paso.despues, () => {
          (paso.une || []).forEach(k => { const u = unirPersonaje(k); if (u) toast(`${u.nombre} se unió al grupo`, 'bien'); });
          if (paso.mascota && !G.mascotas.some(m => m.id === paso.mascota)) {
            const m = nuevaMascota(paso.mascota);
            const lior = G.unidades.find(u => u.unico === 'lior');
            if (lior && !lior.mascota) lior.mascota = m.uid;
            toast(`Nueva mascota: ${MASCOTAS[paso.mascota].n}`, 'bien'); Sonido.fx('mascota');
          }
          if (paso.aprende) { const u = G.unidades.find(v => v.unico === paso.aprende.quien); if (u && !u.apr.includes(paso.aprende.hab)) u.apr.push(paso.aprende.hab); }
          G.paso = Math.max(G.paso, i + 1);
          if (i + 1 >= HISTORIA.length) G.flags.fin = true;
          guardar();
          const prox = HISTORIA[i + 1];
          if (prox && prox.seguida) jugarPaso(i + 1); else pantallaMapa();
        });
      });
    }, paso.antes));
  };
  const conTitulo = cb => paso.cap ? tarjetaCapitulo(paso.cap, cb) : cb();
  conTitulo(seguir);
}
function jugarSecreta(id) {
  const S = SECRETAS[id], def = S.batalla;
  preparar(def, { alVolver:pantallaMapa }, ids => batallar(def, ids, res => {
    if (!res.gano) { pantallaDerrota(def, ids, () => jugarSecreta(id)); return; }
    G.flags['sec_' + id + '_ok'] = true;
    const p = aplicarPremios(Object.assign({}, def, { premio:S.premio }), res);
    pantallaResultados(p, () => dialogo([[null, `Misión secreta cumplida: «${S.n}». Volvé a hablar con quien te la dio.`]], pantallaMapa));
  }));
}
function patrullar(id) {
  const n = NODOS[id] || { n:SECRETAS[id].n, patrulla:SECRETAS[id].patrulla, base:SECRETAS[id].batalla };
  const base = n.base || BATALLAS[n.batalla];
  const nv = n.base ? Math.max(nivelPromedio(), Math.max(...base.e.map(e => e.nv)) - 2) : nivelPromedio();
  const pos = base.e.map(e => [e.x, e.y]).sort(() => Math.random() - 0.5);
  const cant = clamp(3 + Math.floor(Math.random() * 3), 3, pos.length);
  const e = pos.slice(0, cant).map(([x, y]) => { const [c, t] = elegir(n.patrulla).split(':'); return { c, t, nv:Math.max(1, nv + Math.floor(Math.random() * 3) - 1), x, y }; });
  const def = { n:'Patrulla: ' + n.n, mapa:base.mapa, musica:'batalla', aliados:base.aliados, e, oro:60 + nv * 20, patrulla:true, objetivo:'Derrotá a todos los enemigos' };
  preparar(def, { alVolver:pantallaMapa }, ids => batallar(def, ids, res => {
    if (!res.gano) { pantallaDerrota(def, ids, () => patrullar(id)); return; }
    pantallaResultados(aplicarPremios(def, res), pantallaMapa);
  }));
}
function batallar(def, ids, alTerminar, escena) {
  Batalla.iniciar({ def, ids, escena, onFin: res => { guardar(); alTerminar(res); } });
}
function aplicarPremios(def, res) {
  const g = res.ganado;
  const p = { oro:(def.oro || 0) + g.oro, mat:Object.assign({}, g.mat), obj:Object.assign({}, g.obj), gemas:Object.assign({}, g.gemas), mascotas:[], extra:[], equipo:[] };
  const pr = def.premio || {};
  p.oro += pr.oro || 0;
  for (const [k, v] of Object.entries(pr.mat || {})) p.mat[k] = (p.mat[k] || 0) + v;
  for (const [k, v] of Object.entries(pr.gemas || {})) p.gemas[k] = (p.gemas[k] || 0) + v;
  (g.equipo || []).concat(pr.equipo || []).forEach(e => p.equipo.push(nuevoItem(e.id, 0, e.rareza || 0)));
  if (pr.mascota) { const m = nuevaMascota(pr.mascota); const libre = G.unidades.find(u => !u.mascota); if (libre) libre.mascota = m.uid; p.extra.push(`Nueva mascota: ${MASCOTAS[pr.mascota].n}`); }
  for (const [k, v] of Object.entries(def.mat || {})) p.mat[k] = (p.mat[k] || 0) + v;
  if (def.gema) p.gemas[def.gema + '1'] = (p.gemas[def.gema + '1'] || 0) + 1;
  G.oro += p.oro;
  for (const [k, v] of Object.entries(p.mat)) G.mat[k] = (G.mat[k] || 0) + v;
  for (const [k, v] of Object.entries(p.obj)) G.obj[k] = (G.obj[k] || 0) + v;
  for (const [k, v] of Object.entries(p.gemas)) sumarGema(k, v);
  // Mascotas de los que pelearon
  res.participantes.forEach(pt => {
    const u = G.unidades.find(v => v.id === pt.id);
    if (!u) return;
    if (!pt.ko) darExp(u, 0, 10);
    const m = u.mascota ? mascota(u.mascota) : null;
    if (m && m.nivel < 10) {
      m.exp += 35;
      if (m.exp >= 100) { m.exp -= 100; m.nivel++; p.mascotas.push(`${m.nombre} subió a nivel ${m.nivel}`); }
    }
  });
  G.batallas++;
  guardar();
  return p;
}
function pantallaResultados(p, seguir) {
  const lineas = [];
  lineas.push(`<div class="res-fila">💰 <b>+${p.oro}</b> oro</div>`);
  for (const [k, v] of Object.entries(p.mat)) lineas.push(`<div class="res-fila">${ICO.html(k, 20)} ${esc(MAT[k].n)} x${v}</div>`);
  for (const [k, v] of Object.entries(p.obj)) lineas.push(`<div class="res-fila">${ICON_OBJ[k] || '🎁'} ${esc(OBJ[k].n)} x${v}</div>`);
  for (const [k, v] of Object.entries(p.gemas)) lineas.push(`<div class="res-fila">${gemaHTML(k)} ${esc(nombreGema(k))} x${v}</div>`);
  (p.equipo || []).forEach(it => lineas.push(`<div class="res-fila">${iconoItem(it.id).replace('34px', '22px').replace('34px', '22px')} ${nombreItemHTML(it)} <small>(${RAREZAS[it.rareza || 0].n})</small></div>`));
  (p.extra || []).forEach(t => lineas.push(`<div class="res-fila">🐾 ${esc(t)}</div>`));
  p.mascotas.forEach(t => lineas.push(`<div class="res-fila">🐾 ${esc(t)}</div>`));
  montar(`<div class="resultados"><h1 class="brilla">¡Victoria!</h1>
    <div class="ventana">${lineas.join('')}</div>
    <div class="res-grupo">${G.unidades.slice(0, 8).map(u => `<div class="res-u">${spriteHTML(visDe(u), 40)}<span>${esc(u.nombre)}</span><small>Nv ${u.nivel} · ${u.exp}%</small></div>`).join('')}</div>
    <button data-x="seguir" class="ok grande">Continuar</button></div>`, { seguir });
}
function pantallaDerrota(def, ids, reintentar) {
  montar(`<div class="resultados derrota"><h1>Derrota...</h1>
    <p>La experiencia y los PC que ganaron se conservan. Podés reintentar, o entrenar y equiparte mejor.</p>
    <button data-x="reintentar" class="ok grande">Reintentar</button>
    <button data-x="mapa" class="grande">Volver al mapa</button></div>`, { reintentar, mapa:pantallaMapa });
}

// ---------- Diálogos ----------
function tarjetaCapitulo(txt, cb) {
  Sonido.fx('sonido');
  let hecho = false;
  const una = () => { if (!hecho) { hecho = true; cb(); } };
  montar(`<div class="capitulo" data-x="seguir"><div class="cap-txt">${esc(txt)}</div></div>`, { seguir:una });
  setTimeout(una, 3200);
}
// Gesto del retrato según quién habla y cómo.
function gestoDe(quien, txt) {
  const malos = ['gris', 'vesk', 'saal', 'corvin', 'voz', 'soldado'];
  if (/\.\.\.$|olvid|perd|llor|lástima/i.test(txt)) return 'triste';
  if (/¡/.test(txt)) return typeof quien === 'string' && malos.includes(quien) ? 'enojo' : 'sorpresa';
  if (/gracias|jaja|lindo|me encanta|bien!/i.test(txt)) return 'feliz';
  if (typeof quien === 'string' && malos.includes(quien)) return 'enojo';
  return '';
}
function dialogo(lineas, cb, opts = {}) {
  if (!lineas || !lineas.length) { cb(); return; }
  let i = 0, escribiendo = null, terminado = false;
  const fin = () => { if (terminado) return; terminado = true; clearInterval(escribiendo); clearInterval(caja._anim); document.querySelector('.dialogo')?.remove(); cb(); };
  const caja = document.createElement('div');
  caja.className = 'dialogo' + (opts.escena ? ' en-escena' : '');
  caja.innerHTML = `<div class="dlg-fondo"></div><div class="dlg-caja"><div class="dlg-retrato"></div><div class="dlg-cuerpo"><div class="dlg-nombre"></div><div class="dlg-texto"></div></div><div class="dlg-sig">▼</div></div><button class="dlg-saltar mini">Saltar ⏭</button>`;
  document.body.appendChild(caja);
  const mostrar = () => {
    const [quien, txt] = lineas[i];
    const pj = !quien ? null : typeof quien === 'string' ? PJ[quien] : quien;
    const enGrupo = typeof quien === 'string' && G && G.unidades ? G.unidades.find(u => u.unico === quien) : null;
    const vis = pj ? (pj.vis || (enGrupo ? visDe(enGrupo) : { clase:pj.clase, look:pj.look, t:pj.t, unico: typeof quien === 'string' ? quien : null })) : null;
    caja.querySelector('.dlg-nombre').textContent = pj ? pj.n : '';
    // Retrato que habla, parpadea y pone cara según lo que dice.
    const base = lineas[i][2] || gestoDe(quien, txt);
    caja.querySelector('.dlg-retrato').innerHTML = pj ? `<img alt="">` : '';
    const img = caja.querySelector('.dlg-retrato img');
    clearInterval(caja._anim);
    if (img) {
      const url = e => SPR.retrato(vis, e).toDataURL();
      const cache = {}; const de = e => cache[e] || (cache[e] = url(e));
      img.src = de(base);
      let k = 0;
      caja._anim = setInterval(() => {
        k++;
        if (escribiendo) img.src = de(k % 2 ? 'habla' : base);
        else img.src = de(k % 28 === 0 ? 'parpadeo' : base);
      }, 120);
    }
    caja.classList.toggle('narracion', !pj);
    const el = caja.querySelector('.dlg-texto');
    el.textContent = '';
    let n = 0;
    clearInterval(escribiendo);
    escribiendo = setInterval(() => {
      n += 2; el.textContent = txt.slice(0, n);
      if (n % 6 === 0) Sonido.fx('pagina');
      if (n >= txt.length) { clearInterval(escribiendo); escribiendo = null; }
    }, 28);
  };
  caja.addEventListener('click', e => {
    Sonido.iniciar();
    if (e.target.closest('.dlg-saltar')) { if (opts.escena) window._saltarEscena = true; fin(); return; }
    if (escribiendo) { clearInterval(escribiendo); escribiendo = null; caja.querySelector('.dlg-texto').textContent = lineas[i][1]; return; }
    i++;
    if (i >= lineas.length) fin(); else mostrar();
  });
  mostrar();
}

// ---------- Preparación ----------
function preparar(def, opts, empezar) {
  const max = Math.min(5, def.aliados.length);
  const sel = new Set();
  const lior = G.unidades.find(u => u.unico === 'lior');
  G.unidades.slice().sort((a, b) => (b.unico === 'lior') - (a.unico === 'lior') || b.nivel - a.nivel).slice(0, max).forEach(u => sel.add(u.id));
  const nvE = Math.round(def.e.reduce((s, e) => s + e.nv, 0) / def.e.length);
  const pintar = () => {
    montar(`${cabecera('Preparar batalla')}
      <div class="prep-info"><b>${esc(def.n)}</b><br><span class="sub">Enemigos: ${def.e.length} · nivel ~${nvE} · ${esc(def.objetivo || '')}</span></div>
      <p class="sub centro">Elegí hasta ${max} personajes ${opts.historia ? '(Lior tiene que ir)' : ''}</p>
      <div class="lista-u">${G.unidades.map(u => {
        const s = calcStats(u), on = sel.has(u.id);
        return `<button class="u-fila ${on ? 'on' : ''}" data-x="tog" data-id="${u.id}">${spriteHTML(visDe(u), 44)}
          <div class="u-dat"><b>${esc(u.nombre)}</b><span>${nombreClase(u)} · Nv ${u.nivel}</span><small>PV ${s.hpMax} · PM ${s.mpMax}${u.mascota ? ' · 🐾' : ''}</small></div>
          <span class="check">${on ? '✔' : ''}</span></button>`;
      }).join('')}</div>
      <div class="pie-fijo"><button data-x="grupo" class="sec">👥 Equipar</button><button data-x="ir" class="ok" ${sel.size ? '' : 'disabled'}>⚔️ ¡A pelear! (${sel.size}/${max})</button></div>`, {
      volver: opts.alVolver || pantallaMapa,
      tog: d => {
        if (sel.has(d.id)) { if (opts.historia && lior && d.id === lior.id) { toast('Lior tiene que ir'); return; } sel.delete(d.id); }
        else { if (sel.size >= max) { toast(`Máximo ${max}`); return; } sel.add(d.id); }
        pintar();
      },
      grupo: () => pantallaGrupo(pintar),
      ir: () => empezar([...sel]),
    });
  };
  pintar();
}

// ---------- Pueblo ----------
function pantallaPueblo(id) { Pueblo.entrar(id); }
function escenaPueblo(id) {
  // Una tira de casitas con el grupo paseando.
  const casas = { brezal:['#b04a3a', '#c86a3a', '#8a5a3a'], garza:['#3a6a9a', '#e0d0b0', '#3a8a8a'], ciudadela:['#7a7a8a', '#e6c45a', '#5a4a8a'] }[id] || ['#b04a3a', '#c86a3a', '#8a5a3a'];
  return `<div class="tira">${casas.map((c, i) => `<div class="casa" style="--techo:${c};--d:${i}"></div>`).join('')}
    <div class="paseo">${G.unidades.slice(0, 4).map((u, i) => `<span style="--i:${i}">${spriteHTML(visDe(u), 40)}</span>`).join('')}</div></div>`;
}

// ---------- Tienda ----------
function ofertasTienda(id) {
  G.ofertas = G.ofertas || {};
  const o = G.ofertas[id];
  if (o && o.clave === G.batallas) return o.lista;
  const tier = tierActual();
  const lista = [0, 1, 2].map(() => {
    const eid = equipoAzar(tier), rz = Math.random() < 0.12 && tier >= 3 ? 3 : Math.random() < 0.35 ? 2 : 1;
    return { id:eid, rareza:rz, precio:Math.round(EQ[eid].precio * (1 + RAREZAS[rz].m * 3)), vendido:false };
  });
  G.ofertas[id] = { clave:G.batallas, lista };
  return lista;
}
function puedeEquiparClaseAlguna(u, id) {
  const d = EQ[id];
  if (d.slot === 'acc') return false;
  return clasesJugables().some(c => claseDesbloqueada(u, c) && (d.slot === 'arma' ? CLASES[c].armas.includes(d.tipo) : CLASES[c].armad.includes(d.tipo)));
}

// ---------- Herrería ----------
function pantallaHerreria(id, tab = 'mejorar', sel = null, volver = () => pantallaPueblo(id)) {
  const matHTML = `<div class="mats">${Object.entries(MAT).map(([k, m]) => `<span>${ICO.html(k, 18)} ${esc(m.n)}: <b>${G.mat[k] || 0}</b></span>`).join('')}</div>`;
  let cuerpo = '';
  const conDueño = it => { const d = dueñoDe(it.uid); return d ? ` · lo usa ${esc(d.nombre)}` : ''; };
  if (tab === 'mejorar') {
    const lista = G.equipo.filter(i => EQ[i.id].slot !== 'acc').sort((a, b) => (EQ[b.id].tier - EQ[a.id].tier));
    cuerpo = lista.map(it => {
      if (it.mejora >= 5) return `<div class="art"><span class="art-ic">${iconoItem(it.id)}</span><div class="art-dat"><b>${nombreItemHTML(it)}</b><small>Mejorado al máximo${conDueño(it)}</small></div></div>`;
      const c = costoMejora(it), ok = G.oro >= c.oro && alcanza(c.mat);
      return `<div class="art"><span class="art-ic">${iconoItem(it.id)}</span><div class="art-dat"><b>${nombreItemHTML(it)}</b><small>${statsInst(it)}${conDueño(it)}</small><small>→ +${it.mejora + 1}: ${c.oro} oro, ${Object.entries(c.mat).map(([k, v]) => `${v} ${MAT[k].n}`).join(', ')}</small></div>
        <button data-x="mejorar" data-id="${it.uid}" ${ok ? '' : 'disabled'}>⚒️</button></div>`;
    }).join('') || '<p class="sub centro">No tenés equipo para mejorar.</p>';
  } else if (tab === 'gemas') {
    if (!sel) {
      const lista = G.equipo.filter(i => i.gemas.length);
      cuerpo = '<p class="sub centro">Elegí qué pieza querés engarzar (50 oro por gema; sacarlas es gratis).</p>' + (lista.map(it => `<button class="art boton-art" data-x="selItem" data-id="${it.uid}"><span class="art-ic">${iconoItem(it.id)}</span><div class="art-dat"><b>${nombreItemHTML(it)}</b><small>${it.gemas.map(gemaHTML).join(' ')}${conDueño(it)}</small></div></button>`).join('') || '<p class="sub centro">Ninguna pieza tiene engarces. Las de la tienda a partir de "larga" o "de seda" ya tienen.</p>');
    } else {
      const it = item(sel);
      const misGemas = Object.entries(G.gemas).filter(([, v]) => v > 0);
      cuerpo = `<div class="ventana"><b>${nombreItemHTML(it)}</b><div class="engarces">${it.gemas.map((g, i) => `<button class="engarce" data-x="hueco" data-i="${i}">${gemaHTML(g)}<small>${g ? esc(nombreGema(g)) : 'vacío'}</small></button>`).join('')}</div>
        <p class="sub">Tocá un engarce para sacar la gema. Para poner una, tocá una gema de abajo.</p></div>
        <div class="sep">Tus gemas</div>
        ${misGemas.map(([k, v]) => { const g = gemaInfo(k); return `<button class="art boton-art" data-x="poner" data-g="${k}"><span class="art-ic">${gemaHTML(k)}</span><div class="art-dat"><b>${esc(nombreGema(k))} x${v}</b><small>${esc(g.def.d)}</small></div></button>`; }).join('') || '<p class="sub centro">No tenés gemas. Se consiguen en batallas y en la joyería.</p>'}
        <button data-x="volverItems" class="sec">← Otra pieza</button>`;
    }
  } else if (tab === 'fundir') {
    const lista = Object.entries(G.gemas).filter(([k, v]) => v >= 3 && gemaInfo(k).nv < 3);
    cuerpo = '<p class="sub centro">3 gemas iguales se funden en 1 de nivel siguiente. Más nivel, más efecto.</p>' + (lista.map(([k, v]) => {
      const g = gemaInfo(k), costo = 150 * g.nv;
      return `<div class="art"><span class="art-ic">${gemaHTML(k)}</span><div class="art-dat"><b>${esc(nombreGema(k))} x${v}</b><small>→ ${esc(nombreGema(g.id + (g.nv + 1)))} · ${costo} oro</small></div><button data-x="fundir" data-g="${k}" ${G.oro >= costo ? '' : 'disabled'}>🔥</button></div>`;
    }).join('') || '<p class="sub centro">Necesitás 3 gemas iguales del mismo nivel.</p>');
  } else {
    cuerpo = FORJA.map(r => {
      const d = EQ[r.id], ok = G.oro >= r.oro && alcanza(r.mat);
      return `<div class="art"><span class="art-ic">${iconoItem(r.id)}</span><div class="art-dat"><b>${esc(d.n)}</b><small>${statsItem(r.id)}</small><small>${r.oro} oro, ${Object.entries(r.mat).map(([k, v]) => `${v} ${MAT[k].n} (${G.mat[k] || 0})`).join(', ')}</small></div><button data-x="forjar" data-id="${r.id}" ${ok ? '' : 'disabled'}>🔨</button></div>`;
    }).join('');
  }
  montar(`${cabecera('Herrería')}${matHTML}
    <div class="tabs"><button data-x="tab" data-t="mejorar" class="${tab === 'mejorar' ? 'on' : ''}">Mejorar</button><button data-x="tab" data-t="gemas" class="${tab === 'gemas' ? 'on' : ''}">Gemas</button><button data-x="tab" data-t="fundir" class="${tab === 'fundir' ? 'on' : ''}">Fundir</button><button data-x="tab" data-t="forjar" class="${tab === 'forjar' ? 'on' : ''}">Forjar</button></div>
    <div class="lista">${cuerpo}</div>`, {
    volver,
    tab: d => pantallaHerreria(id, d.t, null, volver),
    mejorar: d => {
      const it = item(d.id), c = costoMejora(it);
      if (G.oro < c.oro || !alcanza(c.mat)) return;
      G.oro -= c.oro; for (const [k, v] of Object.entries(c.mat)) G.mat[k] -= v;
      it.mejora++; Sonido.fx('forja'); chispazo(); toast(`${EQ[it.id].n} +${it.mejora}`, 'bien'); guardar(); pantallaHerreria(id, tab, null, volver);
    },
    selItem: d => pantallaHerreria(id, 'gemas', d.id, volver),
    volverItems: () => pantallaHerreria(id, 'gemas', null, volver),
    hueco: d => { const it = item(sel); const g = it.gemas[+d.i]; if (!g) return; sumarGema(g); it.gemas[+d.i] = null; guardar(); pantallaHerreria(id, 'gemas', sel, volver); },
    poner: d => {
      const it = item(sel); const i = it.gemas.indexOf(null);
      if (i < 0) { toast('No hay engarces libres. Sacá una gema primero.'); return; }
      if (G.oro < 50) { toast('Necesitás 50 de oro'); return; }
      G.oro -= 50; sumarGema(d.g, -1); it.gemas[i] = d.g; Sonido.fx('forja'); chispazo(); guardar(); pantallaHerreria(id, 'gemas', sel, volver);
    },
    fundir: d => { const g = gemaInfo(d.g), costo = 150 * g.nv; if (G.oro < costo) return; G.oro -= costo; sumarGema(d.g, -3); sumarGema(g.id + (g.nv + 1)); Sonido.fx('forja'); chispazo(); toast(`¡${nombreGema(g.id + (g.nv + 1))}!`, 'bien'); guardar(); pantallaHerreria(id, tab, null, volver); },
    forjar: d => {
      const r = FORJA.find(f => f.id === d.id); if (G.oro < r.oro || !alcanza(r.mat)) return;
      G.oro -= r.oro; for (const [k, v] of Object.entries(r.mat)) G.mat[k] -= v;
      nuevoItem(r.id, 0, 3); Sonido.fx('forja'); setTimeout(() => Sonido.fx('nivel'), 300); chispazo(); toast(`¡Forjaste ${EQ[r.id].n} (legendario)!`, 'bien'); guardar(); pantallaHerreria(id, tab, null, volver);
    },
  });
}
function chispazo() {
  const d = document.createElement('div'); d.className = 'chispazo';
  for (let i = 0; i < 14; i++) { const s = document.createElement('i'); s.style.setProperty('--a', (i * 26) + 'deg'); s.style.setProperty('--d', (40 + Math.random() * 60) + 'px'); d.appendChild(s); }
  document.body.appendChild(d); setTimeout(() => d.remove(), 700);
}

// ---------- Joyería ----------
function pantallaJoyeria(id, volver = () => pantallaPueblo(id)) {
  const venta = Object.entries(GEMAS);
  const precio = k => GEMAS[k].efecto ? 450 : 250;
  montar(`${cabecera('Joyería')}<p class="sub centro">Gemas de nivel I. Se engarzan en la herrería.</p>
    <div class="lista">${venta.map(([k, g]) => `<div class="art"><span class="art-ic">${gemaHTML(k + '1')}</span><div class="art-dat"><b>${esc(g.n)} I</b><small>${esc(g.d)}</small><small>Tenés: ${G.gemas[k + '1'] || 0}</small></div><button data-x="comprar" data-id="${k}" ${G.oro < precio(k) ? 'disabled' : ''}>${precio(k)} 💰</button></div>`).join('')}</div>`, {
    volver,
    comprar: d => { const p = precio(d.id); if (G.oro < p) return; G.oro -= p; sumarGema(d.id + '1'); Sonido.fx('compra'); guardar(); pantallaJoyeria(id, volver); },
  });
}

// ---------- Criadero de mascotas ----------
function pantallaCriadero(id, volver = () => pantallaPueblo(id)) {
  const venta = Object.entries(MASCOTAS).filter(([, m]) => m.precio);
  montar(`${cabecera('Criadero de mascotas')}<p class="sub centro">Cada mascota acompaña a un personaje. Asignalas desde Grupo.</p>
    <div class="lista">${venta.map(([k, m]) => `<div class="art"><span class="art-ic">${spriteHTML({ mascota:k }, 44)}</span><div class="art-dat"><b>${esc(m.n)}</b><small>${esc(m.d)}</small><small>Tenés: ${G.mascotas.filter(x => x.id === k).length}</small></div><button data-x="comprar" data-id="${k}" ${G.oro < m.precio ? 'disabled' : ''}>${m.precio} 💰</button></div>`).join('')}</div>`, {
    volver,
    comprar: d => {
      const m = MASCOTAS[d.id]; if (G.oro < m.precio) return;
      G.oro -= m.precio; const nm = nuevaMascota(d.id); Sonido.fx('mascota');
      const libre = G.unidades.find(u => !u.mascota);
      if (libre) { libre.mascota = nm.uid; toast(`${nm.nombre} ahora acompaña a ${libre.nombre}`, 'bien'); } else toast(`¡${m.n}!`, 'bien');
      guardar(); pantallaCriadero(id, volver);
    },
  });
}

// ---------- Taberna ----------
function candidatosTaberna() {
  if (!G.taberna || G.taberna.clave !== G.batallas) {
    const nv = Math.max(1, nivelPromedio() - 1);
    G.taberna = { clave:G.batallas, lista:[0, 1, 2].map(() => ({ nombre:elegir(NOMBRES), clase:elegir(['recluta', 'novicio']), nivel:nv, look:{ pelo:elegir(PELOS), piel:elegir(PIELES), estilo:Math.floor(Math.random() * 3), semilla:uid() }, fac:facAzar() })) };
  }
  return G.taberna.lista;
}
function pantallaTaberna(id, volver = () => pantallaPueblo(id)) {
  const lista = candidatosTaberna();
  montar(`${cabecera('Taberna')}
    <div class="ventana rumor">🍺 <i>"${esc(elegir(RUMORES))}"</i></div>
    <div class="sep">Gente buscando trabajo</div>
    <div class="lista">${lista.map((c, i) => {
      const costo = costoReclutar(c.nivel);
      return `<div class="art"><span class="art-ic">${spriteHTML({ clase:c.clase, look:c.look }, 44)}</span><div class="art-dat"><b>${esc(c.nombre)}</b><small>${CLASES[c.clase].n} · Nv ${c.nivel}</small></div><button data-x="reclutar" data-i="${i}" ${G.oro < costo || G.unidades.length >= 12 ? 'disabled' : ''}>${costo} 💰</button></div>`;
    }).join('') || '<p class="sub centro">Por hoy no hay nadie. Volvé después de otra batalla.</p>'}</div>
    <p class="sub centro">Grupo: ${G.unidades.length}/12</p>`, {
    volver,
    reclutar: d => {
      const c = lista[+d.i], costo = costoReclutar(c.nivel);
      if (G.oro < costo) return;
      G.oro -= costo;
      const u = crearUnidad(c);
      const eqIni = c.clase === 'recluta' ? ['espada_corta', 'chaleco_cuero'] : ['vara_roble', 'tunica'];
      eqIni.forEach(k => { const it = nuevoItem(k); u.eq[EQ[k].slot] = it.uid; });
      if (c.clase === 'novicio') u.apr.push('chispa'); else u.apr.push('golpe_fuerte');
      G.unidades.push(u);
      lista.splice(+d.i, 1);
      Sonido.fx('nivel'); toast(`${u.nombre} se unió al grupo`, 'bien'); guardar(); pantallaTaberna(id, volver);
    },
  });
}

// ---------- Grupo ----------
function elegirDueñoMascota(mid, volver) {
  const m = mascota(mid);
  modal(`<h3>¿Quién lleva a ${esc(m.nombre)}?</h3>
    ${G.unidades.map(u => `<button data-x="asignar" data-id="${u.id}">${esc(u.nombre)}${u.mascota ? ' (tiene ' + esc(mascota(u.mascota)?.nombre || '') + ')' : ''}</button>`).join('')}
    <button data-x="nadie" class="sec">Nadie</button>
    <button data-x="renombrar" class="sec">✏️ Cambiar nombre</button>
    <button data-x="cerrar">Cancelar</button>`, {
    asignar: (d, c) => {
      G.unidades.forEach(u => { if (u.mascota === mid) u.mascota = null; });
      const u = G.unidades.find(v => v.id === d.id); u.mascota = mid;
      Sonido.fx('mascota'); guardar(); c(); volver();
    },
    nadie: (d, c) => { G.unidades.forEach(u => { if (u.mascota === mid) u.mascota = null; }); guardar(); c(); volver(); },
    renombrar: (d, c) => { const n = prompt('Nombre de la mascota', m.nombre); if (n && n.trim()) { m.nombre = n.trim().slice(0, 14); guardar(); } c(); volver(); },
  });
}

// ---------- Ficha del personaje ----------
function valorItem(it) {
  const d = EQ[it.id];
  return ((d.poder || 0) * 2 + (d.def || 0) + (d.res || 0)) * (1 + RAREZAS[it.rareza || 0].m) + Object.values(it.bonos || {}).reduce((a, b) => a + b, 0) * 0.6 + (d.mag || 0) * 1.5 + (d.atk || 0) * 2 + it.mejora * 2 + it.gemas.filter(Boolean).length * 3 + (d.mov || 0) * 6 + (d.spd || 0) * 5;
}
// Pone el mejor equipo libre que la clase pueda usar (soloVacios: solo llena huecos).
function equiparOptimo(u, soloVacios = false) {
  ['arma', 'armadura', 'acc'].forEach(slot => {
    if (soloVacios && u.eq[slot]) return;
    const actual = item(u.eq[slot]);
    const libres = G.equipo.filter(it => EQ[it.id].slot === slot && puedeEquipar(u, it.id) && !dueñoDe(it.uid));
    const mejor = libres.sort((a, b) => valorItem(b) - valorItem(a))[0];
    if (mejor && (!actual || valorItem(mejor) > valorItem(actual))) u.eq[slot] = mejor.uid;
  });
}
