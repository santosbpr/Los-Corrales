const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settings.controller');
const authorize = require('../middlewares/auth.middleware');

// Cores
router.get('/colors', SettingsController.getColors);
router.post('/colors', authorize(['ADMIN']), SettingsController.addColor);
router.delete('/colors/:id', authorize(['ADMIN']), SettingsController.deleteColor);

// Tamanhos
router.get('/sizes', SettingsController.getSizes);
router.post('/sizes', authorize(['ADMIN']), SettingsController.addSize);
router.delete('/sizes/:id', authorize(['ADMIN']), SettingsController.deleteSize);

// Categorias
router.get('/categories', SettingsController.getCategories);
router.post('/categories', authorize(['ADMIN']), SettingsController.addCategory);
router.delete('/categories/:id', authorize(['ADMIN']), SettingsController.deleteCategory);

module.exports = router;