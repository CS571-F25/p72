import { useEffect, useMemo, useState } from "react";
import LocationTabs from "@/components/LocationTabs";
import AtmosphereLayers from "@/components/atmosphere/AtmosphereLayers";
import { MOODS, moodFromCondition } from "@/components/atmosphere/moods";
import { useTheme } from "@/theme/useTheme";

const INITIAL_LOCATIONS: AtmoLocation[] = [
  {
    id: "lis",
    city: "Lisbon",
    region: "Portugal",
    country: "PT",
    tz: "WEST",
    localTime: "14:32",
    lat: 38.72,
    lon: -9.14,
    condition: "clear",
    conditionLabel: "Clear sky",
    tempF: 74,
    tempC: 23,
    feelsF: 76,
    feelsC: 24,
    highF: 78,
    highC: 26,
    lowF: 61,
    lowC: 16,
    humidity: 48,
    wind: { speedMph: 9, speedKph: 14, dir: "NW", deg: 315 },
    pressure: 1021,
    visibility: 16,
    uv: 7,
    sunrise: "06:51",
    sunset: "20:18",
    precip: 0,
    dewF: 54,
    hourly: [
      { t: "14", tF: 74, tC: 23, cond: "clear", pop: 0 },
      { t: "15", tF: 76, tC: 24, cond: "clear", pop: 0 },
      { t: "16", tF: 77, tC: 25, cond: "clear", pop: 0 },
      { t: "17", tF: 78, tC: 26, cond: "clear", pop: 0 },
      { t: "18", tF: 76, tC: 24, cond: "fewclouds", pop: 5 },
      { t: "19", tF: 73, tC: 23, cond: "fewclouds", pop: 5 },
      { t: "20", tF: 70, tC: 21, cond: "fewclouds", pop: 0 },
      { t: "21", tF: 67, tC: 19, cond: "clear", pop: 0 },
      { t: "22", tF: 65, tC: 18, cond: "clear", pop: 0 },
      { t: "23", tF: 63, tC: 17, cond: "clear", pop: 0 },
      { t: "00", tF: 62, tC: 17, cond: "clear", pop: 0 },
      { t: "01", tF: 61, tC: 16, cond: "clear", pop: 0 },
    ],
    daily: [
      { d: "Today", cond: "clear", hiF: 78, hiC: 26, loF: 61, loC: 16, pop: 0 },
      { d: "Sat", cond: "clear", hiF: 80, hiC: 27, loF: 63, loC: 17, pop: 0 },
      {
        d: "Sun",
        cond: "fewclouds",
        hiF: 77,
        hiC: 25,
        loF: 62,
        loC: 17,
        pop: 10,
      },
      {
        d: "Mon",
        cond: "fewclouds",
        hiF: 74,
        hiC: 23,
        loF: 60,
        loC: 16,
        pop: 20,
      },
      { d: "Tue", cond: "rain", hiF: 68, hiC: 20, loF: 58, loC: 14, pop: 70 },
      { d: "Wed", cond: "rain", hiF: 66, hiC: 19, loF: 57, loC: 14, pop: 65 },
      { d: "Thu", cond: "clear", hiF: 72, hiC: 22, loF: 58, loC: 14, pop: 10 },
    ],
  },
  {
    id: "edi",
    city: "Edinburgh",
    region: "Scotland",
    country: "UK",
    tz: "BST",
    localTime: "14:32",
    lat: 55.95,
    lon: -3.19,
    condition: "rain",
    conditionLabel: "Steady rain",
    tempF: 52,
    tempC: 11,
    feelsF: 48,
    feelsC: 9,
    highF: 55,
    highC: 13,
    lowF: 44,
    lowC: 7,
    humidity: 88,
    wind: { speedMph: 18, speedKph: 29, dir: "SW", deg: 225 },
    pressure: 998,
    visibility: 6,
    uv: 2,
    sunrise: "05:48",
    sunset: "21:33",
    precip: 0.42,
    dewF: 48,
    hourly: [
      { t: "14", tF: 52, tC: 11, cond: "rain", pop: 85 },
      { t: "15", tF: 52, tC: 11, cond: "rain", pop: 90 },
      { t: "16", tF: 51, tC: 11, cond: "rain", pop: 95 },
      { t: "17", tF: 51, tC: 11, cond: "rain", pop: 85 },
      { t: "18", tF: 50, tC: 10, cond: "drizzle", pop: 60 },
      { t: "19", tF: 50, tC: 10, cond: "drizzle", pop: 55 },
      { t: "20", tF: 49, tC: 9, cond: "cloudy", pop: 30 },
      { t: "21", tF: 48, tC: 9, cond: "cloudy", pop: 20 },
      { t: "22", tF: 47, tC: 8, cond: "cloudy", pop: 15 },
      { t: "23", tF: 46, tC: 8, cond: "cloudy", pop: 10 },
      { t: "00", tF: 45, tC: 7, cond: "cloudy", pop: 5 },
      { t: "01", tF: 44, tC: 7, cond: "cloudy", pop: 5 },
    ],
    daily: [
      { d: "Today", cond: "rain", hiF: 55, hiC: 13, loF: 44, loC: 7, pop: 90 },
      { d: "Sat", cond: "rain", hiF: 54, hiC: 12, loF: 43, loC: 6, pop: 80 },
      { d: "Sun", cond: "cloudy", hiF: 56, hiC: 13, loF: 45, loC: 7, pop: 40 },
      {
        d: "Mon",
        cond: "fewclouds",
        hiF: 58,
        hiC: 14,
        loF: 46,
        loC: 8,
        pop: 20,
      },
      { d: "Tue", cond: "cloudy", hiF: 57, hiC: 14, loF: 46, loC: 8, pop: 30 },
      { d: "Wed", cond: "rain", hiF: 53, hiC: 12, loF: 44, loC: 7, pop: 70 },
      { d: "Thu", cond: "rain", hiF: 51, hiC: 11, loF: 42, loC: 6, pop: 85 },
    ],
  },
  {
    id: "rej",
    city: "Reykjavík",
    region: "Iceland",
    country: "IS",
    tz: "GMT",
    localTime: "13:32",
    lat: 64.15,
    lon: -21.94,
    condition: "snow",
    conditionLabel: "Light snow",
    tempF: 28,
    tempC: -2,
    feelsF: 19,
    feelsC: -7,
    highF: 31,
    highC: -1,
    lowF: 22,
    lowC: -6,
    humidity: 76,
    wind: { speedMph: 22, speedKph: 35, dir: "N", deg: 0 },
    pressure: 1008,
    visibility: 3,
    uv: 1,
    sunrise: "07:12",
    sunset: "18:44",
    precip: 0.18,
    dewF: 22,
    hourly: [
      { t: "13", tF: 28, tC: -2, cond: "snow", pop: 80 },
      { t: "14", tF: 28, tC: -2, cond: "snow", pop: 85 },
      { t: "15", tF: 27, tC: -3, cond: "snow", pop: 90 },
      { t: "16", tF: 27, tC: -3, cond: "snow", pop: 85 },
      { t: "17", tF: 26, tC: -3, cond: "snow", pop: 75 },
      { t: "18", tF: 25, tC: -4, cond: "snow", pop: 60 },
      { t: "19", tF: 24, tC: -4, cond: "cloudy", pop: 30 },
      { t: "20", tF: 23, tC: -5, cond: "cloudy", pop: 20 },
      { t: "21", tF: 22, tC: -6, cond: "cloudy", pop: 15 },
      { t: "22", tF: 22, tC: -6, cond: "fewclouds", pop: 10 },
      { t: "23", tF: 21, tC: -6, cond: "fewclouds", pop: 5 },
      { t: "00", tF: 21, tC: -6, cond: "fewclouds", pop: 0 },
    ],
    daily: [
      { d: "Today", cond: "snow", hiF: 31, hiC: -1, loF: 22, loC: -6, pop: 85 },
      { d: "Sat", cond: "snow", hiF: 29, hiC: -2, loF: 20, loC: -7, pop: 75 },
      { d: "Sun", cond: "cloudy", hiF: 33, hiC: 1, loF: 24, loC: -4, pop: 30 },
      { d: "Mon", cond: "clear", hiF: 35, hiC: 2, loF: 25, loC: -4, pop: 10 },
      {
        d: "Tue",
        cond: "fewclouds",
        hiF: 34,
        hiC: 1,
        loF: 24,
        loC: -4,
        pop: 15,
      },
      { d: "Wed", cond: "snow", hiF: 30, hiC: -1, loF: 21, loC: -6, pop: 70 },
      { d: "Thu", cond: "snow", hiF: 28, hiC: -2, loF: 19, loC: -7, pop: 80 },
    ],
  },
];

