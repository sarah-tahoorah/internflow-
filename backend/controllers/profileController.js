const User = require('../models/User');
const Task = require('../models/Task');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');
const { calculateEligibility } = require('./performanceController');
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;
    if (requestingUser._id.toString() !== userId) {
      if (requestingUser.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: You can only view your own profile' });
      }
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (targetUser.role === 'admin' || targetUser.domain !== requestingUser.domain) {
        return res.status(403).json({ message: 'Access denied: Domain mismatch' });
      }
    }
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const response = {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        domain: user.domain,
        education: user.education,
        resumeUrl: user.resumeUrl,
        joiningDate: user.joiningDate,
        isActive: user.isActive
      }
    };
    if (user.role === 'admin') {
      response.user.companyName = user.companyName;
      response.user.phoneNumber = user.phoneNumber;
      return res.json(response);
    }
    response.user.internshipDuration = user.internshipDuration;
    const tasks = await Task.find({ assignedTo: userId });
    const submissions = await Submission.find({ internId: userId });
    const attendance = await Attendance.find({ internId: userId });
    const completedTasks = submissions.filter(s => s.status === 'approved').length;
    const pendingTasks = tasks.length - submissions.length;
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : '0.00';
    const completionRate = tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(2) : '0.00';
    const eligibility = calculateEligibility(user, attendanceRate, completionRate, tasks.length, totalDays);
    response.workProgress = {
      totalTasks: tasks.length,
      completedTasks,
      pendingTasks,
      submissions: submissions.length
    };
    response.performance = {
      attendanceRate,
      completionRate,
      totalAttendanceDays: totalDays,
      presentDays,
      absentDays: attendance.filter(a => a.status === 'absent').length,
      lateDays: attendance.filter(a => a.status === 'late').length
    };
    response.eligibility = {
      status: eligibility.status,
      isEligible: eligibility.isEligible,
      reasons: eligibility.reasons,
      criteria: eligibility.criteria
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;
    if (requestingUser._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: You can only update your own profile' });
    }
    const { education, resumeUrl, companyName, phoneNumber } = req.body;
    const updateData = {};
    if (education !== undefined) updateData.education = education;
    if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl;
    if (requestingUser.role === 'admin') {
      if (companyName !== undefined) updateData.companyName = companyName;
      if (phoneNumber !== undefined) {
        if (!/^[0-9]{10,15}$/.test(phoneNumber)) {
          return res.status(400).json({ message: 'Please provide a valid phone number (10-15 digits)' });
        }
        updateData.phoneNumber = phoneNumber;
      }
    }
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getUserProfile,
  updateUserProfile
};