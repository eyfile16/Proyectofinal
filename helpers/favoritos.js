const Favorito = require('../models/Favorito');

// Verifica si un producto ya está en los favoritos del usuario
const yaEsFavorito = async (usuarioId, productoId) => {
  const favorito = await Favorito.findOne({ usuario: usuarioId, producto: productoId });
  return !!favorito;
};

// Crea un nuevo favorito
const crearFavorito = (usuarioId, productoId) => {
  return new Favorito({ usuario: usuarioId, producto: productoId });
};

module.exports = {
  yaEsFavorito,
  crearFavorito,
};

