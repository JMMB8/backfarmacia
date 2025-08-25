// routes/pedidosRoutes.js
const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/PedidoController');
const { authenticate, isSuperAdmin } = require('../middlewares/authMiddleware');

// Ruta para crear un nuevo pedido (accesible por usuarios autenticados)
router.post('/', 
  authenticate, 
  PedidoController.crearPedido
);

// Ruta para obtener todos los pedidos (solo administradores)
router.get('/', 
  authenticate, 
  isSuperAdmin, 
  PedidoController.obtenerPedidos
);


// Ruta para obtener los pedidos del usuario actual
router.get('/mis-pedidos', 
  authenticate, 
  PedidoController.obtenerMisPedidos
);

// Ruta para actualizar el estado de un pedido (solo administradores)
router.patch('/:id/estado',  
  authenticate, 
  isSuperAdmin, 
  PedidoController.actualizarEstado
);


// Ruta para obtener detalles de un pedido específico
router.get('/:id', 
  authenticate, 
  PedidoController.obtenerPedido
);
// routes/pedidosRoutes.js
router.post('/:id/cancelar', authenticate, PedidoController.cancelarPedido);

router.post('/:id/valorar', authenticate, PedidoController.valorarPedido);


module.exports = router;