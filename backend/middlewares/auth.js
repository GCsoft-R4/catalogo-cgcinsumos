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
    if (decoded.tenant_id) {
      if (req.tenant && req.tenant.id && req.tenant.id !== decoded.tenant_id) {
        console.warn(`[auth] tenant mismatch: host tenant=${req.tenant.id}, token tenant=${decoded.tenant_id}`);
      }
      req.tenant = req.tenant || {};
      req.tenant.id = decoded.tenant_id;
    }
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
