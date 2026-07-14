/**
 * weather.js
 * ---------------------------------------------------------------------
 * Live weather + air quality for the Segment 1 WeatherPill. Uses
 * Open-Meteo (no API key required) — one call for temperature/weather
 * code, one for US AQI. No caching layer yet; the hook that calls this
 * decides fetch frequency.
 */

// WMO weather codes -> the exact condition labels WeatherPill's
// CONDITION_ICON map already expects. Keep these two files in sync.
const WEATHER_CODE_LABEL = {
  0: 'Clear',
  1: 'Mostly Clear',
  2: 'Partly Cloudy',
  3: 'Cloudy',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Light Drizzle',
  53: 'Drizzle',
  55: 'Heavy Drizzle',
  56: 'Light Drizzle',
  57: 'Heavy Drizzle',
  61: 'Light Rain',
  63: 'Rain',
  65: 'Heavy Rain',
  66: 'Light Rain',
  67: 'Heavy Rain',
  71: 'Light Snow',
  73: 'Snow',
  75: 'Heavy Snow',
  77: 'Light Snow',
  80: 'Rain Showers',
  81: 'Rain Showers',
  82: 'Heavy Showers',
  85: 'Light Snow',
  86: 'Heavy Snow',
  95: 'Thunderstorm',
  96: 'Thunderstorm',
  99: 'Thunderstorm',
};

function labelForWeatherCode(code) {
  return WEATHER_CODE_LABEL[code] || 'Partly Cloudy';
}

// Standard US AQI breakpoints.
function labelForUsAqi(aqi) {
  if (aqi == null) return null;
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

/**
 * fetchWeather(lat, lon) -> Promise<{ tempC, condition, aqi, aqiLabel }>
 * Throws on network/API failure — the caller (useWeather) is responsible
 * for catching and surfacing a quiet fallback state.
 */
export async function fetchWeather(lat, lon) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;

  const [weatherRes, aqiRes] = await Promise.all([
    fetch(weatherUrl),
    fetch(aqiUrl).catch(() => null), // AQI is a nice-to-have — never blocks temperature/condition
  ]);

  if (!weatherRes.ok) throw new Error(`Weather API responded ${weatherRes.status}`);
  const weatherData = await weatherRes.json();

  let aqi = null;
  if (aqiRes && aqiRes.ok) {
    const aqiData = await aqiRes.json();
    aqi = aqiData?.current?.us_aqi ?? null;
  }

  const tempC = weatherData?.current?.temperature_2m;
  const condition = labelForWeatherCode(weatherData?.current?.weather_code);

  if (tempC == null) throw new Error('Weather API returned no temperature');

  return {
    tempC: Math.round(tempC),
    condition,
    aqi: aqi != null ? Math.round(aqi) : null,
    aqiLabel: labelForUsAqi(aqi),
  };
}
