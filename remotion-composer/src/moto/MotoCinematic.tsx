import React from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { FONT_CSS } from "../portfolio/fontcss";

// Cinematic product film for the client's motorcycle, styled after their references:
// dark CGI teardown with red lasers and macro parts (engine film) + exploded parts that assemble
// into the full vehicle (car film). Built 2.5D from public/moto/*.png cut from the client's photo
// and cutaway diagram; gears and the brake disc are drawn in SVG.
export const MC_FPS = 30, MC_W = 1080, MC_H = 1920, MC_TOTAL = 28.5;
export const MC_FRAMES = Math.round(MC_TOTAL * MC_FPS);
const RED = "#ff2a2a";
const img = (n: string) => staticFile(`moto/${n}`);

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (x: number) => { const k = clamp(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = (x: number) => Math.pow(clamp(x), 3);
const on = (t: number, a: number, d: number) => clamp((t - a) / d);
const win = (t: number, a: number, b: number, f = 0.35) => Math.min(on(t, a, f), 1 - on(t, b - f, f));
const rnd = (s: number) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------------- shared FX ----------------
const Studio: React.FC<{ glow?: number }> = ({ glow = 1 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 45% at 50% 48%, rgba(90,10,10,${0.55 * glow}) 0%, rgba(25,4,6,.9) 55%, #050405 100%)` }} />
);
const Laser: React.FC<{ y: number; ang?: number; a?: number; w?: number }> = ({ y, ang = 0, a = 1, w = 4 }) => a <= 0 ? null : (
  <div style={{ position: "absolute", left: -400, width: MC_W + 800, top: y, height: w, background: RED, opacity: a, transform: `rotate(${ang}deg)`, boxShadow: `0 0 18px 4px rgba(255,40,40,.75), 0 0 60px 12px rgba(255,0,0,.35)`, mixBlendMode: "screen" }} />
);
const Dust: React.FC<{ t: number; n?: number }> = ({ t, n = 40 }) => (
  <>{Array.from({ length: n }).map((_, i) => {
    const x = (rnd(i) * MC_W + t * (8 + rnd(i + 5) * 20)) % MC_W, y = (rnd(i + 9) * MC_H - t * (12 + rnd(i + 3) * 25) + MC_H * 4) % MC_H;
    return <div key={i} style={{ position: "absolute", left: x, top: y, width: 3 + rnd(i + 7) * 4, height: 3 + rnd(i + 7) * 4, borderRadius: 4, background: "rgba(255,200,190,.5)", opacity: 0.2 + 0.5 * rnd(i + 11), filter: "blur(1px)" }} />;
  })}</>
);
const Label: React.FC<{ t: number; a: number; b: number; title: string; sub: string }> = ({ t, a, b, title, sub }) => {
  const k = win(t, a, b, 0.4); if (k <= 0) return null;
  return (
    <>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 760, background: "linear-gradient(0deg, rgba(0,0,0,.92) 40%, rgba(0,0,0,0))", opacity: k }} />
    <div style={{ position: "absolute", left: 90, bottom: 330, opacity: k }}>
      <div style={{ width: 90 * easeOut(on(t, a, 0.6)), height: 4, background: RED, boxShadow: `0 0 16px ${RED}`, marginBottom: 22 }} />
      <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 64, letterSpacing: 18, color: "#fff", transform: `translateX(${(1 - easeOut(on(t, a, 0.6))) * -30}px)` }}>{title}</div>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 32, letterSpacing: 4, color: "rgba(255,255,255,.6)", marginTop: 10 }}>{sub}</div>
    </div>
    </>
  );
};
const Grain: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.75) 100%)", pointerEvents: "none" }} />
);

