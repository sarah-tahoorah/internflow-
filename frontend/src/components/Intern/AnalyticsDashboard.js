import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './AnalyticsDashboard.css';
const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  useEffect(() => {
    fetchAnalytics();
  }, []);
  const fetchAnalytics = async () => {
    try {
      const params = dateRange.startDate && dateRange.endDate 
        ? `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
        : '';
      const { data } = await API.get(`/analytics/intern/${user._id}${params}`);
      setAnalytics(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };
  const handleDateFilter = () => {
    fetchAnalytics();
  };
  if (loading) return <div className="loading">Loading analytics...</div>;
  if (!analytics) return <div className="error">Failed to load analytics</div>;
  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];
  const attendancePieData = [
    { name: 'Present', value: analytics.attendance.presentDays },
    { name: 'Absent', value: analytics.attendance.absentDays },
    { name: 'Late', value: analytics.attendance.lateDays }
  ].filter(item => item.value > 0);
  const submissionPieData = [
    { name: 'Approved', value: analytics.submissions.approvedTasks },
    { name: 'Rejected', value: analytics.submissions.rejectedTasks },
    { name: 'Pending', value: analytics.submissions.pendingTasks }
  ].filter(item => item.value > 0);
  const combinedChartData = analytics.attendance.monthlyTrend.map(monthData => {
    const weekMatch = analytics.submissions.weeklyTrend.find(w => w._id === monthData._id);
    return {
      month: monthData._id,
      attendance: monthData.present,
      submissions: weekMatch ? weekMatch.count : 0
    };
  });
  const getKPIColor = (status) => {
    return status === 'excellent' ? '#10b981' : status === 'good' ? '#f59e0b' : '#ef4444';
  };
  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h1>📊 Analytics Dashboard</h1>
        <div className="date-filter">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          />
          <button onClick={handleDateFilter} className="btn-filter">Apply Filter</button>
        </div>
      </div>
      {}
      <div className="performance-score-card">
        <h2>Overall Performance Score</h2>
        <div className="score-display">
          <div className="score-circle">
            <span className="score-number">{analytics.performance.performanceScore.overall}</span>
            <span className="score-grade">{analytics.performance.performanceScore.grade}</span>
          </div>
          <div className="score-breakdown">
            <div className="breakdown-item">
              <span>Attendance:</span>
              <strong>{analytics.performance.performanceScore.breakdown.attendance}%</strong>
            </div>
            <div className="breakdown-item">
              <span>Task Completion:</span>
              <strong>{analytics.performance.performanceScore.breakdown.taskCompletion}%</strong>
            </div>
            <div className="breakdown-item">
              <span>Submission Rate:</span>
              <strong>{analytics.performance.performanceScore.breakdown.submission}%</strong>
            </div>
            <div className="breakdown-item">
              <span>Punctuality:</span>
              <strong>{analytics.performance.performanceScore.breakdown.punctuality}%</strong>
            </div>
          </div>
        </div>
      </div>
      {}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeftColor: getKPIColor(analytics.performance.kpiStatus.attendance) }}>
          <h3>Attendance</h3>
          <p className="kpi-value">{analytics.attendance.attendancePercentage}%</p>
          <span className={`kpi-status ${analytics.performance.kpiStatus.attendance}`}>
            {analytics.performance.kpiStatus.attendance.toUpperCase()}
          </span>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: getKPIColor(analytics.performance.kpiStatus.taskCompletion) }}>
          <h3>Task Completion</h3>
          <p className="kpi-value">{analytics.performance.taskCompletionRate}%</p>
          <span className={`kpi-status ${analytics.performance.kpiStatus.taskCompletion}`}>
            {analytics.performance.kpiStatus.taskCompletion.toUpperCase()}
          </span>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: getKPIColor(analytics.performance.kpiStatus.submissions) }}>
          <h3>Submission Rate</h3>
          <p className="kpi-value">{analytics.submissions.submissionRate}%</p>
          <span className={`kpi-status ${analytics.performance.kpiStatus.submissions}`}>
            {analytics.performance.kpiStatus.submissions.toUpperCase()}
          </span>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: '#3b82f6' }}>
          <h3>Late Submissions</h3>
          <p className="kpi-value">{analytics.submissions.lateSubmissions}</p>
          <span className="kpi-status">Total</span>
        </div>
      </div>
      {}
      <div className="charts-grid">
        {}
        <div className="chart-card chart-card-wide">
          <h3>📊 Attendance & Submissions Overview</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={combinedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                label={{ value: 'Month', position: 'insideBottom', offset: -10, style: { fill: '#374151', fontWeight: 600 } }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fill: '#374151', fontWeight: 600 } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ fontWeight: 600, color: '#1f2937' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
                iconSize={14}
              />
              <Bar 
                dataKey="attendance" 
                fill="#10b981" 
                name="Attendance (Days Present)" 
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              />
              <Bar 
                dataKey="submissions" 
                fill="#3b82f6" 
                name="Submissions (Tasks)" 
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {}
        {}
        <div className="chart-card">
          <h3>📊 Attendance Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={attendancePieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {attendancePieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {}
        <div className="chart-card">
          <h3>📈 Weekly Submission Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.submissions.weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" label={{ value: 'Week', position: 'insideBottom', offset: -5 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Submissions" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {}
        <div className="chart-card">
          <h3>✅ Task Status Distribution</h3>
          {submissionPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={submissionPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {submissionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-chart">
              <p>No task data available yet</p>
              <span>Submit tasks to see distribution</span>
            </div>
          )}
        </div>
      </div>
      {}
      <div className="stats-summary">
        <div className="summary-card">
          <h3>Attendance Summary</h3>
          <div className="summary-items">
            <div className="summary-item">
              <span>Total Days:</span>
              <strong>{analytics.attendance.totalDays}</strong>
            </div>
            <div className="summary-item">
              <span>Present:</span>
              <strong className="text-green">{analytics.attendance.presentDays}</strong>
            </div>
            <div className="summary-item">
              <span>Absent:</span>
              <strong className="text-red">{analytics.attendance.absentDays}</strong>
            </div>
            <div className="summary-item">
              <span>Late:</span>
              <strong className="text-orange">{analytics.attendance.lateDays}</strong>
            </div>
          </div>
        </div>
        <div className="summary-card">
          <h3>Task Summary</h3>
          <div className="summary-items">
            <div className="summary-item">
              <span>Total Tasks:</span>
              <strong>{analytics.submissions.totalTasks}</strong>
            </div>
            <div className="summary-item">
              <span>Submitted:</span>
              <strong className="text-blue">{analytics.submissions.submittedTasks}</strong>
            </div>
            <div className="summary-item">
              <span>Approved:</span>
              <strong className="text-green">{analytics.submissions.approvedTasks}</strong>
            </div>
            <div className="summary-item">
              <span>Pending:</span>
              <strong className="text-orange">{analytics.submissions.pendingTasks}</strong>
            </div>
          </div>
        </div>
      </div>
      {}
      <div className="export-actions">
        <button className="btn-export" onClick={() => window.print()}>
          📄 Export as PDF
        </button>
        <button className="btn-export" onClick={() => alert('CSV export feature coming soon!')}>
          📊 Export as CSV
        </button>
      </div>
    </div>
  );
};
export default AnalyticsDashboard;