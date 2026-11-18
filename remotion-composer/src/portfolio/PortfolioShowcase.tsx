import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";
import { CameraMotionBlur } from "@remotion/motion-blur";

// Website showcase of rubelpublic.github.io in the style of the client's reference
// (3D-tilted page fly-over with motion blur, isometric card grid, zoom-out to the whole page,
// title card with floating objects). Section shots: public/portfolio/s00..s14.jpg (1440x900 @2x).
loadFont({ family: "InterTight", url: staticFile("portfolio/fonts/inter-tight-latin-800-normal.woff2"), weight: "800" });
loadFont({ family: "Inter", url: staticFile("portfolio/fonts/inter-latin-600-normal.woff2"), weight: "600" });
loadFont({ family: "Inter", url: staticFile("portfolio/fonts/inter-latin-700-normal.woff2"), weight: "700" });

export const PF_FPS = 30, PF_W = 1350, PF_H = 1080, PF_TOTAL = 16.5;
export const PF_FRAMES = Math.round(PF_TOTAL * PF_FPS);
const N = 15, CW = 1000, CH = 625, GAP = 40;
const shot = (i: number) => staticFile(`portfolio/s${String(i).padStart(2, "0")}.jpg`);
const BG = "#f3ede3", INK = "#1b1a17", AMBER = "#b8650f";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (x: number) => { const k = clamp(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = (x: number) => Math.pow(clamp(x), 3);
const backOut = (x: number, c = 1.6) => { const k = clamp(x); return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const on = (t: number, a: number, d: number) => clamp((t - a) / d);
/** keyframes [[t, v], ...] with ease in-out between */
const kf = (t: number, keys: [number, number][], f = ease) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) if (t <= keys[i + 1][0]) return lerp(keys[i][1], keys[i + 1][1], f((t - keys[i][0]) / (keys[i + 1][0] - keys[i][0])));
  return keys[keys.length - 1][1];
};

const Card: React.FC<{ i: number; style?: React.CSSProperties; w?: number; shadow?: boolean }> = ({ i, style, w = CW, shadow = true }) => (
  <div style={{ width: w, height: w * 0.625, borderRadius: w * 0.022, overflow: "hidden", background: "#fff", boxShadow: shadow ? "0 40px 80px rgba(60,40,10,.22), 0 0 0 2px rgba(0,0,0,.06)" : "none", ...style }}>
    <Img src={shot(i)} style={{ width: "100%", height: "100%", display: "block" }} />
  </div>
);
const Stage: React.FC<{ children: React.ReactNode; persp?: number }> = ({ children, persp = 1600 }) => (
  <AbsoluteFill style={{ perspective: persp, perspectiveOrigin: "50% 40%", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: PF_W / 2, top: PF_H / 2, transformStyle: "preserve-3d" }}>{children}</div>
  </AbsoluteFill>
);
const Chip: React.FC<{ label: string; x: number; y: number; t: number; at: number; ph: number; big?: boolean }> = ({ label, x, y, t, at, ph, big }) => {
  const a = on(t, at, 0.5); if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y + Math.sin(t * 1.8 + ph) * 14, transform: `translate(-50%,-50%) scale(${0.3 + 0.7 * backOut(a)}) rotate(${Math.sin(t * 1.3 + ph) * 8 - 6 + ph * 3}deg)`, opacity: clamp(a * 2),
      padding: big ? "22px 34px" : "16px 28px", borderRadius: 60, background: "rgba(255,252,246,.96)", border: `3px solid ${AMBER}`, boxShadow: "0 24px 50px rgba(80,50,10,.25)",
      fontFamily: "Inter", fontWeight: 700, fontSize: big ? 44 : 34, color: INK, whiteSpace: "nowrap" }}>{label}</div>
  );
};
const Mono: React.FC<{ x: number; y: number; t: number; at: number; ph: number; s?: number }> = ({ x, y, t, at, ph, s = 120 }) => {
  const a = on(t, at, 0.5); if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y + Math.sin(t * 1.5 + ph) * 18, width: s, height: s, transform: `translate(-50%,-50%) scale(${0.3 + 0.7 * backOut(a)}) rotate(${Math.sin(t + ph) * 12 + ph * 10}deg)`, opacity: clamp(a * 2),
      borderRadius: s * 0.26, background: `linear-gradient(145deg, #2a2723, ${INK})`, boxShadow: "0 30px 60px rgba(40,25,5,.35), inset 0 2px 0 rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "InterTight", fontWeight: 800, fontSize: s * 0.5, color: "#f3ede3", letterSpacing: -4 }}>rr</div>
  );
};

