import React, { createContext, useContext, useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// ---------------------------------------------------------------------------
// "Signal নাই" — SIGNAL LOST. Kinetic-type music video built around one motif:
// the four phone signal bars. Every section is its own world (cold-open crash,
// neon tower over Dhaka, VHS memory tape, strobe drop, আগে|এখন split, contact
// list, rain, reconnect) and every lyric word slams in at the moment it is sung.
// Ending: the four bars become four friends — FULL SIGNAL.
// ---------------------------------------------------------------------------

export type SLLine = { start: number; end: number; text: string; who?: "q" | "a" };
export type SLProps = {
  song: string;
  durationSec: number;
  beats: number[];
  bass: number[];
  onset: number[];
  lines: SLLine[];
  sections: [string, number, number][];
  credits: { role: string; name: string }[];
};

const W = 1920;
const H = 1080;
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const BN = "'Anek Bangla', sans-serif";
const EN = "'Montserrat', sans-serif";
const AN = "'Anton', 'Montserrat', sans-serif";
const K = { cyan: "#00f0ff", mag: "#ff2bd6", lime: "#c6ff00", red: "#ff2e4d", gold: "#ffc94a", ink: "#07060f", vio: "#2a0a5e", cream: "#f6e7c8", blue: "#0a1a3f" };

const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const f = (fam: string, file: string, d: FontFaceDescriptors = {}) => new FontFace(fam, `url(${staticFile("bab/fonts/" + file)})`, d);
    Promise.all(
      [
        f("Anek Bangla", "anek-bangla-bengali-standard-normal.woff2", { weight: "100 800", stretch: "75% 125%", unicodeRange: "U+0951-0952,U+0964-0965,U+0980-09FE,U+200C-200D,U+25CC" }),
        f("Anek Bangla", "anek-bangla-latin-standard-normal.woff2", { weight: "100 800", stretch: "75% 125%" }),
        f("Montserrat", "montserrat-latin-wght-normal.woff2", { weight: "100 900" }),
        f("Anton", "anton-latin-400-normal.woff2"),
      ].map((x) => x.load().then((ff) => document.fonts.add(ff)))
    )
      .catch(() => undefined)
      .finally(() => continueRender(h));
  }, [h]);
};

type Ctx = { t: number; frame: number; fps: number; beat: number; bi: number; bass: number; onset: number; sec: string; s0: number; s1: number; line?: SLLine; li: number };
const X = createContext<Ctx>(null as unknown as Ctx);
const useX = () => useContext(X);

// ------------------------------------------------------------------ word timing
const wordTimes = (l: SLLine) => {
  const words = l.text.split(/\s+/).filter(Boolean);
  const total = words.reduce((s, w) => s + Math.max(2, w.replace(/[.,!?।—“”"]/g, "").length), 0);
  const span = Math.max(0.3, (l.end - l.start) * 0.8);
  let acc = 0;
  return words.map((w) => {
    const at = l.start + (acc / total) * span;
    acc += Math.max(2, w.replace(/[.,!?।—“”"]/g, "").length);
    return { w, at };
  });
};
const HOT = /Signal|নাই|অফলাইন|কানেক্টেড|ডাউনলোড|বিকেল|বন্ধু|মানুষ|হ্যালো|মিসড|জুম|কাল|বৃষ্টির|ফিরতে|হারাই/;

// ------------------------------------------------------------------ motif: signal bars
const Bars: React.FC<{ x: number; y: number; s?: number; level: number; color?: string; off?: string; glow?: boolean }> = ({ x, y, s = 1, level, color = K.cyan, off = "#ffffff22", glow = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2, 3].map((i) => {
      const on = Math.max(0, Math.min(1, level - i));
      const h = 40 + i * 40;
      return (
        <g key={i}>
          <rect x={i * 46 - 92} y={-h} width={34} height={h} rx={8} fill={off} />
          <rect x={i * 46 - 92} y={-h * on} width={34} height={h * on} rx={8} fill={color} style={glow && on > 0 ? { filter: `drop-shadow(0 0 14px ${color})` } : undefined} />
        </g>
      );
    })}
  </g>
);

// ------------------------------------------------------------------ backgrounds
const Grain: React.FC<{ n?: number; o?: number }> = ({ n = 70, o = 0.25 }) => {
  const { frame } = useX();
  return (
    <svg width={W} height={H} style={{ position: "absolute", mixBlendMode: "overlay", opacity: o }}>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={random(`gx${frame}${i}`) * W} y={random(`gy${frame}${i}`) * H} width={2 + random(`gw${i}`) * 4} height={2 + random(`gh${frame}${i}`) * 4} fill={i % 2 ? "#fff" : "#000"} />
      ))}
    </svg>
  );
};

const Rings: React.FC<{ cx: number; cy: number; color: string; every?: number; max?: number }> = ({ cx, cy, color, every = 0.47, max = 1300 }) => {
  const { t } = useX();
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => {
        const ph = ((t / every + i / 6 * 3) % 3) / 3;
        return <circle key={i} cx={cx} cy={cy} r={60 + ph * max} fill="none" stroke={color} strokeWidth={6 - ph * 4} opacity={(1 - ph) * 0.55} />;
      })}
    </>
  );
};

const Skyline: React.FC<{ y: number; seed: string; color: string; win?: string; scale?: number; dx?: number }> = ({ y, seed, color, win = K.gold, scale = 1, dx = 0 }) => {
  const { frame } = useX();
  const out: React.ReactNode[] = [];
  let x = -200 + (dx % 400);
  let i = 0;
  while (x < W + 200) {
    const w = (90 + random(`${seed}w${i}`) * 130) * scale;
    const h = (160 + random(`${seed}h${i}`) * 320) * scale;
    out.push(<rect key={`b${i}`} x={x} y={y - h} width={w} height={h + 300} fill={color} />);
    for (let r = 0; r < Math.floor(h / 46); r++)
      for (let c = 0; c < Math.floor(w / 34); c++) {
        const lit = random(`${seed}${i}-${r}-${c}`) > 0.55 && random(`${seed}${i}-${r}-${c}-${Math.floor(frame / 40)}`) > 0.1;
        if (lit) out.push(<rect key={`w${i}-${r}-${c}`} x={x + 10 + c * 34} y={y - h + 16 + r * 46} width={16} height={22} fill={win} opacity={0.75} />);
      }
    if (random(`${seed}ant${i}`) > 0.7) out.push(<line key={`a${i}`} x1={x + w / 2} y1={y - h} x2={x + w / 2} y2={y - h - 60} stroke={color} strokeWidth={5} />);
    x += w + 6;
    i++;
  }
  return <g>{out}</g>;
};

