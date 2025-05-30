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
      const imagenUrl = guardarImagenBase64(productoData.imagen, productoData.nombre || 'producto', 'uploads');
      if (imagenUrl) {
        productoData.imagen = imagenUrl;
        console.log('Imagen principal guardada:', imagenUrl);
      } else {
        console.error('No se pudo guardar la imagen principal');
      }
    }
    
    // Procesar imágenes adicionales si existen
    if (productoData.imagenes && Array.isArray(productoData.imagenes)) {
      console.log(`Procesando ${productoData.imagenes.length} imágenes adicionales...`);
      const imagenesGuardadas = [];
      
      for (let i = 0; i < productoData.imagenes.length; i++) {
        const imagen = productoData.imagenes[i];
        if (imagen && imagen.includes('base64')) {
          const imagenUrl = guardarImagenBase64(imagen, `${productoData.nombre || 'producto'}-${i+1}`, 'uploads');
          if (imagenUrl) {
            imagenesGuardadas.push(imagenUrl);
            console.log(`Imagen adicional ${i+1} guardada:`, imagenUrl);
          } else {
            console.error(`No se pudo guardar la imagen adicional ${i+1}`);
          }
        } else if (imagen && !imagen.includes('base64')) {
          // Si ya es una URL, mantenerla
          imagenesGuardadas.push(imagen);
          console.log(`Manteniendo URL de imagen existente: ${imagen.substring(0, 50)}...`);
        }
      }
      
      productoData.imagenes = imagenesGuardadas;
    }
    
    console.log('Creando nuevo producto en la base de datos...');
    const producto = new Producto(productoData);
    const productoGuardado = await producto.save();
    
    console.log('Producto guardado exitosamente con ID:', productoGuardado._id);
    res.status(201).json(productoGuardado);
  } catch (error) {
    console.error('Error al crear producto:', error);
    
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
      const imagenUrl = guardarImagenBase64(productoData.imagen, productoData.nombre, 'uploads');
      if (imagenUrl) {
        // Si había una imagen anterior, eliminarla
        if (productoActual.imagen && productoActual.imagen.startsWith('/uploads/')) {
          eliminarImagen(productoActual.imagen);
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
          const imagenUrl = guardarImagenBase64(imagen, `${productoData.nombre}-${i+1}`, 'uploads');
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
          if (imagenAntigua.startsWith('/uploads/') && !imagenesGuardadas.includes(imagenAntigua)) {
            eliminarImagen(imagenAntigua);
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
    if (producto.imagen && producto.imagen.startsWith('/uploads/')) {
      eliminarImagen(producto.imagen);
    }
    
    if (producto.imagenes && Array.isArray(producto.imagenes)) {
      for (const imagen of producto.imagenes) {
        if (imagen.startsWith('/uploads/')) {
          eliminarImagen(imagen);
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
