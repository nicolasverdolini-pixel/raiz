// Misiones: NPCs repartidos por el Páramo, cada uno con una cadena de pedidos.
// Y en cada atalaya un Tablón de Encargos que nunca se termina (el juego no tiene final).
// objetivo: matar (n de un monstruo) · jefe (matar un jefe) · juntar (cosas que suelta un monstruo) · visitar (llegar a un lugar)
import { MONSTRUOS, PUEBLOS } from './reglas.js';

export const NPC_MISION = [
  { id: 'marga', nombre: 'Viuda Marga', modelo: 'npc_mercader', tinte: '#4a3a44', x: 16, z: 12, giro: 2.4,
    saludo: 'Las ratas se llevaron a mi marido. De a pedacitos.' },
  { id: 'pescador', nombre: 'Pescador sin Ojos', modelo: 'npc_herrero', tinte: '#3a4a44', x: -36, z: 9, giro: -2,
    saludo: 'No necesito ojos para saber que el agua está podrida. La huelo.' },
  { id: 'trenza', nombre: 'Hermano Trenza', modelo: 'npc_vidente', tinte: '#4a4a3a', x: 40, z: 3, giro: -0.8,
    saludo: 'Rezo para que la tela no llegue al Farol. Rezar no alcanza.' },
  { id: 'apicultora', nombre: 'La Apicultora', modelo: 'npc_mercader', tinte: '#5a4220', x: -22, z: -45, giro: 0.6,
    saludo: 'Yo las crié. Antes daban miel. Ahora dan otra cosa.' },
  { id: 'cazador', nombre: 'Cazador Ronco', modelo: 'npc_herrero', tinte: '#3a3a30', x: -68, z: 60, giro: 2.6,
    saludo: 'En este bosque el que caza también es cazado. Hoy me toca cazar.' },
  { id: 'sepulturero', nombre: 'Sepulturero Abel', modelo: 'npc_herrero', tinte: '#2e2e34', x: 70, z: -54, giro: -2.2,
    saludo: 'Enterré a todos. Algunos no se quedaron enterrados.' },
  { id: 'monja', nombre: 'La Monja Ciega', modelo: 'npc_vidente', tinte: '#2a2a2a', x: 80, z: -90, giro: -1,
    saludo: 'Rompieron los sellos. Yo los puse. Ayudame a ponerlos otra vez.' },
  { id: 'desertor', nombre: 'El Desertor', modelo: 'npc_herrero', tinte: '#3a2a20', x: -68, z: -86, giro: 1.2,
    saludo: 'Me fui de la guardia. No me juzgues hasta ver lo que hay en ese pantano.' },
  { id: 'naufrago', nombre: 'El Náufrago', modelo: 'npc_herrero', tinte: '#3a4a5a', x: 588, z: -30, giro: 0.4,
    saludo: 'Llegué nadando. Ojalá me hubiera ahogado como los demás.' },
  { id: 'farera', nombre: 'La Farera', modelo: 'npc_vidente', tinte: '#2a3a4a', x: 612, z: 44, giro: 2.8,
    saludo: 'Mientras el faro esté apagado, ellos van a seguir saliendo del agua.' },
  { id: 'ultimo', nombre: 'El Último Pescador', modelo: 'npc_mercader', tinte: '#2a3a3a', x: 650, z: -6, giro: -1.6,
    saludo: 'Pesqué algo que no tenía que pescar. Ahora la Fosa respira.' },
  { id: 'fundidor', nombre: 'El Fundidor', modelo: 'npc_herrero', tinte: '#5a2a14', x: 20, z: 585, giro: 2.4,
    saludo: 'Fundí hierro cuarenta años. Ahora el hierro me funde a mí.' },
  { id: 'quemada', nombre: 'La Quemada', modelo: 'npc_mercader', tinte: '#3a2a22', x: -45, z: 600, giro: 1.2,
    saludo: 'No me mires la cara. Mirá lo que viene detrás tuyo.' },
  { id: 'escudero', nombre: 'El Escudero', modelo: 'npc_herrero', tinte: '#3a4258', x: -575, z: -15, giro: -0.6,
    saludo: 'Le cargaba el escudo al rey. Ahora no tengo a quién.' },
  { id: 'bufon', nombre: 'El Bufón', modelo: 'npc_vidente', tinte: '#5a2a4a', x: -625, z: 30, giro: 2.2,
    saludo: '¿Sabés por qué el rey no se ríe? Porque está muerto. Ja. Ja.' },
  { id: 'cartografa', nombre: 'La Cartógrafa', modelo: 'npc_vidente', tinte: '#3a5068', x: 620, z: 585, giro: 2.4,
    saludo: 'Vine a dibujar el mapa de este lugar. Hace treinta años.' },
  { id: 'montanes', nombre: 'El Último Montañés', modelo: 'npc_herrero', tinte: '#4a5a68', x: 578, z: 615, giro: 0.8,
    saludo: 'Hablá bajo. Acá hasta el silencio te escucha.' },
  { id: 'domador', nombre: 'El Domador Quemado', modelo: 'npc_herrero', tinte: '#5a2a1a', x: -580, z: 585, giro: -2.2,
    saludo: 'Crié a uno desde el huevo. Mirá lo que me dejó.' },
  { id: 'cronista', nombre: 'La Cronista del Fuego', modelo: 'npc_vidente', tinte: '#6a3a18', x: -625, z: 615, giro: 1.4,
    saludo: 'Escribo lo que pasó antes del Sol. Falta poco para que lo sepas vos también.' },
  { id: 'penitente', nombre: 'El Penitente', modelo: 'npc_vidente', tinte: '#5a1a14', x: 72, z: 82, giro: -2.4,
    saludo: 'Yo abrí el Foso. Me queda poca vida para pedir perdón.' },
];

