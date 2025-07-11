const Reserva = require('../models/reserva');
const User = require('../models/User2');  // Modelo de usuario para obtener el nombre
const nodemailer = require('nodemailer');


const sendEmail = (email, subject, message) => {
  const transporter = nodemailer.createTransport({
   host:"smtp.gmail.com",
   port:465,
   secure:true,
    auth: {
      user: 'restaurante.ulagos@gmail.com',
      pass: 'tacy uycg eszo tdjj' 
    }
  });

  const mailOptions = {
    from: 'restaurante.ulagos@gmail.com', 
    to: email,
    subject: subject,
    text: message
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email enviado: ' + info.response);
    }
  });
};


// Crear una reserva
const crearReserva = async (req, res) => {
  try {


        const fechaInicioOriginal = new Date(req.body.fecha_inicio);
    const fechaFinOriginal = new Date(req.body.fecha_fin);

    const fechaInicio = new Date(req.body.fecha_inicio);
    fechaInicio.setHours(fechaInicio.getHours() - 4);

    const fechaFin = new Date(req.body.fecha_fin);
    fechaFin.setHours(fechaFin.getHours() - 4);

    const ahora = new Date();
    ahora.setHours(ahora.getHours() - 4);

    if (fechaInicio < ahora) {
      return res.status(400).json({ error: 'No se puede reservar en una fecha y hora pasada' });
    }

    const reservasSolapadas = await Reserva.countDocuments({
      mesa: req.body.mesa,
      $or: [
        {
          fecha_inicio: { $lt: fechaFin },
          fecha_fin: { $gt: fechaInicio }
        }
      ]
    });

    if (reservasSolapadas > 0) {
      return res.status(400).json({ error: 'Esa mesa ya está reservada en ese horario' });
    }

    const reserva = new Reserva({
      nombre: req.body.nombre,
      correo: req.body.correo,
      numero_personas: req.body.numero_personas,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      codigo_reserva: generarCodigoUnico(),
      mesa: req.body.mesa
    });


      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular básica para validar correos

        if (!emailRegex.test(reserva.correo)) {
          return res.status(402).send({ error: 'Correo electrónico no válido.' });
        }


    // 📨 Enviar correo al usuario
    const mensaje = `
Hola ${reserva.nombre},

Tu reserva se ha creado exitosamente en nuestro restaurante.

✅ Código de reserva: ${reserva.codigo_reserva}
📅 Fecha: ${fechaInicioOriginal.toLocaleDateString()} 
⏰ Hora: ${fechaInicioOriginal.toLocaleTimeString()} - ${fechaFinOriginal.toLocaleTimeString()}
👥 Nº de personas: ${reserva.numero_personas}
🪑 Mesa: ${reserva.mesa}

Gracias por elegirnos.
No responder
`;



   try {
      sendEmail(reserva.correo, 'Confirmación de Reserva - Restaurante ULagos', mensaje);
    } catch (emailError) {
      console.error("Error al enviar el correo:", emailError);
      return res.status(400).json({
        error: 'Reserva creada, pero no se pudo enviar el correo de confirmación. Verifica que el correo electrónico sea válido.'
      });
    }


     // Guardar la reserva solo si el correo fue enviado
    const nuevaReserva = await reserva.save();

    res.status(201).json(nuevaReserva);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la reserva, revise el correo' });
  }
};

// Obtener todas las reservas
const obtenerReservas = async (req, res) => {
  try {
    const reservas = await Reserva.find().populate('mesa');;
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las reservas' });
  }
};

// Obtener una reserva por ID
const obtenerReservaPorId = async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id);
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });

    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la reserva' });
  }
};

// Actualizar una reserva (solo si el rol es ADMIN o TRABAJADOR)
const actualizarReserva = async (req, res) => {
  try {
    const actualizada = await Reserva.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!actualizada) return res.status(404).json({ error: 'Reserva no encontrada' });

    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la reserva' });
  }
};

// Eliminar una reserva (solo si el rol es ADMIN)
const eliminarReserva = async (req, res) => {
  try {
    const eliminada = await Reserva.findByIdAndDelete(req.params.id);
    if (!eliminada) return res.status(404).json({ error: 'Reserva no encontrada' });

    res.json({ mensaje: 'Reserva eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la reserva' });
  }
};


const buscarReservas= async (req, res) =>{
  try {
    const reserva = await Reserva.findOne({ codigo_reserva: req.params.codigo });
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar la reserva' });
  }
}

// Utilidad para generar un código único
function generarCodigoUnico() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}



module.exports = {
  crearReserva,
  obtenerReservas,
  obtenerReservaPorId,
  actualizarReserva,
  eliminarReserva,
  buscarReservas
};