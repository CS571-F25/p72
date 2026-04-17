export type MoodKey =
  | "clear"
  | "rain"
  | "drizzle"
  | "snow"
  | "cloudy"
  | "fewclouds";

export type Mood = {
  background: string;
  accent: string;
  text: string;
  muted: string;
  border: string;
};

export const MOODS: Record<MoodKey, Mood> = {
  clear: {
    background:
      "linear-gradient(175deg, #f4b267 0%, #e88a4d 35%, #c15a5a 70%, #4a2d4a 100%)",
    accent: "#fff3d6",
    text: "#fff8ea",
    muted: "rgba(255, 245, 224, 0.8)",
    border: "rgba(255, 245, 224, 0.25)",
  },
  rain: {
    background:
      "linear-gradient(180deg, #3a4a5c 0%, #2a3544 40%, #1a2430 80%, #0f1820 100%)",
    accent: "#9ac4e8",
    text: "#ebf6ff",
    muted: "rgba(220, 235, 247, 0.8)",
    border: "rgba(200, 220, 240, 0.28)",
  },
  drizzle: {
    background:
      "linear-gradient(180deg, #556472 0%, #3e4a57 60%, #2a3540 100%)",
    accent: "#c8d4e0",
    text: "#edf4fb",
    muted: "rgba(227, 239, 250, 0.8)",
    border: "rgba(200, 220, 238, 0.28)",
  },
  snow: {
    background:
      "linear-gradient(180deg, #d4dfea 0%, #a8bccf 35%, #8098b2 70%, #556a82 100%)",
    accent: "#223349",
    text: "#1a2536",
    muted: "rgba(27, 43, 62, 0.75)",
    border: "rgba(28, 46, 66, 0.25)",
  },
  cloudy: {
    background:
      "linear-gradient(180deg, #8a96a2 0%, #6d7985 50%, #4e5a66 100%)",
    accent: "#dce4ec",
    text: "#f6fbff",
    muted: "rgba(238, 245, 250, 0.8)",
    border: "rgba(225, 235, 245, 0.24)",
  },
  fewclouds: {
    background:
      "linear-gradient(175deg, #89a9cc 0%, #a6b8c8 40%, #c4ad8c 80%, #8e7558 100%)",
    accent: "#fff",
    text: "#fffbf5",
    muted: "rgba(255, 250, 244, 0.8)",
    border: "rgba(255, 250, 244, 0.26)",
  },
};

export function moodFromCondition(condition: string): MoodKey {
  const normalized = condition.toLowerCase();
  if (normalized.includes("snow")) return "snow";
  if (normalized.includes("drizzle")) return "drizzle";
  if (normalized.includes("rain")) return "rain";
  if (normalized.includes("clear") || normalized.includes("sun"))
    return "clear";
  if (normalized.includes("partly")) return "fewclouds";
  return "cloudy";
}
