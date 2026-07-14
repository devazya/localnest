/**
 * SavedLibrary.jsx — "My Saved"
 * Unified Saved Library opened from the Home header bookmark icon.
 * Consumes the single, polymorphic `saved_items` table via
 * savedItems.getSavedLibrary() — groups are generated dynamically from
 * whatever item_types are present, nothing here is hardcoded. Adding a
 * new saveable content type anywhere in the app makes its group appear
 * here automatically, with zero changes to this file.
 */
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSavedLibrary, unsaveItem } from '../services/savedItems';

// Display labels/icons per item_type. Purely cosmetic — a type missing
// here still renders (falls back to a titleized item_type), it just won't
// have a custom icon/label yet.
const GROUP_META = {
  business: { label: 'Businesses', icon: '🏪' },
  event: { label: 'Events & Activities', icon: '📅' },
  offer: { label: 'Offers', icon: '🏷️' },
  marketplace_item: { label: 'Marketplace', icon: '🛍️' },
  pg_listing: { label: 'Stay / PGs', icon: '🏠' },
  roommate_listing: { label: 'Roommates', icon: '🧑‍🤝‍🧑' },
  ride: { label: 'Rides', icon: '🚗' },
  discussion: { label: 'Community', icon: '💬' },
  community_post: { label: 'Community Posts', icon: '📣' },
  movie: { label: 'Movies', icon: '🎬' },
};

function titleize(s) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function SavedCard({ entry, onRemove, onNavigate }) {
  const { card } = entry;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      style={{
        display: 'flex', gap: 12, alignItems: 'center', padding: 12,
        borderRadius: 'var(--radius-lg)', background: 'var(--card-solid)',
        boxShadow: 'var(--shadow-card)', cursor: card.href ? 'pointer' : 'default',
        opacity: card.unavailable ? 0.5 : 1,
      }}
      onClick={() => card.href && !card.unavailable && onNavigate?.(card.href)}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 'var(--radius-md)', flexShrink: 0,
        background: card.image ? `url(${card.image}) center/cover` : 'var(--primary-dim)',
        display: 'grid', placeItems: 'center', overflow: 'hidden',
      }}>
        {!card.image && <span style={{ fontSize: 20 }}>{GROUP_META[entry.itemType]?.icon || '🔖'}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {card.title}
        </div>
        {card.subtitle && (
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {card.subtitle}
          </div>
        )}
        {card.unavailable && (
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>No longer available</div>
        )}
      </div>
      <button
        type="button"
        aria-label="Remove from Saved"
        onClick={(e) => { e.stopPropagation(); onRemove(entry); }}
        style={{
          width: 32, height: 32, borderRadius: '50%', border: 'none', flexShrink: 0,
          background: 'var(--primary-dim)', display: 'grid', placeItems: 'center', cursor: 'pointer',
        }}
      >
        <Bookmark size={15} fill="var(--primary)" color="var(--primary)" />
      </button>
    </motion.div>
  );
}

export default function SavedLibrary({ onNavigate }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState(null); // null = loading
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const load = useCallback(() => {
    if (!user?.id) { setGroups([]); return; }
    setError(null);
    getSavedLibrary(user.id).then(setGroups).catch((e) => setError(e.message || 'Failed to load'));
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleRemove = async (entry) => {
    setGroups((prev) => prev?.map((g) => (
      g.itemType === entry.itemType ? { ...g, items: g.items.filter((i) => i.savedItemId !== entry.savedItemId) } : g
    )).filter((g) => g.items.length > 0));
    try {
      await unsaveItem(user.id, entry.itemType, entry.itemId);
    } catch {
      load(); // resync on failure rather than leave an inconsistent view
    }
  };

  const visibleGroups = groups?.filter((g) => activeTab === 'all' || g.itemType === activeTab) || [];
  const totalCount = groups?.reduce((n, g) => n + g.items.length, 0) || 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 96 }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg)',
        padding: '16px var(--page-pad) 12px', borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: groups?.length ? 12 : 0 }}>
          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            aria-label="Back"
            style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--primary-dim)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          >
            <ChevronLeft size={18} color="var(--primary)" />
          </button>
          <h1 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>My Saved</h1>
          {totalCount > 0 && (
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)', marginLeft: 'auto' }}>{totalCount} saved</span>
          )}
        </div>

        {groups?.length > 0 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {[{ itemType: 'all', label: 'All' }, ...groups.map((g) => ({
              itemType: g.itemType,
              label: `${GROUP_META[g.itemType]?.label || titleize(g.itemType)} (${g.items.length})`,
            }))].map((tab) => (
              <button
                key={tab.itemType}
                type="button"
                onClick={() => setActiveTab(tab.itemType)}
                style={{
                  flexShrink: 0, padding: '7px 14px', borderRadius: 'var(--radius-full)', border: 'none',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: activeTab === tab.itemType ? 'var(--primary)' : 'var(--primary-dim)',
                  color: activeTab === tab.itemType ? '#fff' : 'var(--primary)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '16px var(--page-pad)' }}>
        {!user?.id && (
          <EmptyState icon="🔒" title="Sign in to see your Saved Library" subtitle="Bookmarks sync across your devices once you're signed in." />
        )}

        {user?.id && groups === null && <LoadingState />}

        {user?.id && error && (
          <EmptyState icon="⚠️" title="Couldn't load your saved items" subtitle={error} />
        )}

        {user?.id && groups !== null && !error && groups.length === 0 && (
          <EmptyState icon="🔖" title="Nothing saved yet" subtitle="Tap the bookmark icon on any card — a business, event, offer, and more — to add it here." />
        )}

        <AnimatePresence>
          {visibleGroups.map((group) => (
            <div key={group.itemType} style={{ marginBottom: 24 }}>
              {activeTab === 'all' && (
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                  {GROUP_META[group.itemType]?.icon} {GROUP_META[group.itemType]?.label || titleize(group.itemType)}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.items.map((entry) => (
                  <SavedCard key={entry.savedItemId} entry={entry} onRemove={handleRemove} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ height: 80, borderRadius: 'var(--radius-lg)', background: 'var(--primary-dim)', opacity: 0.6 }} />
      ))}
    </div>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13.5, maxWidth: 320, margin: '0 auto' }}>{subtitle}</div>}
    </div>
  );
}