// ---------------- scenes ----------------
const SceneHero: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(on(t, 0, 2.2));
  const rx = lerp(62, 10, k), z = lerp(-900, 0, k), ry = lerp(-14, -4, k), y = lerp(260, 0, k);
  const out = easeIn(on(t, 2.05, 0.35));
  return (
    <>
      <Stage>
        <div style={{ position: "absolute", transform: `translate(-50%,-50%) translateY(${y - out * 600}px) translateZ(${z + out * 300}px) rotateX(${rx + out * 40}deg) rotateY(${ry}deg)` }}><Card i={0} w={1100} /></div>
      </Stage>
      <Chip label="AI agents" x={170} y={240} t={t} at={0.6} ph={0} />
      <Chip label="Bangla AI" x={1190} y={300} t={t} at={0.85} ph={1} />
      <Chip label="Automation" x={1150} y={860} t={t} at={1.1} ph={2} />
      <Mono x={200} y={830} t={t} at={1.3} ph={3} />
    </>
  );
};
const SceneFly: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - 2.4; const step = CH + GAP;
  // fly down the page with bursts: settle briefly on a few sections
  const pos = kf(lt, [[0, 0], [0.9, 1.0], [1.6, 3.0], [2.3, 4.0], [3.1, 6.0], [3.8, 7.0], [4.6, 9.0], [5.6, 11.0]]);
  const rz = kf(lt, [[0, -14], [5.6, -6]]), rx = kf(lt, [[0, 56], [2.8, 48], [5.6, 58]]);
  const z = kf(lt, [[0, -200], [2.8, 80], [5.6, -150]]);
  return (
    <Stage persp={1500}>
      <div style={{ position: "absolute", transform: `translateZ(${z}px) rotateX(${rx}deg) rotateZ(${rz}deg) translateY(${-pos * step - CH / 2 + 200}px) translateX(${-CW / 2}px)`, transformStyle: "preserve-3d" }}>
        {Array.from({ length: N }).map((_, i) => <div key={i} style={{ position: "absolute", top: i * step, left: 0 }}><Card i={i} /></div>)}
      </div>
    </Stage>
  );
};
const SceneGrid: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - 8.0;
  const px = kf(lt, [[0, 900], [3.0, -300]], (x) => 1 - Math.pow(1 - clamp(x), 2));
  const py = kf(lt, [[0, -700], [3.0, 200]], (x) => 1 - Math.pow(1 - clamp(x), 2));
  const ids = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1];
  return (
    <Stage persp={2200}>
      <div style={{ position: "absolute", transform: `rotateX(52deg) rotateZ(-34deg) translate(${px - 1600}px, ${py - 1100}px)`, transformStyle: "preserve-3d" }}>
        {ids.map((id, k) => {
          const c = k % 4, r = Math.floor(k / 4); const lift = 30 + 50 * Math.sin(lt * 2 + k);
          return <div key={k} style={{ position: "absolute", left: c * (CW * 0.82 + 70), top: r * (CH * 0.82 + 70), transform: `translateZ(${lift}px)` }}><Card i={id} w={CW * 0.82} /></div>;
        })}
      </div>
    </Stage>
  );
};
const SceneZoomOut: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - 11.0; const k = ease(on(lt, 0, 1.6));
  const s = lerp(0.9, 0.085, k), rx = lerp(45, 0, k), rz = lerp(-12, 0, k);
  const total = N * (CH + GAP);
  const ty = lerp(-3 * (CH + GAP), -total / 2, k);
  const big = on(lt, 0.7, 0.6);
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: PF_W, top: 560, textAlign: "center", fontFamily: "InterTight", fontWeight: 800, fontSize: 330, letterSpacing: -14, color: "transparent", WebkitTextStroke: `4px rgba(184,101,15,${0.55 * big})`, transform: `translateY(${(1 - easeOut(big)) * 120}px)` }}>RUBEL</div>
      <Stage persp={1800}>
        <div style={{ position: "absolute", transform: `scale(${s}) rotateX(${rx}deg) rotateZ(${rz}deg) translateY(${ty}px) translateX(${-CW / 2}px)`, transformStyle: "preserve-3d" }}>
          {Array.from({ length: N }).map((_, i) => <div key={i} style={{ position: "absolute", top: i * (CH + GAP), left: 0 }}><Card i={i} shadow={false} /></div>)}
        </div>
      </Stage>
    </>
  );
};
const SceneEnd: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - 13.0; const k = easeOut(on(lt, 0, 0.7));
  const tilt = Math.sin(lt * 1.2) * 3;
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: PF_W, top: 95, display: "flex", justifyContent: "center", opacity: on(lt, 0.1, 0.3) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 22px 10px 10px", borderRadius: 40, background: "#fff", boxShadow: "0 10px 30px rgba(80,50,10,.15)" }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: INK, color: BG, fontFamily: "InterTight", fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: -2 }}>rr</div>
          <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 26, color: INK }}>rubelpublic.github.io</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, width: PF_W, top: 170, textAlign: "center", fontFamily: "InterTight", fontWeight: 800, fontSize: 150, letterSpacing: -6, color: INK, lineHeight: 1, opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>Rapar Rubel</div>
      <div style={{ position: "absolute", left: 0, width: PF_W, top: 335, textAlign: "center", fontFamily: "Inter", fontWeight: 600, fontSize: 40, color: AMBER, opacity: on(lt, 0.35, 0.4) }}>AI Expert &amp; AI Workflow Builder</div>
      <Stage persp={1800}>
        <div style={{ position: "absolute", transform: `translate(-50%,-50%) translateY(${200 + (1 - k) * 300}px) rotateX(${8 + tilt}deg) rotateY(${-tilt * 1.5}deg) scale(${0.78 + 0.04 * Math.sin(lt)})` }}><Card i={0} w={1000} /></div>
      </Stage>
      <Chip label="AI agents" x={160} y={560} t={t} at={13.4} ph={0} />
      <Chip label="Bangla AI" x={1200} y={520} t={t} at={13.55} ph={1} />
      <Chip label="Automation" x={1210} y={930} t={t} at={13.7} ph={2} />
      <Chip label="AI content" x={150} y={950} t={t} at={13.85} ph={3} />
      <Mono x={1240} y={720} t={t} at={14.0} ph={1} s={110} />
      <Mono x={110} y={760} t={t} at={14.1} ph={2} s={90} />
    </>
  );
};

export const PortfolioShowcase: React.FC = () => {
  const t = useCurrentFrame() / PF_FPS;
  const scene = t < 2.4 ? <SceneHero t={t} /> : t < 8.0 ? <SceneFly t={t} /> : t < 11.0 ? <SceneGrid t={t} /> : t < 13.0 ? <SceneZoomOut t={t} /> : <SceneEnd t={t} />;
  const cut = [2.4, 8.0, 11.0, 13.0].map((c) => Math.max(0, 1 - Math.abs(t - c) / 0.12)).reduce((a, b) => Math.max(a, b), 0);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 35%, #fbf8f2 0%, ${BG} 60%, #e9dfcf 100%)` }}>
      <CameraMotionBlur samples={7} shutterAngle={200}>
        <AbsoluteFill style={{ filter: cut > 0 ? `blur(${cut * 10}px)` : undefined }}>{scene}</AbsoluteFill>
      </CameraMotionBlur>
    </AbsoluteFill>
  );
};