// nivel: desde qué nivel te la dan · req: misión anterior
const M = (id, npc, nombre, nivel, obj, premio, texto, fin, req) => ({ id, npc, nombre, nivel, obj, premio, texto, fin, req });
export const MISIONES = Object.fromEntries([
  M('marga1', 'marga', 'Cola por cola', 1, { tipo: 'matar', mon: 'rata', n: 10 }, { exp: 220, oro: 80, items: [{ b: 'pocion', c: 5 }] },
    'Matá diez Ratas de Peste. Las que rodean la Atalaya.', 'Diez menos. Quedan mil. Igual gracias.'),
  M('marga2', 'marga', 'La madre de todas', 6, { tipo: 'jefe', mon: 'ratareina' }, { exp: 3000, oro: 600, equipo: { exc: 0.6, leg: 0.1 } },
    'La Rata Reina vive al sudoeste. No vayas solo.', 'Ahora sí puedo dormir. Tomá, era de él.', 'marga1'),
  M('pesca1', 'pescador', 'Lenguas', 3, { tipo: 'juntar', mon: 'sapo', cosa: 'Lengua de sapo', prob: 0.5, n: 6 }, { exp: 500, oro: 120, items: [{ b: 'eter', c: 5 }] },
    'Traeme seis lenguas de Sapo de Ciénaga. No preguntes para qué.', 'Ahora puedo hablar con el agua.'),
  M('pesca2', 'pescador', 'Brea', 8, { tipo: 'matar', mon: 'sierpe', n: 8 }, { exp: 1500, oro: 300, items: [{ b: 'forja', c: 2 }] },
    'Las Sierpes de Brea envenenan la ciénaga. Matá ocho.', 'El agua respira un poco mejor.', 'pesca1'),
  M('pesca3', 'pescador', 'El bosque que cuelga', 10, { tipo: 'visitar', lugar: 'Bosque de los Colgados' }, { exp: 1200, oro: 200, items: [{ b: 'vela', c: 2 }] },
    'Al noroeste hay un bosque. Contame qué cuelga de los árboles.', 'No hace falta que me cuentes. Lo veo en tu cara.', 'pesca2'),
  M('trenza1', 'trenza', 'La tela', 5, { tipo: 'matar', mon: 'arana', n: 12 }, { exp: 900, oro: 180, items: [{ b: 'pocion', c: 8 }] },
    'Matá doce Tejedoras antes de que tejan hasta acá.', 'Doce hilos cortados.'),
  M('trenza2', 'trenza', 'Seda de Éter', 7, { tipo: 'juntar', mon: 'arana', cosa: 'Seda de Éter', prob: 0.35, n: 5 }, { exp: 1400, oro: 260, items: [{ b: 'forja', c: 2 }] },
    'Necesito cinco madejas de Seda de Éter para tejer un sello.', 'Con esto rezo mejor.', 'trenza1'),
  M('trenza3', 'trenza', 'La Madre', 12, { tipo: 'jefe', mon: 'madretejedora' }, { exp: 8000, oro: 1200, equipo: { exc: 0.7, leg: 0.15 }, items: [{ b: 'destino', c: 1 }] },
    'La Madre Tejedora está en el centro del nido. Llevá un grupo.', 'La tela se afloja. Por ahora.', 'trenza2'),
  M('api1', 'apicultora', 'Zumbido', 9, { tipo: 'matar', mon: 'avispon', n: 12 }, { exp: 1800, oro: 300, items: [{ b: 'eter', c: 8 }] },
    'Matá doce Avispones de Carroña. Ya no son mis abejas.', 'Lloro, pero no por ellas.'),
  M('api2', 'apicultora', 'La Reina', 16, { tipo: 'jefe', mon: 'reinacolmena' }, { exp: 12000, oro: 1800, equipo: { exc: 0.7, leg: 0.15 }, items: [{ b: 'destino', c: 2 }] },
    'La Reina de la Colmena sigue poniendo huevos. Terminá con eso.', 'Silencio. Por fin.', 'api1'),
  M('caza1', 'cazador', 'Hambre', 12, { tipo: 'matar', mon: 'lobo', n: 10 }, { exp: 2600, oro: 400, items: [{ b: 'forja', c: 2 }] },
    'Diez Lobos Famélicos. Que coman acero.', 'Buena caza.'),
  M('caza2', 'cazador', 'Pechos vacíos', 16, { tipo: 'matar', mon: 'ciervo', n: 6 }, { exp: 3600, oro: 600, items: [{ b: 'destino', c: 1 }] },
    'Seis Ciervos Huecos. Cuidado cuando bajan la cabeza.', 'No te embistieron. O sí, y aguantaste.', 'caza1'),
  M('caza3', 'cazador', 'Lo que hay al sur', 26, { tipo: 'visitar', lugar: 'Pantano de los Brutos' }, { exp: 4000, oro: 500, items: [{ b: 'vela', c: 3 }] },
    'Me dicen que en el sur hay un pantano con carne que camina. Andá a ver.', 'Te creo. No pienso ir.', 'caza2'),
  M('sepu1', 'sepulturero', 'Volver a enterrar', 14, { tipo: 'matar', mon: 'huesudo', n: 15 }, { exp: 4000, oro: 600, items: [{ b: 'forja', c: 3 }] },
    'Quince Huesudos. Rompelos bien, que si no se levantan.', 'Quince tumbas otra vez cerradas.'),
  M('sepu2', 'sepulturero', 'Huesos sin nombre', 18, { tipo: 'juntar', mon: 'huesudo', cosa: 'Hueso sin nombre', prob: 0.4, n: 8 }, { exp: 5500, oro: 800, items: [{ b: 'destino', c: 2 }] },
    'Traeme ocho huesos. Les voy a poner nombre, aunque sea uno inventado.', 'Este se va a llamar como vos.', 'sepu1'),
  M('sepu3', 'sepulturero', 'El que se cansó', 23, { tipo: 'jefe', mon: 'centinela' }, { exp: 20000, oro: 2500, equipo: { exc: 0.7, leg: 0.2, mit: 0.02 }, items: [{ b: 'abismo', c: 1 }] },
    'El Centinela Hueco fue un Guardián. Dale el descanso que no supo tomar.', 'Descansá, hermano.', 'sepu2'),
  M('monja1', 'monja', 'Plegarias rotas', 20, { tipo: 'matar', mon: 'anima', n: 10 }, { exp: 7000, oro: 1000, items: [{ b: 'destino', c: 2 }] },
    'Diez Ánimas de Cripta. Rezan al revés.', 'Las oigo callarse.'),
  M('monja2', 'monja', 'Filos en la oscuridad', 24, { tipo: 'matar', mon: 'degollador', n: 10 }, { exp: 9500, oro: 1300, items: [{ b: 'abismo', c: 1 }] },
    'Diez Degolladores. No te des vuelta.', 'Seguís con la garganta entera.', 'monja1'),
  M('monja3', 'monja', 'El sello', 30, { tipo: 'jefe', mon: 'archimago' }, { exp: 30000, oro: 4000, equipo: { exc: 0.8, leg: 0.25, mit: 0.03 }, items: [{ b: 'abismo', c: 2 }, { b: 'guardiana', c: 1 }] },
    'El Archimago rompió los sellos desde adentro. Cerralos con él adentro.', 'El sello vuelve a estar puesto.', 'monja2'),
  M('deser1', 'desertor', 'Carne que camina', 28, { tipo: 'matar', mon: 'bruto', n: 10 }, { exp: 12000, oro: 1600, items: [{ b: 'abismo', c: 1 }] },
    'Diez Brutos Cenagosos. Yo no pude.', 'Vos sí pudiste.'),
  M('deser2', 'desertor', 'El olor', 32, { tipo: 'matar', mon: 'acechador', n: 10 }, { exp: 15000, oro: 2000, items: [{ b: 'guardiana', c: 1 }] },
    'Diez Acechadores. Te van a oler antes de que los veas.', 'Ahora me toca volver a la guardia.', 'deser1'),
  M('peni1', 'penitente', 'Hijos del Foso', 38, { tipo: 'matar', mon: 'engendro', n: 12 }, { exp: 25000, oro: 3000, items: [{ b: 'abismo', c: 2 }] },
    'Doce Engendros del Éter. Yo los dejé salir.', 'Doce menos en mi cuenta.'),
  M('peni2', 'penitente', 'Lo que hay abajo', 43, { tipo: 'jefe', mon: 'bestia' }, { exp: 60000, oro: 8000, equipo: { exc: 0.8, leg: 0.3, mit: 0.05 }, items: [{ b: 'abismo', c: 3 }] },
    'La Bestia del Foso. No hay nada más grande que eso. Creo.', 'Me equivoqué. Hay algo más grande.', 'peni1'),
  M('peni3', 'penitente', 'El Heraldo', 45, { tipo: 'jefe', mon: 'heraldo' }, { exp: 100000, oro: 15000, equipo: { exc: 1, leg: 0.4, mit: 0.1 }, items: [{ b: 'guardiana', c: 2 }] },
    'El Heraldo del Éter llega con la Noche Roja. Esperalo con todo tu grupo.', 'Ahora sí. Perdón aceptado, o eso quiero creer.', 'peni2'),
  M('nau1', 'naufrago', 'Los que caminan', 46, { tipo: 'matar', mon: 'ahogado', n: 15 }, { exp: 60000, oro: 9000, items: [{ b: 'abismo', c: 2 }] },
    'Quince Ahogados. Eran mis compañeros. Hacelo rápido.', 'Que el mar se los quede esta vez.'),
  M('nau2', 'naufrago', 'La Reina de la marea', 55, { tipo: 'jefe', mon: 'reinaahogada' }, { exp: 150000, oro: 20000, equipo: { exc: 1, leg: 0.4, mit: 0.08 }, items: [{ b: 'guardiana', c: 2 }] },
    'La Reina Ahogada se tragó la flota. Abrile la panza.', 'Ahí estaban. Gracias.', 'nau1'),
  M('far1', 'farera', 'Aceite de faro', 54, { tipo: 'juntar', mon: 'farero', cosa: 'Aceite de faro', prob: 0.4, n: 8 }, { exp: 80000, oro: 12000, items: [{ b: 'abismo', c: 2 }] },
    'Los Fareros todavía llevan aceite. Traeme ocho frascos.', 'Con esto el faro aguanta una noche.'),
  M('far2', 'farera', 'Sin rostro', 64, { tipo: 'jefe', mon: 'capitan' }, { exp: 200000, oro: 30000, equipo: { exc: 1, leg: 0.5, mit: 0.1 }, items: [{ b: 'abismo', c: 3 }] },
    'El Capitán sin Rostro manda a los piratas. Mientras él viva, el faro no prende.', 'El faro prende. Mirá.', 'far1'),
  M('ult1', 'ultimo', 'Crías', 62, { tipo: 'matar', mon: 'leviatanmenor', n: 12 }, { exp: 120000, oro: 16000, items: [{ b: 'guardiana', c: 1 }, { b: 'abismo', c: 2 }] },
    'Doce Leviatanes Menores. Si crecen, no hay isla que aguante.', 'Doce menos. La madre se va a enojar.'),
  M('ult2', 'ultimo', 'Lo que respira abajo', 72, { tipo: 'jefe', mon: 'leviatan' }, { exp: 400000, oro: 60000, equipo: { exc: 1, leg: 0.6, mit: 0.15 }, items: [{ b: 'guardiana', c: 3 }] },
    'El Leviatán salió de la Fosa. Juntá a los mejores que conozcas.', 'Volvió a dormir. O se murió. Con estas cosas nunca se sabe.', 'ult1'),
  // ----- Yermo Calcinado -----
  M('fun1', 'fundidor', 'Ceniza que camina', 78, { tipo: 'matar', mon: 'calcinado', n: 20 }, { exp: 300000, oro: 50000, items: [{ b: 'abismo', c: 3 }] },
    'Veinte Calcinados. Eran mis aprendices. Que descansen de una vez.', 'Veinte. Uno por cada martillazo que les enseñé.'),
  M('fun2', 'fundidor', 'Metal con odio', 98, { tipo: 'juntar', mon: 'coloso', cosa: 'Escoria viva', prob: 0.35, n: 10 }, { exp: 700000, oro: 120000, equipo: { exc: 1, leg: 0.4, mit: 0.06 } },
    'Los Colosos tienen escoria viva adentro. Traeme diez pedazos y te hago algo que valga.', 'Todavía late. Perfecto.', 'fun1'),
  M('fun3', 'fundidor', 'El que se comió el volcán', 108, { tipo: 'jefe', mon: 'grandevorador' }, { exp: 1600000, oro: 300000, equipo: { exc: 1, leg: 0.7, mit: 0.18 }, items: [{ b: 'guardiana', c: 3 }] },
    'El Gran Devorador duerme en la Boca del Volcán. Despertalo. Con muchos.', 'El volcán está en silencio. Primera vez en mi vida.', 'fun2'),
  M('que1', 'quemada', 'Perros', 82, { tipo: 'matar', mon: 'perrobrasa', n: 20 }, { exp: 400000, oro: 60000, items: [{ b: 'abismo', c: 3 }] },
    'Los Perros de Brasa me dejaron así. Veinte, por cada cicatriz.', 'Ya no me duele tanto. Mentira, me duele igual.'),
  M('que2', 'quemada', 'El trono caliente', 104, { tipo: 'jefe', mon: 'senorbrasas' }, { exp: 1200000, oro: 200000, equipo: { exc: 1, leg: 0.6, mit: 0.12 } },
    'El Señor de las Brasas se sentó en el Trono del Foso. Bajalo.', 'Ahora el trono está frío. Me siento ahí un rato.', 'que1'),
  // ----- Ciudad del Trono Hundido -----
  M('esc1', 'escudero', 'La guardia eterna', 114, { tipo: 'matar', mon: 'guardiareal', n: 25 }, { exp: 1400000, oro: 250000, items: [{ b: 'abismo', c: 4 }] },
    'Veinticinco Guardias Reales. Eran mis compañeros de ronda. Liberalos.', 'Que la ronda termine.'),
  M('esc2', 'escudero', 'Armadura vacía', 136, { tipo: 'matar', mon: 'caballerohueco', n: 15 }, { exp: 2600000, oro: 450000, equipo: { exc: 1, leg: 0.5, mit: 0.1 } },
    'Los Caballeros Huecos eran los mejores del reino. Ahora son lata. Quince.', 'Lata vacía. Como el reino.', 'esc1'),
  M('esc3', 'escudero', 'El rey ha muerto', 150, { tipo: 'jefe', mon: 'ultimorey' }, { exp: 6000000, oro: 1000000, equipo: { exc: 1, leg: 1, mit: 0.3 }, items: [{ b: 'guardiana', c: 5 }] },
    'El Último Rey sigue sentado en la Sala del Trono. Alguien tiene que decirle que se terminó.', 'Se lo dijiste. Por fin. Larga vida a nadie.', 'esc2'),
  M('buf1', 'bufon', 'Ríanse', 120, { tipo: 'matar', mon: 'espectrocorte', n: 20 }, { exp: 1600000, oro: 280000, items: [{ b: 'abismo', c: 4 }] },
    'Los Espectros de la Corte no se ríen de mis chistes. Veinte, para que aprendan.', 'Silencio. Mejor público que antes.'),
  M('buf2', 'bufon', 'La reina no se ríe', 138, { tipo: 'jefe', mon: 'reinahueca' }, { exp: 3400000, oro: 600000, equipo: { exc: 1, leg: 0.8, mit: 0.2 } },
    'La Reina Hueca nunca se rió. Ni una vez en cien años. Andá a verla.', 'Ahora tampoco se ríe. Pero por otro motivo.', 'buf1'),
  // ----- Glaciar del Silencio -----
  M('car1', 'cartografa', 'Pasos grandes', 158, { tipo: 'matar', mon: 'yeti', n: 20 }, { exp: 3000000, oro: 700000, items: [{ b: 'abismo', c: 4 }] },
    'Veinte Yetis. No puedo dibujar con ellos respirándome en la nuca.', 'Ahora sí se oye el lápiz.'),
  M('car2', 'cartografa', 'Máscaras bajo el hielo', 172, { tipo: 'juntar', mon: 'mascarahielo', cosa: 'Astilla de máscara', prob: 0.4, n: 10 }, { exp: 4800000, oro: 1000000, equipo: { exc: 1, leg: 0.5, mit: 0.1 } },
    'Traeme diez astillas de Máscara de Escarcha. Quiero saber qué cara escondían.', 'Ninguna. Eso es lo que me asusta.', 'car1'),
  M('car3', 'cartografa', 'El que no duerme', 188, { tipo: 'jefe', mon: 'padrenieve' }, { exp: 9000000, oro: 2000000, equipo: { exc: 1, leg: 0.8, mit: 0.25 }, items: [{ b: 'guardiana', c: 5 }] },
    'El Padre de las Nieves está en su cueva. Llevá a todos los que conozcas.', 'Terminé el mapa. Le faltaba este agujero.', 'car2'),
  M('mon1', 'montanes', 'Los que bajaron', 166, { tipo: 'matar', mon: 'palido', n: 20 }, { exp: 3800000, oro: 800000, items: [{ b: 'abismo', c: 4 }] },
    'Veinte Cazadores Pálidos. Bajaron del cielo y se quedaron con mi aldea.', 'Mi aldea sigue vacía, pero ahora es mía.'),
  M('mon2', 'montanes', 'Tres ojos', 182, { tipo: 'matar', mon: 'ojohelado', n: 18 }, { exp: 5500000, oro: 1200000, items: [{ b: 'guardiana', c: 3 }] },
    'Dieciocho Ojos del Deshielo. Me miran mientras duermo.', 'Hoy voy a dormir. Creo.', 'mon1'),
  M('mon3', 'montanes', 'Cae el frío', 200, { tipo: 'jefe', mon: 'reinabuitres' }, { exp: 12000000, oro: 3000000, equipo: { exc: 1, leg: 1, mit: 0.3 }, items: [{ b: 'guardiana', c: 6 }] },
    'La Emperatriz del Deshielo manda en todo esto. Abrile la puerta al calor.', 'Mirá, gotea. Hace mil años que no goteaba.', 'mon2'),
  // ----- Cráter del Dragón -----
  M('dom1', 'domador', 'Hambre chica', 205, { tipo: 'matar', mon: 'draguito', n: 25 }, { exp: 8000000, oro: 2000000, items: [{ b: 'guardiana', c: 4 }] },
    'Veinticinco Crías de Dragón. Si crecen, no queda nadie.', 'Duele. Yo les ponía nombre.'),
  M('dom2', 'domador', 'Sigue subiendo', 224, { tipo: 'matar', mon: 'simio', n: 22 }, { exp: 12000000, oro: 3000000, equipo: { exc: 1, leg: 0.8, mit: 0.2 } },
    'Veintidós Simios del Cráter. Les robaron el fuego a mis dragones.', 'El fuego volvió a quien le corresponde. Lástima.', 'dom1'),
  M('dom3', 'domador', 'El rey que crece', 240, { tipo: 'jefe', mon: 'reymicelio' }, { exp: 20000000, oro: 5000000, equipo: { exc: 1, leg: 1, mit: 0.4 }, items: [{ b: 'guardiana', c: 8 }] },
    'El Rey del Micelio se está comiendo a los dragones muertos. Y a los vivos.', 'Queda el olor. Va a quedar siempre.', 'dom2'),
  M('cro1', 'cronista', 'Página quemada', 214, { tipo: 'juntar', mon: 'saurio', cosa: 'Hoja de ceniza', prob: 0.4, n: 12 }, { exp: 10000000, oro: 2500000, items: [{ b: 'guardiana', c: 4 }] },
    'Los Saurios se comieron mi crónica. Traeme doce hojas, aunque estén quemadas.', 'Se lee poco. Se lee suficiente.'),
  M('cro2', 'cronista', 'Sus hijos', 248, { tipo: 'matar', mon: 'dragonjoven', n: 15 }, { exp: 16000000, oro: 4000000, equipo: { exc: 1, leg: 1, mit: 0.3 } },
    'Quince Dragones Jóvenes. El viejo tiene que sentir que le faltan.', 'Ya se despertó. Sentiste el temblor.', 'cro1'),
  M('cro3', 'cronista', 'El que encendió el Sol', 265, { tipo: 'jefe', mon: 'dragonprimordial' }, { exp: 40000000, oro: 10000000, equipo: { exc: 1, leg: 1, mit: 0.6 }, items: [{ b: 'guardiana', c: 10 }] },
    'El Dragón Primordial encendió el Sol Hondo y lo apagó. Acá termina la crónica.', 'Escribí tu nombre al final. Nadie va a leerlo. Igual lo escribí.', 'cro2'),
].map(m => [m.id, m]));