type AtmoCondition =
  | "clear"
  | "rain"
  | "drizzle"
  | "snow"
  | "cloudy"
  | "fewclouds";

type Hourly = {
  t: string;
  tF: number;
  tC: number;
  cond: AtmoCondition;
  pop: number;
};

type Daily = {
  d: string;
  cond: AtmoCondition;
  hiF: number;
  hiC: number;
  loF: number;
  loC: number;
  pop: number;
};

type AtmoLocation = {
  id: string;
  city: string;
  region: string;
  country: string;
  tz: string;
  localTime: string;
  lat: number;
  lon: number;
  condition: AtmoCondition;
  conditionLabel: string;
  tempF: number;
  tempC: number;
  feelsF: number;
  feelsC: number;
  highF: number;
  highC: number;
  lowF: number;
  lowC: number;
  humidity: number;
  wind: { speedMph: number; speedKph: number; dir: string; deg: number };
  pressure: number;
  visibility: number;
  uv: number;
  sunrise: string;
  sunset: string;
  precip: number;
  dewF: number;
  hourly: Hourly[];
  daily: Daily[];
};

type LocationInput = {
  type: "coords";
  lat: number;
  lon: number;
  name?: string;
};

const STORAGE_KEY = "atmo-locations";

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

function pickTemplate(lat: number, lon: number) {
  if (lat > 50 || lon < -10) return INITIAL_LOCATIONS[2];
  if (lat > 20 || lon > 20) return INITIAL_LOCATIONS[0];
  if (lat < -20 || lon < 0) return INITIAL_LOCATIONS[1];
  return INITIAL_LOCATIONS[1];
}

