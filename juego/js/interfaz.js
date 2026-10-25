// Campanas de Bruma — interfaz renovada: grupo, ficha del personaje con equipo visual, inventario en grilla y tienda.
'use strict';

const STAT_N = { hpMax:'Vida', mpMax:'Magia', atk:'Ataque', def:'Defensa', mag:'Poder mágico', res:'Resistencia', spd:'Velocidad', mov:'Movimiento', salto:'Salto', eva:'Evasión' };
const SLOT_N = { arma:'Arma', armadura:'Armadura', acc:'Accesorio' };

function colorClase(c) { return (CLASES[c] && CLASES[c].asp.C) || '#5a6fb0'; }
function avatarHTML(vis, px = 56, extra = '') {
  return `<span class="avatar ${extra}" style="--av:${px}px;--cc:${colorClase(vis.clase)}"><img src="${SPR.retrato(vis).toDataURL()}" alt=""></span>`;
}
function retratoU(u) { return { clase:u.clase, look:u.look }; }
// Casilla de objeto con borde del color de su rareza.
function itemTile(it, attrs = '', mini = false) {
  const tag = attrs.includes('data-x') ? 'button' : 'span'; // nunca un botón dentro de otro botón
  const R = RAREZAS[it.rareza || 0], d = EQ[it.id];
  const due = dueñoDe(it.uid);
  return `<${tag} class="itile rz${it.rareza || 0} ${mini ? 'mini' : ''}" style="--rc:${R.c}" ${attrs}>
    ${ICO.html(ICO.deItem(it.id), mini ? 26 : 34)}
    ${it.mejora ? `<span class="it-mej">+${it.mejora}</span>` : ''}
    ${it.gemas.length ? `<span class="it-gem">${it.gemas.map(g => g ? `<i style="--g:${GEMAS[gemaInfo(g).id].c}"></i>` : '<i class="v"></i>').join('')}</span>` : ''}
    ${due && !mini ? `<span class="it-due">${avatarHTML(retratoU(due), 18)}</span>` : ''}
    ${mini ? '' : `<span class="it-n">${esc(d.n)}</span>`}
  </${tag}>`;
}
function objTile(k, n, attrs = '') {
  return `<button class="itile obj" ${attrs}>${ICO.html(k, 34)}<span class="it-cant">${n}</span><span class="it-n">${esc(OBJ[k].n)}</span></button>`;
}
// Hoja que sube desde abajo (para elegir cosas sin tapar todo).
function hoja(html, acciones = {}) {
  const d = document.createElement('div');
  d.className = 'hoja-fondo';
  d.innerHTML = `<div class="hoja"><div class="hoja-asa"></div>${html}</div>`;
  ICO.iconizar(d);
  document.body.appendChild(d);
  const cerrar = () => { d.classList.add('cerrando'); setTimeout(() => d.remove(), 200); };
  d.addEventListener('click', e => {
    if (e.target === d) { Sonido.fx('atras'); cerrar(); return; }
    const b = e.target.closest('[data-x]'); if (!b || b.disabled) return;
    Sonido.fx(b.dataset.x === 'cerrar' ? 'atras' : 'sel');
    if (b.dataset.x === 'cerrar') { cerrar(); return; }
    acciones[b.dataset.x]?.(b.dataset, cerrar);
  });
  return cerrar;
}
function barraStat(v, max, c) { return `<span class="sbar"><i style="width:${Math.min(100, 100 * v / max)}%;background:${c}"></i></span>`; }

