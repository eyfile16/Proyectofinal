const mongoose = require('mongoose');
require('dotenv').config();

// URL de conexión a MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tu_usuario:tu_password@cluster0.example.mongodb.net/tu_base_de_datos';

const conectarDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      // Las opciones useNewUrlParser y useUnifiedTopology ya no son necesarias en Mongoose 6+
    });
    console.log('Base de datos MongoDB conectada');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    // Salir con error
    process.exit(1);
  }
};

module.exports = conectarDB;