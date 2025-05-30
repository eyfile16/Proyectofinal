const nodemailer = require("nodemailer");

// Función para enviar correos
function sendEmail(to, subject, body) {
    // Crear el transporte con los detalles de la cuenta
    const transporter = nodemailer.createTransport({
        service: "gmail", // o el servicio que uses
        auth: {
            user: process.env.EMAIL_USER, // tu correo
            pass: process.env.EMAIL_PASS, // tu contraseña
        },
    });

    // Opciones del correo
    const mailOptions = {
        from: process.env.EMAIL_USER, // El correo desde el cual se enviará
        to: to, // Correo de destino
        subject: subject, // Asunto del correo
        text: body, // Cuerpo del mensaje en texto plano
        html: `<h1>Encabezado en HTML</h1><p>${body}</p>` // Cuerpo del mensaje en HTML
    };

    // Enviar el correo
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error al enviar el correo: ", error);
        } else {
            console.log("Correo enviado: ", info.response);
        }
    });
}

module.exports = { sendEmail };
