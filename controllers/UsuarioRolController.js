const UsuarioRol = require('../models/UsuarioRol');

// Asignar un rol a un usuario
exports.assignRoleToUser = async (req, res) => {
  try {
    const { usuario_id, rol_id } = req.body;
    const usuarioRol = await UsuarioRol.assignRoleToUser(usuario_id, rol_id);
    res.status(201).json(usuarioRol);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener los roles de un usuario
exports.getRolesByUser = async (req, res) => {
  try {
    const usuario_id = req.params.usuario_id;
    const roles = await UsuarioRol.getRolesByUser(usuario_id);
    res.status(200).json(roles);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener los usuarios de un rol
exports.getUsersByRole = async (req, res) => {
  try {
    const rol_id = req.params.rol_id;
    const usuarios = await UsuarioRol.getUsersByRole(rol_id);
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un rol de un usuario
exports.removeRoleFromUser = async (req, res) => {
  try {
    const { usuario_id, rol_id } = req.params;
    const usuarioRol = await UsuarioRol.removeRoleFromUser(usuario_id, rol_id);
    if (!usuarioRol) {
      return res.status(404).json({ error: 'Relación usuario-rol no encontrada' });
    }
    res.status(204).json();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};