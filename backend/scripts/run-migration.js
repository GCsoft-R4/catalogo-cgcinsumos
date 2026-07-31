const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function main() {
  const name = process.argv[2];
  if (!name) {
    console.log('Uso: node scripts/run-migration.js <archivo.sql>');
    console.log('Ej:  node scripts/run-migration.js 001_producto_colores.sql');
    await pool.end();
    return;
  }

  const filePath = path.join(__dirname, '..', 'database', 'migrations', name);
  if (!fs.existsSync(filePath)) {
    console.error(`No existe ${filePath}`);
    await pool.end();
    process.exit(1);
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  await pool.query(sql);
  console.log(`Migración aplicada: ${name}`);
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
