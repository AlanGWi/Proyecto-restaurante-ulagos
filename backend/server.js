
var express = require('express');
var path = require('path');
var bodyParser = require("body-parser");
var logger = require('morgan');
var cors = require('cors')
const mongoose = require('mongoose');

const Users= require("./api/users");
const User2 = require("./models/User2");
const Reserva = require('./models/reserva'); 
const Pedidos = require("./api/pedidos");
const TransbankRoutes = require("./api/transbank");
const reservas = require("./api/reservas");
const Menu = require("./api/menu");
const mesas = require("./api/mesas");
const pagosRoutes = require('./api/pagos');
const envio = require('./api/envios');
const comentario = require('./api/comentarioapi')
const anuncio = require('./api/anuncioroutes')
const nota = require('./api/notaRouter')
const Envio = require('./models/envios');



var app = express();

mongoose.connect(
  "mongodb://localhost/restaurante",

  { useNewUrlParser: true },
  (err, res) => {
    err && console.log(`ERROR: Connecting to DB ${err}`);

    // crear usuario admin si no existe
    User2.findOne({ Username: "admin" }).then((user) => {
      if (!user) {
        const adminUser = new User2({
          Username: "admin",
          password: "admin",
          role: ["ADMIN"],
          correo:"alan2mitismitis@gmail.com",
          verified:true
        });
        adminUser.save();
        console.log("Usuario admin creado!");
      }
    });

    app.listen(3000, () => console.log("mongodb connected!!"));
  }
);
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//rutas
app.use('/api/users', Users);
app.use('/api/menu', Menu);
app.use('/api/pedidos', Pedidos);
app.use('/api/transbank', TransbankRoutes);
app.use('/api/reserva',reservas);
app.use('/api/mesas', mesas);
app.use('/api/pagos', pagosRoutes);
app.use('/api/envios',envio);
app.use('/api/comentario',comentario);
app.use('/api/anuncios',anuncio)
app.use('/api/nota',nota)

app.use('/anuncios', express.static('anuncios'));




module.exports = app;



const cron = require('node-cron');


//Ejecutar en el minuto 0 de cada hora 01:00, 02:00

cron.schedule('0 2 * * *', async () => {
  try {
    console.log(' Ejecutando limpieza de envíos pendientes antiguos...');
    const ahora = new Date();

    // 1. Poner como EXPIRADAS las reservas pendientes cuyo tiempo ya pasó
    const expiradas = await Reserva.updateMany(
      {
        estado: 'pendiente',
        fecha_fin: { $lt: ahora }
      },
      { $set: { estado: 'expirada' } }
    );

    // 2. Poner como COMPLETADAS las reservas confirmadas cuyo tiempo ya pasó
    const completadas = await Reserva.updateMany(
      {
        estado: 'confirmada',
        fecha_fin: { $lt: ahora }
      },
      { $set: { estado: 'completada' } }
    );

    if (expiradas.modifiedCount > 0 || completadas.modifiedCount > 0) {
      console.log(` Actualización automática:
      - ${expiradas.modifiedCount} reservas expiradas
      - ${completadas.modifiedCount} reservas completadas`);
    }
  } catch (error) {
    console.error('Error al actualizar estados de reservas automáticamente:', error);
  }
});



cron.schedule('0 2 * * *', async () => {
  try {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 3);

    const resultado = await Envio.deleteMany({
      estadoEnvio: { $in: ['pendiente', 'enviado'] },
      fechaEnvio: { $lt: fechaLimite }
    });

    if (resultado.deletedCount > 0) {
      console.log(`Limpieza automática: ${resultado.deletedCount} envíos pendientes eliminados.`);
    } else {
      console.log('Limpieza automática: No hay envíos pendientes para eliminar.');
    }
  } catch (error) {
    console.error(' Error al limpiar envíos pendientes:', error);
  }
});