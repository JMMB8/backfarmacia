const pool = require('../config/db');

class UsuarioRol {
  static async assignRoleToUser(usuario_id, rol_id) {
    const query = `
      INSERT INTO usuarios_roles (usuario_id, rol_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [usuario_id, rol_id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async getRolesByUser(usuario_id) {
    const query = `
      SELECT roles.*
      FROM usuarios_roles
      JOIN roles ON usuarios_roles.rol_id = roles.id
      WHERE usuarios_roles.usuario_id = $1;
    `;
    const { rows } = await pool.query(query, [usuario_id]);
    return rows;
  }

  static async getUsersByRole(rol_id) {
    const query = `
      SELECT usuarios.*
      FROM usuarios_roles
      JOIN usuarios ON usuarios_roles.usuario_id = usuarios.id
      WHERE usuarios_roles.rol_id = $1;
    `;
    const { rows } = await pool.query(query, [rol_id]);
    return rows;
  }

  static async removeRoleFromUser(usuario_id, rol_id) {
    const query = `
      DELETE FROM usuarios_roles
      WHERE usuario_id = $1 AND rol_id = $2
      RETURNING *;
    `;
    const values = [usuario_id, rol_id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }
}

module.exports = UsuarioRol;