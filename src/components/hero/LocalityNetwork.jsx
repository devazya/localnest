import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LocalityNetwork.module.css';

/* ── Node definitions ── */
const NODES = [
  { id: 'community', label: 'COMMUNITY', icon: '👥', color: '#6D4AFF', x: 50, y: 50, center: true,  route: 'community' },
  { id: 'pg',        label: 'PG',        icon: '🏠', color: '#3B82F6', x: 65, y: 14, center: false, route: 'pgs' },
  { id: 'gym',       label: 'GYM',       icon: '🏋️', color: '#F59E0B', x: 86, y: 38, center: false, route: 'gyms' },
  { id: 'cafe',      label: 'CAFE',      icon: '☕', color: '#10B981', x: 82, y: 72, center: false, route: 'community' },
  { id: 'shop',      label: 'SHOPS',     icon: '🛍️', color: '#10B981', x: 48, y: 82, center: false, route: 'shops' },
  { id: 'events',    label: 'EVENTS',    icon: '📅', color: '#EF4444', x: 18, y: 62, center: false, route: 'events' },
  { id: 'rides',     label: 'RIDES',     icon: '🚗', color: '#8B5CF6', x: 18, y: 28, center: false, route: 'rideshare' },
];

const EDGES = [
  ['community', 'pg'],
  ['community', 'gym'],
  ['community', 'cafe'],
  ['community', 'shop'],
  ['community', 'events'],
  ['community', 'rides'],
  ['pg', 'gym'],
  ['rides', 'pg'],
  ['cafe', 'events'],
  ['shop', 'events'],
];

