// Tweaks panel — theme + units switcher.

function TweaksPanel({ active, theme, setTheme, units, setUnits }) {
  if (!active) return null;
  const panelBg = theme === "signal" ? "#141618" : (theme === "almanac" ? "#f7f0dc" : "#fbf5e3");
  const panelFg = theme === "signal" ? "#e8c77a" : "#1a1a1a";
  const panelBorder = theme === "signal" ? "#4a3a1c" : "#3a2e18";

  return (
    <div style={{
      position: "fixed", right: 20, bottom: 20, zIndex: 1000,
      background: panelBg, color: panelFg,
      border: `1.5px solid ${panelBorder}`,
      padding: "14px 16px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      fontFamily: '"JetBrains Mono", monospace',
      minWidth: 240,
    }}>
      <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 10, opacity: 0.7 }}>
        Tweaks
      </div>

      <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6, marginBottom: 6 }}>
        Theme
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {[
          { id: "barometer", label: "Barometer" },
          { id: "almanac", label: "Almanac" },
          { id: "signal", label: "Signal" },
          { id: "atmosphere", label: "Atmosphere" },
        ].map(t => (
          <button key={t.id} onClick={() => setTheme(t.id)} style={{
            flex: 1, padding: "6px 4px",
            fontSize: 10, letterSpacing: "0.1em",
            fontFamily: "inherit",
            background: theme === t.id ? panelFg : "transparent",
            color: theme === t.id ? panelBg : panelFg,
            border: `1px solid ${panelBorder}`,
            cursor: "pointer",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6, marginBottom: 6 }}>
        Units
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {["F", "C"].map(u => (
          <button key={u} onClick={() => setUnits(u)} style={{
            flex: 1, padding: "6px 4px",
            fontSize: 10, letterSpacing: "0.1em",
            fontFamily: "inherit",
            background: units === u ? panelFg : "transparent",
            color: units === u ? panelBg : panelFg,
            border: `1px solid ${panelBorder}`,
            cursor: "pointer",
          }}>
            °{u}
          </button>
        ))}
      </div>
    </div>
  );
}

window.TweaksPanel = TweaksPanel;
