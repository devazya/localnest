/**
 * CommunityLayout.jsx — Community module
 * Root page shell: 100dvh layout, safe-area/mobile-height handling,
 * and the global keyframe styles the rest of the page relies on.
 * Only existing implementation moved — no visual changes.
 */

import { KEYFRAMES } from './constants';

export default function CommunityLayout({ children }) {
  return (
    <div className="ln-community-root" style={{ height: '100dvh', background: '#FFFFFF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{KEYFRAMES}</style>
      <style>{`
        /* The global mobile rule (main > div { padding-bottom: var(--bottom-nav-h) ... })
           was stacking on top of this page's own 100dvh layout and pushing the
           General-chat composer below the fold. This page manages its own scroll
           regions and reserves space for the bottom nav internally, so cancel that
           rule specifically when Community is the active page. */
        @media (max-width: 959px) {
          main > div:has(.ln-community-root) { padding-bottom: 0 !important; }
        }
      `}</style>
      {children}
    </div>
  );
}
