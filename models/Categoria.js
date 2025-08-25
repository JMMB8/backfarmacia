const pool = require('../config/db');

class Categoria {
  static async create(nombre, descripcion) {
    const query = 'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *';
    const values = [nombre, descripcion];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM categorias';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM categorias WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async update(id, nombre, descripcion) {
    const query = 'UPDATE categorias SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *';
    const values = [nombre, descripcion, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM categorias WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Categoria;