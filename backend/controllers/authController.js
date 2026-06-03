const User = require('../models/User');
const jwt = require('jsonwebtoken');
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};
const register = async (req, res) => {
  try {
    const { fullName, email, password, role, domain, internshipDuration, companyName, phoneNumber } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    if (role === 'admin') {
      if (!companyName || !companyName.trim()) {
        return res.status(400).json({ message: 'Company Name is required for admin registration' });
      }
      if (!phoneNumber || !phoneNumber.trim()) {
        return res.status(400).json({ message: 'Phone Number is required for admin registration' });
      }
      if (!/^[0-9]{10,15}$/.test(phoneNumber)) {
        return res.status(400).json({ message: 'Please provide a valid phone number (10-15 digits)' });
      }
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const userData = {
      fullName,
      email,
      password,
      role: role || 'intern',
      domain
    };
    if (role === 'admin') {
      userData.companyName = companyName;
      userData.phoneNumber = phoneNumber;
    } else {
      userData.internshipDuration = internshipDuration;
    }
    const user = await User.create(userData);
    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        domain: user.domain,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        domain: user.domain,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getMe = async (req, res) => {
  res.json(req.user);
};
module.exports = {
  register,
  login,
  getMe,
};