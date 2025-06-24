
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductoSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  imagen: String,
  imagenes: [String],
  categoria: {
    type: Schema.Types.ObjectId,
    ref: 'Categoria'
  },
<<<<<<< HEAD
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
=======
  // Eliminar estos campos
  // comentarios: [{
  //   usuario: String,
  //   texto: String,
  //   calificacion: Number,
  //   fecha: {
  //     type: Date,
  //     default: Date.now
  //   }
  // }],
  // calificacion: {
  //   type: Number,
  //   default: 0,
  //   min: 0,
  //   max: 5
  // },
  // cantidadCalificaciones: {
  //   type: Number,
  //   default: 0,
  //   min: 0
  // }
>>>>>>> 5818a314037a582bdd1a48ece3d4080c85d5acfb
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
