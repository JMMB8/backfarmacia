const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const enviarNotificacion = async (pedido) => {
  // 1. DEBUG Mejorado: Ver estructura completa del pedido con datos clave destacados
  console.log("=== DATOS DEL PEDIDO RECIBIDOS ===");
  console.log("ID Pedido:", pedido.id || pedido._id || "No especificado");
  console.log("Total:", pedido.total || "No especificado");
  console.log("Datos del usuario:", {
    nombre: pedido.usuario?.nombre || pedido.usuario_nombre,
    email: pedido.usuario?.email || pedido.usuario?.correo_electronico,
    telefono: pedido.usuario?.telefono
  });
  console.log("Productos:", pedido.productos?.length || pedido.items?.length || 0, "items");
  console.log("================================");

  // 2. Función mejorada para formatear precios con manejo de errores robusto
  const formatPrice = (price) => {
    try {
      const num = typeof price === 'string' 
        ? parseFloat(price.replace(/[^0-9.-]/g, '')) 
        : Number(price) || 0;
      return "S/ " + num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch (error) {
      console.error("Error al formatear precio:", error);
      return "S/ 0.00";
    }
  };

  // 3. Función mejorada para obtener info del cliente con más opciones de respaldo
  const getClienteInfo = () => {
    return {
      nombre: pedido.usuario_nombre || "Cliente no identificado",
      email: pedido.usuario_correo || "No especificado", // Cambiado para usar usuario_correo
      telefono: pedido.usuario_telefono || "No especificado"
    };
  };

  // 4. Generar HTML de productos con validación mejorada
  const getProductosHTML = () => {
    try {
      // Buscar array de productos en diferentes propiedades con más alternativas
      const productos = pedido.productos || pedido.items || pedido.detalle || [];
      
      if (!Array.isArray(productos)) {
        console.warn("Formato de productos inválido, se esperaba un array");
        return '<tr><td colspan="4">Formato de productos inválido</td></tr>';
      }

      if (productos.length === 0) {
        console.warn("No se encontraron productos en el pedido");
        return '<tr><td colspan="4">No se encontraron productos</td></tr>';
      }

      return productos.map((item, index) => {
        const producto = item.producto || item;
        const precio = producto.precio || item.precio || 0;
        const cantidad = item.cantidad || 1;
        
        return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${
            producto.nombre || `Producto ${index + 1}`
          }</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${cantidad}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatPrice(precio)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatPrice(cantidad * precio)}</td>
        </tr>
        `;
      }).join("");
    } catch (error) {
      console.error("Error crítico al procesar productos:", error);
      return '<tr><td colspan="4">Error al cargar productos</td></tr>';
    }
  };

  // 5. Configurar correo electrónico con template mejorado
  const clienteInfo = getClienteInfo();
  const productosHTML = getProductosHTML();

  const mailOptions = {
    from: `"${process.env.EMAIL_NAME || "Mi Tienda"}" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `Nuevo Pedido #${pedido.id || pedido._id || "000"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #2e86c1; text-align: center; border-bottom: 2px solid #2e86c1; padding-bottom: 10px;">
          ¡Nuevo Pedido Recibido!
        </h1>
        
        <!-- Información del Cliente -->
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #2e86c1;">
          <h2 style="margin-top: 0; color: #2c3e50;">📋 Información del Cliente</h2>
          <p><strong>Nombre:</strong> ${clienteInfo.nombre}</p>
          <p><strong>Email:</strong> <a href="mailto:${clienteInfo.email}">${clienteInfo.email}</a></p>
          <p><strong>Teléfono:</strong> <a href="tel:${clienteInfo.telefono}">${clienteInfo.telefono}</a></p>
        </div>
        
        <!-- Lista de Productos -->
        <div style="margin-bottom: 20px; overflow-x: auto;">
          <h2 style="color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5px;">📦 Productos Solicitados</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #2e86c1; color: white;">
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Producto</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Cantidad</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">P. Unitario</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${productosHTML}
            </tbody>
            <tfoot>
              <tr style="background-color: #f8f9fa; font-weight: bold;">
                <td colspan="3" style="padding: 10px; border: 1px solid #ddd; text-align: right;">Total:</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatPrice(pedido.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <!-- Detalles adicionales del pedido -->
        <div style="background: #e9f7ef; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #27ae60;">
          <h3 style="margin-top: 0; color: #27ae60;">📝 Detalles Adicionales</h3>
          <p><strong>Método de pago:</strong> ${pedido.metodoPago || pedido.metodo_pago || "No especificado"}</p>
          <p><strong>Tipo de entrega:</strong> ${pedido.tipo_entrega === "delivery" ? "🚚 Delivery" : "🏪 Recoger en tienda"}</p>
          ${pedido.direccion ? `<p><strong>Dirección:</strong> ${pedido.direccion}</p>` : ""}
          ${pedido.notas ? `<p><strong>Notas:</strong> ${pedido.notas}</p>` : ""}
        </div>
        
        <!-- Pie de página -->
        <div style="text-align: center; color: #777; font-size: 12px; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
          <p>Fecha: ${new Date().toLocaleString('es-PE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</p>
          <p>ID Pedido: ${pedido.id || pedido._id || "N/A"}</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Correo enviado correctamente. Message ID:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { enviarNotificacion };