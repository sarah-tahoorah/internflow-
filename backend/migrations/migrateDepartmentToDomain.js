const mongoose = require('mongoose');
require('dotenv').config();
const DOMAIN_MAPPING = {
  'Web Development': 'Web Development',
  'Mobile Development': 'Frontend Development',
  'Data Science': 'Data Science',
  'UI/UX Design': 'Frontend Development',
  'DevOps': 'Backend Development',
  'Artificial Intelligence': 'Artificial Intelligence',
  'Cyber Security': 'Backend Development',
  'Cloud Computing': 'Backend Development',
  'General': 'Web Development'
};
async function migrate() {
  try {
    console.log('🔄 Starting migration: Department → Domain');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    const db = mongoose.connection.db;
    console.log('\n📋 Migrating Users collection...');
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({ department: { $exists: true } }).toArray();
    console.log(`Found ${users.length} users with "department" field`);
    for (const user of users) {
      const newDomain = DOMAIN_MAPPING[user.department] || 'Web Development';
      await usersCollection.updateOne(
        { _id: user._id },
        { 
          $set: { domain: newDomain },
          $unset: { department: '' }
        }
      );
      console.log(`✓ Migrated user: ${user.email} | ${user.department} → ${newDomain}`);
    }
    console.log('\n📋 Migrating Tasks collection...');
    const tasksCollection = db.collection('tasks');
    const tasks = await tasksCollection.find({}).toArray();
    console.log(`Found ${tasks.length} tasks to verify`);
    for (const task of tasks) {
      if (!task.domain || !Object.values(DOMAIN_MAPPING).includes(task.domain)) {
        const newDomain = 'Web Development';
        await tasksCollection.updateOne(
          { _id: task._id },
          { $set: { domain: newDomain } }
        );
        console.log(`✓ Updated task: ${task.title} → ${newDomain}`);
      }
    }
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users migrated: ${users.length}`);
    console.log(`   - Tasks verified: ${tasks.length}`);
    console.log('\n⚠️  IMPORTANT: Restart your backend server to apply schema changes.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}
migrate();