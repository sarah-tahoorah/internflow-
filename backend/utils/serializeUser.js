const serializePublicUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  domain: user.domain,
});

module.exports = { serializePublicUser };
