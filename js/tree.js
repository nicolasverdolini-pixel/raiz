// Dibujos: el árbol según etapa y vitalidad, y las láminas del herbario.

const PALETAS = {
  sano: ['#5c7a4a', '#7c9a62', '#9db67f'],
  cansado: ['#7a8048', '#949a5c', '#b3b478'],
  otono: ['#a9703f', '#c08a4e', '#d6a865'],
};

// Copas por etapa: [cx, cy, r, tono 0-2]
const COPAS = {
  3: [[60, 78, 20, 0], [44, 86, 13, 1], [76, 84, 14, 1], [62, 64, 11, 2]],
  4: [[60, 60, 24, 0], [38, 72, 15, 1], [82, 70, 16, 1], [52, 44, 13, 2], [72, 48, 12, 2]],
  5: [[60, 56, 27, 0], [35, 70, 17, 1], [86, 66, 18, 1], [50, 38, 14, 2], [74, 40, 14, 2], [60, 76, 14, 1]],
  6: [[60, 52, 31, 0], [30, 66, 19, 1], [90, 62, 20, 1], [46, 32, 16, 2], [76, 34, 16, 2], [60, 22, 12, 2], [62, 76, 16, 1]],
};

// Dónde aparecen los brotes del día (una hojita por misión cumplida).
function puntosBrote(etapa) {
  if (etapa === 0) return [[67, 105], [62, 111], [71, 103], [57, 116], [69, 110], [64, 106], [73, 108], [59, 112]];
  if (etapa < 3) return [[66, 104], [54, 98], [70, 92], [50, 90], [62, 86], [74, 100], [46, 104], [58, 80]];
  return Array.from({ length: 12 }, (_, i) => {
    const c = COPAS[Math.min(etapa, 6)];
    const [cx, cy, r] = c[i % c.length];
    const a = (i * 137.5 * Math.PI) / 180;
    return [cx + Math.cos(a) * r * 0.85, cy + Math.sin(a) * r * 0.85];
  });
}

