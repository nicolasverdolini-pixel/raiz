/**
 * Raíz — servidor en Google Apps Script.
 *
 * Guarda el progreso de cada jugador en su propia carpeta de Drive:
 *   Raíz / usuarios / <email> / progreso.json
 * y maneja el ingreso con email + código de 6 números.
 *
 * Se publica como "Aplicación web": ejecutar como "Yo", acceso "Cualquier persona".
 */

const CARPETA_RAIZ = 'Raíz';
const CARPETA_USUARIOS = 'usuarios';
const ARCHIVO = 'progreso.json';
const MINUTOS_CODIGO = 15;
const INTENTOS_CODIGO = 5;
const CODIGOS_POR_HORA = 5;
const DIAS_SESION = 365;

// ---------- Entrada ----------

function doPost(e) {
  let pedido;
  try {
    pedido = JSON.parse(e.postData.contents);
  } catch (err) {
    return responder({ error: 'Pedido inválido' });
  }
  const acciones = { pedirCodigo, verificar, cargar, guardar, cambiarEmail, cerrarSesion };
  const accion = acciones[pedido.accion];
  if (!accion) return responder({ error: 'Acción desconocida' });
  try {
    return responder(accion(pedido));
  } catch (err) {
    console.error(err);
    return responder({ error: 'Algo salió mal en el servidor. Probá de nuevo en un rato.' });
  }
}

function doGet() {
  return responder({ ok: true, app: 'Raíz' });
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------- Ingreso con código ----------

function pedirCodigo(p) {
  const email = normalizar(p.email);
  if (!emailValido(email)) return { error: 'Ese email no parece válido.' };

  const props = PropertiesService.getScriptProperties();
  const ahora = Date.now();

  // Límite de códigos por hora para cada email.
  const claveEnvios = 'envios:' + email;
  const envios = (JSON.parse(props.getProperty(claveEnvios) || '[]')).filter(t => ahora - t < 3600e3);
  if (envios.length >= CODIGOS_POR_HORA) return { error: 'Pediste muchos códigos. Esperá un rato y probá de nuevo.' };
  if (MailApp.getRemainingDailyQuota() < 1) return { error: 'Hoy ya se mandaron muchos códigos. Probá mañana.' };

  const codigo = String(Math.floor(100000 + Math.random() * 900000));
  props.setProperty('codigo:' + email, JSON.stringify({
    hash: hashear(codigo + email),
    expira: ahora + MINUTOS_CODIGO * 60e3,
    intentos: 0,
  }));
  envios.push(ahora);
  props.setProperty(claveEnvios, JSON.stringify(envios));

  MailApp.sendEmail({
    to: email,
    name: 'Raíz',
    subject: `Tu código de Raíz: ${codigo}`,
    body: `Tu código para entrar a Raíz es ${codigo}. Vence en ${MINUTOS_CODIGO} minutos.\n\nSi no lo pediste vos, ignorá este mail.`,
    htmlBody: mailCodigo(codigo),
  });
  return { ok: true };
}

function verificar(p) {
  const email = normalizar(p.email);
  const error = revisarCodigo(email, p.codigo);
  if (error) return { error };

  const token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
  PropertiesService.getScriptProperties().setProperty('sesion:' + token, JSON.stringify({ email, expira: Date.now() + DIAS_SESION * 864e5 }));
  const guardado = leer(email);
  return { ok: true, token, email, progreso: guardado.datos, version: guardado.version };
}

function revisarCodigo(email, codigo) {
  const props = PropertiesService.getScriptProperties();
  const clave = 'codigo:' + email;
  const c = JSON.parse(props.getProperty(clave) || 'null');
  if (!c) return 'Pedí un código nuevo.';
  if (Date.now() > c.expira) { props.deleteProperty(clave); return 'El código venció. Pedí uno nuevo.'; }
  if (c.intentos >= INTENTOS_CODIGO) { props.deleteProperty(clave); return 'Demasiados intentos. Pedí un código nuevo.'; }
  if (hashear(String(codigo).trim() + email) !== c.hash) {
    c.intentos++;
    props.setProperty(clave, JSON.stringify(c));
    return 'Ese código no es correcto.';
  }
  props.deleteProperty(clave);
  return null;
}

function sesion(token) {
  if (!token) return null;
  const props = PropertiesService.getScriptProperties();
  const s = JSON.parse(props.getProperty('sesion:' + token) || 'null');
  if (!s) return null;
  if (Date.now() > s.expira) { props.deleteProperty('sesion:' + token); return null; }
  return s;
}

function cerrarSesion(p) {
  if (p.token) PropertiesService.getScriptProperties().deleteProperty('sesion:' + p.token);
  return { ok: true };
}

// Pasa el progreso a otro email (verificado con un código enviado a ese email nuevo).
function cambiarEmail(p) {
  const s = sesion(p.token);
  if (!s) return { error: 'sesion' };
  const nuevo = normalizar(p.email);
  if (!emailValido(nuevo)) return { error: 'Ese email no parece válido.' };
  if (nuevo === s.email) return { error: 'Es el mismo email que ya usás.' };
  if (buscarCarpeta(nuevo)) return { error: 'Ese email ya tiene una cuenta en Raíz.' };
  const error = revisarCodigo(nuevo, p.codigo);
  if (error) return { error };

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const carpeta = buscarCarpeta(s.email);
    if (carpeta) carpeta.setName(nuevo);
    PropertiesService.getScriptProperties().setProperty('sesion:' + p.token, JSON.stringify({ email: nuevo, expira: s.expira }));
  } finally {
    lock.releaseLock();
  }
  return { ok: true, email: nuevo };
}

