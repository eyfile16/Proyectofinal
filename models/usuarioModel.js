const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['admin', 'cliente'],
    default: 'cliente'
  },
  imagenPerfil: {
    type: String,
    default: null
  },
  avatarPredeterminado: {
    type: String,
    enum: ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5'],
    default: 'avatar1'
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
