import Anuncio from '../models/Anuncios.js';
import fs from 'fs';

export const crearAnuncio = async (req, res) => {
  try {
    const { mensaje, fecha_inicio, fecha_fin, visible } = req.body;
    const imagen = req.file ? req.file.filename : null;

      // Validar mensaje vacío o solo espacios
    if (!mensaje || mensaje.trim() === '') {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío o solo contener espacios' });
    }


      // Validación de fechas
    if (fecha_inicio && fecha_fin) {
      const inicio = new Date(fecha_inicio);
      const fin = new Date(fecha_fin);

      if (inicio > fin) {
        return res.status(400).json({ error: 'La fecha de inicio no puede ser mayor que la fecha de fin' });
      }
    }

    const nuevo = new Anuncio({
      mensaje,
      fecha_inicio,
      fecha_fin,
      visible,
      imagen
    });

    await nuevo.save();
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const editarAnuncio = async (req, res) => {
  try {
    const { mensaje, fecha_inicio, fecha_fin, visible } = req.body;
    const anuncio = await Anuncio.findById(req.params.id);
    if (!anuncio) return res.status(404).json({ error: 'No encontrado' });

       if (fecha_inicio && fecha_fin) {
      const inicio = new Date(fecha_inicio);
      const fin = new Date(fecha_fin);

      if (inicio > fin) {
        return res.status(400).json({ error: 'La fecha de inicio no puede ser mayor que la fecha de fin' });
      }
    }


    if (!mensaje || mensaje.trim() === '') {
  return res.status(400).json({ error: 'El mensaje no puede estar vacío ni ser solo espacios.' });
}
    

    if (req.file && anuncio.imagen) {
      fs.unlinkSync(`anuncios/${anuncio.imagen}`); // borra imagen anterior
    }

 
anuncio.mensaje = mensaje.trim();
    anuncio.fecha_inicio = fecha_inicio;
    anuncio.fecha_fin = fecha_fin;
    anuncio.visible = visible;
    if (req.file) anuncio.imagen = req.file.filename;

    await anuncio.save();
    res.json(anuncio);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
  
};

export const obtenerAnuncios = async (req, res) => {
  try {
    const anuncios = await Anuncio.find().sort({ fecha_inicio: -1 });
    res.json(anuncios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const eliminarAnuncio = async (req, res) => {
  try {
    await Anuncio.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Anuncio eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
