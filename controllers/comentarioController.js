const Producto = require('../models/Producto');
const Usuario = require('../models/usuarioModel');

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
      console.log('Procesando comentario:', {
        id: comentario._id,
        usuario: comentario.usuario,
        texto: comentario.texto,
        fecha: comentario.fecha,
        likes: comentario.likes,
        dislikes: comentario.dislikes
      });

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

    console.log(`Comentarios encontrados: ${comentarios.length}`);

    res.json({ comentarios });
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ mensaje: 'Error al obtener comentarios' });
  }
};

// Crear nuevo comentario
const crearComentario = async (req, res) => {
  try {
    const { productoId, texto, calificacion } = req.body;
    const usuarioId = req.usuario._id;

    console.log('Creando comentario:', { productoId, texto, calificacion, usuarioId });

    // Validar datos
    if (!productoId || !texto || !calificacion) {
      return res.status(400).json({ mensaje: 'Faltan datos requeridos' });
    }

    if (calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ mensaje: 'La calificación debe estar entre 1 y 5' });
    }

    // Buscar el producto
    let producto = await Producto.findById(productoId);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // Limpiar comentarios existentes si tienen fechas inválidas
    if (producto.comentarios && producto.comentarios.length > 0) {
      producto.comentarios = producto.comentarios.filter(comentario => {
        if (comentario.fecha && typeof comentario.fecha === 'string') {
          return false; // Eliminar comentarios con fechas string
        }
        return true;
      });
    }

    // Crear el comentario
    const nuevoComentario = {
      usuario: usuarioId,
      texto: texto.trim(),
      calificacion: parseInt(calificacion),
      fecha: new Date(),
      likes: [],
      dislikes: []
    };

    // Agregar el comentario al producto
    producto.comentarios.push(nuevoComentario);

    // Guardar el producto
    await producto.save();

    // Obtener el comentario recién creado con datos del usuario
    const productoActualizado = await Producto.findById(productoId)
      .populate('comentarios.usuario', 'nombre email avatarPredeterminado imagenPerfil');

    const comentarioCreado = productoActualizado.comentarios[productoActualizado.comentarios.length - 1];

    console.log('Comentario creado exitosamente');

    res.status(201).json({
      mensaje: 'Comentario creado exitosamente',
      comentario: {
        _id: comentarioCreado._id,
        texto: comentarioCreado.texto,
        calificacion: comentarioCreado.calificacion,
        fecha: comentarioCreado.fecha,
        likes: comentarioCreado.likes || [],
        dislikes: comentarioCreado.dislikes || [],
        usuario: {
          _id: comentarioCreado.usuario._id,
          nombre: comentarioCreado.usuario.nombre,
          email: comentarioCreado.usuario.email,
          avatarPredeterminado: comentarioCreado.usuario.avatarPredeterminado,
          imagenPerfil: comentarioCreado.usuario.imagenPerfil
        }
      }
    });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ mensaje: 'Error al crear comentario', error: error.message });
  }
};

// Editar comentario
const editarComentario = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const { texto, calificacion } = req.body;
    const usuarioId = req.usuario._id;
    
    console.log('Editando comentario:', { comentarioId, texto, calificacion, usuarioId });
    
    // Validar datos
    if (!texto || !calificacion) {
      return res.status(400).json({ mensaje: 'Faltan datos requeridos' });
    }
    
    if (calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ mensaje: 'La calificación debe estar entre 1 y 5' });
    }
    
    // Buscar el producto que contiene el comentario
    let producto = await Producto.findOne({ 'comentarios._id': comentarioId });
    if (!producto) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }
    
    // Encontrar el comentario específico
    const comentario = producto.comentarios.id(comentarioId);
    if (!comentario) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }
    
    // Verificar que el usuario sea el propietario del comentario
    if (comentario.usuario.toString() !== usuarioId.toString()) {
      return res.status(403).json({ mensaje: 'No tienes permiso para editar este comentario' });
    }
    
    // Actualizar el comentario
    comentario.texto = texto.trim();
    comentario.calificacion = parseInt(calificacion);
    comentario.fechaEdicion = new Date();
    
    await producto.save();
    
    // Obtener el comentario actualizado con datos del usuario
    const productoActualizado = await Producto.findById(producto._id)
      .populate('comentarios.usuario', 'nombre email avatarPredeterminado imagenPerfil');
    
    const comentarioActualizado = productoActualizado.comentarios.id(comentarioId);
    
    console.log('Comentario editado exitosamente');
    
    res.json({
      mensaje: 'Comentario editado exitosamente',
      comentario: {
        _id: comentarioActualizado._id,
        texto: comentarioActualizado.texto,
        calificacion: comentarioActualizado.calificacion,
        fecha: comentarioActualizado.fecha,
        fechaEdicion: comentarioActualizado.fechaEdicion,
        likes: comentarioActualizado.likes || [],
        dislikes: comentarioActualizado.dislikes || [],
        usuario: {
          _id: comentarioActualizado.usuario._id,
          nombre: comentarioActualizado.usuario.nombre,
          email: comentarioActualizado.usuario.email,
          avatarPredeterminado: comentarioActualizado.usuario.avatarPredeterminado,
          imagenPerfil: comentarioActualizado.usuario.imagenPerfil
        }
      }
    });
  } catch (error) {
    console.error('Error al editar comentario:', error);
    res.status(500).json({ mensaje: 'Error al editar comentario' });
  }
};

