const mongoose = require('mongoose');
require('dotenv').config();
async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const totalUsers = await usersCollection.countDocuments();
    const admins = await usersCollection.countDocuments({ role: 'admin' });
    const interns = await usersCollection.countDocuments({ role: 'intern' });
    const activeUsers = await usersCollection.countDocuments({ isActive: true });
    console.log('📊 USER STATISTICS');
    console.log('==================');
    console.log(`Total Users:    ${totalUsers}`);
    console.log(`Admins:         ${admins}`);
    console.log(`Interns:        ${interns}`);
    console.log(`Active Users:   ${activeUsers}`);
    console.log('');
    const users = await usersCollection.find({}).project({ 
      fullName: 1, 
      email: 1, 
      role: 1, 
      domain: 1,
      isActive: 1 
    }).toArray();
    console.log('👥 USER LIST');
    console.log('============');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName} (${user.email})`);
      console.log(`   Role: ${user.role} | Domain: ${user.domain || 'N/A'} | Active: ${user.isActive}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}
checkUsers();