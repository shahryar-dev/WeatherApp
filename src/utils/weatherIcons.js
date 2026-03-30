
export const getWeatherIcon = (code, isDay) => {
 
  if (code === 0) return isDay ? 'sunny' : 'moon';
  if (code > 0 && code <= 3) return isDay ? 'partly-sunny' : 'cloudy-night';
  if (code >= 45 && code <= 48) return 'cloud'; 
  if (code >= 51 && code <= 67) return 'rainy'; 
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rainy'; 
  if (code >= 95 && code <= 99) return 'thunderstorm'; 
  return 'thermometer'; 
};