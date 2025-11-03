import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRef } from "react";

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
    <Tabs defaultValue="name" className="w-[400px]">
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
          }}
          className="space-y-2 mt-2"
        >
          <Label htmlFor="name">Location Name</Label>
          <Input id="name" placeholder="e.g. New York City" ref={nameRef} />
          <Button type="submit" className="w-full">
            Add
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="coords">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!latRef.current || !lonRef.current) return;
            if (isValidCoordinate(latRef.current.value, lonRef.current.value)) {
              onSubmit({
                type: "coords",
                lat: parseFloat(latRef.current.value),
                lon: parseFloat(lonRef.current.value),
              });
            } else {
            }
          }}
          className="space-y-2 mt-2"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                placeholder="e.g. 40.7128"
                ref={latRef}
              />
            </div>
            <div>
              <Label htmlFor="lon">Longitude</Label>
              <Input
                id="lon"
                type="number"
                placeholder="e.g. -74.0060"
                ref={lonRef}
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Add
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
