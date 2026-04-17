import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { tempCompact } from "@/lib/temperature";
import { useTheme } from "@/theme/useTheme";

type Interval = {
  startTime: string;
  values?: Record<string, number | string | null | undefined>;
};

const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const CACHE = new Map<string, { ts: number; intervals: Interval[] }>();

const isCanceledError = (err: unknown) => {
  if (axios.isCancel?.(err)) return true;
  if (!(err instanceof Error)) return false;

  const withCode = err as Error & { code?: string };
  return (
    err.name === "CanceledError" ||
    err.name === "AbortError" ||
    withCode.code === "ERR_CANCELED"
  );
};

const pickNext24 = (intervals: Interval[]) => {
  const now = Date.now();
  const future = intervals.filter(
    (iv) => new Date(iv.startTime).getTime() >= now,
  );
  return (future.length ? future : intervals).slice(0, 24);
};

export default function HourlyForecast({
  lat,
  lon,
}: {
  lat: number;
  lon: number;
}) {
  const { unit } = useTheme();
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
      setIntervals(cached.intervals); // store full response
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
            CACHE.set(key, { ts: Date.now(), intervals: found }); // cache full response
            if (mountedRef.current) setIntervals(found);
          }
        } catch (err: unknown) {
          if (isCanceledError(err)) {
            return;
          }
          console.warn(
            "HourlyForecast background refresh failed:",
            err instanceof Error ? err.message : String(err),
          );
        }
      })();
      return () => {
        mountedRef.current = false;
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

        CACHE.set(key, { ts: Date.now(), intervals: found }); // cache full response
        if (mountedRef.current) setIntervals(found);
      } catch (err: unknown) {
        if (isCanceledError(err)) {
          return;
        }
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    return () => {
      mountedRef.current = false;
      controller.abort();
    };
  }, [lat, lon]);

  const rows = useMemo(() => {
    const next24 = pickNext24(intervals); // slice to next 24 on render
    return next24.map((iv) => {
      const t = new Date(iv.startTime);
      const tempRawC =
        iv.values?.temperature ?? iv.values?.temperatureApparent ?? null;
      const tempC =
        typeof tempRawC === "number"
          ? tempRawC
          : typeof tempRawC === "string"
            ? Number.isFinite(Number(tempRawC))
              ? Number(tempRawC)
              : null
            : null;
      const pop =
        iv.values?.precipitationProbability ?? iv.values?.precipitation ?? null;
      const wind = iv.values?.windSpeed ?? null;
      return { t, tempC, pop, wind };
    });
  }, [intervals]);

  // Only show the loading placeholder when there is no data to display yet.
  if (loading && intervals.length === 0)
    return (
      <div className="py-2">
        <div className="text-xs font-mono uppercase tracking-[0.2em] opacity-70">
          Hourly (24h)
        </div>
        <div className="mt-2 text-sm opacity-80">
          Loading hourly forecast...
        </div>
      </div>
    );

  // Show error only if there's no data to show
  if (error && intervals.length === 0)
    return (
      <div className="py-2 text-sm text-red-100">
        Error loading forecast: {error}
      </div>
    );

  return (
    <div className="py-2">
      <div className="text-xs font-mono uppercase tracking-[0.2em] opacity-70 mb-3">
        Hourly (24h)
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {rows.map((r, i) => (
          <div
            key={i}
            className="flex-none w-20 p-2 text-center flex flex-col items-center justify-center rounded-lg border border-white/20 bg-black/20 text-xs"
          >
            <div className="truncate w-full font-mono text-[0.62rem] uppercase tracking-[0.12em] opacity-75">
              {r.t.toLocaleTimeString([], {
                hour: "numeric",
                timeZone: timezone,
              })}
            </div>
            <div className="font-semibold mt-1 text-sm">
              {r.tempC == null ? "-" : tempCompact(r.tempC, unit)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
