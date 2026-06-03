const User = require('../models/User');
const Task = require('../models/Task');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user._id;
    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password. Account deletion cancelled.' });
    }
    if (user.role === 'intern') {
      await Submission.deleteMany({ internId: userId });
      await Attendance.deleteMany({ internId: userId });
      await Task.updateMany(
        { assignedTo: userId },
        { $pull: { assignedTo: userId } }
      );
    } else if (user.role === 'admin') {
      await Task.deleteMany({ createdBy: userId });
    }
    await User.findByIdAndDelete(userId);
    console.log(`[ACCOUNT_DELETION] User ${userId} (${user.role}) deleted account at ${new Date().toISOString()}`);
    res.json({ 
      success: true,
      message: 'Account permanently deleted. All associated data has been removed.' 
    });
  } catch (error) {
    console.error('[ACCOUNT_DELETION_ERROR]', error);
    res.status(500).json({ message: 'Failed to delete account. Please try again.' });
  }
};
module.exports = {
  deleteAccount
};