// ---------- Grupo ----------
function pantallaGrupo(volver, tab = 'personajes') {
  let cuerpo = '';
  if (tab === 'personajes') {
    cuerpo = `<div class="grilla-u">${G.unidades.map(u => {
      const s = calcStats(u), cl = u.cl[u.clase] || { pc:0, tot:0 };
      const m = u.mascota ? mascota(u.mascota) : null;
      return `<button class="ucard" style="--cc:${colorClase(u.clase)}" data-x="ficha" data-id="${u.id}">
        <span class="uc-nv">${u.nivel}</span>
        ${avatarHTML(retratoU(u), 64)}
        <b>${esc(u.nombre)}</b>
        <span class="uc-cl">${CLASES[u.clase].n} · Nv ${nivelClase(cl.tot)}</span>
        <span class="uc-barras">${barraStat(s.hpMax, s.hpMax, '#5ae07a')}${barraStat(u.exp, 100, '#ffd84a')}</span>
        <span class="uc-pie">${cl.pc ? `<em class="pc">${cl.pc} PC</em>` : ''}${m ? `<img class="uc-m" src="${SPR.personaje({ mascota:m.id }).toDataURL()}" alt="">` : ''}</span>
      </button>`;
    }).join('')}</div>`;
  } else if (tab === 'mascotas') {
    cuerpo = G.mascotas.length ? `<div class="grilla-u">${G.mascotas.map(m => {
      const d = dueñoMascota(m.uid), M = MASCOTAS[m.id];
      return `<button class="ucard masc" data-x="mascota" data-id="${m.uid}">
        <span class="uc-nv">${m.nivel}</span>
        <img class="masc-img" src="${SPR.personaje({ mascota:m.id }).toDataURL()}" alt="">
        <b>${esc(m.nombre)}</b><span class="uc-cl">${esc(M.n)}</span>
        <span class="uc-barras">${barraStat(m.exp, 100, '#ff9ad0')}</span>
        <span class="uc-pie">${d ? avatarHTML(retratoU(d), 22) + ' ' + esc(d.nombre) : 'Libre'}</span>
      </button>`;
    }).join('')}</div>` : '<p class="sub centro">Todavía no tenés compañeros. Hay criaderos en los puertos y algunas misiones secretas te dan uno.</p>';
  } else {
    const equipo = G.equipo.slice().sort((a, b) => (b.rareza || 0) - (a.rareza || 0) || EQ[b.id].tier - EQ[a.id].tier);
    const objs = Object.entries(G.obj).filter(([, v]) => v > 0);
    const gemas = Object.entries(G.gemas).filter(([, v]) => v > 0);
    cuerpo = `<div class="sep">Equipo (${equipo.length})</div>
      <div class="grilla-it">${equipo.map(it => itemTile(it, `data-x="item" data-id="${it.uid}"`)).join('') || '<p class="sub">Nada.</p>'}</div>
      <div class="sep">Objetos</div>
      <div class="grilla-it">${objs.map(([k, v]) => objTile(k, v, `data-x="obj" data-id="${k}"`)).join('') || '<p class="sub">Nada.</p>'}</div>
      <div class="sep">Gemas</div>
      <div class="grilla-it">${gemas.map(([k, v]) => `<button class="itile gemt" data-x="gema" data-id="${k}">${gemaHTML(k)}<span class="it-cant">${v}</span><span class="it-n">${esc(nombreGema(k))}</span></button>`).join('') || '<p class="sub">Ninguna.</p>'}</div>
      <div class="sep">Materiales</div>
      <div class="grilla-it">${Object.entries(MAT).map(([k, m]) => `<div class="itile"><img class="ico" src="${ICO.url(k)}" style="width:34px;height:34px" alt=""><span class="it-cant">${G.mat[k] || 0}</span><span class="it-n">${esc(m.n)}</span></div>`).join('')}</div>`;
  }
  montar(`${cabecera('Grupo')}
    <div class="seg"><button data-x="tab" data-t="personajes" class="${tab === 'personajes' ? 'on' : ''}">👥 Personajes</button><button data-x="tab" data-t="mascotas" class="${tab === 'mascotas' ? 'on' : ''}">🐾 Compañeros</button><button data-x="tab" data-t="inv" class="${tab === 'inv' ? 'on' : ''}">🎒 Inventario</button></div>
    <div class="cuerpo">${cuerpo}</div>`, {
    volver,
    tab: d => pantallaGrupo(volver, d.t),
    ficha: d => pantallaFicha(d.id, 'estado', () => pantallaGrupo(volver, 'personajes')),
    mascota: d => elegirDueñoMascota(d.id, () => pantallaGrupo(volver, 'mascotas')),
    item: d => detalleItem(item(d.id), () => pantallaGrupo(volver, 'inv')),
    obj: d => hoja(`<div class="det-cab">${ICO.html(d.id, 56)}<div><h3>${esc(OBJ[d.id].n)}</h3><p>${esc(OBJ[d.id].d)}</p><small class="sub">Tenés ${G.obj[d.id]}. Se usan en batalla con "Objeto".</small></div></div><button data-x="cerrar" class="ok">Listo</button>`),
    gema: d => hoja(`<div class="det-cab">${gemaHTML(d.id).replace('class="gema"', 'class="gema grande"')}<div><h3>${esc(nombreGema(d.id))}</h3><p>${esc(gemaInfo(d.id).def.d)}</p><small class="sub">Se engarzan en la herrería. Tres iguales se funden en una mejor.</small></div></div><button data-x="cerrar" class="ok">Listo</button>`),
  });
}

