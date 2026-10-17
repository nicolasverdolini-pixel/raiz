// Piezas visuales y didácticas: colores e íconos por rama, ayudas, consejos,
// anillo del día y detalle de cada rama.

const ESTILO_RAMA = {
  cuerpo: { fg: '#b0583a', bg: '#f6e1d6', ico: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>' },
  mente: { fg: '#6e5ba8', bg: '#e9e4f5', ico: '<path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3zM21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z"/>' },
  casa: { fg: '#9a7225', bg: '#f5ead2', ico: '<path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5"/>' },
  trabajo: { fg: '#3d6383', bg: '#dfe8ef', ico: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7M3 13h18"/>' },
  vinculos: { fg: '#ad4a64', bg: '#f6dde3', ico: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4a3 3 0 0 1 0 6M21 20c0-2.6-1.6-4.8-4-5.6"/>' },
};
const ESTILO_OTRA = { fg: '#4f6e45', bg: '#e4ead9', ico: '<path d="M12 21V11M12 11c0-4 3-7 7-7 0 4-3 7-7 7zM12 14c0-3-2.5-5.5-6-5.5 0 3.5 2.5 5.5 6 5.5z"/>' };

const estiloDe = area => ESTILO_RAMA[String(area || '').split('/')[0]] || ESTILO_OTRA;
const svgIco = (path, clase = '') => `<svg viewBox="0 0 24 24" class="ico ${clase}" aria-hidden="true">${path}</svg>`;
const iconoRama = (area, clase = '') => {
  const e = estiloDe(area);
  return `<span class="burbuja ${clase}" style="--fg:${e.fg};--bg:${e.bg}">${svgIco(e.ico)}</span>`;
};

const ICONOS = {
  llama: '<path d="M12 22c4 0 7-2.8 7-7 0-3-1.6-5.2-3.4-7 .2 2-1 3.4-2.1 3.4C14 8 12.6 4.6 9.5 2c.5 3.4-1.2 5.3-2.7 7.1C5.7 10.5 5 12.3 5 15c0 4.2 3 7 7 7z"/>',
  corazon: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  semilla: '<path d="M12 3c4 3 6 7 6 11a6 6 0 0 1-12 0c0-4 2-8 6-11zM12 9v11"/>',
  gota: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  foco: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
};

// ---------- Ayudas ----------

const AYUDAS = {
  raiz: { t: 'Raíces', ico: 'gota', txt: 'Son lo importante de cada día: pocas y clave. Son las únicas obligatorias.', items: ['Si las cumplís todas: +1 de racha y +5 de vitalidad.', 'Si te falta alguna: tu árbol pierde algunas hojas, nunca todo.', 'Al crecer se desbloquean más lugares: Semilla 3 · Brote 4 · Plantín 5…'] },
  rama: { t: 'Ramas', ico: 'gota', txt: 'Metas de la semana, como entrenar 3 veces. Tenés de lunes a domingo para cumplirlas.', items: ['Cada vez que la hacés suma savia.', 'No penalizan: son para construir constancia.', 'Si cumplís la meta 3 semanas seguidas, la misión puede subir de nivel.'] },
  hoja: { t: 'Hojas', ico: 'gota', txt: 'Extras para cuando tenés ganas. Suman savia y nunca penalizan.', items: ['Si la hacés 7 días seguidos, te propongo subirla de nivel.', 'Sumá las que quieras desde el catálogo.'] },
  fruto: { t: 'Frutos', ico: 'gota', txt: 'Desafíos de una sola vez, como ordenar el placard. Valen mucha savia.', items: ['Cuando lo cumplís, desaparece de la lista.', 'Tu primer fruto desbloquea una lámina del herbario.'] },
  extras: { t: 'Extras', ico: 'foco', txt: 'Para que cada día y cada semana tengan algo distinto.', items: ['Sorpresa del día: una misión nueva cada día, +30 de savia.', 'Desafío de la semana: +10 por cada día que lo cumplís y +100 al llegar a la meta.'] },
  savia: { t: 'Savia', ico: 'gota', txt: 'Es tu experiencia. Cada misión cumplida te da savia y la savia te sube de nivel.', items: ['Cada nivel pide un poco más que el anterior.', 'Tu árbol cambia de etapa: Semilla → Brote → Plantín → Arbusto → Árbol en flor → Con frutos → Antiguo → Bosque.', 'Cada etapa desbloquea lugares de raíz y misiones nuevas.'] },
  vitalidad: { t: 'Vitalidad', ico: 'corazon', txt: 'La salud de tu árbol, de 0 a 100.', items: ['Baja 10 por cada raíz que no cumplís.', 'Sube 5 por cada día completo.', 'Si llega a 0 llega el otoño: volvés al inicio de tu nivel (nunca perdés niveles) y arranca una semana suave.'] },
  semillas: { t: 'Semillas', ico: 'semilla', txt: 'Tu moneda. Ganás 1 semilla cada 10 de savia.', items: ['Canjealas en Premios por cosas que te hagan bien.', 'Los premios los definís vos: una tarde de series, una cena afuera…'] },
  racha: { t: 'Racha', ico: 'llama', txt: 'Días seguidos cumpliendo todas tus raíces.', items: ['Si fallás, al día siguiente aparece una misión de rescate para recuperarla.', 'Los días de lluvia (2 por mes) no la cortan.', 'Rachas de 7, 30 y 66 días desbloquean láminas del herbario.'] },
  ramas: { t: 'Tus ramas', ico: 'foco', txt: 'Las cinco áreas de tu vida. Cada misión suma savia a su rama y a su ramita.', items: ['Tocá una rama para ver su nivel, sus ramitas y sus misiones.', 'Si una rama está baja, es una pista de dónde poner energía.'] },
};

function ayudaBtn(clave) {
  return `<button class="q" data-ui="ayuda" data-k="${clave}" aria-label="Qué es esto">?</button>`;
}

function abrirAyuda(clave) {
  const a = AYUDAS[clave];
  if (!a) return;
  abrir(`<div class="sheet ayuda">
    <span class="burbuja grande" style="--fg:var(--bosque-2);--bg:var(--hoja-clara)">${svgIco(ICONOS[a.ico] || ICONOS.gota)}</span>
    <h2>${esc(a.t)}</h2>
    <p class="quote">${esc(a.txt)}</p>
    <ul>${a.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
    <div class="btns"><button class="btn primary" data-act="cerrar">Entendido</button></div>
  </div>`);
}

// ---------- Consejos ----------

const CONSEJOS = [
  'Tocá tu árbol: se sacude y te dice algo.',
  'Si una misión tiene opciones, cada tarea extra del mismo día suma la mitad de savia.',
  'Una misión sostenida 7 días seguidos puede subir de nivel y dar más savia.',
  'Si un día se complica, usá un día de lluvia: no corta la racha.',
  '¿Te enfermaste o te vas de viaje? Activá el modo invierno en Ajustes.',
  'En el catálogo hay 92 misiones. Las difíciles se desbloquean al crecer.',
  'Mirá tu herbario en la pestaña Árbol: cada logro es una planta.',
  'Las semillas se canjean en Premios por recompensas que elegís vos.',
  'Empezar chico funciona: 5 páginas hoy valen más que 50 que nunca leíste.',
  'Si fallás una raíz, al día siguiente tenés una misión de rescate.',
  'Tocá cualquier rama (Cuerpo, Mente…) para ver cómo viene creciendo.',
  'Los "?" explican cada parte del juego.',
];

function consejoHTML(d) {
  if (E.consejoOculto === d) return '';
  const i = Math.abs(hash(d + 'consejo') + (E.consejoOffset || 0)) % CONSEJOS.length;
  return `<div class="consejo">
    <span class="burbuja" style="--fg:var(--tierra);--bg:#fbf3e0">${svgIco(ICONOS.foco)}</span>
    <div class="t"><small>¿Sabías que…?</small><span>${esc(CONSEJOS[i])}</span></div>
    <div class="consejo-btns"><button class="btn ghost small" data-ui="otro-consejo" aria-label="Otro consejo">↻</button><button class="btn ghost small" data-ui="ocultar-consejo" aria-label="Ocultar">✕</button></div>
  </div>`;
}

// ---------- Anillo del día ----------

function anillo(hechasN, total) {
  const p = total ? hechasN / total : 0;
  const r = 24, c = 2 * Math.PI * r;
  return `<button class="anillo ${total && hechasN >= total ? 'lleno' : ''}" data-ui="ayuda" data-k="raiz" aria-label="${hechasN} de ${total} raíces">
    <svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="${r}" class="fondo"/><circle cx="30" cy="30" r="${r}" class="frente" style="stroke-dasharray:${c};stroke-dashoffset:${c * (1 - p)}"/></svg>
    <span><b>${hechasN}/${total}</b><small>raíces</small></span>
  </button>`;
}

// ---------- Ramas ----------

function ramasHTML() {
  const tops = E.areas.filter(a => !a.id.includes('/'));
  return `<div class="section"><div class="eyebrow"><span>Tus ramas ${ayudaBtn('ramas')}</span></div>
    <div class="ramas">${tops.map(a => {
      const n = nivelArea(E.saviaArea[a.id] || 0);
      const e = estiloDe(a.id);
      return `<button class="rama-card" data-ui="rama" data-id="${esc(a.id)}" style="--fg:${e.fg};--bg:${e.bg}">
        ${iconoRama(a.id)}
        <b>${n.nivel}</b><small>${esc(a.nombre.split(' ')[0])}</small>
        <i class="mini"><i style="width:${Math.round((n.dentro / n.falta) * 100)}%"></i></i>
      </button>`;
    }).join('')}</div></div>`;
}

function detalleRama(id) {
  const a = E.areas.find(x => x.id === id);
  if (!a) return;
  const e = estiloDe(id);
  const sv = E.saviaArea[id] || 0;
  const n = nivelArea(sv);
  const hijas = areasOrdenadas().filter(x => x.id.startsWith(id + '/'));
  const misiones = activas().filter(m => m.area === id || m.area.startsWith(id + '/'));
  abrir(`<div class="sheet rama-sheet" style="--fg:${e.fg};--bg:${e.bg}">
    <div class="row">${iconoRama(id, 'grande')}<div><h2 style="margin:0">${esc(a.nombre)}</h2><div class="muted" style="font-size:13px">Nivel ${n.nivel} · ${sv} de savia</div></div></div>
    <div class="bar light rama-bar"><i style="width:${Math.round((n.dentro / n.falta) * 100)}%"></i></div>
    <div class="muted" style="font-size:12px;margin-top:6px">${n.falta - n.dentro} de savia para el nivel ${n.nivel + 1}</div>
    ${hijas.length ? `<div class="cat-grupo muted">Ramitas</div><div class="list">${hijas.map(h => {
      const s = E.saviaArea[h.id] || 0;
      const prof = h.id.split('/').length - 2;
      return `<div class="item" style="padding-left:${14 + prof * 16}px"><span class="t"><span>${esc(h.nombre)}</span></span><span class="xp">nv ${nivelArea(s).nivel} · ${s}</span></div>`;
    }).join('')}</div>` : ''}
    <div class="cat-grupo muted">Tus misiones en esta rama</div>
    ${misiones.length ? `<div class="list">${misiones.map(m => `<div class="item"><span class="t"><span>${esc(m.titulo)}</span><small>${esc(TIPOS[m.tipo].singular)} · +${m.savia}</small></span></div>`).join('')}</div>` : '<div class="empty">Todavía no tenés misiones acá.</div>'}
    <div class="btns"><button class="btn ghost" data-act="cerrar">Cerrar</button><button class="btn primary" data-ui="sumar-en-rama" data-id="${esc(id)}">+ Sumar misión</button></div>
  </div>`);
}

// ---------- Eventos ----------

document.addEventListener('click', e => {
  const b = e.target.closest('[data-ui]');
  if (!b) return;
  const { ui, k, id } = b.dataset;
  if (ui === 'ayuda') { Sonido.tab(); abrirAyuda(k); }
  else if (ui === 'rama') { Sonido.tab(); detalleRama(id); }
  else if (ui === 'sumar-en-rama') { filtroCat = id; abrirCatalogo(); }
  else if (ui === 'otro-consejo') { E.consejoOffset = (E.consejoOffset || 0) + 1; guardarLocal(); render(); }
  else if (ui === 'ocultar-consejo') { E.consejoOculto = hoy(); guardarLocal(); render(); }
});
