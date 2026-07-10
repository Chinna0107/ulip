import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  ChevronDown, 
  ChevronRight,
  LogOut,
  Building2,
  DollarSign,
  FileText,
  Users
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
      path: '/dashboard',
      roles: ['admin', 'user']
    },
    {
      title: 'Overall ULIP',
      icon: <Building2 size={20} />,
      id: 'overallUlip',
      roles: ['admin', 'user'],
      children: [
        { title: 'C&C Indent', path: '/overall-ulip/cc-indent', roles: ['admin'] },
        { title: 'Department Grant', path: '/overall-ulip/department-grant', roles: ['admin', 'user'] },
        { title: 'Capital', path: '/overall-ulip/capital', roles: ['admin'] },
        { title: 'Man Power', path: '/overall-ulip/man-power', roles: ['admin'] },
        { title: 'TADA Indents', path: '/overall-ulip/tada-indents', roles: ['admin'] },
        { title: 'Prioritized Equipments', path: '/overall-ulip/prioritized-equipments', roles: ['admin', 'user'] },
        { title: 'ORE', path: '/overall-ulip/ore', roles: ['admin'] }
      ]
    },
    {
      title: 'Startup Grant',
      icon: <Briefcase size={20} />,
      id: 'startupGrant',
      roles: ['admin'],
      children: [
        { title: 'C&C Indents', path: '/startup-grant/cc-indents' },
        { title: 'Capital', path: '/startup-grant/capital' },
        { title: 'Overheads', path: '/startup-grant/overheads' },
        { title: 'Tech HR Budget', path: '/startup-grant/tech-hr-budget' }
      ]
    },
    {
      title: 'Allocation 2026-2027',
      icon: <DollarSign size={20} />,
      path: '/allocations',
      roles: ['admin']
    },
    {
      title: 'Proposal PDF',
      icon: <FileText size={20} />,
      path: '/proposal.pdf',
      external: true,
      roles: ['admin']
    },
    {
      title: 'ULIP - OM',
      icon: <FileText size={20} />,
      path: '/ulip-om.pdf',
      external: true,
      roles: ['admin']
    },
    {
      title: 'User Management',
      icon: <Users size={20} />,
      path: '/users',
      roles: ['admin']
    }
  ];

  const userRole = localStorage.getItem('ulip_user_role') || 'user';
  
  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole)).map(item => {
    if (item.children) {
      return {
        ...item,
        children: item.children.filter(child => !child.roles || child.roles.includes(userRole))
      };
    }
    return item;
  });

  return (
    <aside className={`sidebar glass ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <img src="/src/assets/iict-logo.png" alt="CSIR-IICT Logo" style={{ height: '40px' }} />
        <h2 className="logo">
          <span className="logo-text">ULIP</span>
        </h2>
      </div>

      <nav className="sidebar-nav">
        {filteredMenuItems.map((item, index) => (
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
            ) : item.external ? (
              <a 
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-item"
                onClick={handleLinkClick}
              >
                <div className="nav-item-content">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
              </a>
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
