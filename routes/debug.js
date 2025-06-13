const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { guardarImagenBase64 } = require('../utils/imageHandler');

// Ruta para verificar la estructura de directorios
router.get('/directorios', (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../uploads');
    let exists = fs.existsSync(uploadDir);
    let files = [];
    
    if (exists) {
      files = fs.readdirSync(uploadDir);
    } else {
      fs.mkdirSync(uploadDir, { recursive: true });
      exists = true;
    }
    
    res.json({
      uploadDir,
      exists,
      files,
      __dirname,
      projectRoot: path.resolve(__dirname, '..')
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Ruta para probar la carga de imágenes
router.post('/upload-test', (req, res) => {
  try {
    const { imagen, nombre } = req.body;
    
    if (!imagen || !imagen.includes('base64')) {
      return res.status(400).json({ error: 'No se proporcionó una imagen válida' });
    }
    
    // Usar la utilidad para guardar la imagen
    const imagenUrl = guardarImagenBase64(imagen, nombre || 'test', 'uploads');
    
    if (!imagenUrl) {
      return res.status(500).json({ error: 'No se pudo guardar la imagen' });
    }
    
    res.json({
      success: true,
      url: imagenUrl,
      fullUrl: `${req.protocol}://${req.get('host')}${imagenUrl}`
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
