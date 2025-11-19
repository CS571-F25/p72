// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
//   CardFooter,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-12 ">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-500 to-rose-400 bg-clip-text text-transparent">
            So... how's the weather?
          </h1>
          <p className="text-sm text-muted-foreground mt-3">
            Get a quick forecast for any city — or use your current location.
          </p>
        </header>
        {/* 
        <Card className="backdrop-blur-sm bg-white/60 dark:bg-[#0b1220]/60 p-6 sm:p-8">
          <CardHeader className="px-0">
            <CardTitle className="text-lg">Find Weather</CardTitle>
            <CardDescription>
              Search by city name, postal code, or try your location.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0">
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 items-center">
              <div className="flex items-center justify-center">
                <svg
                  width="140"
                  height="100"
                  viewBox="0 0 140 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1">
                      <stop offset="0" stopColor="#60A5FA" />
                      <stop offset="1" stopColor="#A78BFA" />
                    </linearGradient>
                  </defs>
                  <g transform="translate(10,10)">
                    <circle
                      cx="30"
                      cy="20"
                      r="16"
                      fill="url(#g1)"
                      opacity="0.95"
                    />
                    <path
                      d="M10 50c0-11 9-20 20-20h40c11 0 20 9 20 20s-9 20-20 20H30c-11 0-20-9-20-20z"
                      fill="#F8FAFC"
                      stroke="#E6EEF8"
                    />
                    <path
                      d="M70 18c6-6 16-6 22 0"
                      stroke="#FDE68A"
                      strokeWidth="3"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                  </g>
                </svg>
              </div>

              <form className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center md:justify-between">
                <Input
                  aria-label="Search location"
                  placeholder="e.g. Seattle, WA"
                  className="h-12 rounded-full px-4 shadow-sm"
                />

                <div className="flex gap-3 md:ml-4">
                  <Button
                    className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg"
                    type="submit"
                  >
                    Search
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    className="rounded-full"
                  >
                    Use my location
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>

          <CardFooter className="px-0">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                Tip: save up to 3 favorite locations in the Weather tab.
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                Fast · Private · Accurate
              </div>
            </div>
          </CardFooter>
        </Card> */}
      </div>
    </div>
  );
}
