require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

(async () => {
  await connectDB();
  const email = (process.env.ADMIN_EMAIL || 'admin@bancolombia.com.co').toLowerCase();
  const existe = await User.findOne({ email });
  if (existe) {
    console.log('El usuario administrador ya existe:', email);
    process.exit(0);
  }
  await User.create({
    nombre: 'Administrador',
    email,
    password: process.env.ADMIN_PASSWORD || 'CambiaEstaClave123',
    rol: 'admin',
  });
  console.log('Usuario administrador creado:', email);
  process.exit(0);
})();
