const express = require('express');
const Item = require('../models/Item');
const { proteger } = require('../middleware/auth');

const router = express.Router();

const MODULOS_VALIDOS = ['inicio', 'codigo', 'enlaces', 'plantillas', 'mensajes', 'correos', 'documentos', 'diario', 'iconos'];

function validarModulo(req, res, next) {
  const { modulo } = req.params;
  if (!MODULOS_VALIDOS.includes(modulo)) {
    return res.status(400).json({ mensaje: 'Módulo inválido' });
  }
  next();
}

// Si el módulo es 'diario', restringe el filtro al usuario autenticado
function filtroPropietario(modulo, usuarioId) {
  return modulo === 'diario' ? { creadoPor: usuarioId } : {};
}

router.use(proteger);

// GET /api/items/:modulo?categoria=&buscar=
router.get('/:modulo', validarModulo, async (req, res) => {
  try {
    const { modulo } = req.params;
    const { categoria, buscar } = req.query;
    const filtro = { modulo, ...filtroPropietario(modulo, req.usuario._id) };
    if (categoria && categoria !== 'Todos') filtro.categoria = categoria;
    if (buscar) filtro.$text = { $search: buscar };

    const items = await Item.find(filtro).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener los registros', error: err.message });
  }
});

// GET /api/items/:modulo/categorias
router.get('/:modulo/categorias', validarModulo, async (req, res) => {
  try {
    const filtro = { modulo: req.params.modulo, ...filtroPropietario(req.params.modulo, req.usuario._id) };
    const categorias = await Item.distinct('categoria', filtro);
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener categorías', error: err.message });
  }
});

// GET /api/items/:modulo/:id
router.get('/:modulo/:id', validarModulo, async (req, res) => {
  try {
    const filtro = { _id: req.params.id, modulo: req.params.modulo, ...filtroPropietario(req.params.modulo, req.usuario._id) };
    const item = await Item.findOne(filtro);
    if (!item) return res.status(404).json({ mensaje: 'Registro no encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener el registro', error: err.message });
  }
});

// POST /api/items/:modulo
router.post('/:modulo', validarModulo, async (req, res) => {
  try {
    const data = { ...req.body, modulo: req.params.modulo, creadoPor: req.usuario._id };
    const item = await Item.create(data);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ mensaje: 'Error al crear el registro', error: err.message });
  }
});

// PUT /api/items/:modulo/:id
router.put('/:modulo/:id', validarModulo, async (req, res) => {
  try {
    const filtro = { _id: req.params.id, modulo: req.params.modulo, ...filtroPropietario(req.params.modulo, req.usuario._id) };
    const item = await Item.findOneAndUpdate(
      filtro,
      { ...req.body, modulo: req.params.modulo },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ mensaje: 'Registro no encontrado o sin permisos' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ mensaje: 'Error al actualizar el registro', error: err.message });
  }
});

// DELETE /api/items/:modulo/:id
router.delete('/:modulo/:id', validarModulo, async (req, res) => {
  try {
    const filtro = { _id: req.params.id, modulo: req.params.modulo, ...filtroPropietario(req.params.modulo, req.usuario._id) };
    const item = await Item.findOneAndDelete(filtro);
    if (!item) return res.status(404).json({ mensaje: 'Registro no encontrado o sin permisos' });
    res.json({ mensaje: 'Registro eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar el registro', error: err.message });
  }
});

module.exports = router;
