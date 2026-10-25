// Campanas de Bruma — todo lo que define el juego: clases, habilidades, objetos, equipo, gemas, mascotas y enemigos.
'use strict';

const ELEMENTOS = {
  fuego:  { carga:22, n:'Fuego',  c:'#ff7a3a', i:'🔥' },
  hielo:  { carga:22, n:'Hielo',  c:'#7fd8ff', i:'❄' },
  rayo:   { carga:22, n:'Rayo',   c:'#ffe25a', i:'⚡' },
  luz:    { n:'Luz',    c:'#fff3b0', i:'✦' },
  sonido: { n:'Sonido', c:'#c9a6ff', i:'♪' },
};

const ESTADOS = {
  veneno:    { n:'Veneno',     malo:true,  c:'#8fd14f' },
  dormido:   { n:'Dormido',    malo:true,  c:'#9aa8ff' },
  lento:     { n:'Lento',      malo:true,  c:'#b08ac0' },
  detenido:  { n:'Detenido',   malo:true,  c:'#d0d0d0' },
  aturdido:  { n:'Aturdido',   malo:true,  c:'#ffd84a' },
  silencio:  { n:'Silencio',   malo:true,  c:'#9a9a9a' },
  ciego:     { n:'Ceguera',    malo:true,  c:'#6a6a6a' },
  quebrado:  { n:'Def. rota',  malo:true,  c:'#d09a60' },
  debil:     { n:'Atq. roto',  malo:true,  c:'#d06a6a' },
  prisa:     { carga:25, n:'Prisa',      malo:false, c:'#6ae0ff' },
  protegido: { n:'Protección', malo:false, c:'#ffcc66' },
  coraza:    { n:'Coraza',     malo:false, c:'#d09aff' },
  valor:     { n:'Valor',      malo:false, c:'#ff8a66' },
  foco:      { n:'Foco',       malo:false, c:'#8ad0ff' },
  regen:     { n:'Regen',      malo:false, c:'#8aff8a' },
};

