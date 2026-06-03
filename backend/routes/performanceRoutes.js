const express = require('express');
const { getPerformance } = require('../controllers/performanceController');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.get('/:internId', protect, getPerformance);
module.exports = router;