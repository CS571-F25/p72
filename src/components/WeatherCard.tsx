import React, { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TrashIcon } from "@/components/ui/TrashIcon";
import Lottie from "lottie-react";
import { LocationContext } from "@/contexts/LocationContext";
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
  name: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  windSpeed?: number;
  humidity?: number;
  feelsLike?: number;
  visibility?: number;
  pressure?: number;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ location, name }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locations = useContext(LocationContext);

  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [editingName, setEditingName] = useState(false);
  const [customName, setCustomName] = useState(name);
  const [expanded, setExpanded] = useState(false);

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

  const handleDelete = () => {
    // remove location from localstorage and update context
    const newLocations = locations?.data.filter((loc) => {
      return loc.location != location;
    });

    localStorage.setItem("locations", JSON.stringify(newLocations));

    if (newLocations != undefined) locations?.updateData(newLocations);
  };

  const handleSaveName = () => {
    setEditingName(false);
    // Update the location in the context with the new custom name
    if (locations) {
      const updatedLocations = locations.data.map((loc) => {
        if (loc.location === location) {
          return { ...loc, name: customName };
        }
        return loc;
      });
      localStorage.setItem("locations", JSON.stringify(updatedLocations));
      locations.updateData(updatedLocations);
    }
  };

  const handleCancelName = () => {
    setCustomName(name);
    setEditingName(false);
  };

  if (import.meta.env.DEV) {
    useEffect(() => {
      const weatherInfo: WeatherData = {
        temperature: 16.7,
        condition: getConditionLabel(1001),
        icon: getConditionIcon(1001, 41),
        windSpeed: 12.5,
        humidity: 65,
        feelsLike: 15.2,
        visibility: 10000,
        pressure: 1013.25,
      };

      setWeather(weatherInfo);
    }, []);
    return (
      <Card
        className="w-full h-full shadow-lg rounded-2xl bg-gradient-to-br from-white/80 to-white/60 dark:from-[#0b1220]/80 dark:to-[#0b1220]/60 backdrop-blur-md border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-shadow"
        onMouseEnter={() => {
          lottieRef.current?.play();
        }}
        onMouseLeave={() => {
          lottieRef.current?.stop();
        }}
      >
        <CardHeader className="flex flex-row place-content-between pb-3 border-b border-gray-200 dark:border-gray-700">
          {editingName ? (
            <div className="flex gap-2 flex-1">
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter custom name"
                className="flex-1"
              />
              <Button size="sm" onClick={handleSaveName}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelName}>
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <CardTitle
                className="text-center text-lg font-semibold cursor-pointer hover:text-primary transition-colors flex items-center justify-center gap-2 group"
                onClick={() => setEditingName(true)}
              >
                Weather in {customName ? customName : location}
                <svg
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </CardTitle>
              <Button variant="destructive" size="icon" onClick={handleDelete}>
                <TrashIcon className="h-4 w-4"></TrashIcon>
              </Button>
            </>
          )}
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
          {weather ? (
            <>
              <Lottie
                animationData={getAnimation(weather.icon)}
                loop
                autoplay={false}
                lottieRef={lottieRef}
                className="w-32 h-32"
              />
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500">
                {weather.temperature.toFixed(1)}°C
              </p>
              <p className="text-sm text-muted-foreground">
                {((weather.temperature * 9) / 5 + 32).toFixed(1)}°F
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
                {weather.condition}
              </p>
            </>
          ) : (
            <p className="text-gray-400">No data available.</p>
          )}
        </CardContent>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-6 py-3 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <span className="text-sm font-medium">
              {expanded ? "Hide Details" : "Show Details"}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
          {expanded && weather && (
            <div className="px-6 py-4 bg-black/2 dark:bg-white/5 space-y-3 border-t border-gray-200 dark:border-gray-700">
              {weather.feelsLike !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Feels Like
                  </span>
                  <span className="text-sm font-semibold">
                    {weather.feelsLike.toFixed(1)}°C
                  </span>
                </div>
              )}
              {weather.humidity !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Humidity
                  </span>
                  <span className="text-sm font-semibold">
                    {weather.humidity}%
                  </span>
                </div>
              )}
              {weather.windSpeed !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Wind Speed
                  </span>
                  <span className="text-sm font-semibold">
                    {weather.windSpeed.toFixed(1)} m/s
                  </span>
                </div>
              )}
              {weather.visibility !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Visibility
                  </span>
                  <span className="text-sm font-semibold">
                    {(weather.visibility / 1000).toFixed(1)} km
                  </span>
                </div>
              )}
              {weather.pressure !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Pressure
                  </span>
                  <span className="text-sm font-semibold">
                    {weather.pressure.toFixed(0)} hPa
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
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

          const weatherInfo: WeatherData = {
            temperature: data.temperature,
            condition: getConditionLabel(data.weatherCode),
            icon: getConditionIcon(data.weatherCode, data.windSpeed),
            windSpeed: data.windSpeed,
            humidity: data.humidity,
            feelsLike: data.feelsLike,
            visibility: data.visibility,
            pressure: data.pressureSurfaceLevel,
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
        className="w-full h-full shadow-lg rounded-2xl bg-gradient-to-br from-white/80 to-white/60 dark:from-[#0b1220]/80 dark:to-[#0b1220]/60 backdrop-blur-md border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-shadow"
        onMouseEnter={() => lottieRef.current?.play()}
        onMouseLeave={() => lottieRef.current?.stop()}
      >
        <CardHeader>
          {editingName ? (
            <div className="flex gap-2 flex-1">
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter custom name"
                className="flex-1"
              />
              <Button size="sm" onClick={handleSaveName}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelName}>
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <CardTitle
                className="text-center text-lg font-semibold cursor-pointer hover:text-primary transition-colors flex items-center justify-center gap-2 group"
                onClick={() => setEditingName(true)}
              >
                Weather in {customName ? customName : location}
                <svg
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </CardTitle>
              <Button variant="destructive" size="icon" onClick={handleDelete}>
                <TrashIcon className="h-4 w-4"></TrashIcon>
              </Button>
            </>
          )}
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
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
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500">
                {weather.temperature.toFixed(1)}°C
              </p>
              <p className="text-sm text-muted-foreground">
                {((weather.temperature * 9) / 5 + 32).toFixed(1)}°F
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
                {weather.condition}
              </p>
            </>
          ) : (
            <p className="text-gray-400">No data available.</p>
          )}
        </CardContent>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-6 py-3 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <span className="text-sm font-medium">
              {expanded ? "Hide Details" : "Show Details"}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
          {expanded && weather && (
            <div className="px-6 py-4 bg-black/2 dark:bg-white/5 space-y-3 border-t border-gray-200 dark:border-gray-700">
              {weather.feelsLike !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Feels Like
                  </span>
                  <span className="text-sm font-semibold">
                    {weather.feelsLike.toFixed(1)}°C
                  </span>
                </div>
              )}
              {weather.humidity !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Humidity
                  </span>
                  <span className="text-sm font-semibold">
                    {weather.humidity}%
                  </span>
                </div>
              )}
              {weather.windSpeed !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Wind Speed
                  </span>
                  <span className="text-sm font-semibold">
                    {weather.windSpeed.toFixed(1)} m/s
                  </span>
                </div>
              )}
              {weather.visibility !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Visibility
                  </span>
                  <span className="text-sm font-semibold">
                    {(weather.visibility / 1000).toFixed(1)} km
                  </span>
                </div>
              )}
              {weather.pressure !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Pressure
                  </span>
                  <span className="text-sm font-semibold">
                    {weather.pressure.toFixed(0)} hPa
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }
};

export default WeatherCard;
