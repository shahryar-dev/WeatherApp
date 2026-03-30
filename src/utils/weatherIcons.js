// src/utils/weatherIcons.js
export const getWeatherIcon = (code, isDay) => {
  // WMO Weather interpretation codes
  if (code === 0) return isDay ? 'sunny' : 'moon';
  if (code > 0 && code <= 3) return isDay ? 'partly-sunny' : 'cloudy-night';
  if (code >= 45 && code <= 48) return 'cloud'; // Fog
  if (code >= 51 && code <= 67) return 'rainy'; // Rain/Drizzle
  if (code >= 71 && code <= 77) return 'snow'; // Snow
  if (code >= 80 && code <= 82) return 'rainy'; // Rain showers
  if (code >= 95 && code <= 99) return 'thunderstorm'; // Thunderstorm
  return 'thermometer'; // Default
};