const User = require('../models/User');
const enforceDomain = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next();
    }
    const adminDomain = req.user.domain;
    if (!adminDomain) {
      return res.status(403).json({ 
        message: 'Admin must have a domain assigned' 
      });
    }
    req.adminDomain = adminDomain;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const validateInternAccess = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next();
    }
    const { internId, assignedTo } = req.body;
    const adminDomain = req.user.domain;
    const internIds = internId ? [internId] : (assignedTo || []);
    if (internIds.length === 0) {
      return next();
    }
    const interns = await User.find({
      _id: { $in: internIds },
      role: 'intern'
    }).select('domain');
    if (interns.length !== internIds.length) {
      return res.status(404).json({ 
        message: 'One or more interns not found' 
      });
    }
    const invalidInterns = interns.filter(intern => intern.domain !== adminDomain);
    if (invalidInterns.length > 0) {
      return res.status(403).json({ 
        message: `Access denied: You can only assign tasks to ${adminDomain} interns`,
        violation: 'DOMAIN_MISMATCH'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const validateTaskDomain = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next();
  }
  const adminDomain = req.user.domain;
  const taskDomain = req.body.domain;
  if (!taskDomain) {
    req.body.domain = adminDomain;
    return next();
  }
  if (taskDomain !== adminDomain) {
    return res.status(403).json({ 
      message: `Access denied: You can only create ${adminDomain} tasks`,
      violation: 'DOMAIN_MISMATCH'
    });
  }
  next();
};
module.exports = {
  enforceDomain,
  validateInternAccess,
  validateTaskDomain
};