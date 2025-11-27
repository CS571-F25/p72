import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AboutMe() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-500 to-rose-400 bg-clip-text text-transparent">
          About Me
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          A little about who built this app and why.
        </p>
      </header>

      <Card className="overflow-visible">
        <CardHeader />

        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <Avatar className="h-28 w-28 rounded-full shadow-lg">
                <AvatarImage src="./samui.jpg" />
                <AvatarFallback>AL</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold">Hi - I'm Andrew Lou</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                I'm a second year Computer Science student at the University of
                Wisconsin-Madison. This weather app is a learning project that
                demonstrates API integration, responsive UI, and small-state
                management.
              </p>

              {/* <div className="mt-4">
                <h4 className="text-sm font-medium">Tech & Tools</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    "TypeScript",
                    "React",
                    "Vite",
                    "Tailwind",
                    "shadcn/ui",
                    "Lottie",
                  ].map((t) => (
                    <span
                      key={t}
                      className="inline-block rounded-full border px-3 py-1 text-xs font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Want to get in touch?
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <a href="mailto:louan1734@gmail.com">Email me</a>
              </Button>
              <Button variant="outline" asChild>
                <a
                  href="https://woopxwoop.github.io/Portfolio-Website/"
                  target="_blank"
                  rel="noreferrer"
                >
                  View Portfolio
                </a>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
