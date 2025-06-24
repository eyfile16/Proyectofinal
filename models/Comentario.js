const mongoose = require('mongoose');

const ComentarioSchema = new mongoose.Schema({
  productoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Producto',
    required: true 
  },
  usuario: { 
    type: String, 
    required: true 
  },
  texto: { 
    type: String, 
    required: true 
  },
  calificacion: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  fecha: { 
    type: Date, 
    default: Date.now 
  },
  imagenes: [String]
}, { timestamps: true });

module.exports = mongoose.model('Comentario', ComentarioSchema);



