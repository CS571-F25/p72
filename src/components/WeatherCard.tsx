import {
  lazy,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { TrashIcon } from "@/components/ui/TrashIcon";
import { LocationContext } from "@/contexts/LocationContext";
import { MOODS, moodFromCondition } from "@/components/atmosphere/moods";
import { tempCompact } from "@/lib/temperature";
import { useTheme } from "@/theme/useTheme";

interface WeatherCardProps {
  location: string;
  name: string;
  disableDelete?: boolean;
}

interface WeatherData {
  temperatureC: number;
  condition: string;
  windSpeed?: number;
  windGust?: number;
  windDirection?: number;
  humidity?: number;
  feelsLikeC?: number;
  visibility?: number;
  pressureSurfaceLevel?: number;
  pressureSeaLevel?: number;
  precipitationProbability?: number;
  cloudCover?: number;
  dewPoint?: number;
  altimeterSetting?: number;
}

const HourlyForecast = lazy(() => import("@/components/HourlyForecast"));

function MetricTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div
      className="rounded-xl border px-3 py-2"
      style={{ borderColor: tone, background: "rgba(8, 14, 22, 0.16)" }}
    >
      <p className="atmo-metric-label" style={{ color: tone }}>
        {label}
      </p>
      <p className="mt-1 text-lg font-light leading-tight">{value}</p>
    </div>
  );
}

function StatusOrb({ accent }: { accent: string }) {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-black/10 sm:h-28 sm:w-28">
      <div
        className="absolute inset-2 rounded-full blur-sm"
        style={{ background: accent, opacity: 0.9 }}
      />
      <div
        className="absolute inset-5 rounded-full border border-white/25"
        style={{
          boxShadow: `0 0 0 10px color-mix(in srgb, ${accent} 10%, transparent)`,
        }}
      />
      <div className="relative text-center">
        <div className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-white/80">
          Signal
        </div>
        <div className="mt-1 text-2xl font-light leading-none">Live</div>
      </div>
    </div>
  );
}

