const MenuController = require("../controllers/menu");
const express = require("express");
const router = express.Router();
var authorize = require('../controllers/permisos')

// Obtener todos los menus
router.get("/allMenu", MenuController.findAllMenu);

// Agregar un nuevo menu
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // definir la carpeta donde se guardarán las imágenes subidas
router.post('/addMenu', upload.single('imagen'),authorize(['TRABAJADOR','ADMIN']), MenuController.addMenu); // usar upload.single() para procesar la imagen

// Actualizar un menu existente
router.put('/menus/:id', upload.single('imagen'),authorize(['TRABAJADOR','ADMIN']), MenuController.updateMenu);

router.put('/estado/:id',MenuController.cambiarHabilitadoProducto);


// Obtener un menu por su ID
router.get("/:id", MenuController.findMenuById);

// Eliminar un menu por su ID
router.delete("/:id",authorize(['TRABAJADOR','ADMIN']), MenuController.deleteMenu);

router.get('/images/:filename', (req, res) => {
    const filename = req.params.filename;
    res.sendFile(filename, { root: './uploads' });
  });

module.exports = router;