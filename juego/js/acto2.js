// Campanas de Bruma — Acto II: El Devorador de Nombres. Demonios, dragones, el Cancerbero y el Abismo.
'use strict';

// ---------- Terrenos nuevos ----------
Object.assign(SPR.TERRENO, {
  h: { top:['#7a7478', '#8a8488', '#666064'], side:['#4a4448', '#3a3438'], pasa:true, ascuas:true },
  o: { top:['#3a3046', '#4a3e5a', '#2a2234'], side:['#1e1828', '#16121e'], pasa:true, adoquin:true, brillo:true },
  l: { top:['#ff6a1a', '#ffb02a', '#d8401a'], side:['#a8301a', '#7a2010'], pasa:false, lava:true },
  u: { top:['#e8dcc4', '#f4ead8', '#c8bca4'], side:['#a89c84', '#8a7e68'], pasa:true, piedra:true },
});
FONDOS.brezal2 = '#2a1010'; AMBIENTE.brezal2 = 'ceniza'; MAPAS.brezal2 = MAPAS.brezal.slice();
const M2 = {
  ceniza: ['h1 h1 h1 h2 h2 h1 h1 r1 h1', 'h1 r1 h1 h2 h3 h2 h1 h1 h1', 'h1 h1 h1 h1 h2 h1 h1 l0 l0', 'h2 h1 d1 d1 d1 d1 h1 l0 l0', 'h2 h2 d1 h1 h1 d1 h1 h1 l0', 'h1 h1 d1 h1 r1 d1 d1 h1 h1', 'l0 h1 d1 h1 h1 h1 d1 h1 h1', 'l0 l0 d1 d1 h1 h1 d1 h2 h2', 'l0 h1 h1 d1 d1 d1 d1 h2 h3', 'h1 h1 h1 h1 d1 h1 h1 h1 h2', 'h1 h1 r1 h1 d1 h1 h1 r1 h1'],
  villa: ['R3 R3 o1 o1 o1 o1 o1 R3 R3', 'R3 R3 o1 o1 o1 o1 o1 R3 R3', 'o1 o1 o1 h1 h1 h1 o1 o1 o1', 'o1 h1 h1 h1 s2 h1 h1 h1 o1', 'o1 h1 s2 h1 h1 h1 s2 h1 o1', 'o1 h1 h1 h1 o1 h1 h1 h1 o1', 'R3 R3 h1 o1 o1 o1 h1 R3 R3', 'R3 R3 h1 o1 o1 o1 h1 R3 R3', 'o1 o1 h1 h1 o1 h1 h1 o1 o1', 'o1 o1 o1 o1 o1 o1 o1 o1 o1', 'l0 o1 o1 o1 o1 o1 o1 o1 l0'],
  volcan: ['s4 s4 h3 h3 l0 h3 h4 s5 s5', 's4 h3 h3 l0 l0 h3 h3 h4 s5', 'h3 h3 h2 h2 l0 h2 h3 h3 h4', 'h3 h2 h2 b2 b2 b2 h2 h3 h3', 'h2 h2 r2 h2 l0 h2 h2 h2 h3', 'h2 h1 h1 h1 l0 h1 h1 r2 h2', 'l0 l0 h1 h1 l0 h1 h1 h1 h2', 'l0 h1 h1 b1 b1 b1 h1 h1 l0', 'h1 h1 r1 h1 l0 h1 h1 l0 l0', 'h1 h1 h1 h1 l0 h1 h1 h1 h1', 'h1 h1 h1 h1 h1 h1 h1 h1 h1'],
  nido: ['s6 s6 s5 s5 s5 s5 s5 s6 s6', 's6 s5 h5 h5 h5 h5 h5 s5 s6', 's5 h5 h5 a5 a5 a5 h5 h5 s5', 's5 h4 h5 a5 a5 a5 h5 h4 s5', 's4 h4 h4 h4 h5 h4 h4 h4 s4', 'x0 h3 h3 h4 h4 h4 h3 h3 x0', 'x0 x0 h3 h3 h3 h3 h3 x0 x0', 'x0 h2 h2 h3 h2 h3 h2 h2 x0', 'h2 h2 h1 h2 h2 h2 h1 h2 h2', 'h1 h1 h1 h1 h1 h1 h1 h1 h1', 'h1 h1 h1 h1 h1 h1 h1 h1 h1'],
  cima: ['x0 s7 s7 s7 s7 s7 s7 s7 x0', 's7 s7 o7 o7 o7 o7 o7 s7 s7', 's6 o6 o6 o6 o7 o6 o6 o6 s6', 's6 o6 o5 o5 o5 o5 o5 o6 s6', 'x0 o5 o5 o4 o4 o4 o5 o5 x0', 'x0 o4 o4 o4 o4 o4 o4 o4 x0', 'x0 x0 o3 o3 o4 o3 o3 x0 x0', 'x0 o2 o3 o3 o3 o3 o3 o2 x0', 'o2 o2 o2 o2 o3 o2 o2 o2 o2', 'o1 o2 o1 o1 o2 o1 o1 o2 o1', 'o1 o1 o1 o1 o1 o1 o1 o1 o1'],
  desfiladero: ['s5 s5 u2 u2 u2 u2 u2 s5 s5', 's5 s4 u2 u3 u2 u3 u2 s4 s5', 's4 s4 u2 u2 u2 u2 u2 s4 s4', 's4 u3 u2 r2 u2 u2 u2 u3 s4', 's3 u2 u2 u2 u2 r2 u2 u2 s3', 's3 u2 u1 u1 u2 u2 u1 u2 s3', 's3 u1 u1 u1 u1 u1 u1 u1 s3', 's3 u1 r1 u1 u1 u1 r1 u1 s3', 's4 u1 u1 u1 u1 u1 u1 u1 s4', 's4 s3 u1 u1 u1 u1 u1 s3 s4', 's5 s4 u1 u1 u1 u1 u1 s4 s5'],
  hueso: ['x0 x0 u3 u3 u3 u3 u3 x0 x0', 'x0 u3 u3 u4 u3 u4 u3 u3 x0', 'x0 x0 x0 u3 u3 u3 x0 x0 x0', 'x0 x0 x0 u3 x0 u3 x0 x0 x0', 'x0 x0 u3 u3 x0 u3 u3 x0 x0', 'x0 x0 u3 x0 x0 x0 u3 x0 x0', 'x0 x0 u3 u3 x0 u3 u3 x0 x0', 'x0 x0 x0 u3 u3 u3 x0 x0 x0', 'x0 x0 u3 u3 u3 u3 u3 x0 x0', 'x0 u3 u3 u3 u3 u3 u3 u3 x0', 'x0 u3 u3 u3 u3 u3 u3 u3 x0'],
  puertas: ['o4 o4 o4 l0 l0 l0 o4 o4 o4', 'o4 k5 o4 o3 o3 o3 o4 k5 o4', 'o3 o3 o3 o3 o3 o3 o3 o3 o3', 'l0 o3 o2 o2 o3 o2 o2 o3 l0', 'l0 o2 o2 o2 o2 o2 o2 o2 l0', 'o2 o2 r2 o2 o2 o2 r2 o2 o2', 'o1 o1 o1 o1 o2 o1 o1 o1 o1', 'o1 l0 o1 o1 o1 o1 o1 l0 o1', 'o1 l0 o1 o1 o1 o1 o1 l0 o1', 'o1 o1 o1 o1 o1 o1 o1 o1 o1', 'o1 o1 o1 o1 o1 o1 o1 o1 o1'],
  hundida: ['w0 c1 c1 R3 R3 c1 c1 w0 w0', 'w0 c1 c1 R3 R3 c1 c1 c1 w0', 'c1 c1 w0 w0 c1 c1 W0 c1 c1', 'c1 R3 R3 w0 c1 W0 W0 c1 c1', 'c1 R3 R3 c1 c1 c1 c1 R3 R3', 'c1 c1 c1 c1 w0 c1 c1 R3 R3', 'W0 W0 c1 w0 w0 w0 c1 c1 c1', 'W0 c1 c1 c1 w0 c1 c1 c1 w0', 'c1 c1 R3 R3 c1 c1 R3 R3 w0', 'c1 c1 R3 R3 c1 c1 R3 R3 c1', 'c1 c1 c1 c1 c1 c1 c1 c1 c1'],
  archivo: ['k2 s4 k2 s4 k2 s4 k2 s4 k2', 'k2 k2 k2 k2 k2 k2 k2 k2 k2', 's4 k2 s4 k2 p3 k2 s4 k2 s4', 'k1 k1 k1 k2 p3 k2 k1 k1 k1', 'k1 s3 k1 k1 k2 k1 k1 s3 k1', 'k1 s3 k1 p2 p2 p2 k1 s3 k1', 'k1 k1 k1 p2 p2 p2 k1 k1 k1', 'k1 s3 k1 k1 k1 k1 k1 s3 k1', 'k1 s3 k1 k1 k1 k1 k1 s3 k1', 'k1 k1 k1 k1 c1 k1 k1 k1 k1', 'k1 k1 k1 c1 c1 c1 k1 k1 k1'],
  llanura: ['h1 h1 l0 h1 h1 h1 l0 h1 h1', 'h1 h2 h1 h1 r1 h1 h1 h2 h1', 'l0 h1 h1 o2 o2 o2 h1 h1 l0', 'h1 h1 o2 o3 o3 o3 o2 h1 h1', 'h1 r1 o2 o3 o4 o3 o2 r1 h1', 'h1 h1 o2 o2 o3 o2 o2 h1 h1', 'l0 h1 h1 h1 o2 h1 h1 h1 l0', 'h1 h1 l0 h1 h1 h1 l0 h1 h1', 'h1 h1 h1 h1 h1 h1 h1 h1 h1', 'h1 r1 h1 h1 h1 h1 h1 r1 h1', 'h1 h1 h1 h1 h1 h1 h1 h1 h1'],
  palacio: ['o5 o5 o5 o6 o6 o6 o5 o5 o5', 'o5 s7 o5 o5 o6 o5 o5 s7 o5', 'o5 o5 o5 o5 o5 o5 o5 o5 o5', 'l0 l0 o4 o4 o5 o4 o4 l0 l0', 'o4 o4 o4 l0 o4 l0 o4 o4 o4', 'o3 o3 o4 l0 o4 l0 o4 o3 o3', 'o3 s5 o3 o3 o3 o3 o3 s5 o3', 'o2 o2 o2 o2 o3 o2 o2 o2 o2', 'l0 o2 o2 o2 o2 o2 o2 o2 l0', 'o1 o1 o1 o1 o2 o1 o1 o1 o1', 'o1 o1 o1 o1 o1 o1 o1 o1 o1'],
  abismo: ['x0 o6 o6 o6 o6 o6 o6 o6 x0', 'x0 o6 o7 o7 o7 o7 o7 o6 x0', 'x0 o5 o6 o6 o6 o6 o6 o5 x0', 'x0 x0 o5 o5 o5 o5 o5 x0 x0', 'x0 o4 o4 x0 o5 x0 o4 o4 x0', 'x0 o4 o4 x0 o4 x0 o4 o4 x0', 'x0 o3 o3 o3 o4 o3 o3 o3 x0', 'x0 x0 o3 o3 o3 o3 o3 x0 x0', 'x0 o2 o2 o3 o3 o3 o2 o2 x0', 'o1 o2 o2 o2 o2 o2 o2 o2 o1', 'o1 o1 o1 o1 o1 o1 o1 o1 o1'],
};
Object.assign(MAPAS, M2);
Object.assign(FONDOS, { ceniza:'#2a1a18', villa:'#2a1418', volcan:'#3a1410', nido:'#2a2a3a', cima:'#14101e', desfiladero:'#1e1a24', hueso:'#0e0a14', puertas:'#2a0a0a', hundida:'#0e1e2e', archivo:'#14101e', llanura:'#3a140a', palacio:'#1a0a14', abismo:'#08040e' });
Object.assign(AMBIENTE, { ceniza:'ceniza', villa:'ceniza', volcan:'ceniza', nido:'hojas', cima:'nieve', desfiladero:'bruma', hueso:'bruma', puertas:'ceniza', hundida:'bruma', archivo:'bruma', llanura:'ceniza', palacio:'ceniza', abismo:'bruma' });

