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

// Crear comentarios con usuarios reales
const crearComentariosReales = async () => {
  try {
    console.log('Creando comentarios con usuarios reales...');
    
    // Obtener usuarios reales
    const usuarios = await Usuario.find({}).limit(5);
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
      { texto: "Excelente producto, muy buena calidad", calificacion: 5 },
      { texto: "Buena relación calidad-precio", calificacion: 4 },
      { texto: "Cumple con las expectativas", calificacion: 4 },
      { texto: "Muy recomendado, llegó rápido", calificacion: 5 },
      { texto: "Producto de buena calidad", calificacion: 4 },
      { texto: "Me gustó mucho, lo volvería a comprar", calificacion: 5 },
      { texto: "Buen producto pero podría mejorar", calificacion: 3 },
      { texto: "Perfecto, tal como se describe", calificacion: 5 }
    ];
    
    let comentariosCreados = 0;
    
    // Crear comentarios para cada producto
    for (let i = 0; i < productos.length; i++) {
      const producto = productos[i];
      const numComentarios = Math.floor(Math.random() * 3) + 1; // 1-3 comentarios por producto
      
      console.log(`\nCreando comentarios para: ${producto.nombre}`);
      
      for (let j = 0; j < numComentarios; j++) {
        const usuarioAleatorio = usuarios[Math.floor(Math.random() * usuarios.length)];
        const comentarioAleatorio = comentariosEjemplo[Math.floor(Math.random() * comentariosEjemplo.length)];
        
        const nuevoComentario = {
          usuario: usuarioAleatorio._id,
          texto: comentarioAleatorio.texto,
          calificacion: comentarioAleatorio.calificacion,
          fecha: new Date(),
          likes: [],
          dislikes: []
        };
        
        // Agregar el comentario al producto
        producto.comentarios.push(nuevoComentario);
        comentariosCreados++;
        
        console.log(`  - Comentario de ${usuarioAleatorio.nombre}: "${comentarioAleatorio.texto}"`);
      }
      
      // Recalcular calificación promedio
      if (producto.comentarios.length > 0) {
        const totalCalificaciones = producto.comentarios.reduce((sum, c) => sum + c.calificacion, 0);
        producto.calificacion = Number((totalCalificaciones / producto.comentarios.length).toFixed(1));
      }
      
      // Guardar el producto
      await producto.save();
      console.log(`  Producto guardado con ${producto.comentarios.length} comentarios`);
    }
    
    console.log(`\nTotal de comentarios creados: ${comentariosCreados}`);
    
  } catch (error) {
    console.error('Error al crear comentarios:', error);
  }
};

// Ejecutar script
const ejecutar = async () => {
  await connectDB();
  await crearComentariosReales();
  await mongoose.disconnect();
  console.log('Comentarios creados exitosamente');
  process.exit(0);
};

ejecutar();
