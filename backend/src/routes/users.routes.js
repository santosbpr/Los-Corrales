const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authorize = require('../middlewares/auth.middleware');

// Somente ADMIN gerencia usuários
router.get('/', authorize(['ADMIN']), UserController.listUsers);
router.post('/reset-password', authorize(['ADMIN']), UserController.resetPassword);

// Solicitações de redefinição de senha (esqueci a senha)
router.get('/reset-requests', authorize(['ADMIN']), UserController.listResetRequests);
router.post('/reset-requests/:id/dismiss', authorize(['ADMIN']), UserController.dismissResetRequest);

router.delete('/:email', authorize(['ADMIN']), UserController.deleteUser);

module.exports = router;