const pool = require("../config/db");
const fs = require('fs');
const path = require('path');

class Pago {
  // Crear un nuevo pago
  static async create(usuario_id, monto, metodo_pago, estado, descripcion, banco_destino, numero_cuenta, comprobante_url) {
    const query = `
      INSERT INTO pagos (
        usuario_id, 
        monto, 
        metodo_pago, 
        estado, 
        descripcion,
        banco_destino,
        numero_cuenta,
        comprobante_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      usuario_id, 
      monto, 
      metodo_pago, 
      estado, 
      descripcion,
      banco_destino,
      numero_cuenta,
      comprobante_url
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // Obtener todos los pagos
  static async getAll() {
    const query = `
      SELECT * FROM pagos
      ORDER BY fecha DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  // Obtener un pago por ID
  static async getById(id) {
    const query = `
      SELECT * FROM pagos
      WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  // Subir comprobante de pago
  static async uploadComprobante(pedidoId, file) {
    try {
      // Crear directorio si no existe
      const uploadDir = path.join(__dirname, '../../uploads/comprobantes');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generar nombre único para el archivo
      const fileExt = path.extname(file.originalname);
      const fileName = `comprobante-${pedidoId}-${Date.now()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      // Mover el archivo
      await fs.promises.writeFile(filePath, file.buffer);

      // Actualizar el pedido con la URL del comprobante
      const updateQuery = `
        UPDATE pagos
        SET comprobante_url = $1
        WHERE id = $2
        RETURNING *;
      `;
      const { rows } = await pool.query(updateQuery, [`/uploads/comprobantes/${fileName}`, pedidoId]);
      
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Pago;