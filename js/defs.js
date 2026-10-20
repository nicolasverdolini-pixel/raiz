// Degradés compartidos por todos los dibujos (jardines, objetos y el mundo).
// Dan volumen: cada color tiene su luz arriba a la izquierda y su sombra abajo a la derecha.

(() => {
  const esfera = (id, luz, base, sombra) => `<radialGradient id="${id}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${luz}"/><stop offset=".55" stop-color="${base}"/><stop offset="1" stop-color="${sombra}"/></radialGradient>`;
  const lineal = (id, a, b, vertical = true) => `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

  const defs = [
    esfera('e-verde', '#a6d68a', '#5c9a5a', '#2f5e33'),
    esfera('e-verde2', '#c4e3a0', '#7cb46a', '#3f7a3a'),
    esfera('e-rojo', '#ff9a8a', '#e04a4a', '#9a2a2a'),
    esfera('e-rosa', '#ffc9d8', '#f08aa6', '#b24a6a'),
    esfera('e-amarillo', '#fff1a8', '#f2c230', '#b88a10'),
    esfera('e-naranja', '#ffd09a', '#f08a2c', '#a8541a'),
    esfera('e-morado', '#e2d9ff', '#9b8fd6', '#5e5296'),
    esfera('e-blanco', '#ffffff', '#f3eee2', '#c9c0aa'),
    esfera('e-piedra', '#e4e2da', '#a8a59a', '#6f6c62'),
    esfera('e-agua', '#e2f4fb', '#7fc0dc', '#3f86aa'),
    esfera('e-piel', '#ffe2cc', '#f2c9a8', '#c99a78'),
    esfera('e-azul', '#bcd6f2', '#5f8fbf', '#2f5a86'),
    lineal('l-madera', '#c4936a', '#7a5a3a', false),
    lineal('l-tronco', '#a07a52', '#6e5236', false),
    lineal('l-terracota', '#e09a6a', '#a5582a'),
    lineal('l-metal', '#7a8794', '#3d4650', false),
    lineal('l-agua', '#bfe3f2', '#6fb0d0'),
    lineal('l-tierra', '#9a7350', '#6a4a30'),
    lineal('l-tierra-noche', '#4a4f66', '#2c3045'),
    lineal('l-tierra-nieve', '#a9a49a', '#7a756a'),
    lineal('l-tierra-arena', '#c9a46a', '#9a7444'),
    // Suelo de cada fondo: más claro en el centro, más oscuro en el borde.
    `<radialGradient id="s-pradera" cx="45%" cy="38%" r="70%"><stop offset="0" stop-color="#d7ebb8"/><stop offset=".7" stop-color="#b6d48f"/><stop offset="1" stop-color="#9cc075"/></radialGradient>`,
    `<radialGradient id="s-otono" cx="45%" cy="38%" r="70%"><stop offset="0" stop-color="#f3dcae"/><stop offset=".7" stop-color="#e3c088"/><stop offset="1" stop-color="#cfa264"/></radialGradient>`,
    `<radialGradient id="s-arena" cx="45%" cy="38%" r="70%"><stop offset="0" stop-color="#f7e8c4"/><stop offset=".7" stop-color="#ead39c"/><stop offset="1" stop-color="#d9bb7a"/></radialGradient>`,
    `<radialGradient id="s-nieve" cx="45%" cy="38%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#e8eff2"/><stop offset="1" stop-color="#cfdbe0"/></radialGradient>`,
    `<radialGradient id="s-lavanda" cx="45%" cy="38%" r="70%"><stop offset="0" stop-color="#ece6f7"/><stop offset=".7" stop-color="#d4c8ec"/><stop offset="1" stop-color="#b9a8de"/></radialGradient>`,
    `<radialGradient id="s-noche" cx="45%" cy="38%" r="70%"><stop offset="0" stop-color="#55688a"/><stop offset=".7" stop-color="#3c4d6a"/><stop offset="1" stop-color="#2c3a54"/></radialGradient>`,
    `<filter id="f-suave" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>`,
  ].join('');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.innerHTML = `<defs>${defs}</defs>`;
  document.body.prepend(svg);
})();
