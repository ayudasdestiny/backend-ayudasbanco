require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true, servicio: 'ayudasbanco-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => res.status(404).json({ mensaje: 'Ruta no encontrada' }));

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
