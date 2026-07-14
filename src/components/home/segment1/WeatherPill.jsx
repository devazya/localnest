/**
 * WeatherPill.jsx — §9.3
 * Floating white weather card (icon, temperature, condition + AQI).
 * Renders live data only — see hooks/useWeather + services/weather.js
 * (Open-Meteo, no API key). No hardcoded temperature/condition defaults;
 * shows a skeleton while loading and a quiet fallback if the request fails.
 */
import AnimatedNumber from '../../community/AnimatedNumber';
import GlassSurface from '../../shared/GlassSurface';
import styles from './WeatherPill.module.css';

const CONDITION_ICON = {
  Clear: '☀️', 'Mostly Clear': '🌤️', 'Partly Cloudy': '⛅', Cloudy: '☁️',
  Foggy: '🌫️',
  'Light Drizzle': '🌦️', Drizzle: '🌦️', 'Heavy Drizzle': '🌧️',
  'Light Rain': '🌦️', Rain: '🌧️', 'Heavy Rain': '🌧️',
  'Light Snow': '🌨️', Snow: '❄️', 'Heavy Snow': '❄️',
  'Rain Showers': '🌦️', 'Heavy Showers': '🌧️',
  Thunderstorm: '⛈️',
};

export default function WeatherPill({ loading, tempC, condition, aqi, aqiLabel }) {
  if (loading || tempC == null) {
    return (
      <GlassSurface level={2} className={styles.card} aria-hidden="true">
        <div className={styles.skeletonLine} style={{ width: 46 }} />
        <div className={styles.skeletonLine} style={{ width: 60, marginTop: 6 }} />
        <div className={styles.skeletonLine} style={{ width: 70, marginTop: 6 }} />
      </GlassSurface>
    );
  }

  const icon = CONDITION_ICON[condition] || '🌤️';

  return (
    <GlassSurface
      level={2}
      className={styles.card}
      role="img"
      aria-label={`Weather: ${tempC} degrees, ${condition}${aqi != null ? `, Air quality index ${aqi}, ${aqiLabel}` : ''}`}
    >
      <div className={styles.topRow}>
        <span className={styles.sunIcon} aria-hidden="true">{icon}</span>
        <span className={styles.temp}><AnimatedNumber value={tempC} />°</span>
      </div>
      <div className={styles.condition}>
        {condition} <span className={styles.chevron} aria-hidden="true">▾</span>
      </div>
      {aqi != null && (
        <div className={styles.aqi}>
          <span aria-hidden="true">🌿</span> AQI <AnimatedNumber value={aqi} /> • {aqiLabel}
        </div>
      )}
    </GlassSurface>
  );
}
