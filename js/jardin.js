// Tu jardín: plantas y adornos que se desbloquean (herbario) o se compran con semillas,
// y un fondo a elección. Se ve en el Bosque y se decora con el editor.

const DECOS = [
  // Plantas
  { id: 'tulipanes', nombre: 'Tulipanes', tipo: 'planta', costo: 15, svg: '<path d="M14 44V27M24 44V22M34 44V27" stroke="#3f7a3a" stroke-width="2.4"/><path d="M14 40c-5-2-7-7-6-11 4 2 6 6 6 11zM34 40c5-2 7-7 6-11-4 2-6 6-6 11z" fill="url(#e-verde2)"/><path d="M9 27c0-7 2-11 5-11s5 4 5 11q-5 3-10 0z" fill="url(#e-rosa)"/><path d="M19 22c0-7 2-11 5-11s5 4 5 11q-5 3-10 0z" fill="url(#e-amarillo)"/><path d="M29 27c0-7 2-11 5-11s5 4 5 11q-5 3-10 0z" fill="url(#e-morado)"/><path d="M14 17v7M24 12v7M34 17v7" stroke="rgba(0,0,0,.12)" stroke-width="1.5"/>' },
  { id: 'rosal', nombre: 'Rosal', tipo: 'planta', costo: 30, svg: '<circle cx="15" cy="32" r="11" fill="url(#e-verde)"/><circle cx="32" cy="31" r="12" fill="url(#e-verde)"/><circle cx="24" cy="22" r="11" fill="url(#e-verde2)"/><circle cx="17" cy="24" r="4.5" fill="url(#e-rojo)"/><circle cx="30" cy="20" r="4.5" fill="url(#e-rojo)"/><circle cx="28" cy="33" r="4.5" fill="url(#e-rojo)"/><circle cx="14" cy="35" r="3.8" fill="url(#e-rosa)"/><circle cx="38" cy="27" r="3.5" fill="url(#e-rosa)"/>' },
  { id: 'cactus', nombre: 'Cactus', tipo: 'planta', costo: 20, svg: '<path d="M14 34h20l-2.5 11h-15z" fill="url(#l-terracota)"/><rect x="12" y="31" width="24" height="5" rx="2" fill="#c4703e"/><rect x="19" y="8" width="10" height="25" rx="5" fill="url(#e-verde2)"/><path d="M19 22h-4a3 3 0 0 1-3-3v-5" stroke="#5c9a5a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M29 25h4a3 3 0 0 0 3-3v-6" stroke="#4f8a4a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M22 12v18M26 12v18" stroke="rgba(255,255,255,.35)" stroke-width="1"/><circle cx="24" cy="8" r="3.5" fill="url(#e-rosa)"/>' },
  { id: 'girasoles', nombre: 'Girasoles', tipo: 'planta', costo: 40, svg: '<path d="M16 45V22M32 45V17" stroke="#3f7a3a" stroke-width="3"/><path d="M16 36c-6-1-8-5-8-8 5 0 8 4 8 8zM32 34c6-1 8-5 8-8-5 0-8 4-8 8z" fill="url(#e-verde2)"/><g fill="url(#e-amarillo)">' + [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<ellipse cx="16" cy="13" rx="3" ry="6" transform="rotate(${a} 16 19)"/><ellipse cx="32" cy="8" rx="3.4" ry="7" transform="rotate(${a + 20} 32 15)"/>`).join('') + '</g><circle cx="16" cy="19" r="4.5" fill="#6a4420"/><circle cx="32" cy="15" r="5" fill="#6a4420"/><circle cx="30.5" cy="13.5" r="1.6" fill="#8a5a30"/>' },
  { id: 'hongos', nombre: 'Hongos', tipo: 'planta', costo: 15, svg: '<path d="M14 30h6l1 13h-8z" fill="url(#e-blanco)"/><path d="M5 31a12 11 0 0 1 24 0q-12 4-24 0z" fill="url(#e-rojo)"/><circle cx="12" cy="25" r="2" fill="#fff"/><circle cx="19" cy="22" r="1.7" fill="#fff"/><circle cx="23" cy="27" r="1.5" fill="#fff"/><path d="M31 35h4l1 9h-6z" fill="url(#e-blanco)"/><path d="M26 36a7 6 0 0 1 14 0q-7 3-14 0z" fill="url(#e-naranja)"/>' },
  { id: 'maceta', nombre: 'Maceta con flores', tipo: 'planta', costo: 25, svg: '<path d="M13 30h22l-3 15H16z" fill="url(#l-terracota)"/><rect x="11" y="27" width="26" height="6" rx="3" fill="#c4703e"/><path d="M18 27c-2-5 0-9 3-10M30 27c2-5 0-9-3-10" stroke="#3f7a3a" stroke-width="2.2" fill="none"/><circle cx="17" cy="19" r="6" fill="url(#e-blanco)"/><circle cx="26" cy="14" r="7" fill="url(#e-rosa)"/><circle cx="33" cy="21" r="5" fill="url(#e-amarillo)"/><circle cx="26" cy="14" r="2.2" fill="#f2c230"/>' },
  { id: 'arbusto', nombre: 'Arbusto', tipo: 'planta', costo: 20, svg: '<circle cx="14" cy="31" r="11" fill="url(#e-verde)"/><circle cx="33" cy="30" r="12" fill="url(#e-verde)"/><circle cx="24" cy="22" r="12" fill="url(#e-verde2)"/><circle cx="20" cy="17" r="3" fill="rgba(255,255,255,.35)"/>' },
  { id: 'bonsai', nombre: 'Bonsái', tipo: 'planta', costo: 80, nivel: 5, svg: '<path d="M9 37h30l-3 8H12z" fill="url(#e-azul)"/><rect x="7" y="35" width="34" height="4" rx="2" fill="#2f5a86"/><path d="M24 36c0-7-6-9-3-16 2-4 6-5 8-9" stroke="url(#l-tronco)" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="15" cy="20" rx="10" ry="6" fill="url(#e-verde)"/><ellipse cx="31" cy="13" rx="11" ry="6.5" fill="url(#e-verde2)"/>' },
  { id: 'calabazas', nombre: 'Calabazas', tipo: 'planta', costo: 30, svg: '<ellipse cx="17" cy="35" rx="12" ry="9" fill="url(#e-naranja)"/><path d="M11 30q-2 5 0 11M17 26v18M23 30q2 5 0 11" stroke="rgba(150,70,20,.4)" stroke-width="1.6" fill="none"/><ellipse cx="34" cy="38" rx="9" ry="7" fill="url(#e-naranja)"/><path d="M30 34q-1 4 0 8M38 34q1 4 0 8" stroke="rgba(150,70,20,.4)" stroke-width="1.4" fill="none"/><path d="M17 27c0-3 1-5 3-6M34 31c0-2 1-4 2-4" stroke="#3f7a3a" stroke-width="2.6" stroke-linecap="round" fill="none"/>' },
  { id: 'palmera', nombre: 'Palmera', tipo: 'planta', costo: 120, nivel: 10, svg: '<path d="M24 46c-2-12 0-24 3-32" stroke="url(#l-tronco)" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M23 40h4M23 33h4M24 26h4" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/><path d="M27 14C20 8 10 10 6 16c8-2 14 0 21-2zM27 14c7-6 17-4 21 2-8-2-14 0-21-2zM27 14c-3-8-11-11-17-9 7 2 12 5 17 9zM27 14c3-8 11-11 17-9-7 2-12 5-17 9z" fill="url(#e-verde)"/><circle cx="25" cy="16" r="2.5" fill="#7a5a3a"/><circle cx="29" cy="17" r="2.3" fill="#6a4a2a"/>' },
  // Adornos
  { id: 'piedras', nombre: 'Piedras', tipo: 'adorno', costo: 10, svg: '<ellipse cx="16" cy="37" rx="11" ry="8" fill="url(#e-piedra)"/><ellipse cx="32" cy="39" rx="8" ry="6" fill="url(#e-piedra)"/><ellipse cx="25" cy="30" rx="6" ry="5" fill="url(#e-piedra)"/><path d="M9 38c3 1 6 1 9-1" stroke="#7fae6a" stroke-width="2" fill="none" stroke-linecap="round"/>' },
  { id: 'banco', nombre: 'Banco', tipo: 'adorno', costo: 40, svg: '<rect x="10" y="30" width="3" height="13" fill="url(#l-metal)"/><rect x="35" y="30" width="3" height="13" fill="url(#l-metal)"/><rect x="6" y="27" width="36" height="5" rx="2" fill="url(#l-madera)"/><rect x="6" y="18" width="36" height="4" rx="2" fill="url(#l-madera)"/><rect x="6" y="12" width="36" height="4" rx="2" fill="url(#l-madera)"/><path d="M9 16v12M39 16v12" stroke="#3d4650" stroke-width="2.5"/>' },
  { id: 'farol', nombre: 'Farol', tipo: 'adorno', costo: 50, svg: '<circle cx="24" cy="14" r="13" fill="url(#e-amarillo)" opacity=".3"/><rect x="22.5" y="18" width="3" height="27" fill="url(#l-metal)"/><rect x="18" y="42" width="12" height="3" rx="1.5" fill="#3d4650"/><path d="M17 8h14l-2 13H19z" fill="url(#e-amarillo)"/><path d="M16 8h16l-3-4H19z" fill="#3d4650"/><rect x="18" y="20" width="12" height="2.5" rx="1" fill="#3d4650"/>' },
  { id: 'casita', nombre: 'Casita de pájaros', tipo: 'adorno', costo: 45, svg: '<rect x="22" y="28" width="4" height="18" fill="url(#l-madera)"/><rect x="14" y="16" width="20" height="14" rx="1" fill="#e9c98a"/><rect x="14" y="16" width="20" height="14" rx="1" fill="url(#l-madera)" opacity=".35"/><path d="M11 18L24 6l13 12z" fill="url(#e-rojo)"/><circle cx="24" cy="23" r="3.2" fill="#4a3020"/><rect x="22.5" y="27" width="3" height="2" fill="#7a5a3a"/>' },
  { id: 'fuente', nombre: 'Fuente', tipo: 'adorno', costo: 150, nivel: 5, svg: '<ellipse cx="24" cy="40" rx="20" ry="6.5" fill="url(#e-piedra)"/><ellipse cx="24" cy="38" rx="16" ry="4.5" fill="url(#e-agua)"/><rect x="20" y="20" width="8" height="18" rx="2" fill="url(#e-piedra)"/><ellipse cx="24" cy="20" rx="9" ry="3" fill="url(#e-piedra)"/><path d="M24 18c-5-6-10-4-12 4M24 18c5-6 10-4 12 4M24 18V8" stroke="#8fd0ea" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="12" cy="24" r="1.5" fill="#bfe3f2"/><circle cx="36" cy="24" r="1.5" fill="#bfe3f2"/>' },
  { id: 'estanque', nombre: 'Estanque', tipo: 'adorno', costo: 90, svg: '<ellipse cx="24" cy="35" rx="22" ry="11" fill="url(#e-piedra)"/><ellipse cx="24" cy="34" rx="19" ry="8.5" fill="url(#e-agua)"/><ellipse cx="17" cy="31" rx="6" ry="1.6" fill="#fff" opacity=".6"/><path d="M30 36a5 3 0 1 1 7 0l-3-1z" fill="url(#e-verde2)"/><circle cx="33" cy="34" r="1.8" fill="url(#e-rosa)"/>' },
  { id: 'gnomo', nombre: 'Gnomo', tipo: 'adorno', costo: 60, svg: '<path d="M24 3l10 21H14z" fill="url(#e-rojo)"/><circle cx="24" cy="26" r="6.5" fill="url(#e-piel)"/><circle cx="24" cy="28" r="2" fill="#e58a7a"/><path d="M16 29c1 9 15 9 16 0l-1 11H17z" fill="url(#e-blanco)"/><rect x="15" y="36" width="18" height="9" rx="4" fill="url(#e-azul)"/><rect x="15" y="43" width="7" height="3" rx="1.5" fill="#4a3020"/><rect x="26" y="43" width="7" height="3" rx="1.5" fill="#4a3020"/>' },
  { id: 'mariposas', nombre: 'Mariposas', tipo: 'adorno', costo: 35, svg: '<g transform="translate(17 17)"><ellipse cx="-4" cy="-2" rx="5.5" ry="4" transform="rotate(-30)" fill="url(#e-naranja)"/><ellipse cx="4" cy="-2" rx="5.5" ry="4" transform="rotate(30)" fill="url(#e-naranja)"/><ellipse cx="-3" cy="4" rx="3" ry="2.5" fill="url(#e-amarillo)"/><ellipse cx="3" cy="4" rx="3" ry="2.5" fill="url(#e-amarillo)"/><rect x="-.8" y="-5" width="1.6" height="11" rx=".8" fill="#4a3020"/></g><g transform="translate(33 33) scale(.8)"><ellipse cx="-4" cy="-2" rx="5.5" ry="4" transform="rotate(-30)" fill="url(#e-morado)"/><ellipse cx="4" cy="-2" rx="5.5" ry="4" transform="rotate(30)" fill="url(#e-morado)"/><rect x="-.8" y="-5" width="1.6" height="11" rx=".8" fill="#4a3020"/></g>' },
  { id: 'hamaca', nombre: 'Hamaca', tipo: 'adorno', costo: 100, nivel: 10, svg: '<rect x="5" y="8" width="4" height="37" rx="1.5" fill="url(#l-madera)"/><rect x="39" y="8" width="4" height="37" rx="1.5" fill="url(#l-madera)"/><path d="M8 16q16 22 32 0" stroke="#f08aa6" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M8 16q16 22 32 0" stroke="#ffc9d8" stroke-width="2" fill="none" stroke-dasharray="3 4"/>' },
  { id: 'molino', nombre: 'Molino', tipo: 'adorno', costo: 140, nivel: 15, svg: '<path d="M17 46l4-26h6l4 26z" fill="url(#e-blanco)"/><rect x="22" y="36" width="4" height="10" rx="1" fill="#7a5a3a"/><g transform="translate(24 19)"><g fill="url(#l-madera)"><rect x="-2" y="-16" width="4" height="16" rx="1"/><rect x="-2" y="-16" width="4" height="16" rx="1" transform="rotate(90)"/><rect x="-2" y="-16" width="4" height="16" rx="1" transform="rotate(180)"/><rect x="-2" y="-16" width="4" height="16" rx="1" transform="rotate(270)"/></g></g><circle cx="24" cy="19" r="3" fill="url(#e-piedra)"/>' },
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
