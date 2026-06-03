import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const handleNameDoubleClick = () => {
    if (user?._id) {
      navigate(`/profile/${user._id}`);
    }
  };
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          InternFlow
        </Link>
        <div className="navbar-menu">
          <span 
            className="navbar-user" 
            onDoubleClick={handleNameDoubleClick}
            title="Double-click to view profile"
          >
            {user?.fullName} ({user?.role})
          </span>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;