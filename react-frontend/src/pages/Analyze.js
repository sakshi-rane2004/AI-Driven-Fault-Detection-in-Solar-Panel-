import { useState } from 'react';
import { solarPanelAPI } from '../services/api';

const SEV = {
  None: '#10b981', Low: '#f59e0b', Medium: 'f97316', High: '#ef4444', Critical: '#7c3aed',
  NONE: '#10b981', LOW: '#f59e0b', MEDIUM: '#f97316', HIGH: '#ef4444', CRITICAL: '#7c3aed'
};
const sevColor = (s) => SEV[s] || '#6b7280';

const SAMPLES = {
  normal: { voltage: '32.5', current: '8.2', temperature: '25.0', irradiance: '850.0', power: '266.5' },
  shaded: { voltage: '27.5', current: '4.2', temperature: '23.0', irradiance: '550.0', power: '115.5' },
  faulty: { voltage: '20.1', current: '7.3', temperature: '42.0', irradiance: '820.0', power: '146.7' },
};

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #e2e8f0',
  fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#f8fafc',
};

const FIELDS = [
  { name: 'voltage', label: 'Voltage', unit: 'V', placeholder: 'e.g. 32.5', min: 0, max: 100, step: 0.1 },
  { name: 'current', label: 'Current', unit: 'A', placeholder: 'e.g. 8.2', min: 0, max: 50, step: 0.1 },
  { name: 'temperature', label: 'Temperature', unit: '°C', placeholder: 'e.g. 25.0', min: -50, max: 100, step: 0.1 },
  { name: 'irradiance', label: 'Irradiance', unit: 'W/m²', placeholder: 'e.g. 850.0', min: 0, max: 2000, step: 0.1 },
  { name: 'power', label: 'Power', unit: 'W', placeholder: 'e.g. 266.5', min: 0, max: 5000, step: 0.1 },
];

