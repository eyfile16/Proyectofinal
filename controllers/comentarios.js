const Comentario = require('../models/Comentario');
const Producto = require('../models/Producto');
const mongoose = require('mongoose');

// Obtener todos los comentarios de un producto
exports.getComentariosByProducto = async (req, res) => {
  try {
    console.log('Obteniendo comentarios para el producto:', req.params.productoId);
    const comentarios = await Comentario.find({ productoId: req.params.productoId });
    console.log('Comentarios encontrados:', comentarios.length);
    res.json(comentarios);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ mensaje: 'Error al obtener comentarios' });
  }
};

// Crear un nuevo comentario
exports.crearComentario = async (req, res) => {
  try {
    console.log('Creando comentario:', req.body);
    console.log('Tipo de productoId:', typeof req.body.productoId);
    
    const { productoId, calificacion, texto, usuario, fecha, imagenes } = req.body;
    
    if (!productoId || !mongoose.Types.ObjectId.isValid(productoId)) {
      return res.status(400).json({ mensaje: 'El ID del producto es requerido y debe ser válido' });
    }

    if (!calificacion || isNaN(calificacion) || calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ mensaje: 'La calificación debe ser un número entre 1 y 5' });
    }

    if (!usuario || typeof usuario !== 'string' || usuario.trim().length === 0) {
      return res.status(400).json({ mensaje: 'El usuario es requerido' });
    }

    if (!texto || typeof texto !== 'string' || texto.trim().length === 0) {
      return res.status(400).json({ mensaje: 'El texto del comentario es requerido' });
    }

    if (imagenes && (!Array.isArray(imagenes) || !imagenes.every(img => typeof img === 'string'))) {
      return res.status(400).json({ mensaje: 'El campo imagenes debe ser un array de strings' });
    }
    
    // Crear el comentario
    console.log('Datos validados para nuevo comentario:', {
      productoId,
      calificacion,
      texto,
      usuario,
      fecha: fecha ? new Date(fecha) : new Date(),
      imagenes: imagenes || []
    });

    const nuevoComentario = new Comentario({
      productoId,
      calificacion,
      texto,
      usuario,
      fecha: fecha ? new Date(fecha) : new Date(),
      imagenes: imagenes || []
    });

    console.log('Modelo de comentario creado:', nuevoComentario);
    
    // Guardar el comentario
    let comentarioGuardado;
    try {
      comentarioGuardado = await nuevoComentario.save();
      console.log('Comentario guardado:', comentarioGuardado);
    } catch (saveError) {
      console.error('Error al guardar el comentario:', saveError);
      return res.status(500).json({ mensaje: 'Error al guardar el comentario', error: saveError.message });
    }
    
    // Actualizar la calificación promedio del producto
    console.log('Buscando producto con ID:', productoId);
    let producto;
    try {
      producto = await Producto.findById(productoId);
      console.log('Producto encontrado:', producto ? 'Sí' : 'No');
    } catch (findError) {
      console.error('Error al buscar el producto:', findError);
      return res.status(500).json({ mensaje: 'Error al buscar el producto', error: findError.message });
    }
    if (producto) {
      // Si el producto no tiene comentarios, inicializar el array
      if (!producto.comentarios) {
        producto.comentarios = [];
      }
      
      // Añadir el comentario al producto
      producto.comentarios.push({
        usuario,
        texto,
        calificacion,
        fecha: comentarioGuardado.fecha
      });
      
      // Calcular la nueva calificación promedio
      const totalCalificaciones = producto.comentarios.reduce((sum, c) => sum + c.calificacion, 0);
      producto.calificacion = totalCalificaciones / producto.comentarios.length;
      producto.cantidadCalificaciones = producto.comentarios.length;
      
      // Guardar el producto actualizado
      try {
        await producto.save();
        console.log('Producto actualizado con nuevo comentario');
      } catch (updateError) {
        console.error('Error al actualizar el producto:', updateError);
        return res.status(500).json({ mensaje: 'Error al actualizar el producto', error: updateError.message });
      }
    } else {
      console.log('Producto no encontrado:', productoId);
    }
    
    res.status(201).json({ 
      mensaje: 'Comentario creado con éxito', 
      comentario: comentarioGuardado,
      calificacionPromedio: producto ? producto.calificacion : null,
      cantidadCalificaciones: producto ? producto.cantidadCalificaciones : null
    });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      mensaje: 'Error al crear comentario',
      error: error.message,
      stack: error.stack,
      details: {
        productoId: req.body.productoId,
        calificacion: req.body.calificacion,
        usuario: req.body.usuario
      }
    });
  }
};

// Eliminar un comentario
exports.eliminarComentario = async (req, res) => {
  try {
    const comentario = await Comentario.findByIdAndDelete(req.params.id);
    
    if (!comentario) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }
    
    // Actualizar el producto
    const producto = await Producto.findById(comentario.productoId);
    if (producto && producto.comentarios) {
      // Filtrar el comentario eliminado
      producto.comentarios = producto.comentarios.filter(
        c => c._id.toString() !== comentario._id.toString()
      );
      
      // Recalcular la calificación promedio
      if (producto.comentarios.length > 0) {
        const totalCalificaciones = producto.comentarios.reduce((sum, c) => sum + c.calificacion, 0);
        producto.calificacion = totalCalificaciones / producto.comentarios.length;
      } else {
        producto.calificacion = 0;
      }
      
      producto.cantidadCalificaciones = producto.comentarios.length;
      await producto.save();
    }
    
    res.json({ mensaje: 'Comentario eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar comentario' });
  }
};

