import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AdminAnalytics.css';
const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  useEffect(() => {
    fetchAnalytics();
  }, []);
  const fetchAnalytics = async () => {
    try {
      const { data } = await API.get('/analytics/admin/overview');
      setAnalytics(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };
  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/analytics/admin/export', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Export failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `intern-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };
  const sortedAnalytics = [...analytics].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'attendance') return b.attendancePercentage - a.attendancePercentage;
    if (sortBy === 'completion') return b.taskCompletionRate - a.taskCompletionRate;
    return 0;
  });
  const chartData = analytics.map(intern => ({
    name: intern.name.split(' ')[0],
    attendance: parseFloat(intern.attendancePercentage),
    completion: parseFloat(intern.taskCompletionRate)
  }));
  if (loading) return <div className="loading">Loading analytics...</div>;
  return (
    <div className="admin-analytics">
      <div className="analytics-header">
        <h2>📊 Intern Performance Overview</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="name">Sort by Name</option>
            <option value="attendance">Sort by Attendance</option>
            <option value="completion">Sort by Task Completion</option>
          </select>
          <button 
            onClick={handleExportCSV} 
            className="btn-export-csv"
            title="Export analytics to CSV"
          >
            📊 Export CSV
          </button>
        </div>
      </div>
      {}
      <div className="chart-container">
        <h3>Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="attendance" fill="#10b981" name="Attendance %" />
            <Bar dataKey="completion" fill="#3b82f6" name="Task Completion %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {}
      <div className="intern-table-container">
        <table className="intern-table">
          <thead>
            <tr>
              <th>Intern Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Attendance %</th>
              <th>Task Completion %</th>
              <th>Total Tasks</th>
              <th>Completed</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedAnalytics.map((intern) => {
              const overallScore = (parseFloat(intern.attendancePercentage) + parseFloat(intern.taskCompletionRate)) / 2;
              const status = overallScore >= 80 ? 'excellent' : overallScore >= 60 ? 'good' : 'needs-improvement';
              return (
                <tr key={intern.internId}>
                  <td className="intern-name">{intern.name}</td>
                  <td>{intern.email}</td>
                  <td>{intern.department}</td>
                  <td>
                    <span className={`percentage ${intern.attendancePercentage >= 85 ? 'high' : intern.attendancePercentage >= 70 ? 'medium' : 'low'}`}>
                      {intern.attendancePercentage}%
                    </span>
                  </td>
                  <td>
                    <span className={`percentage ${intern.taskCompletionRate >= 80 ? 'high' : intern.taskCompletionRate >= 60 ? 'medium' : 'low'}`}>
                      {intern.taskCompletionRate}%
                    </span>
                  </td>
                  <td>{intern.totalTasks}</td>
                  <td>{intern.completedTasks}</td>
                  <td>
                    <span className={`status-badge ${status}`}>
                      {status === 'excellent' ? '⭐ Excellent' : status === 'good' ? '✓ Good' : '⚠ Needs Improvement'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {}
      <div className="summary-stats">
        <div className="stat-box">
          <h4>Total Interns</h4>
          <p className="stat-value">{analytics.length}</p>
        </div>
        <div className="stat-box">
          <h4>Avg Attendance</h4>
          <p className="stat-value">
            {(analytics.reduce((sum, i) => sum + parseFloat(i.attendancePercentage), 0) / analytics.length || 0).toFixed(1)}%
          </p>
        </div>
        <div className="stat-box">
          <h4>Avg Task Completion</h4>
          <p className="stat-value">
            {(analytics.reduce((sum, i) => sum + parseFloat(i.taskCompletionRate), 0) / analytics.length || 0).toFixed(1)}%
          </p>
        </div>
        <div className="stat-box">
          <h4>Top Performers</h4>
          <p className="stat-value">
            {analytics.filter(i => parseFloat(i.attendancePercentage) >= 85 && parseFloat(i.taskCompletionRate) >= 80).length}
          </p>
        </div>
      </div>
    </div>
  );
};
export default AdminAnalytics;