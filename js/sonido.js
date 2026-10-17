// Efectos de sonido sintetizados en el momento: no hay archivos de audio.
// Timbres suaves de madera y campanita, para acompañar sin molestar.

const Sonido = (() => {
  let ctx = null, salida = null;

  function contexto() {
    if (typeof E !== 'undefined' && E.sonido === false) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      salida = ctx.createGain();
      salida.gain.value = 0.55;
      salida.connect(comp).connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Una nota con parciales: [proporción de frecuencia, volumen, duración relativa].
  function nota(freq, cuando, { dur = 0.7, vol = 0.2, parciales = [[1, 1, 1], [4, 0.25, 0.15]] } = {}) {
    const a = contexto();
    if (!a) return;
    const t = a.currentTime + cuando;
    for (const [r, v, d] of parciales) {
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = 'sine';
      o.frequency.value = freq * r;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol * v, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur * d);
      o.connect(g).connect(salida);
      o.start(t);
      o.stop(t + dur * d + 0.05);
    }
  }

  const madera = { dur: 0.6, vol: 0.22, parciales: [[1, 1, 1], [4, 0.3, 0.12], [10, 0.08, 0.05]] };
  const campana = { dur: 1.6, vol: 0.12, parciales: [[1, 1, 1], [2.76, 0.35, 0.5], [5.4, 0.12, 0.25]] };
  const secuencia = (notas, paso, timbre) => notas.forEach((f, i) => nota(f, i * paso, timbre));

  return {
    cumplir: () => secuencia([659.3, 987.8], 0.07, madera),
    extra: () => secuencia([880, 1174.7, 1318.5], 0.06, madera),
    deshacer: () => secuencia([440, 329.6], 0.07, { ...madera, vol: 0.12 }),
    gota: () => nota(1567.98, 0, { ...campana, vol: 0.07, dur: 0.9 }),
    dia: () => secuencia([523.3, 659.3, 784, 1046.5, 1318.5], 0.09, campana),
    nivel: () => {
      secuencia([392, 523.3, 659.3, 784, 1046.5], 0.11, campana);
      setTimeout(() => secuencia([1568, 2093, 2637, 3136], 0.07, { ...campana, vol: 0.05 }), 650);
    },
    rescate: () => secuencia([587.3, 740, 880, 1174.7], 0.1, campana),
    canje: () => secuencia([1318.5, 1760, 2093], 0.08, { ...campana, vol: 0.09 }),
    hojas: () => secuencia([392, 349.2], 0.18, { ...campana, vol: 0.06, dur: 1.2 }),
    tab: () => nota(1046.5, 0, { ...madera, vol: 0.05, dur: 0.25 }),
    // iOS solo habilita el audio después de un toque: lo "despertamos" en el primero.
    despertar: () => contexto(),
  };
})();
