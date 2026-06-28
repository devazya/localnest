import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Node definitions matching the mockup ───
   Positions are % of container (cx, cy)
   The design shows: PG top-center, GYM right, CAFE bottom-right,
   SHOPS bottom-center, EVENTS bottom-left (with pulse ring), RIDES left
*/
const NODES = [
  { id:'community', label:'COMMUNITY', icon:'👥', cx:50, cy:50, r:42, center:true,  color:'#6D4AFF', textColor:'#fff', route:'community' },
  { id:'pg',        label:'PG',        icon:'🏠', cx:55, cy:12, r:24, center:false, color:'#6D4AFF', textColor:'#374151', route:'pgs'       },
  { id:'gym',       label:'GYM',       icon:'🏋️', cx:85, cy:35, r:22, center:false, color:'#F59E0B', textColor:'#374151', route:'gyms'      },
  { id:'cafe',      label:'CAFE',      icon:'☕', cx:80, cy:72, r:21, center:false, color:'#10B981', textColor:'#374151', route:'shops'     },
  { id:'shop',      label:'SHOPS',     icon:'🛍️', cx:48, cy:86, r:22, center:false, color:'#EC4899', textColor:'#374151', route:'shops'     },
  { id:'events',    label:'EVENTS',    icon:'📅', cx:18, cy:70, r:23, center:false, color:'#EF4444', textColor:'#374151', route:'events',   pulse:true },
  { id:'rides',     label:'RIDES',     icon:'🚗', cx:14, cy:30, r:22, center:false, color:'#8B5CF6', textColor:'#374151', route:'rideshare' },
];

/* Edges: from community to each node, plus a couple side edges */
const EDGES = [
  { from:'community', to:'pg',     color:'rgba(109,74,255,0.35)' },
  { from:'community', to:'gym',    color:'rgba(245,158,11,0.45)' },
  { from:'community', to:'cafe',   color:'rgba(16,185,129,0.45)' },
  { from:'community', to:'shop',   color:'rgba(236,72,153,0.45)' },
  { from:'community', to:'events', color:'rgba(239,68,68,0.45)'  },
  { from:'community', to:'rides',  color:'rgba(139,92,246,0.45)' },
  { from:'pg',        to:'rides',  color:'rgba(109,74,255,0.2)'  },
  { from:'events',    to:'shop',   color:'rgba(239,68,68,0.2)'   },
];

