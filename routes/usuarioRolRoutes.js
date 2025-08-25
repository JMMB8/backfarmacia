const express = require('express');
const router = express.Router();
const UsuarioRolController = require('../controllers/UsuarioRolController');
const authMiddleware = require('../middlewares/authMiddleware');

// Asignar un rol a un usuario (ruta protegida)
router.post('/usuarios-roles', authMiddleware.authenticate, UsuarioRolController.assignRoleToUser);

// Obtener los roles de un usuario (ruta protegida)
router.get('/usuarios/:usuario_id/roles', authMiddleware.authenticate, UsuarioRolController.getRolesByUser);

// Obtener los usuarios de un rol (ruta protegida)
router.get('/roles/:rol_id/usuarios', authMiddleware.authenticate, UsuarioRolController.getUsersByRole);

// Eliminar un rol de un usuario (ruta protegida)
router.delete('/usuarios/:usuario_id/roles/:rol_id', authMiddleware.authenticate, UsuarioRolController.removeRoleFromUser);

module.exports = router;