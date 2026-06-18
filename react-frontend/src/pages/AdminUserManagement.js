import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import api from '../services/api';

const inp = {
  width: '100%', padding: '10px 13px', borderRadius: 9,
  border: '1px solid #e2e8f0', fontSize: 14, outline: 'none',
  boxSizing: 'border-box', background: '#f8fafc', color: '#0f172a',
};

const ROLE_CFG = {
  ADMIN: { color: '#ef4444', bg: '#fef2f2', label: 'Admin' },
  TECHNICIAN: { color: '#f59e0b', bg: '#fffbeb', label: 'Technician' },
  VIEWER: { color: '#10b981', bg: '#f0fdf4', label: 'Viewer' },
};

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

const AdminUserManagement = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', email: '',
    password: '', confirmPassword: '', role: 'TECHNICIAN',
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // GET /auth/users — if this endpoint doesn't exist we'll handle gracefully
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (e) {
      // endpoint may not exist; show empty list without crashing
      setUsers([]);
    } finally { setLoading(false); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setSaving(true);
    try {
      const { confirmPassword, ...data } = form;
      await api.post('/auth/admin/create-user', { ...data, adminCreated: true });
      setSuccess(`User "${form.username}" created successfully as ${form.role}.`);
      setForm({ firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '', role: 'TECHNICIAN' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create user.');
    } finally { setSaving(false); }
  };

  const ps = passScore(form.password);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0d9488 100%)',
        padding: '32px 28px 48px', overflow: 'hidden', position: 'relative'
      }}>
        <div style={{
          position: 'absolute', top: -50, right: -50, width: 200, height: 200,
          borderRadius: '50%', border: '2px solid rgba(255,255,255,0.05)'
        }} />
        <div style={{
          maxWidth: 1000, margin: '0 auto', display: 'flex',
          justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16
        }}>
          <div>
            <div style={{
              color: '#2dd4bf', fontSize: 12, fontWeight: 700,
              letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8
            }}>
              Admin Only
            </div>
            <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0 }}>User Management</h1>
            <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: 14 }}>
              Create Technician and Admin accounts here
            </p>
          </div>
          <button onClick={() => { setShowForm(true); setError(''); setSuccess(''); }} style={{
            padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: '#0d9488', color: '#fff', fontWeight: 700, fontSize: 14,
            boxShadow: '0 4px 14px rgba(13,148,136,0.4)',
          }}>+ Create User</button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '-24px auto 0', padding: '0 24px 40px', position: 'relative' }}>

        {/* Feedback */}
        {error && <div style={{
          background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10,
          padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 14
        }}>{error}</div>}
        {success && <div style={{
          background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10,
          padding: '12px 16px', marginBottom: 16, color: '#166534', fontSize: 14
        }}>{success}</div>}

        {/* Create User Form */}
        {showForm && (
          <div style={{
            background: '#fff', borderRadius: 16, padding: '26px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', marginBottom: 20
          }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>
              Create New User
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>First Name</label>
                  <input type="text" value={form.firstName} onChange={f('firstName')} placeholder="John" style={inp}
                    onFocus={e => e.target.style.borderColor = '#0d9488'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Name</label>
                  <input type="text" value={form.lastName} onChange={f('lastName')} placeholder="Doe" style={inp}
                    onFocus={e => e.target.style.borderColor = '#0d9488'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username *</label>
                  <input type="text" value={form.username} onChange={f('username')} placeholder="e.g. john_tech" required style={inp}
                    onFocus={e => e.target.style.borderColor = '#0d9488'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email *</label>
                  <input type="email" value={form.email} onChange={f('email')} placeholder="john@example.com" required style={inp}
                    onFocus={e => e.target.style.borderColor = '#0d9488'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role *</label>
                  <select value={form.role} onChange={f('role')} required style={inp}>
                    <option value="TECHNICIAN">Technician</option>
                    <option value="ADMIN">Admin</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password *</label>
                  <input type="password" value={form.password} onChange={f('password')} placeholder="Min. 8 chars" required style={inp}
                    onFocus={e => e.target.style.borderColor = '#0d9488'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  {ps && (
                    <div style={{ marginTop: 5 }}>
                      <div style={{ height: 4, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${ps.s}%`, background: ps.color, borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: ps.color }}>{ps.label}</span>
                    </div>
                  )}
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirm Password *</label>
                  <input type="password" value={form.confirmPassword} onChange={f('confirmPassword')} placeholder="Repeat password" required style={inp}
                    onFocus={e => e.target.style.borderColor = '#0d9488'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>Passwords do not match</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving} style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: saving ? '#e2e8f0' : '#0d9488', color: saving ? '#94a3b8' : '#fff',
                  fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
                }}>{saving ? 'Creating…' : 'Create User'}</button>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  padding: '10px 20px', borderRadius: 10, border: '1px solid #e2e8f0',
                  background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Users table */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              System Users{' '}
              {users.length > 0 && <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: 14 }}>({users.length})</span>}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <div style={{
                width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#0d9488',
                borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px'
              }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Loading users…</div>
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No users found</div>
              <div style={{ fontSize: 13 }}>Create a user using the button above</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                    {['Name', 'Username', 'Email', 'Role', 'Status'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left', fontWeight: 700,
                        color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const rc = ROLE_CFG[u.role] || { color: '#6b7280', bg: '#f3f4f6', label: u.role };
                    return (
                      <tr key={u.id || i} style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: i % 2 === 0 ? '#fff' : '#fafafa'
                      }}>
                        <td style={{ padding: '13px 16px', fontWeight: 700, color: '#0f172a' }}>
                          {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                        </td>
                        <td style={{ padding: '13px 16px', color: '#475569', fontFamily: 'monospace', fontSize: 13 }}>
                          {u.username}
                          {u.username === currentUser?.username && (
                            <span style={{
                              marginLeft: 6, fontSize: 10, fontWeight: 700, color: '#0d9488',
                              background: '#f0fdfa', padding: '1px 6px', borderRadius: 10
                            }}>you</span>
                          )}
                        </td>
                        <td style={{ padding: '13px 16px', color: '#64748b' }}>{u.email}</td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{
                            padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                            background: rc.bg, color: rc.color
                          }}>{rc.label}</span>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{
                            padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                            background: u.enabled !== false ? '#f0fdf4' : '#fef2f2',
                            color: u.enabled !== false ? '#16a34a' : '#dc2626'
                          }}>
                            {u.enabled !== false ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  );
};

export default AdminUserManagement;
