const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected\n');
};
const listUsers = async () => {
  const User = require('./models/User');
  const users = await User.find().select('fullName email role createdAt');
  console.log(`Total Users: ${users.length}\n`);
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.fullName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Registered: ${user.createdAt.toLocaleDateString()}\n`);
  });
  process.exit(0);
};
connectDB().then(listUsers);