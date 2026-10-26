// Campanas de Bruma — música chiptune original y efectos de sonido, todo sintetizado (sin archivos).
'use strict';

const Sonido = (() => {
  let ac = null, master = null, busMusica = null, busFx = null, ruido = null;
  let musicaOn = true, fxOn = true;
  try { musicaOn = localStorage.getItem('cb:musica') !== '0'; fxOn = localStorage.getItem('cb:fx') !== '0'; } catch (e) {}

  function iniciar() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.8; master.connect(ac.destination);
    const comp = ac.createDynamicsCompressor(); comp.connect(master);
    busMusica = ac.createGain(); busMusica.gain.value = musicaOn ? 0.32 : 0; busMusica.connect(comp);
    busFx = ac.createGain(); busFx.gain.value = fxOn ? 0.55 : 0; busFx.connect(comp);
    // Buffer de ruido blanco para percusión y golpes.
    ruido = ac.createBuffer(1, ac.sampleRate * 1, ac.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (pendiente) { const p = pendiente; pendiente = null; musica(p); }
  }

  // ---------- Notas ----------
  const SEMI = { C:-9, 'C#':-8, Db:-8, D:-7, 'D#':-6, Eb:-6, E:-5, F:-4, 'F#':-3, Gb:-3, G:-2, 'G#':-1, Ab:-1, A:0, 'A#':1, Bb:1, B:2 };
  function freq(n) {
    const m = /^([A-G][#b]?)(\d)$/.exec(n);
    if (!m) return 0;
    return 440 * Math.pow(2, (SEMI[m[1]] + (parseInt(m[2]) - 4) * 12) / 12);
  }

  function env(g, t, a, peak, dec, sus, rel, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.linearRampToValueAtTime(peak * sus, t + a + dec);
    g.gain.setValueAtTime(peak * sus, t + Math.max(a + dec, dur));
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a + dec, dur) + rel);
  }
  function tono(dest, tipo, f, t, dur, vol = 0.3, opt = {}) {
    if (!ac || !f) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f, t);
    if (opt.hasta) o.frequency.exponentialRampToValueAtTime(opt.hasta, t + dur);
    if (opt.vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 5.5; lg.gain.value = f * 0.012; l.connect(lg); lg.connect(o.frequency); l.start(t + 0.08); l.stop(t + dur + 0.4); }
    env(g, t, opt.a ?? 0.005, vol, opt.d ?? 0.08, opt.s ?? 0.6, opt.r ?? 0.06, dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + (opt.r ?? 0.06) + 0.05);
  }
  function campana(dest, f, t, vol = 0.25, largo = 1.4) {
    // Campana: parciales inarmónicos con caída larga.
    [[1, 1], [2.0, 0.5], [2.76, 0.35], [5.4, 0.18], [8.93, 0.08]].forEach(([m, v]) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f * m;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * v, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + largo / Math.sqrt(m));
      o.connect(g); g.connect(dest); o.start(t); o.stop(t + largo + 0.1);
    });
  }
  function golpeRuido(dest, t, dur, vol, filtro = 'bandpass', fr = 1800, q = 0.8, hasta) {
    if (!ac) return;
    const s = ac.createBufferSource(); s.buffer = ruido;
    const f = ac.createBiquadFilter(); f.type = filtro; f.frequency.setValueAtTime(fr, t); f.Q.value = q;
    if (hasta) f.frequency.exponentialRampToValueAtTime(hasta, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  function bombo(dest, t, vol = 0.7) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.2);
  }

  // ---------- Canciones (originales) ----------
  // Cada compás = 8 corcheas. '-' sostiene, '.' silencio. bajo: una nota por compás con un patrón.
  const CANCIONES = {
    titulo: { bpm:76, lead:'campana', bajoEstilo:'largo', bat:null,
      lead_: ['A4 - - E5 - - C5 -', 'B4 - - - G4 - - -', 'A4 - - C5 - - E5 -', 'D5 - - - - - - -', 'C5 - - B4 - - A4 -', 'G4 - - E4 - - G4 -', 'A4 - - - E4 - - -', 'A4 - - - - - - -'],
      bajo: ['A2', 'E2', 'F2', 'D2', 'A2', 'C3', 'E2', 'A2'] },
    mapa: { bpm:112, lead:'square', bajoEstilo:'saltos', bat:'suave',
      lead_: ['C5 - E5 G5 - E5 D5 C5', 'D5 - - - G4 - - -', 'A4 - C5 E5 - D5 C5 A4', 'G4 - - - - - . .', 'F4 - A4 C5 - A4 G4 F4', 'E4 - G4 C5 - B4 C5 D5', 'E5 - D5 C5 - A4 B4 G4', 'C5 - - - - - . .'],
      bajo: ['C3', 'G2', 'A2', 'G2', 'F2', 'C3', 'G2', 'C3'] },
    pueblo: { bpm:92, lead:'triangle', bajoEstilo:'vals', bat:'suave',
      lead_: ['F4 - A4 - C5 - A4 -', 'Bb4 - A4 - G4 - - -', 'E4 - G4 - Bb4 - G4 -', 'A4 - - - F4 - - -', 'D5 - C5 - Bb4 - A4 -', 'G4 - A4 - Bb4 - C5 -', 'A4 - G4 - E4 - G4 -', 'F4 - - - - - . .'],
      bajo: ['F2', 'Bb2', 'C3', 'F2', 'Bb2', 'G2', 'C3', 'F2'] },
    batalla: { bpm:144, lead:'square', bajoEstilo:'galope', bat:'batalla',
      lead_: ['D5 - A4 - D5 E5 F5 -', 'E5 - C5 - A4 - - -', 'Bb4 - C5 D5 E5 - F5 E5', 'D5 - - - A4 - - -', 'F5 - E5 - D5 - C5 -', 'Bb4 - C5 - D5 - A4 -', 'G4 - A4 Bb4 C5 - E5 -', 'D5 - - - - - . .'],
      bajo: ['D3', 'C3', 'Bb2', 'A2', 'D3', 'Bb2', 'G2', 'A2'] },
    jefe: { bpm:156, lead:'square', bajoEstilo:'motor', bat:'batalla',
      lead_: ['E5 - E5 D5 E5 - G5 -', 'F#5 - E5 - D5 - B4 -', 'C5 - C5 B4 C5 - E5 -', 'D#5 - - - B4 - - -', 'E5 - G5 - B5 - A5 G5', 'F#5 - D5 - A4 - D5 -', 'C5 - E5 - G5 F#5 E5 D#5', 'E5 - - - B4 - E4 -'],
      bajo: ['E2', 'B2', 'C3', 'B2', 'E2', 'D3', 'C3', 'B2'] },
    final: { bpm:150, lead:'square', bajoEstilo:'motor', bat:'batalla', campanas:true,
      lead_: ['C5 - Eb5 - G5 - C6 -', 'Bb5 - Ab5 - G5 - - -', 'Ab5 - G5 - F5 - Eb5 -', 'D5 - - - G4 - - -', 'C5 - D5 Eb5 F5 - G5 -', 'Ab5 - - - G5 - F5 -', 'Eb5 - D5 - C5 - B4 -', 'C5 - - - - - G4 -'],
      bajo: ['C3', 'G2', 'F2', 'G2', 'C3', 'Ab2', 'G2', 'C3'] },
    // Acto III: el mar, Puerto Eco, el Coro y el Eco Primero.
    mar: { bpm:100, lead:'triangle', bajoEstilo:'vals', bat:'suave',
      lead_: ['D5 - - A4 - - C5 -', 'D5 - E5 - F5 - E5 -', 'D5 - - A4 - - G4 -', 'A4 - - - - - . .', 'F5 - - E5 - - D5 -', 'C5 - D5 - E5 - C5 -', 'A4 - - G4 - - E4 -', 'D4 - - - - - . .'],
      bajo: ['D2', 'C3', 'Bb2', 'A2', 'D2', 'F2', 'G2', 'D2'] },
    puerto: { bpm:96, lead:'triangle', bajoEstilo:'vals', bat:'suave',
      lead_: ['A4 - C5 - E5 - D5 -', 'C5 - B4 - A4 - - -', 'G4 - B4 - D5 - C5 -', 'B4 - A4 - G4 - - -', 'F4 - A4 - C5 - B4 -', 'A4 - G#4 - A4 - B4 -', 'C5 - B4 - A4 - G#4 -', 'A4 - - - - - . .'],
      bajo: ['A2', 'A2', 'G2', 'G2', 'F2', 'E2', 'E2', 'A2'] },
    coro: { bpm:148, lead:'square', bajoEstilo:'galope', bat:'batalla',
      lead_: ['E5 - B4 - E5 F#5 G5 -', 'F#5 - D5 - B4 - - -', 'C5 - E5 - G5 - F#5 E5', 'D#5 - - - B4 - - -', 'E5 - G5 - B5 - A5 -', 'G5 - F#5 - E5 - D5 -', 'C5 - B4 - A4 - D#5 -', 'E5 - - - - - . .'],
      bajo: ['E2', 'B2', 'C3', 'B2', 'E2', 'G2', 'A2', 'B2'] },
    eco: { bpm:140, lead:'square', bajoEstilo:'motor', bat:'batalla', campanas:true,
      lead_: ['F5 - C5 - Ab5 - G5 F5', 'E5 - - - C5 - - -', 'Db5 - F5 - Ab5 - Bb5 -', 'C6 - - - G5 - - -', 'F5 - G5 Ab5 Bb5 - C6 -', 'Db6 - C6 - Bb5 - Ab5 -', 'G5 - F5 - E5 - G5 -', 'F5 - - - C5 - F4 -'],
      bajo: ['F2', 'C3', 'Db3', 'C3', 'F2', 'Db3', 'C3', 'F2'] },
    victoria: { bpm:160, lead:'square', bajoEstilo:'saltos', bat:'suave', unaVez:true,
      lead_: ['G4 C5 E5 G5 - - E5 -', 'F5 - D5 - B4 - G4 -', 'C5 - E5 - G5 - - -', 'C6 - - - - - - -'],
      bajo: ['C3', 'G2', 'C3', 'C3'] },
    derrota: { bpm:70, lead:'triangle', bajoEstilo:'largo', bat:null, unaVez:true,
      lead_: ['A4 - G4 - F4 - E4 -', 'D4 - - - C4 - - -', 'B3 - - - - - - -', 'A3 - - - - - - -'],
      bajo: ['F2', 'D2', 'E2', 'A2'] },
  };

  let actual = null, pendiente = null, timer = null, paso = 0, proximo = 0;
  function musica(nombre) {
    if (!ac) { pendiente = nombre; return; }
    if (actual && actual.nombre === nombre) return;
    detener();
    const c = CANCIONES[nombre];
    if (!c) return;
    const notas = c.lead_.join(' ').split(/\s+/);
    actual = { nombre, c, notas, total: notas.length };
    paso = 0; proximo = ac.currentTime + 0.08;
    timer = setInterval(programar, 30);
  }
  function detener() {
    if (timer) clearInterval(timer);
    timer = null; actual = null;
  }
  function programar() {
    if (!actual) return;
    const { c, notas, total } = actual;
    const corchea = 60 / c.bpm / 2;
    while (proximo < ac.currentTime + 0.15) {
      const i = paso % total;
      if (c.unaVez && paso >= total) { detener(); return; }
      const n = notas[i];
      if (n !== '-' && n !== '.') {
        let dur = corchea;
        for (let j = i + 1; j < total && notas[j] === '-'; j++) dur += corchea;
        const f = freq(n);
        if (c.lead === 'campana') campana(busMusica, f, proximo, 0.22, 2.2);
        else if (c.lead === 'triangle') tono(busMusica, 'triangle', f, proximo, dur * 0.9, 0.34, { vib:true, s:0.7 });
        else { tono(busMusica, 'square', f, proximo, dur * 0.85, 0.11, { vib:true, s:0.55 }); tono(busMusica, 'square', f * 1.003, proximo + 0.012, dur * 0.8, 0.05, { s:0.5 }); }
      }
      // Bajo
      const compas = Math.floor(i / 8), enCompas = i % 8;
      const raiz = freq(c.bajo[compas % c.bajo.length]);
      const est = c.bajoEstilo;
      if (est === 'largo' && enCompas === 0) tono(busMusica, 'triangle', raiz, proximo, corchea * 7.5, 0.4, { a:0.05, s:0.8, r:0.3 });
      if (est === 'saltos' && enCompas % 2 === 0) tono(busMusica, 'triangle', enCompas % 4 === 0 ? raiz : raiz * 1.5, proximo, corchea * 1.6, 0.42);
      if (est === 'vals' && enCompas % 2 === 0) tono(busMusica, 'triangle', enCompas === 0 ? raiz : raiz * 2, proximo, corchea * 1.5, 0.36);
      if (est === 'galope') tono(busMusica, 'triangle', enCompas % 4 === 2 ? raiz * 2 : raiz, proximo, corchea * 0.8, 0.45);
      if (est === 'motor') tono(busMusica, 'triangle', enCompas % 2 ? raiz * 2 : raiz, proximo, corchea * 0.7, 0.45);
      // Batería
      if (c.bat === 'batalla') {
        if (enCompas === 0 || enCompas === 3 || enCompas === 5) bombo(busMusica, proximo, 0.55);
        if (enCompas === 2 || enCompas === 6) golpeRuido(busMusica, proximo, 0.12, 0.28, 'bandpass', 1600, 0.6);
        golpeRuido(busMusica, proximo, 0.03, 0.07, 'highpass', 7000, 0.5);
      } else if (c.bat === 'suave') {
        if (enCompas === 0) bombo(busMusica, proximo, 0.35);
        if (enCompas === 4) golpeRuido(busMusica, proximo, 0.08, 0.1, 'bandpass', 2000, 0.6);
        if (enCompas % 2 === 1) golpeRuido(busMusica, proximo, 0.025, 0.05, 'highpass', 8000, 0.5);
      }
      if (c.campanas && enCompas === 0 && compas % 2 === 0) campana(busMusica, raiz * 4, proximo, 0.12, 2.5);
      paso++; proximo += corchea;
    }
  }

  // ---------- Efectos ----------
  function fx(nombre) {
    if (!ac || !fxOn) return;
    const t = ac.currentTime + 0.01, d = busFx;
    switch (nombre) {
      case 'sel': tono(d, 'square', 988, t, 0.04, 0.12, { s:0.4 }); tono(d, 'square', 1319, t + 0.04, 0.05, 0.1, { s:0.4 }); break;
      case 'atras': tono(d, 'square', 660, t, 0.05, 0.1); tono(d, 'square', 440, t + 0.05, 0.06, 0.1); break;
      case 'turno': tono(d, 'triangle', 660, t, 0.06, 0.3); tono(d, 'triangle', 990, t + 0.06, 0.1, 0.3); break;
      case 'paso': golpeRuido(d, t, 0.04, 0.12, 'lowpass', 900, 0.5); break;
      case 'error': tono(d, 'sawtooth', 120, t, 0.18, 0.15); break;
      case 'golpe': bombo(d, t, 0.9); golpeRuido(d, t, 0.12, 0.5, 'bandpass', 1200, 0.7); break;
      case 'corte': golpeRuido(d, t, 0.14, 0.5, 'bandpass', 5000, 1.2, 1200); bombo(d, t + 0.03, 0.5); break;
      case 'critico': golpeRuido(d, t, 0.16, 0.6, 'bandpass', 3000, 0.8, 800); bombo(d, t, 1); tono(d, 'square', 1760, t + 0.02, 0.08, 0.15); break;
      case 'mordida': golpeRuido(d, t, 0.08, 0.5, 'bandpass', 2400, 1); golpeRuido(d, t + 0.07, 0.08, 0.5, 'bandpass', 2000, 1); break;
      case 'fallo': golpeRuido(d, t, 0.22, 0.25, 'bandpass', 600, 2, 3000); break;
      case 'flecha': golpeRuido(d, t, 0.15, 0.25, 'bandpass', 3000, 3, 6000); bombo(d, t + 0.14, 0.4); break;
      case 'piedra': bombo(d, t + 0.1, 0.5); golpeRuido(d, t + 0.1, 0.06, 0.3, 'lowpass', 1500); break;
      case 'fuego': golpeRuido(d, t, 0.5, 0.5, 'lowpass', 2500, 0.7, 300); for (let i = 0; i < 6; i++) golpeRuido(d, t + Math.random() * 0.4, 0.02, 0.3, 'highpass', 4000); break;
      case 'hielo': for (let i = 0; i < 6; i++) tono(d, 'sine', 1800 + i * 300, t + i * 0.04, 0.12, 0.12, { s:0.3 }); golpeRuido(d, t, 0.3, 0.2, 'highpass', 6000); break;
      case 'rayo': golpeRuido(d, t, 0.4, 0.8, 'lowpass', 6000, 0.5, 200); tono(d, 'square', 1200, t, 0.2, 0.15, { hasta:80 }); break;
      case 'luz': [1047, 1319, 1568, 2093].forEach((f, i) => tono(d, 'sine', f, t + i * 0.05, 0.3, 0.16, { s:0.4, r:0.3 })); break;
      case 'sonido': campana(d, 523, t, 0.35, 1.6); campana(d, 784, t + 0.08, 0.2, 1.2); break;
      case 'cura': [523, 659, 784, 1047].forEach((f, i) => tono(d, 'triangle', f, t + i * 0.06, 0.25, 0.25, { s:0.5, r:0.2 })); break;
      case 'brillo': tono(d, 'square', 440, t, 0.3, 0.08, { hasta:1760 }); tono(d, 'sine', 880, t + 0.1, 0.3, 0.15, { hasta:1760 }); break;
      case 'escudo': campana(d, 660, t, 0.2, 0.8); tono(d, 'triangle', 330, t, 0.3, 0.3); break;
      case 'malo': tono(d, 'sawtooth', 600, t, 0.35, 0.08, { hasta:150 }); break;
      case 'sueno': [784, 659, 523].forEach((f, i) => tono(d, 'sine', f, t + i * 0.12, 0.25, 0.15)); break;
      case 'tiempo': for (let i = 0; i < 8; i++) tono(d, 'square', i % 2 ? 1200 : 900, t + i * 0.05, 0.03, 0.08); break;
      case 'bruma': tono(d, 'sawtooth', 110, t, 0.6, 0.1, { hasta:70, a:0.1 }); tono(d, 'sawtooth', 113, t, 0.6, 0.1, { hasta:72, a:0.1 }); golpeRuido(d, t, 0.6, 0.15, 'lowpass', 600); break;
      case 'tierra': bombo(d, t, 1); golpeRuido(d, t, 0.4, 0.5, 'lowpass', 400, 0.5); break;
      case 'gravedad': tono(d, 'sine', 300, t, 0.5, 0.4, { hasta:40 }); break;
      case 'onda': golpeRuido(d, t, 0.25, 0.4, 'bandpass', 800, 1, 3000); break;
      case 'salto': tono(d, 'square', 300, t, 0.25, 0.1, { hasta:900 }); bombo(d, t + 0.45, 1); break;
      case 'humo': golpeRuido(d, t, 0.5, 0.3, 'lowpass', 1200, 0.5, 200); break;
      case 'moneda': case 'compra': tono(d, 'square', 1319, t, 0.06, 0.12); tono(d, 'square', 1976, t + 0.06, 0.16, 0.12); break;
      case 'revivir': [392, 523, 659, 784, 1047].forEach((f, i) => tono(d, 'triangle', f, t + i * 0.07, 0.3, 0.25)); break;
      case 'ko': tono(d, 'square', 440, t, 0.4, 0.12, { hasta:60 }); break;
      case 'nivel': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tono(d, 'square', f, t + i * 0.07, 0.09, 0.12)); break;
      case 'forja': campana(d, 330, t, 0.3, 0.6); campana(d, 347, t, 0.2, 0.5); golpeRuido(d, t, 0.1, 0.5, 'highpass', 3000); break;
      case 'mascota': tono(d, 'square', 1200, t, 0.05, 0.1); tono(d, 'square', 1600, t + 0.06, 0.05, 0.1); tono(d, 'square', 2000, t + 0.12, 0.07, 0.1); break;
      case 'pagina': tono(d, 'triangle', 1200, t, 0.03, 0.15); break;
    }
  }

  function setMusica(on) { musicaOn = on; try { localStorage.setItem('cb:musica', on ? '1' : '0'); } catch (e) {} if (busMusica) busMusica.gain.value = on ? 0.32 : 0; }
  function setFx(on) { fxOn = on; try { localStorage.setItem('cb:fx', on ? '1' : '0'); } catch (e) {} if (busFx) busFx.gain.value = on ? 0.55 : 0; }

  return { iniciar, musica, detener, fx, setMusica, setFx, get musicaOn() { return musicaOn; }, get fxOn() { return fxOn; } };
})();