const Tower: React.FC<{ x: number; y: number; h: number; color: string }> = ({ x, y, h, color }) => {
  const { frame } = useX();
  const segs = 9;
  const els: React.ReactNode[] = [];
  for (let i = 0; i < segs; i++) {
    const y0 = y - (h * i) / segs, y1 = y - (h * (i + 1)) / segs;
    const w0 = 150 * (1 - i / segs) + 14, w1 = 150 * (1 - (i + 1) / segs) + 14;
    els.push(<line key={`l${i}`} x1={x - w0} y1={y0} x2={x - w1} y2={y1} stroke={color} strokeWidth={6} />);
    els.push(<line key={`r${i}`} x1={x + w0} y1={y0} x2={x + w1} y2={y1} stroke={color} strokeWidth={6} />);
    els.push(<line key={`x${i}`} x1={x - w0} y1={y0} x2={x + w1} y2={y1} stroke={color} strokeWidth={3} opacity={0.8} />);
    els.push(<line key={`y${i}`} x1={x + w0} y1={y0} x2={x - w1} y2={y1} stroke={color} strokeWidth={3} opacity={0.8} />);
    els.push(<line key={`h${i}`} x1={x - w1} y1={y1} x2={x + w1} y2={y1} stroke={color} strokeWidth={4} />);
  }
  return (
    <g>
      {els}
      <rect x={x - 40} y={y - h - 10} width={30} height={60} fill={color} />
      <rect x={x + 10} y={y - h - 10} width={30} height={60} fill={color} />
      <circle cx={x} cy={y - h - 30} r={12} fill={K.red} opacity={Math.floor(frame / 15) % 2 ? 1 : 0.2} style={{ filter: `drop-shadow(0 0 16px ${K.red})` }} />
    </g>
  );
};

