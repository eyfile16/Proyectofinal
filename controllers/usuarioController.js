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

// Obtener reseñas/comentarios de un usuario específico
const obtenerResenasUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Obteniendo reseñas para usuario ID:', id);

    // Primero buscar el usuario para obtener su nombre
    const Usuario = require('../models/usuarioModel');
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    console.log('Buscando comentarios para usuario:', usuario.nombre);

    // Buscar todos los productos que tengan comentarios de este usuario
    const mongoose = require('mongoose');
    const Producto = require('../models/Producto');

    // Buscar productos que contengan comentarios del usuario por nombre
    const productos = await Producto.find({
      'comentarios.usuario': { $regex: new RegExp(usuario.nombre, 'i') }
    }).select('nombre imagen comentarios precio categoria');

    console.log(`Productos encontrados con comentarios del usuario: ${productos.length}`);

    // Extraer solo los comentarios del usuario específico
    const resenasUsuario = [];

    productos.forEach(producto => {
      if (producto.comentarios && Array.isArray(producto.comentarios)) {
        const comentariosUsuario = producto.comentarios.filter(comentario => {
          // Buscar por nombre de usuario exacto o similar
          return comentario.usuario &&
                 comentario.usuario.toLowerCase().trim() === usuario.nombre.toLowerCase().trim();
        });

        comentariosUsuario.forEach(comentario => {
          resenasUsuario.push({
            _id: comentario._id,
            producto: {
              _id: producto._id,
              nombre: producto.nombre,
              imagen: producto.imagen,
              precio: producto.precio,
              categoria: producto.categoria
            },
            usuario: comentario.usuario,
            texto: comentario.texto,
            calificacion: comentario.calificacion,
            fecha: comentario.fecha
          });
        });
      }
    });

    console.log(`Reseñas del usuario encontradas: ${resenasUsuario.length}`);

    // Ordenar por fecha más reciente
    resenasUsuario.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    res.json({
      resenas: resenasUsuario,
      total: resenasUsuario.length
    });

  } catch (error) {
    console.error('Error al obtener reseñas del usuario:', error);
    res.status(500).json({
      mensaje: 'Error al obtener reseñas del usuario',
      error: error.message
    });
  }
};

module.exports = {
  obtenerTodos,
  actualizarPerfil,
  eliminarCuenta,
  obtenerResenasUsuario
};



