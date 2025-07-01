const Producto = require('../models/Producto');
const Usuario = require('../models/usuarioModel');

// Obtener comentarios de un producto - VERSIÓN CON POPULATE MANUAL
const obtenerComentarios = async (req, res) => {
  try {
    const { productoId } = req.params;
    console.log('🔍 Obteniendo comentarios para producto:', productoId);

    // Buscar producto sin populate primero
    const producto = await Producto.findById(productoId);

    if (!producto) {
      console.log('❌ Producto no encontrado');
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    console.log(`✅ Producto encontrado con ${producto.comentarios?.length || 0} comentarios`);

    // Obtener IDs únicos de usuarios
    const usuarioIds = [...new Set(producto.comentarios.map(c => c.usuario.toString()))];
    console.log('👥 IDs de usuarios únicos:', usuarioIds);

    // Buscar usuarios manualmente
    const usuarios = await Usuario.find({ _id: { $in: usuarioIds } });
    console.log(`👥 Usuarios encontrados: ${usuarios.length}`);

    // Crear mapa de usuarios para acceso rápido
    const usuarioMap = {};
    usuarios.forEach(u => {
      usuarioMap[u._id.toString()] = {
        _id: u._id,
        nombre: u.nombre,
        email: u.email,
        avatarPredeterminado: u.avatarPredeterminado,
        imagenPerfil: u.imagenPerfil
      };
    });

    // NO INICIALIZAR AUTOMÁTICAMENTE - Los likes/dislikes se manejan en las operaciones atómicas

    // Procesar comentarios con usuarios poblados manualmente
    const comentarios = (producto.comentarios || [])
      .filter(c => c.texto && c.calificacion)
      .map(c => {
        const usuarioId = c.usuario.toString();
        const usuarioData = usuarioMap[usuarioId];

        console.log(`📝 Comentario: ${c.texto.substring(0, 20)}... - Usuario ID: ${usuarioId} - Encontrado: ${!!usuarioData}`);

        const comentarioData = {
          _id: c._id,
          texto: c.texto,
          calificacion: c.calificacion,
          fecha: c.fecha,
          fechaEdicion: c.fechaEdicion,
          likes: c.likes || [],
          dislikes: c.dislikes || [],
          usuario: usuarioData || {
            _id: 'usuario-anonimo',
            nombre: 'Usuario anónimo',
            email: '',
            avatarPredeterminado: 'avatar1',
            imagenPerfil: null
          }
        };

        console.log(`💖 Comentario ${c._id}: likes=${comentarioData.likes.length}, dislikes=${comentarioData.dislikes.length}`);
        return comentarioData;
      });

    console.log(`✅ Enviando ${comentarios.length} comentarios procesados`);
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

// Agregar like - SOLO AGREGAR, NO QUITAR AUTOMÁTICAMENTE
const toggleLike = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const usuarioId = req.usuario._id;

    console.log('❤️ Agregando like:', { comentarioId, usuarioId: usuarioId.toString() });

    // Buscar el producto
    const producto = await Producto.findOne({ 'comentarios._id': comentarioId });
    if (!producto) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }

    const comentario = producto.comentarios.id(comentarioId);
    if (!comentario) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }

    // Asegurar que el array existe
    if (!comentario.likes) comentario.likes = [];

    // Verificar si ya le dio like
    const yaLeDioLike = comentario.likes.some(id => id.toString() === usuarioId.toString());

    if (yaLeDioLike) {
      // Ya le dio like, no hacer nada
      return res.json({
        mensaje: 'Ya le diste like a este comentario',
        likes: comentario.likes.length,
        userLiked: true
      });
    } else {
      // AGREGAR like
      comentario.likes.push(usuarioId);
      await producto.save();
      console.log('✅ Like agregado y guardado');

      return res.json({
        mensaje: 'Like agregado',
        likes: comentario.likes.length,
        userLiked: true
      });
    }

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



// Obtener comentarios de un producto específico
const obtenerComentariosProducto = async (req, res) => {
  try {
    const { productoId } = req.params;

    console.log('📋 Obteniendo comentarios para producto:', productoId);

    const producto = await Producto.findById(productoId).populate('comentarios.usuario', 'nombre email imagenPerfil avatar');

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    console.log('✅ Comentarios encontrados:', producto.comentarios.length);
    res.json(producto.comentarios);

  } catch (error) {
    console.error('❌ Error obteniendo comentarios:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Quitar like - SOLO PARA CUANDO EL USUARIO QUIERA QUITARLO
const quitarLike = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const usuarioId = req.usuario._id;

    console.log('🗑️ Quitando like:', { comentarioId, usuarioId: usuarioId.toString() });

    // Buscar el producto
    const producto = await Producto.findOne({ 'comentarios._id': comentarioId });
    if (!producto) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }

    const comentario = producto.comentarios.id(comentarioId);
    if (!comentario) {
      return res.status(404).json({ mensaje: 'Comentario no encontrado' });
    }

    // Asegurar que el array existe
    if (!comentario.likes) comentario.likes = [];

    // Verificar si le dio like
    const yaLeDioLike = comentario.likes.some(id => id.toString() === usuarioId.toString());

    if (!yaLeDioLike) {
      // No le había dado like
      return res.json({
        mensaje: 'No le habías dado like a este comentario',
        likes: comentario.likes.length,
        userLiked: false
      });
    } else {
      // QUITAR like
      comentario.likes = comentario.likes.filter(id => id.toString() !== usuarioId.toString());
      await producto.save();
      console.log('✅ Like quitado y guardado');

      return res.json({
        mensaje: 'Like removido',
        likes: comentario.likes.length,
        userLiked: false
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerComentarios,
  obtenerComentariosProducto,
  crearComentario,
  editarComentario,
  eliminarComentario,
  toggleLike,
  quitarLike,
  toggleDislike
};
