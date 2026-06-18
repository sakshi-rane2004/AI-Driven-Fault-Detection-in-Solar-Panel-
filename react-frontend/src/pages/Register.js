import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const inp = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1px solid #e2e8f0', fontSize: 14, outline: 'none',
  boxSizing: 'border-box', background: '#f8fafc', color: '#0f172a',
};

const Lbl = ({ children }) => (
  <label style={{
    fontSize: 12, fontWeight: 700, color: '#374151',
    textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6
  }}>
    {children}
  </label>
);

const passScore = (pw) => {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 8) s += 25;
  if (/[A-Z]/.test(pw)) s += 25;
  if (/[0-9]/.test(pw)) s += 25;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) s += 25;
  const label = s >= 100 ? 'Strong' : s >= 75 ? 'Good' : s >= 50 ? 'Fair' : 'Weak';
  const color = s >= 100 ? '#10b981' : s >= 75 ? '#f59e0b' : s >= 50 ? '#f97316' : '#ef4444';
  return { s, label, color };
};

const Register = () => {
  const { register, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', email: '',
    password: '', confirmPassword: '',
    role: 'VIEWER',
  }); const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ps = passScore(form.password);
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      data.role = form.role; // VIEWER or TECHNICIAN — both allowed on public endpoint
      await register(data, false);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
        width: '100%', maxWidth: 480,
        boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>Create Account</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Solar Panel Monitor</p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10,
            padding: '10px 14px', marginBottom: 20, color: '#dc2626', fontSize: 13,
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <Lbl>First Name</Lbl>
              <input type="text" value={form.firstName} onChange={f('firstName')}
                placeholder="John" style={inp} disabled={loading}
                onFocus={e => e.target.style.borderColor = '#0d9488'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
            <div>
              <Lbl>Last Name</Lbl>
              <input type="text" value={form.lastName} onChange={f('lastName')}
                placeholder="Doe" style={inp} disabled={loading}
                onFocus={e => e.target.style.borderColor = '#0d9488'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <Lbl>Username *</Lbl>
            <input type="text" value={form.username} onChange={f('username')}
              placeholder="Choose a username" required style={inp} disabled={loading}
              onFocus={e => e.target.style.borderColor = '#0d9488'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <Lbl>Email *</Lbl>
            <input type="email" value={form.email} onChange={f('email')}
              placeholder="you@example.com" required style={inp} disabled={loading}
              onFocus={e => e.target.style.borderColor = '#0d9488'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>

          {/* Role */}
          <div style={{ marginBottom: 14 }}>
            <Lbl>Role *</Lbl>
            <select value={form.role} onChange={f('role')} required style={inp} disabled={loading}>
              <option value="VIEWER">Viewer — Read-only access</option>
              <option value="TECHNICIAN">Technician — Manage panels &amp; alerts</option>
            </select>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 5 }}>
              Admin accounts can only be created by an existing admin.
            </div>
          </div>

          <div style={{ marginBottom: 6 }}>
            <Lbl>Password *</Lbl>
            <input type="password" value={form.password} onChange={f('password')}
              placeholder="Min. 8 characters" required style={inp} disabled={loading}
              onFocus={e => e.target.style.borderColor = '#0d9488'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            {ps && (
              <div style={{ marginTop: 6 }}>
                <div style={{ height: 4, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ height: '100%', width: `${ps.s}%`, background: ps.color, borderRadius: 99, transition: 'width .3s' }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: ps.color }}>{ps.label}</span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 22 }}>
            <Lbl>Confirm Password *</Lbl>
            <input type="password" value={form.confirmPassword} onChange={f('confirmPassword')}
              placeholder="Repeat password" required style={{
                ...inp,
                borderColor: form.confirmPassword && form.password !== form.confirmPassword ? '#ef4444' : '#e2e8f0',
              }} disabled={loading}
              onFocus={e => e.target.style.borderColor = '#0d9488'}
              onBlur={e => {
                e.target.style.borderColor =
                  form.confirmPassword && form.password !== form.confirmPassword ? '#ef4444' : '#e2e8f0';
              }} />
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>Passwords do not match</div>
            )}
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            background: loading ? '#e2e8f0' : '#0d9488', color: loading ? '#94a3b8' : '#fff',
            fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 14px rgba(13,148,136,0.35)',
          }}>{loading ? 'Creating Account…' : 'Create Account'}</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#0d9488', fontWeight: 700, textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
