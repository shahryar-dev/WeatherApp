// src/services/api.js
export const fetchWeather = async (city) => {
  try {
    // 1. Get Geolocation of the city
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found");
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // 2. Fetch current weather and daily forecast
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
    const weatherData = await weatherRes.json();

    return { 
      location: `${name}, ${country}`, 
      current: weatherData.current,
      daily: weatherData.daily
    };
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};
// Add this below your existing fetchWeather function in src/services/api.js

export const fetchCitySuggestions = async (query) => {
  // Only search if the user has typed at least 2 characters
  if (!query || query.length < 2) return []; 
  
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Suggestion API Error:", error);
    return [];
  }
};