// Eliminar comentario
const eliminarComentario = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const usuarioId = req.usuario._id;
    
    console.log('Eliminando comentario:', { comentarioId, usuarioId });
    
    // Buscar el producto que contiene el comentario
    let producto = await Producto.findOne({ 'comentarios._id': comentarioId });
    if (!producto) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }
    
    // Encontrar el comentario específico
    const comentario = producto.comentarios.id(comentarioId);
    if (!comentario) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }
    
    // Verificar que el usuario sea el propietario del comentario
    if (comentario.usuario.toString() !== usuarioId.toString()) {
      return res.status(403).json({ mensaje: 'No tienes permiso para eliminar este comentario' });
    }
    
    // Eliminar el comentario
    producto.comentarios.pull(comentarioId);
    await producto.save();
    
    console.log('Comentario eliminado exitosamente');
    
    res.json({ mensaje: 'Comentario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar comentario' });
  }
};

// Toggle like en comentario
const toggleLike = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const usuarioId = req.usuario._id;

    console.log('Toggle like en comentario:', { comentarioId, usuarioId });

    // Primero verificar si el comentario existe
    let producto = await Producto.findOne({ 'comentarios._id': comentarioId });
    if (!producto) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }

    const comentario = producto.comentarios.id(comentarioId);
    if (!comentario) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }



    // Verificar si el usuario ya dio like (inicializar si no existe)
    const likes = comentario.likes || [];
    const yaLike = likes.some(id => id.toString() === usuarioId.toString());

    let updateResult;
    let accion;

    if (yaLike) {
      // Quitar like usando operación atómica
      updateResult = await Producto.updateOne(
        { 'comentarios._id': comentarioId },
        {
          $pull: { 'comentarios.$.likes': usuarioId }
        }
      );
      accion = 'removed';
      console.log('Like removido - usuario tenía like');
    } else {
      // Agregar like y quitar dislike usando operación atómica
      updateResult = await Producto.updateOne(
        { 'comentarios._id': comentarioId },
        {
          $addToSet: { 'comentarios.$.likes': usuarioId },
          $pull: { 'comentarios.$.dislikes': usuarioId }
        }
      );
      accion = 'added';
      console.log('Like agregado - usuario no tenía like');
    }

    console.log('Resultado de actualización:', updateResult);

    // Obtener el comentario actualizado para devolver los conteos correctos
    const productoActualizado = await Producto.findOne({ 'comentarios._id': comentarioId });
    let comentarioActualizado = productoActualizado.comentarios.id(comentarioId);

    // Asegurar que los arrays existen y tienen valores por defecto
    if (!comentarioActualizado.likes || comentarioActualizado.likes === undefined) {
      comentarioActualizado.likes = [];
    }
    if (!comentarioActualizado.dislikes || comentarioActualizado.dislikes === undefined) {
      comentarioActualizado.dislikes = [];
    }

    console.log('Comentario actualizado:', {
      id: comentarioActualizado._id,
      likes: comentarioActualizado.likes,
      dislikes: comentarioActualizado.dislikes,
      likesLength: comentarioActualizado.likes ? comentarioActualizado.likes.length : 0,
      dislikesLength: comentarioActualizado.dislikes ? comentarioActualizado.dislikes.length : 0
    });

    const userLiked = comentarioActualizado.likes && comentarioActualizado.likes.some(id => id.toString() === usuarioId.toString());
    const userDisliked = comentarioActualizado.dislikes && comentarioActualizado.dislikes.some(id => id.toString() === usuarioId.toString());

    const response = {
      mensaje: `Like ${accion === 'added' ? 'agregado' : 'removido'} exitosamente`,
      likes: comentarioActualizado.likes ? comentarioActualizado.likes.length : 0,
      dislikes: comentarioActualizado.dislikes ? comentarioActualizado.dislikes.length : 0,
      userLiked: userLiked || false,
      userDisliked: userDisliked || false
    };

    console.log('Respuesta enviada:', response);
    res.json(response);
  } catch (error) {
    console.error('Error al toggle like:', error);
    res.status(500).json({ mensaje: 'Error al procesar like' });
  }
};

