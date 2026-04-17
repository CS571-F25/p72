import {
  HashRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Home from "./components/Home";
import AboutMe from "./components/AboutMe";
import News from "./components/News";
import UnitsToggle from "@/components/atmosphere/UnitsToggle";
import { useTheme } from "@/theme/useTheme";

function AppShell() {
  const { theme } = useTheme();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className={`app-shell theme-${theme}`}>
      <nav className="atmo-nav">
        <div className="atmo-nav-brand-wrap">
          <Link to="/" className="atmo-nav-brand">
            Weather, Huh?
          </Link>
          <p className="atmo-nav-subtitle">
            Live forecasts with cinematic weather moods
          </p>
        </div>

        <div className="atmo-nav-links" aria-label="Primary navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `atmo-link ${isActive ? "is-active" : ""}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/news"
            className={({ isActive }) =>
              `atmo-link ${isActive ? "is-active" : ""}`
            }
          >
            News
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `atmo-link ${isActive ? "is-active" : ""}`
            }
          >
            About Me
          </NavLink>
        </div>

        <UnitsToggle />
      </nav>

      <main className={isHome ? "" : "atmo-main atmo-main-with-nav"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutMe />} />
          <Route path="/news" element={<News />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  );
}

export default App;
