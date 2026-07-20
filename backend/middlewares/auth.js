const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'No autorizado' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.tenant = { id: decoded.tenant_id };
    next();
  } catch {
    res.status(401).json({ ok: false, error: 'Token inválido' });
  }
}

if (!JWT_SECRET) {
  console.error('JWT_SECRET no está definido. El servidor no arrancará sin esta variable de entorno.');
  process.exit(1);
}

module.exports = { authMiddleware };
