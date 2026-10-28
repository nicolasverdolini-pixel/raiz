// El mundo en 3D: el Páramo del Luto. Noche, niebla, árboles muertos, la Atalaya del Farol.
import * as THREE from 'three';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
import * as R from './reglas.js';
import { lib } from './modelos.js';

export const sinBorde = m => { m.userData.outlineParameters = { visible: false }; return m; };
const NIEBLA = '#15191d';

export function crearEscena(canvas) {
  const movil = matchMedia('(pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, movil ? 1.6 : 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  const efecto = new OutlineEffect(renderer, { defaultThickness: 0.004, defaultColor: [0.02, 0.015, 0.01], defaultAlpha: 1 });

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(NIEBLA);
  scene.fog = new THREE.FogExp2(NIEBLA, 0.026);
  const camara = new THREE.PerspectiveCamera(38, 1, 0.5, 75);

  scene.add(new THREE.HemisphereLight('#8a97b0', '#2a1f15', 1.6));
  const luna = new THREE.DirectionalLight('#b3c4e4', 2.3);
  luna.castShadow = true; luna.shadow.mapSize.set(movil ? 1024 : 2048, movil ? 1024 : 2048);
  Object.assign(luna.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 80 });
  luna.shadow.bias = -0.0006; luna.shadow.normalBias = 0.03;
  scene.add(luna, luna.target);

  const terreno = crearTerreno(); scene.add(terreno);
  const agua = new THREE.Mesh(new THREE.CircleGeometry(6.6, 28), sinBorde(new THREE.MeshStandardMaterial({ color: '#16211b', roughness: 0.12, metalness: 0.4, transparent: true, opacity: 0.92 })));
  agua.rotation.x = -Math.PI / 2; agua.position.set(-32, -0.18, 14); agua.receiveShadow = true; scene.add(agua);

  const farol = crearAtalaya(scene);
  const osario = crearOsario(scene, 40, -38, 42, -42, 31);
  const cripta = crearOsario(scene, 64, -66, 64, -72, 57);
  const ceniza = crearCeniza(scene);
  const foso = new THREE.PointLight('#ff2a14', 18, 30, 1.5); foso.position.set(62, 3, 64); scene.add(foso);
  const hemi = scene.children.find(o => o.isHemisphereLight);
  // Ambiente según el evento: normal, marea (ceniza azul) o noche roja (niebla de sangre).
  const AMB = { normal: { niebla: NIEBLA, cielo: '#8a97b0', ceniza: '#b8b2a6' }, marea: { niebla: '#101a24', cielo: '#7fa2c8', ceniza: '#8fd0ff' }, noche: { niebla: '#2a0c0b', cielo: '#b06a62', ceniza: '#ff6a4a' } };
  let amb = 'normal'; const cN = new THREE.Color(NIEBLA), cC = new THREE.Color('#8a97b0'), cA = new THREE.Color('#b8b2a6');
  function ambiente(modo) { amb = AMB[modo] ? modo : 'normal'; }

  function ajustar() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); camara.aspect = w / h;
    camara.fov = w < h ? 52 : 38; camara.updateProjectionMatrix();
  }
  addEventListener('resize', ajustar); ajustar();

  let t = 0;
  function actualizar(dt, foco) {
    t += dt;
    luna.position.set(foco.x - 14, 30, foco.z + 10); luna.target.position.set(foco.x, 0, foco.z);
    farol.luz.intensity = 26 + Math.sin(t * 9) * 3 + Math.sin(t * 23) * 2;
    farol.llama.scale.setScalar(1 + Math.sin(t * 13) * 0.08);
    osario.fuego.intensity = 10 + Math.sin(t * 7 + 1) * 2;
    ceniza.update(dt, foco, t);
    const a = AMB[amb], k = Math.min(1, dt * 0.8);
    cN.lerp(new THREE.Color(a.niebla), k); cC.lerp(new THREE.Color(a.cielo), k); cA.lerp(new THREE.Color(a.ceniza), k);
    scene.fog.color.copy(cN); scene.background.copy(cN); hemi.color.copy(cC); ceniza.mat.color.copy(cA);
    cripta.fuego.intensity = 9 + Math.sin(t * 6) * 2; foso.intensity = 16 + Math.sin(t * 3) * 4;
  }
  return { renderer, efecto, scene, camara, terreno, actualizar, movil, ambiente, poblar: () => poblar(scene) };
}

