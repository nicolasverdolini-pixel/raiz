// Tu jardín: plantas y adornos que se desbloquean (herbario) o se compran con semillas,
// y un fondo a elección. Se ve en el Bosque y se decora con el editor.

const DECOS = [
  // Plantas
  { id: 'tulipanes', nombre: 'Tulipanes', tipo: 'planta', costo: 15, svg: '<path d="M16 44V28M24 44V24M32 44V28" stroke="#5c7a4a" stroke-width="2"/><path d="M12 28c0-6 2-9 4-9s4 3 4 9z" fill="#e0607e"/><path d="M20 24c0-6 2-9 4-9s4 3 4 9z" fill="#f2b84b"/><path d="M28 28c0-6 2-9 4-9s4 3 4 9z" fill="#c45bbf"/>' },
  { id: 'rosal', nombre: 'Rosal', tipo: 'planta', costo: 30, svg: '<circle cx="24" cy="30" r="14" fill="#4f7a44"/><circle cx="17" cy="25" r="4" fill="#d9405a"/><circle cx="29" cy="22" r="4" fill="#e85a72"/><circle cx="27" cy="34" r="4" fill="#d9405a"/><circle cx="16" cy="35" r="3" fill="#e85a72"/>' },
  { id: 'cactus', nombre: 'Cactus', tipo: 'planta', costo: 20, svg: '<rect x="20" y="12" width="8" height="30" rx="4" fill="#5f9a5a"/><path d="M20 26h-5a3 3 0 0 1-3-3v-5" stroke="#5f9a5a" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M28 30h5a3 3 0 0 0 3-3v-6" stroke="#5f9a5a" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="24" cy="11" r="3" fill="#f07aa0"/><rect x="14" y="40" width="20" height="6" rx="2" fill="#c47a4a"/>' },
  { id: 'girasoles', nombre: 'Girasoles', tipo: 'planta', costo: 40, svg: '<path d="M18 46V22M32 46V18" stroke="#5c7a4a" stroke-width="2.5"/><circle cx="18" cy="20" r="8" fill="#f2c230"/><circle cx="18" cy="20" r="3.5" fill="#7a4e1d"/><circle cx="32" cy="16" r="9" fill="#f2c230"/><circle cx="32" cy="16" r="4" fill="#7a4e1d"/>' },
  { id: 'hongos', nombre: 'Hongos', tipo: 'planta', costo: 15, svg: '<rect x="14" y="30" width="5" height="12" rx="2" fill="#f3e6c8"/><path d="M8 31a9 8 0 0 1 17 0z" fill="#d8443a"/><circle cx="13" cy="27" r="1.6" fill="#fff"/><circle cx="19" cy="25" r="1.4" fill="#fff"/><rect x="29" y="34" width="4" height="9" rx="2" fill="#f3e6c8"/><path d="M25 35a6 5 0 0 1 12 0z" fill="#c9763e"/>' },
  { id: 'maceta', nombre: 'Maceta con flores', tipo: 'planta', costo: 25, svg: '<path d="M14 32h20l-3 14H17z" fill="#c47a4a"/><rect x="12" y="29" width="24" height="5" rx="2" fill="#a9653a"/><circle cx="18" cy="24" r="5" fill="#f3e6c8"/><circle cx="26" cy="20" r="6" fill="#e9a0b8"/><circle cx="31" cy="26" r="4" fill="#f2c230"/>' },
  { id: 'arbusto', nombre: 'Arbusto', tipo: 'planta', costo: 20, svg: '<circle cx="16" cy="32" r="11" fill="#5c7a4a"/><circle cx="30" cy="30" r="13" fill="#7c9a62"/><circle cx="24" cy="24" r="9" fill="#9db67f"/>' },
  { id: 'bonsai', nombre: 'Bonsái', tipo: 'planta', costo: 80, nivel: 5, svg: '<rect x="12" y="38" width="24" height="7" rx="2" fill="#3e5a7a"/><path d="M24 38c0-8-6-10-2-18" stroke="#7a5a3a" stroke-width="3" fill="none"/><ellipse cx="16" cy="20" rx="9" ry="5" fill="#4f7a44"/><ellipse cx="30" cy="16" rx="10" ry="6" fill="#5c7a4a"/>' },
  { id: 'calabazas', nombre: 'Calabazas', tipo: 'planta', costo: 30, svg: '<ellipse cx="17" cy="36" rx="10" ry="8" fill="#e08a2c"/><ellipse cx="32" cy="38" rx="8" ry="6" fill="#f0a640"/><path d="M17 28v-4M32 32v-3" stroke="#5c7a4a" stroke-width="2.5"/>' },
  { id: 'palmera', nombre: 'Palmera', tipo: 'planta', costo: 120, nivel: 10, svg: '<path d="M25 46c-2-12 0-22 2-30" stroke="#a9845a" stroke-width="4" fill="none"/><path d="M27 16c-8-6-16-2-20 2M27 16c8-6 16-2 20 2M27 16c-4-8-12-10-16-8M27 16c4-8 12-10 16-8" stroke="#4f8a4a" stroke-width="4" fill="none" stroke-linecap="round"/>' },
  // Adornos
  { id: 'piedras', nombre: 'Piedras', tipo: 'adorno', costo: 10, svg: '<ellipse cx="16" cy="38" rx="9" ry="6" fill="#a8a59a"/><ellipse cx="30" cy="40" rx="7" ry="5" fill="#bdbab0"/><ellipse cx="24" cy="32" rx="5" ry="4" fill="#8f8c82"/>' },
  { id: 'banco', nombre: 'Banco', tipo: 'adorno', costo: 40, svg: '<rect x="8" y="26" width="32" height="5" rx="2" fill="#a9845a"/><rect x="8" y="18" width="32" height="4" rx="2" fill="#8a6a45"/><rect x="11" y="31" width="3" height="11" fill="#6e5236"/><rect x="34" y="31" width="3" height="11" fill="#6e5236"/>' },
  { id: 'farol', nombre: 'Farol', tipo: 'adorno', costo: 50, svg: '<rect x="23" y="16" width="3" height="30" fill="#3d3d38"/><rect x="18" y="8" width="13" height="11" rx="2" fill="#3d3d38"/><rect x="20" y="10" width="9" height="7" rx="1" fill="#f6d77a"/><circle cx="24.5" cy="13.5" r="9" fill="#f6d77a" opacity=".25"/>' },
  { id: 'casita', nombre: 'Casita de pájaros', tipo: 'adorno', costo: 45, svg: '<rect x="22" y="26" width="4" height="20" fill="#7a5a3a"/><path d="M12 18l12-10 12 10z" fill="#c45a3a"/><rect x="15" y="18" width="18" height="12" fill="#e9c98a"/><circle cx="24" cy="24" r="3" fill="#5a4030"/>' },
  { id: 'fuente', nombre: 'Fuente', tipo: 'adorno', costo: 150, nivel: 5, svg: '<ellipse cx="24" cy="40" rx="18" ry="6" fill="#a8a59a"/><ellipse cx="24" cy="38" rx="14" ry="4" fill="#8fc0d8"/><rect x="21" y="20" width="6" height="18" fill="#bdbab0"/><path d="M24 14c-6 2-8 8-8 12M24 14c6 2 8 8 8 12" stroke="#8fc0d8" stroke-width="2" fill="none"/>' },
  { id: 'estanque', nombre: 'Estanque', tipo: 'adorno', costo: 90, svg: '<ellipse cx="24" cy="34" rx="20" ry="10" fill="#7fb0c8"/><ellipse cx="18" cy="31" rx="7" ry="2" fill="#bfe0ee"/><circle cx="32" cy="36" r="3" fill="#5c9a4a"/><circle cx="31" cy="35" r="1" fill="#f07aa0"/>' },
  { id: 'gnomo', nombre: 'Gnomo', tipo: 'adorno', costo: 60, svg: '<path d="M24 4l9 20H15z" fill="#d8443a"/><circle cx="24" cy="27" r="6" fill="#f2c9a8"/><path d="M17 30c2 8 12 8 14 0l-2 10h-10z" fill="#f3f0e8"/><rect x="16" y="38" width="16" height="8" rx="3" fill="#3e5a7a"/>' },
  { id: 'mariposas', nombre: 'Mariposas', tipo: 'adorno', costo: 35, svg: '<g fill="#f2a640"><ellipse cx="14" cy="18" rx="5" ry="3" transform="rotate(-30 14 18)"/><ellipse cx="20" cy="18" rx="5" ry="3" transform="rotate(30 20 18)"/></g><g fill="#8f86c4"><ellipse cx="30" cy="32" rx="4.5" ry="2.6" transform="rotate(-30 30 32)"/><ellipse cx="35" cy="32" rx="4.5" ry="2.6" transform="rotate(30 35 32)"/></g>' },
  { id: 'hamaca', nombre: 'Hamaca', tipo: 'adorno', costo: 100, nivel: 10, svg: '<rect x="6" y="10" width="3" height="34" fill="#7a5a3a"/><rect x="39" y="10" width="3" height="34" fill="#7a5a3a"/><path d="M8 18q16 18 32 0" stroke="#e9a0b8" stroke-width="5" fill="none"/>' },
  { id: 'molino', nombre: 'Molino', tipo: 'adorno', costo: 140, nivel: 15, svg: '<path d="M20 46l3-24h2l3 24z" fill="#bdbab0"/><g stroke="#a9845a" stroke-width="3"><path d="M24 20l-10-10M24 20l10-10M24 20l-10 10M24 20l10 10"/></g><circle cx="24" cy="20" r="2.5" fill="#6e5236"/>' },
];

