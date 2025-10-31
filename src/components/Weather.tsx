import { useEffect, useState } from "react";

interface WeatherData {
  data: {
    values: { temperature: number; humidity: number };
    time: string;
  };
}

function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const API_URL = import.meta.env.VITE_WEATHER_API_BASE_URL;

  useEffect(() => {
    async function loadWeather() {
      const lat = 40.7128;
      const lon = -74.006;
      const res = await fetch(`${API_URL}/api/weather?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      setWeather(data);
    }
    loadWeather();
  }, []);

  if (!weather) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>NYC Weather</h1>
      <p>Temperature: {weather.data.values.temperature} °C</p>
      <p>Humidity: {weather.data.values.humidity} %</p>
      <small>Updated: {new Date(weather.data.time).toLocaleTimeString()}</small>
    </div>
  );
}

export default Weather;
