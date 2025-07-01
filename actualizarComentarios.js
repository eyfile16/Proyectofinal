const mongoose = require('mongoose');
const Producto = require('./models/Producto');
const Usuario = require('./models/usuarioModel');

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://sergiocjandres2004:S9aps7x2epuvs9PD@proyectofinalfinalisimo.adxgpsc.mongodb.net/', {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      bufferTimeoutMS: 30000,
    });
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Actualizar comentarios con usuarios válidos
const actualizarComentarios = async () => {
  try {
    // Obtener usuarios de prueba
    const usuarios = await Usuario.find({
      email: { $in: ['maria@test.com', 'juan@test.com', 'ana@test.com', 'carlos@test.com'] }
    });
    
    console.log(`📋 Usuarios encontrados: ${usuarios.length}`);
    usuarios.forEach(u => console.log(`- ${u.nombre} (${u._id})`));

    if (usuarios.length === 0) {
      console.log('❌ No se encontraron usuarios de prueba');
      return;
    }

    // Buscar productos con comentarios
    const productos = await Producto.find({ 
      'comentarios.0': { $exists: true } 
    });

    console.log(`\n📦 Productos con comentarios: ${productos.length}`);

    let comentariosActualizados = 0;

    for (const producto of productos) {
      console.log(`\n🔍 Procesando producto: ${producto.nombre}`);
      console.log(`   Comentarios: ${producto.comentarios.length}`);

      let productoModificado = false;

      for (let i = 0; i < producto.comentarios.length; i++) {
        const comentario = producto.comentarios[i];
        
        // Asignar usuario aleatorio de los usuarios de prueba
        const usuarioAleatorio = usuarios[Math.floor(Math.random() * usuarios.length)];
        
        console.log(`   📝 Comentario ${i + 1}: "${comentario.texto.substring(0, 30)}..."`);
        console.log(`      Usuario anterior: ${comentario.usuario}`);
        console.log(`      Usuario nuevo: ${usuarioAleatorio.nombre} (${usuarioAleatorio._id})`);
        
        // Actualizar el usuario del comentario
        producto.comentarios[i].usuario = usuarioAleatorio._id;
        productoModificado = true;
        comentariosActualizados++;
      }

      if (productoModificado) {
        await producto.save();
        console.log(`   ✅ Producto actualizado`);
      }
    }

    console.log(`\n🎉 Proceso completado!`);
    console.log(`📊 Comentarios actualizados: ${comentariosActualizados}`);

  } catch (error) {
    console.error('❌ Error actualizando comentarios:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Ejecutar
const main = async () => {
  await connectDB();
  await actualizarComentarios();
};

main();
