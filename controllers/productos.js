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
