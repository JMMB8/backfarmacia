const pool = require('../config/db');

class Favorito {
  static async addFavorite(usuario_id, producto_id) {
    const query = `
      INSERT INTO favoritos (usuario_id, producto_id, fecha_agregado)
      VALUES ($1, $2, NOW())
      RETURNING *;
    `;
    const values = [usuario_id, producto_id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async getFavoritesByUser(usuario_id) {
    const query = `
      SELECT favoritos.*, productos.nombre, productos.precio, productos.precio_caja,productos.imagen_url
      FROM favoritos
      JOIN productos ON favoritos.producto_id = productos.id
      WHERE favoritos.usuario_id = $1;
    `;
    const { rows } = await pool.query(query, [usuario_id]);
    return rows;
  }

  static async removeFavorite(usuario_id, producto_id) {
    const query = `
      DELETE FROM favoritos
      WHERE usuario_id = $1 AND producto_id = $2
      RETURNING *;
    `;
    const values = [usuario_id, producto_id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }
}

module.exports = Favorito;