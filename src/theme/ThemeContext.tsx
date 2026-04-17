import { createContext, useEffect, useMemo, useState } from "react";

type ThemeName = "atmosphere";
export type TempUnit = "C" | "F";

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  unit: TempUnit;
  setUnit: (unit: TempUnit) => void;
  toggleUnit: () => void;
};

const STORAGE_KEY = "weather-ui-theme";
const UNIT_KEY = "weather-temp-unit";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readUnit(): TempUnit {
  const stored = localStorage.getItem(UNIT_KEY);
  return stored === "F" ? "F" : "C";
}

function readTheme(): ThemeName {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "atmosphere" ? "atmosphere" : "atmosphere";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(() => readTheme());
  const [unit, setUnit] = useState<TempUnit>(() => readUnit());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(UNIT_KEY, unit);
  }, [unit]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      unit,
      setUnit,
      toggleUnit: () => setUnit((prev) => (prev === "C" ? "F" : "C")),
    }),
    [theme, unit],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export { ThemeContext };
