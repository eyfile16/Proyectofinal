const express = require('express');
const router = express.Router();
const { validarJWT } = require('../middlewares/validarjwt');
const Pedido = require('../models/Pedido');

// Obtener todos los pedidos (solo admin)
router.get('/', validarJWT, async (req, res) => {
  try {
    // Verificar si el usuario es admin (ajusta según tu modelo de usuario)
    if (req.usuario.rol !== 'ADMIN_ROLE') {
      return res.status(403).json({ msg: 'No tienes permisos para ver todos los pedidos' });
    }
    
    const pedidos = await Pedido.find()
      .populate('usuario', 'nombre email')
      .sort({ fecha: -1 });
    
    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// Obtener pedidos de un usuario específico
router.get('/usuario/:id', validarJWT, async (req, res) => {
  try {
    // Verificar que el usuario solo pueda ver sus propios pedidos
    if (req.usuario._id.toString() !== req.params.id && req.usuario.rol !== 'ADMIN_ROLE') {
      return res.status(403).json({ msg: 'No autorizado para ver estos pedidos' });
    }
    
    const pedidos = await Pedido.find({ usuario: req.params.id })
      .sort({ fecha: -1 });
    
    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos del usuario:', error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// Obtener un pedido específico
router.get('/:id', validarJWT, async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('usuario', 'nombre email');
    
    if (!pedido) {
      return res.status(404).json({ msg: 'Pedido no encontrado' });
    }
    
    // Verificar que el usuario solo pueda ver sus propios pedidos
    if (pedido.usuario._id.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'ADMIN_ROLE') {
      return res.status(403).json({ msg: 'No autorizado para ver este pedido' });
    }
    
    res.json(pedido);
  } catch (error) {
    console.error('Error al obtener el pedido:', error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// Crear un nuevo pedido
router.post('/', validarJWT, async (req, res) => {
  try {
    const { items, direccion, metodoPago, subtotal, envio, descuento, total, detallesPago } = req.body;
    
    const nuevoPedido = new Pedido({
      usuario: req.usuario._id,
      items,
      direccion,
      metodoPago,
      subtotal,
      envio,
      descuento,
      total,
      detallesPago,
      estado: 'pendiente',
      fecha: new Date()
    });
    
    const pedidoGuardado = await nuevoPedido.save();
    res.status(201).json(pedidoGuardado);
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// Actualizar estado de un pedido (solo admin)
router.put('/:id/estado', validarJWT, async (req, res) => {
  try {
    // Verificar si el usuario es admin
    if (req.usuario.rol !== 'ADMIN_ROLE') {
      return res.status(403).json({ msg: 'No tienes permisos para actualizar pedidos' });
    }
    
    const { estado } = req.body;
    
    if (!estado) {
      return res.status(400).json({ msg: 'El estado es requerido' });
    }
    
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );
    
    if (!pedido) {
      return res.status(404).json({ msg: 'Pedido no encontrado' });
    }
    
    res.json(pedido);
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;