// Detalle de una pieza de equipo, con a quién le queda bien.
function detalleItem(it, volver) {
  const d = EQ[it.id], R = RAREZAS[it.rareza || 0], due = dueñoDe(it.uid);
  const candidatos = G.unidades.filter(u => puedeEquipar(u, it.id));
  hoja(`<div class="det-cab rzfondo" style="--rc:${R.c}">${itemTile(it, '', true)}<div><h3 style="color:${R.c}">${esc(nombreItem(it))}</h3><span class="chip-rz" style="--rc:${R.c}">${R.n}</span> <small class="sub">${d.slot === 'arma' ? ARMA_INFO[d.tipo].n : d.slot === 'armadura' ? ARMADURA_INFO[d.tipo] : 'Accesorio'}</small></div></div>
    <div class="det-st">${statsInst(it)}</div>
    ${due ? `<p class="sub">Lo tiene ${esc(due.nombre)}.</p>` : ''}
    ${candidatos.length ? `<div class="sep">Equipárselo a</div><div class="fila-av">${candidatos.map(u => `<button class="av-b ${due === u ? 'on' : ''}" data-x="equipar" data-id="${u.id}">${avatarHTML(retratoU(u), 44)}<small>${esc(u.nombre)}</small></button>`).join('')}</div>` : '<p class="sub">Nadie del grupo lo puede usar con su clase actual.</p>'}
    <button data-x="cerrar" class="sec">Cerrar</button>`, {
    equipar: (dd, c) => {
      const u = G.unidades.find(v => v.id === dd.id);
      const otro = dueñoDe(it.uid); if (otro) Object.keys(otro.eq).forEach(k => { if (otro.eq[k] === it.uid) otro.eq[k] = null; });
      u.eq[d.slot] = it.uid; Sonido.fx('forja'); guardar(); c(); toast(`${u.nombre} se equipó ${d.n}`, 'bien'); volver();
    },
  });
}

