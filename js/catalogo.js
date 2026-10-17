// Catálogo de misiones, misiones sorpresa y desafíos semanales.
//
// Cada misión del catálogo tiene una "escalera" de pasos: cuando sostenés un paso,
// la app te propone el siguiente (más difícil y con más savia).
// nivel: nivel mínimo para que se desbloquee. s: savia del primer paso.

const cm = (id, area, tipo, nivel, s, pasos, extra = {}) => ({ id, area, tipo, nivel, s, pasos: [].concat(pasos), ...extra });

const CATALOGO = [
  // Cuerpo · Fuerza
  cm('sentadillas', 'cuerpo/fuerza', 'hoja', 1, 10, ['10 sentadillas', '20 sentadillas', '30 sentadillas', '50 sentadillas', '3 series de 30 sentadillas']),
  cm('flexiones', 'cuerpo/fuerza', 'hoja', 1, 10, ['5 flexiones', '10 flexiones', '20 flexiones', '30 flexiones', '50 flexiones']),
  cm('plancha', 'cuerpo/fuerza', 'hoja', 1, 10, ['Plancha 20 segundos', 'Plancha 40 segundos', 'Plancha 1 minuto', 'Plancha 90 segundos', 'Plancha 2 minutos']),
  cm('abdominales', 'cuerpo/fuerza', 'hoja', 1, 10, ['15 abdominales', '30 abdominales', '50 abdominales', '3 series de 30 abdominales']),
  cm('entreno', 'cuerpo/fuerza', 'rama', 1, 40, ['Entrenar 2 veces por semana', 'Entrenar 3 veces por semana', 'Entrenar 4 veces por semana', 'Entrenar 5 veces por semana'], { metas: [2, 3, 4, 5], nota: 'Gimnasio, yoga, correr…' }),
  cm('dominadas', 'cuerpo/fuerza', 'hoja', 10, 20, ['1 dominada', '3 dominadas', '5 dominadas', '8 dominadas', '10 dominadas']),

  // Cuerpo · Movimiento
  cm('caminar', 'cuerpo/movimiento', 'raiz', 1, 10, ['Caminar 10 minutos', 'Caminar 20 minutos', 'Caminar 30 minutos', 'Caminar 45 minutos', 'Caminar 1 hora']),
  cm('estirar', 'cuerpo/movimiento', 'hoja', 1, 10, ['5 minutos de estiramiento', '10 minutos de estiramiento', '15 minutos de estiramiento']),
  cm('pasos', 'cuerpo/movimiento', 'hoja', 5, 10, ['5.000 pasos', '7.500 pasos', '10.000 pasos', '12.000 pasos']),
  cm('escaleras', 'cuerpo/movimiento', 'hoja', 1, 10, ['Escaleras en vez de ascensor']),
  cm('yoga', 'cuerpo/movimiento', 'rama', 1, 20, ['Yoga 1 vez por semana', 'Yoga 2 veces por semana', 'Yoga 3 veces por semana'], { metas: [1, 2, 3] }),
  cm('correr', 'cuerpo/movimiento', 'rama', 10, 40, ['Correr 2 km', 'Correr 3 km', 'Correr 5 km', 'Correr 8 km', 'Correr 10 km'], { metas: [2, 2, 2, 2, 2] }),
  cm('bici', 'cuerpo/movimiento', 'rama', 5, 20, ['Bici 20 minutos', 'Bici 40 minutos', 'Bici 1 hora'], { metas: [2, 2, 2] }),
  cm('caminata-naturaleza', 'cuerpo/movimiento', 'fruto', 5, 100, ['Caminata de 2 horas en la naturaleza']),
  cm('carrera-10k', 'cuerpo/movimiento', 'fruto', 15, 100, ['Correr una carrera de 10 km']),

  // Cuerpo · Salud
  cm('agua', 'cuerpo/salud', 'hoja', 1, 10, ['Dos vasos de agua al despertar', '1 litro de agua en el día', '2 litros de agua en el día']),
  cm('sol', 'cuerpo/salud', 'hoja', 1, 10, ['10 minutos de sol a la mañana']),
  cm('chequeo', 'cuerpo/salud', 'fruto', 1, 100, ['Hacerme el chequeo médico anual']),
  cm('hilo', 'cuerpo/salud/bucal', 'hoja', 1, 10, ['Hilo dental', 'Hilo dental y enjuague']),
  cm('cepillado', 'cuerpo/salud/bucal', 'hoja', 1, 10, ['Cepillarme 2 minutos, mañana y noche']),
  cm('dentista', 'cuerpo/salud/bucal', 'fruto', 1, 100, ['Turno con el dentista']),
  cm('protector', 'cuerpo/salud/piel', 'hoja', 1, 10, ['Protector solar']),
  cm('skincare', 'cuerpo/salud/piel', 'hoja', 1, 10, ['Rutina de cuidado de la piel a la noche']),
  cm('pies-crema', 'cuerpo/salud/pies', 'hoja', 1, 10, ['Crema en los pies']),
  cm('pies-unas', 'cuerpo/salud/pies', 'rama', 1, 10, ['Cuidar las uñas de los pies'], { metas: [1] }),
  cm('zapatillas', 'cuerpo/salud/pies', 'fruto', 1, 40, ['Conseguir calzado cómodo para caminar']),
  cm('dormir', 'cuerpo/salud/sueno', 'hoja', 1, 10, ['Acostarme antes de las 00', 'Acostarme antes de las 23:30', 'Acostarme antes de las 23']),
  cm('sin-pantallas', 'cuerpo/salud/sueno', 'hoja', 1, 10, ['Sin pantallas 30 minutos antes de dormir', 'Sin pantallas 45 minutos antes de dormir', 'Sin pantallas 1 hora antes de dormir']),
  cm('alarma', 'cuerpo/salud/sueno', 'hoja', 5, 20, ['Levantarme sin posponer la alarma']),

  // Cuerpo · Alimentación
  cm('fruta', 'cuerpo/alimentacion', 'hoja', 1, 10, ['Comer 1 fruta', 'Comer 2 frutas', 'Comer 3 frutas']),
  cm('verdura', 'cuerpo/alimentacion', 'hoja', 1, 10, ['Verdura en el almuerzo', 'Verdura en almuerzo y cena']),
  cm('sin-gaseosa', 'cuerpo/alimentacion', 'hoja', 1, 10, ['Un día sin gaseosa']),
  cm('sin-chatarra', 'cuerpo/alimentacion', 'hoja', 5, 20, ['Un día sin comida chatarra']),
  cm('cocinar', 'cuerpo/alimentacion', 'rama', 1, 20, ['Cocinar en casa 2 veces', 'Cocinar en casa 3 veces', 'Cocinar en casa 5 veces'], { metas: [2, 3, 5] }),
  cm('receta', 'cuerpo/alimentacion', 'fruto', 1, 40, ['Probar una receta nueva y sana']),

  // Mente · Lectura
  cm('leer', 'mente/lectura', 'raiz', 1, 10, ['Leer 5 páginas', 'Leer 10 páginas', 'Leer 15 páginas', 'Leer 20 páginas', 'Leer 30 páginas']),
  cm('leer-noche', 'mente/lectura', 'hoja', 1, 10, ['Leer 10 minutos antes de dormir', 'Leer 20 minutos antes de dormir']),
  cm('terminar-libro', 'mente/lectura', 'fruto', 1, 100, ['Terminar un libro']),

  // Mente · Aprendizaje
  cm('idioma', 'mente/aprendizaje', 'hoja', 1, 10, ['Idioma 5 minutos', 'Idioma 10 minutos', 'Idioma 20 minutos', 'Idioma 30 minutos']),
  cm('clase', 'mente/aprendizaje', 'rama', 1, 20, ['Ver una clase o curso por semana', 'Ver 2 clases por semana', 'Ver 3 clases por semana'], { metas: [1, 2, 3] }),
  cm('contar', 'mente/aprendizaje', 'hoja', 5, 20, ['Aprender algo nuevo y contárselo a alguien']),
  cm('curso', 'mente/aprendizaje', 'fruto', 10, 100, ['Terminar un curso online']),

  // Mente · Calma
  cm('respirar', 'mente/calma', 'hoja', 1, 10, ['3 minutos de respiración', '5 minutos de meditación', '10 minutos de meditación', '15 minutos de meditación', '20 minutos de meditación']),
  cm('agradecer', 'mente/calma', 'hoja', 1, 10, ['Anotar 3 cosas que agradezco']),
  cm('diario', 'mente/calma', 'hoja', 1, 10, ['Escribir cómo me siento', 'Escribir una página de diario']),
  cm('sin-celu', 'mente/calma', 'hoja', 5, 20, ['1 hora sin celular', '2 horas sin celular', 'Una tarde sin celular']),

  // Mente · Creatividad
  cm('dibujar', 'mente/creatividad', 'hoja', 1, 10, ['Dibujar 10 minutos', 'Dibujar 20 minutos']),
  cm('escribir', 'mente/creatividad', 'hoja', 5, 20, ['Escribir 200 palabras', 'Escribir 500 palabras', 'Escribir 1000 palabras']),
  cm('instrumento', 'mente/creatividad', 'hoja', 1, 10, ['Tocar un instrumento 15 minutos', 'Tocar un instrumento 30 minutos']),
  cm('foto', 'mente/creatividad', 'hoja', 1, 10, ['Sacar una foto linda']),
  cm('proyecto-creativo', 'mente/creatividad', 'fruto', 10, 100, ['Terminar un proyecto creativo']),

  // Casa · Orden y limpieza
  cm('casa', 'casa/orden', 'raiz', 1, 10, ['Una tarea de la casa'], { opciones: ['Lavar los platos', 'Barrer', 'Pasar el trapo', 'Tender la cama', 'Lavar o colgar ropa', 'Sacar la basura', 'Limpiar el baño', 'Ordenar 5 minutos'] }),
  cm('cama', 'casa/orden', 'hoja', 1, 10, ['Tender la cama']),
  cm('ordenar', 'casa/orden', 'hoja', 1, 10, ['Ordenar 10 minutos', 'Ordenar 20 minutos']),
  cm('ropa', 'casa/orden', 'rama', 1, 20, ['Lavar la ropa'], { metas: [2] }),
  cm('limpieza-profunda', 'casa/orden', 'rama', 5, 40, ['Limpieza profunda de un ambiente'], { metas: [1] }),
  cm('heladera', 'casa/orden', 'rama', 5, 20, ['Ordenar la heladera'], { metas: [1] }),
  cm('placard', 'casa/orden', 'fruto', 1, 100, ['Ordenar el placard']),
  cm('escritorio', 'casa/orden', 'fruto', 1, 40, ['Ordenar el escritorio a fondo']),
  cm('donar', 'casa/orden', 'fruto', 1, 40, ['Donar ropa que no uso']),

  // Casa · Mantenimiento y mejoras
  cm('plantas', 'casa/mantenimiento', 'rama', 1, 10, ['Regar las plantas'], { metas: [2] }),
  cm('arreglar', 'casa/mantenimiento', 'fruto', 1, 40, ['Arreglar algo que está roto']),
  cm('filtros', 'casa/mantenimiento', 'fruto', 5, 40, ['Limpiar filtros (aire, aspiradora, extractor)']),
  cm('mejora', 'casa/mejoras', 'rama', 5, 40, ['Una mejora chica en casa'], { metas: [1] }),
  cm('rincon', 'casa/mejoras', 'fruto', 5, 100, ['Armar un rincón lindo en casa']),
  cm('pintar', 'casa/mejoras', 'fruto', 10, 100, ['Pintar una pared o un mueble']),

  // Trabajo y plata
  cm('foco', 'trabajo/foco', 'hoja', 1, 10, ['1 bloque de foco (25 min)', '2 bloques de foco', '3 bloques de foco', '4 bloques de foco']),
  cm('planificar', 'trabajo/foco', 'hoja', 1, 10, ['Planificar el día a la mañana']),
  cm('inbox', 'trabajo/foco', 'hoja', 5, 20, ['Bandeja de entrada en cero']),
  cm('sin-redes-trabajo', 'trabajo/foco', 'hoja', 10, 20, ['Sin redes en horario de trabajo']),
  cm('gastos', 'trabajo/finanzas', 'hoja', 1, 10, ['Anotar los gastos del día']),
  cm('presupuesto', 'trabajo/finanzas', 'rama', 1, 20, ['Revisar el presupuesto de la semana'], { metas: [1] }),
  cm('ahorrar', 'trabajo/finanzas', 'hoja', 5, 10, ['Ahorrar algo hoy']),
  cm('sin-gastos', 'trabajo/finanzas', 'hoja', 1, 10, ['Un día sin gastos innecesarios']),
  cm('suscripcion', 'trabajo/finanzas', 'fruto', 1, 40, ['Cancelar una suscripción que no uso']),
  cm('fondo', 'trabajo/finanzas', 'fruto', 15, 100, ['Armar un fondo de emergencia']),
  cm('proyecto', 'trabajo/crecimiento', 'hoja', 5, 20, ['30 minutos en un proyecto personal', '1 hora en un proyecto personal']),
  cm('rubro', 'trabajo/crecimiento', 'hoja', 1, 10, ['Leer 15 minutos sobre mi profesión']),
  cm('contacto', 'trabajo/crecimiento', 'rama', 10, 20, ['Contactar a alguien de mi rubro'], { metas: [1] }),
  cm('cv', 'trabajo/crecimiento', 'fruto', 5, 40, ['Actualizar el CV o LinkedIn']),

  // Vínculos
  cm('algo-lindo', 'vinculos/pareja', 'hoja', 1, 10, ['Decirle algo lindo a mi pareja']),
  cm('plan-pareja', 'vinculos/pareja', 'rama', 1, 20, ['Plan en pareja'], { metas: [1], nota: 'Una salida, una cena, algo juntos' }),
  cm('cena-sin-celu', 'vinculos/pareja', 'rama', 1, 20, ['Cena sin celulares'], { metas: [1] }),
  cm('yoga-pareja', 'vinculos/pareja', 'rama', 5, 40, ['Yoga en pareja'], { metas: [1] }),
  cm('escapada', 'vinculos/pareja', 'fruto', 10, 100, ['Escapada de fin de semana']),
  cm('llamar-familia', 'vinculos/familia', 'rama', 1, 20, ['Llamar a mi familia 1 vez por semana', 'Llamar a mi familia 2 veces por semana'], { metas: [1, 2] }),
  cm('visitar-familia', 'vinculos/familia', 'rama', 1, 40, ['Visitar a la familia'], { metas: [1] }),
  cm('almuerzo-familiar', 'vinculos/familia', 'fruto', 5, 100, ['Organizar un almuerzo familiar']),
  cm('mensaje', 'vinculos/amigos', 'hoja', 1, 10, ['Mensaje a alguien querido']),
  cm('ver-amigo', 'vinculos/amigos', 'rama', 1, 20, ['Ver a un amigo o amiga'], { metas: [1] }),
  cm('ayudar', 'vinculos/amigos', 'hoja', 5, 20, ['Ayudar a alguien']),
  cm('juntada', 'vinculos/amigos', 'fruto', 5, 100, ['Organizar una juntada']),
];

