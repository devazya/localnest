import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CATEGORY_ICON, CENTER_ICON, OUTER_SLOTS, FALLBACK_PILLS } from './nodeIcons';

/* ─── Center node — unchanged geometry, AI-centric identity (v2) ───
   "Friend Pulse" reads as the AI continuously observing the neighbourhood,
   matching the existing "Friend AI" brand used elsewhere in the app. */
const CENTER_NODE = { id: 'community', label: 'FRIEND PULSE', cx: 50, cy: 50, r: 42, center: true };

const EDGE_COLOR = (hex, a) => {
  // hex -> rgba, so edges keep tinted-by-category color like before
  const n = hex.replace('#', '');
  const r = parseInt(n.substring(0, 2), 16), g = parseInt(n.substring(2, 4), 16), b = parseInt(n.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

/**
 * Build the full node list (center + outer pills) from live category data.
 * Positions/sizes always come from OUTER_SLOTS (fixed layout, never
 * changes); only label/icon/color/route/title/subtitle are dynamic.
 */
function buildNodes(pills) {
  const source = (pills && pills.length ? pills : FALLBACK_PILLS).slice(0, OUTER_SLOTS.length);
  const outer = source.map((pill, i) => {
    const slot = OUTER_SLOTS[i % OUTER_SLOTS.length];
    const iconCfg = CATEGORY_ICON[pill.category] || CATEGORY_ICON.event;
    return {
      id: pill.id,
      label: pill.label,
      icon: iconCfg.Icon,
      color: iconCfg.color,
      center: false,
      route: pill.route,
      ctaLabel: pill.ctaLabel,
      title: pill.title,
      subtitle: pill.subtitle,
      timeLabel: pill.timeLabel,
      priority: pill.priority,
      category: pill.category,
      ...slot,
    };
  });
  const center = { ...CENTER_NODE, icon: CENTER_ICON.Icon, color: CENTER_ICON.color, route: 'community' };
  return [center, ...outer];
}

function buildEdges(nodes) {
  const outer = nodes.filter(n => !n.center);
  const edges = outer.map(n => ({ from: 'community', to: n.id, color: EDGE_COLOR(n.color, 0.5) }));
  // A couple of cross-links between adjacent outer nodes, same as before, purely visual
  if (outer[1] && outer[5]) edges.push({ from: outer[1].id, to: outer[5].id, color: EDGE_COLOR(outer[1].color, 0.22) });
  if (outer[4] && outer[3]) edges.push({ from: outer[4].id, to: outer[3].id, color: EDGE_COLOR(outer[4].color, 0.22) });
  return edges;
}

/**
 * LocalityNetwork — the "Local Pulse" visualization.
 * Same central node / pills / laser / orbit / transitions as before.
 * `categories` (live pill data from feed_items) drives the outer pills
 * instead of hardcoded values, and `onActiveChange` narrates whatever
 * the laser currently lands on for the Live Context Panel.
 */
export default function LocalityNetwork({ onNavigate, highlightNode, categories, onActiveChange }) {
  const wrapRef = useRef(null);
  const [dims, setDims] = useState({ w: 340, h: 276 });
  const [hovered, setHovered] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const NODES = useMemo(() => buildNodes(categories), [categories]);
  const EDGES = useMemo(() => buildEdges(NODES), [NODES]);

  /* Resize */
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0) setDims({ w: width, h: height || 276 });
    });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  /* Auto-cycle nodes — the "laser" sweeping from pill to pill */
  useEffect(() => {
    const outer = NODES.filter(n => !n.center).map(n => n.id);
    if (!outer.length) return;
    let i = 0;
    const iv = setInterval(() => {
      if (!hovered) { setActiveId(outer[i % outer.length]); i++; }
    }, 2200);
    return () => clearInterval(iv);
  }, [hovered, NODES]);

  /* Respond to live activity pushed in from outside */
  useEffect(() => {
    if (highlightNode) setActiveId(highlightNode);
  }, [highlightNode]);

  /* Narrate whatever the laser currently lands on, for the context panel */
  useEffect(() => {
    if (!onActiveChange) return;
    const lit = hovered ?? activeId;
    const node = NODES.find(n => n.id === lit && !n.center);
    onActiveChange(node || null);
  }, [hovered, activeId, NODES, onActiveChange]);

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
          {/* Softer, pastel version of the center orb's texture per category color —
              same glossy two-stop sphere, toned down so it doesn't clash. */}
          {NODES.filter(n => !n.center).map(n => (
            <radialGradient key={`grad-${n.id}`} id={`pillGrad-${n.id}`} cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor={lighten(n.color, 0.62)} />
              <stop offset="100%" stopColor={lighten(n.color, 0.12)} />
            </radialGradient>
          ))}
        </defs>

        {/* ── Edges — solid, no dashes; unlit ones stay faint ── */}
        {EDGES.map(({ from, to, color }) => {
          const a = nodeMap[from], b = nodeMap[to];
          if (!a || !b) return null;
          const { cpx, cpy } = cpFor(from, to);
          const isLit = lit === from || lit === to || lit === 'community';
          const isHot = (highlightNode === from || highlightNode === to) && highlightNode;
          const d = `M${a.x},${a.y} Q${cpx},${cpy} ${b.x},${b.y}`;

          return (
            <g key={`e-${from}-${to}`}>
              <path
                d={d} fill="none"
                stroke={isLit ? color : 'rgba(148,138,214,0.16)'}
                strokeWidth={isHot ? 2.2 : isLit ? 1.6 : 1}
                style={{ transition:'stroke 0.35s, stroke-width 0.35s' }}
              />
              {/* Travelling dot — the "laser" */}
              {isLit && (
                <circle r={isHot ? 4.5 : 3.5} fill={color} opacity="0.9">
                  <animateMotion path={d} dur="2.3s" repeatCount="indefinite"/>
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
          const Icon     = node.icon;
          const iconSize = isCenter ? 20 : 16;
          const iconY    = n.y - (isCenter ? 8 : 5);

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
              {/* Pulse ring — glows softly whenever the laser reaches this pill */}
              {(isLit || isHot) && (
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

              {/* Node circle — same glossy gradient sphere texture for center + pills */}
              <circle
                cx={n.x} cy={n.y} r={n.r}
                fill={isCenter ? 'url(#commGrad)' : `url(#pillGrad-${node.id})`}
                stroke={!isCenter && (isHov||isLit||isHot) ? '#fff' : 'none'}
                strokeWidth={!isCenter && (isHov||isLit||isHot) ? 2 : 0}
                filter={(isHov||isHot) ? (isCenter ? 'url(#nlglow)' : 'url(#nlglownode)') : undefined}
                style={{ transition:'filter 0.3s, stroke 0.3s' }}
              />

              {/* Icon — a real nested <svg> (Lucide renders one), not foreignObject,
                  so it stays perfectly in sync with the orb during the bounce/hover
                  transforms instead of lagging behind on a separate render pass. */}
              <g transform={`translate(${n.x - iconSize / 2}, ${iconY - iconSize / 2})`} style={{ pointerEvents: 'none' }}>
                <Icon size={iconSize} color={isCenter ? '#fff' : node.color} strokeWidth={2.25} />
              </g>

              {/* Label — always high-contrast against its own orb, lit or not,
                  so it never washes out when the laser fires on it. */}
              {isCenter ? (
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={7.5}
                  fontFamily="Inter, sans-serif"
                  fontWeight="800"
                  letterSpacing="0.8"
                  fill="rgba(255,255,255,0.92)"
                  style={{ pointerEvents:'none', userSelect:'none' }}
                >
                  <tspan x={n.x} y={n.y + 14}>FRIEND</tspan>
                  <tspan x={n.x} y={n.y + 24}>PULSE</tspan>
                </text>
              ) : (
                <text
                  x={n.x} y={n.y + 15}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={7}
                  fontFamily="Inter, sans-serif"
                  fontWeight="800"
                  letterSpacing="0.9"
                  fill={node.color}
                  style={{ transition:'fill 0.25s', pointerEvents:'none', userSelect:'none' }}
                >
                  {node.label}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

/* Lighten a hex color toward white by `amt` (0-1), for the gradient's inner stop */
function lighten(hex, amt) {
  const n = hex.replace('#', '');
  const r = parseInt(n.substring(0, 2), 16), g = parseInt(n.substring(2, 4), 16), b = parseInt(n.substring(4, 6), 16);
  const mix = (c) => Math.round(c + (255 - c) * amt);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}
