const express = require('express');
const router = express.Router();
const { deleteAccount } = require('../controllers/accountController');
const { protect } = require('../middleware/auth');
router.delete('/delete', protect, deleteAccount);
module.exports = router;