// Maestría: al aprender todas las habilidades de una clase y llegar a nivel 5 en ella, la clase
// pasa a su forma maestra (Gran Arquera, Archimago…), da +5% de atributos y abre 3 habilidades más.
// Habilidades propias: cada personaje de la historia tiene 3 que se destraban con su nivel.

// Pasivas con bonos genéricos: bon = { stat: +%, eva: puntos }.
Object.assign(HAB, {
  // Recluta → Veterano
  carga_veterano: { maestria:true, n:'Carga del veterano', d:'Un golpe con años de oficio (x1.7).', tipo:'fis', mp:0, r:'arma', p:1.7, pc:500, fx:'corte' },
  grito_tropa:    { maestria:true, n:'Grito de la tropa', d:'Valor y Protección a los aliados cercanos.', tipo:'apoyo', mp:10, r:[0,0], a:2, af:'a', est:[{id:'valor',prob:100,dur:3},{id:'protegido',prob:100,dur:3}], pc:600, fx:'brillo' },
  temple:         { maestria:true, n:'Temple', d:'Pasiva: +15% de vida y +10% de defensa.', tipo:'pasiva', pv:'bon', bon:{hp:0.15, def:0.1}, pc:800 },
  // Novicio → Erudito
  estallido:      { maestria:true, carga:20, n:'Estallido arcano', d:'Magia pura en un área.', tipo:'mag', mp:18, r:[1,5], a:1, p:40, pc:600, fx:'brillo' },
  claridad:       { maestria:true, n:'Claridad', d:'Foco y Coraza a un aliado.', tipo:'apoyo', mp:10, r:[0,3], af:'a', est:[{id:'foco',prob:100,dur:3},{id:'coraza',prob:100,dur:3}], pc:500, fx:'brillo' },
  estudio:        { maestria:true, n:'Estudio', d:'Pasiva: +12% de magia y +15% de PM.', tipo:'pasiva', pv:'bon', bon:{mag:0.12, mp:0.15}, pc:800 },
  // Guerrero → Gran guerrero
  golpe_titanico: { maestria:true, n:'Golpe titánico', d:'Parte escudos (x2.2) y puede aturdir.', tipo:'fis', mp:8, r:'arma', p:2.2, est:[{id:'aturdido',prob:40,dur:1}], pc:700, fx:'golpe' },
  grito_batalla:  { maestria:true, n:'Grito de batalla', d:'Baja ataque y defensa a los enemigos cercanos.', tipo:'apoyo', mp:10, r:[0,0], a:2, af:'e', est:[{id:'debil',prob:80,dur:3},{id:'quebrado',prob:60,dur:3}], pc:600, fx:'onda' },
  piel_acero:     { maestria:true, n:'Piel de acero', d:'Pasiva: +15% de defensa y +10% de vida.', tipo:'pasiva', pv:'bon', bon:{def:0.15, hp:0.1}, pc:900 },
  // Arquero → Gran arquero
  flecha_perfora: { maestria:true, n:'Flecha perforante', d:'Nunca falla y rompe la defensa (x1.6).', tipo:'fis', mp:0, r:'arma', p:1.6, precisa:true, est:[{id:'quebrado',prob:70,dur:3}], pc:600, fx:'flecha' },
  diluvio:        { maestria:true, carga:24, n:'Diluvio de flechas', d:'Cubre un área grande de flechas.', tipo:'fis', mp:14, r:[3,7], a:2, p:0.9, pc:900, fx:'flecha' },
  ojo_aguila:     { maestria:true, n:'Ojo de águila', d:'Pasiva: +12% de ataque y +5% de velocidad.', tipo:'pasiva', pv:'bon', bon:{atk:0.12, spd:0.05}, pc:800 },
  // Clérigo → Sumo sacerdote
  milagro:        { maestria:true, n:'Milagro', d:'Cura mucho a todos los aliados cercanos.', tipo:'cura', mp:24, r:[0,0], a:2, af:'a', p:60, pc:800, fx:'cura' },
  juicio_sagrado: { maestria:true, carga:20, n:'Juicio sagrado', d:'Luz que quema en un área.', tipo:'mag', mp:20, r:[1,5], a:1, p:42, el:'luz', pc:700, fx:'luz' },
  gracia:         { maestria:true, n:'Gracia', d:'Pasiva: +15% de resistencia y +10% de PM.', tipo:'pasiva', pv:'bon', bon:{res:0.15, mp:0.1}, pc:800 },
  // Hechicero → Archimago
  meteoro:        { maestria:true, carga:14, n:'Meteoro', d:'Una roca ardiente cae del cielo.', tipo:'mag', mp:36, r:[2,6], a:2, p:70, el:'fuego', pc:1100, fx:'fuego' },
  cero_absoluto:  { maestria:true, carga:18, n:'Cero absoluto', d:'Congela un área y la deja Lenta.', tipo:'mag', mp:26, r:[1,5], a:1, p:52, el:'hielo', est:[{id:'lento',prob:60,dur:3}], pc:900, fx:'hielo' },
  archimagia:     { maestria:true, n:'Archimagia', d:'Pasiva: +15% de magia.', tipo:'pasiva', pv:'bon', bon:{mag:0.15}, pc:1000 },
  // Ladrón → Maestro ladrón
  golpe_sombras:  { maestria:true, n:'Golpe en las sombras', d:'x2 (x1.6 más por la espalda).', tipo:'fis', mp:0, r:'arma', p:2.0, espalda:true, pc:600, fx:'corte' },
  bomba_humo:     { maestria:true, n:'Bomba de humo', d:'Deja ciegos a los enemigos de un área.', tipo:'apoyo', mp:8, r:[1,4], a:1, af:'e', est:[{id:'ciego',prob:80,dur:3}], pc:500, fx:'humo' },
  sombra:         { maestria:true, n:'Sombra', d:'Pasiva: +10% de velocidad y +6 de evasión.', tipo:'pasiva', pv:'bon', bon:{spd:0.1, eva:6}, pc:800 },
  // Monje → Gran maestro
  puno_dragon:    { maestria:true, n:'Puño del dragón', d:'Dos golpes fuertes (x1.2 cada uno).', tipo:'fis', mp:6, r:'arma', p:1.2, golpes:2, pc:700, fx:'golpe' },
  loto:           { maestria:true, n:'Loto', d:'Regen y Valor a los aliados cercanos.', tipo:'apoyo', mp:0, r:[0,0], a:2, af:'a', est:[{id:'regen',prob:100,dur:3},{id:'valor',prob:100,dur:3}], pc:600, fx:'brillo' },
  cuerpo_hierro:  { maestria:true, n:'Cuerpo de hierro', d:'Pasiva: +15% de vida y +8% de ataque.', tipo:'pasiva', pv:'bon', bon:{hp:0.15, atk:0.08}, pc:900 },
  // Caballero → Caballero real
  carga_caballeria:{ maestria:true, n:'Carga de caballería', d:'Embiste desde lejos (x1.8) y puede aturdir.', tipo:'fis', mp:6, r:[1,3], p:1.8, est:[{id:'aturdido',prob:30,dur:1}], pc:700, fx:'golpe' },
  baluarte:       { maestria:true, n:'Baluarte', d:'Protección y Coraza a los que tiene al lado.', tipo:'apoyo', mp:12, r:[0,0], a:1, af:'a', est:[{id:'protegido',prob:100,dur:3},{id:'coraza',prob:100,dur:3}], pc:600, fx:'escudo' },
  escudo_honor:   { maestria:true, n:'Escudo de honor', d:'Pasiva: +15% de defensa y +10% de resistencia.', tipo:'pasiva', pv:'bon', bon:{def:0.15, res:0.1}, pc:900 },
  // Paladín → Santo cruzado
  cruz_sagrada:   { maestria:true, carga:20, n:'Cruz sagrada', d:'Luz en cruz. Doble contra demonios.', tipo:'mag', mp:22, r:[1,4], a:1, p:50, el:'luz', antidemonio:true, pc:900, fx:'luz' },
  mano_santa:     { maestria:true, n:'Mano santa', d:'Levanta a un caído con mucha vida.', tipo:'revivir', mp:28, r:[1,3], af:'a', p:0.8, pc:800, fx:'revivir' },
  aura_sagrada:   { maestria:true, n:'Aura sagrada', d:'Pasiva: +12% res, +8% def y +8% vida.', tipo:'pasiva', pv:'bon', bon:{res:0.12, def:0.08, hp:0.08}, pc:1000 },
  // Cronomante → Señor del tiempo
  paradoja:       { maestria:true, n:'Paradoja', d:'Detiene a los enemigos de un área.', tipo:'apoyo', mp:24, r:[1,5], a:1, af:'e', est:[{id:'detenido',prob:50,dur:2}], pc:900, fx:'tiempo' },
  prisa_total:    { maestria:true, n:'Prisa total', d:'Prisa a casi todo el grupo.', tipo:'apoyo', mp:28, r:[0,0], a:3, af:'a', est:[{id:'prisa',prob:100,dur:3}], pc:1000, fx:'tiempo' },
  eternidad:      { maestria:true, n:'Eternidad', d:'Pasiva: +12% de velocidad.', tipo:'pasiva', pv:'bon', bon:{spd:0.12}, pc:900 },
  // Lancero → Dragontino
  salto_celeste:  { maestria:true, n:'Salto celeste', d:'Salta muy alto y cae de lejos (x2).', tipo:'fis', mp:10, r:[2,5], p:2.0, pc:900, fx:'salto' },
  lanza_trueno:   { maestria:true, n:'Lanza de trueno', d:'Estocada con rayo (x1.5).', tipo:'fis', mp:6, r:'arma', p:1.5, el:'rayo', pc:700, fx:'rayo' },
  furia_dragontina:{ maestria:true, n:'Furia dragontina', d:'Pasiva: +12% de ataque y +8% de vida.', tipo:'pasiva', pv:'bon', bon:{atk:0.12, hp:0.08}, pc:900 },
  // Campanero → Campanero del alba
  repique_alba:   { maestria:true, carga:16, n:'Repique del alba', d:'Todas las campanas a la vez, alrededor.', tipo:'mag', mp:26, r:[0,0], a:3, p:48, el:'sonido', pc:1000, fx:'sonido' },
  campana_guarda: { maestria:true, n:'Campana guardiana', d:'Coraza, Protección y Regen a los cercanos.', tipo:'apoyo', mp:22, r:[0,0], a:2, af:'a', est:[{id:'coraza',prob:100,dur:3},{id:'protegido',prob:100,dur:3},{id:'regen',prob:100,dur:3}], pc:900, fx:'sonido' },
  eco_eterno:     { maestria:true, n:'Eco eterno', d:'Pasiva: +10% magia, resistencia y PM.', tipo:'pasiva', pv:'bon', bon:{mag:0.1, res:0.1, mp:0.1}, pc:1000 },
  // Invocador → Gran invocador
  llamado_dragon: { maestria:true, carga:12, n:'Llamado del Dragón', d:'Un dragón antiguo arrasa un área.', tipo:'mag', mp:45, r:[1,5], a:2, p:75, el:'fuego', pc:1200, fx:'fuego' },
  llamado_luna:   { maestria:true, carga:18, n:'Llamado de la Luna', d:'La Luna cura a todos los aliados de un área.', tipo:'cura', mp:34, r:[0,4], a:2, af:'a', p:70, pc:1000, fx:'cura' },
  pacto_ancestral:{ maestria:true, n:'Pacto ancestral', d:'Pasiva: +12% de magia y PM.', tipo:'pasiva', pv:'bon', bon:{mag:0.12, mp:0.12}, pc:1000 },
  // Espadachín → Maestro de espadas
  mil_cortes:     { maestria:true, n:'Mil cortes', d:'Cinco cortes seguidos.', tipo:'fis', mp:12, r:'arma', p:0.55, golpes:5, pc:1000, fx:'corte' },
  corte_vacio:    { maestria:true, n:'Corte del vacío', d:'Un tajo que viaja y corta un área.', tipo:'fis', mp:10, r:[1,3], a:1, p:1.3, pc:900, fx:'corte' },
  filo_perfecto:  { maestria:true, n:'Filo perfecto', d:'Pasiva: +15% de ataque.', tipo:'pasiva', pv:'bon', bon:{atk:0.15}, pc:1000 },
  // Draconiana → Señora dragón
  aliento_ancestral:{ maestria:true, carga:18, n:'Aliento ancestral', d:'Fuego de dragón en un área grande.', tipo:'mag', mp:30, r:[1,4], a:2, p:60, el:'fuego', pc:1100, fx:'fuego' },
  forma_dragon:   { maestria:true, n:'Forma de dragón', d:'Valor, Coraza y Prisa sobre sí.', tipo:'apoyo', mp:20, r:[0,0], af:'a', est:[{id:'valor',prob:100,dur:3},{id:'coraza',prob:100,dur:3},{id:'prisa',prob:100,dur:3}], pc:900, fx:'fuego' },
  corazon_dragon: { maestria:true, n:'Corazón de dragón', d:'Pasiva: +15% de vida y +10% de ataque.', tipo:'pasiva', pv:'bon', bon:{hp:0.15, atk:0.1}, pc:1000 },
  // Cazademonios → Exorcista
  flecha_juicio:  { maestria:true, n:'Flecha del juicio', d:'Luz (x1.8). Doble contra demonios.', tipo:'fis', mp:8, r:'arma', p:1.8, el:'luz', antidemonio:true, pc:900, fx:'flecha' },
  circulo_sal:    { maestria:true, n:'Círculo de sal', d:'Detiene y silencia a los enemigos de un área.', tipo:'apoyo', mp:18, r:[1,5], a:1, af:'e', est:[{id:'detenido',prob:40,dur:2},{id:'silencio',prob:60,dur:3}], pc:800, fx:'luz' },
  cazador_eterno: { maestria:true, n:'Cazador eterno', d:'Pasiva: +10% de ataque y +8% de velocidad.', tipo:'pasiva', pv:'bon', bon:{atk:0.1, spd:0.08}, pc:900 },
  // Cantor → Gran tenor / soprano
  requiem:        { maestria:true, carga:18, n:'Réquiem', d:'Un canto fúnebre que hiere y adormece.', tipo:'mag', mp:26, r:[1,5], a:2, p:45, el:'sonido', est:[{id:'dormido',prob:30,dur:2}], pc:1000, fx:'sonido' },
  himno_heroico:  { maestria:true, n:'Himno heroico', d:'Valor y Prisa a casi todo el grupo.', tipo:'apoyo', mp:26, r:[0,0], a:3, af:'a', est:[{id:'valor',prob:100,dur:3},{id:'prisa',prob:100,dur:3}], pc:1100, fx:'sonido' },
  voz_oro:        { maestria:true, n:'Voz de oro', d:'Pasiva: +12% de magia y +10% de resistencia.', tipo:'pasiva', pv:'bon', bon:{mag:0.12, res:0.1}, pc:900 },
  // Trovador → Leyenda del laúd
  concierto:      { maestria:true, carga:16, n:'Concierto final', d:'Un solo que retumba alrededor.', tipo:'mag', mp:30, r:[0,0], a:3, p:55, el:'sonido', pc:1100, fx:'sonido' },
  balada_eterna:  { maestria:true, n:'Balada eterna', d:'Regen, Foco y Valor a los aliados cercanos.', tipo:'apoyo', mp:22, r:[0,0], a:2, af:'a', est:[{id:'regen',prob:100,dur:3},{id:'foco',prob:100,dur:3},{id:'valor',prob:100,dur:3}], pc:900, fx:'sonido' },
  ovacion:        { maestria:true, n:'Ovación', d:'Pasiva: +10% de velocidad y +5 de evasión.', tipo:'pasiva', pv:'bon', bon:{spd:0.1, eva:5}, pc:900 },
  // Nigromante → Señor de los muertos
  danza_macabra:  { maestria:true, carga:18, n:'Danza macabra', d:'Los muertos bailan sobre un área y te curan.', tipo:'mag', mp:30, r:[1,5], a:2, p:50, drena:0.3, pc:1100, fx:'bruma' },
  marca_muerte:   { maestria:true, n:'Marca de muerte', d:'55% de matar de un toque (no a jefes).', tipo:'especial', esp:'muerte', prob:55, mp:24, r:[1,4], af:'e', pc:1000, fx:'bruma' },
  inmortal:       { maestria:true, n:'Inmortal', d:'Pasiva: +12% de vida y +10% de resistencia.', tipo:'pasiva', pv:'bon', bon:{hp:0.12, res:0.1}, pc:900 },
  // Medium → Oráculo
  puente_almas:   { maestria:true, n:'Puente de almas', d:'Trae a un caído con toda la vida.', tipo:'revivir', mp:36, r:[1,4], af:'a', p:1.0, pc:1000, fx:'revivir' },
  tormenta_espiritu:{ maestria:true, carga:18, n:'Tormenta espiritual', d:'Espíritus furiosos en un área grande.', tipo:'mag', mp:28, r:[1,5], a:2, p:48, est:[{id:'silencio',prob:50,dur:2}], pc:1000, fx:'bruma' },
  tercer_ojo:     { maestria:true, n:'Tercer ojo', d:'Pasiva: +15% de resistencia y +6 de evasión.', tipo:'pasiva', pv:'bon', bon:{res:0.15, eva:6}, pc:900 },
  // Alquimista → Gran alquimista
  megaelixir:     { maestria:true, n:'Megaelixir', d:'Elixir para todos los que tiene cerca.', tipo:'especial', esp:'elixir', mp:24, r:[0,0], a:2, af:'a', pc:1000, fx:'cura' },
  gran_bomba:     { maestria:true, n:'Gran bomba', d:'Una explosión enorme a distancia.', tipo:'mag', mp:26, r:[2,6], a:2, p:55, el:'fuego', pc:1000, fx:'fuego' },
  piedra_filosofal:{ maestria:true, n:'Piedra filosofal', d:'Pasiva: +10% de magia, vida y PM.', tipo:'pasiva', pv:'bon', bon:{mag:0.1, hp:0.1, mp:0.1}, pc:1000 },
  // Domador → Señor de las bestias
  furia_salvaje:  { maestria:true, n:'Furia salvaje', d:'Tres zarpazos seguidos.', tipo:'fis', mp:10, r:'arma', p:0.8, golpes:3, pc:900, fx:'mordida' },
  rugido_alfa:    { maestria:true, n:'Rugido del alfa', d:'Valor y Prisa a casi todo el grupo.', tipo:'apoyo', mp:20, r:[0,0], a:3, af:'a', est:[{id:'valor',prob:100,dur:3},{id:'prisa',prob:100,dur:3}], pc:1000, fx:'onda' },
  alma_bestia:    { maestria:true, n:'Alma de bestia', d:'Pasiva: +10% de ataque y velocidad.', tipo:'pasiva', pv:'bon', bon:{atk:0.1, spd:0.1}, pc:900 },
  // Berserker → Bestia de guerra
  masacre:        { maestria:true, n:'Masacre', d:'Golpea a todos en dos casillas alrededor.', tipo:'fis', mp:10, r:[0,0], a:2, p:1.5, pc:1000, fx:'corte' },
  ultimo_aliento: { maestria:true, n:'Último aliento', d:'Golpe desesperado ×1.6.', tipo:'especial', esp:'desesperado', mult:1.6, mp:0, r:[1,1], af:'e', pc:1000, fx:'golpe' },
  sed_guerra:     { maestria:true, n:'Sed de guerra', d:'Pasiva: +15% de ataque y +10% de vida.', tipo:'pasiva', pv:'bon', bon:{atk:0.15, hp:0.1}, pc:1000 },
});

