// Pantalla de personajes: al pie de la Atalaya del Farol, tus personajes esperan alrededor del fuego.
import { anchoP, altoP } from './pantalla.js';
import * as THREE from 'three';
import * as C from './clases.js';
import * as R from './reglas.js';
import { crear } from './modelos.js';
import { iconoAtaque } from './iconos.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export class Seleccion {
  constructor(E, cb) {
    this.E = E; this.cb = cb; this.activa = false; this.figuras = []; this.sel = 0; this.t = 0;
    this.el = document.getElementById('seleccion');
    this.anillo = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.85, 32), new THREE.MeshBasicMaterial({ color: '#c0392b', transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
    this.anillo.material.userData.outlineParameters = { visible: false };
    this.anillo.rotation.x = -Math.PI / 2;
    this.el.addEventListener('pointerdown', e => e.stopPropagation());
  }

  mostrar(personajes, creado) {
    this.activa = true; this.lista = personajes;
    for (const f of this.figuras) { this.E.scene.remove(f.vis.raiz); if (f.e) this.cb.quitar?.(f.e); }
    this.figuras = personajes.map((p, i) => {
      const vis = crear(C.CLASES[p.clase] ? p.clase : 'guardian');
      const n = personajes.length, a = n === 1 ? 0 : (i / (n - 1) - 0.5) * Math.min(2.4, n * 0.45);
      const x = Math.sin(a) * 5, z = Math.cos(a) * 5 - 1;
      vis.raiz.position.set(x, R.altura(x, z), z); vis.raiz.rotation.y = a + Math.PI * 0.02;
      this.E.scene.add(vis.raiz);
      const e = this.cb.adornar?.(vis, p);
      return { p, vis, x, z, e };
    });
    this.E.scene.add(this.anillo);
    const i = creado ? personajes.findIndex(p => p.nombre === creado) : 0;
    this.elegir(Math.max(0, i));
    this.dibujar();
  }

  ocultar() {
    this.activa = false; this.el.hidden = true;
    for (const f of this.figuras) { this.E.scene.remove(f.vis.raiz); if (f.e) this.cb.quitar?.(f.e); }
    this.figuras = []; this.E.scene.remove(this.anillo);
  }

  elegir(i) {
    this.sel = i; const f = this.figuras[i];
    if (f) { f.vis.muneco.hacer('festeja'); this.anillo.position.set(f.x, R.altura(f.x, f.z) + 0.06, f.z); }
    this.el.querySelectorAll('.pj').forEach((b, k) => b.classList.toggle('sel', k === i));
  }

  error(msg) { const e = $('#sel-error', this.el); if (e) e.textContent = msg; }

  dibujar() {
    const L = this.lista;
    this.el.innerHTML = `<header><h1>Sendas del Éter</h1><span>Elegí con quién bajar al Páramo</span></header>
      <div class="pjs">${L.map((p, i) => `<button class="pj ${i === this.sel ? 'sel' : ''}" data-i="${i}">${iconoAtaque(p.clase)}<b>${esc(p.nombre)}</b><small>${C.CLASES[p.clase]?.nombre || ''} · Nivel ${p.nivel}${p.resets ? ` · ${p.resets}° renacido` : ''}</small></button>`).join('')}
        ${L.length < 6 ? `<button class="pj nuevo" id="sel-nuevo"><b>+</b><small>Nuevo personaje</small></button>` : ''}</div>
      <p id="sel-error" class="error"></p>
      <div class="fila"><button class="btn" id="sel-jugar" ${L.length ? '' : 'disabled'}>Jugar</button><button class="btn sec" id="sel-salir">Salir de la cuenta</button></div>
      <p class="nota">Una cuenta juega con un personaje por vez. El baúl de cada atalaya es compartido entre todos tus personajes.</p>`;
    this.el.hidden = false;
    this.el.querySelectorAll('.pj[data-i]').forEach(b => b.onclick = () => this.elegir(+b.dataset.i));
    $('#sel-jugar', this.el).onclick = () => { const f = this.figuras[this.sel]; if (f) this.cb.jugar(f.p.nombre); };
    $('#sel-salir', this.el).onclick = () => this.cb.salir();
    const bn = $('#sel-nuevo', this.el); if (bn) bn.onclick = () => this.formulario();
    if (!L.length) this.formulario();
  }

  formulario() {
    const clases = C.LISTA_CLASES;
    this.el.innerHTML = `<header><h1>Nuevo personaje</h1><span>Nombre y clase. El nombre no se puede cambiar después.</span></header>
      <form id="sel-form" class="crear">
        <label>Nombre<input id="sel-nombre" maxlength="14" required autocomplete="off"></label>
        <div class="clases-grid">${clases.map((c, i) => `<label class="clase"><input type="radio" name="sel-clase" value="${c}" ${i ? '' : 'checked'}>${iconoAtaque(c)}<b>${C.CLASES[c].nombre}</b><small>${C.CLASES[c].desc}</small></label>`).join('')}</div>
        <p id="sel-error" class="error"></p>
        <div class="fila"><button class="btn" type="submit">Crear</button>${this.lista.length ? '<button class="btn sec" type="button" id="sel-volver">Volver</button>' : ''}</div>
      </form>`;
    $('#sel-form', this.el).onsubmit = e => {
      e.preventDefault();
      this.cb.crear($('#sel-nombre', this.el).value.trim(), this.el.querySelector('input[name=sel-clase]:checked').value);
    };
    const v = $('#sel-volver', this.el); if (v) v.onclick = () => this.dibujar();
  }

  // Cámara y animaciones mientras se elige.
  update(dt, camara) {
    this.t += dt;
    for (const f of this.figuras) { f.vis.muneco.update(dt); if (f.e) this.cb.animar?.(f.e, dt); }
    this.anillo.rotation.z += dt;
    // Los personajes quedan en la mitad de arriba de la pantalla; abajo va la lista.
    const f = this.figuras[this.sel], mira = f ? new THREE.Vector3(f.x * 0.6, -0.6, f.z * 0.4) : new THREE.Vector3(0, -0.4, 0);
    const vertical = anchoP() < altoP();
    camara.position.lerp(new THREE.Vector3(mira.x * 0.4, vertical ? 5 : 4.2, vertical ? 13 : 11.5), Math.min(1, dt * 2));
    camara.lookAt(mira);
  }

  tocar(sx, sy, camara) {
    const v = new THREE.Vector3();
    this.figuras.forEach((f, i) => {
      v.set(f.x, 1, f.z).project(camara);
      const x = (v.x * 0.5 + 0.5) * anchoP(), y = (-v.y * 0.5 + 0.5) * altoP();
      if (Math.hypot(x - sx, y - sy) < 60) this.elegir(i);
    });
  }
}