// ------------------------------------------------------------------ icons (memory tape)
const Icon: React.FC<{ k: string; s?: number }> = ({ k, s = 1 }) => {
  const { frame } = useX();
  const st = { stroke: K.ink, strokeWidth: 8, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const wob = Math.sin(frame / 6) * 4;
  const g = (c: React.ReactNode) => <g transform={`scale(${s}) rotate(${wob})`}>{c}</g>;
  switch (k) {
    case "coins":
      return g(<>{[0, 1, 2, 3].map((i) => <ellipse key={i} cx={(i % 2) * 20 - 10} cy={60 - i * 34} rx={90} ry={30} fill={K.gold} {...st} />)}<text x={0} y={-50} textAnchor="middle" fontFamily={AN} fontSize={40} fill={K.ink}>৳</text></>);
    case "nokia":
      return g(<><rect x={-70} y={-150} width={140} height={300} rx={40} fill="#3d405b" {...st} /><rect x={-48} y={-112} width={96} height={74} rx={6} fill="#b5e48c" stroke={K.ink} strokeWidth={5} /><text x={0} y={-66} textAnchor="middle" fontFamily={EN} fontWeight={900} fontSize={18} fill={K.ink}>1 Missed</text>{Array.from({ length: 9 }, (_, i) => <rect key={i} x={-46 + (i % 3) * 34} y={0 + Math.floor(i / 3) * 36} width={24} height={22} rx={6} fill="#adb5bd" />)}</>);
    case "house":
      return g(<><path d="M-120 0 L0 -110 L120 0 Z" fill={K.red} {...st} /><rect x={-95} y={0} width={190} height={130} fill={K.cream} {...st} /><rect x={-25} y={50} width={50} height={80} fill="#6d4c41" {...st} /><rect x={-80} y={25} width={40} height={40} fill={K.gold} {...st} /></>);
    case "cd":
      return g(<g transform={`rotate(${frame * 6})`}><circle r={130} fill="url(#cdg)" {...st} /><circle r={30} fill={K.cream} {...st} /><text x={0} y={-70} textAnchor="middle" fontFamily={BN} fontWeight={700} fontSize={34} fill="#1e3a8a">গান</text></g>);
    case "pen":
      return g(<g transform="rotate(-35)"><rect x={-20} y={-150} width={40} height={240} rx={10} fill="#1e3a8a" {...st} /><path d="M-20 90 L0 150 L20 90 Z" fill={K.cream} {...st} /><rect x={-20} y={-150} width={40} height={40} fill="#3a86ff" {...st} /></g>);
    case "bat":
      return g(<><g transform="rotate(30)"><rect x={-28} y={-160} width={56} height={230} rx={14} fill="#e9c46a" {...st} /><rect x={-10} y={70} width={20} height={80} fill="#6d4c41" {...st} /></g><circle cx={110} cy={-90} r={30} fill={K.red} {...st} /></>);
    case "wifi":
      return g(<>{[0, 1, 2].map((i) => <path key={i} d={`M${-50 - i * 45} ${-10 - i * 40} Q0 ${-70 - i * 70} ${50 + i * 45} ${-10 - i * 40}`} fill="none" stroke={K.cyan} strokeWidth={22} strokeLinecap="round" opacity={Math.floor(frame / 8) % 4 > i ? 1 : 0.2} />)}<circle cx={0} cy={40} r={22} fill={K.cyan} /></>);
    case "photo":
      return g(<g transform="rotate(-6)"><rect x={-130} y={-150} width={260} height={290} fill="#fff" {...st} /><rect x={-105} y={-125} width={210} height={180} fill="#90be6d" stroke={K.ink} strokeWidth={5} style={{ filter: "blur(6px)" }} /><circle cx={-30} cy={-40} r={30} fill="#6d4c41" style={{ filter: "blur(5px)" }} /><circle cx={40} cy={-40} r={30} fill="#6d4c41" style={{ filter: "blur(5px)" }} /></g>);
    case "globe":
      return g(<><circle r={130} fill="#3a86ff" {...st} /><path d="M-60 -80 Q-10 -60 -40 -10 Q-80 20 -50 70 M40 -110 Q90 -40 50 10 Q30 60 80 90" fill="none" stroke="#90be6d" strokeWidth={34} strokeLinecap="round" /><ellipse rx={130} ry={45} fill="none" stroke={K.ink} strokeWidth={5} /></>);
    case "sun":
      return g(<><g transform={`rotate(${frame * 1.5})`}>{Array.from({ length: 12 }, (_, i) => <rect key={i} x={-10} y={-190} width={20} height={50} rx={10} fill={K.gold} transform={`rotate(${i * 30})`} />)}</g><circle r={115} fill="#ff9f1c" {...st} /></>);
    case "heart":
      return g(<><path d="M0 120 C-170 0 -120 -140 0 -60 C120 -140 170 0 0 120 Z" fill={K.red} {...st} /><path d="M0 -60 L-20 0 L20 30 L-5 110" fill="none" stroke={K.ink} strokeWidth={10} /></>);
    case "people":
      return g(<>{[-110, -35, 40, 115].map((x, i) => <g key={i} transform={`translate(${x} ${Math.sin(frame / 5 + i) * 8})`}><circle cy={-60} r={30} fill={["#ffb4a2", "#e5989b", "#b5838d", "#ffcdb2"][i]} {...st} /><rect x={-34} y={-30} width={68} height={120} rx={26} fill={[K.cyan, K.mag, K.lime, K.gold][i]} {...st} /></g>)}</>);
    default:
      return null;
  }
};
const iconFor = (txt: string) =>
  /কয়েন/.test(txt) ? "coins" : /ফোনটা|মিসড/.test(txt) ? "nokia" : /বাড়ি|নীড়/.test(txt) ? "house" : /সিডির|অ্যালবাম|সন্ধ্যান/.test(txt) ? "cd" : /কালিতে/.test(txt) ? "pen"
  : /স্কুলের|ভিড়/.test(txt) ? (/ভিড়/.test(txt) ? "people" : "bat") : /অনলাইনে/.test(txt) ? "wifi" : /ছবি|মুখগুলো/.test(txt) ? "photo" : /কষ্ট/.test(txt) ? "heart"
  : /পৃথিবী|দূরত্ব/.test(txt) ? "globe" : /বিকেল|পর!/.test(txt) ? "sun" : "";

// ------------------------------------------------------------------ the lyric engine
type Variant = "neon" | "gold" | "vhs" | "drop" | "split" | "rain" | "chat" | "ui";
const lineSize = (txt: string, v: Variant) => {
  const n = txt.length;
  const base = v === "split" ? 1500 : v === "chat" ? 1500 : 2900;
  return Math.max(v === "split" ? 84 : 80, Math.min(v === "drop" ? 260 : 180, base / Math.max(4, n * 0.62)));
};

const Lyric: React.FC<{ l: SLLine; v: Variant; nextStart: number }> = ({ l, v, nextStart }) => {
  const { t, fps, frame, bass } = useX();
  const hold = Math.min(nextStart, l.end + 0.7);
  const out = interpolate(t, [hold - 0.18, hold], [0, 1], cl);
  const ws = wordTimes(l);
  const fs = lineSize(l.text, v);
  const accent = v === "gold" ? K.gold : v === "vhs" ? K.gold : v === "rain" ? "#9ad1ff" : v === "drop" ? K.lime : K.mag;
  const base = v === "vhs" ? K.cream : v === "split" ? (l.text.startsWith("আগে") ? "#1e3a8a" : "#ffffff") : "#ffffff";
  const side = v === "split" ? (l.text.startsWith("আগে") ? -1 : l.text.startsWith("এখন") ? 1 : 0) : 0;
  const isQ = l.who === "q";

  const words = ws.map(({ w, at }, k) => {
    const lt = t - at;
    const hot = HOT.test(w);
    const sp = spring({ frame: Math.round(lt * fps), fps, config: v === "rain" ? { damping: 30, stiffness: 60 } : { damping: 11, stiffness: 260, mass: 0.55 } });
    const shown = lt >= -0.02;
    const blur = v === "rain" ? interpolate(lt, [0, 0.35], [10, 0], cl) : interpolate(lt, [0, 0.1], [14, 0], cl);
    const sc = v === "rain" ? 1 : interpolate(sp, [0, 1], [2.1, 1]) * (hot ? 1.12 : 1);
    const ty = v === "rain" ? (1 - sp) * 40 : (1 - sp) * -30;
    const rot = v === "rain" ? 0 : (1 - sp) * (random(`r${l.start}${k}`) - 0.5) * 30;
    const jitter = hot && v !== "rain" ? Math.sin(frame * 2.3 + k) * 2.5 * (1 + bass) : 0;
    const col = hot ? accent : base;
    const shadow =
      v === "vhs" ? `4px 4px 0 #b5179e, -3px -2px 0 #4cc9f0` :
      v === "split" && side < 0 ? `5px 5px 0 #ffb70388` :
      v === "rain" ? `0 0 24px #4cc9f0aa` :
      hot ? `${4 + jitter}px 0 0 ${K.cyan}cc, ${-4 - jitter}px 0 0 ${K.mag}cc, 0 0 40px ${accent}` : `0 6px 0 #00000088, 0 0 30px #ffffff44`;
    return (
      <span key={k} style={{ display: "inline-block", whiteSpace: "nowrap", opacity: shown ? 1 : v === "neon" || v === "gold" ? 0.12 : 0, color: shown ? col : "transparent",
        WebkitTextStroke: shown ? undefined : `2px ${base}`, transform: `translate(${jitter}px, ${shown ? ty : 0}px) scale(${shown ? sc : 1}) rotate(${shown ? rot : 0}deg)`,
        filter: shown && blur > 0.3 ? `blur(${blur}px)` : undefined, textShadow: shown ? shadow : undefined }}>
        {w}
      </span>
    );
  });

  const box: React.CSSProperties = {
    position: "absolute", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", gap: `0 ${fs * 0.28}px`,
    fontFamily: BN, fontWeight: 800, fontSize: fs, lineHeight: 1.25, textAlign: "center", opacity: 1 - out, filter: out > 0 ? `blur(${out * 16}px)` : undefined,
    transform: `translateY(${-out * 60}px)`,
  };
  if (v === "chat") {
    const sp = spring({ frame: Math.round((t - l.start + 0.1) * fps), fps, config: { damping: 12, stiffness: 200 } });
    return (
      <div style={{ ...box, left: isQ ? 140 : undefined, right: isQ ? undefined : 140, top: isQ ? 300 : 560, maxWidth: 1100, padding: "26px 60px 36px",
        background: isQ ? "#ffffff" : K.cyan, color: K.ink, borderRadius: 60, borderBottomLeftRadius: isQ ? 8 : 60, borderBottomRightRadius: isQ ? 60 : 8,
        transform: `scale(${sp}) translateY(${-out * 60}px)`, transformOrigin: isQ ? "left bottom" : "right bottom", boxShadow: `0 20px 60px #0008` }}>
        <span style={{ fontFamily: BN, fontWeight: 800, fontSize: fs, color: K.ink }}>{l.text}</span>
      </div>
    );
  }
  const pos: React.CSSProperties =
    v === "split" ? (side === 0 ? { left: 260, right: 260, top: 780 } : { left: side < 0 ? 60 : W / 2 + 60, width: W / 2 - 120, top: 520 }) :
    v === "vhs" ? { left: 120, right: 120, top: 640 } :
    v === "ui" ? { left: 80, right: 80, top: 790, background: "#020617dd", borderRadius: 40, padding: "10px 40px 24px" } :
    v === "drop" ? { left: 60, right: 60, top: 380 } :
    { left: 100, right: 100, top: v === "rain" ? 420 : 330 };
  return <div style={{ ...box, ...pos }}>{words}</div>;
};

// ------------------------------------------------------------------ section worlds
const Cold: React.FC = () => {
  // 0 → ~2.6s: teaser slam that stops the scroll, then "searching" boot.
  const { t, frame, beat } = useX();
  const slam = spring({ frame, fps: 30, config: { damping: 9, stiffness: 240 } });
  const teaser = t < 2.6;
  const lvl = teaser ? 4 - interpolate(t, [1.0, 1.5], [0, 4], cl) : Math.floor(t * 3) % 5 === 0 ? 0 : (Math.floor(t * 2) % 4) + 0.2;
  const crack = t > 1.5 && teaser;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, #1a0b3d 0%, ${K.ink} 70%)` }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <Rings cx={W / 2} cy={teaser ? 700 : 600} color={teaser ? K.red : K.cyan} every={teaser ? 0.25 : 0.6} />
        <Bars x={W / 2} y={teaser ? 860 : 700} s={teaser ? 1.6 : 2.2} level={lvl} color={lvl < 1.2 ? K.red : K.cyan} />
        {crack && <g stroke="#ffffffcc" strokeWidth={4} fill="none">
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2 + random(`ca${i}`);
            const r1 = 200 + random(`cr${i}`) * 900;
            return <polyline key={i} points={`${W / 2},${H / 2} ${W / 2 + Math.cos(a) * r1 * 0.4 + 30},${H / 2 + Math.sin(a) * r1 * 0.4} ${W / 2 + Math.cos(a) * r1},${H / 2 + Math.sin(a + 0.1) * r1}`} />;
          })}
        </g>}
      </svg>
      {teaser ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", transform: `scale(${interpolate(slam, [0, 1], [3, 1])})` }}>
          <div style={{ fontFamily: AN, fontSize: 300, color: "#fff", letterSpacing: 10, lineHeight: 0.9, textShadow: `10px 0 0 ${K.cyan}, -10px 0 0 ${K.mag}` }}>SIGNAL</div>
          <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 230, color: K.red, lineHeight: 1, transform: `rotate(-6deg) scale(${t > 1.5 ? 1 : 0})`, textShadow: "0 0 50px #ff2e4d" }}>নাই!</div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 170 }}>
          <div style={{ fontFamily: EN, fontWeight: 900, fontSize: 44, letterSpacing: 18, color: K.cyan, opacity: 0.6 + beat * 0.4 }}>SEARCHING NETWORK{".".repeat(Math.floor(t * 3) % 4)}</div>
          <div style={{ fontFamily: BN, fontWeight: 700, fontSize: 70, color: "#fff", marginTop: 30, opacity: interpolate(t, [3.5, 4.5], [0, 1], cl) }}>Rapar Rubel</div>
          <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 30, letterSpacing: 10, color: "#ffffff99", marginTop: 6, opacity: interpolate(t, [4.5, 5.5], [0, 1], cl) }}>PRESENTS</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const Call: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(135deg, ${K.vio}, ${K.ink})` }}>
    <svg width={W} height={H} style={{ position: "absolute" }}>
      <Rings cx={120} cy={420} color={K.cyan} every={0.5} max={900} />
      <Rings cx={W - 120} cy={700} color={K.mag} every={0.5} max={900} />
    </svg>
  </AbsoluteFill>
);

const Crash: React.FC = () => {
  // "Signal নাই!" hit → bars collapse, glass crack, then title card through the intro.
  const { t, s0, beat, frame } = useX();
  const lt = t - s0;
  const lvl = interpolate(lt, [0, 0.5], [4, 0], cl);
  const flash = interpolate(lt, [0.45, 0.55, 0.9], [0, 1, 0], cl);
  const title = interpolate(lt, [2.2, 2.6], [0, 1], cl);
  const stamp = spring({ frame: Math.round((lt - 3.4) * 30), fps: 30, config: { damping: 8, stiffness: 300 } });
  const slice = Math.floor(frame / 3) % 23 === 0;
  return (
    <AbsoluteFill style={{ background: lt < 2.2 ? K.ink : `radial-gradient(circle at 50% 55%, #3b0a45 0%, ${K.ink} 75%)` }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {lt > 2.2 && <Rings cx={W / 2} cy={H / 2} color={K.mag} every={0.47} />}
        {lt < 2.4 && <Bars x={W / 2} y={540} s={3} level={lvl} color={lvl < 1.5 ? K.red : K.cyan} />}
        {lt > 0.5 && lt < 2.4 && <g stroke="#ffffffdd" strokeWidth={5} fill="none">
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI * 2 + random(`k${i}`) * 0.4;
            const r1 = 300 + random(`kr${i}`) * 900;
            return <polyline key={i} points={`${W / 2},${430} ${W / 2 + Math.cos(a) * r1 * 0.35},${430 + Math.sin(a) * r1 * 0.35 + 20} ${W / 2 + Math.cos(a + 0.08) * r1},${430 + Math.sin(a) * r1}`} />;
          })}
        </g>}
      </svg>
      {title > 0 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", opacity: title, transform: `scale(${1 + beat * 0.03}) translateX(${slice ? 30 : 0}px)` }}>
          <div style={{ fontFamily: AN, fontSize: 380, color: "transparent", WebkitTextStroke: "6px #fff", letterSpacing: 16, lineHeight: 0.85, textShadow: `0 0 60px ${K.mag}` }}>SIGNAL</div>
          <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 300, color: K.red, lineHeight: 0.9, marginTop: -40, transform: `rotate(-8deg) scale(${interpolate(stamp, [0, 1], [3, 1])})`, opacity: stamp > 0.01 ? 1 : 0,
            border: `14px solid ${K.red}`, borderRadius: 30, padding: "0 50px 20px", textShadow: "0 0 40px #ff2e4d", boxShadow: "0 0 60px #ff2e4d88" }}>নাই</div>
          <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 36, letterSpacing: 14, color: "#ffffffcc", marginTop: 50, opacity: interpolate(lt, [5, 6], [0, 1], cl) }}>RAPAR RUBEL</div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

