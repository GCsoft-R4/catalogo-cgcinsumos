const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function initDatabase() {
  try {
    // =====================================
    // Multi-tenancy: tabla de tenants
    // =====================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        domain VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tenant por defecto si no existe
    const defaultDomain = process.env.DEFAULT_DOMAIN || 'localhost';
    let tenantResult = await pool.query(
      'SELECT id FROM tenants WHERE slug = $1',
      ['default']
    );

    let defaultTenantId;
    if (tenantResult.rows.length === 0) {
      const r = await pool.query(
        'INSERT INTO tenants (name, slug, domain) VALUES ($1, $2, $3) RETURNING id',
        ['Default', 'default', defaultDomain]
      );
      defaultTenantId = r.rows[0].id;
      console.log(`Default tenant created (id=${defaultTenantId}, domain=${defaultDomain})`);
    } else {
      defaultTenantId = tenantResult.rows[0].id;
    }

    // =====================================
    // Tablas principales con tenant_id
    // =====================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT NOT NULL DEFAULT '',
        precio DECIMAL(10,2) NOT NULL DEFAULT 0,
        imagen TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        username VARCHAR(100) NOT NULL,
        password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS producto_imagenes (
        id SERIAL PRIMARY KEY,
        producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        orden INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        nombre VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        orden INTEGER NOT NULL DEFAULT 0
      );
    `);

    // =====================================
    // Migración: agregar tenant_id a registros existentes
    // =====================================
    // Productos
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='productos' AND column_name='tenant_id'
        ) THEN
          ALTER TABLE productos ADD COLUMN tenant_id INTEGER REFERENCES tenants(id);
          UPDATE productos SET tenant_id = ${defaultTenantId} WHERE tenant_id IS NULL;
          ALTER TABLE productos ALTER COLUMN tenant_id SET NOT NULL;
        END IF;
      END $$;
    `);

    // Usuarios
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='usuarios' AND column_name='tenant_id'
        ) THEN
          ALTER TABLE usuarios ADD COLUMN tenant_id INTEGER REFERENCES tenants(id);
          UPDATE usuarios SET tenant_id = ${defaultTenantId} WHERE tenant_id IS NULL;
          ALTER TABLE usuarios ALTER COLUMN tenant_id SET NOT NULL;
        END IF;
      END $$;
    `);

    // Categorías
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='categorias' AND column_name='tenant_id'
        ) THEN
          ALTER TABLE categorias ADD COLUMN tenant_id INTEGER REFERENCES tenants(id);
          UPDATE categorias SET tenant_id = ${defaultTenantId} WHERE tenant_id IS NULL;
          ALTER TABLE categorias ALTER COLUMN tenant_id SET NOT NULL;
        END IF;
      END $$;
    `);

    // Migrar unique index de slug a ser scoped por tenant
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_indexes
          WHERE tablename='categorias' AND indexname='categorias_slug_key'
        ) THEN
          ALTER TABLE categorias DROP CONSTRAINT categorias_slug_key;
        END IF;
      END $$;
    `);
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS categorias_tenant_slug_idx
        ON categorias (tenant_id, slug);
    `);

    // Migrar índice único de username y crear nuevo índice compuesto
    await pool.query(`
      DROP INDEX IF EXISTS usuarios_username_lower_idx;
    `);
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS usuarios_tenant_username_lower_idx
        ON usuarios (tenant_id, LOWER(username));
    `);

    // Migrar imagen -> producto_imagenes
    await pool.query(`
      INSERT INTO producto_imagenes (producto_id, filename, orden)
      SELECT id, imagen, 0 FROM productos
      WHERE imagen IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM producto_imagenes WHERE producto_imagenes.producto_id = productos.id)
    `);

    // Migrar categoria_id
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

    // =====================================
    // Password reset tokens
    // =====================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        usado BOOLEAN NOT NULL DEFAULT FALSE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // =====================================
    // Seed: usuario admin del tenant por defecto
    // =====================================
    const adminUser = (process.env.ADMIN_USER || 'admin').toLowerCase().trim();
    const adminPass = process.env.ADMIN_PASS || 'admin123';

    const existing = await pool.query(
      'SELECT id FROM usuarios WHERE LOWER(username) = LOWER($1) AND tenant_id = $2',
      [adminUser, defaultTenantId]
    );

    if (existing.rows.length === 0) {
      const hashed = bcrypt.hashSync(adminPass, 10);

      await pool.query(
        'INSERT INTO usuarios (tenant_id, username, password) VALUES ($1, $2, $3)',
        [defaultTenantId, adminUser, hashed]
      );

      console.log(`Admin user "${adminUser}" created for default tenant`);
    }

  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    process.exit(1);
  }
}

module.exports = { initDatabase };