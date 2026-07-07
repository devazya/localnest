/**
 * ActivityCenter.jsx — Activity Center & Settings (Segment 8)
 * Full-screen module opened from the Community bell icon. Owns the
 * overlay-routing state (Settings → Notification Preferences / Weekly
 * Recap / Filters / Quiet Hours) and composes the smaller pieces in this
 * folder. All data comes from useActivityCenter (Supabase — no mock data).
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActivityCenter } from '../../hooks/useActivityCenter';
import { BellOutlineIcon, MenuHamburgerIcon } from './icons';
import CommunityPulseCard from './CommunityPulseCard';
import ActivityFeedItem from './ActivityFeedItem';
import SettingsMenu from './SettingsMenu';
import NotificationPreferences from './NotificationPreferences';
import WeeklyRecap from './WeeklyRecap';
import ActivityFilterSheet, { DEFAULT_FILTERS } from './ActivityFilterSheet';
import QuietHours from './QuietHours';
import { COLORS, TABS, TAB_TYPE_MAP } from './constants';

export default function ActivityCenter({ userId, onClose }) {
  const {
    activities, stats, settings, loading, error, unreadCount,
    markAllRead, patchSettings, toggleNotificationPreference,
  } = useActivityCenter(userId);

  const [screen, setScreen] = useState('main'); // main | settings | notifications | recap | filters | quietHours
  const [activeTab, setActiveTab] = useState('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    let list = activities;
    const typeFilter = TAB_TYPE_MAP[activeTab];
    if (typeFilter) list = list.filter((a) => typeFilter.includes(a.type));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((a) => a.content?.toLowerCase().includes(q) || a.actor?.full_name?.toLowerCase().includes(q));
    }
    if (filters.show === 'unread') list = list.filter((a) => !a.is_read);
    if (filters.show === 'mentions') list = list.filter((a) => a.type === 'mention');
    return list;
  }, [activities, activeTab, query, filters.show]);

  const handleQuickMute = () => patchSettings({ quiet_hours_enabled: true });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 400, background: COLORS.background, display: 'flex', flexDirection: 'column' }}
    >
      <style>{`
        .ln-no-scrollbar::-webkit-scrollbar { display: none; }
        .ln-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes ln-activity-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 18px 8px', flexShrink: 0 }}>
        {!searchOpen ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginLeft: -4 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.textPrimary} strokeWidth="2.2"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <span style={{ fontSize: 21, fontWeight: 700, color: COLORS.textPrimary, fontFamily: 'var(--font-display)' }}>Activity</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.textPrimary} strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              </button>
              <div style={{ position: 'relative' }}>
                <BellOutlineIcon size={20} color={COLORS.textPrimary} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: -6, right: -7, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999, background: COLORS.error, color: '#fff', fontSize: 9.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <button onClick={() => setScreen('settings')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <MenuHamburgerIcon size={20} color={COLORS.textPrimary} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={COLORS.textSecondary} strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search activity..."
              style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontSize: 14.5, color: COLORS.textPrimary }}
            />
            <button onClick={() => { setQuery(''); setSearchOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.textSecondary} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* ── Pill tabs ── */}
      <div style={{ display: 'flex', gap: 8, padding: '0 18px 12px', overflowX: 'auto', flexShrink: 0 }} className="ln-no-scrollbar">
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
                background: active ? undefined : COLORS.surface,
                backgroundImage: active ? 'linear-gradient(135deg, #6D4AFF, #9B6AFF)' : undefined,
                color: active ? '#fff' : COLORS.textSecondary,
                boxShadow: active ? '0 4px 14px rgba(109,74,255,0.28)' : 'none',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <CommunityPulseCard stats={stats} onOpenRecap={() => setScreen('recap')} />

        <div style={{ padding: '0 18px 24px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
              <motion.div
                animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                style={{ width: 30, height: 30, borderRadius: '50%', border: `3px solid ${COLORS.softLavender}`, borderTopColor: COLORS.primary }}
              />
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: COLORS.textSecondary, fontSize: 13.5 }}>{error}</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.textPrimary, marginBottom: 6 }}>You're all caught up</div>
              <div style={{ fontSize: 13, color: COLORS.textSecondary }}>New mentions, replies and alerts from your neighbourhood will show up here.</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textSecondary }}>Today</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: COLORS.primary, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Mark all read</button>
                )}
              </div>
              <AnimatePresence initial={false}>
                {filtered.map((a, i) => <ActivityFeedItem key={a.id} activity={a} index={i} />)}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {screen === 'settings' && (
          <SettingsMenu
            onClose={() => setScreen('main')}
            onNavigate={setScreen}
            onMarkAllRead={markAllRead}
            onQuickMute={handleQuickMute}
            unreadCount={unreadCount}
          />
        )}
        {screen === 'notifications' && (
          <NotificationPreferences
            onBack={() => setScreen('settings')}
            preferences={settings?.notification_preferences}
            onToggle={toggleNotificationPreference}
          />
        )}
        {screen === 'recap' && <WeeklyRecap onBack={() => setScreen('settings')} stats={stats} />}
        {screen === 'quietHours' && (
          <QuietHours onBack={() => setScreen('settings')} settings={settings} onUpdate={patchSettings} />
        )}
        {screen === 'filters' && (
          <ActivityFilterSheet onClose={() => setScreen('main')} filters={filters} onChange={setFilters} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
