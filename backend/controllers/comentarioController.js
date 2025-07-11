import Comentario from '../models/Comentario.js';

export const crearComentario = async (req, res) => {
  try {
    const { usuario, comentario, estrellas, token } = req.body;
    console.log(token)

      if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Validación de comentario: no vacío ni solo espacios
    if (!comentario || comentario.trim() === '') {
      return res.status(400).json({ error: 'El comentario no puede estar vacío o solo contener espacios.' });
    }

    // Validación de estrellas: número entre 1 y 5
    if (
      estrellas === undefined || estrellas === null ||
      isNaN(estrellas) || estrellas < 1 || estrellas > 5
    ) {
      return res.status(400).json({ error: 'Las estrellas deben ser un número entre 1 y 5.' });
    }

    const nuevoComentario = new Comentario({
      usuario,
      comentario: comentario.trim(),
      estrellas,
      token
      
    });

    await nuevoComentario.save();
    res.status(201).json(nuevoComentario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
export const obtenerComentarios = async (req, res) => {
  try {
    const comentarios = await Comentario.find().sort({ fecha: -1 });
    res.json(comentarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const editarComentario = async (req, res) => {
  const comentario2 = await Comentario.findById(req.params.id);
  if (!comentario2) return res.status(404).json({ error: 'No encontrado' });

  if (comentario2.token !== req.body.token) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const { usuario, comentario, estrellas } = req.body;

  if (!comentario || comentario.trim() === '') {
    return res.status(400).json({ error: 'El comentario no puede estar vacío o solo espacios' });
  }

 if (usuario !== undefined && usuario.trim() === '') {
  comentario2.usuario = 'Anónimo';
} else if (usuario !== undefined) {
  comentario2.usuario = usuario.trim();
}


  comentario2.comentario = comentario.trim();
  comentario2.estrellas = estrellas;

  await comentario2.save();
  res.json(comentario2);
};

export const eliminarComentario = async (req, res) => {
  const comentario = await Comentario.findById(req.params.id);
  if (!comentario) return res.status(404).json({ error: 'No encontrado' });

  if (comentario.token !== req.body.token) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  await comentario.deleteOne();
  res.json({ mensaje: 'Comentario eliminado' });
};