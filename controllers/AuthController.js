const Usuario = require("../models/Usuario");
const jwt = require("jsonwebtoken");
const { secretKey } = require("../config/auth");
const bcrypt = require("bcrypt");
const { sendPasswordResetEmail } = require("../utils/emailSender");

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Usuario.findByEmail(email);

    if (!user) {
      return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    }

    // Generar token con expiración (1 hora)
    const token = jwt.sign({ id: user.id }, secretKey + user.contrasena, { expiresIn: "1h" });

    // Guardar token en la DB (requiere modificar modelo Usuario)
    await Usuario.updateResetToken(user.id, token);

    // Enviar correo
    const resetLink = `http://localhost:5173/restablecer-contrasena?token=${token}&id=${user.id}`;
    await sendPasswordResetEmail(user.correo_electronico, resetLink);

    res.status(200).json({ success: true, message: "Correo enviado" });
  } catch (error) {
    console.error("Error en recuperación:", error);
    res.status(500).json({ success: false, error: "Error del servidor" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, id, newPassword } = req.body;

    // 1. Verificar token
    const user = await Usuario.findById(id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // 2. Validar token (usamos la contraseña como salt adicional)
    jwt.verify(token, secretKey + user.contrasena);

    // 3. Actualizar contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Usuario.updatePassword(id, hashedPassword);

    res.status(200).json({ success: true, message: "Contraseña actualizada" });
  } catch (error) {
    console.error("Error al resetear:", error);
    const message = error.name === "TokenExpiredError" 
      ? "El enlace ha expirado" 
      : "Token inválido";
    res.status(400).json({ success: false, error: message });
  }
};