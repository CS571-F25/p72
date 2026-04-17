import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import LocationTabs from "@/components/LocationTabs";
import AtmosphereLayers from "@/components/atmosphere/AtmosphereLayers";
import { MOODS, moodFromCondition } from "@/components/atmosphere/moods";
import { useTheme } from "@/theme/useTheme";

type AtmoCondition =
  | "clear"
  | "rain"
  | "drizzle"
  | "snow"
  | "cloudy"
  | "fewclouds";

type StoredLocation = {
  id: string;
  city: string;
  region: string;
  lat: number;
  lon: number;
};

type HourlyPoint = {
  t: string;
  tempC: number;
  cond: AtmoCondition;
  pop: number;
};

type DailyPoint = {
  d: string;
  cond: AtmoCondition;
  hiC: number;
  loC: number;
  pop: number;
};

type LiveWeather = {
  localTime: string;
  condition: AtmoCondition;
  conditionLabel: string;
  tempC: number;
  feelsC: number;
  highC: number;
  lowC: number;
  humidity: number;
  windSpeedKph: number;
  windDir: string;
  pressure: number;
  uv: number;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
};

type LocationInput = {
  type: "coords";
  lat: number;
  lon: number;
  name?: string;
};

type ForecastInterval = {
  startTime: string;
  values?: Record<string, number | string | null | undefined>;
};

const STORAGE_KEY = "atmo-locations";
const DEFAULT_LOCATIONS: StoredLocation[] = [
  { id: "lis", city: "Lisbon", region: "Portugal", lat: 38.72, lon: -9.14 },
  {
    id: "edi",
    city: "Edinburgh",
    region: "Scotland",
    lat: 55.95,
    lon: -3.19,
  },
  {
    id: "rej",
    city: "Reykjavik",
    region: "Iceland",
    lat: 64.15,
    lon: -21.94,
  },
];

const shellStyle = {
  minHeight: "100vh",
  background: "#0a0a0c",
  color: "#fff",
  fontFamily: '"Fraunces", Georgia, serif',
  position: "relative" as const,
  overflow: "hidden" as const,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  minHeight: "100vh",
};

const addCardStyle = {
  position: "relative" as const,
  overflow: "hidden" as const,
  padding: "70px 44px 40px",
  boxSizing: "border-box" as const,
  display: "flex",
  flexDirection: "column" as const,
  color: "#fff",
  borderRight: "1px solid rgba(255,255,255,0.08)",
  background: "linear-gradient(180deg, #1a1a1f 0%, #0a0a0c 100%)",
};

const panelStyleBase = {
  position: "relative" as const,
  overflow: "hidden" as const,
  padding: "70px 44px 40px",
  boxSizing: "border-box" as const,
  display: "flex",
  flexDirection: "column" as const,
  color: "#fff",
  borderRight: "1px solid rgba(255,255,255,0.08)",
  transition: "background 0.8s ease",
};

const cityNameStyle = {
  fontFamily: '"Fraunces", serif',
  fontWeight: 300,
  fontSize: 54,
  lineHeight: 1,
  letterSpacing: "-0.01em",
  marginBottom: 6,
};

const cityRegionStyle = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: 10,
  letterSpacing: "0.3em",
  textTransform: "uppercase" as const,
  opacity: 0.7,
  marginBottom: 28,
};

const bigTempStyle = {
  fontFamily: '"Fraunces", serif',
  fontWeight: 200,
  fontSize: 160,
  lineHeight: 0.9,
  letterSpacing: "-0.04em",
  display: "flex",
  alignItems: "flex-start",
};

const degSymbolStyle = {
  fontSize: 42,
  marginTop: 24,
  fontWeight: 300,
  opacity: 0.6,
};

const conditionStyle = {
  fontFamily: '"Fraunces", serif',
  fontStyle: "italic" as const,
  fontSize: 26,
  fontWeight: 300,
  marginTop: 12,
  opacity: 0.9,
};

const hiLoStyle = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: 11,
  letterSpacing: "0.25em",
  opacity: 0.7,
  marginTop: 8,
};

const spacerStyle = { flex: 1 };

const hourlyStripStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 18,
  padding: "14px 0",
  borderTop: "1px solid rgba(255,255,255,0.15)",
  borderBottom: "1px solid rgba(255,255,255,0.15)",
};

