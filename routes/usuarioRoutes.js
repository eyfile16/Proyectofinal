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

// Ruta para actualizar avatar (requiere autenticación)
// Esta ruta será accesible como /api/usuarios/avatar
router.put('/avatar', validarJWT, usuarioController.actualizarAvatar);

// Ruta para subir imagen de perfil (requiere autenticación)
// Esta ruta será accesible como /api/usuarios/subir-imagen
router.post('/subir-imagen', validarJWT, usuarioController.subirImagenPerfil);

// Ruta para eliminar imagen de perfil (requiere autenticación)
// Esta ruta será accesible como /api/usuarios/eliminar-imagen
router.delete('/eliminar-imagen', validarJWT, usuarioController.eliminarImagenPerfil);

// Ruta para limpiar imagen de perfil rota (requiere autenticación)
// Esta ruta será accesible como /api/usuarios/limpiar-imagen
router.put('/limpiar-imagen', validarJWT, usuarioController.limpiarImagenPerfil);

// Ruta para eliminar cuenta (requiere autenticación)
// Esta ruta será accesible como /api/usuarios/eliminar
router.delete('/eliminar', validarJWT, usuarioController.eliminarCuenta);

// Ruta para obtener un usuario por ID
router.get('/:id', usuarioController.obtenerUsuarioPorId);

// Ruta para obtener reseñas/comentarios de un usuario
// Esta ruta será accesible como /api/usuarios/{id}/resenas
router.get('/:id/resenas', usuarioController.obtenerResenasUsuario);

module.exports = router;








