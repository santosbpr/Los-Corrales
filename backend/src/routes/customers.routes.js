const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customer.controller');
const authorize = require('../middlewares/auth.middleware');

// Leitura liberada (CRM lista; futura seleção em outros fluxos)
router.get('/', CustomerController.getCustomers);
router.get('/:id', CustomerController.getCustomerById);

// Mutações: somente ADMIN
router.post('/', authorize(['ADMIN']), CustomerController.createCustomer);
router.put('/:id', authorize(['ADMIN']), CustomerController.updateCustomer);
router.delete('/:id', authorize(['ADMIN']), CustomerController.deleteCustomer);

module.exports = router;