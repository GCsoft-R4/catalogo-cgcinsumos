const { pool } = require('../config/db');

async function getAll(req, res, next) {
  try {
    const tenantId = req.tenant?.id;
    const result = await pool.query(
      `SELECT c.*, COUNT(p.id)::int AS total_productos
       FROM categorias c
       LEFT JOIN productos p ON p.categoria_id = c.id AND p.tenant_id = $1
       WHERE c.tenant_id = $1
       GROUP BY c.id
       ORDER BY c.orden, c.nombre`,
      [tenantId]
    );
    res.json({ ok: true, data: result.rows });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const tenantId = req.user?.tenant_id || req.tenant?.id;
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ ok: false, error: 'El nombre es obligatorio' });
    const slug = nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const result = await pool.query(
      'INSERT INTO categorias (tenant_id, nombre, slug) VALUES ($1, $2, $3) RETURNING *',
      [tenantId, nombre, slug]
    );
    res.status(201).json({ ok: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ ok: false, error: 'Esa categoría ya existe' });
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const tenantId = req.user?.tenant_id || req.tenant?.id;
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ ok: false, error: 'El nombre es obligatorio' });
    const slug = nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const result = await pool.query(
      'UPDATE categorias SET nombre = $1, slug = $2 WHERE id = $3 AND tenant_id = $4 RETURNING *',
      [nombre, slug, req.params.id, tenantId]
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
    const tenantId = req.user?.tenant_id || req.tenant?.id;
    await pool.query(
      'UPDATE productos SET categoria_id = NULL WHERE categoria_id = $1 AND tenant_id = $2',
      [req.params.id, tenantId]
    );
    const result = await pool.query(
      'DELETE FROM categorias WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, tenantId]
    );
    if (result.rows.length === 0) return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
    res.json({ ok: true, data: null });
  } catch (err) { next(err); }
}

module.exports = { getAll, create, update, remove };
