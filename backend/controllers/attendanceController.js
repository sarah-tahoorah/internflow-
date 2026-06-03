const Attendance = require('../models/Attendance');
const checkIn = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ internId: req.user._id })
      .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAttendanceSummary = async (req, res) => {
  try {
    const internId = req.params.internId || req.user._id;
    const totalDays = await Attendance.countDocuments({ internId });
    const presentDays = await Attendance.countDocuments({ 
      internId, 
      status: { $in: ['present', 'late'] }
    });
    const absentDays = await Attendance.countDocuments({ internId, status: 'absent' });
    const lateDays = await Attendance.countDocuments({ internId, status: 'late' });
    const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
    res.json({
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      attendanceRate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate('internId', 'fullName email')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  checkIn,
  getMyAttendance,
  getAttendanceSummary,
  getAllAttendance
};