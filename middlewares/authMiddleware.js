const jwt = require('jsonwebtoken');
const { secretKey } = require('../config/auth');
// authMiddleware.js
const authMiddleware = {
  authenticate: (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Acceso denegado. Token no proporcionado.' 
      });
    }

    try {
      const decoded = jwt.verify(token, secretKey);
      
      // Estructura mínima garantizada
      req.user = {
        id: decoded.id,
        rol: decoded.rol || 'usuario' // Valor por defecto
      };
      
      next();
    } catch (error) {
      console.error('Error en autenticación:', error);
      res.status(401).json({ 
        success: false,
        error: 'Token inválido o expirado' 
      });
    }
  },

  isSuperAdmin: (req, res, next) => {
    try {
      // Verificación robusta
      if (!req.user) {
        return res.status(403).json({
          success: false,
          error: 'Usuario no autenticado' 
        });
      }

      // Versión simplificada (sin verificación de permisos)
      if (['admin', 'superadministrador'].includes(req.user.rol)) {
        return next();
      }

      res.status(403).json({
        success: false,
        error: 'Se requieren privilegios de administrador' 
      });
    } catch (error) {
      console.error('Error en isSuperAdmin:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno al verificar permisos' 
      });
    }
  }
};
module.exports = authMiddleware;