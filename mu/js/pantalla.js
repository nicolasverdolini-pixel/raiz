// Tamaño real del lienzo. En el iPhone, innerHeight queda mal después de girar el celu con el juego instalado en la pantalla de inicio.
const lienzo = () => document.getElementById('mundo');
export const anchoP = () => lienzo()?.clientWidth || innerWidth;
export const altoP = () => lienzo()?.clientHeight || innerHeight;
