const Favorito = require('../models/Favorito');

exports.getFavoritos = async (req, res) => {
  const favoritos = await Favorito.find({ usuario: req.params.userId }).populate('producto');
  res.json(favoritos);
};

exports.agregar = async (req, res) => {
  const favorito = new Favorito({ usuario: req.params.userId, producto: req.body.productoId });
  await favorito.save();
  res.json(favorito);
};

exports.eliminar = async (req, res) => {
  await Favorito.findOneAndDelete({ usuario: req.params.userId, producto: req.params.productoId });
  res.json({ msg: 'Favorito eliminado' });
};
