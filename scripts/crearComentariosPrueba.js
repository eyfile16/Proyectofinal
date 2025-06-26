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

// Crear comentarios de prueba
const crearComentariosPrueba = async () => {
  try {
    console.log('Creando comentarios de prueba...');
    
    // Obtener algunos usuarios
    const usuarios = await Usuario.find({}).limit(3);
    console.log(`Usuarios encontrados: ${usuarios.length}`);
    
    if (usuarios.length === 0) {
      console.log('No hay usuarios en la base de datos');
      return;
    }
    
    // Obtener algunos productos
    const productos = await Producto.find({}).limit(5);
    console.log(`Productos encontrados: ${productos.length}`);
    
    if (productos.length === 0) {
      console.log('No hay productos en la base de datos');
      return;
    }
    
    // Comentarios de ejemplo
    const comentariosEjemplo = [
      { texto: 'Excelente producto, muy recomendado!', calificacion: 5 },
      { texto: 'Buena calidad, llegó rápido', calificacion: 4 },
      { texto: 'Cumple con las expectativas', calificacion: 4 },
      { texto: 'Muy buen producto, lo recomiendo', calificacion: 5 },
      { texto: 'Calidad precio excelente', calificacion: 4 },
      { texto: 'Producto de buena calidad', calificacion: 4 },
      { texto: 'Me gustó mucho, volveré a comprar', calificacion: 5 },
      { texto: 'Buen servicio y producto', calificacion: 4 }
    ];
    
    let comentariosCreados = 0;
    
    // Agregar comentarios a cada producto
    for (const producto of productos) {
      console.log(`Agregando comentarios al producto: ${producto.nombre}`);
      
      // Limpiar comentarios existentes
      producto.comentarios = [];
      
      // Agregar 2-3 comentarios por producto
      const numComentarios = Math.floor(Math.random() * 2) + 2; // 2 o 3 comentarios
      
      for (let i = 0; i < numComentarios && i < comentariosEjemplo.length; i++) {
        const usuarioAleatorio = usuarios[Math.floor(Math.random() * usuarios.length)];
        const comentarioEjemplo = comentariosEjemplo[Math.floor(Math.random() * comentariosEjemplo.length)];
        
        const nuevoComentario = {
          usuario: usuarioAleatorio._id,
          texto: comentarioEjemplo.texto,
          calificacion: comentarioEjemplo.calificacion,
          fecha: new Date(),
          likes: [],
          dislikes: []
        };
        
        producto.comentarios.push(nuevoComentario);
        comentariosCreados++;
      }
      
      await producto.save();
      console.log(`Comentarios agregados al producto ${producto.nombre}: ${producto.comentarios.length}`);
    }
    
    console.log(`\nComentarios de prueba creados exitosamente:`);
    console.log(`- Total de comentarios creados: ${comentariosCreados}`);
    console.log(`- Productos actualizados: ${productos.length}`);
    
  } catch (error) {
    console.error('Error al crear comentarios de prueba:', error);
  }
};

// Ejecutar script
const ejecutar = async () => {
  await connectDB();
  await crearComentariosPrueba();
  await mongoose.disconnect();
  console.log('Script completado');
  process.exit(0);
};

ejecutar();
