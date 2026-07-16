require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const { initDatabase } = require('./database/init');

const authRoutes = require('./routes/auth');
const productoRoutes = require('./routes/productos');
const usuarioRoutes = require('./routes/usuarios');
const categoriaRoutes = require('./routes/categorias');


const app = express();

const PORT = process.env.PORT || 5000;


// =======================
// CORS
// =======================

app.use(cors({
  origin: [
    'https://catalogo-web-nine.vercel.app',
    'https://gc-catalogo.vercel.app'
  ],
  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'OPTIONS'
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ]
}));


// Responder preflight OPTIONS
app.options('*', cors());


// =======================
// Middlewares
// =======================

app.use(express.json());


// =======================
// Archivos estáticos
// =======================

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);


// =======================
// Rutas API
// =======================

app.use('/api', authRoutes);

app.use('/api', productoRoutes);

app.use('/api', usuarioRoutes);
app.use('/api', categoriaRoutes);


// =======================
// Manejo de errores
// =======================

app.use((err, req, res, _next) => {

  console.error(
    `[${req.method}] ${req.originalUrl}:`,
    err.message
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


  res.status(500).json({
    ok: false,
    error: 'Error interno del servidor'
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