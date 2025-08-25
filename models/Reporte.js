const pool = require('../config/db');

class Reporte {
  // Crear un nuevo reporte
  static async create(tipo_reporte, datos) {
    const query = `
      INSERT INTO reportes (tipo_reporte, datos)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [tipo_reporte, datos];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // Obtener todos los reportes de un tipo específico
  static async getByType(tipo_reporte) {
    console.log("Ejecutando consulta para el tipo:", tipo_reporte);
    try {
      if (tipo_reporte === "usuarios") {
        const query = `
          SELECT 
            u.id, 
            u.nombre, 
            u.correo_electronico, 
            u.fecha_registro, 
            COUNT(s.id) AS total_sesiones, 
            COUNT(c.id) AS total_compras
          FROM usuarios u
          LEFT JOIN sesiones s ON u.id = s.usuario_id
          LEFT JOIN compras c ON u.id = c.usuario_id
          GROUP BY u.id
          ORDER BY u.fecha_registro DESC;
        `;
        const { rows } = await pool.query(query);
        return rows;
      } else {
        const query = `
          SELECT * FROM reportes
          WHERE tipo_reporte = $1
          ORDER BY fecha DESC;
        `;
        const { rows } = await pool.query(query, [tipo_reporte]);
        return rows;
      }
    } catch (error) {
      console.error("Error en getByType:", error.message);
      throw error;
    }
  }
//obtener reporte completo de usuario
static async getReporteCompletoUsuarios() {
  const query = `
    SELECT 
      u.id, 
      u.nombre, 
      u.correo_electronico, 
      u.fecha_registro, 
      COUNT(s.id) AS total_sesiones, 
      COUNT(c.id) AS total_compras
    FROM usuarios u
    LEFT JOIN sesiones s ON u.id = s.usuario_id
    LEFT JOIN compras c ON u.id = c.usuario_id
    GROUP BY u.id
    ORDER BY u.fecha_registro DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
}
static async getReporteVentas() {
  const query = `
    SELECT 
      c.id AS venta_id,
      u.nombre AS usuario,
      c.fecha_compra,
      c.monto_total,
      c.estado
    FROM compras c
    JOIN usuarios u ON c.usuario_id = u.id
    ORDER BY c.fecha_compra DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
}

static async getReporteProductosMasVendidos() {
  const query = `
    SELECT 
      p.nombre AS producto,
      SUM(dv.cantidad) AS cantidad_vendida,
      SUM(dv.cantidad * dv.precio_unitario) AS monto_total
    FROM detalles_venta dv
    JOIN productos p ON dv.producto_id = p.id
    GROUP BY p.nombre
    ORDER BY cantidad_vendida DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
}

static async getReporteActividadUsuarios() {
  const query = `
    SELECT 
      u.nombre AS usuario,
      MAX(s.fecha) AS ultima_sesion,
      COUNT(s.id) AS sesiones_ultimo_mes,
      COUNT(c.id) AS compras_ultimo_mes
    FROM usuarios u
    LEFT JOIN sesiones s ON u.id = s.usuario_id AND s.fecha >= NOW() - INTERVAL '1 month'
    LEFT JOIN compras c ON u.id = c.usuario_id AND c.fecha_compra >= NOW() - INTERVAL '1 month'
    GROUP BY u.id
    ORDER BY ultima_sesion DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
}

static async getReporteIngresosMensuales() {
  const query = `
    SELECT 
      TO_CHAR(fecha_compra, 'YYYY-MM') AS mes,
      COUNT(id) AS total_ventas,
      SUM(monto_total) AS ingresos
    FROM compras
    GROUP BY TO_CHAR(fecha_compra, 'YYYY-MM')
    ORDER BY mes DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
}


  // Obtener un reporte por ID
  static async getById(id) {
    const query = `
      SELECT * FROM reportes
      WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Reporte;