export function misionesDe(npc) { return Object.values(MISIONES).filter(m => m.npc === npc); }

// ¿Qué tiene para ofrecer un NPC a este personaje? 'nueva' | 'lista' (para entregar) | 'curso' | null
export function estadoNpc(d, npc) {
  const ms = d.misiones || {};
  for (const m of misionesDe(npc)) {
    const a = ms.activas?.[m.id];
    if (a && completa(m, a)) return 'lista';
  }
  for (const m of misionesDe(npc)) if (ms.activas?.[m.id]) return 'curso';
  for (const m of misionesDe(npc)) if (disponible(d, m)) return 'nueva';
  return null;
}
export function disponible(d, m) {
  const ms = d.misiones || {};
  return !ms.hechas?.includes(m.id) && !ms.activas?.[m.id] && d.nivel >= m.nivel && (!m.req || ms.hechas?.includes(m.req));
}
export const completa = (m, prog) => m.obj.tipo === 'jefe' || m.obj.tipo === 'visitar' ? prog >= 1 : prog >= m.obj.n;
export function textoObjetivo(m, prog = 0) {
  const o = m.obj, mon = MONSTRUOS[o.mon]?.nombre;
  if (o.tipo === 'matar') return `${mon}: ${Math.min(prog, o.n)}/${o.n}`;
  if (o.tipo === 'jefe') return `Vencer a ${mon}${prog ? ' ✓' : ''}`;
  if (o.tipo === 'juntar') return `${o.cosa} (de ${mon}): ${Math.min(prog, o.n)}/${o.n}`;
  if (o.tipo === 'visitar') return `Llegar a ${o.lugar}${prog ? ' ✓' : ''}`;
  return '';
}