const TowerWorld: React.FC<{ gold?: boolean }> = ({ gold }) => {
  const { t, beat, bass, line } = useX();
  const sky = gold ? ["#ff7b00", "#9d0208", "#370617"] : ["#0b0221", "#3a0ca3", "#7209b7"];
  const ring = gold ? K.gold : K.cyan;
  const dl = line && /ডাউনলোড/.test(line.text);
  const off = line && /অফলাইন/.test(line.text);
  const p = line ? interpolate(t, [line.start, line.end], [0, 100], cl) : 0;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${sky[2]} 0%, ${sky[1]} 55%, ${sky[0]} 100%)` }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs><radialGradient id="sun"><stop offset="0" stopColor={gold ? "#ffe066" : K.mag} /><stop offset="1" stopColor={gold ? "#ff7b00" : "#7209b7"} stopOpacity={0} /></radialGradient></defs>
        <circle cx={W / 2} cy={760} r={520 + bass * 60} fill="url(#sun)" opacity={0.7} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={0} y={600 + i * 22} width={W} height={8 + i} fill={sky[0]} opacity={0.5} />)}
        <Rings cx={W / 2} cy={430} color={ring} every={0.47} max={1500} />
        <Skyline y={1010} seed="far" color={gold ? "#6a040f" : "#1b0a3c"} win={gold ? "#ffd166" : K.mag} scale={0.8} dx={-t * 8} />
        <Tower x={W / 2} y={1010} h={600} color={gold ? "#370617" : "#0b0221"} />
        <Skyline y={1080} seed="near" color={gold ? "#370617" : "#07020f"} win={gold ? K.gold : K.cyan} scale={1} dx={-t * 20} />
        {Array.from({ length: 40 }, (_, i) => {
          const y = (random(`py${i}`) * H - t * (20 + random(`ps${i}`) * 60)) % H;
          return <circle key={`p${i}`} cx={random(`px${i}`) * W} cy={y < 0 ? y + H : y} r={2 + random(`pr${i}`) * 4} fill={ring} opacity={0.5} />;
        })}
      </svg>
      {dl && (
        <div style={{ position: "absolute", left: 460, right: 460, top: 770, height: 64, borderRadius: 40, background: "#00000088", border: `4px solid ${ring}`, overflow: "hidden" }}>
          <div style={{ width: `${p}%`, height: "100%", background: `linear-gradient(90deg, ${ring}, ${K.mag})`, boxShadow: `0 0 30px ${ring}` }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: BN, fontWeight: 800, fontSize: 34, color: "#fff" }}>
            বিকেল.exe ডাউনলোড হচ্ছে… {Math.floor(p)}%
          </div>
        </div>
      )}
      {off && (
        <div style={{ position: "absolute", left: W / 2 - 260, top: 770, width: 520, height: 90, borderRadius: 50, background: "#000a", border: `4px solid #fff`, display: "flex", alignItems: "center", padding: "0 30px", gap: 24 }}>
          <div style={{ width: 120, height: 60, borderRadius: 30, background: p > 30 ? K.lime : "#555", position: "relative" }}>
            <div style={{ position: "absolute", top: 6, left: p > 30 ? 66 : 6, width: 48, height: 48, borderRadius: 24, background: "#fff" }} />
          </div>
          <div style={{ fontFamily: EN, fontWeight: 900, fontSize: 34, color: "#fff", letterSpacing: 3 }}>OFFLINE MODE {p > 30 ? "ON" : "OFF"}</div>
        </div>
      )}
      <AbsoluteFill style={{ background: "#fff", opacity: beat * 0.06 }} />
    </AbsoluteFill>
  );
};

