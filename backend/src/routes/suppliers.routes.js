const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/supplier.controller');
const authorize = require('../middlewares/auth.middleware');

router.get('/', authorize(['ADMIN']), SupplierController.getSuppliers);
router.post('/', authorize(['ADMIN']), SupplierController.createSupplier);
router.put('/:id', authorize(['ADMIN']), SupplierController.updateSupplier);
router.delete('/:id', authorize(['ADMIN']), SupplierController.deleteSupplier);

module.exports = router;