// opts.especie: id de ESPECIES. opts.brotes: misiones cumplidas hoy. opts.nuevo: anima el último brote.
function treeSVG(etapa, vitalidad = 100, otono = false, opts = {}) {
  const esp = (typeof ESPECIES !== 'undefined' && ESPECIES.find(e => e.id === opts.especie)) || { hojas: PALETAS.sano, flor: '#f3e6c8', centro: '#c9a96e', fruto: '#c9763e', forma: 'redonda' };
  const enFlor = etapa >= 4 && esp.hojasFlor;
  const pal = otono || vitalidad < 30 ? PALETAS.otono : vitalidad < 60 ? PALETAS.cansado : enFlor ? esp.hojasFlor : esp.hojas;
  const tronco = esp.tronco || '#8a6a45';
  let s = `<svg class="tree" viewBox="0 0 120 140" role="img" aria-label="Tu árbol">`;
  s += `<ellipse cx="60" cy="130" rx="40" ry="6" fill="#d9ccb0" opacity=".7"/>`;
  s += `<g class="planta">`;

  if (etapa === 0) {
    s += `<path d="M38 130 Q60 112 82 130 Z" fill="#b89c74"/>`;
    s += `<ellipse cx="60" cy="122" rx="7" ry="5" fill="${tronco}"/>`;
    s += `<path d="M60 117 Q61 110 66 106" stroke="${pal[1]}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  } else if (etapa === 1) {
    s += `<path d="M60 130 Q59 114 60 100" stroke="${pal[0]}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M60 104 Q46 98 42 86 Q56 88 60 104Z" fill="${pal[1]}"/>`;
    s += `<path d="M60 102 Q74 94 80 82 Q64 84 60 102Z" fill="${pal[2]}"/>`;
  } else if (etapa === 2) {
    s += `<path d="M60 130 Q58 108 60 82" stroke="${tronco}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    if (esp.forma === 'conica') {
      s += `<path d="M44 108 L60 80 L76 108Z" fill="${pal[0]}"/><path d="M48 94 L60 70 L72 94Z" fill="${pal[1]}"/>`;
    } else {
      s += `<path d="M60 112 Q44 108 38 96 Q54 96 60 112Z" fill="${pal[0]}"/>`;
      s += `<path d="M60 104 Q76 100 84 88 Q66 88 60 104Z" fill="${pal[1]}"/>`;
      s += `<path d="M60 92 Q46 84 44 72 Q58 76 60 92Z" fill="${pal[1]}"/>`;
      s += `<path d="M60 86 Q72 78 74 64 Q60 70 60 86Z" fill="${pal[2]}"/>`;
    }
  } else {
    const n = Math.min(etapa, 6);
    const grosor = 5 + n * 1.4;
    const alto = { 3: 82, 4: 66, 5: 62, 6: 58 }[n];
    s += `<path d="M${60 - grosor / 2} 130 Q${58} ${(130 + alto) / 2} ${60 - 2} ${alto} L${62} ${alto} Q${62} ${(130 + alto) / 2} ${60 + grosor / 2} 130Z" fill="${tronco}"/>`;
    if (n >= 4 && esp.forma !== 'conica') {
      s += `<path d="M60 ${alto + 22} Q46 ${alto + 12} 40 ${alto + 4}" stroke="${tronco}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M60 ${alto + 16} Q74 ${alto + 6} 82 ${alto}" stroke="${tronco}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    }
    // La copa (y lo que crece en ella) va en un grupo: la forma "ancha" la estira de costado.
    const estirar = esp.forma === 'ancha' ? ` transform="translate(60 ${alto - 6}) scale(1.2 .82) translate(-60 -${alto - 6})"` : '';
    s += `<g${estirar}>`;
    if (esp.forma === 'conica') {
      const capas = n, base = alto + 26, cima = alto - 44 - (n - 3) * 6;
      const paso = (base - cima) / (capas + 0.6);
      for (let k = 0; k < capas; k++) {
        const y0 = base - k * paso, w = (20 + n * 3) * (1 - k / (capas + 1.2));
        s += `<path d="M${60 - w} ${y0} Q60 ${y0 + 4} ${60 + w} ${y0} L60 ${y0 - paso * 1.9}Z" fill="${pal[k % 2]}"/>`;
      }
    } else {
      // Primero una silueta unida y oscura, después las luces: la copa se lee como una sola.
      for (const [cx, cy, r] of COPAS[n]) s += `<circle cx="${cx}" cy="${cy + 2}" r="${r + 3}" fill="${pal[0]}" opacity=".9"/>`;
      for (const [cx, cy, r, t] of COPAS[n]) if (t) s += `<circle cx="${cx - r * 0.18}" cy="${cy - r * 0.2}" r="${r * 0.72}" fill="${pal[t]}" opacity=".85"/>`;
    }
    if (etapa >= 4 && !otono && esp.flor) {
      for (const [x, y] of [[48, 50], [70, 44], [84, 66], [38, 70], [62, 66], [56, 32], [44, 40], [76, 72]].slice(0, etapa >= 5 ? 8 : 5))
        s += `<circle cx="${x}" cy="${y}" r="3.2" fill="${esp.flor}"/><circle cx="${x}" cy="${y}" r="1.2" fill="${esp.centro || '#c9a96e'}"/>`;
    }
    if (etapa >= 5) {
      for (const [x, y] of [[44, 62], [76, 58], [64, 78], [34, 78]]) s += `<circle cx="${x}" cy="${y}" r="3.6" fill="${esp.fruto}"/>`;
    }
    s += brotesSVG(etapa, opts) + '</g>';
    if (etapa >= 7) {
      s += `<path d="M14 130 L16 108 L18 130Z" fill="${tronco}"/><circle cx="16" cy="102" r="11" fill="${pal[1]}"/>`;
      s += `<path d="M102 130 L104 104 L106 130Z" fill="${tronco}"/><circle cx="104" cy="98" r="13" fill="${pal[2]}"/>`;
    }
    return s + '</g></svg>';
  }
  return s + brotesSVG(etapa, opts) + '</g></svg>';
}

function brotesSVG(etapa, opts) {
  const pts = puntosBrote(etapa);
  const n = Math.min(opts.brotes || 0, pts.length);
  let s = '';
  for (let i = 0; i < n; i++) {
    const [x, y] = pts[i];
    const giro = (i * 67) % 180;
    s += `<ellipse class="brote${opts.nuevo && i === n - 1 ? ' nuevo' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.4" ry="1.9" fill="#cfe0a8" transform="rotate(${giro} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return s;
}

function laminaSVG(forma) {
  const v = '#5c7a4a', c = '#9db67f', d = '#c9a96e';
  const tallo = `<path d="M24 44 Q24 30 24 22" stroke="${v}" stroke-width="2" fill="none"/>`;
  const f = {
    trebol: `${tallo}<circle cx="18" cy="18" r="7" fill="${v}"/><circle cx="30" cy="18" r="7" fill="${c}"/><circle cx="24" cy="9" r="7" fill="${v}"/>`,
    flor: `${tallo}${[0, 60, 120, 180, 240, 300].map(a => `<ellipse cx="24" cy="10" rx="4" ry="8" fill="#f3e6c8" stroke="${d}" stroke-width=".8" transform="rotate(${a} 24 18)"/>`).join('')}<circle cx="24" cy="18" r="4" fill="${d}"/>`,
    rama: `<path d="M10 42 Q24 26 38 6" stroke="${v}" stroke-width="2" fill="none"/>${[[16, 32], [22, 24], [28, 17], [33, 11]].map(([x, y], i) => `<ellipse cx="${x + (i % 2 ? 5 : -5)}" cy="${y}" rx="5" ry="2.4" fill="${i % 2 ? c : v}" transform="rotate(${i % 2 ? -30 : 30} ${x} ${y})"/>`).join('')}`,
    espiga: `<path d="M24 44 L24 8" stroke="${v}" stroke-width="2"/>${[10, 15, 20, 25, 30].map(y => `<ellipse cx="20" cy="${y}" rx="3" ry="2.4" fill="#9a8fc4"/><ellipse cx="28" cy="${y + 2}" rx="3" ry="2.4" fill="#b3a9d9"/>`).join('')}`,
    diente: `${tallo}<circle cx="24" cy="16" r="3" fill="${d}"/>${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => `<line x1="24" y1="16" x2="24" y2="4" stroke="#cfc6b0" stroke-width="1" transform="rotate(${a} 24 16)"/>`).join('')}`,
    fruto: `<path d="M24 14 Q20 6 14 6 Q18 12 24 14" fill="${v}"/><circle cx="24" cy="26" r="12" fill="#e2c14a"/><circle cx="20" cy="22" r="3" fill="#f0dc8a"/>`,
    brote: `<path d="M24 44 Q23 32 24 22" stroke="${v}" stroke-width="2.4" fill="none"/><path d="M24 26 Q12 22 10 10 Q22 12 24 26Z" fill="${v}"/><path d="M24 24 Q36 18 38 6 Q26 10 24 24Z" fill="${c}"/>`,
    helecho: `<path d="M24 44 Q22 24 30 6" stroke="${v}" stroke-width="2" fill="none"/>${[36, 30, 24, 18, 12].map((y, i) => `<path d="M${24 + i} ${y} q-${10 - i} -2 -${12 - i} -8" stroke="${v}" stroke-width="2" fill="none"/><path d="M${24 + i} ${y} q${8 - i} -4 ${10 - i} -10" stroke="${c}" stroke-width="2" fill="none"/>`).join('')}`,
  };
  return `<svg viewBox="0 0 48 48" aria-hidden="true">${f[forma] || f.trebol}</svg>`;
}
