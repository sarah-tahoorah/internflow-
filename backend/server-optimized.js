const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db');
dotenv.config();
const app = express();
app.use(compression());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const lazyRoute = (path) => (req, res, next) => {
  require(path)(req, res, next);
};
app.use('/api/auth', lazyRoute('./routes/authRoutes'));
app.use('/api/users', lazyRoute('./routes/userRoutes'));
app.use('/api/invites', lazyRoute('./routes/inviteRoutes'));
app.use('/api/tasks', lazyRoute('./routes/taskRoutes'));
app.use('/api/submissions', lazyRoute('./routes/submissionRoutes'));
app.use('/api/attendance', lazyRoute('./routes/attendanceRoutes'));
app.use('/api/performance', lazyRoute('./routes/performanceRoutes'));
app.use('/api/analytics', lazyRoute('./routes/analyticsRoutes'));
app.get('/', (req, res) => {
  res.json({ message: 'InternFlow API is running' });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB().catch(err => console.error('DB connection failed:', err));
});