import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { tempDisplay } from "@/lib/temperature";

type Interval = {
  startTime: string;
  values?: Record<string, any>;
};

const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const CACHE = new Map<string, { ts: number; intervals: Interval[] }>();

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
  const mountedRef = useRef(true);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  useEffect(() => {
    mountedRef.current = true;
    const key = `${lat},${lon}`;
    const cached = CACHE.get(key);
    const now = Date.now();

    // If cache valid, show it immediately and refresh in background.
    if (cached && now - cached.ts < CACHE_TTL) {
      setIntervals(cached.intervals);
      setLoading(false);
      setError(null);
      // background refresh (no UI loading)
      const controller = new AbortController();
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

          if (found && Array.isArray(found) && found.length > 0) {
            const next = found.slice(0, 24);
            CACHE.set(key, { ts: Date.now(), intervals: next });
            if (mountedRef.current) setIntervals(next);
          }
        } catch (err: any) {
          if (
            err?.name === "CanceledError" ||
            err?.name === "AbortError" ||
            err?.code === "ERR_CANCELED" ||
            axios.isCancel?.(err)
          ) {
            return;
          }
          // don't overwrite UI on background failure
          console.warn(
            "HourlyForecast background refresh failed:",
            err?.message || err
          );
        }
      })();
      return () => {
        mountedRef.current = false;
        // abort background if needed
      };
    }

    // No cache: fetch and show loading placeholder
    setLoading(true);
    setError(null);
    const controller = new AbortController();

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

        const next = found.slice(0, 24);
        CACHE.set(key, { ts: Date.now(), intervals: next });
        if (mountedRef.current) setIntervals(next);
      } catch (err: any) {
        if (
          err?.name === "CanceledError" ||
          err?.name === "AbortError" ||
          err?.code === "ERR_CANCELED" ||
          axios.isCancel?.(err)
        ) {
          return;
        }
        if (mountedRef.current) setError(err?.message || String(err));
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    return () => {
      mountedRef.current = false;
      controller.abort();
    };
  }, [lat, lon]);

  const rows = useMemo(
    () =>
      intervals.map((iv) => {
        const t = new Date(iv.startTime);
        const temp =
          iv.values?.temperature ?? iv.values?.temperatureApparent ?? null;
        const pop =
          iv.values?.precipitationProbability ??
          iv.values?.precipitation ??
          null;
        const wind = iv.values?.windSpeed ?? null;
        return { t, temp, pop, wind };
      }),
    [intervals]
  );

  // Only show the loading placeholder when there is no data to display yet.
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
      <div className="text-sm text-muted-foreground mb-3 font-medium">
        Hourly (24h)
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {rows.map((r, i) => (
          <div
            key={i}
            className="flex-none w-16 p-2 text-center flex flex-col items-center justify-center rounded-lg bg-gray-50 dark:bg-slate-800 text-xs"
          >
            <div className="text-muted-foreground truncate w-full">
              {r.t.toLocaleTimeString([], {
                hour: "numeric",
                timeZone: timezone,
              })}
            </div>
            <div className="font-semibold mt-1">
              {r.temp == null ? "—" : tempDisplay(r.temp)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
