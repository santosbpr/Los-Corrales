const express = require('express');
const router = express.Router();
const SalesController = require('../controllers/sales.controller');
const authorize = require('../middlewares/auth.middleware');

// Venda do carrinho — ADMIN ou CAIXA
router.post('/', authorize(['ADMIN', 'CAIXA']), SalesController.createSale);
router.get('/customer/:customerId', authorize(['ADMIN', 'CAIXA']), SalesController.getCustomerSales);

module.exports = router;