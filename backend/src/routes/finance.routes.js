const express = require('express');
const router = express.Router();
const FinanceController = require('../controllers/finance.controller');

router.get('/', FinanceController.getTransactions);
router.post('/', FinanceController.addTransaction);

module.exports = router;