import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRef } from "react";
import UseMyLocationButton from "@/components/UseMyLocationButton";

export default function LocationTabs({
  onSubmit,
}: {
  onSubmit: (data: any) => void;
}) {
  const nameRef = useRef<HTMLInputElement>(null);
  const latRef = useRef<HTMLInputElement>(null);
  const lonRef = useRef<HTMLInputElement>(null);

  function isValidCoordinate(lat: string, lon: string): boolean {
    const latNum = Number(lat);
    const lonNum = Number(lon);

    if (isNaN(latNum) || isNaN(lonNum)) return false;
    if (latNum < -90 || latNum > 90) return false;
    if (lonNum < -180 || lonNum > 180) return false;

    return true;
  }

  return (
    <div className="bg-white/60 dark:bg-[#0b1220]/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
      <Tabs defaultValue="name" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="name">By Name</TabsTrigger>
          <TabsTrigger value="coords">By Coordinates</TabsTrigger>
        </TabsList>

        <TabsContent value="name">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!nameRef.current?.value.trim()) return;
              onSubmit({ type: "name", name: nameRef.current.value.trim() });
              nameRef.current.value = "";
            }}
            className="space-y-4 mt-4"
          >
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Location Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. New York City"
                ref={nameRef}
                className="mt-2 h-10 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white h-11 shadow-lg"
              >
                Add Location
              </Button>

              <UseMyLocationButton onSubmit={onSubmit} />
            </div>
          </form>
        </TabsContent>

        <TabsContent value="coords">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!latRef.current || !lonRef.current) return;
              if (
                isValidCoordinate(latRef.current.value, lonRef.current.value)
              ) {
                onSubmit({
                  type: "coords",
                  lat: parseFloat(latRef.current.value),
                  lon: parseFloat(lonRef.current.value),
                });
                latRef.current.value = "";
                lonRef.current.value = "";
              }
            }}
            className="space-y-4 mt-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="lat" className="text-sm font-medium">
                  Latitude
                </Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  placeholder="e.g. 40.7128"
                  ref={latRef}
                  className="mt-2 h-10 rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="lon" className="text-sm font-medium">
                  Longitude
                </Label>
                <Input
                  id="lon"
                  type="number"
                  step="any"
                  placeholder="e.g. -74.0060"
                  ref={lonRef}
                  className="mt-2 h-10 rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white h-11 shadow-lg"
              >
                Add Location
              </Button>
              <UseMyLocationButton onSubmit={onSubmit} />
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
