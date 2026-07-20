const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const uploadsDir = path.join(__dirname, '..', 'uploads');

async function listImages(req, res) {
  try {
    const usedResult = await pool.query('SELECT DISTINCT filename FROM producto_imagenes');
    const usedSet = new Set(usedResult.rows.map(r => r.filename));

    const files = fs.readdirSync(uploadsDir)
      .filter(f => ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(f).toLowerCase()))
      .map(f => ({ name: f, mtime: fs.statSync(path.join(uploadsDir, f)).mtimeMs, used: usedSet.has(f) }))
      .sort((a, b) => b.mtime - a.mtime);
    res.json({ ok: true, data: files });
  } catch (err) {
    console.error('Error listImages:', err);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
}

function uploadMultiple(req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ ok: false, error: 'No se subieron imágenes' });
  }
  const files = req.files.map(f => ({ filename: f.filename }));
  res.json({ ok: true, data: files });
}

async function deleteImage(req, res) {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ ok: false, error: 'Imagen no encontrada' });
    }

    // Verificar si está siendo usada por algún producto
    const usage = await pool.query(
      `SELECT DISTINCT p.id, p.nombre
       FROM producto_imagenes pi
       JOIN productos p ON p.id = pi.producto_id
       WHERE pi.filename = $1`,
      [filename]
    );

    if (usage.rows.length > 0 && !req.query.force) {
      return res.json({
        ok: false,
        error: 'Imagen en uso',
        usedBy: usage.rows.map(r => ({ id: r.id, nombre: r.nombre })),
      });
    }

    fs.unlinkSync(filePath);

    // Limpiar referencias si se forzó
    if (usage.rows.length > 0) {
      await pool.query('DELETE FROM producto_imagenes WHERE filename = $1', [filename]);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Error deleteImage:', err);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
}

module.exports = { listImages, uploadMultiple, deleteImage };
