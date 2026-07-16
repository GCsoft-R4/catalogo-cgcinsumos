const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT NOT NULL DEFAULT '',
        precio DECIMAL(10,2) NOT NULL DEFAULT 0,
        imagen TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        password TEXT NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS usuarios_username_lower_idx
        ON usuarios (LOWER(username));

      CREATE TABLE IF NOT EXISTS producto_imagenes (
        id SERIAL PRIMARY KEY,
        producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        orden INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        orden INTEGER NOT NULL DEFAULT 0
      );
    `);

    await pool.query(`
      INSERT INTO producto_imagenes (producto_id, filename, orden)
      SELECT id, imagen, 0 FROM productos
      WHERE imagen IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM producto_imagenes WHERE producto_imagenes.producto_id = productos.id)
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='productos' AND column_name='categoria_id'
        ) THEN
          ALTER TABLE productos ADD COLUMN categoria_id INTEGER REFERENCES categorias(id);
        END IF;
      END $$;
    `);

    const adminUser = (process.env.ADMIN_USER || 'admin').toLowerCase().trim();
    const adminPass = process.env.ADMIN_PASS || 'admin123';

    const existing = await pool.query(
      'SELECT id FROM usuarios WHERE LOWER(username) = LOWER($1)',
      [adminUser]
    );

    if (existing.rows.length === 0) {
      const hashed = bcrypt.hashSync(adminPass, 10);

      await pool.query(
        'INSERT INTO usuarios (username, password) VALUES ($1, $2)',
        [adminUser, hashed]
      );

      console.log(`Admin user "${adminUser}" created`);
    }

  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    process.exit(1);
  }
}

module.exports = { initDatabase };