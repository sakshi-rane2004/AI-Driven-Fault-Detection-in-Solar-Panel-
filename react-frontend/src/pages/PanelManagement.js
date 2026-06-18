import { useState, useEffect } from 'react';
import { panelAPI, plantAPI } from '../services/api';

const inp = {
  width: '100%', padding: '10px 12px', borderRadius: 9,
  border: '1px solid #e2e8f0', fontSize: 14, outline: 'none',
  boxSizing: 'border-box', background: '#f8fafc',
};

const STATUS_CFG = {
  ACTIVE: { color: '#10b981', bg: '#d1fae5' },
  MAINTENANCE: { color: '#f59e0b', bg: '#fef3c7' },
  OFFLINE: { color: '#ef4444', bg: '#fee2e2' },
};

const Lbl = ({ children }) => (
  <label style={{
    fontSize: 12, fontWeight: 700, color: '#374151',
    textTransform: 'uppercase', letterSpacing: '0.6px',
    display: 'block', marginBottom: 6,
  }}>{children}</label>
);

const PanelManagement = () => {
  const [panels, setPanels] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterPlant, setFilter] = useState('all');
  const [form, setForm] = useState({
    panelId: '', plantId: '', installationDate: '',
    capacity: '', status: 'ACTIVE', assignedTechnicianId: '',
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const [p, pl] = await Promise.all([
        panelAPI.getAllPanels(),
        plantAPI.getAllPlants(),
      ]);
      setPanels(p); setPlants(pl);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      const d = {
        panelId: form.panelId,
        plantId: parseInt(form.plantId),
        installationDate: form.installationDate,
        capacity: parseFloat(form.capacity),
        status: form.status,
        assignedTechnicianId: form.assignedTechnicianId
          ? parseInt(form.assignedTechnicianId) : null,
      };
      if (editing) {
        await panelAPI.updatePanel(editing.id, d);
      } else {
        await panelAPI.createPanel(d);
      }
      setShowForm(false); setEditing(null);
      setForm({ panelId: '', plantId: '', installationDate: '', capacity: '', status: 'ACTIVE', assignedTechnicianId: '' });
      fetchData();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = (p) => {
    setEditing(p);
    setForm({
      panelId: p.panelId,
      plantId: p.plantId.toString(),
      installationDate: p.installationDate,
      capacity: p.capacity.toString(),
      status: p.status,
      assignedTechnicianId: p.assignedTechnicianId
        ? p.assignedTechnicianId.toString() : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this panel?')) return;
    try { await panelAPI.deletePanel(id); fetchData(); }
    catch (e) { setError(e.message); }
  };

  const cancel = () => {
    setShowForm(false); setEditing(null);
    setForm({ panelId: '', plantId: '', installationDate: '', capacity: '', status: 'ACTIVE', assignedTechnicianId: '' });
    setError(null);
  };

  const filtered = filterPlant === 'all'
    ? panels
    : panels.filter(p => p.plantId === parseInt(filterPlant));

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>

      <div style={{
        background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0d9488 100%)',
        padding: '32px 28px 48px', overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', display: 'flex',
          justifyContent: 'space-between', alignItems: 'flex-end',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div style={{
              color: '#2dd4bf', fontSize: 12, fontWeight: 700,
              letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8,
            }}>Panel Management</div>
            <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0 }}>
              Manage Panels
            </h1>
            <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: 14 }}>
              Configure individual solar panels and their assignments
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            disabled={plants.length === 0}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              cursor: plants.length === 0 ? 'not-allowed' : 'pointer',
              background: plants.length === 0 ? '#475569' : '#0d9488',
              color: '#fff', fontWeight: 700, fontSize: 14,
            }}
          >+ Add New Panel</button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '-24px auto 0', padding: '0 24px 40px', position: 'relative' }}>

        {plants.length === 0 && !loading && (
          <div style={{
            background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10,
            padding: '12px 16px', marginBottom: 16, color: '#92400e', fontSize: 14, fontWeight: 600,
          }}>
            Create a solar plant first before adding panels.
          </div>
        )}

        {error && (
          <div style={{
            background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10,
            padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 14,
          }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Panels', value: panels.length, color: '#0d9488', bg: '#f0fdfa' },
            { label: 'Active', value: panels.filter(p => p.status === 'ACTIVE').length, color: '#10b981', bg: '#f0fdf4' },
            { label: 'Maintenance', value: panels.filter(p => p.status === 'MAINTENANCE').length, color: '#f59e0b', bg: '#fffbeb' },
            { label: 'Offline', value: panels.filter(p => p.status === 'OFFLINE').length, color: '#ef4444', bg: '#fef2f2' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, borderRadius: 14, padding: '18px 22px',
              flex: 1, minWidth: 140, borderLeft: `4px solid ${s.color}`,
            }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: s.color,
                textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8,
              }}>{s.label}</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: '#0f172a' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {showForm && (
          <div style={{
            background: '#fff', borderRadius: 16, padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', marginBottom: 20,
          }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>
              {editing ? 'Edit Panel' : 'Add New Panel'}
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

                <div>
                  <Lbl>Panel ID *</Lbl>
                  <input
                    type="text" value={form.panelId}
                    onChange={e => setForm(p => ({ ...p, panelId: e.target.value }))}
                    placeholder="e.g. P001" required disabled={!!editing}
                    style={{ ...inp, opacity: editing ? 0.6 : 1 }}
                    onFocus={e => { if (!editing) e.target.style.borderColor = '#0d9488'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
                  />
                </div>

                <div>
                  <Lbl>Plant *</Lbl>
                  <select
                    value={form.plantId}
                    onChange={e => setForm(p => ({ ...p, plantId: e.target.value }))}
                    required style={inp}
                  >
                    <option value="">Select Plant</option>
                    {plants.map(pl => (
                      <option key={pl.id} value={pl.id}>{pl.name} - {pl.location}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Lbl>Capacity (W) *</Lbl>
                  <input
                    type="number" value={form.capacity}
                    onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
                    placeholder="e.g. 350" step="0.01" min="0" required style={inp}
                    onFocus={e => { e.target.style.borderColor = '#0d9488'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
                  />
                </div>

                <div>
                  <Lbl>Installation Date *</Lbl>
                  <input
                    type="date" value={form.installationDate}
                    onChange={e => setForm(p => ({ ...p, installationDate: e.target.value }))}
                    required style={inp}
                    onFocus={e => { e.target.style.borderColor = '#0d9488'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
                  />
                </div>

                <div>
                  <Lbl>Status *</Lbl>
                  <select
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    required style={inp}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OFFLINE">Offline</option>
                  </select>
                </div>

                <div>
                  <Lbl>Technician ID (optional)</Lbl>
                  <input
                    type="number" value={form.assignedTechnicianId}
                    onChange={e => setForm(p => ({ ...p, assignedTechnicianId: e.target.value }))}
                    placeholder="Optional" style={inp}
                    onFocus={e => { e.target.style.borderColor = '#0d9488'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
                  />
                </div>

              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit" disabled={saving}
                  style={{
                    padding: '10px 24px', borderRadius: 10, border: 'none',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    background: saving ? '#e2e8f0' : '#0d9488',
                    color: saving ? '#94a3b8' : '#fff', fontWeight: 700, fontSize: 14,
                  }}
                >{saving ? 'Saving...' : editing ? 'Update Panel' : 'Create Panel'}</button>
                <button
                  type="button" onClick={cancel}
                  style={{
                    padding: '10px 20px', borderRadius: 10, border: '1px solid #e2e8f0',
                    background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  }}
                >Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              All Panels{' '}
              <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: 14 }}>({filtered.length})</span>
            </div>
            <select
              value={filterPlant} onChange={e => setFilter(e.target.value)}
              style={{
                padding: '8px 14px', borderRadius: 9, border: '1px solid #e2e8f0',
                background: '#f8fafc', fontSize: 13, fontWeight: 600,
                color: '#374151', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="all">All Plants</option>
              {plants.map(pl => <option key={pl.id} value={pl.id}>{pl.name}</option>)}
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
              <div style={{
                width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#0d9488',
                borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px',
              }} />
              <div style={{ fontWeight: 600, fontSize: 14 }}>Loading panels...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No panels found</div>
              <div style={{ fontSize: 14 }}>Add a panel to get started</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                    {['Panel ID', 'Plant', 'Installed', 'Capacity (W)', 'Status', 'Technician', 'Actions'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left', fontWeight: 700,
                        color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const sc = STATUS_CFG[p.status] || { color: '#6b7280', bg: '#f3f4f6' };
                    return (
                      <tr key={p.id} style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: i % 2 === 0 ? '#fff' : '#fafafa',
                      }}>
                        <td style={{ padding: '13px 16px', fontWeight: 800, color: '#0f172a' }}>{p.panelId}</td>
                        <td style={{ padding: '13px 16px', color: '#64748b' }}>{p.plantName}</td>
                        <td style={{ padding: '13px 16px', color: '#94a3b8' }}>
                          {new Date(p.installationDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '13px 16px', fontWeight: 600, color: '#0f172a' }}>
                          {p.capacity?.toLocaleString()}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{
                            padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                            background: sc.bg, color: sc.color,
                          }}>{p.status}</span>
                        </td>
                        <td style={{ padding: '13px 16px', color: '#94a3b8' }}>
                          {p.assignedTechnicianId || '-'}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleEdit(p)}
                              style={{
                                padding: '6px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
                                background: '#f8fafc', color: '#374151', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                              }}
                            >Edit</button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              style={{
                                padding: '6px 16px', borderRadius: 8, border: '1px solid #fca5a5',
                                background: '#fff5f5', color: '#dc2626', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                              }}
                            >Delete</button>
                          </div>
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

export default PanelManagement;
