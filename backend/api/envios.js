const express = require('express');
const router = express.Router();
const envioController = require("../controllers/envioController");


router.get('/estado/:codigoEnvio', envioController.obtenerEstadoEnvio);

router.post('/crear', envioController.crearEnvio);


router.put('/cancelar/:codigoEnvio', envioController.cancelarEnvio);


router.put('/actualizar-estado/:envioId', envioController.actualizarEstadoEnvio);

module.exports = router;