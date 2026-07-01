/**
 * ChannelNavigation.jsx — Community module (Segment 1 foundation fix)
 * Horizontally scrollable, snap-scrolling premium chip row.
 * Presentation only — channel switching state and Supabase wiring stay
 * owned by Community.jsx.
 */

import { motion } from 'framer-motion';
import { CHANNELS } from './constants';

export default function ChannelNavigation({ channels, activeChannelId, getUnread, onSelect }) {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid rgba(109,74,255,0.07)', padding: '12px 14px 14px', flexShrink: 0 }}>
      <div
        className="hscr"
        style={{
          display: 'flex',
          gap: 9,
          overflowX: 'auto',
          scrollSnapType: 'x proximity',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 2,
        }}
      >
        {CHANNELS.map(ch => {
          const dbCh     = channels.find(c => c.slug === ch.slug);
          const isActive = !!dbCh && dbCh.id === activeChannelId;
          const unread   = getUnread ? getUnread(ch.slug) : 0;
          const isLive   = ch.type === 'chat';
          const hasIndicator = unread > 0 || isLive;

          return (
            <motion.button
              key={ch.slug}
              onClick={() => dbCh && onSelect(dbCh.id)}
              whileTap={{ scale: 0.95 }}
              layout
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              style={{
                scrollSnapAlign: 'start',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '10px 16px',
                borderRadius: 999,
                border: isActive ? '1.5px solid #6D4AFF' : '1.5px solid rgba(109,74,255,0.10)',
                background: isActive
                  ? 'linear-gradient(135deg, #6D4AFF 0%, #9B6AFF 100%)'
                  : 'rgba(255,255,255,0.75)',
                backdropFilter: isActive ? 'none' : 'blur(6px)',
                WebkitBackdropFilter: isActive ? 'none' : 'blur(6px)',
                boxShadow: isActive
                  ? '0 6px 18px rgba(109,74,255,0.32), 0 0 0 4px rgba(109,74,255,0.08)'
                  : '0 1px 5px rgba(109,74,255,0.05)',
                cursor: 'pointer',
                minHeight: 40,
                transform: isActive ? 'translateY(-1px)' : 'none',
                transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s',
              }}
            >
              <span style={{
                fontSize: 13,
                fontWeight: isActive ? 700 : 600,
                color: isActive ? '#fff' : '#374151',
                whiteSpace: 'nowrap',
                letterSpacing: -0.1,
              }}>
                {ch.name}
              </span>

              {/* Reserve consistent space for the indicator so chip widths
                  don't jump between active/inactive or unread states. */}
              <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, display: 'inline-block' }}>
                {hasIndicator && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                    style={{
                      width: 7, height: 7, borderRadius: '50%', display: 'block',
                      background: unread > 0
                        ? (isActive ? '#fff' : '#3B82F6')
                        : '#22C55E',
                      animation: (unread === 0 && isLive) ? 'livePulse 2s ease-in-out infinite' : 'none',
                    }}
                  />
                )}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
