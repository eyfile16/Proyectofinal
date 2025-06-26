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

// Restaurar comentarios originales basados en los usuarios reales
const restaurarComentarios = async () => {
  try {
    console.log('Restaurando comentarios originales...');
    
    // Obtener usuarios reales
    const usuarios = await Usuario.find({});
    console.log(`Usuarios encontrados: ${usuarios.length}`);
    
    // Obtener productos
    const productos = await Producto.find({});
    console.log(`Productos encontrados: ${productos.length}`);
    
    // Comentarios originales que probablemente tenías (basado en la imagen que mostraste)
    const comentariosOriginales = [
      {
        productoNombre: "Galaxy S23",
        comentarios: [
          { usuarioEmail: "ay@gmail.com", texto: "Calidad precio excelente", calificacion: 4 },
          { usuarioEmail: "nando111@gmail.com", texto: "Muy buen producto, lo recomiendo", calificacion: 5 }
        ]
      },
      {
        productoNombre: "camiseta",
        comentarios: [
          { usuarioEmail: "ri@gmail.com", texto: "Excelente calidad, muy recomendado", calificacion: 5 },
          { usuarioEmail: "juanm@gmail.com", texto: "Buen producto", calificacion: 4 }
        ]
      },
      {
        productoNombre: "honor",
        comentarios: [
          { usuarioEmail: "manuca@gmail.com", texto: "Muy buena calidad", calificacion: 5 }
        ]
      }
    ];
    
    // Crear un mapa de usuarios por email
    const usuariosPorEmail = {};
    usuarios.forEach(usuario => {
      usuariosPorEmail[usuario.email] = usuario;
    });
    
    // Restaurar comentarios
    for (const item of comentariosOriginales) {
      // Buscar producto que contenga el nombre
      const producto = productos.find(p => 
        p.nombre.toLowerCase().includes(item.productoNombre.toLowerCase())
      );
      
      if (producto) {
        console.log(`\nRestaurando comentarios para: ${producto.nombre}`);
        
        // Limpiar comentarios existentes
        producto.comentarios = [];
        
        // Agregar comentarios originales
        for (const comentarioData of item.comentarios) {
          const usuario = usuariosPorEmail[comentarioData.usuarioEmail];
          
          if (usuario) {
            const comentario = {
              usuario: usuario._id,
              texto: comentarioData.texto,
              calificacion: comentarioData.calificacion,
              fecha: new Date(),
              likes: [],
              dislikes: []
            };
            
            producto.comentarios.push(comentario);
            console.log(`  - Agregado comentario de ${usuario.nombre}: "${comentarioData.texto}"`);
          }
        }
        
        // Recalcular calificación promedio
        if (producto.comentarios.length > 0) {
          const totalCalificaciones = producto.comentarios.reduce((sum, c) => sum + c.calificacion, 0);
          producto.calificacion = Number((totalCalificaciones / producto.comentarios.length).toFixed(1));
        }
        
        // Guardar producto
        await producto.save();
        console.log(`  Producto guardado con ${producto.comentarios.length} comentarios`);
      }
    }
    
    console.log('\nComentarios originales restaurados exitosamente');
    
  } catch (error) {
    console.error('Error al restaurar comentarios:', error);
  }
};

// Ejecutar script
const ejecutar = async () => {
  await connectDB();
  await restaurarComentarios();
  await mongoose.disconnect();
  console.log('Restauración completada');
  process.exit(0);
};

ejecutar();
