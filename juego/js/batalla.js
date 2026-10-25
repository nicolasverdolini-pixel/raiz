// Campanas de Bruma — motor de batalla táctica: mapa con alturas, turnos por velocidad, IA, efectos y animaciones.
'use strict';

const Batalla = (() => {
  let B = null;                 // estado de la batalla en curso
  let cv = null, ctx = null, raf = 0, dpr = 1;
  const L = { TW:40, TD:30, HS:12, ox:0, oy:0, k:2.5, W:0, H:0 };
  let parts = [], popups = [], amb = [], shake = 0, banner = null;
  const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // 0 abajo, 1 derecha, 2 arriba, 3 izquierda
  const ARMAS_DIBUJABLES = ['espada', 'hacha', 'daga', 'arco', 'vara', 'maza', 'lanza'];

  const $ = s => document.querySelector(s);
  const vel = () => ((B && B.vel) || 1) * 1.45; // el ritmo base ya es ágil; x2 y x3 lo aceleran más
  const esperar = ms => new Promise(r => setTimeout(r, ms / vel()));
  function tween(ms, fn) {
    if (vel() >= 20) { fn(1); return Promise.resolve(); } // modo de prueba: sin animaciones
    ms = ms / vel();
    return new Promise(res => {
      const t0 = performance.now();
      const step = () => { const p = Math.min(1, (performance.now() - t0) / ms); fn(p); if (p < 1) requestAnimationFrame(step); else res(); };
      requestAnimationFrame(step);
    });
  }
  const suave = p => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

  // ---------- Mapa ----------
  function tile(x, y) { return B.mapa.t[y]?.[x] || null; }
  function alt(x, y) { const t = tile(x, y); return t ? t.h : 0; }
  function terreno(t) { return SPR.TERRENO[t.t] || SPR.TERRENO.g; }
  function unidadEn(x, y, incluirKO = false) { return B.us.find(u => u.x === x && u.y === y && (incluirKO ? !u.oculto : !u.ko)); }
  const dist = (a, b, c, d) => Math.abs(a - c) + Math.abs(b - d);
  const vivos = eq => B.us.filter(u => !u.ko && (!eq || u.eq === eq));
  const rival = u => u.eq === 'A' ? 'E' : 'A';

  function parsearMapa(nombre) {
    const filas = MAPAS[nombre];
    const t = filas.map(f => f.trim().split(/\s+/).map(tok => ({ t:tok[0], h:+tok[1] })));
    return { nombre, w:t[0].length, h:t.length, t, maxH:Math.max(...t.flat().map(c => c.h)) };
  }

  // ---------- Unidades ----------
  function mkBU(u, eq, x, y) {
    const st = calcStats(u);
    const m = eq === 'A' && u.mascota ? mascota(u.mascota) : null;
    const bu = { id:uid(), u, eq, nombre:u.nombre, st, hp:st.hpMax, mp:st.mpMax, x, y, dir: eq === 'A' ? 2 : 0,
      ct: azar(0, 25) + st.spd * 3, est:{}, ko:false, rx:x, ry:y, rh:0, off:{ x:0, y:0, z:0 }, alpha:1, flash:0,
      mascota:m, jefe:!!u.jefe, revivio:false, vis:{ clase:u.clase, look:u.look, t:u.t, arma: ARMAS_DIBUJABLES.includes(st.armaTipo) ? st.armaTipo : null } };
    bu.rh = alt(x, y);
    if (st.pasiva === 'prisa_ini' || st.rasgos.has('prisa_ini')) bu.est.prisa = 4;
    if (st.rasgos.has('escudo')) bu.est.protegido = 3;
    return bu;
  }
  function refrescarStats(bu) {
    const hpPrev = bu.st.hpMax, mpPrev = bu.st.mpMax;
    bu.st = calcStats(bu.u);
    bu.hp = Math.min(bu.st.hpMax, bu.hp + Math.max(0, bu.st.hpMax - hpPrev));
    bu.mp = Math.min(bu.st.mpMax, bu.mp + Math.max(0, bu.st.mpMax - mpPrev));
  }

  // ---------- Inicio ----------
  // opts: { def, ids: [ids de personajes], onFin(resultado) }
  function iniciar(opts) {
    const def = opts.def;
    B = { def, mapa:parsearMapa(def.mapa), us:[], fin:null, onFin:opts.onFin, ui:{ modo:'espera' }, activo:null, vel:1, cargas:[], ganado:{ oro:0, mat:{}, obj:{}, gemas:{}, equipo:[] }, log:[] };
    try { B.vel = +(localStorage.getItem('cb:vel') || 1); } catch (e) {}
    opts.ids.forEach((id, i) => {
      const u = G.unidades.find(v => v.id === id);
      const [x, y] = def.aliados[i];
      B.us.push(mkBU(u, 'A', x, y));
    });
    def.e.forEach(e => { const en = crearEnemigo(e, def.facil); const bu = mkBU(en, 'E', e.x, e.y); bu.defE = e; B.us.push(bu); });
    montarDOM();
    iniciarAmbiente();
    Sonido.musica(def.musica || 'batalla');
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(cuadro);
    bucle().catch(err => { console.error(err); mostrarError(err); });
  }
  function mostrarError(err) {
    const d = document.createElement('div');
    d.className = 'error-caja'; d.textContent = 'Error en la batalla: ' + (err && err.message || err);
    document.body.appendChild(d);
  }

  function montarDOM() {
    const app = $('#app');
    app.innerHTML = `
      <div id="bt">
        <div id="bt-top">
          <div id="bt-orden"></div>
          <button id="bt-auto" class="mini">🤖</button>
          <button id="bt-vel" class="mini">⏩ x${B.vel}</button>
          <button id="bt-pausa" class="mini">☰</button>
        </div>
        <div id="bt-obj">${esc(B.def.objetivo || 'Derrotá a todos los enemigos')}</div>
        <canvas id="bt-cv"></canvas>
        <div id="bt-panel"><div id="bt-info"></div><div id="bt-menu"></div></div>
      </div>`;
    ICO.iconizar($('#bt-top'));
    cv = $('#bt-cv'); ctx = cv.getContext('2d');
    medir();
    window.addEventListener('resize', medir);
    if (window.ResizeObserver) new ResizeObserver(() => medir()).observe(cv);
    cv.addEventListener('pointerdown', alTocar);
    $('#bt-menu').addEventListener('click', alBoton);
    $('#bt-vel').onclick = () => { B.vel = B.vel === 1 ? 2 : B.vel === 2 ? 3 : 1; try { localStorage.setItem('cb:vel', B.vel); } catch (e) {} $('#bt-vel').innerHTML = `${ICO.html('velocidad', 18)} x${B.vel}`; Sonido.fx('sel'); };
    $('#bt-pausa').onclick = menuPausa;
    $('#bt-auto').onclick = () => {
      B.auto = !B.auto; $('#bt-auto').classList.toggle('on', B.auto); Sonido.fx('sel');
      if (B.auto && finJugador && B.ui.modo !== 'animando') { const f = finJugador; finJugador = null; B.ui = { modo:'espera' }; turnoIA(B.activo).then(f); }
    };
  }
  function medir() {
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    dpr = Math.min(3, window.devicePixelRatio || 1);
    L.W = r.width; L.H = r.height;
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    const m = B.mapa;
    const TW = Math.floor(Math.min(L.W / (m.w + 0.3), L.H / (m.h * 0.62 + m.maxH * 0.3 + 1.9)));
    L.TW = Math.max(16, TW); L.HS = Math.round(L.TW * 0.3); L.k = L.TW / 16;
    // La profundidad de cada casilla se estira para aprovechar el alto de la pantalla.
    L.TD = Math.round(clamp((L.H - m.maxH * L.HS - L.TW * 1.5 - L.HS * 2) / m.h, L.TW * 0.6, L.TW * 0.92));
    L.ox = Math.round((L.W - m.w * L.TW) / 2);
    const altoMapa = m.h * L.TD + m.maxH * L.HS + L.HS * 2;
    L.oy = Math.round(m.maxH * L.HS + L.TW * 1.2 + Math.max(0, (L.H - altoMapa - L.TW * 1.2) / 2));
  }
  function salir() {
    cancelAnimationFrame(raf); raf = 0;
    window.removeEventListener('resize', medir);
    cv = null; B = null;
  }

  // ---------- Bucle de turnos ----------
  async function bucle() {
    await mostrarBanner(B.def.n, 1400);
    while (!B.fin) {
      const sig = siguienteTurno();
      if (sig.carga) await resolverCarga(sig.carga);
      else await turno(sig);
      chequearFin();
    }
    await terminar();
  }
  function multCT(u) { return (u.est.prisa ? 1.5 : 1) * (u.est.lento ? 0.5 : 1) * (u.est.detenido ? 0 : 1) * (u.cargando ? 0 : 1); }
  // Devuelve la próxima unidad que actúa, o { carga } si antes sale un hechizo que se estaba cargando.
  function siguienteTurno() {
    for (let guard = 0; guard < 10000; guard++) {
      const c = B.cargas.filter(c => c.ct >= 100).sort((a, b) => b.ct - a.ct)[0];
      if (c) return { carga:c };
      const listos = vivos().filter(u => u.ct >= 100).sort((a, b) => b.ct - a.ct);
      if (listos.length) return listos[0];
      vivos().forEach(u => u.ct += u.st.spd * multCT(u));
      B.cargas.forEach(c => c.ct += c.vel);
    }
    return vivos()[0];
  }
  async function resolverCarga(c) {
    B.cargas = B.cargas.filter(x => x !== c);
    const u = c.u;
    u.cargando = null;
    pintarOrden();
    const H = datosAccion(u, c.acc);
    if (u.ko || u.est.dormido || u.est.detenido || (u.est.silencio && ['mag', 'cura', 'apoyo', 'revivir'].includes(H.tipo))) {
      if (!u.ko) popup(u, 'Se cortó', '#ccc');
      await esperar(300);
      return;
    }
    B.activo = u;
    await ejecutar(u, c.acc, c.cx, c.cy, true);
    B.activo = null;
    pintarPanel();
  }
  function ordenTurnos(n) {
    const sim = vivos().map(u => ({ u, ct: u === B.activo ? Math.min(60, u.ct - 100) : u.ct }));
    const cs = B.cargas.map(c => ({ c, ct:c.ct, hecho:false }));
    const res = [];
    if (B.activo && !B.activo.ko) res.push(B.activo);
    for (let g = 0; res.length < n && g < 5000; g++) {
      const c = cs.find(x => !x.hecho && x.ct >= 100);
      if (c) { c.hecho = true; res.push({ carga:c.c }); sim.forEach(s => { if (s.u === c.c.u) s.libre = true; }); continue; }
      const listo = sim.filter(s => s.ct >= 100).sort((a, b) => b.ct - a.ct)[0];
      if (listo) { res.push(listo.u); listo.ct -= 100; continue; }
      sim.forEach(s => { if (!s.u.cargando || s.libre) s.ct += s.u.st.spd * (multCT(s.u) || (s.libre ? 1 : 0)); });
      cs.forEach(x => { if (!x.hecho) x.ct += x.c.vel; });
    }
    return res.slice(0, n);
  }
  function pintarOrden() {
    const cont = $('#bt-orden'); if (!cont) return;
    cont.innerHTML = '';
    ordenTurnos(8).forEach((u, i) => {
      if (u.carga) {
        const d = document.createElement('div');
        d.className = 'ord carga ' + (u.carga.u.eq === 'A' ? 'al' : 'en');
        d.textContent = '✦'; d.title = HAB[u.carga.acc.id]?.n || '';
        cont.appendChild(d);
        return;
      }
      const c = document.createElement('canvas'); c.width = 64; c.height = 64;
      const cx2 = c.getContext('2d'); cx2.imageSmoothingQuality = 'high';
      cx2.drawImage(SPR.retrato(u.vis), 0, 0, 64, 64);
      const d = document.createElement('div');
      d.className = 'ord ' + (u.eq === 'A' ? 'al' : 'en') + (i === 0 ? ' ya' : '');
      d.appendChild(c);
      cont.appendChild(d);
    });
  }

  async function turno(u) {
    B.activo = u;
    u.movio = false; u.actuo = false; u.x0 = u.x; u.y0 = u.y;
    pintarOrden();
    await inicioTurno(u);
    if (u.ko || B.fin) { finTurno(u); return; }
    const bloqueo = u.est.dormido ? 'Dormido' : u.est.detenido ? 'Detenido' : u.est.aturdido ? 'Aturdido' : null;
    if (bloqueo) {
      popup(u, bloqueo, '#cfd8ff');
      if (u.est.aturdido) delete u.est.aturdido;
      await esperar(650);
      finTurno(u, true);
      return;
    }
    if (u.eq === 'A' && !B.auto) { Sonido.fx('turno'); await turnoJugador(u); }
    else await turnoIA(u);
    finTurno(u);
  }
  async function inicioTurno(u) {
    const s = u.st;
    if (u.est.veneno) { const d = Math.max(3, Math.round(s.hpMax * 0.08)); popup(u, d, '#9f6'); await aplicarDanio(null, u, d, true); await esperar(350); }
    let cura = 0;
    if (s.pasiva === 'regen' || u.est.regen) cura += Math.round(s.hpMax * 0.06);
    if (s.efectos.regen) cura += Math.round(s.hpMax * [0, 0.03, 0.05, 0.08][Math.min(3, s.efectos.regen)]);
    if (u.mascota && MASCOTAS[u.mascota.id].accion === 'cura') cura += Math.round(s.hpMax * (0.03 + u.mascota.nivel * 0.005));
    if (cura && !u.ko && u.hp < s.hpMax) { u.hp = Math.min(s.hpMax, u.hp + cura); popup(u, cura, '#6f9'); chispas(u, '#8f8', 6); await esperar(300); }
    let mpMas = 0;
    if (s.pasiva === 'resonancia') mpMas += 5;
    if (s.rasgos.has('mp_regen')) mpMas += 4;
    if (u.mascota && MASCOTAS[u.mascota.id].accion === 'mp') mpMas += 2 + u.mascota.nivel;
    if (mpMas && u.mp < s.mpMax) u.mp = Math.min(s.mpMax, u.mp + mpMas);
    if (!u.ko) await accionMascota(u);
  }
  async function accionMascota(u) {
    const m = u.mascota; if (!m) return;
    const M = MASCOTAS[m.id];
    if (!M.accion || Math.random() * 100 > M.prob + m.nivel * 2) return;
    if (M.accion === 'mordida_fuego') {
      const t = vivos(rival(u)).find(e => dist(e.x, e.y, u.x, u.y) === 1);
      if (!t) return;
      await mostrarBanner(`${m.nombre}: ¡mordisco de brasa!`, 700, true);
      Sonido.fx('mascota'); efecto('fuego', [[t.x, t.y]]); Sonido.fx('fuego');
      const d = Math.round((8 + m.nivel * 4) * mElem(t, 'fuego'));
      popup(t, d, '#ffb070'); await aplicarDanio(u, t, d);
      await esperar(400);
    }
    if (M.accion === 'aliento') {
      const ts = vivos(rival(u)).filter(e => dist(e.x, e.y, u.x, u.y) <= 3);
      if (!ts.length) return;
      const c = elegir(ts);
      await mostrarBanner(`${m.nombre}: ¡aliento de bruma!`, 700, true);
      Sonido.fx('mascota'); Sonido.fx('fuego');
      const area = areaDe(1, c.x, c.y);
      efecto('fuego', area);
      for (const t of vivos(rival(u)).filter(e => area.some(([x, y]) => x === e.x && y === e.y))) {
        const d = Math.round((10 + m.nivel * 5) * mElem(t, 'fuego'));
        popup(t, d, '#ffb070'); await aplicarDanio(u, t, d);
      }
      await esperar(400);
    }
  }
  function finTurno(u, bloqueado = false) {
    for (const k of Object.keys(u.est)) { if (k === 'aturdido') continue; u.est[k]--; if (u.est[k] <= 0) delete u.est[k]; }
    if (!u.ko) {
      u.ct -= 100;
      if (!u.movio && !bloqueado) u.ct += 15;
      if (!u.actuo && !bloqueado) u.ct += 15;
      u.ct = Math.min(u.ct, 60);
    }
    B.ui = { modo:'espera' };
    pintarPanel();
  }
  function chequearFin() {
    if (B.fin) return;
    if (!vivos('A').length) B.fin = 'derrota';
    else if (!vivos('E').length) B.fin = 'victoria';
    else if (B.def.jefeGana && !B.us.some(u => u.eq === 'E' && u.jefe && !u.ko)) B.fin = 'victoria';
  }

  // ---------- Movimiento ----------
  function alcance(u) {
    const s = u.st, vuela = s.vuela, res = new Map(), padre = new Map();
    const key = (x, y) => x + ',' + y;
    const costo = new Map([[key(u.x, u.y), 0]]);
    const cola = [[u.x, u.y]];
    while (cola.length) {
      cola.sort((a, b) => costo.get(key(...a)) - costo.get(key(...b)));
      const [x, y] = cola.shift();
      const c0 = costo.get(key(x, y));
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy, t = tile(nx, ny);
        if (!t) continue;
        const tr = terreno(t);
        if (!vuela && (!tr.pasa || tr.vacio)) continue;
        if (!vuela) {
          const dh = t.h - alt(x, y);
          if (dh > s.salto || -dh > s.salto + 1) continue;
        }
        const ocup = unidadEn(nx, ny);
        if (ocup && ocup.eq !== u.eq) continue;
        const nc = c0 + (vuela ? 1 : (tr.costo || 1));
        if (nc > s.mov) continue;
        if (costo.has(key(nx, ny)) && costo.get(key(nx, ny)) <= nc) continue;
        costo.set(key(nx, ny), nc); padre.set(key(nx, ny), [x, y]);
        cola.push([nx, ny]);
      }
    }
    for (const k of costo.keys()) {
      const [x, y] = k.split(',').map(Number);
      if (x === u.x && y === u.y) continue;
      const t = tile(x, y), tr = terreno(t);
      if (tr.vacio || (!tr.pasa && !(vuela && !tr.deco && !tr.techo))) continue;
      if (unidadEn(x, y, true)) continue;
      res.set(k, [x, y]);
    }
    return { destinos:res, padre, key };
  }
  function camino(alc, u, x, y) {
    const p = [[x, y]];
    let k = alc.key(x, y);
    while (alc.padre.has(k)) { const q = alc.padre.get(k); if (q[0] === u.x && q[1] === u.y) break; p.unshift(q); k = alc.key(...q); }
    return p;
  }
  async function moverA(u, x, y, alc) {
    const ruta = camino(alc || alcance(u), u, x, y);
    u.caminando = true;
    for (const [nx, ny] of ruta) {
      const dx = nx - u.x, dy = ny - u.y;
      u.dir = dy > 0 ? 0 : dx > 0 ? 1 : dy < 0 ? 2 : 3;
      const h0 = alt(u.x, u.y), h1 = alt(nx, ny), x0 = u.x, y0 = u.y;
      const salto = Math.abs(h1 - h0) > 0 || u.st.vuela;
      Sonido.fx('paso');
      await tween(salto ? 190 : 140, p => {
        u.rx = x0 + dx * p; u.ry = y0 + dy * p;
        u.rh = h0 + (h1 - h0) * p + (salto ? Math.sin(p * Math.PI) * (0.6 + Math.abs(h1 - h0) * 0.4) : 0);
      });
      u.x = nx; u.y = ny; u.rx = nx; u.ry = ny; u.rh = h1;
    }
    u.caminando = false;
    u.movio = true;
  }

  // ---------- Alcance de acciones ----------
  // acc: { tipo:'atacar' } | { tipo:'hab', id } | { tipo:'obj', id }
  function datosAccion(u, acc) {
    if (acc.tipo === 'atacar') return { tipo:'fis', p:1, r:'arma', af:'e', fx:'ataque', n:'Atacar' };
    if (acc.tipo === 'obj') { const o = OBJ[acc.id]; return Object.assign({ n:o.n, r:o.r, a:o.a || 0, af: o.uso.danio ? 'e' : 'a', obj:true, fx: o.uso.danio ? 'fuego' : o.uso.revive ? 'revivir' : 'cura' }, { uso:o.uso }); }
    return HAB[acc.id];
  }
  function costoMP(u, H) { return Math.round((H.mp || 0) * (u.st.pasiva === 'ahorro' ? 0.75 : 1)); }
  function rangoDe(u, H) {
    const r = H.r === 'arma' ? u.st.rango : H.r;
    if (u.st.vista && r[1] > 1) return [r[0], r[1] + 1];
    return r;
  }
  function tilesObjetivo(u, acc, fx = u.x, fy = u.y) {
    const H = datosAccion(u, acc), [mn, mx] = rangoDe(u, H), res = [];
    const arco = H.r === 'arma' && u.st.armaTipo === 'arco';
    const extra = arco ? 2 : 0;
    const hf = alt(fx, fy);
    for (let y = fy - mx - extra; y <= fy + mx + extra; y++) for (let x = fx - mx - extra; x <= fx + mx + extra; x++) {
      const t = tile(x, y); if (!t || terreno(t).vacio || terreno(t).deco || terreno(t).techo) continue;
      const d = dist(fx, fy, x, y);
      if (d < mn) continue;
      let max = mx;
      if (arco) max += Math.floor(Math.max(0, hf - t.h) / 2);
      if (d > max) continue;
      if (H.tipo === 'fis' && H.r === 'arma' && mx === 1 && Math.abs(t.h - hf) > 3) continue;
      if (H.tipo === 'fis' && Array.isArray(H.r) && H.r[1] === 1 && Math.abs(t.h - hf) > 3) continue;
      res.push([x, y]);
    }
    return res;
  }
  function areaDe(a, cx, cy) {
    const res = [];
    for (let y = cy - a; y <= cy + a; y++) for (let x = cx - a; x <= cx + a; x++) {
      const t = tile(x, y);
      if (t && !terreno(t).vacio && dist(cx, cy, x, y) <= a) res.push([x, y]);
    }
    return res;
  }
  function afectados(u, H, area) {
    const af = H.af || 'e';
    const eq = af === 'e' ? rival(u) : u.eq;
    const revive = H.tipo === 'revivir' || H.uso?.revive;
    return B.us.filter(t => !t.oculto && t.eq === eq && (revive ? t.ko : !t.ko) && area.some(([x, y]) => x === t.x && y === t.y));
  }

  // ---------- Cálculos ----------
  function angulo(ax, ay, t) {
    const [fx, fy] = DIRS[t.dir];
    const dx = ax - t.x, dy = ay - t.y;
    const dot = dx * fx + dy * fy, cross = Math.abs(dx * fy - dy * fx);
    if (dot > 0 && dot >= cross) return 'frente';
    if (dot < 0 && -dot >= cross) return 'espalda';
    return 'lado';
  }
  function mElem(t, el) {
    if (!el) return 1;
    let m = t.st.debil.includes(el) ? 1.5 : 1;
    m *= 1 - (t.st.resEl[el] || 0);
    return m;
  }
  // Devuelve { d, prob, ang, el } para un golpe físico desde (ax, ay).
  function calcFisico(u, t, H, ax = u.x, ay = u.y) {
    const s = u.st, ts = t.st;
    const atk = s.atk * (u.est.valor ? 1.25 : 1) * (u.est.debil ? 0.7 : 1);
    const pow = H.sinArma ? 3 : s.armaPoder;
    const raw = (atk + pow) * 1.6 * (H.p || 1);
    const def = ts.def * (t.est.quebrado ? 0.6 : 1) * (t.est.protegido ? 1.35 : 1) * (s.rasgos.has('perforar') ? 0.75 : 1);
    let d = Math.max(raw * 0.08 + 1, raw - def);
    const ang = angulo(ax, ay, t);
    d *= ang === 'espalda' ? 1.25 : ang === 'lado' ? 1.1 : 1;
    if (H.espalda && ang === 'espalda') d *= 1.3;
    if (s.pasiva === 'critico') d *= 1.2;
    if (s.rasgos.has('critico')) d *= 1.15;
    if (ts.raza === 'demonio' && s.rasgos.has('antidemonio')) d *= 1.3;
    if (ts.raza === 'dragon' && s.rasgos.has('antidragon')) d *= 1.4;
    if (ts.raza === 'demonio') { if (s.pasiva === 'cazador') d *= 1.3; if (H.antidemonio) d *= 2; }
    const dh = alt(ax, ay) - alt(t.x, t.y);
    d *= 1 + clamp(dh, -3, 5) * 0.05;
    const el = H.el || (H.sinArma ? null : s.armaEl);
    d *= mElem(t, el);
    if (el && el === s.armaEl && s.armaElNv) d *= 1 + 0.05 * s.armaElNv;
    d *= ts.resFis;
    if (ts.pasiva === 'ferrea') d *= 0.85;
    let prob;
    if (H.precisa || t.est.dormido || t.est.detenido) prob = 100;
    else {
      const ev = ts.eva * (ang === 'frente' ? 1 : ang === 'lado' ? 0.5 : 0.15);
      prob = 97 - ev;
      if (u.est.ciego) prob *= 0.5;
      prob = clamp(Math.round(prob), 10, 99);
    }
    return { d:Math.max(1, Math.round(d)), prob, ang, el };
  }
  function calcMagico(u, t, H) {
    const s = u.st, ts = t.st;
    const mag = s.mag * (u.est.foco ? 1.3 : 1) * (s.pasiva === 'magia' ? 1.2 : 1);
    const raw = H.p * (0.5 + mag / 14);
    const res = ts.res * (t.est.coraza ? 1.35 : 1);
    let d = Math.max(raw * 0.1, raw - res * 0.5);
    d *= mElem(t, H.el);
    if (ts.raza === 'demonio') { if (s.pasiva === 'cazador') d *= 1.3; if (H.antidemonio) d *= 2; if (s.rasgos.has('antidemonio')) d *= 1.3; }
    if (ts.pasiva === 'ferrea') d *= 0.85;
    return { d:Math.max(1, Math.round(d)), prob:100, el:H.el };
  }
  function calcCura(u, H) { return Math.round(H.p * (0.5 + u.st.mag / 14)); }
  function probEstado(u, t, e) {
    if (t.st.inmune.has(e.id)) return 0;
    if (t.eq === u.eq) return 100;
    let p = e.prob * (1 - t.st.res / 220);
    if (t.jefe && ['detenido', 'dormido', 'aturdido'].includes(e.id)) p *= 0.4;
    return clamp(Math.round(p), 0, 100);
  }
  // Vista previa / estimación (también la usa la IA).
  function estimar(u, acc, t, ax = u.x, ay = u.y) {
    const H = datosAccion(u, acc);
    if (H.obj) {
      const o = H.uso;
      if (o.danio) return { tipo:'danio', d:Math.round(o.danio * mElem(t, o.el)), prob:100 };
      if (o.revive) return { tipo:'revive', prob:100 };
      if (o.cura) return { tipo:'cura', d:Math.min(o.cura, t.st.hpMax - t.hp) };
      if (o.mp) return { tipo:'mp', d:o.mp };
      return { tipo:'limpia' };
    }
    if (H.tipo === 'fis') { const r = calcFisico(u, t, H, ax, ay); r.tipo = 'danio'; r.golpes = H.golpes || 1; return r; }
    if (H.tipo === 'mag') { const r = calcMagico(u, t, H); r.tipo = 'danio'; return r; }
    if (H.tipo === 'cura') return { tipo:'cura', d:calcCura(u, H) };
    if (H.tipo === 'revivir') return { tipo:'revive', prob:H.prob || 100 };
    if (H.tipo === 'apoyo') return { tipo:'estado', prob:Math.min(...H.est.map(e => probEstado(u, t, e))) };
    if (H.esp === 'gravedad') return { tipo:'danio', d: t.jefe ? 0 : Math.max(1, Math.round(t.hp * 0.25)), prob: t.jefe ? 0 : 90 };
    if (H.esp === 'robar_oro' || H.esp === 'robar_obj') { const ang = angulo(ax, ay, t); return { tipo:'robo', prob: ang === 'espalda' ? 90 : ang === 'lado' ? 75 : 55 }; }
    return { tipo:'especial' };
  }

  // ---------- Ejecutar acciones ----------
  function mirarHacia(u, x, y) {
    const dx = x - u.x, dy = y - u.y;
    if (!dx && !dy) return;
    u.dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 0 : 2);
  }
  async function ejecutar(u, acc, cx, cy, desdeCarga = false) {
    const H = datosAccion(u, acc);
    u.actuo = true;
    mirarHacia(u, cx, cy);
    if (acc.tipo === 'hab' && H.mp && !desdeCarga) u.mp -= costoMP(u, H);
    if (H.carga && !desdeCarga) {
      // Los hechizos grandes tardan: se cargan ahora y salen más adelante en la fila de turnos.
      const c = { u, acc, cx, cy, ct:0, vel:H.carga };
      B.cargas.push(c); u.cargando = c;
      await mostrarBanner(`${u.nombre} carga ${H.n}`, 650, true);
      Sonido.fx('brillo'); anillo(u, '#c9a6ff');
      pintarOrden();
      return;
    }
    if (acc.tipo === 'obj') { G.obj[acc.id]--; if (G.obj[acc.id] <= 0) delete G.obj[acc.id]; }
    const area = areaDe(H.a || 0, cx, cy);
    const objetivos = afectados(u, H, area);
    if (acc.tipo !== 'atacar') await mostrarBanner(H.n, 750);
    // Animación del que actúa
    const melee = (H.tipo === 'fis' && rangoDe(u, H)[1] <= 2 && !['flecha', 'piedra', 'onda', 'salto'].includes(H.fx) && u.st.armaTipo !== 'arco') || H.esp === 'robar_oro' || H.esp === 'robar_obj';
    const proyectil = H.fx === 'flecha' || H.fx === 'piedra' || H.fx === 'onda' || (acc.tipo === 'atacar' && u.st.armaTipo === 'arco') || (H.obj && H.uso.danio);
    if (H.fx === 'salto') await animSalto(u, cx, cy);
    else if (melee) await animEmbestida(u, cx, cy);
    else if (proyectil) await animProyectil(u, cx, cy, H.fx === 'piedra' ? 'piedra' : H.fx === 'onda' ? 'onda' : H.obj ? 'bomba' : 'flecha');
    else await animConjuro(u, H);
    // Efecto visual sobre el área
    const fxNombre = H.fx === 'ataque' ? (u.st.armaEl || 'corte') : H.fx;
    if (!['flecha', 'piedra'].includes(fxNombre)) efecto(fxNombre, area.length ? area : [[cx, cy]]);
    sonidoDe(fxNombre, H);
    if (H.fx !== 'salto' && !melee) await esperar(260);

    let maxNv = 0, mato = false, huboEfecto = false;
    for (const t of objetivos) {
      maxNv = Math.max(maxNv, t.u.nivel);
      const r = await resolver(u, H, acc, t);
      if (r.efecto) huboEfecto = true;
      if (r.mato) mato = true;
    }
    if (!objetivos.length) popup({ x:cx, y:cy, rx:cx, ry:cy, rh:alt(cx, cy), off:{ x:0, y:0, z:0 } }, 'Nada', '#ccc');
    await esperar(300);
    // Contraataque y cascabel
    for (const t of objetivos) {
      if (t.ko || u.ko || H.tipo !== 'fis' || t.eq === u.eq || dist(u.x, u.y, t.x, t.y) !== 1) continue;
      const m = t.mascota;
      if (m && MASCOTAS[m.id].accion === 'cascabel' && Math.random() * 100 < MASCOTAS[m.id].prob + m.nivel * 2 && !u.st.inmune.has('aturdido')) {
        Sonido.fx('mascota'); await mostrarBanner(`${m.nombre}: ¡cascabel!`, 600, true);
        u.est.aturdido = 1; popup(u, 'Aturdido', '#ffd84a');
      }
      const pc = (t.st.pasiva === 'contra' ? 50 : 0) + [0, 20, 35, 50][Math.min(3, t.st.efectos.contra || 0)];
      if (pc && !t.est.dormido && !t.est.detenido && Math.random() * 100 < pc && t.st.rango[0] <= 1) {
        await mostrarBanner(`${t.nombre}: ¡Contraataque!`, 600, true);
        mirarHacia(t, u.x, u.y);
        await animEmbestida(t, u.x, u.y);
        await resolver(t, datosAccion(t, { tipo:'atacar' }), { tipo:'atacar' }, u, true);
        await esperar(250);
      }
    }
    // Experiencia
    if (u.eq === 'A' && !u.ko) recompensar(u, maxNv || u.u.nivel, mato, huboEfecto || acc.tipo === 'obj');
    chequearFin();
  }
  function sonidoDe(fx, H) {
    const mapa = { corte:'corte', golpe:'golpe', ataque:'corte', mordida:'mordida', flecha:'flecha', piedra:'piedra', fuego:'fuego', hielo:'hielo', rayo:'rayo', luz:'luz', sonido:'sonido', cura:'cura', brillo:'brillo', escudo:'escudo', sueno:'sueno', tiempo:'tiempo', bruma:'bruma', tierra:'tierra', gravedad:'gravedad', onda:'onda', humo:'humo', moneda:'moneda', revivir:'revivir', salto:'golpe' };
    if (fx !== 'flecha' && fx !== 'piedra' && fx !== 'corte' && fx !== 'golpe') Sonido.fx(mapa[fx] || 'golpe');
  }

  async function resolver(u, H, acc, t, esContra = false) {
    const res = { efecto:false, mato:false };
    // Objetos
    if (H.obj) {
      const o = H.uso;
      if (o.revive) { t.ko = false; t.hp = Math.round(t.st.hpMax * o.revive); t.alpha = 1; popup(t, 'Revive', '#ffe680'); chispas(t, '#ffe680', 14); }
      if (o.cura) { const c = Math.min(o.cura, t.st.hpMax - t.hp); t.hp += c; popup(t, c, '#6f9'); }
      if (o.mp) { t.mp = Math.min(t.st.mpMax, t.mp + o.mp); popup(t, o.mp + ' MP', '#8cf'); }
      if (o.limpia) { quitarMalos(t); popup(t, 'Limpio', '#cfe'); }
      if (o.danio) { const d = Math.round(o.danio * mElem(t, o.el) * azar(0.92, 1.08)); popup(t, d, '#fff'); res.mato = await aplicarDanio(u, t, d); }
      res.efecto = true;
      return res;
    }
    if (H.tipo === 'fis') {
      const golpes = H.golpes || 1;
      for (let g = 0; g < golpes && !t.ko; g++) {
        const r = calcFisico(u, t, H);
        if (Math.random() * 100 >= r.prob) { popup(t, 'Falla', '#ccc'); Sonido.fx('fallo'); animEsquive(t, u); await esperar(200); continue; }
        const vari = u.st.armaTipo === 'hacha' && !H.sinArma ? azar(0.75, 1.25) : azar(0.92, 1.08);
        const d = Math.max(1, Math.round(r.d * vari));
        const fuerte = r.ang === 'espalda' || mElem(t, r.el) > 1.2;
        Sonido.fx(fuerte ? 'critico' : H.fx === 'mordida' ? 'mordida' : (u.st.armaTipo === 'maza' || u.st.armaTipo === 'puños' || H.fx === 'golpe') ? 'golpe' : 'corte');
        if (H.fx === 'flecha' || (H.r === 'arma' && u.st.armaTipo === 'arco')) {} // el sonido de flecha ya sonó
        popup(t, d, fuerte ? '#ffe14a' : '#fff', fuerte);
        if (r.ang === 'espalda' && !esContra) popup(t, '¡Espalda!', '#ffb84a', false, -18);
        if (r.el) efecto(r.el, [[t.x, t.y]]);
        golpeVisual(t, u);
        res.efecto = true;
        if (u.st.efectos.vampiro && !u.ko) { const v = Math.round(d * [0, 0.1, 0.2, 0.3][Math.min(3, u.st.efectos.vampiro)]); u.hp = Math.min(u.st.hpMax, u.hp + v); popup(u, v, '#6f9'); }
        if (await aplicarDanio(u, t, d)) { res.mato = true; break; }
        if (u.st.armaVeneno && Math.random() * 100 < u.st.armaVeneno) aplicarEstado(u, t, { id:'veneno', prob:100, dur:4 });
        if (u.st.rasgos.has('aturdir') && Math.random() < 0.15 && !t.st.inmune.has('aturdido')) aplicarEstado(u, t, { id:'aturdido', prob:100, dur:1 });
        if (u.st.rasgos.has('drenar_mp')) u.mp = Math.min(u.st.mpMax, u.mp + Math.round(u.st.mpMax * 0.05));
        if (u.st.armaLento && Math.random() * 100 < u.st.armaLento) aplicarEstado(u, t, { id:'lento', prob:100, dur:2 });
        if (golpes > 1) await esperar(160);
      }
      if (!t.ko && H.est) H.est.forEach(e => { if (Math.random() * 100 < probEstado(u, t, e)) aplicarEstado(u, t, e); });
      return res;
    }
    if (H.tipo === 'mag') {
      const r = calcMagico(u, t, H);
      const d = Math.max(1, Math.round(r.d * azar(0.93, 1.07)));
      const fuerte = mElem(t, r.el) > 1.2;
      popup(t, d, fuerte ? '#ffe14a' : '#fff', fuerte);
      golpeVisual(t, u);
      res.efecto = true;
      res.mato = await aplicarDanio(u, t, d);
      if (!t.ko && H.est) H.est.forEach(e => { if (Math.random() * 100 < probEstado(u, t, e)) aplicarEstado(u, t, e); });
      return res;
    }
    if (H.tipo === 'cura') {
      const c = Math.min(calcCura(u, H), t.st.hpMax - t.hp);
      t.hp += c; popup(t, c, '#6f9'); chispas(t, '#8f8', 8);
      res.efecto = c > 0;
      return res;
    }
    if (H.tipo === 'revivir') {
      if (Math.random() * 100 < (H.prob || 100)) { t.ko = false; t.alpha = 1; t.hp = Math.max(1, Math.round(t.st.hpMax * H.p)); popup(t, 'Revive', '#ffe680'); chispas(t, '#ffe680', 16); res.efecto = true; }
      else popup(t, 'Falla', '#ccc');
      return res;
    }
    if (H.tipo === 'apoyo') {
      let algo = false;
      H.est.forEach(e => { if (Math.random() * 100 < probEstado(u, t, e)) { aplicarEstado(u, t, e); algo = true; } });
      if (!algo) popup(t, 'Falla', '#ccc');
      res.efecto = algo;
      return res;
    }
    // Especiales
    switch (H.esp) {
      case 'primeros': { const c = Math.min(Math.round(t.st.hpMax * 0.3), t.st.hpMax - t.hp); t.hp += c; popup(t, c, '#6f9'); chispas(t, '#8f8', 8); break; }
      case 'meditar': { const m = Math.min(Math.round(12 + t.st.mpMax * 0.1), t.st.mpMax - t.mp); t.mp += m; popup(t, m + ' MP', '#8cf'); break; }
      case 'juramento': { const c = Math.min(Math.round(t.st.hpMax * 0.3), t.st.hpMax - t.hp); t.hp += c; popup(t, c, '#6f9'); aplicarEstado(u, t, { id:'valor', dur:3 }); break; }
      case 'purificar': quitarMalos(t); popup(t, 'Limpio', '#cfe'); break;
      case 'chakra': { const c = Math.min(Math.round(t.st.hpMax * 0.2), t.st.hpMax - t.hp); t.hp += c; t.mp = Math.min(t.st.mpMax, t.mp + Math.round(t.st.mpMax * 0.1)); popup(t, c, '#6f9'); chispas(t, '#8f8', 8); break; }
      case 'gravedad': {
        if (t.jefe) { popup(t, 'Inmune', '#ccc'); break; }
        const d = Math.max(1, Math.round(t.hp * 0.25)); popup(t, d, '#d8a8ff'); res.mato = await aplicarDanio(u, t, d); break;
      }
      case 'robar_oro': case 'robar_obj': {
        const p = estimar(u, { tipo:'hab', id:H === HAB.robar_oro ? 'robar_oro' : 'robar_obj' }, t).prob;
        if (Math.random() * 100 >= p) { popup(t, 'Falla', '#ccc'); break; }
        if (H.esp === 'robar_oro') {
          const n = 20 + t.u.nivel * 12;
          if (u.eq === 'A') { B.ganado.oro += n; popup(t, `+${n} oro`, '#ffd84a'); }
          else { const q = Math.min(G.oro, n); G.oro -= q; popup(t, `-${q} oro`, '#ffd84a'); }
        } else if (u.eq === 'A') {
          const r = Math.random();
          if (r < 0.45) { const m = t.u.nivel >= 6 && Math.random() < 0.35 ? 'plata' : 'hierro'; B.ganado.mat[m] = (B.ganado.mat[m] || 0) + 1; popup(t, MAT[m].n, '#cde'); }
          else if (r < 0.8) { B.ganado.obj.pocion = (B.ganado.obj.pocion || 0) + 1; popup(t, 'Poción', '#cde'); }
          else { const g = elegir(Object.keys(GEMAS)) + '1'; B.ganado.gemas[g] = (B.ganado.gemas[g] || 0) + 1; popup(t, nombreGema(g), GEMAS[gemaInfo(g).id].c); }
        } else {
          const ids = Object.keys(G.obj).filter(k => G.obj[k] > 0);
          if (!ids.length) { popup(t, 'Nada', '#ccc'); break; }
          const k = elegir(ids); G.obj[k]--; if (!G.obj[k]) delete G.obj[k]; popup(t, `-${OBJ[k].n}`, '#cde');
        }
        Sonido.fx('moneda');
        break;
      }
    }
    res.efecto = true;
    return res;
  }
  function aplicarEstado(u, t, e) {
    if (t.st.inmune.has(e.id)) { popup(t, 'Inmune', '#ccc'); return; }
    t.est[e.id] = Math.max(t.est[e.id] || 0, e.dur || 3);
    if (e.id === 'quebrado' || e.id === 'debil') {}
    const E = ESTADOS[e.id];
    popup(t, E.n, E.c, false, -14);
    if (E.malo) Sonido.fx('malo');
  }
  function quitarMalos(t) { for (const k of Object.keys(t.est)) if (ESTADOS[k]?.malo) delete t.est[k]; }

  // Devuelve true si el objetivo cayó.
  async function aplicarDanio(u, t, d, silencioso = false) {
    const pm = t.mascota;
    if (u && u.eq !== t.eq && pm && MASCOTAS[pm.id].accion === 'guardia' && Math.random() * 100 < MASCOTAS[pm.id].prob + pm.nivel * 2) {
      d = Math.max(1, Math.round(d / 2));
      popup(t, `¡${pm.nombre} lo cubre!`, '#ffd8a0', false, -22); Sonido.fx('mascota');
    }
    t.hp = Math.max(0, t.hp - d);
    if (t.est.dormido && d > 0) { delete t.est.dormido; }
    if (t.hp > 0) return false;
    if ((t.st.pasiva === 'revive' || t.st.rasgos.has('fenix')) && !t.revivio) {
      t.revivio = true; t.hp = Math.round(t.st.hpMax * 0.25);
      await esperar(300); popup(t, '¡Última voluntad!', '#ffe680'); chispas(t, '#ffe680', 18); Sonido.fx('revivir');
      return false;
    }
    t.ko = true; t.est = {};
    Sonido.fx('ko');
    await animKO(t);
    if (t.eq === 'E') {
      t.oculto = true;
      soltarBotin(t);
      if (u && u.eq === 'A' && t.defE && t.defE.fenn) {} // Fenn se une después de la batalla
    }
    return true;
  }
  function soltarBotin(t) {
    const nv = t.u.nivel, g = B.ganado;
    const suerte = B.us.some(u => u.eq === 'A' && !u.ko && u.st.mascotaAccion === 'suerte') ? 1.6 : 1;
    const suma = (o, k, n = 1) => o[k] = (o[k] || 0) + n;
    if (Math.random() < 0.35 * suerte) suma(g.mat, 'hierro');
    if (nv >= 6 && Math.random() < 0.14 * suerte) suma(g.mat, 'plata');
    if (t.jefe) suma(g.mat, 'esquirla');
    for (const [k, pr] of Object.entries(CLASES[t.u.clase].botin || {})) { let n = Math.floor(pr); if (Math.random() < (pr - n) * suerte) n++; if (n) suma(g.mat, k, n); }
    if (Math.random() < 0.08 * suerte) suma(g.gemas, elegir(Object.keys(GEMAS)) + '1');
    if (Math.random() < 0.15) suma(g.obj, nv >= 8 ? 'hipocion' : 'pocion');
    if (B.def.patrulla) g.oro += Math.round((30 + nv * 18) * suerte);
    const chance = t.jefe ? 1 : 0.1 * suerte;
    if (Math.random() < chance) {
      const rz = t.u.clase === 'voz' ? 4 : Math.max(t.jefe ? 1 : 0, tirarRareza((t.jefe ? 15 : 0) + (suerte > 1 ? 8 : 0)));
      g.equipo.push({ id:equipoAzar(Math.min(4, 1 + Math.floor(nv / 4))), rareza:rz });
    }
  }
  function recompensar(u, nvObj, mato, efecto) {
    if (!efecto && !mato) return;
    const dif = nvObj - u.u.nivel;
    const exp = clamp(10 + dif * 3, 2, 30) + (mato ? 15 : 0);
    const pc = clamp(10 + dif * 2, 4, 24) + (mato ? 6 : 0);
    const msgs = darExp(u.u, exp, pc);
    popup(u, `+${pc} PC`, '#9df', false, -26);
    msgs.forEach((m, i) => setTimeout(() => {
      if (!B) return;
      popup(u, m.txt, m.t === 'nivel' ? '#ffe14a' : m.t === 'nueva' ? '#ff9af0' : '#9df', true, -30 - i * 4);
      Sonido.fx('nivel'); chispas(u, '#ffe14a', 16);
    }, 500 + i * 650));
    if (msgs.some(m => m.t === 'nivel')) refrescarStats(u);
  }

  // ---------- Turno del jugador ----------
  let finJugador = null;
  function turnoJugador(u) {
    return new Promise(res => {
      finJugador = res;
      B.ui = { modo:'menu' };
      pintarPanel();
    });
  }
  function terminarJugador() { const f = finJugador; finJugador = null; B.ui = { modo:'espera' }; pintarPanel(); f && f(); }

  function alBoton(ev) {
    const b = ev.target.closest('button'); if (!b || b.disabled) return;
    const a = b.dataset.a, u = B.activo;
    if (!u || u.eq !== 'A' || !finJugador) return;
    Sonido.fx(a === 'volver' || a === 'cancelar' ? 'atras' : 'sel');
    switch (a) {
      case 'mover': B.ui = { modo:'mover', alc:alcance(u) }; break;
      case 'atacar': B.ui = { modo:'objetivo', acc:{ tipo:'atacar' } }; B.ui.tiles = tilesObjetivo(u, B.ui.acc); break;
      case 'habs': B.ui = { modo:'habs' }; break;
      case 'objs': B.ui = { modo:'objs' }; break;
      case 'hab': B.ui = { modo:'objetivo', acc:{ tipo:'hab', id:b.dataset.id } }; B.ui.tiles = tilesObjetivo(u, B.ui.acc); autoCentro(u); break;
      case 'obj': B.ui = { modo:'objetivo', acc:{ tipo:'obj', id:b.dataset.id } }; B.ui.tiles = tilesObjetivo(u, B.ui.acc); break;
      case 'esperar': B.ui = { modo:'dir' }; break;
      case 'deshacer': u.x = u.x0; u.y = u.y0; u.rx = u.x; u.ry = u.y; u.rh = alt(u.x, u.y); u.movio = false; B.ui = { modo:'menu' }; break;
      case 'volver': case 'cancelar': B.ui = { modo:'menu' }; break;
      case 'confirmar': confirmarAccion(); return;
      case 'dir': u.dir = +b.dataset.d; terminarJugador(); return;
      case 'listo': terminarJugador(); return;
    }
    pintarPanel();
  }
  // Las habilidades sobre uno mismo se confirman directo.
  function autoCentro(u) {
    const H = datosAccion(u, B.ui.acc);
    const r = rangoDe(u, H);
    if (r[0] === 0 && r[1] === 0) { B.ui.modo = 'confirmar'; B.ui.cx = u.x; B.ui.cy = u.y; B.ui.area = areaDe(H.a || 0, u.x, u.y); }
  }
  async function confirmarAccion() {
    const u = B.activo, ui = B.ui;
    B.ui = { modo:'animando' }; pintarPanel();
    await ejecutar(u, ui.acc, ui.cx, ui.cy);
    if (B.fin || u.ko) { terminarJugador(); return; }
    B.ui = { modo: u.movio ? 'dir' : 'menu' };
    pintarPanel();
  }

  function puntoEnUnidad(px, py, u) {
    const { cx, fy } = pantallaUnidad(u);
    const k = L.k * (CLASES[u.vis.clase]?.tam || 1) * 1.3;
    return px > cx - 8 * k && px < cx + 8 * k && py > fy - 17 * k && py < fy + 1 * k;
  }
  function tileEn(px, py, soloTapa = false) {
    const m = B.mapa;
    for (let y = m.h - 1; y >= 0; y--) for (let x = 0; x < m.w; x++) {
      const t = tile(x, y); if (terreno(t).vacio) continue;
      const sx = L.ox + x * L.TW, sy = L.oy + y * L.TD - t.h * L.HS;
      const abajo = soloTapa ? sy + L.TD : sy + L.TD + t.h * L.HS + L.HS;
      if (px >= sx && px < sx + L.TW && py >= sy && py < abajo) return [x, y];
    }
    return null;
  }
  function alTocar(ev) {
    if (!B) return;
    Sonido.iniciar();
    const r = cv.getBoundingClientRect();
    const px = ev.clientX - r.left, py = ev.clientY - r.top;
    const ui = B.ui, u = B.activo;
    const delante = B.us.filter(v => !v.oculto).sort((a, b) => b.ry - a.ry);
    if (ui.modo === 'mover') {
      const t = tileEn(px, py, true) || tileEn(px, py);
      if (t && ui.alc.destinos.has(t[0] + ',' + t[1])) {
        B.ui = { modo:'animando' }; pintarPanel();
        moverA(u, t[0], t[1], ui.alc).then(() => { B.ui = { modo: u.actuo ? 'dir' : 'menu' }; pintarPanel(); });
      } else { B.ui = { modo:'menu' }; pintarPanel(); Sonido.fx('atras'); }
      return;
    }
    if (ui.modo === 'objetivo' || ui.modo === 'confirmar') {
      const validos = ui.tiles || [];
      const es = (x, y) => validos.some(([a, b]) => a === x && b === y);
      let t = null;
      const un = delante.find(v => es(v.x, v.y) && puntoEnUnidad(px, py, v));
      if (un) t = [un.x, un.y];
      if (!t) { const tt = tileEn(px, py, true) || tileEn(px, py); if (tt && es(tt[0], tt[1])) t = tt; }
      if (!t) { B.ui = { modo:'menu' }; pintarPanel(); Sonido.fx('atras'); return; }
      if (ui.modo === 'confirmar' && ui.cx === t[0] && ui.cy === t[1]) { Sonido.fx('sel'); confirmarAccion(); return; }
      const H = datosAccion(u, ui.acc);
      Object.assign(B.ui, { modo:'confirmar', cx:t[0], cy:t[1], area:areaDe(H.a || 0, t[0], t[1]) });
      Sonido.fx('sel');
      pintarPanel();
      return;
    }
    if (ui.modo === 'dir' && u) {
      const t = tileEn(px, py, true);
      if (t) { const dx = t[0] - u.x, dy = t[1] - u.y; if (dx || dy) { mirarHacia(u, t[0], t[1]); Sonido.fx('sel'); pintarPanel(); } }
      return;
    }
    // Ver información de una unidad
    const un = delante.find(v => puntoEnUnidad(px, py, v));
    const tt = un ? [un.x, un.y] : tileEn(px, py);
    const v = un || (tt && unidadEn(tt[0], tt[1], true));
    if (v && !v.oculto) { B.ui.ver = v; Sonido.fx('pagina'); pintarPanel(); }
    else if (B.ui.ver) { B.ui.ver = null; pintarPanel(); }
  }

  // ---------- Panel ----------
  function barra(v, max, c) { return `<div class="barra"><i style="width:${Math.max(0, 100 * v / max)}%;background:${c}"></i></div>`; }
  function tarjeta(u) {
    if (!u) return '';
    const C = CLASES[u.u.clase];
    const est = Object.keys(u.est).map(k => `<span class="chip" style="background:${ESTADOS[k].c}">${ESTADOS[k].n} ${u.est[k]}</span>`).join('');
    const masc = (u.mascota ? `<span class="chip masc">🐾 ${esc(u.mascota.nombre)} Nv${u.mascota.nivel}</span>` : '') + (u.cargando ? `<span class="chip" style="background:#c9a6ff">✦ Cargando ${esc(HAB[u.cargando.acc.id].n)}</span>` : '');
    const s = u.st;
    return `<div class="tarj ${u.eq === 'A' ? 'al' : 'en'}">
      <div class="tarj-cab"><b>${esc(u.nombre)}</b> <span class="sub">${C.n} · Nv ${u.u.nivel}${u.jefe ? ' · JEFE' : ''}</span></div>
      <div class="tarj-barras"><span>PV ${u.hp}/${s.hpMax}</span>${barra(u.hp, s.hpMax, u.hp / s.hpMax < 0.3 ? '#ff5a5a' : '#5ae07a')}
      <span>PM ${u.mp}/${s.mpMax}</span>${barra(u.mp, s.mpMax, '#5ab0ff')}</div>
      <div class="tarj-st">Atq ${s.atk} · Def ${s.def} · Mag ${s.mag} · Res ${s.res} · Vel ${Math.round(s.spd)} · Mov ${s.mov}${s.armaEl ? ' · ' + ELEMENTOS[s.armaEl].i : ''}${s.debil.length ? ' · Débil: ' + s.debil.map(e => ELEMENTOS[e].i).join('') : ''}</div>
      <div class="tarj-est">${est}${masc}</div></div>`;
  }
  function pintarPanel() {
    if (!B) return;
    const info = $('#bt-info'), menu = $('#bt-menu');
    if (!info) return;
    const u = B.activo, ui = B.ui;
    const mio = u && u.eq === 'A' && finJugador;
    let infoHTML = tarjeta(ui.ver || u);
    let m = '';
    if (!mio || ui.modo === 'animando' || ui.modo === 'espera') {
      m = u && u.eq === 'E' ? `<div class="aviso">Turno de ${esc(u.nombre)}...</div>` : '';
    } else if (ui.modo === 'menu') {
      const tieneObj = Object.keys(G.obj).some(k => G.obj[k] > 0);
      m = `<div class="botones">
        <button data-a="mover" ${u.movio ? 'disabled' : ''}>👣 Mover</button>
        <button data-a="atacar" ${u.actuo ? 'disabled' : ''}>⚔ Atacar</button>
        <button data-a="habs" ${u.actuo ? 'disabled' : ''}>✦ Habilidad</button>
        <button data-a="objs" ${u.actuo || !tieneObj ? 'disabled' : ''}>🎒 Objeto</button>
        ${u.movio && !u.actuo ? '<button data-a="deshacer">↩ Deshacer</button>' : ''}
        <button data-a="esperar" class="sec">⏳ Terminar</button></div>`;
    } else if (ui.modo === 'habs') {
      const hb = habsDeBatalla(u.u);
      const fila = id => {
        const H = HAB[id], falta = u.mp < costoMP(u, H), mudo = u.est.silencio && ['mag', 'cura', 'apoyo', 'revivir'].includes(H.tipo);
        const tarda = H.carga ? ` · ⏳ ${H.carga >= 25 ? 'rápida' : H.carga >= 18 ? 'media' : 'lenta'}` : '';
        return `<button class="hab" data-a="hab" data-id="${id}" ${falta || mudo ? 'disabled' : ''}><b>${esc(H.n)}</b><span>${H.mp ? costoMP(u, H) + ' PM' : ''}</span><small>${esc(H.d)}</small><small class="h-num">${esc(detalleHab(id, u.u))}</small></button>`;
      };
      let lista = '';
      if (hb.principal.length) lista += `<div class="sep">${CLASES[u.u.clase].n}</div>` + hb.principal.map(fila).join('');
      if (hb.secundaria.length) lista += `<div class="sep">${CLASES[u.u.sec].n} (secundaria)</div>` + hb.secundaria.map(fila).join('');
      if (!lista) lista = '<div class="aviso">Todavía no aprendió habilidades. Se aprenden en el menú Grupo con los PC.</div>';
      m = `<div class="lista">${lista}</div><div class="botones"><button data-a="volver" class="sec">← Volver</button></div>`;
    } else if (ui.modo === 'objs') {
      const lista = Object.keys(G.obj).filter(k => G.obj[k] > 0).map(k => `<button class="hab" data-a="obj" data-id="${k}"><b>${esc(OBJ[k].n)}</b><span>x${G.obj[k]}</span><small>${esc(OBJ[k].d)}</small></button>`).join('');
      m = `<div class="lista">${lista}</div><div class="botones"><button data-a="volver" class="sec">← Volver</button></div>`;
    } else if (ui.modo === 'mover') {
      m = `<div class="aviso">Tocá una casilla azul para moverte.</div><div class="botones"><button data-a="volver" class="sec">← Volver</button></div>`;
    } else if (ui.modo === 'objetivo') {
      m = `<div class="aviso">Elegí el objetivo (casillas rojas).</div><div class="botones"><button data-a="volver" class="sec">← Volver</button></div>`;
    } else if (ui.modo === 'confirmar') {
      const H = datosAccion(u, ui.acc);
      const ts = afectados(u, H, ui.area);
      const prev = ts.slice(0, 3).map(t => {
        const e = estimar(u, ui.acc, t);
        let txt = '';
        if (e.tipo === 'danio') txt = `${e.golpes > 1 ? e.golpes + '× ' : ''}${e.d} daño · ${e.prob}%${e.ang === 'espalda' ? ' · espalda' : e.ang === 'lado' ? ' · costado' : ''}`;
        else if (e.tipo === 'cura') txt = `+${e.d} PV`;
        else if (e.tipo === 'revive') txt = `revive · ${e.prob}%`;
        else if (e.tipo === 'estado') txt = `${H.est.map(x => ESTADOS[x.id].n).join(', ')} · ${e.prob}%`;
        else if (e.tipo === 'robo') txt = `robar · ${e.prob}%`;
        else if (e.tipo === 'mp') txt = `+${e.d} PM`;
        else txt = H.n;
        return `<div class="prev"><b>${esc(t.nombre)}</b> ${t.hp}/${t.st.hpMax} → ${txt}</div>`;
      }).join('') + (ts.length > 3 ? `<div class="prev">y ${ts.length - 3} más</div>` : '');
      const aviso = H.carga ? `<div class="prev carga-aviso">⏳ Tarda en salir (${H.carga >= 25 ? 'rápido' : H.carga >= 18 ? 'medio' : 'lento'}): si se mueven, pueden esquivarlo.</div>` : '';
      m = `<div class="previa"><div class="prev-tit">${esc(H.n)}</div>${prev || '<div class="prev">No hay a quién afectar ahí.</div>'}${aviso}</div>
        <div class="botones"><button data-a="confirmar" class="ok">✔ Confirmar</button><button data-a="cancelar" class="sec">✖ Volver</button></div>`;
    } else if (ui.modo === 'dir') {
      m = `<div class="aviso">¿Hacia dónde mira? (la espalda es el punto débil)</div>
        <div class="cruz"><button data-a="dir" data-d="2">▲</button><button data-a="dir" data-d="3">◀</button><button data-a="listo" class="ok">✔</button><button data-a="dir" data-d="1">▶</button><button data-a="dir" data-d="0">▼</button></div>`;
    }
    info.innerHTML = infoHTML;
    menu.innerHTML = m;
    ICO.iconizar(info); ICO.iconizar(menu);
  }

  function menuPausa() {
    if (!B) return;
    Sonido.fx('sel');
    const d = document.createElement('div');
    d.className = 'modal';
    d.innerHTML = `<div class="ventana"><h3>Pausa</h3>
      <button data-p="musica">${Sonido.musicaOn ? '🔊 Música: sí' : '🔇 Música: no'}</button>
      <button data-p="fx">${Sonido.fxOn ? '🔔 Efectos: sí' : '🔕 Efectos: no'}</button>
      <button data-p="rendirse" class="peligro">🏳 Retirarse (se pierde la batalla)</button>
      <button data-p="cerrar" class="ok">Seguir peleando</button></div>`;
    ICO.iconizar(d);
    document.body.appendChild(d);
    d.addEventListener('click', e => {
      const p = e.target.closest('button')?.dataset.p; if (!p) return;
      if (p === 'musica') { Sonido.setMusica(!Sonido.musicaOn); e.target.textContent = Sonido.musicaOn ? '🔊 Música: sí' : '🔇 Música: no'; }
      if (p === 'fx') { Sonido.setFx(!Sonido.fxOn); e.target.textContent = Sonido.fxOn ? '🔔 Efectos: sí' : '🔕 Efectos: no'; }
      if (p === 'rendirse') { d.remove(); if (B && !B.fin) { B.fin = 'derrota'; if (finJugador) terminarJugador(); } }
      if (p === 'cerrar') d.remove();
    });
  }

  // ---------- IA ----------
  async function turnoIA(u) {
    pintarPanel();
    await esperar(180);
    const plan = planear(u);
    if (plan.mover && (plan.mover[0] !== u.x || plan.mover[1] !== u.y)) { await moverA(u, plan.mover[0], plan.mover[1], plan.alc); await esperar(150); }
    if (plan.acc && !B.fin) {
      B.ui = { modo:'iaObjetivo', area:areaDe(datosAccion(u, plan.acc).a || 0, plan.cx, plan.cy) };
      await esperar(260);
      await ejecutar(u, plan.acc, plan.cx, plan.cy);
      B.ui = { modo:'espera' };
    }
    if (!u.ko) {
      const obj = vivos(rival(u)).sort((a, b) => dist(a.x, a.y, u.x, u.y) - dist(b.x, b.y, u.x, u.y))[0];
      if (obj) mirarHacia(u, obj.x, obj.y);
    }
    await esperar(200);
  }
  function accionesIA(u) {
    const lista = [{ tipo:'atacar' }];
    const propias = u.eq === 'A' ? (() => { const h = habsDeBatalla(u.u); return h.principal.concat(h.secundaria); })() : (u.u.habsE || []);
    propias.forEach(id => {
      const H = HAB[id];
      if (costoMP(u, H) > u.mp) return;
      if (u.est.silencio && ['mag', 'cura', 'apoyo', 'revivir'].includes(H.tipo)) return;
      lista.push({ tipo:'hab', id });
    });
    return lista;
  }
  function valorAccion(u, acc, H, objetivos, ax, ay) {
    let v = 0;
    for (const t of objetivos) {
      const e = estimar(u, acc, t, ax, ay);
      if (e.tipo === 'danio') {
        const d = e.d * (e.golpes || 1);
        v += Math.min(d, t.hp) / t.st.hpMax * 100 * (e.prob / 100);
        if (d >= t.hp) v += 60 * (e.prob / 100);
        if (t.u.unico === 'lior') v += 5;
      } else if (e.tipo === 'cura') {
        const falta = t.st.hpMax - t.hp;
        if (falta / t.st.hpMax > 0.3) v += Math.min(e.d, falta) / t.st.hpMax * 110;
      } else if (e.tipo === 'revive') v += 120;
      else if (e.tipo === 'estado') {
        const nuevos = H.est.filter(x => !t.est[x.id]);
        if (!nuevos.length) continue;
        const fuerte = nuevos.some(x => ['dormido', 'detenido', 'aturdido', 'silencio'].includes(x.id));
        v += (t.eq === u.eq ? 14 : (fuerte ? 34 : 20)) * e.prob / 100;
      } else if (e.tipo === 'robo') v += 10 * e.prob / 100;
      else if (H.esp === 'purificar') v += Object.keys(t.est).some(k => ESTADOS[k].malo) ? 22 : 0;
      else if (H.esp === 'chakra') v += (t.st.hpMax - t.hp) / t.st.hpMax > 0.3 ? 30 : 0;
    }
    if (H.carga) v *= H.carga >= 25 ? 0.85 : 0.7; // pueden moverse antes de que salga
    if (H.esp === 'primeros' || H.esp === 'juramento') v += u.hp / u.st.hpMax < 0.5 ? 35 : 0;
    if (H.esp === 'meditar') v += u.mp / u.st.mpMax < 0.35 ? 22 : 0;
    v -= (H.mp || 0) * 0.25;
    return v;
  }
  function planear(u) {
    const alc = u.movio ? { destinos:new Map(), padre:new Map(), key:(x, y) => x + ',' + y } : alcance(u);
    const posiciones = [[u.x, u.y], ...alc.destinos.values()];
    const acciones = u.actuo ? [] : accionesIA(u);
    let mejor = { v:4 };
    const enemigos = vivos(rival(u));
    for (const [px, py] of posiciones) {
      // Riesgo: arqueros y magos prefieren no quedar pegados al enemigo.
      const cerca = enemigos.filter(e => dist(e.x, e.y, px, py) === 1).length;
      const fragil = u.st.rango[1] > 1 || ['hechicero', 'clerigo', 'novicio', 'cronomante'].includes(u.u.clase);
      for (const acc of acciones) {
        const H = datosAccion(u, acc);
        const ox = u.x, oy = u.y; u.x = px; u.y = py; // simular desde esa posición
        const centros = tilesObjetivo(u, acc, px, py);
        for (const [cx, cy] of centros) {
          const area = areaDe(H.a || 0, cx, cy);
          const objs = afectados(u, H, area);
          const sinObj = ['primeros', 'meditar', 'juramento'].includes(H.esp);
          if (!objs.length && !sinObj) continue;
          let v = valorAccion(u, acc, H, objs, px, py);
          if (fragil) v -= cerca * 8;
          v -= (px !== ox || py !== oy) ? 0.5 : 0;
          v += Math.random() * 3;
          if (v > mejor.v) mejor = { v, mover:[px, py], acc, cx, cy };
        }
        u.x = ox; u.y = oy;
      }
    }
    if (mejor.acc) return Object.assign(mejor, { alc });
    // Sin nada útil: acercarse al rival más cercano (por camino real).
    const distancias = mapaDistancias(u, enemigos);
    let dest = [u.x, u.y], dmin = distancias.get(u.x + ',' + u.y) ?? 999;
    for (const [px, py] of alc.destinos.values()) {
      let d = distancias.get(px + ',' + py) ?? 999;
      const fragil = u.st.rango[1] > 1;
      if (fragil && enemigos.some(e => dist(e.x, e.y, px, py) <= 1)) d += 3;
      if (d < dmin) { dmin = d; dest = [px, py]; }
    }
    return { mover:dest, alc };
  }
  function mapaDistancias(u, objetivos) {
    const d = new Map(), cola = [];
    objetivos.forEach(o => { d.set(o.x + ',' + o.y, 0); cola.push([o.x, o.y]); });
    while (cola.length) {
      const [x, y] = cola.shift(), c = d.get(x + ',' + y);
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy, t = tile(nx, ny);
        if (!t) continue;
        const tr = terreno(t);
        if (!u.st.vuela && (!tr.pasa || tr.vacio)) continue;
        if (!u.st.vuela && Math.abs(t.h - alt(x, y)) > u.st.salto + 1) continue;
        const k = nx + ',' + ny;
        if (d.has(k)) continue;
        d.set(k, c + (tr.costo || 1));
        cola.push([nx, ny]);
      }
    }
    return d;
  }

  // ---------- Fin ----------
  async function terminar() {
    const gano = B.fin === 'victoria';
    B.ui = { modo:'espera' }; pintarPanel();
    await esperar(400);
    Sonido.musica(gano ? 'victoria' : 'derrota');
    await mostrarBanner(gano ? '¡Victoria!' : 'Derrota...', 1800);
    const resultado = { gano, ganado:B.ganado, participantes:B.us.filter(u => u.eq === 'A').map(u => ({ id:u.u.id, ko:u.ko })) };
    const onFin = B.onFin;
    salir();
    onFin(resultado);
  }

  // ---------- Animaciones ----------
  async function animEmbestida(u, x, y) {
    const dx = (x - u.x), dy = (y - u.y), n = Math.hypot(dx, dy) || 1;
    await tween(110, p => { u.off.x = dx / n * 0.35 * L.TW * p; u.off.y = dy / n * 0.35 * L.TD * p; });
    await tween(130, p => { u.off.x = dx / n * 0.35 * L.TW * (1 - p); u.off.y = dy / n * 0.35 * L.TD * (1 - p); });
    u.off.x = 0; u.off.y = 0;
  }
  async function animSalto(u, x, y) {
    Sonido.fx('salto');
    await tween(260, p => { u.off.z = -p * L.TW * 6; u.alpha = 1 - p * 0.5; });
    const x0 = u.rx, y0 = u.ry;
    u.rx = x; u.ry = y; u.rh = alt(x, y);
    await tween(200, p => { u.off.z = -(1 - p) * L.TW * 6; u.alpha = 0.5 + p * 0.5; });
    shake = 8;
    u.rx = x0; u.ry = y0; u.rh = alt(u.x, u.y); u.off.z = 0; u.alpha = 1;
    await esperar(60);
  }
  async function animConjuro(u, H) {
    const col = H.el ? ELEMENTOS[H.el].c : H.tipo === 'cura' || H.tipo === 'revivir' ? '#8f8' : H.fx === 'bruma' ? '#b8f' : '#fff6a0';
    u.flash = 1;
    for (let i = 0; i < 3; i++) { anillo(u, col); await esperar(110); }
    chispas(u, col, 10);
    u.flash = 0;
  }
  async function animProyectil(u, x, y, tipo) {
    const a = centroPx(u.x, u.y, alt(u.x, u.y)), b = centroPx(x, y, alt(x, y));
    if (tipo === 'flecha') Sonido.fx('flecha'); else if (tipo === 'piedra') Sonido.fx('piedra'); else if (tipo === 'onda') Sonido.fx('onda');
    const p = { tipo:'proy', x:a.x, y:a.y - L.TW * 0.5, sub:tipo, vida:1, ang:0 };
    parts.push(p);
    const arco = tipo === 'onda' ? 0 : L.TW * (1 + dist(u.x, u.y, x, y) * 0.25);
    let px = p.x, py = p.y;
    await tween(260 + dist(u.x, u.y, x, y) * 40, q => {
      const nx = a.x + (b.x - a.x) * q, ny = (a.y - L.TW * 0.5) + (b.y - a.y) * q - Math.sin(q * Math.PI) * arco;
      p.ang = Math.atan2(ny - py, nx - px); px = nx; py = ny; p.x = nx; p.y = ny;
    });
    p.vida = 0;
  }
  function animEsquive(t, u) {
    const dx = t.x - u.x, dy = t.y - u.y, n = Math.hypot(dx, dy) || 1;
    tween(120, p => { t.off.x = dx / n * 0.3 * L.TW * Math.sin(p * Math.PI); t.off.y = dy / n * 0.3 * L.TD * Math.sin(p * Math.PI); }).then(() => { t.off.x = 0; t.off.y = 0; });
  }
  function golpeVisual(t, u) {
    t.flash = 1;
    t.dolor = performance.now() + 500;
    shake = Math.max(shake, 4);
    const dx = t.x - u.x, dy = t.y - u.y, n = Math.hypot(dx, dy) || 1;
    tween(220, p => { t.off.x = dx / n * 0.15 * L.TW * Math.sin(p * Math.PI); t.off.y = dy / n * 0.15 * L.TD * Math.sin(p * Math.PI); t.flash = 1 - p; })
      .then(() => { t.off.x = 0; t.off.y = 0; t.flash = 0; });
  }
  async function animKO(t) {
    for (let i = 0; i < 4; i++) { t.flash = 1; await esperar(70); t.flash = 0; await esperar(70); }
    if (t.eq === 'E') { humo(t); await tween(350, p => { t.alpha = 1 - p; t.off.z = -p * L.TW * 0.3; }); }
  }

  // ---------- Partículas y efectos ----------
  function centroPx(x, y, h) { return { x:L.ox + (x + 0.5) * L.TW, y:L.oy + y * L.TD - h * L.HS + L.TD / 2 }; }
  function pantallaUnidad(u) {
    const cx = L.ox + (u.rx + 0.5) * L.TW + u.off.x;
    const fy = L.oy + u.ry * L.TD - u.rh * L.HS + L.TD * 0.62 + u.off.y + u.off.z;
    return { cx, fy };
  }
  function popup(u, txt, color, grande = false, dy = 0) {
    const { cx, fy } = pantallaUnidad(u.rx !== undefined ? u : u);
    popups.push({ txt:String(txt), x:cx, y:fy - L.TW * 1.1 + dy, t0:performance.now(), color, grande });
  }
  function chispas(u, color, n) {
    const { cx, fy } = pantallaUnidad(u);
    for (let i = 0; i < n; i++) parts.push({ tipo:'cuad', x:cx + azar(-L.TW * 0.4, L.TW * 0.4), y:fy - azar(0, L.TW), vx:azar(-0.3, 0.3), vy:azar(-1.6, -0.6), vida:1, dec:azar(0.015, 0.03), c:color, s:azar(1.5, 3) * L.k / 2.5, g:0 });
  }
  function anillo(u, color) {
    const { cx, fy } = pantallaUnidad(u);
    parts.push({ tipo:'anillo', x:cx, y:fy - 4, r:4, vr:2.2 * L.k / 2.5, vida:1, dec:0.035, c:color });
  }
  function humo(u) {
    const { cx, fy } = pantallaUnidad(u);
    for (let i = 0; i < 10; i++) parts.push({ tipo:'bola', x:cx + azar(-10, 10), y:fy - azar(0, 20), vx:azar(-0.5, 0.5), vy:azar(-0.8, -0.2), vida:1, dec:0.02, c:'rgba(200,200,215,', s:azar(5, 10) * L.k / 2.5 });
  }
  function efecto(tipo, tiles) {
    tiles.forEach(([x, y]) => {
      const c = centroPx(x, y, alt(x, y)), k = L.k / 2.5;
      const add = o => parts.push(Object.assign({ vida:1, dec:0.025, g:0, vx:0, vy:0 }, o));
      switch (tipo) {
        case 'corte': add({ tipo:'tajo', x:c.x, y:c.y - L.TW * 0.6, dec:0.06, c:'#fff' }); break;
        case 'golpe': case 'mordida': add({ tipo:'estrella', x:c.x, y:c.y - L.TW * 0.55, dec:0.06, c:'#fff6c0', s:L.TW * 0.5 }); break;
        case 'fuego': for (let i = 0; i < 12; i++) add({ tipo:'cuad', x:c.x + azar(-L.TW * 0.4, L.TW * 0.4), y:c.y - azar(0, 6), vx:azar(-0.3, 0.3), vy:azar(-2.2, -0.8), dec:azar(0.02, 0.04), c:elegir(['#ff4a1a', '#ff9a2a', '#ffe14a']), s:azar(2, 4) * k }); add({ tipo:'flash', x:c.x, y:c.y, c:'rgba(255,140,40,', s:L.TW * 0.8, dec:0.05 }); break;
        case 'hielo': for (let i = 0; i < 8; i++) add({ tipo:'cuad', x:c.x + azar(-L.TW * 0.4, L.TW * 0.4), y:c.y - L.TW * 1.4, vx:0, vy:azar(1.5, 2.5), g:0.05, dec:0.03, c:elegir(['#bff', '#7df', '#fff']), s:azar(2, 3.5) * k }); add({ tipo:'flash', x:c.x, y:c.y, c:'rgba(150,230,255,', s:L.TW * 0.8, dec:0.05 }); break;
        case 'rayo': add({ tipo:'rayo', x:c.x, y:c.y - L.TW * 0.5, dec:0.06 }); add({ tipo:'flash', x:c.x, y:c.y, c:'rgba(255,240,120,', s:L.TW, dec:0.06 }); shake = Math.max(shake, 6); break;
        case 'luz': add({ tipo:'pilar', x:c.x, y:c.y, c:'255,245,190', dec:0.03 }); for (let i = 0; i < 6; i++) add({ tipo:'cuad', x:c.x + azar(-L.TW * 0.3, L.TW * 0.3), y:c.y - azar(0, L.TW), vy:-1.2, dec:0.03, c:'#fff8c0', s:2 * k }); break;
        case 'sonido': for (let i = 0; i < 3; i++) add({ tipo:'anillo', x:c.x, y:c.y - L.TW * 0.3, r:2 + i * 6, vr:1.6 * k, dec:0.03, c:'#c9a6ff' }); add({ tipo:'nota', x:c.x, y:c.y - L.TW * 0.8, vy:-0.8, dec:0.02, c:'#e8d8ff' }); break;
        case 'cura': case 'revivir': for (let i = 0; i < 8; i++) add({ tipo:i % 3 ? 'cuad' : 'mas', x:c.x + azar(-L.TW * 0.4, L.TW * 0.4), y:c.y - azar(0, 10), vy:azar(-1.4, -0.6), dec:0.022, c:tipo === 'cura' ? '#8f8' : '#ffe680', s:2.5 * k }); if (tipo === 'revivir') add({ tipo:'pilar', x:c.x, y:c.y, c:'255,240,160', dec:0.025 }); break;
        case 'brillo': for (let i = 0; i < 8; i++) add({ tipo:'cuad', x:c.x + azar(-L.TW * 0.4, L.TW * 0.4), y:c.y - azar(0, L.TW), vy:azar(-1, -0.3), dec:0.025, c:'#ffe680', s:2 * k }); break;
        case 'escudo': add({ tipo:'escudo', x:c.x, y:c.y - L.TW * 0.45, dec:0.025, c:'#ffd88a' }); break;
        case 'sueno': for (let i = 0; i < 3; i++) add({ tipo:'texto', txt:'z', x:c.x + i * 6, y:c.y - L.TW * 0.6 - i * 6, vy:-0.5, dec:0.02, c:'#cfd8ff' }); break;
        case 'tiempo': add({ tipo:'reloj', x:c.x, y:c.y - L.TW * 0.4, dec:0.025, c:'#d8d0f0' }); break;
        case 'bruma': for (let i = 0; i < 6; i++) add({ tipo:'bola', x:c.x + azar(-L.TW * 0.4, L.TW * 0.4), y:c.y - azar(0, 14), vx:azar(-0.4, 0.4), vy:azar(-0.6, -0.1), dec:0.018, c:'rgba(180,140,230,', s:azar(5, 9) * k }); break;
        case 'tierra': for (let i = 0; i < 8; i++) add({ tipo:'cuad', x:c.x + azar(-L.TW * 0.3, L.TW * 0.3), y:c.y, vx:azar(-1, 1), vy:azar(-3, -1.5), g:0.15, dec:0.025, c:elegir(['#8a6a44', '#b08a5a', '#6a4a2e']), s:azar(2.5, 4) * k }); shake = Math.max(shake, 7); break;
        case 'gravedad': add({ tipo:'anillo', x:c.x, y:c.y - 6, r:L.TW * 0.8, vr:-1.2 * k, dec:0.03, c:'#9a6aff' }); break;
        case 'humo': for (let i = 0; i < 6; i++) add({ tipo:'bola', x:c.x + azar(-12, 12), y:c.y - azar(0, 12), vx:azar(-0.4, 0.4), vy:azar(-0.5, -0.1), dec:0.015, c:'rgba(160,160,170,', s:azar(6, 10) * k }); break;
        case 'moneda': for (let i = 0; i < 5; i++) add({ tipo:'cuad', x:c.x, y:c.y - 20, vx:azar(-1.2, 1.2), vy:azar(-3, -2), g:0.15, dec:0.02, c:'#ffd84a', s:3 * k }); break;
        case 'onda': add({ tipo:'anillo', x:c.x, y:c.y - 10, r:4, vr:2 * k, dec:0.05, c:'#fff' }); break;
      }
    });
  }
  function iniciarAmbiente() {
    amb = [];
    const tipo = AMBIENTE[B.def.mapa];
    const n = tipo === 'nieve' ? 50 : tipo === 'bruma' ? 14 : 22;
    for (let i = 0; i < n; i++) amb.push({ x:Math.random(), y:Math.random(), v:azar(0.3, 1), f:Math.random() * 6, tipo });
  }

  // ---------- Dibujo ----------
  function cuadro(t) {
    raf = requestAnimationFrame(cuadro);
    if (!B || !ctx) return;
    dibujar(t);
  }
  function dibujar(t) {
    const m = B.mapa;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    // Fondo con degradé
    const gr = ctx.createLinearGradient(0, 0, 0, L.H);
    gr.addColorStop(0, SPR.oscurecer(FONDOS[m.nombre] || '#1c2a3a', 1.5));
    gr.addColorStop(1, FONDOS[m.nombre] || '#1c2a3a');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, L.W, L.H);
    ctx.save();
    if (shake > 0.3) { ctx.translate(azar(-shake, shake), azar(-shake, shake)); shake *= 0.85; } else shake = 0;

    const ui = B.ui, u = B.activo;
    const marcas = new Map(); // casilla -> color
    B.cargas.forEach(c => areaDe(datosAccion(c.u, c.acc).a || 0, c.cx, c.cy).forEach(([x, y]) => marcas.set(x + ',' + y, c.u.eq === 'A' ? 'rgba(170,130,255,' : 'rgba(255,120,200,')));
    if (ui.modo === 'mover') ui.alc.destinos.forEach(([x, y]) => marcas.set(x + ',' + y, 'rgba(80,160,255,'));
    if (ui.modo === 'objetivo' || ui.modo === 'confirmar') (ui.tiles || []).forEach(([x, y]) => marcas.set(x + ',' + y, 'rgba(255,90,80,'));
    if ((ui.modo === 'confirmar' || ui.modo === 'iaObjetivo') && ui.area) ui.area.forEach(([x, y]) => marcas.set(x + ',' + y, 'rgba(255,220,80,'));
    const pulso = 0.28 + Math.sin(t / 220) * 0.1;

    const porFila = Array.from({ length:m.h }, () => []);
    B.us.forEach(v => { if (!v.oculto || v.alpha > 0.02) porFila[clamp(Math.ceil(v.ry - 0.001), 0, m.h - 1)].push(v); });

    for (let y = 0; y < m.h; y++) {
      for (let x = 0; x < m.w; x++) {
        const c = tile(x, y), tr = terreno(c);
        if (tr.vacio) continue;
        const sx = L.ox + x * L.TW, sy = L.oy + y * L.TD - c.h * L.HS;
        // Lado (de la tapa hasta el piso), con una sombra que oscurece hacia abajo
        const lado = SPR.texturaLado(c.t), altoLado = L.HS * (c.h + 1);
        for (let i = 0; i <= c.h; i++) ctx.drawImage(lado, sx, sy + L.TD + i * L.HS, L.TW + 0.5, L.HS + 0.5);
        const gs = ctx.createLinearGradient(0, sy + L.TD, 0, sy + L.TD + altoLado);
        gs.addColorStop(0, 'rgba(0,0,0,.05)'); gs.addColorStop(1, 'rgba(0,0,0,.45)');
        ctx.fillStyle = gs; ctx.fillRect(sx, sy + L.TD, L.TW + 0.5, altoLado);
        // Tapa
        ctx.drawImage(SPR.texturaTop(c.t, (x * 7 + y * 3) % 2), sx, sy, L.TW + 0.5, L.TD + 0.5);
        if (tr.agua) {
          ctx.fillStyle = `rgba(255,255,255,${0.07 + Math.sin(t / 500 + x * 0.9 + y * 1.7) * 0.06})`; ctx.fillRect(sx, sy, L.TW + 0.5, L.TD + 0.5);
          ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.2; ctx.beginPath();
          const ox2 = ((t / 40 + x * 13) % L.TW);
          ctx.moveTo(sx + ox2 * 0.6, sy + L.TD * 0.4); ctx.quadraticCurveTo(sx + ox2 * 0.6 + 5, sy + L.TD * 0.33, sx + ox2 * 0.6 + 10, sy + L.TD * 0.4); ctx.stroke();
        }
        // Sombras suaves de las casillas más altas que están al lado o atrás
        const hAtras = tile(x, y - 1), hIzq = tile(x - 1, y), hDer = tile(x + 1, y);
        if (hAtras && !terreno(hAtras).vacio && hAtras.h > c.h) { const g2 = ctx.createLinearGradient(0, sy, 0, sy + L.TD * 0.55); g2.addColorStop(0, 'rgba(0,0,0,.38)'); g2.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g2; ctx.fillRect(sx, sy, L.TW + 0.5, L.TD * 0.55); }
        if (hIzq && !terreno(hIzq).vacio && hIzq.h > c.h) { const g2 = ctx.createLinearGradient(sx, 0, sx + L.TW * 0.4, 0); g2.addColorStop(0, 'rgba(0,0,0,.3)'); g2.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g2; ctx.fillRect(sx, sy, L.TW * 0.4, L.TD); }
        if (hDer && !terreno(hDer).vacio && hDer.h > c.h) { const g2 = ctx.createLinearGradient(sx + L.TW, 0, sx + L.TW * 0.6, 0); g2.addColorStop(0, 'rgba(0,0,0,.3)'); g2.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g2; ctx.fillRect(sx + L.TW * 0.6, sy, L.TW * 0.4 + 0.5, L.TD); }
        // Borde iluminado donde la casilla de adelante es más baja, y pasto que cuelga
        const hAdel = tile(x, y + 1);
        if (!hAdel || terreno(hAdel).vacio || hAdel.h < c.h) {
          ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(sx, sy + L.TD - 1.5, L.TW + 0.5, 1.5);
          if (tr.pasto) ctx.drawImage(SPR.flecos(tr.top[0]), sx, sy + L.TD - 1, L.TW + 0.5, L.HS * 0.45);
        }
        const mk = marcas.get(x + ',' + y);
        if (mk) {
          redondo(sx + 2, sy + 2, L.TW - 4, L.TD - 4, 5);
          ctx.fillStyle = mk + pulso + ')'; ctx.fill();
          ctx.strokeStyle = mk + '0.95)'; ctx.lineWidth = 1.6; ctx.stroke();
        }
        if (ui.modo === 'confirmar' && ui.cx === x && ui.cy === y) { redondo(sx + 3, sy + 3, L.TW - 6, L.TD - 6, 5); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke(); }
      }
      // Decoraciones de esta fila
      for (let x = 0; x < m.w; x++) {
        const c = tile(x, y), tr = terreno(c);
        if (!tr.deco) continue;
        const sx = L.ox + x * L.TW, sy = L.oy + y * L.TD - c.h * L.HS;
        const img = SPR.deco(tr.deco);
        ctx.drawImage(img, sx, sy + L.TD * 0.75 - 22 * L.k, 16 * L.k, 22 * L.k);
      }
      // Unidades de esta fila
      porFila[y].sort((a, b) => a.rx - b.rx).forEach(v => dibujarUnidad(v, t, v === u));
    }
    dibujarParticulas();
    dibujarAmbiente(t);
    ctx.restore();
    dibujarPopups(t);
    if (banner) dibujarBanner(t);
  }

  function redondo(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function dibujarUnidad(v, t, activo) {
    const { cx, fy } = pantallaUnidad(v);
    const C = CLASES[v.vis.clase] || {};
    const tam = (C.tam || 1) * 1.3, k = L.k * tam;
    const respira = v.ko ? 0 : Math.round(Math.sin(t / 300 + v.rx * 2) * 0.6) * L.k * 0.5;
    ctx.globalAlpha = v.alpha;
    // Sombra y anillo de equipo
    if (!v.oculto) {
      ctx.save(); ctx.translate(cx, fy - v.off.z); ctx.scale(1, 0.4);
      const gsom = ctx.createRadialGradient(0, 0, 0, 0, 0, 7 * k);
      gsom.addColorStop(0, 'rgba(0,0,0,.45)'); gsom.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gsom; ctx.beginPath(); ctx.arc(0, 0, 7 * k, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.strokeStyle = v.eq === 'A' ? 'rgba(110,190,255,.85)' : 'rgba(255,100,100,.85)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, fy - v.off.z, 6.5 * k, 2.6 * k, 0, 0, Math.PI * 2); ctx.stroke();
      // Flechita de hacia dónde mira
      const [dx, dy] = DIRS[v.dir];
      ctx.fillStyle = v.eq === 'A' ? '#5ab0ff' : '#ff5a5a';
      ctx.beginPath();
      const ax = cx + dx * 7.5 * k, ay = fy - v.off.z + dy * 3 * k;
      ctx.moveTo(ax + dx * 2 * k, ay + dy * 1 * k); ctx.lineTo(ax - dy * 1.6 * k, ay + dx * 0.8 * k); ctx.lineTo(ax + dy * 1.6 * k, ay - dx * 0.8 * k); ctx.fill();
    }
    const humano = !C.spr || C.spr === 'humano';
    const vista = humano && v.dir === 2 ? 'b' : 'f';
    const espejo = humano ? v.dir === 3 : (v.dir === 2 || v.dir === 3);
    const frame = v.caminando ? 1 + Math.floor(t / 120) % 2 : 0;
    // Gestos: parpadea cada tanto, hace mueca al recibir un golpe y cierra los ojos al caer.
    const semilla = (v.id.charCodeAt(0) * 37 + v.id.charCodeAt(1) * 11) % 3000;
    const expr = v.ko ? 'parpadeo' : (v.dolor > t ? 'dolor' : v.cargando ? 'enojo' : ((t + semilla) % 3600) < 140 ? 'parpadeo' : '');
    const img = SPR.personaje(v.vis, vista, frame, expr);
    const w = 20 * k, h = 20 * k;
    ctx.save();
    ctx.translate(cx, fy + respira);
    if (v.ko && v.eq === 'A') { ctx.rotate(-Math.PI / 2); ctx.globalAlpha = 0.75; ctx.translate(-4 * k, 6 * k); }
    if (espejo) ctx.scale(-1, 1);
    const flota = C.vuela ? Math.sin(t / 250 + v.rx) * 2 * L.k - 4 * L.k : 0;
    ctx.drawImage(img, -w / 2, -18.5 * k + flota, w, h);
    if (v.flash > 0.05) {
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = v.flash * 0.8;
      ctx.drawImage(img, -w / 2, -18.5 * k + flota, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
    ctx.globalAlpha = v.alpha;
    // Mascota al lado
    if (v.mascota && !v.ko) {
      const pm = SPR.personaje({ mascota:v.mascota.id }, 'f', Math.floor(t / 260) % 2), kk = L.k * 0.6;
      const salto = Math.abs(Math.sin(t / 220 + v.rx)) * 2 * L.k;
      ctx.save();
      ctx.translate(cx - 8 * L.k * (espejo ? -1 : 1), fy + 1 * L.k - salto);
      if (espejo !== (v.dir === 3)) {} // la mascota mira para el mismo lado que su dueño
      if (v.dir === 3) ctx.scale(-1, 1);
      ctx.drawImage(pm, -10 * kk, -18 * kk, 20 * kk, 20 * kk);
      ctx.restore();
    }
    // Barra de vida
    if (!v.ko && !v.oculto) {
      const bw = 12 * L.k, bx = cx - bw / 2, by = fy + 2.6 * L.k - v.off.z;
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(bx - 1, by - 1, bw + 2, 3.5);
      const p = v.hp / v.st.hpMax;
      ctx.fillStyle = p < 0.3 ? '#ff5a5a' : p < 0.6 ? '#ffd84a' : '#5ae07a'; ctx.fillRect(bx, by, bw * p, 1.5);
      ctx.fillStyle = '#5ab0ff'; ctx.fillRect(bx, by + 1.5, bw * (v.mp / Math.max(1, v.st.mpMax)), 1);
      // Estados como puntitos
      Object.keys(v.est).forEach((e, i) => { ctx.fillStyle = ESTADOS[e].c; ctx.fillRect(cx - 9 * k + i * 4, fy - 19 * k, 3, 3); });
      if (v.est.dormido && Math.floor(t / 500) % 2) { ctx.fillStyle = '#cfd8ff'; ctx.font = `bold ${Math.round(5 * L.k)}px Fredoka, sans-serif`; ctx.fillText('z', cx + 5 * k, fy - 17 * k); }
    }
    // Aura de carga
    if (v.cargando && !v.ko) {
      ctx.save(); ctx.translate(cx, fy - 8 * k); ctx.rotate(t / 300);
      ctx.strokeStyle = 'rgba(200,160,255,.85)'; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, 9 * k, i * 2.1, i * 2.1 + 1.1); ctx.stroke(); }
      ctx.restore();
      if (Math.random() < 0.25) parts.push({ tipo:'cuad', x:cx + azar(-6, 6) * k, y:fy - azar(0, 14) * k, vy:-0.8, vida:1, dec:0.03, c:'#d8c0ff', s:2 });
    }
    // Flecha del activo
    if (activo && !v.ko) {
      const yy = fy - 20 * k - Math.abs(Math.sin(t / 200)) * 3 * L.k;
      ctx.fillStyle = '#ffe14a'; ctx.strokeStyle = '#1a1420'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - 3 * L.k, yy - 3 * L.k); ctx.lineTo(cx + 3 * L.k, yy - 3 * L.k); ctx.lineTo(cx, yy); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function dibujarParticulas() {
    parts = parts.filter(p => p.vida > 0);
    for (const p of parts) {
      p.vida -= p.dec || 0;
      if (p.vx) p.x += p.vx; if (p.vy) p.y += p.vy; if (p.g) p.vy += p.g;
      const a = Math.max(0, p.vida);
      ctx.globalAlpha = a;
      switch (p.tipo) {
        case 'cuad': ctx.fillStyle = p.c; ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); break;
        case 'mas': ctx.fillStyle = p.c; ctx.fillRect(p.x - p.s * 1.5, p.y - p.s / 2, p.s * 3, p.s); ctx.fillRect(p.x - p.s / 2, p.y - p.s * 1.5, p.s, p.s * 3); break;
        case 'bola': ctx.fillStyle = p.c + (a * 0.55) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (1.5 - a * 0.5), 0, Math.PI * 2); ctx.fill(); break;
        case 'anillo': p.r = Math.max(0.5, p.r + p.vr); ctx.strokeStyle = p.c; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * 0.5, 0, 0, Math.PI * 2); ctx.stroke(); break;
        case 'flash': ctx.fillStyle = p.c + (a * 0.6) + ')'; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.s * (1.2 - a * 0.4), p.s * 0.5 * (1.2 - a * 0.4), 0, 0, Math.PI * 2); ctx.fill(); break;
        case 'tajo': {
          ctx.strokeStyle = p.c; ctx.lineWidth = 3 * (a + 0.2);
          ctx.beginPath(); ctx.arc(p.x, p.y, L.TW * 0.45, -Math.PI * 0.9 + (1 - a) * 1.2, -Math.PI * 0.2 + (1 - a) * 1.2); ctx.stroke();
          ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y, L.TW * 0.35, -Math.PI * 0.85 + (1 - a) * 1.2, -Math.PI * 0.25 + (1 - a) * 1.2); ctx.stroke();
          break;
        }
        case 'estrella': {
          ctx.fillStyle = p.c; const s = p.s * (1.3 - a * 0.5);
          ctx.beginPath();
          for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4, r = i % 2 ? s * 0.35 : s; ctx.lineTo(p.x + Math.cos(ang) * r, p.y + Math.sin(ang) * r); }
          ctx.closePath(); ctx.fill(); break;
        }
        case 'rayo': {
          ctx.strokeStyle = '#fff8b0'; ctx.lineWidth = 3; ctx.beginPath();
          let x = p.x + azar(-6, 6), y = p.y - L.TW * 4; ctx.moveTo(x, y);
          while (y < p.y) { y += L.TW * 0.4; x = p.x + azar(-L.TW * 0.25, L.TW * 0.25); ctx.lineTo(x, y); }
          ctx.stroke(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.stroke(); break;
        }
        case 'pilar': {
          const g = ctx.createLinearGradient(0, p.y - L.TW * 4, 0, p.y);
          g.addColorStop(0, `rgba(${p.c},0)`); g.addColorStop(1, `rgba(${p.c},${a * 0.8})`);
          ctx.fillStyle = g; const w = L.TW * 0.7 * (0.6 + a * 0.4); ctx.fillRect(p.x - w / 2, p.y - L.TW * 4, w, L.TW * 4); break;
        }
        case 'escudo': {
          ctx.strokeStyle = p.c; ctx.lineWidth = 2; const r = L.TW * 0.55;
          ctx.beginPath(); for (let i = 0; i < 6; i++) { const ang = i * Math.PI / 3 + (1 - a); ctx.lineTo(p.x + Math.cos(ang) * r, p.y + Math.sin(ang) * r * 0.9); } ctx.closePath(); ctx.stroke();
          ctx.fillStyle = `rgba(255,220,140,${a * 0.2})`; ctx.fill(); break;
        }
        case 'reloj': {
          ctx.strokeStyle = p.c; ctx.lineWidth = 2; const r = L.TW * 0.45;
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
          const ang = (1 - a) * Math.PI * 6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(ang) * r * 0.8, p.y + Math.sin(ang) * r * 0.8); ctx.stroke(); break;
        }
        case 'nota': ctx.fillStyle = p.c; ctx.font = `bold ${Math.round(L.TW * 0.45)}px serif`; ctx.fillText('♪', p.x, p.y); break;
        case 'texto': ctx.fillStyle = p.c; ctx.font = `bold ${Math.round(L.TW * 0.35)}px Fredoka, sans-serif`; ctx.fillText(p.txt, p.x, p.y); break;
        case 'proy': {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.ang);
          if (p.sub === 'flecha') { ctx.fillStyle = '#e8d8b0'; ctx.fillRect(-L.TW * 0.3, -1, L.TW * 0.6, 2); ctx.fillStyle = '#dfe4ec'; ctx.fillRect(L.TW * 0.25, -2, 4, 4); }
          else if (p.sub === 'piedra') { ctx.fillStyle = '#9a9aa2'; ctx.fillRect(-3, -3, 6, 6); }
          else if (p.sub === 'bomba') { ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ff9a2a'; ctx.fillRect(3, -6, 2, 2); }
          else { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 6, -1, 1); ctx.stroke(); }
          ctx.restore(); break;
        }
      }
    }
    ctx.globalAlpha = 1;
  }
  function dibujarAmbiente(t) {
    for (const a of amb) {
      if (a.tipo === 'nieve') {
        a.y += 0.0015 * a.v; a.x += Math.sin(t / 900 + a.f) * 0.0006;
        if (a.y > 1) { a.y = 0; a.x = Math.random(); }
        ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(a.x * L.W, a.y * L.H, 2, 2);
      } else if (a.tipo === 'bruma') {
        a.x += 0.0002 * a.v; if (a.x > 1.2) a.x = -0.2;
        const g = ctx.createRadialGradient(a.x * L.W, a.y * L.H, 0, a.x * L.W, a.y * L.H, L.W * 0.25);
        g.addColorStop(0, 'rgba(220,225,240,.10)'); g.addColorStop(1, 'rgba(220,225,240,0)');
        ctx.fillStyle = g; ctx.fillRect(a.x * L.W - L.W * 0.25, a.y * L.H - L.W * 0.25, L.W * 0.5, L.W * 0.5);
      } else {
        a.y += 0.0008 * a.v; a.x += Math.sin(t / 700 + a.f) * 0.0008;
        if (a.y > 1) { a.y = 0; a.x = Math.random(); }
        ctx.fillStyle = a.tipo === 'ceniza' ? (a.f > 3 ? 'rgba(255,150,80,.7)' : 'rgba(160,160,170,.6)') : a.tipo === 'hojas' ? 'rgba(120,200,90,.8)' : 'rgba(255,255,255,.5)';
        ctx.fillRect(a.x * L.W, a.y * L.H, 2, 2);
      }
    }
  }
  function dibujarPopups(t) {
    popups = popups.filter(p => t - p.t0 < 1100);
    for (const p of popups) {
      const e = (t - p.t0) / 1100;
      const salto = e < 0.2 ? Math.sin(e / 0.2 * Math.PI) * 8 : 0;
      const y = p.y - e * 18 - salto;
      const tam = Math.round((p.grande ? 1.25 : 1) * Math.max(13, L.TW * 0.42));
      ctx.font = `bold ${tam}px Fredoka, sans-serif`;
      ctx.textAlign = 'center';
      ctx.globalAlpha = e > 0.75 ? (1 - e) / 0.25 : 1;
      ctx.lineWidth = 3; ctx.strokeStyle = '#1a1420'; ctx.strokeText(p.txt, p.x, y);
      ctx.fillStyle = p.color; ctx.fillText(p.txt, p.x, y);
      ctx.globalAlpha = 1; ctx.textAlign = 'left';
    }
  }
  function mostrarBanner(txt, ms, chico = false) {
    banner = { txt, t0:performance.now(), ms:ms / vel(), chico };
    return esperar(ms);
  }
  function dibujarBanner(t) {
    const e = (t - banner.t0) / banner.ms;
    if (e > 1) { banner = null; return; }
    const a = e < 0.15 ? e / 0.15 : e > 0.85 ? (1 - e) / 0.15 : 1;
    const h = banner.chico ? 30 : 44, y = banner.chico ? L.H * 0.12 : L.H * 0.4;
    ctx.globalAlpha = a * 0.85;
    const g = ctx.createLinearGradient(0, 0, L.W, 0);
    g.addColorStop(0, 'rgba(20,24,60,0)'); g.addColorStop(0.2, 'rgba(20,24,70,1)'); g.addColorStop(0.8, 'rgba(20,24,70,1)'); g.addColorStop(1, 'rgba(20,24,60,0)');
    ctx.fillStyle = g; ctx.fillRect(0, y - h / 2, L.W, h);
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(L.W * 0.15, y - h / 2, L.W * 0.7, 1); ctx.fillRect(L.W * 0.15, y + h / 2 - 1, L.W * 0.7, 1);
    ctx.globalAlpha = a;
    ctx.font = `bold ${banner.chico ? 15 : 22}px Fredoka, sans-serif`;
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
    const x = L.W / 2 + (1 - a) * 30;
    ctx.strokeText(banner.txt, x, y + (banner.chico ? 5 : 8)); ctx.fillText(banner.txt, x, y + (banner.chico ? 5 : 8));
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  return { iniciar, get activa() { return !!B; }, _dbg: () => ({ B, L, tile, alt }) };
})();

function esc(s) { return String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }
