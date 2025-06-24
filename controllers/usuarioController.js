// Controlador de usuarios
const Usuario = require('../models/usuarioModel'); // Cambiado de '../models/Usuario' a '../models/usuarioModel'

// Obtener todos los usuarios
const obtenerTodos = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
};

// Actualizar perfil de usuario
const actualizarPerfil = async (req, res) => {
  try {
    const { _id, ...resto } = req.body;
    
    // Verificar que el usuario existe
    const usuario = await Usuario.findById(_id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    
    // Actualizar usuario
    const usuarioActualizado = await Usuario.findByIdAndUpdate(_id, resto, { new: true });
    
    res.json({
      mensaje: 'Usuario actualizado correctamente',
      usuario: usuarioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario' });
  }
};

// Eliminar cuenta de usuario
const eliminarCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el usuario existe
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    
    // Eliminar usuario
    await Usuario.findByIdAndDelete(id);
    
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar usuario' });
  }
};

module.exports = {
  obtenerTodos,
  actualizarPerfil,
  eliminarCuenta
};