// Habilidades. tipo: fis | mag | cura | apoyo | revivir | especial | pasiva
// r: [mín, máx] de alcance ('arma' = el del arma). a: radio del área. af: a quién afecta ('e' enemigos, 'a' aliados).
const HAB = {
  // Recluta
  golpe_fuerte:   { n:'Golpe fuerte', d:'Un golpe con todo el peso del cuerpo (x1.4).', tipo:'fis', mp:0, r:'arma', p:1.4, pc:60, fx:'corte' },
  piedra:         { n:'Tirar piedra', d:'Ataque a distancia, flojo pero útil.', tipo:'fis', mp:0, r:[2,4], p:0.7, sinArma:true, pc:40, fx:'piedra' },
  animo:          { n:'Grito de ánimo', d:'Un aliado gana Valor (+25% de ataque).', tipo:'apoyo', mp:4, r:[0,3], af:'a', est:[{id:'valor',prob:100,dur:3}], pc:80, fx:'brillo' },
  primeros:       { n:'Primeros auxilios', d:'Se cura un 30% de la vida.', tipo:'especial', esp:'primeros', mp:0, r:[0,0], af:'a', pc:80, fx:'cura' },
  aguante:        { n:'Aguante', d:'Pasiva: +15% de vida máxima.', tipo:'pasiva', pv:'aguante', pc:150 },
  // Novicio
  chispa:         { carga:34, n:'Chispa', d:'Una llamita que quema a un enemigo.', tipo:'mag', mp:4, r:[1,4], p:12, el:'fuego', pc:50, fx:'fuego' },
  alivio:         { n:'Alivio', d:'Cura un poco a un aliado.', tipo:'cura', mp:4, r:[0,3], af:'a', p:14, pc:50, fx:'cura' },
  concentrar:     { n:'Concentrar', d:'Foco: +30% de magia por 2 turnos.', tipo:'apoyo', mp:0, r:[0,0], af:'a', est:[{id:'foco',prob:100,dur:2}], pc:60, fx:'brillo' },
  meditar:        { n:'Meditar', d:'Recupera 12 de magia + 10% de la máxima.', tipo:'especial', esp:'meditar', mp:0, r:[0,0], af:'a', pc:80, fx:'brillo' },
  mente_clara:    { n:'Mente clara', d:'Pasiva: +20% de magia máxima.', tipo:'pasiva', pv:'mente', pc:120 },
  // Guerrero
  romper_armadura:{ n:'Romper armadura', d:'Golpe que baja la defensa del enemigo.', tipo:'fis', mp:0, r:'arma', p:1.0, est:[{id:'quebrado',prob:80,dur:3}], pc:120, fx:'golpe' },
  romper_arma:    { n:'Romper arma', d:'Golpe que baja el ataque del enemigo.', tipo:'fis', mp:0, r:'arma', p:1.0, est:[{id:'debil',prob:80,dur:3}], pc:120, fx:'golpe' },
  tajo_giratorio: { n:'Tajo giratorio', d:'Gira y golpea a todos los enemigos alrededor.', tipo:'fis', mp:6, r:[0,0], a:1, p:1.0, pc:150, fx:'corte' },
  golpe_sismico:  { n:'Golpe sísmico', d:'Parte el suelo: daña en área a distancia.', tipo:'fis', mp:8, r:[1,3], a:1, p:0.85, pc:200, fx:'tierra' },
  contraataque:   { n:'Contraataque', d:'Pasiva: 50% de devolver los golpes cuerpo a cuerpo.', tipo:'pasiva', pv:'contra', pc:250 },
  // Arquero
  disparo_preciso:{ n:'Disparo preciso', d:'Nunca falla (x1.3).', tipo:'fis', mp:0, r:'arma', p:1.3, precisa:true, pc:100, fx:'flecha' },
  flecha_veneno:  { n:'Flecha venenosa', d:'Envenena al enemigo.', tipo:'fis', mp:0, r:'arma', p:0.8, est:[{id:'veneno',prob:75,dur:4}], pc:120, fx:'flecha' },
  tiro_piernas:   { n:'Tiro a las piernas', d:'Deja Lento al enemigo.', tipo:'fis', mp:0, r:'arma', p:0.7, est:[{id:'lento',prob:70,dur:3}], pc:150, fx:'flecha' },
  lluvia_flechas: { carga:26, n:'Lluvia de flechas', d:'Flechas sobre un área.', tipo:'fis', mp:8, r:[3,6], a:1, p:0.75, pc:220, fx:'flecha' },
  ojo_halcon:     { n:'Ojo de halcón', d:'Pasiva: +1 de alcance con arco.', tipo:'pasiva', pv:'halcon', pc:200 },
  // Clérigo
  cura:           { carga:26, n:'Cura', d:'Cura a los aliados en un área.', tipo:'cura', mp:8, r:[0,4], a:1, af:'a', p:24, pc:120, fx:'cura' },
  cura_mayor:     { carga:18, n:'Cura mayor', d:'Cura mucho a los aliados en un área.', tipo:'cura', mp:16, r:[0,4], a:1, af:'a', p:46, pc:320, fx:'cura' },
  proteccion:     { n:'Protección', d:'Sube la defensa de un área de aliados.', tipo:'apoyo', mp:8, r:[0,4], a:1, af:'a', est:[{id:'protegido',prob:100,dur:4}], pc:150, fx:'escudo' },
  purificar:      { n:'Purificar', d:'Quita estados malos en un área.', tipo:'especial', esp:'purificar', mp:6, r:[0,4], a:1, af:'a', pc:100, fx:'cura' },
  luz_sagrada:    { carga:25, n:'Luz sagrada', d:'Rayo de luz. Terrible contra Huecos.', tipo:'mag', mp:10, r:[1,4], p:20, el:'luz', pc:200, fx:'luz' },
  revivir:        { carga:18, n:'Revivir', d:'Levanta a un aliado caído con 30% de vida.', tipo:'revivir', mp:16, r:[1,4], af:'a', p:0.3, pc:250, fx:'revivir' },
  regeneracion:   { n:'Regeneración', d:'Pasiva: recupera 6% de vida por turno.', tipo:'pasiva', pv:'regen', pc:300 },
  // Hechicero
  fuego:          { n:'Fuego', d:'Llamas en un área.', tipo:'mag', mp:10, r:[1,5], a:1, p:22, el:'fuego', pc:150, fx:'fuego' },
  hielo:          { n:'Hielo', d:'Hielo en un área. Puede dejar Lento.', tipo:'mag', mp:10, r:[1,5], a:1, p:22, el:'hielo', est:[{id:'lento',prob:25,dur:2}], pc:150, fx:'hielo' },
  rayo:           { n:'Rayo', d:'Un rayo fuerte sobre un enemigo.', tipo:'mag', mp:10, r:[1,5], p:30, el:'rayo', pc:150, fx:'rayo' },
  sueno:          { carga:20, n:'Sueño', d:'Duerme a los enemigos de un área.', tipo:'apoyo', mp:10, r:[1,5], a:1, af:'e', est:[{id:'dormido',prob:60,dur:3}], pc:200, fx:'sueno' },
  llamarada:      { carga:15, n:'Llamarada', d:'Fuego más fuerte en área.', tipo:'mag', mp:18, r:[1,5], a:1, p:34, el:'fuego', pc:300, fx:'fuego' },
  ventisca:       { carga:15, n:'Ventisca', d:'Hielo más fuerte. Puede dejar Lento.', tipo:'mag', mp:18, r:[1,5], a:1, p:34, el:'hielo', est:[{id:'lento',prob:35,dur:2}], pc:300, fx:'hielo' },
  centella:       { carga:15, n:'Centella', d:'Rayo más fuerte en área.', tipo:'mag', mp:18, r:[1,5], a:1, p:36, el:'rayo', pc:300, fx:'rayo' },
  infierno:       { carga:10, n:'Infierno', d:'El fuego más poderoso, en área grande.', tipo:'mag', mp:30, r:[1,5], a:2, p:50, el:'fuego', pc:550, fx:'fuego' },
  glaciar:        { carga:10, n:'Glaciar', d:'El hielo más poderoso, en área grande.', tipo:'mag', mp:30, r:[1,5], a:2, p:50, el:'hielo', est:[{id:'lento',prob:40,dur:3}], pc:550, fx:'hielo' },
  tormenta:       { carga:11, n:'Tormenta', d:'Tormenta eléctrica en un área grande.', tipo:'mag', mp:24, r:[1,5], a:2, p:34, el:'rayo', pc:450, fx:'rayo' },
  magia_potente:  { n:'Magia potente', d:'Pasiva: +20% de daño mágico.', tipo:'pasiva', pv:'magia', pc:300 },
  // Ladrón
  robar_oro:      { n:'Robar oro', d:'Le roba monedas a un enemigo.', tipo:'especial', esp:'robar_oro', mp:0, r:[1,1], af:'e', pc:80, fx:'moneda' },
  robar_obj:      { n:'Robar objeto', d:'Intenta robar un objeto o material.', tipo:'especial', esp:'robar_obj', mp:0, r:[1,1], af:'e', pc:120, fx:'moneda' },
  punalada:       { n:'Puñalada', d:'x1.2, y x1.6 si es por la espalda.', tipo:'fis', mp:0, r:'arma', p:1.2, espalda:true, pc:150, fx:'corte' },
  humo:           { n:'Bomba de humo', d:'Ciega a los enemigos de un área.', tipo:'apoyo', mp:6, r:[1,3], a:1, af:'e', est:[{id:'ciego',prob:70,dur:3}], pc:150, fx:'humo' },
  pies_ligeros:   { n:'Pies ligeros', d:'Pasiva: +1 de movimiento.', tipo:'pasiva', pv:'mov1', pc:250 },
  // Monje
  onda:           { n:'Onda de choque', d:'Golpe de aire a distancia.', tipo:'fis', mp:0, r:[2,4], p:1.0, pc:150, fx:'onda' },
  chakra:         { n:'Chakra', d:'Cura vida y magia a los de alrededor.', tipo:'especial', esp:'chakra', mp:0, r:[0,0], a:1, af:'a', pc:200, fx:'cura' },
  rafaga:         { n:'Ráfaga', d:'Tres golpes rápidos.', tipo:'fis', mp:0, r:[1,1], p:0.55, golpes:3, pc:200, fx:'golpe' },
  resucitar:      { n:'Resucitar', d:'Sin magia: 75% de levantar a un caído.', tipo:'revivir', mp:0, r:[1,1], af:'a', p:0.2, prob:75, pc:300, fx:'revivir' },
  espiritu:       { n:'Espíritu firme', d:'Pasiva: inmune a veneno, sueño y ceguera.', tipo:'pasiva', pv:'inmune', pc:300 },
  // Caballero
  estocada:       { n:'Estocada', d:'Golpe certero (x1.5).', tipo:'fis', mp:0, r:'arma', p:1.5, pc:150, fx:'corte' },
  golpe_aturdidor:{ n:'Golpe aturdidor', d:'Puede dejar Aturdido (pierde un turno).', tipo:'fis', mp:0, r:'arma', p:1.0, est:[{id:'aturdido',prob:45,dur:1}], pc:200, fx:'golpe' },
  escudo_sagrado: { n:'Escudo sagrado', d:'Protección y Coraza a vos y los de al lado.', tipo:'apoyo', mp:10, r:[0,0], a:1, af:'a', est:[{id:'protegido',prob:100,dur:3},{id:'coraza',prob:100,dur:3}], pc:200, fx:'escudo' },
  juramento:      { n:'Juramento', d:'Se cura 30% y gana Valor.', tipo:'especial', esp:'juramento', mp:0, r:[0,0], af:'a', pc:250, fx:'brillo' },
  defensa_ferrea: { n:'Defensa férrea', d:'Pasiva: recibe 15% menos de daño.', tipo:'pasiva', pv:'ferrea', pc:300 },
  // Paladín
  espada_sagrada: { n:'Espada sagrada', d:'Corte de luz a 2 casillas (x1.6).', tipo:'fis', mp:8, r:[1,2], p:1.6, el:'luz', pc:250, fx:'luz' },
  aura_cura:      { n:'Aura de cura', d:'Cura a todos los aliados cercanos.', tipo:'cura', mp:14, r:[0,0], a:2, af:'a', p:22, pc:300, fx:'cura' },
  juicio:         { carga:14, n:'Juicio', d:'Luz que cae en un área.', tipo:'mag', mp:18, r:[1,4], a:1, p:30, el:'luz', pc:400, fx:'luz' },
  bendicion:      { n:'Bendición', d:'Valor y Protección a un aliado.', tipo:'apoyo', mp:10, r:[0,3], af:'a', est:[{id:'valor',prob:100,dur:3},{id:'protegido',prob:100,dur:3}], pc:250, fx:'brillo' },
  ultima_voluntad:{ n:'Última voluntad', d:'Pasiva: una vez por batalla, se levanta al caer.', tipo:'pasiva', pv:'revive', pc:500 },
  // Cronomante
  prisa:          { n:'Prisa', d:'Un aliado actúa más seguido.', tipo:'apoyo', mp:10, r:[0,4], af:'a', est:[{id:'prisa',prob:100,dur:4}], pc:200, fx:'tiempo' },
  lentitud:       { carga:22, n:'Lentitud', d:'Enemigos de un área actúan más lento.', tipo:'apoyo', mp:10, r:[1,5], a:1, af:'e', est:[{id:'lento',prob:70,dur:3}], pc:150, fx:'tiempo' },
  detener:        { carga:18, n:'Detener', d:'Congela el tiempo de un enemigo.', tipo:'apoyo', mp:14, r:[1,5], af:'e', est:[{id:'detenido',prob:45,dur:2}], pc:300, fx:'tiempo' },
  gravedad:       { carga:18, n:'Gravedad', d:'Quita 25% de la vida actual en área (no a jefes).', tipo:'especial', esp:'gravedad', mp:16, r:[1,5], a:1, af:'e', pc:300, fx:'gravedad' },
  tiempo_propio:  { n:'Tiempo propio', d:'Pasiva: empieza cada batalla con Prisa.', tipo:'pasiva', pv:'prisa_ini', pc:400 },
  // Lancero
  salto:          { n:'Salto', d:'Salta sobre el enemigo y cae con la lanza (x1.8).', tipo:'fis', mp:0, r:[1,3], p:1.8, pc:200, fx:'salto' },
  ensarte:        { n:'Ensarte', d:'Estocada larga que no falla.', tipo:'fis', mp:0, r:[1,2], p:1.2, precisa:true, pc:150, fx:'corte' },
  rompe_guardia:  { n:'Rompe guardia', d:'Baja ataque y defensa del enemigo.', tipo:'fis', mp:0, r:'arma', p:0.9, est:[{id:'quebrado',prob:60,dur:3},{id:'debil',prob:60,dur:3}], pc:250, fx:'golpe' },
  grito_dragon:   { n:'Grito del dragón', d:'Valor a los aliados cercanos.', tipo:'apoyo', mp:10, r:[0,0], a:2, af:'a', est:[{id:'valor',prob:100,dur:3}], pc:250, fx:'brillo' },
  salto_alto:     { n:'Salto alto', d:'Pasiva: +2 de salto y +1 de movimiento.', tipo:'pasiva', pv:'salto', pc:300 },
  // Campanero (solo Lior)
  tanido:         { carga:34, n:'Tañido', d:'Una nota que daña en área.', tipo:'mag', mp:6, r:[1,3], a:1, p:14, el:'sonido', pc:0, fx:'sonido' },
  canto_alba:     { carga:26, n:'Canto del alba', d:'Cura a los aliados cercanos.', tipo:'cura', mp:10, r:[0,0], a:2, af:'a', p:15, pc:150, fx:'cura' },
  eco_protector:  { n:'Eco protector', d:'Protección y Coraza a los cercanos.', tipo:'apoyo', mp:12, r:[0,0], a:2, af:'a', est:[{id:'protegido',prob:100,dur:3},{id:'coraza',prob:100,dur:3}], pc:200, fx:'escudo' },
  campanada:      { carga:20, n:'Campanada', d:'Golpe de sonido que puede aturdir.', tipo:'mag', mp:16, r:[1,4], a:1, p:28, el:'sonido', est:[{id:'aturdido',prob:30,dur:1}], pc:300, fx:'sonido' },
  cancion_memoria:{ carga:14, n:'Canción de la memoria', d:'La canción que devuelve lo olvidado.', tipo:'mag', mp:30, r:[0,0], a:3, p:42, el:'sonido', historia:true, pc:0, fx:'sonido' },
  resonancia:     { n:'Resonancia', d:'Pasiva: recupera 5 de magia por turno.', tipo:'pasiva', pv:'resonancia', pc:300 },

  // Monstruos y jefes (no se aprenden)
  mordisco:       { n:'Mordisco', d:'', tipo:'fis', mp:0, r:[1,1], p:1.3, fx:'mordida' },
  aullido:        { n:'Aullido', d:'', tipo:'apoyo', mp:0, r:[0,0], a:2, af:'a', est:[{id:'valor',prob:100,dur:3}], fx:'brillo' },
  picadura:       { n:'Picadura', d:'', tipo:'fis', mp:0, r:[1,1], p:0.9, est:[{id:'veneno',prob:60,dur:4}], fx:'mordida' },
  telarana:       { n:'Telaraña', d:'', tipo:'apoyo', mp:4, r:[1,3], af:'e', est:[{id:'lento',prob:70,dur:3}], fx:'humo' },
  chillido:       { n:'Chillido', d:'', tipo:'apoyo', mp:4, r:[1,3], a:1, af:'e', est:[{id:'ciego',prob:50,dur:2}], fx:'sonido' },
  toque_olvido:   { n:'Toque del olvido', d:'', tipo:'mag', mp:6, r:[1,2], p:16, est:[{id:'silencio',prob:40,dur:2}], fx:'bruma' },
  lamento:        { carga:25, n:'Lamento', d:'', tipo:'mag', mp:8, r:[1,4], a:1, p:20, est:[{id:'dormido',prob:25,dur:2}], fx:'bruma' },
  golpe_roca:     { n:'Golpe de roca', d:'', tipo:'fis', mp:0, r:[1,1], p:1.5, fx:'tierra' },
  temblor:        { n:'Temblor', d:'', tipo:'fis', mp:6, r:[0,0], a:2, p:0.8, fx:'tierra' },
  aliento_bruma:  { n:'Aliento de bruma', d:'', tipo:'mag', mp:10, r:[1,3], a:1, p:26, est:[{id:'ciego',prob:40,dur:2}], fx:'bruma' },
  olvido:         { carga:20, n:'Olvido', d:'', tipo:'mag', mp:12, r:[1,5], a:1, p:30, est:[{id:'silencio',prob:35,dur:2}], fx:'bruma' },
  silencio_total: { n:'Silencio total', d:'', tipo:'apoyo', mp:10, r:[1,5], a:2, af:'e', est:[{id:'silencio',prob:65,dur:3}], fx:'bruma' },
  voz_bruma:      { carga:16, n:'Voz de la Bruma', d:'', tipo:'mag', mp:18, r:[0,0], a:3, p:30, fx:'bruma' },
  grito_olvido:   { n:'Grito del olvido', d:'', tipo:'apoyo', mp:10, r:[1,5], a:2, af:'e', est:[{id:'dormido',prob:45,dur:2}], fx:'sonido' },
};

