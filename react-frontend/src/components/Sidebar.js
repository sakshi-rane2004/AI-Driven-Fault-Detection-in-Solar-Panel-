import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* Each icon is a proper React component — no module-level JSX objects */
const SvgWrap = ({ size, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const Icon = ({ name, size = 18 }) => {
  switch (name) {
    case 'dashboard':
      return <SvgWrap size={size}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></SvgWrap>;
    case 'panels':
      return <SvgWrap size={size}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></SvgWrap>;
    case 'alerts':
      return <SvgWrap size={size}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></SvgWrap>;
    case 'plants':
      return <SvgWrap size={size}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></SvgWrap>;
    case 'manage':
      return <SvgWrap size={size}><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" /></SvgWrap>;
    case 'reports':
      return <SvgWrap size={size}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></SvgWrap>;
    case 'analytics':
      return <SvgWrap size={size}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></SvgWrap>;
    case 'settings':
      return <SvgWrap size={size}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></SvgWrap>;
    case 'logout':
      return <SvgWrap size={size}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></SvgWrap>;
    case 'sun':
      return <SvgWrap size={size}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></SvgWrap>;
    case 'chevronLeft':
      return <SvgWrap size={size}><polyline points="15 18 9 12 15 6" /></SvgWrap>;
    case 'chevronRight':
      return <SvgWrap size={size}><polyline points="9 18 15 12 9 6" /></SvgWrap>;
    case 'analyze':
      return <SvgWrap size={size}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></SvgWrap>;
    default:
      return <SvgWrap size={size}><rect x="3" y="3" width="18" height="18" rx="2" /></SvgWrap>;
  }
};

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { user, canAccessAnalytics, canAccessHistory, canAccessPanels, canAccessAlerts, canAccessSettings } = useAuth();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/', icon: 'dashboard', label: 'Dashboard', show: true },
    { path: '/panels', icon: 'panels', label: 'Panels', show: true },
    { path: '/alerts', icon: 'alerts', label: 'Alerts', show: true },
    { path: '/plants', icon: 'plants', label: 'Plants', show: true },
    { path: '/analyze', icon: 'analyze', label: 'Analyze', show: true },
    { path: '/history', icon: 'reports', label: 'Reports', show: true },
    { path: '/analytics', icon: 'analytics', label: 'Analytics', show: true },
    { path: '/settings', icon: 'settings', label: 'Settings', show: canAccessSettings() },
    { path: '/admin/users', icon: 'manage', label: 'Users', show: canAccessSettings() },
  ];

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="sidebar-toggle" onClick={onToggle}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <Icon name={isCollapsed ? 'chevronRight' : 'chevronLeft'} size={16} />
        </button>
        {!isCollapsed && (
          <div className="sidebar-title">
            <Icon name="sun" size={18} />
            <span>Solar Monitor</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.filter(item => item.show).map((item) => (
          <Link key={item.path} to={item.path}
            className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            title={isCollapsed ? item.label : ''}>
            <span className="sidebar-item-icon"><Icon name={item.icon} size={18} /></span>
            {!isCollapsed && <span className="sidebar-item-label">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.firstName?.[0] || user?.username?.[0] || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.firstName || user?.username}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
          <button className="sidebar-logout-btn"
            onClick={() => { if (window.confirm('Logout?')) window.location.href = '/login'; }}
            title="Logout">
            <Icon name="logout" size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
