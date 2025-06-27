const mongoose = require('mongoose');

const ComentarioSchema = new mongoose.Schema({
  // Referencia al producto
  productoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  
  // Información del usuario
  usuario: {
    type: String,
    required: true,
    trim: true
  },
  
  // Contenido del comentario
  texto: {
    type: String,
    required: true,
    trim: true
  },
  
  // Calificación (1-5 estrellas)
  calificacion: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Fecha del comentario
  fecha: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Comentario', ComentarioSchema);