// Clases. m = multiplicadores de atributos. req = niveles de clase necesarios para desbloquear.
const CLASES = {
  recluta:   { n:'Recluta',    d:'Soldado de a pie. La base de todo guerrero.', m:{hp:1.0,mp:0.6,atk:1.0,def:1.0,mag:0.6,res:0.8,spd:1.0}, mov:4, salto:2, eva:8,  armas:['espada','daga','hacha'], armad:['cuero','malla'], req:{}, habs:['golpe_fuerte','piedra','animo','primeros','aguante'], asp:{C:'#8a6a44',D:'#5e4630',A:'#d9c27a',g:'cinta'} },
  novicio:   { n:'Novicio',    d:'Estudiante de magia. La base de todo hechicero.', m:{hp:0.8,mp:1.2,atk:0.6,def:0.7,mag:1.1,res:1.0,spd:0.95}, mov:3, salto:2, eva:5,  armas:['vara','daga','maza'], armad:['tela'], req:{}, habs:['chispa','alivio','concentrar','meditar','mente_clara'], asp:{C:'#5a6fb0',D:'#3c4b80',A:'#e0d9b0',g:'capucha'} },
  guerrero:  { n:'Guerrero',   d:'Fuerza bruta y armas pesadas.', m:{hp:1.15,mp:0.5,atk:1.2,def:1.1,mag:0.5,res:0.8,spd:1.0}, mov:4, salto:2, eva:8,  armas:['espada','hacha'], armad:['cuero','malla'], req:{recluta:2}, habs:['romper_armadura','romper_arma','tajo_giratorio','golpe_sismico','contraataque'], asp:{C:'#a33a3a',D:'#6e2424',A:'#d8c070',g:'casco'} },
  arquero:   { n:'Arquero',    d:'Ataca de lejos. Desde lo alto llega más lejos.', m:{hp:0.95,mp:0.6,atk:1.1,def:0.85,mag:0.6,res:0.85,spd:1.05}, mov:4, salto:3, eva:12, armas:['arco'], armad:['cuero'], req:{recluta:2}, habs:['disparo_preciso','flecha_veneno','tiro_piernas','lluvia_flechas','ojo_halcon'], asp:{C:'#3f8a4a',D:'#285c31',A:'#c9a35a',g:'boina'} },
  clerigo:   { n:'Clérigo',    d:'Cura, protege y levanta a los caídos.', m:{hp:0.9,mp:1.3,atk:0.6,def:0.8,mag:1.15,res:1.2,spd:0.95}, mov:3, salto:2, eva:5,  armas:['maza','vara'], armad:['tela'], req:{novicio:2}, habs:['cura','proteccion','purificar','luz_sagrada','cura_mayor','revivir','regeneracion'], asp:{C:'#efe9da',D:'#bdb59f',A:'#c84040',g:'mitra'} },
  hechicero: { n:'Hechicero',  d:'Fuego, hielo y rayo en área.', m:{hp:0.8,mp:1.35,atk:0.5,def:0.7,mag:1.35,res:1.05,spd:1.0}, mov:3, salto:2, eva:5,  armas:['vara','daga'], armad:['tela'], req:{novicio:2}, habs:['fuego','hielo','rayo','sueno','llamarada','ventisca','centella','infierno','glaciar','tormenta','magia_potente'], asp:{C:'#3a3a78',D:'#24244e',A:'#e8c040',g:'sombrero'} },
  ladron:    { n:'Ladrón',     d:'Rápido y escurridizo. Roba oro y objetos.', m:{hp:0.9,mp:0.6,atk:1.05,def:0.8,mag:0.6,res:0.8,spd:1.25}, mov:5, salto:3, eva:20, armas:['daga'], armad:['cuero'], req:{arquero:2}, habs:['robar_oro','robar_obj','punalada','humo','pies_ligeros'], asp:{C:'#4a4a4a',D:'#2c2c2c',A:'#b04040',g:'panuelo'} },
  monje:     { n:'Monje',      d:'Pelea con los puños. Cura y resucita sin magia.', m:{hp:1.2,mp:0.8,atk:1.3,def:0.95,mag:0.8,res:0.95,spd:1.1}, mov:4, salto:3, eva:15, armas:['puños'], armad:['cuero','tela'], req:{guerrero:3}, habs:['onda','rafaga','chakra','resucitar','espiritu'], asp:{C:'#d8822a',D:'#9c5a1a',A:'#f0e0a0',g:'cinta'} },
  caballero: { n:'Caballero',  d:'Armadura pesada y golpes certeros.', m:{hp:1.25,mp:0.6,atk:1.15,def:1.3,mag:0.6,res:0.95,spd:0.95}, mov:3, salto:2, eva:6,  armas:['espada'], armad:['malla'], req:{guerrero:3}, habs:['estocada','golpe_aturdidor','escudo_sagrado','juramento','defensa_ferrea'], asp:{C:'#7d8aa0',D:'#55607a',A:'#d0d8e8',g:'yelmo'} },
  paladin:   { n:'Paladín',    d:'Caballero sagrado: espada y cura.', m:{hp:1.3,mp:1.0,atk:1.2,def:1.3,mag:1.05,res:1.15,spd:0.95}, mov:3, salto:2, eva:6,  armas:['espada','maza'], armad:['malla'], req:{caballero:3,clerigo:3}, habs:['espada_sagrada','bendicion','aura_cura','juicio','ultima_voluntad'], asp:{C:'#e6e1cf',D:'#b0a888',A:'#e0b84a',g:'yelmo'} },
  cronomante:{ n:'Cronomante', d:'Dobla el tiempo: acelera aliados y frena enemigos.', m:{hp:0.85,mp:1.4,atk:0.5,def:0.75,mag:1.25,res:1.15,spd:1.05}, mov:3, salto:2, eva:6,  armas:['vara'], armad:['tela'], req:{hechicero:3,clerigo:2}, habs:['prisa','lentitud','detener','gravedad','tiempo_propio'], asp:{C:'#6a3f8a',D:'#45285c',A:'#d8d0f0',g:'cofia'} },
  lancero:   { n:'Lancero',    d:'Salta sobre el enemigo desde lo alto.', m:{hp:1.15,mp:0.6,atk:1.25,def:1.1,mag:0.6,res:0.9,spd:1.0}, mov:4, salto:4, eva:8,  armas:['lanza'], armad:['malla','cuero'], req:{caballero:2,ladron:2}, habs:['ensarte','salto','rompe_guardia','grito_dragon','salto_alto'], asp:{C:'#2f5f8a',D:'#1f405e',A:'#c0d0e0',g:'cuernos'} },
  campanero: { n:'Campanero',  d:'Guardián de las campanas. Pelea con sonido.', m:{hp:1.0,mp:1.15,atk:0.85,def:0.9,mag:1.15,res:1.1,spd:1.05}, mov:4, salto:2, eva:8,  armas:['maza','vara'], armad:['tela','cuero'], req:{}, unico:'lior', habs:['tanido','canto_alba','eco_protector','campanada','cancion_memoria','resonancia'], asp:{C:'#2f7d7a',D:'#1f5552',A:'#e8c86a',g:'campana'} },

  // Monstruos
  hueco:     { n:'Hueco', mon:true, spr:'humano', m:{hp:1.0,mp:0.8,atk:1.0,def:0.9,mag:0.9,res:0.7,spd:0.85}, mov:3, salto:2, eva:3, poder:5, habs:['toque_olvido'], debil:['luz','sonido'], asp:{S:'#9a98a8',H:'#6e6c7c',E:'#aef0ff',C:'#55536a',D:'#3c3a4e',A:'#7a788c',B:'#2e2c3a',g:'ninguno',calvo:true,ojosBrillan:true} },
  lobo:      { n:'Lobo de bruma', mon:true, spr:'lobo', m:{hp:0.9,mp:0.5,atk:1.1,def:0.8,mag:0.5,res:0.8,spd:1.2}, mov:5, salto:3, eva:12, poder:6, habs:['mordisco','aullido'], debil:['fuego'], asp:{C:'#b8bccc',D:'#7e8296',E:'#7ff',A:'#ffffff'} },
  arana:     { n:'Araña de niebla', mon:true, spr:'arana', m:{hp:0.85,mp:0.7,atk:0.95,def:0.9,mag:0.6,res:0.8,spd:1.0}, mov:4, salto:4, eva:10, poder:5, habs:['picadura','telarana'], debil:['fuego'], asp:{C:'#5a4a6a',D:'#2e2438',E:'#ff5a5a'} },
  murcielago:{ n:'Murciélago', mon:true, spr:'murcielago', vuela:true, m:{hp:0.7,mp:0.6,atk:0.9,def:0.7,mag:0.6,res:0.8,spd:1.3}, mov:5, salto:9, eva:18, poder:4, habs:['chillido'], debil:['rayo'], asp:{C:'#6a5a7a',D:'#3a2e48',E:'#ffd84a'} },
  espectro:  { n:'Espectro', mon:true, spr:'espectro', vuela:true, m:{hp:0.85,mp:1.2,atk:0.6,def:0.8,mag:1.2,res:1.3,spd:0.95}, mov:3, salto:9, eva:10, poder:3, habs:['lamento','toque_olvido'], debil:['luz','sonido'], resFis:0.6, asp:{C:'#d8dcf0',D:'#9aa0c0',E:'#55ffff'} },
  golem:     { n:'Gólem', mon:true, spr:'golem', m:{hp:1.6,mp:0.5,atk:1.3,def:1.5,mag:0.5,res:0.6,spd:0.7}, mov:3, salto:1, eva:0, poder:9, habs:['golpe_roca','temblor'], debil:['rayo'], asp:{C:'#8c8478',D:'#5e584e',A:'#b9ffb0',E:'#9f9'} },
  bestia:    { n:'Bestia de bruma', mon:true, spr:'lobo', tam:1.25, m:{hp:1.5,mp:0.8,atk:1.3,def:1.1,mag:1.0,res:1.0,spd:1.0}, mov:4, salto:3, eva:6, poder:9, habs:['mordisco','aliento_bruma'], debil:['luz','sonido'], asp:{C:'#5a5e78',D:'#3a3c52',E:'#ff6aff',A:'#dddddd'} },
  voz:       { n:'Voz de la Bruma', mon:true, spr:'espectro', tam:1.6, vuela:true, m:{hp:4.2,mp:2.5,atk:1.2,def:1.25,mag:1.45,res:1.3,spd:1.05}, mov:3, salto:9, eva:5, poder:8, habs:['voz_bruma','olvido','grito_olvido'], debil:['sonido'], asp:{C:'#8a6ab0',D:'#4a3070',E:'#ffffff'} },
};

