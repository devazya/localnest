/**
 * AnimatedNumber.jsx — Community module (Segment 2)
 * Smoothly tweens a displayed integer between values instead of abruptly
 * replacing it — used for live presence counts ("56 online", "18 chatting")
 * so updates feel alive rather than jumpy.
 */
import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function AnimatedNumber({ value, style }) {
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, { stiffness: 140, damping: 22, mass: 0.6 });
  const rounded = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => { motionValue.set(value); }, [value, motionValue]);

  return <motion.span style={style}>{rounded}</motion.span>;
}
