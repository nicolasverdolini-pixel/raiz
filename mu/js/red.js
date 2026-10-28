// Conexión con el servidor del mapa. Si se corta, vuelve a entrar solo.

const LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);
const pedido = new URLSearchParams(location.search).get('servidor');
export const SERVIDOR = pedido || (LOCAL ? `ws://${location.hostname}:8787` : 'wss://sendas-del-eter.raizapp.workers.dev');

export class Red {
  constructor(alMensaje, alEstado) {
    this.alMensaje = alMensaje; this.alEstado = alEstado;
    this.ws = null; this.cuenta = null; this.adentro = false; this.cerrado = false; this.ping = 0;
    setInterval(() => this.mandar({ t: 'ping', c: performance.now() }), 3000);
  }

  entrar(nombre, clave, canal = 'prado-1') {
    this.cuenta = { nombre, clave, canal }; this.cerrado = false;
    this.conectar();
  }

  conectar() {
    try { this.ws?.close(); } catch (e) {}
    const ws = new WebSocket(`${SERVIDOR}/mapa/${this.cuenta.canal}`);
    this.ws = ws;
    ws.onopen = () => ws.send(JSON.stringify({ t: 'entrar', nombre: this.cuenta.nombre, clave: this.cuenta.clave }));
    ws.onmessage = e => {
      let m; try { m = JSON.parse(e.data); } catch (err) { return; }
      if (m.t === 'pong') { this.ping = Math.round(performance.now() - m.c); return; }
      if (m.t === 'bienvenida') this.adentro = true;
      if (m.t === 'error') this.cerrado = true;
      this.alMensaje(m);
    };
    ws.onclose = e => {
      if (ws !== this.ws) return;
      if (e.code === 4000) { this.cerrado = true; this.alEstado('reemplazado'); return; }
      if (this.cerrado) return;
      this.alEstado(this.adentro ? 'reconectando' : 'sin-servidor');
      if (this.adentro) setTimeout(() => this.conectar(), 1500);
    };
  }

  mandar(obj) { if (this.ws?.readyState === 1) this.ws.send(JSON.stringify(obj)); }
}
