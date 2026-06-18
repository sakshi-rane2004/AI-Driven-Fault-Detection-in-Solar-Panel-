import { useState, useEffect } from 'react';
import { solarPanelAPI } from '../services/api';

const SEV_COLOR = { None: '#10b981', Low: '#f59e0b', Medium: '#f97316', High: '#ef4444', Critical: '#7c3aed' };
const FAULT_LABEL = {
  NORMAL: 'Normal', PARTIAL_SHADING: 'Partial Shading',
  PANEL_DEGRADATION: 'Panel Degradation', INVERTER_FAULT: 'Inverter Fault', DUST_ACCUMULATION: 'Dust Accumulation'
};

const Pill = ({ label, color, bg }) => (
  <span style={{
    padding: '2px 10px', borderRadius: 20, fontSize: 13, fontWeight: 700,
    background: bg || color + '18', color, border: `1px solid ${color}40`
  }}>{label}</span>
);

const sel = {
  padding: '8px 12px', borderRadius: 9, border: '1px solid #e2e8f0',
  background: '#f8fafc', fontSize: 13, fontWeight: 600, color: '#374151', outline: 'none', cursor: 'pointer'
};

const History = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ faultType: '', severity: '' });
  const [pagination, setPagination] = useState({ page: 0, size: 20, totalElements: 0, totalPages: 0 });

  const fetchHistory = async (page = 0, size = 20, fp = {}) => {
    try {
      setLoading(true); setError(null);
      const r = await solarPanelAPI.getHistory({ page, size, ...fp });
      if (r.content) {
        setPredictions(r.content);
        setPagination({ page: r.currentPage, size: r.size, totalElements: r.totalElements, totalPages: r.totalPages });
      } else {
        setPredictions(r);
        setPagination({ page: 0, size: r.length, totalElements: r.length, totalPages: 1 });
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(0, 20, filters); }, []);

  const handleFilter = (e) => {
    const nf = { ...filters, [e.target.name]: e.target.value || undefined };
    setFilters(nf); fetchHistory(0, pagination.size, nf);
  };
  const clearFilters = () => { setFilters({ faultType: '', severity: '' }); fetchHistory(0, pagination.size, {}); };

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
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ color: '#2dd4bf', fontSize: 13, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 8 }}>📋 Prediction Records</div>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0 }}>Prediction History</h1>
          <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: 13 }}>All ML fault detection results with sensor readings</p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '-24px auto 0', padding: '0 24px 40px', position: 'relative' }}>
        {error && <div style={{
          background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10,
          padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 13
        }}>{error}</div>}

        {/* Filters */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: '16px 20px', border: '1px solid #e5e7eb',
          marginBottom: 20, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end'
        }}>
          {[
            {
              name: 'faultType', label: 'Fault Type', opts: [['', 'All Fault Types'], ['NORMAL', 'Normal'],
              ['PARTIAL_SHADING', 'Partial Shading'], ['PANEL_DEGRADATION', 'Panel Degradation'],
              ['INVERTER_FAULT', 'Inverter Fault'], ['DUST_ACCUMULATION', 'Dust Accumulation']]
            },
            {
              name: 'severity', label: 'Severity', opts: [['', 'All Severities'], ['None', 'None'],
              ['Low', 'Low'], ['Medium', 'Medium'], ['High', 'High'], ['Critical', 'Critical']]
            },
          ].map(f => (
            <div key={f.name}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase',
                letterSpacing: '0.6px', marginBottom: 5
              }}>{f.label}</div>
              <select name={f.name} value={filters[f.name] || ''} onChange={handleFilter} style={{ ...sel, minWidth: 160 }}>
                {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <button onClick={clearFilters} style={{
            padding: '8px 16px', borderRadius: 9,
            border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end'
          }}>Clear</button>
          <div style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
            {pagination.totalElements} records
            {pagination.totalPages > 1 && ` · Page ${pagination.page + 1} of ${pagination.totalPages}`}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontWeight: 600 }}>Loading history…</div>
            </div>
          ) : predictions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No predictions found</div>
              <div style={{ fontSize: 13 }}>
                {filters.faultType || filters.severity ? 'Try clearing the filters' : 'Run an analysis to see results here'}
              </div>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                      {['Timestamp', 'Fault Type', 'Severity', 'Confidence', 'V (V)', 'I (A)', 'T (°C)', 'Irr', 'P (W)', 'Recommendation'].map(h => (
                        <th key={h} style={{
                          padding: '12px 14px', textAlign: 'left', fontWeight: 700,
                          color: '#64748b', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px',
                          whiteSpace: 'nowrap'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((p, i) => {
                      const sc = SEV_COLOR[p.severity] || '#6b7280';
                      return (
                        <tr key={p.id} style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: i % 2 === 0 ? '#fff' : '#fafafa'
                        }}>
                          <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', color: '#64748b', fontSize: 12 }}>
                            {new Date(p.timestamp).toLocaleString()}
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 12 }}>
                              {FAULT_LABEL[p.predictedFault] || p.predictedFault}
                            </span>
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            <Pill label={p.severity} color={sc} />
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 12 }}>{p.confidence}</div>
                            <div style={{ fontSize: 13, color: '#94a3b8' }}>
                              {p.confidenceScore ? `${(p.confidenceScore * 100).toFixed(1)}%` : '—'}
                            </div>
                          </td>
                          {['voltage', 'current', 'temperature', 'irradiance', 'power'].map(k => (
                            <td key={k} style={{ padding: '11px 14px', fontWeight: 600, color: '#374151', fontSize: 12 }}>
                              {p.inputValues?.[k] != null ? Number(p.inputValues[k]).toFixed(k === 'irradiance' ? 0 : k === 'temperature' ? 1 : 2) : '—'}
                            </td>
                          ))}
                          <td style={{ padding: '11px 14px', maxWidth: 180 }}>
                            <div style={{
                              fontSize: 13, color: '#64748b', overflow: 'hidden',
                              textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}
                              title={p.maintenanceRecommendation}>
                              {p.maintenanceRecommendation || '—'}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {pagination.totalPages > 1 && (
                <div style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  gap: 10, padding: '16px', borderTop: '1px solid #f1f5f9'
                }}>
                  <button onClick={() => fetchHistory(pagination.page - 1, pagination.size, filters)}
                    disabled={pagination.page === 0}
                    style={{
                      padding: '7px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
                      background: pagination.page === 0 ? '#f8fafc' : '#fff', color: pagination.page === 0 ? '#cbd5e1' : '#374151',
                      fontWeight: 700, fontSize: 13, cursor: pagination.page === 0 ? 'not-allowed' : 'pointer'
                    }}>← Prev</button>
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                    {pagination.page + 1} / {pagination.totalPages}
                  </span>
                  <button onClick={() => fetchHistory(pagination.page + 1, pagination.size, filters)}
                    disabled={pagination.page >= pagination.totalPages - 1}
                    style={{
                      padding: '7px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
                      background: pagination.page >= pagination.totalPages - 1 ? '#f8fafc' : '#fff',
                      color: pagination.page >= pagination.totalPages - 1 ? '#cbd5e1' : '#374151',
                      fontWeight: 700, fontSize: 13, cursor: pagination.page >= pagination.totalPages - 1 ? 'not-allowed' : 'pointer'
                    }}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