export default function WeatherCard({
  location,
  name,
  disableDelete = false,
}: WeatherCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [customName, setCustomName] = useState(name || "");
  const [expanded, setExpanded] = useState(false);
  const [loadHourly, setLoadHourly] = useState(false);
  const [detailsMaxHeight, setDetailsMaxHeight] = useState(0);
  const detailsContentRef = useRef<HTMLDivElement | null>(null);

  const locations = useContext(LocationContext);
  const { unit } = useTheme();

  const parts = (location || "").split(",").map((s) => s.trim());
  const latN = Number(parts[0]);
  const lonN = Number(parts[1]);
  const validCoords = !Number.isNaN(latN) && !Number.isNaN(lonN);

  const detailsId = useMemo(
    () => `details-${(location || "").replace(/[^a-z0-9_-]+/gi, "-")}`,
    [location],
  );

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

  useEffect(() => {
    async function loadWeather() {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_URL}/api/weather?loc=${location}`;
        const response = await axios.get(url);
        const data = response.data.data.values;

        const weatherInfo: WeatherData = {
          temperatureC: data.temperature,
          condition: getConditionLabel(data.weatherCode),
          windSpeed: data.windSpeed,
          windGust: data.windGust,
          windDirection: data.windDirection,
          humidity: data.humidity,
          feelsLikeC: data.temperatureApparent ?? data.temperature,
          visibility: data.visibility,
          pressureSurfaceLevel: data.pressureSurfaceLevel,
          pressureSeaLevel: data.pressureSeaLevel ?? data.pressureSurfaceLevel,
          precipitationProbability: data.precipitationProbability,
          cloudCover: data.cloudCover,
          dewPoint: data.dewPoint,
          altimeterSetting: data.altimeterSetting,
        };

        setWeather(weatherInfo);
      } catch {
        setError("Failed to fetch weather data.");
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, [API_URL, location]);

  useEffect(() => {
    const content = detailsContentRef.current;
    if (!content) return;

    const update = () => {
      const c = detailsContentRef.current;
      if (c) setDetailsMaxHeight(c.scrollHeight);
    };

    if (expanded) update();

    let ro: ResizeObserver | null = null;
    if (typeof window.ResizeObserver !== "undefined") {
      ro = new window.ResizeObserver(() => update());
      ro.observe(content);
    } else {
      window.addEventListener("resize", update);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", update);
    };
  }, [expanded, loadHourly]);

  const handleDelete = () => {
    const newLocations = locations?.data.filter(
      (loc) => loc.location !== location,
    );
    localStorage.setItem("locations", JSON.stringify(newLocations));
    if (newLocations !== undefined) locations?.updateData(newLocations);
  };

  const handleSaveName = () => {
    setEditingName(false);
    const trimmedName = customName.trim().slice(0, 100);

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

  const mood = MOODS[moodFromCondition(weather?.condition || "cloudy")];
  const displayName = customName || location;
  const visibilityValue =
    weather?.visibility !== undefined
      ? weather.visibility > 1000
        ? `${(weather.visibility / 1000).toFixed(1)} km`
        : `${weather.visibility} km`
      : "-";
  const precipitationValue =
    weather?.precipitationProbability !== undefined
      ? `${Math.round(weather.precipitationProbability)}%`
      : "-";

  return (
    <article
      className="atmo-panel overflow-hidden"
      style={{ background: mood.background, color: mood.text }}
    >
      <div className="relative z-10 p-4 sm:p-5">
        <div
          className="flex items-start justify-between gap-3 pb-3 border-b"
          style={{ borderColor: mood.border }}
        >
          {editingName ? (
            <div className="w-full space-y-2">
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter custom name"
                className="atmo-input"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="atmo-button"
                  onClick={handleSaveName}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="atmo-button"
                  onClick={handleCancelName}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="text-left"
                onClick={() => setEditingName(true)}
                style={{ color: mood.text }}
              >
                <p className="atmo-kicker">Weather dashboard</p>
                <h3 className="text-2xl leading-tight font-light">
                  {displayName}
                </h3>
                <p
                  className="font-mono text-[0.62rem] uppercase tracking-[0.18em] mt-1"
                  style={{ color: mood.muted }}
                >
                  Live station telemetry
                </p>
              </button>

              {!disableDelete && (
                <button
                  type="button"
                  className="atmo-button px-3"
                  onClick={handleDelete}
                  aria-label="Delete card"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>

        <div className="pt-4 space-y-4">
          {loading ? (
            <p className="font-mono text-xs tracking-[0.22em] uppercase opacity-80">
              Loading...
            </p>
          ) : error ? (
            <p className="font-mono text-xs tracking-[0.16em] uppercase text-red-100">
              {error}
            </p>
          ) : weather ? (
            <>
              <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                <section
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: mood.border,
                    background: "rgba(8, 14, 22, 0.18)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className="font-mono text-[0.58rem] uppercase tracking-[0.22em]"
                        style={{ color: mood.muted }}
                      >
                        Current temperature
                      </p>
                      <div className="mt-2 flex items-end gap-2">
                        <p className="text-6xl sm:text-7xl font-extralight leading-none tracking-tight">
                          {tempCompact(weather.temperatureC, unit)}
                        </p>
                        <span
                          className="mb-2 rounded-full border px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.18em]"
                          style={{ borderColor: mood.border }}
                        >
                          {weather.condition}
                        </span>
                      </div>
                      <p
                        className="mt-2 max-w-md text-sm leading-relaxed"
                        style={{ color: mood.muted }}
                      >
                        Feels like{" "}
                        {tempCompact(
                          weather.feelsLikeC ?? weather.temperatureC,
                          unit,
                        )}
                        .
                        {weather.precipitationProbability !== undefined
                          ? ` Precipitation chance is ${Math.round(weather.precipitationProbability)}%.`
                          : ""}
                      </p>
                    </div>

                    <StatusOrb accent={mood.accent} />
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <MetricTile
                      label="Humidity"
                      value={`${Math.round(weather.humidity ?? 0)}%`}
                      tone={mood.muted}
                    />
                    <MetricTile
                      label="Wind"
                      value={
                        weather.windSpeed !== undefined
                          ? `${weather.windSpeed.toFixed(1)} m/s`
                          : "-"
                      }
                      tone={mood.muted}
                    />
                    <MetricTile
                      label="Visibility"
                      value={visibilityValue}
                      tone={mood.muted}
                    />
                    <MetricTile
                      label="Precipitation"
                      value={precipitationValue}
                      tone={mood.muted}
                    />
                  </div>
                </section>

                <section
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: mood.border,
                    background: "rgba(8, 14, 22, 0.14)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p
                        className="font-mono text-[0.58rem] uppercase tracking-[0.22em]"
                        style={{ color: mood.muted }}
                      >
                        Details
                      </p>
                      <p className="mt-1 text-sm" style={{ color: mood.muted }}>
                        Direction, pressure, and station coordinates.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <MetricTile
                      label="Wind direction"
                      value={
                        weather.windDirection !== undefined
                          ? `${degreesToCardinal(weather.windDirection)} ${Math.round(weather.windDirection)}°`
                          : "-"
                      }
                      tone={mood.muted}
                    />
                    <MetricTile
                      label="Pressure"
                      value={
                        weather.pressureSeaLevel !== undefined
                          ? `${Math.round(weather.pressureSeaLevel)} hPa`
                          : "-"
                      }
                      tone={mood.muted}
                    />
                    <div
                      className="rounded-xl border px-3 py-2"
                      style={{
                        borderColor: mood.border,
                        background: "rgba(8, 14, 22, 0.12)",
                      }}
                    >
                      <p
                        className="atmo-metric-label"
                        style={{ color: mood.muted }}
                      >
                        Station Coordinates
                      </p>
                      <p className="mt-1 font-mono text-sm leading-relaxed opacity-90">
                        {location}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <p className="font-mono text-xs uppercase tracking-[0.16em] opacity-80">
              No data available.
            </p>
          )}
        </div>

        <div
          className="mt-5 pt-4 border-t"
          style={{ borderColor: mood.border }}
        >
          <button
            type="button"
            onClick={() => {
              const next = !expanded;
              setExpanded(next);
              if (next) setLoadHourly(true);
            }}
            onMouseEnter={() => {
              import("@/components/HourlyForecast");
            }}
            aria-expanded={expanded}
            aria-controls={detailsId}
            className="w-full flex items-center justify-between font-mono text-[0.64rem] tracking-[0.2em] uppercase"
          >
            <span>{expanded ? "Hide Hourly" : "Show Hourly"}</span>
            <span
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </button>

          <div
            id={detailsId}
            role="region"
            aria-label={`Details for ${displayName}`}
            style={{
              maxHeight: expanded ? `${detailsMaxHeight}px` : "0px",
              overflow: "hidden",
              transition: "max-height 280ms ease",
            }}
          >
            <div ref={detailsContentRef} className="pt-3">
              {validCoords && loadHourly && (
                <Suspense
                  fallback={
                    <div className="py-2">Loading hourly forecast...</div>
                  }
                >
                  <HourlyForecast lat={latN} lon={lonN} />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
