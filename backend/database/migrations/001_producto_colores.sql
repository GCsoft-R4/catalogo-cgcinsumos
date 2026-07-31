-- Migración: variantes de color por producto
-- Aplicar:  docker exec catalogoweb_backend node scripts/run-migration.js 001_producto_colores
--   (o psql si se prefiere, ejecutando este archivo)

CREATE TABLE IF NOT EXISTS producto_colores (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  hex VARCHAR(7) NOT NULL DEFAULT '#000000',
  imagen TEXT,
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  orden INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_producto_colores_producto
  ON producto_colores (producto_id);
