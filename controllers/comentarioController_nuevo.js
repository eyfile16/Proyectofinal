const Producto = require('../models/Producto');

// Obtener comentarios de un producto
const obtenerComentarios = async (req, res) => {
  try {
    const { productoId } = req.params;

    console.log('Obteniendo comentarios para producto:', productoId);

    // Obtener el producto
    let producto = await Producto.findById(productoId);

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // Hacer populate para obtener datos de usuarios
    await producto.populate({
      path: 'comentarios.usuario',
      select: 'nombre email avatarPredeterminado imagenPerfil',
      model: 'Usuario'
    });

    // Filtrar y limpiar comentarios válidos
    const comentariosValidos = producto.comentarios.filter(comentario => {
      // Filtrar comentarios con fechas string inválidas
      if (comentario.fecha && typeof comentario.fecha === 'string') {
        return false;
      }
      // Asegurar que tenga texto y calificación
      return comentario.texto && comentario.calificacion;
    });

    // Asegurar que los comentarios tengan la estructura correcta
    const comentarios = comentariosValidos.map(comentario => {
      return {
        _id: comentario._id,
        texto: comentario.texto,
        calificacion: comentario.calificacion,
        fecha: comentario.fecha,
        fechaEdicion: comentario.fechaEdicion,
        likes: comentario.likes || [],
        dislikes: comentario.dislikes || [],
        usuario: comentario.usuario ? {
          _id: comentario.usuario._id,
          nombre: comentario.usuario.nombre,
          email: comentario.usuario.email,
          avatarPredeterminado: comentario.usuario.avatarPredeterminado,
          imagenPerfil: comentario.usuario.imagenPerfil
        } : {
          _id: null,
          nombre: 'Usuario anónimo',
          email: null,
          avatarPredeterminado: null,
          imagenPerfil: null
        }
      };
    });

    console.log('Comentarios encontrados:', comentarios.length);
    res.json(comentarios);

  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Toggle like en comentario - VERSIÓN SIMPLE
const toggleLike = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const usuarioId = req.usuario._id;

    console.log('🔥 Toggle like SIMPLE:', { comentarioId, usuarioId });

    // Buscar el producto que contiene el comentario
    const producto = await Producto.findOne({ 'comentarios._id': comentarioId });
    if (!producto) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }

    const comentario = producto.comentarios.id(comentarioId);
    if (!comentario) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }

    // Inicializar arrays si no existen
    if (!Array.isArray(comentario.likes)) {
      comentario.likes = [];
    }
    if (!Array.isArray(comentario.dislikes)) {
      comentario.dislikes = [];
    }

    // Verificar si el usuario ya dio like
    const yaLike = comentario.likes.some(id => id.toString() === usuarioId.toString());

    if (yaLike) {
      // Quitar like
      comentario.likes = comentario.likes.filter(id => id.toString() !== usuarioId.toString());
      console.log('✅ Like removido');
    } else {
      // Agregar like y quitar dislike si existe
      comentario.likes.push(usuarioId);
      comentario.dislikes = comentario.dislikes.filter(id => id.toString() !== usuarioId.toString());
      console.log('✅ Like agregado');
    }

    // Guardar el producto
    await producto.save();
    console.log('✅ Producto guardado');

    // Verificar el estado final
    const comentarioFinal = producto.comentarios.id(comentarioId);
    const userLiked = comentarioFinal.likes.some(id => id.toString() === usuarioId.toString());
    const userDisliked = comentarioFinal.dislikes.some(id => id.toString() === usuarioId.toString());

    const response = {
      mensaje: yaLike ? 'Like removido exitosamente' : 'Like agregado exitosamente',
      likes: comentarioFinal.likes.length,
      dislikes: comentarioFinal.dislikes.length,
      userLiked: userLiked,
      userDisliked: userDisliked
    };

    console.log('✅ Respuesta final:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ Error al hacer toggle like:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Toggle dislike en comentario - VERSIÓN SIMPLE
const toggleDislike = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const usuarioId = req.usuario._id;

    console.log('🔥 Toggle dislike SIMPLE:', { comentarioId, usuarioId });

    // Buscar el producto que contiene el comentario
    const producto = await Producto.findOne({ 'comentarios._id': comentarioId });
    if (!producto) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }

    const comentario = producto.comentarios.id(comentarioId);
    if (!comentario) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }

    // Inicializar arrays si no existen
    if (!Array.isArray(comentario.likes)) {
      comentario.likes = [];
    }
    if (!Array.isArray(comentario.dislikes)) {
      comentario.dislikes = [];
    }

    // Verificar si el usuario ya dio dislike
    const yaDislike = comentario.dislikes.some(id => id.toString() === usuarioId.toString());

    if (yaDislike) {
      // Quitar dislike
      comentario.dislikes = comentario.dislikes.filter(id => id.toString() !== usuarioId.toString());
      console.log('✅ Dislike removido');
    } else {
      // Agregar dislike y quitar like si existe
      comentario.dislikes.push(usuarioId);
      comentario.likes = comentario.likes.filter(id => id.toString() !== usuarioId.toString());
      console.log('✅ Dislike agregado');
    }

    // Guardar el producto
    await producto.save();
    console.log('✅ Producto guardado');

    // Verificar el estado final
    const comentarioFinal = producto.comentarios.id(comentarioId);
    const userLiked = comentarioFinal.likes.some(id => id.toString() === usuarioId.toString());
    const userDisliked = comentarioFinal.dislikes.some(id => id.toString() === usuarioId.toString());

    const response = {
      mensaje: yaDislike ? 'Dislike removido exitosamente' : 'Dislike agregado exitosamente',
      likes: comentarioFinal.likes.length,
      dislikes: comentarioFinal.dislikes.length,
      userLiked: userLiked,
      userDisliked: userDisliked
    };

    console.log('✅ Respuesta final:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ Error al hacer toggle dislike:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerComentarios,
  toggleLike,
  toggleDislike
};
