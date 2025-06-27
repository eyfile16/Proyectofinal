const mongoose = require('mongoose');
const Producto = require('../models/Producto');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://proyectofinal:proyectofinal@cluster0.ixhwu.mongodb.net/proyectofinal?retryWrites=true&w=majority&appName=Cluster0';

async function migrarLikes() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    console.log('🔄 Buscando productos con comentarios...');
    const productos = await Producto.find({ 'comentarios.0': { $exists: true } });
    console.log(`📊 Encontrados ${productos.length} productos con comentarios`);

    let productosModificados = 0;
    let comentariosModificados = 0;

    for (const producto of productos) {
      let productoNecesitaGuardar = false;

      for (const comentario of producto.comentarios) {
        let comentarioModificado = false;

        // Agregar campo likes si no existe
        if (!Array.isArray(comentario.likes)) {
          comentario.likes = [];
          comentarioModificado = true;
          console.log(`  ➕ Agregando campo likes a comentario ${comentario._id}`);
        }

        // Agregar campo dislikes si no existe
        if (!Array.isArray(comentario.dislikes)) {
          comentario.dislikes = [];
          comentarioModificado = true;
          console.log(`  ➕ Agregando campo dislikes a comentario ${comentario._id}`);
        }

        if (comentarioModificado) {
          comentariosModificados++;
          productoNecesitaGuardar = true;
        }
      }

      if (productoNecesitaGuardar) {
        await producto.save();
        productosModificados++;
        console.log(`✅ Producto ${producto.nombre} actualizado`);
      }
    }

    console.log('\n🎉 MIGRACIÓN COMPLETADA:');
    console.log(`📦 Productos modificados: ${productosModificados}`);
    console.log(`💬 Comentarios modificados: ${comentariosModificados}`);

  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar migración
migrarLikes();
