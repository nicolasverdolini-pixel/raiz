// Progresión: misiones que suben de nivel, lugares de raíz por etapa, catálogo,
// misión sorpresa del día y desafío de la semana.

const RAICES_POR_ETAPA = [3, 4, 5, 5, 6, 6, 7, 7];
const DIAS_PARA_SUBIR = 7;
const SEMANAS_PARA_SUBIR = 3;
const SAVIA_SORPRESA = 30;
const SAVIA_DESAFIO_DIA = 10;
const BONUS_DESAFIO = 100;

const maxRaices = () => RAICES_POR_ETAPA[etapaDe(nivelDe(E.savia).nivel)];
const raicesActivas = () => activas().filter(x => x.tipo === 'raiz').length;
const catDe = x => x.cat && CATALOGO.find(c => c.id === x.cat);
const sorpresaDe = d => SORPRESAS[Math.abs(hash(d + (E.creado || ''))) % SORPRESAS.length];
const desafioDe = w => DESAFIOS[Math.abs(hash(w + 'desafio' + (E.creado || ''))) % DESAFIOS.length];
const lugares = n => (n === 1 ? '1 lugar' : `${n} lugares`);

// Vincula las misiones que ya existían con su entrada del catálogo (para que puedan subir de nivel).
function vincularCatalogo() {
  let cambio = false;
  for (const x of E.misiones) {
    if (x.cat) continue;
    const c = CATALOGO.find(c => c.id === x.id || c.pasos.includes(x.titulo));
    if (!c) continue;
    let p = c.pasos.indexOf(x.titulo);
    if (p < 0 && c.metas && x.meta) p = c.metas.indexOf(x.meta);
    x.cat = c.id;
    x.paso = Math.max(0, p);
    cambio = true;
  }
  if (cambio) guardarLocal();
}

// ---------- Escaleras ----------

// Días seguidos cumpliendo una misión diaria (los días de lluvia no cortan la cuenta).
function rachaMision(x) {
  let d = hoy();
  if (!hechas(d, x.id)) d = sumar(d, -1);
  let n = 0;
  for (let i = 0; i < 90; i++, d = sumar(d, -1)) {
    if (x.desde && d < x.desde) break; // solo cuenta desde que la misión subió de nivel
    if (hechas(d, x.id)) n++;
    else if (!E.lluvia[d]) break;
  }
  return n;
}

const vecesEnSemana = (x, w) => Array.from({ length: 7 }, (_, k) => hechas(sumar(w, k), x.id)).reduce((a, b) => a + b, 0);

// Semanas seguidas cumpliendo la meta de una rama.
function semanasMision(x) {
  let w = lunes(hoy());
  if (vecesEnSemana(x, w) < (x.meta || 1)) w = sumar(w, -7);
  let n = 0;
  const inicio = x.desde ? lunes(x.desde) : '';
  while (n < 52 && w >= inicio && vecesEnSemana(x, w) >= (x.meta || 1)) { n++; w = sumar(w, -7); }
  return n;
}

function propuestaDeSubida() {
  for (const x of activas()) {
    const c = catDe(x);
    if (!c || x.tipo === 'fruto' || (x.paso || 0) + 1 >= c.pasos.length) continue;
    if (x.posponer && x.posponer > hoy()) continue;
    if (x.tipo === 'rama' ? semanasMision(x) >= SEMANAS_PARA_SUBIR : rachaMision(x) >= DIAS_PARA_SUBIR) return { x, c };
  }
  return null;
}

function subirEscalon(id) {
  const x = E.misiones.find(y => y.id === id);
  const c = x && catDe(x);
  if (!c) return;
  const antes = x.titulo;
  x.paso = (x.paso || 0) + 1;
  x.titulo = c.pasos[x.paso];
  x.savia = saviaPaso(c, x.paso);
  if (c.metas) x.meta = c.metas[x.paso];
  x.desde = sumar(hoy(), 1);
  delete x.posponer;
  desbloquear('escalon');
  guardar();
  Sonido.nivel();
  render();
  destello();
  toast(`De «${esc(antes)}» a <b>«${esc(x.titulo)}»</b>. Ahora vale +${x.savia}.`);
}

// ---------- Sorpresa y desafío ----------

