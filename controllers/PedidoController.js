const Pedido = require("../models/Pedido");
const { enviarNotificacion } = require("../utils/notificaciones");

exports.crearPedido = async (req, res) => {
  try {
    // Validación mejorada con chequeo de tipos estricto
    const errors = [];

    if (!req.body.productos || !Array.isArray(req.body.productos)) {
      errors.push("El campo productos debe ser un array");
    } else {
      req.body.productos.forEach((producto, index) => {
        if (!producto.producto_id || !Number.isInteger(Number(producto.producto_id))) {
          errors.push(`Producto ${index}: ID inválido (debe ser número entero)`);
        }
        if (!producto.cantidad || !Number.isInteger(Number(producto.cantidad)) || producto.cantidad < 1) {
          errors.push(`Producto ${index}: Cantidad inválida (mínimo 1)`);
        }
        if (!producto.precio || isNaN(Number(producto.precio)) || Number(producto.precio) <= 0) {
          errors.push(`Producto ${index}: Precio inválido (debe ser número positivo)`);
        }
      });
    }

    // Validación numérica más robusta para el total
    const total = Number(req.body.total);
    if (isNaN(total) || total <= 0 || !/^\d+(\.\d{1,2})?$/.test(req.body.total)) {
      errors.push("Total inválido (formato: 0.00)");
    }

    const metodosPagoValidos = ["tarjeta", "efectivo", "transferencia"];
    if (!req.body.metodo_pago || !metodosPagoValidos.includes(req.body.metodo_pago)) {
      errors.push(`Método de pago inválido. Valores aceptados: ${metodosPagoValidos.join(", ")}`);
    }

    const tiposEntregaValidos = ["recoger", "delivery"];
    if (!req.body.tipo_entrega || !tiposEntregaValidos.includes(req.body.tipo_entrega)) {
      errors.push(`Tipo de entrega inválido. Valores aceptados: ${tiposEntregaValidos.join(", ")}`);
    }

    if (req.body.tipo_entrega === "delivery" && 
        (!req.body.direccion || typeof req.body.direccion !== "string" || !req.body.direccion.trim())) {
      errors.push("Debe proporcionar una dirección válida para delivery");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors,
      });
    }

    // Conversión segura de tipos
    const pedidoData = {
      usuario_id: Number(req.user.id),
      usuario_nombre: String(req.user.nombre || ""),
      usuario_correo: String(req.user.correo_electronico || ""),
      usuario_telefono: String(req.user.telefono || ""),
      productos: req.body.productos.map((p) => ({
        producto_id: parseInt(p.producto_id, 10),
        cantidad: parseInt(p.cantidad, 10),
        precio: parseFloat(p.precio),
      })),
      total: parseFloat(total.toFixed(2)),
      metodo_pago: String(req.body.metodo_pago),
      tipo_entrega: String(req.body.tipo_entrega),
      direccion: req.body.tipo_entrega === "delivery" ? String(req.body.direccion).trim() : null,
    };

    // Validación adicional del modelo
    if (!pedidoData.usuario_id || pedidoData.usuario_id <= 0) {
      throw new Error("ID de usuario inválido");
    }

    const nuevoPedido = await Pedido.crear(pedidoData);

    // Notificación con manejo de errores
    if (enviarNotificacion && typeof enviarNotificacion === "function") {
      try {
        await enviarNotificacion({
          ...nuevoPedido,
          usuario: {
            nombre: pedidoData.usuario_nombre,
            email: pedidoData.usuario_correo,
            telefono: pedidoData.usuario_telefono
          },
          metodo_pago: pedidoData.metodo_pago,
          tipo_entrega: pedidoData.tipo_entrega,
          direccion: pedidoData.direccion
        });
      } catch (error) {
        console.error("Error al enviar notificación:", error);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Pedido creado exitosamente",
      data: nuevoPedido,
    });
  } catch (error) {
    console.error("Error en crearPedido:", error);

    const statusCode = error.message.includes("inválido") || error.message.includes("validación") ? 400 : 500;

    const response = {
      success: false,
      message: error.message || "Error interno al crear el pedido",
    };

    if (process.env.NODE_ENV === "development") {
      response.error = error.message;
      response.stack = error.stack;
    }

    return res.status(statusCode).json(response);
  }
};

exports.obtenerPedidos = async (req, res) => {
  try {
    if (req.user.rol !== "admin" && req.user.rol !== "superadministrador") {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado: Se requieren privilegios de administrador",
      });
    }

    const pedidos = await Pedido.obtenerTodos();

    return res.json({
      success: true,
      count: pedidos.length,
      data: pedidos,
    });
  } catch (error) {
    console.error("Error al obtener pedidos:", error);

    const response = {
      success: false,
      message: "Error al recuperar los pedidos",
    };

    if (process.env.NODE_ENV === "development") {
      response.error = error.message;
      response.stack = error.stack;
    }

    return res.status(500).json(response);
  }
};

