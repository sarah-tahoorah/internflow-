import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import Navbar from '../components/Navbar';
import './Profile.css';
const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    education: '',
    resumeUrl: '',
    companyName: '',
    phoneNumber: ''
  });
  React.useEffect(() => {
    document.title = 'Profile | InternFlow';
  }, []);
  useEffect(() => {
    fetchProfile();
  }, [userId]);
  const fetchProfile = async () => {
    try {
      const { data } = await API.get(`/profile/${userId}`);
      setProfile(data);
      setFormData({
        education: data.user.education || '',
        resumeUrl: data.user.resumeUrl || '',
        companyName: data.user.companyName || '',
        phoneNumber: data.user.phoneNumber || ''
      });
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load profile');
      setLoading(false);
    }
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/profile/${userId}`, formData);
      setEditing(false);
      fetchProfile();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };
  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return (
    <div>
      <Navbar />
      <div className="error-container">
        <h2>Access Denied</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="btn-back">Go Back</button>
      </div>
    </div>
  );
  const isOwnProfile = currentUser._id === userId;
  const isAdmin = profile.user.role === 'admin';
  return (
    <div>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <h1>User Profile</h1>
          {!isOwnProfile && <span className="view-only-badge">View Only</span>}
        </div>
        {}
        <section className="profile-section">
          <h2>Basic Identity</h2>
          <div className="profile-grid">
            <div className="profile-field">
              <label>Full Name</label>
              <p>{profile.user.fullName}</p>
            </div>
            <div className="profile-field">
              <label>Email</label>
              <p>{profile.user.email}</p>
            </div>
            <div className="profile-field">
              <label>Role</label>
              <p className={`role-badge ${profile.user.role}`}>
                {profile.user.role.toUpperCase()}
              </p>
            </div>
            <div className="profile-field">
              <label>Domain</label>
              <p className="domain-badge">{profile.user.domain}</p>
            </div>
            <div className="profile-field">
              <label>Joining Date</label>
              <p>{new Date(profile.user.joiningDate).toLocaleDateString()}</p>
            </div>
            {!isAdmin && profile.user.internshipDuration && (
              <div className="profile-field">
                <label>Internship Duration</label>
                <p>{profile.user.internshipDuration} months</p>
              </div>
            )}
            {isAdmin && profile.user.companyName && (
              <div className="profile-field">
                <label>Company Name</label>
                <p>{profile.user.companyName}</p>
              </div>
            )}
            {isAdmin && profile.user.phoneNumber && (
              <div className="profile-field">
                <label>Phone Number</label>
                <p>{profile.user.phoneNumber}</p>
              </div>
            )}
          </div>
        </section>
        {}
        <section className="profile-section">
          <div className="section-header">
            <h2>Additional Information</h2>
            {isOwnProfile && !editing && (
              <button onClick={() => setEditing(true)} className="btn-edit">
                Edit
              </button>
            )}
          </div>
          {editing ? (
            <form onSubmit={handleUpdate} className="profile-form">
              <div className="form-group">
                <label>Educational Qualification</label>
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="e.g., B.Tech Computer Science"
                />
              </div>
              <div className="form-group">
                <label>Resume URL</label>
                <input
                  type="url"
                  value={formData.resumeUrl}
                  onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                />
              </div>
              {isAdmin && (
                <>
                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="Enter phone number (10-15 digits)"
                      pattern="[0-9]{10,15}"
                    />
                  </div>
                </>
              )}
              <div className="form-actions">
                <button type="submit" className="btn-save">Save Changes</button>
                <button type="button" onClick={() => setEditing(false)} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-grid">
              <div className="profile-field">
                <label>Education</label>
                <p>{profile.user.education || 'Not provided'}</p>
              </div>
              <div className="profile-field">
                <label>Resume</label>
                {profile.user.resumeUrl ? (
                  <a href={profile.user.resumeUrl} target="_blank" rel="noopener noreferrer" className="resume-link">
                    View Resume →
                  </a>
                ) : (
                  <p>Not uploaded</p>
                )}
              </div>
            </div>
          )}
        </section>
        {}
        {!isAdmin && profile.workProgress && (
          <section className="profile-section">
            <h2>Work & Progress</h2>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-value">{profile.workProgress.totalTasks}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
              <div className="stat-box completed">
                <div className="stat-value">{profile.workProgress.completedTasks}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-box pending">
                <div className="stat-value">{profile.workProgress.pendingTasks}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{profile.workProgress.submissions}</div>
                <div className="stat-label">Submissions</div>
              </div>
            </div>
          </section>
        )}
        {}
        {!isAdmin && profile.performance && (
          <section className="profile-section">
            <h2>Performance Analytics</h2>
            <div className="performance-grid">
              <div className="performance-card">
                <h3>Attendance Summary</h3>
                <div className="performance-metric">
                  <span className="metric-label">Attendance Rate</span>
                  <span className="metric-value">{profile.performance.attendanceRate}%</span>
                </div>
                <div className="performance-details">
                  <div className="detail-item">
                    <span>Total Days:</span>
                    <strong>{profile.performance.totalAttendanceDays}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Present:</span>
                    <strong className="text-green">{profile.performance.presentDays}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Absent:</span>
                    <strong className="text-red">{profile.performance.absentDays}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Late:</span>
                    <strong className="text-orange">{profile.performance.lateDays}</strong>
                  </div>
                </div>
              </div>
              <div className="performance-card">
                <h3>Task Completion</h3>
                <div className="performance-metric">
                  <span className="metric-label">Completion Rate</span>
                  <span className="metric-value">{profile.performance.completionRate}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${profile.performance.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}
        {}
        {!isAdmin && profile.eligibility && (
          <section className="profile-section">
            <h2>Certification Eligibility</h2>
            <div className={`eligibility-card ${profile.eligibility.isEligible ? 'eligible' : 'not-eligible'}`}>
              <div className="eligibility-status">
                <span className="status-icon">
                  {profile.eligibility.status === 'ELIGIBLE' ? '✅' : '❌'}
                </span>
                <span className="status-text">
                  {profile.eligibility.status}
                </span>
              </div>
              {profile.eligibility.reasons && profile.eligibility.reasons.length > 0 && (
                <div className="eligibility-reasons">
                  <h4>Reasons for Ineligibility:</h4>
                  <ul>
                    {profile.eligibility.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="eligibility-criteria">
                <h4>Eligibility Criteria</h4>
                <div className="criteria-list">
                  <div className={`criteria-item ${profile.eligibility.criteria.attendanceMet ? 'met' : 'not-met'}`}>
                    <span>Attendance ≥ {profile.eligibility.criteria.attendanceRequired}%</span>
                    <span>{profile.eligibility.criteria.attendanceMet ? '✓' : '✗'}</span>
                  </div>
                  <div className={`criteria-item ${profile.eligibility.criteria.completionMet ? 'met' : 'not-met'}`}>
                    <span>Task Completion ≥ {profile.eligibility.criteria.completionRequired}%</span>
                    <span>{profile.eligibility.criteria.completionMet ? '✓' : '✗'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
export default Profile;