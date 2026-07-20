const Attendance = require('../models/Attendance');
const asyncHandler = require('../utils/asyncHandler');
const { formatRate, PRESENT_STATUSES } = require('../utils/attendanceStats');
const checkIn = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existingAttendance = await Attendance.findOne({
    internId: req.user._id,
    date: { $gte: today }
  });
  if (existingAttendance) {
    return res.status(400).json({ message: 'Already checked in today' });
  }
  const checkInTime = new Date();
  const cutoffTime = new Date();
  cutoffTime.setHours(9, 30, 0, 0);
  const status = checkInTime > cutoffTime ? 'late' : 'present';
  const attendance = await Attendance.create({
    internId: req.user._id,
    date: today,
    checkInTime,
    status
  });
  res.status(201).json(attendance);
});
const getMyAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({ internId: req.user._id })
    .sort({ date: -1 });
  res.json(attendance);
});
const getAttendanceSummary = asyncHandler(async (req, res) => {
  const internId = req.params.internId || req.user._id;
  const totalDays = await Attendance.countDocuments({ internId });
  const presentDays = await Attendance.countDocuments({ 
    internId, 
    status: { $in: PRESENT_STATUSES }
  });
  const absentDays = await Attendance.countDocuments({ internId, status: 'absent' });
  const lateDays = await Attendance.countDocuments({ internId, status: 'late' });
  const attendanceRate = formatRate(presentDays, totalDays);
  res.json({
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    attendanceRate
  });
});
const getAllAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find()
    .populate('internId', 'fullName email')
    .sort({ date: -1 });
  res.json(attendance);
});
module.exports = {
  checkIn,
  getMyAttendance,
  getAttendanceSummary,
  getAllAttendance
};
