// El acompañante: frases para cada momento. Tono de compañero, nunca de juez.

const FRASES = {
  manana: [
    'Las raíces crecen en silencio. Lo de hoy también cuenta.',
    'No hace falta un gran día. Alcanza con uno honesto.',
    'Un poco cada día es muchísimo al final del año.',
    'Hoy no tenés que ser perfecto, solo tenés que aparecer.',
    'El árbol no se apura, y aun así llega.',
    'Elegí una cosa y hacela bien. Después, la siguiente.',
    'Lo que regás todos los días, crece.',
    'Empezá por la más chica. El impulso viene solo.',
    'Tu yo de dentro de un año te está mirando con cariño.',
    'Hay días de sol y días de lluvia. Los dos hacen crecer.',
  ],
  cumplir: [
    'Una gota más de savia.',
    'Eso suma, y suma de verdad.',
    'Bien ahí.',
    'Tu árbol lo nota.',
    'Uno menos. Seguí así.',
    'Hecho. Así se construye.',
    'Otra raíz que se afirma.',
  ],
  extra: [
    'Bonus: hiciste más de lo que pedía el día.',
    'De yapa. El árbol agradece.',
    'Más allá de lo necesario. Eso es crecer.',
  ],
  diaCompleto: [
    'Todas las raíces regadas. Día redondo.',
    'Hoy cumpliste con vos. Descansá tranquilo.',
    'Día completo. Así, de a uno, se hace un bosque.',
    'Lo hiciste. Mañana, otra vez.',
  ],
  fallo: [
    'Ayer no salió. Las raíces siguen ahí.',
    'Un mal día no borra todo lo que creciste.',
    'Caerse es parte. Volver es lo que importa.',
    'Perdiste algunas hojas, no el árbol.',
    'Hoy es otra oportunidad, y es tuya.',
  ],
  rescate: [
    'Rescate cumplido. La racha vuelve a ser tuya.',
    'Te levantaste. Eso vale más que no haberte caído.',
  ],
  regreso: [
    'Qué bueno verte de vuelta. El árbol te esperó.',
    'Volviste, y eso es lo más difícil. Arranquemos suave.',
  ],
  nivel: [
    'Subiste de nivel. Se nota el trabajo.',
    'Un anillo más en el tronco.',
    'Nuevo nivel. Mirá todo lo que ya hiciste.',
  ],
  etapa: [
    'Tu árbol cambió de forma. Vos también.',
    'Nueva etapa. Lo que era semilla ahora tiene vida propia.',
  ],
  racha: [
    'Una semana entera. Esto ya es un hábito en camino.',
    'La constancia te queda bien.',
  ],
  lluvia: [
    'Día de lluvia. Descansar también es parte de crecer.',
  ],
  invierno: [
    'Modo invierno. El árbol descansa, nada se pierde.',
  ],
  otono: [
    'Llegó el otoño: el árbol soltó hojas para volver a brotar. Esta semana vamos más suave.',
  ],
};

function frase(momento, semilla) {
  const lista = FRASES[momento] || FRASES.cumplir;
  const i = semilla == null ? Math.floor(Math.random() * lista.length) : Math.abs(semilla) % lista.length;
  return lista[i];
}
