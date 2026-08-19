import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString());

const ANIM = `
@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulseRing { 0%{transform:scale(.9);opacity:.6} 70%{transform:scale(1.3);opacity:0} 100%{transform:scale(.9);opacity:0} }
`;

/* SVG icon component — switch-based, no module-level JSX objects */
const Ico = ({ name, size = 18, color = 'currentColor' }) => {
  const p = { fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const W = ({ children }) => <svg width={size} height={size} viewBox="0 0 24 24" {...p}>{children}</svg>;
  switch (name) {
    case 'plant': return <W><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></W>;
    case 'panel': return <W><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></W>;
    case 'active': return <W><polyline points="20 6 9 17 4 12" /></W>;
    case 'wrench': return <W><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></W>;
    case 'offline': return <W><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></W>;
    case 'alert': return <W><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></W>;
    case 'search': return <W><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></W>;
    case 'chart': return <W><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></W>;
    case 'manage': return <W><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" /></W>;
    case 'arrow': return <W><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></W>;
    default: return <W><rect x="3" y="3" width="18" height="18" rx="2" /></W>;
  }
};

const StatCard = ({ iconKey, label, value, accent, delay = 0 }) => (
  <div style={{
    background: '#fff', borderRadius: 16, padding: '24px 22px',
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)',
    animation: `fadeUp .5s ease ${delay}s both`,
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: accent, borderRadius: '16px 16px 0 0' }} />
    <div style={{
      position: 'absolute', top: -20, right: -20, width: 100, height: 100,
      borderRadius: '50%', background: accent, opacity: 0.06
    }} />
    <div style={{ color: accent, marginBottom: 14 }}>
      <Ico name={iconKey} size={28} />
    </div>
    <div style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', lineHeight: 1, marginBottom: 6 }}>{value}</div>
    <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</div>
  </div>
);

const SeverityRow = ({ label, count, color, bg }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', borderRadius: 10, background: bg, border: `1px solid ${color}30`, marginBottom: 8
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{label}</span>
    </div>
    <span style={{
      fontSize: 15, fontWeight: 800, color,
      background: '#fff', padding: '2px 10px', borderRadius: 20, boxShadow: `0 0 0 2px ${color}30`
    }}>{count}</span>
  </div>
);

