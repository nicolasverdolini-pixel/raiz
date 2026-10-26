// Campanas de Bruma — Acto III: El Coro del Eco. Islas al este, una campana que borra el dolor y una hermana que no quiere olvidar.
'use strict';

// ---------- Mapas ----------
Object.assign(MAPAS, {
  arrecife: ['W0 W0 a1 a1 W0 W0 a1 a1 W0', 'W0 a1 a2 a1 w0 a1 a2 a1 W0', 'a1 a1 r2 a1 w0 a1 a1 a1 a1', 'w0 a1 a1 a1 w0 w0 a1 r1 w0', 'w0 w0 a1 w0 w0 a1 a1 w0 w0', 'W0 w0 a1 a1 a1 a1 w0 w0 W0', 'W0 w0 w0 a1 r1 a1 w0 a1 W0', 'a1 a1 w0 a1 a1 a1 w0 a1 a1', 'a1 a2 a1 a1 w0 a1 a1 a2 a1', 'a1 a1 a1 a1 a1 a1 a1 a1 a1', 'W0 a1 a1 a1 a1 a1 a1 a1 W0'],
  puerto_eco: ['R3 R3 c1 c1 c1 c1 c1 R3 R3', 'R3 R3 c1 c2 c2 c2 c1 R3 R3', 'c1 c1 c1 c2 c3 c2 c1 c1 c1', 'c1 b1 b1 c1 c2 c1 b1 b1 c1', 'w0 b1 c1 c1 c1 c1 c1 b1 w0', 'w0 c1 c1 R3 c1 R3 c1 c1 w0', 'c1 c1 c1 R3 c1 R3 c1 c1 c1', 'c1 c1 c1 c1 c1 c1 c1 c1 c1', 'W0 b1 b1 c1 c1 c1 b1 b1 W0', 'W0 c1 c1 c1 c1 c1 c1 c1 W0', 'W0 c1 c1 c1 c1 c1 c1 c1 W0'],
  coral: ['f2 f2 t2 f2 f2 f2 t2 f2 f2', 'f2 t2 f2 f2 g2 f2 f2 t2 f2', 'g1 g1 f1 w0 w0 w0 f1 g1 g1', 'g1 t1 g1 w0 W0 w0 g1 t1 g1', 'a1 g1 g1 g1 w0 g1 g1 g1 a1', 'a1 a1 g1 t1 g1 t1 g1 a1 a1', 'w0 a1 g1 g1 g1 g1 g1 a1 w0', 'w0 a1 a1 g1 r1 g1 a1 a1 w0', 'W0 w0 a1 g1 g1 g1 a1 w0 W0', 'W0 a1 a1 a1 g1 a1 a1 a1 W0', 'W0 a1 a1 a1 a1 a1 a1 a1 W0'],
  faro: ['x0 x0 s6 s7 s7 s7 s6 x0 x0', 'x0 s5 s6 u7 u7 u7 s6 s5 x0', 'x0 s5 u5 u6 u6 u6 u5 s5 x0', 'W0 s4 u4 u4 u5 u4 u4 s4 W0', 'W0 s3 u3 u3 u4 u3 u3 s3 W0', 'W0 W0 u3 r3 u3 u3 u2 W0 W0', 'W0 a1 u2 u2 u2 u2 u2 a1 W0', 'w0 a1 a1 u1 u1 u1 a1 a1 w0', 'w0 a1 a1 a1 u1 a1 a1 a1 w0', 'W0 a1 a1 a1 a1 a1 a1 a1 W0', 'W0 W0 a1 a1 a1 a1 a1 W0 W0'],
  templo: ['p3 p3 p3 p4 p4 p4 p3 p3 p3', 'p3 s5 p3 p3 p4 p3 p3 s5 p3', 'w0 p2 p2 p3 p3 p3 p2 p2 w0', 'w0 w0 p2 p2 w0 p2 p2 w0 w0', 'W0 w0 p2 w0 w0 w0 p2 w0 W0', 'W0 p1 p1 p1 w0 p1 p1 p1 W0', 'w0 p1 s3 p1 p1 p1 s3 p1 w0', 'w0 p1 p1 p1 p1 p1 p1 p1 w0', 'W0 w0 p1 p1 p1 p1 p1 w0 W0', 'W0 p1 p1 p1 p1 p1 p1 p1 W0', 'W0 p1 p1 p1 p1 p1 p1 p1 W0'],
  escalinata: ['x0 u7 u7 u7 u7 u7 u7 u7 x0', 'x0 u7 s8 u7 u7 u7 s8 u7 x0', 'x0 x0 u6 u6 u6 u6 u6 x0 x0', 'x0 x0 u5 u5 u5 u5 u5 x0 x0', 'x0 f4 f4 u4 u4 u4 f4 f4 x0', 'x0 f4 t4 u3 u3 u3 t4 f4 x0', 'x0 x0 u3 u2 u2 u2 u3 x0 x0', 'x0 g2 g2 u2 u1 u2 g2 g2 x0', 'g1 g1 g1 u1 u1 u1 g1 g1 g1', 'g1 g1 g1 u1 u1 u1 g1 g1 g1', 'g1 g1 g1 g1 g1 g1 g1 g1 g1'],
  jardin: ['f2 f2 t2 f2 w0 f2 t2 f2 f2', 'f2 g2 g2 f2 w0 f2 g2 g2 f2', 't2 g2 c2 c2 c2 c2 c2 g2 t2', 'f1 g1 c1 f1 w0 f1 c1 g1 f1', 'f1 t1 c1 w0 W0 w0 c1 t1 f1', 'f1 g1 c1 f1 w0 f1 c1 g1 f1', 't1 g1 c1 c1 c1 c1 c1 g1 t1', 'f1 g1 g1 f1 c1 f1 g1 g1 f1', 'f1 f1 g1 g1 c1 g1 g1 f1 f1', 'g1 g1 g1 g1 c1 g1 g1 g1 g1', 'g1 g1 g1 g1 g1 g1 g1 g1 g1'],
  puertas_coro: ['R4 R4 u4 u4 u4 u4 u4 R4 R4', 'R4 R4 u4 k4 k4 k4 u4 R4 R4', 'u3 u3 u3 k3 k3 k3 u3 u3 u3', 'u3 s4 u3 u3 k3 u3 u3 s4 u3', 'u2 u2 u2 u2 k2 u2 u2 u2 u2', 'u2 r2 u2 u2 k2 u2 u2 r2 u2', 'w0 u1 u1 u1 k1 u1 u1 u1 w0', 'w0 u1 u1 u1 k1 u1 u1 u1 w0', 'W0 w0 u1 u1 u1 u1 u1 w0 W0', 'W0 u1 u1 u1 u1 u1 u1 u1 W0', 'W0 u1 u1 u1 u1 u1 u1 u1 W0'],
  nave: ['k3 k3 p3 p3 p3 p3 p3 k3 k3', 'k3 s5 p3 p4 p4 p4 p3 s5 k3', 'k2 k2 p2 p3 p3 p3 p2 k2 k2', 'k2 s4 k2 p2 p2 p2 k2 s4 k2', 'k1 k1 k1 k1 p2 k1 k1 k1 k1', 'k1 s3 k1 k1 p1 k1 k1 s3 k1', 'k1 k1 k1 k1 p1 k1 k1 k1 k1', 'k1 s3 k1 k1 p1 k1 k1 s3 k1', 'k1 k1 k1 k1 k1 k1 k1 k1 k1', 'k1 k1 k1 k1 k1 k1 k1 k1 k1', 'k1 k1 k1 k1 k1 k1 k1 k1 k1'],
  cumbre: ['x0 x0 u6 u6 u6 u6 u6 x0 x0', 'x0 u6 u6 p7 p7 p7 u6 u6 x0', 'x0 u5 u6 p6 p6 p6 u6 u5 x0', 'x0 u5 u5 u5 p5 u5 u5 u5 x0', 'x0 x0 u4 u4 u5 u4 u4 x0 x0', 'x0 u4 u4 x0 u4 x0 u4 u4 x0', 'x0 u3 u3 u3 u3 u3 u3 u3 x0', 'x0 x0 u2 u3 u3 u3 u2 x0 x0', 'x0 u2 u2 u2 u2 u2 u2 u2 x0', 'u1 u1 u2 u2 u2 u2 u2 u1 u1', 'u1 u1 u1 u1 u1 u1 u1 u1 u1'],
  eco_final: ['x0 p6 p6 p6 p6 p6 p6 p6 x0', 'x0 p6 p7 p7 p7 p7 p7 p6 x0', 'x0 p5 p6 p6 p6 p6 p6 p5 x0', 'x0 x0 p5 p5 p5 p5 p5 x0 x0', 'x0 p4 p4 x0 p5 x0 p4 p4 x0', 'x0 p4 p4 x0 p4 x0 p4 p4 x0', 'x0 p3 p3 p3 p4 p3 p3 p3 x0', 'x0 x0 p3 p3 p3 p3 p3 x0 x0', 'x0 p2 p2 p3 p3 p3 p2 p2 x0', 'p1 p2 p2 p2 p2 p2 p2 p2 p1', 'p1 p1 p1 p1 p1 p1 p1 p1 p1'],
});
Object.assign(FONDOS, { arrecife:'#163a4a', puerto_eco:'#1a2e3e', coral:'#163a3a', faro:'#121e2e', templo:'#141428', escalinata:'#1e2a3a', jardin:'#1a2e24', puertas_coro:'#1e1e2e', nave:'#14101e', cumbre:'#1a1a2a', eco_final:'#0a0814' });
Object.assign(AMBIENTE, { arrecife:'lluvia', puerto_eco:'lluvia', coral:'hojas', faro:'lluvia', templo:'bruma', escalinata:'hojas', jardin:'hojas', puertas_coro:'bruma', nave:'bruma', cumbre:'nieve', eco_final:'bruma' });
SPR.TINTES.coro = { C:'#e4dcf0', D:'#8a7aaa', A:'#e8c060' };

