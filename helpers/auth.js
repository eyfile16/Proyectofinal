// Renombrar este archivo o asegurarse de que no se esté utilizando
// en lugar del controlador principal

const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');
const generarToken = require('../helpers/generarToken');

// Renombrar estas funciones para evitar conflictos
exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ msg: 'El usuario ya existe' });

    const hashed = await bcrypt.hash(password, 10);
    const usuario = new Usuario({ nombre, email, password: hashed });
    await usuario.save();

    res.json({ msg: 'Usuario registrado correctamente' });
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

    const match = await bcrypt.compare(password, usuario.password);
    if (!match) return res.status(401).json({ msg: 'Contraseña incorrecta' });

    const token = generarToken(usuario._id);
    res.json({ token, usuario });
  } catch (error) {
    res.status(500).json({ error });
  }
};
