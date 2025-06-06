// app.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Importar rutas
const productosRoutes = require('./routes/productos');
const categoriasRoutes = require('./routes/categorias');
const authRoutes = require('./routes/authRoutes');
const debugRoutes = require('./routes/debug');

// Crear la aplicación Express
const app = express();

// Configuración de middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para manejar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// Middleware para registrar todas las solicitudes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Cuerpo de la solicitud:', Object.keys(req.body));
    if (req.body.imagen) {
      console.log('Imagen principal recibida (50 caracteres):', 
        typeof req.body.imagen === 'string' ? req.body.imagen.substring(0, 50) + '...' : 'No es una cadena');
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

const PORT = process.env.PORT || 4800;
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
          // Esperar antes de reintentar (tiempo exponencial de espera)
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