const ARMA_INFO = {
  espada: { n:'Espada', r:[1,1] },
  hacha:  { n:'Hacha',  r:[1,1], var:0.3 },
  daga:   { n:'Daga',   r:[1,1], eva:5 },
  arco:   { n:'Arco',   r:[2,5] },
  vara:   { n:'Vara',   r:[1,1] },
  maza:   { n:'Maza',   r:[1,1] },
  lanza:  { n:'Lanza',  r:[1,2] },
  'puños':{ n:'Puños',  r:[1,1] },
};
const ARMADURA_INFO = { tela:'Túnica', cuero:'Cuero', malla:'Malla' };

// Equipo. slot: arma | armadura | acc. tier = desde qué capítulo se vende. gemas = engarces.
const EQ = {
  // Espadas
  espada_corta:   { n:'Espada corta', slot:'arma', tipo:'espada', poder:5,  precio:100,  tier:1, gemas:0 },
  espada_larga:   { n:'Espada larga', slot:'arma', tipo:'espada', poder:9,  precio:450,  tier:2, gemas:1 },
  espada_caballero:{n:'Espada de caballero', slot:'arma', tipo:'espada', poder:13, precio:1100, tier:3, gemas:1 },
  hoja_runica:    { n:'Hoja rúnica', slot:'arma', tipo:'espada', poder:17, precio:2200, tier:4, gemas:2 },
  hoja_alba:      { n:'Hoja del alba', slot:'arma', tipo:'espada', poder:21, precio:0, tier:9, gemas:2, el:'luz', forja:true },
  // Hachas
  hacha_lenador:  { n:'Hacha de leñador', slot:'arma', tipo:'hacha', poder:7,  precio:150,  tier:1, gemas:0 },
  hacha_guerra:   { n:'Hacha de guerra', slot:'arma', tipo:'hacha', poder:12, precio:700,  tier:2, gemas:1 },
  gran_hacha:     { n:'Gran hacha', slot:'arma', tipo:'hacha', poder:18, precio:1900, tier:4, gemas:2 },
  // Dagas
  daga:           { n:'Daga', slot:'arma', tipo:'daga', poder:4, precio:80,  tier:1, gemas:0 },
  daga_plata:     { n:'Daga de plata', slot:'arma', tipo:'daga', poder:8, precio:400, tier:2, gemas:1 },
  kris:           { n:'Kris', slot:'arma', tipo:'daga', poder:12, precio:1000, tier:3, gemas:1 },
  colmillo:       { n:'Colmillo sombrío', slot:'arma', tipo:'daga', poder:16, precio:2000, tier:4, gemas:2, veneno:20 },
  // Arcos
  arco_corto:     { n:'Arco corto', slot:'arma', tipo:'arco', poder:4,  precio:120,  tier:1, gemas:0 },
  arco_largo:     { n:'Arco largo', slot:'arma', tipo:'arco', poder:8,  precio:500,  tier:2, gemas:1 },
  arco_compuesto: { n:'Arco compuesto', slot:'arma', tipo:'arco', poder:12, precio:1200, tier:3, gemas:1 },
  arco_fresno:    { n:'Arco de fresno viejo', slot:'arma', tipo:'arco', poder:16, precio:0, tier:9, gemas:2, forja:true },
  // Varas
  vara_roble:     { n:'Vara de roble', slot:'arma', tipo:'vara', poder:2, mag:2,  precio:90,   tier:1, gemas:0 },
  vara_cuarzo:    { n:'Vara de cuarzo', slot:'arma', tipo:'vara', poder:4, mag:4,  precio:450,  tier:2, gemas:1 },
  vara_arcana:    { n:'Vara arcana', slot:'arma', tipo:'vara', poder:6, mag:7,  precio:1200, tier:3, gemas:1 },
  vara_estelar:   { n:'Vara estelar', slot:'arma', tipo:'vara', poder:8, mag:10, precio:2400, tier:4, gemas:2 },
  baculo_eco:     { n:'Báculo del eco', slot:'arma', tipo:'vara', poder:9, mag:13, mp:15, precio:0, tier:9, gemas:2, forja:true },
  // Mazas y campanillas
  campanilla:     { n:'Campanilla de aprendiz', slot:'arma', tipo:'maza', poder:4, mag:2, precio:0, tier:9, gemas:1 },
  maza_madera:    { n:'Maza de madera', slot:'arma', tipo:'maza', poder:4, mag:1, res:1, precio:100,  tier:1, gemas:0 },
  maza_bendita:   { n:'Maza bendita', slot:'arma', tipo:'maza', poder:8, mag:3, res:2, precio:500,  tier:2, gemas:1 },
  martillo_sacro: { n:'Martillo sagrado', slot:'arma', tipo:'maza', poder:12, mag:5, res:3, precio:1300, tier:3, gemas:1 },
  campana_plata:  { n:'Campana de plata', slot:'arma', tipo:'maza', poder:15, mag:9, res:4, precio:0, tier:9, gemas:2, el:'sonido', forja:true },
  // Lanzas
  lanza_hierro:   { n:'Lanza de hierro', slot:'arma', tipo:'lanza', poder:8,  precio:400,  tier:2, gemas:1 },
  pica:           { n:'Pica', slot:'arma', tipo:'lanza', poder:12, precio:1100, tier:3, gemas:1 },
  lanza_dentada:  { n:'Lanza dentada', slot:'arma', tipo:'lanza', poder:16, precio:2200, tier:4, gemas:2 },
  lanza_celeste:  { n:'Lanza celeste', slot:'arma', tipo:'lanza', poder:20, precio:0, tier:9, gemas:2, forja:true },
  // Puños
  nudilleras:     { n:'Nudilleras', slot:'arma', tipo:'puños', poder:4, precio:300, tier:2, gemas:1 },
  garras_tigre:   { n:'Garras de tigre', slot:'arma', tipo:'puños', poder:8, precio:1100, tier:3, gemas:2 },
  // Armaduras: tela
  tunica:         { n:'Túnica', slot:'armadura', tipo:'tela', def:3, res:4, mp:5, precio:80, tier:1, gemas:0 },
  tunica_seda:    { n:'Túnica de seda', slot:'armadura', tipo:'tela', def:6, res:8, mp:10, precio:450, tier:2, gemas:1 },
  toga_sabio:     { n:'Toga de sabio', slot:'armadura', tipo:'tela', def:9, res:12, mp:15, precio:1100, tier:3, gemas:1 },
  manto_estelar:  { n:'Manto estelar', slot:'armadura', tipo:'tela', def:12, res:16, mp:20, precio:2200, tier:4, gemas:2 },
  manto_bruma:    { n:'Manto de bruma', slot:'armadura', tipo:'tela', def:13, res:18, mp:20, eva:10, precio:0, tier:9, gemas:2, forja:true },
  // Cuero
  chaleco_cuero:  { n:'Chaleco de cuero', slot:'armadura', tipo:'cuero', def:6, res:2, precio:100, tier:1, gemas:0 },
  cuero_duro:     { n:'Cuero endurecido', slot:'armadura', tipo:'cuero', def:10, res:4, precio:500, tier:2, gemas:1 },
  brigantina:     { n:'Brigantina', slot:'armadura', tipo:'cuero', def:14, res:6, precio:1200, tier:3, gemas:1 },
  cota_sombras:   { n:'Cota de sombras', slot:'armadura', tipo:'cuero', def:18, res:8, eva:5, precio:2300, tier:4, gemas:2 },
  // Malla
  cota_ligera:    { n:'Cota ligera', slot:'armadura', tipo:'malla', def:8, res:1, precio:160, tier:1, gemas:0 },
  placas:         { n:'Armadura de placas', slot:'armadura', tipo:'malla', def:14, res:2, precio:700, tier:2, gemas:1 },
  armadura_cab:   { n:'Armadura de caballero', slot:'armadura', tipo:'malla', def:19, res:4, precio:1500, tier:3, gemas:1 },
  armadura_real:  { n:'Armadura real', slot:'armadura', tipo:'malla', def:24, res:6, precio:2600, tier:4, gemas:2 },
  coraza_torre:   { n:'Coraza de la torre', slot:'armadura', tipo:'malla', def:27, res:9, precio:0, tier:9, gemas:2, forja:true },
  // Accesorios
  anillo_fuerza:  { n:'Anillo de fuerza', slot:'acc', atk:3, precio:300, tier:1, gemas:0 },
  anillo_sabio:   { n:'Anillo del sabio', slot:'acc', mag:3, precio:300, tier:1, gemas:0 },
  amuleto:        { n:'Amuleto protector', slot:'acc', def:2, res:2, precio:300, tier:1, gemas:0 },
  pluma_cuervo:   { n:'Pluma de cuervo', slot:'acc', salto:1, eva:5, precio:500, tier:2, gemas:0 },
  talisman:       { n:'Talismán puro', slot:'acc', inmune:['veneno','dormido'], precio:600, tier:2, gemas:0 },
  botas_ligeras:  { n:'Botas ligeras', slot:'acc', mov:1, precio:900, tier:2, gemas:0 },
  cinta_veloz:    { n:'Cinta veloz', slot:'acc', spd:1, precio:1200, tier:3, gemas:1 },
  corona_laurel:  { n:'Corona de laurel', slot:'acc', atk:2, def:2, mag:2, res:2, precio:2200, tier:4, gemas:1 },
  botas_viento:   { n:'Botas de viento', slot:'acc', mov:1, spd:1, salto:1, precio:0, tier:9, gemas:1, forja:true },
};

