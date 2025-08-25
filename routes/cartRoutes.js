const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');
const authMiddleware = require('../middlewares/authMiddleware');

// Agregar un producto al carrito (ruta protegida)
router.post('/cart', authMiddleware.authenticate, CartController.addToCart);

// Obtener el carrito de un usuario (ruta protegida)
router.get('/cart', authMiddleware.authenticate, CartController.getCart);

// Actualizar la cantidad de un producto en el carrito (ruta protegida)
router.put('/cart/:id', authMiddleware.authenticate, CartController.updateCartItem);

// Eliminar un producto del carrito (ruta protegida)
router.delete('/cart/:id', authMiddleware.authenticate, CartController.removeFromCart);

module.exports = router;