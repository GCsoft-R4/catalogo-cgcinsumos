require('dotenv').config();

process.on('unhandledRejection', (reason) => {
  console.error('[process] Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[process] Uncaught exception:', err);
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { pool } = require('./config/db');
const { initDatabase } = require('./database/init');
const { tenantMiddleware } = require('./middlewares/tenant');

const authRoutes = require('./routes/auth');
const productoRoutes = require('./routes/productos');
const usuarioRoutes = require('./routes/usuarios');
const categoriaRoutes = require('./routes/categorias');
const resetRoutes = require('./routes/reset');
const configRoutes = require('./routes/config');
const visitasRoutes = require('./routes/visitas');


const app = express();

app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;


// =======================
// CORS — permite cualquier origen porque cada tenant usa su dominio
// En producción se puede restringir con CORS_ORIGINS env
// =======================

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['https://catalogo-web-nine.vercel.app', 'https://gc-catalogo.vercel.app'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || corsOrigins.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Responder preflight OPTIONS
app.options('*', cors());


// =======================
// Seguridad: headers HTTP
// =======================

const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
  imgSrc: ["'self'", 'data:', 'https://placehold.co', ...corsOrigins],
  fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
  connectSrc: ["'self'", ...corsOrigins],
  frameAncestors: ["'none'"],
};

app.use(helmet({ contentSecurityPolicy: { directives: cspDirectives }, crossOriginResourcePolicy: { policy: 'cross-origin' } }));


// =======================
// Rate limiting
// =======================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { ok: false, error: 'Demasiados intentos. Intentá de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { ok: false, error: 'Demasiadas solicitudes. Intentá de nuevo más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = (req.ip || req.socket?.remoteAddress || '').replace(/^::ffff:/, '');
    return ip || req.headers.host || 'unknown';
  },
});

const visitasLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { ok: false, error: 'Demasiadas solicitudes. Intentá de nuevo más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = (req.ip || req.socket?.remoteAddress || '').replace(/^::ffff:/, '');
    return ip || req.headers.host || 'unknown';
  },
});


// =======================
// Middlewares globales
// =======================

app.use(express.json());


// =======================
// Health check — público, no pasa por tenant
// =======================

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'up' });
  } catch (e) {
    console.error('[health] DB check failed:', e.message);
    res.status(503).json({ ok: false, db: 'down' });
  }
});

// =======================
// Request logger — antes de tenant para ver todo
// =======================

app.use('/api', (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(
      `[req] ${req.method} ${req.originalUrl} host=${req.headers.host} xff=${req.headers['x-forwarded-host'] || '-'} status=${res.statusCode} ${Date.now() - start}ms`
    );
  });
  next();
});

// =======================
// Archivos estáticos
// =======================

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);


// =======================
// Rate limiting — ANTES de tenantMiddleware para no pegar a la DB al pedo
// =======================

app.use('/api/login', authLimiter);
app.use('/api/forgot-password', authLimiter);
app.use('/api/visitas', visitasLimiter);
app.use('/api', apiLimiter);

// =======================
// Tenant middleware
// =======================

app.use('/api', tenantMiddleware);

app.use('/api', authRoutes);

app.use('/api', productoRoutes);

app.use('/api', usuarioRoutes);
app.use('/api', categoriaRoutes);
app.use('/api', resetRoutes);
app.use('/api', configRoutes);
app.use('/api', visitasRoutes);


// =======================
// Manejo de errores
// =======================

app.use((err, req, res, _next) => {
  console.error(
    `[${req.method}] ${req.originalUrl}:`,
    err.message,
    '\n',
    err.stack?.split('\n').slice(1, 3).join('\n')
  );

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      ok: false,
      error: 'La imagen no puede superar los 5MB'
    });
  }

  if (err.message?.includes('Tipo de archivo')) {
    return res.status(400).json({
      ok: false,
      error: err.message
    });
  }

  res.status(err.status || 500).json({
    ok: false,
    error: err.status ? err.message : 'Error interno del servidor'
  });
});


// =======================
// Inicialización
// =======================

initDatabase()

  .then(() => {

    app.listen(PORT, () => {

      console.log(
        `Servidor corriendo en http://localhost:${PORT}`
      );

    });

  })

  .catch(err => {

    console.error(
      'Error inicializando DB:',
      err
    );

    process.exit(1);

  });