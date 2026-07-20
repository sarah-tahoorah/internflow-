import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import InlineError from '../InlineError';
import './PerformanceCard.css';
const PerformanceCard = ({ userId }) => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    fetchPerformance();
  }, [userId]);
  const fetchPerformance = async () => {
    setError('');
    try {
      const { data } = await API.get(`/performance/${userId}`);
      setPerformance(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching performance:', error);
      setError(error.response?.data?.message || 'Failed to load performance data. Please try again.');
      setLoading(false);
    }
  };
  if (loading) return <div>Loading performance...</div>;
  if (error) return <div className="performance-card"><InlineError message={error} /></div>;
  if (!performance) return null;
  return (
    <div className="performance-card">
      <h2>Performance Overview</h2>
      <div className="performance-metrics">
        <div className="metric">
          <div className="metric-label">Task Completion</div>
          <div className="metric-value">{performance.taskCompletionRate}%</div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${performance.taskCompletionRate}%` }}
            />
          </div>
        </div>
        <div className="metric">
          <div className="metric-label">Attendance Rate</div>
          <div className="metric-value">{performance.attendanceRate}%</div>
          <div className="progress-bar">
            <div 
              className="progress-fill blue"
              style={{ width: `${performance.attendanceRate}%` }}
            />
          </div>
        </div>
      </div>
      <div className={`eligibility-status ${performance.isEligible ? 'eligible' : 'not-eligible'}`}>
        {performance.isEligible ? (
          <>
            <span className="status-icon">✅</span>
            <span>Eligible for Certificate</span>
          </>
        ) : (
          <>
            <span className="status-icon">⚠️</span>
            <span>Not Eligible (Need 80% tasks + 85% attendance)</span>
          </>
        )}
      </div>
      <div className="performance-stats">
        <div className="stat-item">
          <span>Completed Tasks</span>
          <strong>{performance.completedTasks} / {performance.totalTasks}</strong>
        </div>
        <div className="stat-item">
          <span>Present Days</span>
          <strong>{performance.presentDays} / {performance.totalDays}</strong>
        </div>
      </div>
    </div>
  );
};
export default PerformanceCard;