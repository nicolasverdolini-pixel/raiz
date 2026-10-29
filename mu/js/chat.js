// Chat global: lo que escribís lo ven todos y sale en un globo arriba de tu personaje.
// Si mandás solo un emoji, se muestra grande arriba de la cabeza. "/g mensaje" va solo al grupo y "/h mensaje" a la hermandad.
import { iconoBoton } from './iconos.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const soloEmoji = t => /^(\p{Extended_Pictographic}|\p{Emoji_Component}|‍|️|\s)+$/u.test(t) && /\p{Extended_Pictographic}/u.test(t);
const RAPIDOS = ['😀', '😂', '😡', '😱', '💀', '🔥', '❤️', '👍', '👎', '🙏', '⚔️', '🍺', '🤝', '😈', '👀', '🎉'];

export class Chat {
  constructor(mandar) {
    this.mandar = mandar; this.log = [];
    const hud = document.getElementById('hud');
    const b = document.createElement('button'); b.id = 'b-chat'; b.className = 'hb chatb'; b.setAttribute('aria-label', 'Chat'); b.innerHTML = iconoBoton('ojo', '#3a3330') + '<small id="chat-nuevos"></small>';
    hud.appendChild(b);
    const el = document.createElement('div'); el.id = 'chat'; el.className = 'caja'; el.hidden = true;
    el.innerHTML = `<div class="chat-log" id="chat-log"></div>
      <div class="chat-emojis">${RAPIDOS.map(e => `<button type="button" data-e="${e}">${e}</button>`).join('')}</div>
      <form id="chat-form"><input id="chat-txt" maxlength="140" placeholder="Escribí… (/g grupo · /h hermandad)" autocomplete="off"><button class="btn chico">Enviar</button></form>`;
    hud.appendChild(el);
    const vivo = document.createElement('div'); vivo.id = 'chat-vivo'; hud.appendChild(vivo); this.vivo = vivo;
    this.el = el; this.sinLeer = 0;
    el.addEventListener('pointerdown', e => e.stopPropagation());
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); this.alternar(); });
    $('#chat-form', el).onsubmit = e => { e.preventDefault(); const i = $('#chat-txt', el); if (i.value.trim()) this.mandar({ t: 'chat', txt: i.value }); i.value = ''; };
    el.querySelectorAll('[data-e]').forEach(x => x.onclick = () => this.mandar({ t: 'chat', txt: x.dataset.e }));
    // Que escribir en el chat no mueva al personaje.
    $('#chat-txt', el).addEventListener('keydown', e => e.stopPropagation());
  }
  alternar() {
    this.el.hidden = !this.el.hidden; this.vivo.hidden = !this.el.hidden;
    if (!this.el.hidden) { this.sinLeer = 0; $('#chat-nuevos').textContent = ''; const l = $('#chat-log'); l.scrollTop = l.scrollHeight; }
  }
  recibir(m) {
    this.log.push(m); if (this.log.length > 40) this.log.shift();
    const linea = `<div class="${m.grupo ? 'grupo' : ''} ${m.herm ? 'herm' : ''} ${m.sistema ? 'sistema' : ''}">${m.sistema ? '' : `<b>${esc(m.nombre)}</b> `}${esc(m.txt)}</div>`;
    const l = $('#chat-log'); l.insertAdjacentHTML('beforeend', linea); while (l.children.length > 40) l.firstChild.remove(); l.scrollTop = l.scrollHeight;
    if (this.el.hidden) {
      this.sinLeer++; $('#chat-nuevos').textContent = this.sinLeer > 9 ? '9+' : this.sinLeer;
      const d = document.createElement('div'); d.innerHTML = linea; this.vivo.appendChild(d.firstChild);
      while (this.vivo.children.length > 4) this.vivo.firstChild.remove();
      const hijo = this.vivo.lastChild; setTimeout(() => hijo?.remove(), 7000);
    }
  }
}
