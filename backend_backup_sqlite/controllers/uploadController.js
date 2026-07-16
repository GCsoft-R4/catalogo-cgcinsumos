const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');

function listImages(req, res) {
  const files = fs.readdirSync(uploadsDir).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });
  res.json({ ok: true, data: files });
}

function uploadMultiple(req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ ok: false, error: 'No se subieron imágenes' });
  }
  const files = req.files.map(f => ({ filename: f.filename }));
  res.json({ ok: true, data: files });
}

module.exports = { listImages, uploadMultiple };
