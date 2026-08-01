const { pool } = require('../config/db');

const cache = new Map();
const CACHE_TTL = 60 * 1000;

function normalizeHost(host) {
  if (!host) return '';
  let h = String(host).toLowerCase().trim();
  if (h.startsWith('[')) h = h.slice(1).replace(/\]$/, '');
  h = h.split(':')[0];
  h = h.replace(/\.$/, '');
  h = h.replace(/^www\./, '');
  return h;
}

async function resolveTenant(host) {
  if (cache.has(host)) {
    const entry = cache.get(host);
    if (Date.now() - entry.ts < CACHE_TTL) {
      return entry.tenant;
    }
    cache.delete(host);
  }

  const result = await pool.query(
    'SELECT id, name, slug, domain FROM tenants WHERE domain = $1 LIMIT 1',
    [host]
  );
  const tenant = result.rows[0] || null;

  if (tenant) {
    cache.set(host, { ts: Date.now(), tenant });
  }
  return tenant;
}

async function tenantMiddleware(req, res, next) {
  try {
    const rawHost = req.headers['x-forwarded-host'] || req.hostname || req.headers.host || 'localhost';
    const host = normalizeHost(rawHost);

    let tenant = await resolveTenant(host);

    if (!tenant) {
      const fallbackHost = normalizeHost(process.env.DEFAULT_DOMAIN || 'localhost');
      console.warn(`[tenant] "${host}" no resuelto, usando fallback "${fallbackHost}"`);
      tenant = await resolveTenant(fallbackHost);
    }

    if (!tenant) {
      return res.status(404).json({
        ok: false,
        error: 'Tenant no encontrado para este dominio'
      });
    }

    req.tenant = tenant;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[tenant] host="${rawHost}" (normalized "${host}") -> tenant="${tenant.slug}" (id=${tenant.id})`);
    }
    next();
  } catch (error) {
    console.error('Error resolving tenant:', error);
    res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
}

module.exports = { tenantMiddleware };
