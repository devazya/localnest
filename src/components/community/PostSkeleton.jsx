/**
 * PostSkeleton.jsx — Community module
 * Loading skeleton placeholder for the post feed.
 */

export default function PostSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[1, 2].map(i => (
        <div key={i} style={{ background: '#fff', borderRadius: 18, padding: 18, boxShadow: '0 2px 20px rgba(109,74,255,0.07)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: 130, height: 13, borderRadius: 6, marginBottom: 7 }} />
              <div className="skeleton" style={{ width: 80, height: 11, borderRadius: 6 }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: 18, borderRadius: 6, marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 13, borderRadius: 6, width: '75%' }} />
        </div>
      ))}
    </div>
  );
}
