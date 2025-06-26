const mongoose = require('mongoose');
const Producto = require('../models/Producto');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.CNX_MONGO, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  bufferTimeoutMS: 30000,
});

async function migrarComentariosSimple() {
  try {
    console.log('🚀 Iniciando migración simple de comentarios...');
    
    // Obtener productos con comentarios
    const productos = await Producto.find({ 'comentarios.0': { $exists: true } });
    console.log(`📦 Encontrados ${productos.length} productos con comentarios`);
    
    let comentariosMigrados = 0;
    
    for (const producto of productos) {
      console.log(`\n📝 Procesando producto: ${producto.nombre} (${producto.comentarios.length} comentarios)`);
      
      let necesitaGuardar = false;
      
      // Procesar cada comentario
      for (let i = 0; i < producto.comentarios.length; i++) {
        const comentario = producto.comentarios[i];
        
        // Verificar si necesita migración
        if (!comentario.hasOwnProperty('likes') || !comentario.hasOwnProperty('dislikes')) {
          console.log(`  🔧 Migrando comentario ${comentario._id}`);
          
          // Asignar directamente al objeto
          comentario.likes = comentario.likes || [];
          comentario.dislikes = comentario.dislikes || [];
          
          necesitaGuardar = true;
          comentariosMigrados++;
        }
      }
      
      // Guardar si hay cambios
      if (necesitaGuardar) {
        await producto.save();
        console.log(`  ✅ Producto guardado`);
        
        // Verificar inmediatamente
        const verificacion = await Producto.findById(producto._id);
        const primerComentario = verificacion.comentarios[0];
        console.log(`  🔍 Verificación:`);
        console.log(`      - Likes: ${JSON.stringify(primerComentario.likes)}`);
        console.log(`      - Dislikes: ${JSON.stringify(primerComentario.dislikes)}`);
        console.log(`      - Has likes: ${primerComentario.hasOwnProperty('likes')}`);
        console.log(`      - Has dislikes: ${primerComentario.hasOwnProperty('dislikes')}`);
      }
    }
    
    console.log('\n🎉 ¡Migración simple completada!');
    console.log(`📊 Comentarios migrados: ${comentariosMigrados}`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

migrarComentariosSimple();
