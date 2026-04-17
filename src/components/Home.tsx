import HomeAtmosphere from "./HomeAtmosphere";
import Weather from "./Weather";

export default function Home() {
  if (import.meta.env.DEV) {
    return <HomeAtmosphere />;
  }

  return <Weather />;
}
