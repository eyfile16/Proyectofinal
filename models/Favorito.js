const mongoose = require('mongoose');

const FavoritoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' }
});

module.exports = mongoose.model('Favorito', FavoritoSchema);
