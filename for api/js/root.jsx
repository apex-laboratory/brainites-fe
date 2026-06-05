/* ============================================================
   HEPHAESTOU V2 — ROOT
   Scaling stage · flow router · tweaks
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "quiet",
  "mode": "light",
  "font": "grotesque",
  "density": "regular"
}/*EDITMODE-END*/;

/* full-viewport app surface (no letterbox) */
function Stage({ children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--ivory)", overflow: "hidden" }}>
      {children}
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [flow, setFlow] = useState(() => localStorage.getItem("heph_flow") || "auth");
  useEffect(() => { localStorage.setItem("heph_flow", flow); }, [flow]);

  useEffect(() => {
    const r = document.documentElement;
    r.dataset.mode = t.mode;
    r.dataset.accent = t.accent;
    r.dataset.font = t.font;
    r.dataset.density = t.density;
  }, [t.mode, t.accent, t.font, t.density]);

  const calm = t.mode === "dark";

  useEffect(() => {
    const id = setTimeout(() => document.body.classList.add("anim-ready"), 1400);
    return () => clearTimeout(id);
  }, [flow]);

  return (
    <React.Fragment>
      <Stage>
        {flow === "auth" && <Auth onSignup={() => setFlow("onboarding")} onSignin={() => setFlow("dashboard")}/>}
        {flow === "onboarding" && <Onboarding calm={calm} onDone={() => setFlow("dashboard")}/>}
        {flow === "dashboard" && <Dashboard onLogout={() => setFlow("auth")}/>}
      </Stage>

      <TweaksPanel>
        <TweakSection label="Accent"/>
        <TweakRadio label="Orange" value={t.accent} options={["quiet", "bold"]} onChange={v => setTweak("accent", v)}/>
        <TweakSection label="Surface"/>
        <TweakRadio label="Mode" value={t.mode} options={["light", "dark"]} onChange={v => setTweak("mode", v)}/>
        <TweakSection label="Type"/>
        <TweakRadio label="Heading" value={t.font} options={["grotesque", "serif"]} onChange={v => setTweak("font", v)}/>
        <TweakSection label="Layout"/>
        <TweakRadio label="Density" value={t.density} options={["compact", "regular", "airy"]} onChange={v => setTweak("density", v)}/>
        <TweakSection label="Jump to"/>
        <TweakButton onClick={() => setFlow("auth")}>○ Sign-in screen</TweakButton>
        <TweakButton onClick={() => setFlow("onboarding")}>↺ Replay onboarding</TweakButton>
        <TweakButton onClick={() => setFlow("dashboard")}>→ Open dashboard</TweakButton>
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
