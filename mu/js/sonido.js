// Sonido del juego, generado en el celu (no usa grabaciones de nadie): música que cambia según el lugar
// y efectos de golpes, hechizos, muertes, monedas y forja. Todo pasa por un eco de catedral.

let ctx = null, maestro, musicaG, efectosG, ecos = new Map();
const prefs = (() => { try { return JSON.parse(localStorage.getItem('sendas-sonido')) || {}; } catch (e) { return {}; } })();
let musicaOn = prefs.musica !== false, efectosOn = prefs.efectos !== false;
const guardar = () => { try { localStorage.setItem('sendas-sonido', JSON.stringify({ musica: musicaOn, efectos: efectosOn })); } catch (e) {} };

// El navegador solo deja sonar después de que la persona toca algo.
export function despertar() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ctx = new AC();
  maestro = ctx.createGain(); maestro.gain.value = 0.8; maestro.connect(ctx.destination);
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4; comp.connect(maestro);
  musicaG = ctx.createGain(); musicaG.gain.value = musicaOn ? 0.55 : 0; musicaG.connect(comp);
  efectosG = ctx.createGain(); efectosG.gain.value = efectosOn ? 0.9 : 0; efectosG.connect(comp);
  // Eco largo (catedral).
  const largo = ctx.sampleRate * 3.2, ir = ctx.createBuffer(2, largo, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < largo; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / largo, 2.6); }
  // Un eco por cada salida, así al silenciar la música también se calla su eco.
  for (const bus of [musicaG, efectosG]) { const e = ctx.createConvolver(); e.buffer = ir; const g = ctx.createGain(); g.gain.value = 0.45; e.connect(g); g.connect(bus); ecos.set(bus, e); }
  ruidoBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const r = ruidoBuf.getChannelData(0); for (let i = 0; i < r.length; i++) r[i] = Math.random() * 2 - 1;
  setInterval(tickMusica, 200);
}
export const estado = () => ({ musica: musicaOn, efectos: efectosOn });
export function alternar(que) {
  if (que === 'musica') musicaOn = !musicaOn; else efectosOn = !efectosOn;
  guardar();
  if (ctx) { musicaG.gain.setTargetAtTime(musicaOn ? 0.55 : 0, ctx.currentTime, 0.3); efectosG.gain.setTargetAtTime(efectosOn ? 0.9 : 0, ctx.currentTime, 0.05); }
}

// ---------- piezas básicas ----------
let ruidoBuf;
const ahora = () => ctx.currentTime;
const hz = n => 440 * Math.pow(2, (n - 69) / 12);
function salida(destino, vol, pan = 0, ecoK = 0.25) {
  const g = ctx.createGain(); g.gain.value = vol;
  const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  if (p) { p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); p.connect(destino); } else g.connect(destino);
  if (ecoK) { const e = ctx.createGain(); e.gain.value = ecoK; g.connect(e); e.connect(ecos.get(destino)); }
  return g;
}
function tono({ f, tipo = 'sine', t = 0, dur = 0.3, vol = 0.3, ataque = 0.005, destino = efectosG, pan = 0, ecoK = 0.25, glide = null, filtro = null }) {
  const t0 = ahora() + t, o = ctx.createOscillator(), env = ctx.createGain();
  o.type = tipo; o.frequency.setValueAtTime(f, t0); if (glide) o.frequency.exponentialRampToValueAtTime(glide, t0 + dur);
  env.gain.setValueAtTime(0.0001, t0); env.gain.exponentialRampToValueAtTime(vol, t0 + ataque); env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let n = o; if (filtro) { const fl = ctx.createBiquadFilter(); fl.type = filtro.tipo || 'lowpass'; fl.frequency.value = filtro.f; fl.Q.value = filtro.q || 1; o.connect(fl); n = fl; }
  n.connect(env); env.connect(salida(destino, 1, pan, ecoK)); o.start(t0); o.stop(t0 + dur + 0.05);
}
function ruido({ t = 0, dur = 0.2, vol = 0.3, f = 1200, q = 1, tipo = 'bandpass', destino = efectosG, pan = 0, ecoK = 0.2, barrido = null }) {
  const t0 = ahora() + t, s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), env = ctx.createGain();
  s.buffer = ruidoBuf; fl.type = tipo; fl.frequency.setValueAtTime(f, t0); fl.Q.value = q; if (barrido) fl.frequency.exponentialRampToValueAtTime(barrido, t0 + dur);
  env.gain.setValueAtTime(0.0001, t0); env.gain.exponentialRampToValueAtTime(vol, t0 + 0.004); env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(fl); fl.connect(env); env.connect(salida(destino, 1, pan, ecoK)); s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.05);
}
const campana = (nota, t = 0, vol = 0.12, destino = efectosG) => {
  for (const [k, v] of [[1, 1], [2.76, 0.4], [5.4, 0.2], [0.5, 0.3]]) tono({ f: hz(nota) * k, t, dur: 2.2 / k + 0.4, vol: vol * v, destino, ecoK: 0.6 });
};

