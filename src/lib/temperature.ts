export function celsiusToFahrenheit(celsius: number) {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number) {
  return ((fahrenheit - 32) * 5) / 9;
}

export function tempForUnit(celsius: number, unit: "C" | "F") {
  return unit === "F" ? celsiusToFahrenheit(celsius) : celsius;
}

export function tempCompact(celsius: number, unit: "C" | "F") {
  const value = tempForUnit(celsius, unit);
  return `${Math.round(value)}°${unit}`;
}

export function tempDisplay(celsius: number): string {
  const f = celsiusToFahrenheit(celsius);
  return `${celsius.toFixed(1)}°C / ${f.toFixed(1)}°F`;
}
