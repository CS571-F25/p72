// Theme 4: ATMOSPHERE
// Full-bleed mood canvas — gradients shift with the weather.
// Each location gets a panel painted by its condition, with animated atmosphere.

const atmoStyles = {
  shell: {
    minHeight: "100vh",
    background: "#0a0a0c",
    color: "#fff",
    fontFamily: '"Fraunces", Georgia, serif',
    padding: "0",
    margin: 0,
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
  },
  topBar: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 20,
    padding: "18px 28px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "linear-gradient(180deg, rgba(0,0,0,0.45), transparent)",
    pointerEvents: "none",
  },
  brand: {
    fontFamily: '"Fraunces", serif', fontWeight: 300, fontStyle: "italic",
    fontSize: 22, letterSpacing: "0.02em", color: "rgba(255,255,255,0.95)",
    pointerEvents: "auto",
  },
  meta: {
    fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
    letterSpacing: "0.3em", textTransform: "uppercase",
    color: "rgba(255,255,255,0.7)", pointerEvents: "auto",
  },
  grid: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", height: "100vh",
  },
  panel: {
    position: "relative", overflow: "hidden",
    padding: "70px 44px 40px",
    boxSizing: "border-box",
    display: "flex", flexDirection: "column",
    color: "#fff",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    transition: "background 0.8s ease",
  },
  cityName: {
    fontFamily: '"Fraunces", serif', fontWeight: 300,
    fontSize: 54, lineHeight: 1, letterSpacing: "-0.01em",
    marginBottom: 6,
  },
  cityRegion: {
    fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
    letterSpacing: "0.3em", textTransform: "uppercase",
    opacity: 0.7, marginBottom: 28,
  },
  bigTemp: {
    fontFamily: '"Fraunces", serif', fontWeight: 200,
    fontSize: 160, lineHeight: 0.9, letterSpacing: "-0.04em",
    display: "flex", alignItems: "flex-start",
  },
  degSymbol: {
    fontSize: 42, marginTop: 24, fontWeight: 300,
    opacity: 0.6,
  },
  condition: {
    fontFamily: '"Fraunces", serif', fontStyle: "italic",
    fontSize: 26, fontWeight: 300,
    marginTop: 12, opacity: 0.9,
  },
  hiLo: {
    fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
    letterSpacing: "0.25em", opacity: 0.7, marginTop: 8,
  },
  spacer: { flex: 1 },
  hourlyStrip: {
    display: "flex", justifyContent: "space-between",
    marginTop: 18, padding: "14px 0",
    borderTop: "1px solid rgba(255,255,255,0.15)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
  },
  hourCell: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    flex: 1,
  },
  hourT: {
    fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
    letterSpacing: "0.2em", opacity: 0.6,
  },
  hourTemp: {
    fontFamily: '"Fraunces", serif', fontSize: 18, fontWeight: 300,
  },
  readingsGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "4px 28px", marginTop: 18,
  },
  readLbl: {
    fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
    letterSpacing: "0.3em", textTransform: "uppercase",
    opacity: 0.55, marginBottom: 2,
  },
  readVal: {
    fontFamily: '"Fraunces", serif', fontSize: 22, fontWeight: 300,
    marginBottom: 10,
  },
  readValSm: { fontSize: 13, opacity: 0.7, marginLeft: 4, fontFamily: '"JetBrains Mono", monospace' },
  dailyList: {
    marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.15)",
    paddingTop: 14,
  },
  dailyRow: {
    display: "grid", gridTemplateColumns: "52px 20px 1fr 64px",
    alignItems: "center",
    padding: "7px 0",
    fontSize: 13,
    gap: 10,
  },
  dailyDay: {
    fontFamily: '"Fraunces", serif', fontSize: 14, fontWeight: 400,
    letterSpacing: "0.02em",
  },
  dailyBar: {
    position: "relative", height: 2,
    background: "rgba(255,255,255,0.15)",
  },
  dailyHiLo: {
    fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
    textAlign: "right", opacity: 0.85, letterSpacing: "0.1em",
  },
  btnRow: {
    display: "flex", gap: 8, marginTop: 14, paddingTop: 14,
    borderTop: "1px solid rgba(255,255,255,0.15)",
  },
  btn: {
    flex: 1, background: "transparent",
    border: "1px solid rgba(255,255,255,0.4)",
    color: "rgba(255,255,255,0.9)",
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase",
    padding: "7px 8px", cursor: "pointer",
    backdropFilter: "blur(4px)",
  },
  atmoLayer: {
    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
  },
  atmoContent: { position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%" },
};

