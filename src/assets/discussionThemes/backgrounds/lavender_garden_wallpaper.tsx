import React, { useMemo } from 'react';

const LavenderFlower = ({ x, y, rotation, scale }) => {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}>
      {/* Stem */}
      <line x1="0" y1="0" x2="0" y2="20" stroke="#8E735B" strokeWidth="1" />
      {/* Flower buds */}
      <circle cx="0" cy="0" r="3" fill="#967BB6" />
      <circle cx="2" cy="-4" r="2.5" fill="#B57EDC" />
      <circle cx="-2" cy="-8" r="2.5" fill="#B57EDC" />
      <circle cx="0" cy="-12" r="2" fill="#E6E6FA" />
    </g>
  );
};

export default function LavenderWallpaper() {
  // Generate 50 flowers with random positions and rotations
  const flowers = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 60; i++) {
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 1.5,
      });
    }
    return arr;
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#E6E6FA', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.8 }} />
          </linearGradient>
          
          <filter id="blurFilter">
            <feGaussianBlur stdDeviation="0.15" />
          </filter>
        </defs>

        {}
        <g filter="url(#blurFilter)">
          {/* Background Layer */}
          <rect width="100" height="100" fill="url(#bgGradient)" />

          {/* Flowers Layer */}
          {flowers.map((f, i) => (
            <LavenderFlower 
              key={i} 
              x={f.x} 
              y={f.y} 
              rotation={f.rotation} 
              scale={f.scale * 0.1} 
            />
          ))}
        </g>
      </svg>
    </div>
  );
}