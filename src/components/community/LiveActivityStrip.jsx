/**
 * LiveActivityStrip.jsx — Community module (Segment 2)
 * Premium horizontally-scrolling activity cards for every channel.
 * Replaces the Segment-1 placeholder. Activity counts are presentational
 * mock figures (no backend metrics exist yet) — wiring real counts is a
 * later segment's job; this only renders the UI shell.
 */

import { motion } from 'framer-motion';
import { CHANNELS } from './constants';

// Mock activity copy per channel — presentational only, no schema/queries.
const MOCK_ACTIVITY = {
  'general':         { count: '42 active',  live: true  },
  'announcements':   { count: '6 updates',  live: false },
  'ride-sharing':    { count: '8 offers',   live: false },
  'events':          { count: '15 going',   live: false },
  'sports':          { count: '19 chatting', live: false },
  'buy-sell':        { count: '23 listed',  live: false },
  'lost-and-found':  { count: '3 reports',  live: false },
  'help':            { count: '11 asking',  live: false },
  'jobs':             { count: '12 new',    live: false },
};

function LiveActivityCard({ ch, isActive, unread, onClick }) {
  const meta = MOCK_ACTIVITY[ch.slug] || { count: '', live: false };
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      style={{
        flexShrink: 0,
        scrollSnapAlign: 'start',
        width: 116,
        height: 96,
        borderRadius: 24,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '12px 10px',
        background: isActive
          ? 'linear-gradient(160deg, #FFFFFF 0%, #F5F3FF 100%)'
          : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: isActive ? `2px solid ${ch.color}` : '1.5px solid rgba(109,74,255,0.08)',
        boxShadow: isActive
          ? `0 8px 24px ${ch.glowColor}, 0 0 0 4px ${ch.glowColor}`
          : '0 2px 14px rgba(109,74,255,0.06)',
        cursor: 'pointer',
      }}
    >
      {unread > 0 && (
        <span style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }} />
      )}
      {meta.live && (
        <span style={{
          position: 'absolute', top: 8, left: 8, padding: '2px 7px', borderRadius: 999,
          background: 'linear-gradient(135deg, #22C55E, #16A34A)', fontSize: 8.5, fontWeight: 800,
          color: '#fff', letterSpacing: 0.4, animation: 'livePulse 2s ease-in-out infinite',
        }}>LIVE</span>
      )}

      <img src={ch.icon} alt={ch.name} style={{ width: 38, height: 38, objectFit: 'contain' }} />
      <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 600, color: isActive ? ch.color : '#374151', whiteSpace: 'nowrap' }}>{ch.name}</span>
      {meta.count && <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500 }}>{meta.count}</span>}
    </motion.button>
  );
}

export default function LiveActivityStrip({ channels, activeChannelId, getUnread, onSelect }) {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid rgba(109,74,255,0.07)', padding: '14px 14px 16px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, paddingLeft: 2 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', animation: 'livePulse 2s ease-in-out infinite' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>Live Activity</span>
      </div>

      <div
        className="hscr"
        style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollSnapType: 'x proximity', WebkitOverflowScrolling: 'touch', paddingBottom: 2 }}
      >
        {CHANNELS.map(ch => {
          const dbCh    = channels.find(c => c.slug === ch.slug);
          const isActive = !!dbCh && dbCh.id === activeChannelId;
          const unread   = getUnread ? getUnread(ch.slug) : 0;
          return (
            <LiveActivityCard
              key={ch.slug}
              ch={ch}
              isActive={isActive}
              unread={unread}
              onClick={() => dbCh && onSelect(dbCh.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
