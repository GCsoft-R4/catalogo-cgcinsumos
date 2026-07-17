const { pool } = require('../config/db');

async function getConfig(req, res) {
  try {
    const tenantId = req.tenant?.id;
    const result = await pool.query(
      'SELECT telefono, direccion, horarios FROM configuracion WHERE tenant_id = $1',
      [tenantId]
    );
    const config = result.rows[0] || { telefono: '', direccion: '', horarios: '' };
    res.json({ ok: true, data: config });
  } catch (err) {
    console.error('Error getConfig:', err);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
}

async function updateConfig(req, res) {
  try {
    const tenantId = req.tenant?.id;
    const { telefono, direccion, horarios } = req.body;

    await pool.query(
      `UPDATE configuracion SET telefono = $1, direccion = $2, horarios = $3, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = $4`,
      [telefono || '', direccion || '', horarios || '', tenantId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('Error updateConfig:', err);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
}

module.exports = { getConfig, updateConfig };
