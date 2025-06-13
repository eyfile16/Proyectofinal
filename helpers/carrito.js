// Verifica si ya existe un producto en el carrito y devuelve su índice
const encontrarProductoEnCarrito = (carrito, productoId) => {
  return carrito.productos.findIndex(p => p.producto.toString() === productoId);
};

// Crea un nuevo carrito si no existe
const crearNuevoCarrito = (usuarioId) => {
  return {
    usuario: usuarioId,
    productos: [],
  };
};

module.exports = {
  encontrarProductoEnCarrito,
  crearNuevoCarrito,
};
