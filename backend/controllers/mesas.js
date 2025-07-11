// controllers/mesas.js
const Mesa = require('../models/mesa');

// Crear una nueva mesa
exports.crearMesa = async (req, res) => {
  try {
    const mesa = new Mesa(req.body);
    const nuevaMesa = await mesa.save();
    res.status(201).json(nuevaMesa);
  } catch (error) {
    res.status(400).json({ message: 'error al crear mesas' });
  }
};

// Obtener todas las mesas
exports.obtenerMesas = async (req, res) => {
  try {
    const mesas = await Mesa.find();
    res.status(200).json(mesas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener una mesa por ID
exports.obtenerMesaPorId = async (req, res) => {
  try {
    const mesa = await Mesa.findById(req.params.id);
    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.status(200).json(mesa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una mesa
exports.actualizarMesa = async (req, res) => {
  try {
    const mesa = await Mesa.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.status(200).json(mesa);
  } catch (error) {
    res.status(400).json({ message: 'error la mesa ya existe'});
  }
};

// Eliminar una mesa
exports.eliminarMesa = async (req, res) => {
  try {
    const mesa = await Mesa.findByIdAndDelete(req.params.id);
    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.status(200).json({ message: 'Mesa eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.mesasporlote =async (req, res) => {
try {
    const numeros = req.body.map(m => m.numero);

    // Buscar si ya existen mesas con esos números
    const existentes = await Mesa.find({ numero: { $in: numeros } });

    if (existentes.length > 0) {
      const conflictivos = existentes.map(m => m.numero);
      return res.status(400).json({ 
        error: `Ya existen mesas con los siguientes números: ${conflictivos.join(', ')}` 
      });
    }

    await Mesa.insertMany(req.body);
    res.status(201).json({ mensaje: 'Mesas creadas correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear las mesas' });
  }
}