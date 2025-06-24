const express = require('express');
const router = express.Router();
const facturas = require('../controllers/facturas');

router.post('/', facturas.crearFactura);
router.get('/:userId', facturas.getFacturasUsuario);

module.exports = router;
