const { enviarNotificacion } = require('./utils/notificaciones');

// Ejemplo de uso
const pedidoEjemplo = {
    id: 789,
    cliente: {
      nombre: "Ana Torres",
      email: "ana@example.com",
      telefono: "999888777"
    },
    productos: [
      { nombre: "Crema Hidratante", cantidad: 1, precio: 35.90 },
      { nombre: "Protector Solar", cantidad: 2, precio: 42.50 }
    ],
    total: 120.90,
    direccion: "Av. Primavera 456, Lima",
    metodo_pago: "Tarjeta de Débito"
  };
  
  enviarNotificacion(pedidoEjemplo);