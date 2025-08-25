const Cart = require('../models/Cart');

// Agregar un producto al carrito
exports.addToCart = async (req, res) => {
  try {
    const { producto_id, cantidad } = req.body;
    const usuario_id = req.user.id; // Obtiene el ID del usuario desde el token JWT
    const cartItem = await Cart.addProduct(usuario_id, producto_id, cantidad);
    res.status(201).json(cartItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener el carrito de un usuario
exports.getCart = async (req, res) => {
  try {
    const usuario_id = req.user.id; // Obtiene el ID del usuario desde el token JWT
    const cartItems = await Cart.getCartByUser(usuario_id);
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar la cantidad de un producto en el carrito
exports.updateCartItem = async (req, res) => {
  try {
    const { cantidad } = req.body;
    const cartItem = await Cart.updateProductQuantity(req.params.id, cantidad);
    if (!cartItem) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }
    res.status(200).json(cartItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un producto del carrito
exports.removeFromCart = async (req, res) => {
  try {
    const cartItem = await Cart.removeProduct(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }
    res.status(204).json();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};