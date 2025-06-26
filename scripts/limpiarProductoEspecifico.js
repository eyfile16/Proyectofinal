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

// Limpiar producto específico
const limpiarProductoEspecifico = async () => {
  try {
    const productoId = '681e0e4542794d616c890e91';
    console.log(`Limpiando producto específico: ${productoId}`);
    
    // Obtener el producto
    const producto = await Producto.findById(productoId).lean();
    if (!producto) {
      console.log('Producto no encontrado');
      return;
    }
    
    console.log(`Producto encontrado: ${producto.nombre}`);
    console.log(`Comentarios actuales: ${producto.comentarios?.length || 0}`);
    
    if (producto.comentarios && producto.comentarios.length > 0) {
      console.log('Comentarios existentes:');
      producto.comentarios.forEach((comentario, index) => {
        console.log(`  ${index}: fecha=${comentario.fecha} (tipo: ${typeof comentario.fecha})`);
      });
    }
    
    // Actualizar directamente en la base de datos
    const resultado = await Producto.updateOne(
      { _id: productoId },
      { $set: { comentarios: [] } }
    );
    
    console.log(`Resultado de la actualización:`, resultado);
    
  } catch (error) {
    console.error('Error durante la limpieza:', error);
  }
};

// Ejecutar script
const ejecutar = async () => {
  await connectDB();
  await limpiarProductoEspecifico();
  await mongoose.disconnect();
  console.log('Limpieza específica completada');
  process.exit(0);
};

ejecutar();
