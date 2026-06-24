import styles from './HeroBackground.module.css';

export default function HeroBackground() {
  return (
    <div className={styles.bg} aria-hidden="true">
      {/* Radial glow orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      {/* Grid overlay */}
      <div className={styles.grid} />

      {/* Noise texture */}
      <div className={styles.noise} />

      {/* Bottom fade */}
      <div className={styles.fade} />
    </div>
  );
}
