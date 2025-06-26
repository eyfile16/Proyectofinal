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

// Arreglar usuarios con nombres undefined
const arreglarUsuarios = async () => {
  try {
    console.log('Arreglando usuarios con nombres undefined...');
    
    // Buscar usuarios con nombre undefined o null
    const usuariosProblematicos = await Usuario.find({
      $or: [
        { nombre: 'undefined' },
        { nombre: null },
        { nombre: { $exists: false } }
      ]
    });
    
    console.log(`Usuarios problemáticos encontrados: ${usuariosProblematicos.length}`);
    
    for (const usuario of usuariosProblematicos) {
      console.log(`Arreglando usuario: ${usuario.email}`);
      
      // Generar un nombre basado en el email
      const nombreGenerado = usuario.email.split('@')[0];
      
      // Actualizar el usuario
      await Usuario.updateOne(
        { _id: usuario._id },
        { $set: { nombre: nombreGenerado } }
      );
      
      console.log(`Usuario actualizado: ${usuario.email} -> nombre: ${nombreGenerado}`);
    }
    
    console.log('Usuarios arreglados exitosamente');
    
  } catch (error) {
    console.error('Error al arreglar usuarios:', error);
  }
};

// Ejecutar script
const ejecutar = async () => {
  await connectDB();
  await arreglarUsuarios();
  await mongoose.disconnect();
  console.log('Script completado');
  process.exit(0);
};

ejecutar();
