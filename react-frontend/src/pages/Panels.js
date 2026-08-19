import { useState, useEffect } from 'react';
import { panelAPI, plantAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/* ── animations ─────────────────────────────────────────── */
const STYLES = `
@keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideIn  { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
@keyframes spin     { to{transform:rotate(360deg)} }
@keyframes pulse2   { 0%,100%{opacity:1} 50%{opacity:.4} }
`;

/* ── tiny helpers ────────────────────────────────────────── */
const STATUS_CFG = {
  ACTIVE: { color: '#10b981', bg: '#d1fae5', label: 'Active', dot: '#10b981' },
  MAINTENANCE: { color: '#f59e0b', bg: '#fef3c7', label: 'Maintenance', dot: '#f59e0b' },
  OFFLINE: { color: '#ef4444', bg: '#fee2e2', label: 'Offline', dot: '#ef4444' },
};
const sc = (s) => STATUS_CFG[s] || { color: '#6b7280', bg: '#f3f4f6', label: s, dot: '#6b7280' };

const SEVERITY_COLOR = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#10b981', None: '#10b981' };
const sev = (s) => SEVERITY_COLOR[s] || '#6b7280';

/* ── Stat pill ───────────────────────────────────────────── */
const StatPill = ({ label, value, color, bg }) => (
  <div style={{
    background: '#fff', borderRadius: 14, padding: '18px 22px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)',
    display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 140,
    borderLeft: `4px solid ${color}`,
  }}>
    <div>
      <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: 4 }}>{label}</div>
    </div>
  </div>
);

/* ── Panel tile ──────────────────────────────────────────── */
const PanelTile = ({ panel, selected, onClick }) => {
  const cfg = sc(panel.status);
  return (
    <div onClick={() => onClick(panel)} style={{
      background: selected
        ? `linear-gradient(135deg, ${cfg.color}18, ${cfg.color}08)`
        : '#fff',
      border: `2px solid ${selected ? cfg.color : 'rgba(0,0,0,0.07)'}`,
      borderRadius: 16, padding: '22px 18px', cursor: 'pointer',
      boxShadow: selected ? `0 4px 20px ${cfg.color}30` : '0 1px 6px rgba(0,0,0,0.05)',
      transition: 'all .18s', position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = cfg.color; e.currentTarget.style.boxShadow = `0 4px 16px ${cfg.color}25`; } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.05)'; } }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: cfg.color, borderRadius: '16px 16px 0 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '0.4px' }}>{panel.panelId}</span>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color }} />
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>{panel.capacity}W</div>
      <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 12 }}>{panel.plantName}</div>
      <div style={{
        display: 'inline-block', padding: '4px 12px', borderRadius: 20,
        background: cfg.bg, color: cfg.color, fontSize: 13, fontWeight: 700
      }}>{cfg.label}</div>
    </div>
  );
};

/* ── Sensor metric card ──────────────────────────────────── */
const SensorCard = ({ label, value }) => (
  <div style={{
    background: '#f8fafc', borderRadius: 10, padding: '14px 12px', textAlign: 'center',
    border: '1px solid #e2e8f0'
  }}>
    <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>{label}</div>
  </div>
);

