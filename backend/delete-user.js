const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected');
};
const deleteUser = async (email) => {
  const User = require('./models/User');
  const user = await User.findOneAndDelete({ email });
  if (user) {
    console.log(`✅ Deleted user: ${user.fullName} (${user.email})`);
  } else {
    console.log(`❌ User not found: ${email}`);
  }
  process.exit(0);
};
const email = process.argv[2];
if (!email) {
  console.log('Usage: node delete-user.js email@example.com');
  process.exit(1);
}
connectDB().then(() => deleteUser(email));