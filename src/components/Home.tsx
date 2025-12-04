import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import cloudAnimation from "@/assets/lottie/cloud.json";
import sunAnimation from "@/assets/lottie/sun.json";
import rainAnimation from "@/assets/lottie/rain.json";
import stormAnimation from "@/assets/lottie/storm.json";
import windAnimation from "@/assets/lottie/wind.json";
import snowAnimation from "@/assets/lottie/snow.json";
import rainWindAnimation from "@/assets/lottie/rain-wind.json";
import { Button } from "@/components/ui/button";
import UseMyLocationButton from "@/components/UseMyLocationButton";
import WeatherCard from "@/components/WeatherCard";

export default function Home() {
  const navigate = useNavigate();
  const [previewLocation, setPreviewLocation] = useState<string | null>(null);

  const [carouselIndex, setCarouselIndex] = useState(0);

  const carouselAnimations = [
    sunAnimation,
    cloudAnimation,
    rainAnimation,
    rainWindAnimation,
    stormAnimation,
    snowAnimation,
    windAnimation,
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % carouselAnimations.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const handlePreview = (data: any) => {
    if (data?.type === "coords") {
      const lat = Math.round(data.lat * 10000) / 10000;
      const lon = Math.round(data.lon * 10000) / 10000;
      setPreviewLocation(`${lat},${lon}`);
    }
  };

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div
          style={{
            position: "absolute",
            right: "-10%",
            top: "-10%",
            width: "60%",
            height: "60%",
            background:
              "radial-gradient(ellipse at top right, rgba(99,102,241,0.06), rgba(236,72,153,0.03))",
            filter: "blur(48px)",
            opacity: 0.9,
          }}
        />
      </div>

      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left ml-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-sky-400 via-indigo-500 to-rose-400 bg-clip-text text-transparent">
              So... how's the weather?
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Get a quick forecast for any city — or use your current location.
            </p>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <Button
                onClick={() => navigate("/weather")}
                className="h-11 rounded-full px-6 bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:translate-y-0 min-w-[160px]"
              >
                Check the Weather
              </Button>

              <div className="mt-4 sm:mt-0 sm:ml-4 w-full max-w-xs">
                <UseMyLocationButton onSubmit={handlePreview} />
              </div>
            </div>

            <div className="mt-6">
              {previewLocation ? (
                <div className="max-w-sm mx-auto md:mx-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-muted-foreground">Preview</div>
                    <button
                      onClick={() => setPreviewLocation(null)}
                      className="text-xs text-muted-foreground hover:text-red-500"
                    >
                      Clear
                    </button>
                  </div>

                  <WeatherCard
                    location={previewLocation}
                    name={"Your location"}
                    disableDelete={true}
                  />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No preview — click “Use my location” to see a quick card.
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-64 h-64">
              <Lottie
                animationData={JSON.parse(JSON.stringify(cloudAnimation))}
                loop
                autoplay
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-6">
              {carouselAnimations.map((anim, i) => (
                <div
                  key={i}
                  className={`w-20 h-20 transition-transform duration-500 ease-out ${
                    i === carouselIndex
                      ? "scale-110 opacity-100"
                      : "scale-90 opacity-40"
                  }`}
                >
                  <Lottie
                    animationData={JSON.parse(JSON.stringify(anim))}
                    loop
                    autoplay
                    className="w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
