const express = require('express');
const router = express.Router();
// Importe apenas UMA vez o controlador
const AuthController = require('../controllers/auth.controller');

// ROTA: POST /api/auth/login
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

module.exports = router;