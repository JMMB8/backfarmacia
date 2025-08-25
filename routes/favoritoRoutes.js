const express = require('express');
const router = express.Router();
const FavoritoController = require('../controllers/FavoritoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Agregar un producto a favoritos (ruta protegida)
router.post('/favoritos', authMiddleware.authenticate, FavoritoController.addFavorite);

// Obtener los favoritos de un usuario (ruta protegida)
router.get('/favoritos', authMiddleware.authenticate, FavoritoController.getFavorites);

// Eliminar un producto de favoritos (ruta protegida)
router.delete('/favoritos/:producto_id', authMiddleware.authenticate, FavoritoController.removeFavorite);

module.exports = router;