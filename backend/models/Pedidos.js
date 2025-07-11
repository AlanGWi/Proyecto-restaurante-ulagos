const mongoose = require('mongoose');

const PedidoGrupoSchema = new mongoose.Schema({
  items: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductoBase'
    },
    cantidad: { type: Number, default: 1 },
    servido: { type: Boolean, default: false },
    preparado: { type: Boolean, default: false },
    retirado: { type: Boolean, default: false },
    
  }],

  ServidoPor: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Usuarios'
},

  total: Number,

    envio: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Envio'
},
    

    
  esEnvio: { type: Boolean, default: false },
   mesa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mesa',
    //required: true
  },
  //pagado: { type: Boolean, default: false },

  confirmado: { type: Boolean, default: false },
  inhabilitar: { type: Boolean, default: false },
  pendientePago: { type: Boolean, default: true },
  fecha: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setHours(date.getHours() - 4);
      return date;
    }
  }

  
});


module.exports = mongoose.model('PedidoGrupo', PedidoGrupoSchema);


/*const PedidoSchema = new mongoose.Schema({
  Categoria: { type: String },
  subCategoria:{type: String}, //cocina, cafereria
  cantidad: { type: String },
  ServidoPor: { type: String,default:"nadie" },
  mesa: { type: String },
  nombre: { type: String },
  precio: { type: String },
  eliminado: { type: Boolean, default: false },
  servido: { type: Boolean, default: false },
  preparado: { type: Boolean, default: false },
  confirmado: { type: Boolean, default: false },
  retirado: { type: Boolean, default: false },
  pagado: { type: Boolean, default: false },
  fecha: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setHours(date.getHours() - 4);
      return date;
    }
  },
});


module.exports = mongoose.model('Pedidos', PedidoSchema);

*/

