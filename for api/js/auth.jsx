/* ============================================================
   HEPHAESTOU V2 — AUTH (split screen sign up / sign in)
   Living brand panel · refined form
   ============================================================ */

/* compact orbiting-source constellation for the brand panel */
const AUTH_SRC = ["slack", "notion", "github", "jira", "zendesk"];
function AuthOrbit() {
  const R1 = 132, R2 = 196;
  const ring1 = AUTH_SRC.slice(0, 3), ring2 = AUTH_SRC.slice(3);
  const place = (arr, R, off) => arr.map((id, i) => {
    const a = (off + i * (360 / arr.length)) * Math.PI / 180;
    return { id, x: Math.cos(a) * R, y: Math.sin(a) * R };
  });
  const nodes = [...place(ring1, R1, -90), ...place(ring2, R2, 30)];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* warm glow */}
      <div style={{ position: "absolute", right: "-12%", top: "42%", width: 560, height: 560, transform: "translateY(-50%)",
        background: "radial-gradient(circle, rgba(232,72,27,0.34), transparent 62%)", filter: "blur(20px)" }}/>
      <div style={{ position: "absolute", right: -210, top: "50%", transform: "translateY(-50%)", width: 460, height: 460 }}>
        {/* rings */}
        <div className="auth-ring" style={{ width: R1 * 2, height: R1 * 2, animation: "orbitSpin 70s linear infinite" }}/>
        <div className="auth-ring" style={{ width: R2 * 2, height: R2 * 2, borderColor: "rgba(255,255,255,0.08)", animation: "orbitSpinR 90s linear infinite" }}/>
        {/* connection lines */}
        <svg width="460" height="460" style={{ position: "absolute", inset: 0 }}>
          {nodes.map((n, i) => (
            <line key={i} x1={230} y1={230} x2={230 + n.x} y2={230 + n.y} stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
          ))}
        </svg>
        {/* core */}
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 84, height: 84, borderRadius: "50%",
          background: "radial-gradient(circle at 36% 30%, #fff, #FFE2D2 72%)", display: "grid", placeItems: "center",
          boxShadow: "0 0 0 8px rgba(255,255,255,0.06), 0 18px 50px rgba(120,28,2,0.5)", animation: "corePulse 3s var(--ease-in-out) infinite" }}>
          <I.hephH style={{ width: 34, color: "var(--accent)" }}/>
        </div>
        {/* source nodes */}
        {nodes.map((n, i) => (
          <div key={i} style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(calc(-50% + ${n.x}px), calc(-50% + ${n.y}px))`,
            animation: `nodeFloat ${4 + i * 0.5}s ease-in-out ${i * 0.3}s infinite` }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, transform: "translate(-50%,-50%)", background: "rgba(255,255,255,0.96)", display: "grid", placeItems: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}>
              <SrcIcon id={n.id} size={24}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OAuthBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="btn btn-outline" style={{ height: 48, width: "100%", justifyContent: "center", fontSize: 14.5, borderRadius: 12, fontWeight: 600 }}>
      {icon}{label}
    </button>
  );
}

function Auth({ onSignup, onSignin }) {
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const go = () => (mode === "signup" ? onSignup : onSignin)();
  const isSignup = mode === "signup";

  return (
    <div className="screen" style={{ flexDirection: "row", background: "var(--ivory)" }}>
      {/* LEFT — living brand panel */}
      <div style={{ width: "50%", flex: "none", position: "relative", overflow: "hidden",
        background: "linear-gradient(155deg, #2A2620 0%, #1A1610 55%, #100D08 100%)", color: "#fff", display: "flex", flexDirection: "column", padding: "44px 52px" }}>
        <AuthOrbit/>
        {/* readability scrim over the constellation */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(100deg, rgba(20,17,11,0.97) 0%, rgba(20,17,11,0.84) 32%, rgba(20,17,11,0.12) 68%, transparent 100%)" }}/>

        <div style={{ position: "relative", zIndex: 2 }}><Logo/></div>

        <div style={{ position: "relative", zIndex: 2, margin: "auto 0", maxWidth: 480 }}>
          <div className="sec-label" style={{ color: "rgba(255,255,255,0.5)", padding: 0, margin: "0 0 18px" }}>The company brain</div>
          <h1 className="display" style={{ color: "#fff", fontSize: 50, lineHeight: 1.02 }}>
            Every company already knows <span className="serif-italic" style={{ fontWeight: 400, color: "#FFD9C6" }}>how it works.</span>
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.66)", marginTop: 20, lineHeight: 1.55, maxWidth: 420 }}>
            Hephaestou reads the decisions buried in your tools and turns them into versioned skills your agents can call.
          </p>
        </div>

        {/* testimonial */}
        <div style={{ position: "relative", zIndex: 2, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: "18px 20px", maxWidth: 460, backdropFilter: "blur(6px)" }}>
          <p style={{ fontSize: 15, lineHeight: 1.5, color: "rgba(255,255,255,0.9)" }} className="serif-italic">
            “It answered a refund-policy question correctly on day one — pulling the exact Slack thread where we decided it.”
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
            <Avatar name="Dana Reyes" color="#C2603A" size={32}/>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>Dana Reyes</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Head of CX, Riverline</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 9, opacity: 0.7 }}>
              {AUTH_SRC.map(id => <SrcIcon key={id} id={id} size={17}/>)}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 40, position: "relative" }}>
        <div style={{ position: "absolute", top: 28, right: 36, fontSize: 13.5, color: "var(--ink-3)", whiteSpace: "nowrap" }}>
          {isSignup ? "Have an account? " : "New here? "}
          <button onClick={() => setMode(isSignup ? "signin" : "signup")} style={{ color: "var(--accent-ink)", fontWeight: 600 }}>{isSignup ? "Sign in" : "Create account"}</button>
        </div>

        <div style={{ width: 384, maxWidth: "100%" }} className="fade-up">
          <h2 style={{ fontSize: 31, letterSpacing: "-0.03em" }}>{isSignup ? "Create your workspace" : "Welcome back"}</h2>
          <p style={{ color: "var(--ink-3)", fontSize: 15, marginTop: 8 }}>
            {isSignup ? "Build your company brain in about two minutes." : "Pick up where your brain left off."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 26 }}>
            <OAuthBtn icon={<Brand.google/>} label="Continue with Google" onClick={go}/>
            <OAuthBtn icon={<Brand.github/>} label="Continue with GitHub" onClick={go}/>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--line-2)" }}/>
            <span style={{ fontSize: 12, color: "var(--ink-4)", fontWeight: 600 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--line-2)" }}/>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label className="field-label" style={{ display: "block", marginBottom: 7 }}>Work email</label>
              <input className="input" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && go()}/>
            </div>
            <button className="btn btn-solid" style={{ height: 50, width: "100%", justifyContent: "center", borderRadius: 12, marginTop: 4 }} onClick={go}>
              {isSignup ? "Create account" : "Sign in"} <I.arrow className="arrow" style={{ width: 16 }}/>
            </button>
          </div>

          <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", marginTop: 16, fontSize: 13.5, color: "var(--ink-3)", fontWeight: 500, whiteSpace: "nowrap" }} onClick={go}>
            <I.skills style={{ width: 15 }}/> Continue with SAML SSO
          </button>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 30, fontSize: 12.5, color: "var(--ink-4)", whiteSpace: "nowrap" }}>
            <I.review style={{ width: 14, flex: "none" }}/> Read-only · SOC 2 Type II · We never write to your tools
          </div>
          <p style={{ marginTop: 12, fontSize: 11.5, color: "var(--ink-4)", textAlign: "center", lineHeight: 1.5 }}>
            By continuing you agree to Hephaestou's Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

window.Auth = Auth;