// ---------- Habilidades nuevas ----------
Object.assign(HAB, {
  // Monstruos
  chispa_infernal:{ n:'Chispa infernal', d:'', tipo:'mag', mp:6, r:[1,4], p:20, el:'fuego', fx:'fuego' },
  tridente:       { n:'Tridente', d:'', tipo:'fis', mp:0, r:[1,1], p:1.2, fx:'corte' },
  garra:          { n:'Garra', d:'', tipo:'fis', mp:0, r:[1,1], p:1.45, fx:'mordida' },
  llamarada_dem:  { carga:22, n:'Llamarada demoníaca', d:'', tipo:'mag', mp:10, r:[1,3], a:1, p:30, el:'fuego', fx:'fuego' },
  picada:         { n:'Picada', d:'', tipo:'fis', mp:0, r:[1,2], p:1.3, fx:'golpe' },
  piel_piedra:    { n:'Piel de piedra', d:'', tipo:'apoyo', mp:6, r:[0,0], af:'a', est:[{id:'protegido',prob:100,dur:3},{id:'coraza',prob:100,dur:3}], fx:'escudo' },
  mordida_ignea:  { n:'Mordida ígnea', d:'', tipo:'fis', mp:0, r:[1,1], p:1.35, el:'fuego', fx:'mordida' },
  tajo_oseo:      { n:'Tajo óseo', d:'', tipo:'fis', mp:0, r:[1,1], p:1.3, fx:'corte' },
  muerte_lenta:   { n:'Muerte lenta', d:'', tipo:'apoyo', mp:10, r:[1,5], af:'e', est:[{id:'veneno',prob:80,dur:5},{id:'lento',prob:60,dur:3}], fx:'bruma' },
  hielo_oscuro:   { carga:18, n:'Hielo oscuro', d:'', tipo:'mag', mp:14, r:[1,5], a:1, p:36, el:'hielo', fx:'hielo' },
  escupir_fuego:  { n:'Escupir fuego', d:'', tipo:'mag', mp:6, r:[1,3], p:24, el:'fuego', fx:'fuego' },
  aliento_fuego:  { n:'Aliento de fuego', d:'', tipo:'mag', mp:12, r:[1,3], a:1, p:36, el:'fuego', fx:'fuego' },
  aliento_negro:  { n:'Aliento negro', d:'', tipo:'mag', mp:16, r:[1,4], a:1, p:46, est:[{id:'ciego',prob:40,dur:2}], fx:'bruma' },
  barrido_cola:   { n:'Barrido de cola', d:'', tipo:'fis', mp:8, r:[0,0], a:1, p:1.1, fx:'tierra' },
  rugido:         { n:'Rugido', d:'', tipo:'apoyo', mp:10, r:[0,0], a:3, af:'e', est:[{id:'aturdido',prob:35,dur:1}], fx:'sonido' },
  triple_mordida: { n:'Triple mordida', d:'', tipo:'fis', mp:0, r:[1,1], p:0.7, golpes:3, el:'fuego', fx:'mordida' },
  aullido_infernal:{ n:'Aullido infernal', d:'', tipo:'apoyo', mp:12, r:[0,0], a:2, af:'e', est:[{id:'debil',prob:70,dur:3},{id:'quebrado',prob:70,dur:3}], fx:'sonido' },
  beso_olvido:    { n:'Beso del olvido', d:'', tipo:'mag', mp:12, r:[1,2], p:34, est:[{id:'silencio',prob:60,dur:3}], fx:'bruma' },
  encanto:        { n:'Encanto', d:'', tipo:'apoyo', mp:12, r:[1,4], af:'e', est:[{id:'dormido',prob:60,dur:2}], fx:'sueno' },
  meteoro:        { carga:12, n:'Meteoro', d:'', tipo:'mag', mp:24, r:[1,6], a:2, p:50, el:'fuego', fx:'fuego' },
  erupcion:       { n:'Erupción', d:'', tipo:'mag', mp:16, r:[0,0], a:2, p:38, el:'fuego', fx:'tierra' },
  devorar_nombre: { n:'Devorar nombre', d:'', tipo:'mag', mp:18, r:[1,4], p:52, est:[{id:'silencio',prob:60,dur:3}], fx:'bruma' },
  vacio:          { carga:14, n:'Vacío', d:'', tipo:'mag', mp:30, r:[0,0], a:3, p:62, fx:'bruma' },
  // Invocador
  llamado_fenix:  { carga:14, n:'Llamado del fénix', d:'Un fénix de brasas cae sobre un área grande.', tipo:'mag', mp:28, r:[1,5], a:2, p:42, el:'fuego', pc:400, fx:'fuego' },
  llamado_leviatan:{ carga:12, n:'Llamado del leviatán', d:'Una ola helada barre un área grande.', tipo:'mag', mp:32, r:[1,5], a:2, p:46, el:'hielo', pc:500, fx:'hielo' },
  llamado_titan:  { carga:12, n:'Llamado del titán', d:'El suelo se parte bajo los enemigos.', tipo:'mag', mp:32, r:[1,5], a:2, p:48, pc:550, fx:'tierra' },
  llamado_sirena: { carga:14, n:'Canto de la sirena', d:'Cura mucho y da Regen a los aliados.', tipo:'cura', mp:26, r:[0,5], a:2, af:'a', p:42, est:[{id:'regen',prob:100,dur:3}], pc:450, fx:'cura' },
  llamado_juez:   { carga:10, n:'Llamado del juez', d:'Luz implacable sobre un área.', tipo:'mag', mp:40, r:[1,5], a:1, p:60, el:'luz', antidemonio:true, pc:700, fx:'luz' },
  vinculo:        { n:'Vínculo', d:'Pasiva: las habilidades gastan 25% menos de magia.', tipo:'pasiva', pv:'ahorro', pc:500 },
  // Espadachín
  corte_viento:   { n:'Corte de viento', d:'Un tajo que viaja hasta 3 casillas.', tipo:'fis', mp:0, r:[1,3], p:1.0, pc:200, fx:'corte' },
  doble_tajo:     { n:'Doble tajo', d:'Dos cortes rápidos.', tipo:'fis', mp:0, r:'arma', p:0.85, golpes:2, pc:250, fx:'corte' },
  danza_acero:    { n:'Danza de acero', d:'Golpea a todos los enemigos de alrededor.', tipo:'fis', mp:8, r:[0,0], a:1, p:0.95, pc:300, fx:'corte' },
  iai:            { n:'Desenvaine', d:'Un solo corte devastador (x2.2).', tipo:'fis', mp:10, r:'arma', p:2.2, pc:450, fx:'corte' },
  ojo_critico:    { n:'Ojo crítico', d:'Pasiva: +20% de daño físico.', tipo:'pasiva', pv:'critico', pc:500 },
  // Draconiana (Kaela)
  lanzazo_draco:  { n:'Lanzazo dracónico', d:'Estocada con fuerza de dragón (x1.5).', tipo:'fis', mp:0, r:[1,2], p:1.5, pc:0, fx:'corte' },
  aliento_draco:  { n:'Aliento de dragón', d:'Fuego desde la garganta, en área.', tipo:'mag', mp:12, r:[1,3], a:1, p:32, el:'fuego', pc:200, fx:'fuego' },
  escamas:        { n:'Escamas', d:'Protección, Coraza y Regen sobre sí misma.', tipo:'apoyo', mp:10, r:[0,0], af:'a', est:[{id:'protegido',prob:100,dur:3},{id:'coraza',prob:100,dur:3},{id:'regen',prob:100,dur:3}], pc:250, fx:'escudo' },
  salto_draco:    { n:'Salto dracónico', d:'Salta muy alto y cae con todo (x2.0).', tipo:'fis', mp:8, r:[1,4], p:2.0, pc:350, fx:'salto' },
  rugido_draco:   { n:'Rugido del dragón', d:'Valor y Prisa a los aliados cercanos.', tipo:'apoyo', mp:16, r:[0,0], a:2, af:'a', est:[{id:'valor',prob:100,dur:3},{id:'prisa',prob:100,dur:3}], pc:450, fx:'brillo' },
  sangre_dragon:  { n:'Sangre de dragón', d:'Pasiva: resiste fuego y +10% de vida.', tipo:'pasiva', pv:'sangre', pc:400 },
  // Cazademonios (Rook)
  flecha_bendita: { n:'Flecha bendita', d:'Disparo de luz (x1.3).', tipo:'fis', mp:0, r:'arma', p:1.3, el:'luz', pc:0, fx:'flecha' },
  sello:          { n:'Sello', d:'Silencia a un enemigo.', tipo:'apoyo', mp:8, r:[1,4], af:'e', est:[{id:'silencio',prob:75,dur:3}], pc:150, fx:'escudo' },
  cadena_plata:   { n:'Cadena de plata', d:'Inmoviliza a un enemigo (Detenido).', tipo:'apoyo', mp:12, r:[1,3], af:'e', est:[{id:'detenido',prob:50,dur:2}], pc:250, fx:'tiempo' },
  exorcismo:      { carga:22, n:'Exorcismo', d:'Luz sagrada. Doble daño a demonios.', tipo:'mag', mp:16, r:[1,4], p:42, el:'luz', antidemonio:true, pc:350, fx:'luz' },
  instinto_caza:  { n:'Instinto de caza', d:'Pasiva: +30% de daño contra demonios.', tipo:'pasiva', pv:'cazador', pc:400 },
});

