const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel');

const generarJWT = (uid) => {
    return new Promise((resolve, reject) => {
        const payload = { uid };
        jwt.sign(
            payload,
            process.env.SECRETORPRIVATEKEY || 'clave_secreta_temporal_para_pruebas',
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
    const token = req.header("x-token");
    if(!token){
        return res.status(401).json({
            msg: "No hay token en la peticion"
        })
    }
    try {
        const {uid} = jwt.verify(token, process.env.SECRETORPRIVATEKEY || 'clave_secreta_temporal_para_pruebas')
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
