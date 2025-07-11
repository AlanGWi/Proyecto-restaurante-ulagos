const Envio = require('../models/envios');
const pedidos = require('../models/Pedidos')
const  PedidoGrupo  = require("../models/Pedidos");

// Obtener estado de envío por código
exports.obtenerEstadoEnvio = async (req, res) => {
  try {
    const { codigoEnvio } = req.params;
    const envio = await Envio.findOne({ codigoEnvio }).populate('pedido').populate('enviadoPor');

    if (!envio) return res.status(404).json({ message: 'Código de envío no encontrado.' });

    res.json({
      codigoEnvio: envio.codigoEnvio,
      estadoEnvio: envio.estadoEnvio,
      fechaEnvio: envio.fechaEnvio,
      fechaEntrega: envio.fechaEntrega,
      pedido: envio.pedido,
      direccion: envio.direccionEntrega,
      enviadoPor: envio.enviadoPor
     
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al buscar el envío.' });
  }
};

// Cancelar envío por código
exports.cancelarEnvio = async (req, res) => {
  try {
    const { codigoEnvio } = req.params;

    const envio = await Envio.findOne({ codigoEnvio });

    if (!envio) return res.status(404).json({ message: 'Código de envío no encontrado.' });

    if (envio.estadoEnvio === 'entregado') {
      return res.status(400).json({ message: 'No se puede cancelar un envío ya entregado.' });
    }

    envio.estadoEnvio = 'cancelado';
    await envio.save();

    res.json({ message: 'Envío cancelado correctamente.', codigoEnvio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al cancelar el envío.' });
  }
};

exports.crearEnvio = async (req, res) => {
  try {
    const { pedidoId, direccionEntrega, telefono, comuna } = req.body;
    console.log(req.body);

    const pedido = await pedidos.findById(pedidoId);
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // ✅ Validar campos vacíos o solo espacios
    if (!direccionEntrega || direccionEntrega.trim() === '') {
      return res.status(400).json({ message: 'La dirección no puede estar vacía o solo espacios' });
    }
    if (!comuna || comuna.trim() === '') {
      return res.status(400).json({ message: 'La comuna no puede estar vacía o solo espacios' });
    }

    const nuevoEnvio = new Envio({
      pedido: pedidoId,
      direccionEntrega: direccionEntrega.trim(),
      comuna: comuna.trim(),
      telefono
    });

    await nuevoEnvio.save();

    await PedidoGrupo.findByIdAndUpdate(pedidoId, {
      envio: nuevoEnvio._id
    });

    res.status(201).json({
      message: 'Envío creado correctamente',
      codigoEnvio: nuevoEnvio.codigoEnvio,
      envio: nuevoEnvio
    });
  } catch (error) {
    console.error('Error al crear envío:', error);
    res.status(500).json({ message: 'Error al crear el envío' });
  }
};



exports.actualizarEstadoEnvio = async (req, res) => {
  try {
    const { envioId } = req.params;
    const { nuevoEstado, enviadoPorId } = req.body;
    console.log (req.body)

    if (!['pendiente', 'enviado', 'entregado', 'cancelado'].includes(nuevoEstado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const envio = await Envio.findById(envioId);

    if (!envio) {
      return res.status(404).json({ message: 'Envío no encontrado' });
    }

    // Actualizar estado
    envio.estadoEnvio = nuevoEstado;

    // Si está marcando como enviado, guardar quién lo hizo y fecha
    if (nuevoEstado === 'enviado') {
      envio.enviadoPor = enviadoPorId;
      envio.fechaEnvio = new Date();
    }

    // Si se marca como entregado, registrar fecha de entrega
    if (nuevoEstado === 'entregado') {
      envio.fechaEntrega = new Date();
    }

    await envio.save();

    res.json({ message: `Estado actualizado a '${nuevoEstado}'`, envio });
  } catch (error) {
    console.error('Error al actualizar estado de envío:', error);
    res.status(500).json({ message: 'Error al actualizar estado' });
  }
};


