const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');
const { authorize } = require('../middlewares/auth.middleware');

// Rota GET /api/dashboard/summary
router.get('/summary', authorize(['ADMIN']), DashboardController.getSummary);

module.exports = router;