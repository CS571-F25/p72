import { createContext } from "react";

interface Location {
  location: string;
}

interface LocationContext {
  data: Location[];
  updateData: (newData: Location[]) => void;
}

export const LocationContext = createContext<LocationContext | undefined>(
  undefined
);
