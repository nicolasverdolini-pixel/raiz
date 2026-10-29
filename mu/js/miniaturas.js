// Fotos de los objetos, todas en 3D y con la misma luz: armas y escudos (KayKit, CC0), armaduras (piezas de los
// personajes), bestias (sus propios modelos), alas (las del juego) y pociones, gemas y velas hechas acá con geometría.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import * as O from './objetos.js';
import { lib, VISUAL } from './modelos.js';
import { crearAlas } from './alas.js';

const cargador = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
// Qué modelo usa cada arma según su nivel (1 a 4).
const MODELO = {
  espada: ['sword_1handed', 'sword_1handed', 'sword_2handed', 'sword_2handed', 'sword_2handed'],
  ballesta: ['crossbow_1handed', 'crossbow_1handed', 'crossbow_2handed', 'crossbow_2handed', 'crossbow_2handed'],
  baculo: ['staff', 'staff', 'staff', 'staff', 'staff'],
  hacha: ['axe_1handed', 'axe_1handed', 'axe_2handed', 'axe_2handed', 'axe_2handed'],
  dagas: ['dagger', 'dagger', 'dagger', 'dagger', 'dagger'],
  cetro: ['wand', 'wand', '../baculo_hueso', '../baculo_hueso', '../baculo_hueso'],
  escudo: ['shield_round', 'shield_badge', 'shield_square', 'shield_spikes', 'shield_spikes'],
  garras: ['dagger', 'dagger', '../hoja_hueso', '../hoja_hueso', '../hoja_hueso'],
};
// Armaduras: se sacan las piezas de los personajes y esqueletos (KayKit, CC0). Cada nivel usa otra pieza.
const L = n => [n + 'Left', n + 'Right'];
const PIEZA = {
  casco: [['degollador.glb', ['Skeleton_Rogue_Hood']], ['guardian.glb', ['Knight_Helmet']], ['barbaro.glb', ['Barbarian_Hat']], ['centinela.glb', ['Skeleton_Warrior_Helmet']], ['guardian.glb', ['Knight_Helmet']]],
  armadura: [['cazadora.glb', ['Rogue_Body']], ['guardian.glb', ['Knight_Body']], ['degollador.glb', ['Skeleton_Rogue_Body', 'Skeleton_Rogue_Cape']], ['barbaro.glb', ['Barbarian_Body']], ['centinela.glb', ['Skeleton_Warrior_Body', 'Skeleton_Warrior_Cloak']]],
  guantes: [['cazadora.glb', ['Rogue_ArmRight']], ['guardian.glb', ['Knight_ArmRight']], ['arcanista.glb', ['Mage_ArmRight']], ['barbaro.glb', ['Barbarian_ArmRight']], ['centinela.glb', ['Skeleton_Warrior_ArmRight']]],
  botas: [['cazadora.glb', L('Rogue_Leg')], ['guardian.glb', L('Knight_Leg')], ['degollador.glb', L('Skeleton_Rogue_Leg')], ['barbaro.glb', L('Barbarian_Leg')], ['centinela.glb', L('Skeleton_Warrior_Leg')]],
};
const SETS = ['cuero', 'vigia', 'osario', 'foso', 'velo'];
const TINTE_TIER = [null, '#8fa8c8', '#5a4a52', '#7a2420', '#3a6a8a'];

let renderer, scene, camara;
const modelos = {}, fotos = {}, pedidos = {};
let alListo = null;
export function alTerminar(f) { alListo = f; }

