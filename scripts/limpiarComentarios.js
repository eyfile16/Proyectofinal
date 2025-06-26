const mongoose = require('mongoose');
const Producto = require('../models/Producto');

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

// Limpiar comentarios con fechas inválidas
const limpiarComentarios = async () => {
  try {
    console.log('Iniciando limpieza de comentarios...');

    // Obtener todos los productos usando lean() para evitar validaciones
    const productos = await Producto.find({}).lean();
    console.log(`Encontrados ${productos.length} productos`);

    let productosActualizados = 0;
    let comentariosLimpiados = 0;

    for (const producto of productos) {
      if (producto.comentarios && producto.comentarios.length > 0) {
        console.log(`Procesando producto: ${producto.nombre} (${producto.comentarios.length} comentarios)`);

        let tieneComentariosInvalidos = false;

        // Verificar si hay comentarios con fechas string
        for (const comentario of producto.comentarios) {
          if (comentario.fecha && typeof comentario.fecha === 'string') {
            tieneComentariosInvalidos = true;
            break;
          }
        }

        if (tieneComentariosInvalidos) {
          console.log(`Producto ${producto.nombre} (ID: ${producto._id}) tiene comentarios con fechas inválidas, eliminándolos...`);

          // Actualizar directamente en la base de datos para eliminar comentarios con fechas string
          const resultado = await Producto.updateOne(
            { _id: producto._id },
            { $set: { comentarios: [] } }
          );

          console.log(`Resultado de la actualización:`, resultado);

          productosActualizados++;
          comentariosLimpiados += producto.comentarios.length;
          console.log(`Comentarios eliminados del producto ${producto.nombre}`);
        }
      }
    }

    console.log(`\nLimpieza completada:`);
    console.log(`- Productos actualizados: ${productosActualizados}`);
    console.log(`- Comentarios limpiados: ${comentariosLimpiados}`);

  } catch (error) {
    console.error('Error durante la limpieza:', error);
  }
};

// Ejecutar script
const ejecutar = async () => {
  await connectDB();
  await limpiarComentarios();
  await mongoose.disconnect();
  console.log('Script completado');
  process.exit(0);
};

ejecutar();
