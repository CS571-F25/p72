import WeatherCard from "@/components/WeatherCard";
import WeatherCardDev from "@/components/WeatherCardDev";
import LocationTabs from "@/components/LocationTabs";
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
  const [showMaxWarning, setShowMaxWarning] = useState<Boolean>(false);
  const [showExistsWarning, setShowExistsWarning] = useState<Boolean>(false);

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

  const handleSubmit = (data: LocationInput): void => {
    if (locations.length >= 3) {
      setShowMaxWarning(true);

      setTimeout(() => {
        setShowMaxWarning(false);
      }, 5000);
      return;
    }

    let newLocation;
    // if (data.type == "name") {
    //   newLocation = { location: data.name, name: data.name } as Location;
    // } else {
    const coordsStr = `${data.lat},${data.lon}`;
    newLocation = {
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
      return;
    }

    const newLocations = [...locations, newLocation];
    localStorage.setItem("locations", JSON.stringify(newLocations));
    setLocations(newLocations);
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <LocationContext.Provider
        value={{ data: locations, updateData: setLocations }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Your Locations</h2>
            <p className="text-sm text-muted-foreground">
              Add up to 3 locations to track their weather
            </p>
          </div>

          <div className="mb-12">
            <LocationTabs
              onSubmit={handleSubmit}
              locationsCount={locations.length}
            ></LocationTabs>
          </div>

          {showMaxWarning ? <AlertMaxLocations></AlertMaxLocations> : <></>}
          {showExistsWarning ? (
            <AlertAlreadyExists></AlertAlreadyExists>
          ) : (
            <></>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location) => {
              if (import.meta.env.DEV) {
                return (
                  <WeatherCardDev
                    key={location.location}
                    location={location.location}
                    name={location.name}
                  />
                );
              }
              return (
                <WeatherCard
                  key={location.location}
                  location={location.location}
                  name={location.name}
                />
              );
            })}
          </div>
        </div>
      </LocationContext.Provider>
    </div>
  );
}

export default Weather;