function marcarEspecial(clave, g, area, el) {
  const d = hoy();
  const reg = (E.registro[d] ||= {});
  const antes = nivelDe(E.savia).nivel;
  const barraAntes = pctBarra();
  const origen = el?.getBoundingClientRect();

  if (reg[clave]) {
    mover(-reg[clave].g, -reg[clave].s, area);
    delete reg[clave];
    if (clave === '_desafio') revisarDesafio(true);
    guardar();
    Sonido.deshacer();
    render();
    return;
  }
  const s = semillasDe(g);
  reg[clave] = { g, s };
  mover(g, s, area);
  if (clave === '_sorpresa') {
    E.sorpresas = (E.sorpresas || 0) + 1;
    if (E.sorpresas >= 5) desbloquear('sorpresa5');
    toast(`<b>+${g} savia</b> — Sorpresa cumplida. ${esc(frase('extra'))}`);
  } else {
    toast(`<b>+${g} savia</b> · Desafío de la semana`);
  }
  const completoDesafio = clave === '_desafio' && revisarDesafio(false);
  guardar();
  Sonido.extra();
  anim = { nuevo: true };
  render();
  efectosDeSavia(origen, antes, completoDesafio, barraAntes);
}

// Da (o quita, si se deshizo) el bonus del desafío al llegar a la meta. Devuelve true si se completó ahora.
function revisarDesafio(deshacer) {
  const w = lunes(hoy());
  const [titulo, area, meta] = desafioDe(w);
  const dias = Array.from({ length: 7 }, (_, k) => E.registro[sumar(w, k)]?._desafio).filter(Boolean).length;
  E.desafios ||= {};
  if (!deshacer && dias >= meta && !E.desafios[w]) {
    E.desafios[w] = true;
    mover(BONUS_DESAFIO, semillasDe(BONUS_DESAFIO), area);
    desbloquear('desafio');
    setTimeout(() => toast(`Desafío completado: <b>${esc(titulo)}</b>. +${BONUS_DESAFIO} savia`), 1200);
    return true;
  }
  if (deshacer && dias < meta && E.desafios[w]) {
    delete E.desafios[w];
    mover(-BONUS_DESAFIO, -semillasDe(BONUS_DESAFIO), area);
  }
  return false;
}

// ---------- Piezas de la pantalla Hoy ----------

function progresionArriba() {
  const p = propuestaDeSubida();
  if (!p) return '';
  const { x, c } = p;
  const sig = c.pasos[(x.paso || 0) + 1];
  const motivo = x.tipo === 'rama' ? `Cumpliste la meta ${semanasMision(x)} semanas seguidas` : `Llevás ${rachaMision(x)} días seguidos`;
  return `<div class="card subir" style="margin-top:12px">
    <div class="eyebrow">Tu misión puede crecer</div>
    <p class="quote" style="margin:6px 0 4px">${motivo} con «${esc(x.titulo)}».</p>
    <div style="font-size:13px" class="muted">¿Pasás a <b>«${esc(sig)}»</b>? Vale +${saviaPaso(c, (x.paso || 0) + 1)} de savia.</div>
    <div class="btns" style="margin-top:10px"><button class="btn small primary" data-prog="subir" data-id="${esc(x.id)}">Subir de nivel</button><button class="btn small ghost" data-prog="posponer" data-id="${esc(x.id)}">Todavía no</button></div>
  </div>`;
}

function lugarLibre() {
  const libres = maxRaices() - raicesActivas();
  if (libres <= 0) return '';
  return `<button class="libre" data-prog="catalogo" data-modo="raiz">+ Tenés ${lugares(libres)} para una raíz nueva</button>`;
}

