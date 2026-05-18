const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');

// LISTAR 
router.get('/', ProductController.getAll);

// CRIAR
router.post('/', ProductController.create);

// ATUALIZAR
router.put('/:id', ProductController.update);

// DELETAR
router.delete('/:id', ProductController.delete);

// REGISTRAR VENDA
router.post('/:id/sale', ProductController.registerSale);

module.exports = router;