// ---------- Habilidades de los monstruos nuevos ----------
Object.assign(HAB, {
  marea:          { n:'Marea', d:'', tipo:'mag', mp:10, r:[1,4], a:1, p:34, el:'hielo', fx:'hielo' },
  canto_sirena:   { n:'Canto de sirena', d:'', tipo:'apoyo', mp:10, r:[1,4], a:1, af:'e', est:[{id:'dormido',prob:45,dur:2}], fx:'sonido' },
  golpe_bronce:   { n:'Golpe de bronce', d:'', tipo:'fis', mp:0, r:[1,1], p:1.6, est:[{id:'aturdido',prob:30,dur:1}], fx:'golpe' },
  eco_devastador: { carga:14, n:'Eco devastador', d:'', tipo:'mag', mp:22, r:[0,0], a:3, p:48, el:'sonido', fx:'sonido' },
  coro_olvido:    { n:'Coro del olvido', d:'', tipo:'apoyo', mp:14, r:[1,5], a:2, af:'e', est:[{id:'silencio',prob:55,dur:2},{id:'lento',prob:45,dur:2}], fx:'sonido' },
  aliento_marea:  { n:'Aliento de marea', d:'', tipo:'mag', mp:16, r:[1,4], a:1, p:52, el:'hielo', fx:'hielo' },
  // Propias de Liss
  voz_hermana:    { propia:true, n:'Voz de hermana', d:'Una canción que cura a los aliados cercanos.', tipo:'cura', mp:12, r:[0,0], a:2, af:'a', p:38, fx:'cura' },
  contracanto:    { propia:true, n:'Contracanto', d:'Silencia a los enemigos de un área.', tipo:'apoyo', mp:14, r:[1,5], a:1, af:'e', est:[{id:'silencio',prob:70,dur:3}], fx:'sonido' },
  nota_recuerdo:  { propia:true, carga:16, n:'La nota que recuerda', d:'La nota que la Campana Primera no puede tocar.', tipo:'mag', mp:34, r:[1,5], a:2, p:66, el:'sonido', fx:'sonido' },
});

