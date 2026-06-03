const mongoose = require('mongoose');
const submissionSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  internId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submissionLink: {
    type: String,
    required: [true, 'Please provide submission link']
  },
  remarks: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'approved', 'rejected'],
    default: 'submitted'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  feedback: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});
submissionSchema.index({ taskId: 1, internId: 1 }, { unique: true });
module.exports = mongoose.model('Submission', submissionSchema);