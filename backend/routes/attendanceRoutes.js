const express = require('express');
const {
  checkIn,
  getMyAttendance,
  getAttendanceSummary,
  getAllAttendance
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const router = express.Router();
router.post('/check-in', protect, authorize('intern'), checkIn);
router.get('/my-attendance', protect, authorize('intern'), getMyAttendance);
router.get('/summary/:internId', protect, getAttendanceSummary);
router.get('/', protect, authorize('admin'), getAllAttendance);
module.exports = router;