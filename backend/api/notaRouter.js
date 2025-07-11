const express = require('express');

const NotaController = require('../controllers/notaController');

const router = express.Router();

router.post('/', NotaController.crearNota);
router.get('/', NotaController.obtenerNotas);
router.get('/porPedido', NotaController.obtenerNotasPorPedido);  
router.put('/:id', NotaController.editarNota);
router.delete('/:id', NotaController.eliminarNota);


module.exports = router;