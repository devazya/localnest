/**
 * ShareProfileSheet.jsx — Social Interaction Layer (Segment 5.3)
 * Profile Sharing: Copy Link, Native Share, QR Code (placeholder — no QR
 * generation library in the project yet; a real code renders once one is
 * added, this reserves the exact UI slot for it).
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildProfileUrl, copyProfileLink, shareProfile } from '../../services/social';

export default function ShareProfileSheet({ profile, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!profile) return null;
  const name = profile.full_name || profile.username || 'Resident';
  const url = buildProfileUrl(profile.id);

  const handleCopy = async () => {
    await copyProfileLink(profile.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleShare = () => shareProfile(profile.id, name);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(13,8,32,0.5)', zIndex: 300, backdropFilter: 'blur(2px)' }}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 301,
          background: '#fff', borderRadius: '24px 24px 0 0', padding: '10px 22px calc(28px + env(safe-area-inset-bottom))',
          boxShadow: '0 -12px 40px rgba(0,0,0,0.18)', maxWidth: 480, margin: '0 auto',
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 4, background: '#E5E7EB', margin: '4px auto 18px' }} />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#0D0820', marginBottom: 2 }}>Share Profile</div>
        <div style={{ fontSize: 12.5, color: '#9CA3AF', marginBottom: 20 }}>Share {name}'s profile with others</div>

        {/* QR Code placeholder */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: '#FAFAFF', border: '1.5px dashed #E5E0FF', borderRadius: 18, padding: '22px 0', marginBottom: 18,
        }}>
          <div style={{
            width: 128, height: 128, borderRadius: 14, background: '#fff', border: '1.5px solid #EDE9FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(109,74,255,0.08)',
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#C4B8FF" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z"/>
            </svg>
          </div>
          <div style={{ fontSize: 11, color: '#B3AAD9', marginTop: 10, fontWeight: 600 }}>QR Code coming soon</div>
        </div>

        {/* Link row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, background: '#F8F7FF', border: '1.5px solid #F0EEFF',
          borderRadius: 14, padding: '10px 12px', marginBottom: 16,
        }}>
          <span style={{ flex: 1, fontSize: 12, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleCopy}
            style={{
              padding: '13px 0', borderRadius: 14, fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
              border: '1.5px solid #EDE9FF', background: copied ? '#EEFBF3' : '#F5F4FF',
              color: copied ? '#16A34A' : '#6D4AFF',
            }}
          >
            {copied ? '✓ Copied' : '🔗 Copy Link'}
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleShare}
            style={{
              padding: '13px 0', borderRadius: 14, fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
              border: 'none', background: 'linear-gradient(135deg, #6D4AFF 0%, #8F7BFF 100%)', color: '#fff',
              boxShadow: '0 6px 18px rgba(109,74,255,0.32)',
            }}
          >
            📤 Share
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
