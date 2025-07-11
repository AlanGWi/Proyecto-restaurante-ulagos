const mongoose = require('mongoose');

const NotaSchema = new mongoose.Schema({
  mensaje: { type: String, required: true },
  autor: { type: String },
  fecha: { type: Date, default: Date.now },
  pedidoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido', required: true },
});

module.exports = mongoose.model('Nota', NotaSchema);