// ---------- Clases nuevas ----------
Object.assign(CLASES, {
  invocador:    { n:'Invocador', d:'Llama a criaturas legendarias. Lento, pero devastador.', m:{hp:0.85,mp:1.5,atk:0.5,def:0.75,mag:1.45,res:1.2,spd:0.95}, mov:3, salto:2, eva:5, armas:['vara'], armad:['tela'], req:{hechicero:4,clerigo:3}, habs:['llamado_fenix','llamado_leviatan','llamado_titan','llamado_sirena','llamado_juez','vinculo'], asp:{C:'#2a7a8a',D:'#1a4a5a',A:'#ffd86a',g:'mitra'} },
  espadachin:   { n:'Espadachín', d:'Maestro de la espada: rápido, preciso y letal.', m:{hp:1.1,mp:0.7,atk:1.4,def:1.0,mag:0.6,res:0.9,spd:1.2}, mov:4, salto:3, eva:15, armas:['espada'], armad:['cuero'], req:{caballero:4,ladron:3}, habs:['corte_viento','doble_tajo','danza_acero','iai','ojo_critico'], asp:{C:'#3a3a5a',D:'#22223a',A:'#e84a5a',g:'cinta'} },
  draconiana:   { n:'Draconiana', d:'Guerrera con sangre de dragón.', m:{hp:1.25,mp:0.9,atk:1.35,def:1.2,mag:1.0,res:1.0,spd:1.05}, mov:4, salto:4, eva:10, armas:['lanza'], armad:['malla','cuero'], req:{}, unico:'kaela', habs:['lanzazo_draco','aliento_draco','escamas','salto_draco','rugido_draco','sangre_dragon'], asp:{C:'#a83a2a',D:'#6a1a14',A:'#ffcc5a',g:'cuernos'} },
  cazademonios: { n:'Cazademonios', d:'Arquero sagrado que caza criaturas del Abismo.', m:{hp:1.05,mp:1.0,atk:1.25,def:0.95,mag:1.0,res:1.1,spd:1.15}, mov:4, salto:3, eva:14, armas:['arco','daga'], armad:['cuero'], req:{}, unico:'rook', habs:['flecha_bendita','sello','cadena_plata','exorcismo','instinto_caza'], asp:{C:'#2a2a2a',D:'#141414',A:'#e8e0c8',g:'sombrero'} },
  // Monstruos y demonios
  diablillo:   { n:'Diablillo', mon:true, spr:'diablillo', vuela:true, raza:'demonio', m:{hp:0.8,mp:1.1,atk:0.9,def:0.8,mag:1.15,res:1.0,spd:1.25}, mov:5, salto:9, eva:15, poder:5, habs:['chispa_infernal','tridente'], debil:['luz','hielo'], botin:{cuerno:0.2}, asp:{C:'#d84a3a',D:'#8a2a2a',A:'#f0e0c0',E:'#ffe25a'} },
  demonio:     { n:'Demonio', mon:true, spr:'demonio', tam:1.2, raza:'demonio', m:{hp:1.5,mp:0.9,atk:1.35,def:1.2,mag:1.0,res:1.0,spd:0.95}, mov:4, salto:3, eva:5, poder:10, habs:['garra','llamarada_dem'], debil:['luz','hielo'], botin:{cuerno:0.4}, asp:{C:'#a83a4a',D:'#5a1a2a',A:'#e8dcc0',E:'#ffcc3a'} },
  gargola:     { n:'Gárgola', mon:true, spr:'gargola', vuela:true, raza:'demonio', m:{hp:1.2,mp:0.6,atk:1.15,def:1.6,mag:0.6,res:1.1,spd:0.9}, mov:4, salto:9, eva:4, poder:8, habs:['picada','piel_piedra'], debil:['rayo'], botin:{hierro:0.5}, asp:{C:'#8a8a96',D:'#5a5a66',A:'#c8c8d0',E:'#ff5a5a'} },
  sabueso:     { n:'Sabueso infernal', mon:true, spr:'lobo', raza:'demonio', m:{hp:1.1,mp:0.7,atk:1.25,def:0.95,mag:0.9,res:0.9,spd:1.3}, mov:5, salto:3, eva:14, poder:8, habs:['mordida_ignea','aullido'], debil:['hielo','luz'], resEl:{fuego:0.5}, botin:{cuerno:0.2}, asp:{C:'#3a2a2a',D:'#1a1010',E:'#ff6a1a',A:'#ff9a4a'} },
  esqueleto:   { n:'Esqueleto', mon:true, spr:'esqueleto', m:{hp:1.0,mp:0.5,atk:1.15,def:1.1,mag:0.5,res:0.8,spd:0.9}, mov:4, salto:2, eva:6, poder:9, habs:['tajo_oseo'], debil:['luz','sonido'], botin:{hierro:0.4}, asp:{C:'#6a5a4a',D:'#3a2e24',A:'#c8a050',E:'#7affd0'} },
  lich:        { n:'Liche', mon:true, spr:'lich', m:{hp:1.1,mp:1.8,atk:0.5,def:0.9,mag:1.5,res:1.4,spd:1.0}, mov:3, salto:2, eva:6, poder:4, habs:['olvido','muerte_lenta','hielo_oscuro','silencio_total'], debil:['luz'], botin:{plata:0.4}, asp:{C:'#3a2a5a',D:'#1e1430',A:'#7aff9a',E:'#7aff9a'} },
  salamandra:  { n:'Salamandra', mon:true, spr:'salamandra', m:{hp:1.0,mp:0.9,atk:1.1,def:1.0,mag:1.1,res:1.0,spd:1.05}, mov:4, salto:2, eva:8, poder:7, habs:['mordida_ignea','escupir_fuego'], debil:['hielo'], resEl:{fuego:1}, botin:{escama:0.15}, asp:{C:'#e86a2a',D:'#a83a14',A:'#ffe25a',E:'#2a1a10'} },
  wyvern:      { n:'Wyvern', mon:true, raza:'dragon', spr:'dragon', tam:1.25, vuela:true, m:{hp:1.4,mp:1.0,atk:1.3,def:1.15,mag:1.1,res:1.0,spd:1.15}, mov:5, salto:9, eva:10, poder:10, habs:['mordisco','aliento_fuego'], debil:['hielo','rayo'], botin:{escama:0.4}, asp:{C:'#4a5236',D:'#262c1c',A:'#8a3a2a',E:'#ffc21a'}, extra:{fuego:true} },
  thanatyr:    { n:'Thanatyr', mon:true, raza:'dragon', spr:'dragon', tam:1.75, vuela:true, m:{hp:2.6,mp:1.5,atk:1.5,def:1.4,mag:1.4,res:1.3,spd:1.05}, mov:4, salto:9, eva:5, poder:14, habs:['mordisco','aliento_negro','barrido_cola','rugido'], debil:['luz'], botin:{escama:1}, extra:{fuego:true}, asp:{C:'#24202c',D:'#100c16',A:'#5a3a7a',E:'#ff2a3a'} },
  dragon_anciano:{ n:'Dragón Anciano', mon:true, raza:'dragon', spr:'dragon', tam:1.9, vuela:true, m:{hp:4.2,mp:2,atk:1.7,def:1.6,mag:1.6,res:1.5,spd:1.1}, mov:4, salto:9, eva:5, poder:16, habs:['aliento_fuego','meteoro','barrido_cola','rugido'], debil:[], botin:{escama:1}, extra:{fuego:true, corona:true}, asp:{C:'#7a5a2e',D:'#3a2814',A:'#c8a46a',E:'#ff4a1a'} },
  cancerbero:  { n:'Cancerbero', mon:true, spr:'cancerbero', tam:1.7, raza:'demonio', m:{hp:2.8,mp:1.2,atk:1.6,def:1.3,mag:1.1,res:1.2,spd:1.2}, mov:5, salto:3, eva:6, poder:14, habs:['triple_mordida','aliento_fuego','aullido_infernal'], debil:['hielo','luz'], resEl:{fuego:0.75}, botin:{cuerno:1}, asp:{C:'#2e2228',D:'#16101a',E:'#ff5a1a',A:'#ff9a4a'} },
  vesper:      { n:'Señora Vesper', mon:true, spr:'humano', raza:'demonio', m:{hp:2.2,mp:2,atk:1.0,def:1.1,mag:1.55,res:1.4,spd:1.2}, mov:4, salto:3, eva:12, poder:8, habs:['beso_olvido','encanto','olvido','silencio_total'], debil:['luz','sonido'], botin:{cuerno:1}, asp:{C:'#5a1a5a',D:'#2e0a2e',A:'#ff6ab0',S:'#d8b0e8',E:'#ff3a8a',g:'astas',alas:true} },
  grakk:       { n:'Grakk, Rey Ígneo', mon:true, spr:'demonio', tam:1.6, raza:'demonio', m:{hp:3.0,mp:1.4,atk:1.7,def:1.4,mag:1.3,res:1.2,spd:1.0}, mov:4, salto:3, eva:4, poder:16, habs:['garra','meteoro','erupcion','rugido'], debil:['hielo'], resEl:{fuego:1}, botin:{cuerno:1}, extra:{llamas:true, grande:true}, asp:{C:'#d84a1a',D:'#7a1a0a',A:'#3a2a2a',E:'#fff2a0'} },
  vaelgor:     { n:'Vaelgor', mon:true, spr:'demonio', tam:1.8, raza:'demonio', m:{hp:3.6,mp:2.5,atk:1.6,def:1.5,mag:1.7,res:1.5,spd:1.1}, mov:4, salto:3, eva:5, poder:16, habs:['devorar_nombre','olvido','meteoro','silencio_total'], debil:['luz','sonido'], botin:{cuerno:2}, extra:{corona:true, capa:true, grande:true}, asp:{C:'#4a2a6a',D:'#1e0e2e',A:'#d8c0ff',E:'#ff3a3a'} },
  vaelgor2:    { n:'Vaelgor Desatado', mon:true, spr:'dragon', tam:2.1, vuela:true, raza:'demonio', m:{hp:5.2,mp:3,atk:1.8,def:1.6,mag:1.8,res:1.6,spd:1.15}, mov:4, salto:9, eva:4, poder:18, habs:['aliento_negro','devorar_nombre','vacio','rugido'], debil:['sonido'], botin:{cuerno:3, escama:3}, extra:{ojos:true, corona:true, fuego:true}, asp:{C:'#3a1a4a',D:'#14081e',A:'#ff6ab0',E:'#ff2a2a'} },
});

