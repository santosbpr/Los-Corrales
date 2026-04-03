require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/products.routes');
app.use('/api/products', productRoutes);

// Inicializa o aplicativo Express
const app = express();

// Middlewares básicos
app.use(cors()); // Permite que o front-end se comunique com esta API
app.use(express.json()); // Permite que a API entenda requisições no formato JSON

// Rota de teste (Health Check)
app.get('/', (req, res) => {
    res.json({ 
        message: 'API do ERP Los Corrales funcionando perfeitamente!',
        version: '1.0.0'
    });
});

// Define a porta e inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});