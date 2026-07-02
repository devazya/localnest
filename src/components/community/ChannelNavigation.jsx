/**
 * ChannelNavigation.jsx — Community module (Segment 3.2)
 * Horizontally scrollable, snap-scrolling premium chip row.
 * 3D depth effect: each inactive pill has a visible bottom "floor" border
 * that makes it look raised off the surface. Pressing pushes it down.
 * Text uses each channel's own brand color (inactive) so pills feel alive.
 */

import { motion } from 'framer-motion';
import { CHANNELS } from './constants';

export default function ChannelNavigation({ channels, activeChannelId, getUnread, onSelect }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #FAFAFF 0%, #F5F3FF 100%)',
      borderBottom: '1px solid rgba(109,74,255,0.09)',
      padding: '12px 14px 16px',
      flexShrink: 0,
    }}>
      <div
        className="hscr"
        style={{
          display: 'flex',
          gap: 9,
          overflowX: 'auto',
          scrollSnapType: 'x proximity',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 4, // room for the 3d shadow
        }}
      >
        {CHANNELS.map(ch => {
          const dbCh     = channels.find(c => c.slug === ch.slug);
          const isActive = !!dbCh && dbCh.id === activeChannelId;
          const unread   = getUnread ? getUnread(ch.slug) : 0;
          const isLive   = ch.type === 'chat';
          const hasIndicator = unread > 0 || isLive;

          // Each channel's brand color used for the inactive tint + text
          const color = ch.color || '#6D4AFF';
          // Derive a darker shade for the 3D "floor" border (pressed face)
          // We just drop opacity over a dark base — works for all colors.
          const floorColor = `${color}55`; // ~33% opacity of brand color

          return (
            <motion.button
              key={ch.slug}
              onClick={() => dbCh && onSelect(dbCh.id)}
              whileTap={{
                scale: 0.96,
                y: 3,           // push DOWN on press — physical feel
                boxShadow: isActive
                  ? `0 1px 0 ${color}88, inset 0 1px 3px rgba(0,0,0,0.10)`
                  : `0 1px 0 ${floorColor}, inset 0 1px 3px rgba(0,0,0,0.06)`,
              }}
              layout
              transition={{ type: 'spring', stiffness: 440, damping: 30 }}
              style={{
                scrollSnapAlign: 'start',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 15px',
                borderRadius: 999,
                cursor: 'pointer',
                minHeight: 40,
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                position: 'relative',

                // ── Active state ──
                ...(isActive ? {
                  background: `linear-gradient(145deg, ${color} 0%, ${color}CC 100%)`,
                  border: `1.5px solid ${color}`,
                  // 3D: bright top-left inner light + deep bottom shadow floor
                  boxShadow: [
                    `0 4px 0 ${color}88`,          // 3D floor
                    `0 6px 16px ${color}44`,        // glow
                    `inset 0 1px 0 rgba(255,255,255,0.30)`, // top highlight
                  ].join(', '),
                  transform: 'translateY(-2px)',
                } : {
                  // ── Inactive state ── brand-tinted glass pill
                  background: `linear-gradient(160deg, ${color}12 0%, ${color}08 100%)`,
                  border: `1.5px solid ${color}28`,
                  // 3D: the "floor" is a colored bottom border offset
                  boxShadow: [
                    `0 4px 0 ${color}30`,          // 3D floor — key effect
                    `0 2px 8px ${color}14`,         // soft ambient
                    `inset 0 1px 0 rgba(255,255,255,0.70)`, // top highlight
                  ].join(', '),
                  transform: 'translateY(0)',
                }),

                transition: 'background 0.18s, border-color 0.18s, box-shadow 0.18s, transform 0.18s',
              }}
            >
              {/* Channel name — brand color when inactive, white when active */}
              <span style={{
                fontSize: 13,
                fontWeight: isActive ? 700 : 650,
                // Inactive: use the channel's own brand color (not grey)
                color: isActive ? '#fff' : color,
                whiteSpace: 'nowrap',
                letterSpacing: -0.2,
                // Subtle text shadow on active for depth
                textShadow: isActive ? `0 1px 2px ${color}66` : 'none',
              }}>
                {ch.name}
              </span>

              {/* Dot indicator */}
              <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, display: 'inline-block' }}>
                {hasIndicator && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                    style={{
                      width: 7, height: 7, borderRadius: '50%', display: 'block',
                      background: unread > 0
                        ? (isActive ? 'rgba(255,255,255,0.90)' : '#3B82F6')
                        : '#22C55E',
                      boxShadow: unread > 0 ? 'none' : '0 0 0 2px rgba(34,197,94,0.25)',
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
