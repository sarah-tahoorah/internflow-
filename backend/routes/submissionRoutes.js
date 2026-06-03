const express = require('express');
const {
  submitTask,
  getMySubmissions,
  getAllSubmissions,
  reviewSubmission
} = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const router = express.Router();
router.post('/', protect, authorize('intern'), submitTask);
router.get('/my-submissions', protect, authorize('intern'), getMySubmissions);
router.get('/', protect, authorize('admin'), getAllSubmissions);
router.put('/:id/review', protect, authorize('admin'), reviewSubmission);
module.exports = router;