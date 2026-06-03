import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import Navbar from '../components/Navbar';
import './Dashboard.css';
const TaskList = lazy(() => import('../components/Intern/TaskList'));
const AttendanceWidget = lazy(() => import('../components/Intern/AttendanceWidget'));
const PerformanceCard = lazy(() => import('../components/Intern/PerformanceCard'));
const AnalyticsDashboard = lazy(() => import('../components/Intern/AnalyticsDashboard'));
const InternDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  React.useEffect(() => {
    document.title = 'Intern Dashboard | InternFlow';
  }, []);
  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      const [tasksRes, performanceRes] = await Promise.all([
        API.get('/tasks'),
        API.get(`/performance/${user._id}`)
      ]);
      const tasks = tasksRes.data;
      const performance = performanceRes.data;
      setStats({
        totalTasks: tasks.length,
        completedTasks: performance.completedTasks,
        pendingTasks: tasks.length - performance.completedTasks,
        attendanceRate: performance.attendanceRate
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }
  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user.fullName}!</h1>
          <p className="subtitle">Internship Dashboard</p>
        </div>
        {}
        <div className="dashboard-tabs">
          <button 
            className={activeTab === 'overview' ? 'tab-active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={activeTab === 'analytics' ? 'tab-active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
        </div>
        {activeTab === 'overview' ? (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <p className="stat-number">{stats.totalTasks}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p className="stat-number green">{stats.completedTasks}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-number orange">{stats.pendingTasks}</p>
          </div>
          <div className="stat-card">
            <h3>Attendance</h3>
            <p className="stat-number blue">{stats.attendanceRate}%</p>
          </div>
        </div>
        <div className="dashboard-grid">
          <div className="dashboard-section">
            <AttendanceWidget />
          </div>
          <div className="dashboard-section">
            <PerformanceCard userId={user._id} />
          </div>
        </div>
        <div className="dashboard-section">
          <TaskList />
        </div>
          </Suspense>
        ) : (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <AnalyticsDashboard />
          </Suspense>
        )}
      </div>
    </div>
  );
};
export default InternDashboard;