/* ── Main component ──────────────────────────────────────── */
const Panels = () => {
  const { user } = useAuth();
  const canAddPanel = user?.role === 'ADMIN' || user?.role === 'VIEWER';
  const [panels, setPanels] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedPanel, setSelected] = useState(null);
  const [panelDetail, setDetail] = useState(null);
  const [detailLoading, setDLoading] = useState(false);
  const [detailError, setDError] = useState(null);
  const [activeTab, setTab] = useState('overview');
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [filterStatus, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    panelId: '', plantId: '', capacity: '', status: 'ACTIVE',
    installationDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { fetchPlants(); fetchPanels(); }, []);

  const fetchPlants = async () => {
    try {
      const data = await plantAPI.getAllPlants();
      setPlants(data);
    } catch (e) {
      setError('Failed to load plants: ' + e.message);
    }
  };
  const fetchPanels = async () => {
    try {
      const d = await panelAPI.getAllPanels();
      setPanels(d.sort((a, b) => (a.panelId || '').localeCompare(b.panelId || '')));
    } catch (e) { }
  };

  const handlePanelClick = async (panel) => {
    setSelected(panel); setTab('overview');
    setDetail(null); setDError(null); setSimResult(null); setDLoading(true);
    try { setDetail(await panelAPI.getPanelHistory(panel.id)); }
    catch (e) { setDError(e.message); }
    finally { setDLoading(false); }
  };

  const handleSimulate = async () => {
    if (!selectedPanel) return;
    setSimulating(true); setSimResult(null);
    try {
      const r = await panelAPI.simulateSensorData(selectedPanel.panelId);
      setSimResult({ ok: true, fault: r.predictedFault, severity: r.severity, mlDown: r.predictedFault === 'UNKNOWN' });
      setDetail(await panelAPI.getPanelHistory(selectedPanel.id));
    } catch (e) { setSimResult({ ok: false, error: e.message }); }
    finally { setSimulating(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this panel?')) return;
    try { await panelAPI.deletePanel(id); setSelected(null); setDetail(null); fetchPanels(); }
    catch (e) { setError(e.message); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setPageLoading(true); setError(null);
    try {
      await panelAPI.createPanel({ ...formData, plantId: parseInt(formData.plantId), capacity: parseFloat(formData.capacity) });
      setShowModal(false);
      setFormData({ panelId: '', plantId: '', capacity: '', status: 'ACTIVE', installationDate: new Date().toISOString().split('T')[0] });
      fetchPanels();
    } catch (e) { setError(e.message); }
    finally { setPageLoading(false); }
  };

  const stats = {
    active: panels.filter(p => p.status === 'ACTIVE').length,
    maint: panels.filter(p => p.status === 'MAINTENANCE').length,
    offline: panels.filter(p => p.status === 'OFFLINE').length,
    kw: (panels.reduce((s, p) => s + (p.capacity || 0), 0) / 1000).toFixed(1),
  };
  const filtered = filterStatus === 'all' ? panels : panels.filter(p => p.status === filterStatus);
  const latestSensor = panelDetail?.sensorData?.[0] || null;
  const openAlerts = (panelDetail?.alerts || []).filter(a => a.status !== 'RESOLVED');
  const health = openAlerts.length === 0
    ? { label: 'Healthy', color: '#10b981', bg: '#d1fae5' }
    : openAlerts.some(a => a.severity === 'CRITICAL')
      ? { label: 'Critical Fault', color: '#ef4444', bg: '#fee2e2' }
      : { label: 'Fault Detected', color: '#f97316', bg: '#fff7ed' };

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'inherit' }}>

        {/* ── Hero header ── */}
        <div style={{
          background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0d9488 100%)',
          padding: '32px 28px 48px', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 220, height: 220,
            borderRadius: '50%', border: '2px solid rgba(255,255,255,0.06)'
          }} />
          <div style={{
            position: 'absolute', bottom: -40, left: 80, width: 140, height: 140,
            borderRadius: '50%', border: '2px solid rgba(255,255,255,0.04)'
          }} />
          <div style={{ position: 'relative', maxWidth: 1300, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{
                  color: '#2dd4bf', fontSize: 13, fontWeight: 700, letterSpacing: '1.2px',
                  textTransform: 'uppercase', marginBottom: 8
                }}>☀️ Solar Panel Monitoring</div>
                <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>Panel Overview</h1>
                <p style={{ color: '#64748b', margin: '8px 0 0', fontSize: 13 }}>
                  Click any panel to inspect sensor data, health status and alerts
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <select value={filterStatus} onChange={e => setFilter(e.target.value)} style={{
                  padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  <option value="all" style={{ color: '#000' }}>All Panels</option>
                  <option value="ACTIVE" style={{ color: '#000' }}>Active</option>
                  <option value="MAINTENANCE" style={{ color: '#000' }}>Maintenance</option>
                  <option value="OFFLINE" style={{ color: '#000' }}>Offline</option>
                </select>
                {canAddPanel && (
                  <button onClick={() => { setError(null); fetchPlants(); setShowModal(true); }} style={{
                    padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: '#0d9488', color: '#fff', fontWeight: 700, fontSize: 13,
                    boxShadow: '0 4px 14px rgba(13,148,136,0.4)',
                  }}>+ Add Panel</button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1300, margin: '-24px auto 0', padding: '0 24px 40px', position: 'relative' }}>
          {error && <div style={{
            background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10,
            padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 13
          }}>{error}</div>}

          {/* ── Stat pills ── */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
            <StatPill label="Active" value={stats.active} color="#10b981" bg="#d1fae5" />
            <StatPill label="Maintenance" value={stats.maint} color="#f59e0b" bg="#fef3c7" />
            <StatPill label="Offline" value={stats.offline} color="#ef4444" bg="#fee2e2" />
            <StatPill label="Total kW" value={stats.kw} color="#3b82f6" bg="#dbeafe" />
            <StatPill label="Total Panels" value={panels.length} color="#8b5cf6" bg="#ede9fe" />
          </div>

          {/* ── Grid + Sidebar ── */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

            {/* Panel grid */}
            <div style={{
              flex: 1, minWidth: 0, background: '#fff', borderRadius: 16,
              boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)', padding: 20
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                  Solar Panels <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: 13 }}>({filtered.length})</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#94a3b8' }}>
                  {Object.entries(STATUS_CFG).map(([k, v]) => (
                    <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: v.color, display: 'inline-block' }} />
                      {v.label}
                    </span>
                  ))}
                </div>
              </div>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>☀️</div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>No panels found</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Add a panel to get started</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16 }}>
                  {filtered.map(p => (
                    <PanelTile key={p.id} panel={p} selected={selectedPanel?.id === p.id} onClick={handlePanelClick} />
                  ))}
                </div>
              )}
            </div>

            {/* ── Detail sidebar ── */}
            {selectedPanel && (
              <div style={{ width: 400, flexShrink: 0, animation: 'slideIn .25s ease both' }}>
                <div style={{
                  background: '#fff', borderRadius: 16, overflow: 'hidden',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)'
                }}>

                  {/* Header */}
                  <div style={{
                    background: 'linear-gradient(135deg,#0f172a,#1e3a5f)',
                    padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ color: '#2dd4bf', fontSize: 13, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Panel Details</div>
                      <div style={{ color: '#fff', fontSize: 20, fontWeight: 900, marginTop: 2 }}>{selectedPanel.panelId}</div>
                      <div style={{ color: '#64748b', fontSize: 12, marginTop: 1 }}>{selectedPanel.plantName}</div>
                    </div>
                    <button onClick={() => { setSelected(null); setDetail(null); }} style={{
                      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                  </div>

                  {/* Health banner */}
                  {!detailLoading && panelDetail && (
                    <div style={{
                      background: health.bg, padding: '12px 20px',
                      borderBottom: `3px solid ${health.color}`, display: 'flex', alignItems: 'center', gap: 10
                    }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: health.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 800, color: health.color, fontSize: 14 }}>{health.label}</div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>
                          {openAlerts[0] ? `${openAlerts[0].faultType?.replace(/_/g, ' ')} — ${openAlerts[0].severity}` : 'No active faults'}
                        </div>
                      </div>
                      <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: health.color }}>
                        {openAlerts.length} open
                      </div>
                    </div>
                  )}

                  {detailLoading && (
                    <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>
                      <div style={{
                        width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#0d9488',
                        borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px'
                      }} />
                      Loading panel data…
                    </div>
                  )}

                  {!detailLoading && detailError && (
                    <div style={{ padding: '16px 20px', background: '#fee2e2', color: '#dc2626', fontSize: 13 }}>
                      {detailError}
                    </div>
                  )}

                  {/* Tabs */}
                  {!detailLoading && panelDetail && (
                    <>
                      <div style={{ display: 'flex', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        {[
                          { id: 'overview', label: '📋 Info' },
                          { id: 'sensors', label: '📡 Sensors' },
                          { id: 'alerts', label: `🔔 Alerts (${openAlerts.length})` },
                        ].map(t => (
                          <button key={t.id} onClick={() => setTab(t.id)} style={{
                            flex: 1, padding: '11px 6px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                            background: activeTab === t.id ? '#fff' : 'transparent',
                            color: activeTab === t.id ? '#0d9488' : '#94a3b8',
                            borderBottom: activeTab === t.id ? '2px solid #0d9488' : '2px solid transparent',
                            transition: 'all .15s',
                          }}>{t.label}</button>
                        ))}
                      </div>

                      <div style={{ padding: '16px 18px', maxHeight: 500, overflowY: 'auto' }}>

                        {/* OVERVIEW */}
                        {activeTab === 'overview' && (
                          <div style={{ animation: 'fadeUp .2s ease both' }}>
                            {/* info rows */}
                            <div style={{ marginBottom: 16 }}>
                              {[
                                ['Panel ID', selectedPanel.panelId],
                                ['Plant', selectedPanel.plantName],
                                ['Capacity', `${selectedPanel.capacity} W`],
                                ['Status', selectedPanel.status],
                                ['Installed', selectedPanel.installationDate ? new Date(selectedPanel.installationDate).toLocaleDateString() : 'N/A'],
                                ['Technician', selectedPanel.assignedTechnicianId || '—'],
                              ].map(([k, v]) => (
                                <div key={k} style={{
                                  display: 'flex', justifyContent: 'space-between',
                                  padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13
                                }}>
                                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>{k}</span>
                                  <span style={{ fontWeight: 700, color: k === 'Status' ? sc(v).color : '#0f172a' }}>{v}</span>
                                </div>
                              ))}
                            </div>

                            {/* latest sensor snapshot */}
                            {latestSensor ? (
                              <div>
                                <div style={{
                                  fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase',
                                  letterSpacing: '0.6px', marginBottom: 10
                                }}>
                                  Latest Reading — {new Date(latestSensor.timestamp).toLocaleString()}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                  {[
                                    { icon: '⚡', label: 'Voltage', value: `${latestSensor.voltage?.toFixed(2)} V` },
                                    { icon: '🔌', label: 'Current', value: `${latestSensor.current?.toFixed(2)} A` },
                                    { icon: '💡', label: 'Power', value: `${latestSensor.power?.toFixed(1)} W` },
                                    { icon: '🌡️', label: 'Temperature', value: `${latestSensor.temperature?.toFixed(1)} °C` },
                                    { icon: '☀️', label: 'Irradiance', value: `${latestSensor.irradiance?.toFixed(0)} W/m²` },
                                  ].map(m => <SensorCard key={m.label} {...m} />)}
                                </div>
                              </div>
                            ) : (
                              <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: 13 }}>
                                No sensor readings yet
                              </div>
                            )}

                            {/* actions */}
                            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <button onClick={handleSimulate} disabled={simulating} style={{
                                padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700,
                                fontSize: 13, background: simulating ? '#e2e8f0' : '#0d9488', color: simulating ? '#94a3b8' : '#fff',
                                boxShadow: simulating ? 'none' : '0 4px 12px rgba(13,148,136,0.3)',
                              }}>
                                {simulating ? '⏳ Sending…' : '📡 Send Sensor Reading'}
                              </button>
                              {simResult && (
                                <div style={{
                                  padding: '9px 12px', borderRadius: 9, fontSize: 12, fontWeight: 600,
                                  background: simResult.ok ? (simResult.mlDown ? '#eff6ff' : simResult.fault === 'NORMAL' ? '#d1fae5' : '#fef3c7') : '#fee2e2',
                                  color: simResult.ok ? (simResult.mlDown ? '#1d4ed8' : simResult.fault === 'NORMAL' ? '#065f46' : '#92400e') : '#dc2626',
                                  border: `1px solid ${simResult.ok ? (simResult.mlDown ? '#bfdbfe' : simResult.fault === 'NORMAL' ? '#6ee7b7' : '#fde68a') : '#fca5a5'}`,
                                }}>
                                  {simResult.ok
                                    ? simResult.mlDown ? '📡 Saved — ML API offline. Run python api/app.py'
                                      : `✅ ${simResult.fault?.replace(/_/g, ' ')} · ${simResult.severity}`
                                    : `❌ ${simResult.error}`}
                                </div>
                              )}
                              <button style={{
                                padding: '10px', borderRadius: 10, border: '1px solid #e2e8f0',
                                cursor: 'pointer', fontWeight: 700, fontSize: 13, background: '#f8fafc', color: '#475569'
                              }}>
                                🔧 Schedule Maintenance
                              </button>
                              <button onClick={() => handleDelete(selectedPanel.id)} style={{
                                padding: '10px', borderRadius: 10, border: '1px solid #fca5a5',
                                cursor: 'pointer', fontWeight: 700, fontSize: 13, background: '#fff5f5', color: '#dc2626',
                              }}>🗑️ Delete Panel</button>
                            </div>
                          </div>
                        )}

                        {/* SENSORS */}
                        {activeTab === 'sensors' && (
                          <div style={{ animation: 'fadeUp .2s ease both' }}>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, fontWeight: 600 }}>
                              {(panelDetail.sensorData || []).length} readings recorded
                            </div>
                            {(panelDetail.sensorData || []).length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>No sensor data yet</div>
                            ) : (
                              <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                                  <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                      {['Time', 'V', 'A', 'W', '°C', 'Irr'].map(h => (
                                        <th key={h} style={{
                                          padding: '7px 6px', textAlign: 'left',
                                          borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: 700
                                        }}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(panelDetail.sensorData || []).slice(0, 50).map((d, i) => (
                                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                        <td style={{ padding: '5px 6px', whiteSpace: 'nowrap', color: '#64748b' }}>{new Date(d.timestamp).toLocaleString()}</td>
                                        <td style={{ padding: '5px 6px', fontWeight: 600 }}>{d.voltage?.toFixed(1)}</td>
                                        <td style={{ padding: '5px 6px', fontWeight: 600 }}>{d.current?.toFixed(2)}</td>
                                        <td style={{ padding: '5px 6px', fontWeight: 600 }}>{d.power?.toFixed(1)}</td>
                                        <td style={{ padding: '5px 6px', fontWeight: 600 }}>{d.temperature?.toFixed(1)}</td>
                                        <td style={{ padding: '5px 6px', fontWeight: 600 }}>{d.irradiance?.toFixed(0)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ALERTS */}
                        {activeTab === 'alerts' && (
                          <div style={{ animation: 'fadeUp .2s ease both' }}>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, fontWeight: 600 }}>
                              {(panelDetail.alerts || []).length} total · {openAlerts.length} open
                            </div>
                            {(panelDetail.alerts || []).length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '40px 0', color: '#10b981', fontWeight: 700 }}>✅ No alerts</div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {(panelDetail.alerts || []).slice(0, 30).map((a, i) => (
                                  <div key={i} style={{
                                    borderRadius: 10, padding: '12px 14px', background: '#fff',
                                    border: `1px solid ${sev(a.severity)}30`,
                                    borderLeft: `4px solid ${sev(a.severity)}`,
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                  }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                      <span style={{ fontWeight: 800, fontSize: 12, color: sev(a.severity) }}>
                                        {a.faultType?.replace(/_/g, ' ')}
                                      </span>
                                      <span style={{
                                        fontSize: 12, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
                                        background: a.status === 'RESOLVED' ? '#d1fae5' : a.status === 'IN_PROGRESS' ? '#fef3c7' : '#fee2e2',
                                        color: a.status === 'RESOLVED' ? '#065f46' : a.status === 'IN_PROGRESS' ? '#92400e' : '#dc2626',
                                      }}>{a.status}</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>{a.message}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8' }}>
                                      <span>Severity: <strong style={{ color: sev(a.severity) }}>{a.severity}</strong></span>
                                      <span>{new Date(a.createdAt).toLocaleString()}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div >

      {/* ── Add Panel Modal ── */}
      {
        showModal && (
          <div onClick={() => setShowModal(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(4px)',
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              background: '#fff', borderRadius: 18, padding: '28px 28px 24px',
              width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              animation: 'fadeUp .25s ease both',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>Add New Panel</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Register a solar panel to the system</div>
                </div>
                <button onClick={() => setShowModal(false)} style={{
                  background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32,
                  cursor: 'pointer', fontSize: 16, color: '#64748b',
                }}>✕</button>
              </div>

              {error && <div style={{
                background: '#fee2e2', borderRadius: 8, padding: '10px 12px',
                color: '#dc2626', fontSize: 12, marginBottom: 14
              }}>{error}</div>}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { id: 'panelId', label: 'Panel ID', type: 'text', placeholder: 'e.g. P001' },
                  { id: 'capacity', label: 'Capacity (W)', type: 'number', placeholder: 'e.g. 350', min: '1' },
                  { id: 'installationDate', label: 'Installation Date', type: 'date' },
                ].map(f => (
                  <div key={f.id}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>{f.label} *</label>
                    <input type={f.type} id={f.id} name={f.id} value={formData[f.id]}
                      onChange={e => setFormData(p => ({ ...p, [f.id]: e.target.value }))}
                      placeholder={f.placeholder} min={f.min} required
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #e2e8f0',
                        fontSize: 13, outline: 'none', boxSizing: 'border-box',
                        transition: 'border-color .15s',
                      }}
                      onFocus={e => e.target.style.borderColor = '#0d9488'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>Solar Plant *</label>
                  {plants.length === 0 ? (
                    <div style={{
                      padding: '10px 12px', borderRadius: 9, border: '1px solid #fcd34d',
                      background: '#fffbeb', color: '#92400e', fontSize: 13
                    }}>
                      No plants found.{' '}
                      <a href="/plants" style={{ color: '#0d9488', fontWeight: 700 }}
                        onClick={() => setShowModal(false)}>
                        Create a plant first
                      </a>
                    </div>
                  ) : (
                    <select name="plantId" value={formData.plantId}
                      onChange={e => setFormData(p => ({ ...p, plantId: e.target.value }))} required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}>
                      <option value="">Select a plant</option>
                      {plants.map(pl => <option key={pl.id} value={pl.id}>{pl.name} — {pl.location}</option>)}
                    </select>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>Status *</label>
                  <select name="status" value={formData.status}
                    onChange={e => setFormData(p => ({ ...p, status: e.target.value }))} required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}>
                    <option value="ACTIVE">Active</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OFFLINE">Offline</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{
                    flex: 1, padding: '11px', borderRadius: 10, border: '1px solid #e2e8f0',
                    background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}>Cancel</button>
                  <button type="submit" disabled={pageLoading} style={{
                    flex: 1, padding: '11px', borderRadius: 10, border: 'none',
                    background: pageLoading ? '#e2e8f0' : '#0d9488',
                    color: pageLoading ? '#94a3b8' : '#fff',
                    fontWeight: 700, fontSize: 13, cursor: pageLoading ? 'not-allowed' : 'pointer',
                    boxShadow: pageLoading ? 'none' : '0 4px 12px rgba(13,148,136,0.3)',
                  }}>{pageLoading ? 'Adding…' : 'Add Panel'}</button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </>
  );
};

export default Panels;
