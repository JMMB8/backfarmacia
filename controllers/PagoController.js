const Pago = require("../models/Pago");

// Crear un nuevo pago
exports.createPago = async (req, res) => {
  try {
    const { 
      usuario_id, 
      monto, 
      metodo_pago, 
      estado, 
      descripcion,
      banco_destino,
      numero_cuenta
    } = req.body;

    const nuevoPago = await Pago.create(
      usuario_id, 
      monto, 
      metodo_pago, 
      estado, 
      descripcion,
      banco_destino,
      numero_cuenta,
      null // comprobante_url se actualizará después
    );

    res.status(201).json(nuevoPago);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Subir comprobante de pago
exports.uploadComprobante = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se ha subido ningún archivo" });
    }

    const { pedidoId } = req.body;
    const pagoActualizado = await Pago.uploadComprobante(pedidoId, req.file);

    res.status(200).json(pagoActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los pagos
exports.getPagos = async (req, res) => {
  try {
    const pagos = await Pago.getAll();
    res.status(200).json(pagos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener un pago por ID
exports.getPagoById = async (req, res) => {
  try {
    const pago = await Pago.getById(req.params.id);
    if (!pago) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }
    res.status(200).json(pago);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// Obtener pagos pendientes de verificación
exports.getPagosPendientes = async (req, res) => {
  try {
    const query = `
      SELECT p.*, u.nombre as usuario_nombre, u.email as usuario_email
      FROM pagos p
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.estado = 'pendiente'
      ORDER BY p.fecha DESC;
    `;
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar estado de un pago
exports.updateEstadoPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const query = `
      UPDATE pagos
      SET estado = $1
      WHERE id = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [estado, id]);
    
    if (!rows[0]) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};