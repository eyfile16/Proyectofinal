const MetodoPago = require('../models/MetodoPago');

exports.getTodos = async (req, res) => {
  const metodos = await MetodoPago.find();
  res.json(metodos);
};

exports.crear = async (req, res) => {
  const metodo = new MetodoPago(req.body);
  await metodo.save();
  res.json(metodo);
};
