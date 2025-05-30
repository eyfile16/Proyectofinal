const Factura = require('../models/Factura');

exports.crearFactura = async (req, res) => {
  const factura = new Factura(req.body);
  await factura.save();
  res.json(factura);
};

exports.getFacturasUsuario = async (req, res) => {
  const facturas = await Factura.find({ usuario: req.params.userId }).populate('productos.producto').populate('metodoPago');
  res.json(facturas);
};
