const Submission = require('../models/Submission');
const Task = require('../models/Task');
const submitTask = async (req, res) => {
  try {
    const { taskId, submissionLink, remarks } = req.body;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const existingSubmission = await Submission.findOne({
      taskId,
      internId: req.user._id
    });
    if (existingSubmission) {
      return res.status(400).json({ message: 'Task already submitted' });
    }
    const submission = await Submission.create({
      taskId,
      internId: req.user._id,
      submissionLink,
      remarks
    });
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ internId: req.user._id })
      .populate('taskId', 'title description deadline priority')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('taskId', 'title description')
      .populate('internId', 'fullName email')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const reviewSubmission = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      {
        status,
        feedback,
        reviewedBy: req.user._id
      },
      { new: true }
    );
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  submitTask,
  getMySubmissions,
  getAllSubmissions,
  reviewSubmission
};