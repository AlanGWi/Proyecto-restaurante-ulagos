const mongoose = require("mongoose");
const MesaSchema = new mongoose.Schema({
    numero: { type: Number, required: true, unique: true },
    capacidad: { type: Number, required: true },
    zona: { 
      type: String, 
      enum: ['interior', 'terraza', 'vip'], 
      default: 'interior' 
    },
    activa: { type: Boolean, default: true }
    // O puedes opcionalmente incluir una reserva actual si es 1 a 1
    // reservaActual: { type: mongoose.Schema.Types.ObjectId, ref: 'Reserva' }
  });
  
  module.exports = mongoose.model('Mesa', MesaSchema);