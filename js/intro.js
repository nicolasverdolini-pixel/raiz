// Introducción: enseña a jugar y arma tu árbol (nombre, especie y primeras raíces).

const Intro = (() => {
  let paso = 0, nombre = '', especie = 'roble', raices = new Set(), repaso = false;

  const icono = {
    raiz: '<path d="M12 4v8M12 12c-3 2-5 5-5 8M12 12c3 2 5 5 5 8M12 12v8"/>',
    rama: '<path d="M4 20L20 4M10 14l-5-1M14 10l1-5"/>',
    hoja: '<path d="M5 19C5 10 11 5 19 5c0 8-5 14-14 14zM5 19l8-8"/>',
    fruto: '<circle cx="12" cy="14" r="6"/><path d="M12 8c0-2 1-4 3-4"/>',
  };
  const ico = k => `<svg viewBox="0 0 24 24" class="intro-ico">${icono[k]}</svg>`;

  const pasos = [
    () => `
      <div class="intro-arte">${treeSVG(0, 100, false, { especie })}</div>
      <h1 class="intro-titulo">Raíz</h1>
      <p class="intro-texto">Tu vida es un árbol. Cada cosa buena que hacés le da <b>savia</b>, y tu árbol crece con vos.</p>
      <p class="intro-chico">Te explico cómo se juega en un minuto.</p>`,
    () => `
      <div class="eyebrow">Cómo se juega</div>
      <h2 class="intro-titulo">Cumplí misiones reales</h2>
      <div class="intro-lista">
        <div>${ico('raiz')}<span><b>Raíces</b>Lo importante de cada día. Pocas y clave: son las únicas obligatorias.</span></div>
        <div>${ico('rama')}<span><b>Ramas</b>Metas de la semana, como entrenar 3 veces.</span></div>
        <div>${ico('hoja')}<span><b>Hojas</b>Extras para cuando tenés ganas. Suman savia.</span></div>
        <div>${ico('fruto')}<span><b>Frutos</b>Desafíos únicos, como ordenar el placard.</span></div>
      </div>`,
    () => `
      <div class="eyebrow">Cómo se juega</div>
      <h2 class="intro-titulo">Tu árbol crece</h2>
      <p class="intro-texto">Cada misión te da savia. Con savia subís de nivel, y tu árbol cambia de etapa.</p>
      <div class="intro-etapas">${[0, 1, 2, 4, 6].map(e => `<div>${treeSVG(e, 100, false, { especie })}<small>${ETAPAS[e].nombre}</small></div>`).join('')}</div>
      <p class="intro-chico">También ganás <b>semillas</b>, que canjeás por premios que elegís vos: una tarde de series, una cena afuera…</p>`,
    () => `
      <div class="eyebrow">Cómo se juega</div>
      <h2 class="intro-titulo">Los días malos también son parte</h2>
      <div class="intro-lista">
        <div>${ico('hoja')}<span><b>Si fallás una raíz</b>Tu árbol pierde algunas hojas, nunca todo lo que creciste.</span></div>
        <div>${ico('raiz')}<span><b>Misión de rescate</b>Al día siguiente podés recuperar tu racha con una versión un poco más larga.</span></div>
        <div>${ico('rama')}<span><b>Días de lluvia</b>Dos por mes para descansar sin culpa. Y modo invierno si estás enfermo o de viaje.</span></div>
      </div>
      <p class="intro-chico">Acá no hay castigos crueles: Raíz te acompaña.</p>`,
    () => `
      <div class="eyebrow">Tu árbol</div>
      <h2 class="intro-titulo">¿Cómo te llamás?</h2>
      <input id="intro-nombre" class="intro-input" value="${esc(nombre)}" placeholder="Tu nombre" autocomplete="given-name" maxlength="24">
      <p class="intro-chico">Así te saluda la app cada día.</p>`,
    () => {
      const e = ESPECIES.find(x => x.id === especie);
      return `
      <div class="eyebrow">Tu árbol</div>
      <h2 class="intro-titulo">Elegí tu árbol</h2>
      <div class="intro-especies">${ESPECIES.map(x => `<button class="esp ${x.id === especie ? 'on' : ''}" data-esp="${x.id}">${treeSVG(5, 100, false, { especie: x.id })}<b>${esc(x.nombre)}</b><small>${esc(x.rasgo)}</small></button>`).join('')}</div>
      <p class="intro-chico intro-esp-texto">${esc(e.texto)}</p>`;
    },
    () => `
      <div class="eyebrow">Tu árbol</div>
      <h2 class="intro-titulo">Elegí tus primeras raíces</h2>
      <p class="intro-chico" style="margin-top:0">Elegí hasta 3. A medida que tu árbol crece, se desbloquean más lugares y misiones más difíciles.</p>
      <div class="intro-raices">${RAICES_SUGERIDAS.map(r => `<button class="item ${raices.has(r.id) ? 'done' : ''}" data-raiz="${r.id}"><span class="check"></span><span class="t"><span>${esc(r.titulo)}</span></span></button>`).join('')}</div>
      <p class="intro-chico" id="intro-cuenta">${raices.size} de 3 elegidas</p>`,
    () => {
      const e = ESPECIES.find(x => x.id === especie);
      const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
      const instalada = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
      return `
      <div class="intro-arte" id="intro-semilla">${treeSVG(0, 100, false, { especie })}</div>
      <h2 class="intro-titulo">Todo listo, ${esc(nombre || 'vos')}</h2>
      <p class="intro-texto">Plantá tu ${esc(e.nombre.toLowerCase())}. Lo que hagas desde hoy lo hace crecer.</p>
      ${ios && !instalada ? '<p class="intro-chico">Tip: para tenerla como app, en Safari tocá <b>Compartir</b> y después <b>Agregar a inicio</b>.</p>' : ''}`;
    },
  ];

  // En el repaso desde Ajustes no se vuelven a elegir raíces si ya jugaste.
  const visibles = () => pasos.map((_, i) => i).filter(i => !(i === 6 && repaso && E.cumplidas > 0));

  function pintar() {
    const lista = visibles();
    const pos = lista.indexOf(paso);
    const ultimo = pos === lista.length - 1;
    const el = document.getElementById('intro');
    el.innerHTML = `
      <div class="intro-top">
        <div class="intro-puntos">${lista.map((_, i) => `<i class="${i <= pos ? 'on' : ''}"></i>`).join('')}</div>
        ${repaso ? '<button class="btn ghost small" data-intro="cerrar">Cerrar</button>' : ''}
      </div>
      <div class="intro-paso">${pasos[paso]()}</div>
      <div class="intro-pie">
        ${pos > 0 ? '<button class="btn ghost" data-intro="atras">Atrás</button>' : '<span></span>'}
        <button class="btn primary" data-intro="${ultimo ? 'plantar' : 'siguiente'}">${pos === 0 ? 'Empezar' : ultimo ? (repaso ? 'Listo' : 'Plantar mi semilla') : 'Siguiente'}</button>
      </div>`;
    const input = document.getElementById('intro-nombre');
    if (input) setTimeout(() => input.focus(), 350);
  }

  function mover(dir) {
    const lista = visibles();
    if (paso === 4) nombre = (document.getElementById('intro-nombre')?.value || '').trim();
    if (dir > 0 && paso === 4 && !nombre) { toast('Contame cómo te llamás'); return; }
    if (dir > 0 && paso === 6 && !raices.size) { toast('Elegí al menos una raíz'); return; }
    const i = lista.indexOf(paso) + dir;
    if (i < 0 || i >= lista.length) return;
    paso = lista[i];
    Sonido.tab();
    pintar();
  }

  function plantar() {
    E.nombre = nombre || E.nombre;
    E.especie = especie;
    if (!repaso || E.cumplidas === 0) aplicarRaices();
    E.bienvenida = true;
    guardar();
    const el = document.getElementById('intro');
    if (repaso) { cerrar(); return; }
    Sonido.nivel();
    document.getElementById('intro-semilla')?.classList.add('plantando');
    setTimeout(() => {
      el.classList.add('saliendo');
      setTimeout(cerrar, 450);
      toast(`Te damos la bienvenida, <b>${esc(E.nombre)}</b>. Tu ${esc(ESPECIES.find(x => x.id === especie).nombre.toLowerCase())} ya está plantado.`);
    }, 1100);
  }

  function aplicarRaices() {
    const h = hoy();
    for (const r of RAICES_SUGERIDAS) {
      const m = E.misiones.find(x => x.id === r.id);
      if (raices.has(r.id)) {
        if (m) { m.tipo = 'raiz'; delete m.archivada; }
        else {
          const c = CATALOGO.find(x => x.id === r.id);
          E.misiones.push({ id: r.id, cat: c?.id, paso: 0, titulo: r.titulo, tipo: 'raiz', area: r.area, savia: 10, opciones: c?.opciones, creada: h });
        }
      } else if (m && m.tipo === 'raiz') {
        m.tipo = 'hoja';
      }
    }
  }

  function cerrar() {
    document.getElementById('intro')?.remove();
    document.body.classList.remove('con-intro');
    render();
  }

  function abrir(esRepaso = false) {
    repaso = esRepaso;
    paso = 0;
    nombre = E.bienvenida ? E.nombre : '';
    especie = E.especie || 'roble';
    raices = new Set(E.misiones.filter(m => m.tipo === 'raiz' && !m.archivada && RAICES_SUGERIDAS.some(r => r.id === m.id)).map(m => m.id));
    if (!document.getElementById('intro')) {
      const el = document.createElement('div');
      el.id = 'intro';
      el.className = 'intro';
      document.body.append(el);
    }
    document.body.classList.add('con-intro');
    pintar();
  }

  document.addEventListener('click', e => {
    const esp = e.target.closest('[data-esp]');
    if (esp && document.getElementById('intro')) {
      especie = esp.dataset.esp;
      Sonido.cumplir();
      pintar();
      return;
    }
    const rz = e.target.closest('[data-raiz]');
    if (rz && document.getElementById('intro')) {
      const id = rz.dataset.raiz;
      if (raices.has(id)) raices.delete(id);
      else if (raices.size < 3) raices.add(id);
      else { toast('En Semilla hay lugar para 3 raíces. Se desbloquean más al crecer.'); return; }
      Sonido.cumplir();
      pintar();
      return;
    }
    const b = e.target.closest('[data-intro]');
    if (!b) return;
    const a = b.dataset.intro;
    if (a === 'siguiente') mover(1);
    else if (a === 'atras') mover(-1);
    else if (a === 'plantar') plantar();
    else if (a === 'cerrar') cerrar();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.id === 'intro-nombre') mover(1);
  });

  // Deslizar con el dedo para avanzar o volver en los pasos explicativos.
  let x0 = null;
  document.addEventListener('touchstart', e => { if (e.target.closest('#intro')) x0 = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', e => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (paso <= 3 && Math.abs(dx) > 60) mover(dx < 0 ? 1 : -1);
  });

  return { abrir };
})();

if (!E.bienvenida && !Nube.necesitaIngreso()) Intro.abrir();
