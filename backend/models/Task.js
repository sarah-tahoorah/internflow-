const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide task title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide task description']
  },
  domain: {
    type: String,
    required: [true, 'Domain is required'],
    enum: [
      'Artificial Intelligence',
      'Machine Learning',
      'Web Development',
      'MERN Stack Development',
      'Data Science',
      'Data Analytics',
      'Frontend Development',
      'Backend Development'
    ],
    immutable: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  deadline: {
    type: Date,
    required: [true, 'Please provide deadline']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});
module.exports = mongoose.model('Task', taskSchema);