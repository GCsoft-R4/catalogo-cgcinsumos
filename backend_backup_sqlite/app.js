require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database/init');
const authRoutes = require('./routes/auth');
const productoRoutes = require('./routes/productos');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

initDatabase();

app.use('/api', authRoutes);
app.use('/api', productoRoutes);

app.use((err, req, res, _next) => {
  console.error(`[${req.method}] ${req.originalUrl}:`, err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ ok: false, error: 'La imagen no puede superar los 5MB' });
  }
  if (err.message?.includes('Tipo de archivo')) {
    return res.status(400).json({ ok: false, error: err.message });
  }
  res.status(500).json({ ok: false, error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
