const { pool } = require('../config/db');

async function resolveGeo(ip) {
  try {
    const cleanIp = ip.replace(/^::ffff:/, '');
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(cleanIp) || cleanIp === '::1' || cleanIp === '127.0.0.1') return;
    const res = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,country,city,regionName,isp,query`);
    const data = await res.json();
    if (data.status === 'success') {
      await pool.query('UPDATE visitas SET geo = $1 WHERE ip = $2 AND geo IS NULL', [
        JSON.stringify({ pais: data.country, region: data.regionName, ciudad: data.city, isp: data.isp }),
        ip,
      ]);
    }
  } catch (err) {
    console.error('Error resolving geo for', ip, err.message);
  }
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
    resolveGeo(ip);
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
      'SELECT id, ip, pagina, created_at, geo FROM visitas WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [tenantId, limit, offset]
    );

    const data = result.rows.map(v => ({ ...v, geo: v.geo || null }));

    res.json({ ok: true, data, total, page, totalPages: Math.ceil(total / limit) });
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

async function clearVisitas(req, res) {
  try {
    const tenantId = req.tenant?.id;
    await pool.query('DELETE FROM visitas WHERE tenant_id = $1', [tenantId]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error clearVisitas:', err);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
}

module.exports = { registrarVisita, listarVisitas, deleteVisita, clearVisitas };
