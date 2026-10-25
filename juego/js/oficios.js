// Oficios extra: más caminos para armar el grupo. Se cargan después de acto2.js.
// Las partidas viejas no se tocan: las clases nuevas solo suman entradas a CLASES/HAB/EQ.

ARMA_INFO.instrumento = { n:'Instrumento', r:[1,3] };

Object.assign(HAB, {
  // Cantor
  himno_valor:    { n:'Himno de valor', d:'Canta y da Valor (+25% de ataque) a los aliados cercanos.', tipo:'apoyo', mp:8, r:[0,0], a:2, af:'a', est:[{id:'valor',prob:100,dur:3}], pc:80, fx:'sonido' },
  canto_sereno:   { n:'Canto sereno', d:'Regen para los aliados cercanos.', tipo:'apoyo', mp:10, r:[0,0], a:2, af:'a', est:[{id:'regen',prob:100,dur:3}], pc:120, fx:'sonido' },
  coral_escudo:   { n:'Coral escudo', d:'Protección para los aliados cercanos.', tipo:'apoyo', mp:12, r:[0,0], a:2, af:'a', est:[{id:'protegido',prob:100,dur:3}], pc:160, fx:'escudo' },
  nana:           { n:'Nana', d:'Duerme a los enemigos de un área.', tipo:'apoyo', mp:10, r:[1,4], a:1, af:'e', est:[{id:'dormido',prob:55,dur:2}], pc:150, fx:'sueno' },
  aria_final:     { carga:20, n:'Aria final', d:'Una nota que parte el aire.', tipo:'mag', mp:20, r:[1,5], a:1, p:34, el:'sonido', pc:300, fx:'sonido' },
  voz_templada:   { n:'Voz templada', d:'Pasiva: inmune a Silencio y +10% de magia máxima.', tipo:'pasiva', pv:'voz', pc:200 },
  // Trovador
  acorde:         { n:'Acorde', d:'Un acorde que golpea de lejos.', tipo:'mag', mp:6, r:[1,4], p:16, el:'sonido', pc:60, fx:'sonido' },
  rasgueo:        { n:'Rasgueo furioso', d:'Tres golpes seguidos con el instrumento.', tipo:'fis', mp:0, r:'arma', p:0.6, golpes:3, pc:120, fx:'golpe' },
  balada_prisa:   { n:'Balada veloz', d:'Prisa para los aliados cercanos.', tipo:'apoyo', mp:14, r:[0,0], a:2, af:'a', est:[{id:'prisa',prob:100,dur:3}], pc:200, fx:'sonido' },
  disonancia:     { n:'Disonancia', d:'Desafina al enemigo: le baja ataque y defensa.', tipo:'apoyo', mp:12, r:[1,4], a:1, af:'e', est:[{id:'debil',prob:70,dur:3},{id:'quebrado',prob:70,dur:3}], pc:180, fx:'sonido' },
  solo_legendario:{ carga:18, n:'Solo legendario', d:'El solo que hace temblar el suelo.', tipo:'mag', mp:24, r:[1,5], a:2, p:40, el:'sonido', est:[{id:'aturdido',prob:30,dur:1}], pc:320, fx:'sonido' },
  de_gira:        { n:'De gira', d:'Pasiva: +1 de movimiento.', tipo:'pasiva', pv:'mov1', pc:220 },
  // Nigromante
  drenar:         { n:'Drenar vida', d:'Le chupa la vida al enemigo y te cura la mitad.', tipo:'mag', mp:8, r:[1,4], p:18, drena:0.5, pc:80, fx:'bruma' },
  maldicion:      { n:'Maldición', d:'Veneno y Lento a la vez.', tipo:'apoyo', mp:8, r:[1,4], af:'e', est:[{id:'veneno',prob:70,dur:4},{id:'lento',prob:60,dur:3}], pc:100, fx:'bruma' },
  plaga:          { carga:22, n:'Plaga', d:'Una nube podrida sobre un área.', tipo:'mag', mp:16, r:[1,5], a:1, p:22, est:[{id:'veneno',prob:50,dur:4}], pc:180, fx:'bruma' },
  alzar_caido:    { n:'Alzar al caído', d:'Levanta a un aliado caído, no siempre sale.', tipo:'revivir', mp:14, r:[1,3], af:'a', p:0.25, prob:70, pc:220, fx:'revivir' },
  toque_muerte:   { n:'Toque de muerte', d:'Puede matar de un golpe (no a jefes).', tipo:'especial', esp:'muerte', mp:18, r:[1,3], af:'e', pc:260, fx:'bruma' },
  pacto_sangre:   { n:'Pacto de sangre', d:'Pasiva: los golpes te curan una parte del daño.', tipo:'pasiva', pv:'vampiro', pc:250 },
  // Medium
  canalizar:      { n:'Canalizar', d:'Le pasa magia a un aliado.', tipo:'especial', esp:'canalizar', mp:0, r:[1,4], af:'a', pc:80, fx:'brillo' },
  voces_ancestro: { n:'Voces de los ancestros', d:'Protección y Coraza a un aliado.', tipo:'apoyo', mp:12, r:[0,3], af:'a', est:[{id:'protegido',prob:100,dur:3},{id:'coraza',prob:100,dur:3}], pc:140, fx:'brillo' },
  posesion:       { n:'Posesión', d:'Un espíritu deja Detenido al enemigo.', tipo:'apoyo', mp:14, r:[1,4], af:'e', est:[{id:'detenido',prob:45,dur:2}], pc:200, fx:'bruma' },
  lamento_almas:  { carga:24, n:'Lamento de las almas', d:'Los muertos gritan sobre un área.', tipo:'mag', mp:14, r:[1,5], a:1, p:24, est:[{id:'silencio',prob:40,dur:2}], pc:180, fx:'bruma' },
  rito_retorno:   { n:'Rito de retorno', d:'Trae de vuelta a un aliado caído.', tipo:'revivir', mp:20, r:[1,3], af:'a', p:0.5, pc:280, fx:'revivir' },
  sexto_sentido:  { n:'Sexto sentido', d:'Pasiva: +10% de evasión.', tipo:'pasiva', pv:'sexto', pc:200 },
  // Alquimista
  acido:          { n:'Frasco de ácido', d:'Lo tira de lejos y le rompe la defensa.', tipo:'fis', mp:0, r:[1,4], p:0.9, sinArma:true, est:[{id:'quebrado',prob:80,dur:3}], pc:70, fx:'piedra' },
  bomba:          { n:'Bomba casera', d:'Explota en un área.', tipo:'mag', mp:8, r:[2,5], a:1, p:20, el:'fuego', pc:120, fx:'fuego' },
  elixir:         { n:'Elixir', d:'Cura 35% de la vida y 15 de magia.', tipo:'especial', esp:'elixir', mp:10, r:[0,3], af:'a', pc:150, fx:'cura' },
  tonico:         { n:'Tónico', d:'Valor y Foco a un aliado.', tipo:'apoyo', mp:10, r:[0,3], af:'a', est:[{id:'valor',prob:100,dur:3},{id:'foco',prob:100,dur:3}], pc:160, fx:'brillo' },
  transmutar:     { carga:22, n:'Transmutación', d:'Convierte el aire en plomo: daño y Lento.', tipo:'mag', mp:18, r:[1,5], a:1, p:30, est:[{id:'lento',prob:50,dur:3}], pc:260, fx:'gravedad' },
  dosis_doble:    { n:'Dosis doble', d:'Pasiva: las pociones y éteres rinden ×1.5.', tipo:'pasiva', pv:'farmacia', pc:200 },
  // Domador
  zarpazo:        { n:'Zarpazo', d:'Dos golpes rápidos.', tipo:'fis', mp:0, r:'arma', p:0.7, golpes:2, pc:80, fx:'mordida' },
  silbido:        { n:'Silbido', d:'Prisa a un aliado.', tipo:'apoyo', mp:10, r:[0,4], af:'a', est:[{id:'prisa',prob:100,dur:3}], pc:150, fx:'brillo' },
  rugido:         { n:'Rugido', d:'Asusta a los enemigos cercanos: les baja el ataque.', tipo:'apoyo', mp:8, r:[0,0], a:2, af:'e', est:[{id:'debil',prob:70,dur:3}], pc:140, fx:'onda' },
  instinto:       { n:'Instinto salvaje', d:'Valor y Regen sobre sí.', tipo:'apoyo', mp:8, r:[0,0], af:'a', est:[{id:'valor',prob:100,dur:3},{id:'regen',prob:100,dur:3}], pc:120, fx:'brillo' },
  estampida:      { n:'Estampida', d:'Embiste un área a distancia.', tipo:'fis', mp:10, r:[1,3], a:1, p:0.9, pc:220, fx:'tierra' },
  lazo_salvaje:   { n:'Lazo salvaje', d:'Pasiva: la mascota da el doble de bonus.', tipo:'pasiva', pv:'bestias', pc:220 },
  // Berserker
  furia:          { n:'Furia', d:'Pierde 15% de vida y gana Valor y Prisa.', tipo:'especial', esp:'furia', mp:0, r:[0,0], af:'a', pc:80, fx:'brillo' },
  hachazo:        { n:'Hachazo salvaje', d:'Un golpe brutal (x1.8).', tipo:'fis', mp:0, r:'arma', p:1.8, pc:120, fx:'corte' },
  torbellino:     { n:'Torbellino', d:'Golpea a todos alrededor.', tipo:'fis', mp:6, r:[0,0], a:1, p:1.15, pc:180, fx:'corte' },
  grito_guerra:   { n:'Grito de guerra', d:'Aturde a los enemigos cercanos.', tipo:'apoyo', mp:10, r:[0,0], a:2, af:'e', est:[{id:'aturdido',prob:35,dur:1}], pc:200, fx:'onda' },
  desesperado:    { n:'Golpe desesperado', d:'Cuanta menos vida tiene, más pega.', tipo:'especial', esp:'desesperado', mp:0, r:[1,1], af:'e', pc:260, fx:'golpe' },
  rabia:          { n:'Rabia', d:'Pasiva: +15% de ataque y −10% de defensa.', tipo:'pasiva', pv:'rabia', pc:240 },
});