// ---------- Equipo nuevo (capítulos 6+) ----------
Object.assign(EQ, {
  espada_infernal:  { rasgos:['vampiro'], n:'Espada infernal', slot:'arma', tipo:'espada', poder:25, el:'fuego', precio:4200, tier:5, gemas:2 },
  hacha_obsidiana:  { rasgos:['perforar', 'aturdir'], n:'Hacha de obsidiana', slot:'arma', tipo:'hacha', poder:26, precio:4000, tier:5, gemas:2 },
  daga_draco:       { rasgos:['critico', 'antidragon'], n:'Daga de colmillo', slot:'arma', tipo:'daga', poder:21, precio:3800, tier:5, gemas:2 },
  arco_draco:       { rasgos:['alcance', 'antidragon'], n:'Arco dracónico', slot:'arma', tipo:'arco', poder:20, precio:4100, tier:5, gemas:2 },
  vara_abismo:      { rasgos:['drenar_mp', 'mp_regen'], n:'Vara del abismo', slot:'arma', tipo:'vara', poder:11, mag:14, precio:4300, tier:5, gemas:2 },
  maza_solar:       { rasgos:['regen', 'antidemonio'], n:'Maza solar', slot:'arma', tipo:'maza', poder:18, mag:10, res:5, el:'luz', precio:4200, tier:5, gemas:2 },
  lanza_escama:     { rasgos:['antidragon', 'critico'], n:'Lanza de escama', slot:'arma', tipo:'lanza', poder:24, precio:4200, tier:5, gemas:2 },
  punos_magma:      { rasgos:['aturdir', 'critico'], n:'Puños de magma', slot:'arma', tipo:'puños', poder:13, el:'fuego', precio:4000, tier:5, gemas:2 },
  manto_vacio:      { rasgos:['mp_regen', 'escudo'], n:'Manto del vacío', slot:'armadura', tipo:'tela', def:16, res:22, mp:25, precio:4000, tier:5, gemas:2 },
  cuero_wyvern:     { rasgos:['esquiva', 'regen'], n:'Cuero de wyvern', slot:'armadura', tipo:'cuero', def:23, res:11, precio:4000, tier:5, gemas:2 },
  armadura_escamas: { rasgos:['escudo', 'regen'], n:'Armadura de escamas', slot:'armadura', tipo:'malla', def:30, res:9, precio:4400, tier:5, gemas:2 },
  anillo_abismo:    { rasgos:['drenar_mp'], n:'Anillo del abismo', slot:'acc', atk:5, mag:5, precio:3000, tier:5, gemas:1 },
  amuleto_obsidiana:{ rasgos:['escudo'], n:'Amuleto de obsidiana', slot:'acc', def:4, res:4, inmune:['silencio'], precio:2800, tier:5, gemas:1 },
  matadragones:     { rasgos:['antidragon', 'critico', 'regen'], n:'Matadragones', slot:'arma', tipo:'espada', poder:33, el:'luz', precio:0, tier:9, gemas:3, forja:true },
  egida_abismo:     { rasgos:['escudo', 'fenix'], n:'Égida del abismo', slot:'armadura', tipo:'malla', def:37, res:15, precio:0, tier:9, gemas:3, forja:true },
  cetro_nombres:    { rasgos:['mp_regen', 'prisa_ini', 'antidemonio'], n:'Cetro de los nombres', slot:'arma', tipo:'vara', poder:13, mag:21, mp:30, precio:0, tier:9, gemas:3, forja:true },
  arco_estrella:    { rasgos:['alcance', 'perforar', 'critico'], n:'Arco estrella negra', slot:'arma', tipo:'arco', poder:27, precio:0, tier:9, gemas:3, forja:true },
});
Object.assign(MAT, {
  escama: { n:'Escama de dragón', d:'Dura como el acero y caliente al tacto.', c:'#c84a3a' },
  cuerno: { n:'Cuerno de demonio', d:'Todavía late un poco. Asqueroso, pero útil.', c:'#5a2a4a' },
});
FORJA.push(
  { id:'matadragones',  oro:6000, mat:{ escama:4, esquirla:3 } },
  { id:'egida_abismo',  oro:5500, mat:{ cuerno:4, escama:2 } },
  { id:'cetro_nombres', oro:6500, mat:{ cuerno:5, esquirla:3 } },
  { id:'arco_estrella', oro:6000, mat:{ escama:3, cuerno:2, plata:4 } },
);

// ---------- Personajes nuevos ----------
Object.assign(PJ, {
  kaela:  { n:'Kaela', clase:'draconiana', look:{ pelo:'#c83a2a', piel:'#e0ac80', estilo:2, cara:{ ojos:2, iris:'#ffb030', cejas:2, boca:3, cicatriz:true } } },
  rook:   { n:'Rook', clase:'cazademonios', look:{ pelo:'#e8e8e8', piel:'#c88a5a', estilo:0, cara:{ ojos:3, iris:'#8a3a3a', cejas:1, boca:1, parche:false, cicatriz:true } } },
  vesperpj:{ n:'Señora Vesper', clase:'vesper', look:{ pelo:'#1a0a1a', piel:'#d8b0e8', estilo:2, cara:{ ojos:2, iris:'#ff3a8a', cejas:4, boca:3, pestanas:true, lunar:true } } },
  grakkpj:{ n:'Grakk', clase:'grakk' },
  vael:   { n:'Vaelgor', clase:'vaelgor' },
  thana:  { n:'Thanatyr', clase:'thanatyr' },
  brasa:  { n:'Herrera Brasa', clase:'recluta', look:{ pelo:'#ff7a2a', piel:'#9a6440', estilo:1, cara:{ ojos:0, cejas:1, boca:2, pecas:true } } },
});
Object.assign(RECLUTAS_HISTORIA, {
  rook:  { nv:32, clases:{ recluta:450, arquero:700, ladron:450, cazademonios:0 }, apr:['flecha_bendita', 'sello', 'disparo_preciso'], eq:['arco_compuesto', 'brigantina'] },
  kaela: { nv:42, clases:{ recluta:450, guerrero:700, caballero:450, lancero:450, draconiana:0 }, apr:['lanzazo_draco', 'aliento_draco', 'salto'], eq:['lanza_dentada', 'armadura_real'] },
});
Object.assign(FAC_UNICOS, {
  rook:  { hp:1.0, mp:1.0, atk:1.07, def:0.98, mag:1.0, res:1.04, spd:1.08 },
  kaela: { hp:1.1, mp:0.96, atk:1.1, def:1.06, mag:1.0, res:0.98, spd:1.02 },
});

