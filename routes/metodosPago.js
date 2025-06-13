const express = require('express');
const router = express.Router();
const metodosPago = require('../controllers/metodosPago');

router.get('/', metodosPago.getTodos);
router.post('/', metodosPago.crear);

module.exports = router;
