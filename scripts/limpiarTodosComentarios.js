const mongoose = require('mongoose');
const Producto = require('../models/Producto');

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

// Limpiar TODOS los comentarios
const limpiarTodosComentarios = async () => {
  try {
    console.log('Iniciando limpieza TOTAL de comentarios...');
    
    // Actualizar todos los productos para eliminar todos los comentarios
    const resultado = await Producto.updateMany(
      {},
      { $set: { comentarios: [] } }
    );
    
    console.log(`Resultado de la limpieza total:`, resultado);
    console.log(`Productos actualizados: ${resultado.modifiedCount}`);
    
  } catch (error) {
    console.error('Error durante la limpieza total:', error);
  }
};

// Ejecutar script
const ejecutar = async () => {
  await connectDB();
  await limpiarTodosComentarios();
  await mongoose.disconnect();
  console.log('Limpieza total completada');
  process.exit(0);
};

ejecutar();
