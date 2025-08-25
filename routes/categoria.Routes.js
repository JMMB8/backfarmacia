const express = require("express");
const router = express.Router();
const CategoriaController = require("../controllers/CategoriaController");

// Rutas para categorías
router.post("/categorias", CategoriaController.createCategoria);
router.get("/categorias", CategoriaController.getCategorias);
router.get("/categorias/:id", CategoriaController.getCategoriaById);
router.put("/categorias/:id", CategoriaController.updateCategoria);
router.delete("/categorias/:id", CategoriaController.deleteCategoria);

module.exports = router;
