const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel');

const generarJWT = (uid) => {
    return new Promise((resolve, reject) => {
        const payload = { uid };
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'mi_clave_secreta_temporal',
            {
                expiresIn: "4h",
            },
            (err, token) => {
                if (err) {
                    console.log(err);
                    reject("no se pudo generar el token");
                } else {
                    resolve(token);
                }
            }
        );
    });
}


const validarJWT = async (req, res, next) => {
    // Buscar token en x-token o Authorization header
    let token = req.header("x-token");

    // Si no hay token en x-token, buscar en Authorization header
    if (!token) {
        const authHeader = req.header("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Remover "Bearer " del inicio
        }
    }

    if(!token){
        return res.status(401).json({
            msg: "No hay token en la peticion"
        })
    }
    try {
        const {uid} = jwt.verify(token, process.env.JWT_SECRET || 'mi_clave_secreta_temporal')
        let user = await Usuario.findById(uid)
        console.log(uid);
        if(!user){
            return res.status(401).json({
                msg:"Token no valido - usuario no existe"
            })
        }
        if(!user.estado){
            return res.status(401).json({
                msg:"Token no valido - usuario inactivo"
            })
        }
        
        // Agregar el usuario al request
        req.usuario = user;
        
        next()

    } catch (error) {
        res.status(401).json({
            msg:"Token no valido"
        })
    }
}

module.exports = { generarJWT, validarJWT };
