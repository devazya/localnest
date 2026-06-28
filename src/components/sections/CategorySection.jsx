import { motion } from 'framer-motion';

const CATEGORIES = [
  { id: 'pgs',       icon: '🏠', label: 'PG Rooms',    count: '42+',  color: '#6D4AFF', bg: 'rgba(109,74,255,0.1)' },
  { id: 'shops',     icon: '🛍️', label: 'Shops',       count: '120+', color: '#059669', bg: 'rgba(5,150,105,0.1)' },
  { id: 'gyms',      icon: '🏋️', label: 'Gyms',        count: '8+',   color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
  { id: 'buysell',   icon: '🏷️', label: 'Buy & Sell',  count: '200+', color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
  { id: 'events',    icon: '📅', label: 'Events',      count: '12+',  color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  { id: 'rideshare', icon: '🚗', label: 'Rides',       count: '14+',  color: '#0284C7', bg: 'rgba(2,132,199,0.1)' },
  { id: 'roommates', icon: '🛏️', label: 'Roommates',   count: '30+',  color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
  { id: 'community', icon: '👥', label: 'Community',   count: 'Live', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
];

export default function CategorySection({ onNavigate }) {
  return (
    <section style={{ padding: '32px 0 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Browse</div>
            <h2 className="section-title">Explore <span className="accent">nearby</span></h2>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
        }}>
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.id}
              onClick={() => onNavigate && onNavigate(cat.id)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.94 }}
              whileHover={{ y: -3, boxShadow: `0 12px 28px ${cat.color}22` }}
              style={{
                background: '#fff',
                border: `1.5px solid ${cat.color}1A`,
                borderRadius: 18,
                padding: '18px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'box-shadow 0.2s',
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: cat.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                {cat.icon}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.2 }}>
                {cat.label}
              </span>
              <span style={{ fontSize: 10.5, color: cat.color, fontWeight: 700 }}>
                {cat.count}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) {
          /* already 4 col, looks fine */
        }
        @media (max-width: 479px) {
          /* 4 col is tight but workable at 320px+ */
        }
      `}</style>
    </section>
  );
}
