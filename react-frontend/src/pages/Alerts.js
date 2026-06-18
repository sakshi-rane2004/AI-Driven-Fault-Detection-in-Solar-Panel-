import { useState, useEffect } from 'react';
import { alertAPI } from '../services/api';

const SEV = {
  CRITICAL: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'Critical', icon: '🔴' },
  HIGH: { color: '#ea580c', bg: '#fff7ed', border: '#fdba74', label: 'High', icon: '🟠' },
  MEDIUM: { color: '#d97706', bg: '#fffbeb', border: '#fcd34d', label: 'Medium', icon: '🟡' },
  LOW: { color: '#16a34a', bg: '#f0fdf4', border: '#86efac', label: 'Low', icon: '🟢' },
};
const sev = (s) => SEV[s] || { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', label: s, icon: '⚪' };

const STATUS_CFG = {
  OPEN: { color: '#dc2626', bg: '#fef2f2', label: 'Open' },
  IN_PROGRESS: { color: '#d97706', bg: '#fffbeb', label: 'In Progress' },
  RESOLVED: { color: '#16a34a', bg: '#f0fdf4', label: 'Resolved' },
};
const stc = (s) => STATUS_CFG[s] || { color: '#6b7280', bg: '#f9fafb', label: s };

const fmt = (d) => d ? new Date(d).toLocaleString() : '—';

/* ── Stat card ─────────────────────────────────────────── */
const StatCard = ({ icon, label, value, color, bg, border, sub }) => (
  <div style={{
    background: bg, border: `1px solid ${border}`,
    borderRadius: 14, padding: '20px 22px',
    flex: 1, minWidth: 160,
    borderLeft: `4px solid ${color}`,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
      <span style={{
        fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.7px', color: color
      }}>{label}</span>
      <span style={{ fontSize: 20 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', lineHeight: 1, marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{sub}</div>
  </div>
);

/* ── Alert row ─────────────────────────────────────────── */
const AlertRow = ({ alert, onAck, onStatus }) => {
  const s = sev(alert.severity);
  const st = stc(alert.status);
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '16px 20px',
      border: `1px solid #e5e7eb`, borderLeft: `4px solid ${s.color}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      marginBottom: 10,
    }}>
      {/* top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Panel {alert.panelId}</span>
          {/* severity pill */}
          <span style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 700,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
          }}>{s.icon} {s.label}</span>
          {/* status pill */}
          <span style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 700,
            background: st.bg, color: st.color,
          }}>{st.label}</span>
          {alert.acknowledged && (
            <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>✓ Acknowledged</span>
          )}
        </div>

        {/* action buttons */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {!alert.acknowledged && (
            <button onClick={() => onAck(alert.id)} style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
              background: '#f8fafc', color: '#374151', fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
            }}>✓ Acknowledge</button>
          )}
          {alert.status === 'OPEN' && (
            <button onClick={() => onStatus(alert.id, 'IN_PROGRESS')} style={{
              padding: '6px 14px', borderRadius: 8,
              background: '#fffbeb', color: '#d97706', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', border: '1px solid #fcd34d',
            }}>In Progress</button>
          )}
          {alert.status === 'IN_PROGRESS' && (
            <button onClick={() => onStatus(alert.id, 'RESOLVED')} style={{
              padding: '6px 14px', borderRadius: 8,
              background: '#f0fdf4', color: '#16a34a', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', border: '1px solid #86efac',
            }}>Resolve</button>
          )}
        </div>
      </div>

      {/* fault + message */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10 }}>
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}>
          <span style={{ color: '#94a3b8', fontWeight: 600 }}>Fault: </span>
          <span style={{ color: '#0f172a', fontWeight: 700 }}>{alert.faultType?.replace(/_/g, ' ')}</span>
        </div>
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}>
          <span style={{ color: '#94a3b8', fontWeight: 600 }}>Confidence: </span>
          <span style={{ color: '#0f172a', fontWeight: 700 }}>{alert.confidence} ({((alert.confidenceScore || 0) * 100).toFixed(0)}%)</span>
        </div>
      </div>

      <div style={{ fontSize: 13, color: '#475569', marginBottom: 8, lineHeight: 1.5 }}>{alert.message}</div>

      {/* footer */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#94a3b8' }}>
        <span>Created: {fmt(alert.createdAt)}</span>
        {alert.resolvedAt && <span>Resolved: {fmt(alert.resolvedAt)}</span>}
        {alert.acknowledged && <span>Acked: {fmt(alert.acknowledgedAt)}</span>}
      </div>

      {alert.technicianNotes && (
        <div style={{
          marginTop: 10, padding: '8px 12px', background: '#f0fdf4',
          borderRadius: 8, fontSize: 12, color: '#166534', border: '1px solid #bbf7d0'
        }}>
          📝 {alert.technicianNotes}
        </div>
      )}
    </div>
  );
};

/* ── Main ──────────────────────────────────────────────── */
const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterSeverity, setFSev] = useState('all');
  const [filterStatus, setFSt] = useState('all');
  const [sortBy, setSort] = useState('timestamp');
  const [stats, setStats] = useState({ critical: 0, high: 0, medium: 0, unack: 0 });

  const fetchAlerts = async () => {
    try {
      setLoading(true); setError(null);
      const data = await alertAPI.getAllAlerts();
      setAlerts(data);
      setStats({
        critical: data.filter(a => a.severity === 'CRITICAL').length,
        high: data.filter(a => a.severity === 'HIGH').length,
        medium: data.filter(a => a.severity === 'MEDIUM').length,
        unack: data.filter(a => !a.acknowledged).length,
      });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAlerts(); const t = setInterval(fetchAlerts, 30000); return () => clearInterval(t); }, []);

  useEffect(() => {
    let f = [...alerts];
    if (filterSeverity !== 'all') f = f.filter(a => a.severity === filterSeverity);
    if (filterStatus === 'unacknowledged') f = f.filter(a => !a.acknowledged);
    else if (filterStatus === 'acknowledged') f = f.filter(a => a.acknowledged);
    else if (filterStatus !== 'all') f = f.filter(a => a.status === filterStatus.toUpperCase());
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    f.sort((a, b) => sortBy === 'severity'
      ? (order[a.severity] || 9) - (order[b.severity] || 9)
      : sortBy === 'panel' ? a.panelId.localeCompare(b.panelId)
        : sortBy === 'fault_type' ? a.faultType.localeCompare(b.faultType)
          : new Date(b.createdAt) - new Date(a.createdAt));
    setFiltered(f);
  }, [alerts, filterSeverity, filterStatus, sortBy]);

  const handleAck = async (id) => { try { await alertAPI.acknowledgeAlert(id, 1); fetchAlerts(); } catch (e) { setError(e.message); } };
  const handleStatus = async (id, s) => { try { await alertAPI.updateAlertStatus(id, s, 1); fetchAlerts(); } catch (e) { setError(e.message); } };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0d9488 100%)',
        padding: '32px 28px 48px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -50, right: -50, width: 200, height: 200,
          borderRadius: '50%', border: '2px solid rgba(255,255,255,0.05)'
        }} />
        <div style={{
          maxWidth: 1200, margin: '0 auto', display: 'flex',
          justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16
        }}>
          <div>
            <div style={{
              color: '#2dd4bf', fontSize: 13, fontWeight: 700,
              letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 8
            }}>🔔 Alert Management</div>
            <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0 }}>System Alerts</h1>
            <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: 13 }}>
              Monitor, acknowledge and resolve fault notifications
            </p>
          </div>
          <button onClick={fetchAlerts} style={{
            padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700,
            fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(8px)',
          }}>↻ Refresh</button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '-24px auto 0', padding: '0 24px 40px', position: 'relative' }}>

        {error && <div style={{
          background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10,
          padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 13
        }}>{error}</div>}

        {/* ── Stat cards ── */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
          <StatCard icon="🔴" label="Critical" value={stats.critical} color="#dc2626" bg="#fef2f2" border="#fca5a5" sub="Immediate action needed" />
          <StatCard icon="🟠" label="High Priority" value={stats.high} color="#ea580c" bg="#fff7ed" border="#fdba74" sub="Action needed soon" />
          <StatCard icon="🟡" label="Medium" value={stats.medium} color="#d97706" bg="#fffbeb" border="#fcd34d" sub="Monitor closely" />
          <StatCard icon="🔕" label="Unacknowledged" value={stats.unack} color="#7c3aed" bg="#f5f3ff" border="#c4b5fd" sub="Awaiting acknowledgment" />
        </div>

        {/* ── Filters ── */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: '16px 20px',
          border: '1px solid #e5e7eb', marginBottom: 20,
          display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end'
        }}>
          {[
            {
              label: 'Severity', value: filterSeverity, set: setFSev, opts: [
                ['all', 'All Severities'], ['CRITICAL', 'Critical'], ['HIGH', 'High'], ['MEDIUM', 'Medium'], ['LOW', 'Low'],
              ]
            },
            {
              label: 'Status', value: filterStatus, set: setFSt, opts: [
                ['all', 'All Alerts'], ['unacknowledged', 'Unacknowledged'], ['acknowledged', 'Acknowledged'],
                ['OPEN', 'Open'], ['IN_PROGRESS', 'In Progress'], ['RESOLVED', 'Resolved'],
              ]
            },
            {
              label: 'Sort by', value: sortBy, set: setSort, opts: [
                ['timestamp', 'Timestamp'], ['severity', 'Severity'], ['panel', 'Panel ID'], ['fault_type', 'Fault Type'],
              ]
            },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{
                fontSize: 13, fontWeight: 700, color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '0.6px'
              }}>{f.label}</label>
              <select value={f.value} onChange={e => f.set(e.target.value)} style={{
                padding: '8px 12px', borderRadius: 9, border: '1px solid #e2e8f0',
                background: '#f8fafc', fontSize: 13, fontWeight: 600, color: '#374151',
                cursor: 'pointer', outline: 'none', minWidth: 160,
              }}>
                {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8', alignSelf: 'center', fontWeight: 600 }}>
            {filtered.length} alert{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* ── Alert list ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
            <div style={{ fontWeight: 600 }}>Loading alerts…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 0', color: '#94a3b8',
            background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No alerts found</div>
            <div style={{ fontSize: 13 }}>All systems are operating normally</div>
          </div>
        ) : (
          <div>
            {filtered.map(a => (
              <AlertRow key={a.id} alert={a} onAck={handleAck} onStatus={handleStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
