import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ROLE_COLOR = {
  ADMIN: '#ef4444',
  TECHNICIAN: '#f59e0b',
  VIEWER: '#10b981',
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) =>
    location.pathname === path ? 'nav-link active' : 'nav-link';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleColor = ROLE_COLOR[user?.role] || '#6b7280';

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>Solar Panel Fault Detection</h1>
          </div>

          <nav className="nav">
            <Link to="/" className={isActive('/')}>Dashboard</Link>
            <Link to="/panels" className={isActive('/panels')}>Panels</Link>
            <Link to="/alerts" className={isActive('/alerts')}>Alerts</Link>
            <Link to="/analyze" className={isActive('/analyze')}>Analyze</Link>
            <Link to="/history" className={isActive('/history')}>Reports</Link>
            <Link to="/analytics" className={isActive('/analytics')}>Analytics</Link>
            <Link to="/settings" className={isActive('/settings')}>Settings</Link>
          </nav>

          <div className="header-user-section">
            {/* User info — read only, no switching */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 14px', borderRadius: 20,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}>
              {/* Avatar circle */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: roleColor, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 12, fontWeight: 800,
                color: '#fff', flexShrink: 0,
              }}>
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  {user?.firstName
                    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
                    : user?.username}
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: roleColor,
                  textTransform: 'uppercase', letterSpacing: '0.6px',
                }}>
                  {user?.role}
                </div>
              </div>
            </div>

            <button
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
