const express = require('express');
const { createInvite, getInvites } = require('../controllers/inviteController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const router = express.Router();
router.post('/', protect, authorize('admin'), createInvite);
router.get('/', protect, authorize('admin'), getInvites);
module.exports = router;