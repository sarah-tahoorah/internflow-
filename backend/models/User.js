const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'intern'],
    default: 'intern'
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
    default: 'Web Development'
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  internshipDuration: {
    type: Number,
    enum: [3, 6, 12],
    required: function() {
      return this.role !== 'admin';
    }
  },
  companyName: {
    type: String,
    trim: true,
    required: function() {
      return this.role === 'admin';
    }
  },
  phoneNumber: {
    type: String,
    trim: true,
    required: function() {
      return this.role === 'admin';
    },
    match: [/^[0-9]{10,15}$/, 'Please provide valid phone number']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  education: {
    type: String,
    trim: true
  },
  resumeUrl: {
    type: String
  }
}, {
  timestamps: true
});
userSchema.pre('save', async function(next) {
  if (this.role === 'admin') {
    this.internshipDuration = undefined;
    if (!this.companyName) {
      return next(new Error('Company Name is required for admin users'));
    }
    if (!this.phoneNumber) {
      return next(new Error('Phone Number is required for admin users'));
    }
  } else {
    this.companyName = undefined;
    this.phoneNumber = undefined;
  }
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model('User', userSchema);