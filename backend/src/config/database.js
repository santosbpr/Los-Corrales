const { Pool } = require('pg');
require('dotenv').config();

// Configuração da Pool de conexões com o banco de dados
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Teste rápido para garantir que a conexão funciona quando o sistema subir
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados em nuvem:', err.stack);
    } else {
        console.log('Banco de dados conectado com sucesso! Data/Hora do Servidor:', res.rows[0].now);
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};