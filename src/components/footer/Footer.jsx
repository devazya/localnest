export default function Footer({ onNavigate }) {
  const cols = [
    { title:'Explore',   links:[['PG Listings','pgs'],['Shops','shops'],['Gyms','gyms'],['Events','events'],['Buy/Sell','buysell']] },
    { title:'Community', links:[['Community Feed','community'],['Ride Share','rideshare'],['Roommates','roommates'],['Post Listing','home']] },
    { title:'Company',   links:[['About LocalNest','home'],['Contact Us','home'],['Report Issue','home'],['Advertise','home']] },
  ];

  return (
    <footer style={{ background:'#fff', borderTop:'1px solid rgba(109,74,255,0.09)', padding:'48px 24px 32px', marginTop:64 }}>
      <div style={{ maxWidth:'var(--page-max)', margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40, marginBottom:40 }}>
          {/* Brand */}
          <div>
            <button onClick={() => onNavigate('home')} style={{ display:'flex', alignItems:'center', gap:9, background:'none', border:'none', cursor:'pointer', marginBottom:14, padding:0 }}>
              <div style={{ width:30, height:30, background:'var(--primary)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 3px 10px rgba(109,74,255,0.35)' }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 6V14H10V10H6V14H2V6L8 1Z" fill="#fff"/></svg>
              </div>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17, color:'var(--text-primary)' }}>
                Local<span style={{ color:'var(--primary)' }}>Nest</span>
              </span>
            </button>
            <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7, maxWidth:260 }}>
              The premium hyperlocal platform for Spice Garden. Find PGs, discover shops, share rides, and connect with your community.
            </p>
          </div>

          {cols.map(col => (
            <div key={col.title}>
              <div style={{ fontSize:10.5, fontWeight:700, color:'var(--text-muted)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:14 }}>{col.title}</div>
              {col.links.map(([label, route]) => (
                <div key={label} style={{ marginBottom:9 }}>
                  <span
                    onClick={() => onNavigate(route)}
                    style={{ fontSize:13, color:'var(--text-secondary)', cursor:'pointer', transition:'color 0.18s' }}
                    onMouseEnter={e => e.target.style.color='var(--primary)'}
                    onMouseLeave={e => e.target.style.color='var(--text-secondary)'}
                  >{label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ borderTop:'1px solid rgba(109,74,255,0.08)', paddingTop:20, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>© 2026 LocalNest · Built with ❤️ for Spice Garden</div>
          <div style={{ display:'flex', gap:20 }}>
            {['Privacy','Terms','Safety'].map(l => (
              <span key={l} style={{ fontSize:12, color:'var(--text-muted)', cursor:'pointer', transition:'color 0.18s' }}
                onMouseEnter={e => e.target.style.color='var(--primary)'}
                onMouseLeave={e => e.target.style.color='var(--text-muted)'}
              >{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
