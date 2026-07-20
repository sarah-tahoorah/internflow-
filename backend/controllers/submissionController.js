const Submission = require('../models/Submission');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const submitTask = asyncHandler(async (req, res) => {
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
});
const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ internId: req.user._id })
    .populate('taskId', 'title description deadline priority')
    .sort({ submittedAt: -1 });
  res.json(submissions);
});
const getAllSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find()
    .populate('taskId', 'title description')
    .populate('internId', 'fullName email')
    .sort({ submittedAt: -1 });
  res.json(submissions);
});
const reviewSubmission = asyncHandler(async (req, res) => {
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
});
module.exports = {
  submitTask,
  getMySubmissions,
  getAllSubmissions,
  reviewSubmission
};
