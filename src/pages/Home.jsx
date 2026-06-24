import { motion } from 'framer-motion';
import Hero from '../components/hero/Hero';
import { PG_DATA, SHOP_DATA, GYM_DATA, COMMUNITY_POSTS, EVENT_DATA, LOCAL_PULSE, POST_TYPE_CONFIG } from '../data/index';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
});

/* ─── Shared UI atoms ─── */
function SectionHeader({ eyebrow, title, accent, subtitle, onSeeAll }) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <div className="section-eyebrow">{eyebrow}</div>}
        <h2 className="section-title">
          {title}{accent && <> <span className="accent">{accent}</span></>}
        </h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {onSeeAll && (
        <button className="see-all-btn" onClick={onSeeAll}>
          See all
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      )}
    </div>
  );
}

/* ─── PG Card ─── */
function PGCard({ pg }) {
  return (
    <div style={{
      background: 'rgba(32,36,45,0.85)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'all 0.28s ease',
      cursor: 'pointer',
      backdropFilter: 'blur(10px)',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.borderColor='rgba(110,231,183,0.22)'; e.currentTarget.style.boxShadow='0 20px 48px rgba(0,0,0,0.45)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow=''; }}
    >
      {/* Image */}
      <div style={{ height: 185, position: 'relative', overflow: 'hidden' }}>
        {pg.image
          ? <img src={pg.image} alt={pg.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <div style={{ height:'100%', background:'linear-gradient(135deg,#1a2332,#0d1520)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48, opacity:0.3 }}>🏠</div>
        }
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(32,36,45,1) 0%, transparent 55%)' }} />
        <div style={{ position:'absolute', top:12, left:12, display:'flex', gap:6, flexWrap:'wrap' }}>
          {pg.sponsored && <span className="badge badge-amber">⭐ Sponsored</span>}
          {pg.vacancy
            ? <span className="badge badge-green">✓ Available</span>
            : <span className="badge badge-red">Full</span>}
          {pg.verified && <span className="badge badge-muted">✓ Verified</span>}
        </div>
        <div style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(8px)', borderRadius:'50%', width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, cursor:'pointer' }}>♡</div>
      </div>

      {/* Body */}
      <div style={{ padding:'16px 18px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8, gap:8 }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:600, color:'var(--text-primary)', lineHeight:1.3 }}>{pg.name}</div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--green)' }}>₹{pg.rent.toLocaleString()}</div>
            <div style={{ fontSize:10, color:'var(--text-muted)' }}>/month</div>
          </div>
        </div>
        <div style={{ fontSize:12.5, color:'var(--text-muted)', marginBottom:10, display:'flex', alignItems:'center', gap:4 }}>
          📍 {pg.location} · {pg.distance}
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
          {[pg.gender, pg.furnishing, pg.occupancy].map(m => (
            <span key={m} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, padding:'2px 9px', fontSize:11.5, color:'var(--text-secondary)' }}>{m}</span>
          ))}
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
          {pg.amenities.slice(0,4).map(a => (
            <span key={a} style={{ background:'rgba(110,231,183,0.06)', border:'1px solid rgba(110,231,183,0.12)', borderRadius:5, padding:'2px 8px', fontSize:11, color:'var(--green)' }}>{a}</span>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ fontSize:12.5, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ color:'#F59E0B', fontWeight:600 }}>★ {pg.rating}</span> ({pg.reviews})
          </div>
          <button style={{ flex:1, background:'linear-gradient(135deg,#6EE7B7,#34D399)', color:'#0F1115', border:'none', padding:'8px 16px', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
            onMouseLeave={e=>e.currentTarget.style.opacity='1'}
          >View Details</button>
          <button style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-secondary)', padding:'8px 13px', borderRadius:9, fontSize:13, cursor:'pointer', transition:'all 0.2s' }}>📞</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Shop Card ─── */
function ShopCard({ shop }) {
  return (
    <div style={{ background:'rgba(32,36,45,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:18, backdropFilter:'blur(10px)', cursor:'pointer', transition:'all 0.25s ease', display:'flex', gap:14 }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(110,231,183,0.2)';e.currentTarget.style.transform='translateY(-3px)';}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.transform='';}}
    >
      <div style={{ width:48, height:48, background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.15)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
        {shop.category === 'Cafe' ? '☕' : shop.category === 'Laundry' ? '👕' : shop.category === 'Pharmacy' ? '💊' : shop.category === 'Grocery' ? '🛒' : shop.category === 'Printing' ? '🖨' : '🍱'}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
          <div style={{ fontWeight:600, fontSize:14.5, color:'var(--text-primary)' }}>{shop.name}</div>
          <span style={{ fontSize:11, fontWeight:600, color: shop.isOpen ? 'var(--green)' : 'var(--red)', background: shop.isOpen ? 'rgba(110,231,183,0.1)' : 'rgba(251,113,133,0.1)', padding:'2px 8px', borderRadius:999, flexShrink:0 }}>
            {shop.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
        <div style={{ fontSize:12.5, color:'var(--text-muted)', marginBottom:6 }}>{shop.description}</div>
        <div style={{ display:'flex', gap:12, fontSize:12, color:'var(--text-muted)' }}>
          <span>📍 {shop.distance}</span>
          <span>⏰ {shop.hours}</span>
          <span style={{ color:'#F59E0B' }}>★ {shop.rating}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Community Post Card ─── */
function PostCard({ post }) {
  const cfg = POST_TYPE_CONFIG[post.type] || POST_TYPE_CONFIG.help;
  return (
    <div style={{ background:'rgba(32,36,45,0.8)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:18, backdropFilter:'blur(10px)', cursor:'pointer', transition:'all 0.25s ease' }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(110,231,183,0.18)';e.currentTarget.style.transform='translateY(-2px)';}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.transform='';}}
    >
      {post.pinned && <div style={{ fontSize:11, color:'var(--amber)', marginBottom:8, fontWeight:600 }}>📌 Pinned</div>}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ width:36, height:36, background:'rgba(110,231,183,0.15)', border:'1px solid rgba(110,231,183,0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--green)' }}>{post.avatar}</div>
          <div>
            <div style={{ fontSize:13.5, fontWeight:600, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:5 }}>
              {post.author}
              {post.verified && <span style={{ fontSize:10, color:'var(--green)' }}>✓</span>}
            </div>
            <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>{post.time}</div>
          </div>
        </div>
        <span style={{ fontSize:10.5, fontWeight:600, color:cfg.color, background:cfg.bg, padding:'3px 10px', borderRadius:999 }}>{cfg.label}</span>
      </div>
      <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', marginBottom:6, lineHeight:1.4 }}>{post.title}</div>
      <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.55, marginBottom:12, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{post.content}</div>
      <div style={{ display:'flex', gap:14, fontSize:12.5, color:'var(--text-muted)' }}>
        <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:12.5 }}>♡ {post.likes}</button>
        <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:12.5 }}>💬 {post.comments}</button>
      </div>
    </div>
  );
}

/* ─── Event Card ─── */
function EventCard({ event }) {
  const colors = { Sports:'var(--blue)', Social:'var(--purple)', Meetup:'var(--amber)' };
  return (
    <div style={{ background:'rgba(32,36,45,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 20px', backdropFilter:'blur(10px)', cursor:'pointer', transition:'all 0.25s ease', display:'flex', gap:16, alignItems:'flex-start' }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(110,231,183,0.2)';e.currentTarget.style.transform='translateY(-3px)';}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.transform='';}}
    >
      <div style={{ textAlign:'center', minWidth:48 }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color: colors[event.type] || 'var(--green)', lineHeight:1 }}>{event.date.split(', ')[1]?.split(' ')[1] || '28'}</div>
        <div style={{ fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.5 }}>{event.date.split(', ')[0]}</div>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:14.5, color:'var(--text-primary)', marginBottom:4 }}>{event.title}</div>
        <div style={{ fontSize:12.5, color:'var(--text-muted)', marginBottom:8, display:'flex', gap:10 }}>
          <span>🕐 {event.time}</span>
          <span>📍 {event.location}</span>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <span style={{ fontSize:12, color:'var(--text-secondary)' }}>👥 {event.attending} going</span>
          {event.contribution && <span style={{ fontSize:11, color:'var(--amber)', background:'rgba(245,158,11,0.1)', padding:'2px 8px', borderRadius:999 }}>{event.contribution}</span>}
        </div>
      </div>
      <button style={{ background:'rgba(110,231,183,0.08)', border:'1px solid rgba(110,231,183,0.2)', color:'var(--green)', padding:'7px 14px', borderRadius:9, fontSize:12.5, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>Join</button>
    </div>
  );
}

/* ─── Home Page ─── */
export default function Home({ onNavigate }) {
  const featuredPGs = PG_DATA.filter(p => p.featured).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <Hero onNavigate={onNavigate} />

      <div style={{ height: 40 }} />

      {/* Featured PGs */}
      <motion.section className="ln-section" {...fadeUp(0)}>
        <SectionHeader
          eyebrow="ACCOMMODATION"
          title="Featured"
          accent="PG Listings"
          subtitle="Verified stays near you — ready to move in"
          onSeeAll={() => onNavigate('pgs')}
        />
        <div className="cards-grid cards-grid-3">
          {featuredPGs.map((pg, i) => (
            <motion.div key={pg.id} {...fadeUp(i * 0.08)}>
              <PGCard pg={pg} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      <div className="section-divider" />

      {/* Local Shops */}
      <motion.section className="ln-section" {...fadeUp(0)}>
        <SectionHeader
          eyebrow="NEARBY"
          title="Local"
          accent="Shops & Services"
          subtitle="Everything your locality needs, steps away"
          onSeeAll={() => onNavigate('shops')}
        />
        <div className="cards-grid cards-grid-2">
          {SHOP_DATA.slice(0, 4).map((shop, i) => (
            <motion.div key={shop.id} {...fadeUp(i * 0.07)}>
              <ShopCard shop={shop} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      <div className="section-divider" />

      {/* Community + Events side by side */}
      <motion.section className="ln-section" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start' }} {...fadeUp(0)}>
        {/* Community */}
        <div>
          <SectionHeader
            eyebrow="COMMUNITY"
            title="What's"
            accent="happening"
            onSeeAll={() => onNavigate('community')}
          />
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {COMMUNITY_POSTS.slice(0, 3).map((post, i) => (
              <motion.div key={post.id} {...fadeUp(i * 0.07)}>
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Events */}
        <div>
          <SectionHeader
            eyebrow="EVENTS"
            title="This"
            accent="Weekend"
            onSeeAll={() => onNavigate('events')}
          />
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {EVENT_DATA.map((ev, i) => (
              <motion.div key={ev.id} {...fadeUp(i * 0.07)}>
                <EventCard event={ev} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="section-divider" />

      {/* CTA Banner */}
      <motion.section className="ln-section" {...fadeUp(0)}>
        <motion.div style={{
          background:'linear-gradient(135deg, rgba(110,231,183,0.1) 0%, rgba(52,211,153,0.05) 100%)',
          border:'1px solid rgba(110,231,183,0.2)',
          borderRadius:20,
          padding:'48px 40px',
          textAlign:'center',
          position:'relative',
          overflow:'hidden',
        }}>
          <div style={{ position:'absolute', top:-80, left:'50%', transform:'translateX(-50%)', width:500, height:300, background:'radial-gradient(ellipse, rgba(110,231,183,0.12) 0%, transparent 65%)', pointerEvents:'none' }} />
          <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(24px, 4vw, 38px)', fontWeight:700, color:'var(--text-primary)', letterSpacing:-1, marginBottom:12 }}>
            Got something to share with<br/>
            <span style={{ color:'var(--green)' }}>your community?</span>
          </div>
          <p style={{ fontSize:15, color:'var(--text-secondary)', marginBottom:28, maxWidth:460, margin:'0 auto 28px' }}>
            Post a PG listing, offer a ride, announce an event, or sell something — it takes 30 seconds.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => onNavigate('post')} style={{ background:'linear-gradient(135deg,#6EE7B7,#34D399)', color:'#0F1115', border:'none', padding:'12px 28px', borderRadius:11, fontSize:15, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(110,231,183,0.45)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}
            >+ Post Now</button>
            <button onClick={() => onNavigate('community')} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', color:'var(--text-secondary)', padding:'12px 28px', borderRadius:11, fontSize:15, fontWeight:500, cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.color='var(--text-primary)'}
              onMouseLeave={e=>e.currentTarget.style.color='var(--text-secondary)'}
            >Browse Community</button>
          </div>
        </motion.div>
      </motion.section>

      <div style={{ height: 32 }} />
    </div>
  );
}
