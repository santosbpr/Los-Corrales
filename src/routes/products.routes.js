const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');

//Quando o Front fizer um POST para /api/products, chamamos o controlador
router.post('/', ProductController.createProductWithVariants);

//Quando fizer um GET, listamos os produtos
router.get('/', ProductController.listAll);

module.exports = router;