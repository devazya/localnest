/**
 * PageShell — shared wrapper for all category pages.
 * Provides: sticky top bar (back + title + actions), page padding,
 * and consistent bottom nav spacing.
 */
import { motion } from 'framer-motion';

export default function PageShell({
  title,
  subtitle,
  eyebrow,
  onBack,
  headerRight,
  stickyContent,
  children,
  noPad = false,
}) {
  return (
    <div className="page-wrapper" style={{ background: 'var(--bg)' }}>
      {/* ── Sticky page header ── */}
      <div style={{
        position: 'sticky',
        top: 'var(--top-bar-h)',
        zIndex: 50,
        background: 'rgba(250,250,250,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(109,74,255,0.08)',
        padding: '10px 16px 12px',
      }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: subtitle || stickyContent ? 8 : 0 }}>
          {onBack && (
            <motion.button
              onClick={onBack}
              whileTap={{ scale: 0.9 }}
              style={{
                width: 36, height: 36, borderRadius: 11,
                background: 'rgba(109,74,255,0.08)',
                border: '1.5px solid rgba(109,74,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </motion.button>
          )}
          <div style={{ flex: 1 }}>
            {eyebrow && (
              <div className="section-eyebrow" style={{ marginBottom: 1 }}>{eyebrow}</div>
            )}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18, fontWeight: 700,
              color: 'var(--text-primary)', letterSpacing: -0.3,
              lineHeight: 1.2,
            }}>{title}</h1>
            {subtitle && (
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>{subtitle}</div>
            )}
          </div>
          {headerRight && (
            <div style={{ flexShrink: 0 }}>{headerRight}</div>
          )}
        </div>

        {/* Optional sticky content (filters, search, etc.) */}
        {stickyContent}
      </div>

      {/* ── Page body ── */}
      <div style={{ padding: noPad ? 0 : '16px 16px 0' }}>
        {children}
      </div>
    </div>
  );
}
