const express = require('express');
const router = express.Router();
const metodosPago = require('../controllers/metodosPago');
const { validarJWT } = require('../middlewares/validarjwt');

// Rutas protegidas que requieren autenticación

// Obtener método de pago del usuario autenticado
router.get('/mi-metodo', validarJWT, metodosPago.obtenerMiMetodo);

// Crear o actualizar método de pago del usuario autenticado
router.post('/', validarJWT, metodosPago.crear);

// Obtener métodos de pago de un usuario específico (solo admin o el mismo usuario)
router.get('/usuario/:usuarioId', validarJWT, metodosPago.obtenerPorUsuario);

// Eliminar método de pago
router.delete('/:id', validarJWT, metodosPago.eliminar);

// Rutas de administrador

// Obtener todos los métodos de pago (solo admin)
router.get('/admin/todos', validarJWT, (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'No tienes permisos de administrador' });
  }
  next();
}, metodosPago.getTodos);

module.exports = router;
