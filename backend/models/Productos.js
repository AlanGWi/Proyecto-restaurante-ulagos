const mongoose = require("mongoose");
const { object } = require("underscore");
const Schema = mongoose.Schema;

const ProductoSchema = new Schema({
  _id:{type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()},
  Categoria: { type: String },
  nombre: { type: String },
  precio: { type: Number },
  precio_iva: { type: Number },
  cantidad_max_producto:{type:Number},
  descripcion: { type: String },
  imagen_nombre: { type: String }, // Nuevo campo para el nombre y la extensión de la imagen
  Habilitado: {type: Boolean, default: true}
  
});

ProductoSchema.pre('save', function(next) {
  if (this.isModified('precio') || this.precio_iva === undefined) {
    this.precio_iva = this.precio * 1.19;
  }
  next();
});

module.exports = Menu = mongoose.model("Menus", MenuSchema);