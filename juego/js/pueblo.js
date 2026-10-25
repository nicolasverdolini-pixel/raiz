// Campanas de Bruma — pueblos para recorrer: joystick invisible, tiendas con puerta y vecinos con charla y misiones.
'use strict';

const Pueblo = (() => {
  let P = null, cv = null, ctx = null, raf = 0, dpr = 1, TS = 56, W = 0, H = 0;
  const ultimaPuerta = {};
  const SOLIDO = new Set(['t', 'r', 'm', 'w']);
  const VEL = 3.3, VEL_PNJ = 1.3, RADIO = 0.3;
  const imgs = {};

  // ---------- Entrar / salir ----------
  function entrar(id, opts = {}) {
    const def = PUEBLOS[id];
    if (!def) { pantallaMapa(); return; }
    const lider = G.unidades.find(u => u.unico === 'lior') || G.unidades[0];
    let ini = def.entrada.slice();
    const pu = opts.puerta || ultimaPuerta[id];
    if (pu) ini = [pu[0], pu[1] + 1];
    P = { id, def, t0:performance.now(), ultimo:performance.now(),
      yo:{ x:ini[0] + 0.5, y:ini[1] + 0.5, dir:pu ? 0 : 2, mov:false, ruta:null, vis:visDe(lider) },
      pnj:def.vecinos.map(v => ({ ...v, x:v.x + 0.5, y:v.y + 0.5, cx:v.x, cy:v.y, dir:0, mov:false, espera:Math.random() * 3, objetivo:null })),
      cam:{ x:ini[0] + 0.5, y:ini[1] + 0.5 }, joy:null, enPuerta:!!pu, pasos:0, edCache:{}, bloqueado:false };
    // Sacamos de la lista a los vecinos que todavía no conocen al grupo (no hay ninguno por ahora) y validamos posiciones.
    P.pnj.forEach(v => { if (esSolido(v.cx, v.cy)) console.warn('Vecino en lugar sólido', id, v.id); });
    montarDOM();
    Sonido.musica('pueblo');
    precargar().then(() => { if (P) { P.edCache = {}; } });
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(cuadro);
  }
  function salir() {
    cancelAnimationFrame(raf); raf = 0;
    window.removeEventListener('resize', medir);
    P = null; cv = null;
  }
  function precargar() {
    const nombres = new Set(['alerta', 'hablar']);
    Object.values(PUEBLOS).forEach(p => p.edificios.forEach(e => e.cartel && nombres.add(e.cartel)));
    return Promise.all([...nombres].map(n => new Promise(res => {
      if (imgs[n]) return res();
      const im = new Image(); im.onload = () => { imgs[n] = im; res(); }; im.onerror = res; im.src = ICO.url(n);
    })));
  }

  function montarDOM() {
    const paso = HISTORIA[G.paso];
    app().innerHTML = `
      <div id="pb">
        <header class="cab pb-cab"><button class="mini" id="pb-mapa">🗺️</button><h2>${esc(NODOS[P.id].n)}</h2><span class="oro">💰 ${G.oro}</span></header>
        <div id="pb-acciones">
          <button class="mini" id="pb-grupo">👥 Grupo</button>
          ${paso && paso.nodo === P.id ? '<button class="mini ok" id="pb-historia">❗ Historia</button>' : ''}
        </div>
        <canvas id="pb-cv"></canvas>
        <button id="pb-a" class="boton-a oculto"></button>
        <div id="pb-ayuda">Arrastrá el dedo para caminar · tocá a alguien para hablar</div>
      </div>`;
    ICO.iconizar(app());
    cv = document.getElementById('pb-cv'); ctx = cv.getContext('2d');
    medir();
    window.addEventListener('resize', medir);
    document.getElementById('pb-mapa').onclick = () => { Sonido.fx('atras'); salir(); pantallaMapa(); };
    document.getElementById('pb-grupo').onclick = () => { Sonido.fx('sel'); const id = P.id, pu = [Math.floor(P.yo.x), Math.floor(P.yo.y) - 1]; salir(); pantallaGrupo(() => entrar(id, { puerta:pu })); };
    const h = document.getElementById('pb-historia');
    if (h) h.onclick = () => { Sonido.fx('sel'); salir(); jugarPaso(G.paso); };
    document.getElementById('pb-a').onclick = () => { if (P && P.cerca) { Sonido.fx('sel'); interactuar(P.cerca); } };
    cv.addEventListener('pointerdown', abajo);
    cv.addEventListener('pointermove', mover);
    cv.addEventListener('pointerup', arriba);
    cv.addEventListener('pointercancel', arriba);
    setTimeout(() => { const a = document.getElementById('pb-ayuda'); if (a) a.classList.add('fuera'); }, 4500);
  }
  function medir() {
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    dpr = Math.min(3, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const nuevo = Math.round(Math.max(44, Math.min(72, Math.min(W, H) / 6.6)));
    if (nuevo !== TS) { TS = nuevo; if (P) P.edCache = {}; }
  }

  // ---------- Mapa ----------
  function letra(x, y) { const f = P.def.suelo[y]; return f ? f[x] || 'm' : 'm'; }
  function edificioEn(x, y) { return P.def.edificios.find(e => x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h); }
  function esPuerta(x, y) { return P.def.edificios.find(e => e.puerta && e.puerta[0] === x && e.puerta[1] === y); }
  function esSolido(x, y) {
    if (x < 0 || y < 0 || y >= P.def.suelo.length || x >= P.def.suelo[0].length) return true;
    if (SOLIDO.has(letra(x, y))) return true;
    const e = edificioEn(x, y);
    if (e && !(e.puerta && e.puerta[0] === x && e.puerta[1] === y)) return true;
    if (P.def.objetos.some(o => o.x === x && o.y === y)) return true;
    return false;
  }
  function chocaPnj(x, y, yo) {
    return P.pnj.some(v => v !== yo && Math.hypot(v.x - x, v.y - y) < 0.62) || (yo && Math.hypot(P.yo.x - x, P.yo.y - y) < 0.62);
  }
  function libre(x, y, quien) {
    const r = RADIO;
    for (const [dx, dy] of [[-r, -r], [r, -r], [-r, r], [r, r]]) if (esSolido(Math.floor(x + dx), Math.floor(y + dy))) return false;
    if (quien === P.yo) return !P.pnj.some(v => Math.hypot(v.x - x, v.y - y) < 0.6);
    return !chocaPnj(x, y, quien);
  }

  // ---------- Entrada táctil ----------
  function aMundo(px, py) { return { x:(px - W / 2) / TS + P.cam.x, y:(py - H / 2) / TS + P.cam.y }; }
  function abajo(ev) {
    if (!P || P.bloqueado) return;
    Sonido.iniciar();
    cv.setPointerCapture(ev.pointerId);
    const r = cv.getBoundingClientRect();
    P.joy = { id:ev.pointerId, ox:ev.clientX - r.left, oy:ev.clientY - r.top, x:ev.clientX - r.left, y:ev.clientY - r.top, t:performance.now(), activo:false };
  }
  function mover(ev) {
    if (!P || !P.joy || ev.pointerId !== P.joy.id) return;
    const r = cv.getBoundingClientRect();
    P.joy.x = ev.clientX - r.left; P.joy.y = ev.clientY - r.top;
    if (Math.hypot(P.joy.x - P.joy.ox, P.joy.y - P.joy.oy) > 12) { P.joy.activo = true; P.yo.ruta = null; }
  }
  function arriba(ev) {
    if (!P || !P.joy || ev.pointerId !== P.joy.id) return;
    const j = P.joy; P.joy = null;
    if (j.activo) return;
    // Fue un toque: caminar hasta ahí, o hasta la persona / puerta tocada.
    const m = aMundo(j.ox, j.oy);
    const pnj = P.pnj.find(v => Math.abs(v.x - m.x) < 0.55 && m.y > v.y - 1.3 && m.y < v.y + 0.4);
    if (pnj) { irA(Math.floor(pnj.x), Math.floor(pnj.y), pnj); return; }
    const tx = Math.floor(m.x), ty = Math.floor(m.y);
    const e = edificioEn(tx, ty);
    if (e && e.puerta) { irA(e.puerta[0], e.puerta[1], null, true); return; }
    if (!esSolido(tx, ty)) irA(tx, ty);
  }
  // Camino por casillas (para tocar en vez de usar el joystick).
  function irA(tx, ty, pnj = null, puerta = false) {
    const sx = Math.floor(P.yo.x), sy = Math.floor(P.yo.y);
    const objetivo = (x, y) => pnj ? Math.abs(x - tx) + Math.abs(y - ty) === 1 : x === tx && y === ty;
    const k = (x, y) => x + ',' + y, padre = new Map([[k(sx, sy), null]]), cola = [[sx, sy]];
    let fin = null;
    while (cola.length) {
      const [x, y] = cola.shift();
      if (objetivo(x, y)) { fin = [x, y]; break; }
      for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        const nx = x + dx, ny = y + dy;
        if (padre.has(k(nx, ny)) || esSolido(nx, ny)) continue;
        if (P.pnj.some(v => v !== pnj && Math.floor(v.x) === nx && Math.floor(v.y) === ny)) continue;
        padre.set(k(nx, ny), [x, y]); cola.push([nx, ny]);
      }
    }
    if (!fin) return;
    const ruta = [];
    for (let c = fin; c; c = padre.get(k(...c))) ruta.unshift(c);
    ruta.shift();
    P.yo.ruta = ruta.map(([x, y]) => [x + 0.5, y + 0.5]);
    P.pnj.forEach(v => v.esperando = false);
    if (pnj) { pnj.esperando = true; pnj.objetivo = null; }
    P.yo.alLlegar = pnj ? () => { pnj.esperando = false; if (Math.hypot(pnj.x - P.yo.x, pnj.y - P.yo.y) < 1.8) interactuar({ tipo:'pnj', v:pnj }); } : null;
  }

  // ---------- Lógica ----------
  function actualizar(dt) {
    const yo = P.yo;
    let vx = 0, vy = 0;
    if (P.joy && P.joy.activo) {
      const dx = P.joy.x - P.joy.ox, dy = P.joy.y - P.joy.oy, d = Math.hypot(dx, dy);
      const f = Math.min(1, d / 50);
      vx = dx / d * f; vy = dy / d * f;
    } else if (yo.ruta && yo.ruta.length) {
      const [tx, ty] = yo.ruta[0];
      const dx = tx - yo.x, dy = ty - yo.y, d = Math.hypot(dx, dy);
      if (d < 0.08) { yo.ruta.shift(); if (!yo.ruta.length) { yo.ruta = null; if (yo.alLlegar) { const f = yo.alLlegar; yo.alLlegar = null; f(); } } }
      else { vx = dx / d; vy = dy / d; }
    }
    yo.mov = Math.hypot(vx, vy) > 0.15;
    if (yo.mov) {
      const nx = yo.x + vx * VEL * dt, ny = yo.y + vy * VEL * dt;
      if (libre(nx, yo.y, yo)) yo.x = nx;
      if (libre(yo.x, ny, yo)) yo.y = ny;
      yo.dir = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 1 : 3) : (vy > 0 ? 0 : 2);
      P.pasos += dt;
      if (P.pasos > 0.32) { P.pasos = 0; Sonido.fx('paso'); }
    }
    // Puertas y salidas
    const cx = Math.floor(yo.x), cy = Math.floor(yo.y);
    const pu = esPuerta(cx, cy);
    if (pu && !P.enPuerta && Math.abs(yo.y - (cy + 0.5)) < 0.35) { entrarEdificio(pu); return; }
    if (!pu) P.enPuerta = false;
    if (P.def.salidas.some(([x, y]) => x === cx && y === cy)) { Sonido.fx('atras'); salir(); pantallaMapa(); return; }
    // Vecinos que pasean
    P.pnj.forEach(v => {
      if (v.quieto || v.hablando || v.esperando) { v.mov = false; return; }
      if (!v.objetivo) {
        if (Math.hypot(v.x - yo.x, v.y - yo.y) < 2.2) { v.mov = false; return; } // se queda quieto si te acercás
        v.espera -= dt;
        if (v.espera <= 0) {
          const ox = v.cx + Math.round(azar(-2, 2)), oy = v.cy + Math.round(azar(-2, 2));
          if (!esSolido(ox, oy)) v.objetivo = [ox + 0.5, oy + 0.5];
          v.espera = azar(1.5, 4);
        }
        v.mov = false;
        return;
      }
      const dx = v.objetivo[0] - v.x, dy = v.objetivo[1] - v.y, d = Math.hypot(dx, dy);
      if (d < 0.06) { v.objetivo = null; v.mov = false; return; }
      const nx = v.x + dx / d * VEL_PNJ * dt, ny = v.y + dy / d * VEL_PNJ * dt;
      if (libre(nx, ny, v)) { v.x = nx; v.y = ny; v.mov = true; v.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 0 : 2); }
      else { v.objetivo = null; v.mov = false; }
    });
    // ¿Hay alguien cerca para hablar?
    let cerca = null, dmin = 1.35;
    P.pnj.forEach(v => { const d = Math.hypot(v.x - yo.x, v.y - yo.y); if (d < dmin) { dmin = d; cerca = { tipo:'pnj', v }; } });
    const btn = document.getElementById('pb-a');
    if (btn) {
      const clave = cerca ? cerca.v.id : '';
      if (btn.dataset.k !== clave) {
        btn.dataset.k = clave;
        btn.classList.toggle('oculto', !cerca);
        if (cerca) { btn.innerHTML = `${ICO.html(misionDisponible(cerca.v) ? 'alerta' : 'hablar', 26)}<span>Hablar</span>`; }
      }
    }
    P.cerca = cerca;
    // Cámara suave
    const mapW = P.def.suelo[0].length, mapH = P.def.suelo.length;
    const mx = W / TS / 2, my = H / TS / 2;
    const ox = clamp(yo.x, Math.min(mx, mapW / 2), Math.max(mapW - mx, mapW / 2));
    const oy = clamp(yo.y, Math.min(my, mapH / 2), Math.max(mapH - my, mapH / 2));
    P.cam.x += (ox - P.cam.x) * Math.min(1, dt * 8);
    P.cam.y += (oy - P.cam.y) * Math.min(1, dt * 8);
  }

  function entrarEdificio(e) {
    P.enPuerta = true;
    const id = P.id;
    if (!e.tipo || ['casa', 'campanario', 'castillo'].includes(e.tipo)) return;
    ultimaPuerta[id] = e.puerta;
    Sonido.fx('pagina');
    salir();
    const volver = () => entrar(id, { puerta:e.puerta });
    if (e.tipo === 'tienda') pantallaTienda(id, 'obj', volver);
    else if (e.tipo === 'herreria') pantallaHerreria(id, 'mejorar', null, volver);
    else if (e.tipo === 'joyeria') pantallaJoyeria(id, volver);
    else if (e.tipo === 'criadero') pantallaCriadero(id, volver);
    else if (e.tipo === 'taberna') pantallaTaberna(id, volver);
  }

  // ---------- Charla y misiones ----------
  function misionDisponible(v) {
    if (v.regalo && !G.flags['reg_' + v.id] && G.paso >= (v.regalo.desde || 0)) return true;
    const S = v.mision && SECRETAS[v.mision];
    if (!S) return false;
    return G.paso >= S.req && !G.flags['sec_' + v.mision];
  }
  function hablante(v) {
    const ropa = ROPA[v.ropa];
    return { n:v.n, vis: ropa ? { clase:'recluta', look:v.look, asp:ropa } : { clase:v.ropa, look:v.look } };
  }
  function interactuar(c) {
    if (c.tipo !== 'pnj' || P.bloqueado) return;
    const v = c.v, yo = P.yo;
    P.bloqueado = true; P.joy = null; yo.ruta = null;
    v.hablando = true;
    const dx = yo.x - v.x, dy = yo.y - v.y;
    v.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 0 : 2);
    yo.dir = (v.dir + 2) % 4;
    const quien = hablante(v);
    let lineas;
    const S = v.mision && SECRETAS[v.mision];
    const id = v.mision;
    const R = v.regalo;
    if (R && !G.flags['reg_' + v.id] && G.paso >= (R.desde || 0) && !(S && G.paso >= S.req && !G.flags['sec_' + id])) {
      // Regalo de una sola vez.
      G.flags['reg_' + v.id] = true;
      const nombres = [];
      for (const [k, n] of Object.entries(R.obj || {})) { G.obj[k] = (G.obj[k] || 0) + n; nombres.push(`${OBJ[k].n} x${n}`); }
      if (R.gema) { sumarGema(R.gema); nombres.push(nombreGema(R.gema)); }
      if (R.equipo) { const it = nuevoItem(R.equipo.id, 0, R.equipo.rareza || 0); nombres.push(`${EQ[it.id].n} (${RAREZAS[it.rareza].n.toLowerCase()})`); }
      guardar();
      setTimeout(() => Sonido.fx('moneda'), 300);
      dialogo([[quien, R.txt], [null, `Recibiste: ${nombres.join(', ')}.`]], () => { if (P) { P.bloqueado = false; v.hablando = false; } });
      return;
    }
    if (S && G.flags['sec_' + id + '_ok']) lineas = S.gracias.map(([, t]) => [quien, t]);
    else if (S && G.paso >= S.req && !G.flags['sec_' + id]) {
      lineas = S.pedido.map(([, t]) => [quien, t]);
      G.flags['sec_' + id] = true; guardar();
      lineas.push([null, `Nueva misión secreta: «${S.n}». Ya aparece en el mapa.`]);
      setTimeout(() => Sonido.fx('nivel'), 200);
    } else if (S && G.flags['sec_' + id] && Math.random() < 0.5) lineas = [[quien, S.recordatorio]];
    else {
      const set = v.charla.find(c2 => G.paso <= c2.hasta) || v.charla[v.charla.length - 1];
      v.idx = ((v.idx ?? -1) + 1) % set.t.length;
      lineas = [[quien, set.t[v.idx]]];
    }
    dialogo(lineas, () => { if (P) { P.bloqueado = false; v.hablando = false; } });
  }

  // ---------- Dibujo ----------
  function cuadro(t) {
    raf = requestAnimationFrame(cuadro);
    if (!P || !ctx) return;
    const dt = Math.min(0.05, (t - P.ultimo) / 1000); P.ultimo = t;
    if (!P.bloqueado) actualizar(dt);
    if (!P) return;
    dibujar(t);
  }
  function dibujar(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#1a2a1a'; ctx.fillRect(0, 0, W, H);
    const ox = W / 2 - P.cam.x * TS, oy = H / 2 - P.cam.y * TS;
    const filas = P.def.suelo.length, cols = P.def.suelo[0].length;
    const x0 = Math.max(0, Math.floor(-ox / TS) - 1), x1 = Math.min(cols, Math.ceil((W - ox) / TS) + 1);
    const y0 = Math.max(0, Math.floor(-oy / TS) - 1), y1 = Math.min(filas, Math.ceil((H - oy) / TS) + 3);
    // Suelo
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const l = letra(x, y), base = { t:'g', r:'g', m:'s', w:'w' }[l] || l;
      const sx = ox + x * TS, sy = oy + y * TS;
      const tex = SPR.texturaTop(SPR.TERRENO[base] ? base : 'g', (x * 7 + y * 3) % 2);
      ctx.drawImage(tex, sx, sy, TS + 0.6, TS + 0.6);
      if (l === 'w') {
        ctx.fillStyle = `rgba(255,255,255,${0.06 + Math.sin(t / 600 + x + y * 1.3) * 0.05})`; ctx.fillRect(sx, sy, TS + 0.6, TS + 0.6);
        if (letra(x, y - 1) !== 'w') { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(sx, sy, TS + 0.6, TS * 0.12); }
      }
    }
    // Cosas que se ordenan por profundidad (lo de más abajo, adelante)
    const cosas = [];
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const l = letra(x, y);
      if (l === 't' || l === 'r') cosas.push({ z:y + 1, f:() => { const im = SPR.deco(l === 't' ? 'arbol' : 'roca'); ctx.drawImage(im, ox + x * TS - TS * 0.1, oy + (y + 1) * TS - TS * 1.55, TS * 1.2, TS * 1.65); } });
      if (l === 'm') cosas.push({ z:y + 1, f:() => muro(ox + x * TS, oy + y * TS, letra(x, y + 1) !== 'm') });
    }
    P.def.edificios.forEach(e => cosas.push({ z:e.y + e.h, f:() => { const c = canvasEdificio(e); ctx.drawImage(c, ox + e.x * TS - TS * 0.2, oy + (e.y + e.h) * TS - c.height / dpr, c.width / dpr, c.height / dpr); } }));
    P.def.objetos.forEach(o => cosas.push({ z:o.y + 1, f:() => objeto(o, ox + o.x * TS, oy + o.y * TS, t) }));
    P.pnj.forEach(v => cosas.push({ z:v.y + 0.01, f:() => persona(v, hablante(v).vis, ox, oy, t, true) }));
    cosas.push({ z:P.yo.y + 0.02, f:() => persona(P.yo, P.yo.vis, ox, oy, t, false) });
    cosas.sort((a, b) => a.z - b.z).forEach(c => c.f());
    // Joystick
    if (P.joy && P.joy.activo) {
      const j = P.joy, dx = j.x - j.ox, dy = j.y - j.oy, d = Math.min(50, Math.hypot(dx, dy)), a = Math.atan2(dy, dx);
      ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(j.ox, j.oy, 50, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.beginPath(); ctx.arc(j.ox + Math.cos(a) * d, j.oy + Math.sin(a) * d, 22, 0, Math.PI * 2); ctx.fill();
    }
    // Viñeta suave en los bordes
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  function persona(p, vis, ox, oy, t, esPnj) {
    const cx = ox + p.x * TS, fy = oy + p.y * TS + TS * 0.28;
    const vista = p.dir === 2 ? 'b' : 'f', espejo = p.dir === 3;
    const frame = p.mov ? 1 + Math.floor(t / 140) % 2 : 0;
    const semilla = ((p.id || 'yo').charCodeAt(0) * 53) % 3000;
    const img = SPR.personaje(vis, vista, frame, p.hablando ? (Math.floor(t / 160) % 2 ? 'habla' : '') : ((t + semilla) % 3400) < 140 ? 'parpadeo' : '');
    const w = TS * 1.5;
    ctx.save(); ctx.translate(cx, fy); ctx.scale(1, 0.38);
    const gs = ctx.createRadialGradient(0, 0, 0, 0, 0, TS * 0.42); gs.addColorStop(0, 'rgba(0,0,0,.4)'); gs.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gs; ctx.beginPath(); ctx.arc(0, 0, TS * 0.42, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    const bob = p.mov ? 0 : Math.round(Math.sin(t / 380 + p.x) * 1);
    ctx.save(); ctx.translate(cx, fy + bob); if (espejo) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -w * 0.925, w, w);
    ctx.restore();
    if (esPnj) {
      const mision = misionDisponible(p);
      const cercano = P.cerca && P.cerca.v === p;
      if (mision || cercano) {
        const im = imgs[mision ? 'alerta' : 'hablar'];
        const s = TS * 0.42, by = fy - w * 0.95 - Math.abs(Math.sin(t / 250)) * 4;
        if (im) ctx.drawImage(im, cx - s / 2, by - s, s, s);
      }
      if (cercano) {
        ctx.font = `600 ${Math.round(TS * 0.24)}px Fredoka, sans-serif`; ctx.textAlign = 'center';
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(10,12,30,.85)'; ctx.strokeText(p.n, cx, fy + TS * 0.38);
        ctx.fillStyle = '#fff'; ctx.fillText(p.n, cx, fy + TS * 0.38); ctx.textAlign = 'left';
      }
    }
  }
  function muro(sx, sy, frente) {
    ctx.fillStyle = '#7a7a86'; ctx.fillRect(sx, sy - TS * 0.5, TS + 0.6, TS * 0.5 + 0.6);
    ctx.fillStyle = '#9a9aa8'; ctx.fillRect(sx, sy - TS * 0.5, TS + 0.6, 4);
    if (frente) {
      ctx.fillStyle = '#5a5a66'; ctx.fillRect(sx, sy, TS + 0.6, TS + 0.6);
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(sx, sy + i * TS / 3); ctx.lineTo(sx + TS, sy + i * TS / 3); ctx.stroke(); }
    }
  }
  function objeto(o, sx, sy, t) {
    const c = ctx, s = TS;
    c.save(); c.translate(sx, sy); c.lineJoin = 'round';
    const borde = () => { c.lineWidth = 2; c.strokeStyle = '#1e1a2a'; c.stroke(); };
    if (o.tipo === 'pozo') {
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(s / 2, s * 0.85, s * 0.45, s * 0.15, 0, 0, 7); c.fill();
      c.beginPath(); c.ellipse(s / 2, s * 0.62, s * 0.4, s * 0.2, 0, 0, 7); c.fillStyle = '#9a9aa8'; c.fill(); borde();
      c.beginPath(); c.ellipse(s / 2, s * 0.6, s * 0.28, s * 0.12, 0, 0, 7); c.fillStyle = '#2a4a8a'; c.fill();
      c.fillStyle = '#7a4a28'; c.fillRect(s * 0.12, s * 0.05, s * 0.07, s * 0.58); c.fillRect(s * 0.81, s * 0.05, s * 0.07, s * 0.58);
      c.beginPath(); c.moveTo(s * 0.02, s * 0.12); c.lineTo(s / 2, -s * 0.2); c.lineTo(s * 0.98, s * 0.12); c.closePath(); c.fillStyle = '#b04a3a'; c.fill(); borde();
    } else if (o.tipo === 'fuente') {
      c.beginPath(); c.ellipse(s / 2, s * 0.6, s * 0.48, s * 0.28, 0, 0, 7); c.fillStyle = '#b0b0bc'; c.fill(); borde();
      c.beginPath(); c.ellipse(s / 2, s * 0.56, s * 0.38, s * 0.2, 0, 0, 7); c.fillStyle = `hsl(210,60%,${48 + Math.sin(t / 300) * 4}%)`; c.fill();
      c.fillStyle = 'rgba(220,240,255,.85)'; for (let i = 0; i < 4; i++) { const a = t / 300 + i * 1.6; c.fillRect(s / 2 + Math.cos(a) * s * 0.12, s * 0.3 + Math.sin(a * 2) * 3, 2.5, 2.5); }
    } else if (o.tipo === 'barril') {
      c.beginPath(); c.ellipse(s / 2, s * 0.85, s * 0.3, s * 0.1, 0, 0, 7); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill();
      c.beginPath(); c.moveTo(s * 0.25, s * 0.2); c.quadraticCurveTo(s * 0.18, s * 0.5, s * 0.25, s * 0.82); c.lineTo(s * 0.75, s * 0.82); c.quadraticCurveTo(s * 0.82, s * 0.5, s * 0.75, s * 0.2); c.closePath();
      const g = c.createLinearGradient(s * 0.2, 0, s * 0.8, 0); g.addColorStop(0, '#6a4022'); g.addColorStop(0.5, '#a8703a'); g.addColorStop(1, '#6a4022'); c.fillStyle = g; c.fill(); borde();
      c.fillStyle = '#4a4a52'; c.fillRect(s * 0.22, s * 0.32, s * 0.56, 3); c.fillRect(s * 0.22, s * 0.68, s * 0.56, 3);
    } else if (o.tipo === 'caja') {
      c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(s * 0.15, s * 0.78, s * 0.75, s * 0.12);
      c.beginPath(); c.rect(s * 0.15, s * 0.22, s * 0.7, s * 0.6); c.fillStyle = '#b07c44'; c.fill(); borde();
      c.strokeStyle = '#6a4428'; c.lineWidth = 2; c.beginPath(); c.moveTo(s * 0.15, s * 0.22); c.lineTo(s * 0.85, s * 0.82); c.moveTo(s * 0.85, s * 0.22); c.lineTo(s * 0.15, s * 0.82); c.stroke();
    }
    c.restore();
  }

  // Edificios dibujados una vez (techo de tejas, pared, ventanas con luz, puerta y cartel).
  function canvasEdificio(e) {
    const key = e.x + ',' + e.y;
    if (P.edCache[key]) return P.edCache[key];
    const extra = e.tipo === 'campanario' ? TS * 2.2 : e.tipo === 'castillo' ? TS * 1.4 : TS * 0.7;
    const w = (e.w + 0.4) * TS, h = e.h * TS + extra;
    const cvE = document.createElement('canvas'); cvE.width = Math.round(w * dpr); cvE.height = Math.round(h * dpr);
    const c = cvE.getContext('2d'); c.scale(dpr, dpr); c.lineJoin = 'round';
    const L = TS * 0.2, ancho = e.w * TS;
    const paredAlto = TS * 1.1, paredY = h - paredAlto;
    const borde = (lw = 2.2) => { c.lineWidth = lw; c.strokeStyle = '#1e1a2a'; c.stroke(); };
    const lin = (y0, y1, a, b) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
    // Sombra en el piso
    c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(L + 4, h - 6, ancho, 8);
    // Pared
    c.beginPath(); c.rect(L, paredY, ancho, paredAlto); c.fillStyle = lin(paredY, h, SPR.luz(e.pared, 0.1), SPR.luz(e.pared, -0.15)); c.fill(); borde();
    c.fillStyle = 'rgba(90,60,40,.55)';
    for (let i = 0; i <= e.w; i++) c.fillRect(L + i * TS - 2, paredY, 4, paredAlto);
    // Ventanas y puerta
    for (let i = 0; i < e.w; i++) {
      const vx = L + i * TS;
      const esPuertaCol = e.puerta && e.puerta[0] === e.x + i;
      if (esPuertaCol) {
        const dw = TS * 0.5, dh = paredAlto * 0.72, dx = vx + (TS - dw) / 2, dy = h - dh;
        c.beginPath(); c.moveTo(dx, h); c.lineTo(dx, dy + dw / 2); c.arc(dx + dw / 2, dy + dw / 2, dw / 2, Math.PI, 0); c.lineTo(dx + dw, h); c.closePath();
        c.fillStyle = lin(dy, h, '#9a6a3a', '#5e3c1e'); c.fill(); borde();
        c.fillStyle = '#e8c86a'; c.beginPath(); c.arc(dx + dw * 0.78, dy + dh * 0.6, 2.4, 0, 7); c.fill();
        // Cartel colgante
        const im = e.cartel && imgs[e.cartel];
        const cs = TS * 0.5, cx2 = vx + TS / 2 - cs / 2, cy2 = paredY - cs * 0.15;
        c.beginPath(); c.roundRect ? c.roundRect(cx2 - 4, cy2 - 4, cs + 8, cs + 8, 6) : c.rect(cx2 - 4, cy2 - 4, cs + 8, cs + 8);
        c.fillStyle = '#f4e8c8'; c.fill(); borde(1.8);
        if (im) c.drawImage(im, cx2, cy2, cs, cs);
      } else if (e.tipo !== 'campanario') {
        const ww = TS * 0.42, wh = TS * 0.38, wx = vx + (TS - ww) / 2, wy = paredY + TS * 0.28;
        c.beginPath(); c.roundRect ? c.roundRect(wx, wy, ww, wh, 5) : c.rect(wx, wy, ww, wh);
        c.fillStyle = lin(wy, wy + wh, '#fff2b0', '#ffb84a'); c.fill(); borde(1.8);
        c.strokeStyle = '#6a4428'; c.lineWidth = 2; c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.moveTo(wx, wy + wh / 2); c.lineTo(wx + ww, wy + wh / 2); c.stroke();
        c.fillStyle = '#6a8a4a'; c.fillRect(wx - 2, wy + wh, ww + 4, 5);
      }
    }
    // Techo de tejas
    const techoAbajo = paredY + 4, techoArriba = h - e.h * TS - extra + (e.tipo === 'campanario' ? TS * 1.6 : e.tipo === 'castillo' ? TS * 0.8 : 0);
    const tx0 = 0, tx1 = w;
    c.beginPath(); c.moveTo(tx0, techoAbajo); c.lineTo(tx0 + TS * 0.25, techoArriba + TS * 0.2); c.quadraticCurveTo(w / 2, techoArriba - TS * 0.1, tx1 - TS * 0.25, techoArriba + TS * 0.2); c.lineTo(tx1, techoAbajo); c.closePath();
    c.fillStyle = lin(techoArriba, techoAbajo, SPR.luz(e.techo, 0.18), SPR.luz(e.techo, -0.22)); c.fill(); borde(2.6);
    c.save(); c.clip();
    for (let y = techoArriba + TS * 0.25; y < techoAbajo; y += TS * 0.22) {
      const fila = Math.round((y - techoArriba) / (TS * 0.22));
      for (let x = (fila % 2) * TS * 0.14 - TS * 0.14; x < w; x += TS * 0.28) {
        c.beginPath(); c.arc(x + TS * 0.14, y, TS * 0.14, 0, Math.PI); c.strokeStyle = SPR.luz(e.techo, -0.35); c.lineWidth = 1.2; c.stroke();
      }
    }
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(0, techoArriba, w, TS * 0.18);
    c.restore();
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(L, techoAbajo, ancho, 5);
    if (e.tipo === 'casa' || e.tipo === 'taberna') { // chimenea con humo
      const chx = w * 0.72, chy = techoArriba + TS * 0.05;
      c.beginPath(); c.rect(chx, chy - TS * 0.35, TS * 0.26, TS * 0.5); c.fillStyle = '#8a5a4a'; c.fill(); borde(1.8);
    }
    if (e.tipo === 'herreria') { // brasa en la fragua
      const g = c.createRadialGradient(L + ancho - TS * 0.5, h - TS * 0.35, 2, L + ancho - TS * 0.5, h - TS * 0.35, TS * 0.4);
      g.addColorStop(0, 'rgba(255,170,60,.7)'); g.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = g; c.fillRect(L + ancho - TS, h - TS * 0.8, TS, TS * 0.8);
    }
    if (e.tipo === 'campanario') {
      const bx = w / 2, top = h - e.h * TS - extra;
      c.beginPath(); c.rect(bx - TS * 0.6, top + TS * 0.9, TS * 1.2, techoArriba - top - TS * 0.6); c.fillStyle = lin(top, techoArriba, '#e8dcc4', '#bcae94'); c.fill(); borde();
      c.beginPath(); c.moveTo(bx - TS * 0.35, top + TS * 1.75); c.lineTo(bx - TS * 0.35, top + TS * 1.3); c.arc(bx, top + TS * 1.3, TS * 0.35, Math.PI, 0); c.lineTo(bx + TS * 0.35, top + TS * 1.75); c.closePath(); c.fillStyle = '#2a2438'; c.fill();
      if (G.paso >= 11) { c.beginPath(); c.moveTo(bx - TS * 0.2, top + TS * 1.65); c.quadraticCurveTo(bx - TS * 0.2, top + TS * 1.25, bx, top + TS * 1.25); c.quadraticCurveTo(bx + TS * 0.2, top + TS * 1.25, bx + TS * 0.2, top + TS * 1.65); c.closePath(); c.fillStyle = '#e8c86a'; c.fill(); borde(1.6); }
      c.beginPath(); c.moveTo(bx - TS * 0.8, top + TS * 0.95); c.lineTo(bx, top); c.lineTo(bx + TS * 0.8, top + TS * 0.95); c.closePath(); c.fillStyle = lin(top, top + TS, SPR.luz(e.techo, 0.2), SPR.luz(e.techo, -0.2)); c.fill(); borde(2.4);
    }
    if (e.tipo === 'castillo') {
      const top = h - e.h * TS - extra;
      [TS * 0.5, w - TS * 0.5].forEach(x => {
        c.beginPath(); c.rect(x - TS * 0.45, top + TS * 0.7, TS * 0.9, h - top - TS * 0.7); c.fillStyle = lin(top, h, '#e8e8f0', '#a8a8b8'); c.fill(); borde();
        c.beginPath(); c.moveTo(x - TS * 0.6, top + TS * 0.75); c.lineTo(x, top - TS * 0.1); c.lineTo(x + TS * 0.6, top + TS * 0.75); c.closePath(); c.fillStyle = lin(top, top + TS, '#7a7ab8', '#3a3a6a'); c.fill(); borde();
        c.fillStyle = '#c83a4a'; c.beginPath(); c.moveTo(x, top - TS * 0.1); c.lineTo(x, top - TS * 0.5); c.lineTo(x + TS * 0.35, top - TS * 0.38); c.lineTo(x, top - TS * 0.28); c.fill();
      });
      const pw = TS * 0.8, px = w / 2 - pw / 2;
      c.beginPath(); c.moveTo(px, h); c.lineTo(px, h - TS * 0.55); c.arc(w / 2, h - TS * 0.55, pw / 2, Math.PI, 0); c.lineTo(px + pw, h); c.closePath(); c.fillStyle = '#3a2a1e'; c.fill(); borde();
    }
    P.edCache[key] = cvE;
    return cvE;
  }

  return { entrar, salir, get activo() { return !!P; }, _dbg: () => P };
})();
