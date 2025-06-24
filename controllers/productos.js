// controllers/productos.js
const Producto = require('../models/Producto');
const { guardarImagenBase64, eliminarImagen } = require('../utils/imageHandler');

// Obtener todos los productos
exports.obtenerTodos = async (req, res) => {
  try {
    const productos = await Producto.find().populate('categoria');
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Obtener un producto por ID
exports.obtenerPorId = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id).populate('categoria');
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// Crear un nuevo producto
exports.crear = async (req, res) => {
  try {
    console.log('Recibiendo solicitud para crear producto');
    const productoData = req.body;
    
    // Verificar que se recibieron datos
    if (!productoData) {
      console.error('No se recibieron datos del producto');
      return res.status(400).json({ error: 'No se recibieron datos del producto' });
    }
    
    console.log('Datos recibidos:', JSON.stringify(productoData).substring(0, 200) + '...');
    
    // Validar campos obligatorios
    const camposRequeridos = ['nombre', 'precio', 'categoria'];
    const camposFaltantes = camposRequeridos.filter(campo => !productoData[campo]);
    
    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios',
        detalles: camposFaltantes.reduce((obj, campo) => {
          obj[campo] = `El campo ${campo} es obligatorio`;
          return obj;
        }, {}),
        mensaje: `Los siguientes campos son obligatorios: ${camposFaltantes.join(', ')}`
      });
    }
    
    // Validar tipos de datos
    if (isNaN(Number(productoData.precio))) {
      return res.status(400).json({
        error: 'Tipo de dato incorrecto',
        detalles: { precio: 'El precio debe ser un número' },
        mensaje: 'El precio debe ser un número válido'
      });
    }
    
    // Procesar imagen principal si existe
    if (productoData.imagen && productoData.imagen.includes('base64')) {
      console.log('Procesando imagen principal...');
      const imagenUrl = await guardarImagenBase64(productoData.imagen, productoData.nombre || 'producto', 'productos');
      if (imagenUrl) {
        productoData.imagen = imagenUrl;
        console.log('Imagen principal guardada:', imagenUrl);
      } else {
        console.error('No se pudo guardar la imagen principal');
        // Si no se pudo guardar la imagen, establecer imagen como null para evitar errores
        productoData.imagen = null;
      }
    }
    
    // Procesar imágenes adicionales si existen
    if (productoData.imagenes && Array.isArray(productoData.imagenes)) {
      console.log(`Procesando ${productoData.imagenes.length} imágenes adicionales...`);
      const imagenesGuardadas = [];
      
      for (let i = 0; i < productoData.imagenes.length; i++) {
        const imagen = productoData.imagenes[i];
        if (imagen && imagen.includes('base64')) {
          // Si es base64, procesarla como antes
          const imagenUrl = await guardarImagenBase64(imagen, `${productoData.nombre || 'producto'}-${i+1}`, 'productos');
          if (imagenUrl) {
            imagenesGuardadas.push(imagenUrl);
            console.log(`Imagen adicional ${i+1} guardada:`, imagenUrl);
          } else {
            console.error(`No se pudo guardar la imagen adicional ${i+1}`);
          }
        } else if (imagen && (imagen.startsWith('http://') || imagen.startsWith('https://'))) {
          // Si ya es una URL, mantenerla sin procesar
          imagenesGuardadas.push(imagen);
          console.log(`Manteniendo URL de imagen existente: ${imagen.substring(0, 50)}...`);
        }
      }
      
      productoData.imagenes = imagenesGuardadas;
    }
    
    // Asegurarse de que los campos numéricos sean números
    if (productoData.precio) {
      productoData.precio = Number(productoData.precio);
    }
    
    if (productoData.stock) {
      productoData.stock = Number(productoData.stock);
    }
    
    // Asegurarse de que los campos booleanos sean booleanos
    if (productoData.destacado !== undefined) {
      productoData.destacado = Boolean(productoData.destacado);
    }
    
    if (productoData.activo !== undefined) {
      productoData.activo = Boolean(productoData.activo);
    }
    
    // Inicializar arrays si no existen
    if (!productoData.imagenes) {
      productoData.imagenes = [];
    }
    
    if (!productoData.colores) {
      productoData.colores = [];
    }
    
    if (!productoData.tallas) {
      productoData.tallas = [];
    }
    
    if (!productoData.comentarios) {
      productoData.comentarios = [];
    }
    
    console.log('Datos procesados para guardar:', JSON.stringify(productoData).substring(0, 200) + '...');
    console.log('Creando nuevo producto en la base de datos...');
    const producto = new Producto(productoData);
    const productoGuardado = await producto.save();
    
    console.log('Producto guardado exitosamente con ID:', productoGuardado._id);
    res.status(201).json(productoGuardado);
  } catch (error) {
    console.error('Error al crear producto:', error);
    console.error('Mensaje de error:', error.message);
    console.error('Stack de error:', error.stack);
    
    // Si es un error de validación de Mongoose, enviar detalles específicos
    if (error.name === 'ValidationError') {
      const errores = {};
      for (let campo in error.errors) {
        errores[campo] = error.errors[campo].message;
      }
      return res.status(400).json({ 
        error: 'Error de validación', 
        detalles: errores,
        mensaje: error.message
      });
    }
    
    // Enviar respuesta detallada para depuración
    res.status(500).json({ 
      error: 'Error al crear producto', 
      mensaje: error.message,
      stack: error.stack
    });
  }
};

