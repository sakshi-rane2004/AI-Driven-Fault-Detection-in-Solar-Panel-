import { useState, useEffect } from 'react';
import { plantAPI } from '../services/api';

const inp = {
  width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #e2e8f0',
  fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#f8fafc'
};

const PlantManagement = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', capacityKW: '' });

  useEffect(() => { fetchPlants(); }, []);

  const fetchPlants = async () => {
    try { setLoading(true); setError(null); setPlants(await plantAPI.getAllPlants()); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      const d = { ...formData, capacityKW: parseFloat(formData.capacityKW) };
      editing ? await plantAPI.updatePlant(editing.id, d) : await plantAPI.createPlant(d);
      setShowForm(false); setEditing(null); setFormData({ name: '', location: '', capacityKW: '' });
      fetchPlants();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  const handleEdit = (p) => {
    setEditing(p); setFormData({ name: p.name, location: p.location, capacityKW: p.capacityKW.toString() });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plant? All associated panels will also be deleted.')) return;
    try { await plantAPI.deletePlant(id); fetchPlants(); } catch (e) { setError(e.message); }
  };

  const cancel = () => { setShowForm(false); setEditing(null); setFormData({ name: '', location: '', capacityKW: '' }); setError(null); };

  const totalKW = plants.reduce((s, p) => s + (p.capacityKW || 0), 0);

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
          maxWidth: 1100, margin: '0 auto', display: 'flex',
          justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16
        }}>
          <div>
            <div style={{ color: '#2dd4bf', fontSize: 13, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 8 }}>🏭 Plant Management</div>
            <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0 }}>Solar Plants</h1>
            <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: 13 }}>Manage your solar power plant locations and capacity</p>
          </div>
          <button onClick={() => setShowForm(true)} style={{
            padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: '#0d9488', color: '#fff', fontWeight: 700, fontSize: 13,
            boxShadow: '0 4px 14px rgba(13,148,136,0.4)',
          }}>+ Add New Plant</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '-24px auto 0', padding: '0 24px 40px', position: 'relative' }}>
        {error && <div style={{
          background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10,
          padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 13
        }}>{error}</div>}

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
          {[
            { icon: '🏭', label: 'Total Plants', value: plants.length, color: '#0d9488', bg: '#f0fdfa' },
            { icon: '⚡', label: 'Total Capacity', value: `${totalKW.toLocaleString()} kW`, color: '#3b82f6', bg: '#eff6ff' },
            { icon: '☀️', label: 'Total Panels', value: plants.reduce((s, p) => s + (p.panelCount || 0), 0), color: '#f59e0b', bg: '#fffbeb' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, borderRadius: 14, padding: '18px 22px',
              flex: 1, minWidth: 160, borderLeft: `4px solid ${s.color}`
            }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: s.color, textTransform: 'uppercase',
                letterSpacing: '0.7px', marginBottom: 8
              }}>{s.icon} {s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Add/Edit form */}
        {showForm && (
          <div style={{
            background: '#fff', borderRadius: 16, padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', marginBottom: 20
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 18 }}>
              {editing ? 'Edit Plant' : 'Add New Plant'}
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                {[
                  { name: 'name', label: 'Plant Name', placeholder: 'e.g. Solar Farm A' },
                  { name: 'location', label: 'Location', placeholder: 'e.g. California, USA' },
                ].map(f => (
                  <div key={f.name}>
                    <label style={{
                      fontSize: 13, fontWeight: 700, color: '#374151', textTransform: 'uppercase',
                      letterSpacing: '0.6px', display: 'block', marginBottom: 5
                    }}>{f.label} *</label>
                    <input type="text" name={f.name} value={formData[f.name]}
                      onChange={e => setFormData(p => ({ ...p, [f.name]: e.target.value }))}
                      placeholder={f.placeholder} required style={inp}
                      onFocus={e => e.target.style.borderColor = '#0d9488'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  fontSize: 13, fontWeight: 700, color: '#374151', textTransform: 'uppercase',
                  letterSpacing: '0.6px', display: 'block', marginBottom: 5
                }}>Capacity (kW) *</label>
                <input type="number" name="capacityKW" value={formData.capacityKW}
                  onChange={e => setFormData(p => ({ ...p, capacityKW: e.target.value }))}
                  placeholder="e.g. 5000" step="0.01" min="0" required style={{ ...inp, maxWidth: 300 }}
                  onFocus={e => e.target.style.borderColor = '#0d9488'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving} style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: saving ? '#e2e8f0' : '#0d9488', color: saving ? '#94a3b8' : '#fff',
                  fontWeight: 700, fontSize: 13,
                }}>{saving ? 'Saving…' : editing ? 'Update Plant' : 'Create Plant'}</button>
                <button type="button" onClick={cancel} style={{
                  padding: '10px 20px', borderRadius: 10, border: '1px solid #e2e8f0',
                  background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{
            padding: '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
              All Plants <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: 13 }}>({plants.length})</span>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏭</div>
              <div style={{ fontWeight: 600 }}>Loading plants…</div>
            </div>
          ) : plants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏭</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No plants yet</div>
              <div style={{ fontSize: 13 }}>Click "Add New Plant" to get started</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                    {['Name', 'Location', 'Capacity (kW)', 'Panels', 'Created', 'Actions'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left', fontWeight: 700,
                        color: '#64748b', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {plants.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '13px 16px', fontWeight: 700, color: '#0f172a' }}>{p.name}</td>
                      <td style={{ padding: '13px 16px', color: '#64748b' }}>{p.location}</td>
                      <td style={{ padding: '13px 16px', fontWeight: 600, color: '#0f172a' }}>{p.capacityKW?.toLocaleString()}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                          background: '#eff6ff', color: '#3b82f6'
                        }}>{p.panelCount || 0} panels</span>
                      </td>
                      <td style={{ padding: '13px 16px', color: '#94a3b8', fontSize: 12 }}>
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleEdit(p)} style={{
                            padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
                            background: '#f8fafc', color: '#374151', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          }}>Edit</button>
                          <button onClick={() => handleDelete(p.id)} style={{
                            padding: '6px 14px', borderRadius: 8, border: '1px solid #fca5a5',
                            background: '#fff5f5', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantManagement;
