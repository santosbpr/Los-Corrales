const express = require('express');
const router = express.Router();
const FinanceController = require('../controllers/finance.controller');
const authorize = require('../middlewares/auth.middleware');

// Leitura e lançamento financeiro: operações de gestão -> ADMIN
router.get('/', authorize(['ADMIN']), FinanceController.getTransactions);
router.post('/', authorize(['ADMIN']), FinanceController.addTransaction);

module.exports = router;