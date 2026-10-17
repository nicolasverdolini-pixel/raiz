// Envío de notificaciones Web Push con WebCrypto (sin dependencias).
// Cifrado del mensaje: RFC 8291 (aes128gcm). Firma del servidor: VAPID (RFC 8292).

const te = new TextEncoder();

export const b64u = {
  encode(buf) {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let s = '';
    for (const b of bytes) s += String.fromCharCode(b);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  decode(str) {
    const s = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4));
    return Uint8Array.from(s, c => c.charCodeAt(0));
  },
};

const unir = (...partes) => {
  const total = partes.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total);
  let i = 0;
  for (const p of partes) { out.set(p, i); i += p.length; }
  return out;
};

async function hkdf(salt, ikm, info, largo) {
  const clave = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, clave, largo * 8);
  return new Uint8Array(bits);
}

// Cifra el mensaje para una suscripción { keys: { p256dh, auth } }.
export async function cifrar(texto, sub, salt = crypto.getRandomValues(new Uint8Array(16)), parServidor = null) {
  const uaPublica = b64u.decode(sub.keys.p256dh);
  const auth = b64u.decode(sub.keys.auth);

  const par = parServidor || await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPublica = new Uint8Array(await crypto.subtle.exportKey('raw', par.publicKey));
  const claveUa = await crypto.subtle.importKey('raw', uaPublica, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const secreto = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: claveUa }, par.privateKey, 256));

  const ikm = await hkdf(auth, secreto, unir(te.encode('WebPush: info\0'), uaPublica, asPublica), 32);
  const cek = await hkdf(salt, ikm, te.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, te.encode('Content-Encoding: nonce\0'), 12);

  const claro = unir(te.encode(texto), new Uint8Array([2]));
  const clave = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const cifrado = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, clave, claro));

  const rs = new Uint8Array([0, 0, 16, 0]); // 4096
  return unir(salt, rs, new Uint8Array([asPublica.length]), asPublica, cifrado);
}

// Firma VAPID para el servicio de push de esa suscripción.
async function vapid(endpoint, env) {
  const aud = new URL(endpoint).origin;
  const encabezado = b64u.encode(te.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const cuerpo = b64u.encode(te.encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env.VAPID_CONTACTO })));
  const privada = await crypto.subtle.importKey('jwk', JSON.parse(env.VAPID_PRIVADA), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const firma = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privada, te.encode(`${encabezado}.${cuerpo}`));
  return `vapid t=${encabezado}.${cuerpo}.${b64u.encode(firma)}, k=${env.VAPID_PUBLICA}`;
}

// Manda una notificación. Devuelve el código HTTP del servicio de push.
export async function enviar(sub, mensaje, env) {
  const cuerpo = await cifrar(JSON.stringify(mensaje), sub);
  const r = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      Authorization: await vapid(sub.endpoint, env),
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: '43200',
      Urgency: 'normal',
    },
    body: cuerpo,
  });
  return r.status;
}
