// Efectos: sangre y chispas al pegar, anillos, marca del objetivo, subir de nivel, muralla.
import * as THREE from 'three';
import { sinBorde } from './escena.js';

export function crearEfectos(scene) {
  // ---- partículas (sangre, chispas, polvo) ----
  const MAX = 700;
  const pos = new Float32Array(MAX * 3), col = new Float32Array(MAX * 3), vel = new Float32Array(MAX * 3), vida = new Float32Array(MAX), grav = new Float32Array(MAX);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const tex = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); })();
  const puntos = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.22, map: tex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  const sangreP = new THREE.Points(g.clone(), new THREE.PointsMaterial({ size: 0.2, map: tex, color: '#6e0a0a', transparent: true, depthWrite: false }));
  puntos.frustumCulled = false; sangreP.frustumCulled = false; scene.add(puntos);
  let sig = 0; const c = new THREE.Color();
  function soltar(x, y, z, n, color, rapidez = 4, gravedad = 9, dur = 0.6) {
    c.set(color);
    for (let k = 0; k < n; k++) {
      const i = sig; sig = (sig + 1) % MAX;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      const a = Math.random() * 6.28, u = Math.random() * 2 - 1, r = rapidez * (0.4 + Math.random() * 0.8);
      vel[i * 3] = Math.cos(a) * Math.sqrt(1 - u * u) * r; vel[i * 3 + 1] = Math.abs(u) * r + 1.5; vel[i * 3 + 2] = Math.sin(a) * Math.sqrt(1 - u * u) * r;
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; vida[i] = dur * (0.6 + Math.random() * 0.6); grav[i] = gravedad;
    }
  }

  // ---- anillos y destellos temporales ----
  const vivos = [];
  const anilloGeo = new THREE.RingGeometry(0.85, 1, 40); anilloGeo.rotateX(-Math.PI / 2);
  function anillo(x, y, z, color, { dur = 0.5, desde = 0.3, hasta = 3, opac = 0.9 } = {}) {
    const m = new THREE.Mesh(anilloGeo, sinBorde(new THREE.MeshBasicMaterial({ color, transparent: true, opacity: opac, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })));
    m.position.set(x, y + 0.08, z); scene.add(m);
    vivos.push({ m, t: 0, dur, upd: k => { const s = desde + (hasta - desde) * (1 - (1 - k) ** 3); m.scale.set(s, 1, s); m.material.opacity = opac * (1 - k); } });
  }
  const columnaGeo = new THREE.CylinderGeometry(0.7, 0.9, 6, 16, 1, true);
  function columna(x, y, z, color, dur = 1.4) {
    const m = new THREE.Mesh(columnaGeo, sinBorde(new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })));
    m.position.set(x, y + 3, z); scene.add(m);
    vivos.push({ m, t: 0, dur, upd: k => { m.material.opacity = 0.5 * Math.sin(k * Math.PI); m.scale.set(1 - k * 0.5, 1, 1 - k * 0.5); } });
  }
  const tajoGeo = new THREE.RingGeometry(1.6, 3.2, 40, 1, 0, Math.PI * 1.6); tajoGeo.rotateX(-Math.PI / 2);
  function tajo(x, y, z) {
    const m = new THREE.Mesh(tajoGeo, sinBorde(new THREE.MeshBasicMaterial({ color: '#d8d2c4', transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })));
    m.position.set(x, y + 0.9, z); scene.add(m);
    vivos.push({ m, t: 0, dur: 0.45, upd: k => { m.rotation.y = -k * 7; m.material.opacity = 0.7 * (1 - k); } });
  }

  // ---- marca del objetivo (anillo rojo que gira) ----
  const marca = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.9, 6), sinBorde(new THREE.MeshBasicMaterial({ color: '#b3261e', transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide })));
  marca.rotation.x = -Math.PI / 2; marca.visible = false; scene.add(marca);

  // ---- aura de muralla ----
  const auraGeo = new THREE.IcosahedronGeometry(1.15, 1);
  const auraMat = sinBorde(new THREE.MeshBasicMaterial({ color: '#7f95b8', wireframe: true, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  auraMat.wireframe = true;

  // ---- proyectiles (rayos de magos y jefes) ----
  const COLORES = { violeta: '#a46cff', verde: '#6fdc5a', ambar: '#ffb347', rojo: '#ff3b2a' };
  const bolaGeo = new THREE.IcosahedronGeometry(0.24, 1);
  function proyectil(a, b, nombre, radio) {
    const color = COLORES[nombre] || nombre;
    const m = new THREE.Mesh(bolaGeo, sinBorde(new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })));
    scene.add(m);
    const dur = Math.min(0.55, 0.12 + Math.hypot(b.x - a.x, b.z - a.z) * 0.035);
    vivos.push({ m, t: 0, dur, upd: k => {
      m.position.set(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k + Math.sin(k * Math.PI) * 0.8, a.z + (b.z - a.z) * k);
      if (Math.random() < 0.7) soltar(m.position.x, m.position.y, m.position.z, 1, color, 0.5, 0, 0.3);
      if (k >= 1) { soltar(b.x, b.y, b.z, 18, color, 4, 4, 0.5); if (radio) anillo(b.x, b.y - 0.9, b.z, color, { dur: 0.6, hasta: radio, opac: 0.8 }); }
    } });
  }

  let t = 0;
  return {
    proyectil,
    invocar(x, y, z) { anillo(x, y, z, '#6b1a12', { dur: 0.9, hasta: 4, opac: 1 }); soltar(x, y + 0.3, z, 24, '#3b1410', 3, 2, 0.9); },
    furia(x, y, z) { anillo(x, y, z, '#ff3b2a', { dur: 0.8, hasta: 5 }); soltar(x, y + 1, z, 40, '#ff4a2a', 5, 3, 0.8); },
    sangre(x, y, z, fuerte) { soltar(x, y, z, fuerte ? 26 : 12, '#8a0f0f', fuerte ? 5 : 3.5, 12, 0.7); soltar(x, y, z, fuerte ? 10 : 4, '#ffcf8a', 5, 6, 0.25); },
    chispas(x, y, z, color = '#ffcf8a', n = 10) { soltar(x, y, z, n, color, 4, 6, 0.35); },
    polvo(x, y, z) { soltar(x, y, z, 40, '#5d5548', 6, 3, 0.8); anillo(x, y, z, '#8c7f6a', { dur: 0.6, hasta: 5 }); },
    nivel(x, y, z) { columna(x, y, z, '#c9b47a'); anillo(x, y, z, '#c9b47a', { dur: 1.1, hasta: 3.5 }); soltar(x, y + 0.5, z, 40, '#d9c98e', 3, -2, 1.2); },
    tajo(x, y, z) { tajo(x, y, z); },
    golpeSuelo(x, y, z, color) { anillo(x, y, z, color, { dur: 0.35, hasta: 1.6 }); },
    nace(x, y, z) { soltar(x, y, z, 30, '#4c4a45', 3, 2, 0.9); anillo(x, y, z, '#6b2a20', { dur: 0.8, hasta: 2.5 }); },
    crearAura() { const m = new THREE.Mesh(auraGeo, auraMat); m.visible = false; return m; },
    marcar(obj, radio) {
      if (!obj) { marca.visible = false; return; }
      marca.visible = true; marca.position.set(obj.position.x, obj.position.y + 0.06, obj.position.z); marca.scale.setScalar(radio);
    },
    update(dt) {
      t += dt;
      for (let i = 0; i < MAX; i++) {
        if (vida[i] <= 0) { if (pos[i * 3 + 1] > -50) pos[i * 3 + 1] = -100; continue; }
        vida[i] -= dt; vel[i * 3 + 1] -= grav[i] * dt;
        pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        const k = Math.max(0, vida[i]) * 3; col[i * 3] *= k < 1 ? 0.92 : 1; col[i * 3 + 1] *= k < 1 ? 0.92 : 1; col[i * 3 + 2] *= k < 1 ? 0.92 : 1;
      }
      g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true;
      for (let i = vivos.length - 1; i >= 0; i--) {
        const v = vivos[i]; v.t += dt; const k = Math.min(1, v.t / v.dur); v.upd(k);
        if (k >= 1) { scene.remove(v.m); v.m.material.dispose(); vivos.splice(i, 1); }
      }
      marca.rotation.z += dt * 1.5; auraMat.opacity = 0.25 + Math.sin(t * 6) * 0.1;
    },
  };
}
