import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const inp = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1px solid #e2e8f0', fontSize: 14, outline: 'none',
  boxSizing: 'border-box', background: '#f8fafc', color: '#0f172a',
  transition: 'border-color .15s',
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('Enter username and password.'); return; }
    setLoading(true); setError('');
    try {
      await login({ username: form.username, password: form.password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0d9488 100%)',
      padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '40px 36px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#0d9488,#0f172a)',
            margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>Solar Panel Monitor</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Fault Detection System</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10,
            padding: '10px 14px', marginBottom: 20, color: '#dc2626', fontSize: 13,
          }}>{error}</div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
              USERNAME
            </label>
            <input
              type="text" value={form.username} placeholder="Enter username"
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              style={inp} disabled={loading}
              onFocus={e => e.target.style.borderColor = '#0d9488'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
              PASSWORD
            </label>
            <input
              type="password" value={form.password} placeholder="Enter password"
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              style={inp} disabled={loading}
              onFocus={e => e.target.style.borderColor = '#0d9488'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: loading ? '#e2e8f0' : '#0d9488', color: loading ? '#94a3b8' : '#fff',
              fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(13,148,136,0.35)',
            }}
          >{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>

        {/* Register link */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#94a3b8' }}>
          New user?{' '}
          <Link to="/register" style={{ color: '#0d9488', fontWeight: 700, textDecoration: 'none' }}>
            Register as Viewer
          </Link>
          {' · '}
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Admin accounts are created by an Admin only</span>
        </p>

        {/* Default credentials hint */}
        <div style={{
          background: '#f8fafc', borderRadius: 10, padding: '12px 14px', marginTop: 16,
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Default Credentials</div>
          <div style={{ fontSize: 12, color: '#64748b', lineHeight: 2 }}>
            <span style={{ fontFamily: 'monospace', background: '#e2e8f0', padding: '1px 5px', borderRadius: 4 }}>demo_admin</span> / <span style={{ fontFamily: 'monospace', background: '#e2e8f0', padding: '1px 5px', borderRadius: 4 }}>DemoAdmin123</span>
            <span style={{ marginLeft: 8, fontSize: 11, color: '#ef4444', fontWeight: 700 }}>ADMIN</span><br />
            <span style={{ fontFamily: 'monospace', background: '#e2e8f0', padding: '1px 5px', borderRadius: 4 }}>demo_technician</span> / <span style={{ fontFamily: 'monospace', background: '#e2e8f0', padding: '1px 5px', borderRadius: 4 }}>DemoTech123</span>
            <span style={{ marginLeft: 8, fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>TECHNICIAN</span><br />
            <span style={{ fontFamily: 'monospace', background: '#e2e8f0', padding: '1px 5px', borderRadius: 4 }}>demo_viewer</span> / <span style={{ fontFamily: 'monospace', background: '#e2e8f0', padding: '1px 5px', borderRadius: 4 }}>DemoViewer123</span>
            <span style={{ marginLeft: 8, fontSize: 11, color: '#10b981', fontWeight: 700 }}>VIEWER</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
