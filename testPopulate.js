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

// Probar populate
const testPopulate = async () => {
  try {
    const productoId = '681e0e4542794d616c890e91';
    
    console.log('🔍 Buscando producto sin populate...');
    const productoSinPopulate = await Producto.findById(productoId);
    
    if (productoSinPopulate) {
      console.log(`📦 Producto: ${productoSinPopulate.nombre}`);
      console.log(`📝 Comentarios: ${productoSinPopulate.comentarios.length}`);
      
      productoSinPopulate.comentarios.forEach((c, i) => {
        console.log(`   ${i + 1}. Usuario ID: ${c.usuario} (tipo: ${typeof c.usuario})`);
        console.log(`      Texto: ${c.texto.substring(0, 30)}...`);
      });
    }

    console.log('\n🔍 Buscando producto CON populate...');
    const productoConPopulate = await Producto.findById(productoId)
      .populate({
        path: 'comentarios.usuario',
        select: 'nombre email avatarPredeterminado imagenPerfil'
      });

    if (productoConPopulate) {
      console.log(`📦 Producto: ${productoConPopulate.nombre}`);
      console.log(`📝 Comentarios: ${productoConPopulate.comentarios.length}`);
      
      productoConPopulate.comentarios.forEach((c, i) => {
        console.log(`   ${i + 1}. Usuario: ${JSON.stringify(c.usuario, null, 2)}`);
        console.log(`      Texto: ${c.texto.substring(0, 30)}...`);
      });
    }

    console.log('\n🔍 Verificando usuarios directamente...');
    const usuarios = await Usuario.find({
      email: { $in: ['maria@test.com', 'juan@test.com', 'ana@test.com', 'carlos@test.com'] }
    });
    
    console.log(`👥 Usuarios encontrados: ${usuarios.length}`);
    usuarios.forEach(u => {
      console.log(`   - ${u.nombre} (${u.email}) - ID: ${u._id}`);
    });

  } catch (error) {
    console.error('❌ Error en test:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Ejecutar
const main = async () => {
  await connectDB();
  await testPopulate();
};

main();
