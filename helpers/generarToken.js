const jwt = require('jsonwebtoken');

const generarToken = (uid) => {
  // Usar la variable de entorno para la clave secreta
  const secretKey = process.env.JWT_SECRET || 'clave_secreta_temporal_para_pruebas';
  
  try {
    console.log('Generando token para uid:', uid);
    const token = jwt.sign({ uid }, secretKey, { expiresIn: '24h' });
    console.log('Token generado correctamente');
    return token;
  } catch (error) {
    console.error('Error al generar token:', error);
    throw new Error(`Error al generar token: ${error.message}`);
  }
};

module.exports = generarToken;
