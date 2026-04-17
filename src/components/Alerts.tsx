import { InfoIcon } from "@/components/ui/InfoIcon";

function AlertWarn(title: string, body: string) {
  return (
    <div className="w-full max-w-md text-left">
      <div className="atmo-alert">
        <div className="flex flex-row justify-between items-center gap-2">
          <p className="atmo-alert-title">{title}</p>
          <InfoIcon className="h-5 w-5"></InfoIcon>
        </div>
        <p className="atmo-alert-body">{body}</p>
      </div>
    </div>
  );
}

export function AlertMaxLocations() {
  return AlertWarn(
    "Too many locations!",
    "Due to api constraints, this web app only supports showing up to three locations at a time. Please remove one location to add another.",
  );
}

export function AlertAlreadyExists() {
  return AlertWarn(
    "Location is already displayed!",
    "Please try adding a different location.",
  );
}

export function AlertBadCoordinates() {
  return AlertWarn(
    "These coordinates aren't real!",
    "Please try latitudes within -90 to 90 and longitudes within -180 to 180.",
  );
}
