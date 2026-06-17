const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authorize = require('../middlewares/auth.middleware');

// Somente ADMIN gerencia usuários
router.get('/', authorize(['ADMIN']), UserController.listUsers);
router.post('/reset-password', authorize(['ADMIN']), UserController.resetPassword);
router.delete('/:email', authorize(['ADMIN']), UserController.deleteUser);

module.exports = router;