const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { proteger } = require('../middleware/auth');

const router = express.Router();

function firmarToken(usuario) {
  return jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y contraseña son requeridos' });
    }
    const usuario = await User.findOne({ email: email.toLowerCase().trim() });
    if (!usuario) return res.status(401).json({ mensaje: 'Credenciales inválidas' });

    const ok = await usuario.compararPassword(password);
    if (!ok) return res.status(401).json({ mensaje: 'Credenciales inválidas' });

    const token = firmarToken(usuario);
    res.json({ token, usuario });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', proteger, async (req, res) => {
  res.json({ usuario: req.usuario });
});

// POST /api/auth/registro  (solo para crear el primer admin o nuevos editores; protégela o quítala en producción si no la necesitas)
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Nombre, email y contraseña son requeridos' });
    }
    const existe = await User.findOne({ email: email.toLowerCase().trim() });
    if (existe) return res.status(409).json({ mensaje: 'El email ya está registrado' });

    const usuario = await User.create({ nombre, email, password, rol: rol === 'admin' ? 'admin' : 'editor' });
    const token = firmarToken(usuario);
    res.status(201).json({ token, usuario });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: err.message });
  }
});

module.exports = router;
