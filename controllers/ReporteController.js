const Reporte = require('../models/Reporte');

// Crear un nuevo reporte
exports.createReporte = async (req, res) => {
  try {
    const { tipo_reporte, datos } = req.body;
    const nuevoReporte = await Reporte.create(tipo_reporte, datos);
    res.status(201).json(nuevoReporte);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener reportes por tipo
// Obtener reportes por tipo
exports.getReportesByType = async (req, res) => {
  try {
    const { tipo } = req.params;
    let reportes;

    switch (tipo) {
      case "usuarios":
        reportes = await Reporte.getReporteCompletoUsuarios();
        break;
      case "ventas":
        reportes = await Reporte.getReporteVentas();
        break;
      case "productos-mas-vendidos":
        reportes = await Reporte.getReporteProductosMasVendidos();
        break;
      case "actividad-usuarios":
        reportes = await Reporte.getReporteActividadUsuarios();
        break;
      case "ingresos-mensuales":
        reportes = await Reporte.getReporteIngresosMensuales();
        break;
      default:
        throw new Error("Tipo de reporte no válido");
    }

    res.status(200).json(reportes);
  } catch (error) {
    console.error("Error en getReportesByType:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// Obtener un reporte por ID
exports.getReporteById = async (req, res) => {
  try {
    const reporte = await Reporte.getById(req.params.id);
    if (!reporte) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    res.status(200).json(reporte);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};