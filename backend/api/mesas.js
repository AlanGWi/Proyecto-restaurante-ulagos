const express = require('express');
const router = express.Router();
const MesaController = require('../controllers/mesas');
const authorize = require('../controllers/permisos');

// Crear una nueva mesa
router.post('/', authorize(['ADMIN']), MesaController.crearMesa);

// Obtener todas las mesas
router.get('/', MesaController.obtenerMesas);

// Obtener una mesa por ID
router.get('/:id', MesaController.obtenerMesaPorId);

// Actualizar una mesa
router.put('/:id', authorize(['ADMIN']), MesaController.actualizarMesa);

// Eliminar una mesa
router.delete('/:id', authorize(['ADMIN']), MesaController.eliminarMesa);

router.post('/lote', authorize(['ADMIN']), MesaController.mesasporlote);

module.exports = router;