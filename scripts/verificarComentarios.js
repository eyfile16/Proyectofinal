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

// Verificar comentarios
const verificarComentarios = async () => {
  try {
    console.log('Verificando comentarios...');
    
    // Obtener un producto específico con comentarios
    const producto = await Producto.findById('681e0e4542794d616c890e91');
    
    if (!producto) {
      console.log('Producto no encontrado');
      return;
    }
    
    console.log(`Producto: ${producto.nombre}`);
    console.log(`Comentarios: ${producto.comentarios.length}`);
    
    // Verificar cada comentario
    for (let i = 0; i < producto.comentarios.length; i++) {
      const comentario = producto.comentarios[i];
      console.log(`\nComentario ${i + 1}:`);
      console.log(`- ID: ${comentario._id}`);
      console.log(`- Usuario ID: ${comentario.usuario}`);
      console.log(`- Texto: ${comentario.texto}`);
      console.log(`- Calificación: ${comentario.calificacion}`);
      
      // Verificar si el usuario existe
      if (comentario.usuario) {
        try {
          const usuario = await Usuario.findById(comentario.usuario);
          if (usuario) {
            console.log(`- Usuario encontrado: ${usuario.nombre} (${usuario.email})`);
          } else {
            console.log(`- Usuario NO encontrado para ID: ${comentario.usuario}`);
          }
        } catch (error) {
          console.log(`- Error al buscar usuario: ${error.message}`);
        }
      } else {
        console.log('- Sin usuario asignado');
      }
    }
    
    // Probar populate
    console.log('\n--- Probando populate ---');
    const productoPopulado = await Producto.findById('681e0e4542794d616c890e91')
      .populate({
        path: 'comentarios.usuario',
        select: 'nombre email avatarPredeterminado imagenPerfil'
      });
    
    if (productoPopulado && productoPopulado.comentarios.length > 0) {
      console.log('Comentarios con populate:');
      productoPopulado.comentarios.forEach((comentario, index) => {
        console.log(`Comentario ${index + 1}:`);
        console.log(`- Usuario: ${JSON.stringify(comentario.usuario)}`);
        console.log(`- Texto: ${comentario.texto}`);
      });
    }
    
  } catch (error) {
    console.error('Error al verificar comentarios:', error);
  }
};

// Ejecutar script
const ejecutar = async () => {
  await connectDB();
  await verificarComentarios();
  await mongoose.disconnect();
  console.log('Verificación completada');
  process.exit(0);
};

ejecutar();
