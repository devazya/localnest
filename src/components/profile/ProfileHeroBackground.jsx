/**
 * ProfileHeroBackground.jsx — Profile UI Premium Polish
 *
 * Coded (not image-based) hero background: a hand-drawn purple sky with
 * an illustrated cityscape rising from clouds in the bottom-right corner,
 * plus a handful of softly pulsing stars. Fills its absolutely-positioned
 * parent (the ProfileHeader hero) edge-to-edge.
 *
 * - Extra headroom above the buildings (viewBox taller than the artwork)
 *   so the "xMaxYMax slice" crop never clips the tower/roofs on short,
 *   wide hero containers.
 * - The foreground cloud bank drifts slowly right-to-left in a seamless,
 *   looping parallax (two copies of the cloud layer, offset by one
 *   viewBox-width, translated together).
 */
import React from 'react';

const Star = ({ top, left, size = 1, delay = '0s', opacity = 1 }) => (
  <div
    style={{
      position: 'absolute', top, left,
      transform: `scale(${size})`,
      animation: 'lnStarPulse 2.6s ease-in-out infinite',
      animationDelay: delay,
      opacity,
    }}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C12 7.5 14.5 12 24 12C14.5 12 12 16.5 12 24C12 16.5 9.5 12 0 12C9.5 12 12 7.5 12 0Z" fill="#FFEDB3" />
      <path d="M12 4C12 9 13.5 12 20 12C13.5 12 12 15 12 20C12 15 10.5 12 4 12C10.5 12 12 9 12 4Z" fill="#FFFFFF" />
    </svg>
  </div>
);

// Foreground cloud bank — rendered twice (0 and +1000) inside the
// slowly-scrolling track so the loop is seamless.
function CloudBank() {
  return (
    <>
      <circle cx="880" cy="670" r="120" fill="#8C61ED" />
      <circle cx="750" cy="690" r="110" fill="#8C61ED" />
      <circle cx="620" cy="710" r="100" fill="#8C61ED" />
      <circle cx="480" cy="740" r="110" fill="#8C61ED" />

      <circle cx="960" cy="730" r="140" fill="#A078F8" />
      <circle cx="820" cy="740" r="130" fill="#A078F8" />
      <circle cx="680" cy="760" r="120" fill="#A078F8" />
      <circle cx="540" cy="780" r="115" fill="#A078F8" />
      <circle cx="400" cy="800" r="125" fill="#A078F8" />

      <circle cx="1050" cy="800" r="160" fill="#B792FA" />
      <circle cx="900" cy="810" r="150" fill="#B792FA" />
      <circle cx="750" cy="820" r="140" fill="#B792FA" />
      <circle cx="600" cy="840" r="130" fill="#B792FA" />
      <circle cx="450" cy="850" r="140" fill="#B792FA" />
      <circle cx="300" cy="870" r="150" fill="#B792FA" />

      <circle cx="980" cy="870" r="140" fill="#CBB1FE" />
      <circle cx="810" cy="880" r="130" fill="#CBB1FE" />
      <circle cx="640" cy="890" r="140" fill="#CBB1FE" />
      <circle cx="480" cy="910" r="150" fill="#CBB1FE" />
    </>
  );
}

