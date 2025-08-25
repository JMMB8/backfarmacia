// middlewares/errorHandler.js
function errorHandler(err, req, res, next) {
    console.error('Error:', err.stack);
    
    // Errores de validación
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Error de validación',
        details: err.errors
      });
    }
    
    // Errores JWT
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    // Errores de base de datos
    if (err.code === '23505') { // Violación de unique constraint
      return res.status(400).json({ 
        error: 'Error de duplicación',
        detail: err.detail
      });
    }
    
    // Error genérico
    res.status(err.status || 500).json({
      error: err.message || 'Error interno del servidor'
    });
  }
  
  module.exports = errorHandler;