// ---------- Batallas del Acto II ----------
const A2 = (x, y) => [x, y];
const ALI = [A2(3, 9), A2(4, 9), A2(5, 9), A2(3, 10), A2(5, 10)];
Object.assign(BATALLAS, {
  b12: { n:'Brezal en llamas', mapa:'brezal2', musica:'jefe', oro:3200, aliados:[A2(3,9),A2(4,9),A2(5,9),A2(3,10),A2(5,10)],
         e:[ {c:'demonio',nv:32,x:4,y:0}, {c:'diablillo',nv:31,x:3,y:2}, {c:'diablillo',nv:31,x:5,y:1}, {c:'gargola',nv:31,x:0,y:3}, {c:'diablillo',nv:31,x:8,y:3} ],
         objetivo:'Derrotá a todos los enemigos', mat:{cuerno:1} },
  b13: { n:'Camino de Ceniza', mapa:'ceniza', musica:'batalla', oro:3400, aliados:[A2(3,9),A2(4,9),A2(5,9),A2(3,10),A2(5,10)],
         e:[ {c:'sabueso',nv:33,x:2,y:0}, {c:'sabueso',nv:33,x:5,y:1}, {c:'sabueso',nv:34,x:3,y:2}, {c:'diablillo',nv:33,x:6,y:0}, {c:'salamandra',nv:34,x:4,y:4} ],
         objetivo:'Derrotá a todos los enemigos', mat:{cuerno:1} },
  b14: { n:'Villa Ceniza sitiada', mapa:'villa', musica:'jefe', oro:3800, aliados:[A2(3,9),A2(4,9),A2(5,9),A2(3,10),A2(5,10)],
         e:[ {c:'demonio',nv:36,x:4,y:3,n:'Teniente Skarn',jefe:true}, {c:'diablillo',nv:34,x:2,y:0}, {c:'diablillo',nv:34,x:6,y:0}, {c:'gargola',nv:34,x:4,y:0}, {c:'sabueso',nv:34,x:5,y:2} ],
         objetivo:'Derrotá al Teniente Skarn', jefeGana:true, mat:{cuerno:2,esquirla:1}, gema:'topacio' },
  b15: { n:'Ladera del volcán', mapa:'volcan', musica:'batalla', oro:4000, aliados:[A2(2,10),A2(3,10),A2(4,10),A2(5,10),A2(6,10)],
         e:[ {c:'salamandra',nv:38,x:2,y:0}, {c:'salamandra',nv:38,x:6,y:0}, {c:'wyvern',nv:38,x:1,y:1}, {c:'wyvern',nv:38,x:5,y:1}, {c:'salamandra',nv:39,x:7,y:2} ],
         objetivo:'Derrotá a todos los enemigos', mat:{escama:1} },
  b16: { n:'El nido de los dragones', mapa:'nido', musica:'batalla', oro:4300, aliados:[A2(2,9),A2(3,9),A2(4,9),A2(5,9),A2(6,9)],
         e:[ {c:'wyvern',nv:40,x:3,y:2}, {c:'wyvern',nv:40,x:5,y:2}, {c:'wyvern',nv:41,x:4,y:3}, {c:'salamandra',nv:40,x:2,y:1}, {c:'salamandra',nv:40,x:6,y:1}, {c:'gargola',nv:40,x:1,y:3} ],
         objetivo:'Derrotá a todos los enemigos', mat:{escama:2} },
  b17: { n:'Thanatyr, el Dragón Negro', mapa:'cima', musica:'final', oro:5200, aliados:[A2(2,10),A2(3,10),A2(4,10),A2(5,10),A2(6,10)],
         e:[ {c:'thanatyr',nv:44,x:4,y:1,n:'Thanatyr',jefe:true}, {c:'wyvern',nv:42,x:2,y:2}, {c:'wyvern',nv:42,x:6,y:2}, {c:'salamandra',nv:42,x:3,y:4}, {c:'salamandra',nv:42,x:5,y:4} ],
         objetivo:'Derrotá a Thanatyr', jefeGana:true, mat:{escama:3,esquirla:1}, gema:'rubi' },
  b18: { n:'Desfiladero de los Lamentos', mapa:'desfiladero', musica:'batalla', oro:5000, aliados:[A2(2,10),A2(3,10),A2(4,10),A2(5,10),A2(6,10)],
         e:[ {c:'esqueleto',nv:45,x:2,y:0}, {c:'esqueleto',nv:45,x:6,y:0}, {c:'lich',nv:46,x:4,y:1}, {c:'esqueleto',nv:45,x:3,y:2}, {c:'espectro',nv:45,x:5,y:2}, {c:'espectro',nv:45,x:1,y:3} ],
         objetivo:'Derrotá a todos los enemigos', mat:{plata:2} },
  b19: { n:'El Puente de Hueso', mapa:'hueso', musica:'batalla', oro:5300, aliados:[A2(2,9),A2(4,9),A2(6,9),A2(3,10),A2(5,10)],
         e:[ {c:'gargola',nv:47,x:3,y:0}, {c:'gargola',nv:47,x:5,y:0}, {c:'demonio',nv:47,x:4,y:1}, {c:'diablillo',nv:47,x:2,y:4}, {c:'diablillo',nv:47,x:6,y:4}, {c:'esqueleto',nv:47,x:4,y:2} ],
         objetivo:'Derrotá a todos los enemigos', mat:{cuerno:2} },
  b20: { n:'Las Puertas del Abismo', mapa:'puertas', musica:'final', oro:6500, aliados:[A2(3,9),A2(4,9),A2(5,9),A2(3,10),A2(5,10)],
         e:[ {c:'cancerbero',nv:50,x:4,y:2,n:'Cancerbero',jefe:true}, {c:'sabueso',nv:48,x:2,y:2}, {c:'sabueso',nv:48,x:6,y:2}, {c:'sabueso',nv:48,x:3,y:4}, {c:'demonio',nv:48,x:1,y:1}, {c:'demonio',nv:48,x:7,y:1} ],
         objetivo:'Derrotá al Cancerbero', jefeGana:true, mat:{cuerno:3,esquirla:2}, gema:'diamante' },
  b21: { n:'Las calles hundidas', mapa:'hundida', musica:'batalla', oro:6000, aliados:[A2(2,10),A2(3,10),A2(4,10),A2(5,10),A2(6,10)],
         e:[ {c:'lich',nv:51,x:1,y:0}, {c:'espectro',nv:51,x:6,y:1}, {c:'esqueleto',nv:51,x:4,y:2}, {c:'esqueleto',nv:51,x:2,y:1}, {c:'demonio',nv:52,x:5,y:4}, {c:'gargola',nv:51,x:8,y:3} ],
         objetivo:'Derrotá a todos los enemigos', mat:{plata:3} },
  b22: { n:'El Archivo de los Nombres', mapa:'archivo', musica:'jefe', oro:6400, aliados:[A2(3,9),A2(4,9),A2(5,9),A2(3,10),A2(5,10)],
         e:[ {c:'lich',nv:54,x:4,y:2,n:'Archivista Hueco',jefe:true}, {c:'lich',nv:53,x:1,y:0}, {c:'lich',nv:53,x:7,y:0}, {c:'espectro',nv:53,x:3,y:5}, {c:'espectro',nv:53,x:5,y:5}, {c:'esqueleto',nv:53,x:4,y:6} ],
         objetivo:'Derrotá al Archivista Hueco', jefeGana:true, mat:{plata:3,esquirla:1} },
  b23: { n:'Señora Vesper', mapa:'voz', musica:'final', oro:7500, aliados:[A2(3,9),A2(4,9),A2(5,9),A2(3,10),A2(5,10)],
         e:[ {c:'vesper',nv:56,x:4,y:1,n:'Señora Vesper',jefe:true,look:PJ.vesperpj.look}, {c:'demonio',nv:54,x:3,y:2}, {c:'demonio',nv:54,x:5,y:2}, {c:'diablillo',nv:54,x:1,y:4}, {c:'diablillo',nv:54,x:7,y:4}, {c:'lich',nv:54,x:4,y:3} ],
         objetivo:'Derrotá a la Señora Vesper', jefeGana:true, mat:{cuerno:3,esquirla:2}, gema:'amatista' },
  b24: { n:'Grakk, el Rey Ígneo', mapa:'llanura', musica:'final', oro:8000, aliados:[A2(3,9),A2(4,9),A2(5,9),A2(3,10),A2(5,10)],
         e:[ {c:'grakk',nv:58,x:4,y:4,n:'Grakk',jefe:true}, {c:'salamandra',nv:56,x:3,y:3}, {c:'salamandra',nv:56,x:5,y:3}, {c:'demonio',nv:56,x:1,y:1}, {c:'demonio',nv:56,x:7,y:1}, {c:'sabueso',nv:56,x:4,y:0} ],
         objetivo:'Derrotá a Grakk', jefeGana:true, mat:{cuerno:4,escama:2} },
  b25: { n:'El Palacio de Vaelgor', mapa:'palacio', musica:'jefe', oro:8200, aliados:[A2(3,9),A2(4,9),A2(5,9),A2(3,10),A2(5,10)],
         e:[ {c:'demonio',nv:60,x:4,y:2}, {c:'demonio',nv:60,x:2,y:2}, {c:'demonio',nv:60,x:6,y:2}, {c:'gargola',nv:60,x:1,y:1}, {c:'gargola',nv:60,x:7,y:1}, {c:'lich',nv:60,x:4,y:0}, {c:'cancerbero',nv:58,x:4,y:5} ],
         objetivo:'Derrotá a todos los enemigos', mat:{cuerno:4,esquirla:2} },
  b26: { n:'Vaelgor, el Devorador de Nombres', mapa:'abismo', musica:'final', oro:9000, aliados:[A2(3,9),A2(4,9),A2(5,9),A2(3,10),A2(5,10)],
         e:[ {c:'vaelgor',nv:63,x:4,y:1,n:'Vaelgor',jefe:true}, {c:'demonio',nv:61,x:2,y:2}, {c:'demonio',nv:61,x:6,y:2}, {c:'lich',nv:61,x:3,y:0}, {c:'lich',nv:61,x:5,y:0} ],
         objetivo:'Derrotá a Vaelgor', jefeGana:true, mat:{cuerno:3} },
  b27: { n:'Vaelgor Desatado', mapa:'abismo', musica:'final', oro:15000, aliados:[A2(3,9),A2(4,9),A2(5,9),A2(3,10),A2(5,10)],
         e:[ {c:'vaelgor2',nv:66,x:4,y:2,n:'Vaelgor Desatado',jefe:true}, {c:'gargola',nv:62,x:1,y:4}, {c:'gargola',nv:62,x:7,y:4}, {c:'diablillo',nv:62,x:2,y:1}, {c:'diablillo',nv:62,x:6,y:1} ],
         objetivo:'Derrotá a Vaelgor Desatado', jefeGana:true, mat:{esquirla:5,escama:3,cuerno:3} },
});

