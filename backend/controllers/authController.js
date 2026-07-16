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

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        ok: false,
        error: 'Credenciales inválidas'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        tenant_id: tenantId
      },
      process.env.JWT_SECRET || 'secretkey',
      {
        expiresIn: '24h'
      }
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
