const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'anuncios/' });

const AnuncioController = require("../controllers/anuncioController");
//const authorize = require("../controllers/permisos");

// Obtener todos los anuncios
router.get("/", AnuncioController.obtenerAnuncios);

// Crear anuncio con imagen
router.post("/crear", upload.single('imagen'),  AnuncioController.crearAnuncio);

// Editar anuncio (con nueva imagen opcional)
router.put("/:id", upload.single('imagen'), AnuncioController.editarAnuncio);

// Eliminar anuncio
router.delete("/:id", AnuncioController.eliminarAnuncio);

// Servir imágenes
router.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(filename, { root: './anuncios' });
});

module.exports = router;