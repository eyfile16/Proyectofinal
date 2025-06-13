const express = require('express');
const router = express.Router();
const categorias = require('../controllers/categorias');

router.get('/', categorias.getTodas);
router.post('/', categorias.crear);
router.put('/:id', categorias.actualizar);
router.delete('/:id', categorias.eliminar);

module.exports = router;
