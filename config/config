const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('Falta la variable de entorno MONGO_URI');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log('MongoDB conectado correctamente');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