export default function LocalityNetwork({ onNavigate }) {
  const wrapRef = useRef(null);
  const [dims, setDims]     = useState({ w: 400, h: 320 });
  const [hovered, setHovered] = useState(null);
  const [active, setActive]   = useState('community');

  /* Auto-cycle through outer nodes */
  useEffect(() => {
    const outer = NODES.filter(n => !n.center).map(n => n.id);
    let idx = 0;
    const id = setInterval(() => {
      if (!hovered) { setActive(outer[idx % outer.length]); idx++; }
    }, 2200);
    return () => clearInterval(id);
  }, [hovered]);

  /* Respond to container resize */
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: width || 400, h: height || 320 });
    });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  const pt = useCallback((node) => ({
    cx: (node.x / 100) * dims.w,
    cy: (node.y / 100) * dims.h,
  }), [dims]);

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, { ...n, ...pt(n) }]));
  const highlight = hovered ?? active;

  const handleNodeClick = useCallback((node) => {
    if (onNavigate && node.route) onNavigate(node.route);
  }, [onNavigate]);

  return (
    <div className={styles.wrapper} ref={wrapRef}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        preserveAspectRatio="xMidYMid meet"
        overflow="visible"
        role="img"
        aria-label="Locality network visualization"
      >
        <defs>
          <filter id="nodeShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(109,74,255,0.18)" floodOpacity="1"/>
          </filter>
          <filter id="nodeShadowHov" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="rgba(109,74,255,0.32)" floodOpacity="1"/>
          </filter>
          <filter id="centerGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          {/* Per-edge gradients */}
          {EDGES.map(([a, b]) => (
            <linearGradient
              key={`lg-${a}-${b}`}
              id={`lg-${a}-${b}`}
              x1={`${NODES.find(n=>n.id===a).x}%`}
              y1={`${NODES.find(n=>n.id===a).y}%`}
              x2={`${NODES.find(n=>n.id===b).x}%`}
              y2={`${NODES.find(n=>n.id===b).y}%`}
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%"   stopColor={nodeMap[a]?.color || '#6D4AFF'} stopOpacity="0.55"/>
              <stop offset="100%" stopColor={nodeMap[b]?.color || '#6D4AFF'} stopOpacity="0.55"/>
            </linearGradient>
          ))}
          {/* Radial glow per node */}
          {NODES.map(n => (
            <radialGradient key={`rg-${n.id}`} id={`rg-${n.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={n.color} stopOpacity="0.28"/>
              <stop offset="100%" stopColor={n.color} stopOpacity="0"/>
            </radialGradient>
          ))}
        </defs>

        {/* ── Edges ── */}
        {EDGES.map(([a, b], i) => {
          const na = nodeMap[a], nb = nodeMap[b];
          if (!na || !nb) return null;
          const isLit = highlight === a || highlight === b || highlight === 'community';

          return (
            <g key={`e-${a}-${b}`}>
              {/* Base line */}
              <line
                x1={na.cx} y1={na.cy}
                x2={nb.cx} y2={nb.cy}
                stroke={isLit ? `url(#lg-${a}-${b})` : 'rgba(109,74,255,0.1)'}
                strokeWidth={isLit ? 1.8 : 1}
                strokeDasharray={isLit ? 'none' : '4 6'}
                style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
              />
              {/* Travelling packet — forward */}
              {isLit && (
                <circle r="3.5" fill={na.color} opacity="0.9">
                  <animateMotion
                    dur={`${2.6 + i * 0.35}s`}
                    repeatCount="indefinite"
                    path={`M${na.cx},${na.cy} L${nb.cx},${nb.cy}`}
                  />
                </circle>
              )}
              {/* Travelling packet — return */}
              {isLit && (
                <circle r="3.5" fill={nb.color} opacity="0.9">
                  <animateMotion
                    dur={`${2.6 + i * 0.35}s`}
                    repeatCount="indefinite"
                    begin={`${(2.6 + i * 0.35) / 2}s`}
                    path={`M${nb.cx},${nb.cy} L${na.cx},${na.cy}`}
                  />
                </circle>
              )}
            </g>
          );
        })}

        {/* ── Nodes ── */}
        {NODES.map((node, i) => {
          const n     = nodeMap[node.id];
          const isCtr = node.center;
          const isHov = hovered === node.id;
          const isAct = highlight === node.id;
          const r     = isCtr ? 38 : 24;

          return (
            <motion.g
              key={node.id}
              style={{ cursor: 'pointer' }}
              role="button"
              aria-label={`Navigate to ${node.label}`}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNodeClick(node);
                }
              }}
              onClick={() => handleNodeClick(node)}
              onHoverStart={() => { setHovered(node.id); setActive(node.id); }}
              onHoverEnd={() => setHovered(null)}
              animate={{ y: [0, isCtr ? -4 : -5, 0] }}
              transition={{
                duration: 3.5 + i * 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
              whileHover={{ scale: 1.1 }}
            >
              {/* Radial glow halo */}
              <AnimatePresence>
                {(isHov || isAct) && (
                  <motion.circle
                    cx={n.cx} cy={n.cy}
                    r={r + 24}
                    fill={`url(#rg-${node.id})`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>

              {/* Pulse ring */}
              {(isHov || isAct) && (
                <motion.circle
                  cx={n.cx} cy={n.cy}
                  r={r + 8}
                  fill="none"
                  stroke={node.color}
                  strokeWidth="1.5"
                  opacity="0"
                  animate={{ r: [r + 8, r + 22], opacity: [0.65, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                />
              )}

              {/* Glass circle body */}
              <circle
                cx={n.cx} cy={n.cy}
                r={r}
                fill={isCtr ? node.color : 'rgba(255,255,255,0.94)'}
                stroke={isCtr
                  ? 'rgba(255,255,255,0.4)'
                  : (isHov || isAct ? node.color : 'rgba(109,74,255,0.15)')}
                strokeWidth={isCtr ? 2.5 : 1.5}
                filter={(isHov || isAct) ? 'url(#nodeShadowHov)' : 'url(#nodeShadow)'}
                style={{ transition: 'stroke 0.3s, filter 0.3s' }}
              />

              {/* Icon */}
              <text
                x={n.cx}
                y={n.cy - (isCtr ? 5 : 3)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isCtr ? 18 : 14}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >{node.icon}</text>

              {/* Label */}
              <text
                x={n.cx}
                y={n.cy + (isCtr ? 18 : 14)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isCtr ? 7 : 7}
                fontFamily="Inter, sans-serif"
                fontWeight="700"
                fill={isCtr ? 'rgba(255,255,255,0.92)' : (isHov || isAct ? node.color : '#9CA3AF')}
                letterSpacing="0.8"
                style={{ transition: 'fill 0.3s', pointerEvents: 'none', userSelect: 'none' }}
              >{node.label}</text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
