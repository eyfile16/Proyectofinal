const Producto = require('../models/Producto');
const Usuario = require('../models/usuarioModel');

// Obtener comentarios de un producto - CON MIGRACIÓN
const obtenerComentarios = async (req, res) => {
  try {
    const { productoId } = req.params;
    console.log('🔍 Obteniendo comentarios para producto:', productoId);

    const producto = await Producto.findById(productoId);

    // Obtener usuarios manualmente para asegurar que funcione
    const usuarioIds = producto.comentarios.map(c => c.usuario).filter(Boolean);
    const usuarios = await Usuario.find({ _id: { $in: usuarioIds } });
    const usuariosMap = {};
    usuarios.forEach(u => {
      usuariosMap[u._id.toString()] = u;
    });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // NOTA: Migración eliminada - los campos likes/dislikes deben existir en el esquema

    // MIGRACIÓN AUTOMÁTICA: Agregar likesSimples a comentarios que no lo tienen
    let needsSave = false;
    producto.comentarios.forEach(c => {
      if (c.likesSimples === undefined) { // Solo si realmente no existe
        c.likesSimples = [];
        needsSave = true;
      }
    });

    if (needsSave) {
      producto.markModified('comentarios');
      await producto.save();
      console.log('🔄 MIGRACIÓN: Campo likesSimples agregado a comentarios');
    }

    const comentarios = producto.comentarios
      .filter(c => c.usuario && c.texto && c.calificacion)
      .map(c => {
        // Asegurar que likes y dislikes existen
        if (!c.likes) c.likes = [];
        if (!c.dislikes) c.dislikes = [];
        if (!c.likesSimples) c.likesSimples = []; // ASEGURAR CAMPO

        const likesCount = c.likes.length;
        const dislikesCount = c.dislikes.length;
        const likesSimpleCount = c.likesSimples.length;
        const usuario = usuariosMap[c.usuario.toString()];

        console.log(`❤️ ${c._id}: likesSimples=${likesSimpleCount} likes`);
        console.log(`👤 Usuario: ${usuario ? usuario.nombre : 'Usuario no encontrado'}`);
        console.log(`🔍 Datos: likesSimples=${JSON.stringify(c.likesSimples)}`);

        return {
          _id: c._id,
          texto: c.texto,
          calificacion: c.calificacion,
          fecha: c.fecha,
          fechaEdicion: c.fechaEdicion,
          likes: c.likes,
          dislikes: c.dislikes,
          likesSimples: c.likesSimples || [], // NUEVO CAMPO
          usuario: usuario ? {
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            avatarPredeterminado: usuario.avatarPredeterminado,
            imagenPerfil: usuario.imagenPerfil
          } : {
            _id: c.usuario,
            nombre: 'Usuario no encontrado',
            email: '',
            avatarPredeterminado: 'avatar1',
            imagenPerfil: null
          }
        };
      });

    console.log('✅ Comentarios encontrados:', comentarios.length);
    res.json({ comentarios });

  } catch (error) {
    console.error('❌ Error al obtener comentarios:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
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

// Toggle like - VERSIÓN SIMPLE QUE FUNCIONA
const toggleLike = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const usuarioId = req.usuario._id;

    console.log('🚀 LIKE SIMPLE:', { comentarioId, usuarioId: usuarioId.toString() });

    // Buscar el producto
    const producto = await Producto.findOne({ 'comentarios._id': comentarioId });
    if (!producto) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }

    const comentario = producto.comentarios.id(comentarioId);
    if (!comentario) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }

    // Inicializar arrays si no existen
    if (!comentario.likes) comentario.likes = [];
    if (!comentario.dislikes) comentario.dislikes = [];

    // Toggle like
    const yaLike = comentario.likes.some(id => id.toString() === usuarioId.toString());

    if (yaLike) {
      // Quitar like
      comentario.likes = comentario.likes.filter(id => id.toString() !== usuarioId.toString());
      console.log('✅ Like removido');
    } else {
      // Agregar like y quitar dislike
      comentario.likes.push(usuarioId);
      comentario.dislikes = comentario.dislikes.filter(id => id.toString() !== usuarioId.toString());
      console.log('✅ Like agregado');
    }

    // Guardar con markModified para forzar el guardado
    producto.markModified('comentarios');
    await producto.save();
    console.log('✅ Producto guardado con markModified');

    // Verificar que se guardó correctamente
    const verificacion = await Producto.findOne({ 'comentarios._id': comentarioId });
    const comentarioVerif = verificacion.comentarios.id(comentarioId);
    console.log(`🔍 VERIFICACIÓN: likes guardados=${comentarioVerif.likes ? comentarioVerif.likes.length : 0}`);

    const userLiked = comentario.likes.some(id => id.toString() === usuarioId.toString());
    const userDisliked = comentario.dislikes.some(id => id.toString() === usuarioId.toString());

    const response = {
      mensaje: yaLike ? 'Like removido' : 'Like agregado',
      likes: comentario.likes.length,
      dislikes: comentario.dislikes.length,
      userLiked,
      userDisliked
    };

    console.log('✅ RESPUESTA SIMPLE:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Toggle dislike en comentario - VERSIÓN SIMPLE QUE FUNCIONA
const toggleDislike = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const usuarioId = req.usuario._id;

    console.log('🔥 TOGGLE DISLIKE SIMPLE:', { comentarioId, usuarioId: usuarioId.toString() });

    // Buscar el producto que contiene el comentario
    const producto = await Producto.findOne({ 'comentarios._id': comentarioId });
    if (!producto) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }

    const comentario = producto.comentarios.id(comentarioId);
    if (!comentario) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }

    // Asegurar que los arrays existen
    if (!comentario.likes) comentario.likes = [];
    if (!comentario.dislikes) comentario.dislikes = [];

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

    const userLiked = comentario.likes.some(id => id.toString() === usuarioId.toString());
    const userDisliked = comentario.dislikes.some(id => id.toString() === usuarioId.toString());

    const response = {
      mensaje: yaDislike ? 'Dislike removido exitosamente' : 'Dislike agregado exitosamente',
      likes: comentario.likes.length,
      dislikes: comentario.dislikes.length,
      userLiked,
      userDisliked
    };

    console.log('✅ RESPUESTA SIMPLE:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ Error al procesar dislike:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// NUEVO SISTEMA DE LIKES SIMPLE Y FUNCIONAL
const darLike = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const usuarioId = req.usuario._id;

    console.log('👍 DAR LIKE:', { comentarioId, usuarioId: usuarioId.toString() });

    // Buscar producto y comentario
    const producto = await Producto.findOne({ 'comentarios._id': comentarioId });
    if (!producto) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }

    const comentario = producto.comentarios.id(comentarioId);
    if (!comentario.likesSimples) comentario.likesSimples = [];

    // Verificar si ya dio like
    const yaLike = comentario.likesSimples.includes(usuarioId.toString());

    if (yaLike) {
      // Quitar like
      comentario.likesSimples = comentario.likesSimples.filter(id => id !== usuarioId.toString());
      console.log('❌ Like removido');
    } else {
      // Agregar like
      comentario.likesSimples.push(usuarioId.toString());
      console.log('✅ Like agregado');
    }

    // Guardar
    producto.markModified('comentarios');
    await producto.save();

    const response = {
      mensaje: yaLike ? 'Like removido' : 'Like agregado',
      likes: comentario.likesSimples.length,
      userLiked: !yaLike
    };

    console.log('✅ RESPUESTA LIKE:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ Error en like:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerComentarios,
  crearComentario,
  editarComentario,
  eliminarComentario,
  toggleLike,
  toggleDislike,
  darLike
};
