// El Bosque: el mundo con los jardines de todos los que eligen aparecer.
// Cada jardín tiene el árbol de esa persona en el centro y se decora con lo que fue logrando:
// las láminas del herbario se vuelven plantas, y las rachas y los premios suman adornos.

const URL_BOSQUE = 'https://raiz-avisos.raizapp.workers.dev';
const TAM = 200; // tamaño de un jardín en el dibujo

const Bosque = (() => {
  let jardines = null, cargando = false, error = false, zoom = null, visitando = null, ultimoPublicado = '', espera = null;

  // ---------- Datos ----------

  const azar = n => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => b.toString(16).padStart(2, '0')).join('');

  function miJardin() {
    const nv = nivelDe(E.savia).nivel;
    return {
      id: E.bosque?.id || 'yo', nombre: E.bosque?.nombre || E.nombre, especie: E.especie || 'roble', nivel: nv,
      racha: E.racha, mejor_racha: E.mejorRacha, cumplidas: E.cumplidas, vitalidad: E.vitalidad,
      logros: Object.keys(E.logros || {}), canjes: (E.canjes || []).length, jardin: E.jardin || null, yo: true,
    };
  }

  async function cargar() {
    if (cargando) return;
    cargando = true;
    error = false;
    try {
      const r = await fetch(URL_BOSQUE + '/bosque');
      jardines = (await r.json()).jardines || [];
    } catch {
      error = true;
    } finally {
      cargando = false;
    }
    if (tab === 'bosque') render();
  }

  async function publicar() {
    if (!E.bosque?.activo) return;
    const j = miJardin();
    const datos = { id: E.bosque.id, clave: E.bosque.clave, nombre: j.nombre, especie: j.especie, nivel: j.nivel, racha: j.racha, mejorRacha: j.mejor_racha, cumplidas: j.cumplidas, vitalidad: j.vitalidad, logros: j.logros, canjes: j.canjes, jardin: { fondo: fondoDe(j.jardin).id, lugares: lugaresDe(j.jardin, j.logros) } };
    const firma = JSON.stringify(datos);
    if (firma === ultimoPublicado) return;
    clearTimeout(espera);
    espera = setTimeout(async () => {
      try {
        const r = await fetch(URL_BOSQUE + '/bosque/publicar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: firma });
        if ((await r.json()).ok) ultimoPublicado = firma;
      } catch { /* se reintenta en el próximo cambio */ }
    }, 2000);
  }

  function unirse(nombre) {
    E.bosque = { id: E.bosque?.id || azar(12), clave: E.bosque?.clave || azar(16), activo: true, nombre: nombre || E.nombre };
    guardar();
    ultimoPublicado = '';
    publicar();
    Sonido.nivel();
    toast('Tu jardín ya está en el Bosque 🌳');
    jardines = (jardines || []).filter(j => j.id !== E.bosque.id);
    render();
  }

  async function salir() {
    if (!E.bosque) return;
    if (!confirm('¿Sacar tu jardín del Bosque? Nadie más lo va a ver. Podés volver cuando quieras.')) return;
    const { id, clave } = E.bosque;
    E.bosque.activo = false;
    guardar();
    fetch(URL_BOSQUE + '/bosque/salir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, clave }) }).catch(() => {});
    jardines = (jardines || []).filter(j => j.id !== id);
    render();
    toast('Tu jardín ya no aparece en el Bosque');
  }

  // ---------- Dibujo de un jardín ----------

  function jardinSVG(j, x, y) {
    const vit = j.vitalidad ?? 100;
    const fondo = fondoDe(j.jardin);
    const nv = j.nivel || 1;
    const noche = fondo.id === 'noche';
    let g = `<g class="jardin ${j.yo ? 'mio' : ''}" data-jardin="${esc(j.id)}" transform="translate(${x} ${y})">`;
    const tierra = { noche: 'l-tierra-noche', nieve: 'l-tierra-nieve', arena: 'l-tierra-arena' }[fondo.id] || 'l-tierra';
    // Islita con volumen: sombra en el piso, borde de tierra y el pasto arriba.
    g += `<ellipse cx="100" cy="134" rx="92" ry="64" fill="rgba(31,51,38,.18)" filter="url(#f-suave)"/>`;
    g += `<ellipse cx="100" cy="120" rx="96" ry="74" fill="url(#${tierra})"/>`;
    g += `<path d="M10 118 q8 6 16 3 q10 8 20 4 q12 9 26 5 q14 7 28 4 q14 7 28 3 q12 6 26 1 q10 4 18 -3" stroke="rgba(0,0,0,.18)" stroke-width="2" fill="none"/>`;
    g += `<ellipse cx="100" cy="106" rx="96" ry="74" fill="url(#s-${fondo.id})"/>`;
    g += `<ellipse cx="100" cy="104" rx="93" ry="71" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2"/>`;
    if (vit < 40) g += `<ellipse cx="100" cy="106" rx="96" ry="74" fill="#c9a26a" opacity=".25"/>`;
    // Matas de pasto y florcitas sueltas.
    for (let k = 0; k < 16; k++) {
      const a = k * 2.39996, r = 24 + ((k * 37) % 58);
      const px = 100 + Math.cos(a) * r * 1.15, py = 106 + Math.sin(a) * r * 0.82;
      if (fondo.puntos && k % 2) g += `<circle cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" r="${noche ? 1.2 : 1.8}" fill="${fondo.puntos}" opacity=".85"/>`;
      else if (!noche && fondo.id !== 'nieve') g += `<path d="M${(px - 3).toFixed(0)} ${py.toFixed(0)} l2 -5 l1 5 l2 -6 l1 6" stroke="rgba(47,94,51,.45)" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
    }
    g += `<ellipse cx="100" cy="106" rx="96" ry="74" fill="none" stroke="${j.yo ? '#c9a96e' : 'rgba(47,74,53,.12)'}" stroke-width="${j.yo ? 3 : 1.5}"/>`;
    if (nv >= 10) g += `<ellipse cx="100" cy="106" rx="86" ry="64" fill="none" stroke="#a9845a" stroke-width="1.6" stroke-dasharray="2 5"/>`;
    if ((j.mejor_racha || 0) >= 7) {
      for (const [sx, sy, sr] of [[100, 170, 7], [94, 158, 6], [102, 147, 5.5], [97, 137, 5]]) g += `<ellipse cx="${sx}" cy="${sy}" rx="${sr}" ry="${sr * 0.55}" fill="url(#e-piedra)"/>`;
    }
    g += `<ellipse cx="100" cy="148" rx="34" ry="9" fill="rgba(31,51,38,.2)"/>`;
    // Decoración: lo de atrás primero, el árbol en el medio, lo de adelante al final.
    const lugares = lugaresDe(j.jardin, j.logros);
    const piezas = Object.entries(lugares).map(([i, id]) => {
      const pos = LUGARES_JARDIN[Number(i)];
      if (!pos) return null;
      const [px, py] = pos;
      return { y: py, s: `<ellipse cx="${px.toFixed(1)}" cy="${(py + 1).toFixed(1)}" rx="11" ry="3.6" fill="rgba(31,51,38,.22)"/><svg x="${(px - 15).toFixed(1)}" y="${(py - 28).toFixed(1)}" width="30" height="30" viewBox="0 0 48 48">${itemSVG(id)}</svg>` };
    }).filter(Boolean);
    g += piezas.filter(p => p.y < 110).map(p => p.s).join('');
    g += treeSVG(etapaDe(nv), vit, false, { especie: j.especie, brotes: j.brotes, nuevo: j.nuevo }).replace('<svg class="tree" viewBox="0 0 120 140"', `<svg class="${j.yo ? 'tree' : ''}" x="45" y="22" width="110" height="128" viewBox="0 0 120 140"`).replace(/role="img" aria-label="[^"]*"/, '');
    g += piezas.filter(p => p.y >= 110).map(p => p.s).join('');
    if (!j.sinCartel) g += `<g class="cartel"><rect x="${100 - 60}" y="200" width="120" height="26" rx="13" fill="${j.yo ? '#1f3326' : '#fffdf8'}" stroke="rgba(47,74,53,.15)"/>
      <text x="100" y="217" text-anchor="middle" font-size="12" fill="${j.yo ? '#efe8d8' : '#24382a'}">${esc((j.nombre || '').slice(0, 16))} · nv ${nv}</text></g>`;
    return g + '</g>';
  }

  // ---------- El mundo ----------

  // Ubica los jardines en espiral alrededor del tuyo (o del más alto, si no aparecés).
  function ubicar(lista) {
    const paso = TAM * 1.25;
    return lista.map((j, i) => {
      if (i === 0) return { j, x: 0, y: 0 };
      const a = i * 2.39996;
      const r = paso * Math.sqrt(i) * 1.05;
      return { j, x: Math.cos(a) * r, y: Math.sin(a) * r * 0.85 };
    });
  }

  // ---------- Paisaje del mundo ----------

  // Azar fijo: el mismo número para la misma semilla, así el paisaje no cambia cada vez.
  const fijo = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  const PAISAJE = {
    pino: (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><rect x="-3" y="-4" width="6" height="12" fill="#7a5a3a"/><path d="M0 -46 L18 -6 L-18 -6Z" fill="#3f6e4a"/><path d="M0 -58 L13 -28 L-13 -28Z" fill="#4f8a58"/></g>`,
    redondo: (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><rect x="-3" y="-6" width="6" height="14" fill="#8a6a45"/><circle cx="0" cy="-22" r="18" fill="#5c7a4a"/><circle cx="-6" cy="-27" r="9" fill="#7c9a62"/></g>`,
    arbusto: (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><circle cx="-8" cy="-6" r="9" fill="#5c7a4a"/><circle cx="6" cy="-8" r="11" fill="#6e8f58"/><circle cx="0" cy="-12" r="7" fill="#9db67f"/></g>`,
    rocas: (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><ellipse cx="-6" cy="-4" rx="11" ry="7" fill="#a8a59a"/><ellipse cx="8" cy="-2" rx="7" ry="5" fill="#bdbab0"/></g>`,
    flores: (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><circle cx="-8" cy="-3" r="3" fill="#f3e6c8"/><circle cx="0" cy="-6" r="3" fill="#e9a0b8"/><circle cx="8" cy="-2" r="3" fill="#f2c230"/><circle cx="3" cy="2" r="2.5" fill="#c9bff0"/></g>`,
    hongo: (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><rect x="-2" y="-8" width="4" height="8" fill="#f3e6c8"/><path d="M-8 -7a8 7 0 0 1 16 0z" fill="#d8443a"/></g>`,
  };

  function mundoSVG(lista) {
    const pos = ubicar(lista);
    const centros = pos.map(p => ({ x: p.x + 100, y: p.y + 110 }));
    const xs = pos.map(p => p.x), ys = pos.map(p => p.y);
    // El mundo siempre es al menos así de grande, para que haya paisaje alrededor.
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2 + 100, cy = (Math.min(...ys) + Math.max(...ys)) / 2 + 110;
    const ancho = Math.max(1100, Math.max(...xs) - Math.min(...xs) + 700);
    const alto = Math.max(1000, Math.max(...ys) - Math.min(...ys) + 700);
    const minX = cx - ancho / 2, minY = cy - alto / 2;
    const libre = (x, y, margen) => centros.every(c => Math.hypot((x - c.x) / 1.15, y - c.y) > margen);

    let capa = '';
    // Montañas al norte.
    for (let k = 0; k < Math.ceil(ancho / 140) + 1; k++) {
      const mx = minX + k * 140 - 40 + fijo(k) * 40, h = 120 + fijo(k + 9) * 90, by = minY + 170;
      capa += `<path d="M${mx - 110} ${by} L${mx} ${by - h} L${mx + 110} ${by}Z" fill="${k % 2 ? '#a9b8b0' : '#93a69c'}"/>
        <path d="M${mx - 26} ${by - h + 50} L${mx} ${by - h} L${mx + 26} ${by - h + 50} L${mx + 10} ${by - h + 42} L${mx} ${by - h + 54} L${mx - 12} ${by - h + 42}Z" fill="#f4f6f2"/>`;
    }
    capa += `<rect x="${minX - 2000}" y="${minY + 160}" width="${ancho + 4000}" height="${alto + 2000}" fill="#dfe7cf"/>`;

    // Río que baja desde las montañas por el este, y un lago al sudoeste.
    const rx = cx + ancho * 0.36;
    capa += `<path d="M${rx} ${minY + 150} C${rx - 120} ${minY + alto * 0.3} ${rx + 90} ${minY + alto * 0.55} ${rx - 40} ${minY + alto + 200}" stroke="#8fc0d8" stroke-width="44" fill="none" stroke-linecap="round"/>
      <path d="M${rx} ${minY + 150} C${rx - 120} ${minY + alto * 0.3} ${rx + 90} ${minY + alto * 0.55} ${rx - 40} ${minY + alto + 200}" stroke="#bfe0ee" stroke-width="6" fill="none" stroke-dasharray="14 26" class="corriente"/>`;
    const lx = cx - ancho * 0.33, ly = cy + alto * 0.3;
    capa += `<ellipse cx="${lx}" cy="${ly}" rx="140" ry="70" fill="#8fc0d8"/><ellipse cx="${lx - 30}" cy="${ly - 18}" rx="50" ry="10" fill="#bfe0ee"/>
      <g transform="translate(${lx + 40} ${ly + 10})"><ellipse cx="0" cy="0" rx="10" ry="6" fill="#f6f1e7"/><circle cx="8" cy="-5" r="4" fill="#f6f1e7"/><path d="M11 -5 l4 1 -4 1z" fill="#e2a33a"/></g>
      <g transform="translate(${lx - 60} ${ly + 22})"><ellipse cx="0" cy="0" rx="8" ry="5" fill="#f6f1e7"/><circle cx="6" cy="-4" r="3.5" fill="#f6f1e7"/></g>`;

    // Caminos desde el primer jardín hasta cada uno de los otros.
    centros.slice(1).forEach((c, k) => {
      const a = centros[0];
      capa += `<path d="M${a.x} ${a.y + 70} Q${(a.x + c.x) / 2 + (k % 2 ? 60 : -60)} ${(a.y + c.y) / 2 + 40} ${c.x} ${c.y + 70}" stroke="#e9dcbc" stroke-width="16" fill="none" stroke-linecap="round" opacity=".9"/>`;
    });

    // Árboles silvestres, arbustos, rocas, flores y hongos donde no hay jardines.
    const tipos = ['pino', 'pino', 'redondo', 'redondo', 'arbusto', 'rocas', 'flores', 'flores', 'hongo'];
    const silvestres = [];
    const paso = 78;
    for (let gy = minY + 200; gy < minY + alto; gy += paso) {
      for (let gx = minX + 20; gx < minX + ancho; gx += paso) {
        const n = gx * 0.37 + gy * 0.91;
        if (fijo(n) > 0.42) continue;
        const x = gx + (fijo(n + 1) - 0.5) * 50, y = gy + (fijo(n + 2) - 0.5) * 50;
        if (!libre(x, y, 150)) continue;
        if (Math.abs(x - (rx - 20)) < 60) continue;
        if (Math.hypot((x - lx) / 150, (y - ly) / 80) < 1.1) continue;
        silvestres.push({ x, y, t: tipos[Math.floor(fijo(n + 3) * tipos.length)], k: 0.8 + fijo(n + 4) * 0.6 });
      }
    }
    // Un fogón para juntarse y un cartel de bienvenida.
    const fx = centros[0].x + 230, fy = centros[0].y + 150;
    if (libre(fx, fy, 130)) silvestres.push({ x: fx, y: fy, t: 'fogon', k: 1 });
    silvestres.push({ x: centros[0].x - 140, y: centros[0].y + 120, t: 'cartel', k: 1 });
    silvestres.sort((a, b) => a.y - b.y);
    capa += silvestres.map(d => {
      if (d.t === 'fogon') return `<g transform="translate(${d.x} ${d.y})"><circle r="40" fill="#e9dcbc"/><path d="M-12 6 L12 -2 M-12 -2 L12 6" stroke="#7a5a3a" stroke-width="5" stroke-linecap="round"/><path d="M0 -22 C10 -10 8 2 0 4 C-8 2 -10 -10 0 -22Z" fill="#f2a640" class="fuego"/><path d="M0 -12 C5 -6 4 1 0 2 C-4 1 -5 -6 0 -12Z" fill="#f6d77a"/>
        ${[0, 1, 2, 3].map(q => `<rect x="${Math.cos(q * 1.57 + 0.6) * 30 - 9}" y="${Math.sin(q * 1.57 + 0.6) * 30 - 3}" width="18" height="6" rx="3" fill="#8a6a45"/>`).join('')}</g>`;
      if (d.t === 'cartel') return `<g transform="translate(${d.x} ${d.y})"><rect x="-2" y="-30" width="4" height="34" fill="#7a5a3a"/><rect x="-44" y="-50" width="88" height="24" rx="6" fill="#a9845a"/><text x="0" y="-33" text-anchor="middle" font-size="13" fill="#fff6e6" font-weight="700">El Bosque</text></g>`;
      return PAISAJE[d.t](d.x.toFixed(0), d.y.toFixed(0), d.k.toFixed(2));
    }).join('');

    // Pájaros que cruzan el cielo.
    const pajaros = [0, 1, 2].map(q => `<path class="pajaro p${q}" d="M0 0 q6 -6 12 0 q6 -6 12 0" stroke="#4d5b55" stroke-width="2.4" fill="none" stroke-linecap="round" transform="translate(${minX + 60 + q * 40} ${minY + 60 + q * 22})"/>`).join('');

    return `<svg class="mundo" viewBox="${minX.toFixed(0)} ${minY.toFixed(0)} ${ancho.toFixed(0)} ${alto.toFixed(0)}" role="img" aria-label="El Bosque: jardines de ${lista.length} personas">
      <rect x="${minX - 2000}" y="${minY - 2000}" width="${ancho + 4000}" height="${alto + 4000}" fill="#cfe6f2"/>
      ${capa}
      ${pos.map(p => jardinSVG(p.j, p.x, p.y)).join('')}
      ${pajaros}
    </svg>`;
  }

  // ---------- Pantalla ----------

  function vista() {
    const unido = !!E.bosque?.activo;
    if (!jardines && !cargando && !error) cargar();
    let otros = (jardines || []).filter(j => j.id !== E.bosque?.id);
    const lista = unido ? [miJardin(), ...otros] : otros;

    let h = `<div class="bosque-top"><h1 class="greet" style="margin:0">El Bosque</h1><span class="pill">${(jardines ? otros.length : 0) + (unido ? 1 : 0)} jardines</span></div>
      <p class="muted" style="margin:6px 0 0">El mundo de Raíz: los jardines de todos los que eligen aparecer. Acercate, alejate y tocá un jardín para visitarlo.</p>`;

    if (!unido) {
      h += `<div class="card unirse section">
        <div class="unirse-arte"><svg viewBox="0 0 200 230">${jardinSVG({ ...miJardin(), yo: true }, 0, 0)}</svg></div>
        <div><div class="eyebrow">Tu jardín</div>
          <p class="quote" style="margin:4px 0 6px">Sumá tu jardín al mundo</p>
          <p class="muted" style="font-size:13px;margin:0 0 10px">Se ve tu nombre, tu árbol, tu nivel, tu racha y los adornos que ganaste. Nunca tus misiones.</p>
          <input id="bosque-nombre" class="campo" maxlength="24" value="${esc(E.bosque?.nombre || E.nombre)}" aria-label="Nombre que se muestra">
          <button class="btn primary" data-bosque="unirse" style="margin-top:10px;width:100%">Aparecer en el Bosque</button>
          <button class="btn" data-bosque="decorar" style="margin-top:8px;width:100%">Decorar mi jardín</button></div>
      </div>`;
    }

    if (error) h += `<div class="empty section">No pude cargar el Bosque. Revisá tu conexión. <button class="btn small" data-bosque="recargar">Reintentar</button></div>`;
    else if (!jardines) h += `<div class="empty section">Cargando el mundo…</div>`;
    else if (!lista.length) h += `<div class="empty section">Todavía no hay jardines. ¡Podés ser el primero!</div>`;
    else {
      h += `<div class="mundo-marco section">${mundoSVG(lista)}
        <div class="mundo-botones">
          <button class="btn small" data-bosque="acercar" aria-label="Acercar">+</button>
          <button class="btn small" data-bosque="alejar" aria-label="Alejar">−</button>
          <button class="btn small" data-bosque="mundo">Ver el mundo</button>
          ${unido ? '<button class="btn small" data-bosque="mio">Mi jardín</button>' : ''}
        </div>
      </div>
      <div id="visita"></div>
      <div class="section"><div class="eyebrow"><span>Los árboles más altos</span></div><div class="list">
        ${lista.slice().sort((a, b) => b.nivel - a.nivel).slice(0, 10).map((j, i) => `<button class="item" data-jardin-lista="${esc(j.id)}">
          <span class="puesto">${i + 1}</span><span class="t"><span>${esc(j.nombre)}${j.yo ? ' (vos)' : ''}</span><small>${esc((ESPECIES.find(e => e.id === j.especie) || ESPECIES[0]).nombre)} · racha ${j.racha || 0}</small></span><span class="xp">Nivel ${j.nivel}</span></button>`).join('')}
      </div></div>`;
    }
    if (unido) h += `<button class="btn primary decorar-btn section" data-bosque="decorar">${svgIco(ICONOS.semilla)} Decorar mi jardín</button>`;
    if (unido) h += `<p class="muted" style="text-align:center;font-size:13px;margin-top:20px">Aparecés como <b>${esc(E.bosque.nombre)}</b> · <button class="link" data-bosque="salir">Dejar de aparecer</button></p>`;
    return h;
  }

  // Después de pintar: activa el zoom y arranca mostrando tu jardín (o el mundo).
  function montar() {
    const svg = document.querySelector('svg.mundo');
    if (!svg) return;
    zoom = crearZoom(svg, { min: 0.6, max: 8 });
    const mio = svg.querySelector('.jardin.mio');
    if (mio && !visitando) zoom.irA({ x: -20, y: -20, w: TAM + 40, h: TAM + 60 }, 0);
    if (visitando) mostrarVisita(visitando, false);
  }

  function mostrarVisita(id, mover = true) {
    const lista = E.bosque?.activo ? [miJardin(), ...(jardines || []).filter(j => j.id !== E.bosque.id)] : (jardines || []);
    const j = lista.find(x => x.id === id);
    const caja = document.getElementById('visita');
    if (!j || !caja) return;
    visitando = id;
    const g = document.querySelector(`.jardin[data-jardin="${CSS.escape(id)}"]`);
    if (g && mover) {
      const t = g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);
      zoom?.irA({ x: Number(t[1]) - 20, y: Number(t[2]) - 20, w: TAM + 40, h: TAM + 60 });
    }
    const esp = ESPECIES.find(e => e.id === j.especie) || ESPECIES[0];
    const plantas = (j.logros || []).map(l => LOGROS.find(x => x.id === l)).filter(Boolean);
    caja.innerHTML = `<div class="card visita section">
      <div class="eyebrow">${j.yo ? 'Tu jardín' : 'Estás visitando'}</div>
      <p class="quote" style="margin:4px 0 2px">${j.yo ? 'Tu jardín' : `El jardín de ${esc(j.nombre)}`}</p>
      <div class="muted" style="font-size:14px">${esc(esp.nombre)} · nivel ${j.nivel} · ${esc(ETAPAS[etapaDe(j.nivel)].nombre)}</div>
      <div class="visita-datos"><span>${svgIco(ICONOS.llama)} Racha ${j.racha || 0}</span><span>${svgIco(ICONOS.gota)} ${j.cumplidas || 0} misiones</span><span>${svgIco(ICONOS.semilla)} ${plantas.length} plantas</span></div>
      ${plantas.length ? `<div class="muted" style="font-size:13px;margin-top:8px">En su jardín crecen: ${plantas.map(p => esc(p.planta)).join(', ')}.</div>` : ''}
    </div>`;
    Sonido.tab();
  }

  // ---------- Eventos ----------

  document.addEventListener('click', e => {
    const jardin = e.target.closest('[data-jardin], [data-jardin-lista]');
    if (jardin && tab === 'bosque') {
      const id = jardin.dataset.jardin || jardin.dataset.jardinLista;
      mostrarVisita(id);
      if (jardin.dataset.jardinLista) document.querySelector('.mundo-marco')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const b = e.target.closest('[data-bosque]');
    if (!b) return;
    const a = b.dataset.bosque;
    if (a === 'unirse') {
      const nombre = document.getElementById('bosque-nombre')?.value.trim();
      if (!nombre) return toast('Elegí un nombre para mostrar');
      unirse(nombre);
    }
    else if (a === 'salir') salir();
    else if (a === 'decorar') Jardin.abrir();
    else if (a === 'recargar') { jardines = null; cargar(); render(); }
    else if (a === 'acercar') zoom?.acercar();
    else if (a === 'alejar') zoom?.alejar();
    else if (a === 'mundo') { visitando = null; document.getElementById('visita').innerHTML = ''; zoom?.todo(); }
    else if (a === 'mio') mostrarVisita(E.bosque.id);
  });

  return { vista, montar, publicar, salir, cargar, miJardin, jardinSVG, unido: () => !!E.bosque?.activo };
})();