const VHS: React.FC = () => {
  const { t, frame, line } = useX();
  const ic = line ? iconFor(line.text) : "";
  const isp = line ? spring({ frame: Math.round((t - line.start) * 30), fps: 30, config: { damping: 10, stiffness: 160 } }) : 0;
  const band = ((frame * 7) % (H + 200)) - 100;
  const mm = Math.floor(t / 60), ss = Math.floor(t % 60);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #3d2b56 0%, #1a1325 80%)" }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs><radialGradient id="cdg"><stop offset="0" stopColor="#e0e0e0" /><stop offset="0.5" stopColor="#bde0fe" /><stop offset="0.8" stopColor="#ffafcc" /><stop offset="1" stopColor="#cdb4db" /></radialGradient></defs>
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-200 + i * 260 + ((t * 30) % 260)} y={0} width={120} height={H} fill="#ffffff05" />)}
        {ic && <g transform={`translate(${W / 2} ${330}) scale(${isp * 1.25}) rotate(${(1 - isp) * -40})`}><Icon k={ic} /></g>}
        <rect x={0} y={band} width={W} height={26} fill="#ffffff22" />
        <rect x={0} y={band + 34} width={W} height={6} fill="#ffffff18" />
      </svg>
      <div style={{ position: "absolute", left: 70, top: 50, fontFamily: EN, fontWeight: 800, fontSize: 52, color: "#fff", textShadow: "3px 3px 0 #0008", letterSpacing: 4 }}>PLAY ▶</div>
      <div style={{ position: "absolute", right: 70, bottom: 50, fontFamily: EN, fontWeight: 700, fontSize: 40, color: "#fff", textShadow: "3px 3px 0 #0008", letterSpacing: 3 }}>
        JUN 14 2006 &nbsp; 4:{String(30 + mm).padStart(2, "0")}:{String(ss).padStart(2, "0")} PM
      </div>
      <div style={{ position: "absolute", left: 70, bottom: 50, fontFamily: EN, fontWeight: 700, fontSize: 34, color: K.gold, letterSpacing: 3 }}>SP ● তখন</div>
      <Grain n={90} o={0.35} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #ff9f1c18, #f7258518)", mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

