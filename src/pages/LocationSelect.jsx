import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PrimaryButton from '../components/ui/PrimaryButton';

const POPULAR_LOCALITIES = [
  { id: 1, name: 'HSR Layout',   city: 'Bangalore' },
  { id: 2, name: 'Koramangala',  city: 'Bangalore' },
  { id: 3, name: 'Indiranagar',  city: 'Bangalore' },
  { id: 4, name: 'JP Nagar',     city: 'Bangalore' },
  { id: 5, name: 'Whitefield',   city: 'Bangalore' },
];

const DEFAULT_LOCATION = { name: 'Green Sector', city: 'Bangalore' };

function PinIcon({ color = '#6D4CFF', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#C4C4C4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  );
}

export default function LocationSelect({ onDone }) {
  const [query, setQuery]           = useState('');
  const [selected, setSelected]     = useState(DEFAULT_LOCATION);

  const filtered = POPULAR_LOCALITIES.filter(l =>
    l.name.toLowerCase().includes(query.toLowerCase())
  );

  const stagger = (i) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: 0.05 + i * 0.05 },
  });

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    }}>
      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '56px 24px 120px', boxSizing: 'border-box' }}>

        {/* Back button */}
        <motion.button
          onClick={onDone}
          whileTap={{ scale: 0.92 }}
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#F5F5F7', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', marginBottom: 24,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#1D1D1F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </motion.button>

        {/* Title */}
        <motion.h1
          {...stagger(0)}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28, fontWeight: 700,
            color: '#1D1D1F', letterSpacing: -0.5,
            lineHeight: '34px', margin: '0 0 24px',
          }}
        >
          Select your locality
        </motion.h1>

        {/* Search bar */}
        <motion.div {...stagger(1)} style={{ marginBottom: 28 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#F5F5F7', border: '1.5px solid #ECECEC',
            borderRadius: 14, padding: '0 14px', height: 50,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search locality, city..."
              style={{
                flex: 1, border: 'none', background: 'transparent',
                fontSize: 15, color: '#1D1D1F', outline: 'none',
                fontFamily: 'var(--font-sans)',
              }}
            />
            {query.length > 0 && (
              <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>
        </motion.div>

        {/* Current Location */}
        <motion.div {...stagger(2)} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>
            Current location
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(DEFAULT_LOCATION)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              background: selected.name === DEFAULT_LOCATION.name ? 'rgba(109,76,255,0.04)' : '#FAFAFA',
              border: `1.5px solid ${selected.name === DEFAULT_LOCATION.name ? 'rgba(109,76,255,0.2)' : '#ECECEC'}`,
              borderRadius: 16, padding: '14px 16px', cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              transition: 'border-color 0.2s, background 0.2s',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'rgba(109,76,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PinIcon color="#6D4CFF" size={18} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1D1D1F', lineHeight: 1.3 }}>
                {DEFAULT_LOCATION.name}
              </div>
              <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 2 }}>
                {DEFAULT_LOCATION.city}
              </div>
            </div>
            <ChevronRight />
          </motion.button>
        </motion.div>

        {/* Popular Localities */}
        <motion.div {...stagger(3)}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#1D1D1F', marginBottom: 14, fontFamily: 'var(--font-display)' }}>
            Popular localities
          </div>
          <div style={{
            background: '#FAFAFA', border: '1.5px solid #ECECEC',
            borderRadius: 18, overflow: 'hidden',
          }}>
            <AnimatePresence>
              {filtered.map((loc, i) => {
                const isSelected = selected.name === loc.name;
                const isLast = i === filtered.length - 1;
                return (
                  <motion.button
                    key={loc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => setSelected(loc)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                      background: isSelected ? 'rgba(109,76,255,0.04)' : 'transparent',
                      border: 'none',
                      borderBottom: isLast ? 'none' : '1px solid #ECECEC',
                      transition: 'background 0.18s',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: isSelected ? 'rgba(109,76,255,0.12)' : 'rgba(109,76,255,0.07)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.18s',
                    }}>
                      <PinIcon color={isSelected ? '#6D4CFF' : '#A78BFF'} size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 15, fontWeight: isSelected ? 700 : 600,
                        color: isSelected ? '#6D4CFF' : '#1D1D1F',
                        lineHeight: 1.3, transition: 'color 0.18s',
                      }}>
                        {loc.name}
                      </div>
                      <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 2 }}>
                        {loc.city}
                      </div>
                    </div>
                    <ChevronRight />
                  </motion.button>
                );
              })}
              {filtered.length === 0 && (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                  No localities found
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ── Fixed bottom button ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(to top, #fff 80%, rgba(255,255,255,0))',
        padding: '16px 24px 32px',
        boxSizing: 'border-box',
      }}>
        <PrimaryButton label="Confirm Location" onClick={onDone} />
      </div>
    </div>
  );
}
