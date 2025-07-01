// Controlador de usuarios
const Usuario = require('../models/usuarioModel'); // Cambiado de '../models/Usuario' a '../models/usuarioModel'
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/avatars');
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: function (req, file, cb) {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

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

// Obtener un usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    res.status(500).json({ mensaje: 'Error al obtener usuario' });
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

// Actualizar avatar del usuario
const actualizarAvatar = async (req, res) => {
  try {
    const { avatarPredeterminado } = req.body;
    const usuarioId = req.usuario._id; // Viene del middleware de autenticación

    console.log('Actualizando avatar para usuario:', usuarioId);
    console.log('Nuevo avatar:', avatarPredeterminado);

    // Validar que el avatar es válido
    const avatarsValidos = ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5'];
    if (!avatarsValidos.includes(avatarPredeterminado)) {
      return res.status(400).json({ mensaje: 'Avatar no válido' });
    }

    // Actualizar el avatar del usuario
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuarioId,
      { avatarPredeterminado },
      { new: true }
    ).select('-password'); // Excluir la contraseña de la respuesta

    if (!usuarioActualizado) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    console.log('Avatar actualizado exitosamente');

    res.json({
      mensaje: 'Avatar actualizado correctamente',
      usuario: usuarioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar avatar:', error);
    res.status(500).json({ mensaje: 'Error al actualizar avatar' });
  }
};

// Subir imagen de perfil (SIMPLE - BASE64)
const subirImagenPerfil = async (req, res) => {
  // Usar multer para memoria
  const uploadMemory = multer({ storage: multer.memoryStorage() });

  uploadMemory.single('imagen')(req, res, async function (err) {
    if (err) {
      console.error('Error en multer:', err);
      return res.status(400).json({ mensaje: err.message });
    }

    try {
      const usuarioId = req.usuario._id;

      if (!req.file) {
        return res.status(400).json({ mensaje: 'No se recibió ningún archivo' });
      }

      console.log('Guardando imagen como base64 para usuario:', usuarioId);

      // Convertir a base64 y guardar directamente
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      console.log('Imagen convertida a base64, tamaño:', base64Image.length);

      // Actualizar usuario con la imagen base64
      const usuarioActualizado = await Usuario.findByIdAndUpdate(
        usuarioId,
        {
          imagenPerfil: base64Image,
          avatarPredeterminado: null // Limpiar avatar predeterminado
        },
        { new: true }
      ).select('-password');

      if (!usuarioActualizado) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }

      console.log('Imagen guardada exitosamente como base64');

      res.json({
        mensaje: 'Imagen de perfil actualizada correctamente',
        usuario: usuarioActualizado
      });

    } catch (error) {
      console.error('Error al subir imagen:', error);
      res.status(500).json({ mensaje: 'Error al subir imagen: ' + error.message });
    }
  });
};

// Eliminar imagen de perfil
const eliminarImagenPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario._id;

    console.log('Eliminando imagen para usuario:', usuarioId);

    // Obtener usuario actual
    const usuarioActual = await Usuario.findById(usuarioId);

    if (!usuarioActual) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Eliminar archivo físico si existe
    if (usuarioActual.imagenPerfil) {
      const imagenPath = path.join(__dirname, '../', usuarioActual.imagenPerfil);
      if (fs.existsSync(imagenPath)) {
        fs.unlinkSync(imagenPath);
        console.log('Archivo de imagen eliminado:', imagenPath);
      }
    }

    // Actualizar usuario removiendo la imagen
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuarioId,
      {
        imagenPerfil: null,
        avatarPredeterminado: 'avatar1' // Volver al avatar por defecto
      },
      { new: true }
    ).select('-password');

    console.log('Imagen eliminada exitosamente');

    res.json({
      mensaje: 'Imagen de perfil eliminada correctamente',
      usuario: usuarioActualizado
    });

  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ mensaje: 'Error al eliminar imagen' });
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

// Limpiar imagen de perfil rota
const limpiarImagenPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario._id;
    console.log('Limpiando imagen de perfil rota para usuario:', usuarioId);

    // Actualizar usuario removiendo la imagen de perfil
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuarioId,
      {
        $unset: { imagenPerfil: 1 },
        $set: { avatarPredeterminado: 'avatar1' }
      },
      { new: true }
    ).select('-password');

    if (!usuarioActualizado) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    console.log('Imagen de perfil limpiada exitosamente');

    res.json({
      mensaje: 'Imagen de perfil limpiada correctamente',
      usuario: usuarioActualizado
    });
  } catch (error) {
    console.error('Error al limpiar imagen de perfil:', error);
    res.status(500).json({ mensaje: 'Error al limpiar imagen de perfil' });
  }
};

module.exports = {
  obtenerTodos,
  obtenerUsuarioPorId,
  actualizarPerfil,
  actualizarAvatar,
  subirImagenPerfil,
  eliminarImagenPerfil,
  limpiarImagenPerfil,
  eliminarCuenta,
  obtenerResenasUsuario
};



