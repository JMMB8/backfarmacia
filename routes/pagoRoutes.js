const express = require("express");
const router = express.Router();
const PagoController = require("../controllers/PagoController");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuración mejorada de Multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/comprobantes');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'comprobante-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (JPEG, PNG) o PDF'));
  }
});

// Crear un nuevo pago
router.post("/pagos", authMiddleware.authenticate, PagoController.createPago);

// Subir comprobante de pago (versión mejorada)
router.post("/pagos/upload-comprobante", 
  authMiddleware.authenticate, 
  upload.single('comprobante'), 
  PagoController.uploadComprobante
);

// Obtener todos los pagos
router.get("/pagos", authMiddleware.authenticate, PagoController.getPagos);

// Obtener un pago por ID
router.get("/pagos/:id", authMiddleware.authenticate, PagoController.getPagoById);

// Obtener pagos pendientes de verificación
router.get('/pagos/pendientes', 
  authMiddleware.authenticate, 
  authMiddleware.isSuperAdmin, 
  PagoController.getPagosPendientes
);

// Actualizar estado de un pago
router.put('/pagos/:id/estado', 
  authMiddleware.authenticate, 
  authMiddleware.isSuperAdmin, 
  PagoController.updateEstadoPago
);

module.exports = router;