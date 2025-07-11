const express = require("express");
const { WebpayPlus } = require("transbank-sdk");
const  PedidoGrupo  = require("../models/Pedidos");

const router = express.Router();
WebpayPlus.configureForTesting(); // Modo simulación

// Endpoint para iniciar una transacción
router.post("/crear-transaccion", async (req, res) => {
    const { monto, ordenCompra, sesionId, returnUrl } = req.body;

    try {
        const response = await new WebpayPlus.Transaction().create(
            ordenCompra, 
            sesionId, 
            monto, 
            returnUrl
        );
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para confirmar la transacción
router.post("/confirmar-transaccion", async (req, res) => {
  const { token_ws, pedidoId } = req.body;

  try {
    const response = await new WebpayPlus.Transaction().commit(token_ws);

    // Solo si el pago fue exitoso
    if (response.status === "AUTHORIZED") {
      await PedidoGrupo.findByIdAndUpdate(pedidoId, {
        pendientePago: false
      });
    }

    res.json(response);
  } catch (error) {
    console.error("Error al confirmar transacción:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;