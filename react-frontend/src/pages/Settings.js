import { useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Toggle = ({ checked, onChange }) => (
  <div onClick={onChange} style={{
    width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative',
    background: checked ? '#0d9488' : '#e2e8f0', transition: 'background .2s',
    flexShrink: 0,
  }}>
    <div style={{
      position: 'absolute', top: 3, left: checked ? 20 : 3, width: 18, height: 18,
      borderRadius: '50%', background: '#fff', transition: 'left .2s',
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    }} />
  </div>
);

const SettingRow = ({ label, desc, children }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 0', borderBottom: '1px solid #f1f5f9', gap: 16
  }}>
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#94a3b8' }}>{desc}</div>
    </div>
    <div style={{ flexShrink: 0 }}>{children}</div>
  </div>
);

const selStyle = {
  padding: '7px 12px', borderRadius: 9, border: '1px solid #e2e8f0',
  background: '#f8fafc', fontSize: 13, fontWeight: 600, color: '#374151', outline: 'none', cursor: 'pointer'
};

const SectionCard = ({ title, children, ref: sRef }) => (
  <div ref={sRef} style={{
    background: '#fff', borderRadius: 16, padding: '22px 24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', marginBottom: 16
  }}>
    <div style={{
      marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f1f5f9'
    }}>
      <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{title}</span>
    </div>
    {children}
  </div>
);

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  const notifRef = useRef(null);
  const dashRef = useRef(null);
  const alertRef = useRef(null);
  const sysRef = useRef(null);

  const [s, setS] = useState({
    notifications: { email: true, push: false, sms: false, criticalOnly: false },
    dashboard: { refreshInterval: 30, showWeather: true, autoRefresh: true, compactView: false },
    alerts: { soundEnabled: true, maxAlerts: 100, retentionDays: 30, autoAcknowledge: false },
    system: { timezone: 'UTC', temperatureUnit: 'C', powerUnit: 'W', dateFormat: 'MM/DD/YYYY' },
  });

  const set = (cat, key, val) => setS(p => ({ ...p, [cat]: { ...p[cat], [key]: val } }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const NAV = [
    { label: 'Appearance', ref: null },
    { label: 'Notifications', ref: notifRef },
    { label: 'Dashboard', ref: dashRef },
    { label: 'Alerts', ref: alertRef },
    { label: 'System', ref: sysRef },
  ];

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
            <div style={{ color: '#2dd4bf', fontSize: 13, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 8 }}>⚙️ Configuration</div>
            <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0 }}>System Settings</h1>
            <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: 13 }}>Configure preferences and system behaviour</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => window.location.reload()} style={{
              padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>🔄 Reset</button>
            <button onClick={handleSave} style={{
              padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: saved ? '#10b981' : '#0d9488', color: '#fff', fontWeight: 700, fontSize: 13,
              boxShadow: '0 4px 14px rgba(13,148,136,0.4)', transition: 'background .3s',
            }}>{saved ? '✓ Saved!' : '💾 Save Settings'}</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '-24px auto 0', padding: '0 24px 40px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>

          {/* Side nav */}
          <div style={{
            background: '#fff', borderRadius: 16, padding: '12px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb',
            height: 'fit-content', position: 'sticky', top: 20
          }}>
            {NAV.map(n => (
              <div key={n.label} onClick={() => n.ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151',
                  marginBottom: 2, transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0fdfa'; e.currentTarget.style.color = '#0d9488'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#374151'; }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>{n.label}</span>
              </div>
            ))}
          </div>

          {/* Settings panels */}
          <div>
            {/* Appearance */}
            <SectionCard icon="🎨" title="Appearance">
              <SettingRow label="Theme" desc="Switch between light and dark mode">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{isDark ? 'Dark' : 'Light'}</span>
                  <Toggle checked={isDark} onChange={toggleTheme} />
                </div>
              </SettingRow>
            </SectionCard>

            {/* Notifications */}
            <div ref={notifRef}>
              <SectionCard icon="🔔" title="Notifications">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive alerts via email' },
                  { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
                  { key: 'sms', label: 'SMS Alerts', desc: 'Text message notifications' },
                  { key: 'criticalOnly', label: 'Critical Alerts Only', desc: 'Only notify for critical issues' },
                ].map(r => (
                  <SettingRow key={r.key} label={r.label} desc={r.desc}>
                    <Toggle checked={s.notifications[r.key]} onChange={() => set('notifications', r.key, !s.notifications[r.key])} />
                  </SettingRow>
                ))}
              </SectionCard>
            </div>

            {/* Dashboard */}
            <div ref={dashRef}>
              <SectionCard icon="📊" title="Dashboard">
                <SettingRow label="Refresh Interval" desc="How often to update dashboard data">
                  <select value={s.dashboard.refreshInterval}
                    onChange={e => set('dashboard', 'refreshInterval', parseInt(e.target.value))} style={selStyle}>
                    {[[10, '10 seconds'], [30, '30 seconds'], [60, '1 minute'], [300, '5 minutes']].map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </SettingRow>
                {[
                  { key: 'showWeather', label: 'Show Weather', desc: 'Display weather data on dashboard' },
                  { key: 'autoRefresh', label: 'Auto Refresh', desc: 'Automatically refresh dashboard data' },
                  { key: 'compactView', label: 'Compact View', desc: 'Use a more compact layout' },
                ].map(r => (
                  <SettingRow key={r.key} label={r.label} desc={r.desc}>
                    <Toggle checked={s.dashboard[r.key]} onChange={() => set('dashboard', r.key, !s.dashboard[r.key])} />
                  </SettingRow>
                ))}
              </SectionCard>
            </div>

            {/* Alerts */}
            <div ref={alertRef}>
              <SectionCard icon="🚨" title="Alert Management">
                <SettingRow label="Sound Notifications" desc="Play sound for new alerts">
                  <Toggle checked={s.alerts.soundEnabled} onChange={() => set('alerts', 'soundEnabled', !s.alerts.soundEnabled)} />
                </SettingRow>
                <SettingRow label="Auto Acknowledge" desc="Automatically acknowledge resolved alerts">
                  <Toggle checked={s.alerts.autoAcknowledge} onChange={() => set('alerts', 'autoAcknowledge', !s.alerts.autoAcknowledge)} />
                </SettingRow>
                <SettingRow label="Alert Retention" desc="Days to keep alert history">
                  <select value={s.alerts.retentionDays}
                    onChange={e => set('alerts', 'retentionDays', parseInt(e.target.value))} style={selStyle}>
                    {[[7, '7 days'], [30, '30 days'], [90, '90 days'], [365, '1 year']].map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </SettingRow>
              </SectionCard>
            </div>

            {/* System */}
            <div ref={sysRef}>
              <SectionCard icon="⚙️" title="System Configuration">
                <SettingRow label="Timezone" desc="System timezone for timestamps">
                  <select value={s.system.timezone}
                    onChange={e => set('system', 'timezone', e.target.value)} style={selStyle}>
                    {[['UTC', 'UTC'], ['America/New_York', 'Eastern'], ['America/Chicago', 'Central'],
                    ['America/Denver', 'Mountain'], ['America/Los_Angeles', 'Pacific']].map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </SettingRow>
                <SettingRow label="Temperature Unit" desc="Celsius or Fahrenheit">
                  <select value={s.system.temperatureUnit}
                    onChange={e => set('system', 'temperatureUnit', e.target.value)} style={selStyle}>
                    <option value="C">Celsius (°C)</option>
                    <option value="F">Fahrenheit (°F)</option>
                  </select>
                </SettingRow>
                <SettingRow label="Power Unit" desc="Watts or Kilowatts">
                  <select value={s.system.powerUnit}
                    onChange={e => set('system', 'powerUnit', e.target.value)} style={selStyle}>
                    <option value="W">Watts (W)</option>
                    <option value="kW">Kilowatts (kW)</option>
                  </select>
                </SettingRow>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
