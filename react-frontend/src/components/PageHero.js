/* Shared hero banner used across all pages */
const PageHero = ({ badge, title, subtitle, action }) => (
    <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0d9488 100%)',
        padding: '32px 28px 48px', position: 'relative', overflow: 'hidden',
    }}>
        <div style={{
            position: 'absolute', top: -50, right: -50, width: 200, height: 200,
            borderRadius: '50%', border: '2px solid rgba(255,255,255,0.05)'
        }} />
        <div style={{
            position: 'absolute', bottom: -30, left: 60, width: 120, height: 120,
            borderRadius: '50%', border: '2px solid rgba(255,255,255,0.03)'
        }} />
        <div style={{
            maxWidth: 1200, margin: '0 auto', display: 'flex',
            justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16,
            position: 'relative'
        }}>
            <div>
                {badge && (
                    <div style={{
                        color: '#2dd4bf', fontSize: 12, fontWeight: 700,
                        letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8
                    }}>
                        {badge}
                    </div>
                )}
                <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>{title}</h1>
                {subtitle && <p style={{ color: '#64748b', margin: '8px 0 0', fontSize: 14 }}>{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    </div>
);

export default PageHero;
