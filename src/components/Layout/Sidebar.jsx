import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  ChevronDown, 
  ChevronRight,
  LogOut,
  Building2
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ onLogout, isOpen, onClose }) => {
  const [openMenus, setOpenMenus] = useState({
    overallUlip: true,
    startupGrant: false
  });

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/dashboard'
    },
    {
      title: 'Overall ULIP',
      icon: <Building2 size={20} />,
      id: 'overallUlip',
      children: [
        { title: 'C&C Indent', path: '/overall-ulip/cc-indent' },
        { title: 'Department Grant', path: '/overall-ulip/department-grant' },
        { title: 'Capital', path: '/overall-ulip/capital' },
        { title: 'Man Power', path: '/overall-ulip/man-power' },
        { title: 'TADA Indents', path: '/overall-ulip/tada-indents' },
        { title: 'Prioritized Equipments', path: '/overall-ulip/prioritized-equipments' }
      ]
    },
    {
      title: 'Startup Grant',
      icon: <Briefcase size={20} />,
      id: 'startupGrant',
      children: [
        { title: 'Startup Grant Details', path: '/startup-grant/details' },
        { title: 'C&C Indents', path: '/startup-grant/cc-indents' },
        { title: 'Capital', path: '/startup-grant/capital' },
        { title: 'Overheads', path: '/startup-grant/overheads' },
        { title: 'Tech HR Budget', path: '/startup-grant/tech-hr-budget' },
        { title: 'IRG Indent Details', path: '/startup-grant/irg-indent-details' },
        { title: 'No of PA-I,II', path: '/startup-grant/no-of-pa' },
        { title: 'Consolidated', path: '/startup-grant/consolidated' },
        { title: 'ULIP Budget', path: '/startup-grant/ulip-budget' }
      ]
    }
  ];

  return (
    <aside className={`sidebar glass ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <h2 className="logo">
          <span className="logo-text">ULIP</span>
          <span className="logo-accent">Admin</span>
        </h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <div key={index} className="nav-item-container">
            {item.children ? (
              <>
                <div 
                  className={`nav-item has-children ${openMenus[item.id] ? 'open' : ''}`}
                  onClick={() => toggleMenu(item.id)}
                >
                  <div className="nav-item-content">
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                  {openMenus[item.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                
                <div className={`sub-menu ${openMenus[item.id] ? 'expanded' : ''}`}>
                  {item.children.map((child, childIdx) => (
                    <NavLink 
                      key={childIdx} 
                      to={child.path}
                      className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}
                      onClick={handleLinkClick}
                    >
                      {child.title}
                    </NavLink>
                  ))}
                </div>
              </>
            ) : (
              <NavLink 
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <div className="nav-item-content">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
