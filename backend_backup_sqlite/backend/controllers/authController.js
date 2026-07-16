const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/db');

function login(req, res) {
  const { username, password } = req.body;
  const db = getDb();

  const user = db.prepare('SELECT * FROM usuarios WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '24h' }
  );

  res.json({ ok: true, data: { token } });
}

module.exports = { login };
