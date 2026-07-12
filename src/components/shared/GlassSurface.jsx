/**
 * GlassSurface.jsx
 * Shared glass-float wrapper — Design Spec §8 (Elevation System) and §5
 * ("Brand Identity" — glass that floats, never boxes).
 *
 * level={1} → header pills, weather pill, Friend orb capsule
 * level={2} → search bar, Friend section container, Content Feed cards
 *
 * Every Segment 1 surface reuses this instead of re-declaring blur/shadow/
 * border values per-component (§14 reusable-components note).
 */
import styles from './GlassSurface.module.css';

export default function GlassSurface({
  level = 1,
  as: Tag = 'div',
  className = '',
  style,
  children,
  ...rest
}) {
  const levelClass = level === 2 ? styles.level2 : styles.level1;
  return (
    <Tag className={`${styles.surface} ${levelClass} ${className}`} style={style} {...rest}>
      {children}
    </Tag>
  );
}