// ---------- Ficha del personaje ----------
function pantallaFicha(uidU, tab, volver) {
  const u = G.unidades.find(v => v.id === uidU);
  const s = calcStats(u), C = CLASES[u.clase], cl = u.cl[u.clase] || { pc:0, tot:0 };
  const nvc = nivelClase(cl.tot), sig = pcParaSiguiente(cl.tot);
  const m = u.mascota ? mascota(u.mascota) : null;
  const visCuerpo = visDe(u);
  let cuerpo = '';
  if (tab === 'estado') {
    const ref = { hpMax:60 + u.nivel * 14, mpMax:30 + u.nivel * 5, atk:14 + u.nivel * 1.8, def:14 + u.nivel * 1.8, mag:14 + u.nivel * 1.8, res:14 + u.nivel * 1.8, spd:13, mov:7, eva:45 };
    const col = { hpMax:'#5ae07a', mpMax:'#5ab0ff', atk:'#ff8a5a', def:'#c8b070', mag:'#c88aff', res:'#7ad8d0', spd:'#ffd84a', mov:'#9ad0ff', eva:'#ffb0d0' };
    cuerpo = `<div class="panel"><div class="stats2">${Object.keys(ref).map(k => `<div class="st2"><span>${STAT_N[k]}</span><b>${k === 'spd' ? Math.round(s[k] * 10) / 10 : s[k]}${k === 'eva' ? '%' : ''}</b>${barraStat(s[k], ref[k], col[k])}</div>`).join('')}</div></div>
      <div class="panel chips">
        <span class="chipi">⚔️ ${ARMA_INFO[s.armaTipo]?.n || 'Sin arma'} · poder ${Math.round(s.armaPoder)}${s.armaEl ? ' · ' + ELEMENTOS[s.armaEl].n : ''}</span>
        <span class="chipi">Alcance ${s.rango.join('-')} · Salto ${s.salto}</span>
        ${Object.entries(s.resEl).map(([e, v]) => `<span class="chipi">Resiste ${ELEMENTOS[e].n} ${Math.round(v * 100)}%</span>`).join('')}
        ${Object.entries(s.efectos).map(([e, v]) => `<span class="chipi esp">${{ regen:'Regeneración', vampiro:'Vampiro', contra:'Contraataque' }[e]} ${'I'.repeat(Math.min(3, v))}</span>`).join('')}
        <span class="chipi">Secundaria: ${u.sec ? CLASES[u.sec].n : '—'}</span>
        <span class="chipi">Pasiva: ${u.pasiva ? HAB[u.pasiva].n : '—'}</span>
      </div>
      <div class="panel"><b>${C.n}</b> <span class="sub">— ${esc(C.d)}</span></div>
      ${u.unico ? '' : '<button data-x="despedir" class="peligro">Despedir</button>'}`;
  } else if (tab === 'equipo') {
    const slot = k => {
      const it = item(u.eq[k]);
      const R = RAREZAS[it?.rareza || 0];
      return `<button class="slot ${it ? 'lleno rz' + (it.rareza || 0) : ''}" style="--rc:${R.c}" data-x="slot" data-s="${k}">
        <span class="slot-ic">${it ? ICO.html(ICO.deItem(it.id), 38) : '<span class="mas">+</span>'}${it && it.mejora ? `<span class="it-mej">+${it.mejora}</span>` : ''}</span>
        <small>${SLOT_N[k]}</small><b style="${it ? `color:${R.c}` : ''}">${it ? esc(nombreItem(it)) : 'Vacío'}</b></button>`;
    };
    cuerpo = `<div class="munieco">
        <div class="col">${slot('arma')}${slot('armadura')}</div>
        <div class="centro-m">
          <div class="pedestal" style="--cc:${colorClase(u.clase)}"><img src="${SPR.personaje(visCuerpo, 'f').toDataURL()}" alt="">${m ? `<img class="ped-m" src="${SPR.personaje({ mascota:m.id }).toDataURL()}" alt="">` : ''}</div>
        </div>
        <div class="col">${slot('acc')}
          <button class="slot ${m ? 'lleno' : ''}" data-x="mascotaSlot"><span class="slot-ic">${m ? `<img src="${SPR.personaje({ mascota:m.id }).toDataURL()}" style="width:44px;height:44px" alt="">` : '<span class="mas">+</span>'}</span><small>Compañero</small><b>${m ? esc(m.nombre) + ' Nv' + m.nivel : 'Ninguno'}</b></button>
        </div>
      </div>
      <div class="panel resumen-eq">
        <span>Ataque <b>${s.atk}</b></span><span>Defensa <b>${s.def}</b></span><span>Magia <b>${s.mag}</b></span><span>Resist. <b>${s.res}</b></span><span>Vida <b>${s.hpMax}</b></span><span>Evasión <b>${s.eva}%</b></span>
      </div>
      <button data-x="optimo" class="ok">✨ Equipar lo mejor automáticamente</button>
      ${m ? `<p class="sub centro">${esc(MASCOTAS[m.id].d)}</p>` : ''}`;
  } else if (tab === 'clase') {
    const lista = clasesJugables().filter(c => !CLASES[c].unico || CLASES[c].unico === u.unico);
    cuerpo = `<div class="sep">Clase principal</div><div class="clases2">${lista.map(c => {
      const K = CLASES[c], ok = claseDesbloqueada(u, c), tot = u.cl[c]?.tot || 0, n = nivelClase(tot);
      const prox = pcParaSiguiente(tot), pr = prox === null ? 100 : 100 * (tot - PC_NIVELES[n - 1]) / (PC_NIVELES[n] - PC_NIVELES[n - 1]);
      const req = Object.entries(K.req).map(([k, v]) => `${CLASES[k].n} ${v}`).join(' + ');
      return `<button class="clase2 ${ok ? '' : 'bloq'} ${u.clase === c ? 'on' : ''}" style="--cc:${K.asp.C}" data-x="clase" data-c="${c}">
        <img src="${SPR.personaje({ clase:c, look:u.look, arma:K.armas[0] !== 'puños' ? K.armas[0] : null }).toDataURL()}" alt="">
        <b>${K.n}</b>
        ${ok ? `<small>Nivel ${n}</small>${barraStat(pr, 100, K.asp.C)}` : `<small>🔒 ${esc(req)}</small>`}
      </button>`;
    }).join('')}</div>
    <div class="sep">Habilidades secundarias</div>
    <div class="fila-wrap">${[''].concat(lista.filter(c => c !== u.clase && claseDesbloqueada(u, c) && habsActivasDe(u, c).length)).map(c => `<button class="chip-b ${(u.sec || '') === c ? 'on' : ''}" data-x="sec" data-c="${c}">${c ? CLASES[c].n : 'Ninguna'}</button>`).join('')}</div>
    <p class="sub">Solo aparecen las clases de las que aprendió alguna habilidad.</p>`;
  } else {
    const lista = clasesJugables().filter(c => claseDesbloqueada(u, c));
    const abierta = window._claseHabs && lista.includes(window._claseHabs) ? window._claseHabs : u.clase;
    const K = CLASES[abierta], clc = u.cl[abierta] || { pc:0, tot:0 };
    cuerpo = `<div class="fila-wrap">${lista.map(c => `<button class="chip-b ${c === abierta ? 'on' : ''}" data-x="verClase" data-c="${c}">${CLASES[c].n}${u.cl[c]?.pc ? ` · ${u.cl[c].pc}` : ''}</button>`).join('')}</div>
      <div class="panel pcs" style="--cc:${K.asp.C}"><b>${K.n}</b><span>${clc.pc} PC para gastar</span></div>
      <div class="habs2">${K.habs.map(h => {
        const H = HAB[h], ya = u.apr.includes(h);
        if (H.historia && !ya) return `<div class="hab2 bloq"><span class="h-ic">✦</span><div><b>${esc(H.n)}</b><small>Se aprende con la historia.</small></div></div>`;
        const puede = !ya && clc.pc >= H.pc;
        const pasiva = H.tipo === 'pasiva';
        const etiqueta = ya ? (pasiva ? (u.pasiva === h ? '★ Puesta' : 'Poner') : (H.mp ? H.mp + ' PM' : 'Libre')) : H.pc + ' PC';
        return `<button class="hab2 ${ya ? 'ya' : ''} ${puede ? 'puede' : ''} ${pasiva ? 'pas' : ''}" data-x="${ya ? (pasiva ? 'pasiva' : 'nada') : 'aprender'}" data-h="${h}">
          <span class="h-ic">${pasiva ? '◆' : H.el ? ELEMENTOS[H.el].i : '✦'}</span>
          <div><b>${esc(H.n)}</b><small>${esc(H.d)}${H.carga ? ' · tarda en salir' : ''}</small></div>
          <span class="h-tag">${etiqueta}</span></button>`;
      }).join('')}</div>
      <p class="sub">Los PC se ganan peleando con esa clase puesta. Las pasivas se ponen tocándolas (una por personaje).</p>`;
  }
  montar(`${cabecera(u.nombre)}
    <div class="heroe" style="--cc:${colorClase(u.clase)};--cd:${CLASES[u.clase].asp.D}">
      <div class="heroe-img"><img src="${SPR.personaje(visCuerpo, 'f').toDataURL()}" alt=""></div>
      <div class="heroe-dat">
        <h2>${esc(u.nombre)}</h2>
        <span class="chip-cl">${C.n} · Nv ${nvc}</span>
        <div class="hb"><span>Nivel ${u.nivel}</span>${barraStat(u.exp, 100, '#ffd84a')}</div>
        <div class="hb"><span>PV ${s.hpMax}</span>${barraStat(1, 1, '#5ae07a')}</div>
        <div class="hb"><span>PM ${s.mpMax}</span>${barraStat(1, 1, '#5ab0ff')}</div>
        <small>${cl.pc} PC${sig ? ` · faltan ${sig} para Nv ${nvc + 1}` : ' · clase al máximo'}</small>
      </div>
    </div>
    <div class="seg"><button data-x="tab" data-t="estado" class="${tab === 'estado' ? 'on' : ''}">Estado</button><button data-x="tab" data-t="equipo" class="${tab === 'equipo' ? 'on' : ''}">Equipo</button><button data-x="tab" data-t="clase" class="${tab === 'clase' ? 'on' : ''}">Clase</button><button data-x="tab" data-t="habs" class="${tab === 'habs' ? 'on' : ''}">Habilidades</button></div>
    <div class="cuerpo">${cuerpo}</div>`, {
    volver,
    tab: d => pantallaFicha(uidU, d.t, volver),
    slot: d => elegirEquipo(u, d.s, () => pantallaFicha(uidU, 'equipo', volver)),
    mascotaSlot: () => elegirMascotaPara(u, () => pantallaFicha(uidU, 'equipo', volver)),
    optimo: () => { equiparOptimo(u); Sonido.fx('brillo'); guardar(); pantallaFicha(uidU, 'equipo', volver); },
    clase: d => {
      if (!claseDesbloqueada(u, d.c)) { const K = CLASES[d.c]; toast('Requiere: ' + Object.entries(K.req).map(([k, v]) => `${CLASES[k].n} nivel ${v}`).join(' y ')); return; }
      cambiarClase(u, d.c); equiparOptimo(u, true); Sonido.fx('brillo'); guardar(); pantallaFicha(uidU, 'clase', volver);
    },
    sec: d => { u.sec = d.c || null; guardar(); pantallaFicha(uidU, 'clase', volver); },
    verClase: d => { window._claseHabs = d.c; pantallaFicha(uidU, 'habs', volver); },
    aprender: d => {
      const H = HAB[d.h];
      if (!aprender(u, d.h)) { toast(`Faltan PC (${H.pc})`); Sonido.fx('error'); return; }
      Sonido.fx('nivel'); chispazo(); toast(`¡Aprendió ${H.n}!`, 'bien');
      if (H.tipo === 'pasiva' && !u.pasiva) u.pasiva = d.h;
      guardar(); pantallaFicha(uidU, 'habs', volver);
    },
    pasiva: d => { u.pasiva = u.pasiva === d.h ? null : d.h; Sonido.fx('brillo'); guardar(); pantallaFicha(uidU, 'habs', volver); },
    nada: () => {},
    despedir: () => confirmar(`¿Despedir a ${esc(u.nombre)}? Su equipo queda en el inventario.`, () => { G.unidades = G.unidades.filter(v => v !== u); guardar(); volver(); }),
  });
}