exports.obtenerMisPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.obtenerPorUsuario(req.user.id);

    return res.json({
      success: true,
      count: pedidos.length,
      data: pedidos,
    });
  } catch (error) {
    console.error("Error al obtener pedidos del usuario:", error);
    
    const response = {
      success: false,
      message: "Error al obtener tus pedidos",
    };

    if (process.env.NODE_ENV === "development") {
      response.error = error.message;
    }

    return res.status(500).json(response);
  }
};

exports.obtenerPedido = async (req, res) => {
  try {
    const pedido = await Pedido.obtenerPorId(req.params.id);

    if (pedido.usuario_id !== req.user.id && 
        req.user.rol !== "admin" && 
        req.user.rol !== "superadministrador") {
      return res.status(403).json({
        success: false,
        message: "No autorizado para ver este pedido",
      });
    }

    return res.json({
      success: true,
      data: pedido,
    });
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    
    const statusCode = error.message.includes("No result") ? 404 : 500;
    const response = {
      success: false,
      message: error.message.includes("No result") 
        ? "Pedido no encontrado" 
        : "Error al obtener el pedido",
    };

    if (process.env.NODE_ENV === "development") {
      response.error = error.message;
    }

    return res.status(statusCode).json(response);
  }
};

// En tu backend (controllers/PedidoController.js)
exports.actualizarEstado = async (req, res) => {
  try {
    // Agrega este console.log para depuración
    console.log('Actualizando estado:', {
      id: req.params.id,
      nuevoEstado: req.body.estado,
      usuario: req.user.id
    });

    const estadosValidos = ["pendiente", "confirmado", "preparando", "enviado", "entregado", "cancelado"];
    
    if (!estadosValidos.includes(req.body.estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Valores aceptados: ${estadosValidos.join(", ")}`
      });
    }

    // Agrega validación de transiciones de estado si es necesario
    const pedidoActual = await Pedido.obtenerPorId(req.params.id);
    
    // Ejemplo de validación adicional (puedes personalizar)
    if (pedidoActual.estado === 'cancelado' && req.body.estado !== 'cancelado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede cambiar el estado de un pedido cancelado'
      });
    }

    const pedidoActualizado = await Pedido.actualizarEstado(req.params.id, req.body.estado);

    return res.json({
      success: true,
      message: "Estado del pedido actualizado",
      data: pedidoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar el estado del pedido",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.cancelarPedido = async (req, res) => {
  try {
    // Validar que el pedido puede ser cancelado
    const pedido = await Pedido.obtenerPorId(req.params.id);
    
    if (pedido.usuario_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "No puedes cancelar este pedido"
      });
    }

    if (!['pendiente', 'confirmado'].includes(pedido.estado)) {
      return res.status(400).json({
        success: false,
        message: "El pedido no puede ser cancelado en su estado actual"
      });
    }

    const pedidoCancelado = await Pedido.actualizarEstado(
      req.params.id, 
      'cancelado',
      req.body.motivo
    );

    // Notificar al admin
    enviarNotificacion({
      tipo: 'pedido_cancelado',
      pedido_id: pedidoCancelado.id,
      usuario_id: req.user.id,
      motivo: req.body.motivo
    });

    return res.json({
      success: true,
      message: "Pedido cancelado exitosamente",
      data: pedidoCancelado
    });
  } catch (error) {
    console.error("Error al cancelar pedido:", error);
    return res.status(500).json({
      success: false,
      message: "Error al cancelar el pedido"
    });
  }
};

exports.valorarPedido = async (req, res) => {
  try {
    // Validar que el pedido puede ser valorado
    const pedido = await Pedido.obtenerPorId(req.params.id);
    
    if (pedido.usuario_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "No puedes valorar este pedido"
      });
    }

    if (pedido.estado !== 'entregado') {
      return res.status(400).json({
        success: false,
        message: "Solo puedes valorar pedidos entregados"
      });
    }

    if (pedido.calificacion) {
      return res.status(400).json({
        success: false,
        message: "Este pedido ya fue valorado"
      });
    }

    const pedidoValorado = await Pedido.agregarValoracion(
      req.params.id,
      req.body.calificacion,
      req.body.comentario
    );

    return res.json({
      success: true,
      message: "Valoración registrada exitosamente",
      data: pedidoValorado
    });
  } catch (error) {
    console.error("Error al valorar pedido:", error);
    return res.status(500).json({
      success: false,
      message: "Error al registrar la valoración"
    });
  }
};