const FONDOS = [
  { id: 'pradera', nombre: 'Pradera', pasto: '#c5d9a6', costo: 0 },
  { id: 'otono', nombre: 'Otoño', pasto: '#e6cb9c', costo: 60, puntos: '#c9763e' },
  { id: 'arena', nombre: 'Oasis', pasto: '#ecdbb0', costo: 80, puntos: '#d6b87a' },
  { id: 'nieve', nombre: 'Nevado', pasto: '#e6edf0', costo: 100, puntos: '#ffffff' },
  { id: 'lavanda', nombre: 'Lavanda', pasto: '#d9cfe8', costo: 120, puntos: '#8f86c4' },
  { id: 'noche', nombre: 'Noche estrellada', pasto: '#3c4d63', costo: 200, nivel: 10, puntos: '#f3e1b0' },
];

// Lugares alrededor del árbol (en un jardín de 200 × 230).
const LUGARES_JARDIN = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2 + 0.3;
  const r = i % 2 ? 66 : 80;
  return [100 + Math.cos(a) * r, 110 + Math.sin(a) * r * 0.8];
});

// Una planta del herbario (desbloqueada) o algo comprado: devuelve su dibujo 48×48.
function itemSVG(id) {
  if (id.startsWith('lamina:')) {
    const l = LOGROS.find(x => x.id === id.slice(7));
    return l ? laminaSVG(l.forma).replace(/^<svg[^>]*>|<\/svg>$/g, '') : '';
  }
  return DECOS.find(d => d.id === id)?.svg || '';
}
const itemNombre = id => (id.startsWith('lamina:') ? LOGROS.find(x => x.id === id.slice(7))?.planta : DECOS.find(d => d.id === id)?.nombre) || '';

