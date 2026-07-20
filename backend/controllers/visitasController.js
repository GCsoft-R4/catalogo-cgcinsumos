const { pool } = require('../config/db');

function isLocalIp(ip) {
  if (!ip) return false;
  ip = ip.replace(/^::ffff:/, '');
  if (ip === '::1' || ip === '127.0.0.1') return true;
  if (/^10\./.test(ip)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  return false;
}

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
    const tipo = req.query.tipo || 'todas';

    let where = 'WHERE tenant_id = $1';
    const params = [tenantId];

    if (tipo === 'locales') {
      where = 'WHERE tenant_id = $1 AND (ip LIKE $2 OR ip LIKE $3 OR ip LIKE $4 OR ip LIKE $5 OR ip = $6 OR ip = $7)';
      params.push('10.%', '172.1%', '172.2%', '172.3%', '::1', '127.0.0.1');
    } else if (tipo === 'externas') {
      where = 'WHERE tenant_id = $1 AND ip NOT LIKE $2 AND ip NOT LIKE $3 AND ip NOT LIKE $4 AND ip NOT LIKE $5 AND ip <> $6 AND ip <> $7';
      params.push('10.%', '172.1%', '172.2%', '172.3%', '::1', '127.0.0.1');
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM visitas ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    const result = await pool.query(
      `SELECT id, ip, pagina, created_at FROM visitas ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const data = result.rows.map(v => ({ ...v, local: isLocalIp(v.ip) }));

    res.json({
      ok: true,
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Error listarVisitas:', err);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
}

async function deleteVisita(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    await pool.query('DELETE FROM visitas WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error deleteVisita:', err);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
}

async function clearLocales(req, res) {
  try {
    const tenantId = req.tenant?.id;
    await pool.query(
      `DELETE FROM visitas WHERE tenant_id = $1 AND (ip LIKE $2 OR ip LIKE $3 OR ip LIKE $4 OR ip LIKE $5 OR ip = $6 OR ip = $7)`,
      [tenantId, '10.%', '172.1%', '172.2%', '172.3%', '::1', '127.0.0.1']
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Error clearLocales:', err);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
}

module.exports = { registrarVisita, listarVisitas, deleteVisita, clearLocales };
