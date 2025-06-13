const Carrito = require('../models/Carrito');

exports.getCarrito = async (req, res) => {
  const carrito = await Carrito.findOne({ usuario: req.params.userId }).populate('productos.producto');
  res.json(carrito);
};

exports.agregarProducto = async (req, res) => {
  const { userId } = req.params;
  const { productoId, cantidad } = req.body;

  let carrito = await Carrito.findOne({ usuario: userId });
  if (!carrito) {
    carrito = new Carrito({ usuario: userId, productos: [] });
  }

  const index = carrito.productos.findIndex(p => p.producto.toString() === productoId);
  if (index >= 0) {
    carrito.productos[index].cantidad += cantidad;
  } else {
    carrito.productos.push({ producto: productoId, cantidad });
  }

  await carrito.save();
  res.json(carrito);
};

exports.vaciarCarrito = async (req, res) => {
  await Carrito.findOneAndDelete({ usuario: req.params.userId });
  res.json({ msg: 'Carrito eliminado' });
};
