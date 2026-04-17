import { useGeolocation } from "@/hooks/useGeolocation";

export default function UseMyLocationButton({
  onSubmit,
  disabled = false,
}: {
  onSubmit: (data: any) => void;
  disabled?: boolean;
}) {
  const { getCurrentPosition, loading } = useGeolocation();

  const handleUseLocation = async () => {
    // Check permission state if available
    if (navigator.permissions) {
      try {
        const status = await navigator.permissions.query({
          name: "geolocation" as PermissionName,
        });
        if (status.state === "denied") {
          alert(
            "Location access was denied. Please enable it in your browser settings.",
          );
          return;
        }
      } catch (e) {
        // ignore and proceed
      }
    }

    const pos = await getCurrentPosition({ enableHighAccuracy: true }, 12000);
    if (!pos) return;

    onSubmit({
      type: "coords",
      lat: Math.round(pos.latitude * 10000) / 10000,
      lon: Math.round(pos.longitude * 10000) / 10000,
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleUseLocation}
        disabled={loading || disabled}
        className="atmo-button w-full h-11 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Locating…" : "Use my location"}
      </button>
    </div>
  );
}
