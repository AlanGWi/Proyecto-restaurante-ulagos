const path = require('path');
const mongoose = require("mongoose");
const {ProductoBase } = require('../models/Menu');
const fs = require('fs');

// buscar todas las variables
const findAllMenu = (req, res) => {
  ProductoBase.find((err, menus) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      const menusWithImageUrl = menus.map(menu => ({
        ...menu.toObject(),
        imagenUrl: `http://localhost:3000/api/menu/images/${menu.imagen_nombre}`
      }));
      res.status(200).json(menusWithImageUrl);
    }
  });
};


const addMenu = (req, res) => {
  const {
    Categoria,
    nombre,
    precio,
    tipo,
    lugar_fabricacion,
    descripcion
  } = req.body;

  // Validación de campos vacíos o con solo espacios
  if (
    !Categoria?.trim() ||
    !nombre?.trim() ||
    !precio ||
    !tipo?.trim() ||
    !lugar_fabricacion?.trim() ||
    !descripcion?.trim()
  ) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios y no deben estar vacíos.' });
  }

  if (!req.file || !req.file.originalname) {
    return res.status(400).json({ message: 'La imagen es obligatoria.' });
  }

  try {
    const newMenu = new ProductoBase({
      Categoria: Categoria.trim(),
      nombre: nombre.trim(),
      precio: parseFloat(precio),
      tipo: tipo.trim(),
      lugar_fabricacion: lugar_fabricacion.trim(),
      descripcion: descripcion.trim(),
      imagen_nombre: req.file.originalname,
    });

    // Guarda imagen
    const imagePath = path.join(__dirname, '..', 'uploads', req.file.originalname);
    fs.writeFileSync(imagePath, fs.readFileSync(req.file.path));
    fs.unlinkSync(req.file.path);

    newMenu.save((err, menu) => {
      if (err) {
        return res.status(500).send(err.message);
      } else {
        const menuWithImageUrl = {
          ...menu.toObject(),
          imagenUrl: `http://localhost:3000/api/menu/images/${menu.imagen_nombre}`
        };
        return res.status(201).json(menuWithImageUrl);
      }
    });
  } catch (error) {
    console.error('Error al agregar el menú:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};


const updateMenu = (req, res) => {
  const menuId = req.params.id;
  const updates = { ...req.body };
  const file = req.file;

  console.log(updates.imagenVieja);
  console.log(file);


    // Validar campos obligatorios que no deben estar vacíos o solo con espacios
  const camposRequeridos = ['Categoria', 'nombre', 'precio', 'lugar_fabricacion', 'descripcion'];
  const camposInvalidos = camposRequeridos.filter(campo => {
    const valor = updates[campo];
    return !valor || typeof valor !== 'string' || valor.trim() === '';
  });

  if (camposInvalidos.length > 0) {
    return res.status(400).json({
      message: `Los siguientes campos son inválidos o están vacíos: ${camposInvalidos.join(', ')}`
    });
  }

  // Si se ha enviado una nueva imagen, actualizar el nombre y la extensión
   if (file) {
    updates.imagen_nombre = file.originalname;
  }

  ProductoBase.findById(menuId, (err, menu) => {
    if (err) {
      res.status(500).send(err.message);
    } else if (!menu) {
      res.status(404).send(`No se encontró ningún menú o producto con el ID ${menuId}`);
    } else {
      // Eliminar la imagen antigua del servidor
      if (file) {
        console.log(updates?.imagenVieja)

        const oldImagePath = path.join(__dirname, '..', 'uploads', updates?.imagenVieja);
        fs.unlinkSync(oldImagePath);

        // Guardar la nueva imagen en el servidor
        const newImagePath = path.join(__dirname, '..', 'uploads', file.originalname);
        fs.writeFileSync(newImagePath, fs.readFileSync(file.path));
        fs.unlinkSync(file.path);
        
      }

      // Actualizar el documento en la base de datos
      menu.set(updates);
      menu.save((err, updatedMenu) => {
        if (err) {
          res.status(500).send(err.message);
        } else {
          const menuWithImageUrl = {
            ...updatedMenu.toObject(),
            imagenUrl: `http://localhost:3000/api/menu/images/${updatedMenu.imagen_nombre}`
          };
          res.status(200).json(menuWithImageUrl);
        }
      });
    }
  });
};

const findMenuById = (req, res) => {
  const menuId = req.params.id;
  ProductoBase.findById(menuId, (err, menu) => {
    if (err) {
      res.status(500).send(err.message);
    } else if (!menu) {
      res.status(404).send(`No se encontró ningún menú con el ID ${menuId}`);
    } else {
      const menuWithImageUrl = {
        ...menu.toObject(),
        imagenUrl: `http://localhost:3000/api/menu/images/${menu.imagen_nombre}`
      };
      res.status(200).json(menuWithImageUrl);
    }
  });
};

const deleteMenu = (req, res) => {
  const menuId = req.params.id;

  ProductoBase.findById(menuId, (err, menu) => {
    if (err) {
      res.status(500).send(err.message);
    } else if (!menu) {
      res.status(404).send(`No se encontró ningún menú con el ID ${menuId}`);
    } else {
      // Eliminar la imagen del servidor
      const imagePath = path.join(__dirname, '..', 'uploads', menu.imagen_nombre);
      fs.unlinkSync(imagePath);

      // Eliminar el documento de la base de datos
      menu.delete((err) => {
        if (err) {
          res.status(500).send(err.message);
        } else {
          res.status(200).send(`Se eliminó el menú con el ID ${menuId}`);
        }
      });
    }
  });
};

const cambiarHabilitadoProducto = (req, res) => {
  console.log(req.body)
  const productoId = req.params.id;
  const nuevoEstado = req.body.habilitado;

  // Buscar y actualizar el producto
  ProductoBase.findByIdAndUpdate(productoId, { Habilitado: nuevoEstado }, { new: true })
    .then((producto) => {
      if (!producto) {
        return res.status(404).send("Producto no encontrado");
      }
      res.send(producto);
    })
    .catch((error) => {
      res.status(500).send("Error al actualizar el producto "+error);
    });
};

    module.exports = { addMenu, findAllMenu, updateMenu,findMenuById,cambiarHabilitadoProducto,deleteMenu};