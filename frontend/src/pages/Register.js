import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'intern',
    domain: '',
    internshipDuration: '3',
    companyName: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  React.useEffect(() => {
    document.title = 'Register – InternFlow';
  }, []);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.role === 'admin') {
      if (!formData.companyName.trim()) {
        setError('Company Name is required for admin registration');
        return;
      }
      if (!formData.phoneNumber.trim()) {
        setError('Phone Number is required for admin registration');
        return;
      }
      if (!/^[0-9]{10,15}$/.test(formData.phoneNumber)) {
        setError('Please provide a valid phone number (10-15 digits)');
        return;
      }
    }
    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        domain: formData.domain
      };
      if (formData.role === 'admin') {
        payload.companyName = formData.companyName;
        payload.phoneNumber = formData.phoneNumber;
      } else {
        payload.internshipDuration = parseInt(formData.internshipDuration);
      }
      const result = await register(payload);
      if (result.success) {
        const redirectPath = formData.role === 'admin' ? '/admin/dashboard' : '/intern/dashboard';
        navigate(redirectPath);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="intern">Intern</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>Domain *</label>
            <select
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              required
            >
              <option value="">Select Domain</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Web Development">Web Development</option>
              <option value="MERN Stack Development">MERN Stack Development</option>
              <option value="Data Science">Data Science</option>
              <option value="Data Analytics">Data Analytics</option>
              <option value="Frontend Development">Frontend Development</option>
              <option value="Backend Development">Backend Development</option>
            </select>
          </div>
          {formData.role === 'admin' && (
            <>
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="Enter company name"
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  placeholder="Enter phone number (10-15 digits)"
                  pattern="[0-9]{10,15}"
                  autoComplete="off"
                />
              </div>
            </>
          )}
          {formData.role !== 'admin' && (
            <div className="form-group">
              <label>Internship Duration *</label>
              <select
                name="internshipDuration"
                value={formData.internshipDuration}
                onChange={handleChange}
                required
                autoComplete="off"
              >
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password (min 6 characters)"
              minLength="6"
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm password"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};
export default Register;