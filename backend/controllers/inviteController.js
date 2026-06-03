const InviteToken = require('../models/InviteToken');
const crypto = require('crypto');
const createInvite = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ message: 'Email and role are required' });
    }
    if (!['admin', 'intern'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
    const invite = await InviteToken.create({
      token,
      email,
      role,
      createdBy: req.user._id,
      expiresAt
    });
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?token=${token}`;
    res.status(201).json({
      success: true,
      invite: {
        email,
        role,
        token,
        inviteLink,
        expiresAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getInvites = async (req, res) => {
  try {
    const invites = await InviteToken.find()
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });
    res.json(invites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { createInvite, getInvites };