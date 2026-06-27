/**
 * UniversalPost.jsx
 *
 * Reusable modal component. Mount it once at the app root and control it
 * with isOpen / onClose / onSuccess — no routing dependency.
 *
 * Props:
 *   isOpen    {boolean}           — controls visibility
 *   onClose   {() => void}        — called when the modal should close
 *   onSuccess {(type: string) => void} — called after a successful submit;
 *                                   receives the post-type id so the parent
 *                                   can navigate if it wants to
 *   user      {object|null}       — Supabase auth user
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase/client';

// ─── Design tokens (match existing LocalNest palette) ────────────────────────
const PRIMARY     = '#6D4AFF';
const SURFACE     = 'rgba(255,255,255,0.97)';
const BORDER      = 'rgba(109,74,255,0.14)';
const TEXT        = '#1A1340';
const MUTED       = '#6B7280';
const INPUT_BG    = 'rgba(109,74,255,0.04)';

// ─── Post type catalogue ─────────────────────────────────────────────────────
const POST_TYPES = [
  { id: 'pg',        icon: '🏠', title: 'PG Listing',       desc: 'List your paying-guest accommodation',    color: '#059669' },
  { id: 'community', icon: '👥', title: 'Community Post',    desc: 'Share news, questions or announcements',  color: '#6D4AFF' },
  { id: 'ride',      icon: '🚗', title: 'Ride Share',        desc: 'Offer or request a shared ride',          color: '#0284C7' },
  { id: 'event',     icon: '🎉', title: 'Event',             desc: 'Create a local event or meetup',          color: '#7C3AED' },
  { id: 'marketplace', icon: '🛒', title: 'Marketplace Item', desc: 'Buy or sell second-hand goods',          color: '#D97706' },
  { id: 'roommate',  icon: '🛏', title: 'Roommate Request',  desc: 'Find a flatmate or a room',               color: '#DC2626' },
  { id: 'shop',      icon: '🏪', title: 'Local Shop',        desc: 'List your local business',                color: '#059669' },
  { id: 'gym',       icon: '💪', title: 'Gym',               desc: 'Add your gym to the directory',           color: '#6D4AFF' },
];

// ─── Shared UI helpers ────────────────────────────────────────────────────────
function Label({ children, required }) {
  return (
    <label style={{ fontSize: 12, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>
      {children}{required && <span style={{ color: '#DC2626', marginLeft: 3 }}>*</span>}
    </label>
  );
}

const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: INPUT_BG, border: `1.5px solid ${BORDER}`,
  borderRadius: 11, fontSize: 14, color: TEXT, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s',
};

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}

function Input({ label, required, ...props }) {
  return (
    <Field label={label} required={required}>
      <input
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.45)'}
        onBlur={e => e.target.style.borderColor = BORDER}
        {...props}
      />
    </Field>
  );
}

function Textarea({ label, required, rows = 4, ...props }) {
  return (
    <Field label={label} required={required}>
      <textarea
        rows={rows}
        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
        onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.45)'}
        onBlur={e => e.target.style.borderColor = BORDER}
        {...props}
      />
    </Field>
  );
}

function Select({ label, required, children, ...props }) {
  return (
    <Field label={label} required={required}>
      <select
        style={{ ...inputStyle, cursor: 'pointer' }}
        onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.45)'}
        onBlur={e => e.target.style.borderColor = BORDER}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}

function Row({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>{children}</div>;
}

// ─── Image uploader ──────────────────────────────────────────────────────────
function ImageUploader({ bucket, folder, value, onChange, label = 'Photos', max = 5 }) {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);

  const upload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const urls = [...value];
    for (const file of Array.from(files).slice(0, max - value.length)) {
      const path = `${folder}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    onChange(urls);
    setUploading(false);
  };

  const remove = (url) => onChange(value.filter(u => u !== url));

  return (
    <Field label={label}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
        {value.map(url => (
          <div key={url} style={{ position: 'relative', width: 80, height: 80 }}>
            <img src={url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: `1.5px solid ${BORDER}` }} />
            <button onClick={() => remove(url)} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#DC2626', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            style={{ width: 80, height: 80, borderRadius: 10, border: `2px dashed ${BORDER}`, background: INPUT_BG, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: MUTED, fontSize: 11, transition: 'all 0.2s' }}
          >
            {uploading ? '⏳' : <>📷<span>Add</span></>}
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => upload(e.target.files)} />
    </Field>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      style={{
        position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, background: type === 'success' ? '#059669' : '#DC2626',
        color: '#fff', padding: '12px 24px', borderRadius: 12,
        fontSize: 14, fontWeight: 600, boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
        whiteSpace: 'nowrap',
      }}
    >{type === 'success' ? '✅ ' : '❌ '}{message}</motion.div>
  );
}

function useToast() {
  const [toast, setToast] = useState(null);
  const show = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };
  return [toast, show];
}

// ─── Submit button ────────────────────────────────────────────────────────────
function SubmitBtn({ loading, label = 'Publish' }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: '100%', padding: '13px 0', borderRadius: 12,
        background: loading ? 'rgba(109,74,255,0.5)' : PRIMARY,
        color: '#fff', border: 'none', fontSize: 15, fontWeight: 700,
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: '0 4px 18px rgba(109,74,255,0.3)',
        transition: 'all 0.2s', marginTop: 6,
      }}
    >{loading ? 'Publishing…' : label}</button>
  );
}

// ─── Error display ────────────────────────────────────────────────────────────
function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div style={{ fontSize: 13, color: '#DC2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 9, padding: '9px 14px', marginBottom: 14 }}>
      {message}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORMS
// ═══════════════════════════════════════════════════════════════════════════════

// ── PG Listing ────────────────────────────────────────────────────────────────
function PGForm({ user, onSuccess }) {
  const [f, setF] = useState({ name: '', rent: '', deposit: '', gender: 'unisex', occupancy: 'single', food: 'none', amenities: '', contact: '', address: '', description: '', images: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name || !f.rent) { setError('Name and rent are required.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.from('pg_listings').insert({
      owner_id: user.id,
      status: 'pending',
      title: f.name,
      rent: parseInt(f.rent),
      deposit: f.deposit ? parseInt(f.deposit) : null,
      gender: f.gender,
      occupancy: f.occupancy || 'single',
      food_included: f.food !== 'none',
      amenities: f.amenities.split(',').map(s => s.trim()).filter(Boolean),
      address: f.address,
      contact_phone: f.contact,
      description: f.description,
      images: f.images,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onSuccess('PG listing published!');
  };

  return (
    <form onSubmit={submit}>
      <ErrorBox message={error} />
      <ImageUploader bucket="pg-listings" folder={user.id} value={f.images} onChange={imgs => setF(p => ({ ...p, images: imgs }))} />
      <Input label="PG / Hostel Name" required value={f.name} onChange={set('name')} placeholder="e.g. Green Valley PG" />
      <Row>
        <Input label="Monthly Rent (₹)" required type="number" value={f.rent} onChange={set('rent')} placeholder="8000" />
        <Input label="Deposit (₹)" type="number" value={f.deposit} onChange={set('deposit')} placeholder="16000" />
      </Row>
      <Row>
        <Select label="Gender" value={f.gender} onChange={set('gender')}>
          <option value="unisex">Any</option>
          <option value="male">Male only</option>
          <option value="female">Female only</option>
        </Select>
        <Select label="Occupancy" value={f.occupancy} onChange={set('occupancy')}>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="triple">Triple</option>
        </Select>
      </Row>
      <Row>
        <Select label="Food" value={f.food} onChange={set('food')}>
          <option value="none">No food</option>
          <option value="veg">Veg meals</option>
          <option value="both">Veg + Non-veg</option>
        </Select>
      </Row>
      <Input label="Address" required value={f.address} onChange={set('address')} placeholder="12, 5th Cross, Spice Garden, Bommanahalli" />
      <Input label="Amenities (comma-separated)" value={f.amenities} onChange={set('amenities')} placeholder="WiFi, AC, Washing Machine, Parking" />
      <Input label="Owner Contact" value={f.contact} onChange={set('contact')} placeholder="+91 98765 43210" />
      <Textarea label="Description" rows={3} value={f.description} onChange={set('description')} placeholder="Describe the property, location, nearby landmarks…" />
      <SubmitBtn loading={loading} label="Publish PG Listing" />
    </form>
  );
}

// ── Community Post ────────────────────────────────────────────────────────────
const CHANNELS = ['general', 'announcements', 'rides', 'events', 'roommates', 'buy-sell', 'sports', 'lost-found', 'help', 'jobs'];

function CommunityForm({ user, onSuccess }) {
  const [f, setF] = useState({ channel: 'general', title: '', content: '', anon: false, images: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!f.title.trim()) { setError('Title is required.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.from('community_posts').insert({
      user_id: user.id, channel_slug: f.channel,
      title: f.title.trim(), content: f.content.trim() || null,
      is_anonymous: f.anon, images: f.images,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onSuccess('Community post published!');
  };

  return (
    <form onSubmit={submit}>
      <ErrorBox message={error} />
      <Select label="Channel" required value={f.channel} onChange={set('channel')}>
        {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
      </Select>
      <Input label="Title" required value={f.title} onChange={set('title')} maxLength={120} placeholder="What's on your mind?" />
      <Textarea label="Description" rows={4} value={f.content} onChange={set('content')} placeholder="Add more details, links, context…" />
      <ImageUploader bucket="community" folder={user.id} value={f.images} onChange={imgs => setF(p => ({ ...p, images: imgs }))} label="Images (optional)" max={4} />
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer', fontSize: 13.5, color: MUTED }}>
        <div
          onClick={() => setF(p => ({ ...p, anon: !p.anon }))}
          style={{ width: 40, height: 22, borderRadius: 999, background: f.anon ? PRIMARY : 'rgba(109,74,255,0.12)', position: 'relative', transition: 'background 0.22s', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{ position: 'absolute', top: 2, left: f.anon ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', transition: 'left 0.22s' }} />
        </div>
        Post anonymously
      </label>
      <SubmitBtn loading={loading} label="Publish Post" />
    </form>
  );
}

// ── Ride Share ────────────────────────────────────────────────────────────────
function RideForm({ user, onSuccess }) {
  const [f, setF] = useState({ from: '', to: '', date: '', time: '', seats: '1', vehicle: '', price: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!f.from || !f.to || !f.date) { setError('From, To and Date are required.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.from('rides').insert({
      user_id: user.id, from_location: f.from, to_location: f.to,
      ride_date: f.date, ride_time: f.time || null,
      seats_available: parseInt(f.seats),
      vehicle_type: f.vehicle || null,
      price_per_seat: f.price ? parseFloat(f.price) : null,
      notes: f.notes || null,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onSuccess('Ride published!');
  };

  return (
    <form onSubmit={submit}>
      <ErrorBox message={error} />
      <Row>
        <Input label="From" required value={f.from} onChange={set('from')} placeholder="Koramangala, Bangalore" />
        <Input label="To" required value={f.to} onChange={set('to')} placeholder="Whitefield, Bangalore" />
      </Row>
      <Row>
        <Input label="Date" required type="date" value={f.date} onChange={set('date')} />
        <Input label="Time" type="time" value={f.time} onChange={set('time')} />
      </Row>
      <Row>
        <Input label="Seats Available" type="number" min="1" max="8" value={f.seats} onChange={set('seats')} />
        <Input label="Vehicle Type" value={f.vehicle} onChange={set('vehicle')} placeholder="Car, Bike, Auto…" />
      </Row>
      <Input label="Price per Seat (₹)" type="number" value={f.price} onChange={set('price')} placeholder="0 = free" />
      <Textarea label="Notes" rows={2} value={f.notes} onChange={set('notes')} placeholder="Luggage allowed? Pickup point? Any preferences?" />
      <SubmitBtn loading={loading} label="Post Ride" />
    </form>
  );
}

// ── Event ─────────────────────────────────────────────────────────────────────
function EventForm({ user, onSuccess }) {
  const [f, setF] = useState({ title: '', description: '', date: '', time: '', venue: '', capacity: '', category: 'meetup', images: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!f.title || !f.date) { setError('Title and date are required.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.from('events').insert({
      user_id: user.id, title: f.title, description: f.description || null,
      event_date: f.date, event_time: f.time || null,
      venue: f.venue || null,
      capacity: f.capacity ? parseInt(f.capacity) : null,
      category: f.category, images: f.images,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onSuccess('Event created!');
  };

  return (
    <form onSubmit={submit}>
      <ErrorBox message={error} />
      <ImageUploader bucket="events" folder={user.id} value={f.images} onChange={imgs => setF(p => ({ ...p, images: imgs }))} label="Event Banner" max={3} />
      <Input label="Event Title" required value={f.title} onChange={set('title')} placeholder="Saturday Startup Meetup" />
      <Textarea label="Description" rows={3} value={f.description} onChange={set('description')} placeholder="What's happening? Who should attend?" />
      <Row>
        <Input label="Date" required type="date" value={f.date} onChange={set('date')} />
        <Input label="Time" type="time" value={f.time} onChange={set('time')} />
      </Row>
      <Input label="Venue" value={f.venue} onChange={set('venue')} placeholder="Indiranagar Social, Bangalore" />
      <Row>
        <Input label="Capacity" type="number" value={f.capacity} onChange={set('capacity')} placeholder="50" />
        <Select label="Category" value={f.category} onChange={set('category')}>
          {['meetup','workshop','party','sports','cultural','other'].map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
      </Row>
      <SubmitBtn loading={loading} label="Create Event" />
    </form>
  );
}

// ── Marketplace ───────────────────────────────────────────────────────────────
function MarketplaceForm({ user, onSuccess }) {
  const [f, setF] = useState({ title: '', description: '', price: '', condition: 'good', category: 'electronics', images: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!f.title || !f.price) { setError('Title and price are required.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.from('marketplace_listings').insert({
      user_id: user.id, title: f.title, description: f.description || null,
      price: parseFloat(f.price), condition: f.condition,
      category: f.category, images: f.images,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onSuccess('Item listed!');
  };

  return (
    <form onSubmit={submit}>
      <ErrorBox message={error} />
      <ImageUploader bucket="marketplace" folder={user.id} value={f.images} onChange={imgs => setF(p => ({ ...p, images: imgs }))} label="Item Photos" />
      <Input label="Title" required value={f.title} onChange={set('title')} placeholder="iPhone 13 Pro Max 256GB" />
      <Textarea label="Description" rows={3} value={f.description} onChange={set('description')} placeholder="Condition details, reason for selling, accessories included…" />
      <Row>
        <Input label="Price (₹)" required type="number" value={f.price} onChange={set('price')} placeholder="45000" />
        <Select label="Condition" value={f.condition} onChange={set('condition')}>
          {['brand_new','like_new','good','fair','for_parts'].map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
        </Select>
      </Row>
      <Select label="Category" value={f.category} onChange={set('category')}>
        {['electronics','furniture','clothing','books','vehicles','sports','appliances','other'].map(c => <option key={c} value={c}>{c}</option>)}
      </Select>
      <SubmitBtn loading={loading} label="List Item" />
    </form>
  );
}

// ── Roommate ──────────────────────────────────────────────────────────────────
function RoommateForm({ user, onSuccess }) {
  const [f, setF] = useState({ budget: '', move_in: '', occupation: '', lifestyle: '', gender_pref: 'any', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!f.budget) { setError('Budget is required.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.from('roommate_listings').insert({
      user_id: user.id,
      budget: parseInt(f.budget),
      move_in_date: f.move_in || null,
      occupation: f.occupation || null,
      lifestyle: f.lifestyle || null,
      gender_preference: f.gender_pref,
      description: f.description || null,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onSuccess('Roommate request posted!');
  };

  return (
    <form onSubmit={submit}>
      <ErrorBox message={error} />
      <Row>
        <Input label="Budget (₹/month)" required type="number" value={f.budget} onChange={set('budget')} placeholder="12000" />
        <Input label="Move-in Date" type="date" value={f.move_in} onChange={set('move_in')} />
      </Row>
      <Row>
        <Input label="Occupation" value={f.occupation} onChange={set('occupation')} placeholder="Software Engineer, Student…" />
        <Select label="Gender Preference" value={f.gender_pref} onChange={set('gender_pref')}>
          <option value="any">Any</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Select>
      </Row>
      <Input label="Lifestyle" value={f.lifestyle} onChange={set('lifestyle')} placeholder="Non-smoker, Early riser, Pet-friendly…" />
      <Textarea label="About You & What You're Looking For" rows={4} value={f.description} onChange={set('description')} placeholder="Tell potential roommates about yourself and your ideal living situation…" />
      <SubmitBtn loading={loading} label="Post Request" />
    </form>
  );
}

// ── Shop ──────────────────────────────────────────────────────────────────────
const SHOP_CATEGORIES = ['tiffin','laundry','cafe','restaurant','medical','salon','printing','electronics','repair','grocery','pharmacy','stationery','services','other'];

function ShopForm({ user, onSuccess }) {
  const [f, setF] = useState({ name: '', category: 'cafe', address: '', phone: '', website: '', timings: '', description: '', images: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name || !f.category) { setError('Business name and category are required.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.from('shops').insert({
      user_id: user.id, name: f.name, category: f.category,
      address: f.address || null, phone: f.phone || null,
      website: f.website || null, timings: f.timings || null,
      description: f.description || null, images: f.images,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onSuccess('Shop listed!');
  };

  return (
    <form onSubmit={submit}>
      <ErrorBox message={error} />
      <ImageUploader bucket="shops" folder={user.id} value={f.images} onChange={imgs => setF(p => ({ ...p, images: imgs }))} label="Shop Photos" />
      <Input label="Business Name" required value={f.name} onChange={set('name')} placeholder="Ananya Tiffin Service" />
      <Select label="Category" required value={f.category} onChange={set('category')}>
        {SHOP_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
      </Select>
      <Input label="Address" value={f.address} onChange={set('address')} placeholder="12, 5th Cross, Koramangala, Bangalore" />
      <Row>
        <Input label="Phone" value={f.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
        <Input label="Website / Social" value={f.website} onChange={set('website')} placeholder="instagram.com/shop" />
      </Row>
      <Input label="Timings" value={f.timings} onChange={set('timings')} placeholder="Mon–Sat 8am–9pm, Sun 10am–6pm" />
      <Textarea label="Description" rows={3} value={f.description} onChange={set('description')} placeholder="What you offer, specialities, delivery available?" />
      <SubmitBtn loading={loading} label="List Shop" />
    </form>
  );
}

// ── Gym ───────────────────────────────────────────────────────────────────────
const GYM_FACILITIES = ['AC','Locker Room','Parking','Personal Trainer','CrossFit','Cardio Zone','Strength Zone','Steam Room','Yoga Studio','Women-Only Section'];

function GymForm({ user, onSuccess }) {
  const [f, setF] = useState({ name: '', address: '', phone: '', website: '', timings: '', description: '', trainer_name: '', trainer_info: '', facilities: [], monthly: '', quarterly: '', annual: '', images: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const toggleFac = fac => setF(p => ({ ...p, facilities: p.facilities.includes(fac) ? p.facilities.filter(x => x !== fac) : [...p.facilities, fac] }));

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name) { setError('Gym name is required.'); return; }
    setLoading(true); setError('');
    const plans = [];
    if (f.monthly)     plans.push({ name: 'Monthly',     price: parseInt(f.monthly),     duration: '1 month' });
    if (f.quarterly)   plans.push({ name: 'Quarterly',   price: parseInt(f.quarterly),   duration: '3 months' });
    if (f.annual)      plans.push({ name: 'Annual',      price: parseInt(f.annual),      duration: '12 months' });

    const { error: err } = await supabase.from('gyms').insert({
      user_id: user.id, name: f.name,
      address: f.address || null, phone: f.phone || null,
      website: f.website || null, timings: f.timings || null,
      description: f.description || null,
      trainer_name: f.trainer_name || null, trainer_info: f.trainer_info || null,
      facilities: f.facilities, membership_plans: plans, images: f.images,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onSuccess('Gym listed!');
  };

  return (
    <form onSubmit={submit}>
      <ErrorBox message={error} />
      <ImageUploader bucket="gyms" folder={user.id} value={f.images} onChange={imgs => setF(p => ({ ...p, images: imgs }))} label="Gym Photos" />
      <Input label="Gym Name" required value={f.name} onChange={set('name')} placeholder="FitZone Pro" />
      <Input label="Address" value={f.address} onChange={set('address')} placeholder="3rd Floor, Nexus Mall, HSR Layout, Bangalore" />
      <Row>
        <Input label="Phone" value={f.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
        <Input label="Website" value={f.website} onChange={set('website')} placeholder="fitzonepro.com" />
      </Row>
      <Input label="Timings" value={f.timings} onChange={set('timings')} placeholder="5am – 11pm daily" />

      <Field label="Membership Prices (₹)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[['monthly','Monthly'],['quarterly','Quarterly'],['annual','Annual']].map(([k,l]) => (
            <div key={k}>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>{l}</div>
              <input style={inputStyle} type="number" value={f[k]} onChange={set(k)} placeholder="₹" onFocus={e => e.target.style.borderColor='rgba(109,74,255,0.45)'} onBlur={e => e.target.style.borderColor=BORDER} />
            </div>
          ))}
        </div>
      </Field>

      <Field label="Facilities">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {GYM_FACILITIES.map(fac => (
            <button
              key={fac} type="button"
              onClick={() => toggleFac(fac)}
              style={{
                padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 500,
                border: f.facilities.includes(fac) ? `1.5px solid ${PRIMARY}` : `1.5px solid ${BORDER}`,
                background: f.facilities.includes(fac) ? 'rgba(109,74,255,0.1)' : INPUT_BG,
                color: f.facilities.includes(fac) ? PRIMARY : MUTED,
                cursor: 'pointer', transition: 'all 0.18s',
              }}
            >{fac}</button>
          ))}
        </div>
      </Field>

      <Row>
        <Input label="Head Trainer Name" value={f.trainer_name} onChange={set('trainer_name')} placeholder="Rahul Sharma" />
        <Input label="Trainer Credentials" value={f.trainer_info} onChange={set('trainer_info')} placeholder="ACE Certified, 8 yrs exp." />
      </Row>
      <Textarea label="Description" rows={3} value={f.description} onChange={set('description')} placeholder="What makes your gym stand out?" />
      <SubmitBtn loading={loading} label="List Gym" />
    </form>
  );
}

// ─── Form registry ────────────────────────────────────────────────────────────
const FORMS = {
  pg:          PGForm,
  community:   CommunityForm,
  ride:        RideForm,
  event:       EventForm,
  marketplace: MarketplaceForm,
  roommate:    RoommateForm,
  shop:        ShopForm,
  gym:         GymForm,
};

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE PICKER
// ═══════════════════════════════════════════════════════════════════════════════
function TypePicker({ onSelect }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: TEXT, marginBottom: 6, textAlign: 'center' }}>
        What would you like to post?
      </div>
      <div style={{ fontSize: 13.5, color: MUTED, textAlign: 'center', marginBottom: 28 }}>
        Choose a category to get started
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {POST_TYPES.map(type => (
          <motion.button
            key={type.id}
            onClick={() => onSelect(type.id)}
            whileHover={{ y: -4, boxShadow: `0 12px 36px ${type.color}22` }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: SURFACE,
              border: `1.5px solid ${BORDER}`,
              borderRadius: 16, padding: '18px 16px',
              cursor: 'pointer', textAlign: 'left',
              transition: 'border-color 0.2s',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = type.color + '55'}
            onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
          >
            <div style={{ fontSize: 30, lineHeight: 1 }}>{type.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 700, color: TEXT }}>{type.title}</div>
            <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>{type.desc}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT MODAL
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * UniversalPost — reusable modal.
 *
 * The component resets its inner step-state every time isOpen flips to true,
 * so re-opening always starts at the type-picker.
 */
