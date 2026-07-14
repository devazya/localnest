/**
 * HeroSection.jsx — §3, §4, §7
 * The hero now renders the illustrated neighbourhood panorama (with its
 * real-time sun-arc overlay) instead of a flat gradient wash. The floating
 * header sits on top of the illustration; the weather card overlaps its
 * bottom-right corner, floating up out of the image into the white content
 * below (per the target design). Greeting + search bar remain below the
 * image on the plain background, unchanged in spirit from the original
 * gradient-wash build.
 *
 * `.heroImageClip` (not `.heroBg` itself) owns `overflow: hidden` + the
 * rounded bottom corners, so the illustration is clipped to the hero frame
 * while the weather card — an absolutely-positioned sibling inside the
 * unclipped `.heroBg` — can still overlap outside that frame.
 *
 * The search bar overlaps the hero/content boundary by exactly 32px (§4).
 */
import { motion, useReducedMotion } from 'framer-motion';
import FloatingHeader from './FloatingHeader';
import Greeting from './Greeting';
import WeatherPill from './WeatherPill';
import HeroPhoto from './HeroPhoto';
import CelestialArcOverlay from './CelestialArcOverlay';
import { fadeRise } from '../../../animations/segment1Entrance';
import { useWeather } from '../../../hooks/useWeather';
import styles from './HeroSection.module.css';

export default function HeroSection({
  name, locality, city, nearbyPostCount,
  onNotificationsClick, onSearchActivate, onMicClick,
  onBookmarkClick,
}) {
  const reduced = useReducedMotion();
  const weather = useWeather(); // live temp/condition/AQI — no hardcoded defaults

  return (
    <>
      <div className={styles.heroBg}>
        <div className={styles.heroImageClip}>
          <HeroPhoto />
          <CelestialArcOverlay />

          <motion.div {...fadeRise(0, reduced)}>
            <FloatingHeader
              locality={locality}
              city={city}
              nearbyPostCount={nearbyPostCount}
              onNotificationsClick={onNotificationsClick}
              onBookmarkClick={onBookmarkClick}
            />
          </motion.div>

          {/* Masks a thin rendering seam that can appear at this container's
              clipped bottom edge (a known browser compositing artifact where
              overflow:hidden meets a blended/animated child) — paints over
              it with the exact page background colour so it's invisible
              regardless of the underlying cause. */}
          <div className={styles.seamMask} aria-hidden="true" />
        </div>

        <motion.div {...fadeRise(1, reduced)} className={styles.weatherCardWrap}>
          <WeatherPill
            loading={weather.status === 'loading'}
            tempC={weather.tempC}
            condition={weather.condition}
            aqi={weather.aqi}
            aqiLabel={weather.aqiLabel}
          />
        </motion.div>
      </div>

      <motion.div {...fadeRise(1, reduced)} className={styles.greetingRow}>
        <Greeting name={name} />
      </motion.div>

      {/* Search bar removed from Home per product decision — SearchBar.jsx
          itself is untouched, this is just not rendering it here. */}
    </>
  );
}
