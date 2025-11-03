import WeatherCard from "@/components/WeatherCard";
import LocationTabs from "@/components/LocationTabs";
import { useState, useEffect } from "react";

interface Location {
  location: string;
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
    if (data.type === "name") {
      const newLocations = [...locations, { location: data.name } as Location];

      localStorage.setItem("locations", JSON.stringify(newLocations));
      setLocations(newLocations);
    } else {
      const newLocations = [
        ...locations,
        { location: `${data.lat},${data.lon}` } as Location,
      ];

      localStorage.setItem("locations", JSON.stringify(newLocations));
      setLocations(newLocations);
    }
  };

  return (
    <div>
      <LocationTabs onSubmit={handleSubmit}></LocationTabs>
      {locations.map((location, i) => {
        return <WeatherCard key={i} location={location.location}></WeatherCard>;
      })}

      <WeatherCard location="Madison, Wisconsin"></WeatherCard>
    </div>
  );
}

export default Weather;
