import { InfoIcon } from "@/components/ui/InfoIcon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AlertWarn() {
  return (
    <div className="w-full max-w-md text-left">
      <Alert variant="destructive">
        <AlertTitle className="flex flex-row justify-between">
          <p>Too many locations!</p>
          <InfoIcon className="h-5 w-5"></InfoIcon>
        </AlertTitle>
        <AlertDescription>
          <p>
            Due to api constraints, this web app only supports showing up to
            three locations at a time. Please remove one location to add
            another.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
