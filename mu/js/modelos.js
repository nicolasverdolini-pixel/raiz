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
const CENT = { idle: 'Idle_Combat', run: 'Running_C', atk: '1H_Melee_Attack_Chop', pisoton: '1H_Melee_Attack_Jump_Chop', invoca: 'Taunt', hit: 'Hit_B', muere: 'Death_C_Skeletons', nace: 'Spawn_Ground_Skeletons' };
const DEMONIO = { idle: 'Idle', run: 'Run', atk: 'Punch', lanza: 'Weapon', pisoton: 'Weapon', invoca: 'Wave', hit: 'HitReact', muere: 'Death' };
const VUELO = { idle: 'Flying_Idle', run: 'Fast_Flying', atk: 'Headbutt', lanza: 'Punch', pisoton: 'Headbutt', invoca: 'Punch', hit: 'HitReact', muere: 'Death' };
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
  siervo:    { archivo: 'centinela.glb', tam: 1.6, arma: 'hoja_hueso.glb', tinte: '#6a8a5a', anims: { idle: 'Idle_Combat', run: 'Running_C', atk: '1H_Melee_Attack_Chop', muere: 'Death_C_Skeletons', nace: 'Spawn_Ground_Skeletons' } },
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
  ahogado: { archivo: 'm/g_bluedemon.glb', tam: 2.4, tinte: '#3a6a72', tinteK: 0.5, ojos: '#7fd8ff', anims: DEMONIO },
  marinero:  { archivo: 'huesudo.glb', tam: 1.9, arma: 'hoja_hueso.glb', tinte: '#5a8a7a', anims: SK },
  abisal: { archivo: 'm/v_squidle.glb', tam: 2.3, vuela: 0.7, tinte: '#1a4a4a', tinteK: 0.5, ojos: '#b6ff5a', anims: VUELO },
  farero: { archivo: 'm/v_ghost.glb', tam: 2.4, vuela: 0.8, tinte: '#4a6a9a', tinteK: 0.4, ojos: '#7fd8ff', anims: VUELO },
  pirata: { archivo: 'm/g_ninja.glb', tam: 2.1, tinte: '#5a3a2a', tinteK: 0.3, ojos: '#ffb030', anims: DEMONIO },
  brutosal:  { archivo: 'bruto.glb', tam: 3.0, tinte: '#d8d4c8', tinteK: 0.7, anims: { ...DEMONIO, pisoton: 'Weapon' } },
  leviatanmenor: { archivo: 'raptor.glb', tam: 2.8, bajo: 1, tinte: '#1a3050', tinteK: 0.8, anims: { idle: 'Velociraptor_Idle', run: 'Velociraptor_Run', atk: 'Velociraptor_Attack', carga: 'Velociraptor_Run', lanza: 'Velociraptor_Attack', muere: 'Velociraptor_Death' } },
  reinaahogada: { archivo: 'm/v_hywirl.glb', tam: 5.2, vuela: 1.5, tinte: '#a8b8b0', tinteK: 0.4, ojos: '#7fd8ff', anims: VUELO },
  capitan:   { archivo: 'centinela.glb', tam: 4.4, arma: 'hacha_hueso.glb', tinte: '#3a6a6a', anims: { idle: 'Idle_Combat', run: 'Running_C', atk: '1H_Melee_Attack_Chop', pisoton: '1H_Melee_Attack_Jump_Chop', invoca: 'Taunt', hit: 'Hit_B', muere: 'Death_C_Skeletons', nace: 'Spawn_Ground_Skeletons' } },
  leviatan:  { archivo: 'trex.glb', tam: 7.5, tinte: '#10202e', tinteK: 0.8, anims: { idle: 'TRex_Idle', run: 'TRex_Run', atk: 'TRex_Attack', pisoton: 'TRex_Jump', carga: 'TRex_Run', lanza: 'TRex_Attack', muere: 'TRex_Death' } },
  // Mascotas y monturas (mismos modelos que algunos monstruos, más chicos o más grandes y con otro color).
  pet_tabano:    { archivo: 'wasp.glb', tam: 0.55, vuela: 1.7, tinte: '#1c1a18', tinteK: 0.7, anims: AVISPA },
  pet_anima_g:   { archivo: 'anima.glb', tam: 0.95, vuela: 0.9, tinte: '#9ab8e0', tinteK: 0.6, anims: MAGO },
  pet_diablillo: { archivo: 'engendro.glb', tam: 0.9, tinte: '#b0301a', tinteK: 0.6, anims: DEMONIO },
  mon_lobo_m:    { archivo: 'lobo.glb', tam: 3.0, bajo: 1, tinte: '#77706a', anims: { idle: 'Idle', run: 'Gallop' }, silla: 0.12 },
  mon_ciervo_m:  { archivo: 'ciervo.glb', tam: 3.2, tinte: '#141216', tinteK: 0.75, anims: { idle: 'Idle', run: 'Gallop' }, silla: 0.2 },
  mon_acechador_m: { archivo: 'raptor.glb', tam: 3.0, bajo: 1, tinte: '#4a1a12', tinteK: 0.7, anims: { idle: 'Velociraptor_Idle', run: 'Velociraptor_Run' }, silla: 0.14 },
  // ----- Yermo Calcinado -----
  calcinado: { archivo: 'huesudo.glb', tam: 1.9, arma: 'hoja_hueso.glb', tinte: '#2a1e1a', tinteK: 0.8, anims: SK },
  perrobrasa: { archivo: 'lobo.glb', tam: 2.0, bajo: 1, tinte: '#6a1a0e', tinteK: 0.75, anims: { idle: 'Idle', run: 'Gallop', atk: 'Attack', muere: 'Death', hit: 'Idle_HitReact_Left' } },
  tejedoraceniza: { archivo: 'spider.glb', tam: 2.4, bajo: 1, tinte: '#3a3532', tinteK: 0.8, anims: ARANA },
  diablo: { archivo: 'm/g_demon.glb', tam: 2.4, ojos: '#ffb030', anims: DEMONIO },
  devorador: { archivo: 'raptor.glb', tam: 3.0, bajo: 1, tinte: '#4a1a0a', tinteK: 0.75, anims: { idle: 'Velociraptor_Idle', run: 'Velociraptor_Run', atk: 'Velociraptor_Attack', carga: 'Velociraptor_Run', muere: 'Velociraptor_Death' } },
  coloso: { archivo: 'm/g_orc_skull.glb', tam: 3.5, tinte: '#3a3230', tinteK: 0.5, ojos: '#ff3a20', anims: { ...DEMONIO, pisoton: 'Weapon' } },
  sacerdoteazufre: { archivo: 'm/g_tribal.glb', tam: 2.3, ojos: '#ffb030', anims: DEMONIO },
  senorbrasas: { archivo: 'm/g_demon.glb', tam: 5, tinte: '#c03010', tinteK: 0.5, ojos: '#ffdc60', anims: { ...DEMONIO, pisoton: 'Weapon' } },
  grandevorador: { archivo: 'trex.glb', tam: 8.2, tinte: '#3a0a04', tinteK: 0.8, anims: { idle: 'TRex_Idle', run: 'TRex_Run', atk: 'TRex_Attack', pisoton: 'TRex_Jump', carga: 'TRex_Run', lanza: 'TRex_Attack', muere: 'TRex_Death' } },
  // ----- Ciudad del Trono Hundido -----
  guardiareal: { archivo: 'centinela.glb', tam: 2.3, arma: 'hacha_hueso.glb', tinte: '#5a6a8a', tinteK: 0.6, anims: CENT },
  espectrocorte: { archivo: 'm/v_ghost_skull.glb', tam: 2.5, vuela: 0.7, tinte: '#b8c8e0', tinteK: 0.25, ojos: '#c98aff', anims: VUELO },
  sabueso:   { archivo: 'lobo.glb', tam: 2.0, bajo: 1, tinte: '#d8dce4', tinteK: 0.7, anims: { idle: 'Idle', run: 'Gallop', atk: 'Attack', muere: 'Death', hit: 'Idle_HitReact_Left' } },
  verdugo:   { archivo: 'degollador.glb', tam: 2.2, arma: 'hacha_hueso.glb', tinte: '#141218', tinteK: 0.85, anims: { ...SK, idle: 'Idle_Combat', run: 'Running_C', atk: ['Dualwield_Melee_Attack_Slice', 'Dualwield_Melee_Attack_Chop'] } },
  gargola: { archivo: 'm/v_goleling_evolved.glb', tam: 2.3, vuela: 1.2, tinte: '#5a5a5e', tinteK: 0.7, ojos: '#ff3a20', anims: VUELO },
  caballerohueco: { archivo: 'centinela.glb', tam: 2.8, arma: 'hacha_hueso.glb', tinte: '#6a5a30', tinteK: 0.6, anims: { ...CENT, carga: 'Running_C' } },
  arzobispo: { archivo: 'anima.glb', tam: 2.5, arma: 'baculo_hueso.glb', tinte: '#6a3a8a', tinteK: 0.65, anims: MAGO },
  reinahueca: { archivo: 'anima.glb', tam: 4.3, arma: 'baculo_hueso.glb', tinte: '#e0e8ff', tinteK: 0.6, anims: MAGO },
  ultimorey: { archivo: 'centinela.glb', tam: 5.4, arma: 'hacha_hueso.glb', tinte: '#c8a040', tinteK: 0.55, anims: { ...CENT, carga: 'Running_C' } },
  heraldo:   { archivo: 'heraldo.glb', tam: 4.3, tinte: '#8a1a14', anims: DEMONIO },
  // ----- Glaciar del Silencio -----
  yeti:      { archivo: 'm/g_yeti.glb', tam: 3.0, tinte: '#7a94aa', tinteK: 0.4, ojos: '#7fd8ff', anims: DEMONIO },
  palido:    { archivo: 'm/g_alien.glb', tam: 2.5, tinte: '#b8c8d0', tinteK: 0.6, ojos: '#b6ff5a', anims: DEMONIO },
  mascarahielo: { archivo: 'm/v_tribal.glb', tam: 2.4, vuela: 0.9, tinte: '#6a8aa8', tinteK: 0.6, ojos: '#7fd8ff', anims: VUELO },
  ojohelado: { archivo: 'm/v_glub_evolved.glb', tam: 2.6, vuela: 1.1, tinte: '#3a6a9a', tinteK: 0.6, ojos: '#7fd8ff', anims: VUELO },
  buitrerey: { archivo: 'm/v_alpaking_evolved.glb', tam: 3.0, vuela: 1.3, tinte: '#4a5468', tinteK: 0.5, ojos: '#ffdc60', anims: VUELO },
  padrenieve: { archivo: 'm/g_yeti.glb', tam: 7.0, tinte: '#d0dde6', tinteK: 0.5, ojos: '#ff3a20', anims: { ...DEMONIO, pisoton: 'Weapon' } },
  reinabuitres: { archivo: 'm/v_alpaking_evolved.glb', tam: 6.2, vuela: 1.8, tinte: '#a8c4dc', tinteK: 0.6, ojos: '#7fd8ff', anims: VUELO },
  // ----- Cráter del Dragón -----
  draguito:  { archivo: 'm/v_dragon.glb', tam: 2.6, vuela: 1.0, tinte: '#d05a20', tinteK: 0.3, ojos: '#ffb030', anims: VUELO },
  saurio:    { archivo: 'm/g_dino.glb', tam: 2.9, tinte: '#3a2a26', tinteK: 0.6, ojos: '#ff3a20', anims: DEMONIO },
  simio:     { archivo: 'm/g_monkroose.glb', tam: 3.0, tinte: '#5a2a18', tinteK: 0.6, ojos: '#ffb030', anims: DEMONIO },
  micelio:   { archivo: 'm/g_mushroomking.glb', tam: 3.2, tinte: '#4a3a52', tinteK: 0.4, ojos: '#b6ff5a', anims: { ...DEMONIO, pisoton: 'Weapon' } },
  dragonjoven: { archivo: 'm/v_dragon_evolved.glb', tam: 3.8, vuela: 1.4, tinte: '#7a1a0e', tinteK: 0.4, ojos: '#ffdc60', anims: VUELO },
  reymicelio: { archivo: 'm/g_mushroomking.glb', tam: 7.0, tinte: '#7a2a7a', tinteK: 0.4, ojos: '#b6ff5a', anims: { ...DEMONIO, pisoton: 'Weapon' } },
  dragonprimordial: { archivo: 'm/v_dragon_evolved.glb', tam: 11, vuela: 2.6, tinte: '#1a0a08', tinteK: 0.55, ojos: '#ff5a1a', anims: VUELO },
};