// Toggle dislike en comentario
const toggleDislike = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const usuarioId = req.usuario._id;

    console.log('Toggle dislike en comentario:', { comentarioId, usuarioId });

    // Primero verificar si el comentario existe
    let producto = await Producto.findOne({ 'comentarios._id': comentarioId });
    if (!producto) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }

    const comentario = producto.comentarios.id(comentarioId);
    if (!comentario) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }



    // Verificar si el usuario ya dio dislike (inicializar si no existe)
    const dislikes = comentario.dislikes || [];
    const yaDislike = dislikes.some(id => id.toString() === usuarioId.toString());

    let updateResult;
    let accion;

    if (yaDislike) {
      // Quitar dislike usando operación atómica
      updateResult = await Producto.updateOne(
        { 'comentarios._id': comentarioId },
        {
          $pull: { 'comentarios.$.dislikes': usuarioId }
        }
      );
      accion = 'removed';
      console.log('Dislike removido');
    } else {
      // Agregar dislike y quitar like usando operación atómica
      updateResult = await Producto.updateOne(
        { 'comentarios._id': comentarioId },
        {
          $addToSet: { 'comentarios.$.dislikes': usuarioId },
          $pull: { 'comentarios.$.likes': usuarioId }
        }
      );
      accion = 'added';
      console.log('Dislike agregado');
    }

    console.log('Resultado de actualización:', updateResult);

    // Obtener el comentario actualizado para devolver los conteos correctos
    const productoActualizado = await Producto.findOne({ 'comentarios._id': comentarioId });
    let comentarioActualizado = productoActualizado.comentarios.id(comentarioId);

    // Asegurar que los arrays existen y tienen valores por defecto
    if (!comentarioActualizado.likes || comentarioActualizado.likes === undefined) {
      comentarioActualizado.likes = [];
    }
    if (!comentarioActualizado.dislikes || comentarioActualizado.dislikes === undefined) {
      comentarioActualizado.dislikes = [];
    }

    console.log('Comentario actualizado:', {
      id: comentarioActualizado._id,
      likes: comentarioActualizado.likes,
      dislikes: comentarioActualizado.dislikes,
      likesLength: comentarioActualizado.likes ? comentarioActualizado.likes.length : 0,
      dislikesLength: comentarioActualizado.dislikes ? comentarioActualizado.dislikes.length : 0
    });

    const userLiked = comentarioActualizado.likes && comentarioActualizado.likes.some(id => id.toString() === usuarioId.toString());
    const userDisliked = comentarioActualizado.dislikes && comentarioActualizado.dislikes.some(id => id.toString() === usuarioId.toString());

    const response = {
      mensaje: `Dislike ${accion === 'added' ? 'agregado' : 'removido'} exitosamente`,
      likes: comentarioActualizado.likes ? comentarioActualizado.likes.length : 0,
      dislikes: comentarioActualizado.dislikes ? comentarioActualizado.dislikes.length : 0,
      userLiked: userLiked || false,
      userDisliked: userDisliked || false
    };

    console.log('Respuesta enviada:', response);
    res.json(response);
  } catch (error) {
    console.error('Error al toggle dislike:', error);
    res.status(500).json({ mensaje: 'Error al procesar dislike' });
  }
};

module.exports = {
  obtenerComentarios,
  crearComentario,
  editarComentario,
  eliminarComentario,
  toggleLike,
  toggleDislike
};
