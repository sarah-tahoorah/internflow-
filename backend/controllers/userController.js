const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const getInterns = asyncHandler(async (req, res) => {
  const query = { role: 'intern' };
  if (req.user.role === 'admin') {
    query.domain = req.user.domain;
  }
  const interns = await User.find(query).select('fullName email domain');
  res.json(interns);
});
module.exports = { getInterns };