// Actualizar un producto existente
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const productoData = req.body;
    
    // Obtener el producto actual para comparar imágenes
    const productoActual = await Producto.findById(id);
    if (!productoActual) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Procesar imagen principal si existe y es nueva (base64)
    if (productoData.imagen && productoData.imagen.includes('base64')) {
      const imagenUrl = await guardarImagenBase64(productoData.imagen, productoData.nombre, 'uploads');
      if (imagenUrl) {
        // Si había una imagen anterior, eliminarla
        if (productoActual.imagen && productoActual.imagen.includes('cloudinary.com')) {
          await eliminarImagen(productoActual.imagen);
        }
        productoData.imagen = imagenUrl;
        console.log('Imagen principal actualizada:', imagenUrl);
      }
    }
    
    // Procesar imágenes adicionales si existen
    if (productoData.imagenes && Array.isArray(productoData.imagenes)) {
      const imagenesGuardadas = [];
      
      for (let i = 0; i < productoData.imagenes.length; i++) {
        const imagen = productoData.imagenes[i];
        if (imagen && imagen.includes('base64')) {
          const imagenUrl = await guardarImagenBase64(imagen, `${productoData.nombre}-${i+1}`, 'uploads');
          if (imagenUrl) {
            imagenesGuardadas.push(imagenUrl);
            console.log(`Imagen adicional ${i+1} actualizada:`, imagenUrl);
          }
        } else if (imagen && !imagen.includes('base64')) {
          // Si ya es una URL, mantenerla
          imagenesGuardadas.push(imagen);
        }
      }
      
      // Eliminar imágenes antiguas que ya no se usan
      if (productoActual.imagenes && Array.isArray(productoActual.imagenes)) {
        for (const imagenAntigua of productoActual.imagenes) {
          if (imagenAntigua.includes('cloudinary.com') && !imagenesGuardadas.includes(imagenAntigua)) {
            await eliminarImagen(imagenAntigua);
            console.log(`Imagen antigua eliminada: ${imagenAntigua}`);
          }
        }
      }
      
      productoData.imagenes = imagenesGuardadas;
    }
    
    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      productoData,
      { new: true }
    );
    
    res.json(productoActualizado);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto', detalles: error.message });
  }
};

// Eliminar un producto
exports.eliminar = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Eliminar imágenes asociadas
    if (producto.imagen && producto.imagen.includes('cloudinary.com')) {
      await eliminarImagen(producto.imagen);
    }
    
    if (producto.imagenes && Array.isArray(producto.imagenes)) {
      for (const imagen of producto.imagenes) {
        if (imagen.includes('cloudinary.com')) {
          await eliminarImagen(imagen);
        }
      }
    }
    
    await Producto.findByIdAndDelete(req.params.id);
    
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

