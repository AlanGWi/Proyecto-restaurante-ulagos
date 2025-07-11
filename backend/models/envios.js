const mongoose = require('mongoose');
const shortid = require('shortid'); // librería para generar códigos cortos

const EnvioSchema = new mongoose.Schema({
  pedido: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PedidoGrupo',
    required: true
  },
  enviadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuarios',
    
  },
  telefono:{
    type: String
  },
  comuna:{
    type: String
  },
  codigoEnvio: {
    type: String,
    unique: true,
    default: shortid.generate  // genera un código único automáticamente
  },
  estadoEnvio: {
    type: String,
    enum: ['pendiente', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  fechaEnvio: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setHours(date.getHours() - 4);
      return date;
    }
  },
  fechaEntrega: Date,
  direccionEntrega: String,
  
});

module.exports = mongoose.model('Envio', EnvioSchema);