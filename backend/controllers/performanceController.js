const Task = require('../models/Task');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const calculateEligibility = (user, attendanceRate, completionRate, totalTasks, totalDays) => {
  if (user.role !== 'intern') {
    return {
      status: 'NOT APPLICABLE',
      isEligible: false,
      reasons: ['Certification eligibility applies only to intern users']
    };
  }
  const reasons = [];
  const attendance = parseFloat(attendanceRate);
  const completion = parseFloat(completionRate);
  if (totalTasks === 0) {
    reasons.push('No tasks assigned');
  }
  if (totalDays === 0) {
    reasons.push('Insufficient attendance data');
  }
  if (attendance < 75) {
    reasons.push('Attendance below 75%');
  }
  if (completion < 80) {
    reasons.push('Task completion below 80%');
  }
  const isEligible = totalTasks > 0 && totalDays > 0 && attendance >= 75 && completion >= 80;
  return {
    status: isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE',
    isEligible,
    reasons: isEligible ? [] : reasons,
    criteria: {
      attendanceRequired: 75,
      completionRequired: 80,
      attendanceMet: attendance >= 75,
      completionMet: completion >= 80
    }
  };
};
const getPerformance = async (req, res) => {
  try {
    const internId = req.params.internId;
    const user = await User.findById(internId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Performance metrics not available for admin users' });
    }
    const totalTasks = await Task.countDocuments({ assignedTo: internId });
    const completedTasks = await Submission.countDocuments({ 
      internId, 
      status: 'approved' 
    });
    const taskCompletionRate = totalTasks > 0 
      ? ((completedTasks / totalTasks) * 100).toFixed(2) 
      : '0.00';
    const totalDays = await Attendance.countDocuments({ internId });
    const presentDays = await Attendance.countDocuments({ 
      internId, 
      status: { $in: ['present', 'late'] }
    });
    const attendanceRate = totalDays > 0 
      ? ((presentDays / totalDays) * 100).toFixed(2) 
      : '0.00';
    const eligibility = calculateEligibility(user, attendanceRate, taskCompletionRate, totalTasks, totalDays);
    res.json({
      taskCompletionRate,
      attendanceRate,
      isEligible: eligibility.isEligible,
      eligibilityStatus: eligibility.status,
      eligibilityReasons: eligibility.reasons,
      completedTasks,
      totalTasks,
      presentDays,
      totalDays
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { getPerformance, calculateEligibility };