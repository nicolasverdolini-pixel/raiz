// Datos iniciales y tablas fijas del juego. Ver REGLAS.md.

const DIFICULTAD = [
  { valor: 10, nombre: 'Fácil' },
  { valor: 20, nombre: 'Media' },
  { valor: 40, nombre: 'Difícil' },
  { valor: 100, nombre: 'Épica' },
];

const TIPOS = {
  raiz: { nombre: 'Raíces', singular: 'Raíz', ayuda: 'Diarias. Las únicas que penalizan.' },
  rama: { nombre: 'Ramas', singular: 'Rama', ayuda: 'Semanales, con una meta de veces.' },
  hoja: { nombre: 'Hojas', singular: 'Hoja', ayuda: 'Opcionales. Savia extra.' },
  fruto: { nombre: 'Frutos', singular: 'Fruto', ayuda: 'Desafíos únicos.' },
};

const ETAPAS = [
  { desde: 1, nombre: 'Semilla' },
  { desde: 5, nombre: 'Brote' },
  { desde: 10, nombre: 'Plantín' },
  { desde: 15, nombre: 'Arbusto joven' },
  { desde: 20, nombre: 'Árbol en flor' },
  { desde: 30, nombre: 'Árbol con frutos' },
  { desde: 40, nombre: 'Árbol antiguo' },
  { desde: 50, nombre: 'Bosque' },
];

const AREAS_INICIALES = [
  { id: 'cuerpo', nombre: 'Cuerpo' },
  { id: 'cuerpo/fuerza', nombre: 'Fuerza' },
  { id: 'cuerpo/movimiento', nombre: 'Movimiento' },
  { id: 'cuerpo/salud', nombre: 'Salud' },
  { id: 'cuerpo/salud/bucal', nombre: 'Bucal' },
  { id: 'cuerpo/salud/piel', nombre: 'Piel' },
  { id: 'cuerpo/salud/pies', nombre: 'Pies' },
  { id: 'cuerpo/salud/sueno', nombre: 'Sueño' },
  { id: 'cuerpo/alimentacion', nombre: 'Alimentación' },
  { id: 'mente', nombre: 'Mente' },
  { id: 'mente/lectura', nombre: 'Lectura' },
  { id: 'mente/aprendizaje', nombre: 'Aprendizaje' },
  { id: 'mente/calma', nombre: 'Calma' },
  { id: 'mente/creatividad', nombre: 'Creatividad' },
  { id: 'casa', nombre: 'Casa' },
  { id: 'casa/orden', nombre: 'Orden y limpieza' },
  { id: 'casa/mantenimiento', nombre: 'Mantenimiento' },
  { id: 'casa/mejoras', nombre: 'Mejoras' },
  { id: 'trabajo', nombre: 'Trabajo y plata' },
  { id: 'trabajo/foco', nombre: 'Foco' },
  { id: 'trabajo/finanzas', nombre: 'Finanzas' },
  { id: 'trabajo/crecimiento', nombre: 'Crecimiento' },
  { id: 'vinculos', nombre: 'Vínculos' },
  { id: 'vinculos/pareja', nombre: 'Pareja' },
  { id: 'vinculos/familia', nombre: 'Familia' },
  { id: 'vinculos/amigos', nombre: 'Amigos' },
];

const MISIONES_INICIALES = [
  { id: 'caminar', titulo: 'Caminar 10 minutos', tipo: 'raiz', area: 'cuerpo/movimiento', savia: 10 },
  { id: 'leer', titulo: 'Leer 5 páginas', tipo: 'raiz', area: 'mente/lectura', savia: 10 },
  {
    id: 'casa', titulo: 'Una tarea de la casa', tipo: 'raiz', area: 'casa/orden', savia: 10,
    opciones: ['Lavar los platos', 'Barrer', 'Pasar el trapo', 'Tender la cama', 'Lavar o colgar ropa', 'Sacar la basura', 'Limpiar el baño', 'Ordenar 5 minutos'],
  },
  { id: 'hilo', titulo: 'Hilo dental', tipo: 'hoja', area: 'cuerpo/salud/bucal', savia: 10 },
  { id: 'sentadillas', titulo: '10 sentadillas', tipo: 'hoja', area: 'cuerpo/fuerza', savia: 10 },
  { id: 'respirar', titulo: '3 minutos de respiración', tipo: 'hoja', area: 'mente/calma', savia: 10 },
  { id: 'gastos', titulo: 'Anotar los gastos del día', tipo: 'hoja', area: 'trabajo/finanzas', savia: 10 },
  { id: 'mensaje', titulo: 'Mensaje a alguien querido', tipo: 'hoja', area: 'vinculos/amigos', savia: 10 },
  { id: 'entreno', titulo: 'Entrenar', tipo: 'rama', area: 'cuerpo/fuerza', savia: 40, meta: 3, nota: 'Gimnasio, yoga, correr…' },
  { id: 'plan-anto', titulo: 'Plan con Anto', tipo: 'rama', area: 'vinculos/pareja', savia: 20, meta: 1, nota: 'Una salida, una cena, algo juntos' },
  { id: 'placard', titulo: 'Ordenar el placard', tipo: 'fruto', area: 'casa/orden', savia: 100 },
];

const PREMIOS_INICIALES = [
  { id: 'series', titulo: 'Tarde de series sin culpa', costo: 50 },
  { id: 'antojo', titulo: 'Un antojo rico', costo: 80 },
  { id: 'cena', titulo: 'Cena afuera', costo: 400 },
];

