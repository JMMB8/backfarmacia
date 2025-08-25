const pool = require('../config/db');

class Cart {
  static async addProduct(usuario_id, producto_id, cantidad) {
    const query = `
      INSERT INTO cart (usuarios_id, productos_id, cantidad)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [usuario_id, producto_id, cantidad];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async getCartByUser(usuario_id) {
    const query = `
      SELECT cart.id, productos.nombre, productos.precio, cart.cantidad
      FROM cart
      JOIN productos ON cart.productos_id = productos.id
      WHERE cart.usuarios_id = $1;
    `;
    const { rows } = await pool.query(query, [usuario_id]);
    return rows;
  }

  static async updateProductQuantity(cart_id, cantidad) {
    const query = `
      UPDATE cart
      SET cantidad = $1
      WHERE id = $2
      RETURNING *;
    `;
    const values = [cantidad, cart_id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async removeProduct(cart_id) {
    const query = 'DELETE FROM cart WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [cart_id]);
    return rows[0];
  }
}

module.exports = Cart;