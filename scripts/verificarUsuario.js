const mongoose = require('mongoose');
const Usuario = require('../models/usuarioModel');

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://sergiocjandres2004:S9aps7x2epuvs9PD@proyectofinalfinalisimo.adxgpsc.mongodb.net/');
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Verificar usuario específico
const verificarUsuario = async () => {
  try {
    const usuarioId = '68485b0190c2c38d1e93efda';
    console.log(`Buscando usuario con ID: ${usuarioId}`);
    
    const usuario = await Usuario.findById(usuarioId);
    
    if (usuario) {
      console.log('Usuario encontrado:');
      console.log(`- ID: ${usuario._id}`);
      console.log(`- Nombre: "${usuario.nombre}"`);
      console.log(`- Email: ${usuario.email}`);
      console.log(`- Avatar: ${usuario.avatarPredeterminado}`);
      console.log(`- Imagen: ${usuario.imagenPerfil}`);
    } else {
      console.log('Usuario NO encontrado');
    }
    
    // Listar todos los usuarios
    console.log('\n--- Todos los usuarios ---');
    const usuarios = await Usuario.find({});
    usuarios.forEach(user => {
      console.log(`ID: ${user._id}, Nombre: "${user.nombre}", Email: ${user.email}`);
    });
    
  } catch (error) {
    console.error('Error al verificar usuario:', error);
  }
};

// Ejecutar script
const ejecutar = async () => {
  await connectDB();
  await verificarUsuario();
  await mongoose.disconnect();
  console.log('Verificación completada');
  process.exit(0);
};

ejecutar();
