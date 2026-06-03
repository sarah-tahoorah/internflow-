const express = require('express');
const { getInterns } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const router = express.Router();
router.get('/interns', protect, authorize('admin'), getInterns);
module.exports = router;