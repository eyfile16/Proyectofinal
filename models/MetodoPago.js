const mongoose = require('mongoose');

const MetodoPagoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  // Información personal
  tipoDocumento: {
    type: String,
    required: true,
    enum: ['CC', 'CE', 'PA', 'NIT']
  },
  numeroDocumento: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  apellido: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  telefono: {
    type: String,
    required: true
  },
  // Información de dirección
  direccion: {
    type: String,
    required: true
  },
  barrio: {
    type: String,
    required: true
  },
  departamento: {
    type: String,
    required: true
  },
  ciudad: {
    type: String,
    required: true
  },
  codigoPostal: {
    type: String,
    required: true
  },
  telefonoContacto: {
    type: String,
    required: false
  },
  // Método de pago preferido
  metodoPagoPreferido: {
    type: String,
    enum: ['paypal', 'tarjeta', 'efectivo'],
    default: 'paypal'
  },
  // Metadatos
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar fechaActualizacion
MetodoPagoSchema.pre('save', function(next) {
  this.fechaActualizacion = Date.now();
  next();
});

module.exports = mongoose.model('MetodoPago', MetodoPagoSchema);
