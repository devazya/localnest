/**
 * ProfileQuickActionsMenu.jsx — Profile UI Premium Polish
 * Overflow (⋯) → premium bottom sheet: Share Profile, Copy Link, Mute
 * Resident, Report Resident, Block Resident (Coming Soon), QR Code
 * (Coming Soon). Reuses existing functionality (services/social.js) —
 * only the presentation changed from a dropdown to a bottom sheet.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { copyProfileLink, shareProfile, reportProfile, muteResident, unmuteResident, fetchIsMuted } from '../../services/social';
import { PROFILE_REPORT_REASONS } from '../community/constants';

function ProfileReportSheet({ onClose, onSubmit }) {
  const [reason, setReason] = useState(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!reason) return;
    setSubmitting(true);
    await onSubmit(reason, details.trim());
    setSubmitting(false);
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 650, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 22, padding: 22, boxShadow: '0 24px 80px rgba(0,0,0,0.22)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>Report Resident</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          {PROFILE_REPORT_REASONS.map(r => (
            <button key={r.key} onClick={() => setReason(r.key)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${reason === r.key ? '#6D4AFF' : '#F0F0F0'}`, background: reason === r.key ? '#F3F0FF' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ fontSize: 13.5, color: '#0D0820', fontWeight: reason === r.key ? 700 : 500 }}>{r.label}</span>
              {reason === r.key && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
          ))}
        </div>
        <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Additional details (optional)" rows={3}
          style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 14 }} />
        <button onClick={submit} disabled={!reason || submitting}
          style={{ width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', background: reason ? '#DC2626' : '#F3F4F6', color: reason ? '#fff' : '#9CA3AF', fontSize: 14, fontWeight: 700, cursor: reason ? 'pointer' : 'default' }}>
          {submitting ? 'Submitting…' : 'Submit Report'}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function ProfileQuickActionsMenu({ viewerId, profile, onToast, iconOnly = false }) {
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!viewerId || !profile?.id) return;
    fetchIsMuted(viewerId, profile.id).then(setIsMuted).catch(() => {});
  }, [viewerId, profile?.id]);

  if (!profile || !viewerId || viewerId === profile.id) return null;
  const name = profile.full_name || profile.username || 'Resident';

  const handleCopy = async () => {
    setOpen(false);
    try { await copyProfileLink(profile.id); onToast?.('Profile link copied'); }
    catch (err) { console.error('Copy link failed:', err); }
  };

  const handleShare = async () => {
    setOpen(false);
    try {
      const shared = await shareProfile(profile.id, name);
      if (shared) onToast?.('Profile link copied');
    } catch { /* user cancelled — not an error */ }
  };

  const handleReportSubmit = async (reason, details) => {
    try { await reportProfile(viewerId, profile.id, reason, details); onToast?.('Report submitted'); }
    catch (err) { console.error('Report profile failed:', err); }
  };

  const handleMuteToggle = async () => {
    setOpen(false);
    if (busy) return;
    setBusy(true);
    try {
      if (isMuted) { await unmuteResident(viewerId, profile.id); setIsMuted(false); onToast?.(`Unmuted ${name}`); }
      else { await muteResident(viewerId, profile.id); setIsMuted(true); onToast?.(`Muted ${name}`); }
    } catch (err) {
      console.error('Mute toggle failed:', err);
    } finally {
      setBusy(false);
    }
  };

  const ITEMS = [
    { icon: '📤', label: 'Share Profile', onClick: handleShare },
    { icon: '🔗', label: 'Copy Link', onClick: handleCopy },
    { icon: isMuted ? '🔔' : '🔕', label: isMuted ? 'Unmute Resident' : 'Mute Resident', onClick: handleMuteToggle },
    { icon: '🚩', label: 'Report Resident', onClick: () => { setOpen(false); setReportOpen(true); }, danger: true },
    { icon: '⛔', label: 'Block Resident', sub: 'Coming Soon', disabled: true },
    { icon: '📱', label: 'QR Code', sub: 'Coming Soon', disabled: true },
  ];

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        aria-label="Profile options"
        style={{
          width: iconOnly ? 40 : 34, height: iconOnly ? 40 : 34, borderRadius: iconOnly ? 14 : '50%', border: iconOnly ? '1.5px solid #F1EEFF' : 'none',
          background: iconOnly ? '#fff' : 'rgba(255,255,255,0.16)', color: iconOnly ? '#6D4AFF' : '#fff', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
          backdropFilter: iconOnly ? undefined : 'blur(6px)',
          boxShadow: iconOnly ? '0 6px 14px -6px rgba(45,15,120,0.14)' : undefined,
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(13,8,32,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
              style={{
                position: 'absolute', left: 0, right: 0, bottom: 0,
                background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
                padding: '10px 10px calc(env(safe-area-inset-bottom) + 18px)',
                boxShadow: '0 -14px 40px rgba(13,8,32,0.2)',
              }}
            >
              <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E5E1FF', margin: '6px auto 12px' }} />
              {ITEMS.map(item => (
                <button
                  key={item.label}
                  onClick={item.disabled ? undefined : item.onClick}
                  disabled={item.disabled}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '13px 14px', borderRadius: 14, border: 'none', background: 'none',
                    cursor: item.disabled ? 'default' : 'pointer', textAlign: 'left',
                    opacity: item.disabled ? 0.5 : 1,
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 12, background: item.danger ? 'rgba(220,38,38,0.08)' : '#F5F4FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                  }}>{item.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: item.danger ? '#DC2626' : '#0D0820' }}>{item.label}</div>
                    {item.sub && <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 1 }}>{item.sub}</div>}
                  </div>
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reportOpen && <ProfileReportSheet onClose={() => setReportOpen(false)} onSubmit={handleReportSubmit} />}
      </AnimatePresence>
    </>
  );
}
