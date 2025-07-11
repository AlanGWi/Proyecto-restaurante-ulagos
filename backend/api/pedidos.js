const PedidoController = require("../controllers/pedidos");
const PedidoController2 = require("../controllers/pedidos");
const express = require("express");
const router = express.Router();
var authorize = require('../controllers/permisos')

const { obtenerPedidosNoPagados } = require('../controllers/pedidos');


router.get('/visibles', PedidoController.obtenerPedidosVisibles);

router.get('/sin-pago', obtenerPedidosNoPagados);

router.put('/actualizar-mesa/:pedidoId', PedidoController.actualizarMesaPedido);

// Ruta para crear un nuevo pedido
router.post("/pedidos", PedidoController.crearPedido);

// Ruta para obtener todos los pedidos
router.get("/pedidos", PedidoController.obtenerPedidos);

// Ruta para actualizar un pedido
router.put("/pedidos/", PedidoController.actualizarPedido);


router.put('/servido-por/:pedidoId', PedidoController.actualizarServidoPor);

router.put("/inhabilitar/:pedidoId", authorize(['TRABAJADOR','ADMIN']), PedidoController.inhabilitarPedido);

//ruta para eliminar un item de pedido
router.put("/pedidos/:pedidoId/:productoId", authorize(['TRABAJADOR','ADMIN']), PedidoController.eliminarProductoDelPedido);

router.put("/confirmar/:pedidoId", authorize(['TRABAJADOR','ADMIN']), PedidoController.confirmarPedido);

// Ruta para eliminar un pedido
router.delete("/pedidos/:id",authorize(['TRABAJADOR','ADMIN']), PedidoController.eliminarPedido);
router.delete("/:id",authorize(['TRABAJADOR','ADMIN']), PedidoController.eliminarPedidoId);


module.exports = router;