Object.assign(CLASES, {
  cantor:      { n:'Cantor', d:'Su voz da valor, cura de a poco y duerme al enemigo.', m:{hp:0.85,mp:1.25,atk:0.6,def:0.75,mag:1.15,res:1.15,spd:1.05}, mov:4, salto:2, eva:8, armas:['vara','daga','instrumento'], armad:['tela'], req:{novicio:2,recluta:1}, habs:['himno_valor','canto_sereno','nana','coral_escudo','aria_final','voz_templada'], asp:{C:'#8a3a6a',D:'#5a2244',A:'#f0d080',g:'boina'} },
  trovador:    { n:'Trovador', d:'Guitarrista de taberna. Toca de lejos y acelera al grupo.', m:{hp:0.95,mp:1.1,atk:0.95,def:0.8,mag:1.1,res:0.95,spd:1.15}, mov:4, salto:3, eva:14, armas:['instrumento','daga'], armad:['cuero','tela'], req:{cantor:2,ladron:1}, habs:['acorde','rasgueo','disonancia','balada_prisa','solo_legendario','de_gira'], asp:{C:'#a85a2a',D:'#6a3414',A:'#e8d0a0',g:'sombrero'} },
  nigromante:  { n:'Nigromante', d:'Magia de los muertos: drena, maldice y mata de un toque.', m:{hp:0.85,mp:1.35,atk:0.55,def:0.75,mag:1.35,res:1.1,spd:0.95}, mov:3, salto:2, eva:5, armas:['vara','daga'], armad:['tela'], req:{hechicero:3,ladron:2}, habs:['drenar','maldicion','plaga','alzar_caido','toque_muerte','pacto_sangre'], asp:{C:'#2a2234',D:'#15101c',A:'#8aff9a',g:'capucha'} },
  medium:      { n:'Medium', d:'Habla con los espíritus: protege, revive y paraliza.', m:{hp:0.85,mp:1.4,atk:0.5,def:0.75,mag:1.2,res:1.3,spd:1.0}, mov:3, salto:2, eva:8, armas:['vara','maza'], armad:['tela'], req:{clerigo:3,cantor:2}, habs:['canalizar','voces_ancestro','posesion','lamento_almas','rito_retorno','sexto_sentido'], asp:{C:'#4a5a8a',D:'#2a3458',A:'#d0f0ff',g:'cofia'} },
  alquimista:  { n:'Alquimista', d:'Frascos, bombas y elixires. Saca el doble a las pociones.', m:{hp:0.95,mp:1.1,atk:0.85,def:0.85,mag:1.1,res:1.0,spd:1.05}, mov:4, salto:2, eva:10, armas:['daga','maza'], armad:['cuero','tela'], req:{novicio:2,ladron:2}, habs:['acido','bomba','elixir','tonico','transmutar','dosis_doble'], asp:{C:'#5a7a3a',D:'#3a5222',A:'#e8c060',g:'panuelo'} },
  domador:     { n:'Domador', d:'Pelea junto a su bestia: con él la mascota rinde el doble.', m:{hp:1.1,mp:0.7,atk:1.15,def:0.95,mag:0.6,res:0.85,spd:1.1}, mov:4, salto:3, eva:12, armas:['hacha','lanza','daga'], armad:['cuero'], req:{arquero:3,monje:1}, habs:['zarpazo','silbido','rugido','instinto','estampida','lazo_salvaje'], asp:{C:'#7a5a2a',D:'#4a3414',A:'#d8b070',g:'cuernos'} },
  berserker:   { n:'Berserker', d:'Pura furia: pega más cuanto más herido está.', m:{hp:1.3,mp:0.4,atk:1.45,def:0.85,mag:0.4,res:0.7,spd:1.05}, mov:4, salto:2, eva:6, armas:['hacha','espada','puños'], armad:['cuero'], req:{guerrero:4,monje:2}, habs:['furia','hachazo','torbellino','grito_guerra','desesperado','rabia'], asp:{C:'#6a2a1a',D:'#3a140a',A:'#c8c0b0',g:'cuernos'} },
});

Object.assign(EQ, {
  laud_viejo:      { n:'Laúd viejo', slot:'arma', tipo:'instrumento', poder:3, mag:2, precio:120, tier:1, gemas:0 },
  guitarra_criolla:{ rasgos:['aturdir'], n:'Guitarra criolla', slot:'arma', tipo:'instrumento', poder:5, mag:4, precio:520, tier:2, gemas:1 },
  arpa_plata:      { rasgos:['mp_regen'], n:'Arpa de plata', slot:'arma', tipo:'instrumento', poder:7, mag:7, precio:1300, tier:3, gemas:1 },
  vihuela_eco:     { rasgos:['mp_regen', 'prisa_ini'], n:'Vihuela del eco', slot:'arma', tipo:'instrumento', poder:9, mag:10, precio:2500, tier:4, gemas:2 },
  guitarra_abismo: { rasgos:['drenar_mp', 'aturdir'], n:'Guitarra del abismo', slot:'arma', tipo:'instrumento', poder:12, mag:14, precio:4400, tier:5, gemas:2 },
});