// ---------- Monstruos nuevos ----------
Object.assign(CLASES, {
  sirena:        { n:'Sirena del Eco', mon:true, spr:'espectro', vuela:true, m:{hp:1.0,mp:1.3,atk:0.7,def:0.9,mag:1.3,res:1.3,spd:1.1}, mov:4, salto:9, eva:12, poder:7, habs:['marea','canto_sirena'], debil:['rayo'], asp:{C:'#6ad0d8'} },
  guardian:      { n:'Guardián de Bronce', mon:true, spr:'golem', tam:1.8, m:{hp:3.6,mp:1.0,atk:1.4,def:1.6,mag:0.7,res:1.0,spd:0.8}, mov:3, salto:1, eva:0, poder:9, habs:['golpe_bronce','temblor'], debil:['rayo'], asp:{C:'#b08a3a'} },
  dragon_marino: { n:'Dragón de las Mareas', mon:true, spr:'dragon', tam:2.0, raza:'dragon', vuela:true, m:{hp:4.2,mp:1.6,atk:1.4,def:1.3,mag:1.4,res:1.3,spd:1.05}, mov:4, salto:9, eva:5, poder:9, habs:['aliento_marea','marea'], debil:['rayo'], resEl:{ hielo:0.5 }, asp:{C:'#2a8a9a'} },
  eco:           { n:'El Eco Primero', mon:true, spr:'espectro', tam:2.2, vuela:true, m:{hp:6.0,mp:3.0,atk:1.3,def:1.35,mag:1.6,res:1.45,spd:1.1}, mov:3, salto:9, eva:5, poder:9, habs:['eco_devastador','coro_olvido','olvido','voz_bruma'], debil:['sonido'], asp:{C:'#e8c860'} },
});
LPC.agregarMonstruo('guardian', { piel:'#b08a3a', cabeza:'cabeza_troll', capas:[['guanteletes', 'gold', 'metal'], ['grebas', 'gold', 'metal'], ['placas', 'gold', 'metal']] });
LPC.tinteBestia('sirena', '#6ad0d8');
LPC.tinteBestia('dragon_marino', '#2a8a9a');
LPC.tinteBestia('eco', '#e8c860');

// ---------- Equipo del Acto III (capítulo 11+) ----------
Object.assign(EQ, {
  espada_coral:     { rasgos:['critico', 'regen'], n:'Espada de coral', slot:'arma', tipo:'espada', poder:30, el:'hielo', precio:6200, tier:6, gemas:2 },
  hacha_marea:      { rasgos:['perforar', 'vampiro'], n:'Hacha de las mareas', slot:'arma', tipo:'hacha', poder:31, precio:6000, tier:6, gemas:2 },
  daga_eco:         { rasgos:['critico', 'esquiva'], n:'Daga del eco', slot:'arma', tipo:'daga', poder:25, precio:5600, tier:6, gemas:2 },
  arco_faro:        { rasgos:['alcance', 'perforar'], n:'Arco del faro', slot:'arma', tipo:'arco', poder:25, el:'luz', precio:6100, tier:6, gemas:2 },
  vara_perla:       { rasgos:['mp_regen', 'drenar_mp'], n:'Vara de perla', slot:'arma', tipo:'vara', poder:13, mag:18, precio:6300, tier:6, gemas:2 },
  maza_campana:     { rasgos:['aturdir', 'regen'], n:'Maza campana', slot:'arma', tipo:'maza', poder:22, mag:13, el:'sonido', precio:6200, tier:6, gemas:2 },
  tridente_mar:     { rasgos:['alcance', 'critico'], n:'Tridente del mar', slot:'arma', tipo:'lanza', poder:29, el:'hielo', precio:6200, tier:6, gemas:2 },
  guantes_coral:    { rasgos:['aturdir', 'vampiro'], n:'Guantes de coral', slot:'arma', tipo:'puños', poder:16, precio:5800, tier:6, gemas:2 },
  arpa_sirena:      { rasgos:['mp_regen', 'prisa_ini'], n:'Arpa de sirena', slot:'arma', tipo:'instrumento', poder:15, mag:18, precio:6200, tier:6, gemas:2 },
  tunica_coro:      { rasgos:['mp_regen', 'escudo'], n:'Túnica del Coro', slot:'armadura', tipo:'tela', def:20, res:27, mp:30, precio:5900, tier:6, gemas:2 },
  cuero_tiburon:    { rasgos:['esquiva', 'regen'], n:'Cuero de tiburón', slot:'armadura', tipo:'cuero', def:28, res:14, precio:5900, tier:6, gemas:2 },
  armadura_bronce:  { rasgos:['escudo', 'contra'], n:'Armadura de bronce', slot:'armadura', tipo:'malla', def:36, res:12, precio:6400, tier:6, gemas:2 },
  anillo_marea:     { rasgos:['mp_regen'], n:'Anillo de la marea', slot:'acc', mag:7, res:5, precio:4200, tier:6, gemas:1 },
  amuleto_eco:      { rasgos:['escudo', 'esquiva'], n:'Amuleto del eco', slot:'acc', def:5, res:5, inmune:['silencio', 'dormido'], precio:4400, tier:6, gemas:1 },
  campana_primera:  { rasgos:['mp_regen', 'prisa_ini', 'regen'], n:'Campanita de la Primera', slot:'arma', tipo:'maza', poder:26, mag:20, el:'sonido', precio:0, tier:9, gemas:3, forja:true },
  laud_seren:       { rasgos:['mp_regen', 'prisa_ini', 'escudo'], n:'Laúd de Seren', slot:'arma', tipo:'instrumento', poder:19, mag:24, precio:0, tier:9, gemas:3, forja:true },
});
Object.assign(MAT, { perla_eco:{ n:'Perla del eco', d:'Si la acercás al oído, se escucha una voz que no es la tuya.', c:'#c8e8f0' } });
FORJA.push(
  { id:'campana_primera', oro:8000, mat:{ perla_eco:5, esquirla:3 } },
  { id:'laud_seren',      oro:8000, mat:{ perla_eco:4, escama:2 } },
);
// Las tiendas venden el equipo nuevo desde el Acto III, y los enemigos lo usan.
const _tierActual = tierActual;
tierActual = () => G.paso >= 27 ? 6 : _tierActual();
const _capituloActual = capituloActual;
capituloActual = () => G.paso >= 27 ? [11, 11, 11, 12, 12, 12, 13, 13, 13, 14, 14, 14, 14][Math.min(G.paso - 27, 12)] : _capituloActual();
const _equipoEnemigo = equipoEnemigo;
equipoEnemigo = (cid, nv) => {
  if (nv < 66 || CLASES[cid].mon) return _equipoEnemigo(cid, nv);
  const C = CLASES[cid], eq = { arma:null, armadura:null, acc:null };
  const de = filtro => Object.entries(EQ).filter(([id, d]) => d.tier === 6 && filtro(d))[0];
  const a = de(d => d.slot === 'arma' && d.tipo === C.armas[0]); if (a) eq.arma = { id:a[0], mejora:Math.floor(nv / 8), gemas:[] };
  const r = de(d => d.slot === 'armadura' && d.tipo === C.armad[0]); if (r) eq.armadura = { id:r[0], mejora:Math.floor(nv / 8), gemas:[] };
  return eq;
};

