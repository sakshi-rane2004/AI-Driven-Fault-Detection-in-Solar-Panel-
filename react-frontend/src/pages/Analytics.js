import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement, Title, Filler
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { solarPanelAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement, Title, Filler
);

/* ── colour maps ─────────────────────────────────────────── */
const FAULT_COLORS = {
  NORMAL: { bg: '#10b981', light: '#d1fae5', label: 'Normal' },
  PARTIAL_SHADING: { bg: '#f59e0b', light: '#fef3c7', label: 'Partial Shading' },
  PANEL_DEGRADATION: { bg: '#f97316', light: '#ffedd5', label: 'Panel Degradation' },
  INVERTER_FAULT: { bg: '#ef4444', light: '#fee2e2', label: 'Inverter Fault' },
  DUST_ACCUMULATION: { bg: '#6b7280', light: '#f3f4f6', label: 'Dust Accumulation' },
};

const SEVERITY_COLORS = {
  None: { bg: '#10b981', light: '#d1fae5' },
  Low: { bg: '#f59e0b', light: '#fef3c7' },
  Medium: { bg: '#f97316', light: '#ffedd5' },
  High: { bg: '#ef4444', light: '#fee2e2' },
  Critical: { bg: '#7c3aed', light: '#ede9fe' },
};

const fmt = (n) => (n == null ? 'N/A' : Number(n).toLocaleString());

/* ── stat cards ──────────────────────────────────────────── */
const StatCard = ({ icon, label, value, color, sub, gradient }) => (
  <div style={{
    borderRadius: '12px',
    padding: '20px 22px',
    background: gradient || '#fff',
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'default',
  }}>
    {/* top row: label + colored dot */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
      <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: color, opacity: 0.85 }}>
        {label}
      </span>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, marginTop: 3 }} />
    </div>
    {/* big number */}
    <div style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', lineHeight: 1, marginBottom: 6 }}>
      {value}
    </div>
    {/* sub text */}
    {sub && (
      <div style={{ fontSize: 13, color: color, fontWeight: 600, opacity: 0.9 }}>
        {sub}
      </div>
    )}
    {/* decorative circle */}
    <div style={{
      position: 'absolute', bottom: -18, right: -18,
      width: 80, height: 80, borderRadius: '50%',
      background: color, opacity: 0.07,
    }} />
  </div>
);

const ProgressRow = ({ label, count, total, color, light }) => {
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
        <span style={{ fontWeight: 600, color: '#374151' }}>{label}</span>
        <span style={{ color: '#6b7280' }}>{count} <span style={{ color: '#9ca3af' }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 8, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: 99, transition: 'width .6s ease',
        }} />
      </div>
    </div>
  );
};

const SectionCard = ({ title, children, action }) => (
  <div style={{
    background: '#fff', borderRadius: '16px', padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontWeight: 700, fontSize: 16, color: '#111' }}>{title}</span>
      {action}
    </div>
    {children}
  </div>
);

