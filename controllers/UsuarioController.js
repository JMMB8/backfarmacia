const Usuario = require("../models/Usuario");
const jwt = require("jsonwebtoken");
const { secretKey } = require("../config/auth");
const bcrypt = require("bcrypt");


// Registrar un nuevo usuario
exports.register = async (req, res) => {
  try {
    console.log("Datos recibidos en el controlador:", req.body); // 👈 Verifica los datos recibidos
    const { dni, nombre, apellido, telefono, correo_electronico, contrasena } = req.body;

    // Verifica que la contraseña esté presente
    if (!contrasena) {
      return res.status(400).json({ error: "La contraseña es requerida" });
    }

    // Crear el usuario
    const nuevoUsuario = await Usuario.create({
      dni,
      nombre,
      apellido,
      telefono,
      correo_electronico,
      contrasena, // Asegúrate de pasar la contraseña
      rol: "usuario",
    });

    // Generar un token JWT
    const token = jwt.sign({ id: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.correo_electronico,  // Mapeado a "email" para consistencia
      telefono: nuevoUsuario.telefono,
      rol: nuevoUsuario.rol}, secretKey, { expiresIn: "8h" });

    res.status(201).json({ token,  usuario: {
      id: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.correo_electronico,
      telefono: nuevoUsuario.telefono,
      rol: nuevoUsuario.rol
    }});
  } catch (error) {
    console.error("Error en el controlador register:", error); // 👈 Verifica el error
    res.status(400).json({ error: error.message });
  }
};

// Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { correo_electronico, contrasena } = req.body;
    const usuario = await Usuario.findByEmail(correo_electronico);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!isMatch) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // Generar un token JWT con todos los datos necesarios
    const token = jwt.sign({ 
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.correo_electronico,
      telefono: usuario.telefono,
      rol: usuario.rol
    }, secretKey, { expiresIn: "8h" });

    res.status(200).json({ 
      token, 
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.correo_electronico, // Usar 'email' para consistencia
        telefono: usuario.telefono,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener información del usuario actual
exports.getUser = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(200).json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Registrar un administrador
exports.registerAdmin = async (req, res) => {
  const { nombre, apellido, dni, telefono, correo_electronico, contrasena } =
    req.body;

  // Verificar si el usuario que hace la solicitud es un superadministrador
  if (req.user.rol !== "superadministrador") {
    return res
      .status(403)
      .json({ error: "No tienes permiso para realizar esta acción" });
  }

  try {
    // Verificar si el correo ya está registrado
    const existingUser = await Usuario.findByEmail(correo_electronico);
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "El correo electrónico ya está registrado" });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear el usuario con rol de administrador
    const userId = await Usuario.create({
      nombre,
      apellido,
      dni,
      telefono,
      correo_electronico,
      contrasena: hashedPassword,
      rol: "administrador",
    });

    res
      .status(201)
      .json({ mensaje: "Administrador registrado exitosamente", userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar el administrador" });
  }
};

// Obtener todos los usuarios (solo para superadmin)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.rol !== 'superadministrador') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const users = await Usuario.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar rol de usuario (solo para superadmin)
exports.updateUserRole = async (req, res) => {
  try {
    if (req.user.rol !== 'superadministrador') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const { id } = req.params;
    const { role } = req.body;
    
    const validRoles = ['usuario', 'administrador', 'superadministrador'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Rol no válido' });
    }
    
    const updatedUser = await Usuario.updateUserRole(id, role);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};