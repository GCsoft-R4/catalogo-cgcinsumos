const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

async function getConfig(req, res, next) {
  try {
    const tenantId = req.tenant?.id;
    const result = await pool.query(
      'SELECT nombre_negocio, logo, telefono, direccion, horarios, marquesina, nosotros FROM configuracion WHERE tenant_id = $1',
      [tenantId]
    );
    const config = result.rows[0] || { nombre_negocio: '', logo: '', telefono: '', direccion: '', horarios: '', marquesina: '', nosotros: '' };
    res.json({ ok: true, data: config });
  } catch (err) { next(err); }
}

async function updateConfig(req, res, next) {
  try {
    const tenantId = req.tenant?.id;
    const { nombre_negocio, logo, telefono, direccion, horarios, marquesina, nosotros } = req.body;

    await pool.query(
      `UPDATE configuracion SET nombre_negocio = $1, logo = $2, telefono = $3, direccion = $4, horarios = $5, marquesina = $6, nosotros = $7, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = $8`,
      [nombre_negocio || '', logo || '', telefono || '', direccion || '', horarios || '', marquesina || '', nosotros || '', tenantId]
    );

    res.json({ ok: true });
  } catch (err) { next(err); }
}

async function uploadLogo(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'No se subió imagen' });
    }

    const tenantId = req.tenant?.id;
    const newFilename = req.file.filename;

    // Borrar logo anterior si existe
    const result = await pool.query('SELECT logo FROM configuracion WHERE tenant_id = $1', [tenantId]);
    const oldLogo = result.rows[0]?.logo;
    if (oldLogo) {
      const oldPath = path.join(__dirname, '..', 'uploads', oldLogo);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    await pool.query(
      'UPDATE configuracion SET logo = $1, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = $2',
      [newFilename, tenantId]
    );

    res.json({ ok: true, data: { filename: newFilename } });
  } catch (err) { next(err); }
}

module.exports = { getConfig, updateConfig, uploadLogo };