function synthesizeLocation(
  data: LocationInput,
  sequence: number,
): AtmoLocation {
  const template = pickTemplate(data.lat, data.lon);
  return {
    ...template,
    id: `loc-${sequence}-${Math.random().toString(36).slice(2, 5)}`,
    city: data.name || `${data.lat.toFixed(2)}, ${data.lon.toFixed(2)}`,
    region: "Custom",
    country: "--",
    lat: data.lat,
    lon: data.lon,
    localTime: template.localTime,
  };
}

function getInitialLocations(): AtmoLocation[] {
  if (typeof window === "undefined") return INITIAL_LOCATIONS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_LOCATIONS;
    const parsed = JSON.parse(stored) as AtmoLocation[];
    return Array.isArray(parsed) && parsed.length ? parsed : INITIAL_LOCATIONS;
  } catch {
    return INITIAL_LOCATIONS;
  }
}

function forecastHourLabel(time: string) {
  return time.toLowerCase();
}

function WeatherPanel({
  location,
  unit,
  index,
  total,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: {
  location: AtmoLocation;
  unit: "C" | "F";
  index: number;
  total: number;
  onRemove: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}) {
  const mood = MOODS[moodFromCondition(location.condition)];
  const darkText = location.condition === "snow";
  const textColor = darkText ? "#1a2030" : "#fff";
  const mutedColor = darkText ? "rgba(26,32,48,0.7)" : "rgba(255,255,255,0.75)";
  const borderColor = darkText ? "rgba(26,32,48,0.2)" : "rgba(255,255,255,0.2)";

  const temp = unit === "F" ? location.tempF : location.tempC;
  const feels = unit === "F" ? location.feelsF : location.feelsC;
  const hi = unit === "F" ? location.highF : location.highC;
  const lo = unit === "F" ? location.lowF : location.lowC;
  const wind = unit === "F" ? location.wind.speedMph : location.wind.speedKph;
  const windUnit = unit === "F" ? "mph" : "kph";
  const allTemps = location.daily.flatMap((d) =>
    unit === "F" ? [d.hiF, d.loF] : [d.hiC, d.loC],
  );
  const globalMin = Math.min(...allTemps) - 1;
  const globalMax = Math.max(...allTemps) + 1;

  return (
    <div
      style={{
        ...panelStyleBase,
        background: mood.background,
        color: textColor,
      }}
    >
      <AtmosphereLayers condition={location.condition} />

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
          № {String(index + 1).padStart(2, "0")} · {location.tz}{" "}
          {location.localTime}
        </div>
        <div style={cityNameStyle}>{location.city}</div>
        <div style={{ ...cityRegionStyle, marginBottom: 24 }}>
          {location.region}
        </div>

        <div style={bigTempStyle}>
          {temp}
          <span style={degSymbolStyle}>°{unit}</span>
        </div>
        <div style={conditionStyle}>{location.conditionLabel}</div>
        <div style={{ ...hiLoStyle, color: mutedColor }}>
          H {hi}° · L {lo}° · Feels {feels}°
        </div>

        <div style={spacerStyle} />

        <div style={{ ...hourlyStripStyle, borderColor }}>
          {location.hourly.slice(0, 6).map((hour, hourIndex) => (
            <div key={hourIndex} style={hourCellStyle}>
              <div style={{ ...hourTStyle, color: mutedColor }}>
                {forecastHourLabel(hour.t)}
              </div>
              <div style={{ fontSize: 16, lineHeight: 1 }}>
                {hour.cond === "snow"
                  ? "•"
                  : hour.cond === "rain" || hour.cond === "drizzle"
                    ? "∴"
                    : hour.cond === "clear"
                      ? "◔"
                      : "◌"}
              </div>
              <div style={hourTempStyle}>
                {unit === "F" ? hour.tF : hour.tC}°
              </div>
            </div>
          ))}
        </div>

        <div style={readingsGridStyle}>
          <div>
            <div style={{ ...readLblStyle, color: mutedColor }}>Wind</div>
            <div style={readValStyle}>
              {wind}
              <span style={readValSmStyle}>
                {windUnit} {location.wind.dir}
              </span>
            </div>
          </div>
          <div>
            <div style={{ ...readLblStyle, color: mutedColor }}>Humidity</div>
            <div style={readValStyle}>
              {location.humidity}
              <span style={readValSmStyle}>%</span>
            </div>
          </div>
          <div>
            <div style={{ ...readLblStyle, color: mutedColor }}>Pressure</div>
            <div style={readValStyle}>
              {location.pressure}
              <span style={readValSmStyle}>hPa</span>
            </div>
          </div>
          <div>
            <div style={{ ...readLblStyle, color: mutedColor }}>UV</div>
            <div style={readValStyle}>
              {location.uv}
              <span style={readValSmStyle}>/11</span>
            </div>
          </div>
        </div>

        <div style={{ ...dailyListStyle, borderColor }}>
          {location.daily.map((day, dayIndex) => {
            const dhi = unit === "F" ? day.hiF : day.hiC;
            const dlo = unit === "F" ? day.loF : day.loC;
            const left = ((dlo - globalMin) / (globalMax - globalMin)) * 100;
            const right = ((dhi - globalMin) / (globalMax - globalMin)) * 100;
            return (
              <div key={dayIndex} style={dailyRowStyle}>
                <span style={dailyDayStyle}>{day.d}</span>
                <span>
                  {day.cond === "snow"
                    ? "•"
                    : day.cond === "rain" || day.cond === "drizzle"
                      ? "∴"
                      : day.cond === "clear"
                        ? "◔"
                        : "◌"}
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
                      width: `${right - left}%`,
                      background: textColor,
                      opacity: 0.85,
                    }}
                  />
                </div>
                <span style={dailyHiLoStyle}>
                  {dhi}° / {dlo}°
                </span>
              </div>
            );
          })}
        </div>

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
            ◂
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
            ▸
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
  const [locations, setLocations] =
    useState<AtmoLocation[]>(getInitialLocations);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  }, [locations]);

  const slots = useMemo(
    () => Array.from({ length: 3 }, (_, index) => locations[index] ?? null),
    [locations],
  );

  const handleSubmit = (data: LocationInput): boolean => {
    if (locations.length >= 3) return false;

    const candidate = synthesizeLocation(data, locations.length + 1);
    const updated = [...locations, candidate];
    setLocations(updated);
    return true;
  };

  const handleRemove = (id: string) => {
    setLocations((current) => current.filter((location) => location.id !== id));
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
              unit={unit}
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
