const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');

function listImages(req, res) {
  const files = fs.readdirSync(uploadsDir)
    .filter(f => ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(f).toLowerCase()))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(uploadsDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  res.json({ ok: true, data: files });
}

function uploadMultiple(req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ ok: false, error: 'No se subieron imágenes' });
  }
  const files = req.files.map(f => ({ filename: f.filename }));
  res.json({ ok: true, data: files });
}

function deleteImage(req, res) {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ ok: false, error: 'Imagen no encontrada' });
    }

    fs.unlinkSync(filePath);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error deleteImage:', err);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
}

module.exports = { listImages, uploadMultiple, deleteImage };