// ---- Gradient painters per condition ----
const CONDITION_MOODS = {
  clear: {
    bg: "linear-gradient(175deg, #f4b267 0%, #e88a4d 35%, #c15a5a 70%, #4a2d4a 100%)",
    accent: "#fff3d6",
    textShadow: "0 2px 20px rgba(120, 40, 20, 0.5)",
  },
  rain: {
    bg: "linear-gradient(180deg, #3a4a5c 0%, #2a3544 40%, #1a2430 80%, #0f1820 100%)",
    accent: "#9ac4e8",
    textShadow: "0 2px 20px rgba(0, 0, 0, 0.6)",
  },
  drizzle: {
    bg: "linear-gradient(180deg, #556472 0%, #3e4a57 60%, #2a3540 100%)",
    accent: "#c8d4e0",
    textShadow: "0 2px 20px rgba(0, 0, 0, 0.5)",
  },
  snow: {
    bg: "linear-gradient(180deg, #d4dfea 0%, #a8bccf 35%, #8098b2 70%, #556a82 100%)",
    accent: "#3a4b62",
    textShadow: "0 2px 16px rgba(120, 140, 160, 0.4)",
    darkText: true,
  },
  cloudy: {
    bg: "linear-gradient(180deg, #8a96a2 0%, #6d7985 50%, #4e5a66 100%)",
    accent: "#dce4ec",
    textShadow: "0 2px 20px rgba(40, 50, 60, 0.5)",
  },
  fewclouds: {
    bg: "linear-gradient(175deg, #89a9cc 0%, #a6b8c8 40%, #c4ad8c 80%, #8e7558 100%)",
    accent: "#fff",
    textShadow: "0 2px 20px rgba(50, 60, 80, 0.45)",
  },
};

// ---- Atmosphere layers (animated) ----
function AtmoLayer({ cond }) {
  if (cond === "rain" || cond === "drizzle") {
    return <RainLayer heavy={cond === "rain"} />;
  }
  if (cond === "snow") {
    return <SnowLayer />;
  }
  if (cond === "clear") {
    return <SunLayer />;
  }
  if (cond === "cloudy" || cond === "fewclouds") {
    return <CloudLayer many={cond === "cloudy"} />;
  }
  return null;
}

function RainLayer({ heavy }) {
  const count = heavy ? 80 : 40;
  const drops = React.useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 1.2,
    duration: 0.6 + Math.random() * 0.6,
    opacity: 0.25 + Math.random() * 0.4,
    height: 18 + Math.random() * 30,
  })), [heavy]);
  return (
    <div style={atmoStyles.atmoLayer}>
      <style>{`
        @keyframes atmo-rain {
          0% { transform: translateY(-20vh); opacity: 0; }
          10% { opacity: var(--op); }
          100% { transform: translateY(120vh); opacity: 0; }
        }
      `}</style>
      {drops.map((d, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${d.left}%`, top: `${d.top}%`,
          width: 1, height: d.height,
          background: "linear-gradient(180deg, transparent, rgba(200, 220, 240, 0.9))",
          animation: `atmo-rain ${d.duration}s linear infinite`,
          animationDelay: `${d.delay}s`,
          "--op": d.opacity,
          opacity: d.opacity,
        }} />
      ))}
    </div>
  );
}

function SnowLayer() {
  const flakes = React.useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    left: Math.random() * 100,
    top: Math.random() * -100,
    delay: Math.random() * 6,
    duration: 6 + Math.random() * 8,
    size: 2 + Math.random() * 4,
    opacity: 0.3 + Math.random() * 0.6,
    drift: (Math.random() - 0.5) * 40,
  })), []);
  return (
    <div style={atmoStyles.atmoLayer}>
      <style>{`
        @keyframes atmo-snow {
          0% { transform: translate3d(0,-10vh,0); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translate3d(var(--drift), 120vh, 0); opacity: 0; }
        }
      `}</style>
      {flakes.map((f, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${f.left}%`, top: `${f.top}%`,
          width: f.size, height: f.size,
          background: "rgba(255,255,255,0.95)",
          borderRadius: "50%",
          opacity: f.opacity,
          animation: `atmo-snow ${f.duration}s linear infinite`,
          animationDelay: `${f.delay}s`,
          "--drift": `${f.drift}px`,
          boxShadow: "0 0 4px rgba(255,255,255,0.6)",
        }} />
      ))}
    </div>
  );
}

