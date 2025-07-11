
const Pago = require('../models/pago');
const  PedidoGrupo  = require("../models/Pedidos");
const crearPedido = (req, res) => {
  const { items, total, mesa, esEnvio } = req.body;

  const nuevoPedido = new PedidoGrupo({
    items,
    total,
    mesa,
    esEnvio

  });

  nuevoPedido
    .save()
    .then((pedido) => res.status(201).json(pedido))
    .catch((error) => res.status(400).json(error));
};

// Obtener todos los pedidos
const obtenerPedidos = (req, res) => {
  PedidoGrupo.find()
    .populate("items.producto") // para obtener datos del producto o menú
    .then((pedidos) => res.status(200).json(pedidos))
    .catch((error) => res.status(404).json(error));
};

// Actualizar estados de un ítem específico dentro del pedido
const actualizarPedido = async (req, res) => {
  const { pedidoId, itemId, cantidad, preparado, retirado, servido } = req.body;

  try {
    // Actualizar el ítem
    await PedidoGrupo.updateOne(
      { _id: pedidoId, "items._id": itemId },
      {
        $set: {
          "items.$.cantidad": cantidad,
          "items.$.preparado": preparado,
          "items.$.retirado": retirado,
          "items.$.servido": servido,
          
        }
      }
    );

    // Obtener el pedido actualizado para recalcular el total
    const pedido = await PedidoGrupo.findById(pedidoId).populate("items.producto");

    let nuevoTotal = 0;
    pedido.items.forEach(item => {
      if (!item.eliminado && item.producto && item.producto.precio) {
        nuevoTotal += item.cantidad * item.producto.precio;
      }
    });

    // Actualizar el total
    pedido.total = nuevoTotal;
    await pedido.save();

    res.status(200).json({ message: "Ítem y total actualizados" });
  } catch (error) {
    res.status(500).json({ error: "Error actualizando el ítem y total", detalle: error });
  }
};

// Marcar un pedido completo como eliminado (para estadísticas)
const eliminarPedido = (req, res) => {
  const pedidoId = req.params.id;
  PedidoGrupo.findByIdAndUpdate(pedidoId, { eliminado: true }, { new: true })
    .then((pedido) => {
      if (!pedido) {
        return res.status(404).send("Pedido no encontrado");
      }
      res.status(204).send();
    })
    .catch((error) => {
      res.status(500).send("Error al eliminar el pedido: " + error);
    });
};

// Eliminar el pedido de la base de datos (borrado real)
const eliminarPedidoId = (req, res) => {
  const pedidoId = req.params.id;
  PedidoGrupo.findByIdAndDelete(pedidoId)
    .then((pedido) => {
      if (!pedido) {
        return res.status(404).send("Pedido no encontrado");
      }
      res.status(204).send();
    })
    .catch((error) => {
      res.status(500).send("Error al eliminar el pedido: " + error);
    });
};


const eliminarProductoDelPedido = (req, res) => {
  const { pedidoId, productoId } = req.params;

  PedidoGrupo.updateOne(
    { _id: pedidoId },
    { $pull: { items: { "producto": productoId } } }
  )
    .then(() => res.status(200).json({ message: "Producto eliminado del pedido" }))
    .catch((error) => res.status(500).json({ error }));
};


const inhabilitarPedido = (req, res) => {
  const { pedidoId } = req.params;

  PedidoGrupo.updateOne({ _id: pedidoId }, { $set: { inhabilitar: true } })
    .then(() => res.status(200).json({ message: "Pedido inhabilitado" }))
    .catch((error) => res.status(500).json({ error }));
};

const confirmarPedido = (req, res) => {
  const { pedidoId } = req.params;

  PedidoGrupo.updateOne({ _id: pedidoId }, { $set: { confirmado: true } })
    .then(() => res.status(200).json({ message: "Pedido confirmado correctamente" }))
    .catch((error) => res.status(500).json({ error }));
};


const obtenerPedidosNoPagados = async (req, res) => {
  try {
    // 1. Buscar todos los pagos existentes (opcionalmente solo los completados o todos)
    const pagos = await Pago.find({}); // Puedes filtrar por estado si lo deseas

    // 2. Extraer todos los IDs de pedidos que ya fueron pagados
    const pedidosPagadosIds = new Set(
      pagos.flatMap(pago => pago.pedidos.map(id => id.toString()))
    );

    // 3. Obtener pedidos que NO estén en la lista de pedidos pagados
    const pedidosNoPagados = await PedidoGrupo.find({
      
      _id: { $nin: Array.from(pedidosPagadosIds) }
    }).populate("items.producto")
      .populate("mesa");
     
    

    res.status(200).json(pedidosNoPagados);
  } catch (error) {
    console.error('Error al obtener pedidos no pagados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const actualizarMesaPedido = async (req, res) => {
  const { pedidoId } = req.params;
  const { nuevaMesa } = req.body;

  try {
    const pedido = await PedidoGrupo.findByIdAndUpdate(
      pedidoId,
      { $set: { mesa: nuevaMesa } },
      { new: true }
    );

    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    res.status(200).json({ message: "Mesa actualizada correctamente", pedido });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la mesa", detalle: error });
  }
};


const actualizarServidoPor = async (req, res) => {
  const { pedidoId } = req.params;
  const { userId } = req.body;
  console.log(req.body)

  try {
    const pedidoActualizado = await PedidoGrupo.findByIdAndUpdate(
      pedidoId,
      { $set: { ServidoPor: userId } },
      { new: true }
    ).populate('ServidoPor');

    if (!pedidoActualizado) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.status(200).json({ message: 'ServidoPor actualizado', pedido: pedidoActualizado });
  } catch (error) {
    console.error('Error al actualizar ServidoPor:', error);
    res.status(500).json({ error: 'Error al actualizar ServidoPor', detalle: error });
  }
};


const obtenerPedidosVisibles = async (req, res) => {
  try {
    // Obtener pagos pendientes (en estado pendiente)
    const pagosPendientes = await Pago.find({ estado: 'pendiente' }).populate('pedidos');

    // Extraer pedidos que sean de envío y estén pendientes de pago
    const pedidosPendientesEnvio = pagosPendientes.flatMap(pago =>
      pago.pedidos
        .filter(pedido => pedido.esEnvio && pedido.pendientePago === true)
        .map(p => mongoose.Types.ObjectId(p._id))
    );

    // Buscar pedidos que:
    // - No estén inhabilitados
    // - Y que NO sean pedidos de envío pendientes de pago
    const pedidosVisibles = await PedidoGrupo.find({
      inhabilitar: false,
      _id: { $nin: pedidosPendientesEnvio }
    })
    .populate('envio')
    .populate('items.producto')
    .populate('mesa');

    res.json(pedidosVisibles);
  } catch (error) {
    console.error('Error al obtener pedidos visibles:', error);
    res.status(500).json({ error: 'Error al obtener pedidos visibles' });
  }
};

module.exports = {

  obtenerPedidosNoPagados,
actualizarServidoPor,
  confirmarPedido,
  inhabilitarPedido,
  crearPedido,
  obtenerPedidos,
  actualizarPedido,
  eliminarPedido,
  eliminarPedidoId,
  eliminarProductoDelPedido,
  actualizarMesaPedido,
  obtenerPedidosVisibles
};