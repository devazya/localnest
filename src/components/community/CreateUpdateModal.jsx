/**
 * CreateUpdateModal.jsx — Community / Neighbourhood Updates (Segment 4)
 * "Post Update" modal: Category → Compose → Preview → Submit.
 * Posts into the Neighbourhood Updates channel with nu_category set.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../services/supabase/client';
import { NU_CATEGORIES } from './constants';
import { FieldLabel, fieldInputStyle, TextField } from './PostFormFields';
import Avatar from './Avatar';
import MentionAutocomplete from './MentionAutocomplete';
import { getActiveMentionQuery, insertMention } from '../../services/social';
import { useDraft } from '../creator/useDraft';
import { mergeHashtagsIntoMeta } from '../../services/hashtags';

const POST_SELECT = `id,author_id,channel_id,channel_slug,title,body,image_urls,is_anonymous,is_pinned,like_count,downvote_count,helpful_count,not_helpful_count,comment_count,post_type,nu_category,metadata,is_removed,report_count,expires_at,created_at,profiles:author_id(id,full_name,username,avatar_url,is_verified)`;

export default function CreateUpdateModal({ onClose, onCreated, channelId, user, isAdmin }) {
  const { draft, autoSave, clearDraft, hasDraft } = useDraft('neighbourhood-update');
  const [showDraftBar, setShowDraftBar] = useState(hasDraft);

  const [title, setTitle]         = useState('');
  const [body, setBody]           = useState('');
  const [category, setCategory]   = useState('');
  const [pinned, setPinned]       = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [step, setStep]           = useState(1); // 1: category, 2: compose, 3: preview
  const [mentionQuery, setMentionQuery] = useState(null);

  const handleBodyChange = (e) => {
    const value = e.target.value;
    setBody(value);
    autoSave({ title, body: value, category, expiresAt });
    const cursor = e.target.selectionStart ?? value.length;
    setMentionQuery(getActiveMentionQuery(value, cursor));
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    autoSave({ title: val, body, category, expiresAt });
  };

  const handleSelectMention = (username) => {
    const next = insertMention(body, body.length, username);
    setBody(next);
    setMentionQuery(null);
  };

  const handleRestoreDraft = () => {
    if (!draft) return;
    if (draft.title)    setTitle(draft.title);
    if (draft.body)     setBody(draft.body);
    if (draft.category) { setCategory(draft.category); setStep(2); }
    if (draft.expiresAt) setExpiresAt(draft.expiresAt);
    setShowDraftBar(false);
  };

  const selectedCat = NU_CATEGORIES.find(c => c.id === category);

  const submit = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!category)     { setError('Please select a category.'); return; }
    if (!user)         { setError('Sign in to post.'); return; }
    setLoading(true); setError('');
    const metadata = mergeHashtagsIntoMeta({ badge: selectedCat?.label || 'Update' }, title, body);
    const payload = {
      channel_id: channelId,
      author_id: user.id,
      title: title.trim(),
      body: body.trim() || null,
      post_type: 'announcement',
      nu_category: category,
      is_pinned: !!(isAdmin && pinned),
      expires_at: expiresAt || null,
      metadata,
    };
    const { data, error: e } = await supabase
      .from('community_posts')
      .insert(payload)
      .select(POST_SELECT)
      .single();
    setLoading(false);
    if (e) { setError(e.message); return; }
    clearDraft();
    onCreated(data);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 650,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', maxWidth: 560,
          background: '#fff', borderRadius: '24px 24px 0 0',
          maxHeight: '92vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -12px 60px rgba(217,119,6,0.15)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 4, background: '#E5E7EB' }} />
        </div>

        {/* Title bar */}
        <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>
            {step === 1 ? 'Choose Category' : step === 2 ? 'Post Update' : 'Preview'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>×</button>
        </div>

        {/* Progress bar */}
        <div style={{ margin: '10px 20px 0', height: 3, background: '#FEF3C7', borderRadius: 3 }}>
          <motion.div
            animate={{ width: `${(step / 3) * 100}%` }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #D97706, #F59E0B)', borderRadius: 3 }}
          />
        </div>

        {/* Draft restore bar */}
        {showDraftBar && hasDraft && step === 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            margin: '10px 20px 0', padding: '10px 13px', borderRadius: 12,
            background: 'rgba(217,119,6,0.05)', border: '1.5px solid rgba(217,119,6,0.18)',
          }}>
            <span style={{ fontSize: 17, flexShrink: 0 }}>📝</span>
            <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: '#0D0820' }}>You have an unsaved draft</span>
            <button onClick={() => setShowDraftBar(false)}
              style={{ background: 'none', border: 'none', fontSize: 12, color: '#9CA3AF', cursor: 'pointer', padding: '3px 7px' }}>Discard</button>
            <button onClick={handleRestoreDraft}
              style={{ background: '#D97706', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', padding: '6px 12px' }}>Restore</button>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 36px' }}>

          {/* Step 1: Category grid */}
          {step === 1 && (
            <div>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 14 }}>What type of update is this?</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {NU_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategory(cat.id); setStep(2); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '12px 12px', borderRadius: 14, cursor: 'pointer',
                      background: '#FAFAFA',
                      border: '1.5px solid #F0F0F0',
                      textAlign: 'left', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = cat.bg; e.currentTarget.style.borderColor = cat.color + '44'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.borderColor = '#F0F0F0'; }}
                  >
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{cat.emoji}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', lineHeight: 1.25 }}>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Compose */}
          {step === 2 && (
            <div>
              {selectedCat && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: selectedCat.bg, border: `1.5px solid ${selectedCat.color}33`,
                  borderRadius: 999, padding: '6px 14px', marginBottom: 18,
                }}>
                  <span style={{ fontSize: 15 }}>{selectedCat.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: selectedCat.color }}>{selectedCat.label}</span>
                  <button
                    onClick={() => setStep(1)}
                    style={{ background: 'none', border: 'none', fontSize: 11, color: selectedCat.color, cursor: 'pointer', padding: 0, opacity: 0.7, marginLeft: 2 }}
                  >change</button>
                </div>
              )}

              <FieldLabel>Title *</FieldLabel>
              <TextField value={title} onChange={handleTitleChange} placeholder="What's the update?" />

              <FieldLabel>Description</FieldLabel>
              <textarea
                value={body}
                onChange={handleBodyChange}
                placeholder="Add more details… try @name to mention someone"
                rows={4}
                style={{ ...fieldInputStyle, resize: 'vertical', lineHeight: 1.6, marginBottom: 6 }}
                onFocus={e => e.target.style.borderColor = '#D97706'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
              <div style={{ marginBottom: 8 }}>
                <MentionAutocomplete query={mentionQuery} excludeId={user?.id} onSelect={handleSelectMention} />
              </div>

              <FieldLabel>Expires On (optional)</FieldLabel>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                style={{ ...fieldInputStyle, marginBottom: 14 }}
                onFocus={e => e.target.style.borderColor = '#D97706'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />

              {isAdmin && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, cursor: 'pointer' }}>
                  <div
                    onClick={() => setPinned(p => !p)}
                    style={{
                      width: 38, height: 22, borderRadius: 999,
                      background: pinned ? '#D97706' : '#E5E7EB',
                      position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 2.5, left: pinned ? 18 : 2.5,
                      width: 17, height: 17, borderRadius: '50%',
                      background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s',
                    }} />
                  </div>
                  <span style={{ fontSize: 13, color: '#4B5563' }}>📌 Pin this update to the top</span>
                </label>
              )}

              {error && (
                <div style={{ fontSize: 12.5, color: '#DC2626', background: '#FEF2F2', borderRadius: 10, padding: '9px 12px', marginBottom: 10 }}>{error}</div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '14px 0', borderRadius: 12, border: '1.5px solid #E5E7EB', background: 'none', fontSize: 13.5, fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>← Back</button>
                <button
                  onClick={() => { if (!title.trim()) { setError('Title is required.'); return; } setError(''); setStep(3); }}
                  style={{ flex: 2, padding: '14px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(217,119,6,0.35)' }}
                >Preview</button>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 3 && (
            <div>
              <div style={{ border: '1.5px solid #F0F0F0', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ height: 3, background: 'linear-gradient(90deg, #D97706, #F59E0B)' }} />
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                    <Avatar profile={user ? { full_name: user.user_metadata?.full_name, avatar_url: user.user_metadata?.avatar_url } : null} size={38} />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0D0820' }}>{user?.user_metadata?.full_name || 'You'}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF' }}>Just now</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {selectedCat && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: selectedCat.bg, borderRadius: 999, padding: '4px 10px', fontSize: 11.5, fontWeight: 700, color: selectedCat.color }}>
                        {selectedCat.emoji} {selectedCat.label}
                      </span>
                    )}
                    {pinned && isAdmin && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#FEF3C7', borderRadius: 999, padding: '4px 10px', fontSize: 11.5, fontWeight: 700, color: '#D97706' }}>
                        📌 Pinned
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 15.5, fontWeight: 700, color: '#0D0820', marginBottom: 6, lineHeight: 1.4 }}>{title}</div>
                  {body && <div style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.7 }}>{body}</div>}
                  {expiresAt && (
                    <div style={{ marginTop: 10, fontSize: 12, color: '#D97706', background: '#FEF3C7', display: 'inline-block', padding: '4px 10px', borderRadius: 8 }}>
                      Expires: {new Date(expiresAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div style={{ fontSize: 12.5, color: '#DC2626', background: '#FEF2F2', borderRadius: 10, padding: '9px 12px', marginBottom: 14 }}>{error}</div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '14px 0', borderRadius: 12, border: '1.5px solid #E5E7EB', background: 'none', fontSize: 13.5, fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>Edit</button>
                <button
                  onClick={submit}
                  disabled={loading}
                  style={{ flex: 2, padding: '14px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(217,119,6,0.35)', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? 'Posting…' : 'Post Update'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
