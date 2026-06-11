const express = require('express');
const router = express.Router();
const HardwareController = require('../controllers/hardware.controller');

// O Arduino fará o POST para: /api/hardware/scan
router.post('/scan', HardwareController.processScan);

module.exports = router;