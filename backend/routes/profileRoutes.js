const express = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.route('/:userId')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
module.exports = router;