const ActionCard = ({ to, iconKey, title, desc, accent, delay = 0 }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div style={{
      background: '#fff', borderRadius: 14, padding: '18px 20px',
      border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      transition: 'all .2s', animation: `fadeUp .5s ease ${delay}s both`,
      display: 'flex', alignItems: 'center', gap: 16,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${accent}30`; e.currentTarget.style.borderColor = accent; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: accent + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent
      }}>
        <Ico name={iconKey} size={22} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#94a3b8' }}>{desc}</div>
      </div>
      <div style={{ marginLeft: 'auto', color: '#cbd5e1' }}>
        <Ico name="arrow" size={16} />
      </div>
    </div>
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === 'ADMIN';
  const isTech = role === 'TECHNICIAN';
  const canManage = isAdmin || isTech; // admin + technician

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = async () => {
    try {
      setError(null);
      const data = await dashboardAPI.getStats();
      setStats(data); setLastRefresh(new Date());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); const t = setInterval(fetchData, 30000); return () => clearInterval(t); }, []);

  const healthPct = stats
    ? Math.round(((stats.activePanels || 0) / Math.max(stats.totalPanels || 1, 1)) * 100) : 0;

  return (
    <>
      <style>{ANIM}</style>
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0d9488 100%)',
          padding: '40px 32px 60px', position: 'relative', overflow: 'hidden'
        }}>
          {[{ s: 300, t: -80, r: -60, o: .06 }, { s: 180, t: 20, r: 200, o: .04 }, { s: 120, b: -40, l: 100, o: .05 }].map((c, i) => (
            <div key={i} style={{
              position: 'absolute', width: c.s, height: c.s, borderRadius: '50%',
              border: '2px solid #fff', top: c.t, right: c.r, bottom: c.b, left: c.l, opacity: c.o
            }} />
          ))}

          <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ position: 'relative', width: 12, height: 12 }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981', animation: 'pulseRing 2s ease-out infinite' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981', position: 'relative' }} />
                  </div>
                  <span style={{ color: '#10b981', fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Live Monitoring</span>
                </div>
                <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
                  Solar Panel<br /><span style={{ color: '#2dd4bf' }}>Fault Detection</span>
                </h1>
                <p style={{ color: '#94a3b8', margin: '10px 0 0', fontSize: 14 }}>
                  Real-time monitoring · AI-powered fault detection · Auto alerts
                </p>
              </div>

              {/* Health ring */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 8px' }}>
                  <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - healthPct / 100)}`}
                      strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>{loading ? '…' : `${healthPct}%`}</span>
                  </div>
                </div>
                <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Fleet Health</div>
              </div>
            </div>

            {/* Mini stats in hero */}
            {stats && (
              <div style={{ display: 'flex', gap: 28, marginTop: 32, flexWrap: 'wrap' }}>
                {[
                  { label: 'Plants', value: stats.totalPlants || 0, color: '#2dd4bf' },
                  { label: 'Panels', value: stats.totalPanels || 0, color: '#60a5fa' },
                  { label: 'Active', value: stats.activePanels || 0, color: '#34d399' },
                  { label: 'Open Alerts', value: stats.openAlerts || 0, color: '#fb923c' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 3, height: 32, borderRadius: 99, background: item.color }} />
                    <div>
                      <div style={{ color: '#fff', fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{fmt(item.value)}</div>
                      <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: 1200, margin: '-28px auto 0', padding: '0 24px 40px', position: 'relative' }}>
          {error && <div style={{
            background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10,
            padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 14
          }}>{error}</div>}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Loading dashboard…</div>
            </div>
          ) : (
            <>
              {/* Stat cards — filtered by role */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
                {isAdmin && <StatCard iconKey="plant" label="Total Plants" value={fmt(stats?.totalPlants)} accent="#0d9488" delay={0.0} />}
                <StatCard iconKey="panel" label="Total Panels" value={fmt(stats?.totalPanels)} accent="#3b82f6" delay={0.1} />
                <StatCard iconKey="active" label="Active Panels" value={fmt(stats?.activePanels)} accent="#10b981" delay={0.2} />
                {canManage && <StatCard iconKey="wrench" label="Maintenance" value={fmt(stats?.maintenancePanels)} accent="#f59e0b" delay={0.3} />}
                {canManage && <StatCard iconKey="offline" label="Offline" value={fmt(stats?.offlinePanels)} accent="#ef4444" delay={0.4} />}
              </div>

              {/* Two-column — alert overview only for admin/technician */}
              <div style={{ display: 'grid', gridTemplateColumns: canManage ? '1fr 340px' : '1fr', gap: 20, marginBottom: 20 }}>

                {/* Alert breakdown — admin + technician only */}
                {canManage && (
                  <div style={{
                    background: '#fff', borderRadius: 16, padding: '24px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)',
                    animation: 'fadeUp .5s ease .2s both'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Alert Overview</div>
                        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>Current alerts by severity</div>
                      </div>
                      <Link to="/alerts" style={{
                        fontSize: 13, fontWeight: 700, color: '#0d9488',
                        textDecoration: 'none', padding: '6px 14px', border: '1px solid #0d9488', borderRadius: 20
                      }}>
                        View All
                      </Link>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius: 12,
                      padding: '16px 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Total Alerts</div>
                        <div style={{ color: '#fff', fontSize: 32, fontWeight: 900, lineHeight: 1, marginTop: 4 }}>{fmt(stats?.totalAlerts)}</div>
                      </div>
                      <div style={{ color: '#ef4444' }}><Ico name="alert" size={36} /></div>
                    </div>
                    <SeverityRow label="Critical" count={fmt(stats?.criticalAlerts)} color="#ef4444" bg="#fef2f2" />
                    <SeverityRow label="High" count={fmt(stats?.highAlerts)} color="#f97316" bg="#fff7ed" />
                    <SeverityRow label="Open" count={fmt(stats?.openAlerts)} color="#3b82f6" bg="#eff6ff" />
                    <SeverityRow label="Unacknowledged" count={fmt(stats?.unacknowledgedAlerts)} color="#8b5cf6" bg="#f5f3ff" />
                  </div>
                )}

                {/* Quick actions — filtered by role */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeUp .5s ease .3s both' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 4, paddingLeft: 2 }}>Quick Actions</div>

                  {/* ADMIN only */}
                  {role === 'ADMIN' && <>
                    <ActionCard to="/plants" iconKey="plant" title="Manage Plants" desc="Add & configure plants" accent="#0d9488" delay={0.35} />
                    <ActionCard to="/panels" iconKey="panel" title="Add Panel" desc="Register a solar panel" accent="#3b82f6" delay={0.40} />
                    <ActionCard to="/alerts" iconKey="alert" title="View Alerts" desc="Check system alerts" accent="#ef4444" delay={0.45} />
                    <ActionCard to="/analyze" iconKey="search" title="Run Analysis" desc="AI fault detection" accent="#8b5cf6" delay={0.50} />
                    <ActionCard to="/analytics" iconKey="chart" title="Analytics" desc="Trends & insights" accent="#f59e0b" delay={0.55} />
                    <ActionCard to="/admin/users" iconKey="manage" title="Manage Users" desc="Create & manage accounts" accent="#06b6d4" delay={0.60} />
                  </>}

                  {/* TECHNICIAN — view panels + manage alerts + reports/analytics for all users */}
                  {role === 'TECHNICIAN' && <>
                    <ActionCard to="/panels" iconKey="panel" title="View Panels" desc="Monitor all panels" accent="#3b82f6" delay={0.35} />
                    <ActionCard to="/alerts" iconKey="alert" title="All Alerts" desc="Manage fault alerts" accent="#ef4444" delay={0.40} />
                    <ActionCard to="/history" iconKey="chart" title="Reports" desc="All prediction history" accent="#f59e0b" delay={0.45} />
                    <ActionCard to="/analytics" iconKey="chart" title="Analytics" desc="System-wide trends" accent="#06b6d4" delay={0.50} />
                  </>}

                  {/* VIEWER — same full set, data scoped server-side */}
                  {role === 'VIEWER' && <>
                    <ActionCard to="/panels" iconKey="panel" title="My Panels" desc="View your panels" accent="#3b82f6" delay={0.35} />
                    <ActionCard to="/plants" iconKey="plant" title="My Plants" desc="View your plants" accent="#0d9488" delay={0.40} />
                    <ActionCard to="/alerts" iconKey="alert" title="My Alerts" desc="Your fault alerts" accent="#ef4444" delay={0.45} />
                    <ActionCard to="/analyze" iconKey="search" title="Analyze" desc="Run fault detection" accent="#8b5cf6" delay={0.50} />
                    <ActionCard to="/history" iconKey="chart" title="Reports" desc="Prediction history" accent="#f59e0b" delay={0.55} />
                    <ActionCard to="/analytics" iconKey="chart" title="Analytics" desc="Trends & insights" accent="#06b6d4" delay={0.60} />
                  </>}

                  {/* Fallback */}
                  {!role && <>
                    <ActionCard to="/panels" iconKey="panel" title="My Panels" desc="View your panels" accent="#3b82f6" delay={0.35} />
                    <ActionCard to="/alerts" iconKey="alert" title="My Alerts" desc="Your fault alerts" accent="#ef4444" delay={0.40} />
                  </>}
                </div>
              </div>

              {/* Status bar */}
              <div style={{
                background: '#fff', borderRadius: 16, padding: '18px 24px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
                animation: 'fadeUp .5s ease .4s both'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ position: 'relative', width: 10, height: 10 }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981', animation: 'pulseRing 2s ease-out infinite' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', position: 'relative' }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>All systems operational</span>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                  {['Spring Backend', 'ML API', 'Database'].map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>Last refresh: {lastRefresh.toLocaleTimeString()}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
