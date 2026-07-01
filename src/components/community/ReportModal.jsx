/**
 * ReportModal.jsx — Community module
 * Report-post modal (reason selection + optional details).
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { REPORT_REASONS } from './constants';

export default function ReportModal({ post, onClose, onSubmit }) {
  const [reason, setReason] = useState(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!reason) return;
    setSubmitting(true);
    await onSubmit(post.id, reason, details.trim());
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
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>Report Post</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          {REPORT_REASONS.map(r => (
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