// ---------- Región sur (segundo mapa del mundo) ----------
Object.assign(NODOS, {
  paso_sur:     { n:'Paso del Sur', tipo:'campo', region:'norte', x:50, y:96, desde:11, portal:'sur' },
  portal_norte: { n:'Volver a Aldmora', tipo:'campo', region:'sur', x:50, y:4, desde:11, portal:'norte' },
  camino_ceniza:{ n:'Camino de Ceniza', tipo:'campo', region:'sur', x:38, y:15, desde:12, batalla:'b13', patrulla:['sabueso','diablillo','salamandra'] },
  villa:        { n:'Villa Ceniza', tipo:'pueblo', region:'sur', x:58, y:24, desde:12, batalla:'b14', tienda:true, herreria:true, taberna:true, mascotas:true, gemas:true, patrulla:['demonio','diablillo','gargola'] },
  volcan:       { n:'Ladera del volcán', tipo:'campo', region:'sur', x:76, y:33, desde:14, batalla:'b15', patrulla:['salamandra','wyvern'] },
  nido:         { n:'Nido de los dragones', tipo:'campo', region:'sur', x:85, y:47, desde:15, batalla:'b16', patrulla:['wyvern','salamandra','gargola'] },
  cima:         { n:'Cima del Monte Draco', tipo:'campo', region:'sur', x:76, y:61, desde:16, batalla:'b17', patrulla:['wyvern','gargola'] },
  desfiladero:  { n:'Desfiladero de los Lamentos', tipo:'campo', region:'sur', x:42, y:42, desde:17, batalla:'b18', patrulla:['esqueleto','lich','espectro'] },
  puente_hueso: { n:'Puente de Hueso', tipo:'campo', region:'sur', x:28, y:53, desde:18, batalla:'b19', patrulla:['gargola','demonio','esqueleto'] },
  puertas:      { n:'Puertas del Abismo', tipo:'campo', region:'sur', x:18, y:66, desde:19, batalla:'b20', patrulla:['sabueso','demonio'] },
  refugio:      { n:'Refugio del Abismo', tipo:'pueblo', region:'sur', x:34, y:74, desde:20, tienda:true, herreria:true, taberna:true, gemas:true },
  hundida:      { n:'Ciudad Hundida', tipo:'campo', region:'sur', x:52, y:70, desde:20, batalla:'b21', patrulla:['lich','esqueleto','espectro'] },
  archivo:      { n:'Archivo de los Nombres', tipo:'campo', region:'sur', x:66, y:80, desde:21, batalla:'b22', patrulla:['lich','espectro'] },
  trono:        { n:'Trono de Vesper', tipo:'campo', region:'sur', x:80, y:88, desde:22, batalla:'b23', patrulla:['demonio','diablillo','lich'] },
  llanura:      { n:'Llanuras de Fuego', tipo:'campo', region:'sur', x:56, y:90, desde:23, batalla:'b24', patrulla:['salamandra','demonio','sabueso'] },
  palacio:      { n:'Palacio de Vaelgor', tipo:'campo', region:'sur', x:36, y:92, desde:24, batalla:'b25', patrulla:['demonio','gargola','lich'] },
  abismo:       { n:'Corazón del Abismo', tipo:'campo', region:'sur', x:18, y:90, desde:25, batalla:'b26', patrulla:['demonio','lich','gargola'] },
});
Object.values(NODOS).forEach(n => { if (!n.region) n.region = 'norte'; });
CAMINOS.push(['brezal', 'paso_sur'], ['portal_norte', 'camino_ceniza'], ['camino_ceniza', 'villa'], ['villa', 'volcan'], ['volcan', 'nido'], ['nido', 'cima'], ['villa', 'desfiladero'], ['desfiladero', 'puente_hueso'], ['puente_hueso', 'puertas'], ['puertas', 'refugio'], ['refugio', 'hundida'], ['hundida', 'archivo'], ['archivo', 'trono'], ['trono', 'llanura'], ['llanura', 'palacio'], ['palacio', 'abismo']);

