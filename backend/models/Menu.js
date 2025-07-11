const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BaseSchema = new Schema({
  _id:{type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()},
  Categoria: { type: String },
  nombre: { type: String },
  lugar_fabricacion: { type: String },
  precio: { type: Number },
  precio_sin_iva: { type: Number },
  //cantidad_max_producto: {type:Number},
  descripcion: { type: String },
  imagen_nombre: { type: String }, // Nuevo campo para el nombre y la extensión de la imagen
  Habilitado: {type: Boolean, default: true},
  tipo: {type: String}
  
},);

BaseSchema.pre('save', function(next) {
  if (this.isModified('precio') || this.precio_sin_iva === undefined) {
    this.precio_sin_iva = this.precio / 1.19;
  }
  next();
});

const ProductoBase = mongoose.model("ProductoBase", BaseSchema);

module.exports = {ProductoBase };