// ---------------- SVG machinery ----------------
const gearPath = (teeth: number, r: number, depth: number) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2, s = (Math.PI * 2) / teeth;
    for (const [f, rr] of [[0, r - depth], [0.18, r - depth], [0.3, r], [0.7, r], [0.82, r - depth]] as const) pts.push(`${Math.cos(a0 + s * f) * rr},${Math.sin(a0 + s * f) * rr}`);
  }
  return "M" + pts.join("L") + "Z";
};
const Gear: React.FC<{ x: number; y: number; r: number; teeth: number; rot: number; id: string; tone?: number }> = ({ x, y, r, teeth, rot, id, tone = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <defs>
      <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={`rgb(${235 * tone},${238 * tone},${242 * tone})`} /><stop offset=".45" stopColor="#6d7178" /><stop offset=".7" stopColor="#c9ccd2" /><stop offset="1" stopColor="#2b2d31" /></linearGradient>
      <radialGradient id={`h${id}`}><stop offset="0" stopColor="#1a1b1e" /><stop offset="1" stopColor="#4a4d53" /></radialGradient>
    </defs>
    <path d={gearPath(teeth, r, r * 0.12)} fill={`url(#g${id})`} stroke="#111" strokeWidth={3} />
    <circle r={r * 0.72} fill="none" stroke="rgba(0,0,0,.45)" strokeWidth={r * 0.05} />
    {Array.from({ length: 6 }).map((_, i) => { const a = (i / 6) * Math.PI * 2; return <circle key={i} cx={Math.cos(a) * r * 0.5} cy={Math.sin(a) * r * 0.5} r={r * 0.11} fill={`url(#h${id})`} />; })}
    <circle r={r * 0.22} fill={`url(#h${id})`} stroke="#999" strokeWidth={3} />
    <circle r={r * 0.09} fill="#0b0b0c" />
  </g>
);
const Disc: React.FC<{ rot: number; clamp: number }> = ({ rot, clamp: c }) => (
  <svg width={1080} height={1080} viewBox="-540 -540 1080 1080">
    <defs>
      <radialGradient id="dg"><stop offset=".3" stopColor="#3a3c40" /><stop offset=".55" stopColor="#b9bcc2" /><stop offset=".8" stopColor="#e9ebee" /><stop offset="1" stopColor="#7b7f86" /></radialGradient>
      <linearGradient id="cal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff4b3a" /><stop offset=".6" stopColor="#b3120d" /><stop offset="1" stopColor="#5a0606" /></linearGradient>
    </defs>
    <g transform={`rotate(${rot})`}>
      <path d={Array.from({ length: 24 }).map((_, i) => { const a = (i / 24) * Math.PI * 2, b = ((i + 0.5) / 24) * Math.PI * 2; return `${i ? "L" : "M"}${Math.cos(a) * 430},${Math.sin(a) * 430}Q${Math.cos(b) * 400},${Math.sin(b) * 400} ${Math.cos(a + Math.PI / 12) * 430},${Math.sin(a + Math.PI / 12) * 430}`; }).join("") + "Z"} fill="url(#dg)" stroke="#222" strokeWidth={4} />
      {Array.from({ length: 3 }).flatMap((_, ring) => Array.from({ length: 30 }).map((_, i) => { const a = (i / 30) * Math.PI * 2 + ring * 0.07, rr = 300 + ring * 40; return <circle key={`${ring}-${i}`} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} r={9} fill="#141516" />; }))}
      <circle r={240} fill="#2a2c30" stroke="#888" strokeWidth={6} />
      {Array.from({ length: 5 }).map((_, i) => { const a = (i / 5) * Math.PI * 2; return <path key={i} d={`M${Math.cos(a - 0.25) * 80},${Math.sin(a - 0.25) * 80} L${Math.cos(a - 0.12) * 240},${Math.sin(a - 0.12) * 240} L${Math.cos(a + 0.12) * 240},${Math.sin(a + 0.12) * 240} L${Math.cos(a + 0.25) * 80},${Math.sin(a + 0.25) * 80}Z`} fill="#55585e" />; })}
      <circle r={90} fill="#1c1d20" stroke="#aaa" strokeWidth={5} />
      {Array.from({ length: 5 }).map((_, i) => { const a = (i / 5) * Math.PI * 2; return <circle key={i} cx={Math.cos(a) * 55} cy={Math.sin(a) * 55} r={12} fill="#d8d8d8" />; })}
    </g>
    <g transform={`translate(${300 + 12 * (1 - c)},-230) rotate(38)`}>
      <rect x={-90} y={-170} width={180} height={340} rx={60} fill="url(#cal)" stroke="#300" strokeWidth={5} />
      <rect x={-60} y={-120} width={120} height={60} rx={20} fill="rgba(255,255,255,.18)" />
      <circle cx={0} cy={90} r={22} fill="#222" stroke="#999" strokeWidth={4} />
    </g>
  </svg>
);

