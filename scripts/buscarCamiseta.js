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

// Buscar la camiseta de Barcelona
const buscarCamiseta = async () => {
  try {
    console.log('Buscando camiseta de Barcelona...');
    
    // Buscar por nombre que contenga "barcelona"
    const camisetas = await Producto.find({
      nombre: { $regex: /barcelona/i }
    });
    
    console.log(`Camisetas encontradas: ${camisetas.length}`);
    
    for (const camiseta of camisetas) {
      console.log(`\n--- Camiseta ---`);
      console.log(`ID: ${camiseta._id}`);
      console.log(`Nombre: ${camiseta.nombre}`);
      console.log(`Comentarios: ${camiseta.comentarios.length}`);
      
      if (camiseta.comentarios.length > 0) {
        console.log('Comentarios:');
        for (let i = 0; i < camiseta.comentarios.length; i++) {
          const comentario = camiseta.comentarios[i];
          console.log(`  ${i + 1}. ${comentario.texto} (${comentario.calificacion} estrellas)`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error al buscar camiseta:', error);
  }
};

// Ejecutar script
const ejecutar = async () => {
  await connectDB();
  await buscarCamiseta();
  await mongoose.disconnect();
  console.log('Búsqueda completada');
  process.exit(0);
};

ejecutar();
