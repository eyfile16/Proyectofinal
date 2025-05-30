const Categoria = require('../models/Categoria');

exports.getTodas = async (req, res) => {
  const categorias = await Categoria.find();
  res.json(categorias);
};

exports.crear = async (req, res) => {
  try {
    console.log('Datos recibidos para crear categoría:', req.body);
    
    // Validar datos mínimos
    if (!req.body.nombre) {
      return res.status(400).json({ 
        error: 'Datos incompletos', 
        mensaje: 'El nombre es obligatorio' 
      });
    }
    
    const categoria = new Categoria({
      nombre: req.body.nombre,
      descripcion: req.body.descripcion || '',
      imagen: req.body.imagen || null
    });
    
    await categoria.save();
    
    res.status(201).json({
      mensaje: 'Categoría creada correctamente',
      categoria
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ 
      error: 'Error al crear categoría', 
      detalles: error.message 
    });
  }
};

exports.eliminar = async (req, res) => {
  await Categoria.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Categoría eliminada' });
};

exports.actualizar = async (req, res) => {
  try {
    console.log('Datos recibidos para actualizar categoría:', req.body);
    
    const categoriaActualizada = await Categoria.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!categoriaActualizada) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.json({
      mensaje: 'Categoría actualizada correctamente',
      categoria: categoriaActualizada
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ 
      error: 'Error al actualizar categoría', 
      detalles: error.message 
    });
  }
};