const Analyze = () => {
  const [form, setForm] = useState({ voltage: '', current: '', temperature: '', irradiance: '', power: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const data = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, parseFloat(v)]));
      for (const [k, v] of Object.entries(data)) if (isNaN(v)) throw new Error(`${k} must be a number`);
      setResult(await solarPanelAPI.analyzeSensorData(data));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const faultColor = result ? (result.predictedFault === 'NORMAL' ? '#10b981' : sevColor(result.severity)) : '#0d9488';

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
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ color: '#2dd4bf', fontSize: 13, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 8 }}>🔍 AI Fault Detection</div>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0 }}>Analyze Sensor Data</h1>
          <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: 13 }}>Enter sensor readings to run ML-powered fault detection</p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '-24px auto 0', padding: '0 24px 40px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Input form */}
          <div style={{
            background: '#fff', borderRadius: 16, padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Sensor Readings</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Enter values from your solar panel sensors</div>

            {error && <div style={{
              background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 9,
              padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 13
            }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                {FIELDS.map(f => (
                  <div key={f.name} style={{ gridColumn: f.name === 'power' ? 'span 2' : 'span 1' }}>
                    <label style={{
                      fontSize: 13, fontWeight: 700, color: '#374151', textTransform: 'uppercase',
                      letterSpacing: '0.6px', display: 'block', marginBottom: 5
                    }}>
                      {f.label} <span style={{ color: '#94a3b8', fontWeight: 500, textTransform: 'none' }}>({f.unit})</span>
                    </label>
                    <input type="number" name={f.name} value={form[f.name]}
                      onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                      placeholder={f.placeholder} min={f.min} max={f.max} step={f.step} required
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#0d9488'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <button type="submit" disabled={loading} style={{
                  flex: 1, padding: '11px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? '#e2e8f0' : '#0d9488', color: loading ? '#94a3b8' : '#fff',
                  fontWeight: 700, fontSize: 14, boxShadow: loading ? 'none' : '0 4px 12px rgba(13,148,136,0.3)',
                }}>{loading ? '⏳ Analyzing…' : '🔍 Analyze'}</button>
                <button type="button" onClick={() => { setForm({ voltage: '', current: '', temperature: '', irradiance: '', power: '' }); setResult(null); setError(null); }}
                  style={{
                    padding: '11px 18px', borderRadius: 10, border: '1px solid #e2e8f0',
                    background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: 14, cursor: 'pointer'
                  }}>Reset</button>
              </div>
            </form>

            {/* Sample data */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase',
                letterSpacing: '0.6px', marginBottom: 10
              }}>Load Sample Data</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { key: 'normal', label: '✅ Normal', bg: '#f0fdf4', color: '#16a34a', border: '#86efac' },
                  { key: 'shaded', label: '⚠️ Shaded', bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
                  { key: 'faulty', label: '🔴 Faulty', bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
                ].map(s => (
                  <button key={s.key} onClick={() => { setForm(SAMPLES[s.key]); setResult(null); setError(null); }} style={{
                    flex: 1, padding: '8px', borderRadius: 9, border: `1px solid ${s.border}`,
                    background: s.bg, color: s.color, fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  }}>{s.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Result */}
          <div style={{
            background: '#fff', borderRadius: 16, padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Analysis Result</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>ML model prediction output</div>

            {!result && !loading && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 6 }}>Ready to Analyze</div>
                <div style={{ fontSize: 13 }}>Fill in sensor data and click Analyze</div>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                <div style={{
                  width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#0d9488',
                  borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px'
                }} />
                <div style={{ fontWeight: 600 }}>Running ML analysis…</div>
              </div>
            )}

            {result && (
              <div>
                {/* Main result banner */}
                <div style={{
                  background: faultColor + '12', border: `2px solid ${faultColor}40`,
                  borderRadius: 12, padding: '18px 20px', marginBottom: 16, borderLeft: `5px solid ${faultColor}`
                }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: faultColor, textTransform: 'uppercase',
                    letterSpacing: '0.7px', marginBottom: 4
                  }}>Predicted Fault</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>
                    {result.predictedFault?.replace(/_/g, ' ')}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                      background: faultColor + '20', color: faultColor
                    }}>Severity: {result.severity}</span>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                      background: '#f0f9ff', color: '#0369a1'
                    }}>
                      {result.confidence} · {result.confidenceScore ? `${(result.confidenceScore * 100).toFixed(1)}%` : ''}
                    </span>
                  </div>
                </div>

                {/* Confidence bar */}
                {result.confidenceScore != null && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', fontSize: 12,
                      fontWeight: 600, color: '#64748b', marginBottom: 5
                    }}>
                      <span>Confidence</span><span>{(result.confidenceScore * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${result.confidenceScore * 100}%`,
                        background: faultColor, borderRadius: 99, transition: 'width .6s ease'
                      }} />
                    </div>
                  </div>
                )}

                {result.description && (
                  <div style={{
                    background: '#f8fafc', borderRadius: 10, padding: '12px 14px',
                    marginBottom: 12, fontSize: 13, color: '#475569', lineHeight: 1.6
                  }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4, fontSize: 12 }}>Description</div>
                    {result.description}
                  </div>
                )}

                {result.maintenanceRecommendation && (
                  <div style={{
                    background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10,
                    padding: '12px 14px', marginBottom: 12, fontSize: 13, color: '#92400e', lineHeight: 1.6
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 12 }}>🔧 Recommendation</div>
                    {result.maintenanceRecommendation}
                  </div>
                )}

                {result.allProbabilities && (
                  <div>
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase',
                      letterSpacing: '0.6px', marginBottom: 10
                    }}>All Probabilities</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {Object.entries(result.allProbabilities)
                        .sort(([, a], [, b]) => b - a)
                        .map(([fault, prob]) => (
                          <div key={fault}>
                            <div style={{
                              display: 'flex', justifyContent: 'space-between',
                              fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 3
                            }}>
                              <span>{fault.replace(/_/g, ' ')}</span>
                              <span>{(prob * 100).toFixed(1)}%</span>
                            </div>
                            <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{
                                height: '100%', width: `${prob * 100}%`,
                                background: fault === 'NORMAL' ? '#10b981' : '#0d9488', borderRadius: 99
                              }} />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {result.timestamp && (
                  <div style={{ marginTop: 14, fontSize: 13, color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                    Analyzed at {new Date(result.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Analyze;
