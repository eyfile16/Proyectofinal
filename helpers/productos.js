const Producto = require('../models/Producto');

// Verifica si ya existe un producto con el mismo nombre
const productoExiste = async (nombre) => {
  const existente = await Producto.findOne({ nombre: nombre.trim().toLowerCase() });
  return !!existente;
};

// Valida los campos requeridos para crear un producto
const validarProducto = (datos) => {
  const { nombre, precio, categoria } = datos;
  return !!(nombre && precio && categoria);
};

// Normaliza los datos antes de guardar
const normalizarProducto = (datos) => {
  return {
    ...datos,
    nombre: datos.nombre.trim().toLowerCase(),
  };
};

module.exports = {
  productoExiste,
  validarProducto,
  normalizarProducto,
};
