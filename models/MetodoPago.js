const mongoose = require('mongoose');

const MetodoPagoSchema = new mongoose.Schema({
  nombre: { type: String, required: true }
});

module.exports = mongoose.model('MetodoPago', MetodoPagoSchema);
