const mongoose = require('mongoose');
const Usuario = require('./models/usuarioModel');
const bcrypt = require('bcryptjs');

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

// Crear usuarios de prueba
const crearUsuarios = async () => {
  try {
    // Verificar si ya existen usuarios
    const usuariosExistentes = await Usuario.countDocuments();
    console.log(`📊 Usuarios existentes: ${usuariosExistentes}`);

    const usuariosPrueba = [
      {
        nombre: 'María García',
        email: 'maria@test.com',
        password: await bcrypt.hash('123456', 10),
        avatarPredeterminado: 'avatar2'
      },
      {
        nombre: 'Juan Pérez',
        email: 'juan@test.com',
        password: await bcrypt.hash('123456', 10),
        avatarPredeterminado: 'avatar3'
      },
      {
        nombre: 'Ana López',
        email: 'ana@test.com',
        password: await bcrypt.hash('123456', 10),
        avatarPredeterminado: 'avatar4'
      },
      {
        nombre: 'Carlos Ruiz',
        email: 'carlos@test.com',
        password: await bcrypt.hash('123456', 10),
        avatarPredeterminado: 'avatar5'
      }
    ];

    for (const userData of usuariosPrueba) {
      // Verificar si el usuario ya existe
      const usuarioExistente = await Usuario.findOne({ email: userData.email });
      
      if (!usuarioExistente) {
        const nuevoUsuario = new Usuario(userData);
        await nuevoUsuario.save();
        console.log(`✅ Usuario creado: ${userData.nombre} (${userData.email})`);
      } else {
        console.log(`⚠️ Usuario ya existe: ${userData.email}`);
      }
    }

    console.log('🎉 Proceso completado');
    
    // Mostrar todos los usuarios
    const todosLosUsuarios = await Usuario.find({}, 'nombre email avatarPredeterminado');
    console.log('\n📋 Usuarios en la base de datos:');
    todosLosUsuarios.forEach(user => {
      console.log(`- ${user.nombre} (${user.email}) - Avatar: ${user.avatarPredeterminado} - ID: ${user._id}`);
    });

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Ejecutar
const main = async () => {
  await connectDB();
  await crearUsuarios();
};

main();
