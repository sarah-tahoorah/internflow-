import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import './DeleteAccount.css';
const DeleteAccount = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const isDeleteEnabled = password.length >= 6 && confirmText === 'DELETE' && agreed;
  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (isDeleteEnabled) {
      setShowFinalConfirm(true);
    }
  };
  const handleFinalDelete = async () => {
    setError('');
    setLoading(true);
    try {
      await API.delete('/account/delete', {
        data: { password }
      });
      logout();
      navigate('/login', { 
        state: { message: 'Your account has been permanently deleted.' }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setLoading(false);
      setShowFinalConfirm(false);
    }
  };
  return (
    <div className="delete-account-container">
      <div className="delete-account-card">
        <div className="delete-header">
          <div className="warning-icon">⚠️</div>
          <h1>Delete Account</h1>
          <p className="subtitle">This action cannot be undone</p>
        </div>
        <div className="warning-box">
          <h3>⚠️ Warning: Permanent Data Loss</h3>
          <p>Deleting your account will permanently remove:</p>
          <ul>
            <li>Your profile and personal information</li>
            <li>All task assignments and submissions</li>
            <li>Attendance records and performance data</li>
            <li>Access to all InternFlow features</li>
          </ul>
          <p className="warning-emphasis">This action is irreversible. All data will be permanently deleted.</p>
        </div>
        {error && <div className="error-alert">{error}</div>}
        <form onSubmit={handleInitialSubmit} className="delete-form">
          <div className="form-section">
            <label>Verify Your Identity</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={6}
            />
            <small>Enter your current password to confirm your identity</small>
          </div>
          <div className="form-section">
            <label>Type "DELETE" to confirm</label>
            <input
              type="text"
              placeholder="Type DELETE in capital letters"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={loading}
              required
            />
            <small>This ensures you understand the consequences</small>
          </div>
          <div className="form-section">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={loading}
              />
              <span>I understand that this action is permanent and cannot be reversed</span>
            </label>
          </div>
          <div className="action-buttons">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-delete"
              disabled={!isDeleteEnabled || loading}
            >
              {loading ? 'Processing...' : 'Delete Account'}
            </button>
          </div>
        </form>
        <div className="help-text">
          <p>Need help? Contact support at <a href="mailto:contact@brightpathhorizon.com">contact@brightpathhorizon.com</a></p>
        </div>
      </div>
      {showFinalConfirm && (
        <div className="modal-overlay" onClick={() => !loading && setShowFinalConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Final Confirmation</h2>
            <p>Are you absolutely sure you want to delete your account?</p>
            <p className="modal-warning">This is your last chance to cancel. Once confirmed, all your data will be permanently deleted.</p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowFinalConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn-delete-final"
                onClick={handleFinalDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DeleteAccount;