// ---------- Tablón de Encargos (uno por atalaya, sin fin) ----------
const LOCALES = [['rata', 'sapo', 'arana', 'avispon', 'sierpe'], ['sierpe', 'lobo', 'ciervo', 'avispon', 'arana'], ['huesudo', 'anima', 'degollador', 'ciervo'],
  ['bruto', 'acechador', 'degollador', 'anima'], ['engendro', 'acechador', 'bruto'], ['ahogado', 'marinero', 'abisal', 'farero', 'pirata', 'brutosal', 'leviatanmenor'],
  ['calcinado', 'perrobrasa', 'tejedoraceniza', 'diablo', 'devorador', 'coloso', 'sacerdoteazufre'], ['guardiareal', 'espectrocorte', 'sabueso', 'verdugo', 'gargola', 'caballerohueco', 'arzobispo'],
  ['yeti', 'palido', 'mascarahielo', 'ojohelado', 'buitrerey'], ['draguito', 'saurio', 'simio', 'micelio', 'dragonjoven']];
export function nuevoEncargo(atalaya, nivelPj, rnd = Math.random) {
  const lista = LOCALES[atalaya] || LOCALES[0];
  const posibles = lista.filter(t => MONSTRUOS[t].nivel <= nivelPj + 6);
  const mon = (posibles.length ? posibles : lista)[Math.floor(rnd() * (posibles.length || lista.length))];
  const def = MONSTRUOS[mon], n = 15 + Math.floor(rnd() * 11);
  return { atalaya, mon, n, prog: 0, exp: Math.round(def.exp * n * 0.6), oro: Math.round(def.nivel * n * 4), gema: rnd() < 0.5 };
}
export const NOMBRE_ATALAYA = i => PUEBLOS[i]?.nombre;
