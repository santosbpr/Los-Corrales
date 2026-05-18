const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settings.controller');

// Rotas de Cores
router.get('/colors', SettingsController.getColors);
router.post('/colors', SettingsController.addColor);
router.delete('/colors/:id', SettingsController.deleteColor);

// Rotas de Tamanhos
router.get('/sizes', SettingsController.getSizes);
router.post('/sizes', SettingsController.addSize);
router.delete('/sizes/:id', SettingsController.deleteSize);

// Rotas de Categorias
router.get('/categories', SettingsController.getCategories);
router.post('/categories', SettingsController.addCategory);
router.delete('/categories/:id', SettingsController.deleteCategory);

module.exports = router;