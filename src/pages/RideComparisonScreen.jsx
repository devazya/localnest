/**
 * RideComparisonScreen.jsx
 * ---------------------------------------------------------------------
 * Full-screen "Compare Rides" destination — opened automatically the
 * moment a destination is selected in the Smart Ride command palette
 * (AddressSearchSheet → SmartRideSection), no separate "Compare Rides"
 * button in between.
 *
 * LAYOUT
 * One section per provider, cheapest provider first (lowest "from ₹"
 * fare), so the best deal is always what the user sees at the top.
 * Each provider's vehicle options are a horizontally-scrollable row of
 * cards, cheapest option first within the row too — the user swipes
 * sideways within a provider's row to see all its vehicle types, then
 * scrolls down to the next (pricier) provider.
 *
 * DATA
 * Real fare data (live pricing, ETAs from provider APIs) is explicitly
 * out of scope for this build — see project brief ("Do NOT implement
 * ride APIs / price comparison / fare prediction"). The prices below are
 * clearly-labelled estimates so the screen is honest about what it is.
 * Swapping in live fares later means replacing FALLBACK_FARES with a
 * real API call — the section-per-provider / horizontal-row layout and
 * the provider list itself (getEnabledRideProviders, backend-driven,
 * never hardcoded) don't need to change.
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getEnabledRideProviders } from '../services/smartRide';

/* Fallback provider list + logo styling, used only while ride_providers
   is empty/unconfigured in Supabase. */
const FALLBACK_PROVIDERS = [
  { id: 'uber',      name: 'Uber',        logoBg: '#000000', logoColor: '#ffffff', logo: 'U' },
  { id: 'ola',       name: 'Ola',         logoBg: '#22C55E', logoColor: '#ffffff', logo: 'O' },
  { id: 'namma',     name: 'Namma Yatri', logoBg: '#FDBA21', logoColor: '#111111', logo: 'N' },
  { id: 'rapido',    name: 'Rapido',      logoBg: '#F59E0B', logoColor: '#ffffff', logo: 'R' },
];

/* Estimated fares — clearly placeholder, keyed by provider id. */
const FALLBACK_FARES = {
  uber:   [
    { type: 'UberGo',  eta: '3 min', price: 120 },
    { type: 'Sedan',   eta: '5 min', price: 180 },
    { type: 'UberXL',  eta: '8 min', price: 240 },
    { type: 'Uber Auto', eta: '2 min', price: 78 },
  ],
  ola: [
    { type: 'Mini',  eta: '4 min', price: 110 },
    { type: 'Prime', eta: '6 min', price: 165 },
    { type: 'Auto',  eta: '2 min', price: 85 },
    { type: 'Bike',  eta: '1 min', price: 45 },
  ],
  namma: [
    { type: 'Auto',      eta: '3 min', price: 72 },
    { type: 'Cab Non-AC', eta: '6 min', price: 145 },
    { type: 'Cab AC',     eta: '7 min', price: 168 },
  ],
  rapido: [
    { type: 'Bike', eta: '2 min', price: 40 },
    { type: 'Auto', eta: '3 min', price: 80 },
    { type: 'Cab',  eta: '5 min', price: 115 },
  ],
};

function ProviderRow({ provider, fares, index }) {
  const cheapest = fares.length ? fares[0].price : null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: 26 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', marginBottom: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: provider.logoBg, color: provider.logoColor,
          display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 900,
          fontFamily: 'var(--font-display)', boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}>
          {provider.logo_url
            ? <img src={provider.logo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            : provider.logo}
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#0D0820', fontFamily: 'var(--font-display)' }}>{provider.name}</div>
        {index === 0 && (
          <div style={{ fontSize: 10, fontWeight: 800, color: '#059669', background: 'rgba(5,150,105,0.12)', padding: '3px 8px', borderRadius: 99, letterSpacing: 0.3 }}>
            CHEAPEST
          </div>
        )}
        {cheapest != null && (
          <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#059669', background: 'rgba(5,150,105,0.1)', padding: '4px 10px', borderRadius: 99 }}>
            from ₹{cheapest}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingLeft: 20, paddingRight: 20, paddingBottom: 4, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {fares.map((f) => (
          <div key={f.type} style={{
            flexShrink: 0, width: 128, background: '#ffffff', borderRadius: 18,
            border: '1px solid rgba(109,74,255,0.08)', padding: '14px 14px 12px',
            boxShadow: '0 6px 20px rgba(109,74,255,0.08)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0D0820', marginBottom: 6 }}>{f.type}</div>
            <div style={{ fontSize: 11.5, color: '#9CA3AF', marginBottom: 10 }}>{f.eta} away</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#6D4AFF', fontFamily: 'var(--font-display)' }}>₹{f.price}</div>
          </div>
        ))}
        <div style={{ width: 4, flexShrink: 0 }} />
      </div>
    </motion.section>
  );
}

function fareKeyFor(name, id) {
  if (/uber/i.test(name)) return 'uber';
  if (/ola/i.test(name)) return 'ola';
  if (/namma/i.test(name)) return 'namma';
  if (/rapido/i.test(name)) return 'rapido';
  return id;
}

export default function RideComparisonScreen({ onNavigate, destination, latitude, longitude }) {
  const [providers, setProviders] = useState(FALLBACK_PROVIDERS);

  useEffect(() => {
    let cancelled = false;
    getEnabledRideProviders().then((list) => {
      if (cancelled || !list.length) return;
      setProviders(list);
    });
    return () => { cancelled = true; };
  }, []);

  // Attach each provider's fares (sorted cheapest-first within the row),
  // then order the providers themselves by their cheapest fare — the
  // best overall deal always appears at the top of the page.
  const rows = providers
    .map((p) => {
      const key = fareKeyFor(p.name, p.id);
      const fares = [...(FALLBACK_FARES[key] || [])].sort((a, b) => a.price - b.price);
      return { provider: p, fares };
    })
    .filter((r) => r.fares.length > 0)
    .sort((a, b) => a.fares[0].price - b.fares[0].price);

  return (
    <div style={{ background: '#F8F7FF', minHeight: '100vh', paddingBottom: 'calc(var(--bottom-nav-h) + var(--safe-bottom) + 24px)' }}>
      {/* ── Header ── */}
      <div style={{ background: '#ffffff', padding: '18px 20px 16px', borderBottom: '1px solid rgba(109,74,255,0.06)' }}>
        <button
          onClick={() => onNavigate('home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, color: '#6D4AFF', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-sans)' }}
        >
          ← Back
        </button>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>Comparing rides to</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: '#0D0820', fontFamily: 'var(--font-display)', letterSpacing: -0.3 }}>
          📍 {destination || 'your destination'}
        </div>
      </div>

      <div style={{ padding: '20px 0 4px' }}>
        {rows.map((r, i) => (
          <ProviderRow key={r.provider.id} provider={r.provider} fares={r.fares} index={i} />
        ))}
      </div>

      <div style={{ padding: '4px 20px 0', fontSize: 11.5, color: '#B3ABD1', textAlign: 'center' }}>
        Estimated fares for reference — live pricing from ride providers is coming soon.
      </div>
    </div>
  );
}
