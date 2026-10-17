// Raíz · servicio de avisos.
// Guarda las suscripciones de cada celular y, cada 15 minutos, manda los recordatorios
// de la mañana y de la noche según la hora local de cada persona.

import { enviar } from './webpush.js';

const ORIGENES = ['https://nicolasverdolini-pixel.github.io', 'http://localhost:5180'];

function cors(origen) {
  return {
    'Access-Control-Allow-Origin': ORIGENES.includes(origen) ? origen : ORIGENES[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

const json = (obj, origen, estado = 200) =>
  new Response(JSON.stringify(obj), { status: estado, headers: { 'Content-Type': 'application/json', ...cors(origen) } });

const lista = arr => (arr.length <= 1 ? arr.join('') : `${arr.slice(0, -1).join(', ')} y ${arr[arr.length - 1]}`);
const texto = (v, max) => String(v ?? '').slice(0, max);
const hora = v => (/^\d{2}:\d{2}$/.test(v) ? v : null);

// Fecha y hora local de una persona según su diferencia horaria (en minutos).
function ahoraLocal(tz) {
  const d = new Date(Date.now() + tz * 60000);
  const iso = d.toISOString();
  return { fecha: iso.slice(0, 10), hora: iso.slice(11, 16) };
}
const minutos = hhmm => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const enVentana = (actual, objetivo) => { const dif = minutos(actual) - minutos(objetivo); return dif >= 0 && dif < 45; };

async function suscribir(req, env, origen) {
  const p = await req.json();
  const s = p.suscripcion;
  if (!s?.endpoint || !s.keys?.p256dh || !s.keys?.auth) return json({ error: 'Suscripción inválida' }, origen, 400);
  await env.DB.prepare(`INSERT INTO suscripciones (endpoint, p256dh, auth, email, tz, manana, noche, raices, pendientes, fecha, creada)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, datetime('now'))
      ON CONFLICT(endpoint) DO UPDATE SET p256dh = ?2, auth = ?3, email = ?4, tz = ?5, manana = ?6, noche = ?7, raices = ?8, pendientes = ?9, fecha = ?10`)
    .bind(s.endpoint, s.keys.p256dh, s.keys.auth, texto(p.email, 120) || null, Number(p.tz) || 0,
      hora(p.manana), hora(p.noche), JSON.stringify((p.raices || []).slice(0, 12).map(t => texto(t, 80))),
      JSON.stringify((p.pendientes || []).slice(0, 12).map(t => texto(t, 80))), texto(p.fecha, 10))
    .run();
  return json({ ok: true }, origen);
}

// La app avisa qué raíces le quedan hoy (para el aviso de la noche) y los horarios elegidos.
async function estado(req, env, origen) {
  const p = await req.json();
  if (!p.endpoint) return json({ error: 'Falta el endpoint' }, origen, 400);
  await env.DB.prepare('UPDATE suscripciones SET tz = ?2, manana = ?3, noche = ?4, raices = ?5, pendientes = ?6, fecha = ?7 WHERE endpoint = ?1')
    .bind(p.endpoint, Number(p.tz) || 0, hora(p.manana), hora(p.noche),
      JSON.stringify((p.raices || []).slice(0, 12).map(t => texto(t, 80))),
      JSON.stringify((p.pendientes || []).slice(0, 12).map(t => texto(t, 80))), texto(p.fecha, 10))
    .run();
  return json({ ok: true }, origen);
}

async function desuscribir(req, env, origen) {
  const p = await req.json();
  if (p.endpoint) await env.DB.prepare('DELETE FROM suscripciones WHERE endpoint = ?1').bind(p.endpoint).run();
  return json({ ok: true }, origen);
}

async function probar(req, env, origen) {
  const p = await req.json();
  const fila = await env.DB.prepare('SELECT * FROM suscripciones WHERE endpoint = ?1').bind(p.endpoint || '').first();
  if (!fila) return json({ error: 'No encontramos este celular. Activá los recordatorios de nuevo.' }, origen, 404);
  const codigo = await mandar(fila, { titulo: 'Raíz', cuerpo: 'Así te van a llegar los avisos. Las raíces crecen en silencio 🌱' }, env);
  return json({ ok: codigo < 300, codigo }, origen);
}

// Manda y, si el celular ya no existe (410/404), borra la suscripción.
async function mandar(fila, mensaje, env) {
  const codigo = await enviar({ endpoint: fila.endpoint, keys: { p256dh: fila.p256dh, auth: fila.auth } }, mensaje, env);
  if (codigo === 404 || codigo === 410) await env.DB.prepare('DELETE FROM suscripciones WHERE endpoint = ?1').bind(fila.endpoint).run();
  return codigo;
}

async function recorrer(env) {
  const { results } = await env.DB.prepare('SELECT * FROM suscripciones').all();
  for (const fila of results) {
    try {
      const ahora = ahoraLocal(fila.tz || 0);
      const raices = JSON.parse(fila.raices || '[]');
      // Si la app no se abrió hoy, todas las raíces están pendientes.
      const pendientes = fila.fecha === ahora.fecha ? JSON.parse(fila.pendientes || '[]') : raices;

      if (fila.manana && fila.enviado_manana !== ahora.fecha && enVentana(ahora.hora, fila.manana)) {
        const cuerpo = raices.length ? `Tus raíces de hoy: ${lista(raices)}. Y hay una sorpresa esperándote.` : 'Hay una misión sorpresa esperándote hoy.';
        await mandar(fila, { titulo: 'Buen día 🌱', cuerpo }, env);
        await env.DB.prepare('UPDATE suscripciones SET enviado_manana = ?2 WHERE endpoint = ?1').bind(fila.endpoint, ahora.fecha).run();
      }

      if (fila.noche && fila.enviado_noche !== ahora.fecha && enVentana(ahora.hora, fila.noche)) {
        if (pendientes.length) {
          const n = pendientes.length;
          const cuerpo = `${n === 1 ? 'Te queda 1 raíz' : `Te quedan ${n} raíces`}: ${lista(pendientes)}. Todavía estás a tiempo.`;
          await mandar(fila, { titulo: 'Tu árbol te espera', cuerpo }, env);
        }
        await env.DB.prepare('UPDATE suscripciones SET enviado_noche = ?2 WHERE endpoint = ?1').bind(fila.endpoint, ahora.fecha).run();
      }
    } catch (err) {
      console.error('Error con una suscripción', err);
    }
  }
}

export default {
  async fetch(req, env) {
    const origen = req.headers.get('Origin') || '';
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors(origen) });
    const ruta = new URL(req.url).pathname;
    try {
      if (req.method === 'GET' && ruta === '/clave') return json({ clave: env.VAPID_PUBLICA }, origen);
      if (req.method === 'POST' && ruta === '/suscribir') return await suscribir(req, env, origen);
      if (req.method === 'POST' && ruta === '/estado') return await estado(req, env, origen);
      if (req.method === 'POST' && ruta === '/desuscribir') return await desuscribir(req, env, origen);
      if (req.method === 'POST' && ruta === '/probar') return await probar(req, env, origen);
      return json({ ok: true, app: 'Raíz avisos' }, origen);
    } catch (err) {
      console.error(err);
      return json({ error: 'Algo salió mal' }, origen, 500);
    }
  },

  async scheduled(_evento, env, ctx) {
    ctx.waitUntil(recorrer(env));
  },
};