// ---------- Personajes ----------
Object.assign(PJ, {
  liss:  { n:'Liss', clase:'cantor', look:{ pelo:'#d8d8e8', piel:'#f2c9a0', estilo:2, cara:{ ojos:2, iris:'#2a8a8a', cejas:4, boca:0, pestanas:true, pecas:true } } },
  seren: { n:'Seren', clase:'cantor', t:'coro', look:{ pelo:'#e8e8f4', piel:'#f2c9a0', estilo:2, cara:{ ojos:2, iris:'#2a8a8a', cejas:2, boca:1, pestanas:true } } },
  coral: { n:'Maestro Coral', clase:'trovador', t:'coro', look:{ pelo:'#3a2a1e', piel:'#c88a5a', barba:true, estilo:0, cara:{ ojos:3, cejas:1, boca:3, bigote:true } } },
  ivor:  { n:'Hermana Ívor', clase:'nigromante', t:'coro', look:{ pelo:'#1a1a22', piel:'#e8dcd0', estilo:2, cara:{ ojos:4, iris:'#8a3a9a', cejas:2, boca:4, pestanas:true } } },
  nym:   { n:'Oráculo Nym', clase:'medium', t:'coro', look:{ pelo:'#f0f0f0', piel:'#9a6440', estilo:1, cara:{ ojos:4, iris:'#e8c060', cejas:3, boca:0, arrugas:true } } },
  eco:   { n:'El Eco Primero', clase:'eco' },
});
RECLUTAS_HISTORIA.liss = { nv:68, clases:{ novicio:450, recluta:200, cantor:1000 }, apr:['himno_valor', 'canto_sereno', 'nana', 'coral_escudo'], eq:['arpa_sirena', 'tunica_coro'] };
FAC_UNICOS.liss = { hp:0.95, mp:1.1, atk:0.9, def:0.95, mag:1.08, res:1.06, spd:1.05 };
PROPIAS.liss = [['voz_hermana', 10], ['contracanto', 25], ['nota_recuerdo', 40]];

// ---------- Batallas ----------
const A3 = [[3, 9], [4, 9], [5, 9], [3, 10], [5, 10]];
Object.assign(BATALLAS, {
  b28: { n:'Muelles de Garza en llamas', mapa:'muelles', musica:'batalla', oro:9000, aliados:[[3, 9], [4, 9], [5, 9], [3, 10], [4, 10]],
         e:[ {c:'berserker',nv:66,x:4,y:0,t:'coro'}, {c:'nigromante',nv:66,x:2,y:0,t:'coro'}, {c:'trovador',nv:66,x:6,y:1,t:'coro'}, {c:'cantor',nv:66,x:7,y:2,t:'coro'}, {c:'berserker',nv:66,x:4,y:2,t:'coro'} ],
         objetivo:'Derrotá a todos los enemigos', mat:{perla_eco:1} },
  b29: { n:'Arrecife de los Lamentos', mapa:'arrecife', musica:'batalla', oro:9400, aliados:A3,
         e:[ {c:'sirena',nv:67,x:2,y:1}, {c:'sirena',nv:67,x:6,y:1}, {c:'espectro',nv:67,x:3,y:0}, {c:'murcielago',nv:67,x:1,y:2}, {c:'murcielago',nv:67,x:7,y:2}, {c:'arana',nv:67,x:5,y:4} ],
         objetivo:'Derrotá a todos los enemigos', mat:{perla_eco:1} },
  b30: { n:'Puerto Eco tomado', mapa:'puerto_eco', musica:'jefe', oro:10000, aliados:A3,
         e:[ {c:'trovador',nv:70,x:4,y:2,n:'Maestro Coral',jefe:true,t:'coro'}, {c:'cantor',nv:68,x:2,y:2,t:'coro'}, {c:'cantor',nv:68,x:6,y:2,t:'coro'}, {c:'alquimista',nv:68,x:3,y:4,t:'coro'}, {c:'berserker',nv:68,x:5,y:4,t:'coro'} ],
         objetivo:'Derrotá al Maestro Coral', jefeGana:true, mat:{perla_eco:2}, gema:'zafiro' },
  b31: { n:'Bosque de Coral', mapa:'coral', musica:'batalla', oro:10400, aliados:A3,
         e:[ {c:'domador',nv:70,x:4,y:1,t:'coro'}, {c:'bestia',nv:70,x:3,y:0}, {c:'bestia',nv:70,x:5,y:0}, {c:'lobo',nv:70,x:2,y:4}, {c:'lobo',nv:70,x:6,y:4}, {c:'domador',nv:70,x:8,y:2,t:'coro'} ],
         objetivo:'Derrotá a todos los enemigos', mat:{perla_eco:1} },
  b32: { n:'El Faro Roto', mapa:'faro', musica:'batalla', oro:10800, aliados:A3,
         e:[ {c:'gargola',nv:72,x:3,y:1}, {c:'gargola',nv:72,x:5,y:1}, {c:'golem',nv:72,x:4,y:2}, {c:'sirena',nv:71,x:2,y:4}, {c:'sirena',nv:71,x:6,y:4} ],
         objetivo:'Derrotá a todos los enemigos', mat:{perla_eco:1, esquirla:1} },
  b33: { n:'El Templo Sumergido', mapa:'templo', musica:'jefe', oro:11500, aliados:A3,
         e:[ {c:'nigromante',nv:74,x:4,y:1,n:'Hermana Ívor',jefe:true,t:'coro'}, {c:'lich',nv:72,x:2,y:2}, {c:'lich',nv:72,x:6,y:2}, {c:'esqueleto',nv:72,x:3,y:5}, {c:'esqueleto',nv:72,x:5,y:5}, {c:'espectro',nv:72,x:4,y:0} ],
         objetivo:'Derrotá a la Hermana Ívor', jefeGana:true, mat:{perla_eco:2, cuerno:1}, gema:'amatista' },
  b34: { n:'La Escalinata de las Voces', mapa:'escalinata', musica:'batalla', oro:12000, aliados:A3,
         e:[ {c:'cantor',nv:75,x:3,y:0,t:'coro'}, {c:'cantor',nv:75,x:5,y:0,t:'coro'}, {c:'trovador',nv:75,x:4,y:2,t:'coro'}, {c:'alquimista',nv:75,x:3,y:4,t:'coro'}, {c:'alquimista',nv:75,x:5,y:4,t:'coro'}, {c:'berserker',nv:75,x:4,y:6,t:'coro'} ],
         objetivo:'Derrotá a todos los enemigos', mat:{perla_eco:2} },
  b35: { n:'El Jardín de los Ecos', mapa:'jardin', musica:'jefe', oro:12600, aliados:A3,
         e:[ {c:'medium',nv:77,x:4,y:2,n:'Oráculo Nym',jefe:true,t:'coro'}, {c:'medium',nv:75,x:2,y:2,t:'coro'}, {c:'espectro',nv:75,x:6,y:2}, {c:'sirena',nv:75,x:2,y:6}, {c:'sirena',nv:75,x:6,y:6} ],
         objetivo:'Derrotá al Oráculo Nym', jefeGana:true, mat:{perla_eco:2}, gema:'opalo' },
  b36: { n:'Las Puertas del Coro', mapa:'puertas_coro', musica:'jefe', oro:13200, aliados:A3,
         e:[ {c:'guardian',nv:78,x:4,y:2,n:'Guardián de Bronce',jefe:true}, {c:'golem',nv:76,x:2,y:3}, {c:'golem',nv:76,x:6,y:3}, {c:'cantor',nv:76,x:3,y:1,t:'coro'}, {c:'cantor',nv:76,x:5,y:1,t:'coro'} ],
         objetivo:'Derrotá al Guardián de Bronce', jefeGana:true, mat:{perla_eco:2, esquirla:2} },
  b37: { n:'La Nave del Coro', mapa:'nave', musica:'batalla', oro:14000, aliados:A3,
         e:[ {c:'berserker',nv:79,x:4,y:1,t:'coro'}, {c:'nigromante',nv:79,x:2,y:2,t:'coro'}, {c:'medium',nv:79,x:6,y:2,t:'coro'}, {c:'trovador',nv:79,x:3,y:4,t:'coro'}, {c:'domador',nv:79,x:5,y:4,t:'coro'}, {c:'bestia',nv:79,x:4,y:6} ],
         objetivo:'Derrotá a todos los enemigos', mat:{perla_eco:2} },
  b38: { n:'Seren, la Directora del Coro', mapa:'cumbre', musica:'final', oro:16000, aliados:A3,
         e:[ {c:'cantor',nv:81,x:4,y:1,n:'Seren',jefe:true,t:'coro'}, {c:'medium',nv:79,x:2,y:3,t:'coro'}, {c:'nigromante',nv:79,x:6,y:3,t:'coro'}, {c:'sirena',nv:79,x:3,y:6}, {c:'sirena',nv:79,x:5,y:6} ],
         objetivo:'Derrotá a Seren', jefeGana:true, mat:{perla_eco:3} },
  b39: { n:'El Eco Primero', mapa:'eco_final', musica:'final', oro:24000, aliados:A3,
         e:[ {c:'eco',nv:84,x:4,y:2,n:'El Eco Primero',jefe:true}, {c:'espectro',nv:80,x:1,y:4}, {c:'espectro',nv:80,x:7,y:4}, {c:'sirena',nv:80,x:2,y:1}, {c:'sirena',nv:80,x:6,y:1} ],
         objetivo:'Silenciá al Eco Primero', jefeGana:true, mat:{perla_eco:5, esquirla:3} },
});