// ---------------- scenes ----------------
const SLayout: React.FC<{ t: number }> = ({ t }) => {
  const z = lerp(0.92, 1.08, ease(t / 3.2)); const sweep = lerp(-200, 2100, on(t, 0.3, 2.4));
  const lit = (y: number) => 0.45 + 0.55 * clamp(1 - Math.abs(sweep - y) / 500) + 0.35 * on(sweep, y, 400);
  const P: React.FC<{ src: string; x: number; y: number; w: number; r: number; yy: number }> = ({ src, x, y, w, r, yy }) => (
    <Img src={img(src)} style={{ position: "absolute", left: x, top: y, width: w, transform: `rotate(${r + Math.sin(t + x) * 1.5}deg)`, filter: `brightness(${lit(yy)}) drop-shadow(0 30px 40px rgba(0,0,0,.8))` }} />
  );
  return (
    <AbsoluteFill style={{ transform: `scale(${z}) rotate(-4deg)` }}>
      <Studio glow={0.6} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,60,60,.07) 2px, transparent 2px), linear-gradient(90deg, rgba(255,60,60,.07) 2px, transparent 2px)", backgroundSize: "90px 90px" }} />
      <P src="eng_inset.png" x={90} y={300} w={420} r={-6} yy={500} />
      <P src="brake.png" x={560} y={360} w={440} r={8} yy={560} />
      <P src="tyre.png" x={600} y={950} w={420} r={-4} yy={1150} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, filter: `brightness(${lit(1300)})` }}>
        <Gear x={300} y={1180} r={170} teeth={28} rot={t * 20} id="a" /><Gear x={300 + 170 + 105} y={1430} r={110} teeth={18} rot={-t * 31 + 5} id="b" />
      </svg>
      <Laser y={sweep} a={on(t, 0.3, 0.2) * (1 - on(t, 2.7, 0.3))} />
      <Dust t={t} />
    </AbsoluteFill>
  );
};
const SCombustion: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - 3.2; const k = ease(lt / 3.8);
  const fires = [0.45, 1.25, 2.05, 2.85];
  const fire = Math.max(...fires.map((f) => Math.exp(-Math.max(0, lt - f) * 6) * (lt >= f ? 1 : 0)));
  const s = lerp(2.4, 3.6, k);
  return (
    <AbsoluteFill>
      <Studio glow={0.9 + fire * 0.6} />
      <div style={{ position: "absolute", left: 540, top: 820, transform: `translate(-50%,-50%) scale(${s}) translateY(${lerp(40, 70, k) + Math.sin(lt * 40) * fire * 2}px)`, transformOrigin: "48% 24%" }}>
        <Img src={img("eng_inset.png")} style={{ width: 388, display: "block", filter: `brightness(${0.75 + fire * 0.5}) contrast(1.1) saturate(${1 + fire * 0.5})`, WebkitMaskImage: "linear-gradient(90deg, #000 78%, transparent 92%)" }} />
        <div style={{ position: "absolute", left: 120, top: 100, width: 160, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,220,120,.95), rgba(255,120,20,.6) 45%, rgba(255,60,0,0) 75%)", opacity: fire, mixBlendMode: "screen", filter: "blur(6px)" }} />
      </div>
      <AbsoluteFill style={{ background: "rgba(255,140,40,1)", opacity: fire * 0.18, mixBlendMode: "screen" }} />
      <Laser y={lerp(1500, 300, on(lt, 0.2, 3.2))} ang={-12} a={0.8} w={3} />
      <Dust t={t} n={30} />
      <Label t={t} a={3.6} b={7.0} title="COMBUSTION" sub="Spark meets air-fuel mixture" />
    </AbsoluteFill>
  );
};
const SGears: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - 7.0; const z = lerp(1.0, 1.25, ease(lt / 3.4)); const spin = lt * 60 * (1 + lt * 0.3);
  return (
    <AbsoluteFill>
      <Studio glow={0.8} />
      <svg width={1080} height={1920} style={{ position: "absolute", transform: `scale(${z}) rotate(${lt * 3}deg)`, transformOrigin: "50% 45%" }}>
        <Gear x={430} y={780} r={330} teeth={40} rot={spin} id="c" />
        <Gear x={430 + 330 + 200 - 25} y={780 + 160} r={210} teeth={26} rot={-spin * (40 / 26) + 4} id="d" tone={0.9} />
        <Gear x={330} y={780 + 330 + 230} r={250} teeth={30} rot={-spin * (40 / 30) + 2} id="e" tone={0.85} />
      </svg>
      <Laser y={770} ang={8} a={0.9} />
      <Laser y={990} ang={-22} a={0.5 + 0.4 * Math.sin(lt * 9)} w={2} />
      <div style={{ position: "absolute", left: 430 - 26, top: 780 - 26, width: 52, height: 52, borderRadius: 26, background: RED, boxShadow: `0 0 50px 20px rgba(255,30,30,.8)`, transform: `scale(${z})`, transformOrigin: "26px 26px", opacity: 0.85 }} />
      <Dust t={t} n={30} />
      <Label t={t} a={7.3} b={10.4} title="TRANSMISSION" sub="Gearbox & clutch deliver power" />
    </AbsoluteFill>
  );
};
const SBrake: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - 10.4; const br = on(lt, 1.3, 0.25);
  const speed = lerp(900, 0, easeOut(on(lt, 1.35, 1.4)));
  const rot = lt < 1.35 ? lt * 900 : 1.35 * 900 + (900 * 1.4) / 4 * (1 - Math.pow(1 - clamp((lt - 1.35) / 1.4), 4));
  return (
    <AbsoluteFill>
      <Studio glow={0.7 + br * 0.4} />
      <div style={{ position: "absolute", left: 0, top: 420, transform: `scale(${lerp(0.95, 1.12, ease(lt / 3.2))}) rotateX(18deg)`, filter: speed > 300 ? "blur(1.5px)" : undefined }}><Disc rot={rot} clamp={br} /></div>
      {br > 0 && Array.from({ length: 22 }).map((_, i) => { const k = ((lt - 1.3) * 2 + rnd(i)) % 1; const a = -0.9 + rnd(i + 3) * 0.8; return <div key={i} style={{ position: "absolute", left: 540 + 300 + Math.cos(a) * 520 * k, top: 960 - 230 + Math.sin(a) * 520 * k + k * k * 260, width: 6, height: 26, borderRadius: 4, background: "#ffb347", boxShadow: "0 0 12px #ff8a1f", opacity: (1 - k) * (1 - on(lt, 2.6, 0.4)), transform: `rotate(${(a * 180) / Math.PI + 90}deg)` }} />; })}
      <Laser y={lerp(300, 1700, on(lt, 0, 3.2))} ang={4} a={0.7} w={3} />
      <Label t={t} a={10.7} b={13.6} title="BRAKING" sub="Disc brakes with ABS control" />
    </AbsoluteFill>
  );
};
const STyre: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - 13.6; const sc = lerp(-0.1, 1.1, on(lt, 0.3, 2.2));
  return (
    <AbsoluteFill>
      <Studio glow={0.6} />
      <div style={{ position: "absolute", left: 540, top: 880, transform: `translate(-50%,-50%) scale(${lerp(2.3, 2.7, ease(lt / 2.8))}) rotate(${lerp(-4, 2, ease(lt / 2.8))}deg)` }}>
        <Img src={img("tyre.png")} style={{ width: 400, display: "block", filter: "brightness(.8) contrast(1.15)", WebkitMaskImage: "linear-gradient(90deg, #000 72%, transparent 88%)" }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(255,40,40,0) ${sc * 100 - 8}%, rgba(255,60,60,.55) ${sc * 100}%, rgba(255,40,40,0) ${sc * 100 + 3}%)`, mixBlendMode: "screen", WebkitMaskImage: `url(${img("tyre.png")})`, WebkitMaskSize: "100% 100%" }} />
      </div>
      <Laser y={lerp(-60, 1980, sc / 1.1) + 0} a={on(lt, 0.3, 0.1) * (1 - on(lt, 2.4, 0.2))} />
      <Dust t={t} n={25} />
      <Label t={t} a={13.9} b={16.4} title="GRIP" sub="Tread, belts, casing, liner" />
    </AbsoluteFill>
  );
};
// bike placement in the frame (bike.png is 1260x840)
const BW = 1000, BH = (BW * 840) / 1260, BX = 540 - BW / 2, BY = 1000 - BH / 2;
const at = (fx: number, fy: number) => [BX + fx * BW, BY + fy * BH];
const SAssembly: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - 16.4;
  const parts: { src: string; from: [number, number, number]; to: [number, number]; w0: number; w1: number; d: number }[] = [
    { src: "eng_inset.png", from: [-300, 300, -30], to: at(0.5, 0.62), w0: 520, w1: 150, d: 0 },
    { src: "brake.png", from: [1300, 420, 40], to: at(0.25, 0.72), w0: 500, w1: 170, d: 0.18 },
    { src: "tyre.png", from: [1350, 1700, -40], to: at(0.75, 0.74), w0: 480, w1: 230, d: 0.34 },
  ];
  const wire = on(lt, 1.6, 1.4); const flash = Math.exp(-Math.max(0, lt - 1.55) * 7) * (lt > 1.55 ? 1 : 0);
  return (
    <AbsoluteFill>
      <Studio glow={0.7 + flash} />
      <div style={{ position: "absolute", left: BX, top: BY, width: BW, height: BH, clipPath: `inset(0 ${100 - wire * 100}% 0 0)` }}>
        <Img src={img("bike_wire.png")} style={{ width: BW, height: BH, filter: "drop-shadow(0 0 6px rgba(255,40,40,.9))" }} />
      </div>
      {wire > 0 && wire < 1 && <div style={{ position: "absolute", left: BX + wire * BW - 2, top: BY - 120, width: 4, height: BH + 240, background: RED, boxShadow: `0 0 24px 6px rgba(255,40,40,.8)` }} />}
      {parts.map((p, i) => {
        const k = ease(on(lt, p.d, 1.5)); if (k >= 1) return null;
        const x = lerp(p.from[0], p.to[0], k), y = lerp(p.from[1], p.to[1], k), w = lerp(p.w0, p.w1, k);
        return <Img key={i} src={img(p.src)} style={{ position: "absolute", left: x - w / 2, top: y - w * 0.7, width: w, transform: `rotate(${lerp(p.from[2], 0, k)}deg)`, opacity: 1 - on(k, 0.85, 0.15), filter: "brightness(.85) drop-shadow(0 20px 30px rgba(0,0,0,.8))" }} />;
      })}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {(() => { const k = ease(on(lt, 0.1, 1.5)); if (k >= 1) return null; const [tx, ty] = at(0.52, 0.66); return <Gear x={lerp(540, tx, k)} y={lerp(1750, ty, k)} r={lerp(170, 40, k)} teeth={24} rot={lt * 120} id="f" />; })()}
      </svg>
      <AbsoluteFill style={{ background: "#fff", opacity: flash * 0.35 }} />
      <Dust t={t} n={30} />
    </AbsoluteFill>
  );
};
const SReveal: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - 20.5; const scan = ease(on(lt, 0.1, 1.8));
  const z = lerp(1.0, 1.12, ease(on(lt, 1.5, 3.5))); const ry = Math.sin(lt * 0.7) * 6;
  const sweep = lerp(-0.4, 1.4, on(lt, 2.2, 1.6));
  const head = on(lt, 2.0, 0.3) * (0.85 + 0.15 * Math.sin(lt * 20));
  const [hx, hy] = at(0.27, 0.36);
  return (
    <AbsoluteFill>
      <Studio glow={1.1} />
      <div style={{ position: "absolute", left: -200, top: BY + BH - 160, width: MC_W + 400, height: 520, background: "radial-gradient(ellipse 50% 30% at 50% 30%, rgba(255,40,40,.22), rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
        <div style={{ position: "absolute", left: BX, top: BY, width: BW, height: BH, transform: `scale(${z}) rotateY(${ry}deg)`, transformOrigin: "50% 70%" }}>
          <Img src={img("bike.png")} style={{ position: "absolute", width: BW, height: BH, top: BH - 12, transform: "scaleY(-1)", opacity: 0.22, filter: "blur(3px)", WebkitMaskImage: "linear-gradient(0deg, rgba(0,0,0,.9), transparent 55%)", clipPath: `inset(0 ${100 - scan * 100}% 0 0)` }} />
          <Img src={img("bike_wire.png")} style={{ position: "absolute", width: BW, height: BH, clipPath: `inset(0 0 0 ${scan * 100}%)`, filter: "drop-shadow(0 0 6px rgba(255,40,40,.9))" }} />
          <Img src={img("bike.png")} style={{ position: "absolute", width: BW, height: BH, clipPath: `inset(0 ${100 - scan * 100}% 0 0)`, filter: "brightness(1.15) contrast(1.08) drop-shadow(0 30px 40px rgba(0,0,0,.9))" }} />
          <div style={{ position: "absolute", width: BW, height: BH, background: `linear-gradient(100deg, rgba(255,255,255,0) ${sweep * 100 - 12}%, rgba(255,255,255,.55) ${sweep * 100}%, rgba(255,255,255,0) ${sweep * 100 + 12}%)`, mixBlendMode: "screen", WebkitMaskImage: `url(${img("bike.png")})`, WebkitMaskSize: "100% 100%" }} />
        </div>
      </div>
      {scan > 0 && scan < 1 && <div style={{ position: "absolute", left: BX + scan * BW - 2, top: BY - 140, width: 4, height: BH + 280, background: RED, boxShadow: `0 0 26px 8px rgba(255,40,40,.85)` }} />}
      {head > 0 && <div style={{ position: "absolute", left: lerp(540, hx, z > 1 ? 1 : 1) - 160, top: hy - 160, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.95), rgba(200,230,255,.45) 25%, rgba(200,230,255,0) 65%)", opacity: head * 0.8, mixBlendMode: "screen", transform: `scale(${z})`, transformOrigin: `${540 - hx + 160}px ${1000 - hy + 160}px` }} />}
      <Dust t={t} n={30} />
    </AbsoluteFill>
  );
};
const STitle: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - 25.5; const k = easeOut(on(lt, 0.15, 0.9));
  return (
    <AbsoluteFill style={{ background: "#030303", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 104, letterSpacing: 26 * k + 4, color: "#fff", opacity: k, paddingLeft: 26 * k }}>PULSAR</div>
      <div style={{ fontFamily: "InterTight", fontWeight: 800, fontSize: 150, letterSpacing: 6, color: RED, opacity: on(lt, 0.45, 0.5), textShadow: "0 0 30px rgba(255,40,40,.55)" }}>N160</div>
      <div style={{ width: 520 * easeOut(on(lt, 0.7, 0.8)), height: 3, background: RED, boxShadow: `0 0 16px ${RED}`, margin: "26px 0" }} />
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 34, letterSpacing: 12, color: "rgba(255,255,255,.7)", opacity: on(lt, 1.1, 0.5) }}>POWER · CONTROL · STYLE</div>
    </AbsoluteFill>
  );
};

export const MotoCinematic: React.FC = () => {
  const t = useCurrentFrame() / MC_FPS;
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { Promise.all(["700 60px Inter", "600 40px Inter", "800 60px InterTight"].map((f) => document.fonts.load(f))).then(() => continueRender(h), () => continueRender(h)); }, [h]);
  const S = t < 3.2 ? <SLayout t={t} /> : t < 7.0 ? <SCombustion t={t} /> : t < 10.4 ? <SGears t={t} /> : t < 13.6 ? <SBrake t={t} /> : t < 16.4 ? <STyre t={t} /> : t < 20.5 ? <SAssembly t={t} /> : t < 25.5 ? <SReveal t={t} /> : <STitle t={t} />;
  const cut = [3.2, 7.0, 10.4, 13.6, 16.4, 20.5, 25.5].map((c) => Math.max(0, 1 - Math.abs(t - c) / 0.14)).reduce((a, b) => Math.max(a, b), 0);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <style>{FONT_CSS}</style>
      <AbsoluteFill style={{ filter: cut > 0 ? `blur(${cut * 14}px) brightness(${1 + cut * 0.6})` : undefined, transform: `scale(${1 + cut * 0.06})` }}>{S}</AbsoluteFill>
      <Grain t={t} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #000 0, rgba(0,0,0,0) 9%, rgba(0,0,0,0) 91%, #000 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
