const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  items: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto'
    },
    nombre: String,
    precio: Number,
    cantidad: Number,
    imagen: String
  }],
  direccion: {
    calle: String,
    ciudad: String,
    estado: String,
    codigoPostal: String,
    pais: String
  },
  metodoPago: {
    type: String,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  envio: {
    type: Number,
    default: 0
  },
  descuento: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  detallesPago: {
    idTransaccion: String,
    estado: String,
    fecha: Date
  },
  fecha: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Pedido', PedidoSchema);