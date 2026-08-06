require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

function normalizeSlug(slug) {
  return String(slug)
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeDomain(domain) {
  return String(domain)
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./, '')
    .replace(/\.$/, '');
}

async function main() {
  const name = process.argv[2];
  const slug = normalizeSlug(process.argv[3]);
  const domain = normalizeDomain(process.argv[4]);
  const username = (process.argv[5] || 'admin').toLowerCase().trim();
  const password = process.argv[6];

  if (!name || !slug || !domain) {
    console.log('Uso: node scripts/create-tenant.js "<Nombre del negocio>" "<slug>" "<dominio.com>" [usuario] [clave]');
    console.log('Ej:  node scripts/create-tenant.js "Mi Negocio 2" "mi-negocio" "mi-negocio.midominio.com" admin mi-clave-segura');
    await pool.end();
    return;
  }
  if (!password) {
    console.error('Falta la clave del admin.');
    await pool.end();
    process.exit(1);
  }

  let tenantId;
  const exist = await pool.query('SELECT id FROM tenants WHERE slug = $1', [slug]);
  if (exist.rows.length > 0) {
    tenantId = exist.rows[0].id;
    console.log(`El tenant "${slug}" ya existe (id=${tenantId}); se reutiliza.`);
  } else {
    const r = await pool.query(
      'INSERT INTO tenants (name, slug, domain) VALUES ($1, $2, $3) RETURNING id',
      [name, slug, domain]
    );
    tenantId = r.rows[0].id;
    console.log(`Tenant creado: "${name}" → ${domain} (id=${tenantId})`);
  }

  const user = await pool.query(
    'SELECT id FROM usuarios WHERE LOWER(username) = LOWER($1) AND tenant_id = $2',
    [username, tenantId]
  );
  if (user.rows.length === 0) {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO usuarios (tenant_id, username, password) VALUES ($1, $2, $3)',
      [tenantId, username, hashed]
    );
    console.log(`Admin "${username}" creado para el tenant "${slug}".`);
  } else {
    console.log(`El usuario "${username}" ya existía en el tenant "${slug}".`);
  }

  await pool.query(
    'INSERT INTO configuracion (tenant_id) SELECT $1 WHERE NOT EXISTS (SELECT 1 FROM configuracion WHERE tenant_id = $1)',
    [tenantId]
  );

  console.log('Listo. Reiniciá el backend para que cargue la configuracion si recién se creó.');
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
