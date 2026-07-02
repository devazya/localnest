/**
 * ProfileQuickActionsMenu.jsx — Social Interaction Layer (Segment 5.3)
 * Overflow (⋯) menu on Profile Preview / Profile Header: Copy Profile Link,
 * Share Profile, Report Profile, Mute Resident. Blocking is intentionally
 * NOT implemented per spec. Report submits to profile_reports; Mute writes
 * to muted_residents — both existing tables, reused via services/social.js.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { copyProfileLink, reportProfile, muteResident, unmuteResident } from '../../services/social';
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
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>Report Profile</div>
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

export default function ProfileQuickActionsMenu({ viewerId, profile, isMuted, onMuteChange, onToast }) {
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  if (!profile || !viewerId || viewerId === profile.id) return null;
  const name = profile.full_name || profile.username || 'Resident';

  const handleCopy = async (e) => {
    e.stopPropagation();
    setOpen(false);
    try { await copyProfileLink(profile.id); onToast?.('Profile link copied'); }
    catch (err) { console.error('Copy link failed:', err); }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    setOpen(false);
    try {
      const url = `${window.location.origin}${window.location.pathname}#/profile/${profile.id}`;
      if (navigator.share) await navigator.share({ title: `${name} on LocalNest`, url });
      else { await navigator.clipboard.writeText(url); onToast?.('Profile link copied'); }
    } catch { /* user cancelled — not an error */ }
  };

  const handleReportSubmit = async (reason, details) => {
    try { await reportProfile(viewerId, profile.id, reason, details); onToast?.('Report submitted'); }
    catch (err) { console.error('Report profile failed:', err); }
  };

  const handleMuteToggle = async (e) => {
    e.stopPropagation();
    setOpen(false);
    if (busy) return;
    setBusy(true);
    try {
      if (isMuted) { await unmuteResident(viewerId, profile.id); onMuteChange?.(false); onToast?.(`Unmuted ${name}`); }
      else { await muteResident(viewerId, profile.id); onMuteChange?.(true); onToast?.(`Muted ${name}`); }
    } catch (err) {
      console.error('Mute toggle failed:', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        style={{
          width: 34, height: 34, borderRadius: '50%', border: 'none',
          background: '#F5F4FF', color: '#6D4AFF', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
        }}
        aria-label="Profile options"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            style={{
              position: 'absolute', top: 40, right: 0, zIndex: 220,
              background: '#fff', borderRadius: 16, boxShadow: '0 14px 40px rgba(13,8,32,0.18)',
              border: '1px solid rgba(0,0,0,0.06)', minWidth: 200, padding: 6, overflow: 'hidden',
            }}
          >
            {[
              { icon: '🔗', label: 'Copy Profile Link', onClick: handleCopy },
              { icon: '📤', label: 'Share Profile', onClick: handleShare },
              { icon: '🚩', label: 'Report Profile', onClick: (e) => { e.stopPropagation(); setOpen(false); setReportOpen(true); }, danger: true },
              { icon: isMuted ? '🔔' : '🔕', label: isMuted ? 'Unmute Resident' : 'Mute Resident', onClick: handleMuteToggle },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.onClick}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, border: 'none', background: 'none',
                  cursor: 'pointer', textAlign: 'left', fontSize: 13.5, fontWeight: 600,
                  color: item.danger ? '#DC2626' : '#0D0820',
                }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reportOpen && <ProfileReportSheet onClose={() => setReportOpen(false)} onSubmit={handleReportSubmit} />}
      </AnimatePresence>
    </div>
  );
}
