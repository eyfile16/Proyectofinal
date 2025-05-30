const express = require('express');
const router = express.Router();
const favoritos = require('../controllers/favoritos');

router.get('/:userId', favoritos.getFavoritos);
router.post('/:userId', favoritos.agregar);
router.delete('/:userId/:productoId', favoritos.eliminar);

module.exports = router;
