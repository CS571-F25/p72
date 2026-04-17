import WeatherCard from "./WeatherCard";
import LocationTabs from "@/components/LocationTabs";
import UseMyLocationButton from "@/components/UseMyLocationButton";
import { LocationContext } from "@/contexts/LocationContext";
import { AlertMaxLocations, AlertAlreadyExists } from "@/components/Alerts";
import { useState, useEffect } from "react";

interface Location {
  location: string;
  name: string;
}

// type LocationByName = {
//   type: "name";
//   name: string;
// };

type LocationByCoords = {
  type: "coords";
  lat: number;
  lon: number;
  name?: string;
};

type LocationInput = LocationByCoords;

function Weather() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [showMaxWarning, setShowMaxWarning] = useState(false);
  const [showExistsWarning, setShowExistsWarning] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    const storedLocations = localStorage.getItem("locations");
    if (storedLocations) {
      try {
        setLocations(JSON.parse(storedLocations) as Location[]);
      } catch (e) {
        console.error("Invalid locations in localStorage:", e);
      }
    }
  }, []);

  const handleSubmit = (data: LocationInput): boolean => {
    if (locations.length >= 3) {
      setShowMaxWarning(true);

      setTimeout(() => {
        setShowMaxWarning(false);
      }, 5000);
      return false;
    }

    // if (data.type == "name") {
    //   newLocation = { location: data.name, name: data.name } as Location;
    // } else {
    const coordsStr = `${data.lat},${data.lon}`;
    const newLocation = {
      location: coordsStr,
      name: (data as LocationByCoords).name ?? coordsStr,
    } as Location;
    //}

    if (
      locations.some((loc) => {
        return loc.location == newLocation.location;
      })
    ) {
      // Location already exists should alert user
      setShowExistsWarning(true);

      setTimeout(() => {
        setShowExistsWarning(false);
      }, 5000);
      return false;
    }

    const newLocations = [...locations, newLocation];
    localStorage.setItem("locations", JSON.stringify(newLocations));
    setLocations(newLocations);
    return true;
  };

  const handlePickerSubmit = (data: LocationInput) => {
    const saved = handleSubmit(data);
    if (saved) setShowLocationPicker(false);
  };

  return (
    <section className="atmo-page atmo-reveal">
      <LocationContext.Provider
        value={{ data: locations, updateData: setLocations }}
      >
        <div className="atmo-page-inner">
          <header className="mb-7 atmo-reveal atmo-reveal-delay-1 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="atmo-kicker">Location Deck</p>
              <h1 className="atmo-title">Weather Atlas</h1>
              <p className="text-sm atmo-muted-copy mt-3 max-w-xl">
                Add up to 3 locations to compare the sky in parallel.
              </p>
            </div>

            <button
              type="button"
              className="atmo-button self-start"
              onClick={() => setShowLocationPicker(true)}
            >
              Add location
            </button>
          </header>

          {showMaxWarning ? <AlertMaxLocations></AlertMaxLocations> : <></>}
          {showExistsWarning ? (
            <AlertAlreadyExists></AlertAlreadyExists>
          ) : (
            <></>
          )}

          {showLocationPicker && (
            <div
              className="weather-add-backdrop"
              role="dialog"
              aria-modal="true"
              aria-label="Add location"
            >
              <div className="weather-add-panel">
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
                    onClick={() => setShowLocationPicker(false)}
                  >
                    Close
                  </button>
                </div>

                <LocationTabs
                  onSubmit={handlePickerSubmit}
                  locationsCount={locations.length}
                />
              </div>
            </div>
          )}

          {locations.length === 0 ? (
            <div className="weather-empty-grid atmo-reveal atmo-reveal-delay-2">
              <div className="weather-empty-card">
                <p className="atmo-kicker">Start here</p>
                <h2 className="text-3xl font-light leading-tight mt-1">
                  Add a location
                </h2>
                <p className="mt-3 text-sm atmo-muted-copy leading-relaxed">
                  Open the picker to search by city, drop a pin on the map, or
                  enter coordinates.
                </p>
                <button
                  type="button"
                  className="atmo-button mt-5"
                  onClick={() => setShowLocationPicker(true)}
                >
                  Add location
                </button>
              </div>

              <div className="weather-empty-card">
                <p className="atmo-kicker">Quick add</p>
                <h2 className="text-3xl font-light leading-tight mt-1">
                  Use my location
                </h2>
                <p className="mt-3 text-sm atmo-muted-copy leading-relaxed">
                  Let the browser find your position and add it directly.
                </p>
                <div className="mt-5">
                  <UseMyLocationButton
                    onSubmit={handlePickerSubmit}
                    disabled={locations.length >= 3}
                  />
                </div>
              </div>

              <div className="weather-empty-card">
                <p className="atmo-kicker">Compare later</p>
                <h2 className="text-3xl font-light leading-tight mt-1">
                  Three slots total
                </h2>
                <p className="mt-3 text-sm atmo-muted-copy leading-relaxed">
                  Keep the deck focused. Each location becomes its own dashboard
                  panel.
                </p>
                <button
                  type="button"
                  className="atmo-button mt-5"
                  onClick={() => setShowLocationPicker(true)}
                >
                  Search maps
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
              {locations.map((location) => {
                return (
                  <WeatherCard
                    key={location.location}
                    location={location.location}
                    name={location.name}
                  />
                );
              })}
            </div>
          )}
        </div>
      </LocationContext.Provider>
    </section>
  );
}

export default Weather;
