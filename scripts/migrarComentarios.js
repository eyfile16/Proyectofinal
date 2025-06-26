const mongoose = require('mongoose');
const Producto = require('../models/Producto');
require('dotenv').config();

// Conectar a MongoDB usando la misma configuración del servidor
console.log('🔌 Conectando a MongoDB...');
mongoose.connect(process.env.CNX_MONGO, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  bufferTimeoutMS: 30000,
});

async function migrarComentarios() {
  try {
    console.log('🚀 Iniciando migración de comentarios...');
    
    // Obtener todos los productos
    const productos = await Producto.find({});
    console.log(`📦 Encontrados ${productos.length} productos`);
    
    let productosActualizados = 0;
    let comentariosMigrados = 0;
    
    for (const producto of productos) {
      if (producto.comentarios && producto.comentarios.length > 0) {
        console.log(`\n📝 Procesando producto: ${producto.nombre} (${producto.comentarios.length} comentarios)`);

        let necesitaActualizacion = false;

        // Procesar cada comentario individualmente
        for (let i = 0; i < producto.comentarios.length; i++) {
          const comentarioId = producto.comentarios[i]._id;

          // Actualizar comentario por comentario
          const updateResult = await Producto.updateOne(
            {
              _id: producto._id,
              "comentarios._id": comentarioId
            },
            {
              $set: {
                "comentarios.$.likes": [],
                "comentarios.$.dislikes": []
              }
            }
          );

          if (updateResult.modifiedCount > 0) {
            necesitaActualizacion = true;
            console.log(`  ✅ Comentario ${comentarioId} actualizado`);
          }
        }

        if (necesitaActualizacion) {
          productosActualizados++;
          comentariosMigrados += producto.comentarios.length;

          // Verificar que se guardó correctamente
          const productoVerificacion = await Producto.findById(producto._id);
          const primerComentario = productoVerificacion.comentarios[0];
          console.log(`  🔍 Verificación - Primer comentario:`);
          console.log(`      - Likes: ${JSON.stringify(primerComentario.likes)}`);
          console.log(`      - Dislikes: ${JSON.stringify(primerComentario.dislikes)}`);
        }
      }
    }
    
    console.log('\n🎉 ¡Migración completada!');
    console.log(`📊 Resumen:`);
    console.log(`   - Productos procesados: ${productos.length}`);
    console.log(`   - Productos actualizados: ${productosActualizados}`);
    console.log(`   - Comentarios migrados: ${comentariosMigrados}`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar migración
migrarComentarios();