// ---------- efectos ----------
// d: distancia al jugador (más lejos, más bajo) · pan: izquierda/derecha
const lejos = d => Math.max(0, 1 - (d || 0) / 26);
export const sfx = {
  golpe(tipo = 'carne', fuerte = false, d = 0, pan = 0) {
    if (!ctx || !efectosOn) return; const k = lejos(d); if (k <= 0) return;
    if (tipo === 'hueso') { ruido({ dur: 0.08, vol: 0.5 * k, f: 2400, q: 3, pan }); tono({ f: 900, tipo: 'square', dur: 0.06, vol: 0.06 * k, pan, filtro: { f: 1800 } }); }
    else { ruido({ dur: 0.12, vol: 0.45 * k, f: 500, q: 0.8, pan, tipo: 'lowpass', barrido: 200 }); tono({ f: 140, glide: 60, dur: 0.14, vol: 0.25 * k, pan, ecoK: 0.1 }); }
    if (fuerte) { ruido({ t: 0.01, dur: 0.25, vol: 0.35 * k, f: 3000, q: 0.7, pan, barrido: 600 }); tono({ f: 80, glide: 40, dur: 0.3, vol: 0.35 * k, pan }); }
  },
  tajo(d = 0, pan = 0) { if (!ctx || !efectosOn) return; ruido({ dur: 0.18, vol: 0.18 * lejos(d), f: 900, q: 1.5, pan, barrido: 3200 }); },
  dolor() { if (!ctx || !efectosOn) return; ruido({ dur: 0.15, vol: 0.4, f: 300, tipo: 'lowpass', barrido: 120 }); tono({ f: 220, tipo: 'sawtooth', glide: 110, dur: 0.18, vol: 0.06, filtro: { f: 900 } }); },
  muerteMonstruo(grande = false, d = 0, pan = 0) {
    if (!ctx || !efectosOn) return; const k = lejos(d); if (k <= 0) return;
    tono({ f: grande ? 90 : 180, tipo: 'sawtooth', glide: grande ? 30 : 60, dur: grande ? 1.4 : 0.5, vol: (grande ? 0.3 : 0.12) * k, pan, filtro: { f: grande ? 500 : 900, q: 3 }, ecoK: 0.5 });
    ruido({ t: 0.05, dur: grande ? 1 : 0.35, vol: 0.2 * k, f: 400, tipo: 'lowpass', pan, barrido: 80 });
  },
  morir() { if (!ctx || !efectosOn) return; campana(38, 0, 0.3); campana(45, 0.5, 0.18); ruido({ dur: 2, vol: 0.2, f: 200, tipo: 'lowpass', barrido: 60, ecoK: 0.6 }); },
  nivel() { if (!ctx || !efectosOn) return; [62, 65, 69, 74, 77].forEach((n, i) => campana(n, i * 0.12, 0.1)); coro(62, 0.3, 2.5, 0.08, efectosG); },
  oro() { if (!ctx || !efectosOn) return; for (let i = 0; i < 3; i++) tono({ f: 2400 + Math.random() * 900, tipo: 'triangle', t: i * 0.06, dur: 0.18, vol: 0.08, ecoK: 0.2 }); },
  recoger(rareza = 0) {
    if (!ctx || !efectosOn) return;
    if (rareza >= 3) { campana(50, 0, 0.3); campana(57, 0.15, 0.25); campana(62, 0.3, 0.22); coro(50, 0.2, 3, 0.12, efectosG); ruido({ dur: 2, vol: 0.12, f: 6000, q: 0.5, ecoK: 0.8 }); }
    else if (rareza === 2) { [69, 73, 76, 81].forEach((n, i) => campana(n, i * 0.09, 0.12)); }
    else if (rareza === 1) { campana(76, 0, 0.1); campana(81, 0.08, 0.08); }
    else tono({ f: 1300, tipo: 'triangle', dur: 0.12, vol: 0.07 });
  },
  pocion() { if (!ctx || !efectosOn) return; for (let i = 0; i < 4; i++) tono({ f: 300 + i * 70, tipo: 'sine', t: i * 0.07, dur: 0.1, vol: 0.08, glide: 500 + i * 60 }); },
  forja(ok) {
    if (!ctx || !efectosOn) return;
    tono({ f: 1800, tipo: 'square', dur: 0.6, vol: 0.06, filtro: { f: 3000, q: 4 }, ecoK: 0.5 }); ruido({ dur: 0.1, vol: 0.4, f: 3500, q: 2 });
    if (ok) { campana(72, 0.25, 0.14); campana(79, 0.38, 0.1); } else { ruido({ t: 0.25, dur: 0.5, vol: 0.35, f: 900, q: 0.6, barrido: 150 }); tono({ f: 120, t: 0.25, glide: 50, dur: 0.6, vol: 0.2, tipo: 'sawtooth', filtro: { f: 400 } }); }
  },
  hechizo(tipo, d = 0, pan = 0) {
    if (!ctx || !efectosOn) return; const k = lejos(d); if (k <= 0) return;
    if (tipo === 'proyectil' || tipo === 'saeta') ruido({ dur: 0.25, vol: 0.18 * k, f: 4000, q: 2, pan, barrido: 900 });
    else if (tipo === 'lluvia') for (let i = 0; i < 8; i++) ruido({ t: i * 0.05 + Math.random() * 0.03, dur: 0.07, vol: 0.12 * k, f: 2500, q: 3, pan });
    else if (tipo === 'area') { ruido({ dur: 0.4, vol: 0.25 * k, f: 600, q: 1, pan, barrido: 2400 }); tono({ f: 70, glide: 40, dur: 0.5, vol: 0.25 * k, pan }); }
    else if (tipo === 'buff') { [57, 64, 69].forEach((n, i) => tono({ f: hz(n), tipo: 'triangle', t: i * 0.05, dur: 0.9, vol: 0.06 * k, ecoK: 0.6 })); }
    else if (tipo === 'cura') { [69, 72, 76, 81].forEach((n, i) => tono({ f: hz(n), t: i * 0.07, dur: 0.8, vol: 0.06 * k, ecoK: 0.7 })); }
    else if (tipo === 'invocar') { tono({ f: 55, tipo: 'sawtooth', dur: 1.4, vol: 0.2 * k, filtro: { f: 300, q: 4 }, glide: 40, ecoK: 0.6 }); ruido({ dur: 1.2, vol: 0.18 * k, f: 300, tipo: 'lowpass', barrido: 900 }); }
    else if (tipo === 'rayo') { tono({ f: 900, tipo: 'sawtooth', dur: 0.35, vol: 0.08 * k, glide: 120, pan, filtro: { f: 2000, q: 2 } }); ruido({ dur: 0.3, vol: 0.15 * k, f: 1500, q: 1, pan }); }
    else if (tipo === 'pisoton') { tono({ f: 60, glide: 30, dur: 0.8, vol: 0.5 * k, pan, ecoK: 0.5 }); ruido({ dur: 0.7, vol: 0.4 * k, f: 300, tipo: 'lowpass', pan, barrido: 60 }); }
  },
  rugido(d = 0, pan = 0) { if (!ctx || !efectosOn) return; const k = lejos(d * 0.5); tono({ f: 110, tipo: 'sawtooth', glide: 55, dur: 1.6, vol: 0.25 * k, pan, filtro: { f: 700, q: 6 }, ecoK: 0.7 }); ruido({ dur: 1.4, vol: 0.2 * k, f: 500, q: 2, pan, barrido: 150 }); },
  boton() { if (!ctx || !efectosOn) return; tono({ f: 520, tipo: 'triangle', dur: 0.06, vol: 0.05, ecoK: 0.05 }); },
  chat() { if (!ctx || !efectosOn) return; tono({ f: 880, tipo: 'sine', dur: 0.12, vol: 0.05 }); tono({ f: 1320, tipo: 'sine', t: 0.06, dur: 0.12, vol: 0.04 }); },
  anuncio() { if (!ctx || !efectosOn) return; campana(57, 0, 0.12); campana(52, 0.4, 0.1); },
};

