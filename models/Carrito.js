const mongoose = require('mongoose');

const CarritoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
    cantidad: { type: Number, default: 1 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Carrito', CarritoSchema);
