const pool = require('../config/db');



class Producto {
  static async create(nombre, principio_activo, precio_caja, precio_blister, descripcion, imagen_url, stock, laboratorio, categoria_id) {
    const query = `
      INSERT INTO productos (nombre, principio_activo, precio_caja, precio_blister, descripcion, imagen_url, stock, laboratorio, categoria_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [nombre, principio_activo, precio_caja, precio_blister, descripcion, imagen_url, stock, laboratorio, categoria_id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM productos';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM productos WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async update(id, nombre, principio_activo, precio_caja, precio_blister, descripcion, imagen_url, stock, laboratorio, categoria_id) {
    const query = `
      UPDATE productos
      SET nombre = $1, principio_activo = $2, precio_caja = $3, precio_blister = $4, descripcion = $5, imagen_url = $6, stock = $7, laboratorio = $8, categoria_id = $9
      WHERE id = $10
      RETURNING *;
    `;
    const values = [nombre, principio_activo, precio_caja, precio_blister, descripcion, imagen_url, stock, laboratorio,categoria_id, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }


  static async delete(id) {
    const query = 'DELETE FROM productos WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
 

// Producto.js

static async search(query) {
  const searchQuery = `
    SELECT * FROM productos
    WHERE 
      nombre ILIKE $1 OR
      principio_activo ILIKE $1 OR
      descripcion ILIKE $1;
  `;
  const searchTerm = `%${query}%`; // Búsqueda parcial (insensible a mayúsculas/minúsculas)
  const { rows } = await pool.query(searchQuery, [searchTerm]);
  return rows;
}

}



module.exports = Producto;