// ---------- música ----------
// Ambientes: menu · atalaya · paramo · pelea · jefe · pozo · noche
let ambiente = 'menu', intensidad = 0, raiz = 50, proxAcorde = 0, proxNota = 0, proxGolpe = 0, voces = [];
const ESCALAS = { menor: [0, 2, 3, 5, 7, 8, 10], frigia: [0, 1, 3, 5, 7, 8, 10] };
const AMB = {
  menu: { raiz: 50, escala: 'menor', tempo: 0, coro: true, campanas: 0.3 },
  atalaya: { raiz: 53, escala: 'menor', tempo: 0, coro: false, campanas: 0.25 },
  paramo: { raiz: 50, escala: 'frigia', tempo: 0, coro: true, campanas: 0.15 },
  pelea: { raiz: 50, escala: 'frigia', tempo: 0.62, coro: true, campanas: 0.1 },
  jefe: { raiz: 45, escala: 'frigia', tempo: 0.48, coro: true, campanas: 0.25, tension: true },
  pozo: { raiz: 47, escala: 'frigia', tempo: 0.5, coro: true, campanas: 0.3, tension: true },
  noche: { raiz: 46, escala: 'frigia', tempo: 0.7, coro: true, campanas: 0.4 },
};
export function ponerAmbiente(a) { if (AMB[a] && a !== ambiente) { ambiente = a; proxAcorde = 0; } }

