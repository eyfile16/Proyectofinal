const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');

// Configurar Cloudinary
cloudinary.config({ 
  cloud_name: 'djn4cl8gz', 
  api_key: '255289986787961', 
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret_here'
});

/**
 * Guarda una imagen en formato base64 en Cloudinary
 * @param {string} base64String - Imagen en formato base64
 * @param {string} nombreArchivo - Nombre base para el archivo
 * @param {string} directorio - Carpeta en Cloudinary donde guardar la imagen
 * @returns {string|null} - URL de la imagen guardada o null si hubo un error
 */
const guardarImagenBase64 = async (base64String, nombreArchivo, directorio = 'productos') => {
  try {
    console.log('Guardando imagen base64 en Cloudinary...');
    
    // Verificar si es una cadena base64 válida
    if (!base64String || typeof base64String !== 'string') {
      console.error('No es una cadena base64 válida');
      return null;
    }
    
    // Asegurarse de que la cadena base64 tenga el formato correcto
    let base64Data = base64String;
    if (!base64String.startsWith('data:image')) {
      // Si no tiene el prefijo, asumimos que es una imagen JPEG
      base64Data = `data:image/jpeg;base64,${base64String}`;
    }
    
    // Sanitizar el nombre del archivo
    const nombreSanitizado = nombreArchivo.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Subir imagen a Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      folder: directorio,
      public_id: `${Date.now()}-${nombreSanitizado}`,
      resource_type: 'auto'
    });
    
    console.log(`Imagen guardada en Cloudinary: ${uploadResult.public_id}`);
    
    // Devolver la URL segura de Cloudinary
    return uploadResult.secure_url;
  } catch (error) {
    console.error('Error al guardar imagen en Cloudinary:', error);
    console.error('Detalles del error:', error.message);
    return null;
  }
};

/**
 * Elimina una imagen de Cloudinary
 * @param {string} imageUrl - URL de la imagen en Cloudinary
 * @returns {boolean} - true si se eliminó correctamente, false en caso contrario
 */
const eliminarImagen = async (imageUrl) => {
  try {
    console.log('Eliminando imagen de Cloudinary:', imageUrl);
    
    // Verificar si la URL es de Cloudinary
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.includes('cloudinary.com')) {
      console.error('No es una URL de Cloudinary válida');
      return false;
    }
    
    // Extraer el public_id de la URL
    const urlParts = imageUrl.split('/');
    const filenameWithExtension = urlParts[urlParts.length - 1];
    const filename = filenameWithExtension.split('.')[0];
    const folderPath = urlParts.slice(urlParts.indexOf('upload') + 1, urlParts.length - 1).join('/');
    const publicId = folderPath ? `${folderPath}/${filename}` : filename;
    
    // Eliminar la imagen de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log(`Imagen eliminada de Cloudinary: ${publicId}`);
      return true;
    } else {
      console.error(`Error al eliminar imagen de Cloudinary: ${result.result}`);
      return false;
    }
  } catch (error) {
    console.error('Error al eliminar imagen de Cloudinary:', error);
    return false;
  }
};

module.exports = {
  guardarImagenBase64,
  eliminarImagen
};