// ---------- terreno ----------
function crearTerreno() {
  const N = 150, T = R.MUNDO * 2 + 24;
  const geo = new THREE.PlaneGeometry(T, T, N, N); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, R.altura(pos.getX(i), pos.getZ(i)));
  const g = geo.toNonIndexed(), p = g.attributes.position, cols = [], rnd = R.azar(77), c = new THREE.Color();
  const barro = ['#3a342b', '#41392e', '#332f28', '#463d31', '#2e2b25'];
  for (let i = 0; i < p.count; i += 3) {
    const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
    c.set(barro[Math.floor(rnd() * barro.length)]);
    const dP = Math.hypot(x, z);
    if (dP < R.PUEBLO.r + 1) c.set(rnd() < 0.5 ? '#4b4740' : '#55504a');
    else if (R.enCamino(x, z)) c.set(rnd() < 0.5 ? '#54473a' : '#4c4034');
    const dc = Math.hypot(x + 32, z - 14); if (dc < 11) c.lerp(new THREE.Color('#26301f'), Math.max(0, 1 - dc / 11));
    const dh = Math.hypot(x - 40, z + 38); if (dh < 14) c.lerp(new THREE.Color('#5a5650'), Math.max(0, 1 - dh / 14) * 0.8);
    const dv = Math.hypot(x + 6, z + 38); if (dv < 13) c.lerp(new THREE.Color('#3a2219'), Math.max(0, 1 - dv / 13) * 0.6);
    const dn = Math.hypot(x - 36, z - 8); if (dn < 14) c.lerp(new THREE.Color('#3b3a36'), Math.max(0, 1 - dn / 14) * 0.6);
    const zonas = [[-56, 48, 16, '#262a1e', 0.6], [64, -66, 15, '#4a4640', 0.7], [-60, -62, 16, '#2b3020', 0.7], [62, 64, 17, '#3a1612', 0.75]];
    for (const [zx, zz, zr, zc, zk] of zonas) { const d = Math.hypot(x - zx, z - zz); if (d < zr) c.lerp(new THREE.Color(zc), Math.max(0, 1 - d / zr) * zk); }
    c.multiplyScalar(0.85 + rnd() * 0.25);
    for (let k = 0; k < 3; k++) cols.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
  const m = new THREE.Mesh(g, sinBorde(new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 })));
  m.receiveShadow = true; m.name = 'terreno';
  return m;
}

// ---------- escenografía instanciada ----------
function instanciar(scene, nombre, lista, { sombra = true, tinte = null, oscurecer = 1 } = {}) {
  if (!lista.length) return;
  const g = lib[nombre + '.glb'].scene; g.updateMatrixWorld(true);
  const caja = new THREE.Box3().setFromObject(g), tam = new THREE.Vector3(); caja.getSize(tam);
  const alto = Math.max(tam.y, 0.001), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3();
  g.traverse(o => {
    if (!o.isMesh) return;
    let mat = o.material.clone();
    if (mat.color) { if (tinte) mat.color.lerp(new THREE.Color(tinte), 0.5); mat.color.multiplyScalar(oscurecer); }
    mat.flatShading = true; sinBorde(mat);
    const pedazos = new Map();
    for (const it of lista) { const k = Math.floor(it.x / 30) + ',' + Math.floor(it.z / 30); if (!pedazos.has(k)) pedazos.set(k, []); pedazos.get(k).push(it); }
    for (const grupo of pedazos.values()) {
      const im = new THREE.InstancedMesh(o.geometry, mat, grupo.length);
      grupo.forEach((it, i) => {
        const k = it.alto / alto;
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), it.giro); s.set(k, k * (it.estira || 1), k); v.set(it.x, R.altura(it.x, it.z) - 0.05, it.z);
        m4.compose(v, q, s).multiply(o.matrixWorld);
        im.setMatrixAt(i, m4);
      });
      im.computeBoundingSphere();
      im.castShadow = sombra; im.receiveShadow = true;
      scene.add(im);
    }
  });
}

