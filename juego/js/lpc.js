// Personajes con sprites LPC (arte de artistas libres, ver Créditos): se arman por capas
// (cuerpo, cabeza, pelo, ropa, armadura, casco, arma) y se recolorean con las paletas ULPC.
// Se dibujan capa por capa en cada cuadro: así no se guardan hojas enormes en memoria.
const LPC = (() => {
  const RUTA = 'arte/lpc/';
  const FR = { walk:9, slash:6, thrust:8, spellcast:7, shoot:13, hurt:6 };
  const D = LPC_DATOS;
  const imgs = new Map();       // archivo -> Image | 'cargando' | 'error'
  const recol = new Map();      // archivo|rampa -> canvas recoloreado
  let avisar = null;            // se llama cuando termina de cargar algo (para redibujar menús)

  // ---------- Colores ----------
  const hex2 = h => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  const dist = (a, b) => { const x = hex2(a), y = hex2(b); return (x[0] - y[0]) ** 2 * 0.3 + (x[1] - y[1]) ** 2 * 0.59 + (x[2] - y[2]) ** 2 * 0.11; };
  function cercana(mat, hex) {
    let mejor = null, md = 1e9;
    for (const [n, r] of Object.entries(D.paletas[mat])) { const d = dist(r[3], hex) + dist(r[2], SPR.luz(hex, -0.25)) * 0.5; if (d < md) { md = d; mejor = n; } }
    return mejor;
  }
  // Rampa de 6 tonos a partir de un color (para telas del color de la clase).
  function rampaDe(hex) { return [SPR.luz(hex, -0.82), SPR.luz(hex, -0.55), SPR.luz(hex, -0.28), hex, SPR.luz(hex, 0.22), SPR.luz(hex, 0.45)]; }
  function rampa(mat, valor) {
    if (!valor) return null;
    if (Array.isArray(valor)) return valor;
    if (D.paletas[mat]?.[valor]) return D.paletas[mat][valor];
    if (valor[0] === '#') return mat === 'cloth' ? rampaDe(valor) : D.paletas[mat][cercana(mat, valor)];
    return null;
  }

  // ---------- Imágenes ----------
  function img(f) {
    const v = imgs.get(f);
    if (v && v !== 'cargando') return v === 'error' ? null : v;
    if (!v) {
      imgs.set(f, 'cargando');
      const im = new Image();
      im.onload = () => { imgs.set(f, im); if (avisar) avisar(); };
      im.onerror = () => imgs.set(f, 'error');
      im.src = RUTA + f;
    }
    return undefined;
  }
  function recoloreada(f, mat, destino) {
    const im = img(f);
    if (!im) return im;
    if (!mat || !destino) return im;
    const clave = f + '|' + destino.join('');
    if (recol.has(clave)) return recol.get(clave);
    const base = D.paletas[mat][D.base[mat]];
    const mapa = new Map(base.map((c, i) => [hex2(c).join(','), hex2(destino[i])]));
    const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
    const c = cv.getContext('2d'); c.drawImage(im, 0, 0);
    const id = c.getImageData(0, 0, cv.width, cv.height), p = id.data;
    for (let i = 0; i < p.length; i += 4) {
      if (!p[i + 3]) continue;
      const t = mapa.get(p[i] + ',' + p[i + 1] + ',' + p[i + 2]);
      if (t) { p[i] = t[0]; p[i + 1] = t[1]; p[i + 2] = t[2]; }
    }
    c.putImageData(id, 0, 0);
    recol.set(clave, cv);
    return cv;
  }

  // Teñido: cada píxel toma el tono de una rampa del color pedido según su luz (conserva el sombreado).
  const tenidos = new Map();
  function tenida(src, hex) {
    const im = src;
    if (!im) return im;
    const clave = (im.src || im._id || (im._id = Math.random())) + '|' + hex;
    if (tenidos.has(clave)) return tenidos.get(clave);
    const r = [-0.86, -0.7, -0.52, -0.34, -0.16, 0, 0.18, 0.36, 0.55].map(f => hex2(SPR.luz(hex, f)));
    const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
    const c = cv.getContext('2d'); c.drawImage(im, 0, 0);
    const id = c.getImageData(0, 0, cv.width, cv.height), p = id.data;
    for (let i = 0; i < p.length; i += 4) {
      if (!p[i + 3]) continue;
      const l = (p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11) / 255;
      const t = r[Math.min(r.length - 1, Math.floor(l * r.length * 1.05))];
      p[i] = t[0]; p[i + 1] = t[1]; p[i + 2] = t[2];
    }
    c.putImageData(id, 0, 0);
    tenidos.set(clave, cv);
    return cv;
  }

  // ---------- Monstruos humanoides: se arman con piezas LPC ----------
  // piel: color (rampa generada) o nombre de paleta; capas extra: [item, color de teñido o rampa de tela].
  const MON = {
    hueco:     { piel:'zombie', cabeza:'cabeza_zombi', capas:[['pantalon', '#3a3a44', 'cloth'], ['camisa', '#55536a', 'cloth'], ['capa_rota', '#2a2a34', 'cloth']] },
    esqueleto: { cuerpo:'cuerpo_esqueleto', cabeza:'cabeza_calavera', capas:[['casco_nasal', 'iron', 'metal'], ['espada_hierro']] , arma:'espada_hierro' },
    lich:      { cuerpo:'cuerpo_esqueleto', cabeza:'cabeza_calavera', capas:[['capa_rota', '#3a2a5a', 'cloth'], ['gorro_mago', '#4a2a7a', 'tinte'], ['vara_aro']], arma:'vara_aro' },
    diablillo: { piel:'#c8402e', cabeza:'cabeza_goblin', capas:[['alas_murcielago', '#4a1414', 'tinte'], ['cola_lagarto', '#a8302a', 'tinte'], ['cuernos', '#3a2a2a', 'tinte'], ['daga']], arma:'daga', esc:0.85 },
    demonio:   { piel:'#9a2430', cabeza:'cabeza_minotauro', capas:[['pantalon', '#1a1014', 'cloth'], ['alas_murcielago', '#2a0a10', 'tinte'], ['cola_lagarto', '#7a1a22', 'tinte'], ['hacha']], arma:'hacha' },
    gargola:   { piel:'#7a7a86', cabeza:'cabeza_lagarto', capas:[['alas_lagarto', '#5a5a66', 'tinte'], ['cola_lagarto', '#6a6a76', 'tinte']] },
    salamandra:{ piel:'#e06a2a', cabeza:'cabeza_lagarto', capas:[['cola_lagarto', '#c04a1a', 'tinte'], ['lanza']], arma:'lanza' },
    golem:     { piel:'#8c8478', cabeza:'cabeza_troll', capas:[['guanteletes', 'iron', 'metal'], ['grebas', 'iron', 'metal']] },
    grakk:     { piel:'#c8501a', cabeza:'cabeza_orco', capas:[['pantalon', '#2a1a10', 'cloth'], ['cuernos', '#2a1a14', 'tinte'], ['capa_rota', '#3a1a0a', 'cloth'], ['corona'], ['hacha']], arma:'hacha' },
    vaelgor:   { piel:'#9a8ab0', cabeza:'cabeza_vampiro', capas:[['placas', 'iron', 'metal'], ['grebas', 'iron', 'metal'], ['escarpes', 'iron', 'metal'], ['alas_murcielago', '#24142e', 'tinte'], ['cuernos_atras', '#1a1020', 'tinte'], ['capa_rota', '#1a0a2a', 'cloth'], ['espada_luz_roja']], arma:'espada_luz_roja', brillo:'#b04aff' },
  };
  function recetaMonstruo(vis, C) {
    const M = MON[vis.clase] || (C.spr && MON[C.spr]);
    if (!M) return null;
    const piel = !M.piel ? null : M.piel[0] === '#' ? rampaDe(M.piel) : D.paletas.body[M.piel];
    const capas = [];
    const pon = (item, mat, r, tinte) => { if (D.items[item]) capas.push({ item, mat, rampa:r, tinte }); };
    const tp = M.piel && M.piel[0] === '#' ? M.piel : null; // piel de color: se tiñe cuerpo y cabeza igual
    pon(M.cuerpo || 'cuerpo', !tp && piel ? 'body' : null, tp ? null : piel, tp);
    pon(M.cabeza, !tp && piel ? 'body' : null, tp ? null : piel, tp);
    for (const [item, col, tipo] of M.capas) {
      if (tipo === 'tinte') pon(item, null, null, col);
      else if (tipo === 'metal') pon(item, 'metal', D.paletas.metal[col]);
      else if (tipo === 'cloth') pon(item, 'cloth', rampaDe(col));
      else pon(item, null, null);
    }
    return { cuerpo:'m', capas, arma:M.arma || null, rarezaArma:0, rarezaArmadura:0, esc:M.esc || 1, brillo:M.brillo };
  }

  // ---------- Bestias: hojas propias (lobo, araña, murciélago, fantasma, dragón) ----------
  const RM = 'arte/monstruos/';
  const BESTIAS = {
    lobo:      { src:'wolfsheet1_0.png', lado:true, fw:64, fh:32, x0:320, filas:{ w:{ walk:96, atk:64, ko:0 }, e:{ walk:288, atk:256, ko:192 } }, n:{ walk:5, atk:4, ko:4 }, pie:[34, 30], esc:1.1 },
    arana:     { src:'spiders/LPC_Spiders__spider01.png', fw:64, fh:64, filas:{ n:0, w:1, s:2, e:3 }, walk:[4, 5, 6, 7, 8, 9], atk:[0, 1, 2, 3], ko:{ fila:4, f:[0, 1, 2, 3] }, pie:[32, 50], esc:1.25 },
    murcielago:{ src:'monsters/lpc-monsters__bat.png', fw:64, fh:64, filas:{ n:0, w:1, s:2, e:3 }, walk:[1, 2, 3, 4], atk:[5, 6], pie:[32, 56], esc:1.7 },
    espectro:  { src:'monsters/lpc-monsters__ghost.png', fw:64, fh:64, filas:{ n:0, w:1, s:2, e:3 }, walk:[0, 1, 2, 1], atk:[4, 5], ko:{ fila:2, f:[3] }, pie:[32, 58], esc:1.0 },
    dragon:    { dir:{ e:'reddragonfly.png', s:'reddragonfly2.png', w:'reddragonfly3.png', n:'reddragonfly4.png' }, fw:205, fh:161, walk:[0, 1, 2, 3, 4, 5, 6, 7], atk:[12, 13, 14, 15], pie:[102, 132], esc:0.62, cols:4 },
  };
  const SPR_BESTIA = { lobo:'lobo', arana:'arana', murcielago:'murcielago', espectro:'espectro', dragon:'dragon', cancerbero:'lobo' };
  const TINTE_BESTIA = { lobo:'#a8b0c4', bestia:'#4a4e68', sabueso:'#6a1a14', cancerbero:'#2a1418', arana:'#6a5a7a', espectro:'#c8d4f0', voz:'#7a5aa8',
    wyvern:'#5a6a3a', thanatyr:'#2a2434', dragon_anciano:'#9a7a3a', vaelgor2:'#4a1a5a' };
  function bestiaDe(vis) {
    if (vis.mascota) return null;
    const C = CLASES[vis.clase]; if (!C || !C.mon) return null;
    const k = SPR_BESTIA[C.spr]; if (!k) return null;
    return { def:BESTIAS[k], tinte:TINTE_BESTIA[vis.clase] || null, brasas:vis.clase === 'sabueso' || vis.clase === 'cancerbero' };
  }
  function imgBestia(src, tinte) {
    const f = img('../monstruos/' + src);
    if (!f) return f;
    return tinte ? tenida(f, tinte) : f;
  }
  // accion: 'walk' (también quieto), 'atk', 'ko'. Devuelve false si no cargó.
  function dibujarBestia(ctx, vis, accion, fila, t, prog, x, y, esc) {
    const B = bestiaDe(vis); if (!B) return false;
    const d = B.def;
    let im, sx, sy;
    if (d.lado) {
      const lado = fila === 'e' || fila === 'n' ? 'e' : 'w';
      im = imgBestia(d.src, B.tinte); if (!im) return false;
      const n = d.n[accion] || d.n.walk;
      const fr = accion === 'walk' ? Math.floor(t / 130) % n : Math.min(n - 1, Math.floor(prog * n));
      sx = d.x0 + fr * d.fw; sy = d.filas[lado][accion] ?? d.filas[lado].walk;
    } else {
      const lista = accion === 'atk' ? d.atk : accion === 'ko' && d.ko ? d.ko.f : d.walk;
      const fr = accion === 'walk' ? lista[Math.floor(t / 140) % lista.length] : lista[Math.min(lista.length - 1, Math.floor(prog * lista.length))];
      if (d.dir) {
        im = imgBestia(d.dir[fila] || d.dir.s, B.tinte); if (!im) return false;
        sx = (fr % d.cols) * d.fw; sy = Math.floor(fr / d.cols) * d.fh;
      } else {
        im = imgBestia(d.src, B.tinte); if (!im) return false;
        const r = accion === 'ko' && d.ko ? d.ko.fila : d.filas[fila] ?? 2;
        sx = fr * d.fw; sy = r * d.fh;
      }
    }
    const e = esc * d.esc;
    ctx.save(); ctx.imageSmoothingEnabled = d.dir ? true : false;
    if (B.brasas) { ctx.shadowColor = 'rgba(255,90,30,.8)'; ctx.shadowBlur = 6 * esc * (0.7 + Math.sin(t / 200) * 0.3); }
    ctx.drawImage(im, sx, sy, d.fw, d.fh, x - d.pie[0] * e, y - d.pie[1] * e, d.fw * e, d.fh * e);
    ctx.restore();
    return true;
  }

  // ---------- Mascotas ----------
  const RMA = '../mascotas/';
  const MASC = {
    zorrito:   { src:'fox_woods.png', fw:64, fh:64, filas:{ s:0, w:1, e:2, n:3 }, walk:[0, 1, 2, 3], pie:[32, 58], esc:0.62 },
    perro:     { src:'dog_2.png', fw:32, fh:32, col0:4, filas:{ w:0, n:1, s:2, e:'w' }, walk:[0, 1, 2], pie:[16, 30], esc:1.05 },
    gatito:    { src:'cat_0.png', fw:32, fh:32, col0:4, filas:{ w:0, n:1, s:2, e:'w' }, walk:[0, 1, 2], pie:[16, 30], esc:0.95 },
    conejo:    { src:'rabbit_2.png', fw:72, fh:72, filas:{ n:0, w:1, s:2, e:3 }, walk:[0, 1, 2, 3], pie:[36, 58], esc:0.75 },
    halcon:    { src:'bird_2_eagle.png', fw:32, fh:32, filas:{ n:0, w:1, s:2, e:3 }, walk:[0, 1, 2], pie:[16, 30], esc:1.0, vuela:true },
    buho:      { src:'bird_2_brown_1.png', tinte:'#8a7ac8', fw:32, fh:32, filas:{ n:0, w:1, s:2, e:3 }, walk:[0, 1, 2], pie:[16, 30], esc:1.0, vuela:true },
    huron:     { src:'giant_rat_Sevarihk.png', tinte:'#c8a07a', fw:80, fh:64, filas:{ n:0, e:1, w:2, s:3 }, walk:[0, 1, 2, 3], pie:[40, 54], esc:0.42 },
    dragoncito:{ dragon:true, tinte:'#7a9ae0', esc:0.17 },
    tortuga:   { pixel:true, esc:1.1 },
  };
  // Tortuga en pixel art propio (no hay una LPC): mapa de píxeles, dos pasos.
  const TORTUGA = [['....oooooo.....', '...oGgGGgGo....', '..oGgGggGgGoooo', '..ogGgGGgGgosseo', '.ooooooooooosso', '.osso..osso....'],
                   ['....oooooo.....', '...oGgGGgGo....', '..oGgGggGgGoooo', '..ogGgGGgGgosseo', '.ooooooooooosso', '..oss..oss.....']];
  const COL_T = { o:'#1a2414', G:'#7aaa4c', g:'#4a7430', s:'#c8c070', e:'#000000' };
  function dibujarMascota(ctx, id, fila, t, x, y, esc) {
    const d = MASC[id]; if (!d) return false;
    const e = esc * d.esc;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    if (d.pixel) {
      const fr = TORTUGA[Math.floor(t / 220) % 2], espejo = fila === 'w' || fila === 'n';
      ctx.translate(x, y); if (espejo) ctx.scale(-1, 1);
      fr.forEach((row, j) => [...row].forEach((ch, i) => { if (COL_T[ch]) { ctx.fillStyle = COL_T[ch]; ctx.fillRect((i - 8) * e, (j - fr.length) * e, e + 0.3, e + 0.3); } }));
      ctx.restore(); return true;
    }
    if (d.dragon) {
      const b = BESTIAS.dragon, im = imgBestia(b.dir[fila] || b.dir.s, d.tinte); if (!im) { ctx.restore(); return false; }
      const fr = b.walk[Math.floor(t / 120) % b.walk.length];
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(im, (fr % b.cols) * b.fw, Math.floor(fr / b.cols) * b.fh, b.fw, b.fh, x - b.pie[0] * e, y - b.pie[1] * e - 6 * esc, b.fw * e, b.fh * e);
      ctx.restore(); return true;
    }
    const f = img(RMA + d.src); if (!f) { ctx.restore(); return false; }
    const im = d.tinte ? tenida(f, d.tinte) : f;
    const fr = d.walk[Math.floor(t / 150) % d.walk.length];
    let r = d.filas[fila] ?? d.filas.s, espejo = false;
    if (typeof r === 'string') { r = d.filas[r]; espejo = true; } // fila espejada del otro costado
    const sx = ((d.col0 || 0) + fr) * d.fw, sy = r * d.fh;
    const sube = d.vuela ? 10 * esc + Math.sin(t / 200) * 2 * esc : 0;
    if (espejo) { ctx.translate(x, 0); ctx.scale(-1, 1); x = 0; }
    ctx.drawImage(im, sx, sy, d.fw, d.fh, x - d.pie[0] * e, y - d.pie[1] * e - sube, d.fw * e, d.fh * e);
    ctx.restore();
    return true;
  }

  // ---------- Receta: qué capas lleva cada personaje ----------
  const FEM = new Set(['mara', 'nela', 'ysolde', 'saal', 'kaela', 'ilse', 'merla', 'berta']);
  const PELO_PJ = { lior:'pelo_revuelto', mara:'pelo_cola', tobias:'pelo_corto', nela:'pelo_trenza', brann:'pelo_liso', ysolde:'pelo_largo', fenn:'pelo_desalinado',
    aldous:'pelo_raya', odo:'pelo_liso', gris:'pelo_raya', vesk:'pelo_desalinado', saal:'pelo_suelto', corvin:'pelo_liso', kaela:'pelo_ondas', rook:'pelo_desalinado' };
  const PELOS_H = ['pelo_corto', 'pelo_revuelto', 'pelo_raya', 'pelo_liso', 'pelo_desalinado'];
  const PELOS_M = ['pelo_largo', 'pelo_suelto', 'pelo_ondas', 'pelo_cola', 'pelo_trenza', 'pelo_pixie'];
  const GORRO = { cinta:'panuelo', capucha:'capucha', casco:'casco_nasal', boina:'gorra_cuero', mitra:'gorro_celeste', sombrero:'gorro_mago', panuelo:'panuelo',
    yelmo:'casco_barbuta', cofia:'capucha', cuernos:'casco_cuernos', campana:'gorra_pluma', astas:'casco_vikingo', pluma:'gorra_pluma' };
  const ARMA_VIS = {
    espada_corta:'espada_hierro', espada_larga:'espada_larga', espada_caballero:'sable', hoja_runica:'espada_luz_azul', espada_infernal:'espada_luz_roja', hoja_alba:'espada_oro', matadragones:'mandoble',
    daga:'daga', maza_madera:'garrote', maza_bendita:'maza', martillo_sacro:'maza', maza_solar:'mangual', campana_plata:'maza', campanilla:'maza',
    hacha_lenador:'hacha', hacha_guerra:'hacha', gran_hacha:'hacha', hacha_obsidiana:'hacha',
    lanza_hierro:'lanza', pica:'lanza_larga', lanza_dentada:'alabarda', lanza_escama:'lanza_draco', lanza_celeste:'tridente',
    vara_roble:'vara_nudosa', vara_cuarzo:'vara_simple', vara_arcana:'vara_cristal', vara_estelar:'vara_diamante', vara_abismo:'vara_aro', baculo_eco:'vara_cristal_roja', cetro_nombres:'vara_diamante',
    arco_corto:'arco', arco_largo:'arco_grande', arco_compuesto:'arco_recurvo', arco_draco:'arco_draco', arco_estrella:'arco_grande', arco_fresno:'arco_recurvo',
  };
  const POR_TIPO = { espada:['espada_hierro', 'espada_larga', 'sable', 'espada_luz_azul', 'katana', 'espada_luz_roja'], daga:['daga'], hacha:['hacha'], maza:['garrote', 'maza', 'maza', 'mangual'],
    lanza:['lanza', 'lanza', 'lanza_larga', 'alabarda', 'lanza_draco'], vara:['vara_nudosa', 'vara_simple', 'vara_cristal', 'vara_diamante', 'vara_aro'], arco:['arco', 'arco_grande', 'arco_recurvo', 'arco_recurvo', 'arco_draco'] };
  const METAL = ['iron', 'iron', 'steel', 'silver', 'gold', 'gold', 'gold', 'gold', 'gold', 'gold'];
  const h = s => { let x = 2166136261; for (const ch of String(s)) x = Math.imul(x ^ ch.charCodeAt(0), 16777619); return x >>> 0; };

  function armaVis(a) {
    if (!a) return null;
    const d = EQ[a.id]; if (!d) return null;
    if (d.tipo === 'instrumento') return 'laud';
    if (ARMA_VIS[a.id]) return ARMA_VIS[a.id];
    const l = POR_TIPO[d.tipo]; if (!l) return null;
    return l[Math.min(l.length - 1, Math.max(0, (d.tier >= 9 ? 9 : d.tier) - 1))];
  }
  function sexo(vis) { const l = vis.look || {}; return l.sexo || (FEM.has(vis.unico) || l.estilo === 2 || (l.estilo === 1 && !l.barba && h(l.semilla || l.pelo) % 3 === 0) ? 'f' : 'm'); }

  // Devuelve { cuerpo:'m'|'f', capas:[{item, mat, rampa}], arma, brillo } o null si no es humano.
  function receta(vis) {
    if (vis.mascota) return null;
    const C = CLASES[vis.clase] || CLASES.recluta;
    if (C.mon && (MON[vis.clase] || MON[C.spr])) return recetaMonstruo(vis, C);
    if (C.spr && C.spr !== 'humano') return null;
    const asp = Object.assign({}, C.asp, vis.t ? SPR.TINTES[vis.t] : null, vis.asp);
    const look = vis.look || {}, cara = look.cara || {};
    const sx = sexo(vis), viejo = !!cara.arrugas;
    const piel = vis.clase === 'vesper' ? rampaDe('#d8cce0') : rampa('body', look.piel || '#f2c9a0');
    const pelo = rampa('hair', look.pelo || '#3a2a1e');
    const tela = rampa('cloth', asp.C), tela2 = rampa('cloth', asp.D || SPR.luz(asp.C, -0.3)), acento = rampa('cloth', asp.A || '#e8c86a');
    const eqv = vis.eqv || {};
    const ar = eqv.armadura ? EQ[eqv.armadura.id] : null;
    const tipoAr = ar ? ar.tipo : vis.asp ? 'tela' : (C.armad || ['tela'])[0];
    const tier = ar ? Math.min(9, ar.tier) : 1;
    const metal = D.paletas.metal[METAL[tier]];
    const capas = [];
    const pon = (item, mat, r) => { if (D.items[item]) capas.push({ item, mat, rampa:r }); };
    pon('cuerpo', 'body', piel);
    pon(vis.clase === 'vesper' ? 'cabeza_vampiro' : viejo ? (sx === 'f' ? 'cabeza_mv' : 'cabeza_hv') : (sx === 'f' ? 'cabeza_m' : 'cabeza_h'), 'body', piel);
    const lp = sx === 'f' ? PELOS_M : PELOS_H;
    const estiloPelo = PELO_PJ[vis.unico] || lp[h(look.semilla || (look.pelo + look.piel + (look.estilo ?? ''))) % lp.length];
    pon(sx === 'f' && !PELOS_M.includes(estiloPelo) && !PELO_PJ[vis.unico] ? lp[0] : estiloPelo, 'hair', pelo);
    if (look.barba) pon(viejo ? 'barba' : 'barba_corta', 'hair', pelo);
    if (cara.bigote) pon(look.barba ? 'bigote_morsa' : 'bigote', 'hair', pelo);
    pon('pantalon', 'cloth', tela2);
    pon('camisa', 'cloth', tela);
    if (tipoAr === 'cuero') pon('cuero', null, null);
    if (tipoAr === 'malla') {
      if (tier >= 3) { pon('placas', 'metal', metal); pon('grebas', 'metal', metal); pon('escarpes', 'metal', metal); if (tier >= 4) pon('guanteletes', 'metal', metal); }
      else pon('malla', 'metal', metal);
    }
    if (!(tipoAr === 'malla' && tier >= 3)) pon('botas', 'cloth', D.paletas.cloth.leather);
    if (tier >= 4 || (tipoAr === 'tela' && tier >= 2)) pon(tier >= 5 && tipoAr !== 'tela' ? 'capa_rota' : 'capa', 'cloth', tela2);
    if (vis.maestro && !capas.some(c => c.item.startsWith('capa'))) pon('capa', 'cloth', acento);
    let g = GORRO[asp.g];
    if (asp.g === 'yelmo' && tipoAr === 'malla' && tier >= 3) g = 'yelmo';
    if (vis.retrato && (g === 'yelmo' || g === 'casco_barbuta')) g = 'casco_nasal';
    if (vis.clase === 'trovador' || vis.clase === 'campanero') g = 'gorra_pluma';
    if (g && !vis.sinGorro) pon(g, ['capucha', 'panuelo'].includes(g) ? 'cloth' : D.items[g]?.mat || null, g === 'capucha' || g === 'panuelo' ? tela2 : D.items[g]?.mat === 'metal' ? metal : null);
    const av = armaVis(eqv.arma) || (vis.arma ? (POR_TIPO[vis.arma] || [])[0] : null);
    if (av && av !== 'laud') pon(av, null, null);
    const ra = eqv.arma?.r || 0, rr = eqv.armadura?.r || 0;
    return { cuerpo:sx, capas, arma:av, rarezaArma:ra, rarezaArmadura:rr };
  }

  // Animación para cada acción, según si el arma la tiene.
  function animDe(rec, accion) {
    const it = rec.arma && D.items[rec.arma];
    const tiene = a => it && it.capas.some(l => l.a[a]);
    if (accion === 'golpe') return rec.arma === 'lanza' || rec.arma === 'lanza_larga' || rec.arma === 'lanza_draco' || rec.arma === 'tridente' ? 'thrust' : (tiene('slash') || !it) ? 'slash' : tiene('thrust') ? 'thrust' : 'slash';
    if (accion === 'magia') return it && !tiene('spellcast') && tiene('thrust') ? 'thrust' : 'spellcast';
    if (accion === 'tiro') return rec.arma && rec.arma.startsWith('arco') ? 'shoot' : 'slash';
    return accion;
  }

  // Capas listas para una animación (cargando lo que falte). null si falta algo todavía.
  function capasListas(rec, anim) {
    const out = [];
    let falta = false;
    for (const c of rec.capas) {
      const it = D.items[c.item];
      for (const l of it.capas) {
        const a = l.a[anim] || (anim === 'hurt' ? null : null);
        if (!a) continue;
        const f = a[rec.cuerpo] || a.m || a.f;
        const im = c.tinte ? tenida(img(f), c.tinte) : recoloreada(f, c.rampa ? (c.mat || it.mat) : null, c.rampa);
        if (im === undefined) { falta = true; continue; }
        if (!im) continue;
        out.push({ z:l.z, im, s:a.s, arma:c.item === rec.arma });
      }
    }
    if (falta) return null;
    return out.sort((a, b) => a.z - b.z);
  }

  const FILA = { n:0, w:1, s:2, e:3 };
  const cache = new Map();
  function recetaDe(vis) {
    const k = JSON.stringify([vis.clase, vis.look, vis.t, vis.unico, vis.eqv, vis.arma, vis.asp, vis.sinGorro, vis.retrato, vis.maestro]);
    if (!cache.has(k)) cache.set(k, receta(vis));
    return cache.get(k);
  }
  // Dibuja un cuadro con los pies en (x, y). esc = píxeles de pantalla por píxel del sprite.
  // Devuelve false si todavía no está cargado (para usar el dibujo de respaldo).
  function dibujar(ctx, vis, anim, fila, frame, x, y, esc, opts = {}) {
    const rec = recetaDe(vis); if (!rec) return false;
    let capas = capasListas(rec, anim);
    if (!capas && anim !== 'walk') { anim = 'walk'; frame = 0; capas = capasListas(rec, 'walk'); }
    if (!capas) return false;
    const r = anim === 'hurt' ? 0 : FILA[fila] ?? 2;
    frame = Math.max(0, Math.min(FR[anim] - 1, frame));
    const t = opts.t || 0;
    const brillo = (rar, capa) => {
      if (rar < 2) return null;
      const col = RAREZAS[rar].c, pulso = rar >= 4 ? 0.65 + Math.sin(t / 180) * 0.35 : rar === 3 ? 0.75 + Math.sin(t / 400) * 0.2 : 0.55;
      return { col, blur: (rar >= 4 ? 7 : rar === 3 ? 5 : 3) * esc * pulso, capa };
    };
    esc *= rec.esc || 1;
    const bArma = brillo(rec.rarezaArma, true), bTodo = rec.brillo ? { col:rec.brillo } : brillo(rec.rarezaArmadura, false);
    const pinta = (l, sombra) => {
      const s = l.s, sx = frame * s, sy = r * s;
      if (sx + s > l.im.width || sy + s > l.im.height) return;
      // El cuadro estándar (64) tiene los pies en (32, 60); los grandes están centrados igual.
      const ox = x - (s / 2) * esc, oy = y - (s / 2 + 28) * esc;
      if (sombra) { ctx.shadowColor = sombra.col; ctx.shadowBlur = sombra.blur; }
      ctx.drawImage(l.im, sx, sy, s, s, ox, oy, s * esc, s * esc);
      if (sombra) { ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; }
    };
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    // Aura de la armadura legendaria o mítica: un halo detrás del cuerpo.
    if (bTodo && !opts.sinBrillo) {
      const g = ctx.createRadialGradient(x, y - 26 * esc, 2 * esc, x, y - 24 * esc, 26 * esc);
      g.addColorStop(0, bTodo.col + '66'); g.addColorStop(1, bTodo.col + '00');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y - 24 * esc, 18 * esc, 28 * esc, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Pasada de brillo del arma (debajo, así el arma queda nítida encima).
    if (bArma && !opts.sinBrillo) capas.filter(l => l.arma).forEach(l => pinta(l, bArma));
    capas.forEach(l => pinta(l, null));
    if (rec.arma === 'laud') laud(ctx, r, x, y, esc);
    ctx.restore();
    return true;
  }
  // Laúd colgado (no hay uno en LPC): dibujado en pixel art simple.
  function laud(ctx, fila, x, y, esc) {
    if (fila === 0) return;
    const lado = fila === 1 ? -1 : 1, px = x + (fila === 2 ? 9 : 4 * lado) * esc, py = y - 22 * esc;
    ctx.save(); ctx.translate(px, py); ctx.rotate(lado * -0.6); ctx.scale(esc, esc);
    ctx.fillStyle = '#2a1408'; ctx.fillRect(-1, -14, 2, 10);
    ctx.fillStyle = '#3a2010'; ctx.fillRect(-1.5, -16, 3, 3);
    ctx.fillStyle = '#2a1408'; ctx.beginPath(); ctx.ellipse(0, 0, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c8823a'; ctx.beginPath(); ctx.ellipse(0, 0, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8a85a'; ctx.fillRect(-2, -3, 2, 2);
    ctx.fillStyle = '#2a1408'; ctx.beginPath(); ctx.arc(0, -1, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function frames(anim) { return FR[anim]; }
  function esHumano(vis) { return !!recetaDe(vis); }
  // Precarga la caminata de una lista de vis (para que los menús ya la tengan).
  function precargar(lista) { lista.forEach(v => { const r = recetaDe(v); if (r) capasListas(r, 'walk'); }); }
  function alCargar(fn) { avisar = fn; }
  return { dibujar, animDe, recetaDe, frames, esHumano, precargar, alCargar, receta, sexo, dibujarBestia, esBestia:v => !!bestiaDe(v), dibujarMascota, esMascota:id => !!MASC[id], tenida };
})();
