const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.CNX_MONGO, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  bufferTimeoutMS: 30000,
});

async function migrarComentariosDirecto() {
  try {
    console.log('🚀 Iniciando migración directa de comentarios...');

    // Esperar a que la conexión esté lista
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('open', resolve);
      }
    });

    // Usar la colección directamente
    const db = mongoose.connection.db;
    const productosCollection = db.collection('productos');
    
    // Buscar productos con comentarios que no tengan likes/dislikes
    const productos = await productosCollection.find({
      'comentarios.0': { $exists: true }
    }).toArray();
    
    console.log(`📦 Encontrados ${productos.length} productos con comentarios`);
    
    let comentariosMigrados = 0;
    
    for (const producto of productos) {
      console.log(`\n📝 Procesando producto: ${producto.nombre} (${producto.comentarios.length} comentarios)`);
      
      let necesitaActualizacion = false;
      
      // Procesar cada comentario
      for (let i = 0; i < producto.comentarios.length; i++) {
        const comentario = producto.comentarios[i];
        
        // Verificar si necesita migración
        if (!comentario.hasOwnProperty('likes') || !comentario.hasOwnProperty('dislikes')) {
          console.log(`  🔧 Migrando comentario ${comentario._id}`);
          
          // Asignar campos directamente
          producto.comentarios[i].likes = [];
          producto.comentarios[i].dislikes = [];
          
          necesitaActualizacion = true;
          comentariosMigrados++;
        }
      }
      
      // Actualizar si hay cambios
      if (necesitaActualizacion) {
        const resultado = await productosCollection.updateOne(
          { _id: producto._id },
          { $set: { comentarios: producto.comentarios } }
        );
        
        console.log(`  ✅ Producto actualizado (modifiedCount: ${resultado.modifiedCount})`);
        
        // Verificar inmediatamente
        const verificacion = await productosCollection.findOne({ _id: producto._id });
        const primerComentario = verificacion.comentarios[0];
        console.log(`  🔍 Verificación:`);
        console.log(`      - Likes: ${JSON.stringify(primerComentario.likes)}`);
        console.log(`      - Dislikes: ${JSON.stringify(primerComentario.dislikes)}`);
        console.log(`      - Has likes: ${primerComentario.hasOwnProperty('likes')}`);
        console.log(`      - Has dislikes: ${primerComentario.hasOwnProperty('dislikes')}`);
      }
    }
    
    console.log('\n🎉 ¡Migración directa completada!');
    console.log(`📊 Comentarios migrados: ${comentariosMigrados}`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

migrarComentariosDirecto();