// ---------- Región este: Islas del Eco ----------
Object.assign(NODOS, {
  puerto_este:  { n:'Barco a las Islas del Eco', tipo:'campo', region:'norte', x:90, y:90, desde:28, portal:'este', acto:3 },
  portal_oeste: { n:'Volver a Aldmora', tipo:'campo', region:'este', x:8, y:50, desde:28, portal:'norte', acto:3 },
  arrecife:     { n:'Arrecife de los Lamentos', tipo:'campo', region:'este', x:22, y:40, desde:28, batalla:'b29', patrulla:['sirena', 'espectro', 'murcielago'], acto:3 },
  eco:          { n:'Puerto Eco', tipo:'pueblo', region:'este', x:36, y:28, desde:29, batalla:'b30', tienda:true, herreria:true, taberna:true, mascotas:true, gemas:true, patrulla:['cantor:coro', 'alquimista:coro'], acto:3 },
  coral:        { n:'Bosque de Coral', tipo:'campo', region:'este', x:54, y:20, desde:30, batalla:'b31', patrulla:['bestia', 'lobo', 'domador:coro'], acto:3 },
  faro:         { n:'El Faro Roto', tipo:'campo', region:'este', x:74, y:14, desde:31, batalla:'b32', patrulla:['gargola', 'golem', 'sirena'], acto:3 },
  templo:       { n:'Templo Sumergido', tipo:'campo', region:'este', x:82, y:34, desde:32, batalla:'b33', patrulla:['lich', 'esqueleto', 'espectro'], acto:3 },
  escalinata:   { n:'Escalinata de las Voces', tipo:'campo', region:'este', x:66, y:48, desde:33, batalla:'b34', patrulla:['cantor:coro', 'trovador:coro', 'alquimista:coro'], acto:3 },
  jardin:       { n:'Jardín de los Ecos', tipo:'campo', region:'este', x:46, y:58, desde:34, batalla:'b35', patrulla:['medium:coro', 'espectro', 'sirena'], acto:3 },
  puertas_coro: { n:'Puertas del Coro', tipo:'campo', region:'este', x:30, y:70, desde:35, batalla:'b36', patrulla:['golem', 'cantor:coro'], acto:3 },
  nave:         { n:'La Nave del Coro', tipo:'campo', region:'este', x:50, y:80, desde:36, batalla:'b37', patrulla:['berserker:coro', 'medium:coro', 'bestia'], acto:3 },
  cumbre:       { n:'Cumbre de la Campana', tipo:'campo', region:'este', x:70, y:88, desde:37, batalla:'b38', patrulla:['sirena', 'medium:coro', 'nigromante:coro'], acto:3 },
});
CAMINOS.push(['muelles', 'puerto_este'], ['portal_oeste', 'arrecife'], ['arrecife', 'eco'], ['eco', 'coral'], ['coral', 'faro'], ['faro', 'templo'], ['templo', 'escalinata'], ['escalinata', 'jardin'], ['jardin', 'puertas_coro'], ['puertas_coro', 'nave'], ['nave', 'cumbre']);

