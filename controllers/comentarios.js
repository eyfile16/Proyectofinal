const Comentario = require('../models/Comentario');
const Producto = require('../models/Producto');

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
    
    const { productoId, calificacion, texto, usuario, fecha, imagenes } = req.body;
    
    if (!productoId) {
      return res.status(400).json({ mensaje: 'El ID del producto es requerido' });
    }
    
    // Crear el comentario
    const nuevoComentario = new Comentario({
      productoId,
      calificacion,
      texto,
      usuario,
      fecha: fecha ? new Date(fecha) : new Date(),
      imagenes: imagenes || []
    });
    
    // Guardar el comentario
    const comentarioGuardado = await nuevoComentario.save();
    console.log('Comentario guardado:', comentarioGuardado);
    
    // Actualizar la calificación promedio del producto
    const producto = await Producto.findById(productoId);
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
      await producto.save();
      console.log('Producto actualizado con nuevo comentario');
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
    res.status(500).json({ mensaje: 'Error al crear comentario', error: error.message });
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