const hourCellStyle = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  gap: 6,
  flex: 1,
};

const hourTStyle = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: 9,
  letterSpacing: "0.2em",
  opacity: 0.6,
};

const hourTempStyle = {
  fontFamily: '"Fraunces", serif',
  fontSize: 18,
  fontWeight: 300,
};

const readingsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "4px 28px",
  marginTop: 18,
};

const readLblStyle = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: 9,
  letterSpacing: "0.3em",
  textTransform: "uppercase" as const,
  opacity: 0.55,
  marginBottom: 2,
};

const readValStyle = {
  fontFamily: '"Fraunces", serif',
  fontSize: 22,
  fontWeight: 300,
  marginBottom: 10,
};

const readValSmStyle = {
  fontSize: 13,
  opacity: 0.7,
  marginLeft: 4,
  fontFamily: '"JetBrains Mono", monospace',
};

const dailyListStyle = {
  marginTop: 20,
  borderTop: "1px solid rgba(255,255,255,0.15)",
  paddingTop: 14,
};

const dailyRowStyle = {
  display: "grid",
  gridTemplateColumns: "52px 20px 1fr 64px",
  alignItems: "center",
  padding: "7px 0",
  fontSize: 13,
  gap: 10,
};

const dailyDayStyle = {
  fontFamily: '"Fraunces", serif',
  fontSize: 14,
  fontWeight: 400,
  letterSpacing: "0.02em",
};

const dailyBarStyle = {
  position: "relative" as const,
  height: 2,
  background: "rgba(255,255,255,0.15)",
};

const dailyHiLoStyle = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: 10,
  textAlign: "right" as const,
  opacity: 0.85,
  letterSpacing: "0.1em",
};

const btnRowStyle = {
  display: "flex",
  gap: 8,
  marginTop: 14,
  paddingTop: 14,
  borderTop: "1px solid rgba(255,255,255,0.15)",
};

const btnStyle = {
  flex: 1,
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.4)",
  color: "rgba(255,255,255,0.9)",
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: 9,
  letterSpacing: "0.25em",
  textTransform: "uppercase" as const,
  padding: "7px 8px",
  cursor: "pointer",
};

const emptyCardInnerStyle = {
  margin: "auto",
  textAlign: "center" as const,
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  gap: 16,
};

const addCircleStyle = {
  width: 72,
  height: 72,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 32,
  fontWeight: 200,
  color: "rgba(255,255,255,0.7)",
  fontFamily: '"Fraunces", serif',
};

const cToF = (c: number) => Math.round((c * 9) / 5 + 32);
const kphToMph = (kph: number) => Math.round(kph * 0.621371);

const toNumberOr = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
};

const toHourLabel = (isoTime: string) => {
  const d = new Date(isoTime);
  return Number.isNaN(d.getTime())
    ? "--"
    : d.toLocaleTimeString([], { hour: "2-digit" });
};