// ---------- Historia ----------
(() => {
  const fin = HISTORIA[HISTORIA.length - 1].despues;
  fin[fin.length - 1] = [null, 'FIN DEL ACTO II.'];
})();
HISTORIA.push(
  { b:'b28', nodo:'muelles', cap:'Acto III — Capítulo 11: Nombres que no volvieron',
    antes:[
      [null, 'Pasó un mes. Los Huecos volvieron a ser personas, y en cada pueblo alguien lloraba de alegría al escuchar su propio nombre.'],
      ['odo', 'Lior... hay algo que no te dije. Conté los nombres que volvieron. Faltan miles.'],
      ['lior', '¿Cómo que faltan? Los vimos volar hacia el norte.'],
      ['odo', 'Algunos doblaron hacia el este. Hacia el mar. Como si algo los llamara.'],
      [null, 'Un barco con velas blancas entra al puerto de Garza. Lo persiguen otros, con gente de túnicas lilas que canta mientras rema.'],
      ['liss', '¡Ayuda! ¡No dejen que me lleven de vuelta!'],
      ['mara', 'Esa gente está cantando y prendiendo fuego los muelles al mismo tiempo. Me cae mal.'],
    ],
    despues:[
      ['liss', 'Gracias. Me llamo Liss. Vengo de las Islas del Eco, cruzando el mar.'],
      ['liss', 'Esos eran del Coro. Mi hermana Seren es su Directora. Atraparon los nombres que se escaparon del Abismo con una campana enorme: la Campana Primera.'],
      ['ysolde', '¿Para qué querría alguien juntar nombres ajenos?'],
      ['liss', 'Seren cree que si la Campana suena con todos esos nombres adentro, el mundo entero va a olvidar el dolor. Nadie va a extrañar a nadie. Nadie va a sufrir.'],
      ['nela', 'Ni a acordarse de nada. Es lo mismo que hacía la Bruma, pero con mejores intenciones.'],
      ['liss', 'Por eso me escapé. Yo quiero acordarme de mamá. Aunque duela.'],
      ['lior', 'Entonces vamos a buscar esos nombres. Liss, ¿nos llevás?'],
      [null, 'Liss se unió al grupo. Tocá el Barco a las Islas del Eco, en el mapa del norte, para cruzar.'],
    ], une:['liss'] },
  { b:'b29', nodo:'arrecife', cap:null,
    antes:[
      [null, 'El barco encalla en un arrecife cubierto de niebla. Desde las rocas, unas voces cantan tu nombre.'],
      ['liss', 'Son sirenas del Eco. Repiten los nombres que escuchan. No les contesten.'],
      ['fenn', '¿Y si me dicen algo lindo?'],
      ['liss', 'Especialmente si te dicen algo lindo.'],
    ],
    despues:[
      ['brann', 'Esas cosas tenían voces de gente. De gente que conocí.'],
      ['liss', 'Son los nombres que el Coro no pudo meter en la Campana. Quedaron flotando acá, repitiéndose solos.'],
      ['lior', 'Más razones para apurarnos.'],
    ] },
  { b:'b30', nodo:'eco', cap:null,
    antes:[
      ['liss', 'Ese es Puerto Eco, mi pueblo. Y ese que toca la guitarra en la plaza es el Maestro Coral. Me enseñó a cantar.'],
      ['coral', 'Liss. Volviste. Y trajiste ruido.'],
      ['coral', 'Tu hermana va a salvar al mundo del dolor, nena. ¿Por qué te resistís?'],
      ['liss', 'Porque me enseñaste que una canción triste también es una canción.'],
    ],
    despues:[
      ['coral', 'Tenés... la voz de tu madre. Ella tampoco quería olvidar.'],
      [null, 'El Maestro Coral deja caer la guitarra. Por un momento parece recordar algo, y llora.'],
      ['coral', 'La Campana está en la Cumbre, detrás de las Puertas del Coro. Para llegar hay que pasar el Faro, el Templo y el Jardín. Cuidate de Ívor, nena. Ella sí cree.'],
      [null, 'Puerto Eco quedó libre. Ahora tiene tienda, herrería, taberna y vecinos con cosas para contarte.'],
    ] },
  { b:'b31', nodo:'coral', cap:'Acto III — Capítulo 12: El Archipiélago',
    antes:[
      [null, 'Un bosque de árboles retorcidos crece sobre el agua. Entre las raíces, domadores del Coro pasean bestias con collares que suenan como campanitas.'],
      ['kaela', 'Esos animales están asustados. Los obligan a pelear.'],
      ['tobias', 'Entonces le pegamos a los que tienen la correa, no a los perros.'],
    ],
    despues:[
      ['kaela', 'Sin los domadores, las bestias se fueron al bosque. Bien.'],
      ['liss', 'Desde acá se ve el Faro. Antes guiaba a los barcos. Ahora guía a los nombres.'],
    ] },
  { b:'b32', nodo:'faro', cap:null,
    antes:[
      ['rook', 'Gárgolas en la torre y algo grande moviéndose adentro. Trampa clásica.'],
      ['lior', '¿Y cuál es el plan?'],
      ['rook', 'Caer en la trampa con mucha fuerza.'],
    ],
    despues:[
      [null, 'En lo alto del faro, una lente gigante apunta al cielo. Por ella pasan, muy de vez en cuando, luces chiquitas que van hacia el sur de la isla.'],
      ['nela', 'Es una lente para nombres. Los junta como una lupa junta el sol. Genial y horrible.'],
      ['aldous', 'Rompámosla.'],
      [null, 'La lente se parte. Varias luces chiquitas salen volando hacia el oeste, de vuelta a casa.'],
    ] },
  { b:'b33', nodo:'templo', cap:null,
    antes:[
      ['ivor', 'Los muertos no sufren, campanero. ¿Sabés por qué? Porque no recuerdan.'],
      ['ivor', 'La Directora nos va a dar a todos esa paz. Y yo voy a cuidar que nadie la interrumpa.'],
      ['ysolde', 'La paz que describís es la de un cementerio.'],
      ['ivor', 'Exacto. ¿No es hermoso?'],
    ],
    despues:[
      ['ivor', 'No... me acuerdo... de mi hija... ¿por qué ahora...?'],
      ['liss', 'Porque la Campana no la tiene a ella, Ívor. La tenés vos.'],
      [null, 'La Hermana Ívor se queda sentada en el templo, mirando el agua. No vuelve a levantar la vara.'],
    ] },
  { b:'b34', nodo:'escalinata', cap:'Acto III — Capítulo 13: El Coro',
    antes:[
      [null, 'Mil escalones de piedra blanca suben hasta las nubes. En cada descanso, un coro canta la misma nota sin parar.'],
      ['liss', 'Es la nota del olvido. Si la escuchás mucho rato, empezás a sentirte liviano. Demasiado liviano.'],
      ['lior', 'Entonces subamos cantando otra cosa.'],
      ['mara', 'Lior, cantás horrible.'],
      ['lior', 'Mejor. Así no se nos pega la de ellos.'],
    ],
    despues:[
      ['odo', 'Arriba de todo está el Jardín de los Ecos. Ahí vive el Oráculo, el que le dijo a Seren que la Campana era la respuesta.'],
    ] },
  { b:'b35', nodo:'jardin', cap:null,
    antes:[
      ['nym', 'Te vi venir hace años, campanero. En el agua del jardín. Siempre llegás. Siempre perdés.'],
      ['lior', '¿Y alguna vez viste qué pasa después?'],
      ['nym', '...No. El agua se pone negra.'],
      ['lior', 'Entonces no sabés tanto.'],
    ],
    despues:[
      ['nym', 'El agua... se aclaró. Veo una campana partida. Y una niña cantando.'],
      ['liss', '¿Soy yo?'],
      ['nym', 'No lo sé. Por primera vez en mi vida, no lo sé. Qué alivio.'],
    ] },
  { b:'b36', nodo:'puertas_coro', cap:null,
    antes:[
      [null, 'Las Puertas del Coro miden lo mismo que diez casas. Delante, un gigante de bronce abre los ojos.'],
      ['brann', 'Lo hicieron fundiendo campanas viejas. Se ve en el pecho: todavía tienen los nombres de los pueblos grabados.'],
      ['lior', 'Una de esas es de Brezal.'],
    ],
    despues:[
      [null, 'El Guardián cae y suena como cien campanas a la vez. Las puertas se abren solas.'],
      ['lior', 'Gracias, campana de Brezal.'],
    ] },
  { b:'b37', nodo:'nave', cap:'Acto III — Capítulo 14: La Campana Primera',
    antes:[
      [null, 'Adentro, una nave enorme como una catedral. Del techo cuelgan miles de frasquitos con luces: cada uno es un nombre.'],
      ['liss', 'Están todos acá. Los de mamá también, en algún lado.'],
      ['fenn', 'Yo no robo frascos ajenos. Pero estos los voy a devolver, que es distinto.'],
    ],
    despues:[
      ['liss', 'Seren está arriba, en la Cumbre. Con la Campana.'],
      ['ysolde', 'Liss, si querés quedarte, nadie te va a juzgar.'],
      ['liss', 'Es mi hermana. Si alguien tiene que decirle que no, soy yo.'],
    ] },
  { b:'b38', nodo:'cumbre', cap:null,
    antes:[
      ['seren', 'Liss. Mirá todo esto. Mirá cuánta gente va a dejar de sufrir.'],
      ['liss', 'Y de reír. Y de acordarse de mamá.'],
      ['seren', '¡Mamá se murió gritando, Liss! ¡Yo me acuerdo de eso todas las noches! ¿Eso querés para el mundo?'],
      ['liss', 'Yo me acuerdo de cómo cantaba. Eso también está en la misma memoria, Seren. No se puede borrar una cosa sin la otra.'],
      ['seren', 'Entonces voy a borrar las dos. Perdoname.'],
    ],
    despues:[
      ['seren', 'No puedo... no te puedo ganar cantando. Nunca pude.'],
      ['liss', 'No hacía falta ganar. Hacía falta escucharnos.'],
      [null, 'Seren baja la vara. Pero detrás de ella, la Campana Primera empieza a sonar sola.'],
      ['seren', '¡No! ¡No la toqué! ¡Está... despierta!'],
      ['odo', 'Tantos nombres juntos hicieron algo nuevo. Algo que quiere sonar.'],
      [null, 'De la Campana sale una figura enorme de luz dorada. No tiene cara. Tiene mil bocas cantando la nota del olvido.'],
    ] },
  { b:'b39', nodo:'cumbre', cap:null, seguida:true,
    antes:[
      ['eco', 'OLVIDEN. OLVIDEN. OLVIDEN.'],
      ['lior', 'Liss. ¿Te sabés la Canción de la memoria?'],
      ['liss', 'Mamá me la cantaba para dormir. Nunca supe de dónde la había sacado.'],
      ['lior', 'De Brezal. Todos juntos, entonces. Con la peor voz que tengan.'],
    ],
    despues:[
      [null, 'Lior y Liss cantaron la Canción de la memoria. Seren, después de un rato, cantó también.'],
      [null, 'El Eco Primero se fue apagando, nota por nota, hasta ser una sola luz chiquita. Y la Campana Primera se partió en dos.'],
      [null, 'Miles de nombres salieron volando hacia todos lados. Esta vez, ninguno se perdió.'],
      ['seren', 'Liss... me acuerdo de cómo cantaba mamá. Me había olvidado de eso. Solo me acordaba del final.'],
      ['liss', 'Por eso hay que acordarse de todo. Para no quedarse solo con el final.'],
      ['mara', 'Che, campanero. ¿Ahora sí volvemos a casa?'],
      ['lior', 'Ahora sí. Y nos llevamos la mitad de la Campana. Le va a quedar linda al campanario.'],
      [null, 'FIN DEL ACTO III. Gracias por jugar Campanas de Bruma. Las misiones secretas, las patrullas y la Torre de la Bruma te siguen esperando.'],
    ] },
);

