const { pool } = require('../config/db');

async function tenantMiddleware(req, res, next) {
  try {
    const host = req.headers.host?.split(':')[0] || 'localhost';

    const result = await pool.query(
      'SELECT id, name, slug, domain FROM tenants WHERE domain = $1',
      [host]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Tenant no encontrado para este dominio'
      });
    }

    req.tenant = result.rows[0];
    next();
  } catch (error) {
    console.error('Error resolving tenant:', error);
    res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
}

module.exports = { tenantMiddleware };
