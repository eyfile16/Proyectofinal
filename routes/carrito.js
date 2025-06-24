const express = require('express');
const router = express.Router();
const carrito = require('../controllers/carrito');

router.get('/:userId', carrito.getCarrito);
router.post('/:userId', carrito.agregarProducto);
router.delete('/:userId', carrito.vaciarCarrito);

module.exports = router;