// ---------- Puerto Eco ----------
Object.assign(ROPA, {
  coro:    { C:'#e4dcf0', D:'#8a7aaa', A:'#e8c060', g:'capucha' },
  pescadora:{ C:'#3a7a8a', D:'#24505a', A:'#e8d8a0', g:'panuelo' },
});
PUEBLOS.eco = {
  suelo: [
    'wwwwwwwwwwww',
    'waaaaaaaaaaw',
    'waccccccccaw',
    'waccccccccaw',
    'waccbbbbccaw',
    'waccccccccaw',
    'waaaccccaaaw',
    'wgggccccgggw',
    'wgtgccccgtgw',
    'wgggccccgggw',
    'wggggccggggw',
    'wggggccggggw',
    'wgtggccggtgw',
    'wggggccggggw',
    'wwwwgccgwwww',
    'wwwwgccgwwww',
  ],
  edificios: [
    { tipo:'tienda',   x:1, y:1, w:3, h:3, puerta:[2, 3], techo:'#3a5a7a', pared:'#d8d0c0', cartel:'pocion', n:'Tienda del Puerto' },
    { tipo:'herreria', x:8, y:1, w:3, h:3, puerta:[9, 3], techo:'#2a3a4a', pared:'#b8b0a0', cartel:'herreria', n:'Forja de Coral' },
    { tipo:'taberna',  x:4, y:1, w:4, h:3, puerta:[6, 3], techo:'#5a3a2a', pared:'#e0d0b0', cartel:'taberna', n:'La Sirena Muda' },
    { tipo:'joyeria',  x:1, y:8, w:3, h:3, puerta:[2, 10], techo:'#5a4a7a', pared:'#d8d0c0', cartel:'joyeria', n:'Perlas y Gemas' },
    { tipo:'criadero', x:8, y:8, w:3, h:3, puerta:[9, 10], techo:'#3a6a5a', pared:'#d8d0c0', cartel:'criadero', n:'Criadero' },
  ],
  objetos: [{ tipo:'fuente', x:6, y:6 }, { tipo:'barril', x:4, y:12 }, { tipo:'caja', x:7, y:12 }],
  entrada: [5, 13], salidas: [[5, 15], [6, 15]],
  vecinos: [
    { id:'coral_v', n:'Maestro Coral', ropa:'coro', look:PJ.coral.look, x:6, y:5, charla:[
      { hasta:38, t:['Toqué la guitarra para el Coro veinte años. Ahora la toco para mí. Suena distinto.', 'Seren era la mejor alumna que tuve. La más triste también.'] },
      { hasta:99, t:['Liss y Seren cantan juntas todas las tardes en el muelle. Vení a escucharlas algún día.'] },
    ], mision:'campana_hundida' },
    { id:'pescadora', n:'Pescadora Marú', ropa:'pescadora', look:{ pelo:'#3a2a1e', piel:'#9a6440', estilo:2, cara:{ ojos:2, cejas:4, boca:3, pecas:true } }, x:3, y:6, regalo:{ desde:30, obj:{ hipocion:3, eter:2 }, txt:'Esto lo saqué de un barco hundido. Pociones viejas, pero funcionan. Creo.' }, charla:[
      { hasta:99, t:['Hay un dragón en las mareas del sur. Hunde los barcos que pasan cerca. Nadie volvió para contar cómo es.', 'Las perlas del eco son raras. La herrera de acá hace maravillas con ellas.'] },
    ], mision:'dragon_marino' },
    { id:'nino_eco', n:'Pip', ropa:'nino', look:{ pelo:'#e8c06a', piel:'#f2c9a0', estilo:1, cara:{ ojos:1, boca:2, pecas:true } }, x:8, y:11, regalo:{ desde:31, gema:'zafiro2', txt:'¡La encontré en la playa! Es azul como el mar. Te la doy si le ganás al dragón algún día.' }, charla:[
      { hasta:99, t:['¿Vos sos el campanero? ¡Yo también quiero tocar una campana!', 'Mi abuela dice que cuando era chica las sirenas cantaban canciones lindas, no nombres.'] },
    ] },
    { id:'guardia_eco', n:'Vigía Brisa', ropa:'guardia', look:{ pelo:'#1a1a22', piel:'#e0ac80', estilo:2, cara:{ ojos:3, cejas:2, boca:1 } }, x:6, y:13, quieto:true, charla:[
      { hasta:99, t:['Las sirenas son débiles al rayo. El Guardián de Bronce también.', 'El Eco no tiene cuerpo. Dicen que solo el sonido lo lastima de verdad.'] },
    ] },
  ],
};