const Drop: React.FC = () => {
  const { t, frame, beat, bass, onset, line, bi } = useX();
  const strobe = line && /Signal|নাই/.test(line.text);
  const bg = strobe ? (bi % 2 ? K.mag : K.ink) : K.ink;
  const n = 32;
  return (
    <AbsoluteFill style={{ background: bg }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {Array.from({ length: n }, (_, i) => {
          const r = 0.3 + 0.7 * Math.abs(Math.sin(i * 1.7 + t * (3 + (i % 5)))) ;
          const h = (120 + r * 420) * (0.5 + bass * 0.9 + onset * 0.4);
          const c = [K.cyan, K.mag, K.lime, K.gold][i % 4];
          return <rect key={i} x={i * (W / n) + 8} y={H - h} width={W / n - 16} height={h} rx={10} fill={c} opacity={0.85} />;
        })}
        {Array.from({ length: n }, (_, i) => {
          const h = (60 + Math.abs(Math.sin(i * 2.3 + t * 4)) * 200) * (0.4 + bass);
          return <rect key={`t${i}`} x={i * (W / n) + 8} y={0} width={W / n - 16} height={h} rx={10} fill={[K.mag, K.cyan][i % 2]} opacity={0.35} />;
        })}
      </svg>
      {strobe && Math.floor(frame / 2) % 7 === 0 && (
        <AbsoluteFill>{Array.from({ length: 8 }, (_, i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: random(`s${frame}${i}`) * H, height: 20 + random(`sh${frame}${i}`) * 80, background: i % 2 ? K.cyan : K.mag, opacity: 0.6, transform: `translateX(${(random(`sx${frame}${i}`) - 0.5) * 300}px)` }} />)}</AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "#fff", opacity: beat * (strobe ? 0.35 : 0.08) }} />
    </AbsoluteFill>
  );
};

const Split: React.FC = () => {
  const { t, beat, line, frame } = useX();
  const side = line ? (line.text.startsWith("আগে") ? -1 : line.text.startsWith("এখন") ? 1 : 0) : 0;
  const mid = W / 2 + Math.sin(frame / 4) * 6 * beat;
  const ic = (() => {
    const s = line?.text ?? "";
    return /রিংটোন/.test(s) ? "nokia" : /স্ক্রল/.test(s) ? "wifi" : /মাঠের/.test(s) ? "bat" : /মিসড/.test(s) ? "nokia" : /পেনড্রাইভ/.test(s) ? "cd" : /ক্লাউডে/.test(s) ? "wifi" : /হাসি/.test(s) ? "people" : /স্মাইল/.test(s) ? "heart" : "";
  })();
  const isp = line ? spring({ frame: Math.round((t - line.start) * 30), fps: 30, config: { damping: 9, stiffness: 220 } }) : 0;
  const center = side === 0;
  return (
    <AbsoluteFill style={{ background: K.ink }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: mid, height: H, background: `linear-gradient(160deg, ${K.cream}, #e9c46a)`, opacity: center ? 0.25 : side < 0 ? 1 : 0.35 }} />
      <div style={{ position: "absolute", left: mid, top: 0, right: 0, height: H, background: `linear-gradient(200deg, #1b0a3c, ${K.ink})`, opacity: center ? 0.4 : side > 0 ? 1 : 0.4 }} />
      <div style={{ position: "absolute", left: mid - 6, top: 0, width: 12, height: H, background: K.mag, boxShadow: `0 0 40px ${K.mag}` }} />
      <div style={{ position: "absolute", left: 0, width: mid, top: 60, textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 120, color: "#1e3a8a", opacity: side < 0 ? 1 : 0.4 }}>আগে</div>
      <div style={{ position: "absolute", left: mid, right: 0, top: 60, textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 120, color: K.cyan, opacity: side > 0 ? 1 : 0.4, textShadow: `0 0 30px ${K.cyan}` }}>এখন</div>
      {ic && <svg width={W} height={H} style={{ position: "absolute" }}><g transform={`translate(${center ? W / 2 : side < 0 ? mid / 2 : mid + (W - mid) / 2} ${center ? 470 : 360}) scale(${isp})`}><Icon k={ic} s={0.9} /></g></svg>}
      {center && <AbsoluteFill style={{ background: "#07060fcc" }} />}
    </AbsoluteFill>
  );
};

