const verificarToken = (req, res, next) => {
    const token = req.header('x-token'); // Obtener el token de la cabecera
  
    if (!token) {
      return res.status(403).json({ // Si no hay token, devolver error 403
        msg: 'No hay token en la solicitud'
      });
    }
  
    // Eliminar "Bearer " del token
    const tokenSinBearer = token.split(' ')[1]; 
  
    // Verificar el token con la clave secreta
    jwt.verify(tokenSinBearer, process.env.JWT_SECRET || 'mi_secreto', (err, decoded) => {
      if (err) {
        // Si el token es inválido, retornar un error 401 con el mensaje adecuado
        return res.status(401).json({
          msg: 'Token no válido',
          error: err.message  // Esto te da más detalles sobre el error (como si está expirado, mal formado, etc.)
        });
      }
      
      // Si el token es válido, guardar la información del usuario decodificada
      req.usuarioId = decoded.uid;
      next();  // Continuar con el siguiente middleware o ruta
    });
  };
  