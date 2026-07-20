const User = require('../models/User');
const getInterns = async (req, res) => {
  try {
    const query = { role: 'intern' };
    if (req.user.role === 'admin') {
      query.domain = req.user.domain;
    }
    const interns = await User.find(query).select('fullName email domain');
    res.json(interns);
  } catch (error) {
    console.error('[GET_INTERNS_ERROR]', error);
    res.status(500).json({ message: error.message });
  }
};
module.exports = { getInterns };