// Nombre de la forma maestra (hombre / mujer) y sus 3 habilidades.
const MAESTRIA = {
  recluta:['Veterano', 'Veterana', 'carga_veterano', 'grito_tropa', 'temple'],
  novicio:['Erudito', 'Erudita', 'estallido', 'claridad', 'estudio'],
  guerrero:['Gran guerrero', 'Gran guerrera', 'golpe_titanico', 'grito_batalla', 'piel_acero'],
  arquero:['Gran arquero', 'Gran arquera', 'flecha_perfora', 'diluvio', 'ojo_aguila'],
  clerigo:['Sumo sacerdote', 'Suma sacerdotisa', 'milagro', 'juicio_sagrado', 'gracia'],
  hechicero:['Archimago', 'Archimaga', 'meteoro', 'cero_absoluto', 'archimagia'],
  ladron:['Maestro ladrón', 'Maestra ladrona', 'golpe_sombras', 'bomba_humo', 'sombra'],
  monje:['Gran maestro', 'Gran maestra', 'puno_dragon', 'loto', 'cuerpo_hierro'],
  caballero:['Caballero real', 'Dama real', 'carga_caballeria', 'baluarte', 'escudo_honor'],
  paladin:['Santo cruzado', 'Santa cruzada', 'cruz_sagrada', 'mano_santa', 'aura_sagrada'],
  cronomante:['Señor del tiempo', 'Señora del tiempo', 'paradoja', 'prisa_total', 'eternidad'],
  lancero:['Dragontino', 'Dragontina', 'salto_celeste', 'lanza_trueno', 'furia_dragontina'],
  campanero:['Campanero del alba', 'Campanera del alba', 'repique_alba', 'campana_guarda', 'eco_eterno'],
  invocador:['Gran invocador', 'Gran invocadora', 'llamado_dragon', 'llamado_luna', 'pacto_ancestral'],
  espadachin:['Maestro de espadas', 'Maestra de espadas', 'mil_cortes', 'corte_vacio', 'filo_perfecto'],
  draconiana:['Señor dragón', 'Señora dragón', 'aliento_ancestral', 'forma_dragon', 'corazon_dragon'],
  cazademonios:['Exorcista', 'Exorcista', 'flecha_juicio', 'circulo_sal', 'cazador_eterno'],
  cantor:['Gran tenor', 'Gran soprano', 'requiem', 'himno_heroico', 'voz_oro'],
  trovador:['Leyenda del laúd', 'Leyenda del laúd', 'concierto', 'balada_eterna', 'ovacion'],
  nigromante:['Señor de los muertos', 'Señora de los muertos', 'danza_macabra', 'marca_muerte', 'inmortal'],
  medium:['Oráculo', 'Oráculo', 'puente_almas', 'tormenta_espiritu', 'tercer_ojo'],
  alquimista:['Gran alquimista', 'Gran alquimista', 'megaelixir', 'gran_bomba', 'piedra_filosofal'],
  domador:['Señor de las bestias', 'Señora de las bestias', 'furia_salvaje', 'rugido_alfa', 'alma_bestia'],
  berserker:['Bestia de guerra', 'Bestia de guerra', 'masacre', 'ultimo_aliento', 'sed_guerra'],
};
for (const [cid, m] of Object.entries(MAESTRIA)) if (CLASES[cid]) CLASES[cid].habs.push(...m.slice(2));

