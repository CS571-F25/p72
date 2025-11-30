import { useCallback, useState } from "react";

export type PositionCoords = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<PositionCoords | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = useCallback(
    async (opts?: PositionOptions, timeoutMs = 10000) => {
      if (!("geolocation" in navigator)) {
        const msg = "Geolocation is not supported by your browser.";
        setError(msg);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const pos = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            let timedOut = false;
            const timer = window.setTimeout(() => {
              timedOut = true;
              reject(new Error("Location request timed out."));
            }, timeoutMs);

            navigator.geolocation.getCurrentPosition(
              (position) => {
                if (timedOut) return;
                clearTimeout(timer);
                resolve(position);
              },
              (err) => {
                if (timedOut) return;
                clearTimeout(timer);
                reject(err);
              },
              opts
            );
          }
        );

        const c = {
          latitude: Math.round(pos.coords.latitude * 10000) / 10000,
          longitude: Math.round(pos.coords.longitude * 10000) / 10000,
          accuracy: pos.coords.accuracy,
        };
        setCoords(c);
        return c;
      } catch (err: any) {
        setError(err?.message ?? "Failed to get location.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { coords, loading, error, getCurrentPosition } as const;
}
