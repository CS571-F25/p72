import { createContext } from "react";

interface Location {
  location: string;
  name: string;
}

interface LocationContext {
  data: Location[];
  updateData: (newData: Location[]) => void;
}

export const LocationContext = createContext<LocationContext | undefined>(
  undefined
);