function poblar(scene) {
  const rnd = R.azar(4242);
  const libre = (x, z, margen = 0) => {
    if (Math.hypot(x, z) < R.PUEBLO.r + 4 + margen) return false;
    if (R.enCamino(x, z)) return false;
    if (Math.hypot(x + 32, z - 14) < 8) return false;
    for (const l of R.MAPA.lugares) if (Math.hypot(x - l.x, z - l.z) < 5 + margen) return false;
    return true;
  };
  const arboles = ['CommonTree_Dead_1', 'CommonTree_Dead_2', 'CommonTree_Dead_3', 'CommonTree_Dead_5', 'BirchTree_Dead_1', 'BirchTree_Dead_3', 'Willow_Dead_1', 'Willow_Dead_2', 'Willow_Dead_4'];
  const grupos = Object.fromEntries([...arboles, 'Rock_1', 'Rock_2', 'Rock_3', 'Rock_5', 'Rock_Moss_1', 'TreeStump', 'TreeStump_Moss', 'WoodLog', 'WoodLog_Moss', 'Bush_1', 'Grass'].map(n => [n, []]));
  const poner = (n, x, z, alto, extra = {}) => grupos[n].push({ x, z, alto, giro: rnd() * 6.28, ...extra });
  // Bosque muerto en el borde y salpicado adentro.
  for (let i = 0; i < 700; i++) {
    const x = (rnd() * 2 - 1) * (R.MUNDO + 8), z = (rnd() * 2 - 1) * (R.MUNDO + 8);
    const borde = Math.max(Math.abs(x), Math.abs(z)) > R.MUNDO - 10;
    if (!borde && (rnd() < 0.55 || !libre(x, z, 2))) continue;
    poner(arboles[Math.floor(rnd() * arboles.length)], x, z, 4.5 + rnd() * 4.5);
  }
  for (let i = 0; i < 340; i++) { const x = (rnd() * 2 - 1) * R.MUNDO, z = (rnd() * 2 - 1) * R.MUNDO; if (libre(x, z)) poner(['Rock_1', 'Rock_2', 'Rock_3', 'Rock_5', 'Rock_Moss_1'][i % 5], x, z, 0.4 + rnd() * 1.4); }
  for (let i = 0; i < 150; i++) { const x = (rnd() * 2 - 1) * R.MUNDO, z = (rnd() * 2 - 1) * R.MUNDO; if (libre(x, z)) poner(['TreeStump', 'TreeStump_Moss', 'WoodLog', 'WoodLog_Moss'][i % 4], x, z, 0.5 + rnd() * 0.4); }
  for (let i = 0; i < 240; i++) { const x = (rnd() * 2 - 1) * R.MUNDO, z = (rnd() * 2 - 1) * R.MUNDO; if (libre(x, z)) poner('Bush_1', x, z, 0.5 + rnd() * 0.6); }
  for (let i = 0; i < 500; i++) { const x = (rnd() * 2 - 1) * R.MUNDO, z = (rnd() * 2 - 1) * R.MUNDO; if (Math.hypot(x, z) > R.PUEBLO.r && !R.enCamino(x, z)) poner('Grass', x, z, 0.35 + rnd() * 0.4); }
  for (const [n, lista] of Object.entries(grupos)) {
    const arbol = arboles.includes(n);
    instanciar(scene, n, lista, { sombra: n !== 'Grass', tinte: arbol ? '#2a2420' : n === 'Grass' || n === 'Bush_1' ? '#3d4128' : '#55524c', oscurecer: arbol ? 0.7 : 0.8 });
  }
}

// ---------- Atalaya del Farol (zona segura) ----------
function crearAtalaya(scene) {
  const piedra = sinBorde(new THREE.MeshStandardMaterial({ color: '#4a4741', roughness: 0.95, flatShading: true }));
  const hierro = sinBorde(new THREE.MeshStandardMaterial({ color: '#1d1b19', roughness: 0.6, metalness: 0.6, flatShading: true }));
  const base = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.6, 0.35, 10), piedra); base.position.y = 0.1; base.receiveShadow = true; scene.add(base);
  const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 4.2, 6), hierro); poste.position.y = 2.2; poste.castShadow = true; scene.add(poste);
  const brazo = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.1), hierro); brazo.position.set(0.5, 4.1, 0); scene.add(brazo);
  const jaula = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.6, 6, 1, true), hierro); jaula.position.set(1.05, 3.7, 0); scene.add(jaula);
  const llama = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), sinBorde(new THREE.MeshBasicMaterial({ color: '#ffb35c' })));
  llama.position.set(1.05, 3.7, 0); scene.add(llama);
  const luz = new THREE.PointLight('#ff8a3d', 26, 22, 1.6); luz.position.set(1.05, 3.6, 0); luz.castShadow = false; scene.add(luz);
  // Pilares rotos alrededor.
  const rnd = R.azar(9);
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2 + 0.3, h = 1 + rnd() * 2.6;
    const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, h, 6), piedra);
    pil.position.set(Math.cos(a) * 7.2, h / 2 + R.altura(Math.cos(a) * 7.2, Math.sin(a) * 7.2) - 0.1, Math.sin(a) * 7.2);
    pil.rotation.z = (rnd() - 0.5) * 0.15; pil.castShadow = true; pil.receiveShadow = true; scene.add(pil);
  }
  return { luz, llama };
}