export default function ProfileHeroBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <style>{`
        @keyframes lnStarPulse{0%,100%{opacity:.45}50%{opacity:1}}
        @keyframes lnCloudDrift{from{transform:translateX(0)}to{transform:translateX(-1000px)}}
        .ln-cloud-track{animation:lnCloudDrift 70s linear infinite}
      `}</style>

      {/* Base gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, #6A32E9 0%, #5224D5 55%, #451CBE 100%)',
      }} />

      {/* Ambient top-left light glow */}
      <div style={{
        position: 'absolute', top: '-25%', left: '-25%', width: '75%', height: '75%',
        background: '#995CFF', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.35,
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '50%', height: '50%',
        background: '#B788FF', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.25,
      }} />

      {/* Scattered magical stars */}
      <Star top="12%" left="6%"  size={0.7} delay="0s"   opacity={0.9} />
      <Star top="60%" left="4%"  size={0.5} delay="1s"   opacity={0.6} />
      <Star top="8%"  left="92%" size={0.6} delay="0.5s" opacity={0.8} />
      <Star top="22%" left="82%" size={0.5} delay="1.5s" opacity={0.7} />
      <Star top="25%" left="94%" size={0.8} delay="0.2s" opacity={1} />
      <Star top="36%" left="80%" size={0.9} delay="2s"   opacity={0.9} />
      <Star top="55%" left="60%" size={0.4} delay="0.8s" opacity={0.5} />
      <Star top="42%" left="83%" size={0.3} delay="1.2s" opacity={0.4} />

      {/* Cityscape + clouds, anchored bottom-right */}
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <svg
          style={{ position: 'absolute', bottom: 0, right: 0, width: '100%', height: '100%' }}
          viewBox="0 0 1000 1050"
          preserveAspectRatio="xMaxYMax slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Extra 250px of empty sky above the artwork so a short/wide
              hero never crops into the rooftops. */}
          <g transform="translate(0, 250)">
            {/* Layer 1 — subtle back clouds */}
            <circle cx="950" cy="450" r="70" fill="#794BE8" />
            <circle cx="1020" cy="400" r="85" fill="#794BE8" />
            <circle cx="850" cy="500" r="90" fill="#794BE8" />

            {/* Layer 2 — tall right tower */}
            <g id="tall-tower">
              <rect x="870" y="380" width="40" height="420" fill="#8864E5" />
              <rect x="910" y="380" width="70" height="420" fill="#A78CF0" />
              <rect x="875" y="350" width="35" height="30" fill="#9474E8" />
              <rect x="910" y="350" width="60" height="30" fill="#B39CF2" />
              <rect x="880" y="325" width="30" height="25" fill="#A88DF2" />
              <rect x="910" y="325" width="50" height="25" fill="#C9B6F9" />
              {[410, 460, 510, 560, 610, 660].map((y, i) => (
                <React.Fragment key={`tf-${i}`}>
                  <rect x="925" y={y} width="12" height="20" fill={i % 3 === 0 ? '#FFDB7E' : '#724AD9'} />
                  <rect x="950" y={y} width="12" height="20" fill={i % 2 === 0 ? '#FFDB7E' : '#724AD9'} />
                </React.Fragment>
              ))}
              {[415, 465, 515, 565, 615, 665].map((y, i) => (
                <React.Fragment key={`ts-${i}`}>
                  <rect x="878" y={y} width="10" height="18" fill="#6037C4" />
                  <rect x="894" y={y} width="10" height="18" fill={i === 2 ? '#FFDB7E' : '#6037C4'} />
                </React.Fragment>
              ))}
            </g>

            {/* Layer 3 — mid-right large gabled house */}
            <g id="large-gable">
              <rect x="780" y="490" width="45" height="250" fill="#835DE0" />
              <rect x="825" y="490" width="65" height="250" fill="#A084ED" />
              <polygon points="775,490 820,490 857.5,420 812.5,420" fill="#724AD9" />
              <polygon points="820,490 857.5,420 895,490" fill="#9273E8" />
              <circle cx="857.5" cy="465" r="7" fill="#FFDB7E" />
              {[520, 570, 620].map((y, i) => (
                <React.Fragment key={`h1f-${i}`}>
                  <rect x="840" y={y} width="12" height="18" fill={i === 1 ? '#FFDB7E' : '#724AD9'} />
                  <rect x="865" y={y} width="12" height="18" fill="#724AD9" />
                </React.Fragment>
              ))}
              {[525, 575, 625].map((y, i) => (
                <React.Fragment key={`h1s-${i}`}>
                  <rect x="790" y={y} width="10" height="16" fill="#6037C4" />
                  <rect x="808" y={y} width="10" height="16" fill={i === 0 ? '#FFDB7E' : '#6037C4'} />
                </React.Fragment>
              ))}
            </g>

            {/* Layer 4 — mid-left medium gabled house */}
            <g id="medium-gable">
              <rect x="690" y="550" width="40" height="200" fill="#835DE0" />
              <rect x="730" y="550" width="55" height="200" fill="#A084ED" />
              <polygon points="685,550 725,550 757.5,490 717.5,490" fill="#724AD9" />
              <polygon points="725,550 757.5,490 790,550" fill="#9273E8" />
              <polygon points="752.5,520 762.5,520 757.5,510" fill="#FFDB7E" />
              {[580, 625, 670].map((y, i) => (
                <React.Fragment key={`h2f-${i}`}>
                  <rect x="740" y={y} width="12" height="16" fill="#724AD9" />
                  <rect x="760" y={y} width="12" height="16" fill={i !== 1 ? '#FFDB7E' : '#724AD9'} />
                </React.Fragment>
              ))}
              {[585, 630, 675].map((y, i) => (
                <React.Fragment key={`h2s-${i}`}>
                  <rect x="700" y={y} width="8" height="14" fill={i === 1 ? '#FFDB7E' : '#6037C4'} />
                  <rect x="715" y={y} width="8" height="14" fill="#6037C4" />
                </React.Fragment>
              ))}
            </g>

            {/* Layer 5 — far-left small gabled house */}
            <g id="small-gable">
              <rect x="610" y="610" width="35" height="150" fill="#724AD9" />
              <rect x="645" y="610" width="50" height="150" fill="#9273E8" />
              <polygon points="605,610 640,610 670,555 635,555" fill="#6037C4" />
              <polygon points="640,610 670,555 700,610" fill="#835DE0" />
              <rect x="655" y="635" width="10" height="14" fill="#FFDB7E" />
              <rect x="675" y="635" width="10" height="14" fill="#6037C4" />
              <rect x="655" y="665" width="10" height="14" fill="#6037C4" />
              <rect x="675" y="665" width="10" height="14" fill="#FFDB7E" />
            </g>

            {/* Layer 6 — massive foreground cloud bank, slowly drifting
                right-to-left in a seamless loop (two copies, one
                viewBox-width apart, translated together). */}
            <g className="ln-cloud-track">
              <g transform="translate(0,0)"><CloudBank /></g>
              <g transform="translate(1000,0)"><CloudBank /></g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
