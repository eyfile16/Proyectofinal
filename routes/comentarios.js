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

// Dar like/unlike a un comentario (requiere autenticación)
router.post('/:comentarioId/like', validarJWT, comentarioController.toggleLike);

// Dar dislike/undislike a un comentario (requiere autenticación)
router.post('/:comentarioId/dislike', validarJWT, comentarioController.toggleDislike);

module.exports = router;
