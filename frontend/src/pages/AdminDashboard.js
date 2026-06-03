import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import Navbar from '../components/Navbar';
import './Dashboard.css';
const TaskManagement = lazy(() => import('../components/Admin/TaskManagement'));
const SubmissionReview = lazy(() => import('../components/Admin/SubmissionReview'));
const InternPerformance = lazy(() => import('../components/Admin/InternPerformance'));
const AdminAnalytics = lazy(() => import('../components/Admin/AdminAnalytics'));
const InviteManagement = lazy(() => import('../components/Admin/InviteManagement'));
const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInterns: 0,
    totalTasks: 0,
    pendingSubmissions: 0,
    eligibleInterns: 0
  });
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading] = useState(true);
  React.useEffect(() => {
    document.title = 'Admin Dashboard | InternFlow';
  }, []);
  useEffect(() => {
    fetchDashboardStats();
  }, []);
  const fetchDashboardStats = async () => {
    try {
      const [tasksRes, submissionsRes] = await Promise.all([
        API.get('/tasks'),
        API.get('/submissions')
      ]);
      const pendingCount = submissionsRes.data.filter(
        s => s.status === 'submitted'
      ).length;
      setStats({
        totalInterns: 0, 
        totalTasks: tasksRes.data.length,
        pendingSubmissions: pendingCount,
        eligibleInterns: 0
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
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
          <h1>Admin Dashboard</h1>
          <p className="subtitle">Manage Internship Program</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card admin">
            <h3>Total Tasks</h3>
            <p className="stat-number">{stats.totalTasks}</p>
          </div>
          <div className="stat-card admin">
            <h3>Pending Reviews</h3>
            <p className="stat-number orange">{stats.pendingSubmissions}</p>
          </div>
          <div className="stat-card admin">
            <h3>Active Interns</h3>
            <p className="stat-number blue">{stats.totalInterns}</p>
          </div>
          <div className="stat-card admin">
            <h3>Eligible for Certificate</h3>
            <p className="stat-number green">{stats.eligibleInterns}</p>
          </div>
        </div>
        <div className="admin-tabs">
          <button 
            className={activeTab === 'tasks' ? 'active' : ''}
            onClick={() => setActiveTab('tasks')}
          >
            Task Management
          </button>
          <button 
            className={activeTab === 'submissions' ? 'active' : ''}
            onClick={() => setActiveTab('submissions')}
          >
            Submission Review
          </button>
          <button 
            className={activeTab === 'performance' ? 'active' : ''}
            onClick={() => setActiveTab('performance')}
          >
            Intern Performance
          </button>
          <button 
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
          <button 
            className={activeTab === 'invites' ? 'active' : ''}
            onClick={() => setActiveTab('invites')}
          >
            🔐 Invites
          </button>
        </div>
        <div className="tab-content">
          <Suspense fallback={<div className="loading">Loading...</div>}>
            {activeTab === 'tasks' && <TaskManagement onUpdate={fetchDashboardStats} />}
            {activeTab === 'submissions' && <SubmissionReview onUpdate={fetchDashboardStats} />}
            {activeTab === 'performance' && <InternPerformance />}
            {activeTab === 'analytics' && <AdminAnalytics />}
            {activeTab === 'invites' && <InviteManagement />}
          </Suspense>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;