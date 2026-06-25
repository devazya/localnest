export default function Footer({ onNavigate }) {
  const cols = [
    { title: 'Explore',   links: ['PG Listings','Shops','Gyms','Events','Buy/Sell'] },
    { title: 'Community', links: ['Community Feed','Ride Share','Roommate Finder','Post a Listing'] },
    { title: 'Company',   links: ['About LocalNest','Contact Us','Report Issue','Advertise'] },
  ];

  return (
    <footer
  style={{
    background: 'rgba(255,255,255,0.35)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderTop: '1px solid rgba(109,74,255,0.12)',
    boxShadow: '0 -8px 32px rgba(109,74,255,0.08)',
    padding: '48px 24px 28px',
    marginTop: '80px',
  }}
>
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <button onClick={() => onNavigate('home')} style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', marginBottom:14 }}>
              <div style={{ width:32, height:32, background:'linear-gradient(135deg,#6EE7B7,#34D399)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 6V14H10V10H6V14H2V6L8 1Z" fill="#0F1115"/></svg>
              </div>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, color:'var(--text-primary)' }}>
                Local<span style={{ color:'var(--green)' }}>Nest</span>
              </span>
            </button>
            <p style={{ fontSize:13.5, color:'var(--text-muted)', lineHeight:1.65, maxWidth:280 }}>
              The premium hyperlocal platform for Green Sector. Find PGs, discover shops, share rides, and connect with your community.
            </p>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:16 }}>{col.title}</div>
              {col.links.map(l => (
                <div key={l} style={{ marginBottom:10 }}>
                  <span style={{ fontSize:13.5, color:'var(--text-secondary)', cursor:'pointer', transition:'color 0.2s' }}
                    onMouseEnter={e=>e.target.style.color='var(--text-primary)'}
                    onMouseLeave={e=>e.target.style.color='var(--text-secondary)'}
                  >{l}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:20, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div style={{ fontSize:12.5, color:'var(--text-muted)' }}> © 2026 LocalNest · Built with ❤️ by Devazya</div>
          <div style={{ display:'flex', gap:20 }}>
            {['Privacy Policy','Terms of Use','Safety'].map(l => (
              <span key={l} style={{ fontSize:12.5, color:'var(--text-muted)', cursor:'pointer', transition:'color 0.2s' }}
                onMouseEnter={e=>e.target.style.color='var(--text-primary)'}
                onMouseLeave={e=>e.target.style.color='var(--text-muted)'}
              >{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
