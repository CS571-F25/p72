export default function AboutMe() {
  return (
    <section className="atmo-flat-page atmo-reveal">
      <div className="atmo-flat-inner">
        <header className="mb-8 atmo-reveal atmo-reveal-delay-1">
          <p className="atmo-kicker">Builder Profile</p>
          <h2 className="atmo-title">About Me</h2>
          <p className="text-sm atmo-muted-copy mt-3">
            A little about who built this app and why.
          </p>
        </header>

        <div className="atmo-flat-block p-5 sm:p-7 atmo-reveal atmo-reveal-delay-2">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="shrink-0">
              <div className="h-28 w-28 rounded-full overflow-hidden bg-black/20 shadow-lg">
                <img
                  src="./samui.jpg"
                  alt="Picture of me"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-light text-slate-50">
                Hi - I'm Andrew Lou
              </h3>
              <p className="mt-2 text-sm atmo-muted-copy leading-relaxed">
                I'm a second year Computer Science student at the University of
                Wisconsin-Madison. This weather app is a learning project that
                demonstrates API integration, responsive UI, and small-state
                management.
              </p>

              <div className="atmo-info-grid mt-5">
                <div className="atmo-flat-chip">
                  <p className="atmo-kicker mb-2">Focus</p>
                  <p className="text-sm atmo-muted-copy">
                    Useful weather data with a stronger visual identity.
                  </p>
                </div>
                <div className="atmo-flat-chip">
                  <p className="atmo-kicker mb-2">Stack</p>
                  <p className="text-sm atmo-muted-copy">
                    React, TypeScript, Vite, Tailwind, API integrations.
                  </p>
                </div>
              </div>

              <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-5">
                <div className="text-sm atmo-muted-copy">
                  Want to get in touch?
                </div>
                <div className="flex gap-2">
                  <a
                    href="mailto:louan1734@gmail.com"
                    className="atmo-plain-link"
                  >
                    Email me
                  </a>
                  <a
                    href="https://woopxwoop.github.io/portfolio/"
                    target="_blank"
                    rel="noreferrer"
                    className="atmo-plain-link"
                  >
                    View Portfolio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
