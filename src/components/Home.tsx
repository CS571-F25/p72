import { Button } from "@/components/ui/button";
import WeatherCard from "@/components/WeatherCard";

export default function Home() {
  return (
    <div>
      <Button> button </Button>
      <h1> Home </h1>
      <WeatherCard location="New York"></WeatherCard>
    </div>
  );
}
