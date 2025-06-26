const MetodoPago = require('../models/MetodoPago');

// Obtener todos los métodos de pago (solo admin)
exports.getTodos = async (req, res) => {
  try {
    const metodos = await MetodoPago.find()
      .populate('usuario', 'nombre email')
      .sort({ fechaCreacion: -1 });
    res.json(metodos);
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// Obtener métodos de pago de un usuario específico
exports.obtenerPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const metodos = await MetodoPago.find({ usuario: usuarioId })
      .sort({ fechaCreacion: -1 });
    res.json(metodos);
  } catch (error) {
    console.error('Error al obtener métodos de pago del usuario:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// Crear o actualizar método de pago
exports.crear = async (req, res) => {
  try {
    console.log('Datos recibidos en el backend:', req.body);

    const {
      tipoDocumento,
      numeroDocumento,
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      barrio,
      departamento,
      ciudad,
      codigoPostal,
      telefonoContacto,
      metodoPagoPreferido
    } = req.body;

    console.log('Ciudad extraída:', ciudad);
    console.log('Departamento extraído:', departamento);

    // Verificar si ya existe un método de pago para este usuario
    let metodoPago = await MetodoPago.findOne({ usuario: req.usuario._id });

    if (metodoPago) {
      // Actualizar método de pago existente
      metodoPago.tipoDocumento = tipoDocumento;
      metodoPago.numeroDocumento = numeroDocumento;
      metodoPago.nombre = nombre;
      metodoPago.apellido = apellido;
      metodoPago.email = email;
      metodoPago.telefono = telefono;
      metodoPago.direccion = direccion;
      metodoPago.barrio = barrio;
      metodoPago.departamento = departamento;
      metodoPago.ciudad = ciudad;
      metodoPago.codigoPostal = codigoPostal;
      metodoPago.telefonoContacto = telefonoContacto;
      metodoPago.metodoPagoPreferido = metodoPagoPreferido || 'paypal';

      await metodoPago.save();
      console.log('Método de pago actualizado:', metodoPago);
    } else {
      // Crear nuevo método de pago
      metodoPago = new MetodoPago({
        usuario: req.usuario._id,
        tipoDocumento,
        numeroDocumento,
        nombre,
        apellido,
        email,
        telefono,
        direccion,
        barrio,
        departamento,
        ciudad,
        codigoPostal,
        telefonoContacto,
        metodoPagoPreferido: metodoPagoPreferido || 'paypal'
      });

      await metodoPago.save();
      console.log('Nuevo método de pago creado:', metodoPago);
    }

    res.json({
      mensaje: 'Método de pago guardado correctamente',
      metodoPago
    });
  } catch (error) {
    console.error('Error al crear/actualizar método de pago:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// Obtener método de pago del usuario autenticado
exports.obtenerMiMetodo = async (req, res) => {
  try {
    const metodoPago = await MetodoPago.findOne({ usuario: req.usuario._id });

    if (!metodoPago) {
      return res.status(404).json({ mensaje: 'No se encontró método de pago' });
    }

    res.json(metodoPago);
  } catch (error) {
    console.error('Error al obtener método de pago:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// Eliminar método de pago
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const metodoPago = await MetodoPago.findById(id);

    if (!metodoPago) {
      return res.status(404).json({ mensaje: 'Método de pago no encontrado' });
    }

    // Verificar que el usuario solo pueda eliminar su propio método de pago
    if (metodoPago.usuario.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No autorizado' });
    }

    await MetodoPago.findByIdAndDelete(id);

    res.json({ mensaje: 'Método de pago eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar método de pago:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};
