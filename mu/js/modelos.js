// Carga los modelos 3D (KayKit y Quaternius, CC0) y maneja sus animaciones.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

// tam: tamaño más grande del modelo en metros · vuela: altura · tinte: color encima · bajo: cuadrúpedo (nombre más abajo)
const SK = { idle: 'Idle', run: 'Walking_D_Skeletons', atk: '1H_Melee_Attack_Chop', hit: 'Hit_A', muere: 'Death_C_Skeletons', nace: 'Spawn_Ground_Skeletons' };
const RATA = { idle: 'Rat_Idle', run: 'Rat_Run', atk: 'Rat_Attack', muere: 'Rat_Death', pisoton: 'Rat_Jump', invoca: 'Rat_Jump' };
const ARANA = { idle: 'Spider_Idle', run: 'Spider_Walk', atk: 'Spider_Attack', muere: 'Spider_Death', lanza: 'Spider_Attack', invoca: 'Spider_Jump' };
const AVISPA = { idle: 'Wasp_Flying', run: 'Wasp_Flying', atk: 'Wasp_Attack', muere: 'Wasp_Death', lanza: 'Wasp_Attack' };
const MAGO = { ...SK, atk: 'Spellcast_Shoot', lanza: 'Spellcast_Shoot', invoca: 'Spellcast_Summon' };
const DEMONIO = { idle: 'Idle', run: 'Run', atk: 'Punch', lanza: 'Weapon', pisoton: 'Weapon', invoca: 'Wave', hit: 'HitReact', muere: 'Death' };
export const VISUAL = {
  guardian:  { archivo: 'guardian.glb', tam: 1.85, anims: { idle: 'Idle', run: 'Running_A', atk: ['1H_Melee_Attack_Chop', '1H_Melee_Attack_Slice_Diagonal', '1H_Melee_Attack_Slice_Horizontal'],
               spin: '2H_Melee_Attack_Spin', muralla: 'Block', stab: '1H_Melee_Attack_Stab', hit: 'Hit_A', muere: 'Death_A', festeja: 'Cheer', pot: 'Use_Item' } },
  cazadora:  { archivo: 'cazadora.glb', tam: 1.8, anims: { idle: 'Idle', run: 'Running_A', atk: '1H_Ranged_Shoot', tiro2: '2H_Ranged_Shoot', esquiva: 'Dodge_Backward',
               hit: 'Hit_A', muere: 'Death_A', festeja: 'Cheer', pot: 'Use_Item', muralla: 'Dodge_Backward' } },
  arcanista: { archivo: 'arcanista.glb', tam: 1.9, anims: { idle: 'Idle', run: 'Running_A', atk: 'Spellcast_Shoot', hechizo: 'Spellcast_Shoot', hechizo2: 'Spellcast_Long',
               muralla: 'Block', hit: 'Hit_A', muere: 'Death_A', festeja: 'Spellcast_Raise', pot: 'Use_Item' } },
  barbaro:   { archivo: 'barbaro.glb', tam: 1.9, anims: { idle: 'Idle', run: 'Running_A', atk: ['Dualwield_Melee_Attack_Chop', 'Dualwield_Melee_Attack_Slice', 'Dualwield_Melee_Attack_Stab'],
               spin: '2H_Melee_Attack_Spin', hachazo: '2H_Melee_Attack_Chop', muralla: 'Block', hit: 'Hit_A', muere: 'Death_A', festeja: 'Cheer', pot: 'Use_Item' } },
  sombra:    { archivo: 'sombra.glb', tam: 1.8, tinte: '#1e1d24', tinteK: 0.85, anims: { idle: 'Idle', run: 'Running_A', atk: ['Dualwield_Melee_Attack_Stab', 'Dualwield_Melee_Attack_Slice', 'Dualwield_Melee_Attack_Chop'],
               apunala: 'Dualwield_Melee_Attack_Stab', tira: 'Throw', esquiva: 'Dodge_Forward', spin: '2H_Melee_Attack_Spinning', hit: 'Hit_A', muere: 'Death_A', festeja: 'Cheer', pot: 'Use_Item' } },
  nigromante: { archivo: 'nigromante.glb', tam: 1.9, arma: 'baculo_hueso.glb', tinte: '#7a8a6a', anims: { idle: 'Idle', run: 'Running_A', atk: 'Spellcast_Shoot', hechizo: 'Spellcast_Shoot', hechizo2: 'Spellcast_Long',
               invoca: 'Spellcast_Summon', festeja: 'Spellcast_Raise', hit: 'Hit_A', muere: 'Death_A', pot: 'Use_Item' } },
  desterrado: { archivo: 'engendro.glb', tam: 2.1, tinte: '#3a2e3e', anims: { idle: 'Idle', run: 'Run', atk: 'Punch', puno: 'Weapon', festeja: 'Wave', hit: 'HitReact', muere: 'Death', pot: 'Wave' } },
  siervo:    { archivo: 'huesudo.glb', tam: 1.6, arma: 'hoja_hueso.glb', tinte: '#6a8a5a', anims: { idle: 'Idle', run: 'Walking_D_Skeletons', atk: '1H_Melee_Attack_Chop', muere: 'Death_C_Skeletons', nace: 'Spawn_Ground_Skeletons' } },
  npc_mercader: { archivo: 'npc_mercader.glb', tam: 1.8, tinte: '#5a4a3a', anims: { idle: 'Idle', saluda: 'Interact' } },
  npc_herrero:  { archivo: 'npc_herrero.glb', tam: 2.0, tinte: '#6a4a30', anims: { idle: 'Idle', saluda: 'Cheer' } },
  npc_vidente:  { archivo: 'npc_vidente.glb', tam: 1.9, tinte: '#3a2a4a', anims: { idle: 'Idle', saluda: 'Interact' } },
  rata:      { archivo: 'rat.glb', tam: 1.5, bajo: 1, tinte: '#8a7a68', anims: RATA },
  sapo:      { archivo: 'frog.glb', tam: 1.3, bajo: 1, tinte: '#6d7a4a', anims: { idle: 'Frog_Idle', run: 'Frog_Jump', atk: 'Frog_Attack', muere: 'Frog_Death' } },
  arana:     { archivo: 'spider.glb', tam: 1.9, bajo: 1, tinte: '#4a3a30', anims: ARANA },
  sierpe:    { archivo: 'sierpe.glb', tam: 1.8, bajo: 1, tinte: '#26221c', anims: { idle: 'Snake_Idle', run: 'Snake_Walk', atk: 'Snake_Attack' } },
  avispon:   { archivo: 'wasp.glb', tam: 1.4, vuela: 1.1, tinte: '#8a4a2a', anims: AVISPA },
  lobo:      { archivo: 'lobo.glb', tam: 1.8, bajo: 1, tinte: '#3a3530', anims: { idle: 'Idle', run: 'Gallop', atk: 'Attack', muere: 'Death', hit: 'Idle_HitReact_Left' } },
  huesudo:   { archivo: 'huesudo.glb', tam: 1.8, arma: 'hoja_hueso.glb', anims: SK },
  ciervo:    { archivo: 'ciervo.glb', tam: 2.5, tinte: '#2e2a26', anims: { idle: 'Idle', run: 'Gallop', atk: 'Attack_Headbutt', carga: 'Gallop', muere: 'Death', hit: 'Idle_HitReact_Left' } },
  anima:     { archivo: 'anima.glb', tam: 1.9, arma: 'baculo_hueso.glb', anims: MAGO },
  degollador:{ archivo: 'degollador.glb', tam: 1.8, arma: 'hoja_hueso.glb', anims: { ...SK, idle: 'Idle_Combat', run: 'Running_C', atk: ['Dualwield_Melee_Attack_Slice', 'Dualwield_Melee_Attack_Chop'] } },
  bruto:     { archivo: 'bruto.glb', tam: 2.7, tinte: '#4d5a3c', anims: { ...DEMONIO, pisoton: 'Weapon' } },
  acechador: { archivo: 'raptor.glb', tam: 2.3, bajo: 1, tinte: '#2f2f33', anims: { idle: 'Velociraptor_Idle', run: 'Velociraptor_Run', atk: 'Velociraptor_Attack', carga: 'Velociraptor_Run', muere: 'Velociraptor_Death' } },
  engendro:  { archivo: 'engendro.glb', tam: 2.7, tinte: '#5a2420', anims: DEMONIO },
  ratareina: { archivo: 'rat.glb', tam: 3.4, bajo: 1, tinte: '#d8cfc0', anims: RATA },
  madretejedora: { archivo: 'spider.glb', tam: 4.4, bajo: 1, tinte: '#1a1210', anims: ARANA },
  reinacolmena:  { archivo: 'wasp.glb', tam: 3.3, vuela: 1.8, tinte: '#3a1a10', anims: { ...AVISPA, invoca: 'Wasp_Attack' } },
  centinela: { archivo: 'centinela.glb', tam: 4.0, arma: 'hacha_hueso.glb', anims: { idle: 'Idle_Combat', run: 'Running_C', atk: '1H_Melee_Attack_Chop', pisoton: '1H_Melee_Attack_Jump_Chop',
               invoca: 'Taunt', hit: 'Hit_B', muere: 'Death_C_Skeletons', nace: 'Spawn_Ground_Skeletons' } },
  archimago: { archivo: 'anima.glb', tam: 3.6, arma: 'baculo_hueso.glb', tinte: '#6a4a9a', anims: MAGO },
  bestia:    { archivo: 'trex.glb', tam: 6.2, tinte: '#2a1a16', anims: { idle: 'TRex_Idle', run: 'TRex_Run', atk: 'TRex_Attack', pisoton: 'TRex_Jump', carga: 'TRex_Run', muere: 'TRex_Death' } },
  heraldo:   { archivo: 'heraldo.glb', tam: 4.3, tinte: '#8a1a14', anims: DEMONIO },
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
        m.userData.outlineParameters = { thickness: v.tam > 3 ? 0.0035 : 0.0045, color: [0.02, 0.015, 0.01], alpha: 1 };
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
    if (v.tinte) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.color && m.name !== 'Glow') m.color.lerp(new THREE.Color(v.tinte), v.tinteK || 0.55); });
    (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => mats.push(m));
  });
  if (v.arma) {
    const mano = cuerpo.getObjectByName('handslotr') || cuerpo.getObjectByName('handslot.r');
    if (mano) { const arma = lib[v.arma].scene.clone(); arma.traverse(o => { if (o.isMesh) { o.castShadow = true; o.material.userData.outlineParameters = { thickness: 0.004, color: [0.02, 0.015, 0.01], alpha: 1 }; } }); mano.add(arma); }
  }
  const raiz = new THREE.Group();
  if (v.vuela) cuerpo.position.y = v.vuela;
  raiz.add(cuerpo);
  return { raiz, cuerpo, mats, muneco: new Muneco(cuerpo, g.animations, v.anims), alto: v.tam * (v.bajo ? 0.6 : 1.05) + (v.vuela || 0) };
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