// ---------- Osario: tumbas y cruces ----------
function crearOsario(scene, cx, cz, jx, jz, semilla) {
  const rnd = R.azar(semilla), mat = sinBorde(new THREE.MeshStandardMaterial({ color: '#6d6962', roughness: 1, flatShading: true }));
  const losa = new THREE.BoxGeometry(0.7, 1.0, 0.16), cruzV = new THREE.BoxGeometry(0.14, 1.3, 0.14), cruzH = new THREE.BoxGeometry(0.6, 0.12, 0.12);
  const n = 46, a = new THREE.InstancedMesh(losa, mat, n), b = new THREE.InstancedMesh(cruzV, mat, n), c = new THREE.InstancedMesh(cruzH, mat, n);
  const m4 = new THREE.Matrix4(), e = new THREE.Euler(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    let x, z; do { x = cx + (rnd() * 2 - 1) * 13; z = cz + (rnd() * 2 - 1) * 13; } while (Math.hypot(x - jx, z - jz) < 6);
    const y = R.altura(x, z);
    e.set((rnd() - 0.5) * 0.4, rnd() * 6.28, (rnd() - 0.5) * 0.4); q.setFromEuler(e);
    const esCruz = rnd() < 0.45;
    v.set(x, y + 0.4, z); m4.compose(v, q, s); a.setMatrixAt(i, esCruz ? m4.clone().makeScale(0, 0, 0) : m4);
    v.set(x, y + 0.55, z); m4.compose(v, q, s); b.setMatrixAt(i, esCruz ? m4 : m4.clone().makeScale(0, 0, 0));
    v.set(0, 0.3, 0).applyQuaternion(q).add(new THREE.Vector3(x, y + 0.55, z)); m4.compose(v, q, s); c.setMatrixAt(i, esCruz ? m4 : m4.clone().makeScale(0, 0, 0));
  }
  for (const im of [a, b, c]) { im.castShadow = true; im.receiveShadow = true; scene.add(im); }
  const fuego = new THREE.PointLight('#c2402a', 10, 18, 1.8); fuego.position.set(jx, 2.5, jz); scene.add(fuego);
  return { fuego };
}

// ---------- ceniza flotando alrededor de la cámara ----------
function crearCeniza(scene) {
  const n = 380, pos = new Float32Array(n * 3), vel = new Float32Array(n * 3), rnd = Math.random;
  for (let i = 0; i < n; i++) { pos[i * 3] = (rnd() - 0.5) * 50; pos[i * 3 + 1] = rnd() * 14; pos[i * 3 + 2] = (rnd() - 0.5) * 50; vel[i * 3] = (rnd() - 0.5) * 0.4; vel[i * 3 + 1] = -0.2 - rnd() * 0.4; vel[i * 3 + 2] = (rnd() - 0.5) * 0.4; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32);
  const mat = new THREE.PointsMaterial({ size: 0.13, map: new THREE.CanvasTexture(c), color: '#b8b2a6', transparent: true, opacity: 0.55, depthWrite: false });
  const puntos = new THREE.Points(g, mat); puntos.frustumCulled = false; scene.add(puntos);
  return {
    mat,
    update(dt, foco, t) {
      for (let i = 0; i < n; i++) {
        let px = pos[i * 3] + (vel[i * 3] + Math.sin(t * 0.5 + i) * 0.3) * dt, py = pos[i * 3 + 1] + vel[i * 3 + 1] * dt, pz = pos[i * 3 + 2] + vel[i * 3 + 2] * dt;
        if (py < 0 || Math.abs(px - foco.x) > 25 || Math.abs(pz - foco.z) > 25) { px = foco.x + (rnd() - 0.5) * 50; py = 10 + rnd() * 4; pz = foco.z + (rnd() - 0.5) * 50; }
        pos[i * 3] = px; pos[i * 3 + 1] = py; pos[i * 3 + 2] = pz;
      }
      g.attributes.position.needsUpdate = true;
    },
  };
}
