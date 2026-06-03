const mongoose = require('mongoose');
require('dotenv').config();
async function fixMissingDomains() {
  try {
    console.log('🔧 Starting domain fix for existing users...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const usersWithoutDomain = await usersCollection.find({
      $or: [
        { domain: { $exists: false } },
        { domain: null },
        { domain: '' }
      ]
    }).toArray();
    console.log(`\n📋 Found ${usersWithoutDomain.length} users without domain`);
    if (usersWithoutDomain.length === 0) {
      console.log('✅ All users already have domains assigned');
      process.exit(0);
    }
    let updated = 0;
    for (const user of usersWithoutDomain) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { domain: 'Web Development' } }
      );
      console.log(`✓ Updated user: ${user.email} → domain: Web Development`);
      updated++;
    }
    console.log(`\n✅ Migration completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   - Users updated: ${updated}`);
    console.log(`   - Default domain: Web Development`);
    console.log(`\n⚠️  IMPORTANT: Users should update their domain in their profile if needed.`);
    console.log(`⚠️  IMPORTANT: Restart your backend server to apply schema changes.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}
fixMissingDomains();