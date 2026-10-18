// Piezas "de juego" de la pantalla Hoy: barra de juego (nivel, experiencia y contadores),
// tu jardín como escenario, el cofre del día y los números que saltan al ganar.

function hudHTML() {
  const nv = nivelDe(E.savia);
  const et = etapaDe(nv.nivel);
  const pct = nv.nivel >= NIVEL_MAX ? 100 : Math.round((nv.dentro / nv.falta) * 100);
  return `<div class="hud">
    <button class="hud-nivel" data-ui="ayuda" data-k="savia" aria-label="Nivel ${nv.nivel}, ${nv.dentro} de ${nv.falta} de savia">
      <span class="escudo"><svg viewBox="0 0 40 44" aria-hidden="true"><path d="M20 2l16 6v12c0 11-7 18-16 22C11 38 4 31 4 20V8z"/></svg><b>${nv.nivel}</b></span>
      <span class="hud-barra"><span class="hud-etapa">${esc(ETAPAS[et].nombre)}</span><span class="hud-xp"><i style="width:${pct}%"></i></span><small>${nv.nivel >= NIVEL_MAX ? E.savia : `${nv.dentro}/${nv.falta}`}</small></span>
    </button>
    <div class="hud-cont">
      <button class="hud-pill fuego" data-ui="ayuda" data-k="racha" aria-label="Racha ${E.racha}">${svgIco(ICONOS.llama)}<b>${E.racha}</b></button>
      <button class="hud-pill vida" data-ui="ayuda" data-k="vitalidad" aria-label="Vitalidad ${E.vitalidad}">${svgIco(ICONOS.corazon)}<b>${E.vitalidad}</b></button>
      <button class="hud-pill semillas" data-ui="ayuda" data-k="semillas" aria-label="Semillas ${E.semillas}">${svgIco(ICONOS.semilla)}<b>${E.semillas}</b></button>
    </div>
  </div>`;
}

function escenaHTML(d, estado) {
  const yo = { ...Bosque.miJardin(), brotes: brotesHoy(d), nuevo: anim.nuevo, sinCartel: true };
  return `<div class="escena-hoy">
    <span class="nube n1"></span><span class="nube n2"></span>
    <div class="escena-fecha">${esc(fechaLarga(d))}</div>
    <div class="dialogo">${saludo()}, ${esc(E.nombre)}. <b>${estado}</b></div>
    <svg class="escena-svg" viewBox="-12 -8 224 210" aria-label="Tu jardín">${Bosque.jardinSVG(yo, 0, 0)}</svg>
    <div class="escena-botones">
      <button class="btn-juego chico" data-bosque="decorar">${svgIco(ICONOS.semilla)} Decorar</button>
      <button class="btn-juego chico claro" data-act="ir-bosque">Ver el Bosque</button>
    </div>
  </div>`;
}

function cofreSVG(abierto) {
  return `<svg viewBox="0 0 64 56" aria-hidden="true">
    <rect x="8" y="24" width="48" height="28" rx="5" fill="#a5672f"/>
    <rect x="8" y="24" width="48" height="28" rx="5" fill="none" stroke="#7a4a1f" stroke-width="2.5"/>
    <rect x="28" y="24" width="8" height="28" fill="#e2b553"/>
    ${abierto
      ? `<path d="M10 22 L18 6 L60 10 L54 24Z" fill="#b97a3a" stroke="#7a4a1f" stroke-width="2.5"/><circle cx="24" cy="22" r="4" fill="#f6d77a"/><circle cx="34" cy="20" r="4.5" fill="#f2c230"/><circle cx="42" cy="23" r="3.5" fill="#f6d77a"/>`
      : `<path d="M8 26 Q8 8 32 8 Q56 8 56 26Z" fill="#b97a3a" stroke="#7a4a1f" stroke-width="2.5"/><rect x="28" y="8" width="8" height="18" fill="#e2b553"/><rect x="27" y="22" width="10" height="9" rx="2" fill="#f2c230" stroke="#a5672f" stroke-width="1.5"/>`}
  </svg>`;
}

function cofreHTML(d, hechasR, total) {
  const abierto = E.cofres?.[d];
  const listo = total > 0 && hechasR >= total && !abierto;
  const pct = total ? Math.round((hechasR / total) * 100) : 0;
  const texto = abierto ? `Cofre abierto: +${abierto} semillas` : listo ? '¡Tocá el cofre para abrirlo!' : `Completá tus raíces para abrir el cofre`;
  return `<div class="cofre-card ${listo ? 'listo' : ''} ${abierto ? 'abierto' : ''}">
    <div class="cofre-info">
      <div class="row between"><b>Raíces de hoy</b><b class="cuenta">${hechasR}/${total}</b></div>
      <div class="cofre-barra"><i style="width:${pct}%"></i></div>
      <small>${texto}</small>
    </div>
    <button class="cofre" data-juego="cofre" aria-label="${listo ? 'Abrir el cofre del día' : 'Cofre del día'}">${cofreSVG(!!abierto)}</button>
  </div>`;
}

function abrirCofre(btn) {
  const d = hoy();
  const raices = raicesDe(d);
  if (!raices.length || raices.some(m => !hechas(d, m.id))) { toast('Completá todas tus raíces de hoy para abrir el cofre'); return; }
  if (E.cofres?.[d]) { toast('Ya abriste el cofre de hoy. ¡Mañana hay otro!'); return; }
  const premio = 10 + Math.floor(Math.random() * 21) + Math.min(E.racha, 20);
  E.cofres ||= {};
  E.cofres[d] = premio;
  E.semillas += premio;
  guardar();
  const r = btn.getBoundingClientRect();
  btn.classList.add('abriendo');
  Sonido.dia();
  setTimeout(() => {
    Sonido.canje();
    flotar(r, `+${premio}`, 'semilla');
    for (let i = 0; i < 12; i++) chispaEn(r);
    render();
    toast(`¡Cofre abierto! <b>+${premio} semillas</b>${E.racha >= 3 ? ` (incluye bonus por tu racha de ${E.racha})` : ''}`);
  }, 650);
}

// Número que salta desde un punto de la pantalla ("+10").
function flotar(rect, texto, tipo = 'gota') {
  if (!rect || reducido()) return;
  const el = document.createElement('div');
  el.className = `flota ${tipo}`;
  el.innerHTML = `${svgIco(tipo === 'semilla' ? ICONOS.semilla : ICONOS.gota)}${esc(texto)}`;
  el.style.left = rect.left + rect.width / 2 + 'px';
  el.style.top = rect.top + 'px';
  document.body.append(el);
  setTimeout(() => el.remove(), 1300);
}

function chispaEn(rect) {
  if (reducido()) return;
  const c = document.createElement('span');
  c.className = 'chispa suelta';
  c.style.left = rect.left + rect.width / 2 + (Math.random() - 0.5) * 80 + 'px';
  c.style.top = rect.top + rect.height / 2 + (Math.random() - 0.5) * 60 + 'px';
  c.style.animationDelay = Math.random() * 0.3 + 's';
  document.body.append(c);
  setTimeout(() => c.remove(), 1800);
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-juego="cofre"]');
  if (b) abrirCofre(b);
});
