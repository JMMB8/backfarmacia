const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

// Rutas
const categoriaRoutes = require("./routes/categoria.Routes");
const productoRoutes = require("./routes/productoRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const cartRoutes = require("./routes/cartRoutes");
const favoritoRoutes = require("./routes/favoritoRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");
const rolRoutes = require("./routes/rolRoutes");
const usuarioRolRoutes = require("./routes/usuarioRolRoutes");
const reporteRoutes = require("./routes/reporteRoutes");
const pagoRoutes = require("./routes/pagoRoutes");
const path = require('path');


// Inicializa la app de Express
const app = express();
const httpServer = createServer(app);

// Configuración de CORS profesional
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// Rutas
app.use("/api", categoriaRoutes);
app.use("/api", productoRoutes);
app.use("/api", usuarioRoutes);
app.use("/api", cartRoutes);
app.use("/api", favoritoRoutes);
app.use("/api", rolRoutes);
app.use("/api", usuarioRolRoutes);
app.use("/api", reporteRoutes);
app.use("/api", pagoRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar socket.io
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ],
    methods: ["GET", "POST"]
  }
});

// Autenticación opcional por token
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Aquí podrías validar el token si es necesario
  next();
});

// Conexión socket
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// Emitir cambios desde cualquier parte del servidor
function emitirEstadoActualizado(pedidoActualizado) {
  io.emit("estado_actualizado", {
    pedido_id: pedidoActualizado.id,
    nuevo_estado: pedidoActualizado.estado,
    usuario_id: pedidoActualizado.usuario_id
  });
}

// Exportar si se necesita en otros módulos
module.exports = { httpServer, emitirEstadoActualizado };

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo con Socket.IO en http://localhost:${PORT}`);
});