// Gemas: en un arma dan elemento o un efecto; en una armadura, resistencia o atributos. Niveles I-III (3 iguales = 1 del nivel siguiente).
const GEMAS = {
  rubi:      { n:'Rubí',      c:'#ff4a4a', el:'fuego',  d:'Arma: ataques de fuego. Armadura: resiste fuego.' },
  zafiro:    { n:'Zafiro',    c:'#4aa8ff', el:'hielo',  d:'Arma: ataques de hielo (pueden frenar). Armadura: resiste hielo.' },
  topacio:   { n:'Topacio',   c:'#ffd23a', el:'rayo',   d:'Arma: ataques de rayo. Armadura: resiste rayo.' },
  diamante:  { n:'Diamante',  c:'#f4faff', el:'luz',    d:'Arma: ataques de luz. Armadura: resiste luz.' },
  amatista:  { n:'Amatista',  c:'#b07aff', el:'sonido', d:'Arma: ataques de sonido. Armadura: resiste sonido.' },
  onix:      { n:'Ónix',      c:'#4a4458', st:'atk',    d:'+ataque.' },
  opalo:     { n:'Ópalo',     c:'#ffb8e8', st:'mag',    d:'+magia.' },
  jade:      { n:'Jade',      c:'#3ac87a', st:'hp',     d:'+vida máxima.' },
  ambar:     { n:'Ámbar',     c:'#ff9a2a', st:'spd',    d:'+velocidad.' },
  perla:     { n:'Perla',     c:'#e8e4da', efecto:'regen',    d:'Habilidad extra: recupera vida cada turno.' },
  sangrita:  { n:'Sangrita',  c:'#9a1a3a', efecto:'vampiro',  d:'Habilidad extra: los golpes te curan una parte del daño.' },
  piedra_eco:{ n:'Piedra eco',c:'#7ae0d8', efecto:'contra',   d:'Habilidad extra: chance de contraatacar.' },
};
const GEMA_PRECIO = [0, 250, 0, 0]; // solo se compran gemas de nivel I

