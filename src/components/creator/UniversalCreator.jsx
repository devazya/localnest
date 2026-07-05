/**
 * UniversalCreator.jsx — Segment 7.1
 *
 * Premium bottom sheet that acts as the SINGLE entry point for all
 * content creation in LocalNest. It is a pure launcher/router —
 * it never re-implements any existing composer. When the user picks
 * an option it calls onSelect(typeId) and the parent opens the
 * correct existing component.
 *
 * Props:
 *   isOpen        {boolean}             — controls visibility
 *   onClose       {() => void}          — dismiss handler
 *   onSelect      {(typeId: string) => void}  — called with the chosen type
 *   context       {string}             — current page slug for smart highlighting
 *                                         ('community'|'rideshare'|'buysell'|
 *                                          'events'|'neighbourhood-updates'|…)
 *   draftMeta     {object}             — { typeId: savedAt } map from useDraft
 *
 * typeId values
 * ─────────────
 * 'discussion'           → CreateDiscussionSheet (existing)
 * 'neighbourhood-update' → CreateUpdateModal     (existing)
 * 'community-post'       → CreatePostModal       (existing)
 * 'ride-offer'           → Coming Soon / UniversalPost in 7.2
 * 'ride-request'         → Coming Soon
 * 'sell-item'            → Coming Soon / UniversalPost in 7.2
 * 'list-pg'              → UniversalPost (existing, type='pg')
 * 'create-event'         → Coming Soon / UniversalPost in 7.2
 * 'post-job'             → Coming Soon
 * 'lost-found'           → Coming Soon
 * 'ask-help'             → Coming Soon
 * 'create-poll'          → Coming Soon
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDraftMeta } from './useDraft';

/* ── Action card catalogue ─────────────────────────────────────────────────── */
const CREATOR_OPTIONS = [
  {
    id: 'discussion',
    icon: '💬',
    title: 'Start Discussion',
    subtitle: 'Start a conversation with your neighbours.',
    color: '#6D4AFF',
    bg: 'rgba(109,74,255,0.07)',
    live: true,   // has a working composer
  },
  {
    id: 'neighbourhood-update',
    icon: '📢',
    title: 'Neighbourhood Update',
    subtitle: 'Share something happening nearby.',
    color: '#D97706',
    bg: 'rgba(217,119,6,0.07)',
    live: true,
  },
  {
    id: 'community-post',
    icon: '📋',
    title: 'Community Post',
    subtitle: 'Post an announcement, poll, or event to a channel.',
    color: '#0284C7',
    bg: 'rgba(2,132,199,0.07)',
    live: true,
  },
  {
    id: 'ride-offer',
    icon: '🚗',
    title: 'Offer Ride',
    subtitle: 'Share empty seats for a trip.',
    color: '#059669',
    bg: 'rgba(5,150,105,0.07)',
    live: false,
  },
  {
    id: 'ride-request',
    icon: '🙋',
    title: 'Need a Ride',
    subtitle: 'Ask neighbours for a ride.',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.07)',
    live: false,
  },
  {
    id: 'sell-item',
    icon: '🛒',
    title: 'Sell Item',
    subtitle: 'List something you want to sell.',
    color: '#DC2626',
    bg: 'rgba(220,38,38,0.07)',
    live: false,
  },
  {
    id: 'list-pg',
    icon: '🏠',
    title: 'List PG',
    subtitle: 'Add your PG listing.',
    color: '#059669',
    bg: 'rgba(5,150,105,0.07)',
    live: true,   // routes to existing UniversalPost type='pg'
  },
  {
    id: 'create-event',
    icon: '🎉',
    title: 'Create Event',
    subtitle: 'Host an event in the neighbourhood.',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.07)',
    live: false,
  },
  {
    id: 'post-job',
    icon: '💼',
    title: 'Post Job',
    subtitle: 'Share a local opportunity.',
    color: '#0284C7',
    bg: 'rgba(2,132,199,0.07)',
    live: false,
  },
  {
    id: 'lost-found',
    icon: '📦',
    title: 'Lost & Found',
    subtitle: 'Report a lost or found item.',
    color: '#D97706',
    bg: 'rgba(217,119,6,0.07)',
    live: false,
  },
  {
    id: 'ask-help',
    icon: '❓',
    title: 'Ask For Help',
    subtitle: 'Ask the community for assistance.',
    color: '#EC4899',
    bg: 'rgba(236,72,153,0.07)',
    live: false,
  },
  {
    id: 'create-poll',
    icon: '📊',
    title: 'Create Poll',
    subtitle: 'Gather opinions from your neighbours.',
    color: '#6D4AFF',
    bg: 'rgba(109,74,255,0.07)',
    live: false,
  },
];

/* ── Smart context map: page slug → highlighted creator typeId ────────────── */
const CONTEXT_MAP = {
  'community':             'discussion',
  'neighbourhood-updates': 'neighbourhood-update',
  'rideshare':             'ride-offer',
  'buysell':               'sell-item',
  'events':                'create-event',
  'pgs':                   'list-pg',
  'roommates':             'list-pg',
  'home':                  'neighbourhood-update',
};