function elegirEquipo(u, slot, volver) {
  const actual = item(u.eq[slot]);
  const opciones = G.equipo.filter(it => EQ[it.id].slot === slot && puedeEquipar(u, it.id) && it.uid !== u.eq[slot]).sort((a, b) => valorItem(b) - valorItem(a));
  const antes = calcStats(u);
  const diff = it => {
    const prev = u.eq[slot]; u.eq[slot] = it.uid;
    const d = calcStats(u); u.eq[slot] = prev;
    const p = [];
    if (slot === 'arma') { const dp = Math.round(d.armaPoder - antes.armaPoder); if (dp) p.push([`Poder`, dp]); }
    [['atk', 'Atq'], ['def', 'Def'], ['mag', 'Mag'], ['res', 'Res'], ['hpMax', 'PV'], ['mpMax', 'PM'], ['mov', 'Mov'], ['eva', 'Eva']].forEach(([k, n]) => { const dv = Math.round((d[k] - antes[k]) * 10) / 10; if (dv) p.push([n, dv]); });
    return p.map(([n, v]) => `<span class="dif ${v > 0 ? 'mas' : 'menos'}">${v > 0 ? '▲' : '▼'} ${n} ${Math.abs(v)}</span>`).join('') || '<span class="dif">Igual</span>';
  };
  hoja(`<h3>${SLOT_N[slot]} de ${esc(u.nombre)}</h3>
    ${actual ? `<div class="eq-actual">${itemTile(actual, '', true)}<div><b style="color:${RAREZAS[actual.rareza || 0].c}">${esc(nombreItem(actual))}</b><small>${statsInst(actual)}</small></div><button data-x="quitar" class="sec mini">Quitar</button></div>` : ''}
    <div class="lista-eq">${opciones.map(it => { const d = dueñoDe(it.uid); return `<button class="eq-op" data-x="poner" data-id="${it.uid}">${itemTile(it, '', true)}<div class="eq-dat"><b style="color:${RAREZAS[it.rareza || 0].c}">${esc(nombreItem(it))}</b><small>${statsInst(it)}</small><span class="difs">${diff(it)}</span>${d ? `<small class="sub">Lo tiene ${esc(d.nombre)}</small>` : ''}</div></button>`; }).join('') || '<p class="sub centro">No hay nada que pueda usar. Comprá en la tienda o ganá botín en batalla.</p>'}</div>
    <button data-x="cerrar" class="sec">Cerrar</button>`, {
    quitar: (d, c) => { u.eq[slot] = null; guardar(); c(); volver(); },
    poner: (d, c) => {
      const otro = dueñoDe(d.id); if (otro) Object.keys(otro.eq).forEach(k => { if (otro.eq[k] === d.id) otro.eq[k] = null; });
      u.eq[slot] = d.id; Sonido.fx('forja'); guardar(); c(); volver();
    },
  });
}
function elegirMascotaPara(u, volver) {
  hoja(`<h3>Compañero de ${esc(u.nombre)}</h3>
    <div class="lista-eq">${G.mascotas.map(m => { const d = dueñoMascota(m.uid); return `<button class="eq-op" data-x="poner" data-id="${m.uid}"><img src="${SPR.personaje({ mascota:m.id }).toDataURL()}" style="width:52px;height:52px" alt=""><div class="eq-dat"><b>${esc(m.nombre)} · Nv ${m.nivel}</b><small>${esc(MASCOTAS[m.id].d)}</small><small class="sub">${d ? 'Ahora con ' + esc(d.nombre) : 'Libre'}</small></div></button>`; }).join('') || '<p class="sub centro">No tenés compañeros todavía.</p>'}</div>
    ${u.mascota ? '<button data-x="quitar" class="sec">Sin compañero</button>' : ''}
    <button data-x="cerrar" class="sec">Cerrar</button>`, {
    poner: (d, c) => { G.unidades.forEach(v => { if (v.mascota === d.id) v.mascota = null; }); u.mascota = d.id; Sonido.fx('mascota'); guardar(); c(); volver(); },
    quitar: (d, c) => { u.mascota = null; guardar(); c(); volver(); },
  });
}

