const mongoose = require('mongoose');
const attendanceSchema = new mongoose.Schema({
  internId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkInTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present'
  },
  remarks: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});
attendanceSchema.index({ internId: 1, date: 1 }, { unique: true });
module.exports = mongoose.model('Attendance', attendanceSchema);