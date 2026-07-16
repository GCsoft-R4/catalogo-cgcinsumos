const { getDb } = require('../config/db');
const bcrypt = require('bcrypt');

function initDatabase() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT NOT NULL DEFAULT '',
      imagen TEXT,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin123';

  const existing = db.prepare('SELECT id FROM usuarios WHERE username = ?').get(adminUser);
  if (!existing) {
    const hashed = bcrypt.hashSync(adminPass, 10);
    db.prepare('INSERT INTO usuarios (username, password) VALUES (?, ?)').run(adminUser, hashed);
    console.log(`Admin user "${adminUser}" created`);
  }
}

module.exports = { initDatabase };
