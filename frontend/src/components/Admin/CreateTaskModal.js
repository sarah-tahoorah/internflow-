import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import '../Intern/Modal.css';
const CreateTaskModal = ({ task, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    domain: user?.domain || '',
    assignedTo: []
  });
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    fetchInterns();
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        deadline: task.deadline.split('T')[0],
        priority: task.priority,
        domain: task.domain,
        assignedTo: task.assignedTo?.map(i => i._id) || []
      });
    }
  }, [task]);
  const fetchInterns = async () => {
    try {
      const { data } = await API.get('/users/interns');
      setInterns(data);
    } catch (error) {
      console.error('Error fetching interns:', error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (task) {
        await API.put(`/tasks/${task._id}`, formData);
      } else {
        await API.post('/tasks', formData);
      }
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
      setLoading(false);
    }
  };
  const handleInternToggle = (internId) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(internId)
        ? prev.assignedTo.filter(id => id !== internId)
        : [...prev.assignedTo, internId]
    }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Build Login Page"
              required
            />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed task description..."
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Domain (Auto-assigned)</label>
              <input
                type="text"
                value={formData.domain}
                disabled
                style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
              />
              <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>Domain is locked to your assigned domain</small>
            </div>
            <div className="form-group">
              <label>Deadline *</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Priority *</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Assign to Interns</label>
            <div className="intern-selection">
              {interns.length === 0 ? (
                <p className="no-interns">No interns available. Register interns first.</p>
              ) : (
                interns.map(intern => (
                  <label key={intern._id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.assignedTo.includes(intern._id)}
                      onChange={() => handleInternToggle(intern._id)}
                    />
                    <span>{intern.fullName} ({intern.email})</span>
                  </label>
                ))
              )}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateTaskModal;