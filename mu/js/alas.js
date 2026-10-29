// Alas en la espalda, hechas a mano para el juego (no usan modelos de nadie).
// 1 · Ceniza: membrana gris rota · 2 · Luto: negras con venas rojas · 3 · Sol Hondo: brasa con varillas de oro y halo.
import * as THREE from 'three';

// Punta de cada varilla (ala derecha, en metros, el hombro en 0,0) y cuánto se mete la membrana entre una y otra.
const PUNTAS = [[1.25, 0.62], [1.18, -0.12], [0.86, -0.5], [0.42, -0.62]];
const ESTILO = [
  null,
  { piel: '#6e6862', brillo: null, varilla: '#3a3532', luz: null, op: 0.93, rota: true, tam: 1.1 },
  { piel: '#141012', brillo: '#5a0a08', varilla: '#ff2a1a', luz: 1.6, op: 0.96, tam: 1.3 },
  { piel: '#6a2a08', brillo: '#ff6a10', varilla: '#ffd860', luz: 3, op: 0.97, tam: 1.5, halo: '#ffb040' },
];

function forma(rota) {
  const s = new THREE.Shape();
  s.moveTo(0, 0.08);
  s.quadraticCurveTo(0.55, 0.62, PUNTAS[0][0], PUNTAS[0][1]);
  for (let i = 1; i < PUNTAS.length; i++) {
    const [ax, ay] = PUNTAS[i - 1], [bx, by] = PUNTAS[i];
    const mx = (ax + bx) / 2 * 0.78, my = (ay + by) / 2 * 0.78;   // la membrana se mete hacia el hombro
    if (rota && i === 2) { s.lineTo(mx + 0.12, my + 0.02); s.lineTo(mx, my - 0.06); s.lineTo(mx - 0.05, my + 0.05); }
    s.quadraticCurveTo(mx, my, bx, by);
  }
  s.quadraticCurveTo(0.1, -0.3, 0, -0.08);
  return new THREE.ShapeGeometry(s, 10);
}

function varilla(a, b, grosor, mat) {
  const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(grosor * 0.6, grosor, d.length(), 5), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}

function unaAla(nivel) {
  const e = ESTILO[nivel], g = new THREE.Group();
  const piel = new THREE.MeshStandardMaterial({ color: e.piel, roughness: 0.9, side: THREE.DoubleSide, transparent: e.op < 1, opacity: e.op, emissive: e.brillo || '#000000', emissiveIntensity: e.brillo ? (e.halo ? 0.9 : 0.6) : 0 });
  piel.userData.outlineParameters = { thickness: 0.003, color: [0.02, 0.015, 0.01], alpha: 1 };
  g.add(new THREE.Mesh(forma(e.rota), piel));
  const mv = new THREE.MeshStandardMaterial({ color: e.varilla, emissive: e.luz ? e.varilla : '#000000', emissiveIntensity: e.luz || 0, roughness: 0.6 });
  mv.userData.outlineParameters = { visible: false };
  const hombro = new THREE.Vector3(0.02, 0.02, 0.01), codo = new THREE.Vector3(0.5, 0.5, 0.01);
  g.add(varilla(hombro, codo, 0.035, mv));
  for (const [x, y] of PUNTAS) g.add(varilla(codo, new THREE.Vector3(x, y, 0.01), 0.018, mv));
  if (e.halo) {
    const halo = new THREE.Mesh(forma(false), new THREE.MeshBasicMaterial({ color: e.halo, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    halo.material.userData.outlineParameters = { visible: false };
    halo.scale.setScalar(1.12); halo.position.set(-0.04, 0, -0.02); g.add(halo);
    g.userData.halo = halo;
  }
  return g;
}

// Devuelve el grupo con las dos alas (se cuelga en la espalda del personaje).
export function crearAlas(nivel) {
  const e = ESTILO[nivel]; if (!e) return null;
  const raiz = new THREE.Group(), lados = [];
  for (const lado of [1, -1]) {
    const piv = new THREE.Group(), ala = unaAla(nivel);
    ala.scale.set(lado * e.tam, e.tam, e.tam);
    piv.add(ala); piv.position.x = lado * 0.08; raiz.add(piv); lados.push({ piv, lado });
  }
  raiz.userData = { lados, nivel, t: Math.random() * 6 };
  return raiz;
}

// Aleteo: lento cuando estás quieto, fuerte cuando corrés. El halo del Sol Hondo late.
export function animarAlas(raiz, dt, corre) {
  const u = raiz.userData; u.t += dt * (corre ? 7 : 1.8);
  const abre = Math.sin(u.t) * (corre ? 0.45 : 0.18);
  for (const { piv, lado } of u.lados) { piv.rotation.y = lado * (0.55 + abre); piv.rotation.z = lado * (0.18 + abre * 0.3); }
  if (u.nivel === 3) for (const { piv } of u.lados) { const h = piv.children[0].userData.halo; if (h) h.material.opacity = 0.26 + Math.sin(u.t * 1.7) * 0.1; }
}
