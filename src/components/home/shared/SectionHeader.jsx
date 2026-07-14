/**
 * SectionHeader.jsx (home/shared)
 * ---------------------------------------------------------------------
 * Reusable title + optional subtitle + optional "View All →" action,
 * used by Happening Around and intended for reuse by Neighbourhood
 * Pulse repositioning, Local Finds, Activities, etc. Distinct from the
 * lightweight title-only header already inlined inside HomeCoreSection
 * — that one stays as-is (not redesigning existing sections); this is
 * the shared building block for everything built from here on.
 */
export default function SectionHeader({ title, subtitle, onViewAll, viewAllLabel = 'View All →' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px', marginBottom: 14, gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#0D0820', letterSpacing: -0.3, margin: 0 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 12.5, color: '#9CA3AF', margin: '3px 0 0', lineHeight: 1.4 }}>
            {subtitle}
          </p>
        )}
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          style={{ flexShrink: 0, fontSize: 13, fontWeight: 600, color: '#6D4AFF', background: 'none', border: 'none', cursor: 'pointer', padding: 0, paddingBottom: subtitle ? 2 : 0 }}
        >
          {viewAllLabel}
        </button>
      )}
    </div>
  );
}
