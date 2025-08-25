const pool = require('../config/db');

class Pedido {
  static async crear(pedidoData) {
    const { 
      usuario_id, 
      productos, 
      total, 
      metodo_pago, 
      tipo_entrega, 
      direccion,
      usuario_correo,
      usuario_telefono
    } = pedidoData;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Validar tipos de datos antes de insertar
      if (!Number.isInteger(usuario_id) || usuario_id <= 0) {
        throw new Error('ID de usuario inválido');
      }

      if (!Array.isArray(productos) || productos.length === 0) {
        throw new Error('Lista de productos inválida');
      }

      // 2. Insertar el pedido principal
      const pedidoQuery = `
        INSERT INTO pedidos(
          usuario_id, 
          total, 
          metodo_pago, 
          tipo_entrega, 
          direccion,
          usuario_correo,
          usuario_telefono,
          productos
        )
        VALUES($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
        RETURNING id, estado, fecha_creacion`;
      
      const pedidoValues = [
        usuario_id, 
        parseFloat(total).toFixed(2), 
        metodo_pago, 
        tipo_entrega, 
        direccion,
        usuario_correo,
        usuario_telefono,
        JSON.stringify(productos)
      ];
      
      const pedidoResult = await client.query(pedidoQuery, pedidoValues);
      const pedido = pedidoResult.rows[0];

      // 3. Insertar los productos del pedido
      for (const producto of productos) {
        const productoQuery = `
          INSERT INTO pedido_productos(
            pedido_id, 
            producto_id, 
            cantidad, 
            precio
          )
          VALUES($1, $2, $3, $4)`;
        
        const productoValues = [
          pedido.id, 
          producto.producto_id, 
          producto.cantidad, 
          producto.precio
        ];
        
        await client.query(productoQuery, productoValues);
      }

      await client.query('COMMIT');

      // 4. Obtener el pedido completo con productos
      return await this.obtenerPorId(pedido.id);

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear pedido:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async obtenerTodos() {
    const query = `
      SELECT 
        p.*,
        u.nombre as usuario_nombre,
        u.correo_electronico as usuario_correo,
        u.telefono as usuario_telefono,
        (
          SELECT json_agg(json_build_object(
            'producto_id', pp.producto_id,
            'nombre', pr.nombre,
            'cantidad', pp.cantidad,
            'precio', pp.precio
          ))
          FROM pedido_productos pp
          JOIN productos pr ON pr.id = pp.producto_id
          WHERE pp.pedido_id = p.id
        ) as productos
      FROM pedidos p
      JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY p.fecha_creacion DESC`;
    
    try {
      const { rows } = await pool.query(query);
      return rows.map(row => ({
        ...row,
        productos: typeof row.productos === 'string' 
          ? JSON.parse(row.productos) 
          : row.productos
      }));
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      throw error;
    }
  }

  static async obtenerPorId(id) {
    const query = `
      SELECT 
        p.*,
        json_agg(json_build_object(
          'id', pp.producto_id,
          'nombre', pr.nombre,
          'cantidad', pp.cantidad,
          'precio', pp.precio
        )) as productos,
        u.nombre as usuario_nombre,
        u.correo_electronico as usuario_correo,
        u.telefono as usuario_telefono
      FROM pedidos p
      JOIN pedido_productos pp ON pp.pedido_id = p.id
      JOIN productos pr ON pr.id = pp.producto_id
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.id = $1
      GROUP BY p.id, u.nombre, u.correo_electronico, u.telefono`;
    
    try {
      const { rows } = await pool.query(query, [id]);
      if (rows.length === 0) {
        throw new Error('Pedido no encontrado');
      }
      return rows[0];
    } catch (error) {
      console.error(`Error al obtener pedido ${id}:`, error);
      throw error;
    }
  }

  static async obtenerPorUsuario(usuario_id) {
    const query = `
      SELECT 
        p.*,
        json_agg(json_build_object(
          'id', pp.producto_id,
          'nombre', pr.nombre,
          'cantidad', pp.cantidad,
          'precio', pp.precio
        )) as productos,
        u.nombre as usuario_nombre,
        u.correo_electronico as usuario_correo,
        u.telefono as usuario_telefono
      FROM pedidos p
      JOIN pedido_productos pp ON pp.pedido_id = p.id
      JOIN productos pr ON pr.id = pp.producto_id
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.usuario_id = $1
      GROUP BY p.id, u.nombre, u.correo_electronico, u.telefono
      ORDER BY p.fecha_creacion DESC`;
    
    try {
      const { rows } = await pool.query(query, [usuario_id]);
      return rows;
    } catch (error) {
      console.error(`Error al obtener pedidos del usuario ${usuario_id}:`, error);
      throw error;
    }
  }

  // En models/Pedido.js
static async actualizarEstado(id, estado) {
  // Validación adicional para asegurar que el estado es válido
  const estadosValidos = ['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado'];
  if (!estadosValidos.includes(estado)) {
    throw new Error(`Estado inválido. Los estados permitidos son: ${estadosValidos.join(', ')}`);
  }

  const query = `
    UPDATE pedidos 
    SET estado = $1, 
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *`;
  
  try {
    const { rows } = await pool.query(query, [estado, id]);
    if (rows.length === 0) {
      throw new Error('Pedido no encontrado');
    }
    return rows[0];
  } catch (error) {
    console.error(`Error al actualizar estado del pedido ${id}:`, error);
    throw error;
  }
}
}

module.exports = Pedido;