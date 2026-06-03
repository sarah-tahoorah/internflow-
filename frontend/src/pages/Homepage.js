import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';
const Homepage = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    document.title = 'InternFlow – Internship Management Platform';
  }, []);
  return (
    <div className="homepage">
      {}
      <nav className="homepage-nav">
        <div className="nav-container">
          <div className="logo">InternFlow</div>
          <div className="nav-actions">
            <button onClick={() => navigate('/login')} className="btn-nav-secondary">
              Sign In
            </button>
            <button onClick={() => navigate('/register')} className="btn-nav-primary">
              Get Started
            </button>
          </div>
        </div>
      </nav>
      {}
      <section className="hero">
        <div className="hero-container">
          <h1 className="hero-title">
            Structured Internship Management<br />for Growing Organizations
          </h1>
          <p className="hero-subtitle">
            Domain-based task assignment, real-time progress tracking, and performance analytics.
            Built for admins who need control and interns who need clarity.
          </p>
          <div className="hero-cta">
            <button onClick={() => navigate('/register')} className="btn-hero-primary">
              Start Managing Internships
            </button>
            <button onClick={() => navigate('/login')} className="btn-hero-secondary">
              Sign In to Dashboard
            </button>
          </div>
        </div>
      </section>
      {}
      <section className="value-section">
        <div className="section-container">
          <div className="value-grid">
            <div className="value-card">
              <div className="value-icon">⚡</div>
              <h3>Domain-Based Organization</h3>
              <p>Isolate teams by domain—AI, Web Dev, Data Science. Admins manage only their assigned interns and tasks.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">📋</div>
              <h3>Task Assignment & Tracking</h3>
              <p>Create, assign, and monitor tasks with deadlines. Review submissions and provide feedback in real-time.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">📊</div>
              <h3>Performance Analytics</h3>
              <p>Track attendance, task completion rates, and eligibility metrics. Data-driven insights for every intern.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🔒</div>
              <h3>Role-Based Access Control</h3>
              <p>Secure, zero-trust architecture. Admins and interns see only what they need. No cross-domain access.</p>
            </div>
          </div>
        </div>
      </section>
      {}
      <section className="how-it-works">
        <div className="section-container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">01</div>
              <h4>Admin Creates Domain</h4>
              <p>Register as admin, select your domain (AI, Web Dev, etc.). Your workspace is isolated.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">02</div>
              <h4>Assign Tasks to Interns</h4>
              <p>Create tasks with deadlines and priorities. Assign to interns within your domain.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">03</div>
              <h4>Interns Submit Work</h4>
              <p>Interns view tasks, submit work, and track attendance. Real-time status updates.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">04</div>
              <h4>Review & Analytics</h4>
              <p>Approve submissions, monitor performance, and generate eligibility reports.</p>
            </div>
          </div>
        </div>
      </section>
      {}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Built for Scale and Control</h2>
          <div className="features-grid">
            <div className="feature-item">
              <h4>Domain Isolation</h4>
              <p>Zero cross-domain access. Each admin manages their own team independently.</p>
            </div>
            <div className="feature-item">
              <h4>Attendance Tracking</h4>
              <p>Automated check-in system with late detection and absence monitoring.</p>
            </div>
            <div className="feature-item">
              <h4>Submission Review</h4>
              <p>Approve, reject, or request revisions. Feedback loop for quality control.</p>
            </div>
            <div className="feature-item">
              <h4>Performance Scoring</h4>
              <p>Weighted metrics: attendance (30%), task completion (40%), punctuality (10%).</p>
            </div>
            <div className="feature-item">
              <h4>Certificate Eligibility</h4>
              <p>Automated eligibility calculation based on attendance and task completion thresholds.</p>
            </div>
            <div className="feature-item">
              <h4>Real-Time Dashboard</h4>
              <p>Live KPIs, charts, and analytics. Export reports as PDF or CSV.</p>
            </div>
          </div>
        </div>
      </section>
      {}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Structure Your Internship Program?</h2>
          <p>Join organizations using InternFlow to manage interns with clarity and control.</p>
          <button onClick={() => navigate('/register')} className="btn-cta">
            Get Started Now
          </button>
        </div>
      </section>
      {}
      <footer className="homepage-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="logo">InternFlow</div>
            <p>Structured internship management for modern organizations.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h5>Product</h5>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
            </div>
            <div className="footer-column">
              <h5>Access</h5>
              <a href="/login">Sign In</a>
              <a href="/register">Get Started</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 InternFlow. Built for enterprise internship management.</p>
        </div>
      </footer>
    </div>
  );
};
export default Homepage;