require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const settingsRoutes = require('./routes/settings.route');
const customerRoutes = require('./routes/customers.routes');
const financeRoutes = require('./routes/finance.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// 1. Inicializa o aplicativo Express (O "app" nasce aqui!)
const app = express();

// 2. Middlewares básicos (Avisam o app como ele deve se comportar)
app.use(cors()); 
app.use(express.json()); 

// 3. Importação e uso das rotas (Agora sim, o app já existe para ser usado!)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
// 4. Rota de teste (Health Check)
app.get('/', (req, res) => {
    res.json({ 
        message: 'API do ERP funcionando perfeitamente!',
        version: '1.0.0'
    });
});

// 5. Define a porta e inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// 6. Rota de Finanças (Finance) - Importante: Deve ser a última para evitar conflitos
app.use('/api/finance', financeRoutes);

// 7. Rota de Clientes (Customer) - Importante: Deve ser a última para evitar conflitos
app.use('/api/customers', customerRoutes);

// 8. Rota de Configurações (Settings) - Importante: Deve ser a última para evitar conflitos
app.use('/api/settings', settingsRoutes);


module.exports = app;