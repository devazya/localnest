/**
 * EditPostModal.jsx — Community module
 * Edit-post modal (title/body update via Supabase).
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../services/supabase/client';

export default function EditPostModal({ post, onClose, onUpdated }) {
  const [title, setTitle]     = useState(post.title);
  const [body, setBody]       = useState(post.body || '');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const save = async () => {
    if (!title.trim()) { setError('Title required'); return; }
    setLoading(true);
    const { data, error: e } = await supabase.from('community_posts')
      .update({ title: title.trim(), body: body.trim() || null })
      .eq('id', post.id).select('id,title,body,updated_at').single();
    setLoading(false);
    if (e) { setError(e.message); return; }
    onUpdated(data); onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: 22, padding: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.22)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>Edit Post</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>×</button>
        </div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" maxLength={120}
          style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14, marginBottom: 10, outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor='#6D4AFF'} onBlur={e => e.target.style.borderColor='#E5E7EB'} />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Description (optional)" rows={4}
          style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6, marginBottom: 14 }}
          onFocus={e => e.target.style.borderColor='#6D4AFF'} onBlur={e => e.target.style.borderColor='#E5E7EB'} />
        {error && <div style={{ color: '#DC2626', fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '1.5px solid #E5E7EB', background: 'none', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: '#4B5563' }}>Cancel</button>
          <button onClick={save} disabled={loading} style={{ flex: 2, padding: '12px 0', borderRadius: 12, border: 'none', background: '#6D4AFF', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>{loading ? 'Saving…' : 'Save'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
