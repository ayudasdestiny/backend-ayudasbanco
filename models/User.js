const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MODULOS = ['enlaces', 'plantillas', 'mensajes', 'codigo', 'correos', 'documentos', 'diario', 'iconos'];

const permisoModulo = {
  ver:    { type: Boolean, default: true },
  editar: { type: Boolean, default: false },
};

const permisosSchema = {};
MODULOS.forEach((m) => { permisosSchema[m] = permisoModulo; });

const userSchema = new mongoose.Schema(
  {
    nombre:   { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    // admin: acceso total | editor: según permisos | visualizador: solo ver (salvo permisos explícitos)
    rol:      { type: String, enum: ['admin', 'editor', 'visualizador'], default: 'visualizador' },
    activo:   { type: Boolean, default: true },
    permisos: { type: permisosSchema, default: () => {
      const p = {};
      MODULOS.forEach((m) => { p[m] = { ver: true, editar: false }; });
      return p;
    }},
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.compararPassword = function (pw) {
  return bcrypt.compare(pw, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema.statics.MODULOS = MODULOS;

module.exports = mongoose.model('User', userSchema);
