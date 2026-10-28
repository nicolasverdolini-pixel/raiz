// Fotos de los objetos: arma y escudos se ven con su modelo 3D (KayKit, CC0), sacado una vez y guardado.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import * as O from './objetos.js';

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
};
const TINTE_TIER = [null, '#8fa8c8', '#5a4a52', '#7a2420', '#3a6a8a'];

let renderer, scene, camara;
const modelos = {}, fotos = {}, pedidos = {};
let alListo = null;
export function alTerminar(f) { alListo = f; }

function preparar() {
  if (renderer) return;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  renderer = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(128, 128, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
  scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight('#fff4e0', '#3a2a20', 2.2));
  const d = new THREE.DirectionalLight('#ffffff', 2.4); d.position.set(2, 3, 4); scene.add(d);
  camara = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
}

function clave(it) { return it.b + ':' + O.rareza(it); }
export function modeloDe(b) {
  const base = O.BASES[b]; if (!base?.r) return null;
  const tipo = base.r === 'escudo' ? 'escudo' : b.replace(/\d+$/, '');
  const t = (+b.match(/(\d+)$/)?.[1] || 1) - 1;
  return MODELO[tipo] ? { archivo: MODELO[tipo][t], t } : null;
}

// Devuelve la foto (dataURL) si ya está; si no, la pide y avisa cuando termina.
export function foto(it) {
  const k = clave(it);
  if (fotos[k]) return fotos[k];
  const m = modeloDe(it.b); if (!m) return null;
  if (!pedidos[k]) pedidos[k] = sacar(it, m).then(url => { fotos[k] = url; alListo?.(); }).catch(() => {});
  return null;
}

async function sacar(it, m) {
  preparar();
  const ruta = 'modelos/armas/' + m.archivo + '.glb';
  if (!modelos[ruta]) modelos[ruta] = cargador.loadAsync(ruta);
  const g = (await modelos[ruta]).scene.clone(true);
  const ra = O.rareza(it), colorR = ra ? new THREE.Color(O.RAREZAS[ra].color) : null;
  g.traverse(o => {
    if (!o.isMesh) return;
    o.material = o.material.clone();
    if (TINTE_TIER[m.t] && o.material.color) o.material.color.lerp(new THREE.Color(TINTE_TIER[m.t]), 0.35);
    if (colorR && o.material.emissive) { o.material.emissive.copy(colorR); o.material.emissiveIntensity = 0.35 + ra * 0.12; }
  });
  const caja = new THREE.Box3().setFromObject(g), centro = caja.getCenter(new THREE.Vector3()), tam = caja.getSize(new THREE.Vector3());
  g.position.sub(centro);
  const piv = new THREE.Group(); piv.add(g);
  const largo = Math.max(tam.x, tam.y, tam.z);
  if (tam.y >= tam.x && tam.y >= tam.z) piv.rotation.z = -Math.PI / 4;       // armas largas, cruzadas
  piv.rotation.y = 0.5;
  scene.add(piv);
  camara.position.set(0, 0, largo * 2.1); camara.lookAt(0, 0, 0);
  renderer.setClearColor(0x000000, 0);
  renderer.render(scene, camara);
  scene.remove(piv);
  return renderer.domElement.toDataURL('image/png');
}
