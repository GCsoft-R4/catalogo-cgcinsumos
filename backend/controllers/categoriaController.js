const { pool } = require('../config/db');

async function getAll(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT c.*, COUNT(p.id)::int AS total_productos FROM categorias c LEFT JOIN productos p ON p.categoria_id = c.id GROUP BY c.id ORDER BY c.orden, c.nombre'
    );
    res.json({ ok: true, data: result.rows });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ ok: false, error: 'El nombre es obligatorio' });
    const slug = nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const result = await pool.query(
      'INSERT INTO categorias (nombre, slug) VALUES ($1, $2) RETURNING *',
      [nombre, slug]
    );
    res.status(201).json({ ok: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ ok: false, error: 'Esa categoría ya existe' });
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ ok: false, error: 'El nombre es obligatorio' });
    const slug = nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const result = await pool.query(
      'UPDATE categorias SET nombre = $1, slug = $2 WHERE id = $3 RETURNING *',
      [nombre, slug, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ ok: false, error: 'Esa categoría ya existe' });
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await pool.query('UPDATE productos SET categoria_id = NULL WHERE categoria_id = $1', [req.params.id]);
    const result = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
    res.json({ ok: true, data: null });
  } catch (err) { next(err); }
}

module.exports = { getAll, create, update, remove };