function progresionAbajo(d) {
  const [st, sa] = sorpresaDe(d);
  const okS = !!E.registro[d]?._sorpresa;
  const w = lunes(d);
  const [dt, da, meta] = desafioDe(w);
  const dias = Array.from({ length: 7 }, (_, k) => E.registro[sumar(w, k)]?._desafio).filter(Boolean).length;
  const okD = !!E.registro[d]?._desafio;
  const completo = E.desafios?.[w];
  return `<div class="section"><div class="eyebrow"><span>Extras ${ayudaBtn('extras')}</span><span style="text-transform:none;letter-spacing:0">Cambian cada día y cada semana</span></div>
    <div class="extras">
      <div class="card extra ${okS ? 'hecho' : ''}">
        <div class="eyebrow">Sorpresa del día · +${SAVIA_SORPRESA}</div>
        <p class="quote">${esc(st)}</p>
        <div class="row between"><small class="muted">${esc(nombreArea(sa))}</small><button class="btn small ${okS ? 'ghost' : ''}" data-prog="sorpresa">${okS ? '✓ Hecha' : 'La hice'}</button></div>
      </div>
      <div class="card extra ${completo ? 'hecho' : ''}">
        <div class="eyebrow">Desafío de la semana · +${BONUS_DESAFIO}</div>
        <p class="quote">${esc(dt)}, ${meta} días esta semana</p>
        <div class="row between"><span class="weekly">${Array.from({ length: meta }, (_, k) => `<i class="${k < dias ? 'on' : ''}"></i>`).join('')}</span><button class="btn small ${okD ? 'ghost' : ''}" data-prog="desafio">${completo && !okD ? '✓ Completado' : okD ? '✓ Hoy sí' : 'Hoy lo cumplí'}</button></div>
      </div>
    </div>
    <button class="btn catalogo-btn" data-prog="catalogo">+ Sumar misiones del catálogo</button>
  </div>`;
}

function textoEtapa(nivelAntes, nivel) {
  const a = RAICES_POR_ETAPA[etapaDe(nivelAntes)], b = RAICES_POR_ETAPA[etapaDe(nivel)];
  const nuevas = CATALOGO.filter(c => c.nivel > nivelAntes && c.nivel <= nivel).length;
  const partes = [];
  if (b > a) partes.push(`un lugar para una raíz nueva (ahora ${b})`);
  if (nuevas) partes.push(`${nuevas} misiones nuevas en el catálogo`);
  return partes.length ? `Desbloqueaste ${partes.join(' y ')}.` : 'Buen momento para subir un poco la dificultad de tus hábitos.';
}

// ---------- Catálogo ----------

let filtroCat = 'todas', modoCat = null;

function abrirCatalogo(modo) {
  modoCat = modo || null;
  pintarCatalogo();
}

function pintarCatalogo() {
  const nivel = nivelDe(E.savia).nivel;
  const tops = E.areas.filter(a => !a.id.includes('/'));
  const libres = maxRaices() - raicesActivas();
  let lista = CATALOGO.filter(c => filtroCat === 'todas' || c.area === filtroCat || c.area.startsWith(filtroCat + '/'));
  if (modoCat === 'raiz') lista = lista.filter(c => c.tipo === 'raiz' || c.tipo === 'hoja');

  const fila = c => {
    const usada = activas().some(x => x.cat === c.id) || (c.tipo === 'fruto' && E.misiones.some(x => x.cat === c.id && x.hecha));
    const bloq = c.nivel > nivel;
    const detalle = [nombreArea(c.area), TIPOS[c.tipo === 'raiz' ? 'hoja' : c.tipo].singular];
    if (c.metas) detalle.push(`${c.metas[0]}× por semana`);
    if (c.pasos.length > 1) detalle.push(`${c.pasos.length} niveles`);
    return `<button class="item ${usada ? 'done' : ''} ${bloq ? 'bloq' : ''}" data-prog="elegir" data-id="${c.id}" ${bloq || usada ? 'disabled' : ''}>
      <span class="t"><span>${esc(c.pasos[0])}</span><small>${esc(detalle.join(' · '))}</small></span>
      <span class="xp">${bloq ? `Nivel ${c.nivel}` : usada ? '✓' : `+${saviaPaso(c, 0)}`}</span></button>`;
  };

  const grupos = tops.map(t => {
    const items = lista.filter(c => c.area === t.id || c.area.startsWith(t.id + '/'));
    return items.length ? `<div class="muted cat-grupo">${esc(t.nombre)}</div><div class="list">${items.map(fila).join('')}</div>` : '';
  }).join('');

  abrir(`<div class="sheet cat-sheet">
    <h2>${modoCat === 'raiz' ? 'Elegí una raíz nueva' : 'Catálogo de misiones'}</h2>
    <p class="muted" style="font-size:13px;margin-top:-6px">${modoCat === 'raiz' ? `Tenés ${lugares(libres)}. Las raíces son diarias y obligatorias.` : 'Tocá una para sumarla. Cada una tiene niveles: cuando la sostenés, te propongo el siguiente. Las de nivel alto se desbloquean al crecer.'}</p>
    <div class="chips filtro">${[['todas', 'Todas'], ...tops.map(t => [t.id, t.nombre.split(' ')[0]])].map(([id, n]) => `<button class="chip ${filtroCat === id ? 'on' : ''}" data-prog="filtro" data-f="${id}">${esc(n)}</button>`).join('')}</div>
    ${grupos || '<div class="empty">No hay misiones en esta rama todavía.</div>'}
    <div class="btns"><button type="button" class="btn primary" data-act="cerrar">Listo</button></div>
  </div>`);
}

