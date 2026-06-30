require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');
const usuariosRoutes = require('./routes/usuarios');

const app = express();

connectDB();

app.use(cors({
  origin: function (origin, callback) {
    const permitidos = [
      process.env.CLIENT_URL,
      'http://localhost:5500',
      'http://127.0.0.1:5500',
    ];
    if (!origin || permitidos.includes(origin) || process.env.CLIENT_URL === '*') {
      callback(null, true);
    } else {
      callback(new Error('CORS no permitido: ' + origin));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true, servicio: 'ayudasbanco-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.use((req, res) => res.status(404).json({ mensaje: 'Ruta no encontrada' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
