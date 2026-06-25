import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NETWORK_NODES } from '../../data/index';
import styles from './LocalityNetwork.module.css';

const EDGES = [
  ['community','pg'],['community','gym'],['community','cafe'],
  ['community','shop'],['community','events'],['community','rides'],
  ['pg','rides'],['pg','gym'],['cafe','events'],['shop','events'],
];

const NODE_LAYOUT = {
  community: { x: 50, y: 50 },
  pg:        { x: 50, y: 14 },
  gym:       { x: 82, y: 32 },
  cafe:      { x: 78, y: 72 },
  shop:      { x: 26, y: 76 },
  events:    { x: 14, y: 40 },
  rides:     { x: 26, y: 18 },
};

export default function LocalityNetwork() {
  const wrapRef  = useRef(null);
  const [dims, setDims]     = useState({ w: 480, h: 340 });
  const [hovered, setHovered] = useState(null);
  const [active,  setActive]  = useState('community');

  useEffect(() => {
    const ids = NETWORK_NODES.map(n => n.id).filter(id => id !== 'community');
    let idx = 0;
    const id = setInterval(() => {
      if (!hovered) { setActive(ids[idx % ids.length]); idx++; }
    }, 2200);
    return () => clearInterval(id);
  }, [hovered]);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: width || 480, h: height || 340 });
    });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  const coord = useCallback((node) => ({
    cx: (NODE_LAYOUT[node.id].x / 100) * dims.w,
    cy: (NODE_LAYOUT[node.id].y / 100) * dims.h,
  }), [dims]);

  const nodeMap = Object.fromEntries(
    NETWORK_NODES.map(n => [n.id, { ...n, ...coord(n) }])
  );

  const highlight = hovered ?? active;

  return (
    <div className={styles.wrapper} ref={wrapRef}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        preserveAspectRatio="xMidYMid meet"
        overflow="visible"
      >
        <defs>
          <filter id="lnGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          <filter id="lnGlowStrong" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>

          {EDGES.map(([a, b]) => (
            <linearGradient
              key={`grad-${a}-${b}`}
              id={`grad-${a}-${b}`}
              x1={`${NODE_LAYOUT[a].x}%`} y1={`${NODE_LAYOUT[a].y}%`}
              x2={`${NODE_LAYOUT[b].x}%`} y2={`${NODE_LAYOUT[b].y}%`}
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%"   stopColor={nodeMap[a]?.color || '#6EE7B7'} stopOpacity="0.6"/>
              <stop offset="100%" stopColor={nodeMap[b]?.color || '#6EE7B7'} stopOpacity="0.6"/>
            </linearGradient>
          ))}

          {NETWORK_NODES.map(n => (
            <radialGradient key={`rg-${n.id}`} id={`rg-${n.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={n.color} stopOpacity="0.35"/>
              <stop offset="100%" stopColor={n.color} stopOpacity="0"/>
            </radialGradient>
          ))}
        </defs>

        {/* Edges */}
        {EDGES.map(([a, b], i) => {
          const na = nodeMap[a], nb = nodeMap[b];
          if (!na || !nb) return null;
          const isLit = highlight === a || highlight === b || highlight === 'community';

          return (
            <g key={`e-${a}-${b}`}>
              <line
                x1={na.cx} y1={na.cy} x2={nb.cx} y2={nb.cy}
                stroke={isLit ? `url(#grad-${a}-${b})` : 'rgba(255,255,255,0.06)'}
                strokeWidth={isLit ? 1.5 : 1}
                strokeDasharray={isLit ? 'none' : '3 7'}
                style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
              />
              {isLit && (
                <circle r="3" fill={na.color} filter="url(#lnGlow)" opacity="0.9">
                  <animateMotion
                    dur={`${2.4 + i * 0.4}s`}
                    repeatCount="indefinite"
                    path={`M${na.cx},${na.cy} L${nb.cx},${nb.cy}`}
                  />
                </circle>
              )}
              {isLit && (
                <circle r="3" fill={nb.color} filter="url(#lnGlow)" opacity="0.9">
                  <animateMotion
                    dur={`${2.4 + i * 0.4}s`}
                    repeatCount="indefinite"
                    begin={`${(2.4 + i * 0.4) / 2}s`}
                    path={`M${nb.cx},${nb.cy} L${na.cx},${na.cy}`}
                  />
                </circle>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {NETWORK_NODES.map((node, i) => {
          const n     = nodeMap[node.id];
          const isCtr = node.id === 'community';
          const isHov = hovered === node.id;
          const isAct = highlight === node.id;
          const r     = isCtr ? 40 : 26;

          return (
            <motion.g
              key={node.id}
              style={{ cursor: 'pointer' }}
              onHoverStart={() => { setHovered(node.id); setActive(node.id); }}
              onHoverEnd={() => setHovered(null)}
              animate={{ y: [0, isCtr ? -6 : -5, 0] }}
              transition={{
                duration: 3.2 + i * 0.45,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.28,
              }}
            >
              <AnimatePresence>
                {(isHov || isAct) && (
                  <motion.circle
                    cx={n.cx} cy={n.cy} r={r + 22}
                    fill={`url(#rg-${node.id})`}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.35 }}
                    filter="url(#lnGlowStrong)"
                  />
                )}
              </AnimatePresence>

              {(isHov || isAct) && (
                <motion.circle
                  cx={n.cx} cy={n.cy}
                  r={r + 10}
                  fill="none"
                  stroke={node.color}
                  strokeWidth="1"
                  opacity="0"
                  animate={{ r: [r + 10, r + 22], opacity: [0.7, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                />
              )}

              <circle
                cx={n.cx} cy={n.cy} r={r + 7}
                fill="none"
                stroke={isHov || isAct ? node.color : 'rgba(255,255,255,0.07)'}
                strokeWidth={isCtr ? 1.5 : 1}
                opacity={isCtr ? 0.6 : 0.5}
                strokeDasharray={isCtr ? 'none' : '3 4'}
                style={{ transition: 'stroke 0.3s, opacity 0.3s' }}
              />

              <circle
                cx={n.cx} cy={n.cy} r={r}
                fill={isCtr ? 'rgba(110,231,183,0.14)' : 'rgba(23,26,33,0.96)'}
                stroke={isCtr
                  ? 'rgba(110,231,183,0.5)'
                  : (isHov || isAct ? node.color : 'rgba(255,255,255,0.12)')}
                strokeWidth={isCtr ? 2 : 1.5}
                filter={(isCtr || isHov || isAct) ? 'url(#lnGlow)' : ''}
                style={{ transition: 'stroke 0.3s, fill 0.3s' }}
              />

              <text
                x={n.cx}
                y={n.cy - (isCtr ? 6 : 4)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isCtr ? 20 : 14}
              >{node.icon}</text>

              <text
                x={n.cx}
                y={n.cy + (isCtr ? 17 : 13)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isCtr ? 8.5 : 7.5}
                fontFamily="Inter, sans-serif"
                fontWeight="600"
                fill={isCtr ? '#6EE7B7' : (isHov || isAct ? node.color : '#64748B')}
                letterSpacing="0.8"
                style={{ transition: 'fill 0.3s' }}
              >{node.label.toUpperCase()}</text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