/* ── Action Card ────────────────────────────────────────────────────────────── */
function ActionCard({ option, isHighlighted, hasDraft, onClick, index }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, ease: [0.22, 1, 0.36, 1], duration: 0.28 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '13px 14px',
        borderRadius: 18,
        border: isHighlighted
          ? `1.5px solid ${option.color}55`
          : '1.5px solid rgba(0,0,0,0.06)',
        background: isHighlighted ? option.bg : '#FAFAFA',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        position: 'relative',
        transition: 'border-color 0.18s, background 0.18s',
        boxShadow: isHighlighted
          ? `0 4px 20px ${option.color}14`
          : '0 1px 4px rgba(0,0,0,0.03)',
      }}
      onMouseEnter={e => {
        if (!isHighlighted) {
          e.currentTarget.style.background = option.bg;
          e.currentTarget.style.borderColor = `${option.color}33`;
        }
      }}
      onMouseLeave={e => {
        if (!isHighlighted) {
          e.currentTarget.style.background = '#FAFAFA';
          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
        }
      }}
    >
      {/* Icon container */}
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: option.bg,
        border: `1.5px solid ${option.color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
        boxShadow: `0 2px 10px ${option.color}18`,
        transition: 'transform 0.18s',
      }}>
        {option.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2,
        }}>
          <span style={{
            fontSize: 14, fontWeight: 700, color: '#0D0820',
            fontFamily: 'var(--font-display)', lineHeight: 1.25,
          }}>
            {option.title}
          </span>

          {/* "Coming Soon" badge for un-live options */}
          {!option.live && (
            <span style={{
              fontSize: 9, fontWeight: 700, color: '#9CA3AF',
              background: '#F3F4F6', borderRadius: 999,
              padding: '2px 7px', letterSpacing: 0.4, textTransform: 'uppercase',
              flexShrink: 0,
            }}>Soon</span>
          )}

          {/* Draft dot — show when the user has a saved draft for this type */}
          {hasDraft && (
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: option.color, flexShrink: 0,
              boxShadow: `0 0 6px ${option.color}88`,
            }} title="Unsaved draft" />
          )}
        </div>
        <span style={{
          fontSize: 12, color: '#9CA3AF', lineHeight: 1.4,
          display: 'block', overflow: 'hidden',
          whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>
          {option.subtitle}
        </span>
      </div>

      {/* Chevron */}
      <svg
        width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke={isHighlighted ? option.color : '#9CA3AF'}
        strokeWidth="2.2" style={{ flexShrink: 0, opacity: isHighlighted ? 0.9 : 0.45 }}
      >
        <path d="M9 18l6-6-6-6"/>
      </svg>

      {/* Highlighted ring */}
      {isHighlighted && (
        <motion.div
          layoutId="creator-highlight"
          style={{
            position: 'absolute', inset: 0, borderRadius: 18,
            border: `2px solid ${option.color}55`,
            pointerEvents: 'none',
          }}
        />
      )}
    </motion.button>
  );
}

/* ── Main Universal Creator ─────────────────────────────────────────────────── */
export default function UniversalCreator({ isOpen, onClose, onSelect, context = 'home' }) {
  // Determine the smart default for the current context
  const suggestedId = CONTEXT_MAP[context] || 'discussion';

  // Snapshot draft meta from localStorage on every open
  const draftMeta = getDraftMeta();

  // Lock body scroll while sheet is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  const handleSelect = (option) => {
    onClose();
    // Small delay so the sheet close animation plays before the composer opens
    setTimeout(() => onSelect(option.id), 180);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="uc-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 400,
              background: 'rgba(13,8,32,0.52)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
            }}
          />

          {/* Sheet panel */}
          <motion.div
            key="uc-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 36 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              zIndex: 401,
              background: '#FAFAFF',
              borderRadius: '28px 28px 0 0',
              maxHeight: '88vh',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 -12px 60px rgba(109,74,255,0.14), 0 -2px 16px rgba(0,0,0,0.08)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Drag handle */}
            <div style={{
              width: 40, height: 4, borderRadius: 999,
              background: '#E5E2FF', margin: '14px auto 0', flexShrink: 0,
            }} />

            {/* Header */}
            <div style={{
              padding: '16px 20px 10px',
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between', flexShrink: 0,
            }}>
              <div>
                <div style={{
                  fontSize: 20, fontWeight: 800, color: '#0D0820',
                  fontFamily: 'var(--font-display)', letterSpacing: -0.4,
                }}>
                  Create Something
                </div>
                <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 3 }}>
                  Choose what you want to create.
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onClose}
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'rgba(109,74,255,0.08)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#6B7280', flexShrink: 0, marginTop: 2,
                }}
                aria-label="Close"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </motion.button>
            </div>

            {/* Smart context hint */}
            {suggestedId && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                style={{
                  margin: '0 20px 10px',
                  padding: '8px 13px',
                  background: 'rgba(109,74,255,0.05)',
                  borderRadius: 12,
                  border: '1px solid rgba(109,74,255,0.10)',
                  display: 'flex', alignItems: 'center', gap: 7,
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 13 }}>✨</span>
                <span style={{ fontSize: 12, color: '#6D4AFF', fontWeight: 600 }}>
                  Suggested based on where you are
                </span>
              </motion.div>
            )}

            {/* Scrollable options list */}
            <div style={{
              flex: 1, overflowY: 'auto',
              padding: '2px 16px 20px',
              display: 'flex', flexDirection: 'column', gap: 7,
            }}>
              {CREATOR_OPTIONS.map((option, i) => (
                <ActionCard
                  key={option.id}
                  option={option}
                  isHighlighted={option.id === suggestedId}
                  hasDraft={!!draftMeta[option.id]}
                  onClick={() => handleSelect(option)}
                  index={i}
                />
              ))}

              {/* Bottom spacer so last card isn't flush against rubber-band */}
              <div style={{ height: 8 }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
