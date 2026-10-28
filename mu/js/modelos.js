// Carga los modelos 3D (KayKit y Quaternius, CC0) y maneja sus animaciones.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

// tam: tamaño más grande del modelo en metros · giro: para que mire hacia adelante · vuela: altura
export const VISUAL = {
  guardian:  { archivo: 'guardian.glb', tam: 1.85, anims: { idle: 'Idle', run: 'Running_A', atk: ['1H_Melee_Attack_Chop', '1H_Melee_Attack_Slice_Diagonal', '1H_Melee_Attack_Slice_Horizontal'],
               spin: '2H_Melee_Attack_Spin', muralla: 'Block', stab: '1H_Melee_Attack_Stab', hit: 'Hit_A', muere: 'Death_A', festeja: 'Cheer', pot: 'Use_Item' } },
  rata:      { archivo: 'rat.glb', tam: 1.5, tinte: '#8a7a68', anims: { idle: 'Rat_Idle', run: 'Rat_Run', atk: 'Rat_Attack', muere: 'Rat_Death' } },
  sapo:      { archivo: 'frog.glb', tam: 1.3, tinte: '#6d7a4a', anims: { idle: 'Frog_Idle', run: 'Frog_Jump', atk: 'Frog_Attack', muere: 'Frog_Death' } },
  arana:     { archivo: 'spider.glb', tam: 1.9, tinte: '#4a3a30', anims: { idle: 'Spider_Idle', run: 'Spider_Walk', atk: 'Spider_Attack', muere: 'Spider_Death' } },
  avispon:   { archivo: 'wasp.glb', tam: 1.4, vuela: 1.1, tinte: '#8a4a2a', anims: { idle: 'Wasp_Flying', run: 'Wasp_Flying', atk: 'Wasp_Attack', muere: 'Wasp_Death' } },
  huesudo:   { archivo: 'huesudo.glb', tam: 1.8, arma: 'hoja_hueso.glb', anims: { idle: 'Idle', run: 'Walking_D_Skeletons', atk: '1H_Melee_Attack_Chop', hit: 'Hit_A', muere: 'Death_C_Skeletons', nace: 'Spawn_Ground_Skeletons' } },
  centinela: { archivo: 'centinela.glb', tam: 4.0, arma: 'hacha_hueso.glb', anims: { idle: 'Idle_Combat', run: 'Running_C', atk: '1H_Melee_Attack_Chop', pisoton: '1H_Melee_Attack_Jump_Chop',
               hit: 'Hit_B', muere: 'Death_C_Skeletons', nace: 'Spawn_Ground_Skeletons' } },
};

export const ESCENOGRAFIA = ['CommonTree_Dead_1', 'CommonTree_Dead_2', 'CommonTree_Dead_3', 'CommonTree_Dead_5', 'BirchTree_Dead_1', 'BirchTree_Dead_3',
  'Willow_Dead_1', 'Willow_Dead_2', 'Willow_Dead_4', 'Rock_1', 'Rock_2', 'Rock_3', 'Rock_5', 'Rock_Moss_1',
  'TreeStump', 'TreeStump_Moss', 'WoodLog', 'WoodLog_Moss', 'Bush_1', 'Grass'];

const cargador = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
export const lib = {};

export async function cargarTodo(progreso) {
  const lista = [...new Set([...Object.values(VISUAL).flatMap(v => [v.archivo, v.arma].filter(Boolean)), ...ESCENOGRAFIA.map(n => n + '.glb')])];
  let hechos = 0;
  await Promise.all(lista.map(async a => {
    lib[a] = await cargador.loadAsync('modelos/' + a);
    progreso?.(++hechos / lista.length);
  }));
  for (const [tipo, v] of Object.entries(VISUAL)) {
    const g = lib[v.archivo];
    const caja = new THREE.Box3().setFromObject(g.scene), t = new THREE.Vector3();
    caja.getSize(t);
    v.escala = v.tam / Math.max(t.x, t.y, t.z);
    g.scene.traverse(o => {
      if (!o.isMesh) return;
      o.castShadow = true; o.frustumCulled = false;
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of ms) {
        if (v.tinte && m.color) m.color.lerp(new THREE.Color(v.tinte), 0.55);
        m.userData.outlineParameters = { thickness: tipo === 'centinela' ? 0.004 : 0.0045, color: [0.02, 0.015, 0.01], alpha: 1 };
        if (m.name === 'Glow') { m.emissive = new THREE.Color('#ff3b1f'); m.emissiveIntensity = 3; }
      }
    });
  }
}

