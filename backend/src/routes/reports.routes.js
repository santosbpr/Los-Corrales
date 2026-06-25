const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const authorize = require('../middlewares/auth.middleware');

router.get('/financial', authorize(['ADMIN']), ReportController.financial);
router.get('/inventory', authorize(['ADMIN']), ReportController.inventory);
router.get('/users', authorize(['ADMIN']), ReportController.users);

module.exports = router;