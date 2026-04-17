import { useMemo } from "react";
import { moodFromCondition } from "@/components/atmosphere/moods";

function RainLayer({ heavy }: { heavy: boolean }) {
  const count = heavy ? 54 : 30;
  const drops = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 0.65 + Math.random() * 0.7,
        height: 14 + Math.random() * 28,
        opacity: 0.2 + Math.random() * 0.45,
      })),
    [count],
  );

  return (
    <div className="atmo-layer" aria-hidden>
      {drops.map((drop, index) => (
        <span
          key={index}
          className="atmo-drop"
          style={{
            left: `${drop.left}%`,
            height: `${drop.height}px`,
            animationDelay: `${drop.delay}s`,
            animationDuration: `${drop.duration}s`,
            opacity: drop.opacity,
          }}
        />
      ))}
    </div>
  );
}

function SnowLayer() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 42 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 8 + Math.random() * 7,
        size: 2 + Math.random() * 4,
        drift: (Math.random() - 0.5) * 50,
      })),
    [],
  );

  return (
    <div className="atmo-layer" aria-hidden>
      {flakes.map((flake, index) => (
        <span
          key={index}
          className="atmo-flake"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            ["--drift" as string]: `${flake.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

function SunLayer() {
  return (
    <div className="atmo-layer" aria-hidden>
      <span className="atmo-sun" />
      <span className="atmo-heat" />
    </div>
  );
}

function CloudLayer({ many }: { many: boolean }) {
  const clouds = useMemo(
    () =>
      Array.from({ length: many ? 4 : 2 }, () => ({
        top: 8 + Math.random() * 40,
        left: -25 + Math.random() * 25,
        size: 240 + Math.random() * 140,
        duration: 65 + Math.random() * 45,
        delay: -Math.random() * 70,
      })),
    [many],
  );

  return (
    <div className="atmo-layer" aria-hidden>
      {clouds.map((cloud, index) => (
        <span
          key={index}
          className="atmo-cloud"
          style={{
            top: `${cloud.top}%`,
            left: `${cloud.left}%`,
            width: `${cloud.size}px`,
            height: `${cloud.size * 0.42}px`,
            animationDuration: `${cloud.duration}s`,
            animationDelay: `${cloud.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function AtmosphereLayers({ condition }: { condition: string }) {
  const mood = moodFromCondition(condition);

  if (mood === "snow") return <SnowLayer />;
  if (mood === "rain") return <RainLayer heavy />;
  if (mood === "drizzle") return <RainLayer heavy={false} />;
  if (mood === "clear") return <SunLayer />;
  if (mood === "cloudy" || mood === "fewclouds") {
    return <CloudLayer many={mood === "cloudy"} />;
  }

  return null;
}