// Mascotas: van al lado de su dueño, le dan atributos y a veces actúan solas. Suben de nivel con las batallas.
const MASCOTAS = {
  zorrito:  { n:'Zorrito de brasa', d:'+Ataque. A veces muerde con fuego a un enemigo de al lado.', bon:{atk:2}, accion:'mordida_fuego', prob:30, precio:600,  asp:{C:'#ff8a3a',D:'#c4521a',E:'#2a1a10',A:'#fff2d8'}, spr:'zorro' },
  buho:     { n:'Búho lunar',       d:'+Magia. Le devuelve magia a su dueño cada turno.', bon:{mag:2}, accion:'mp', prob:100, precio:700, asp:{C:'#8a7ac8',D:'#5a4a8a',E:'#ffe25a',A:'#e8e0ff'}, spr:'buho' },
  tortuga:  { n:'Tortuguita musgo', d:'+Defensa. Cura un poquito a su dueño cada turno.', bon:{def:2,res:1}, accion:'cura', prob:100, precio:650, asp:{C:'#5aa04a',D:'#3a6a30',E:'#1a1a1a',A:'#c8b070'}, spr:'tortuga' },
  huron:    { n:'Hurón veloz',      d:'+Velocidad y +1 movimiento.', bon:{spd:1,mov:1}, accion:null, precio:900, asp:{C:'#c8a07a',D:'#8a6a4a',E:'#1a1a1a',A:'#fff4e0'}, spr:'zorro' },
  gatito:   { n:'Gatito campanita', d:'+Evasión. A veces aturde con su cascabel a quien te ataca.', bon:{eva:6}, accion:'cascabel', prob:25, precio:800, asp:{C:'#f0f0f0',D:'#b8b8c0',E:'#3ac87a',A:'#ffd23a'}, spr:'gato' },
  perro:    { n:'Perro fiel',       d:'+Defensa. A veces se mete en el medio y recibe la mitad del golpe.', bon:{def:2,hp:6}, accion:'guardia', prob:25, precio:850, asp:{C:'#c8925a',D:'#8a5a32',E:'#2a1f2e',A:'#fff4e0'}, spr:'perro' },
  halcon:   { n:'Halcón cazador',   d:'+1 de alcance con arcos, lanzas y magia de distancia, y +Evasión.', bon:{eva:4}, accion:'vista', prob:100, precio:0, asp:{C:'#8a6a4a',D:'#5a4230',E:'#ffd23a',A:'#f4ead8'}, spr:'halcon' },
  conejo:   { n:'Conejo de la suerte', d:'Más botín, más oro y más chance de equipo raro.', bon:{spd:0.5}, accion:'suerte', prob:100, precio:0, asp:{C:'#f4f0ea',D:'#c8c0b8',E:'#c83a5a',A:'#ffb8c8'}, spr:'conejo' },
  dragoncito:{n:'Dragoncito de bruma', d:'Todo +2. A veces escupe fuego sobre un área.', bon:{atk:2,def:2,mag:2,res:2}, accion:'aliento', prob:25, precio:0, asp:{C:'#7a5ac8',D:'#4a3080',E:'#ffe25a',A:'#ffb8e8'}, spr:'dragon' },
};

