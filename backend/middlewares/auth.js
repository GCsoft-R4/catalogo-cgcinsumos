const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'No autorizado' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded;
    req.tenant = { id: decoded.tenant_id };
    next();
  } catch {
    res.status(401).json({ ok: false, error: 'Token inválido' });
  }
}

module.exports = { authMiddleware };
