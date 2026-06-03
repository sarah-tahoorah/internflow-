require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
async function testRegistration() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    const testUser = await User.create({
      fullName: 'Test Intern',
      email: 'intern@test.com',
      password: 'test123',
      role: 'intern',
      department: 'Engineering',
      internshipDuration: 3
    });
    console.log('Test user created:', testUser);
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}
testRegistration();