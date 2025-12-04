import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useMemo,
  lazy,
  Suspense,
} from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TrashIcon } from "@/components/ui/TrashIcon";
import Lottie from "lottie-react";
import Tooltip from "@/components/ui/Tooltip";
import { InfoIcon } from "@/components/ui/InfoIcon";
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
  disableDelete?: boolean;
}

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  windSpeed?: number;
  windGust?: number;
  windDirection?: number;
  humidity?: number;
  feelsLike?: number;
  visibility?: number;
  pressureSurfaceLevel?: number;
  pressureSeaLevel?: number;
  precipitationProbability?: number;
  cloudCover?: number;
  dewPoint?: number;
  altimeterSetting?: number;
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  location,
  name,
  disableDelete = false,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locations = useContext(LocationContext);

  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [editingName, setEditingName] = useState(false);
  const [customName, setCustomName] = useState(name || "");
  const [expanded, setExpanded] = useState(false);
  const [loadHourly, setLoadHourly] = useState(false);
  const detailsWrapperRef = useRef<HTMLDivElement | null>(null);
  const detailsContentRef = useRef<HTMLDivElement | null>(null);
  const [detailsMaxHeight, setDetailsMaxHeight] = useState(0);
  const detailsId = useMemo(
    () => `details-${(location || "").replace(/[^a-z0-9_-]+/gi, "-")}`,
    [location]
  );

  const HourlyForecast = lazy(() => import("@/components/HourlyForecast"));
  const parts = (location || "").split(",").map((s) => s.trim());
  const latN = Number(parts[0]);
  const lonN = Number(parts[1]);
  const valid = !Number.isNaN(latN) && !Number.isNaN(lonN);

  useEffect(() => {
    // Measure details content whenever the details region is opened or
    // when the hourly content is loaded. Use ResizeObserver when available
    // to react to internal content changes (e.g. lazy-loaded children).
    const content = detailsContentRef.current;
    if (!content) return;

    const update = () => {
      const c = detailsContentRef.current;
      if (c) setDetailsMaxHeight(c.scrollHeight);
    };

    // measure now if expanded
    if (expanded) update();

    let ro: ResizeObserver | null = null;
    if (typeof (window as any).ResizeObserver !== "undefined") {
      ro = new (window as any).ResizeObserver(() => update());
      ro?.observe(content);
    } else {
      window.addEventListener("resize", update);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", update);
    };
  }, [expanded, loadHourly]);

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

  const degreesToCardinal = (deg: number) => {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    const index = Math.round((deg % 360) / 22.5) % 16;
    return directions[index];
  };

  const detailDescriptions: Record<string, string> = {
    feelsLike: "Perceived temperature accounting for wind and humidity.",
    dewPoint: "Temperature at which air becomes saturated and dew forms.",
    humidity: "Relative humidity as a percentage of water vapor in air.",
    precipProb: "Chance of precipitation occurring during the period.",
    wind: "Wind speed and gusts measured in meters per second.",
    windDir: "Wind direction shown as compass and degrees.",
    visibility: "Horizontal visibility distance (meters or kilometers).",
    cloudCover: "Percentage of sky covered by clouds.",
    pressure: "Atmospheric pressure at sea/surface level in hPa.",
    altimeter: "Altimeter setting used by aircraft pilots (hPa).",
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
    const trimmedName = customName.trim().slice(0, 100);
    // Update the location in the context with the new custom name
    if (locations) {
      const updatedLocations = locations.data.map((loc) => {
        if (loc.location === location) {
          return { ...loc, name: trimmedName };
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
          windGust: data.windGust,
          windDirection: data.windDirection,
          humidity: data.humidity,
          feelsLike: data.temperatureApparent ?? data.temperature,
          visibility: data.visibility,
          pressureSurfaceLevel: data.pressureSurfaceLevel,
          pressureSeaLevel: data.pressureSeaLevel ?? data.pressureSurfaceLevel,
          precipitationProbability: data.precipitationProbability,
          cloudCover: data.cloudCover,
          dewPoint: data.dewPoint,
          altimeterSetting: data.altimeterSetting,
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
      className="w-full self-start shadow-lg rounded-2xl bg-gradient-to-br from-white/80 to-white/60 dark:from-[#0b1220]/80 dark:to-[#0b1220]/60 backdrop-blur-md border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-shadow"
      onMouseEnter={() => lottieRef.current?.play()}
      onMouseLeave={() => lottieRef.current?.stop()}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
        {editingName ? (
          <div className="flex gap-2 flex-1 min-w-0">
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter custom name"
              className="flex-1 min-w-0"
            />
            <Button
              size="sm"
              onClick={handleSaveName}
              className="flex-shrink-0"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelName}
              className="flex-shrink-0"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <CardTitle
              className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors flex items-center gap-2 group flex-1 min-w-0 "
              onClick={() => setEditingName(true)}
              title={`Weather in ${customName ? customName : location}`}
            >
              <span className="line-clamp-3">
                Weather in {customName ? customName : location}
              </span>
              <svg
                className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
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
            {!disableDelete && (
              <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                className="flex-shrink-0"
              >
                <span className="sr-only">Delete Card</span>{" "}
                {/* Text for screen readers */}
                <TrashIcon className="h-4 w-4"></TrashIcon>
              </Button>
            )}
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
              animationData={JSON.parse(
                JSON.stringify(getAnimation(weather.icon))
              )}
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
          onClick={() => {
            const next = !expanded;
            setExpanded(next);
            if (next) setLoadHourly(true);
          }}
          onMouseEnter={() => {
            // warm HourlyForecast chunk so Suspense fallback is rarely visible
            import("@/components/HourlyForecast");
          }}
          aria-expanded={expanded}
          aria-controls={detailsId}
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
        <div
          ref={detailsWrapperRef}
          id={detailsId}
          role="region"
          aria-label={`Details for ${customName ? customName : location}`}
          style={{
            maxHeight: expanded ? `${detailsMaxHeight}px` : "0px",
            overflow: "hidden",
            transition: "max-height 280ms ease",
          }}
        >
          <div
            ref={detailsContentRef}
            className="px-6 py-4 bg-black/2 dark:bg-white/5 space-y-3 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-2 gap-3">
              {weather && (
                <>
                  {weather.feelsLike !== undefined && (
                    <div className="flex flex-col">
                      <Tooltip content={detailDescriptions.feelsLike}>
                        <>
                          <span className="text-xs text-muted-foreground">
                            Feels Like
                          </span>
                          <InfoIcon className="ml-1 h-4 w-4 opacity-70" />
                        </>
                      </Tooltip>
                      <span className="text-sm font-semibold">
                        {weather.feelsLike.toFixed(1)}°C
                      </span>
                    </div>
                  )}

                  {weather.dewPoint !== undefined && (
                    <div className="flex flex-col">
                      <Tooltip content={detailDescriptions.dewPoint}>
                        <>
                          <span className="text-xs text-muted-foreground">
                            Dew Point
                          </span>
                          <InfoIcon className="ml-1 h-4 w-4 opacity-70" />
                        </>
                      </Tooltip>
                      <span className="text-sm font-semibold">
                        {weather.dewPoint.toFixed(1)}°C
                      </span>
                    </div>
                  )}

                  {weather.humidity !== undefined && (
                    <div className="flex flex-col">
                      <Tooltip content={detailDescriptions.humidity}>
                        <>
                          <span className="text-xs text-muted-foreground">
                            Humidity
                          </span>
                          <InfoIcon className="ml-1 h-4 w-4 opacity-70" />
                        </>
                      </Tooltip>
                      <span className="text-sm font-semibold">
                        {weather.humidity}%
                      </span>
                    </div>
                  )}

                  {weather.precipitationProbability !== undefined && (
                    <div className="flex flex-col">
                      <Tooltip content={detailDescriptions.precipProb}>
                        <>
                          <span className="text-xs text-muted-foreground">
                            Precip. Prob.
                          </span>
                          <InfoIcon className="ml-1 h-4 w-4 opacity-70" />
                        </>
                      </Tooltip>
                      <span className="text-sm font-semibold">
                        {Math.round(weather.precipitationProbability)}%
                      </span>
                    </div>
                  )}

                  {(weather.windSpeed !== undefined ||
                    weather.windGust !== undefined) && (
                    <div className="flex flex-col">
                      <Tooltip content={detailDescriptions.wind}>
                        <>
                          <span className="text-xs text-muted-foreground">
                            Wind
                          </span>
                          <InfoIcon className="ml-1 h-4 w-4 opacity-70" />
                        </>
                      </Tooltip>
                      <span className="text-sm font-semibold">
                        {weather.windSpeed !== undefined
                          ? `${weather.windSpeed.toFixed(1)} m/s`
                          : "-"}
                        {weather.windGust !== undefined
                          ? ` · Gust ${weather.windGust.toFixed(1)} m/s`
                          : ""}
                      </span>
                    </div>
                  )}

                  {weather.windDirection !== undefined && (
                    <div className="flex flex-col">
                      <Tooltip content={detailDescriptions.windDir}>
                        <>
                          <span className="text-xs text-muted-foreground">
                            Wind Dir.
                          </span>
                          <InfoIcon className="ml-1 h-4 w-4 opacity-70" />
                        </>
                      </Tooltip>
                      <span className="text-sm font-semibold">
                        {degreesToCardinal(weather.windDirection)} (
                        {Math.round(weather.windDirection)}°)
                      </span>
                    </div>
                  )}

                  {weather.visibility !== undefined && (
                    <div className="flex flex-col">
                      <Tooltip content={detailDescriptions.visibility}>
                        <>
                          <span className="text-xs text-muted-foreground">
                            Visibility
                          </span>
                          <InfoIcon className="ml-1 h-4 w-4 opacity-70" />
                        </>
                      </Tooltip>
                      <span className="text-sm font-semibold">
                        {weather.visibility > 1000
                          ? `${(weather.visibility / 1000).toFixed(1)} km`
                          : `${weather.visibility} km`}
                      </span>
                    </div>
                  )}

                  {weather.cloudCover !== undefined && (
                    <div className="flex flex-col">
                      <Tooltip content={detailDescriptions.cloudCover}>
                        <>
                          <span className="text-xs text-muted-foreground">
                            Cloud Cover
                          </span>
                          <InfoIcon className="ml-1 h-4 w-4 opacity-70" />
                        </>
                      </Tooltip>
                      <span className="text-sm font-semibold">
                        {Math.round(weather.cloudCover)}%
                      </span>
                    </div>
                  )}

                  {(weather.pressureSeaLevel ??
                    weather.pressureSurfaceLevel) !== undefined && (
                    <div className="flex flex-col">
                      <Tooltip content={detailDescriptions.pressure}>
                        <>
                          <span className="text-xs text-muted-foreground">
                            Pressure
                          </span>
                          <InfoIcon className="ml-1 h-4 w-4 opacity-70" />
                        </>
                      </Tooltip>
                      <span className="text-sm font-semibold">
                        {(weather.pressureSeaLevel ??
                          weather.pressureSurfaceLevel)!.toFixed(0)}{" "}
                        hPa
                      </span>
                    </div>
                  )}

                  {weather.altimeterSetting !== undefined && (
                    <div className="flex flex-col">
                      <Tooltip content={detailDescriptions.altimeter}>
                        <>
                          <span className="text-xs text-muted-foreground">
                            Altimeter
                          </span>
                          <InfoIcon className="ml-1 h-4 w-4 opacity-70" />
                        </>
                      </Tooltip>
                      <span className="text-sm font-semibold">
                        {weather.altimeterSetting.toFixed(2)} hPa
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            {valid && loadHourly && (
              <Suspense
                fallback={<div className="py-2">Loading hourly forecast…</div>}
              >
                <HourlyForecast lat={latN} lon={lonN} />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeatherCard;
