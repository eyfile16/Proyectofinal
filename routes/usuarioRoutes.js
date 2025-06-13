const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { validarJWT } = require('../middlewares/validarjwt');

// Ruta para obtener todos los usuarios
// Esta ruta será accesible como /api/usuarios/
router.get('/', usuarioController.obtenerTodos);

// Ruta para actualizar perfil (requiere autenticación)
// Esta ruta será accesible como /api/usuarios/actualizar
router.put('/actualizar', validarJWT, usuarioController.actualizarPerfil);

// Ruta para eliminar cuenta (requiere autenticación)
// Esta ruta será accesible como /api/usuarios/eliminar
router.delete('/eliminar', validarJWT, usuarioController.eliminarCuenta);

module.exports = router;