const NAMES = ["রাফি", "তুতুল", "সজীব", "মিতু", "আকাশ", "নাদিয়া", "রনি", "জনি ভাই", "শুভ", "লিমা", "ইমন", "বাবু", "রাজু", "সুমি", "তানভীর", "পিংকি"];
const Contacts: React.FC = () => {
  const { t, line } = useX();
  const cal = line && /কাল|পরে/.test(line.text);
  const call = line && /কই ছিলি|বলবে|নম্বরটাতে|ফোন দিলে/.test(line.text);
  const scroll = (t * 380) % (NAMES.length * 110);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0f172a, #020617)" }}>
      <div style={{ position: "absolute", left: 120, top: 0, width: 760, height: H, overflow: "hidden", opacity: 0.9 }}>
        {[...NAMES, ...NAMES, ...NAMES].map((n, i) => (
          <div key={i} style={{ position: "absolute", top: i * 110 - scroll, left: 0, right: 0, height: 96, display: "flex", alignItems: "center", gap: 30, borderBottom: "2px solid #ffffff14" }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: [K.cyan, K.mag, K.lime, K.gold][i % 4], display: "flex", justifyContent: "center", alignItems: "center", fontFamily: BN, fontWeight: 800, fontSize: 36, color: K.ink }}>{n[0]}</div>
            <div style={{ fontFamily: BN, fontWeight: 700, fontSize: 46, color: "#fff" }}>{n}</div>
            <div style={{ marginLeft: "auto", fontFamily: EN, fontWeight: 600, fontSize: 30, color: "#ffffff66" }}>017{String(10000000 + Math.floor(random(`n${i % 16}`) * 89999999)).slice(0, 8)}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", right: 140, top: 120, fontFamily: EN, fontWeight: 900, fontSize: 64, color: K.cyan, letterSpacing: 6 }}>1,284 CONTACTS</div>
      <div style={{ position: "absolute", right: 140, top: 210, fontFamily: BN, fontWeight: 700, fontSize: 48, color: "#ffffff99" }}>কাকে দেব কল?</div>
      {cal && (
        <div style={{ position: "absolute", right: 260, top: 300, width: 420, height: 420, background: "#fff", borderRadius: 30, overflow: "hidden", transform: `rotate(${Math.sin(t * 8) * 3}deg)` }}>
          <div style={{ background: K.red, height: 110, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: BN, fontWeight: 800, fontSize: 60, color: "#fff" }}>পরে</div>
          <div style={{ fontFamily: AN, fontSize: 220, textAlign: "center", color: K.ink }}>{20 + Math.floor(t * 6) % 10}</div>
        </div>
      )}
      {call && (
        <div style={{ position: "absolute", right: 200, top: 300, width: 520, height: 460, borderRadius: 50, background: "linear-gradient(180deg, #14532d, #052e16)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, boxShadow: `0 0 0 ${10 + Math.sin(t * 12) * 8}px #22c55e55` }}>
          <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 34, color: "#86efac", letterSpacing: 6 }}>CALLING…</div>
          <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 64, color: "#fff" }}>পুরোনো নম্বর</div>
          <div style={{ width: 120, height: 120, borderRadius: 60, background: "#22c55e", transform: `rotate(${Math.sin(t * 20) * 15}deg)`, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: EN, fontWeight: 900, fontSize: 40, color: "#fff" }}>CALL</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

const Rain: React.FC = () => {
  const { t, line } = useX();
  const warm = line && /বিকেল|বৃষ্টির|গান/.test(line.text) ? 1 : 0;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #020c1b, #0a2a4a)` }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 95%, #ff9f1c 0%, #ff9f1c00 55%)", opacity: 0.25 + warm * 0.5 }} />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {Array.from({ length: 140 }, (_, i) => {
          const sp = 900 + random(`rs${i}`) * 700;
          const y = ((random(`ry${i}`) * H + t * sp) % (H + 200)) - 100;
          const x = random(`rx${i}`) * W + y * 0.12;
          return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 50 + random(`rl${i}`) * 40} stroke="#9ad1ff" strokeWidth={2 + random(`rw${i}`) * 2} opacity={0.35} />;
        })}
        {Array.from({ length: 26 }, (_, i) => (
          <circle key={`d${i}`} cx={random(`dx${i}`) * W} cy={((random(`dy${i}`) * H + t * 20 * random(`dv${i}`)) % H)} r={8 + random(`dr${i}`) * 16} fill="#ffffff10" stroke="#ffffff44" strokeWidth={2} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const Reconnect: React.FC = () => {
  const { t, s0, s1, beat } = useX();
  const lvl = interpolate(t, [s0 + 3, s1 - 1], [0, 4], cl);
  const inst = !useX().line;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 60%, #0b3d2e 0%, ${K.ink} 75%)` }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <Rings cx={W / 2} cy={560} color={K.lime} every={0.47} />
        <Bars x={W / 2} y={inst ? 640 : 1000} s={inst ? 3 : 1.4} level={lvl} color={lvl >= 3.99 ? K.gold : K.lime} />
      </svg>
      {inst && (
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 140 }}>
          <div style={{ fontFamily: EN, fontWeight: 900, fontSize: 60, letterSpacing: 16, color: K.lime, opacity: 0.7 + beat * 0.3 }}>RECONNECTING{".".repeat(Math.floor(t * 3) % 4)}</div>
          <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 90, color: "#fff", marginTop: 20 }}>মানুষের সঙ্গে</div>
          <div style={{ fontFamily: AN, fontSize: 120, color: K.gold, marginTop: 470 }}>{Math.min(100, Math.floor((lvl / 4) * 100))}%</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ credits: SLProps["credits"]; finalAt: number; endAt: number }> = ({ credits, finalAt, endAt }) => {
  const { t, frame, beat } = useX();
  const m = interpolate(t, [finalAt, finalAt + 1.4], [0, 1], cl); // bars → people
  const end = interpolate(t, [endAt, endAt + 0.8], [0, 1], cl);
  const cols = [K.cyan, K.mag, K.lime, K.gold];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 65%, ${m > 0.5 ? "#5a189a" : "#1a0b3d"} 0%, ${K.ink} 75%)` }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <Rings cx={W / 2} cy={700} color={m > 0.5 ? K.gold : K.cyan} every={0.47} />
        <g transform={`translate(${W / 2} ${930 + end * 110}) scale(${2.4 - end * 0.9})`}>
          {[0, 1, 2, 3].map((i) => {
            const h = 40 + i * 40;
            const hh = interpolate(m, [0, 1], [h, 120]);
            const x = i * 46 - 92 + 17;
            const bob = m > 0.9 ? Math.sin(frame / 5 + i * 1.3) * 6 * (1 + beat) : 0;
            return (
              <g key={i} transform={`translate(${x * (1 + m * 0.5)} ${bob})`}>
                <rect x={-17 - m * 6} y={-hh} width={34 + m * 12} height={hh} rx={8 + m * 14} fill={cols[i]} style={{ filter: `drop-shadow(0 0 12px ${cols[i]})` }} />
                <circle cx={0} cy={-hh - 26} r={22 * m} fill="#ffcdb2" />
                {m > 0.8 && i === 0 && <line x1={14} y1={-hh + 20} x2={38} y2={-hh - 10} stroke={cols[i]} strokeWidth={10} strokeLinecap="round" />}
                {m > 0.8 && i === 3 && <line x1={-14} y1={-hh + 20} x2={-38} y2={-hh - 10} stroke={cols[i]} strokeWidth={10} strokeLinecap="round" />}
              </g>
            );
          })}
        </g>
      </svg>
      {m > 0.6 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: AN, fontSize: 130, letterSpacing: 12, color: K.gold, textShadow: `0 0 40px ${K.gold}`, opacity: interpolate(m, [0.6, 1], [0, 1]) * (1 - end) }}>
          FULL SIGNAL
        </div>
      )}
      {end > 0 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", opacity: end, transform: `translateY(${-90}px)` }}>
          <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 170, color: "#fff", textShadow: `0 0 40px ${K.mag}` }}>Signal নাই</div>
          {credits.map((c, i) => (
            <div key={i} style={{ fontFamily: BN, fontWeight: 600, fontSize: 44, color: "#ffffffdd", marginTop: i ? 6 : 24 }}>
              <span style={{ fontFamily: EN, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: K.cyan }}>{c.role.toUpperCase()}</span> &nbsp; {c.name}
            </div>
          ))}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ HUD + transitions
const HUD: React.FC<{ level: number; color: string }> = ({ level, color }) => {
  const { t } = useX();
  const mm = 4, ss = Math.floor(t / 4) % 60;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 64, display: "flex", alignItems: "center", padding: "0 44px", fontFamily: EN, fontWeight: 800, fontSize: 30, color: "#fff", background: "linear-gradient(180deg, #000a, #0000)" }}>
      <span>{mm}:{String(30 + Math.floor(ss / 2)).padStart(2, "0")} PM</span>
      <span style={{ marginLeft: "auto", marginRight: 16, color: level < 1 ? K.red : color }}>{level < 1 ? "NO SIGNAL" : "Rubel-Net"}</span>
      <svg width={120} height={44}><Bars x={60} y={42} s={0.24} level={level} color={level < 1 ? K.red : color} glow={false} /></svg>
      <div style={{ width: 56, height: 26, border: "3px solid #fff", borderRadius: 6, marginLeft: 14, padding: 2 }}><div style={{ width: `${30 + level * 15}%`, height: "100%", background: level < 1 ? K.red : "#fff", borderRadius: 2 }} /></div>
    </div>
  );
};

const Glitch: React.FC<{ amt: number }> = ({ amt }) => {
  const { frame } = useX();
  if (amt <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: random(`g${frame}${i}`) * H, height: 10 + random(`gh${frame}${i}`) * 90,
          background: [K.cyan, K.mag, "#fff", K.ink][i % 4], opacity: amt * 0.8, transform: `translateX(${(random(`gx${frame}${i}`) - 0.5) * 500 * amt}px)` }} />
      ))}
      <div style={{ position: "absolute", left: 40, bottom: 40, fontFamily: EN, fontWeight: 900, fontSize: 40, color: K.red, opacity: amt, letterSpacing: 6 }}>SIGNAL LOST</div>
    </AbsoluteFill>
  );
};

const VARIANT: Record<string, Variant> = { cold: "neon", call: "chat", crash: "drop", tower: "neon", vhs: "vhs", drop: "drop", split: "split", contacts: "ui", rain: "rain", reconnect: "chat", gold: "gold", outro: "chat" };
const LEVEL: Record<string, number> = { cold: 1, call: 2, crash: 0, tower: 1, vhs: 3, drop: 0, split: 2, contacts: 1, rain: 2, reconnect: 3, gold: 4, outro: 4 };

// ------------------------------------------------------------------ root
export const SignalLost: React.FC<SLProps> = (p) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const i = Math.min(frame, p.bass.length - 1);
  let bi = -1;
  for (let k = 0; k < p.beats.length && p.beats[k] <= t; k++) bi = k;
  const beat = bi >= 0 ? Math.exp(-(t - p.beats[bi]) * 9) : 0;
  const sec = p.sections.find((s) => t >= s[1] && t < s[2]) ?? p.sections[p.sections.length - 1];
  // active line: the one containing t, else the latest started line still within its hold window
  let li = -1;
  for (let k = 0; k < p.lines.length; k++) {
    const l = p.lines[k];
    const nx = p.lines[k + 1]?.start ?? 1e9;
    const hold = Math.min(nx, l.end + 0.7);
    if (t >= l.start - 0.05 && t < hold) li = k;
  }
  const line = li >= 0 ? p.lines[li] : undefined;
  const ctx: Ctx = { t, frame, fps, beat, bi, bass: p.bass[i] ?? 0, onset: p.onset[i] ?? 0, sec: sec[0], s0: sec[1], s1: sec[2], line, li };
  const v = VARIANT[sec[0]] ?? "neon";
  const isDialogue = line?.who !== undefined;
  const lv: Variant = isDialogue ? "chat" : sec[0] === "call" || sec[0] === "reconnect" || sec[0] === "outro" ? (sec[0] === "outro" ? "neon" : "neon") : v;
  // transitions: glitch for 0.2s around each section boundary
  const dB = Math.min(...p.sections.map((s) => Math.abs(t - s[1])));
  const glitch = interpolate(dB, [0, 0.22], [1, 0], cl);
  const punch = 1 + beat * 0.022 + (p.bass[i] ?? 0) * 0.015;
  const shake = sec[0] === "drop" || sec[0] === "crash" ? (random(`sh${frame}`) - 0.5) * 14 * beat : 0;
  const finalLine = p.lines[p.lines.length - 1];
  const W0 = (name: string) => {
    switch (name) {
      case "cold": return <Cold />;
      case "call": return <Call />;
      case "crash": return <Crash />;
      case "tower": return <TowerWorld />;
      case "gold": return <TowerWorld gold />;
      case "vhs": return <VHS />;
      case "drop": return <Drop />;
      case "split": return <Split />;
      case "contacts": return <Contacts />;
      case "rain": return <Rain />;
      case "reconnect": return <Reconnect />;
      default: return <Outro credits={p.credits} finalAt={finalLine.start} endAt={Math.max(finalLine.end + 1.2, p.durationSec - 7)} />;
    }
  };
  const showLyric = line && !(sec[0] === "crash" && t - sec[1] > 2.2 && !/Signal/.test(line.text));
  return (
    <X.Provider value={ctx}>
      <AbsoluteFill style={{ background: K.ink, overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: `scale(${punch}) translate(${shake}px, ${shake * 0.6}px)` }}>
          {W0(sec[0])}
          {showLyric && <Lyric key={li} l={line} v={lv} nextStart={p.lines[li + 1]?.start ?? 1e9} />}
        </AbsoluteFill>
        <HUD level={LEVEL[sec[0]] ?? 2} color={sec[0] === "gold" || sec[0] === "outro" ? K.gold : K.cyan} />
        <Glitch amt={glitch} />
        <AbsoluteFill style={{ background: "radial-gradient(circle, #0000 60%, #000a 100%)", pointerEvents: "none" }} />
        <Audio src={staticFile(p.song)} />
      </AbsoluteFill>
    </X.Provider>
  );
};
