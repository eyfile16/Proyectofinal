const Categoria = require('../models/Categoria');

// Verifica si ya existe una categoría con el mismo nombre
const categoriaExiste = async (nombre) => {
  const existente = await Categoria.findOne({ nombre: nombre.trim().toLowerCase() });
  return !!existente;
};

module.exports = {
  categoriaExiste,
};
