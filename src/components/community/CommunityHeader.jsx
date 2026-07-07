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
          ? '0 1px 0 rgba(109,74,255,0.30), inset 0 1px 3px rgba(0,0,0,0.08)'
          : '0 1px 0 rgba(109,74,255,0.12), inset 0 1px 3px rgba(0,0,0,0.06)',
      }}
      whileHover={{ y: -1 }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active
          ? 'linear-gradient(145deg, rgba(109,74,255,0.16), rgba(109,74,255,0.08))'
          : 'linear-gradient(145deg, #FFFFFF, #F5F3FF)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: active ? '1.5px solid rgba(109,74,255,0.30)' : '1.5px solid rgba(109,74,255,0.12)',
        // 3D: colored floor shadow + top highlight
        boxShadow: active
          ? [
              '0 4px 0 rgba(109,74,255,0.28)',
              '0 6px 16px rgba(109,74,255,0.16)',
              'inset 0 1px 0 rgba(255,255,255,0.60)',
            ].join(', ')
          : [
              '0 4px 0 rgba(109,74,255,0.12)',
              '0 2px 10px rgba(109,74,255,0.08)',
              'inset 0 1px 0 rgba(255,255,255,0.95)',
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
  onPostClick,
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
        borderBottom: '1px solid rgba(109,74,255,0.08)',
        padding: '0 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
        boxShadow: '0 1px 0 rgba(109,74,255,0.04)',
      }}>
        <IconButton onClick={onOpenDrawer} size={44}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </IconButton>

        <div style={{ textAlign: 'center', flex: 1, padding: '0 10px' }}>
          <div style={{ fontSize: 17.5, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)', letterSpacing: -0.3, lineHeight: 1.2 }}>Community</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, marginTop: 1 }}>Green Sector • Anekal</div>
        </div>

        <div style={{ display: 'flex', gap: 9, alignItems: 'center', flexShrink: 0, position: 'relative' }}>
          <IconButton onClick={onOpenSearch} size={44}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </IconButton>

          <IconButton onClick={onOpenActivity} size={44}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
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

          <motion.button
            onClick={() => user ? onPostClick() : onNavigate?.('auth')}
            whileTap={{ scale: 0.94, y: 3, boxShadow: '0 1px 0 rgba(80,30,220,0.60), 0 4px 10px rgba(109,74,255,0.28), inset 0 1px 2px rgba(0,0,0,0.10)' }}
            whileHover={{ y: -2 }}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(145deg, #8B6FFF 0%, #6D4AFF 60%, #5B35EE 100%)',
              border: 'none',
              // Strong 3D floor for the main CTA button
              boxShadow: [
                '0 5px 0 rgba(80,30,200,0.55)',
                '0 8px 20px rgba(109,74,255,0.40)',
                'inset 0 1px 0 rgba(255,255,255,0.28)',
              ].join(', '),
              cursor: 'pointer',
              flexShrink: 0,
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
              transition: 'box-shadow 0.15s, transform 0.15s',
            }}
            aria-label="Create Post"
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </motion.button>
        </div>
      </div>

    </>
  );
}