// ---------- Historia del Acto II ----------
// El final del Acto I ahora abre el segundo acto.
(() => {
  const fin = HISTORIA[HISTORIA.length - 1].despues;
  fin[fin.length - 1] = [null, 'FIN DEL ACTO I.'];
  fin.push([null, 'Esa misma noche, muy lejos al sur, algo que dormía hace trescientos años abrió un ojo. Tenía hambre.']);
})();
HISTORIA.push(
  { b:'b12', nodo:'brezal', cap:'Acto II — Capítulo 6: La Grieta del Sur',
    antes:[
      [null, 'Pasó una estación. En Brezal las campanas sonaban con canciones y nadie perdía la memoria. Durante un tiempo, todo estuvo bien.'],
      ['odo', 'Lior, mirá el cielo del sur. Hace tres noches que está rojo.'],
      ['mara', 'Y los pájaros se fueron todos juntos. Hacia el norte. Eso no es normal.'],
      [null, 'Un temblor sacude el pueblo. Del bosque salen criaturas con cuernos y alas de murciélago.'],
      ['lior', '¿Eso son... demonios? ¡Todos a la plaza!'],
    ],
    despues:[
      ['odo', 'Ahora entiendo. La Bruma no era solo una niebla. Era el aliento de algo dormido. Algo que comía recuerdos.'],
      ['odo', 'Las campanas lo alimentaban con los recuerdos de los campaneros, y así lo mantenían quieto. Cuando dejamos de dárselos... se despertó con hambre.'],
      ['ysolde', 'Entonces lo que hicimos lo despertó.'],
      ['lior', 'Lo que hicimos fue lo correcto. Ahora nos toca terminarlo. ¿Cómo se llama esa cosa?'],
      ['odo', 'En los libros viejos lo llaman Vaelgor, el Devorador de Nombres. Duerme bajo las tierras del sur, más allá de la Grieta.'],
      [null, 'Se abrió el camino al sur. Tocá el Paso del Sur en el mapa para cruzar.'],
    ] },
  { b:'b13', nodo:'camino_ceniza', cap:null,
    antes:[
      ['fenn', 'Esto es ceniza. Todo. El piso, el aire, mi almuerzo.'],
      ['rook', 'Bajen la voz. Los sabuesos infernales cazan por el oído.'],
      ['brann', '¿Y vos de dónde saliste?'],
      ['rook', 'Rook. Cazo demonios desde antes de que ustedes supieran que existían. Y esos de ahí vienen por ustedes.'],
    ],
    une_antes:['rook'],
    despues:[
      ['rook', 'Nada mal para gente del norte. Villa Ceniza está cerca. Si sigue en pie, ahí nos pueden ayudar.'],
      ['mara', '¿Si sigue en pie?'],
      ['rook', 'Los demonios la tienen sitiada hace una semana.'],
    ] },
  { b:'b14', nodo:'villa', cap:null,
    antes:[
      ['brasa', '¡Los del norte! ¡Por fin alguien! El teniente Skarn nos quiere quemar a todos para hacer un altar.'],
      ['lior', 'No mientras estemos acá.'],
    ],
    despues:[
      ['brasa', '¡Lo echaron! Soy Brasa, la herrera del pueblo. Tengo la forja más caliente del mundo: el volcán entero.'],
      ['rook', 'Skarn trabajaba para Thanatyr, el dragón negro del Monte Draco. Los dragones se aliaron con Vaelgor a cambio de la tierra del norte.'],
      ['aldous', 'Entonces hay que subir al Monte Draco antes de que esos dragones crucen la Grieta.'],
    ] },
  { b:'b15', nodo:'volcan', cap:'Capítulo 7: Monte Draco',
    antes:[
      ['ysolde', 'El suelo quema a través de las botas.'],
      ['rook', 'No pisen la lava. Parece obvio, pero siempre hay uno.'],
      ['fenn', '¿Por qué me miran a mí?'],
    ],
    despues:[
      ['mara', 'Arriba se ven nidos. Y huevos. Huevos enormes.'],
      ['lior', 'Los wyverns protegen algo. Sigamos subiendo.'],
    ] },
  { b:'b16', nodo:'nido', cap:null,
    antes:[
      ['kaela', '¡Alto! Un paso más y los atravieso.'],
      ['lior', 'No venimos por los huevos. Venimos por Thanatyr.'],
      ['kaela', '...Entonces no son enemigos. Thanatyr mató a mi madre, la última jinete de dragones. Yo tengo su sangre. Y su lanza.'],
      ['kaela', 'Primero hay que pasar el nido. Los wyverns no distinguen amigos.'],
    ],
    despues:[
      ['kaela', 'Pelean bien, gente del norte. Thanatyr está en la cima. Si suben conmigo, lo bajamos juntos.'],
    ] },
  { b:'b17', nodo:'cima', cap:null,
    antes:[
      ['thana', 'LA HIJA DE LA JINETE. TE ESPERABA. TU MADRE TAMBIÉN GRITÓ ASÍ.'],
      ['kaela', 'Hoy no grita nadie más que vos, lagartija.'],
      ['thana', 'VAELGOR ME PROMETIÓ EL NORTE. SUS CAMPANAS, SUS CASAS, SUS NOMBRES. ¡ARDERÁN!'],
    ],
    despues:[
      ['kaela', 'Mamá... ya está. Ya está.'],
      ['lior', 'Kaela. Vamos a bajar al Abismo a terminar con Vaelgor. Nos vendría bien una lanza como la tuya.'],
      ['kaela', 'No hace falta que lo pidas. Voy.'],
      [null, 'Entre los restos del dragón hay escamas negras. Una herrera de verdad sabría qué hacer con ellas.'],
    ],
    une:['kaela'] },
  { b:'b18', nodo:'desfiladero', cap:'Capítulo 8: Las Puertas del Abismo',
    antes:[
      ['ysolde', 'Escuchen... son voces. Miles. Lloran.'],
      ['rook', 'Son los olvidados. Todos los que se convirtieron en Huecos en trescientos años. Vaelgor guardó sus nombres acá abajo.'],
      ['lior', 'Entonces también se pueden devolver.'],
    ],
    despues:[
      ['rook', 'Un liche. Antes eran magos. Vaelgor les comió el nombre y les dejó solo el poder.'],
      ['brann', 'Pobres diablos. Literal.'],
    ] },
  { b:'b19', nodo:'puente_hueso', cap:null,
    antes:[
      ['fenn', 'Un puente hecho de huesos sobre un abismo sin fondo. Ya vi este puente en mis pesadillas. Era más lindo.'],
      ['kaela', 'Del otro lado están las Puertas. Las cuida el perro de Vaelgor.'],
    ],
    despues:[
      ['mara', 'Se escucha un aullido. Tres aullidos, en realidad. Al mismo tiempo.'],
      ['rook', 'El Cancerbero. Tres cabezas, tres veces el hambre.'],
    ] },
  { b:'b20', nodo:'puertas', cap:null,
    antes:[
      [null, 'Frente a las Puertas del Abismo, un perro del tamaño de una casa se levanta. Sus tres cabezas abren la boca a la vez.'],
      ['brann', 'Bueno. Siempre quise un perro.'],
      ['ysolde', '¡Brann!'],
    ],
    despues:[
      ['lior', 'Las puertas se abren solas. Adentro hay... una ciudad.'],
      ['rook', 'La Ciudad Hundida. Antes de las campanas, ahí vivía la gente que inventó la Bruma. Del otro lado del puente hay un refugio. Descansen antes de seguir.'],
    ] },
  { b:'b21', nodo:'hundida', cap:'Capítulo 9: La Ciudad Hundida',
    antes:[
      ['nela', 'Las casas son iguales a las de Brezal. Como si alguien las hubiera copiado.'],
      ['odo', 'O como si Brezal las hubiera copiado de acá. Hace mucho.'],
    ],
    despues:[
      ['lior', 'Hay un edificio enorme en el centro. Lleno de libros.'],
      ['rook', 'El Archivo de los Nombres. Si los nombres robados están en algún lado, es ahí.'],
    ] },
  { b:'b22', nodo:'archivo', cap:null,
    antes:[
      ['ysolde', 'Cada libro tiene un nombre en la tapa. Y nada adentro.'],
      ['lior', 'Son ellos. Los olvidados. Sus vidas, en blanco.'],
    ],
    despues:[
      ['lior', 'Cuando suene la Canción de la memoria acá adentro, se van a llenar. Lo siento.'],
      ['rook', 'Pero primero hay que pasar por Vesper. La mano derecha de Vaelgor. Su trono está al este.'],
    ] },
  { b:'b23', nodo:'trono', cap:null,
    antes:[
      ['vesperpj', 'El campanerito. Qué tierno. ¿Viniste a devolver nombres? Yo los colecciono.'],
      ['lior', 'No son tuyos.'],
      ['vesperpj', 'Nada es de nadie, querido. Solo de quien se acuerda. Y vos... vas a olvidar.'],
    ],
    despues:[
      ['vesperpj', 'Vaelgor... me prometió... un nombre propio...'],
      ['ysolde', 'Ella también fue alguien, alguna vez.'],
      ['rook', 'Queda Grakk, el Rey Ígneo, en las llanuras de fuego. Después, el palacio.'],
    ] },
  { b:'b24', nodo:'llanura', cap:'Capítulo 10: El Corazón del Abismo',
    antes:[
      ['grakkpj', '¡JA! ¡CARNE DEL NORTE! ¡VAELGOR ME DEJÓ EL HONOR DE ASARLOS!'],
      ['kaela', 'Hoy ya maté un dragón. Un demonio con mal aliento no me asusta.'],
    ],
    despues:[
      ['lior', 'El palacio está adelante. Y debajo del palacio, el corazón del Abismo.'],
      ['mara', 'Lior. Pase lo que pase... gracias por traernos hasta acá.'],
      ['lior', 'Todavía no terminó.'],
    ] },
  { b:'b25', nodo:'palacio', cap:null,
    antes:[
      ['aldous', 'Su guardia de élite. Formación cerrada, y que nadie quede solo.'],
      ['brann', 'Como en los viejos tiempos, Aldous.'],
      ['aldous', 'En los viejos tiempos peleábamos por una reina equivocada. Hoy no.'],
    ],
    despues:[
      [null, 'Bajo el palacio, una escalera de obsidiana desciende hacia una oscuridad que respira.'],
      ['lior', 'Ahí abajo está. Puedo escucharlo. Está... masticando.'],
    ] },
  { b:'b26', nodo:'abismo', cap:null,
    antes:[
      ['vael', 'LIOR DE BREZAL. TE CONOZCO. CONOZCO A TODOS. TENGO TODOS SUS NOMBRES ACÁ ADENTRO.'],
      ['lior', 'Entonces devolvelos.'],
      ['vael', 'LOS NOMBRES SON COMIDA. LOS RECUERDOS SON COMIDA. USTEDES SON COMIDA. ESO ES TODO LO QUE HAY.'],
      ['lior', 'No. Hay canciones.'],
    ],
    despues:[
      ['vael', 'NO... NO PUEDEN... ¡SOY EL HAMBRE DE TRESCIENTOS AÑOS!'],
      [null, 'Vaelgor se desarma y se vuelve a armar. Su cuerpo se estira hasta llenar el Abismo: alas, garras, mil ojos.'],
      ['kaela', '¡Se está transformando en dragón!'],
      ['lior', 'Todos juntos. Última vez.'],
    ] },
  { b:'b27', nodo:'abismo', cap:null, seguida:true,
    antes:[],
    despues:[
      [null, 'Lior tocó la Canción de la memoria en el corazón del Abismo. Las siete campanas del norte respondieron desde lejos, todas a la vez.'],
      [null, 'Y Vaelgor, por primera vez en su existencia, recordó algo: que antes del hambre, también había sido un nombre.'],
      ['vael', '...Me llamaba... Vael. Era un niño. Tenía miedo de olvidar...'],
      [null, 'El Devorador se deshizo en luz. Miles de nombres salieron volando hacia el norte, cada uno hacia su dueño.'],
      ['ysolde', 'Los Huecos... están volviendo a ser personas.'],
      ['rook', 'Treinta años cazando demonios y nunca vi uno pedir perdón.'],
      ['kaela', 'Mamá estaría contenta. Creo.'],
      ['mara', '¿Y ahora qué, campanero?'],
      ['lior', 'Ahora volvemos a casa. A tocar la campana. Todas las mañanas, con una canción nueva.'],
      [null, 'FIN. Gracias por jugar Campanas de Bruma. Las misiones secretas, las patrullas y la Torre de la Bruma te siguen esperando.'],
    ] },
);

