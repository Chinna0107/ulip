import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import iictLogo from '../../assets/iict-logo.png';
import './AdminLayout.css'; // Reusing some CSS for header

const PublicLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Navigation Bar */}
      <header className="glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={iictLogo} alt="CSIR-IICT Logo" style={{ height: '45px', cursor: 'pointer' }} onClick={() => navigate('/')} />
          <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '1px', display: 'none' }} className="hide-on-mobile">ULIP Dashboard</h2>
        </div>
        
        {/* Hamburger Icon for Mobile */}
        <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} color="var(--text-primary)" /> : <Menu size={28} color="var(--text-primary)" />}
        </div>
        
        {/* Navigation Menu */}
        <nav className={`desktop-nav ${mobileMenuOpen ? 'mobile-nav-open' : ''}`}>
          <span onClick={() => handleNav('/ulip-om')} className="nav-link-hover">
            ULIP OM
          </span>
          <span onClick={() => handleNav('/proposal')} className="nav-link-hover">
            ULIP Proposal
          </span>
          <span onClick={() => handleNav('/prioritized-equipments')} className="nav-link-hover">
            Prioritized Equipment
          </span>
          <span onClick={() => handleNav('/departmental-grant')} className="nav-link-hover">
            Departmental Grant
          </span>
          <span onClick={() => handleNav('/startup-grant')} className="nav-link-hover">
            Start Up Grant
          </span>
          <button onClick={() => handleNav('/login')} className="btn-primary" style={{ padding: '0.4rem 1.2rem', fontWeight: '600' }}>
            Admin Login
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }} className="public-main-content">
        <Outlet />
      </main>

      <style>{`
        .nav-link-hover {
          text-decoration: none;
          color: var(--text-primary);
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .nav-link-hover:hover {
          color: var(--accent-primary) !important;
        }
        .desktop-nav {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }
        .mobile-menu-toggle {
          display: none;
          cursor: pointer;
        }
        
        @media (max-width: 900px) {
          .mobile-menu-toggle {
            display: block;
          }
          .desktop-nav {
            display: none;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: var(--bg-tertiary);
            padding: 2rem;
            border-bottom: 1px solid var(--border-color);
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            align-items: center;
            gap: 1.5rem;
          }
          .desktop-nav.mobile-nav-open {
            display: flex;
            animation: slideDown 0.2s ease-out forwards;
          }
          .hide-on-mobile {
            display: none !important;
          }
          .public-main-content {
            padding: 1rem !important;
          }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PublicLayout;
