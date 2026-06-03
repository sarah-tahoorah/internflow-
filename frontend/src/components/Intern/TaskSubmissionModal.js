import React, { useState } from 'react';
import API from '../../utils/api';
import './Modal.css';
const TaskSubmissionModal = ({ task, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    submissionLink: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/submissions', {
        taskId: task._id,
        ...formData
      });
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Submission failed');
      setLoading(false);
    }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Submit Task</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task: {task.title}</label>
          </div>
          <div className="form-group">
            <label>Submission Link (GitHub/Drive) *</label>
            <input
              type="url"
              placeholder="https://github.com/username/repo"
              value={formData.submissionLink}
              onChange={(e) => setFormData({ ...formData, submissionLink: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Remarks (Optional)</label>
            <textarea
              rows="4"
              placeholder="Any additional notes..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default TaskSubmissionModal;