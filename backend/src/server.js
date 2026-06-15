require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const settingsRoutes = require('./routes/settings.route');
const customerRoutes = require('./routes/customers.routes');
const financeRoutes = require('./routes/finance.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const hardwareRoutes = require('./routes/hardware.routes');

// 1. Inicializa o aplicativo Express
const app = express();

// 2. Middlewares básicos
app.use(cors());
app.use(express.json());

// Ping para manter o Render acordado
app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: 'Ping! O servidor do Los Corrales está acordado.' });
});

// 3. Rotas (cada prefixo registrado UMA vez)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/hardware', hardwareRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/settings', settingsRoutes);

// 4. Health check
app.get('/', (req, res) => {
  res.json({
    message: 'API do ERP funcionando perfeitamente!',
    version: '1.0.0'
  });
});

// 5. Porta e start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;