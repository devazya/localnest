/**
 * WeatherPill.jsx — §9.3
 * Floating white weather card (sun icon, temperature, condition + AQI).
 * Positioning/overlap with the hero image is owned by the parent
 * (`HeroSection`'s `.weatherCardWrap`) — this component only renders the
 * card itself, non-interactive (§2), with the temperature ticking up on
 * load via the existing AnimatedNumber spring-tween component from the
 * Community module rather than a second number-tween implementation.
 */
import AnimatedNumber from '../../community/AnimatedNumber';
import GlassSurface from '../../shared/GlassSurface';
import styles from './WeatherPill.module.css';

export default function WeatherPill({ tempC = 29, aqi = 58, condition = 'Sunny', aqiLabel = 'Good' }) {
  return (
    <GlassSurface
      level={2}
      className={styles.card}
      role="img"
      aria-label={`Weather: ${tempC} degrees, ${condition}, Air quality index ${aqi}, ${aqiLabel}`}
    >
      <div className={styles.topRow}>
        <span className={styles.sunIcon} aria-hidden="true">☀️</span>
        <span className={styles.temp}><AnimatedNumber value={tempC} />°</span>
      </div>
      <div className={styles.condition}>
        {condition} <span className={styles.chevron} aria-hidden="true">▾</span>
      </div>
      <div className={styles.aqi}>
        <span aria-hidden="true">🌿</span> AQI <AnimatedNumber value={aqi} /> • {aqiLabel}
      </div>
    </GlassSurface>
  );
}
