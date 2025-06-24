const mongoose = require('mongoose');

const FacturaSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
    cantidad: Number
  }],
  total: Number,
  metodoPago: { type: mongoose.Schema.Types.ObjectId, ref: 'MetodoPago' },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Factura', FacturaSchema);
