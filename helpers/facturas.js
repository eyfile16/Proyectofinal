// Valida que los datos básicos requeridos existan
const validarDatosFactura = (datos) => {
  const { usuario, productos, metodoPago, total } = datos;

  if (!usuario || !Array.isArray(productos) || productos.length === 0 || !metodoPago || !total) {
    return false;
  }

  return true;
};

module.exports = {
  validarDatosFactura,
};
