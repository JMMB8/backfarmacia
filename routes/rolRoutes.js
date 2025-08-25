const express = require('express');
const router = express.Router();
const RolController = require('../controllers/RolController');
const authMiddleware = require('../middlewares/authMiddleware');

// Crear un nuevo rol (ruta protegida)
router.post('/roles', authMiddleware.authenticate, RolController.createRol);

// Obtener todos los roles (ruta protegida)
router.get('/roles', authMiddleware.authenticate, RolController.getRoles);

// Obtener un rol por ID (ruta protegida)
router.get('/roles/:id', authMiddleware.authenticate, RolController.getRolById);

// Actualizar un rol (ruta protegida)
router.put('/roles/:id', authMiddleware.authenticate, RolController.updateRol);

// Eliminar un rol (ruta protegida)
router.delete('/roles/:id', authMiddleware.authenticate, RolController.deleteRol);

module.exports = router;