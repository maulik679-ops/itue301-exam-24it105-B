import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Navbar = ({ customer, token, onLogout }) => {
  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        🚗 DriveEasy
      </Link>
      <div className="nav-links">
        <NavLink to="/fleet" className={({ isActive }) => (isActive ? 'active' : '')}>
          Fleet
        </NavLink>
        <NavLink to="/my-bookings" className={({ isActive }) => (isActive ? 'active' : '')}>
          My Bookings
        </NavLink>
        <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
          Admin Panel
        </NavLink>
        {token ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: '#cbd5e0' }}>
              👤 {customer?.name || 'Customer'}
            </span>
            <button type="button" className="btn-logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        ) : (
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