function SunLayer() {
  return (
    <div style={atmoStyles.atmoLayer}>
      <style>{`
        @keyframes sun-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
        @keyframes sun-rays {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {/* glowing sun disc */}
      <div style={{
        position: "absolute",
        top: "8%", right: "12%",
        width: 180, height: 180,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255, 240, 200, 0.9) 0%, rgba(255, 200, 120, 0.5) 40%, transparent 70%)",
        filter: "blur(8px)",
        animation: "sun-pulse 6s ease-in-out infinite",
      }} />
      {/* heat shimmer */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "radial-gradient(ellipse at 85% 15%, rgba(255,230,180,0.25), transparent 40%)",
      }} />
    </div>
  );
}

function CloudLayer({ many }) {
  const clouds = React.useMemo(() => Array.from({ length: many ? 5 : 3 }, (_, i) => ({
    top: 10 + Math.random() * 40,
    left: -30 + Math.random() * 30,
    size: 300 + Math.random() * 200,
    duration: 60 + Math.random() * 40,
    delay: -Math.random() * 60,
    opacity: 0.18 + Math.random() * 0.2,
  })), [many]);
  return (
    <div style={atmoStyles.atmoLayer}>
      <style>{`
        @keyframes cloud-drift {
          0% { transform: translateX(0); }
          100% { transform: translateX(150vw); }
        }
      `}</style>
      {clouds.map((c, i) => (
        <div key={i} style={{
          position: "absolute",
          top: `${c.top}%`, left: `${c.left}%`,
          width: c.size, height: c.size * 0.4,
          background: "radial-gradient(ellipse, rgba(255,255,255,0.7), transparent 70%)",
          filter: "blur(12px)",
          opacity: c.opacity,
          animation: `cloud-drift ${c.duration}s linear infinite`,
          animationDelay: `${c.delay}s`,
        }} />
      ))}
    </div>
  );
}

// Weather glyph — minimal, matches the airy feel
function AtmoGlyph({ cond, size = 14, color = "currentColor" }) {
  const s = size;
  if (cond === "clear") return (
    <svg width={s} height={s} viewBox="0 0 16 16"><circle cx="8" cy="8" r="3" fill={color}/></svg>
  );
  if (cond === "fewclouds") return (
    <svg width={s} height={s} viewBox="0 0 16 16"><circle cx="6" cy="7" r="2.5" fill={color}/><ellipse cx="10" cy="10" rx="4" ry="2" fill={color} opacity="0.6"/></svg>
  );
  if (cond === "cloudy") return (
    <svg width={s} height={s} viewBox="0 0 16 16"><ellipse cx="8" cy="9" rx="5" ry="2.5" fill={color} opacity="0.8"/></svg>
  );
  if (cond === "rain" || cond === "drizzle") return (
    <svg width={s} height={s} viewBox="0 0 16 16"><ellipse cx="8" cy="6" rx="4.5" ry="2" fill={color} opacity="0.8"/><line x1="5" y1="10" x2="4" y2="13" stroke={color} strokeWidth="1.2"/><line x1="8" y1="10" x2="7" y2="13" stroke={color} strokeWidth="1.2"/><line x1="11" y1="10" x2="10" y2="13" stroke={color} strokeWidth="1.2"/></svg>
  );
  if (cond === "snow") return (
    <svg width={s} height={s} viewBox="0 0 16 16"><ellipse cx="8" cy="6" rx="4.5" ry="2" fill={color} opacity="0.6"/><circle cx="5" cy="11" r="1" fill={color}/><circle cx="8" cy="12.5" r="1" fill={color}/><circle cx="11" cy="11" r="1" fill={color}/></svg>
  );
  return null;
}

function AtmoPanel({ loc, units, index, onRemove, onMoveUp, onMoveDown, canUp, canDown }) {
  const mood = CONDITION_MOODS[loc.condition] || CONDITION_MOODS.cloudy;
  const t = units === "F" ? loc.tempF : loc.tempC;
  const hi = units === "F" ? loc.highF : loc.highC;
  const lo = units === "F" ? loc.lowF : loc.lowC;
  const feels = units === "F" ? loc.feelsF : loc.feelsC;
  const windSpd = units === "F" ? loc.wind.speedMph : loc.wind.speedKph;
  const windUnit = units === "F" ? "mph" : "kph";

  const allTemps = loc.daily.flatMap(d => units === "F" ? [d.hiF, d.loF] : [d.hiC, d.loC]);
  const globalMin = Math.min(...allTemps) - 1;
  const globalMax = Math.max(...allTemps) + 1;

  const textColor = mood.darkText ? "#1a2030" : "#fff";
  const mutedColor = mood.darkText ? "rgba(26,32,48,0.7)" : "rgba(255,255,255,0.75)";
  const borderColor = mood.darkText ? "rgba(26,32,48,0.2)" : "rgba(255,255,255,0.2)";

  return (
    <div style={{ ...atmoStyles.panel, background: mood.bg, color: textColor, textShadow: mood.darkText ? "none" : mood.textShadow }}>
      <AtmoLayer cond={loc.condition} />

      <div style={atmoStyles.atmoContent}>
        <div style={{ ...atmoStyles.cityRegion, opacity: mood.darkText ? 0.6 : 0.7 }}>
          № {String(index + 1).padStart(2, '0')} · {loc.tz} {loc.localTime}
        </div>
        <div style={atmoStyles.cityName}>{loc.city}</div>
        <div style={{ ...atmoStyles.cityRegion, marginBottom: 24 }}>{loc.region}</div>

        <div style={atmoStyles.bigTemp}>
          {t}<span style={atmoStyles.degSymbol}>°{units}</span>
        </div>
        <div style={atmoStyles.condition}>{loc.conditionLabel}</div>
        <div style={{ ...atmoStyles.hiLo, color: mutedColor }}>
          H {hi}° · L {lo}° · Feels {feels}°
        </div>

        <div style={atmoStyles.spacer} />

        <div style={{ ...atmoStyles.hourlyStrip, borderColor }}>
          {loc.hourly.slice(0, 6).map((h, i) => (
            <div key={i} style={atmoStyles.hourCell}>
              <div style={{ ...atmoStyles.hourT, color: mutedColor }}>{h.t}h</div>
              <AtmoGlyph cond={h.cond} size={16} color={textColor} />
              <div style={atmoStyles.hourTemp}>{units === "F" ? h.tF : h.tC}°</div>
            </div>
          ))}
        </div>

        <div style={atmoStyles.readingsGrid}>
          <div>
            <div style={{ ...atmoStyles.readLbl, color: mutedColor }}>Wind</div>
            <div style={atmoStyles.readVal}>{windSpd}<span style={atmoStyles.readValSm}>{windUnit} {loc.wind.dir}</span></div>
          </div>
          <div>
            <div style={{ ...atmoStyles.readLbl, color: mutedColor }}>Humidity</div>
            <div style={atmoStyles.readVal}>{loc.humidity}<span style={atmoStyles.readValSm}>%</span></div>
          </div>
          <div>
            <div style={{ ...atmoStyles.readLbl, color: mutedColor }}>Pressure</div>
            <div style={atmoStyles.readVal}>{loc.pressure}<span style={atmoStyles.readValSm}>hPa</span></div>
          </div>
          <div>
            <div style={{ ...atmoStyles.readLbl, color: mutedColor }}>UV</div>
            <div style={atmoStyles.readVal}>{loc.uv}<span style={atmoStyles.readValSm}>/11</span></div>
          </div>
        </div>

        <div style={{ ...atmoStyles.dailyList, borderColor }}>
          {loc.daily.map((d, i) => {
            const dhi = units === "F" ? d.hiF : d.hiC;
            const dlo = units === "F" ? d.loF : d.loC;
            const left = ((dlo - globalMin) / (globalMax - globalMin)) * 100;
            const right = ((dhi - globalMin) / (globalMax - globalMin)) * 100;
            return (
              <div key={i} style={atmoStyles.dailyRow}>
                <span style={atmoStyles.dailyDay}>{d.d}</span>
                <AtmoGlyph cond={d.cond} size={14} color={textColor} />
                <div style={{ ...atmoStyles.dailyBar, background: mood.darkText ? "rgba(26,32,48,0.15)" : "rgba(255,255,255,0.2)" }}>
                  <div style={{
                    position: "absolute", top: 0, bottom: 0,
                    left: `${left}%`, width: `${right - left}%`,
                    background: textColor, opacity: 0.85,
                  }} />
                </div>
                <span style={atmoStyles.dailyHiLo}>{dhi}° / {dlo}°</span>
              </div>
            );
          })}
        </div>

        <div style={{ ...atmoStyles.btnRow, borderColor }}>
          <button style={{ ...atmoStyles.btn, borderColor: borderColor.replace("0.2", "0.4"), color: textColor }} onClick={onMoveUp} disabled={!canUp}>◂</button>
          <button style={{ ...atmoStyles.btn, borderColor: borderColor.replace("0.2", "0.4"), color: textColor }} onClick={onMoveDown} disabled={!canDown}>▸</button>
          <button style={{ ...atmoStyles.btn, borderColor: borderColor.replace("0.2", "0.4"), color: textColor }} onClick={onRemove}>Remove</button>
        </div>
      </div>
    </div>
  );
}

function AtmoAddSlot({ onAdd }) {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const results = React.useMemo(() => {
    if (!searchQuery) return window.CITY_POOL.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return window.CITY_POOL.filter(c =>
      c.city.toLowerCase().includes(q) || c.region.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div style={{
      ...atmoStyles.panel,
      background: "linear-gradient(180deg, #1a1a1f 0%, #0a0a0c 100%)",
      cursor: searchOpen ? "default" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={searchOpen ? null : () => setSearchOpen(true)}>
      <div style={atmoStyles.atmoContent}>
        {!searchOpen ? (
          <div style={{ margin: "auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, fontWeight: 200, color: "rgba(255,255,255,0.7)",
              fontFamily: '"Fraunces", serif',
            }}>+</div>
            <div style={{ fontFamily: '"Fraunces", serif', fontStyle: "italic", fontSize: 22, fontWeight: 300 }}>
              Another sky
            </div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.5 }}>
              Click to add
            </div>
          </div>
        ) : (
          <div style={{ width: "100%", margin: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.6 }}>
                Search
              </div>
              <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} style={{
                background: "none", border: "none", color: "rgba(255,255,255,0.7)",
                fontFamily: '"JetBrains Mono", monospace', fontSize: 10, cursor: "pointer", letterSpacing: "0.2em",
              }}>× close</button>
            </div>
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Name a city…"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.4)",
                padding: "10px 0",
                fontFamily: '"Fraunces", serif', fontSize: 32, fontStyle: "italic", fontWeight: 300,
                color: "#fff", outline: "none",
              }}
            />
            <div style={{ marginTop: 10, maxHeight: 340, overflowY: "auto" }}>
              {results.length === 0 ? (
                <div style={{ fontFamily: '"Fraunces", serif', fontStyle: "italic", opacity: 0.6, padding: "20px 0", textAlign: "center" }}>
                  No matches.
                </div>
              ) : results.map((c, i) => (
                <div key={i} onClick={() => { onAdd(c); setSearchOpen(false); setSearchQuery(""); }} style={{
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div>
                    <div style={{ fontFamily: '"Fraunces", serif', fontSize: 20, fontWeight: 300 }}>{c.city}</div>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, opacity: 0.55, letterSpacing: "0.25em", textTransform: "uppercase" }}>{c.region}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: 0.85 }}>
                    <AtmoGlyph cond={c.condition} size={14} color="#fff" />
                    <span style={{ fontFamily: '"Fraunces", serif', fontSize: 20, fontWeight: 300 }}>{c.tempF}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AtmosphereTheme({ locations, units, onRemove, onReorder, onAdd }) {
  return (
    <div style={atmoStyles.shell}>
      <div style={atmoStyles.topBar}>
        <div style={atmoStyles.brand}>Atmosphere</div>
        <div style={atmoStyles.meta}>Three skies · Friday 14:32</div>
      </div>
      <div style={atmoStyles.grid}>
        {locations.map((loc, i) => (
          <AtmoPanel
            key={loc.id}
            loc={loc}
            units={units}
            index={i}
            onRemove={() => onRemove(loc.id)}
            onMoveUp={() => onReorder(i, i - 1)}
            onMoveDown={() => onReorder(i, i + 1)}
            canUp={i > 0}
            canDown={i < locations.length - 1}
          />
        ))}
        {locations.length < 3 && <AtmoAddSlot onAdd={onAdd} />}
      </div>
    </div>
  );
}

window.AtmosphereTheme = AtmosphereTheme;
