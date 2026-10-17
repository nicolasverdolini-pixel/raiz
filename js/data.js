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
];
