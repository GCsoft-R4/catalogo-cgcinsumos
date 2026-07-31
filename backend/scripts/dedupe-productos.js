const { pool } = require('../config/db');

async function main() {
  const confirm = process.argv.includes('--confirm');

  const { rows } = await pool.query(
    `SELECT p1.id AS eliminar, p1.nombre, p1.id AS mantiene
     FROM productos p1
     JOIN productos p2
       ON lower(trim(p1.nombre)) = lower(trim(p2.nombre))
      AND p1.id > p2.id
     ORDER BY p1.id`
  );

  if (rows.length === 0) {
    console.log('No hay productos duplicados por nombre.');
    await pool.end();
    return;
  }

  console.log(`Duplicados encontrados: ${rows.length}`);
  rows.slice(0, 10).forEach(r => console.log(`  id ${r.eliminar}: ${r.nombre}`));
  if (rows.length > 10) console.log(`  ...y ${rows.length - 10} más`);

  if (!confirm) {
    console.log('\nModo vista previa. Ejecutá con --confirm para eliminarlos.');
    await pool.end();
    return;
  }

  const ids = rows.map(r => r.eliminar);
  const result = await pool.query('DELETE FROM productos WHERE id = ANY($1::int[])', [ids]);
  console.log(`\nEliminados: ${result.rowCount}`);
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
