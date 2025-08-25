const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../config/auth'); // Asegúrate de tener este archivo

class Usuario {
  static async create({ dni, nombre, apellido, telefono, correo_electronico, contrasena, rol = 'usuario' }) {
    // Verifica que la contraseña esté presente
    if (!contrasena) {
      throw new Error("La contraseña es requerida");
    }

    console.log("Contraseña recibida en el modelo:", contrasena); // 👈 Verifica la contraseña

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10); // Asegúrate de que contrasena sea un string

    const query = `
      INSERT INTO usuarios (dni, nombre, apellido, telefono, correo_electronico, contrasena, rol)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [dni, nombre, apellido, telefono, correo_electronico, hashedPassword, rol];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByEmail(correo_electronico) {
    const query = 'SELECT * FROM usuarios WHERE correo_electronico = $1';
    const { rows } = await pool.query(query, [correo_electronico]);
    return rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM usuarios WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  static async updateResetToken(id, token) {
    const query = `
      UPDATE usuarios 
      SET reset_token = $1, reset_token_expiry = NOW() + INTERVAL '1 hour'
      WHERE id = $2
    `;
    await pool.query(query, [token, id]);
  }

  static async updatePassword(id, newPassword) {
    const query = `
      UPDATE usuarios 
      SET contrasena = $1, reset_token = NULL, reset_token_expiry = NULL
      WHERE id = $2
    `;
    await pool.query(query, [newPassword, id]);
  }

  static async findByResetToken(token) {
    const query = `
      SELECT * FROM usuarios 
      WHERE reset_token = $1 AND reset_token_expiry > NOW()
    `;
    const { rows } = await pool.query(query, [token]);
    return rows[0];
  }
  static async getAllUsers() {
    const query = `
      SELECT 
        id,
        dni,
        nombre,
        apellido,
        telefono,
        correo_electronico as email,
        rol
      FROM usuarios
      ORDER BY nombre ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }
  
  static async updateUserRole(id, newRole) {
    const query = `
      UPDATE usuarios 
      SET rol = $1
      WHERE id = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [newRole, id]);
    return rows[0];
  }
}



module.exports = Usuario;