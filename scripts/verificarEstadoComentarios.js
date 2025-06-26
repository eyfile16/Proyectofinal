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

async function verificarEstadoComentarios() {
  try {
    console.log('🔍 Verificando estado actual de comentarios...');
    
    // Obtener un producto específico que sabemos que tiene comentarios
    const producto = await Producto.findById('681e0e4542794d616c890e91');
    
    if (!producto) {
      console.log('❌ Producto no encontrado');
      return;
    }
    
    console.log(`📦 Producto: ${producto.nombre}`);
    console.log(`📝 Comentarios: ${producto.comentarios.length}`);
    
    // Examinar cada comentario
    producto.comentarios.forEach((comentario, index) => {
      console.log(`\n--- Comentario ${index + 1} ---`);
      console.log(`ID: ${comentario._id}`);
      console.log(`Texto: ${comentario.texto}`);
      console.log(`Usuario: ${comentario.usuario}`);
      console.log(`Likes: ${JSON.stringify(comentario.likes)}`);
      console.log(`Dislikes: ${JSON.stringify(comentario.dislikes)}`);
      console.log(`Likes type: ${typeof comentario.likes}`);
      console.log(`Dislikes type: ${typeof comentario.dislikes}`);
      console.log(`Has likes property: ${comentario.hasOwnProperty('likes')}`);
      console.log(`Has dislikes property: ${comentario.hasOwnProperty('dislikes')}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

verificarEstadoComentarios();
