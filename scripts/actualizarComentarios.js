const mongoose = require('mongoose');
const Producto = require('../models/Producto');

// Configuración de MongoDB
const MONGODB_URI = 'mongodb+srv://juanpabloduquejaramillo:Jp2005@cluster0.fvfbg.mongodb.net/tienda?retryWrites=true&w=majority&appName=Cluster0';

async function actualizarComentarios() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Buscar todos los productos
    const productos = await Producto.find({});
    console.log(`Encontrados ${productos.length} productos`);

    let comentariosActualizados = 0;

    for (const producto of productos) {
      let productoModificado = false;

      for (const comentario of producto.comentarios) {
        // Verificar si el comentario no tiene los campos likes y dislikes
        if (!comentario.likes || !comentario.dislikes) {
          console.log(`Actualizando comentario ${comentario._id} en producto ${producto.nombre}`);

          // Agregar los campos faltantes
          if (!comentario.likes) {
            comentario.likes = [];
          }
          if (!comentario.dislikes) {
            comentario.dislikes = [];
          }

          comentariosActualizados++;
          productoModificado = true;
        }
      }

      // Guardar el producto si fue modificado
      if (productoModificado) {
        await producto.save();
        console.log(`Producto ${producto.nombre} actualizado`);
      }
    }

    console.log(`Proceso completado. ${comentariosActualizados} comentarios actualizados.`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

// Ejecutar el script
actualizarComentarios();