const toClock = (isoTime: string) => {
  const d = new Date(isoTime);
  return Number.isNaN(d.getTime())
    ? "--:--"
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const toWindDir = (deg: number) => {
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
  const index = Math.round((((deg % 360) + 360) % 360) / 22.5) % 16;
  return directions[index];
};

const toCondition = (weatherCode: number): AtmoCondition => {
  if (weatherCode >= 5000 && weatherCode < 6000) return "snow";
  if (weatherCode === 4000 || weatherCode === 4200) return "drizzle";
  if (
    weatherCode === 4001 ||
    weatherCode === 4201 ||
    weatherCode === 6001 ||
    weatherCode === 6201 ||
    weatherCode === 8000
  )
    return "rain";
  if (weatherCode === 1101 || weatherCode === 1102) return "fewclouds";
  if (weatherCode === 1001 || weatherCode === 1100 || weatherCode === 2000)
    return "cloudy";
  return "clear";
};

const toConditionLabel = (code: number): string => {
  const codes: Record<number, string> = {
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

function getInitialLocations(): StoredLocation[] {
  if (typeof window === "undefined") return DEFAULT_LOCATIONS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_LOCATIONS;
    const parsed = JSON.parse(stored) as StoredLocation[];
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_LOCATIONS;
  } catch {
    return DEFAULT_LOCATIONS;
  }
}

function buildDaily(intervals: ForecastInterval[]): DailyPoint[] {
  const grouped = new Map<
    string,
    { temps: number[]; pops: number[]; conds: AtmoCondition[] }
  >();

  for (const interval of intervals) {
    const dayKey = interval.startTime.slice(0, 10);
    const values = interval.values || {};
    const temp = toNumberOr(values.temperature, NaN);
    if (!Number.isFinite(temp)) continue;
    const pop = toNumberOr(values.precipitationProbability, 0);
    const code = toNumberOr(values.weatherCode, 1000);
    const cond = toCondition(code);

    const bucket = grouped.get(dayKey) || { temps: [], pops: [], conds: [] };
    bucket.temps.push(temp);
    bucket.pops.push(pop);
    bucket.conds.push(cond);
    grouped.set(dayKey, bucket);
  }

  const keys = Array.from(grouped.keys()).sort();
  return keys.slice(0, 7).map((key, index) => {
    const bucket = grouped.get(key)!;
    const hiC = Math.max(...bucket.temps);
    const loC = Math.min(...bucket.temps);
    const pop = Math.max(...bucket.pops, 0);

    const condCount: Record<AtmoCondition, number> = {
      clear: 0,
      cloudy: 0,
      fewclouds: 0,
      drizzle: 0,
      rain: 0,
      snow: 0,
    };
    bucket.conds.forEach((c) => {
      condCount[c] += 1;
    });
    const cond = (Object.entries(condCount).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0] || "clear") as AtmoCondition;

    const date = new Date(`${key}T00:00:00`);
    const d =
      index === 0 ? "Today" : date.toLocaleDateString([], { weekday: "short" });

    return {
      d,
      cond,
      hiC: Math.round(hiC),
      loC: Math.round(loC),
      pop: Math.round(pop),
    };
  });
}

function buildHourly(intervals: ForecastInterval[]): HourlyPoint[] {
  const now = Date.now();
  const next = intervals
    .filter((item) => new Date(item.startTime).getTime() >= now)
    .slice(0, 12);

  return next.map((item) => {
    const values = item.values || {};
    const tempC = Math.round(toNumberOr(values.temperature, 0));
    const pop = Math.round(toNumberOr(values.precipitationProbability, 0));
    const cond = toCondition(toNumberOr(values.weatherCode, 1000));

    return {
      t: toHourLabel(item.startTime),
      tempC,
      cond,
      pop,
    };
  });
}

async function fetchLiveWeather(
  baseUrl: string,
  loc: StoredLocation,
): Promise<LiveWeather> {
  const location = `${loc.lat},${loc.lon}`;
  const weatherEndpoint = `${baseUrl}/api/weather?loc=${location}`;
  const forecastEndpoint = `${baseUrl}/api/weather-forecast?location=${location}`;

  const [weatherRes, forecastRes] = await Promise.all([
    axios.get(weatherEndpoint),
    axios.get(forecastEndpoint),
  ]);

  const weatherData = weatherRes.data?.data || {};
  const weatherValues = weatherData.values || {};

  const intervals: ForecastInterval[] =
    forecastRes.data?.data?.timelines?.[0]?.intervals ||
    forecastRes.data?.timelines?.[0]?.intervals ||
    forecastRes.data?.data?.intervals ||
    forecastRes.data?.intervals ||
    [];

  const hourly = buildHourly(intervals);
  const daily = buildDaily(intervals);

  const currentTempC = Math.round(toNumberOr(weatherValues.temperature, 0));
  const currentFeelsC = Math.round(
    toNumberOr(weatherValues.temperatureApparent, currentTempC),
  );
  const weatherCode = toNumberOr(weatherValues.weatherCode, 1000);

  const day0 = daily[0];

  return {
    localTime: toClock(
      weatherData.time || intervals[0]?.startTime || new Date().toISOString(),
    ),
    condition: toCondition(weatherCode),
    conditionLabel: toConditionLabel(weatherCode),
    tempC: currentTempC,
    feelsC: currentFeelsC,
    highC: day0 ? day0.hiC : currentTempC,
    lowC: day0 ? day0.loC : currentTempC,
    humidity: Math.round(toNumberOr(weatherValues.humidity, 0)),
    windSpeedKph: Math.round(toNumberOr(weatherValues.windSpeed, 0)),
    windDir: toWindDir(toNumberOr(weatherValues.windDirection, 0)),
    pressure: Math.round(toNumberOr(weatherValues.pressureSurfaceLevel, 0)),
    uv: Math.round(toNumberOr(weatherValues.uvIndex, 0)),
    hourly,
    daily,
  };
}

function ForecastIcon({ cond }: { cond: AtmoCondition }) {
  if (cond === "snow") return <span>*</span>;
  if (cond === "rain" || cond === "drizzle") return <span>|</span>;
  if (cond === "clear") return <span>o</span>;
  return <span>~</span>;
}

function WeatherPanel({
  location,
  live,
  unit,
  loading,
  error,
  index,
  total,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: {
  location: StoredLocation;
  live?: LiveWeather;
  unit: "C" | "F";
  loading: boolean;
  error?: string;
  index: number;
  total: number;
  onRemove: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}) {
  const condition = live?.condition || "cloudy";
  const mood = MOODS[moodFromCondition(condition)];
  const darkText = condition === "snow";
  const textColor = darkText ? "#1a2030" : "#fff";
  const mutedColor = darkText ? "rgba(26,32,48,0.7)" : "rgba(255,255,255,0.75)";
  const borderColor = darkText ? "rgba(26,32,48,0.2)" : "rgba(255,255,255,0.2)";

  const tempC = live?.tempC ?? 0;
  const feelsC = live?.feelsC ?? 0;
  const hiC = live?.highC ?? 0;
  const loC = live?.lowC ?? 0;
  const temp = unit === "F" ? cToF(tempC) : tempC;
  const feels = unit === "F" ? cToF(feelsC) : feelsC;
  const hi = unit === "F" ? cToF(hiC) : hiC;
  const lo = unit === "F" ? cToF(loC) : loC;

  const wind = live?.windSpeedKph ?? 0;
  const windDisplay = unit === "F" ? kphToMph(wind) : wind;
  const windUnit = unit === "F" ? "mph" : "kph";

  const dailyRows = live?.daily || [];
  const allTempsC = dailyRows.flatMap((d) => [d.hiC, d.loC]);
  const globalMinC = allTempsC.length ? Math.min(...allTempsC) - 1 : 0;
  const globalMaxC = allTempsC.length ? Math.max(...allTempsC) + 1 : 1;

  return (
    <div
      style={{
        ...panelStyleBase,
        background: mood.background,
        color: textColor,
      }}
    >
      <AtmosphereLayers condition={condition} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div style={{ ...cityRegionStyle, opacity: darkText ? 0.6 : 0.7 }}>
          #{String(index + 1).padStart(2, "0")} {live?.localTime || "--:--"}
        </div>
        <div style={cityNameStyle}>{location.city}</div>
        <div style={{ ...cityRegionStyle, marginBottom: 24 }}>
          {location.region}
        </div>

        {loading && !live ? (
          <div style={{ ...conditionStyle, marginTop: 0 }}>
            Loading live weather...
          </div>
        ) : error && !live ? (
          <div style={{ ...conditionStyle, marginTop: 0 }}>
            Weather unavailable
          </div>
        ) : (
          <>
            <div style={bigTempStyle}>
              {temp}
              <span style={degSymbolStyle}>°{unit}</span>
            </div>
            <div style={conditionStyle}>
              {live?.conditionLabel || "Unknown"}
            </div>
            <div style={{ ...hiLoStyle, color: mutedColor }}>
              H {hi}° L {lo}° Feels {feels}°
            </div>

            <div style={spacerStyle} />

            <div style={{ ...hourlyStripStyle, borderColor }}>
              {(live?.hourly || []).slice(0, 6).map((hour, hourIndex) => (
                <div key={hourIndex} style={hourCellStyle}>
                  <div style={{ ...hourTStyle, color: mutedColor }}>
                    {hour.t}
                  </div>
                  <div style={{ fontSize: 16, lineHeight: 1 }}>
                    <ForecastIcon cond={hour.cond} />
                  </div>
                  <div style={hourTempStyle}>
                    {unit === "F" ? cToF(hour.tempC) : hour.tempC}°
                  </div>
                </div>
              ))}
            </div>

            <div style={readingsGridStyle}>
              <div>
                <div style={{ ...readLblStyle, color: mutedColor }}>Wind</div>
                <div style={readValStyle}>
                  {windDisplay}
                  <span style={readValSmStyle}>
                    {windUnit} {live?.windDir || "N"}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ ...readLblStyle, color: mutedColor }}>
                  Humidity
                </div>
                <div style={readValStyle}>
                  {live?.humidity ?? 0}
                  <span style={readValSmStyle}>%</span>
                </div>
              </div>
              <div>
                <div style={{ ...readLblStyle, color: mutedColor }}>
                  Pressure
                </div>
                <div style={readValStyle}>
                  {live?.pressure ?? 0}
                  <span style={readValSmStyle}>hPa</span>
                </div>
              </div>
              <div>
                <div style={{ ...readLblStyle, color: mutedColor }}>UV</div>
                <div style={readValStyle}>
                  {live?.uv ?? 0}
                  <span style={readValSmStyle}>/11</span>
                </div>
              </div>
            </div>

            <div style={{ ...dailyListStyle, borderColor }}>
              {dailyRows.map((day, dayIndex) => {
                const dhi = unit === "F" ? cToF(day.hiC) : day.hiC;
                const dlo = unit === "F" ? cToF(day.loC) : day.loC;
                const scaleMin = unit === "F" ? cToF(globalMinC) : globalMinC;
                const scaleMax = unit === "F" ? cToF(globalMaxC) : globalMaxC;
                const left =
                  ((dlo - scaleMin) / (scaleMax - scaleMin || 1)) * 100;
                const right =
                  ((dhi - scaleMin) / (scaleMax - scaleMin || 1)) * 100;
                return (
                  <div key={dayIndex} style={dailyRowStyle}>
                    <span style={dailyDayStyle}>{day.d}</span>
                    <span>
                      <ForecastIcon cond={day.cond} />
                    </span>
                    <div
                      style={{
                        ...dailyBarStyle,
                        background: darkText
                          ? "rgba(26,32,48,0.15)"
                          : "rgba(255,255,255,0.2)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          left: `${left}%`,
                          width: `${Math.max(right - left, 2)}%`,
                          background: textColor,
                          opacity: 0.85,
                        }}
                      />
                    </div>
                    <span style={dailyHiLoStyle}>
                      {dhi} / {dlo}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div style={{ ...btnRowStyle, borderColor }}>
          <button
            style={{
              ...btnStyle,
              borderColor: borderColor.replace("0.2", "0.4"),
              color: textColor,
            }}
            onClick={onMoveLeft}
            disabled={index === 0}
          >
            Left
          </button>
          <button
            style={{
              ...btnStyle,
              borderColor: borderColor.replace("0.2", "0.4"),
              color: textColor,
            }}
            onClick={onMoveRight}
            disabled={index === total - 1}
          >
            Right
          </button>
          <button
            style={{
              ...btnStyle,
              borderColor: borderColor.replace("0.2", "0.4"),
              color: textColor,
            }}
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function AddSlot({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" style={addCardStyle} onClick={onOpen}>
      <div style={emptyCardInnerStyle}>
        <div style={addCircleStyle}>+</div>
        <div
          style={{
            fontFamily: '"Fraunces", serif',
            fontStyle: "italic",
            fontSize: 22,
            fontWeight: 300,
          }}
        >
          Another sky
        </div>
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            opacity: 0.5,
          }}
        >
          Click to add
        </div>
      </div>
    </button>
  );
}

export default function HomeAtmosphere() {
  const { unit } = useTheme();
  const API_URL = import.meta.env.VITE_WEATHER_API_BASE_URL || "";
  const [locations, setLocations] =
    useState<StoredLocation[]>(getInitialLocations);
  const [showPicker, setShowPicker] = useState(false);
  const [weatherById, setWeatherById] = useState<Record<string, LiveWeather>>(
    {},
  );
  const [loadingById, setLoadingById] = useState<Record<string, boolean>>({});
  const [errorById, setErrorById] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    let canceled = false;

    const run = async () => {
      type FetchResult =
        | { id: string; ok: true; live: LiveWeather }
        | { id: string; ok: false; error: string };

      const nextLoading: Record<string, boolean> = {};
      locations.forEach((loc) => {
        nextLoading[loc.id] = true;
      });
      setLoadingById(nextLoading);

      const jobs = locations.map(async (loc) => {
        try {
          const live = await fetchLiveWeather(API_URL, loc);
          return { id: loc.id, ok: true, live } as FetchResult;
        } catch (err) {
          return {
            id: loc.id,
            ok: false,
            error: err instanceof Error ? err.message : "Failed to load",
          } as FetchResult;
        }
      });

      const results = await Promise.all(jobs);
      if (canceled) return;

      const nextLive: Record<string, LiveWeather> = {};
      const nextErr: Record<string, string> = {};
      const nextLoad: Record<string, boolean> = {};

      results.forEach((result) => {
        nextLoad[result.id] = false;
        if (result.ok) nextLive[result.id] = result.live;
        else nextErr[result.id] = result.error;
      });

      setWeatherById((prev) => ({ ...prev, ...nextLive }));
      setErrorById(nextErr);
      setLoadingById(nextLoad);
    };

    if (locations.length) run();

    return () => {
      canceled = true;
    };
  }, [API_URL, locations]);

  const slots = useMemo(
    () => Array.from({ length: 3 }, (_, index) => locations[index] ?? null),
    [locations],
  );

  const handleSubmit = (data: LocationInput): boolean => {
    if (locations.length >= 3) return false;

    const duplicate = locations.some(
      (loc) =>
        Math.abs(loc.lat - data.lat) < 0.0001 &&
        Math.abs(loc.lon - data.lon) < 0.0001,
    );
    if (duplicate) return false;

    const city = (
      data.name || `${data.lat.toFixed(2)}, ${data.lon.toFixed(2)}`
    ).slice(0, 60);

    const candidate: StoredLocation = {
      id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      city,
      region: "Custom",
      lat: data.lat,
      lon: data.lon,
    };

    setLocations((current) => [...current, candidate]);
    return true;
  };

  const handleRemove = (id: string) => {
    setLocations((current) => current.filter((location) => location.id !== id));
    setWeatherById((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const handleMove = (from: number, to: number) => {
    if (to < 0 || to >= locations.length) return;
    setLocations((current) => {
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  return (
    <section style={shellStyle}>
      <div style={gridStyle}>
        {slots.map((slot, index) =>
          slot ? (
            <WeatherPanel
              key={slot.id}
              location={slot}
              live={weatherById[slot.id]}
              unit={unit}
              loading={Boolean(loadingById[slot.id])}
              error={errorById[slot.id]}
              index={index}
              total={locations.length}
              onRemove={() => handleRemove(slot.id)}
              onMoveLeft={() => handleMove(index, index - 1)}
              onMoveRight={() => handleMove(index, index + 1)}
            />
          ) : (
            <AddSlot key={`add-${index}`} onOpen={() => setShowPicker(true)} />
          ),
        )}
      </div>

      {showPicker && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "1rem",
            background: "rgba(5, 10, 16, 0.68)",
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Add location"
          onClick={() => setShowPicker(false)}
        >
          <div
            style={{
              width: "min(1100px, 100%)",
              maxHeight: "calc(100vh - 2rem)",
              overflow: "auto",
              borderRadius: "1.4rem",
              border: "1px solid rgba(236, 245, 255, 0.18)",
              background:
                "linear-gradient(180deg, rgba(12, 18, 28, 0.94), rgba(10, 16, 24, 0.98))",
              padding: "1rem",
              boxShadow: "0 32px 100px rgba(0, 0, 0, 0.45)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="atmo-kicker">Add location</p>
                <h2 className="text-2xl font-light">
                  Pick a city, map point, or coordinates
                </h2>
              </div>
              <button
                type="button"
                className="atmo-button px-3"
                onClick={() => setShowPicker(false)}
              >
                Close
              </button>
            </div>

            <LocationTabs
              onSubmit={(data) => {
                if (handleSubmit(data)) {
                  setShowPicker(false);
                }
              }}
              locationsCount={locations.length}
            />
          </div>
        </div>
      )}
    </section>
  );
}
