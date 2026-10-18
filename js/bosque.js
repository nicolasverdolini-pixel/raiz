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
    g += `<ellipse cx="100" cy="110" rx="96" ry="82" fill="${fondo.pasto}"/>`;
    if (vit < 40) g += `<ellipse cx="100" cy="110" rx="96" ry="82" fill="#c9a26a" opacity=".25"/>`;
    if (fondo.puntos) for (let k = 0; k < 14; k++) {
      const a = k * 2.4, r = 30 + ((k * 37) % 55);
      g += `<circle cx="${(100 + Math.cos(a) * r).toFixed(0)}" cy="${(110 + Math.sin(a) * r * 0.75).toFixed(0)}" r="${noche ? 1.2 : 1.8}" fill="${fondo.puntos}" opacity=".8"/>`;
    }
    g += `<ellipse cx="100" cy="110" rx="96" ry="82" fill="none" stroke="${j.yo ? '#c9a96e' : 'rgba(47,74,53,.18)'}" stroke-width="${j.yo ? 3 : 1.5}"/>`;
    if (nv >= 10) g += `<ellipse cx="100" cy="110" rx="88" ry="74" fill="none" stroke="#a9845a" stroke-width="1.6" stroke-dasharray="2 5"/>`;
    if ((j.mejor_racha || 0) >= 7) g += `<path d="M100 188 Q92 170 100 158 Q108 146 100 138" stroke="${noche ? '#56677d' : '#e9e1cc'}" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="6 5"/>`;
    // Decoración: lo de atrás primero, el árbol en el medio, lo de adelante al final.
    const lugares = lugaresDe(j.jardin, j.logros);
    const piezas = Object.entries(lugares).map(([i, id]) => {
      const pos = LUGARES_JARDIN[Number(i)];
      if (!pos) return null;
      const [px, py] = pos;
      return { y: py, s: `<svg x="${(px - 14).toFixed(1)}" y="${(py - 26).toFixed(1)}" width="28" height="28" viewBox="0 0 48 48">${itemSVG(id)}</svg>` };
    }).filter(Boolean);
    g += piezas.filter(p => p.y < 110).map(p => p.s).join('');
    g += treeSVG(etapaDe(nv), vit, false, { especie: j.especie, brotes: j.brotes, nuevo: j.nuevo }).replace('<svg class="tree" viewBox="0 0 120 140"', `<svg class="${j.yo ? 'tree' : ''}" x="45" y="22" width="110" height="128" viewBox="0 0 120 140"`).replace(/role="img" aria-label="[^"]*"/, '');
    g += piezas.filter(p => p.y >= 110).map(p => p.s).join('');
    if (!j.sinCartel) g += `<g class="cartel"><rect x="${100 - 60}" y="196" width="120" height="26" rx="13" fill="${j.yo ? '#1f3326' : '#fffdf8'}" stroke="rgba(47,74,53,.15)"/>
      <text x="100" y="213" text-anchor="middle" font-size="12" fill="${j.yo ? '#efe8d8' : '#24382a'}">${esc((j.nombre || '').slice(0, 16))} · nv ${nv}</text></g>`;
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

  function mundoSVG(lista) {
    const pos = ubicar(lista);
    const xs = pos.map(p => p.x), ys = pos.map(p => p.y);
    const minX = Math.min(...xs) - 120, minY = Math.min(...ys) - 120;
    const ancho = Math.max(...xs) + TAM + 120 - minX, alto = Math.max(...ys) + TAM + 160 - minY;
    // Florcitas del pasto, siempre en el mismo lugar.
    let deco = '';
    for (let i = 0; i < Math.min(300, 30 + lista.length * 12); i++) {
      const fx = minX + ((i * 7919) % 1000) / 1000 * ancho, fy = minY + ((i * 104729) % 1000) / 1000 * alto;
      deco += i % 3 ? `<circle cx="${fx.toFixed(0)}" cy="${fy.toFixed(0)}" r="2" fill="#b7c99a"/>` : `<circle cx="${fx.toFixed(0)}" cy="${fy.toFixed(0)}" r="2.4" fill="#f3e6c8"/>`;
    }
    return `<svg class="mundo" viewBox="${minX.toFixed(0)} ${minY.toFixed(0)} ${ancho.toFixed(0)} ${alto.toFixed(0)}" role="img" aria-label="El Bosque: jardines de ${lista.length} personas">
      <rect x="${minX - 2000}" y="${minY - 2000}" width="${ancho + 4000}" height="${alto + 4000}" fill="#dfe7cf"/>${deco}
      ${pos.map(p => jardinSVG(p.j, p.x, p.y)).join('')}
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
