/**
 * DiscussionCard.jsx — Community module (Segment 3)
 * A single Discussion Room card. Data-driven from Supabase (no hardcoded
 * discussions) — icon/color come from the discussion's Community channel,
 * member count comes live from Supabase Realtime Presence. The entire card
 * is clickable; Join stays as a secondary CTA performing the same action.
 * When shown outside its own channel (General's discovery hub) it also
 * surfaces a small "in {Channel}" badge so it's clear where it actually lives.
 */

import { motion } from 'framer-motion';
import Avatar from './Avatar';
import DiscussionCategoryChip from './DiscussionCategoryChip';
import { timeAgo } from './utils';
import AnimatedNumber from './AnimatedNumber';

export default function DiscussionCard({ discussion, channelMeta, memberCount = 0, showChannelBadge = false, onJoin }) {
  const { title, description, category, created_at, profiles } = discussion;
  const color = channelMeta?.color || '#6D4AFF';
  const live = memberCount > 0;

  return (
    <motion.div
      layout
      role="button"
      tabIndex={0}
      onClick={onJoin}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onJoin?.()}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
      style={{
        background: '#fff', borderRadius: 24, padding: '16px 18px', cursor: 'pointer',
        border: '1.5px solid rgba(109,74,255,0.08)',
        boxShadow: '0 4px 20px rgba(109,74,255,0.07)',
        display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 14, flexShrink: 0,
          background: channelMeta?.bg || 'linear-gradient(135deg, #F4F2FF, #EDE9FF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {channelMeta?.icon
            ? <img src={channelMeta.icon} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            : <span style={{ fontSize: 22 }}>🗨️</span>}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>{title}</span>
            {live && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999,
                background: 'linear-gradient(135deg, #22C55E, #16A34A)', fontSize: 9.5, fontWeight: 800, color: '#fff',
                animation: 'livePulse 2s ease-in-out infinite',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} /> LIVE
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
            <DiscussionCategoryChip label={category} color={color} />
            {showChannelBadge && channelMeta?.name && (
              <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>in {channelMeta.name}</span>
            )}
          </div>

          {description && <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 6 }}>{description}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <Avatar profile={profiles} size={24} />
          <span style={{ fontSize: 12, color: '#6B7280', display: 'inline-flex', gap: 4, whiteSpace: 'nowrap' }}><AnimatedNumber value={memberCount} /> chatting</span>
          <span style={{ fontSize: 11, color: '#C4C4D6' }}>·</span>
          <span style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>Started {timeAgo(created_at)}</span>
        </div>

        <motion.button
          onClick={e => { e.stopPropagation(); onJoin?.(); }}
          whileTap={{ scale: 0.94 }}
          style={{
            background: '#F3F0FF', color: '#6D4AFF', border: 'none', borderRadius: 999,
            padding: '7px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
          }}
        >
          Join →
        </motion.button>
      </div>
    </motion.div>
  );
}
