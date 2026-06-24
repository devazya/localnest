import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { NETWORK_NODES } from '../../data/index';
import styles from './LocalityNetwork.module.css';

const EDGES = [
  ['community', 'pg'], ['community', 'gym'], ['community', 'cafe'],
  ['community', 'shop'], ['community', 'events'], ['community', 'rides'],
  ['pg', 'rides'], ['pg', 'gym'], ['cafe', 'events'], ['shop', 'events'],
];

function toSVGCoords(x, y, w, h) {
  return { cx: (x / 100) * w, cy: (y / 100) * h };
}

export default function LocalityNetwork() {
  const svgRef = useRef(null);
  const [dims, setDims] = useState({ w: 480, h: 380 });
  const [hovered, setHovered] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) {
        setDims({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    if (svgRef.current) obs.observe(svgRef.current);
    return () => obs.disconnect();
  }, []);

  // Pulse tick for animated dots on edges
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 100), 80);
    return () => clearInterval(id);
  }, []);

  const nodeMap = Object.fromEntries(
    NETWORK_NODES.map(n => [n.id, { ...n, ...toSVGCoords(n.x, n.y, dims.w, dims.h) }])
  );

  const centerNode = nodeMap['community'];

  return (
    <div className={styles.wrapper}>
      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {EDGES.map(([a, b], i) => {
          const na = nodeMap[a], nb = nodeMap[b];
          if (!na || !nb) return null;
          const isActive = hovered === a || hovered === b;
          return (
            <g key={`${a}-${b}`}>
              <line
                x1={na.cx} y1={na.cy} x2={nb.cx} y2={nb.cy}
                stroke={isActive ? 'rgba(110,231,183,0.5)' : 'rgba(110,231,183,0.12)'}
                strokeWidth={isActive ? 1.5 : 1}
                strokeDasharray="4 6"
                className={styles.edge}
              />
              {/* Traveling dot */}
              <circle r="2.5" fill="#6EE7B7" opacity={isActive ? 0.9 : 0.3}>
                <animateMotion
                  dur={`${3 + i * 0.7}s`}
                  repeatCount="indefinite"
                  path={`M${na.cx},${na.cy} L${nb.cx},${nb.cy}`}
                />
              </circle>
            </g>
          );
        })}

        {/* Nodes */}
        {NETWORK_NODES.map((node, i) => {
          const n = nodeMap[node.id];
          const isCenter = node.id === 'community';
          const isHov = hovered === node.id;
          const r = isCenter ? 38 : 28;

          return (
            <motion.g
              key={node.id}
              style={{ cursor: 'pointer' }}
              onHoverStart={() => setHovered(node.id)}
              onHoverEnd={() => setHovered(null)}
              animate={{ y: [0, isCenter ? -5 : -4, 0] }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            >
              {/* Glow ring for hovered */}
              {isHov && (
                <circle
                  cx={n.cx} cy={n.cy} r={r + 14}
                  fill="none"
                  stroke={node.color}
                  strokeWidth="1"
                  opacity="0.3"
                />
              )}

              {/* Outer ring */}
              <circle
                cx={n.cx} cy={n.cy} r={r + 6}
                fill="none"
                stroke={isHov ? node.color : 'rgba(255,255,255,0.06)'}
                strokeWidth={isCenter ? 1.5 : 1}
                opacity={isCenter ? 0.5 : 0.4}
              />

              {/* Node background */}
              <circle
                cx={n.cx} cy={n.cy} r={r}
                fill={isCenter
                  ? 'rgba(110,231,183,0.15)'
                  : 'rgba(32,36,45,0.9)'}
                stroke={isCenter
                  ? 'rgba(110,231,183,0.4)'
                  : (isHov ? node.color : 'rgba(255,255,255,0.1)')}
                strokeWidth={isCenter ? 1.5 : 1}
                filter={isCenter || isHov ? 'url(#glow)' : ''}
              />

              {/* Emoji icon */}
              <text
                x={n.cx} y={n.cy - (isCenter ? 4 : 3)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isCenter ? 20 : 15}
              >
                {node.icon}
              </text>

              {/* Label */}
              <text
                x={n.cx}
                y={n.cy + (isCenter ? 16 : 13)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isCenter ? 9 : 8}
                fontFamily="var(--font-display)"
                fontWeight="600"
                fill={isCenter ? '#6EE7B7' : '#94A3B8'}
                letterSpacing="0.5"
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
