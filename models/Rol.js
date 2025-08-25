const pool = require('../config/db');

class Rol {
  static async create(nombre, descripcion) {
    const query = `
      INSERT INTO roles (nombre, descripcion)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [nombre, descripcion];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM roles';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM roles WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async update(id, nombre, descripcion) {
    const query = `
      UPDATE roles
      SET nombre = $1, descripcion = $2
      WHERE id = $3
      RETURNING *;
    `;
    const values = [nombre, descripcion, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM roles WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Rol;