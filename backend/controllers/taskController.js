const Task = require('../models/Task');
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, deadline, priority, domain } = req.body;
    if (!domain) {
      return res.status(400).json({ message: 'Domain is required' });
    }
    if (assignedTo && assignedTo.length > 0) {
      const User = require('../models/User');
      const interns = await User.find({
        _id: { $in: assignedTo },
        role: 'intern',
        domain: domain
      });
      if (interns.length !== assignedTo.length) {
        return res.status(403).json({ 
          message: `All assigned interns must be from ${domain} domain`,
          violation: 'DOMAIN_MISMATCH'
        });
      }
    }
    const task = await Task.create({
      title,
      description,
      domain,
      assignedTo: assignedTo || [],
      deadline,
      priority,
      createdBy: req.user._id
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getTasks = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'intern') {
      query.assignedTo = req.user._id;
    }
    if (req.user.role === 'admin') {
      query.domain = req.user.domain;
    }
    const tasks = await Task.find(query)
      .populate('assignedTo', 'fullName email domain')
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'fullName email')
      .populate('createdBy', 'fullName');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (req.user.role === 'admin' && task.domain !== req.user.domain) {
      return res.status(403).json({ 
        message: 'Access denied: Task belongs to different domain',
        violation: 'DOMAIN_MISMATCH'
      });
    }
    if (req.body.domain && req.body.domain !== task.domain) {
      return res.status(403).json({ 
        message: 'Domain cannot be modified after task creation',
        violation: 'IMMUTABLE_FIELD'
      });
    }
    if (req.body.assignedTo) {
      const User = require('../models/User');
      const interns = await User.find({
        _id: { $in: req.body.assignedTo },
        role: 'intern',
        domain: task.domain
      });
      if (interns.length !== req.body.assignedTo.length) {
        return res.status(403).json({ 
          message: `All assigned interns must be from ${task.domain} domain`,
          violation: 'DOMAIN_MISMATCH'
        });
      }
    }
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
};