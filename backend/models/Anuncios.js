import mongoose from 'mongoose';

const anuncioSchema = new mongoose.Schema({
  mensaje: { type: String, required: true },
  fecha_inicio: { type: Date, required: true },
  fecha_fin: { type: Date, required: true },
  visible: { type: Boolean, default: true },
  imagen: { type: String } // URL o nombre del archivo
});

export default mongoose.model('Anuncio', anuncioSchema);