const TAM = 160;
function preparar() {
  if (renderer) return;
  const c = document.createElement('canvas'); c.width = c.height = TAM;
  renderer = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(TAM, TAM, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene();
  // Luz de vela de arriba a la izquierda, contraluz frío atrás: como un objeto sobre una mesa en la oscuridad.
  scene.add(new THREE.HemisphereLight('#ffe8c8', '#1a1010', 1.3));
  const d = new THREE.DirectionalLight('#ffd8a8', 3.2); d.position.set(-2, 3, 3); scene.add(d);
  const r = new THREE.DirectionalLight('#8fb2ff', 2.2); r.position.set(2.5, 1, -3); scene.add(r);
  camara = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
}

// ---------- pociones, gemas, velas, sellos y monedas hechos con geometría ----------
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.1, ...o });
function frasco(liquido) {
  const g = new THREE.Group();
  const perfil = [[0, -0.5], [0.32, -0.48], [0.42, -0.3], [0.44, -0.05], [0.36, 0.15], [0.14, 0.25], [0.12, 0.42], [0.15, 0.46], [0.15, 0.5], [0, 0.5]].map(([x, y]) => new THREE.Vector2(x, y));
  const vidrio = new THREE.Mesh(new THREE.LatheGeometry(perfil, 18), mat('#c8d8e0', { transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.3, side: THREE.DoubleSide }));
  const liq = new THREE.Mesh(new THREE.LatheGeometry(perfil.slice(0, 5).map(v => new THREE.Vector2(v.x * 0.92, v.y)).concat([new THREE.Vector2(0, -0.05)]), 18), mat(liquido, { emissive: liquido, emissiveIntensity: 0.9, roughness: 0.2 }));
  const corcho = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.18, 10), mat('#7a5232', { roughness: 0.9 })); corcho.position.y = 0.56;
  const cuerda = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.025, 6, 14), mat('#a08060')); cuerda.rotation.x = Math.PI / 2; cuerda.position.y = 0.38;
  g.add(liq, vidrio, corcho, cuerda); return g;
}
function cristal(color, forma = 'oct') {
  const g = new THREE.Group();
  const geo = forma === 'oct' ? new THREE.OctahedronGeometry(0.45, 0) : forma === 'dod' ? new THREE.DodecahedronGeometry(0.42, 0) : new THREE.IcosahedronGeometry(0.42, 0);
  const m = new THREE.Mesh(geo, mat(color, { emissive: color, emissiveIntensity: 0.55, roughness: 0.15, metalness: 0.4, flatShading: true }));
  if (forma === 'oct') m.scale.set(0.8, 1.25, 0.8);
  const brillo = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), mat('#ffffff', { emissive: color, emissiveIntensity: 2 })); brillo.position.set(-0.12, 0.18, 0.3);
  g.add(m, brillo); return g;
}
function vela() {
  const g = new THREE.Group();
  const cera = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.75, 12), mat('#e8dcc0', { roughness: 0.8 }));
  const gota = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), mat('#e8dcc0')); gota.position.set(0.15, 0.2, 0.05);
  const plato = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.06, 14), mat('#6a5a40', { metalness: 0.7, roughness: 0.4 })); plato.position.y = -0.4;
  const llama = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.26, 8), mat('#ffb040', { emissive: '#ff9020', emissiveIntensity: 3 })); llama.position.y = 0.52;
  g.add(cera, gota, plato, llama); return g;
}
function sello() {
  const g = new THREE.Group();
  const disco = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.47, 0.12, 20), mat('#7a1410', { roughness: 0.5 })); disco.rotation.x = Math.PI / 2;
  const aro = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.035, 6, 20), mat('#a02018'));
  const craneo = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), mat('#a02018')); craneo.scale.set(1, 1.1, 0.5); craneo.position.set(0, 0.04, 0.06);
  const cinta = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.5, 0.02), mat('#2a2220')); cinta.position.set(0.12, -0.42, -0.04); cinta.rotation.z = 0.3;
  g.add(cinta, disco, aro, craneo); return g;
}
function monedas() {
  const g = new THREE.Group(), m = mat('#e6b84a', { metalness: 0.9, roughness: 0.3 });
  for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.07, 18), m); c.position.set((i % 2) * 0.08 - 0.04, -0.3 + i * 0.08, 0); c.rotation.z = (i % 3 - 1) * 0.08; g.add(c); }
  const suelta = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.07, 18), m); suelta.position.set(0.32, -0.2, 0.2); suelta.rotation.set(1.1, 0, 0.3); g.add(suelta);
  return g;
}
const PROC = { pocion: () => frasco('#c0201a'), eter: () => frasco('#2a6ae0'), vela, sello, oro: monedas,
  forja: () => cristal('#e0a030'), destino: () => cristal('#8a4ae0', 'ico'), abismo: () => cristal('#d01830', 'oct'), guardiana: () => cristal('#4a9ad0', 'dod') };

function clave(it) { return it.b + ':' + O.rareza(it); }
export function modeloDe(b) {
  if (PROC[b]) return { proc: PROC[b], t: 0 };
  const base = O.BASES[b]; if (!base?.r) return null;
  if (base.ala) return { alas: base.ala, t: 0 };
  if (base.bestia) { const k = (base.r === 'mascota' ? 'pet_' : 'mon_') + b; return VISUAL[k] ? { bicho: k, t: 0 } : null; }
  if (PIEZA[base.r]) { const t = SETS.indexOf(b.split('_')[1]); return t >= 0 ? { pieza: PIEZA[base.r][t], t } : null; }
  const tipo = base.r === 'escudo' ? 'escudo' : b.replace(/\d+$/, '');
  const t = (+b.match(/(\d+)$/)?.[1] || 1) - 1;
  return MODELO[tipo] ? { archivo: MODELO[tipo][t], t } : null;
}

