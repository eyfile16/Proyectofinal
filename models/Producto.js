
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductoSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'El stock no puede ser negativo']
  },
  categoria: {
    type: Schema.Types.ObjectId,
    ref: 'Categoria'
  },
  imagen: {
    type: String,
    default: null
  },
  imagenes: {
    type: [String],
    default: []
  },
  destacado: {
    type: Boolean,
    default: false
  },
  activo: {
    type: Boolean,
    default: true
  },
  colores: {
    type: [String],
    default: []
  },
  tallas: {
    type: [String],
    default: []
  },
  comentarios: [{
    usuario: String,
    texto: String,
    calificacion: Number,
    fecha: {
      type: Date,
      default: Date.now
    }
  }],
  calificacion: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  cantidadCalificaciones: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  versionKey: false
});

// Middleware para registrar operaciones
ProductoSchema.pre('save', function(next) {
  console.log(`Guardando producto: ${this.nombre}`);
  next();
});

ProductoSchema.pre('findOneAndUpdate', function(next) {
  console.log('Actualizando producto');
  next();
});

module.exports = mongoose.model('Producto', ProductoSchema);