/* ── main component ──────────────────────────────────────── */
const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendDays, setTrendDays] = useState(30);

  const fetchAnalytics = async (days = 30) => {
    try {
      setLoading(true); setError(null);
      const [s, t] = await Promise.all([
        solarPanelAPI.getAnalyticsSummary(),
        solarPanelAPI.getAnalyticsTrends({ days }),
      ]);
      setSummary(s); setTrends(t);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(trendDays); }, [trendDays]);

  /* chart data */
  const faultPieData = () => {
    if (!summary?.faultTypeCounts) return null;
    const keys = Object.keys(summary.faultTypeCounts);
    return {
      labels: keys.map(k => FAULT_COLORS[k]?.label || k),
      datasets: [{
        data: keys.map(k => summary.faultTypeCounts[k]),
        backgroundColor: keys.map(k => FAULT_COLORS[k]?.bg || '#6b7280'),
        borderWidth: 3, borderColor: '#fff',
        hoverOffset: 8,
      }],
    };
  };

  const severityPieData = () => {
    if (!summary?.severityCounts) return null;
    const keys = Object.keys(summary.severityCounts);
    return {
      labels: keys,
      datasets: [{
        data: keys.map(k => summary.severityCounts[k]),
        backgroundColor: keys.map(k => SEVERITY_COLORS[k]?.bg || '#6b7280'),
        borderWidth: 3, borderColor: '#fff',
        hoverOffset: 8,
      }],
    };
  };

  const lineData = () => {
    if (!trends?.dailyTrends) return null;
    const labels = trends.dailyTrends.map(p => new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const data = trends.dailyTrends.map(p => p.totalCount);
    return {
      labels,
      datasets: [{
        label: 'Predictions',
        data,
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13,148,136,0.08)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0d9488',
        pointRadius: 4,
        pointHoverRadius: 6,
      }],
    };
  };

  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 12 } } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} (${((ctx.parsed / ctx.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)` } },
    },
  };

  const lineOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, maxTicksLimit: 10 } },
      y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { stepSize: 1, font: { size: 11 } } },
    },
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <LoadingSpinner message="Loading analytics..." />
    </div>
  );

  const total = summary?.totalPredictions || 0;
  const faultTotal = Object.values(summary?.faultTypeCounts || {}).reduce((a, b) => a + b, 0);
  const sevTotal = Object.values(summary?.severityCounts || {}).reduce((a, b) => a + b, 0);

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
          maxWidth: 1300, margin: '0 auto', display: 'flex',
          justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16
        }}>
          <div>
            <div style={{
              color: '#2dd4bf', fontSize: 12, fontWeight: 700,
              letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8
            }}>Analytics</div>
            <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0 }}>Analytics Dashboard</h1>
            <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: 14 }}>
              Fault detection patterns, severity trends and prediction insights
            </p>
          </div>
          <button onClick={() => fetchAnalytics(trendDays)} style={{
            padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700,
            fontSize: 13, cursor: 'pointer',
          }}>Refresh</button>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: '-24px auto 0', padding: '0 24px 40px', position: 'relative' }}>

        <ErrorAlert error={error} onRetry={() => fetchAnalytics(trendDays)} />

        {/* ── KPI cards ── */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard label="Total Predictions" value={fmt(total)} color="#0d9488"
              gradient="linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)"
              sub="All time records" />
            <StatCard label="Normal Operations" value={fmt(summary.normalOperations)} color="#059669"
              gradient="linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
              sub={total ? `${((summary.normalOperations / total) * 100).toFixed(1)}% of total` : ''} />
            <StatCard label="Critical Faults" value={fmt(summary.criticalFaults)} color="#dc2626"
              gradient="linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)"
              sub={summary.criticalFaults > 0 ? 'Requires attention' : 'None detected'} />
            <StatCard label="Most Common Fault" value={summary.mostCommonFault?.replace(/_/g, ' ') || 'N/A'} color="#d97706"
              gradient="linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
              sub="Highest frequency" />
          </div>
        )}

        {/* ── Charts row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* Fault type doughnut */}
          <SectionCard title="Fault Type Distribution">
            {faultPieData() ? (
              <div style={{ height: 280 }}>
                <Doughnut data={faultPieData()} options={doughnutOpts} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📊</div>
                <div>No fault data yet</div>
              </div>
            )}
          </SectionCard>

          {/* Severity doughnut */}
          <SectionCard title="Severity Distribution">
            {severityPieData() ? (
              <div style={{ height: 280 }}>
                <Doughnut data={severityPieData()} options={doughnutOpts} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📊</div>
                <div>No severity data yet</div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Trend line ── */}
        <div style={{ marginBottom: 20 }}>
          <SectionCard
            title="Prediction Trends"
           
            action={
              <div style={{ display: 'flex', gap: 6 }}>
                {[7, 30, 90].map(d => (
                  <button key={d} onClick={() => setTrendDays(d)} style={{
                    padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, transition: 'all .2s',
                    background: trendDays === d ? '#0d9488' : '#f3f4f6',
                    color: trendDays === d ? '#fff' : '#374151',
                  }}>
                    {d}d
                  </button>
                ))}
              </div>
            }
          >
            {lineData() ? (
              <>
                <div style={{ height: 220 }}>
                  <Line data={lineData()} options={lineOpts} />
                </div>
                {trends && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 20 }}>
                    {[
                      { label: 'Period Total', value: fmt(trends.totalPredictionsInPeriod) },
                      { label: 'Most Active Fault', value: trends.mostActiveFaultType || 'N/A' },
                      { label: 'Trend Direction', value: trends.trendDirection || 'N/A' },
                      { label: 'Days Covered', value: `${trends.totalDays || 0} days` },
                    ].map(item => (
                      <div key={item.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📈</div>
                <div>No trend data for this period</div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Breakdown bars ── */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            <SectionCard title="Fault Type Breakdown">
              {summary.faultTypeCounts && Object.keys(summary.faultTypeCounts).length > 0 ? (
                Object.entries(summary.faultTypeCounts).map(([key, count]) => (
                  <ProgressRow
                    key={key}
                    label={FAULT_COLORS[key]?.label || key}
                    count={count}
                    total={faultTotal}
                    color={FAULT_COLORS[key]?.bg || '#6b7280'}
                    light={FAULT_COLORS[key]?.light || '#f3f4f6'}
                  />
                ))
              ) : (
                <div style={{ color: '#9ca3af', textAlign: 'center', padding: '30px 0' }}>No data available</div>
              )}
            </SectionCard>

            <SectionCard title="Severity Breakdown">
              {summary.severityCounts && Object.keys(summary.severityCounts).length > 0 ? (
                Object.entries(summary.severityCounts).map(([key, count]) => (
                  <ProgressRow
                    key={key}
                    label={key}
                    count={count}
                    total={sevTotal}
                    color={SEVERITY_COLORS[key]?.bg || '#6b7280'}
                    light={SEVERITY_COLORS[key]?.light || '#f3f4f6'}
                  />
                ))
              ) : (
                <div style={{ color: '#9ca3af', textAlign: 'center', padding: '30px 0' }}>No data available</div>
              )}
            </SectionCard>
          </div>
        )}

        {summary?.lastUpdated && (
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#9ca3af' }}>
            Last updated: {new Date(summary.lastUpdated).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