export const ESCENOGRAFIA = ['CommonTree_Dead_1', 'CommonTree_Dead_2', 'CommonTree_Dead_3', 'CommonTree_Dead_5', 'BirchTree_Dead_1', 'BirchTree_Dead_3',
  'Willow_Dead_1', 'Willow_Dead_2', 'Willow_Dead_4', 'Rock_1', 'Rock_2', 'Rock_3', 'Rock_5', 'Rock_Moss_1',
  'TreeStump', 'TreeStump_Moss', 'WoodLog', 'WoodLog_Moss', 'Bush_1', 'Grass'];

const cargador = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
export const lib = {};

// Los monstruos nuevos vienen con colores alegres y ojos saltones: se apagan los colores y la parte blanca del ojo brilla.
// La textura es una paleta: la columna 1 (de 32) es el blanco de los ojos.
function apagarTextura(mat) {
  const img = mat.map?.image; if (!img) return;
  const lado = 256, a = document.createElement('canvas'), e = document.createElement('canvas'); a.width = a.height = e.width = e.height = lado;
  const ca = a.getContext('2d'), ce = e.getContext('2d'); ca.imageSmoothingEnabled = false; ca.drawImage(img, 0, 0, lado, lado);
  const d = ca.getImageData(0, 0, lado, lado), p = d.data, m = ce.createImageData(lado, lado);
  for (let i = 0; i < p.length; i += 4) {
    const x = (i / 4) % lado, ojo = x >= lado / 32 && x < lado / 16, gris = 0.3 * p[i] + 0.59 * p[i + 1] + 0.11 * p[i + 2];
    for (let k = 0; k < 3; k++) { p[i + k] = (p[i + k] * 0.6 + gris * 0.4) * 0.75; m.data[i + k] = ojo ? 255 : 0; }
    m.data[i + 3] = 255;
  }
  ca.putImageData(d, 0, 0); ce.putImageData(m, 0, 0);
  const tex = c => { const t = new THREE.CanvasTexture(c); t.flipY = mat.map.flipY; t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; };
  const color = tex(a); color.colorSpace = THREE.SRGBColorSpace;
  mat.map = color; mat.emissiveMap = tex(e); mat.emissive = new THREE.Color('#ffffff'); mat.emissiveIntensity = 1.4; mat.needsUpdate = true;
}

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
        if (v.archivo.startsWith('m/') && !m.userData.apagada) { m.userData.apagada = true; apagarTextura(m); }
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
    if (v.ojos) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.emissive?.set(v.ojos));
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
