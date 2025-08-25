const Favorito = require('../models/favorito');

// Agregar un producto a favoritos
exports.addFavorite = async (req, res) => {
  try {
    const { producto_id } = req.body;
    const usuario_id = req.user.id; // Obtiene el ID del usuario desde el token JWT
    const favorito = await Favorito.addFavorite(usuario_id, producto_id);
    res.status(201).json(favorito);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener los favoritos de un usuario
exports.getFavorites = async (req, res) => {
  try {
    const usuario_id = req.user.id; // Obtiene el ID del usuario desde el token JWT
    const favoritos = await Favorito.getFavoritesByUser(usuario_id);
    res.status(200).json(favoritos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un producto de favoritos
exports.removeFavorite = async (req, res) => {
  try {
    const { producto_id } = req.params;
    const usuario_id = req.user.id; // Obtiene el ID del usuario desde el token JWT
    const favorito = await Favorito.removeFavorite(usuario_id, producto_id);
    if (!favorito) {
      return res.status(404).json({ error: 'Producto no encontrado en favoritos' });
    }
    res.status(204).json();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};