// Equipo visible: el personaje se viste con lo que tiene puesto. Las piezas (casco, cuerpo, brazos, piernas) salen de
// otros modelos KayKit con el mismo esqueleto y se vuelven a atar a los huesos del personaje; el arma y el escudo se
// cambian en la mano. El Desterrado (otro esqueleto) solo cambia el arma.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { lib } from './modelos.js';

// Una pieza por nivel de equipo (0 = Cuero ... 6 = Último Rey): [archivo, nombres de las mallas].
const L = n => [n + 'Left', n + 'Right'];
export const PIEZAS = {
  casco: [['degollador.glb', ['Skeleton_Rogue_Hood']], ['guardian.glb', ['Knight_Helmet']], ['barbaro.glb', ['Barbarian_Hat']], ['centinela.glb', ['Skeleton_Warrior_Helmet']],
    ['guardian.glb', ['Knight_Helmet']], ['centinela.glb', ['Skeleton_Warrior_Helmet']], ['guardian.glb', ['Knight_Helmet']]],
  armadura: [['cazadora.glb', ['Rogue_Body']], ['guardian.glb', ['Knight_Body']], ['barbaro.glb', ['Barbarian_Body']], ['cazadora.glb', ['Rogue_Body', 'Rogue_Cape']],
    ['guardian.glb', ['Knight_Body', 'Knight_Cape']], ['barbaro.glb', ['Barbarian_Body', 'Barbarian_Cape']], ['guardian.glb', ['Knight_Body', 'Knight_Cape']]],
  guantes: [['cazadora.glb', L('Rogue_Arm')], ['guardian.glb', L('Knight_Arm')], ['barbaro.glb', L('Barbarian_Arm')], ['arcanista.glb', L('Mage_Arm')],
    ['guardian.glb', L('Knight_Arm')], ['barbaro.glb', L('Barbarian_Arm')], ['guardian.glb', L('Knight_Arm')]],
  botas: [['cazadora.glb', L('Rogue_Leg')], ['guardian.glb', L('Knight_Leg')], ['barbaro.glb', L('Barbarian_Leg')], ['cazadora.glb', L('Rogue_Leg')],
    ['guardian.glb', L('Knight_Leg')], ['barbaro.glb', L('Barbarian_Leg')], ['guardian.glb', L('Knight_Leg')]],
};
// Color de cada nivel (el mismo que en las fotos de la mochila).
const TINTE = [null, '#8fa8c8', '#5a4a52', '#7a2420', '#3a6a8a', '#8a2a0a', '#d8b050', '#bfe4f4', '#c8341a'];
// Qué mallas propias del personaje tapa cada pieza.
const PROPIAS = { casco: /(Helmet|_Hat|Hood$)/, armadura: /(_Body|_Cape|_Cloak)$/, guantes: /_Arm(Left|Right)$/, botas: /_Leg(Left|Right)$/ };
// Armas por nivel (archivos de modelos/armas, iguales a las fotos).
const ARMAS = {
  espada: ['sword_1handed', 'sword_1handed', 'sword_2handed', 'sword_2handed', 'sword_2handed', '../hoja_hueso', 'sword_2handed'],
  ballesta: ['crossbow_1handed', 'crossbow_1handed', 'crossbow_2handed', 'crossbow_2handed', 'crossbow_2handed', 'crossbow_2handed', 'crossbow_2handed'],
  baculo: ['staff', 'staff', 'staff', 'staff', 'staff', '../baculo_hueso', 'staff'],
  hacha: ['axe_1handed', 'axe_1handed', 'axe_2handed', 'axe_2handed', 'axe_2handed', '../hacha_hueso', 'axe_2handed'],
  dagas: ['dagger', 'dagger', 'dagger', 'dagger', 'dagger', '../hoja_hueso', 'dagger'],
  cetro: ['wand', 'wand', '../baculo_hueso', '../baculo_hueso', '../baculo_hueso', '../baculo_hueso', 'wand'],
  escudo: ['shield_round', 'shield_badge', 'shield_square', 'shield_spikes', 'shield_spikes', 'shield_spikes', 'shield_badge'],
};
const ARMA_CLASE = { guardian: 'espada', cazadora: 'ballesta', arcanista: 'baculo', barbaro: 'hacha', sombra: 'dagas', nigromante: 'cetro' };
const DOS_MANOS = { barbaro: true, sombra: true };   // un arma en cada mano

const cargador = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder), armas = {};
const cargarArma = a => armas[a] || (armas[a] = cargador.loadAsync('modelos/armas/' + a + '.glb').then(g => g.scene));

