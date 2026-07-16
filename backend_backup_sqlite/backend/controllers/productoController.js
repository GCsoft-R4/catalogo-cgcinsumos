const { getDb } = require('../config/db');

function getAll(req, res) {
  const db = getDb();
  const productos = db.prepare('SELECT * FROM productos ORDER BY fecha_creacion DESC').all();
  res.json({ ok: true, data: productos });
}

function getById(req, res) {
  const db = getDb();
  const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id);
  if (!producto) {
    return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
  }
  res.json({ ok: true, data: producto });
}

function create(req, res) {
  const db = getDb();
  const { nombre, descripcion, imagen_existente } = req.body;
  const imagen = req.file ? req.file.filename : (imagen_existente || null);

  const result = db.prepare(
    'INSERT INTO productos (nombre, descripcion, imagen) VALUES (?, ?, ?)'
  ).run(nombre, descripcion || '', imagen);

  const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ok: true, data: producto });
}

function update(req, res) {
  const db = getDb();
  const { nombre, descripcion, imagen_existente } = req.body;

  const existing = db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
  }

  const imagen = req.file ? req.file.filename : (imagen_existente || existing.imagen);

  db.prepare(
    'UPDATE productos SET nombre = ?, descripcion = ?, imagen = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(nombre, descripcion || '', imagen, req.params.id);

  const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id);
  res.json({ ok: true, data: producto });
}

function remove(req, res) {
  const db = getDb();

  const existing = db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
  }

  db.prepare('DELETE FROM productos WHERE id = ?').run(req.params.id);
  res.json({ ok: true, data: null });
}

function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ ok: false, error: 'No se subió ninguna imagen' });
  }
  res.json({ ok: true, data: { filename: req.file.filename } });
}

module.exports = { getAll, getById, create, update, remove, uploadImage };