// Habilidades propias de cada personaje de la historia: [habilidad, nivel del personaje].
Object.assign(HAB, {
  tanido_heroe:   { propia:true, n:'Tañido del héroe', d:'La campana de Lior golpea un área.', tipo:'mag', mp:10, r:[1,4], a:1, p:30, el:'sonido', fx:'sonido' },
  promesa:        { propia:true, n:'Promesa', d:'Valor, Protección y Regen a un aliado.', tipo:'apoyo', mp:14, r:[0,4], af:'a', est:[{id:'valor',prob:100,dur:3},{id:'protegido',prob:100,dur:3},{id:'regen',prob:100,dur:3}], fx:'brillo' },
  primer_alba:    { propia:true, carga:16, n:'Campana del primer alba', d:'La campana que despierta al mundo.', tipo:'mag', mp:36, r:[0,0], a:3, p:65, el:'luz', fx:'luz' },
  tiro_mara:      { propia:true, n:'Tiro de Mara', d:'Nunca falla (x1.4).', tipo:'fis', mp:0, r:'arma', p:1.4, precisa:true, fx:'flecha' },
  flecha_doble:   { propia:true, n:'Flecha de fuego doble', d:'Dos flechas encendidas.', tipo:'fis', mp:6, r:'arma', p:0.9, golpes:2, el:'fuego', fx:'flecha' },
  lluvia_carmesi: { propia:true, carga:22, n:'Lluvia carmesí', d:'Flechas de fuego sobre un área grande.', tipo:'fis', mp:20, r:[2,7], a:2, p:1.1, el:'fuego', fx:'flecha' },
  escudo_humano:  { propia:true, n:'Escudo humano', d:'Se pone adelante: Protección y Coraza a un aliado pegado.', tipo:'apoyo', mp:6, r:[1,1], af:'a', est:[{id:'protegido',prob:100,dur:3},{id:'coraza',prob:100,dur:3}], fx:'escudo' },
  golpe_taberna:  { propia:true, n:'Golpe de taberna', d:'Un sillazo (x1.5) que aturde.', tipo:'fis', mp:0, r:'arma', p:1.5, est:[{id:'aturdido',prob:50,dur:1}], fx:'golpe' },
  terquedad:      { propia:true, n:'Terquedad', d:'Se cura 30% y gana Valor.', tipo:'especial', esp:'juramento', mp:0, r:[0,0], af:'a', fx:'brillo' },
  formula_nela:   { propia:true, n:'Fórmula de Nela', d:'Un rayo calculado al milímetro.', tipo:'mag', mp:10, r:[1,5], p:26, el:'rayo', fx:'rayo' },
  lentes_estudio: { propia:true, n:'Lentes de estudio', d:'Foco y Prisa sobre sí.', tipo:'apoyo', mp:8, r:[0,0], af:'a', est:[{id:'foco',prob:100,dur:3},{id:'prisa',prob:100,dur:3}], fx:'brillo' },
  teorema:        { propia:true, carga:14, n:'Teorema prohibido', d:'Hielo imposible sobre un área grande.', tipo:'mag', mp:34, r:[1,5], a:2, p:60, el:'hielo', fx:'hielo' },
  muro_brann:     { propia:true, n:'Muro de Brann', d:'Protección a los que tiene al lado.', tipo:'apoyo', mp:8, r:[0,0], a:1, af:'a', est:[{id:'protegido',prob:100,dur:3}], fx:'escudo' },
  viejo_leon:     { propia:true, n:'Carga del viejo león', d:'Embiste desde lejos (x1.7).', tipo:'fis', mp:6, r:[1,3], p:1.7, fx:'golpe' },
  juramento_hierro:{ propia:true, n:'Juramento de hierro', d:'Cura 30% y da Valor a un aliado.', tipo:'especial', esp:'juramento', mp:12, r:[0,3], af:'a', fx:'brillo' },
  toque_ysolde:   { propia:true, n:'Toque de Ysolde', d:'Una cura fuerte.', tipo:'cura', mp:10, r:[0,4], af:'a', p:40, fx:'cura' },
  luz_abadia:     { propia:true, n:'Luz de la abadía', d:'Regen y Coraza a los aliados cercanos.', tipo:'apoyo', mp:16, r:[0,0], a:2, af:'a', est:[{id:'regen',prob:100,dur:3},{id:'coraza',prob:100,dur:3}], fx:'luz' },
  resurreccion:   { propia:true, n:'Resurrección', d:'Trae a un caído con toda la vida.', tipo:'revivir', mp:30, r:[1,4], af:'a', p:1.0, fx:'revivir' },
  mano_rapida:    { propia:true, n:'Mano rápida', d:'Roba oro.', tipo:'especial', esp:'robar_oro', mp:0, r:[1,1], fx:'moneda' },
  cuchillo_espalda:{ propia:true, n:'Cuchillo en la espalda', d:'x1.6, y x1.6 más por la espalda.', tipo:'fis', mp:0, r:'arma', p:1.6, espalda:true, fx:'corte' },
  golpe_fantasma: { propia:true, n:'Golpe fantasma', d:'Tres cortes que nunca fallan.', tipo:'fis', mp:12, r:'arma', p:0.7, golpes:3, precisa:true, fx:'corte' },
  bendicion_abuelo:{ propia:true, n:'Bendición del abuelo', d:'Cura a los aliados de un área.', tipo:'cura', mp:12, r:[0,3], a:1, af:'a', p:35, fx:'cura' },
  espada_alba:    { propia:true, n:'Espada del alba', d:'Un tajo de luz (x1.6).', tipo:'fis', mp:6, r:'arma', p:1.6, el:'luz', fx:'luz' },
  ultimo_sermon:  { propia:true, carga:18, n:'Último sermón', d:'Luz alrededor. Doble contra demonios.', tipo:'mag', mp:30, r:[0,0], a:2, p:55, el:'luz', antidemonio:true, fx:'luz' },
  ojo_cazador:    { propia:true, n:'Ojo de cazador', d:'Foco y Prisa sobre sí.', tipo:'apoyo', mp:6, r:[0,0], af:'a', est:[{id:'foco',prob:100,dur:3},{id:'prisa',prob:100,dur:3}], fx:'brillo' },
  flecha_plata:   { propia:true, n:'Flecha de plata', d:'Luz (x1.5). Doble contra demonios.', tipo:'fis', mp:6, r:'arma', p:1.5, el:'luz', antidemonio:true, fx:'flecha' },
  caceria:        { propia:true, n:'Cacería', d:'Tres flechas que nunca fallan.', tipo:'fis', mp:14, r:'arma', p:0.8, golpes:3, precisa:true, fx:'flecha' },
  escama_ardiente:{ propia:true, n:'Escama ardiente', d:'Coraza y Valor sobre sí.', tipo:'apoyo', mp:6, r:[0,0], af:'a', est:[{id:'coraza',prob:100,dur:3},{id:'valor',prob:100,dur:3}], fx:'fuego' },
  mordida_dragon: { propia:true, n:'Mordida de dragón', d:'Estocada de fuego (x1.6).', tipo:'fis', mp:6, r:'arma', p:1.6, el:'fuego', fx:'fuego' },
  ira_draconica:  { propia:true, carga:16, n:'Ira dracónica', d:'Fuego de dragón sobre un área grande.', tipo:'mag', mp:34, r:[1,4], a:2, p:65, el:'fuego', fx:'fuego' },
});
const PROPIAS = {
  lior:[['tanido_heroe', 10], ['promesa', 25], ['primer_alba', 40]],
  mara:[['tiro_mara', 10], ['flecha_doble', 25], ['lluvia_carmesi', 40]],
  tobias:[['escudo_humano', 10], ['golpe_taberna', 25], ['terquedad', 40]],
  nela:[['formula_nela', 10], ['lentes_estudio', 25], ['teorema', 40]],
  brann:[['muro_brann', 10], ['viejo_leon', 25], ['juramento_hierro', 40]],
  ysolde:[['toque_ysolde', 10], ['luz_abadia', 25], ['resurreccion', 40]],
  fenn:[['mano_rapida', 10], ['cuchillo_espalda', 25], ['golpe_fantasma', 40]],
  aldous:[['bendicion_abuelo', 10], ['espada_alba', 25], ['ultimo_sermon', 40]],
  rook:[['ojo_cazador', 10], ['flecha_plata', 25], ['caceria', 40]],
  kaela:[['escama_ardiente', 10], ['mordida_dragon', 25], ['ira_draconica', 40]],
};

function sexoDe(u) { return LPC.sexo({ look:u.look, unico:u.unico }); }
// Clase dominada: todas sus habilidades base aprendidas y nivel 5 o más.
function dominada(u, cid) {
  const C = CLASES[cid];
  if (!C || !MAESTRIA[cid] || !u.cl || !u.apr) return false;
  if (nivelClase(u.cl[cid]?.tot || 0) < 5) return false;
  return C.habs.filter(h => !HAB[h].maestria && !HAB[h].historia).every(h => u.apr.includes(h));
}
function nombreClase(u, cid = u.clase) {
  return dominada(u, cid) ? MAESTRIA[cid][sexoDe(u) === 'f' ? 1 : 0] : CLASES[cid].n;
}
function propiasDe(u) { return (PROPIAS[u.unico] || []).map(([h, nv]) => ({ h, nv, ok:(u.nivel || 1) >= nv })); }
