/**
 * CreatePostModal.jsx — Community module
 * Multi-step "Choose Type → Channel → Form → Preview" create-post flow.
 * Only existing implementation moved — no logic changes.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../services/supabase/client';
import { CHANNELS, POST_TYPES } from './constants';
import { getChannelMeta, getChannelPrefix } from './utils';
import Avatar from './Avatar';
import {
  FieldLabel, fieldInputStyle, TextField, Toggle,
  RideOfferFields, RideRequestFields, EventFields, BuySellFields, PollFields, AnnouncementFields,
} from './PostFormFields';

export default function CreatePostModal({ onClose, onCreated, channels, currentChannelId, user, isAdmin }) {
  const [step, setStep]               = useState(1); // 1 type, 2 channel, 3 form, 4 preview
  const [postType, setPostType]       = useState('post');
  const [channelSlug, setChannelSlug] = useState(channels.find(c => c.id === currentChannelId)?.slug || 'general');
  const [title, setTitle]             = useState('');
  const [body, setBody]               = useState('');
  const [anon, setAnon]               = useState(false);
  const [fields, setFields]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const channelId = channels.find(c => c.slug === channelSlug)?.id || channels[0]?.id;
  const selMeta   = getChannelMeta(channelSlug);
  const prefix    = getChannelPrefix(channelSlug);
  const totalSteps = 4;

  const visiblePostTypes = POST_TYPES.filter(pt => !pt.adminOnly || isAdmin);

  const submit = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!user) { setError('Sign in to post.'); return; }
    if (postType === 'poll') {
      const opts = (fields.options || []).filter(o => o.trim());
      if (opts.length < 2) { setError('Add at least 2 poll options.'); return; }
    }
    setLoading(true); setError('');
    const insertPayload = {
      channel_id: channelId,
      author_id: user.id,
      title: title.trim(),
      body: body.trim() || null,
      is_anonymous: anon,
      post_type: postType,
      metadata: fields,
      is_pinned: postType === 'announcement' && !!fields.pinned,
    };
    const { data, error: e } = await supabase.from('community_posts')
      .insert(insertPayload)
      .select(`id,author_id,channel_id,channel_slug,title,body,image_urls,is_anonymous,is_pinned,like_count,downvote_count,comment_count,post_type,metadata,is_removed,report_count,created_at,profiles:author_id(id,full_name,username,avatar_url,is_verified)`)
      .single();
    setLoading(false);
    if (e) { setError(e.message); return; }
    onCreated(data); onClose();
  };

  const renderFields = () => {
    switch (postType) {
      case 'ride_offer':   return <RideOfferFields fields={fields} setFields={setFields} />;
      case 'ride_request': return <RideRequestFields fields={fields} setFields={setFields} />;
      case 'event':        return <EventFields fields={fields} setFields={setFields} />;
      case 'buysell':      return <BuySellFields fields={fields} setFields={setFields} />;
      case 'poll':         return <PollFields fields={fields} setFields={setFields} />;
      case 'announcement': return <AnnouncementFields fields={fields} setFields={setFields} />;
      default: return null;
    }
  };

  const stepTitle = () => {
    if (step === 1) return 'Choose Post Type';
    if (step === 2) return 'Choose Channel';
    if (step === 3) return POST_TYPES.find(p => p.id === postType)?.title || 'Compose';
    return <span>Posting in <span style={{ color: selMeta?.color || '#6D4AFF' }}>{prefix}</span></span>;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 560, background: '#fff', borderRadius: '24px 24px 0 0', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -12px 60px rgba(0,0,0,0.2)' }}>

        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}><div style={{ width: 36, height: 4, borderRadius: 4, background: '#E5E7EB' }} /></div>

        <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>{stepTitle()}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>×</button>
        </div>

        <div style={{ margin: '12px 20px 0', height: 3, background: '#F3F0FF', borderRadius: 3 }}>
          <motion.div animate={{ width: `${(step / totalSteps) * 100}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, #6D4AFF, #9B6AFF)', borderRadius: 3 }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 36px' }}>

          {/* Step 1: type */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>What do you want to create?</div>
              {visiblePostTypes.map(pt => (
                <button key={pt.id} onClick={() => { setPostType(pt.id); setStep(2); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#FAFAFA', border: '1.5px solid #F0F0F0', borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#F3F0FF'; e.currentTarget.style.borderColor='#6D4AFF33'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='#FAFAFA'; e.currentTarget.style.borderColor='#F0F0F0'; }}>
                  <div><div style={{ fontSize: 14, fontWeight: 600, color: '#0D0820' }}>{pt.title}</div><div style={{ fontSize: 12, color: '#9CA3AF' }}>{pt.desc}</div></div>
                  <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: channel */}
          {step === 2 && (
            <div>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 12 }}>Where do you want to post?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CHANNELS.filter(ch => ch.slug !== 'general' || postType === 'post').map(ch => {
                  const dbCh = channels.find(c => c.slug === ch.slug);
                  if (!dbCh) return null;
                  const sel = ch.slug === channelSlug;
                  return (
                    <button key={ch.slug} onClick={() => { setChannelSlug(ch.slug); setStep(3); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: sel ? 'rgba(109,74,255,0.06)' : '#fff', border: `1.5px solid ${sel ? ch.color + '44' : '#F0F0F0'}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: ch.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img src={ch.icon} alt="" style={{ width: 37, height: 37, objectFit: 'contain' }} />
                      </div>
                      <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: '#0D0820' }}>D/{ch.name}</div><div style={{ fontSize: 11.5, color: '#9CA3AF' }}>{ch.desc}</div></div>
                      {sel && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setStep(1)} style={{ marginTop: 14, width: '100%', padding: '12px 0', borderRadius: 12, border: '1.5px solid #F0F0F0', background: 'none', fontSize: 13.5, fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>← Back</button>
            </div>
          )}

          {/* Step 3: compose form */}
          {step === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: selMeta?.bg || '#F8F7FF', borderRadius: 12, padding: '10px 14px', marginBottom: 18, border: `1.5px solid ${selMeta?.color || '#6D4AFF'}22` }}>
                <img src={selMeta?.icon} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                <div><div style={{ fontSize: 12, color: '#9CA3AF' }}>Posting in</div><div style={{ fontSize: 13.5, fontWeight: 700, color: selMeta?.color || '#6D4AFF' }}>{prefix}</div></div>
              </div>

              <FieldLabel>Title</FieldLabel>
              <TextField value={title} onChange={setTitle} placeholder="What's on your mind?" />
              <FieldLabel>Description (optional)</FieldLabel>
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Add more details…" rows={3}
                style={{ ...fieldInputStyle, resize: 'vertical', lineHeight: 1.6, marginBottom: 14 }}
                onFocus={e => e.target.style.borderColor='#6D4AFF'} onBlur={e => e.target.style.borderColor='#E5E7EB'} />

              {renderFields()}

              <Toggle checked={anon} onChange={setAnon} label="Post anonymously" />

              {error && <div style={{ fontSize: 12.5, color: '#DC2626', background: '#FEF2F2', borderRadius: 10, padding: '9px 12px', marginTop: 4, marginBottom: 10 }}>{error}</div>}

              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '14px 0', borderRadius: 12, border: '1.5px solid #E5E7EB', background: 'none', fontSize: 13.5, fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>Back</button>
                <button onClick={() => { if (!title.trim()) { setError('Title is required.'); return; } setError(''); setStep(4); }}
                  style={{ flex: 2, padding: '14px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6D4AFF 0%, #9B6AFF 100%)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(109,74,255,0.4)' }}>Preview</button>
              </div>
            </div>
          )}

          {/* Step 4: preview & confirm */}
          {step === 4 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: selMeta?.bg || '#F8F7FF', borderRadius: 12, padding: '10px 14px', marginBottom: 16, border: `1.5px solid ${selMeta?.color || '#6D4AFF'}22` }}>
                <img src={selMeta?.icon} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                <div><div style={{ fontSize: 12, color: '#9CA3AF' }}>Posting in</div><div style={{ fontSize: 13.5, fontWeight: 700, color: selMeta?.color || '#6D4AFF' }}>{prefix}</div></div>
              </div>

              <div style={{ border: '1.5px solid #F0F0F0', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  {anon
                    ? <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
                    : <Avatar profile={user ? { full_name: user.user_metadata?.full_name, avatar_url: user.user_metadata?.avatar_url } : null} size={38} />}
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0D0820' }}>{anon ? 'Anonymous' : (user?.user_metadata?.full_name || 'You')}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>Just now</div>
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0D0820', marginBottom: 6 }}>{title}</div>
                {body && <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6 }}>{body}</div>}
                {postType !== 'post' && Object.keys(fields).length > 0 && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #F4F3FF', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {Object.entries(fields).filter(([k, v]) => v && k !== 'options').map(([k, v]) => (
                      <div key={k} style={{ fontSize: 12, color: '#6B7280' }}><strong style={{ color: '#374151', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}:</strong> {String(v)}</div>
                    ))}
                    {postType === 'poll' && fields.options && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                        {fields.options.filter(o => o.trim()).map((o, i) => (
                          <div key={i} style={{ fontSize: 12.5, color: '#374151', background: '#F8F7FF', padding: '6px 10px', borderRadius: 8 }}>{o}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {error && <div style={{ fontSize: 12.5, color: '#DC2626', background: '#FEF2F2', borderRadius: 10, padding: '9px 12px', marginBottom: 14 }}>{error}</div>}

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setStep(3)} style={{ flex: 1, padding: '14px 0', borderRadius: 12, border: '1.5px solid #E5E7EB', background: 'none', fontSize: 13.5, fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>Edit</button>
                <button onClick={submit} disabled={loading}
                  style={{ flex: 2, padding: '14px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6D4AFF 0%, #9B6AFF 100%)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(109,74,255,0.4)', opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Posting…' : 'Confirm & Post'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
