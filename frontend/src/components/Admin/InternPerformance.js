import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import './InternPerformance.css';
const InternPerformance = () => {
  const [interns, setInterns] = useState([]);
  const [performances, setPerformances] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchPerformanceData();
  }, []);
  const fetchPerformanceData = async () => {
    try {
      const { data: submissions } = await API.get('/submissions');
      const uniqueInterns = [...new Set(submissions.map(s => s.internId))];
      const performancePromises = uniqueInterns
        .filter(intern => intern) 
        .map(async (intern) => {
          try {
            const { data } = await API.get(`/performance/${intern._id}`);
            return { internId: intern._id, ...data, internInfo: intern };
          } catch (error) {
            return null;
          }
        });
      const performanceData = await Promise.all(performancePromises);
      const performanceMap = {};
      performanceData.filter(p => p).forEach(p => {
        performanceMap[p.internId] = p;
      });
      setPerformances(performanceMap);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching performance:', error);
      setLoading(false);
    }
  };
  if (loading) return <div>Loading performance data...</div>;
  const performanceList = Object.values(performances);
  if (performanceList.length === 0) {
    return <p className="no-data">No intern performance data available.</p>;
  }
  return (
    <div className="intern-performance">
      <h2>Intern Performance Overview</h2>
      <div className="performance-table">
        <table>
          <thead>
            <tr>
              <th>Intern Name</th>
              <th>Email</th>
              <th>Task Completion</th>
              <th>Attendance Rate</th>
              <th>Certificate Eligibility</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {performanceList.map(perf => (
              <tr key={perf.internId}>
                <td>{perf.internInfo?.fullName || 'N/A'}</td>
                <td>{perf.internInfo?.email || 'N/A'}</td>
                <td>
                  <div className="progress-cell">
                    <span>{perf.taskCompletionRate}%</span>
                    <div className="mini-progress">
                      <div 
                        className="mini-progress-fill"
                        style={{ width: `${perf.taskCompletionRate}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  <div className="progress-cell">
                    <span>{perf.attendanceRate}%</span>
                    <div className="mini-progress">
                      <div 
                        className="mini-progress-fill blue"
                        style={{ width: `${perf.attendanceRate}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`eligibility-badge ${perf.isEligible ? 'eligible' : 'not-eligible'}`}>
                    {perf.isEligible ? '✅ Eligible' : '❌ Not Eligible'}
                  </span>
                </td>
                <td>
                  <button className="btn-view-details">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default InternPerformance;