// Mejorar el controlador para agregar comentarios
exports.agregarComentario = async (req, res) => {
  try {
    console.log('Recibiendo solicitud para agregar comentario');
    console.log('Parámetros:', req.params);
    console.log('Cuerpo de la solicitud:', req.body);
    
    const { id } = req.params;
    const { usuario, texto, calificacion, fecha } = req.body;
    
    // Basic validations
    if (!usuario || !texto || calificacion === undefined) {
      console.log('Validación fallida:', { usuario, texto, calificacion });
      return res.status(400).json({ 
        mensaje: 'Todos los campos son requeridos',
        camposFaltantes: {
          usuario: !usuario,
          texto: !texto,
          calificacion: calificacion === undefined
        }
      });
    }
    
    // Find the product
    console.log('Buscando producto con ID:', id);
    const Producto = require('../models/Producto'); // Asegurarse de importar el modelo

    // Verificar que el producto existe
    const productoExiste = await Producto.findById(id);
    if (!productoExiste) {
      console.log('Producto no encontrado con ID:', id);
      return res.status(404).json({ mensaje: 'Producto no encontrado', id });
    }

    console.log('Producto encontrado:', productoExiste.nombre);

    // Create the comment
    const mongoose = require('mongoose');
    const nuevoComentario = {
      _id: new mongoose.Types.ObjectId(),
      usuario,
      texto,
      calificacion: Number(calificacion),
      fecha: fecha ? new Date(fecha) : new Date()
    };

    console.log('Nuevo comentario creado:', nuevoComentario);

    // Agregar el comentario usando operación nativa de MongoDB para evitar validación
    const resultado = await mongoose.connection.db.collection('productos').updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $push: { comentarios: nuevoComentario } }
    );

    // Recalcular calificación promedio usando operación nativa
    if (resultado && resultado.modifiedCount > 0) {
      // Obtener el producto actualizado usando operación nativa
      const productoActualizado = await mongoose.connection.db.collection('productos').findOne(
        { _id: new mongoose.Types.ObjectId(id) }
      );

      if (productoActualizado && productoActualizado.comentarios && productoActualizado.comentarios.length > 0) {
        const comentariosValidos = productoActualizado.comentarios.filter(c => c.calificacion && !isNaN(c.calificacion));
        const totalCalificaciones = comentariosValidos.reduce((sum, c) => sum + Number(c.calificacion), 0);
        const calificacionPromedio = totalCalificaciones / comentariosValidos.length;

        // Actualizar calificación promedio usando operación nativa
        await mongoose.connection.db.collection('productos').updateOne(
          { _id: new mongoose.Types.ObjectId(id) },
          {
            $set: {
              calificacion: calificacionPromedio,
              cantidadCalificaciones: comentariosValidos.length
            }
          }
        );

        console.log('Calificación promedio actualizada:', calificacionPromedio);
      }
    }

    console.log('Comentario agregado exitosamente');
    
    // Obtener el producto actualizado para la respuesta usando operación nativa
    const productoFinal = await mongoose.connection.db.collection('productos').findOne(
      { _id: new mongoose.Types.ObjectId(id) }
    );

    res.status(201).json({
      mensaje: 'Comentario agregado con éxito',
      comentario: nuevoComentario,
      calificacionPromedio: productoFinal.calificacion || 0,
      cantidadCalificaciones: productoFinal.cantidadCalificaciones || 0
    });
  } catch (error) {
    console.error('Error al agregar comentario:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      mensaje: 'Error al agregar comentario', 
      error: error.message,
      stack: error.stack
    });
  }
};

// Obtener comentarios de un producto
exports.obtenerComentarios = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Obteniendo comentarios para producto:', id);

    // Usar operación nativa de MongoDB para evitar problemas de validación
    const mongoose = require('mongoose');
    const producto = await mongoose.connection.db.collection('productos').findOne(
      { _id: new mongoose.Types.ObjectId(id) }
    );

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    console.log('Producto encontrado:', producto.nombre);

    // Limpiar comentarios con fechas inválidas
    let comentariosLimpios = [];
    if (producto.comentarios && Array.isArray(producto.comentarios)) {
      comentariosLimpios = producto.comentarios.filter(comentario => {
        // Filtrar comentarios con fechas válidas
        if (comentario.fecha) {
          if (typeof comentario.fecha === 'string') {
            // Intentar parsear fechas string
            try {
              const fechaParseada = new Date(comentario.fecha);
              if (!isNaN(fechaParseada.getTime())) {
                comentario.fecha = fechaParseada.toISOString();
                return true;
              }
            } catch (error) {
              console.log('Filtrando comentario con fecha inválida:', comentario.fecha);
              return false;
            }
          } else if (comentario.fecha instanceof Date || comentario.fecha.$date) {
            return true;
          }
        }
        return comentario.usuario && comentario.texto && comentario.calificacion;
      });
    }

    console.log(`Comentarios limpios encontrados: ${comentariosLimpios.length}`);

    res.status(200).json({
      comentarios: comentariosLimpios,
      calificacionPromedio: producto.calificacion || 0,
      cantidadCalificaciones: producto.cantidadCalificaciones || 0
    });
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ mensaje: 'Error al obtener comentarios', error: error.message });
  }
};
