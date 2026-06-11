const express = require('express');
const router = express.Router();
const FinanceController = require('../controllers/finance.controller');
const authorize = require('../middlewares/auth.middleware');

router.get('/', authorize(['ADMIN']), FinanceController.getTransactions);
router.post('/', FinanceController.addTransaction);

module.exports = router;