/**
 * CommunityHeader.jsx — Community module (Segment 1 redesign)
 * Sticky top bar: hamburger -> drawer, title + subtitle, and three
 * circular glass icon buttons (Search, Notifications, Create Post).
 * No square buttons, no text buttons — Apple-style touch targets.
 * Logic (drawer/search/post triggers, notif dot state) is unchanged,
 * only the presentation is rebuilt.
 */

import { motion } from 'framer-motion';

function IconButton({ onClick, children, size = 44, active }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{
        scale: 0.94,
        y: 2,
        boxShadow: active
          ? '0 1px 0 rgba(109,74,255,0.35), inset 0 1px 3px rgba(0,0,0,0.10)'
          : '0 1px 0 rgba(109,74,255,0.22), inset 0 1px 3px rgba(0,0,0,0.08)',
      }}
      whileHover={{ y: -1 }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Solid white (not a near-invisible off-white gradient) so the
        // button actually reads as a distinct surface against the page's
        // lavender wash, instead of blending into it.
        background: active
          ? 'linear-gradient(145deg, rgba(109,74,255,0.20), rgba(109,74,255,0.11))'
          : '#FFFFFF',
        border: active ? '1.5px solid rgba(109,74,255,0.40)' : '1.5px solid rgba(109,74,255,0.22)',
        // 3D: colored floor shadow + top highlight — stronger than before
        // so the buttons visibly lift off the page instead of sitting flush.
        boxShadow: active
          ? [
              '0 4px 0 rgba(109,74,255,0.32)',
              '0 6px 18px rgba(109,74,255,0.22)',
              'inset 0 1px 0 rgba(255,255,255,0.70)',
            ].join(', ')
          : [
              '0 3px 0 rgba(109,74,255,0.16)',
              '0 4px 14px rgba(109,74,255,0.12)',
              'inset 0 1px 0 rgba(255,255,255,1)',
            ].join(', '),
        cursor: 'pointer',
        flexShrink: 0,
        position: 'relative',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        transition: 'background 0.18s, border-color 0.18s, box-shadow 0.18s, transform 0.18s',
      }}
    >
      {children}
    </motion.button>
  );
}

export default function CommunityHeader({
  onOpenDrawer,
  onOpenSearch,
  onOpenActivity,
  activityUnreadCount = 0,
  user,
  onNavigate,
  collapsed = false,
}) {
  // Bell badge now reflects real personal notifications from the Activity
  // Center (public.activities), not just "a channel has new posts".
  const dotColor = activityUnreadCount > 0 ? '#EF4444' : null;

  return (
    <>
      <div style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: collapsed ? 'none' : '1px solid rgba(109,74,255,0.08)',
        padding: collapsed ? '0 18px' : '0 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: collapsed ? 0 : 64,
        maxHeight: collapsed ? 0 : 64,
        opacity: collapsed ? 0 : 1,
        transform: collapsed ? 'translateY(-100%)' : 'translateY(0)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
        overflow: 'hidden',
        boxShadow: collapsed ? 'none' : '0 1px 0 rgba(109,74,255,0.04)',
        transition: 'height 0.22s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.18s ease, transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease',
        pointerEvents: collapsed ? 'none' : 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <IconButton onClick={onOpenDrawer} size={44}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F2937" strokeWidth="2.3">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </IconButton>

          {/* Left-aligned brand block */}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 17.5, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)', letterSpacing: -0.3, lineHeight: 1.2 }}>Community</div>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500, marginTop: 1 }}>Green Sector • Anekal</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 9, alignItems: 'center', flexShrink: 0, position: 'relative' }}>
          <IconButton onClick={onOpenSearch} size={44}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F2937" strokeWidth="2.3">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </IconButton>

          <IconButton onClick={onOpenActivity} size={44}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1F2937" strokeWidth="2.1">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {dotColor && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                minWidth: 15, height: 15, padding: '0 3px', borderRadius: '50%',
                background: dotColor, color: '#fff', fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid #fff',
                animation: 'badgePulse 2s ease-in-out infinite',
              }}>
                {activityUnreadCount > 9 ? '9+' : activityUnreadCount}
              </span>
            )}
          </IconButton>
        </div>
      </div>

    </>
  );
}
