const { pool } = require('../config/db');

async function main() {
  const confirm = process.argv.includes('--confirm');

  const { rows } = await pool.query(
    `SELECT id, nombre
     FROM productos
     WHERE lower(substring(nombre from 1 for 1)) = substring(nombre from 1 for 1)
       AND substring(nombre from 1 for 1) ~ '[a-záéíóú]'
     ORDER BY id`
  );

  if (rows.length === 0) {
    console.log('No hay nombres para capitalizar.');
    await pool.end();
    return;
  }

  console.log(`Productos a capitalizar: ${rows.length}`);
  rows.slice(0, 10).forEach(r => console.log(`  ${r.nombre}`));
  if (rows.length > 10) console.log(`  ...y ${rows.length - 10} más`);

  if (!confirm) {
    console.log('\nModo vista previa. Ejecutá con --confirm para aplicarlo.');
    await pool.end();
    return;
  }

  const result = await pool.query(
    `UPDATE productos
     SET nombre = upper(substring(nombre from 1 for 1)) || substr(nombre, 2)
     WHERE id = ANY($1::int[])`,
    [rows.map(r => r.id)]
  );
  console.log(`\nActualizados: ${result.rowCount}`);
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
