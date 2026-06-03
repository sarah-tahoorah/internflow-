import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import './SubmissionReview.css';
const SubmissionReview = ({ onUpdate }) => {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchSubmissions();
  }, []);
  const fetchSubmissions = async () => {
    try {
      const { data } = await API.get('/submissions');
      setSubmissions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setLoading(false);
    }
  };
  const handleReview = async (submissionId, status) => {
    try {
      await API.put(`/submissions/${submissionId}/review`, {
        status,
        feedback
      });
      setFeedback('');
      setSelectedSubmission(null);
      fetchSubmissions();
      onUpdate();
    } catch (error) {
      alert('Failed to update submission');
    }
  };
  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });
  if (loading) return <div>Loading submissions...</div>;
  return (
    <div className="submission-review">
      <div className="section-header">
        <h2>Submission Review</h2>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'submitted' ? 'active' : ''}
            onClick={() => setFilter('submitted')}
          >
            Pending
          </button>
          <button 
            className={filter === 'approved' ? 'active' : ''}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button 
            className={filter === 'rejected' ? 'active' : ''}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>
      {filteredSubmissions.length === 0 ? (
        <p className="no-data">No submissions found.</p>
      ) : (
        <div className="submissions-table">
          <table>
            <thead>
              <tr>
                <th>Intern</th>
                <th>Task</th>
                <th>Submission Link</th>
                <th>Submitted On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map(submission => (
                <tr key={submission._id}>
                  <td>{submission.internId?.fullName || 'N/A'}</td>
                  <td>{submission.taskId?.title || 'N/A'}</td>
                  <td>
                    <a 
                      href={submission.submissionLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="submission-link"
                    >
                      View Submission
                    </a>
                  </td>
                  <td>{new Date(submission.submittedAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${submission.status}`}>
                      {submission.status}
                    </span>
                  </td>
                  <td>
                    {submission.status === 'submitted' && (
                      <div className="action-buttons">
                        <button
                          className="btn-approve"
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setFeedback('');
                          }}
                        >
                          Review
                        </button>
                      </div>
                    )}
                    {submission.feedback && (
                      <button
                        className="btn-view-feedback"
                        onClick={() => alert(submission.feedback)}
                      >
                        View Feedback
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedSubmission && (
        <div className="modal-overlay" onClick={() => setSelectedSubmission(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Review Submission</h2>
              <button className="close-btn" onClick={() => setSelectedSubmission(null)}>×</button>
            </div>
            <div className="review-details">
              <p><strong>Intern:</strong> {selectedSubmission.internId?.fullName}</p>
              <p><strong>Task:</strong> {selectedSubmission.taskId?.title}</p>
              <p><strong>Link:</strong> <a href={selectedSubmission.submissionLink} target="_blank" rel="noopener noreferrer">View</a></p>
            </div>
            <div className="form-group">
              <label>Feedback</label>
              <textarea
                rows="4"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback to the intern..."
              />
            </div>
            <div className="modal-actions">
              <button 
                className="btn-reject"
                onClick={() => handleReview(selectedSubmission._id, 'rejected')}
              >
                Reject
              </button>
              <button 
                className="btn-approve"
                onClick={() => handleReview(selectedSubmission._id, 'approved')}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SubmissionReview;