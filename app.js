// app.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dxkufsejm',
  api_key: process.env.CLOUDINARY_API_KEY || '738728374465937',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'YOUR_API_SECRET'
});

// Importar rutas
const productosRoutes = require('./routes/productos');
const categoriasRoutes = require('./routes/categorias');
const authRoutes = require('./routes/authRoutes');
const debugRoutes = require('./routes/debug');
const pedidosRoutes = require('./routes/pedidos');
const usuarioRoutes = require('./routes/usuarioRoutes');
const comentarioRoutes = require('./routes/comentarios');
const metodosPagoRoutes = require('./routes/metodosPago');

// Crear la aplicación Express
const app = express();

// Configuración de middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

// Configuración de CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-token']
}));

// Servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para registrar todas las solicitudes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Cuerpo de la solicitud:', Object.keys(req.body));
    if (req.body.imagen) {
      console.log(
        'Imagen principal recibida (50 caracteres):',
        typeof req.body.imagen === 'string'
          ? req.body.imagen.substring(0, 50) + '...'
          : 'No es una cadena'
      );
    }
    if (req.body.imagenes && Array.isArray(req.body.imagenes)) {
      console.log(`Recibidas ${req.body.imagenes.length} imágenes adicionales`);
    }
  }
  next();
});

// Rutas
app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/comentarios', comentarioRoutes);
app.use('/api/metodos-pago', metodosPagoRoutes);
app.use(express.static('public'));

const PORT = process.env.PORT || 3002;
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);

  // Función para conectar a MongoDB con reintentos
  const connectWithRetry = (retryCount = 0, maxRetries = 5) => {
    console.log(`Intentando conectar a MongoDB (intento ${retryCount + 1} de ${maxRetries})...`);

    mongoose.connect(process.env.CNX_MONGO, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      bufferTimeoutMS: 30000,
    })
      .then(() => {
        console.log('¡Conectado a MongoDB Atlas!');
      })
      .catch((error) => {
        console.error('Error al conectar a MongoDB:', error);

        if (retryCount < maxRetries) {
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
          console.log(`Reintentando en ${retryDelay / 1000} segundos...`);

          setTimeout(() => {
            connectWithRetry(retryCount + 1, maxRetries);
          }, retryDelay);
        } else {
          console.error('Se alcanzó el número máximo de intentos. No se pudo conectar a MongoDB Atlas.');
        }
      });
  };

  // Iniciar el proceso de conexión
  connectWithRetry();
});

module.exports = app;
