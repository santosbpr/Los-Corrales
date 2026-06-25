const express = require('express');
const router = express.Router();
const ExchangeController = require('../controllers/exchange.controller');
const authorize = require('../middlewares/auth.middleware');

// Solicitar e listar: ADMIN ou CAIXA. Aprovar/rejeitar: somente ADMIN.
router.post('/', authorize(['ADMIN', 'CAIXA']), ExchangeController.create);
router.get('/', authorize(['ADMIN', 'CAIXA']), ExchangeController.list);
router.post('/:id/approve', authorize(['ADMIN']), ExchangeController.approve);
router.post('/:id/reject', authorize(['ADMIN']), ExchangeController.reject);

module.exports = router;