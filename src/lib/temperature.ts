export function celsiusToFahrenheit(celsius: number) {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number) {
  return ((fahrenheit - 32) * 5) / 9;
}

export function tempDisplay(celsius: number): string {
  const f = celsiusToFahrenheit(celsius);
  return `${celsius.toFixed(1)}°C / ${f.toFixed(1)}°F`;
}