// Crea una copia lista para usar: raiz (se mueve), cuerpo (escala/giro) y muñeco (animaciones).
export function crear(tipo) {
  const v = VISUAL[tipo], g = lib[v.archivo];
  const cuerpo = SkeletonUtils.clone(g.scene);
  cuerpo.scale.setScalar(v.escala);
  const mats = [];
  cuerpo.traverse(o => {
    if (!o.isMesh) return;
    o.material = Array.isArray(o.material) ? o.material.map(m => m.clone()) : o.material.clone();
    (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => mats.push(m));
  });
  if (v.arma) {
    const mano = cuerpo.getObjectByName('handslotr') || cuerpo.getObjectByName('handslot.r');
    if (mano) { const arma = lib[v.arma].scene.clone(); arma.traverse(o => { if (o.isMesh) { o.castShadow = true; o.material.userData.outlineParameters = { thickness: 0.004, color: [0.02, 0.015, 0.01], alpha: 1 }; } }); mano.add(arma); }
  }
  const raiz = new THREE.Group();
  if (v.vuela) cuerpo.position.y = v.vuela;
  raiz.add(cuerpo);
  return { raiz, cuerpo, mats, muneco: new Muneco(cuerpo, g.animations, v.anims), alto: v.tam * (tipo === 'rata' || tipo === 'arana' || tipo === 'sapo' ? 0.75 : 1.08) + (v.vuela || 0) };
}

// Maneja animaciones: una "base" que se repite (quieto/corre) y acciones de una vez (atacar, morir).
export class Muneco {
  constructor(obj, clips, mapa) {
    this.mixer = new THREE.AnimationMixer(obj); this.mapa = mapa; this.acc = {};
    for (const c of clips) this.acc[c.name] = this.mixer.clipAction(c);
    this.actual = null; this.unaVez = null; this.muerto = false; this.claveBase = 'idle';
    this.mixer.addEventListener('finished', e => {
      if (e.action === this.unaVez && !this.muerto) { this.unaVez = null; this.fundir(this.base(), 0.15); }
    });
    this.fundir(this.base(), 0);
  }
  accion(clave) { let n = this.mapa[clave]; if (Array.isArray(n)) n = n[Math.floor(Math.random() * n.length)]; return n ? this.acc[n] : null; }
  base() { return this.accion(this.claveBase) || this.accion('idle'); }
  duracion(clave) { const a = this.accion(clave); return a ? a.getClip().duration : 0; }
  fundir(sig, dur) {
    if (!sig) return;
    if (sig === this.actual && sig.isRunning() && sig.loop === THREE.LoopRepeat) return;
    sig.reset(); sig.setEffectiveWeight(1); sig.play();
    if (this.actual && this.actual !== sig && dur > 0) this.actual.crossFadeTo(sig, dur, false);
    else if (this.actual && this.actual !== sig) this.actual.stop();
    this.actual = sig;
  }
  ponerBase(clave) {
    if (this.claveBase === clave) return;
    this.claveBase = clave;
    if (!this.unaVez && !this.muerto) this.fundir(this.base(), 0.18);
  }
  hacer(clave, { vel = 1, quedarse = false } = {}) {
    if (this.muerto && !quedarse) return false;
    const a = this.accion(clave); if (!a) return false;
    a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true;
    const prev = this.actual;
    a.reset(); a.timeScale = vel; a.setEffectiveWeight(1); a.play();
    if (prev && prev !== a) prev.crossFadeTo(a, 0.08, false);
    this.actual = a; this.unaVez = a; if (quedarse) this.muerto = true;
    return true;
  }
  revivir() { this.muerto = false; this.unaVez = null; this.actual = null; this.mixer.stopAllAction(); this.fundir(this.base(), 0); }
  update(dt) { this.mixer.update(dt); }
}
