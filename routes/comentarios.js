const express = require('express');
const router = express.Router();
const comentarioController = require('../controllers/comentarioController');
const { validarJWT } = require('../middlewares/validarjwt');

// Rutas para comentarios

// Obtener comentarios de un producto
router.get('/producto/:productoId', comentarioController.obtenerComentarios);

// Crear nuevo comentario (requiere autenticación)
router.post('/', validarJWT, comentarioController.crearComentario);

// Editar comentario (requiere autenticación)
router.put('/:comentarioId', validarJWT, comentarioController.editarComentario);

// Eliminar comentario (requiere autenticación)
router.delete('/:comentarioId', validarJWT, comentarioController.eliminarComentario);

// Dar like a un comentario (requiere autenticación)
router.post('/:comentarioId/like', validarJWT, comentarioController.toggleLike);

// Quitar like de un comentario (requiere autenticación)
router.delete('/:comentarioId/like', validarJWT, comentarioController.quitarLike);

// Dar dislike/undislike a un comentario (requiere autenticación)
router.post('/:comentarioId/dislike', validarJWT, comentarioController.toggleDislike);

module.exports = router;
