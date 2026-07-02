import React from 'react';

export default function ResidentSuggestionRail({ viewerId }) {
  return (
    <div style={{ margin: '18px 0 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0D0820' }}>People you may know</div>
      <div style={{ fontSize: 13, color: '#6B7280' }}>
        Suggestions will appear here soon{viewerId ? ' for this resident' : ''}.
      </div>
    </div>
  );
}
