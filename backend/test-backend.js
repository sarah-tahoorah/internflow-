const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api';
async function testBackend() {
  console.log('🧪 Testing InternFlow Backend...\n');
  try {
    console.log('1️⃣ Testing server health...');
    const health = await axios.get('http://localhost:5000');
    console.log('✅ Server is running:', health.data.message);
    console.log();
    console.log('2️⃣ Testing admin registration...');
    try {
      const adminReg = await axios.post(`${BASE_URL}/auth/register`, {
        fullName: 'Test Admin',
        email: `admin${Date.now()}@test.com`,
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin registered successfully');
      console.log('   Token:', adminReg.data.token.substring(0, 20) + '...');
      console.log();
    } catch (error) {
      if (error.response?.data?.message === 'User already exists') {
        console.log('ℹ️  Admin user already exists (this is fine)');
        console.log();
      } else {
        throw error;
      }
    }
    console.log('3️⃣ Testing intern registration...');
    const internEmail = `intern${Date.now()}@test.com`;
    const internReg = await axios.post(`${BASE_URL}/auth/register`, {
      fullName: 'Test Intern',
      email: internEmail,
      password: 'intern123',
      role: 'intern',
      department: 'IT',
      internshipDuration: 6
    });
    console.log('✅ Intern registered successfully');
    const internToken = internReg.data.token;
    console.log('   Token:', internToken.substring(0, 20) + '...');
    console.log();
    console.log('4️⃣ Testing login...');
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email: internEmail,
      password: 'intern123'
    });
    console.log('✅ Login successful');
    console.log('   User:', login.data.user.fullName);
    console.log('   Role:', login.data.user.role);
    console.log();
    console.log('5️⃣ Testing protected route (Get Me)...');
    const me = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${internToken}` }
    });
    console.log('✅ Protected route working');
    console.log('   User:', me.data.fullName);
    console.log('   Email:', me.data.email);
    console.log();
    console.log('6️⃣ Testing tasks endpoint...');
    const tasks = await axios.get(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${internToken}` }
    });
    console.log('✅ Tasks endpoint working');
    console.log('   Tasks found:', tasks.data.length);
    console.log();
    console.log('🎉 All tests passed! Backend is fully functional.\n');
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.message || error.response.data);
    } else if (error.request) {
      console.error('   No response from server. Is the backend running?');
      console.error('   Make sure to start the backend with: cd backend && npm start');
    } else {
      console.error('   Error:', error.message);
    }
    process.exit(1);
  }
}
testBackend();