// Retrato del personaje (cabeza y hombros) para el botón de la mochila.
export function retrato(clase) {
  const k = 'retrato:' + clase;
  if (fotos[k]) return fotos[k];
  if (!pedidos[k]) pedidos[k] = sacarRetrato(clase).then(url => { fotos[k] = url; alListo?.(); }).catch(() => { setTimeout(() => delete pedidos[k], 3000); });
  return null;
}
async function sacarRetrato(clase) {
  preparar();
  const v = VISUAL[clase]; if (!v || !lib[v.archivo]) throw new Error('sin modelo');
  const g = SkeletonUtils.clone(lib[v.archivo].scene);
  g.traverse(o => { if (o.isMesh) { o.material = (Array.isArray(o.material) ? o.material[0] : o.material).clone(); if (v.tinte && o.material.color) o.material.color.lerp(new THREE.Color(v.tinte), v.tinteK || 0.55); } });
  g.updateMatrixWorld(true);
  const caja = new THREE.Box3(); g.traverse(o => { if (o.isMesh) caja.expandByObject(o, true); });
  const alto = caja.max.y - caja.min.y, cy = caja.max.y - alto * 0.24;
  const piv = new THREE.Group(); piv.add(g); g.position.set(0, -cy, 0); piv.rotation.y = 0.35;
  scene.add(piv);
  camara.position.set(0, alto * 0.02, alto * 0.95); camara.lookAt(0, 0, 0);
  renderer.setClearColor(0x000000, 0); renderer.render(scene, camara); scene.remove(piv);
  return renderer.domElement.toDataURL('image/png');
}

// Devuelve la foto (dataURL) si ya está; si no, la pide y avisa cuando termina.
export function foto(it) {
  const k = clave(it);
  if (fotos[k]) return fotos[k];
  const m = modeloDe(it.b); if (!m) return null;
  if (!pedidos[k]) pedidos[k] = sacar(it, m).then(url => { fotos[k] = url; alListo?.(); }).catch(() => { setTimeout(() => delete pedidos[k], 3000); });
  return null;
}

async function sacar(it, m) {
  preparar();
  let g;
  if (m.proc) g = m.proc();
  else if (m.alas) { g = crearAlas(m.alas); g.rotation.y = Math.PI; }
  else if (m.bicho) {
    const v = VISUAL[m.bicho]; if (!lib[v.archivo]) throw new Error('sin modelo');
    g = SkeletonUtils.clone(lib[v.archivo].scene);
    g.traverse(o => { if (o.isMesh && v.tinte) { o.material = (Array.isArray(o.material) ? o.material[0] : o.material).clone(); o.material.color?.lerp(new THREE.Color(v.tinte), v.tinteK || 0.55); } });
  } else if (m.pieza) {
    const [archivo, nombres] = m.pieza; if (!lib[archivo]) throw new Error('sin modelo');
    g = SkeletonUtils.clone(lib[archivo].scene);
    g.traverse(o => { if (o.isMesh) o.visible = false; });
    g.traverse(o => { if (nombres.includes(o.name)) o.traverse(x => { if (x.isMesh) x.visible = true; }); });
  } else {
    const ruta = 'modelos/armas/' + m.archivo + '.glb';
    if (!modelos[ruta]) modelos[ruta] = cargador.loadAsync(ruta);
    g = (await modelos[ruta]).scene.clone(true);
  }
  const ra = O.rareza(it), colorR = ra ? new THREE.Color(O.RAREZAS[ra].color) : null;
  g.traverse(o => {
    if (!o.isMesh) return;
    if (Array.isArray(o.material)) o.material = o.material[0];
    if (!m.proc) o.material = o.material.clone();
    if (TINTE_TIER[m.t] && o.material.color) o.material.color.lerp(new THREE.Color(TINTE_TIER[m.t]), 0.35);
    if (colorR && o.material.emissive) { o.material.emissive.copy(colorR); o.material.emissiveIntensity = 0.35 + ra * 0.12; }
  });
  g.updateMatrixWorld(true);
  const caja = new THREE.Box3(); g.traverse(o => { if (o.isMesh && o.visible) caja.expandByObject(o, true); });
  const centro = caja.getCenter(new THREE.Vector3()), tam = caja.getSize(new THREE.Vector3());
  g.position.sub(centro);
  const piv = new THREE.Group(); piv.add(g);
  const largo = Math.max(tam.x, tam.y, tam.z);
  if (!m.pieza && tam.y >= tam.x && tam.y >= tam.z) piv.rotation.z = -Math.PI / 4;       // armas largas, cruzadas
  piv.rotation.y = m.pieza ? 0.35 : m.bicho ? 0.9 : m.proc ? 0.3 : 0.5; if (m.pieza || m.proc) piv.rotation.x = 0.15;
  if (m.pieza && tam.x > tam.y * 1.8) { piv.rotation.set(0.15, 0.2, Math.PI / 2.4); }   // brazo estirado: parado
  scene.add(piv);
  camara.position.set(0, 0, largo * (m.proc ? 2.3 : 2.1)); camara.lookAt(0, 0, 0);
  renderer.setClearColor(0x000000, 0);
  renderer.render(scene, camara);
  scene.remove(piv);
  return renderer.domElement.toDataURL('image/png');
}
