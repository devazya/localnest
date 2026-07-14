/**
 * useWeather.js
 * ---------------------------------------------------------------------
 * Resolves the user's coordinates via the browser Geolocation API, then
 * fetches live temperature/condition/AQI from services/weather.js. No
 * hardcoded weather values — the only fallback is the coordinate used
 * *when geolocation is denied/unavailable*, so the pill still shows real
 * (if less precise) weather for the app's Bangalore/Spice Garden scope
 * rather than nothing at all.
 *
 * Returns { status: 'loading' | 'success' | 'error', tempC, condition, aqi, aqiLabel }
 * — the exact shape WeatherPill/HeroSection already consume.
 */
import { useState, useEffect } from 'react';
import { fetchWeather } from '../services/weather';

// Only used if the browser can't/won't provide a real position — this is
// a location fallback, not a weather fallback (temperature/AQI below are
// still fetched live for this coordinate).
const BANGALORE_FALLBACK = { lat: 12.9716, lon: 77.5946 };

const REFRESH_MS = 15 * 60 * 1000; // 15 min — weather doesn't need to poll often

function getCoords() {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(BANGALORE_FALLBACK);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(BANGALORE_FALLBACK),
      { timeout: 5000, maximumAge: 10 * 60 * 1000 }
    );
  });
}

export function useWeather() {
  const [state, setState] = useState({
    status: 'loading',
    tempC: null,
    condition: null,
    aqi: null,
    aqiLabel: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, status: 'loading' }));
      try {
        const { lat, lon } = await getCoords();
        const data = await fetchWeather(lat, lon);
        if (!cancelled) setState({ status: 'success', ...data });
      } catch (err) {
        console.error('[useWeather] failed to load weather:', err);
        if (!cancelled) setState((s) => ({ ...s, status: 'error' }));
      }
    }

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return state;
}
