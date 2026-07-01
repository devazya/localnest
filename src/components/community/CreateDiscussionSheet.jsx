/**
 * CreateDiscussionSheet.jsx — Community module (Segment 3)
 * Universal "Create Discussion" sheet — works from ANY Community channel,
 * including General (the discovery hub). Categories change depending on
 * the selected Community channel.
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CHANNELS, DISCUSSION_CHANNEL_SLUGS, DISCUSSION_CATEGORIES, DEFAULT_DISCUSSION_CATEGORIES } from './constants';

export default function CreateDiscussionSheet({ onClose, onCreate, defaultChannelSlug, submitting }) {
  const discussionChannels = useMemo(
    () => CHANNELS.filter(c => DISCUSSION_CHANNEL_SLUGS.includes(c.slug)),
    []
  );

  const initialSlug = discussionChannels.some(c => c.slug === defaultChannelSlug)
    ? defaultChannelSlug
    : (discussionChannels[0]?.slug || 'general');

  const [title, setTitle] = useState('');
  const [channelSlug, setChannelSlug] = useState(initialSlug);
  const [description, setDescription] = useState('');

  const categories = DISCUSSION_CATEGORIES[channelSlug] || DEFAULT_DISCUSSION_CATEGORIES;
  const [category, setCategory] = useState(categories[0]);

  const handleChannelChange = (slug) => {
    setChannelSlug(slug);
    const nextCats = DISCUSSION_CATEGORIES[slug] || DEFAULT_DISCUSSION_CATEGORIES;
    setCategory(nextCats[0]);
  };

  const canCreate = title.trim().length > 0 && !!channelSlug && !!category && !submitting;

  const handleCreate = () => {
    if (!canCreate) return;
    onCreate({ title: title.trim(), community_channel: channelSlug, category, description: description.trim() });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(13,8,32,0.35)' }} />

      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        style={{
          position: 'relative', width: '100%', maxHeight: '86vh', overflowY: 'auto',
          background: '#fff', borderRadius: '28px 28px 0 0', padding: '14px 20px calc(env(safe-area-inset-bottom, 0px) + 24px)',
          boxShadow: '0 -8px 40px rgba(13,8,32,0.16)',
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 999, background: '#E5E2FF', margin: '0 auto 18px' }} />

        <div style={{ fontSize: 18, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)', marginBottom: 18 }}>
          Create Discussion
        </div>

        <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.6 }}>Discussion Title</label>
        <input
          value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Badminton Tonight" autoFocus
          style={{ width: '100%', marginTop: 7, marginBottom: 16, padding: '12px 14px', borderRadius: 14, border: '1.5px solid #EDE9FF', background: '#F8F7FF', fontSize: 14.5, color: '#0D0820', outline: 'none', boxSizing: 'border-box' }}
        />

        <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.6 }}>Community Channel</label>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 9, marginBottom: 16 }}>
          {discussionChannels.map(c => (
            <button key={c.slug} onClick={() => handleChannelChange(c.slug)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px 7px 8px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                border: channelSlug === c.slug ? `1.5px solid ${c.color}` : '1.5px solid #E5E7EB',
                background: channelSlug === c.slug ? `${c.color}14` : '#fff',
                color: channelSlug === c.slug ? c.color : '#6B7280',
              }}>
              <img src={c.icon} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
              {c.name}
            </button>
          ))}
        </div>

        <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.6 }}>Category</label>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 9, marginBottom: 16 }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              style={{
                padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                border: category === c ? '1.5px solid #6D4AFF' : '1.5px solid #E5E7EB',
                background: category === c ? '#F3F0FF' : '#fff',
                color: category === c ? '#6D4AFF' : '#6B7280',
              }}>{c}</button>
          ))}
        </div>

        <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.6 }}>Description (optional)</label>
        <textarea
          value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this discussion about?" rows={3}
          style={{ width: '100%', marginTop: 7, marginBottom: 22, padding: '12px 14px', borderRadius: 14, border: '1.5px solid #EDE9FF', background: '#F8F7FF', fontSize: 14, color: '#0D0820', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />

        <motion.button
          onClick={handleCreate} disabled={!canCreate} whileTap={canCreate ? { scale: 0.97 } : {}}
          style={{
            width: '100%', padding: '14px', borderRadius: 16, border: 'none', fontSize: 15, fontWeight: 700, cursor: canCreate ? 'pointer' : 'default',
            background: canCreate ? 'linear-gradient(135deg, #6D4AFF, #9B6AFF)' : '#E5E7EB',
            color: canCreate ? '#fff' : '#9CA3AF',
            boxShadow: canCreate ? '0 6px 20px rgba(109,74,255,0.32)' : 'none',
          }}
        >
          {submitting ? 'Creating…' : 'Create'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
