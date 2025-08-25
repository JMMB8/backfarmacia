const Producto = require("../models/Producto");

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  try {
    const { nombre, principio_activo, precio_caja, precio_blister, descripcion, imagen_url, stock, laboratorio, categoria_id } = req.body;
    const nuevoProducto = await Producto.create(nombre, principio_activo, precio_caja, precio_blister, descripcion, imagen_url, stock, laboratorio, categoria_id);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// Obtener todos los productos
exports.getProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll();
    res.status(200).json(productos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar un producto
exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, principio_activo, precio_caja, precio_blister, descripcion, imagen_url, stock, laboratorio, categoria_id } = req.body;
    const producto = await Producto.update(id, nombre, principio_activo, precio_caja, precio_blister, descripcion, imagen_url, stock, laboratorio, categoria_id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un producto
exports.deleteProducto = async (req, res) => {
  try {
    const producto = await Producto.delete(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(204).json();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Búsqueda de productos


// Búsqueda de productos
exports.searchProductos = async (req, res) => {
  try {
    const { query } = req.query; // Obtener el término de búsqueda desde la URL

    if (!query) {
      return res.status(400).json({ error: "El término de búsqueda es requerido" });
    }

    // Realizar la búsqueda en la base de datos
    const productos = await Producto.search(query);

    // Si no hay productos, devolver un array vacío con un código 200
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};