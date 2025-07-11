// controllers/nota.js

import Nota from '../models/notas.js';

export const crearNota = async (req, res) => {
  try {
    const nota = new Nota(req.body);
    await nota.save();
    res.status(201).json(nota);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const obtenerNotas = async (req, res) => {
  try {
    const notas = await Nota.find().sort({ fecha: -1 });
    res.json(notas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const editarNota = async (req, res) => {
  try {
    const nota = await Nota.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(nota);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const eliminarNota = async (req, res) => {
  try {
    await Nota.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Nota eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const obtenerNotasPorPedido = async (req, res) => {
  const pedidoId = req.query.pedidoId;

  try {
    const notas = await Nota.find({ pedidoId });

    if (notas.length === 0) {
      // No hay notas, respondo con 204 No Content
      return res.status(204).send();
    }

    // Si hay notas, las envío
    res.json(notas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};