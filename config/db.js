const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',       // Usuario de PostgreSQL
  host: 'localhost',        // Host de la base de datos
  database: 'boticavdl',  // Nombre de la base de datos
  password: '5411747',// Contraseña de PostgreSQL
  port: 5432,               // Puerto de PostgreSQL
});

module.exports = pool;