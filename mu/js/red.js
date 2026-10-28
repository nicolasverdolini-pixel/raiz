// Conexión con el servidor del mapa. Primero la cuenta, después el personaje. Si se corta, vuelve a entrar solo.

const LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);
const pedido = new URLSearchParams(location.search).get('servidor');
export const SERVIDOR = pedido || (LOCAL ? `ws://${location.hostname}:8787` : 'wss://sendas-del-eter.raizapp.workers.dev');

export class Red {
  constructor(alMensaje, alEstado) {
    this.alMensaje = alMensaje; this.alEstado = alEstado;
    this.ws = null; this.cuenta = null; this.pj = null; this.adentro = false; this.cerrado = false; this.ping = 0; this.canal = 'prado-1';
    setInterval(() => this.mandar({ t: 'ping', c: performance.now() }), 3000);
  }

  login(cuenta, clave) { this.cuenta = { cuenta, clave }; this.pj = null; this.cerrado = false; this.conectar(); }
  crearPj(nombre, clase) { this.mandar({ t: 'crearPj', nombre, clase }); }
  jugar(nombre) { this.pj = nombre; this.mandar({ t: 'jugar', nombre }); }
  salirPj() { this.pj = null; this.mandar({ t: 'salirPj' }); }

  conectar() {
    try { this.ws?.close(); } catch (e) {}
    const ws = new WebSocket(`${SERVIDOR}/mapa/${this.canal}`);
    this.ws = ws;
    ws.onopen = () => ws.send(JSON.stringify({ t: 'cuenta', ...this.cuenta }));
    ws.onmessage = e => {
      let m; try { m = JSON.parse(e.data); } catch (err) { return; }
      if (m.t === 'pong') { this.ping = Math.round(performance.now() - m.c); return; }
      if (m.t === 'cuenta') { this.adentro = true; if (this.pj && this.reconectando) { this.reconectando = false; return this.jugar(this.pj); } }
      if (m.t === 'error' && !this.adentro) this.cerrado = true;
      this.alMensaje(m);
    };
    ws.onclose = e => {
      if (ws !== this.ws) return;
      if (e.code === 4000) { this.cerrado = true; this.alEstado('reemplazado'); return; }
      if (this.cerrado) return;
      this.alEstado(this.adentro ? 'reconectando' : 'sin-servidor');
      if (this.adentro) { this.reconectando = true; setTimeout(() => this.conectar(), 1500); }
    };
  }

  mandar(obj) { if (this.ws?.readyState === 1) this.ws.send(JSON.stringify(obj)); }
}
