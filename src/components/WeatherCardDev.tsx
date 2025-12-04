import React, {
  useLayoutEffect,
  useRef,
  useState,
  useContext,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TrashIcon } from "@/components/ui/TrashIcon";
import Lottie from "lottie-react";
import { LocationContext } from "@/contexts/LocationContext";
import type { LottieRefCurrentProps } from "lottie-react";
import Tooltip from "@/components/ui/Tooltip";
import { InfoIcon } from "@/components/ui/InfoIcon";

import sunAnimation from "@/assets/lottie/sun.json";
import cloudAnimation from "@/assets/lottie/cloud.json";
import rainAnimation from "@/assets/lottie/rain.json";
import stormAnimation from "@/assets/lottie/storm.json";
import windAnimation from "@/assets/lottie/wind.json";
import snowAnimation from "@/assets/lottie/snow.json";
import rainWindAnimation from "@/assets/lottie/rain-wind.json";

interface WeatherCardDevProps {
  location: string;
  name: string;
}

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

const WeatherCardDev: React.FC<WeatherCardDevProps> = ({ location, name }) => {
  const locations = useContext(LocationContext);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [editingName, setEditingName] = useState(false);
  const [customName, setCustomName] = useState(name || "");
  const [expanded, setExpanded] = useState(false);

  const detailsWrapperRef = useRef<HTMLDivElement | null>(null);
  const detailsContentRef = useRef<HTMLDivElement | null>(null);
  const [detailsMaxHeight, setDetailsMaxHeight] = useState(0);

  const detailsId = useMemo(
    () => `details-${(location || "").replace(/[^a-z0-9_-]+/gi, "-")}`,
    [location]
  );

  useLayoutEffect(() => {
    function updateHeight() {
      const content = detailsContentRef.current;
      if (content) setDetailsMaxHeight(content.scrollHeight);
    }

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const handleDelete = () => {
    const newLocations = locations?.data.filter((loc) => {
      return loc.location != location;
    });

    localStorage.setItem("locations", JSON.stringify(newLocations));

    if (newLocations != undefined) locations?.updateData(newLocations);
  };

  const handleSaveName = () => {
    setEditingName(false);
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

  const mock = {
    temperature: 16.7,
    condition: "Cloudy",
    icon: "cloud",
    windSpeed: 12.5,
    humidity: 65,
    feelsLike: 15.2,
    visibility: 10000,
    pressureSeaLevel: 1013.25,
    pressureSurfaceLevel: 956.69,
    windGust: 1.5,
    windDirection: 14,
    precipitationProbability: 0,
    cloudCover: 0,
    dewPoint: -11,
    altimeterSetting: 1026.28,
  };

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
          </>
        )}
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
        <Lottie
          animationData={JSON.parse(JSON.stringify(getAnimation(mock.icon)))}
          loop
          autoplay={false}
          lottieRef={lottieRef}
          className="w-32 h-32"
        />
        <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500">
          {mock.temperature.toFixed(1)}°C
        </p>
        <p className="text-sm text-muted-foreground">
          {((mock.temperature * 9) / 5 + 32).toFixed(1)}°F
        </p>
        <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
          {mock.condition}
        </p>
      </CardContent>

      <div className="border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setExpanded(!expanded)}
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
              {mock.feelsLike !== undefined && (
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
                    {mock.feelsLike.toFixed(1)}°C
                  </span>
                </div>
              )}

              {mock.dewPoint !== undefined && (
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
                    {mock.dewPoint.toFixed(1)}°C
                  </span>
                </div>
              )}

              {mock.humidity !== undefined && (
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
                    {mock.humidity}%
                  </span>
                </div>
              )}

              {mock.precipitationProbability !== undefined && (
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
                    {Math.round(mock.precipitationProbability)}%
                  </span>
                </div>
              )}

              {(mock.windSpeed !== undefined ||
                mock.windGust !== undefined) && (
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
                    {mock.windSpeed !== undefined
                      ? `${mock.windSpeed.toFixed(1)} m/s`
                      : "-"}
                    {mock.windGust !== undefined
                      ? ` · Gust ${mock.windGust.toFixed(1)} m/s`
                      : ""}
                  </span>
                </div>
              )}

              {mock.windDirection !== undefined && (
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
                    {degreesToCardinal(mock.windDirection)} (
                    {Math.round(mock.windDirection)}°)
                  </span>
                </div>
              )}

              {mock.visibility !== undefined && (
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
                    {mock.visibility > 1000
                      ? `${(mock.visibility / 1000).toFixed(1)} km`
                      : `${mock.visibility} km`}
                  </span>
                </div>
              )}

              {mock.cloudCover !== undefined && (
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
                    {Math.round(mock.cloudCover)}%
                  </span>
                </div>
              )}

              {(mock.pressureSeaLevel ?? mock.pressureSurfaceLevel) !==
                undefined && (
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
                    {(mock.pressureSeaLevel ??
                      mock.pressureSurfaceLevel)!.toFixed(0)}{" "}
                    hPa
                  </span>
                </div>
              )}

              {mock.altimeterSetting !== undefined && (
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
                    {mock.altimeterSetting.toFixed(2)} hPa
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeatherCardDev;
