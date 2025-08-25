const Rol = require('../models/Rol');

// Crear un nuevo rol
exports.createRol = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const nuevoRol = await Rol.create(nombre, descripcion);
    res.status(201).json(nuevoRol);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Rol.findAll();
    res.status(200).json(roles);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener un rol por ID
exports.getRolById = async (req, res) => {
  try {
    const rol = await Rol.findById(req.params.id);
    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    res.status(200).json(rol);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar un rol
exports.updateRol = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const rol = await Rol.update(req.params.id, nombre, descripcion);
    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    res.status(200).json(rol);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un rol
exports.deleteRol = async (req, res) => {
  try {
    const rol = await Rol.delete(req.params.id);
    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    res.status(204).json();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};