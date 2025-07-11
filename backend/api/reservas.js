const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservas');
var authorize = require('../controllers/permisos')


// Crear una reserva (solo si el usuario está autenticado)
router.post('/reservas', authorize(['ADMIN', 'TRABAJADOR', 'CLIENTE']),reservaController.crearReserva);

// Obtener todas las reservas (accesible por cualquier usuario autenticado, ADMIN y TRABAJADOR)
router.get('/todaslasreservas', authorize(['ADMIN', 'TRABAJADOR']), reservaController.obtenerReservas);

// Obtener una reserva por ID (solo si el usuario está autenticado y autorizado)
router.get('/reservas/:id',authorize(['ADMIN', 'TRABAJADOR', 'CLIENTE']), reservaController.obtenerReservaPorId);

// Actualizar una reserva (solo si el rol es ADMIN, TRABAJADOR, o el propio CLIENTE)
router.put('/reservas/:id',authorize(['ADMIN', 'TRABAJADOR', 'CLIENTE']), reservaController.actualizarReserva);

// Eliminar una reserva (solo si el rol es ADMIN o TRABAJADOR, o el propio CLIENTE)
router.delete('/reservas/:id',authorize(['ADMIN', 'TRABAJADOR', 'CLIENTE']), reservaController.eliminarReserva);


router.get('/buscar-codigo/:codigo', authorize(['ADMIN', 'TRABAJADOR', 'CLIENTE']),reservaController.buscarReservas);

module.exports = router;