import WeatherCard from "@/components/WeatherCard";
import LocationTabs from "@/components/LocationTabs";
import { LocationContext } from "@/contexts/LocationContext";
import { AlertMaxLocations, AlertAlreadyExists } from "@/components/Alerts";
import { useState, useEffect } from "react";

interface Location {
  location: string;
  name: string;
}

type LocationByName = {
  type: "name";
  name: string;
};

type LocationByCoords = {
  type: "coords";
  lat: number;
  lon: number;
};

type LocationInput = LocationByName | LocationByCoords;

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
    if (data.type == "name") {
      newLocation = { location: data.name } as Location;
    } else {
      newLocation = { location: `${data.lat},${data.lon}` } as Location;
    }

    if (
      locations.some((loc) => {
        return loc.location == newLocation.location;
      })
    ) {
      // Location already exists TODO: should alert user
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
    <div>
      <LocationContext.Provider
        value={{ data: locations, updateData: setLocations }}
      >
        <LocationTabs onSubmit={handleSubmit}></LocationTabs>
        {showMaxWarning ? <AlertMaxLocations></AlertMaxLocations> : <></>}
        {showExistsWarning ? <AlertAlreadyExists></AlertAlreadyExists> : <></>}
        {locations.map((location, i) => {
          return (
            <WeatherCard
              key={i}
              location={location.location}
              name={location.name}
            ></WeatherCard>
          );
        })}
      </LocationContext.Provider>
    </div>
  );
}

export default Weather;
