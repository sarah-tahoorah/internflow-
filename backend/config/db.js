const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI;
  const startMemoryServer = async () => {
    console.warn('Starting in-memory MongoDB fallback. This data will not persist across restarts.');
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    process.env.MONGO_URI = mongoUri;
    global.__MONGODB_MEMORY_SERVER__ = mongod;
  };

  try {
    if (!mongoUri) {
      await startMemoryServer();
    }
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (!mongoUri || error.message.includes('ECONNREFUSED')) {
      try {
        await startMemoryServer();
        const conn = await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log(`MongoDB Memory Connected: ${conn.connection.host}`);
      } catch (memoryError) {
        console.error(`Memory MongoDB Error: ${memoryError.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;