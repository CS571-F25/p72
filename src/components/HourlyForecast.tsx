import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";

type Interval = {
  startTime: string;
  values?: Record<string, any>;
};

export default function HourlyForecast({
  lat,
  lon,
}: {
  lat: number;
  lon: number;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const intervalsRef = useRef<Interval[]>([]);
  intervalsRef.current = intervals;

  const unitSymbol = "°F";
  const timezone = "UTC";

  useEffect(() => {
    const controller = new AbortController();

    // Only show the loading UI if we have no data yet.
    if (intervalsRef.current.length === 0) {
      setLoading(true);
    }
    setError(null);

    (async () => {
      try {
        const BASE = import.meta.env.VITE_WEATHER_API_BASE_URL || "";
        const params = new URLSearchParams({ location: `${lat},${lon}` });
        const endpoint = BASE
          ? `${BASE}/api/weather-forecast?${params.toString()}`
          : `/api/weather-forecast?${params.toString()}`;

        const res = await axios.get(endpoint, { signal: controller.signal });
        const body = res.data;

        const found: Interval[] | undefined =
          body?.data?.timelines?.[0]?.intervals ||
          body?.timelines?.[0]?.intervals ||
          body?.data?.intervals ||
          body?.intervals;

        if (!found || !Array.isArray(found) || found.length === 0) {
          throw new Error("No hourly data returned");
        }

        // replace intervals only after a successful fetch
        setIntervals(found.slice(0, 24));
      } catch (err: any) {
        if (
          err?.name === "CanceledError" ||
          err?.name === "AbortError" ||
          err?.code === "ERR_CANCELED" ||
          axios.isCancel?.(err)
        ) {
          return;
        }
        setError(err?.message || String(err));
      } finally {
        // always clear loading flag (if we were showing it)
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [lat, lon]);

  const rows = useMemo(
    () =>
      intervals.map((iv) => {
        const t = new Date(iv.startTime);
        const rawTemp =
          iv.values?.temperature ?? iv.values?.temperatureApparent ?? null;
        const temp = rawTemp == null ? null : Math.round(rawTemp);
        const pop =
          iv.values?.precipitationProbability ??
          iv.values?.precipitation ??
          null;
        const wind = iv.values?.windSpeed ?? null;
        return { t, temp, pop, wind };
      }),
    [intervals]
  );

  // Only show the loading placeholder when there's no data to display yet.
  if (loading && intervals.length === 0)
    return (
      <div className="py-2">
        <div className="text-sm text-muted-foreground">Hourly (24h)</div>
        <div className="mt-2">Loading hourly forecast…</div>
      </div>
    );

  // Show error only if there's no data to show
  if (error && intervals.length === 0)
    return (
      <div className="py-2 text-sm text-red-500">
        Error loading forecast: {error}
      </div>
    );

  return (
    <div className="py-2">
      <div className="text-sm text-muted-foreground mb-2">Hourly (24h)</div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {rows.map((r, i) => (
          <div
            key={i}
            className="flex-none w-20 p-2 rounded-lg bg-gray-50 dark:bg-slate-800 text-center"
          >
            <div className="text-xs text-muted-foreground">
              {r.t.toLocaleTimeString([], {
                hour: "numeric",
                timeZone: timezone,
              })}
            </div>
            <div className="text-sm font-medium mt-1">
              {r.temp == null ? "—" : `${r.temp}${unitSymbol}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
