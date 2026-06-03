import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import './AttendanceWidget.css';
const AttendanceWidget = () => {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [canCheckIn, setCanCheckIn] = useState(true);
  const [message, setMessage] = useState('');
  useEffect(() => {
    fetchAttendance();
    checkTodayAttendance();
  }, []);
  const fetchAttendance = async () => {
    try {
      const { data } = await API.get('/attendance/my-attendance');
      setAttendance(data.slice(0, 7)); 
      const summaryRes = await API.get('/attendance/summary/' + JSON.parse(localStorage.getItem('user'))._id);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };
  const checkTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await API.get('/attendance/my-attendance');
      const todayRecord = data.find(a => 
        new Date(a.date).toISOString().split('T')[0] === today
      );
      setCanCheckIn(!todayRecord);
    } catch (error) {
      console.error('Error checking attendance:', error);
    }
  };
  const handleCheckIn = async () => {
    try {
      await API.post('/attendance/check-in');
      setMessage('✅ Check-in successful!');
      setCanCheckIn(false);
      fetchAttendance();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Check-in failed');
      setTimeout(() => setMessage(''), 3000);
    }
  };
  return (
    <div className="attendance-widget">
      <h2>Attendance</h2>
      {message && <div className="attendance-message">{message}</div>}
      <button 
        className="checkin-btn"
        onClick={handleCheckIn}
        disabled={!canCheckIn}
      >
        {canCheckIn ? '📍 Check In Today' : '✅ Already Checked In'}
      </button>
      {summary && (
        <div className="attendance-summary">
          <div className="summary-item">
            <span>Present Days</span>
            <strong>{summary.presentDays}</strong>
          </div>
          <div className="summary-item">
            <span>Total Days</span>
            <strong>{summary.totalDays}</strong>
          </div>
          <div className="summary-item">
            <span>Attendance Rate</span>
            <strong>{summary.attendanceRate}%</strong>
          </div>
        </div>
      )}
      <div className="attendance-history">
        <h3>Recent Attendance</h3>
        {attendance.map(record => (
          <div key={record._id} className="attendance-record">
            <span>{new Date(record.date).toLocaleDateString()}</span>
            <span className={`status-badge ${record.status}`}>
              {record.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AttendanceWidget;