export default function UniversalPost({ isOpen, onClose, onSuccess, user, defaultType = null }) {
  const [selected, setSelected] = useState(null);
  const [toast, showToast] = useToast();

  // Reset to type-picker (or defaultType) whenever the modal opens
  const prevOpen = useRef(false);
  if (isOpen && !prevOpen.current) setSelected(defaultType);
  prevOpen.current = isOpen;

  const handleSuccess = (msg, type) => {
    showToast(msg, 'success');
    // Give the toast a moment to appear, then notify parent and close
    setTimeout(() => {
      onSuccess?.(type ?? selected);
      onClose();
    }, 1200);
  };

  const FormComponent = selected ? FORMS[selected] : null;
  const typeInfo = POST_TYPES.find(t => t.id === selected);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="up-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(15,10,40,0.55)',
              backdropFilter: 'blur(6px)',
              zIndex: 800,
            }}
          />

          {/* Panel scroll container — clicks on the gap also close */}
          <motion.div
            key="up-panel"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 801,
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              padding: '24px 16px', overflowY: 'auto',
            }}
          >
            {/* Card — stop propagation so clicks inside don't close */}
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: selected ? 560 : 740,
                background: SURFACE,
                border: `1.5px solid ${BORDER}`,
                borderRadius: 24,
                padding: '28px 28px 32px',
                boxShadow: '0 32px 80px rgba(109,74,255,0.18)',
                transition: 'max-width 0.3s ease',
                // Ensure card sits above its scroll container
                position: 'relative',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {selected && (
                    <button
                      onClick={() => setSelected(null)}
                      style={{ background: 'rgba(109,74,255,0.08)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >←</button>
                  )}
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: TEXT }}>
                    {typeInfo ? `${typeInfo.icon} ${typeInfo.title}` : '✏️ Create Post'}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  style={{ background: 'rgba(109,74,255,0.07)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >×</button>
              </div>

              {/* Body — type picker or selected form */}
              <AnimatePresence mode="wait">
                {!selected ? (
                  <motion.div
                    key="picker"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.22 }}
                  >
                    <TypePicker onSelect={setSelected} />
                  </motion.div>
                ) : (
                  <motion.div
                    key={selected}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.22 }}
                  >
                    <FormComponent
                      user={user}
                      onSuccess={(msg) => handleSuccess(msg, selected)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Toast — rendered outside the card so it's never clipped */}
          <AnimatePresence>
            {toast && <Toast key="toast" message={toast.message} type={toast.type} />}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