// Rarezas del equipo: multiplican el poder, suman atributos extra y engarces.
const RAREZAS = [
  { n:'Común',      c:'#d8dce8', m:0,    bonos:0, gemas:0 },
  { n:'Raro',       c:'#5ab8ff', m:0.15, bonos:1, gemas:0 },
  { n:'Especial',   c:'#c88aff', m:0.3,  bonos:1, gemas:1 },
  { n:'Legendario', c:'#ffae42', m:0.5,  bonos:2, gemas:1 },
  { n:'Mítico',     c:'#ff5a7a', m:0.8,  bonos:3, gemas:2, el:true },
];
const BONOS_EQ = { atk:'Atq', def:'Def', mag:'Mag', res:'Res', hp:'PV', mp:'PM', spd:'Vel', eva:'Eva' };

const OBJ = {
  pocion:   { n:'Poción',         d:'Recupera 40 de vida.',          precio:30,  tier:1, uso:{cura:40},  r:[0,1] },
  hipocion: { n:'Hi-poción',      d:'Recupera 120 de vida.',         precio:110, tier:2, uso:{cura:120}, r:[0,1] },
  eter:     { n:'Éter',           d:'Recupera 30 de magia.',         precio:150, tier:2, uso:{mp:30},    r:[0,1] },
  remedio:  { n:'Remedio',        d:'Cura todos los estados malos.', precio:50,  tier:1, uso:{limpia:true}, r:[0,1] },
  fenix:    { n:'Pluma de fénix', d:'Levanta a un aliado caído con 30% de vida.', precio:200, tier:1, uso:{revive:0.3}, r:[1,1] },
  bomba:    { n:'Bomba',          d:'Explota: 45 de daño de fuego en área.', precio:120, tier:2, uso:{danio:45, el:'fuego'}, r:[1,4], a:1 },
  elixir:   { n:'Elixir',         d:'Vida y magia al máximo.',       precio:0,   tier:9, uso:{cura:9999, mp:999}, r:[0,1] },
};

