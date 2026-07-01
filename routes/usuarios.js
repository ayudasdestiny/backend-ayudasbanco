const express = require('express');
const User = require('../models/User');
const { proteger, soloAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(proteger, soloAdmin);

router.get('/', async (req, res) => {
  try {
    const usuarios = await User.find().sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(u);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error', error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, email, password, rol, permisos, activo } = req.body;
    if (!nombre || !email || !password)
      return res.status(400).json({ mensaje: 'Nombre, email y contraseña son requeridos' });

    const existe = await User.findOne({ email: email.toLowerCase().trim() });
    if (existe) return res.status(409).json({ mensaje: 'El email ya está registrado' });

    const rolesValidos = ['admin', 'editor', 'visualizador'];
    const u = await User.create({
      nombre, email, password, permisos, activo,
      rol: rolesValidos.includes(rol) ? rol : 'visualizador',
    });
    res.status(201).json(u);
  } catch (err) {
    res.status(400).json({ mensaje: 'Error al crear usuario', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (req.params.id === req.usuario._id.toString() && req.body.rol && req.body.rol !== 'admin')
      return res.status(400).json({ mensaje: 'No puedes quitarte el rol de administrador' });

    const campos = ['nombre', 'email', 'rol', 'activo', 'permisos'];
    const update = {};
    campos.forEach((c) => { if (req.body[c] !== undefined) update[c] = req.body[c]; });

    if (req.body.password) {
      const u = await User.findById(req.params.id);
      if (!u) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      u.set(update);
      u.password = req.body.password;
      await u.save();
      return res.json(u);
    }

    const u = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!u) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(u);
  } catch (err) {
    res.status(400).json({ mensaje: 'Error al actualizar usuario', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === req.usuario._id.toString())
      return res.status(400).json({ mensaje: 'No puedes eliminarte a ti mismo' });
    const u = await User.findByIdAndDelete(req.params.id);
    if (!u) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error: err.message });
  }
});

module.exports = router;
