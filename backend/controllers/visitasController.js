const { pool } = require('../config/db');

async function registrarVisita(req, res) {
  try {
    const tenantId = req.tenant?.id;
    const ip = req.ip || req.connection?.remoteAddress || '';
    const pagina = req.body?.pagina || '/';
    await pool.query(
      'INSERT INTO visitas (tenant_id, ip, pagina) VALUES ($1, $2, $3)',
      [tenantId, ip, pagina]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Error registrarVisita:', err);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
}

async function listarVisitas(req, res) {
  try {
    const tenantId = req.tenant?.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) AS total FROM visitas WHERE tenant_id = $1',
      [tenantId]
    );
    const total = parseInt(countResult.rows[0].total);

    const result = await pool.query(
      'SELECT id, ip, pagina, created_at FROM visitas WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [tenantId, limit, offset]
    );

    res.json({
      ok: true,
      data: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Error listarVisitas:', err);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
}

module.exports = { registrarVisita, listarVisitas };