function elegirDelCatalogo(id) {
  const c = CATALOGO.find(x => x.id === id);
  if (!c) return;
  if (c.tipo === 'rama' || c.tipo === 'fruto') return agregarDelCatalogo(id, c.tipo);
  if (modoCat === 'raiz') return agregarDelCatalogo(id, 'raiz');
  const libres = maxRaices() - raicesActivas();
  abrir(`<div class="sheet">
    <h2>${esc(c.pasos[0])}</h2>
    <p class="muted" style="font-size:13px;margin-top:-6px">¿Cómo la sumás?</p>
    <div class="list">
      <button class="item" data-prog="agregar" data-id="${c.id}" data-tipo="raiz" ${libres <= 0 ? 'disabled' : ''}><span class="t"><span>Como raíz</span><small>${libres > 0 ? `Diaria y obligatoria. Te quedan ${lugares(libres)}.` : 'No te quedan lugares de raíz. Se desbloquean más al crecer.'}</small></span></button>
      <button class="item" data-prog="agregar" data-id="${c.id}" data-tipo="hoja"><span class="t"><span>Como hoja</span><small>Opcional: la hacés cuando querés y suma savia.</small></span></button>
    </div>
    <div class="btns"><button type="button" class="btn ghost" data-prog="volver-cat">Volver</button></div>
  </div>`);
}

function agregarDelCatalogo(id, tipo) {
  const c = CATALOGO.find(x => x.id === id);
  if (!c) return;
  if (tipo === 'raiz' && raicesActivas() >= maxRaices()) { toast('No te quedan lugares de raíz. Sumala como hoja.'); return; }
  let nid = c.id;
  while (E.misiones.some(x => x.id === nid)) nid += '-1';
  E.misiones.push({
    id: nid, cat: c.id, paso: 0, titulo: c.pasos[0], tipo, area: c.area, savia: saviaPaso(c, 0),
    meta: c.metas?.[0], opciones: c.opciones, nota: c.nota, creada: hoy(),
  });
  guardar();
  Sonido.cumplir();
  toast(`Sumaste <b>${esc(c.pasos[0])}</b> como ${TIPOS[tipo].singular.toLowerCase()}`);
  render();
  if (modoCat === 'raiz' && raicesActivas() >= maxRaices()) cerrar();
  else pintarCatalogo();
}

// ---------- Eventos ----------

document.addEventListener('click', e => {
  const b = e.target.closest('[data-prog]');
  if (!b || b.disabled) return;
  const { prog, id } = b.dataset;
  if (prog === 'subir') subirEscalon(id);
  else if (prog === 'posponer') {
    const x = E.misiones.find(y => y.id === id);
    if (x) { x.posponer = sumar(hoy(), 7); guardar(); render(); toast('Dale, te lo vuelvo a proponer en una semana'); }
  }
  else if (prog === 'sorpresa') { const [, area] = sorpresaDe(hoy()); marcarEspecial('_sorpresa', SAVIA_SORPRESA, area, b); }
  else if (prog === 'desafio') { const [, area] = desafioDe(lunes(hoy())); marcarEspecial('_desafio', SAVIA_DESAFIO_DIA, area, b); }
  else if (prog === 'catalogo') { filtroCat = 'todas'; abrirCatalogo(b.dataset.modo); }
  else if (prog === 'filtro') { filtroCat = b.dataset.f; pintarCatalogo(); }
  else if (prog === 'elegir') elegirDelCatalogo(id);
  else if (prog === 'agregar') agregarDelCatalogo(id, b.dataset.tipo);
  else if (prog === 'volver-cat') pintarCatalogo();
});