// ---------- Progreso ----------

function cargar(p) {
  const s = sesion(p.token);
  if (!s) return { error: 'sesion' };
  const g = leer(s.email);
  return { ok: true, email: s.email, progreso: g.datos, version: g.version };
}

// Guarda solo si nadie guardó una versión más nueva desde otro dispositivo.
function guardar(p) {
  const s = sesion(p.token);
  if (!s) return { error: 'sesion' };
  if (!p.progreso || typeof p.progreso !== 'object') return { error: 'Progreso inválido' };

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const actual = leer(s.email);
    if (actual.version > (p.version || 0)) {
      return { ok: false, conflicto: true, progreso: actual.datos, version: actual.version };
    }
    const version = actual.version + 1;
    escribir(s.email, { version, actualizado: new Date().toISOString(), datos: p.progreso });
    return { ok: true, version };
  } finally {
    lock.releaseLock();
  }
}

// ---------- Drive ----------

function carpetaUsuarios() {
  const raiz = buscarOCrear(DriveApp.getRootFolder(), CARPETA_RAIZ);
  return buscarOCrear(raiz, CARPETA_USUARIOS);
}

function buscarOCrear(padre, nombre) {
  const it = padre.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : padre.createFolder(nombre);
}

function buscarCarpeta(email) {
  const it = carpetaUsuarios().getFoldersByName(email);
  return it.hasNext() ? it.next() : null;
}

function leer(email) {
  const carpeta = buscarCarpeta(email);
  if (!carpeta) return { version: 0, datos: null };
  const it = carpeta.getFilesByName(ARCHIVO);
  if (!it.hasNext()) return { version: 0, datos: null };
  const g = JSON.parse(it.next().getBlob().getDataAsString());
  return { version: g.version || 0, datos: g.datos || null };
}

function escribir(email, contenido) {
  const carpeta = buscarCarpeta(email) || carpetaUsuarios().createFolder(email);
  const texto = JSON.stringify(contenido);
  const it = carpeta.getFilesByName(ARCHIVO);
  if (it.hasNext()) it.next().setContent(texto);
  else carpeta.createFile(ARCHIVO, texto, MimeType.PLAIN_TEXT);
}

// ---------- Utilidades ----------

function normalizar(email) {
  return String(email || '').trim().toLowerCase();
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 120;
}

function hashear(texto) {
  const sal = PropertiesService.getScriptProperties().getProperty('sal') || crearSal();
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, sal + texto);
  return bytes.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}

function crearSal() {
  const sal = Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty('sal', sal);
  return sal;
}

function mailCodigo(codigo) {
  return `
  <div style="background:#f6f1e7;padding:32px 16px;font-family:Georgia,serif;color:#24382a">
    <div style="max-width:420px;margin:0 auto;background:#fffdf8;border:1px solid #e4dccb;border-radius:18px;padding:28px;text-align:center">
      <div style="font-size:13px;letter-spacing:2px;color:#6b7a63;font-family:Arial,sans-serif">RAÍZ</div>
      <h1 style="font-weight:normal;font-size:24px;margin:14px 0 6px">Tu código para entrar</h1>
      <div style="font-size:38px;letter-spacing:8px;margin:18px 0;color:#1f3326;font-family:Arial,sans-serif">${codigo}</div>
      <p style="font-family:Arial,sans-serif;font-size:14px;color:#6b7a63;margin:0">Vence en ${MINUTOS_CODIGO} minutos.</p>
      <p style="font-family:Arial,sans-serif;font-size:12px;color:#8a9580;margin-top:22px">Si no lo pediste vos, ignorá este mail.</p>
    </div>
    <p style="text-align:center;font-style:italic;color:#5c7a4a;margin-top:18px">Las raíces crecen en silencio.</p>
  </div>`;
}

// Para probar desde el editor: crea las carpetas y verifica permisos.
function prepararCarpetas() {
  const c = carpetaUsuarios();
  console.log('Carpeta lista: ' + c.getUrl() + ' · Mails disponibles hoy: ' + MailApp.getRemainingDailyQuota());
}
