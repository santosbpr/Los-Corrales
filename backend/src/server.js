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
const userRoutes = require('./routes/users.routes');
const reportRoutes = require('./routes/reports.routes');
const exchangeRoutes = require('./routes/exchanges.routes');
const salesRoutes = require('./routes/sales.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: 'Ping! O servidor do Los Corrales está acordado.' });
});

// Rotas (cada prefixo registrado UMA vez)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/hardware', hardwareRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/sales', salesRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API do ERP funcionando perfeitamente!', version: '1.0.0' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;