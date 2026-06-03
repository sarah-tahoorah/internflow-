const Task = require('../models/Task');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const mongoose = require('mongoose');
const getInternAnalytics = async (req, res) => {
  try {
    const internId = req.params.internId;
    const { startDate, endDate } = req.query;
    const user = await User.findById(internId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Analytics not available for admin users' });
    }
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const attendanceData = await Attendance.find({ internId, ...dateFilter });
    const totalDays = attendanceData.length;
    const presentDays = attendanceData.filter(a => a.status === 'present' || a.status === 'late').length;
    const absentDays = attendanceData.filter(a => a.status === 'absent').length;
    const lateDays = attendanceData.filter(a => a.status === 'late').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
    const monthlyAttendance = await Attendance.aggregate([
      { $match: { internId: new mongoose.Types.ObjectId(internId) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          present: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    const tasks = await Task.find({ assignedTo: internId });
    const submissions = await Submission.find({ internId });
    const totalTasks = tasks.length;
    const submittedTasks = submissions.length;
    const pendingTasks = totalTasks - submittedTasks;
    const approvedTasks = submissions.filter(s => s.status === 'approved').length;
    const rejectedTasks = submissions.filter(s => s.status === 'rejected').length;
    const lateSubmissions = submissions.filter(sub => {
      const task = tasks.find(t => t._id.toString() === sub.taskId.toString());
      return task && new Date(sub.submittedAt) > new Date(task.deadline);
    }).length;
    const submissionRate = totalTasks > 0 ? ((submittedTasks / totalTasks) * 100).toFixed(2) : 0;
    const taskCompletionRate = totalTasks > 0 ? ((approvedTasks / totalTasks) * 100).toFixed(2) : 0;
    const weeklySubmissions = await Submission.aggregate([
      { $match: { internId: new mongoose.Types.ObjectId(internId) } },
      {
        $group: {
          _id: { $week: "$submittedAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);
    const performanceScore = calculatePerformanceScore({
      attendancePercentage: parseFloat(attendancePercentage),
      taskCompletionRate: parseFloat(taskCompletionRate),
      submissionRate: parseFloat(submissionRate),
      lateSubmissions,
      totalTasks
    });
    const kpiStatus = {
      attendance: attendancePercentage >= 85 ? 'excellent' : attendancePercentage >= 70 ? 'good' : 'poor',
      taskCompletion: taskCompletionRate >= 80 ? 'excellent' : taskCompletionRate >= 60 ? 'good' : 'poor',
      submissions: submissionRate >= 90 ? 'excellent' : submissionRate >= 70 ? 'good' : 'poor'
    };
    res.json({
      attendance: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendancePercentage,
        monthlyTrend: monthlyAttendance
      },
      submissions: {
        totalTasks,
        submittedTasks,
        pendingTasks,
        approvedTasks,
        rejectedTasks,
        lateSubmissions,
        submissionRate,
        weeklyTrend: weeklySubmissions
      },
      performance: {
        taskCompletionRate,
        performanceScore,
        kpiStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAdminAnalytics = async (req, res) => {
  try {
    const interns = await User.find({ role: 'intern' });
    const analyticsPromises = interns.map(async (intern) => {
      const tasks = await Task.find({ assignedTo: intern._id });
      const submissions = await Submission.find({ internId: intern._id });
      const attendance = await Attendance.find({ internId: intern._id });
      const totalDays = attendance.length;
      const presentDays = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
      const approvedTasks = submissions.filter(s => s.status === 'approved').length;
      const taskCompletionRate = tasks.length > 0 ? ((approvedTasks / tasks.length) * 100).toFixed(2) : 0;
      return {
        internId: intern._id,
        name: intern.fullName,
        email: intern.email,
        domain: intern.domain,
        attendancePercentage,
        taskCompletionRate,
        totalTasks: tasks.length,
        completedTasks: approvedTasks
      };
    });
    const analytics = await Promise.all(analyticsPromises);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
function calculatePerformanceScore({ attendancePercentage, taskCompletionRate, submissionRate, lateSubmissions, totalTasks }) {
  const attendanceWeight = 0.3;
  const taskCompletionWeight = 0.4;
  const submissionWeight = 0.2;
  const punctualityWeight = 0.1;
  const punctualityScore = totalTasks > 0 ? ((totalTasks - lateSubmissions) / totalTasks) * 100 : 100;
  const score = (
    (attendancePercentage * attendanceWeight) +
    (taskCompletionRate * taskCompletionWeight) +
    (submissionRate * submissionWeight) +
    (punctualityScore * punctualityWeight)
  );
  return {
    overall: score.toFixed(2),
    grade: score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D',
    breakdown: {
      attendance: attendancePercentage,
      taskCompletion: taskCompletionRate,
      submission: submissionRate,
      punctuality: punctualityScore.toFixed(2)
    }
  };
}
const exportAdminAnalyticsCSV = async (req, res) => {
  try {
    const adminDomain = req.user.domain;
    if (!adminDomain) {
      console.warn(`[ACCESS_DENIED] Admin ${req.user._id} has no domain`);
      return res.status(403).json({ message: 'Access denied: No domain assigned' });
    }
    const interns = await User.find({ 
      role: 'intern',
      domain: adminDomain 
    });
    if (interns.length === 0) {
      return res.status(404).json({ message: 'No interns found in your domain' });
    }
    const analyticsPromises = interns.map(async (intern) => {
      if (intern.domain !== adminDomain) {
        console.error(`[SECURITY_VIOLATION] Domain mismatch for intern ${intern._id}`);
        return null;
      }
      const tasks = await Task.find({ assignedTo: intern._id });
      const submissions = await Submission.find({ internId: intern._id });
      const attendance = await Attendance.find({ internId: intern._id });
      const totalDays = attendance.length;
      const presentDays = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const absentDays = attendance.filter(a => a.status === 'absent').length;
      const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
      const approvedTasks = submissions.filter(s => s.status === 'approved').length;
      const pendingTasks = tasks.length - submissions.length;
      const taskCompletionRate = tasks.length > 0 ? ((approvedTasks / tasks.length) * 100).toFixed(2) : 0;
      return {
        name: intern.fullName,
        email: intern.email,
        domain: intern.domain,
        totalTasks: tasks.length,
        completedTasks: approvedTasks,
        pendingTasks,
        taskCompletionRate,
        totalDays,
        presentDays,
        absentDays,
        attendancePercentage
      };
    });
    const analytics = (await Promise.all(analyticsPromises)).filter(a => a !== null);
    const csvHeader = 'Name,Email,Domain,Total Tasks,Completed Tasks,Pending Tasks,Task Completion Rate (%),Total Days,Present Days,Absent Days,Attendance Rate (%)\n';
    const csvRows = analytics.map(a => 
      `"${a.name}","${a.email}","${a.domain}",${a.totalTasks},${a.completedTasks},${a.pendingTasks},${a.taskCompletionRate},${a.totalDays},${a.presentDays},${a.absentDays},${a.attendancePercentage}`
    ).join('\n');
    const csv = csvHeader + csvRows;
    const filename = `intern-analytics-${adminDomain.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error('[EXPORT_CSV_ERROR]', error);
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getInternAnalytics,
  getAdminAnalytics,
  exportAdminAnalyticsCSV
};