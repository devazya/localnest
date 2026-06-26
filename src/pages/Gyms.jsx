/**
 * Gyms.jsx — LocalNest Gym & Fitness Directory
 *
 * Features: featured gyms strip, filters (budget / facilities / rating / open-now),
 * search, grid/list toggle, gym cards, detail drawer with gallery + membership
 * plans + trainer cards + facilities grid, infinite scroll, skeletons, empty states.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase/client';

// ─── Constants ────────────────────────────────────────────────────────────────
const FACILITIES_LIST = [
  { id: 'AC',               icon: '❄️',  label: 'AC' },
  { id: 'Locker Room',      icon: '🔒',  label: 'Locker' },
  { id: 'Parking',          icon: '🅿️',  label: 'Parking' },
  { id: 'Personal Trainer', icon: '🧑‍🏫', label: 'PT' },
  { id: 'CrossFit',         icon: '🏋️',  label: 'CrossFit' },
  { id: 'Cardio Zone',      icon: '🏃',  label: 'Cardio' },
  { id: 'Strength Zone',    icon: '💪',  label: 'Strength' },
  { id: 'Steam Room',       icon: '🧖',  label: 'Steam' },
  { id: 'Yoga Studio',      icon: '🧘',  label: 'Yoga' },
  { id: 'Women-Only Section', icon: '♀️', label: 'Women-Only' },
];

const FAC_MAP = Object.fromEntries(FACILITIES_LIST.map(f => [f.id, f]));

const SORT_OPTIONS = [
  { key: 'newest',       label: '🕐 Newest' },
  { key: 'top_rated',    label: '⭐ Top Rated' },
  { key: 'most_reviews', label: '💬 Most Reviews' },
];

const BUDGET_OPTIONS = [
  { key: 'all',    label: 'Any Budget' },
  { key: 'budget', label: 'Under ₹1,500/mo' },
  { key: 'mid',    label: '₹1,500 – ₹3,000' },
  { key: 'premium', label: '₹3,000+' },
];

const PAGE_SIZE = 12;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  const d = (Date.now() - new Date(ts)) / 1000;
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function Stars({ rating, size = 13 }) {
  const r = Math.round(rating || 0);
  return (
    <span style={{ fontSize: size, color: '#F59E0B', letterSpacing: -1 }}>
      {'★'.repeat(r)}{'☆'.repeat(5 - r)}
    </span>
  );
}

function lowestPlan(plans = []) {
  if (!plans?.length) return null;
  return plans.reduce((min, p) => (!min || p.price < min.price ? p : min), null);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function GymSkeleton({ grid }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: grid ? 'repeat(auto-fill, minmax(290px, 1fr))' : '1fr',
      gap: 16,
    }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.82)', borderRadius: 18, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.7)' }}>
          {grid && <div style={{ height: 180, background: 'rgba(109,74,255,0.06)' }} />}
          <div style={{ padding: 18 }}>
            <div style={{ width: 160, height: 14, borderRadius: 7, background: 'rgba(109,74,255,0.08)', marginBottom: 8 }} />
            <div style={{ width: 100, height: 10, borderRadius: 5, background: 'rgba(109,74,255,0.05)', marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[1, 2, 3].map(j => <div key={j} style={{ width: 52, height: 24, borderRadius: 999, background: 'rgba(109,74,255,0.06)' }} />)}
            </div>
            <div style={{ width: '100%', height: 36, borderRadius: 9, background: 'rgba(109,74,255,0.05)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Facility Chip ────────────────────────────────────────────────────────────
function FacChip({ id, small }) {
  const f = FAC_MAP[id] || { icon: '✓', label: id };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: small ? '2px 8px' : '4px 10px',
      borderRadius: 999, fontSize: small ? 11 : 12, fontWeight: 500,
      background: 'rgba(109,74,255,0.07)',
      color: '#6D4AFF',
      border: '1px solid rgba(109,74,255,0.14)',
    }}>
      <span style={{ fontSize: small ? 10 : 12 }}>{f.icon}</span> {f.label}
    </span>
  );
}

// ─── Gym Card (Grid) ──────────────────────────────────────────────────────────
function GymCard({ gym, onSelect, isSaved, onToggleSave }) {
  const plan = lowestPlan(gym.membership_plans);

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(109,74,255,0.13)' }}
      style={{
        background: 'rgba(255,255,255,0.88)',
        border: '1.5px solid rgba(255,255,255,0.75)',
        borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
        backdropFilter: 'blur(14px)',
        boxShadow: '0 4px 18px rgba(109,74,255,0.07)',
        transition: 'box-shadow 0.22s',
      }}
      onClick={() => onSelect(gym)}
    >
      {/* Hero image */}
      <div style={{ height: 180, background: 'linear-gradient(135deg, rgba(109,74,255,0.1), rgba(143,123,255,0.05))', position: 'relative', overflow: 'hidden' }}>
        {gym.images?.[0]
          ? <img src={gym.images[0]} alt={gym.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>💪</div>
        }

        {/* Price bubble */}
        {plan && (
          <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(15,10,40,0.72)', backdropFilter: 'blur(6px)', borderRadius: 9, padding: '5px 11px', color: '#fff' }}>
            <span style={{ fontSize: 11, opacity: 0.75 }}>from </span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>₹{plan.price.toLocaleString()}</span>
            <span style={{ fontSize: 10, opacity: 0.7 }}>/mo</span>
          </div>
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 5 }}>
          {gym.is_featured && <span style={{ background: '#F59E0B', color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>★ Featured</span>}
          {gym.is_verified && <span style={{ background: '#059669', color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>✓ Verified</span>}
        </div>

        {/* Save */}
        <button
          onClick={e => { e.stopPropagation(); onToggleSave(gym.id); }}
          style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, backdropFilter: 'blur(4px)' }}
        >{isSaved ? '🔖' : '🤍'}</button>
      </div>

      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15.5, fontWeight: 700, color: '#1A1340', marginBottom: 4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{gym.name}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Stars rating={gym.rating} />
          <span style={{ fontSize: 12, color: '#6B7280' }}>{gym.rating ? gym.rating.toFixed(1) : '—'} ({gym.review_count || 0})</span>
        </div>

        {gym.address && (
          <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 8, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            📍 {gym.address}
          </div>
        )}

        {/* Facility chips — show up to 3 */}
        {gym.facilities?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {gym.facilities.slice(0, 3).map(f => <FacChip key={f} id={f} small />)}
            {gym.facilities.length > 3 && (
              <span style={{ fontSize: 11, color: '#9CA3AF', padding: '2px 6px' }}>+{gym.facilities.length - 3} more</span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          {gym.phone && (
            <a
              href={`tel:${gym.phone}`}
              onClick={e => e.stopPropagation()}
              style={{ flex: 1, background: 'rgba(109,74,255,0.08)', color: '#6D4AFF', border: 'none', borderRadius: 9, padding: '8px 0', fontSize: 12.5, fontWeight: 600, textAlign: 'center', cursor: 'pointer', textDecoration: 'none' }}
            >📞 Call</a>
          )}
          <button
            onClick={e => { e.stopPropagation(); onSelect(gym); }}
            style={{ flex: 1, background: '#6D4AFF', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 0', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
          >View Plans</button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Gym Row (List) ───────────────────────────────────────────────────────────
function GymRow({ gym, onSelect, isSaved, onToggleSave }) {
  const plan = lowestPlan(gym.membership_plans);

  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={() => onSelect(gym)}
      style={{
        background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.75)',
        borderRadius: 16, padding: '14px 18px', cursor: 'pointer',
        display: 'flex', gap: 14, alignItems: 'center',
        backdropFilter: 'blur(14px)', transition: 'box-shadow 0.2s',
      }}
    >
      <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: 'rgba(109,74,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
        {gym.images?.[0]
          ? <img src={gym.images[0]} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : '💪'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#1A1340', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{gym.name}</div>
          {gym.is_verified && <span style={{ fontSize: 10, background: '#059669', color: '#fff', padding: '1px 6px', borderRadius: 999, fontWeight: 700, flexShrink: 0 }}>✓</span>}
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 5 }}>
          {gym.address && `📍 ${gym.address}`}
          {gym.timings && ` · 🕐 ${gym.timings}`}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Stars rating={gym.rating} size={12} />
          <span style={{ fontSize: 11.5, color: '#6B7280' }}>{gym.review_count || 0} reviews</span>
          {plan && <span style={{ fontSize: 11.5, color: '#6D4AFF', fontWeight: 600 }}>from ₹{plan.price.toLocaleString()}/mo</span>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <button onClick={e => { e.stopPropagation(); onToggleSave(gym.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>{isSaved ? '🔖' : '🤍'}</button>
        {gym.phone && (
          <a href={`tel:${gym.phone}`} onClick={e => e.stopPropagation()} style={{ background: 'rgba(109,74,255,0.08)', color: '#6D4AFF', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>Call</a>
        )}
      </div>
    </motion.div>
  );
}

// ─── Gym Detail Drawer ────────────────────────────────────────────────────────
function GymDetail({ gym, onClose }) {
  const [imgIdx, setImgIdx] = useState(0);

  const planColors = ['#6D4AFF', '#059669', '#D97706'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(15,10,40,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ width: '100%', maxWidth: 500, height: 'calc(100vh - 40px)', background: 'rgba(255,255,255,0.98)', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(109,74,255,0.18)' }}
      >
        {/* Gallery */}
        <div style={{ position: 'relative', height: 240, background: 'linear-gradient(135deg, rgba(109,74,255,0.1), rgba(143,123,255,0.05))', flexShrink: 0 }}>
          {gym.images?.length > 0
            ? <img src={gym.images[imgIdx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>💪</div>
          }
          {gym.images?.length > 1 && (
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
              {gym.images.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)} style={{ width: 8, height: 8, borderRadius: '50%', background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', padding: 0 }} />
              ))}
            </div>
          )}
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          {gym.is_featured && <span style={{ position: 'absolute', top: 14, left: 14, background: '#F59E0B', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>★ Featured</span>}
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

          {/* Name + rating */}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 700, color: '#1A1340', marginBottom: 6 }}>{gym.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Stars rating={gym.rating} />
            <span style={{ fontSize: 13, color: '#6B7280' }}>{gym.rating ? `${gym.rating.toFixed(1)} · ` : ''}{gym.review_count || 0} reviews</span>
            {gym.is_verified && <span style={{ fontSize: 11, background: '#059669', color: '#fff', padding: '1px 7px', borderRadius: 999, fontWeight: 600 }}>✓ Verified</span>}
          </div>

          {/* Quick info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {gym.address && <InfoRow icon="📍" label="Address" value={gym.address} />}
            {gym.phone   && <InfoRow icon="📞" label="Phone"   value={gym.phone}   href={`tel:${gym.phone}`} />}
            {gym.website && <InfoRow icon="🌐" label="Website" value={gym.website} href={gym.website.startsWith('http') ? gym.website : `https://${gym.website}`} />}
            {gym.timings && <InfoRow icon="🕐" label="Hours"   value={gym.timings} />}
          </div>

          {gym.description && (
            <p style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.65, marginBottom: 22 }}>{gym.description}</p>
          )}

          {/* Membership Plans */}
          {gym.membership_plans?.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1340', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>💳 Membership Plans</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                {gym.membership_plans.map((plan, i) => (
                  <div key={i} style={{ background: `${planColors[i % planColors.length]}0D`, border: `1.5px solid ${planColors[i % planColors.length]}22`, borderRadius: 13, padding: '14px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{plan.name}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: planColors[i % planColors.length] }}>₹{plan.price?.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{plan.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Facilities */}
          {gym.facilities?.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1340', marginBottom: 10 }}>🏋️ Facilities</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {gym.facilities.map(f => <FacChip key={f} id={f} />)}
              </div>
            </div>
          )}

          {/* Trainer */}
          {gym.trainer_name && (
            <div style={{ marginBottom: 22, background: 'rgba(109,74,255,0.04)', border: '1.5px solid rgba(109,74,255,0.1)', borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1340', marginBottom: 6 }}>🧑‍🏫 Head Trainer</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1340', marginBottom: 2 }}>{gym.trainer_name}</div>
              {gym.trainer_info && <div style={{ fontSize: 12.5, color: '#6B7280' }}>{gym.trainer_info}</div>}
            </div>
          )}

          {/* CTA */}
          <div style={{ display: 'flex', gap: 10 }}>
            {gym.phone && (
              <a href={`tel:${gym.phone}`} style={{ flex: 1, background: '#6D4AFF', color: '#fff', border: 'none', borderRadius: 11, padding: '12px 0', fontSize: 14, fontWeight: 700, textAlign: 'center', textDecoration: 'none', display: 'block' }}>📞 Call Now</a>
            )}
            {gym.address && (
              <a href={`https://maps.google.com/?q=${encodeURIComponent(gym.address)}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: 'rgba(109,74,255,0.08)', color: '#6D4AFF', border: '1.5px solid rgba(109,74,255,0.2)', borderRadius: 11, padding: '12px 0', fontSize: 14, fontWeight: 700, textAlign: 'center', textDecoration: 'none', display: 'block' }}>🗺️ Directions</a>
            )}
          </div>

          <div style={{ marginTop: 14, fontSize: 11.5, color: '#9CA3AF', textAlign: 'right' }}>Listed {timeAgo(gym.created_at)}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoRow({ icon, label, value, href }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 1 }}>{label}</div>
        {href
          ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13.5, color: '#6D4AFF', fontWeight: 500, textDecoration: 'none' }}>{value}</a>
          : <div style={{ fontSize: 13.5, color: '#1A1340' }}>{value}</div>
        }
      </div>
    </div>
  );
}

// ─── Facility Filter Button ───────────────────────────────────────────────────
function FacFilter({ id, active, onToggle }) {
  const f = FAC_MAP[id] || { icon: '✓', label: id };
  return (
    <button
      onClick={() => onToggle(id)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 500,
        border: active ? '1.5px solid rgba(109,74,255,0.4)' : '1.5px solid rgba(109,74,255,0.12)',
        background: active ? 'rgba(109,74,255,0.1)' : 'rgba(255,255,255,0.8)',
        color: active ? '#6D4AFF' : '#6B7280',
        cursor: 'pointer', transition: 'all 0.18s', flexShrink: 0,
      }}
    >{f.icon} {f.label}</button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function Gyms({ onNavigate }) {
  const [gyms, setGyms]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage]       = useState(0);

  const [search, setSearch]           = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [sort, setSort]               = useState('newest');
  const [budget, setBudget]           = useState('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [activeFacs, setActiveFacs]   = useState([]);
  const [gridView, setGridView]       = useState(true);

  const [selected, setSelected] = useState(null);
  const [saved, setSaved]       = useState({});

  const loaderRef   = useRef(null);
  const searchTimer = useRef(null);

  // Debounced search
  const handleSearchChange = (v) => {
    setSearchDraft(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(v.trim()), 380);
  };

  const toggleFac = (id) =>
    setActiveFacs(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  // ── Query builder ─────────────────────────────────────────────────────────
  const buildQuery = useCallback((fromIdx) => {
    let q = supabase.from('gyms').select('*');

    if (onlyVerified) q = q.eq('is_verified', true);
    if (search)       q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`);

    // Facility filter — all selected facilities must be present
    activeFacs.forEach(fac => { q = q.contains('facilities', [fac]); });

    if (sort === 'newest')       q = q.order('created_at',    { ascending: false });
    if (sort === 'top_rated')    q = q.order('rating',        { ascending: false });
    if (sort === 'most_reviews') q = q.order('review_count',  { ascending: false });

    return q.range(fromIdx, fromIdx + PAGE_SIZE - 1);
  }, [onlyVerified, search, sort, activeFacs]);

  const fetchGyms = useCallback(async (reset = false) => {
    const fromIdx = reset ? 0 : page * PAGE_SIZE;
    if (reset) setLoading(true);
    const { data, error } = await buildQuery(fromIdx);

    if (!error) {
      let incoming = data || [];

      // Client-side budget filter (membership_plans is jsonb, hard to filter in SQL cleanly)
      if (budget !== 'all') {
        incoming = incoming.filter(g => {
          const plan = lowestPlan(g.membership_plans);
          if (!plan) return false;
          if (budget === 'budget')  return plan.price < 1500;
          if (budget === 'mid')     return plan.price >= 1500 && plan.price <= 3000;
          if (budget === 'premium') return plan.price > 3000;
          return true;
        });
      }

      if (reset) { setGyms(incoming); setPage(1); }
      else       { setGyms(p => [...p, ...incoming]); setPage(p => p + 1); }
      setHasMore((data || []).length === PAGE_SIZE);
    }

    setLoading(false);
    setInitialLoad(false);
  }, [buildQuery, page, budget]);

  useEffect(() => {
    setPage(0); setHasMore(true);
    fetchGyms(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, search, onlyVerified, activeFacs, budget]);

  // Infinite scroll
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) fetchGyms(false);
    }, { threshold: 0.1 });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading, fetchGyms]);

  const toggleSave = (id) => setSaved(p => ({ ...p, [id]: !p[id] }));

  const featuredGyms = gyms.filter(g => g.is_featured).slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #F8F7FF)' }}>

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg, rgba(109,74,255,0.08) 0%, rgba(143,123,255,0.03) 100%)', borderBottom: '1px solid rgba(109,74,255,0.08)', padding: '36px 24px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: '#6D4AFF', marginBottom: 6 }}>FITNESS DIRECTORY</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, color: '#1A1340', letterSpacing: -0.7, marginBottom: 4 }}>
            Gyms & <span style={{ color: '#6D4AFF' }}>Fitness</span>
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Find the perfect gym — filter by budget, facilities, and more</p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 560 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
            <input
              value={searchDraft}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search gyms by name, location…"
              style={{ width: '100%', padding: '12px 42px 12px 44px', background: 'rgba(255,255,255,0.95)', border: '1.5px solid rgba(109,74,255,0.14)', borderRadius: 12, fontSize: 14, color: '#1A1340', outline: 'none', boxSizing: 'border-box', boxShadow: '0 2px 12px rgba(109,74,255,0.08)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(109,74,255,0.14)'}
            />
            {searchDraft && <button onClick={() => { setSearchDraft(''); setSearch(''); }} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#9CA3AF' }}>×</button>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>

        {/* ── Facility filter strip ── */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
          {FACILITIES_LIST.map(f => (
            <FacFilter key={f.id} id={f.id} active={activeFacs.includes(f.id)} onToggle={toggleFac} />
          ))}
          {activeFacs.length > 0 && (
            <button onClick={() => setActiveFacs([])} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, border: '1.5px solid rgba(220,38,38,0.25)', background: 'rgba(220,38,38,0.05)', color: '#DC2626', cursor: 'pointer' }}>✕ Clear</button>
          )}
        </div>

        {/* ── Filter bar ── */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 9, border: '1.5px solid rgba(109,74,255,0.14)', background: 'rgba(255,255,255,0.9)', fontSize: 13, color: '#1A1340', outline: 'none', cursor: 'pointer' }}
          >
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>

          {/* Budget */}
          <select
            value={budget}
            onChange={e => setBudget(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 9, border: '1.5px solid rgba(109,74,255,0.14)', background: 'rgba(255,255,255,0.9)', fontSize: 13, color: '#1A1340', outline: 'none', cursor: 'pointer' }}
          >
            {BUDGET_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>

          {/* Verified */}
          <button
            onClick={() => setOnlyVerified(v => !v)}
            style={{ padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 500, border: onlyVerified ? '1.5px solid rgba(5,150,105,0.4)' : '1.5px solid rgba(109,74,255,0.14)', background: onlyVerified ? 'rgba(5,150,105,0.08)' : 'rgba(255,255,255,0.9)', color: onlyVerified ? '#059669' : '#6B7280', cursor: 'pointer', transition: 'all 0.18s' }}
          >✓ Verified Only</button>

          {/* Grid/List toggle */}
          <div style={{ marginLeft: 'auto', display: 'flex', background: 'rgba(109,74,255,0.06)', borderRadius: 9, padding: 3, gap: 2 }}>
            {[['grid', '⊞'], ['list', '≡']].map(([mode, icon]) => (
              <button key={mode} onClick={() => setGridView(mode === 'grid')} style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: (gridView ? 'grid' : 'list') === mode ? '#fff' : 'none', color: '#6D4AFF', cursor: 'pointer', fontSize: 15, boxShadow: (gridView ? 'grid' : 'list') === mode ? '0 1px 4px rgba(109,74,255,0.12)' : 'none', transition: 'all 0.18s' }}>{icon}</button>
            ))}
          </div>

          <div style={{ fontSize: 13, color: '#9CA3AF' }}>{gyms.length} {gyms.length === 1 ? 'gym' : 'gyms'}</div>
        </div>

        {/* ── Featured strip ── */}
        {!search && activeFacs.length === 0 && budget === 'all' && featuredGyms.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#F59E0B', marginBottom: 14 }}>★ Featured Gyms</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
              {featuredGyms.map(gym => (
                <GymCard key={gym.id} gym={gym} onSelect={setSelected} isSaved={!!saved[gym.id]} onToggleSave={toggleSave} />
              ))}
            </div>
            <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(109,74,255,0.1), transparent)', margin: '28px 0' }} />
          </div>
        )}

        {/* ── Main grid/list ── */}
        {initialLoad || (loading && gyms.length === 0) ? (
          <GymSkeleton grid={gridView} />
        ) : gyms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(255,255,255,0.78)', border: '1.5px solid rgba(109,74,255,0.1)', borderRadius: 20 }}
          >
            <div style={{ fontSize: 52, marginBottom: 14 }}>💪</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#1A1340', marginBottom: 8 }}>
              {search ? 'No gyms found' : 'No gyms listed yet'}
            </div>
            <div style={{ fontSize: 13.5, color: '#9CA3AF', marginBottom: 20 }}>
              {search || activeFacs.length > 0
                ? 'Try removing some filters'
                : 'Be the first to list your gym!'}
            </div>
            {activeFacs.length > 0 && (
              <button onClick={() => setActiveFacs([])} style={{ background: 'rgba(109,74,255,0.08)', color: '#6D4AFF', border: '1.5px solid rgba(109,74,255,0.2)', padding: '10px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', marginBottom: 12, marginRight: 8 }}>Clear Filters</button>
            )}
            <button onClick={() => onNavigate('post')} style={{ background: '#6D4AFF', color: '#fff', border: 'none', padding: '11px 26px', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,74,255,0.28)' }}>💪 List Your Gym</button>
          </motion.div>
        ) : (
          <div style={gridView
            ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 18 }
            : { display: 'flex', flexDirection: 'column', gap: 12 }
          }>
            {gyms.map(gym => gridView
              ? <GymCard key={gym.id} gym={gym} onSelect={setSelected} isSaved={!!saved[gym.id]} onToggleSave={toggleSave} />
              : <GymRow  key={gym.id} gym={gym} onSelect={setSelected} isSaved={!!saved[gym.id]} onToggleSave={toggleSave} />
            )}
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={loaderRef} style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
          {loading && gyms.length > 0 && (
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }} style={{ width: 7, height: 7, borderRadius: '50%', background: '#6D4AFF' }} />
              ))}
            </div>
          )}
          {!hasMore && gyms.length > 0 && !loading && (
            <div style={{ fontSize: 12.5, color: '#9CA3AF' }}>All gyms loaded ✓</div>
          )}
        </div>

        {/* Add CTA */}
        <div style={{ textAlign: 'center', padding: '32px 0 8px' }}>
          <button
            onClick={() => onNavigate('post')}
            style={{ background: 'rgba(109,74,255,0.08)', color: '#6D4AFF', border: '1.5px solid rgba(109,74,255,0.2)', padding: '11px 24px', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >💪 List Your Gym</button>
        </div>
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && <GymDetail gym={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
