
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const requiredEnv = ['JWT_SECRET'];
let missingEnv = false;
requiredEnv.forEach((name) => {
  if (!process.env[name]) {
    console.error(`ERROR: Missing required environment variable: ${name}`);
    missingEnv = true;
  }
});
if (missingEnv) {
  console.error('Please copy backend/.env.example to backend/.env and fill in the required values.');
  process.exit(1);
}

connectDB();

const app = express();


const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://10.216.18.227:3000',
  'https://internflow-cq6h1j04m-tanuja-reddy-21s-projects.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/invites', require('./routes/inviteRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/performance', require('./routes/performanceRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));


app.get('/', (req, res) => {
  res.json({ message: 'InternFlow API is running' });
});


app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
