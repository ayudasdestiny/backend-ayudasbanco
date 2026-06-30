app.use(cors({
  origin: function (origin, callback) {
    // permite file://, localhost y tu dominio de producción
    const permitidos = [
      process.env.CLIENT_URL,
      'http://localhost:5500',
      'http://127.0.0.1:5500',
    ];
    if (!origin || permitidos.includes(origin) || process.env.CLIENT_URL === '*') {
      callback(null, true);
    } else {
      callback(new Error('CORS no permitido: ' + origin));
    }
  },
  credentials: true,
}));
