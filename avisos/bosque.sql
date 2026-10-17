CREATE TABLE IF NOT EXISTS bosque (
  id TEXT PRIMARY KEY,
  clave TEXT NOT NULL,
  nombre TEXT NOT NULL,
  especie TEXT,
  nivel INTEGER NOT NULL DEFAULT 1,
  racha INTEGER NOT NULL DEFAULT 0,
  mejor_racha INTEGER NOT NULL DEFAULT 0,
  cumplidas INTEGER NOT NULL DEFAULT 0,
  vitalidad INTEGER NOT NULL DEFAULT 100,
  actualizado TEXT
);
CREATE INDEX IF NOT EXISTS bosque_nivel ON bosque (nivel DESC);
-- Agregado después: decoración del jardín.
-- ALTER TABLE bosque ADD COLUMN logros TEXT;
-- ALTER TABLE bosque ADD COLUMN canjes INTEGER NOT NULL DEFAULT 0;
-- ALTER TABLE bosque ADD COLUMN creado TEXT;
