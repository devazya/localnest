/**
 * CreateDiscussionSheet.jsx — Community module (Segment 3)
 * Universal "Create Discussion" sheet — works from ANY Community channel,
 * including General (the discovery hub). Categories change depending on
 * the selected Community channel.
 *
 * Segment 3.2: placeholder text in the Discussion Title input updates
 * dynamically based on the selected channel + category, giving users
 * a contextual example. If the user has typed their own text, the
 * auto-suggestion stays out of the way (placeholder only, never overwrites).
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CHANNELS, DISCUSSION_CHANNEL_SLUGS, DISCUSSION_CATEGORIES, DEFAULT_DISCUSSION_CATEGORIES } from './constants';

// ─── Contextual placeholder map ───────────────────────────────────────────────
// Keyed as `channelSlug:category` → example title string.
// Falls back to a channel-level default, then a generic fallback.
const TITLE_PLACEHOLDERS = {
  // General
  'general:General Chat':     'e.g. Anyone up for a rooftop hangout?',
  'general:Meetup':           'e.g. Coffee meetup at Common Ground – Sunday 10am',
  'general:Question':         'e.g. Which delivery app is fastest in Spice Garden?',
  'general:Recommendation':   'e.g. Best electrician near the complex?',
  'general:Other':            'e.g. What\'s everyone doing this weekend?',

  // Sports
  'sports:Cricket':           'e.g. Cricket match at Layout Ground – 6pm tonight',
  'sports:Football':          'e.g. 5-a-side football, need 3 more players',
  'sports:Badminton':         'e.g. Badminton session at Spice Garden courts',
  'sports:Cycling':           'e.g. Morning cycling group – Bannerghatta Road',
  'sports:Gym':               'e.g. Anyone want a gym buddy at Gold\'s?',
  'sports:Other':             'e.g. Let\'s organize a sports day!',

  // Ride Sharing
  'ride-sharing:Office Commute':  'e.g. Daily carpool – Spice Garden to Whitefield',
  'ride-sharing:Airport':         'e.g. Ride to Kempegowda Airport – Sunday 4am',
  'ride-sharing:Weekend Trip':    'e.g. Weekend trip to Coorg – looking for co-riders',
  'ride-sharing:Carpool':         'e.g. Carpool to Electronic City – Mon to Fri',
  'ride-sharing:Other':           'e.g. Need a ride to Koramangala tonight',

  // Events
  'events:Meetup':            'e.g. Spice Garden Residents Meetup – Saturday 6pm',
  'events:Party':             'e.g. Terrace party this Friday – all welcome',
  'events:Trek':              'e.g. Nandi Hills trek – Sunday 5am departure',
  'events:Movie':             'e.g. Superman movie group – PVR Orion 7pm',
  'events:Sports Event':      'e.g. IPL watch party at the club house',
  'events:Other':             'e.g. Potluck dinner at Block B common area',

  // Buy & Sell
  'buy-sell:Buy':             'e.g. Looking to buy a gaming chair in good condition',
  'buy-sell:Sell':            'e.g. Selling a gaming chair – barely used, ₹4500',
  'buy-sell:Exchange':        'e.g. Exchange: PS4 controller for Xbox controller',
  'buy-sell:Deals':           'e.g. Sharing Zepto deal – 50% off groceries today',
  'buy-sell:Other':           'e.g. Free study table – pick up from C-204',

  // Jobs
  'jobs:Hiring':              'e.g. Hiring React developer – remote, ₹15 LPA',
  'jobs:Looking for Work':    'e.g. 3 yrs exp. backend dev looking for new role',
  'jobs:Freelance':           'e.g. Available for freelance UI/UX projects',
  'jobs:Internship':          'e.g. CS student looking for summer internship',
  'jobs:Other':               'e.g. Anyone know about walk-in drives this week?',

  // Help
  'help:Question':            'e.g. How do I get the society NOC for vehicle?',
  'help:Advice':              'e.g. Best internet plan for heavy WFH use?',
  'help:Recommendation':      'e.g. Recommend a good plumber near Spice Garden',
  'help:Emergency':           'e.g. Power outage in B block – anyone else affected?',
  'help:Other':               'e.g. Anyone good at washing machine repair?',

  // Lost & Found
  'lost-and-found:Lost Item': 'e.g. Lost black umbrella near the gym – 12 June',
  'lost-and-found:Found Item':'e.g. Found a set of keys near Block A parking',
  'lost-and-found:Other':     'e.g. Missing parcel – anyone seen a blue Myntra bag?',
};

// Channel-level fallback (when category combo isn't found)
const CHANNEL_PLACEHOLDERS = {
  general:          'e.g. What\'s everyone talking about today?',
  sports:           'e.g. Badminton Tonight – 7pm at the courts',
  'ride-sharing':   'e.g. Carpool to Whitefield – Monday morning',
  events:           'e.g. Residents Meetup – this Saturday 6pm',
  'buy-sell':       'e.g. Selling a gaming chair – barely used, ₹4500',
  jobs:             'e.g. Hiring React developer – remote, ₹15 LPA',
  help:             'e.g. Best internet plan for WFH near Spice Garden?',
  'lost-and-found': 'e.g. Lost black umbrella near the gym entrance',
};

function getPlaceholder(channelSlug, category) {
  return (
    TITLE_PLACEHOLDERS[`${channelSlug}:${category}`] ||
    CHANNEL_PLACEHOLDERS[channelSlug] ||
    'e.g. Badminton Tonight'
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreateDiscussionSheet({ onClose, onCreate, defaultChannelSlug, submitting }) {
  const discussionChannels = useMemo(
    () => CHANNELS.filter(c => DISCUSSION_CHANNEL_SLUGS.includes(c.slug)),
    []
  );

  const initialSlug = discussionChannels.some(c => c.slug === defaultChannelSlug)
    ? defaultChannelSlug
    : (discussionChannels[0]?.slug || 'general');

  const [title, setTitle]           = useState('');
  const [channelSlug, setChannelSlug] = useState(initialSlug);
  const [description, setDescription] = useState('');

  const categories = DISCUSSION_CATEGORIES[channelSlug] || DEFAULT_DISCUSSION_CATEGORIES;
  const [category, setCategory] = useState(categories[0]);

  const placeholder = getPlaceholder(channelSlug, category);

  const handleChannelChange = (slug) => {
    setChannelSlug(slug);
    const nextCats = DISCUSSION_CATEGORIES[slug] || DEFAULT_DISCUSSION_CATEGORIES;
    setCategory(nextCats[0]);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
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

        {/* ── Title input — placeholder updates with channel + category ── */}
        <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.6 }}>Discussion Title</label>
        <motion.input
          key={placeholder}                      // re-mounts smoothly when placeholder changes
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={placeholder}
          autoFocus
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
          style={{
            width: '100%', marginTop: 7, marginBottom: 16, padding: '12px 14px',
            borderRadius: 14,
            border: title.length > 0 ? '1.5px solid #6D4AFF' : '1.5px solid #EDE9FF',
            background: '#F8F7FF', fontSize: 14.5, color: '#0D0820',
            outline: 'none', boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
        />

        {/* ── Community Channel ── */}
        <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.6 }}>Community Channel</label>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 9, marginBottom: 16 }}>
          {discussionChannels.map(c => (
            <motion.button
              key={c.slug}
              onClick={() => handleChannelChange(c.slug)}
              whileTap={{ scale: 0.94 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 13px 7px 8px', borderRadius: 999,
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                border: channelSlug === c.slug ? `1.5px solid ${c.color}` : '1.5px solid #E5E7EB',
                background: channelSlug === c.slug ? `${c.color}14` : '#fff',
                color: channelSlug === c.slug ? c.color : '#6B7280',
                transition: 'background 0.18s, border-color 0.18s, color 0.18s',
              }}
            >
              <img src={c.icon} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
              {c.name}
            </motion.button>
          ))}
        </div>

        {/* ── Category ── */}
        <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.6 }}>Category</label>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 9, marginBottom: 16 }}>
          {categories.map(c => (
            <motion.button
              key={c}
              onClick={() => handleCategoryChange(c)}
              whileTap={{ scale: 0.94 }}
              style={{
                padding: '7px 14px', borderRadius: 999,
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                border: category === c ? '1.5px solid #6D4AFF' : '1.5px solid #E5E7EB',
                background: category === c ? '#F3F0FF' : '#fff',
                color: category === c ? '#6D4AFF' : '#6B7280',
                transition: 'background 0.18s, border-color 0.18s, color 0.18s',
              }}
            >
              {c}
            </motion.button>
          ))}
        </div>

        {/* ── Description ── */}
        <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.6 }}>Description (optional)</label>
        <textarea
          value={description} onChange={e => setDescription(e.target.value)}
          placeholder="What's this discussion about?" rows={3}
          style={{
            width: '100%', marginTop: 7, marginBottom: 22, padding: '12px 14px',
            borderRadius: 14, border: '1.5px solid #EDE9FF', background: '#F8F7FF',
            fontSize: 14, color: '#0D0820', outline: 'none', resize: 'none',
            fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />

        <motion.button
          onClick={handleCreate} disabled={!canCreate} whileTap={canCreate ? { scale: 0.97 } : {}}
          style={{
            width: '100%', padding: '14px', borderRadius: 16, border: 'none',
            fontSize: 15, fontWeight: 700, cursor: canCreate ? 'pointer' : 'default',
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
