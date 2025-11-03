import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrashIcon } from "@/components/ui/TrashIcon";
import Lottie from "lottie-react";
import type { LottieRefCurrentProps } from "lottie-react";

// Import Lottie animations
import sunAnimation from "@/assets/lottie/sun.json";
import cloudAnimation from "@/assets/lottie/cloud.json";
import rainAnimation from "@/assets/lottie/rain.json";
import stormAnimation from "@/assets/lottie/storm.json";
import windAnimation from "@/assets/lottie/wind.json";
import snowAnimation from "@/assets/lottie/snow.json";
import rainWindAnimation from "@/assets/lottie/rain-wind.json";

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

  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const API_URL = import.meta.env.VITE_WEATHER_API_BASE_URL;

  const getConditionLabel = (code: number): string => {
    const codes: Record<number, string> = {
      0: "Unknown",
      1000: "Clear, Sunny",
      1100: "Mostly Clear",
      1101: "Partly Cloudy",
      1102: "Mostly Cloudy",
      1001: "Cloudy",
      2000: "Fog",
      2100: "Light Fog",
      4000: "Drizzle",
      4001: "Rain",
      4200: "Light Rain",
      4201: "Heavy Rain",
      5000: "Snow",
      5001: "Flurries",
      5100: "Light Snow",
      5101: "Heavy Snow",
      6000: "Freezing Drizzle",
      6001: "Freezing Rain",
      6200: "Light Freezing Rain",
      6201: "Heavy Freezing Rain",
      7000: "Ice Pellets",
      7101: "Heavy Ice Pellets",
      7102: "Light Ice Pellets",
      8000: "Thunderstorm",
    };
    return codes[code] || "Unknown";
  };

  const getConditionIcon = (code: number, windSpeed: number): string => {
    if (code >= 4000 && code < 5000) {
      if (windSpeed > 40) {
        return "rain-wind";
      } else {
        return "rain";
      }
    }
    if (code == 1000 || code == 1100) return "sun";
    if (code >= 5000 && code < 8000) return "snow";
    if (code === 8000) return "storm";
    if (windSpeed > 40) {
      return "wind;";
    }
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
      case "snow":
        return snowAnimation;
      case "wind":
        return windAnimation;
      case "rain-wind":
        return rainWindAnimation;
      default:
        return cloudAnimation;
    }
  };

  const handleDelete = () => {};

  if (import.meta.env.DEV) {
    useEffect(() => {
      const weatherInfo: WeatherData = {
        temperature: 16.7,
        condition: getConditionLabel(1001),
        icon: getConditionIcon(1001, 41),
      };

      setWeather(weatherInfo);
    }, []);
    return (
      <Card
        className="w-full max-w-sm mx-auto shadow-lg rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200"
        onMouseEnter={() => {
          lottieRef.current?.play();
        }}
        onMouseLeave={() => {
          lottieRef.current?.stop();
        }}
      >
        <CardHeader className="flex flex-row place-content-between ">
          <CardTitle className="text-center text-lg font-semibold">
            Weather in {location}
          </CardTitle>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <TrashIcon className="h-4 w-4"></TrashIcon>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-2 p-4">
          {weather ? (
            <>
              <Lottie
                animationData={getAnimation(weather.icon)}
                loop
                autoplay={false}
                lottieRef={lottieRef}
                className="w-32 h-32"
              />
              <p className="text-2xl font-bold">
                {weather.temperature.toFixed(1)}°C |{" "}
                {((weather.temperature * 9) / 5 + 32).toFixed(1)}°F
              </p>
              <p className="text-gray-600">{weather.condition}</p>
            </>
          ) : (
            <p className="text-gray-400">No data available.</p>
          )}
        </CardContent>
      </Card>
    );
  } else {
    useEffect(() => {
      async function loadWeather() {
        setLoading(true);
        setError(null);
        try {
          // const lat = 43.0755;
          // const lon = 89.4155;

          const url = `${API_URL}/api/weather?loc=${location}`;

          const response = await axios.get(url);
          const data = response.data.data.values;

          console.log(data);

          const weatherInfo: WeatherData = {
            temperature: data.temperature,
            condition: getConditionLabel(data.weatherCode),
            icon: getConditionIcon(data.weatherCode, data.windSpeed),
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
    return (
      <Card
        className="w-full max-w-sm mx-auto shadow-lg rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200"
        onMouseEnter={() => lottieRef.current?.play()}
        onMouseLeave={() => lottieRef.current?.stop()}
      >
        <CardHeader>
          <CardTitle className="text-center text-lg font-semibold">
            Weather in {location}
          </CardTitle>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <TrashIcon className="h-4 w-4"></TrashIcon>
          </Button>
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
                autoplay={false}
                lottieRef={lottieRef}
                className="w-32 h-32"
              />
              <p className="text-2xl font-bold">
                {weather.temperature.toFixed(1)}°C |{" "}
                {((weather.temperature * 9) / 5 + 32).toFixed(1)}°F
              </p>
              <p className="text-gray-600">{weather.condition}</p>
            </>
          ) : (
            <p className="text-gray-400">No data available.</p>
          )}
        </CardContent>
      </Card>
    );
  }
};

export default WeatherCard;
