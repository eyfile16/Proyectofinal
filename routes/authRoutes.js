const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const bodyParser = require('body-parser');

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({ msg: 'Ruta de prueba funcionando correctamente' });
});

// Rutas de autenticación
router.post('/register', authController.registrar);
router.post('/login', authController.login);

// Ruta para obtener todos los usuarios
router.get('/todos-usuarios', authController.obtenerUsuarios);

module.exports = router;
