const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const authorize = require('../middlewares/auth.middleware');

// LISTAR (leitura liberada a qualquer autenticado — CAIXA/ESTOQUISTA veem o estoque)
router.get('/', ProductController.getAll);

// CRIAR / ATUALIZAR / DELETAR — somente ADMIN (produtos são somente leitura para os demais)
router.post('/', authorize(['ADMIN']), ProductController.create);
router.put('/:id', authorize(['ADMIN']), ProductController.update);
router.delete('/:id', authorize(['ADMIN']), ProductController.delete);

// REGISTRAR VENDA (endpoint legado de item único)
router.post('/:id/sale', ProductController.registerSale);

module.exports = router;