function coro(nota, t, dur, vol, destino) {
  // "Ah" grave: sierras desafinadas por un filtro de voz.
  for (const det of [-7, 0, 6]) {
    const t0 = ahora() + t, o = ctx.createOscillator(), f1 = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter(), env = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = hz(nota); o.detune.value = det;
    f1.type = 'bandpass'; f1.frequency.value = 700; f1.Q.value = 6; f2.type = 'bandpass'; f2.frequency.value = 1150; f2.Q.value = 8;
    const m = ctx.createGain(); m.gain.value = 1; o.connect(f1); o.connect(f2); f1.connect(m); f2.connect(m); m.connect(env);
    env.gain.setValueAtTime(0.0001, t0); env.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.35); env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    env.connect(salida(destino, 1, det / 14, 0.7)); o.start(t0); o.stop(t0 + dur + 0.1);
  }
}

function tickMusica() {
  if (!ctx || !musicaOn) return;
  const A = AMB[ambiente], t = ahora(), esc = ESCALAS[A.escala];
  if (raiz !== A.raiz) raiz = A.raiz;
  // Acordes lentos (cada 8 s): bordón grave + colchón + coro.
  if (t >= proxAcorde) {
    proxAcorde = t + 8;
    const grados = [0, 5, 3, 4, 0, 1, 5, 6], g = grados[Math.floor(Math.random() * grados.length)];
    const n = raiz + esc[g % 7] - 12;
    tono({ f: hz(raiz - 24), tipo: 'sawtooth', dur: 9, vol: 0.09, ataque: 2, destino: musicaG, filtro: { f: 220, q: 1 }, ecoK: 0.4 });
    for (const k of [0, 2, 4]) tono({ f: hz(n + esc[(g + k) % 7] - esc[g % 7] + 12), tipo: 'triangle', dur: 9, vol: 0.035, ataque: 3, destino: musicaG, ecoK: 0.8, pan: (k - 2) / 4 });
    if (A.coro && Math.random() < 0.7) coro(n + 12, 0.5, 7, 0.03, musicaG);
    if (A.tension) tono({ f: hz(raiz - 12 + 1), tipo: 'sawtooth', dur: 9, vol: 0.03, ataque: 4, destino: musicaG, filtro: { f: 500, q: 2 }, ecoK: 0.6 });
  }
  // Campanas sueltas.
  if (t >= proxNota) {
    proxNota = t + 2 + Math.random() * 5;
    if (Math.random() < A.campanas + 0.2) campana(raiz + 12 + esc[Math.floor(Math.random() * 5)], 0, 0.035, musicaG);
  }
  // Tambor grave cuando hay pelea.
  if (A.tempo && t >= proxGolpe) {
    proxGolpe = t + A.tempo;
    const fuerte = Math.floor(t / A.tempo) % 4 === 0;
    tono({ f: fuerte ? 70 : 55, glide: 35, dur: 0.5, vol: fuerte ? 0.22 : 0.12, destino: musicaG, ecoK: 0.5 });
    if (fuerte) ruido({ dur: 0.3, vol: 0.06, f: 200, tipo: 'lowpass', destino: musicaG, ecoK: 0.5 });
  }
}
