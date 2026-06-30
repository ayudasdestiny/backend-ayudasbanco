const express = require('express');
const Item = require('../models/Item');
const { proteger } = require('../middleware/auth');

const router = express.Router();

const MODULOS_VALIDOS = ['codigo', 'enlaces', 'plantillas', 'mensajes', 'correos', 'documentos', 'diario', 'iconos'];

function validarModulo(req, res, next) {
  const { modulo } = req.params;
  if (!MODULOS_VALIDOS.includes(modulo)) {
    return res.status(400).json({ mensaje: 'Módulo inválido' });
  }
  next();
}

// Todas las rutas requieren sesión iniciada
router.use(proteger);

// GET /api/items/:modulo?categoria=&buscar=
router.get('/:modulo', validarModulo, async (req, res) => {
  try {
    const { modulo } = req.params;
    const { categoria, buscar } = req.query;
    const filtro = { modulo };
    if (categoria && categoria !== 'Todos') filtro.categoria = categoria;
    if (buscar) filtro.$text = { $search: buscar };

    const items = await Item.find(filtro).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener los registros', error: err.message });
  }
});

// GET /api/items/:modulo/categorias  -> lista de categorías existentes en ese módulo
router.get('/:modulo/categorias', validarModulo, async (req, res) => {
  try {
    const categorias = await Item.distinct('categoria', { modulo: req.params.modulo });
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener categorías', error: err.message });
  }
});

// GET /api/items/:modulo/:id
router.get('/:modulo/:id', validarModulo, async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, modulo: req.params.modulo });
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
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, modulo: req.params.modulo },
      { ...req.body, modulo: req.params.modulo },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ mensaje: 'Registro no encontrado' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ mensaje: 'Error al actualizar el registro', error: err.message });
  }
});

// DELETE /api/items/:modulo/:id
router.delete('/:modulo/:id', validarModulo, async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, modulo: req.params.modulo });
    if (!item) return res.status(404).json({ mensaje: 'Registro no encontrado' });
    res.json({ mensaje: 'Registro eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar el registro', error: err.message });
  }
});

module.exports = router;
