import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Lottie from "lottie-react";

// Import Lottie animations
import sunAnimation from "@/assets/lottie/sun.json";
import cloudAnimation from "@/assets/lottie/cloud.json";
import rainAnimation from "@/assets/lottie/rain.json";
import stormAnimation from "@/assets/lottie/storm.json";

interface WeatherCardProps {
  location: string; // e.g., "Austin,TX"
}

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ location }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_WEATHER_API_BASE_URL;

  useEffect(() => {
    async function loadWeather() {
      setLoading(true);
      setError(null);
      try {
        const lat = 40.7128;
        const lon = -74.006;

        const url = `${API_URL}/api/weather?lat=${lat}&lon=${lon}`;

        const response = await axios.get(url);
        const data = response.data.data.values;

        console.log(data);

        const weatherInfo: WeatherData = {
          temperature: data.temperature,
          condition: getConditionLabel(data.weatherCode),
          icon: getConditionIcon(data.weatherCode),
        };

        setWeather(weatherInfo);
      } catch (err) {
        setError("Failed to fetch weather data.");
      } finally {
        setLoading(false);
      }
    }
    loadWeather();
  }, []);

  /*

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = import.meta.env.VITE_TOMORROW_API_KEY;
        const url = `https://api.tomorrow.io/v4/weather/realtime?location=${encodeURIComponent(
          location
        )}&apikey=${apiKey}`;

        const response = await axios.get(url);
        const data = response.data.data.values;

        const weatherInfo: WeatherData = {
          temperature: data.temperature,
          condition: getConditionLabel(data.weatherCode),
          icon: getConditionIcon(data.weatherCode),
        };

        setWeather(weatherInfo);
      } catch (err) {
        setError("Failed to fetch weather data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  */

  const getConditionLabel = (code: number): string => {
    const codes: Record<number, string> = {
      1000: "Clear",
      1100: "Mostly Clear",
      1101: "Partly Cloudy",
      1102: "Cloudy",
      4000: "Drizzle",
      4200: "Light Rain",
      4201: "Heavy Rain",
      5000: "Snow",
      8000: "Thunderstorm",
    };
    return codes[code] || "Unknown";
  };

  const getConditionIcon = (code: number): string => {
    if (code >= 4000 && code < 5000) return "rain";
    if (code >= 1000 && code < 1103) return "sun";
    if (code === 8000) return "storm";
    return "cloud";
  };

  const getAnimation = (icon: string) => {
    switch (icon) {
      case "sun":
        return sunAnimation;
      case "rain":
        return rainAnimation;
      case "storm":
        return stormAnimation;
      default:
        return cloudAnimation;
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto shadow-lg rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-center text-lg font-semibold">
          Weather in {location}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-2 p-4">
        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : weather ? (
          <>
            <Lottie
              animationData={getAnimation(weather.icon)}
              loop
              className="w-32 h-32"
            />
            <p className="text-2xl font-bold">
              {weather.temperature.toFixed(1)}°C
            </p>
            <p className="text-gray-600">{weather.condition}</p>
          </>
        ) : (
          <p className="text-gray-400">No data available.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
