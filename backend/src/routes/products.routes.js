const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const authorize = require('../middlewares/auth.middleware');

// LISTAR 
router.get('/', ProductController.getAll);

// CRIAR
router.post('/', ProductController.create);

// ATUALIZAR
router.put('/:id', ProductController.update);

// DELETAR
router.delete('/:id', authorize(['ADMIN']), ProductController.delete);

// REGISTRAR VENDA
router.post('/:id/sale', ProductController.registerSale);

module.exports = router;