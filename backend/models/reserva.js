const mongoose = require('mongoose');
const { Schema } = mongoose;

const reservaSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  correo: {
    type: String,
    required: true
  },
  numero_personas: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'cancelada', 'completada', 'expirada'],
    default: 'pendiente'
  },
  codigo_reserva: {
    type: String,
    unique: true,
    required: true
  },
  fecha_inicio: {
    type: Date,
    required: true
  },
  fecha_fin: {
    type: Date,
    required: true
  },
  mesa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mesa',
    
  }

  
},{ timestamps: true }); 

module.exports = mongoose.model('Reserva', reservaSchema);