const MAT = {
  hierro:   { n:'Hierro',             d:'Mineral común. Sirve para mejorar equipo.', c:'#9aa0aa' },
  plata:    { n:'Plata de bruma',     d:'Plata que brilla dentro de la niebla.',      c:'#d8e4ff' },
  esquirla: { n:'Esquirla de campana',d:'Un pedazo de campana antigua. Todavía suena.', c:'#e8c86a' },
};

// Recetas de la herrería.
const FORJA = [
  { id:'hoja_alba',     oro:1500, mat:{ esquirla:3, plata:2 } },
  { id:'arco_fresno',   oro:900,  mat:{ plata:2, hierro:4 } },
  { id:'baculo_eco',    oro:1200, mat:{ esquirla:2, plata:2 } },
  { id:'campana_plata', oro:1400, mat:{ esquirla:3, plata:3 } },
  { id:'lanza_celeste', oro:1400, mat:{ esquirla:2, plata:3 } },
  { id:'coraza_torre',  oro:1000, mat:{ hierro:6, plata:2 } },
  { id:'manto_bruma',   oro:1000, mat:{ plata:3, esquirla:1 } },
  { id:'botas_viento',  oro:600,  mat:{ plata:2, hierro:2 } },
];

const NOMBRES = ['Tomás','Nela','Iván','Rufina','Bruno','Celia','Dario','Elsa','Gael','Ines','Joel','Luz','Marco','Nora','Otto','Pía','Quim','Rosa','Saúl','Tea','Ulises','Vera','Yago','Zoe','Ciro','Alba','Félix','Greta','Hugo','Ada'];
const PELOS = ['#3a2a1e','#6a3a1a','#b8662a','#e8c06a','#1a1a22','#8a8a92','#c84a2a','#5a3a6a'];
const PIELES = ['#f2c9a0','#e0ac80','#c88a5a','#9a6440','#f6d8bc'];
