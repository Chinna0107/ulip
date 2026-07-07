import React, { useState } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check for valid token/session
  const token = localStorage.getItem('ulip_token');
  const isAuthenticated = token !== null;

  // Auto-recover role from token if not set
  if (isAuthenticated && !localStorage.getItem('ulip_user_role')) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role) {
        localStorage.setItem('ulip_user_role', payload.role);
      } else if (payload.email === 'admin@ulip.com') {
        localStorage.setItem('ulip_user_role', 'admin');
      }
    } catch (e) {
      console.error('Failed to parse token payload', e);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('ulip_token');
    localStorage.removeItem('ulip_user_role');
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="app-container">
      {/* Overlay for mobile when sidebar is open */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={toggleMobileMenu}></div>
      )}
      
      <Sidebar 
        onLogout={handleLogout} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <main className="main-content">
        <header className="top-header glass">
          <div className="header-content">
            <div className="header-left">
              <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="header-title">
                {/* Dynamic title based on route could go here */}
              </h1>
            </div>
            <div className="user-profile">
              <div className="avatar">A</div>
              <span className="user-name">Admin User</span>
            </div>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
