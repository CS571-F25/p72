import { useEffect, useRef } from "react";
import { HashRouter, Routes, Route, NavLink, Link } from "react-router-dom";
import Home from "./components/Home";
import AboutMe from "./components/AboutMe";
import Weather from "./components/Weather";

function App() {
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function setNavHeight() {
      const height = navRef.current?.offsetHeight ?? 0;
      // add a small gap so content doesn't touch the nav
      document.documentElement.style.setProperty(
        "--app-nav-height",
        `${height + 48}px`
      );
    }

    setNavHeight();
    window.addEventListener("resize", setNavHeight);
    return () => window.removeEventListener("resize", setNavHeight);
  }, []);

  return (
    <>
      <HashRouter>
        <nav
          ref={navRef}
          className="fixed left-1/2 top-6 z-50 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2"
        >
          <div className="flex items-center justify-between gap-4 rounded-full bg-white/60 dark:bg-[#0b1220]/60 backdrop-blur-md px-4 py-2 shadow-sm">
            <Link
              to="/"
              className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-500 to-rose-400"
            >
              Weather, huh?
            </Link>

            <div className="flex items-center gap-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `text-sm font-medium px-3 py-2 rounded-md transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `text-sm font-medium px-3 py-2 rounded-md transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`
                }
              >
                About
              </NavLink>

              <NavLink
                to="/weather"
                className={({ isActive }) =>
                  `text-sm font-medium px-3 py-2 rounded-md transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`
                }
              >
                Weather
              </NavLink>
            </div>
          </div>
        </nav>

        <main style={{ paddingTop: "var(--app-nav-height, 96px)" }}>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/about" element={<AboutMe />}></Route>
            <Route path="/weather" element={<Weather />}></Route>
          </Routes>
        </main>
      </HashRouter>
    </>
  );
}

export default App;
