import { useTheme } from "@/theme/useTheme";

export default function UnitsToggle() {
  const { unit, setUnit } = useTheme();

  return (
    <div className="atmo-units" role="group" aria-label="Temperature units">
      <button
        type="button"
        className={unit === "C" ? "is-active" : ""}
        aria-pressed={unit === "C"}
        onClick={() => setUnit("C")}
        title="Show temperatures in Celsius"
      >
        Celsius
      </button>
      <button
        type="button"
        className={unit === "F" ? "is-active" : ""}
        aria-pressed={unit === "F"}
        onClick={() => setUnit("F")}
        title="Show temperatures in Fahrenheit"
      >
        Fahrenheit
      </button>
    </div>
  );
}