// ---------- Misiones secretas del este ----------
Object.assign(SECRETAS, {
  campana_hundida: { n:'La campana hundida', region:'este', x:88, y:62, req:31, vecino:'coral_v',
    pedido:[['coral_v', 'Antes del Coro, en el templo había otra campana: la de los pescadores. Se hundió en una tormenta, al este del templo.'], ['coral_v', 'Dicen que adentro quedó atrapado un liche que fue campanero. Si lo liberás, quizás la campana vuelva a sonar.']],
    recordatorio:'La campana hundida está al este del Templo Sumergido.',
    gracias:[['coral_v', '¡Sonó! La escuché desde acá. Tomá: hace años que guardo esto para quien la hiciera sonar.']],
    batalla:{ n:'La campana hundida', mapa:'templo', musica:'final', oro:15000, aliados:[[3, 9], [4, 9], [5, 9], [3, 10], [5, 10]], objetivo:'Derrotá al Campanero Hundido', jefeGana:true,
      e:[{ c:'lich', nv:80, x:4, y:1, n:'Campanero Hundido', jefe:true }, { c:'espectro', nv:76, x:2, y:2 }, { c:'espectro', nv:76, x:6, y:2 }, { c:'sirena', nv:76, x:3, y:5 }, { c:'sirena', nv:76, x:5, y:5 }] },
    premio:{ equipo:[{ id:'maza_campana', rareza:4 }, { id:'tunica_coro', rareza:4 }], mat:{ perla_eco:4 }, oro:6000 }, patrulla:['espectro', 'lich'] },
  dragon_marino: { n:'El Dragón de las Mareas', region:'este', x:90, y:86, req:33, vecino:'pescadora',
    pedido:[['pescadora', 'El dragón de las mareas hunde barcos desde que el Coro llegó. Creo que los nombres lo pusieron loco.'], ['pescadora', 'Si lo calmás, el mar vuelve a ser nuestro. Pero es enorme. Más que cualquier cosa que hayas visto.']],
    recordatorio:'El Dragón de las Mareas vive al sur de la Cumbre, donde el agua es más oscura.',
    gracias:[['pescadora', '¡El mar está quieto! Tomá, esto lo encontramos en su nido cuando fuimos a mirar.']],
    batalla:{ n:'El Dragón de las Mareas', mapa:'arrecife', musica:'final', oro:20000, aliados:[[3, 9], [4, 9], [5, 9], [3, 10], [5, 10]], objetivo:'Derrotá al Dragón de las Mareas', jefeGana:true,
      e:[{ c:'dragon_marino', nv:86, x:4, y:1, n:'Dragón de las Mareas', jefe:true }, { c:'sirena', nv:80, x:2, y:3 }, { c:'sirena', nv:80, x:6, y:3 }] },
    premio:{ equipo:[{ id:'tridente_mar', rareza:4 }, { id:'armadura_bronce', rareza:4 }, { id:'arpa_sirena', rareza:4 }], mat:{ perla_eco:5, escama:4 }, oro:12000 }, patrulla:['sirena', 'dragon_marino'] },
});
