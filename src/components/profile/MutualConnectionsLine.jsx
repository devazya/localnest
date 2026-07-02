/**
 * MutualConnectionsLine.jsx — Social Interaction Layer (Segment 5.3)
 * "Followed by Rahul and 3 others" — renders only when mutuals exist.
 * Data comes from services/social.fetchMutualConnections (client-side
 * intersection over two lightweight follower queries — no new tables).
 */
import { useEffect, useState } from 'react';
import { fetchMutualConnections } from '../../services/social';

export default function MutualConnectionsLine({ viewerId, targetId }) {
  const [mutual, setMutual] = useState({ names: [], total: 0 });

  useEffect(() => {
    let cancelled = false;
    if (!viewerId || !targetId || viewerId === targetId) { setMutual({ names: [], total: 0 }); return; }
    fetchMutualConnections(viewerId, targetId).then(r => { if (!cancelled) setMutual(r); });
    return () => { cancelled = true; };
  }, [viewerId, targetId]);

  if (mutual.total === 0) return null;

  const [first, ...rest] = mutual.names;
  const othersCount = mutual.total - 1;
  const label = othersCount > 0
    ? `Followed by ${first} and ${othersCount} other${othersCount === 1 ? '' : 's'}`
    : `Followed by ${first}`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <span style={{ fontSize: 11.5, color: '#9CA3AF', fontWeight: 500 }}>{label}</span>
    </div>
  );
}
