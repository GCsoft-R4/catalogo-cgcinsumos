const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

async function login(req, res) {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return res.status(400).json({ ok: false, error: 'Tenant no identificado' });
    }

    const { password } = req.body;
    const username = req.body.username.toLowerCase().trim();

    const result = await pool.query(
      'SELECT * FROM usuarios WHERE LOWER(username) = $1 AND tenant_id = $2',
      [username, tenantId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }

    await pool.query(
      'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        tenant_id: tenantId
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      ok: true,
      data: { token }
    });

  } catch (error) {
    console.error('Error login:', error);

    res.status(500).json({
      ok: false,
      error: 'Error interno del servidor'
    });
  }
}

module.exports = { login };
