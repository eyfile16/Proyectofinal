const fs = require('fs');
const path = require('path');

/**
 * Guarda una imagen en formato base64 en el sistema de archivos
 * @param {string} base64String - Imagen en formato base64
 * @param {string} nombreArchivo - Nombre base para el archivo
 * @param {string} directorio - Directorio donde guardar la imagen (relativo a la raíz del proyecto)
 * @returns {string|null} - URL relativa de la imagen guardada o null si hubo un error
 */
const guardarImagenBase64 = (base64String, nombreArchivo, directorio = 'uploads') => {
  try {
    console.log('Guardando imagen base64...');
    
    // Verificar si es una cadena base64 válida
    if (!base64String || typeof base64String !== 'string' || !base64String.includes('base64')) {
      console.error('No es una cadena base64 válida');
      return null;
    }
    
    // Extraer la parte de datos de la cadena base64
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      console.error('Formato base64 inválido');
      return null;
    }
    
    // Obtener el tipo de contenido y los datos
    const contentType = matches[1];
    const base64Data = matches[2];
    
    // Determinar la extensión del archivo
    let extension = 'png';
    if (contentType.includes('jpeg')) extension = 'jpg';
    if (contentType.includes('png')) extension = 'png';
    if (contentType.includes('gif')) extension = 'gif';
    
    // Sanitizar el nombre del archivo
    const nombreSanitizado = nombreArchivo.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Crear un nombre de archivo único
    const fileName = `${Date.now()}-${nombreSanitizado}.${extension}`;
    
    // Ruta absoluta al directorio del proyecto
    const projectRoot = path.resolve(__dirname, '..');
    
    // Asegurarse de que el directorio existe
    const uploadDir = path.join(projectRoot, directorio);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`Directorio creado: ${uploadDir}`);
    }
    
    // Ruta completa del archivo
    const filePath = path.join(uploadDir, fileName);
    
    // Guardar el archivo
    fs.writeFileSync(filePath, base64Data, 'base64');
    console.log(`Imagen guardada en: ${filePath}`);
    
    // Devolver la URL relativa para acceder a la imagen
    return `/${directorio}/${fileName}`;
  } catch (error) {
    console.error('Error al guardar imagen base64:', error);
    return null;
  }
};

/**
 * Elimina una imagen del sistema de archivos
 * @param {string} imagePath - Ruta relativa de la imagen
 * @returns {boolean} - true si se eliminó correctamente, false en caso contrario
 */
const eliminarImagen = (imagePath) => {
  try {
    console.log('Eliminando imagen:', imagePath);
    
    // Verificar si la ruta es válida
    if (!imagePath || typeof imagePath !== 'string' || !imagePath.startsWith('/')) {
      console.error('Ruta de imagen inválida');
      return false;
    }
    
    // Ruta absoluta al directorio del proyecto
    const projectRoot = path.resolve(__dirname, '..');
    
    // Ruta completa del archivo
    const filePath = path.join(projectRoot, imagePath.substring(1));
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error(`El archivo no existe: ${filePath}`);
      return false;
    }
    
    // Eliminar el archivo
    fs.unlinkSync(filePath);
    console.log(`Imagen eliminada: ${filePath}`);
    
    return true;
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    return false;
  }
};

module.exports = {
  guardarImagenBase64,
  eliminarImagen
};
