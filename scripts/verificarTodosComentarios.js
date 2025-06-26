const mongoose = require('mongoose');
const Producto = require('../models/Producto');
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

// Verificar todos los comentarios
const verificarTodosComentarios = async () => {
  try {
    console.log('Verificando todos los productos con comentarios...');
    
    // Buscar productos que tengan comentarios
    const productos = await Producto.find({
      'comentarios.0': { $exists: true }
    });
    
    console.log(`Productos con comentarios encontrados: ${productos.length}`);
    
    for (const producto of productos) {
      console.log(`\n--- Producto: ${producto.nombre} (ID: ${producto._id}) ---`);
      console.log(`Comentarios: ${producto.comentarios.length}`);
      
      for (let i = 0; i < producto.comentarios.length; i++) {
        const comentario = producto.comentarios[i];
        console.log(`  Comentario ${i + 1}:`);
        console.log(`    - ID: ${comentario._id}`);
        console.log(`    - Usuario ID: ${comentario.usuario}`);
        console.log(`    - Texto: ${comentario.texto}`);
        console.log(`    - Calificación: ${comentario.calificacion}`);
        console.log(`    - Likes: ${comentario.likes?.length || 0}`);
        console.log(`    - Dislikes: ${comentario.dislikes?.length || 0}`);
      }
    }
    
    // También buscar productos sin comentarios para verificar
    const productosSinComentarios = await Producto.find({
      $or: [
        { comentarios: { $exists: false } },
        { comentarios: { $size: 0 } }
      ]
    });
    
    console.log(`\nProductos sin comentarios: ${productosSinComentarios.length}`);
    
  } catch (error) {
    console.error('Error al verificar comentarios:', error);
  }
};

// Ejecutar script
const ejecutar = async () => {
  await connectDB();
  await verificarTodosComentarios();
  await mongoose.disconnect();
  console.log('Verificación completada');
  process.exit(0);
};

ejecutar();
