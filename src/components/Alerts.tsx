import { InfoIcon } from "@/components/ui/InfoIcon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function AlertWarn(title: string, body: string) {
  return (
    <div className="w-full max-w-md text-left">
      <Alert variant="destructive">
        <AlertTitle className="flex flex-row justify-between">
          <p>{title}</p>
          <InfoIcon className="h-5 w-5"></InfoIcon>
        </AlertTitle>
        <AlertDescription>
          <p>{body}</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function AlertMaxLocations() {
  return AlertWarn(
    "Too many locations!",
    "Due to api constraints, this web app only supports showing up to three locations at a time. Please remove one location to add another."
  );
}

export function AlertAlreadyExists() {
  return AlertWarn(
    "Location is already displayed!",
    "Please try adding a different location."
  );
}

export function AlertBadCoordinates() {
  return AlertWarn(
    "These coordinates aren't real!",
    "Please try latitudes within -90 to 90 and longitudes within -180 to 180."
  );
}