// ---------- Pueblos del sur ----------
Object.assign(ROPA, {
  ceniza: { C:'#6a5a5a', D:'#4a3e3e', A:'#ff8a3a', g:'panuelo' },
  minero: { C:'#7a5a3a', D:'#4a3626', A:'#ffd84a', g:'casco' },
  monja:  { C:'#2a2a3a', D:'#1a1a26', A:'#e8e0c8', g:'capucha' },
});
PUEBLOS.villa = {
  suelo: [
    'llllllllllll',
    'lhhhhhhhhhhl',
    'lhhhhhhhhhhl',
    'lhhhhhhhhhhl',
    'lhhhhooohhhl',
    'lhhooooooohl',
    'lhhooooooohl',
    'lhhooooooohl',
    'lhhhhooohhhl',
    'lhhhhooohhhl',
    'lhhhhhhhhhhl',
    'lhhhhhhhhhhl',
    'lrhhhhhhhhrl',
    'lhhhhhhhhhhl',
    'llllhoohllll',
    'llllhoohllll',
  ],
  edificios: [
    { tipo:'tienda',   x:1, y:1, w:3, h:3, puerta:[2, 3], techo:'#4a3a46', pared:'#c8b8a8', cartel:'pocion', n:'Tienda' },
    { tipo:'herreria', x:8, y:1, w:3, h:3, puerta:[9, 3], techo:'#3a2a2a', pared:'#a89888', cartel:'herreria', n:'Forja del Volcán' },
    { tipo:'joyeria',  x:1, y:9, w:3, h:3, puerta:[2, 11], techo:'#5a3a6a', pared:'#c8b8a8', cartel:'joyeria', n:'Joyería' },
    { tipo:'criadero', x:8, y:9, w:3, h:3, puerta:[9, 11], techo:'#3a5a4a', pared:'#d8c8b8', cartel:'criadero', n:'Criadero' },
    { tipo:'taberna',  x:4, y:1, w:4, h:3, puerta:[6, 3], techo:'#6a3a1a', pared:'#d8c0a0', cartel:'taberna', n:'Taberna' },
  ],
  objetos: [{ tipo:'pozo', x:6, y:6 }, { tipo:'barril', x:3, y:7 }],
  entrada: [5, 13], salidas: [[5, 15], [6, 15]],
  vecinos: [
    { id:'brasa', n:'Herrera Brasa', ropa:'herrero', look:PJ.brasa.look, x:9, y:5, regalo:{ desde:14, obj:{ hipocion:3 }, txt:'Por salvar el pueblo. Y llevá esto: la gente que pelea contra demonios se lastima mucho.' }, charla:[
      { hasta:99, t:['Las escamas de dragón son lo más duro que existe. Traeme cuatro y te hago una espada que corta montañas.', 'Mi forja usa el calor del volcán. Por eso todo lo que sale de acá quema un poquito.'] },
    ], mision:'forja_infernal' },
    { id:'abuela_draco', n:'Abuela Ceniza', ropa:'anciana', look:{ pelo:'#d8d8d8', piel:'#9a6440', estilo:2, cara:{ ojos:4, cejas:3, boca:0, arrugas:true } }, x:3, y:6, charla:[
      { hasta:99, t:['Yo vi dragones dorados cuando era niña. Eran sabios, no como ese Thanatyr.', 'Dicen que el más viejo de todos todavía duerme en lo más alto. El Dragón Anciano.'] },
    ], mision:'dragon_anciano' },
    { id:'minero', n:'Minero Tuco', ropa:'minero', look:{ pelo:'#3a2a1e', piel:'#c88a5a', barba:true, estilo:0, cara:{ ojos:0, cejas:1, boca:2 } }, x:7, y:12, regalo:{ desde:12, obj:{ eter:2 }, txt:'Encontré estos frascos en un túnel. No sé qué son, pero brillan azul. Llevalos vos.' }, charla:[
      { hasta:14, t:['Los demonios rompieron la mina. Ahora salen salamandras por todos lados.'] },
      { hasta:99, t:['Gracias a ustedes volvimos a picar piedra. ¡Encontré obsidiana del tamaño de una vaca!'] },
    ] },
    { id:'nina_ceniza', n:'Chispa', ropa:'nino', look:{ pelo:'#ff7a2a', piel:'#9a6440', estilo:1, cara:{ ojos:1, boca:2, pecas:true } }, x:5, y:9, charla:[
      { hasta:99, t:['¡Mi nombre es Chispa porque nací el día que explotó el volcán!', 'Los dragones no son malos. Bueno, ese negro sí. Pero los otros no.'] },
    ] },
    { id:'guardia_v', n:'Vigía Ostra', ropa:'guardia', look:{ pelo:'#1a1a22', piel:'#e0ac80', estilo:0, cara:{ ojos:3, cejas:2, boca:1, cicatriz:true } }, x:6, y:13, quieto:true, charla:[
      { hasta:99, t:['Los demonios odian la luz y el hielo. Si tenés magia de eso, usala.', 'Las gárgolas son de piedra: el rayo las parte en dos.'] },
    ] },
  ],
};
PUEBLOS.refugio = {
  suelo: [
    'xxxxxxxxxxxx'.replace(/x/g, 'm'),
    'moooooooooom',
    'moooooooooom',
    'moooooooooom',
    'moooohhoooom',
    'moohhhhhhoom',
    'moohhhhhhoom',
    'moohhhhhhoom',
    'moooohhoooom',
    'moooooooooom',
    'moooooooooom',
    'moooooooooom',
    'moooooooooom',
    'moooooooooom',
    'mmmmmoommmmm',
    'mmmmmoommmmm',
  ],
  edificios: [
    { tipo:'tienda',   x:1, y:1, w:3, h:3, puerta:[2, 3], techo:'#3a3a5a', pared:'#a8a0b8', cartel:'pocion', n:'Provisiones' },
    { tipo:'herreria', x:8, y:1, w:3, h:3, puerta:[9, 3], techo:'#2a2a3a', pared:'#8a8498', cartel:'herreria', n:'Herrería' },
    { tipo:'joyeria',  x:1, y:9, w:3, h:3, puerta:[2, 11], techo:'#4a2a5a', pared:'#a8a0b8', cartel:'joyeria', n:'Joyería' },
    { tipo:'taberna',  x:8, y:9, w:3, h:3, puerta:[9, 11], techo:'#4a2a1a', pared:'#b8a090', cartel:'taberna', n:'Fogón' },
  ],
  objetos: [{ tipo:'fuente', x:5, y:6 }, { tipo:'caja', x:4, y:12 }],
  entrada: [5, 13], salidas: [[5, 15], [6, 15]],
  vecinos: [
    { id:'monja', n:'Hermana Ilda', ropa:'monja', look:{ pelo:'#3a2a1e', piel:'#f2c9a0', estilo:1, cara:{ ojos:4, cejas:3, boca:0 } }, x:4, y:5, regalo:{ desde:20, obj:{ fenix:2, elixir:1 }, txt:'Que la luz los acompañe allá abajo. Y si no los acompaña, por lo menos llévense esto.' }, charla:[
      { hasta:99, t:['Este refugio lo armaron los que escaparon de la Ciudad Hundida. Hace siglos.', 'Rezo por los Huecos. Algún día van a recordar quiénes eran.'] },
    ] },
    { id:'superviviente', n:'Errante Moll', ropa:'aldeano', look:{ pelo:'#8a8a92', piel:'#c88a5a', barba:true, estilo:0, cara:{ ojos:4, cejas:3, boca:4, arrugas:true } }, x:7, y:7, charla:[
      { hasta:24, t:['Los liches hablan solos. Repiten un nombre una y otra vez, como si tuvieran miedo de perderlo.', 'Vesper colecciona nombres en frascos. Los vi. Brillan.'] },
      { hasta:99, t:['¡Me acordé de mi hija! ¡Se llama Lumi! ¡Tengo que volver al norte!'] },
    ] },
    { id:'cazadora', n:'Cazadora Nix', ropa:'cazadora', look:{ pelo:'#1a1a22', piel:'#9a6440', estilo:2, cara:{ ojos:2, iris:'#7aff9a', cejas:2, boca:3, pestanas:true } }, x:9, y:6, charla:[
      { hasta:99, t:['Rook me enseñó a cazar. Me dijo que el truco es no tener miedo. Mentira: el truco es tener mucho miedo y correr igual.', 'Contra el Cancerbero: hielo. Contra Grakk: hielo. Contra todo acá abajo: hielo.'] },
    ] },
  ],
};

// ---------- Misiones secretas del sur ----------
Object.assign(SECRETAS, {
  forja_infernal: { n:'El corazón del volcán', region:'sur', x:90, y:24, req:15, vecino:'brasa',
    pedido:[['brasa', 'Hay una forja más vieja que la mía, en el corazón del volcán. La usaban los demonios para hacer sus armas.'], ['brasa', 'Si me traés su yunque, puedo forjar cosas que ni los dioses tienen. Pero la cuida un demonio de fuego enorme.']],
    recordatorio:'El corazón del volcán está al este de Villa Ceniza. Llevá hielo.',
    gracias:[['brasa', '¡El yunque de los demonios! Ahora sí. Tomá esto: lo forjé apenas lo trajiste.']],
    batalla:{ n:'El corazón del volcán', mapa:'volcan', musica:'final', oro:7000, aliados:[[2, 10], [3, 10], [4, 10], [5, 10], [6, 10]], objetivo:'Derrotá al Forjador Infernal', jefeGana:true,
      e:[{ c:'grakk', nv:52, x:3, y:2, n:'Forjador Infernal', jefe:true }, { c:'salamandra', nv:48, x:2, y:0 }, { c:'salamandra', nv:48, x:6, y:0 }, { c:'demonio', nv:48, x:1, y:1 }, { c:'demonio', nv:48, x:7, y:2 }] },
    premio:{ equipo:[{ id:'espada_infernal', rareza:4 }, { id:'cuero_wyvern', rareza:3 }], mat:{ cuerno:3, escama:2 }, oro:3000 }, patrulla:['salamandra', 'demonio'] },
  dragon_anciano: { n:'El Dragón Anciano', region:'sur', x:94, y:70, req:17, vecino:'abuela_draco',
    pedido:[['abuela_draco', 'Ahora que Thanatyr cayó, el Dragón Anciano va a despertar. No es malo... pero pone a prueba a todos los que se le acercan.'], ['abuela_draco', 'Si le ganás, dicen que te regala uno de sus huevos. Imaginate tener un dragón propio.']],
    recordatorio:'El Dragón Anciano duerme en el pico más alto, al sur de la cima.',
    gracias:[['abuela_draco', '¡Un huevo dorado! Cuidalo bien. Los dragones recuerdan a quien los crió.']],
    batalla:{ n:'El Dragón Anciano', mapa:'cima', musica:'final', oro:12000, aliados:[[2, 10], [3, 10], [4, 10], [5, 10], [6, 10]], objetivo:'Derrotá al Dragón Anciano', jefeGana:true,
      e:[{ c:'dragon_anciano', nv:70, x:4, y:1, n:'Dragón Anciano', jefe:true }, { c:'wyvern', nv:62, x:2, y:2 }, { c:'wyvern', nv:62, x:6, y:2 }] },
    premio:{ mascota:'dragoncito', equipo:[{ id:'lanza_escama', rareza:4 }, { id:'armadura_escamas', rareza:4 }], mat:{ escama:6 }, oro:8000 }, patrulla:['wyvern', 'salamandra'] },
});
// La Torre de la Bruma pasa a ser el desafío final, después de todo.
SECRETAS.torre.req = 27;
SECRETAS.torre.batalla.e.forEach(e => e.nv += 34);
