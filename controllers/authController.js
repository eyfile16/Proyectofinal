const Usuario = require('../models/usuarioModel'); // Cambiado de '../models/Usuario' a '../models/usuarioModel'
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Función para generar un token JWT
const generarToken = (uid) => {
  return jwt.sign(
    { uid },
    process.env.JWT_SECRET || 'mi_clave_secreta_temporal',
    { expiresIn: '24h' }
  );
};

// Controlador para registrar un nuevo usuario
exports.registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    
    console.log('Datos de registro recibidos:', { nombre, email, rol });
    
    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }
    
    // Crear nuevo usuario
    const usuario = new Usuario({
      nombre,
      email,
      password,
      rol: rol || 'cliente' // Valor por defecto
    });
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    
    // Guardar usuario en la base de datos
    await usuario.save();
    
    // Respuesta exitosa
    res.status(201).json({
      msg: 'Usuario registrado correctamente',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        imagenPerfil: usuario.imagenPerfil,
        avatarPredeterminado: usuario.avatarPredeterminado
      }
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ 
      msg: 'Error en el servidor', 
      error: error.message,
      stack: error.stack
    });
  }
};

// Controlador para iniciar sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Intento de login con:', { email });
    
    // Validar que se proporcionen email y password
    if (!email || !password) {
      return res.status(400).json({ msg: 'Por favor, proporcione email y contraseña' });
    }
    
    // Buscar el usuario por email
    const usuario = await Usuario.findOne({ email });
    console.log('Usuario encontrado:', usuario ? 'Sí' : 'No');
    
    if (!usuario) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

    // Verificar la contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    console.log('Contraseña válida:', passwordValido ? 'Sí' : 'No');
    
    if (!passwordValido) {
      return res.status(400).json({ msg: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = generarToken(usuario._id);
    console.log('Token generado:', token ? 'Sí' : 'No');
    
    // Respuesta exitosa
    return res.status(200).json({
      token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        imagenPerfil: usuario.imagenPerfil,
        avatarPredeterminado: usuario.avatarPredeterminado
      },
      msg: 'Login exitoso'
    });
  } catch (error) {
    console.error('Error detallado en el login:', error);
    return res.status(500).json({ 
      msg: 'Error en el servidor', 
      error: error.toString(),
      stack: error.stack
    });
  }
};

// Controlador para obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password');
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      msg: 'Error al obtener usuarios', 
      error: error.message 
    });
  }
};
