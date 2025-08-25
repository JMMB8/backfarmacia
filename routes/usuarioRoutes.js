const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const AuthController = require('../controllers/AuthController'); // Importa el nuevo controlador
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas existentes
router.post('/register', UsuarioController.register);
router.post('/login', UsuarioController.login);
router.get('/me', authMiddleware.authenticate, UsuarioController.getUser);

// Nuevas rutas para recuperación de contraseña
router.post('/forgot-password', AuthController.requestPasswordReset); // Solicitar correo de recuperación
router.post('/reset-password', AuthController.resetPassword); // Procesar nueva contraseña

// Ruta protegida para admins (ya existente)
router.post('/register/admin', authMiddleware.authenticate, UsuarioController.registerAdmin);

// Obtener todos los usuarios (protegida)
router.get('/users', 
  authMiddleware.authenticate, 
  UsuarioController.getAllUsers
);

// Actualizar rol de usuario (protegida)
router.patch('/users/:id/role', 
  authMiddleware.authenticate, 
  UsuarioController.updateUserRole
);

module.exports = router;