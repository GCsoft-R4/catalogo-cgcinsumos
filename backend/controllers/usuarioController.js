const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

async function getAll(req, res, next) {
  try {
    const tenantId = req.user?.tenant_id;
    const result = await pool.query(
      `SELECT id, username, email,
              to_char(ultimo_acceso AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS ultimo_acceso
       FROM usuarios WHERE tenant_id = $1 ORDER BY id`,
      [tenantId]
    );
    res.json({ ok: true, data: result.rows });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const tenantId = req.user?.tenant_id;
    const { password, email } = req.body;
    const username = req.body.username.toLowerCase().trim();
    const hashed = bcrypt.hashSync(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (tenant_id, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
      [tenantId, username, email || null, hashed]
    );
    res.status(201).json({ ok: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ ok: false, error: 'El usuario ya existe' });
    }
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const tenantId = req.user?.tenant_id;
    const id = parseInt(req.params.id);
    if (id === req.user.id) {
      return res.status(400).json({ ok: false, error: 'No podés eliminarte a vos mismo' });
    }
    const result = await pool.query(
      'DELETE FROM usuarios WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }
    res.json({ ok: true, data: null });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const tenantId = req.user?.tenant_id;
    const id = parseInt(req.params.id);
    const username = req.body.username?.toLowerCase().trim();
    const email = req.body.email;
    const password = req.body.password;

    if (!username) {
      return res.status(400).json({ ok: false, error: 'El usuario es obligatorio' });
    }

    let result;

    if (password && password.trim() !== '') {
      const hashed = bcrypt.hashSync(password, 10);
      result = await pool.query(
        'UPDATE usuarios SET username = $1, email = $2, password = $3 WHERE id = $4 AND tenant_id = $5 RETURNING id, username, email',
        [username, email || null, hashed, id, tenantId]
      );
    } else {
      result = await pool.query(
        'UPDATE usuarios SET username = $1, email = $2 WHERE id = $3 AND tenant_id = $4 RETURNING id, username, email',
        [username, email || null, id, tenantId]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ ok: false, error: 'El usuario ya existe' });
    }
    next(err);
  }
}

module.exports = { getAll, create, update, remove };
