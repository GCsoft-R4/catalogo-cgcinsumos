const { pool } = require('../config/db');

async function getConfig(req, res, next) {
  try {
    const tenantId = req.tenant?.id;
    const result = await pool.query(
      'SELECT telefono, direccion, horarios, marquesina, nosotros FROM configuracion WHERE tenant_id = $1',
      [tenantId]
    );
    const config = result.rows[0] || { telefono: '', direccion: '', horarios: '', marquesina: '', nosotros: '' };
    res.json({ ok: true, data: config });
  } catch (err) { next(err); }
}

async function updateConfig(req, res, next) {
  try {
    const tenantId = req.tenant?.id;
    const { telefono, direccion, horarios, marquesina, nosotros } = req.body;

    await pool.query(
      `UPDATE configuracion SET telefono = $1, direccion = $2, horarios = $3, marquesina = $4, nosotros = $5, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = $6`,
      [telefono || '', direccion || '', horarios || '', marquesina || '', nosotros || '', tenantId]
    );

    res.json({ ok: true });
  } catch (err) { next(err); }
}

module.exports = { getConfig, updateConfig };