export default function LocalityNetwork({ onNavigate, highlightNode }) {
  const wrapRef = useRef(null);
  const [dims, setDims] = useState({ w: 340, h: 276 });
  const [hovered, setHovered] = useState(null);
  const [activeId, setActiveId] = useState(null);

  /* Resize */
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0) setDims({ w: width, h: height || 276 });
    });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  /* Auto-cycle nodes */
  useEffect(() => {
    const outer = NODES.filter(n => !n.center).map(n => n.id);
    let i = 0;
    const iv = setInterval(() => {
      if (!hovered) { setActiveId(outer[i % outer.length]); i++; }
    }, 2200);
    return () => clearInterval(iv);
  }, [hovered]);

  /* Respond to live activity */
  useEffect(() => {
    if (highlightNode) setActiveId(highlightNode);
  }, [highlightNode]);

  /* Convert % → px */
  const pt = useCallback((n) => ({
    x: (n.cx / 100) * dims.w,
    y: (n.cy / 100) * dims.h,
  }), [dims]);

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, { ...n, ...pt(n) }]));
  const lit = hovered ?? activeId;

  const handleClick = useCallback((node) => {
    if (onNavigate && node.route) onNavigate(node.route);
  }, [onNavigate]);

  /* Quadratic bezier control point (curve outward from center) */
  const cpFor = (a, b) => {
    const ca = nodeMap[a], cb = nodeMap[b];
    if (!ca || !cb) return { cpx:0, cpy:0 };
    const mx = (ca.x + cb.x) / 2;
    const my = (ca.y + cb.y) / 2;
    // pull control point slightly away from center node
    const cCenter = nodeMap['community'];
    const dx = mx - (cCenter?.x ?? dims.w/2);
    const dy = my - (cCenter?.y ?? dims.h/2);
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    return { cpx: mx + (dx/len)*22, cpy: my + (dy/len)*22 };
  };

  return (
    <div ref={wrapRef} style={{ width:'100%', height:'100%', position:'relative' }}>
      <svg
        width="100%" height="100%"
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        style={{ position:'absolute', inset:0 }}
        overflow="visible"
      >
        <defs>
          {/* Glow filters */}
          <filter id="nlglow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="rgba(109,74,255,0.5)"/>
          </filter>
          <filter id="nlglownode" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="rgba(109,74,255,0.4)"/>
          </filter>
          {/* Center node gradient */}
          <radialGradient id="commGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#8F7BFF"/>
            <stop offset="100%" stopColor="#5535E0"/>
          </radialGradient>
        </defs>

        {/* ── Edges ── */}
        {EDGES.map(({ from, to, color }) => {
          const a = nodeMap[from], b = nodeMap[to];
          if (!a || !b) return null;
          const { cpx, cpy } = cpFor(from, to);
          const isLit = lit === from || lit === to || lit === 'community';
          const isHot = (highlightNode === from || highlightNode === to) && highlightNode;
          const pathId = `ep-${from}-${to}`;
          const d = `M${a.x},${a.y} Q${cpx},${cpy} ${b.x},${b.y}`;

          return (
            <g key={`e-${from}-${to}`}>
              <path
                d={d} fill="none"
                stroke={isLit ? color : 'rgba(0,0,0,0.08)'}
                strokeWidth={isHot ? 2.2 : isLit ? 1.6 : 1}
                strokeDasharray={isLit ? undefined : '4 6'}
                style={{ transition:'stroke 0.35s, stroke-width 0.35s' }}
              />
              {/* Travelling dot */}
              {isLit && (
                <circle r={isHot ? 4.5 : 3.5} fill={color} opacity="0.9">
                  <animateMotion path={d} dur={`${2.2 + EDGES.indexOf({from,to,color})*0.2 || 2.4}s`} repeatCount="indefinite"/>
                </circle>
              )}
            </g>
          );
        })}

        {/* ── Nodes ── */}
        {NODES.map((node, i) => {
          const n = nodeMap[node.id];
          if (!n) return null;
          const isCenter = node.center;
          const isHov    = hovered === node.id;
          const isLit    = lit === node.id;
          const isHot    = highlightNode === node.id;

          return (
            <motion.g
              key={node.id}
              onClick={() => handleClick(node)}
              onHoverStart={() => { setHovered(node.id); setActiveId(node.id); }}
              onHoverEnd={() => setHovered(null)}
              style={{ cursor:'pointer', outline:'none' }}
              role="button"
              tabIndex={0}
              aria-label={`Go to ${node.label}`}
              onKeyDown={e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();handleClick(node);}}}
              animate={{ y:[0, isCenter ? -6 : -5, 0] }}
              transition={{ duration:3.5+i*0.4, repeat:Infinity, ease:'easeInOut', delay:i*0.3 }}
              whileHover={{ scale:1.1 }}
              whileTap={{ scale:0.95 }}
            >
              {/* Pulse ring (for events node + active) */}
              {(node.pulse || isLit || isHot) && (
                <motion.circle
                  cx={n.x} cy={n.y} r={n.r + 10}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={isHot ? 2 : 1.4}
                  opacity={isHot ? 0.55 : 0.3}
                  animate={{ r:[n.r+8, n.r+16, n.r+8], opacity:[0.4,0.08,0.4] }}
                  transition={{ duration:2, repeat:Infinity, ease:'easeInOut' }}
                />
              )}

              {/* Glow halo */}
              {(isHov || isLit || isHot) && (
                <motion.circle
                  cx={n.x} cy={n.y} r={n.r + 18}
                  fill={`${node.color}14`}
                  initial={{ opacity:0, scale:0.6 }}
                  animate={{ opacity:1, scale:1 }}
                  exit={{ opacity:0 }}
                  transition={{ duration:0.25 }}
                />
              )}

              {/* Node circle */}
              {isCenter ? (
                /* Large center community circle */
                <circle
                  cx={n.x} cy={n.y} r={n.r}
                  fill="url(#commGrad)"
                  filter={(isHov||isHot) ? 'url(#nlglow)' : undefined}
                  style={{ transition:'filter 0.3s' }}
                />
              ) : (
                <circle
                  cx={n.x} cy={n.y} r={n.r}
                  fill="#fff"
                  stroke={(isHov||isLit||isHot) ? node.color : 'rgba(0,0,0,0.1)'}
                  strokeWidth={(isHov||isLit||isHot) ? 2 : 1.5}
                  filter={(isHov||isHot) ? 'url(#nlglownode)' : undefined}
                  style={{ transition:'stroke 0.3s, filter 0.3s' }}
                />
              )}

              {/* Icon */}
              <text
                x={n.x} y={n.y - (isCenter ? 6 : 4)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isCenter ? 18 : 14}
                style={{ pointerEvents:'none', userSelect:'none' }}
              >
                {node.icon}
              </text>

              {/* Label */}
              <text
                x={n.x} y={n.y + (isCenter ? 16 : 13)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isCenter ? 7.5 : 7}
                fontFamily="Inter, sans-serif"
                fontWeight="800"
                letterSpacing="0.9"
                fill={isCenter ? 'rgba(255,255,255,0.9)' : ((isHov||isLit||isHot) ? node.color : '#9CA3AF')}
                style={{ transition:'fill 0.25s', pointerEvents:'none', userSelect:'none' }}
              >
                {node.label}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
