// Main app — theme switching, location CRUD, edit-mode protocol.

function App() {
  const initialTweaks = window.TWEAKS || { theme: "barometer", units: "F" };
  const [theme, setThemeRaw] = React.useState(initialTweaks.theme || "barometer");
  const [units, setUnitsRaw] = React.useState(initialTweaks.units || "F");
  const [locations, setLocations] = React.useState(window.WEATHER_DATA);
  const [editActive, setEditActive] = React.useState(false);

  // animated theme crossfade
  const [transitioning, setTransitioning] = React.useState(false);

  const setTheme = (t) => {
    if (t === theme) return;
    setTransitioning(true);
    setTimeout(() => {
      setThemeRaw(t);
      setTransitioning(false);
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { theme: t } }, "*");
    }, 200);
  };

  const setUnits = (u) => {
    setUnitsRaw(u);
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { units: u } }, "*");
  };

  const handleRemove = (id) => {
    setLocations(prev => prev.filter(l => l.id !== id));
  };

  const handleReorder = (from, to) => {
    if (to < 0 || to >= locations.length) return;
    setLocations(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const handleAdd = (city) => {
    // synthesize plausible data by cloning the template most like it
    const template = window.WEATHER_DATA.find(l => l.condition === city.condition) || window.WEATHER_DATA[0];
    const newLoc = {
      ...template,
      id: city.city.toLowerCase().replace(/\s+/g, "").slice(0, 4) + Math.random().toString(36).slice(2, 4),
      city: city.city,
      region: city.region,
      country: city.country,
      condition: city.condition,
      conditionLabel: template.conditionLabel,
      tempF: city.tempF,
      tempC: city.tempC,
      feelsF: city.tempF - 2,
      feelsC: city.tempC - 1,
      lat: 40 + Math.random() * 20,
      lon: -30 + Math.random() * 60,
    };
    setLocations(prev => [...prev, newLoc]);
  };

  // Edit mode protocol
  React.useEffect(() => {
    const handler = (e) => {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "__activate_edit_mode") setEditActive(true);
      if (e.data.type === "__deactivate_edit_mode") setEditActive(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  const themeProps = { locations, units, onRemove: handleRemove, onReorder: handleReorder, onAdd: handleAdd };

  return (
    <div style={{
      opacity: transitioning ? 0 : 1,
      transition: "opacity 0.2s ease",
    }}>
      {theme === "barometer" && <window.BarometerTheme {...themeProps} />}
      {theme === "almanac" && <window.AlmanacTheme {...themeProps} />}
      {theme === "signal" && <window.SignalTheme {...themeProps} />}
      {theme === "atmosphere" && <window.AtmosphereTheme {...themeProps} />}

      <window.TweaksPanel
        active={editActive}
        theme={theme}
        setTheme={setTheme}
        units={units}
        setUnits={setUnits}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
