const mongoose = require("mongoose");

const comentarioSchema = new mongoose.Schema({
    
  usuario: { type: String, default: 'Anónimo' },
  comentario: { type: String, required: true },
  estrellas: { type: Number, min: 1, max: 5, required: true },
  fecha: { type: Date, default: Date.now },
  token: { type: String } // generado al crear
});


module.exports = mongoose.model('Comentario', comentarioSchema);