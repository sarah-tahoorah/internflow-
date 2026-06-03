import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import './InviteManagement.css';
const InviteManagement = () => {
  const [invites, setInvites] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', role: 'intern' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    fetchInvites();
  }, []);
  const fetchInvites = async () => {
    try {
      const { data } = await API.get('/invites');
      setInvites(data);
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await API.post('/invites', formData);
      setSuccess(`Invite created! Link: ${data.invite.inviteLink}`);
      setFormData({ email: '', role: 'intern' });
      fetchInvites();
      setTimeout(() => setShowModal(false), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create invite');
    } finally {
      setLoading(false);
    }
  };
  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link);
    alert('Invite link copied to clipboard!');
  };
  return (
    <div className="invite-management">
      <div className="section-header">
        <h2>🔐 Invite Management</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Create Invite
        </button>
      </div>
      <div className="invites-table">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Expires</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invites.map((invite) => (
              <tr key={invite._id}>
                <td>{invite.email}</td>
                <td><span className={`role-badge ${invite.role}`}>{invite.role}</span></td>
                <td>
                  <span className={`status-badge ${invite.used ? 'used' : 'pending'}`}>
                    {invite.used ? 'Used' : 'Pending'}
                  </span>
                </td>
                <td>{new Date(invite.expiresAt).toLocaleDateString()}</td>
                <td>{invite.createdBy?.fullName}</td>
                <td>
                  {!invite.used && (
                    <button
                      className="btn-copy"
                      onClick={() => copyToClipboard(`${window.location.origin}/register?token=${invite.token}`)}
                    >
                      📋 Copy Link
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create Invite</h3>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="user@example.com"
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="intern">Intern</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default InviteManagement;