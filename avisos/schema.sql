CREATE TABLE IF NOT EXISTS suscripciones (
  endpoint TEXT PRIMARY KEY,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  email TEXT,
  tz INTEGER NOT NULL DEFAULT 0,
  manana TEXT,
  noche TEXT,
  raices TEXT,
  pendientes TEXT,
  fecha TEXT,
  enviado_manana TEXT,
  enviado_noche TEXT,
  creada TEXT
);