// Qué hay en cada lugar: lo que eligió la persona, o (si nunca decoró) sus plantas del herbario.
function lugaresDe(jardin, logros) {
  if (jardin?.editado || (jardin?.lugares && Object.keys(jardin.lugares).length)) return jardin.lugares || {};
  const auto = {};
  (logros || []).slice(0, 16).forEach((l, i) => { auto[i] = 'lamina:' + l; });
  return auto;
}
const fondoDe = jardin => FONDOS.find(f => f.id === jardin?.fondo) || FONDOS[0];

// ---------- Editor ----------

const Jardin = (() => {
  let elegido = null, pestana = 'planta';

  function mio() {
    E.jardin ||= { fondo: 'pradera', fondos: ['pradera'], compradas: [], lugares: lugaresDe(null, Object.keys(E.logros || {})), editado: true };
    E.jardin.fondos ||= ['pradera'];
    E.jardin.compradas ||= [];
    E.jardin.lugares ||= {};
    return E.jardin;
  }

  const nivel = () => nivelDe(E.savia).nivel;
  const tiene = id => id.startsWith('lamina:') ? !!E.logros?.[id.slice(7)] : mio().compradas.includes(id);

  function inventario() {
    const laminas = LOGROS.map(l => ({ id: 'lamina:' + l.id, nombre: l.planta, tipo: 'herbario', costo: 0, bloqueo: E.logros?.[l.id] ? null : l.texto }));
    return [...laminas, ...DECOS];
  }

  function abrir() {
    mio();
    let el = document.getElementById('editor-jardin');
    if (!el) {
      el = document.createElement('div');
      el.id = 'editor-jardin';
      el.className = 'intro editor';
      document.body.append(el);
    }
    document.body.classList.add('con-intro');
    pintar();
  }

  function cerrarEditor() {
    document.getElementById('editor-jardin')?.remove();
    document.body.classList.remove('con-intro');
    elegido = null;
    render();
  }

  function pintar() {
    const j = mio();
    const el = document.getElementById('editor-jardin');
    if (!el) return;
    const yo = { ...Bosque.miJardin(), jardin: j };
    let marcas = '';
    LUGARES_JARDIN.forEach(([x, y], i) => {
      const ocupado = j.lugares[i];
      marcas += `<g class="lugar ${ocupado ? 'ocupado' : ''} ${elegido ? 'listo' : ''}" data-lugar="${i}"><circle cx="${x.toFixed(1)}" cy="${(y - 9).toFixed(1)}" r="15" /></g>`;
    });
    const items = pestana === 'fondo' ? FONDOS.map(f => {
      const propio = j.fondos.includes(f.id);
      const bloq = f.nivel && nivel() < f.nivel;
      return `<button class="item-tienda ${j.fondo === f.id ? 'on' : ''} ${bloq ? 'bloq' : ''}" data-fondo="${f.id}" ${bloq ? 'disabled' : ''}>
        <span class="muestra" style="background:${f.pasto}"></span><b>${esc(f.nombre)}</b>
        <small>${j.fondo === f.id ? 'Puesto' : propio ? 'Tuyo' : bloq ? `Nivel ${f.nivel}` : `${f.costo} ${svgIco(ICONOS.semilla)}`}</small></button>`;
    }).join('') : inventario().filter(d => pestana === 'planta' ? d.tipo !== 'adorno' : d.tipo === 'adorno').map(d => {
      const propio = tiene(d.id);
      const bloq = d.bloqueo || (d.nivel && nivel() < d.nivel);
      return `<button class="item-tienda ${elegido === d.id ? 'on' : ''} ${bloq ? 'bloq' : ''}" data-deco="${d.id}" ${bloq ? 'disabled' : ''}>
        <svg viewBox="0 0 48 48">${bloq && d.tipo === 'herbario' ? '<text x="24" y="30" text-anchor="middle" font-size="20" fill="#b9b2a0">?</text>' : itemSVG(d.id)}</svg><b>${esc(bloq && d.tipo === 'herbario' ? '???' : d.nombre)}</b>
        <small>${d.tipo === 'herbario' ? (bloq ? 'Logro' : 'Herbario') : propio ? 'Tuyo' : bloq ? `Nivel ${d.nivel}` : `${d.costo} ${svgIco(ICONOS.semilla)}`}</small></button>`;
    }).join('');

    el.innerHTML = `
      <div class="editor-top">
        <button class="btn small" data-editor="cerrar">Listo</button>
        <b class="serif">Mi jardín</b>
        <span class="monedas">${svgIco(ICONOS.semilla)} ${E.semillas}</span>
      </div>
      <div class="editor-escena"><svg viewBox="-6 -6 212 236">${Bosque.jardinSVG(yo, 0, 0)}${marcas}</svg></div>
      <p class="editor-pista">${elegido ? `Tocá un círculo para poner <b>${esc(itemNombre(elegido))}</b>.` : 'Elegí una planta o un adorno, y después tocá dónde ponerlo. Tocá algo puesto para sacarlo.'}</p>
      <div class="editor-tabs">${[['planta', 'Plantas'], ['adorno', 'Adornos'], ['fondo', 'Fondos']].map(([k, n]) => `<button class="${pestana === k ? 'on' : ''}" data-pestana="${k}">${n}</button>`).join('')}</div>
      <div class="tienda">${items}</div>`;
  }

  function comprar(costo, nombre, alComprar) {
    if (E.semillas < costo) { toast(`Te faltan ${costo - E.semillas} semillas. Cumplí misiones para ganar más.`); Sonido.deshacer(); return false; }
    if (!confirm(`¿Comprar ${nombre} por ${costo} semillas?`)) return false;
    E.semillas -= costo;
    alComprar();
    guardar();
    Sonido.canje();
    toast(`¡${esc(nombre)} es tuyo!`);
    return true;
  }

  document.addEventListener('click', e => {
    if (!document.getElementById('editor-jardin')) return;
    const t = e.target.closest('[data-editor], [data-pestana], [data-deco], [data-fondo], [data-lugar]');
    if (!t) return;
    const j = mio();
    if (t.dataset.editor === 'cerrar') return cerrarEditor();
    if (t.dataset.pestana) { pestana = t.dataset.pestana; elegido = null; Sonido.tab(); return pintar(); }
    if (t.dataset.deco) {
      const id = t.dataset.deco;
      const d = DECOS.find(x => x.id === id);
      if (!tiene(id) && d && !comprar(d.costo, d.nombre, () => j.compradas.push(id))) return;
      elegido = elegido === id ? null : id;
      Sonido.tab();
      return pintar();
    }
    if (t.dataset.fondo) {
      const f = FONDOS.find(x => x.id === t.dataset.fondo);
      if (!j.fondos.includes(f.id) && !comprar(f.costo, `el fondo ${f.nombre}`, () => j.fondos.push(f.id))) return;
      j.fondo = f.id;
      guardar();
      Sonido.cumplir();
      return pintar();
    }
    if (t.dataset.lugar != null) {
      const i = t.dataset.lugar;
      if (elegido) { j.lugares[i] = elegido; Sonido.cumplir(); }
      else if (j.lugares[i]) { toast(`Sacaste ${esc(itemNombre(j.lugares[i]))}. Sigue siendo tuyo.`); delete j.lugares[i]; Sonido.deshacer(); }
      else { toast('Primero elegí qué poner, abajo.'); return; }
      j.editado = true;
      guardar();
      pintar();
    }
  });

  return { abrir };
})();