// Savia de un paso de la escalera: cada escalón vale un poco más.
const saviaPaso = (c, paso) => (c.tipo === 'fruto' ? c.s : Math.min(c.s + paso * 5, c.tipo === 'rama' ? 60 : 40));

// Una por día, distinta para cada persona.
const SORPRESAS = [
  ['Llamá a alguien que no ves hace mucho', 'vinculos/amigos'],
  ['Caminá 15 minutos sin auriculares', 'cuerpo/movimiento'],
  ['Cociná algo con verduras', 'cuerpo/alimentacion'],
  ['Ordená un cajón', 'casa/orden'],
  ['Mandale un mensaje de agradecimiento a alguien', 'vinculos/amigos'],
  ['Hacé 20 sentadillas ahora', 'cuerpo/fuerza'],
  ['Leé un artículo sobre algo que no conocés', 'mente/aprendizaje'],
  ['Salí a ver el atardecer', 'mente/calma'],
  ['Borrá 20 fotos que no necesitás', 'casa/orden'],
  ['Hacé algo amable por alguien que no conocés', 'vinculos/amigos'],
  ['Aprendé 5 palabras en otro idioma', 'mente/aprendizaje'],
  ['Desayuná sin el celular', 'mente/calma'],
  ['Mandale un audio a alguien mayor de tu familia', 'vinculos/familia'],
  ['Estirá 5 minutos', 'cuerpo/movimiento'],
  ['Dibujá algo, aunque sea un garabato', 'mente/creatividad'],
  ['Revisá una suscripción y decidí si la seguís pagando', 'trabajo/finanzas'],
  ['Cuidá una planta', 'casa/mantenimiento'],
  ['Subí escaleras en vez de usar el ascensor', 'cuerpo/movimiento'],
  ['Escribí 3 metas para este mes', 'trabajo/foco'],
  ['Escuchá un disco entero sin hacer otra cosa', 'mente/creatividad'],
  ['Anotá 5 cosas que te salieron bien esta semana', 'mente/calma'],
  ['Limpiá la pantalla del celu y de la compu', 'casa/orden'],
  ['Cociná para alguien', 'vinculos/familia'],
  ['Caminá descalzo un rato en el pasto', 'cuerpo/salud/pies'],
  ['Acostate 30 minutos antes que ayer', 'cuerpo/salud/sueno'],
  ['Prepará la ropa de mañana', 'casa/orden'],
  ['Arreglá para verte con alguien esta semana', 'vinculos/amigos'],
  ['Pasá 10 minutos al sol', 'cuerpo/salud'],
  ['Hacé 1 minuto de plancha', 'cuerpo/fuerza'],
  ['Comé una fruta que no comés hace mucho', 'cuerpo/alimentacion'],
  ['Ahorrá lo que gastarías en un café', 'trabajo/finanzas'],
  ['Tirá o regalá algo que ya no usás', 'casa/orden'],
  ['Contale a alguien algo que aprendiste', 'mente/aprendizaje'],
  ['Decile a tu pareja tres cosas que te gustan de su forma de ser', 'vinculos/pareja'],
  ['Tomá un vaso de agua ahora mismo', 'cuerpo/salud'],
];

// Uno por semana. meta: cuántos días de la semana hay que cumplirlo.
const DESAFIOS = [
  ['Sin redes en la cama', 'cuerpo/salud/sueno', 5],
  ['10.000 pasos', 'cuerpo/movimiento', 5],
  ['Leer 20 páginas', 'mente/lectura', 5],
  ['Comida casera', 'cuerpo/alimentacion', 4],
  ['Sin gaseosa ni alcohol', 'cuerpo/alimentacion', 5],
  ['Entrenar', 'cuerpo/fuerza', 3],
  ['Meditar 10 minutos', 'mente/calma', 5],
  ['Anotar todos los gastos', 'trabajo/finanzas', 5],
  ['Ver a alguien querido', 'vinculos/amigos', 2],
  ['Tender la cama apenas te levantás', 'casa/orden', 5],
  ['Acostarte antes de las 23:30', 'cuerpo/salud/sueno', 4],
  ['Escribir 3 agradecimientos', 'mente/calma', 5],
  ['Ordenar a fondo un ambiente', 'casa/orden', 3],
  ['Practicar un idioma', 'mente/aprendizaje', 5],
  ['2 litros de agua', 'cuerpo/salud', 4],
  ['Una hora sin celular', 'mente/calma', 5],
];
