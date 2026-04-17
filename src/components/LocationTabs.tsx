import { useState } from "react";
import UseMyLocationButton from "@/components/UseMyLocationButton";
import React from "react";
import { AlertBadCoordinates } from "@/components/Alerts";

const GoogleMapPicker = React.lazy(() => import("./GoogleMapPicker"));

type LocationSubmitData = {
  type: "coords";
  lat: number;
  lon: number;
  name?: string;
};

export default function LocationTabs({
  onSubmit,
  locationsCount = 0,
}: {
  onSubmit: (data: LocationSubmitData) => void;
  locationsCount?: number;
}) {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  const [showCoordsWarning, setShowCoordsWarning] = useState<boolean>(false);

  function isValidCoordinate(lat: string, lon: string): boolean {
    const latNum = Number(lat);
    const lonNum = Number(lon);

    if (isNaN(latNum) || isNaN(lonNum)) return false;
    if (latNum < -90 || latNum > 90) return false;
    if (lonNum < -180 || lonNum > 180) return false;

    return true;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="atmo-panel p-3 sm:p-4">
        <React.Suspense
          fallback={
            <div className="h-80 flex items-center justify-center atmo-muted-copy">
              Loading map...
            </div>
          }
        >
          <GoogleMapPicker onPick={onSubmit} disabled={locationsCount >= 3} />
        </React.Suspense>
      </div>

      <aside className="atmo-panel p-4 sm:p-5 self-start">
        <p className="atmo-kicker">Manual Coordinates</p>
        <p className="text-sm atmo-muted-copy mb-4">
          Paste precise latitude and longitude if you already know the exact
          point.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isValidCoordinate(lat, lon)) {
              onSubmit({
                type: "coords",
                lat: parseFloat(lat),
                lon: parseFloat(lon),
              });
              setLat("");
              setLon("");
            } else {
              setShowCoordsWarning(true);
              setTimeout(() => {
                setShowCoordsWarning(false);
              }, 5000);
              return;
            }
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="lat" className="atmo-kicker">
              Latitude
            </label>
            <input
              id="lat"
              type="number"
              step="any"
              placeholder="e.g. 40.7128"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="atmo-input mt-2"
            />
          </div>
          <div>
            <label htmlFor="lon" className="atmo-kicker">
              Longitude
            </label>
            <input
              id="lon"
              type="number"
              step="any"
              placeholder="e.g. -74.0060"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="atmo-input mt-2"
            />
          </div>

          <button
            type="submit"
            disabled={locationsCount >= 3 || !lat || !lon}
            className="atmo-button w-full h-11 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add by Coordinates
          </button>
          <UseMyLocationButton
            onSubmit={onSubmit}
            disabled={locationsCount >= 3}
          />
        </form>

        {showCoordsWarning ? (
          <AlertBadCoordinates></AlertBadCoordinates>
        ) : (
          <></>
        )}
      </aside>
    </div>
  );
}
