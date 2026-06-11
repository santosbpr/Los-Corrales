const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');

// Rota GET /api/dashboard/summary
router.get('/summary', DashboardController.getSummary);

module.exports = router;