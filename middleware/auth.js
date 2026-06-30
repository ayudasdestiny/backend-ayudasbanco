const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function proteger(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ mensaje: 'No autorizado, falta token' });
    }
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await User.findById(payload.id);
    if (!usuario) return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    req.usuario = usuario;
    next();
  } catch (err) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
}

function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acción solo permitida para administradores' });
  }
  next();
}

module.exports = { proteger, soloAdmin };
