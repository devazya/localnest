/**
 * HeroPhoto.jsx
 * Time-aware hero background that crossfades between three pre-generated
 * illustration keyframes based on the real current hour:
 *
 *   hero-day.webp     — 8 AM → 4 PM   (bright daytime, current image)
 *   hero-golden.webp  — 4 PM → 8 PM + 5 AM → 8 AM  (golden hour sunrise/sunset)
 *   hero-night.webp   — 8 PM → 5 AM   (night, moonlit, street lamps)
 *
 * Loading strategy — zero lag:
 *   1. Only the CURRENT bucket image loads at first paint (high priority).
 *   2. After 4 seconds of idle, the two adjacent bucket images are
 *      prefetched silently into browser cache via requestIdleCallback.
 *   3. Crossfade is a CSS opacity transition (GPU composited, ~free).
 *   4. A ~1KB base64 blurred placeholder paints instantly as background
 *      so there is never a blank flash while the ~65KB real file streams in.
 *
 * The sun/moon SVG arc overlay (CelestialArcOverlay.jsx) sits on top of
 * this component unchanged — it doesn't know or care which image is below it.
 */
import { useEffect, useRef, useState } from 'react';
import styles from './HeroPhoto.module.css';

// ── Time bucket logic ──────────────────────────────────────────────────────
// Returns which image key to show for a given hour (0–23).
function getBucket(hour) {
  if (hour >= 5 && hour < 8)  return 'golden';   // sunrise
  if (hour >= 8 && hour < 16) return 'day';       // daytime
  if (hour >= 16 && hour < 20) return 'golden';   // sunset
  return 'night';                                  // 8 PM – 5 AM
}

// ── Asset registry ─────────────────────────────────────────────────────────
// Only add 'night' once you have the image. The fallback keeps 'day' showing
// if a file hasn't been dropped into public/images/ yet.
const ASSETS = {
  day: {
    src: '/images/home-hero.webp',
    placeholder: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAASABgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDpDYJ6UxrBfSsWy1rU0Znmh3wHkySDaqj8aSTxLdz2zTW8K4ThlU5Ye5HXFR9ZknuaOETXNiPSiufm129myTIgTGCoIGQRz70Vr9ZmhKnB6jpZpWuNhkcqWwVLHFZMpMeqqYyUO7+HiiivOp7M0nuhmpgb5OBRRRXRDY55bn//2Q==',
  },
  golden: {
    src: '/images/home-hero-golden.webp',
    placeholder: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAASABgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCX+zh6Uh04f3aoWeq6mhMjoHhPJkkGFXHvSy69eTW7SwxoAvDBeSPcj0rg9viE7XR6XPT7FptPXHSisuTVbuYkmRNoGCoIGaK3Vat1ZDlS7CwSyPchGkdkJxtLEis+YmPU02Er838PFFFctPqTPoM1ADzJKKKK64bHLPc//9k=',
  },
  night: {
    src: '/images/home-hero-night.webp',
    placeholder: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAASABgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDhdlG2rCxyBQ7JhD/E3AoVXkjLxqDt6gckV0c0SNSvsoqfaTk5XA60UuaIWY+zZvtKjccemajmZkuyUJU7uxxRRRS3LWxHL940UUUEn//Z',
  },
};

// Which buckets to prefetch after first paint — the two others
function getAdjacentBuckets(current) {
  const all = ['day', 'golden', 'night'];
  return all.filter(b => b !== current);
}

function prefetchImages(buckets) {
  if (typeof window === 'undefined') return;
  const cb = () => {
    buckets.forEach(bucket => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'image';
      link.href = ASSETS[bucket].src;
      document.head.appendChild(link);
    });
  };
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(cb, { timeout: 4000 });
  } else {
    setTimeout(cb, 4000);
  }
}

export default function HeroPhoto() {
  const hour = new Date().getHours();
  const [activeBucket, setActiveBucket] = useState(() => getBucket(hour));
  const [prevBucket, setPrevBucket] = useState(null);
  const [fading, setFading] = useState(false);
  const timerRef = useRef(null);

  // Check every minute if the bucket has changed
  useEffect(() => {
    prefetchImages(getAdjacentBuckets(activeBucket));

    timerRef.current = setInterval(() => {
      const newBucket = getBucket(new Date().getHours());
      if (newBucket !== activeBucket) {
        setPrevBucket(activeBucket);
        setActiveBucket(newBucket);
        setFading(true);
        setTimeout(() => {
          setPrevBucket(null);
          setFading(false);
        }, 1200); // match CSS transition duration
      }
    }, 60000);

    return () => clearInterval(timerRef.current);
  }, [activeBucket]);

  const active = ASSETS[activeBucket];
  const prev = prevBucket ? ASSETS[prevBucket] : null;

  return (
    <div
      className={styles.wrap}
      style={{ backgroundImage: `url(${active.placeholder})` }}
    >
      {/* Previous image fades out */}
      {prev && (
        <img
          key={prevBucket}
          src={prev.src}
          alt=""
          role="presentation"
          width={900}
          height={692}
          className={`${styles.img} ${fading ? styles.fadeOut : ''}`}
        />
      )}

      {/* Current image fades in */}
      <img
        key={activeBucket}
        src={active.src}
        alt=""
        role="presentation"
        width={900}
        height={692}
        fetchPriority="high"
        loading="eager"
        decoding="async"
        className={`${styles.img} ${fading ? styles.fadeIn : styles.visible}`}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    </div>
  );
}
