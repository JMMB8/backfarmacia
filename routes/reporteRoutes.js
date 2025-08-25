const express = require('express');
const router = express.Router();
const ReporteController = require('../controllers/ReporteController');
const authMiddleware = require('../middlewares/authMiddleware');

// Crear un nuevo reporte (ruta protegida)
router.post('/reportes', authMiddleware.authenticate, ReporteController.createReporte);

// Obtener reportes por tipo (ruta protegida)
router.get('/reportes/:tipo', authMiddleware.authenticate, ReporteController.getReportesByType);

// Obtener un reporte por ID (ruta protegida)
router.get('/reportes/detalle/:id', authMiddleware.authenticate, ReporteController.getReporteById);

module.exports = router;
