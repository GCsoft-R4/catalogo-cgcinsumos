const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { pool } = require('../config/db');

async function forgotPassword(req, res) {
  try {
    const tenantId = req.user?.tenant_id;
    const username = req.body.username?.toLowerCase().trim();

    if (!username) {
      return res.status(400).json({ ok: false, error: 'El usuario es obligatorio' });
    }

    const userResult = await pool.query(
      'SELECT id FROM usuarios WHERE LOWER(username) = LOWER($1) AND tenant_id = $2',
      [username, tenantId]
    );

    if (userResult.rows.length === 0) {
      return res.json({ ok: true, data: { mensaje: 'Si el usuario existe, recibirás un enlace de recuperación' } });
    }

    const usuarioId = userResult.rows[0].id;
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      'INSERT INTO password_reset_tokens (tenant_id, usuario_id, token, expires_at) VALUES ($1, $2, $3, $4)',
      [tenantId, usuarioId, token, expiresAt]
    );

    res.json({
      ok: true,
      data: {
        mensaje: 'Token generado. Compartí este enlace con el usuario.',
        resetUrl: `${req.protocol}://${req.headers.host}/admin/reset-password?token=${token}`
      }
    });

  } catch (error) {
    console.error('Error forgot password:', error);
    res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ ok: false, error: 'Token y nueva contraseña son obligatorios' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ ok: false, error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const tokenResult = await pool.query(
      `SELECT * FROM password_reset_tokens
       WHERE token = $1 AND usado = FALSE AND expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ ok: false, error: 'Token inválido o expirado' });
    }

    const tokenData = tokenResult.rows[0];
    const hashed = bcrypt.hashSync(newPassword, 10);

    await pool.query(
      'UPDATE usuarios SET password = $1 WHERE id = $2',
      [hashed, tokenData.usuario_id]
    );

    await pool.query(
      'UPDATE password_reset_tokens SET usado = TRUE WHERE id = $1',
      [tokenData.id]
    );

    res.json({ ok: true, data: { mensaje: 'Contraseña actualizada correctamente' } });

  } catch (error) {
    console.error('Error reset password:', error);
    res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
}

module.exports = { forgotPassword, resetPassword };