// ---------- Tienda ----------
function pantallaTienda(id, tab = 'obj', volver = () => pantallaPueblo(id)) {
  const tier = tierActual();
  let cuerpo = '';
  if (tab === 'obj') {
    const objs = Object.entries(OBJ).filter(([, o]) => o.tier <= tier && o.precio);
    cuerpo = `<div class="grilla-tienda">${objs.map(([k, o]) => `<div class="prod">
      <div class="prod-ic">${ICO.html(k, 44)}<span class="it-cant">${G.obj[k] || 0}</span></div>
      <b>${esc(o.n)}</b><small>${esc(o.d)}</small>
      <button data-x="comprarObj" data-id="${k}" class="precio" ${G.oro < o.precio ? 'disabled' : ''}>💰 ${o.precio}</button></div>`).join('')}</div>`;
  } else if (tab === 'eq') {
    const ofertas = ofertasTienda(id);
    const eqs = Object.entries(EQ).filter(([, d]) => d.tier <= tier && d.precio && !d.forja);
    const tarjeta = (k, rz, precio, attrs, vendido) => {
      const d = EQ[k], R = RAREZAS[rz];
      const quien = G.unidades.filter(u => puedeEquipar(u, k));
      return `<div class="prod rz${rz}" style="--rc:${R.c}">
        <div class="prod-ic">${ICO.html(ICO.deItem(k), 44)}</div>
        <b style="color:${R.c}">${esc(d.n)}</b><small>${rz ? R.n + ' · ' : ''}${statsItem(k)}</small>
        <span class="prod-av">${quien.slice(0, 5).map(u => avatarHTML(retratoU(u), 20)).join('')}</span>
        <button ${attrs} class="precio" ${vendido || G.oro < precio ? 'disabled' : ''}>${vendido ? 'Vendido' : '💰 ' + precio}</button></div>`;
    };
    cuerpo = (ofertas.length ? `<div class="sep">✨ Ofertas especiales</div><div class="grilla-tienda">${ofertas.map((o, i) => tarjeta(o.id, o.rareza, o.precio, `data-x="comprarOferta" data-i="${i}"`, o.vendido)).join('')}</div>` : '') +
      [['Armas', d => d.slot === 'arma'], ['Armaduras', d => d.slot === 'armadura'], ['Accesorios', d => d.slot === 'acc']].map(([t, f]) =>
        `<div class="sep">${t}</div><div class="grilla-tienda">${eqs.filter(([, d]) => f(d)).map(([k, d]) => tarjeta(k, 0, d.precio, `data-x="verEq" data-id="${k}"`)).join('')}</div>`).join('');
  } else {
    const sueltos = G.equipo.filter(i => !dueñoDe(i.uid));
    const vObjs = Object.entries(G.obj).filter(([k, v]) => v > 0 && OBJ[k].precio);
    cuerpo = (sueltos.length ? '<div class="sep">Equipo sin usar</div>' : '') + `<div class="grilla-tienda">${sueltos.map(it => `<div class="prod rz${it.rareza || 0}" style="--rc:${RAREZAS[it.rareza || 0].c}"><div class="prod-ic">${ICO.html(ICO.deItem(it.id), 44)}</div><b style="color:${RAREZAS[it.rareza || 0].c}">${esc(nombreItem(it))}</b><small>${statsInst(it)}</small><button data-x="venderEq" data-id="${it.uid}" class="precio vender">+${precioVenta(it)}</button></div>`).join('')}</div>` +
      (vObjs.length ? '<div class="sep">Objetos</div>' : '') + `<div class="grilla-tienda">${vObjs.map(([k, v]) => `<div class="prod"><div class="prod-ic">${ICO.html(k, 44)}<span class="it-cant">${v}</span></div><b>${esc(OBJ[k].n)}</b><button data-x="venderObj" data-id="${k}" class="precio vender">+${Math.round(OBJ[k].precio / 2)}</button></div>`).join('')}</div>`;
    if (!sueltos.length && !vObjs.length) cuerpo = '<p class="sub centro">No tenés nada para vender.</p>';
  }
  montar(`${cabecera('Tienda')}
    <div class="tendero">${avatarHTML({ clase:'recluta', look:{ pelo:'#8a5a2a', piel:'#f2c9a0', estilo:1, cara:{ ojos:1, boca:2, bigote:true } }, asp:ROPA.aldeano }, 52)}<p>${tab === 'vender' ? '¿Qué me traés? Pago justo... más o menos.' : tab === 'eq' ? 'Las ofertas brillantes cambian después de cada batalla. ¡No te duermas!' : '¡Bienvenido! Pociones frescas, de hoy.'}</p></div>
    <div class="seg"><button data-x="tab" data-t="obj" class="${tab === 'obj' ? 'on' : ''}">🧪 Objetos</button><button data-x="tab" data-t="eq" class="${tab === 'eq' ? 'on' : ''}">⚔️ Equipo</button><button data-x="tab" data-t="vender" class="${tab === 'vender' ? 'on' : ''}">💰 Vender</button></div>
    <div class="cuerpo">${cuerpo}</div>`, {
    volver,
    tab: d => pantallaTienda(id, d.t, volver),
    comprarObj: d => { const o = OBJ[d.id]; if (G.oro < o.precio) return; G.oro -= o.precio; G.obj[d.id] = (G.obj[d.id] || 0) + 1; Sonido.fx('compra'); guardar(); pantallaTienda(id, tab, volver); },
    verEq: d => {
      const e = EQ[d.id];
      const quien = G.unidades.filter(u => puedeEquipar(u, d.id));
      const comparar = u => {
        const ant = calcStats(u), it = { uid:'__p', id:d.id, mejora:0, rareza:0, bonos:{}, gemas:[] };
        G.equipo.push(it); const prev = u.eq[e.slot]; u.eq[e.slot] = '__p';
        const nue = calcStats(u); u.eq[e.slot] = prev; G.equipo.pop();
        const dp = e.slot === 'arma' ? Math.round(nue.armaPoder - ant.armaPoder) : Math.round((nue.def - ant.def) + (nue.res - ant.res));
        return `<span class="dif ${dp > 0 ? 'mas' : dp < 0 ? 'menos' : ''}">${dp > 0 ? '▲' : dp < 0 ? '▼' : '='} ${Math.abs(dp)}</span>`;
      };
      hoja(`<div class="det-cab">${ICO.html(ICO.deItem(d.id), 56)}<div><h3>${esc(e.n)}</h3><small class="sub">${statsItem(d.id)}</small></div></div>
        ${quien.length ? `<div class="sep">Cómo le quedaría a cada uno</div><div class="fila-av">${quien.map(u => `<div class="av-b">${avatarHTML(retratoU(u), 40)}<small>${esc(u.nombre)}</small>${comparar(u)}</div>`).join('')}</div>` : '<p class="sub">Nadie del grupo lo puede usar con su clase actual.</p>'}
        <div class="fila"><button data-x="cerrar" class="sec">Cerrar</button><button data-x="comprar" class="ok" ${G.oro < e.precio ? 'disabled' : ''}>Comprar · ${e.precio}</button></div>`, {
        comprar: (dd, c) => { if (G.oro < e.precio) return; G.oro -= e.precio; nuevoItem(d.id); Sonido.fx('compra'); guardar(); c(); toast(`Compraste ${e.n}. Equipalo desde Grupo.`, 'bien'); pantallaTienda(id, tab, volver); },
      });
    },
    comprarOferta: d => {
      const o = ofertasTienda(id)[+d.i]; if (!o || o.vendido || G.oro < o.precio) return;
      G.oro -= o.precio; o.vendido = true; nuevoItem(o.id, 0, o.rareza);
      Sonido.fx('compra'); chispazo(); toast(`¡${EQ[o.id].n} ${RAREZAS[o.rareza].n.toLowerCase()}!`, 'bien'); guardar(); pantallaTienda(id, tab, volver);
    },
    venderEq: d => { const it = item(d.id); if (!it) return; G.oro += precioVenta(it); it.gemas.forEach(g => g && sumarGema(g)); G.equipo = G.equipo.filter(i => i !== it); Sonido.fx('moneda'); guardar(); pantallaTienda(id, tab, volver); },
    venderObj: d => { if (!G.obj[d.id]) return; G.obj[d.id]--; if (!G.obj[d.id]) delete G.obj[d.id]; G.oro += Math.round(OBJ[d.id].precio / 2); Sonido.fx('moneda'); guardar(); pantallaTienda(id, tab, volver); },
  });
}
