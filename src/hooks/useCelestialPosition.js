/**
 * useCelestialPosition.js
 * Reusable real-time celestial tracker — deliberately isolated from any
 * particular background art. Given a day arc + night arc (each a quadratic
 * Bezier: start/control/end points), it returns the current sun or moon
 * position along the correct arc for the actual time of day, switching
 * automatically at the 6 AM / 6 PM boundary.
 *
 * Kept separate from HeroIllustration.jsx on purpose: this is the "sun
 * tracking code" — when the hero background is later swapped for a
 * different aesthetic (e.g. a raster illustration set), this hook can be
 * reused as-is as long as the new art exposes an arc/anchor config, without
 * touching the time-math itself.
 */
import { useEffect, useState } from 'react';

function bezierPoint(t, p0, p1, p2) {
  const mt = 1 - t;
  const x = mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x;
  const y = mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y;
  return { x, y };
}

function compute(dayArc, nightArc) {
  const now = new Date();
  const hours = now.getHours() + now.getMinutes() / 60;
  const isDay = hours >= 6 && hours < 18;
  const arc = isDay ? dayArc : nightArc;

  // Day spans 6:00 -> 18:00. Night spans 18:00 -> 30:00 (i.e. 6:00 next day),
  // so hours before 6 AM are rolled forward by 24 to stay on the same curve.
  const t = isDay
    ? (hours - 6) / 12
    : ((hours < 6 ? hours + 24 : hours) - 18) / 12;
  const clampedT = Math.min(1, Math.max(0, t));

  return { isDay, t: clampedT, ...bezierPoint(clampedT, arc.p0, arc.p1, arc.p2) };
}

export function useCelestialPosition(dayArc, nightArc, pollMs = 60000) {
  const [state, setState] = useState(() => compute(dayArc, nightArc));

  useEffect(() => {
    const id = setInterval(() => setState(compute(dayArc, nightArc)), pollMs);
    return () => clearInterval(id);
    // Arc shapes are static config, not reactive dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollMs]);

  return state;
}
