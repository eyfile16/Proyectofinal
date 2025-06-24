const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos');

// Middleware para registrar todas las solicitudes
router.use((req, res, next) => {
  console.log(`Solicitud a productos: ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Datos recibidos:', Object.keys(req.body));
    
    // Verificar si hay imágenes
    if (req.body.imagen) {
      console.log('Imagen principal recibida (primeros 50 caracteres):', req.body.imagen.substring(0, 50) + '...');
    }
    
    if (req.body.imagenes && Array.isArray(req.body.imagenes)) {
      console.log(`Recibidas ${req.body.imagenes.length} imágenes adicionales`);
    }
  }
  next();
});

// Rutas para productos
router.get('/', productosController.obtenerTodos);
router.get('/:id', productosController.obtenerPorId);
router.post('/', productosController.crear);
router.put('/:id', productosController.actualizar);
router.delete('/:id', productosController.eliminar);

// Eliminar estas rutas relacionadas con comentarios
// router.post('/:id/comentario', async (req, res) => { ... });
// router.get('/:id/comentarios', async (req, res) => { ... });

module.exports = router;