// Herbario: cada logro es una planta. `forma` elige el dibujo.
const LOGROS = [
  { id: 'primera', planta: 'Trébol', texto: 'Tu primera misión cumplida', forma: 'trebol' },
  { id: 'dia', planta: 'Margarita', texto: 'Primer día con todas las raíces', forma: 'flor' },
  { id: 'extra', planta: 'Romero', texto: '3 opciones de una misión en un día', forma: 'rama' },
  { id: 'racha7', planta: 'Lavanda', texto: 'Racha de 7 días', forma: 'espiga' },
  { id: 'rescate', planta: 'Diente de león', texto: 'Completaste un rescate', forma: 'diente' },
  { id: 'fruto', planta: 'Limonero', texto: 'Tu primer fruto', forma: 'fruto' },
  { id: 'nivel5', planta: 'Brote de roble', texto: 'Llegaste a Brote', forma: 'brote' },
  { id: 'racha30', planta: 'Olivo', texto: 'Racha de 30 días', forma: 'rama' },
  { id: 'nivel10', planta: 'Helecho', texto: 'Llegaste a Plantín', forma: 'helecho' },
  { id: 'cien', planta: 'Hiedra', texto: '100 misiones cumplidas', forma: 'trebol' },
  { id: 'racha66', planta: 'Ceibo', texto: 'Racha de 66 días: hábito formado', forma: 'flor' },
  { id: 'nivel20', planta: 'Jacarandá', texto: 'Llegaste a Árbol en flor', forma: 'flor' },
  { id: 'escalon', planta: 'Bambú', texto: 'Subiste de nivel una misión', forma: 'espiga' },
  { id: 'sorpresa5', planta: 'Girasol', texto: '5 misiones sorpresa', forma: 'flor' },
  { id: 'desafio', planta: 'Ombú', texto: 'Completaste un desafío semanal', forma: 'brote' },
];

// Especies de árbol: tu "personaje". Cambian forma, colores, flores y frutos.
const ESPECIES = [
  {
    id: 'roble', nombre: 'Roble', rasgo: 'Fuerza y constancia',
    texto: 'Crece despacio y no lo tumba nadie. Para los que construyen de a poco.',
    hojas: ['#5c7a4a', '#7c9a62', '#9db67f'], flor: '#f3e6c8', centro: '#c9a96e', fruto: '#8a6a45', forma: 'redonda',
  },
  {
    id: 'ceibo', nombre: 'Ceibo', rasgo: 'Coraje',
    texto: 'La flor nacional. Florece rojo intenso incluso a la orilla del río crecido.',
    hojas: ['#4f7a44', '#6e9a58', '#8fb874'], flor: '#c8372d', centro: '#f0c27a', fruto: '#7a5a3a', forma: 'redonda', tronco: '#7b5a3c',
  },
  {
    id: 'jacaranda', nombre: 'Jacarandá', rasgo: 'Creatividad',
    texto: 'En primavera se vuelve violeta y cambia el color de toda la calle.',
    hojas: ['#5f8a55', '#7ea86a', '#a6c48c'], hojasFlor: ['#6f6aa8', '#8f86c4', '#b3a9dc'], flor: '#c9bff0', centro: '#6f6aa8', fruto: '#8a6a45', forma: 'ancha',
  },
  {
    id: 'olivo', nombre: 'Olivo', rasgo: 'Paciencia y paz',
    texto: 'Vive cientos de años. No tiene apuro y siempre da frutos.',
    hojas: ['#6f7f62', '#8e9c7e', '#b2bda2'], flor: '#efeadc', centro: '#c9a96e', fruto: '#3f4a2c', forma: 'ancha', tronco: '#7d6b55',
  },
  {
    id: 'pino', nombre: 'Pino', rasgo: 'Resistencia',
    texto: 'Verde todo el año, aunque nieve. Para los que no aflojan.',
    hojas: ['#2f5a3c', '#3f6e4a', '#5b8a62'], flor: null, fruto: '#8a5a32', forma: 'conica', tronco: '#6e4f35',
  },
  {
    id: 'cerezo', nombre: 'Cerezo', rasgo: 'Disfrutar el presente',
    texto: 'Su flor dura poco y por eso se celebra. Para los que saben frenar y mirar.',
    hojas: ['#5c7a4a', '#7c9a62', '#9db67f'], hojasFlor: ['#d48ea0', '#e6aebb', '#f4cfd7'], flor: '#fbe3e8', centro: '#d48ea0', fruto: '#a3203a', forma: 'redonda',
  },
];

// Ideas para las primeras raíces (en la introducción elegís de 1 a 5).
const RAICES_SUGERIDAS = [
  { id: 'caminar', titulo: 'Caminar 10 minutos', area: 'cuerpo/movimiento' },
  { id: 'leer', titulo: 'Leer 5 páginas', area: 'mente/lectura' },
  { id: 'casa', titulo: 'Una tarea de la casa', area: 'casa/orden' },
  { id: 'hilo', titulo: 'Hilo dental', area: 'cuerpo/salud/bucal' },
  { id: 'agua', titulo: 'Dos vasos de agua al despertar', area: 'cuerpo/alimentacion' },
  { id: 'estirar', titulo: '5 minutos de estiramiento', area: 'cuerpo/movimiento' },
  { id: 'respirar', titulo: '3 minutos de respiración', area: 'mente/calma' },
  { id: 'dormir', titulo: 'Acostarme antes de las 00', area: 'cuerpo/salud/sueno' },
];
