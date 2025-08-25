const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/ProductoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Crear un nuevo producto (ruta protegida)
router.post('/productos', authMiddleware.authenticate, ProductoController.createProducto);


// Obtener todos los productos
router.get('/productos', ProductoController.getProductos);

// Búsqueda de productos
router.get('/productos/buscar', ProductoController.searchProductos); // Nueva ruta de búsqueda



// Obtener un producto por ID
router.get('/productos/:id', ProductoController.getProductoById);

// Actualizar un producto (ruta protegida)
router.put('/productos/:id', authMiddleware.authenticate, ProductoController.updateProducto);

// Eliminar un producto (ruta protegida)
router.delete('/productos/:id', authMiddleware.authenticate, ProductoController.deleteProducto);




module.exports = router;