// Copia una malla de otro modelo y la pone en el personaje: si tiene huesos, la ata a los mismos huesos (por nombre);
// si cuelga de un hueso (cascos, capas), la cuelga del mismo hueso.
function atar(origen, huesos, padre, tinte) {
  const mat = origen.material.clone();
  if (tinte && mat.color) mat.color.lerp(new THREE.Color(tinte), 0.45);
  mat.userData.outlineParameters = { thickness: 0.0045, color: [0.02, 0.015, 0.01], alpha: 1 };
  if (origen.isSkinnedMesh) {
    const sk = new THREE.Skeleton(origen.skeleton.bones.map(b => huesos[b.name]), origen.skeleton.boneInverses);
    const m = new THREE.SkinnedMesh(origen.geometry, mat);
    m.bind(sk, origen.bindMatrix); m.castShadow = true; m.frustumCulled = false; padre.add(m);
    return m;
  }
  const hueso = huesos[origen.parent?.name]; if (!hueso) return null;
  const m = new THREE.Mesh(origen.geometry, mat);
  m.position.copy(origen.position); m.quaternion.copy(origen.quaternion); m.scale.copy(origen.scale); m.castShadow = true;
  hueso.add(m);
  return m;
}

// vis: lo que devuelve crear() · clase · eq: { casco, armadura, guantes, botas, arma, escudo } con el nivel (0-6) o -1.
export function vestir(vis, clase, eq) {
  const q = vis.vestido || (vis.vestido = { piezas: {}, propias: null, huesos: null, padre: null });
  if (!q.propias) {
    q.propias = { casco: [], armadura: [], guantes: [], botas: [] }; q.huesos = {};
    vis.cuerpo.traverse(o => {
      if (o.isBone) q.huesos[o.name] = o;
      if (o.isSkinnedMesh) q.padre = q.padre || o.parent;
      if (o.isMesh) for (const [k, re] of Object.entries(PROPIAS)) if (re.test(o.name)) q.propias[k].push(o);
    });
  }
  const mismoEsqueleto = Object.keys(q.huesos).length === 41;
  for (const slot of Object.keys(PIEZAS)) {
    const t = eq[slot] ?? -1, clave = t < 0 ? '' : String(t);
    if (q.piezas[slot]?.clave === clave) continue;
    for (const m of q.piezas[slot]?.mallas || []) { m.parent?.remove(m); const i = vis.mats.indexOf(m.material); if (i >= 0) vis.mats.splice(i, 1); }
    q.piezas[slot] = { clave, mallas: [] };
    const ponerPropias = v => q.propias[slot].forEach(o => { o.visible = v; });
    if (t < 0 || !mismoEsqueleto) { ponerPropias(true); continue; }
    const [archivo, nombres] = PIEZAS[slot][Math.min(t, 6)], g = lib[archivo]; if (!g) { ponerPropias(true); continue; }
    const fuentes = []; g.scene.traverse(o => { if (o.isMesh && nombres.includes(o.name)) fuentes.push(o); });
    if (!fuentes.length) { ponerPropias(true); continue; }
    ponerPropias(false);
    // El casco de cuero (capucha) no tapa la capucha propia de la Sombra: queda la de ella.
    if (slot === 'casco' && clase === 'sombra') { ponerPropias(true); continue; }
    for (const f of fuentes) { const m = atar(f, q.huesos, q.padre, TINTE[t]); if (m) { q.piezas[slot].mallas.push(m); vis.mats.push(m.material); } }
  }
  // Arma y escudo en las manos.
  const tipo = ARMA_CLASE[clase];
  const ponerEnMano = (mano, archivo, clave) => {
    const slot = cuerpoMano(vis, mano); if (!slot) return;
    if (slot.userData.clave === clave) return; slot.userData.clave = clave;
    if (!archivo) return;
    cargarArma(archivo).then(esc => {
      if (slot.userData.clave !== clave) return;
      for (const h of [...slot.children]) slot.remove(h);
      const a = esc.clone(); a.traverse(o => { if (o.isMesh) { o.castShadow = true; o.material = o.material.clone(); o.material.userData.outlineParameters = { thickness: 0.004, color: [0.02, 0.015, 0.01], alpha: 1 }; if (TINTE[clave.split(':')[1]] && o.material.color) o.material.color.lerp(new THREE.Color(TINTE[clave.split(':')[1]]), 0.35); } });
      slot.add(a); vis.alCambiarArma?.();
    }).catch(() => {});
  };
  if (tipo && eq.arma >= 0) {
    const t = Math.min(eq.arma, 6), archivo = ARMAS[tipo][t];
    ponerEnMano('r', archivo, archivo + ':' + t);
    if (DOS_MANOS[clase]) ponerEnMano('l', archivo, archivo + ':' + t);
  }
  if (clase === 'guardian') {
    if (eq.escudo >= 0) { const t = Math.min(eq.escudo, 6); ponerEnMano('l', ARMAS.escudo[t], ARMAS.escudo[t] + ':' + t); }
    else { const s = cuerpoMano(vis, 'l'); if (s && s.userData.clave) { s.userData.clave = ''; for (const h of [...s.children]) s.remove(h); } }
  }
}
const cuerpoMano = (vis, lado) => vis.cuerpo.getObjectByName('handslot' + lado) || vis.cuerpo.getObjectByName('handslot.' + lado);
