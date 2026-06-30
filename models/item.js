const mongoose = require('mongoose');

// 'modulo' identifica a qué sección del menú pertenece el registro:
// codigo | enlaces | plantillas | mensajes | correos | documentos | diario | iconos
const itemSchema = new mongoose.Schema(
  {
    modulo: {
      type: String,
      required: true,
      enum: ['codigo', 'enlaces', 'plantillas', 'mensajes', 'correos', 'documentos', 'diario', 'iconos'],
      index: true,
    },
    titulo: { type: String, required: true, trim: true },
    categoria: { type: String, trim: true, default: 'General' },
    descripcion: { type: String, trim: true, default: '' },
    contenido: { type: String, default: '' }, // código HTML, cuerpo del correo, texto del diario, etc.
    url: { type: String, trim: true, default: '' }, // enlaces, videos, documentos
    imagenUrl: { type: String, trim: true, default: '' }, // captura, ícono, miniatura
    etiquetas: [{ type: String, trim: true }],
    destacado: { type: Boolean, default: false },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

itemSchema.index({ titulo: 'text', descripcion: 'text', contenido: 'text', etiquetas: 'text' });

module.exports = mongoose.model('Item', itemSchema);
