const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const authorize = require('../middlewares/auth.middleware');

// Vendas/caixa -> ADMIN e CAIXA | Estoque -> ADMIN e ESTOQUISTA | Usuários -> só ADMIN
router.get('/financial', authorize(['ADMIN', 'CAIXA']), ReportController.financial);
router.get('/inventory', authorize(['ADMIN', 'ESTOQUISTA']), ReportController.inventory);
router.get('/users', authorize(['ADMIN']), ReportController.users);

module.exports = router;