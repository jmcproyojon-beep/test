import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ---------------------------------------------------------------------------
// "ভালো আছি, বাকি আছে!" — kinetic-type lyric video mixing three looks:
//   B (teal night, thin setup + heavy punch, icons)   → spoken parts, pre-choruses, bridge, outro
//   C (warm sky collage, condensed type, stickers)    → verses and the rap
//   A (black/white slams, marquee rows, neon frames)  → choruses and drops
// Works at 1920x1080 and 1080x1920 (layout reads useVideoConfig).
// ---------------------------------------------------------------------------

export type BALine = { start: number; end: number; text: string; icon?: string; who?: "q" | "a" };
export type BASection = { id: string; start: number; end: number; look: "A" | "B" | "Bw" | "C" | "T" | "E" };
export type BAProps = {
  song: string;
  durationSec: number;
  beats: number[];
  bass: number[];
  rms: number[];
  onset: number[];
  lines: BALine[];
  sections: BASection[];
  title: string;
  credits: { role: string; name: string }[];
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const IN = Easing.bezier(0.7, 0, 0.84, 0);
const BN = "'Anek Bangla', 'Noto Sans Bengali', sans-serif";
const THIN = "'Hind Siliguri', 'Noto Sans Bengali', sans-serif";
const EN = "'Montserrat', 'Noto Sans', sans-serif";
const DISP = "'Anton', 'Montserrat', sans-serif";

const C = {
  black: "#000",
  white: "#fff",
  blue: "#0A9CFF",
  grad: ["#ff3cac", "#784ba0", "#2b86c5"],
  teal: "#0d3b3a",
  tealFg: "#4fb3a0",
  cream: "#e8e3d9",
  coral: "#e8735a",
  sky: "#63d3dc",
  sun: "#f6c21c",
  orange: "#f08a24",
  ink: "#1d1b2e",
};

// ------------------------------------------------------------------ fonts
const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const f = (fam: string, file: string, desc: FontFaceDescriptors = {}) => new FontFace(fam, `url(${staticFile("bab/fonts/" + file)})`, desc);
    const faces = [
      f("Anek Bangla", "anek-bangla-bengali-standard-normal.woff2", { weight: "100 800", stretch: "75% 125%", unicodeRange: "U+0951-0952,U+0964-0965,U+0980-09FE,U+200C-200D,U+25CC" }),
      f("Anek Bangla", "anek-bangla-latin-standard-normal.woff2", { weight: "100 800", stretch: "75% 125%" }),
      f("Hind Siliguri", "hind-siliguri-bengali-300-normal.woff2", { weight: "300", unicodeRange: "U+0980-09FE,U+200C-200D" }),
      f("Hind Siliguri", "hind-siliguri-bengali-700-normal.woff2", { weight: "700", unicodeRange: "U+0980-09FE,U+200C-200D" }),
      f("Anton", "anton-latin-400-normal.woff2"),
      f("Montserrat", "montserrat-latin-wght-normal.woff2", { weight: "100 900" }),
    ];
    Promise.all(faces.map((x) => x.load().then((ff) => document.fonts.add(ff))))
      .catch(() => undefined)
      .finally(() => continueRender(h));
  }, [h]);
};

// ------------------------------------------------------------------ shared audio/time context
type Ctx = { frame: number; t: number; fps: number; bass: number; onset: number; beat: number; beatIdx: number; sec: BASection; secT: number; W: number; H: number; wide: boolean; u: number };
const A = createContext<Ctx>(null as unknown as Ctx);
const useA = () => useContext(A);

// ------------------------------------------------------------------ icons (flat, 200x200)
const S = { stroke: C.ink, strokeWidth: 7, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const ICONS: Record<string, React.ReactNode> = {
  phone: (<g {...S}><rect x="62" y="22" width="76" height="156" rx="14" fill="#fff" /><rect x="72" y="40" width="56" height="104" rx="4" fill={C.sky} /><circle cx="100" cy="160" r="6" fill={C.ink} /><path d="M150 60 q16 20 0 40 M164 48 q26 32 0 64 M50 60 q-16 20 0 40 M36 48 q-26 32 0 64" fill="none" /></g>),
  moon: (<g {...S}><path d="M120 30 a70 70 0 1 0 50 110 a56 56 0 1 1 -50 -110z" fill={C.sun} /><path d="M40 40 h26 l-26 26 h26 M70 80 h18 l-18 18 h18" fill="none" strokeWidth="6" /></g>),
  sun: (<g {...S}><circle cx="100" cy="100" r="42" fill={C.sun} />{Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <line key={i} x1={100 + Math.cos(a) * 58} y1={100 + Math.sin(a) * 58} x2={100 + Math.cos(a) * 84} y2={100 + Math.sin(a) * 84} />; })}<path d="M84 104 q16 16 32 0" fill="none" /><circle cx="86" cy="90" r="4" fill={C.ink} /><circle cx="114" cy="90" r="4" fill={C.ink} /></g>),
  tea: (<g {...S}><path d="M44 80 h96 v40 a48 40 0 0 1 -96 0z" fill="#fff" /><path d="M140 92 a20 18 0 1 1 0 34" fill="none" /><ellipse cx="92" cy="164" rx="70" ry="12" fill={C.coral} /><path d="M70 64 q-10 -16 0 -30 M94 64 q-10 -16 0 -30 M118 64 q-10 -16 0 -30" fill="none" strokeWidth="5" /><rect x="50" y="86" width="84" height="12" fill={C.orange} stroke="none" /></g>),
  calendar: (<g {...S}><rect x="30" y="40" width="140" height="130" rx="10" fill="#fff" /><rect x="30" y="40" width="140" height="34" rx="10" fill={C.coral} /><line x1="64" y1="26" x2="64" y2="52" /><line x1="136" y1="26" x2="136" y2="52" />{[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={46 + c * 30} y={88 + r * 26} width="18" height="14" fill={r === 1 && c === 2 ? C.coral : "#ddd"} stroke="none" />))}<path d="M120 116 l14 14 l22 -30" stroke={C.ink} fill="none" /></g>),
  pocket: (<g {...S}><path d="M40 40 h120 v70 q0 60 -60 60 q-60 0 -60 -60z" fill="#3b6fb6" /><path d="M40 40 q60 50 120 0" fill="#2c5590" /><path d="M70 130 q30 18 60 0" fill="none" stroke="#fff" strokeDasharray="8 8" /><circle cx="160" cy="166" r="14" fill={C.sun} /><path d="M120 176 q14 10 26 0" fill="none" strokeWidth="4" /></g>),
  bulb: (<g {...S}><path d="M100 26 a52 52 0 0 1 30 94 v20 h-60 v-20 a52 52 0 0 1 30 -94z" fill={C.sun} /><rect x="72" y="140" width="56" height="26" rx="6" fill="#bbb" /><path d="M86 120 l14 -30 l14 30" fill="none" /><path d="M30 60 l-14 -8 M170 60 l14 -8 M24 104 h-14 M176 104 h14" /></g>),
  mask: (<g {...S}><circle cx="100" cy="100" r="70" fill={C.sun} /><path d="M66 112 q34 34 68 0" fill="#fff" /><path d="M70 82 q10 -10 20 0 M110 82 q10 -10 20 0" fill="none" /><path d="M128 96 q6 14 0 22 q-6 -8 0 -22z" fill={C.sky} strokeWidth="4" /></g>),
  heartbreak: (<g {...S}><path d="M100 170 l-62 -62 a36 36 0 0 1 62 -50 a36 36 0 0 1 62 50z" fill={C.coral} /><path d="M100 58 l-12 34 l22 14 l-14 34" fill="none" stroke="#fff" strokeWidth="8" /></g>),
  bag: (<g {...S}><path d="M40 70 h120 l-10 100 h-100z" fill="#c98b4a" /><path d="M70 70 v-14 a30 30 0 0 1 60 0 v14" fill="none" /><path d="M70 66 l-8 -40 l14 0 z" fill="#6c3" /><circle cx="122" cy="52" r="16" fill={C.coral} /><path d="M88 60 q12 -40 30 -36" fill="none" stroke="#3a3" /></g>),
  car: (<g {...S}><path d="M24 120 l18 -40 h90 l24 40 h22 v34 h-154z" fill={C.coral} /><rect x="54" y="88" width="34" height="26" fill="#cfefff" /><rect x="96" y="88" width="34" height="26" fill="#cfefff" /><circle cx="56" cy="156" r="16" fill={C.ink} /><circle cx="146" cy="156" r="16" fill={C.ink} /><path d="M150 40 h30 M156 56 h24 M140 24 h40" stroke={C.ink} /></g>),
  speech: (<g {...S}><path d="M26 40 h148 v96 h-80 l-36 32 v-32 h-32z" fill="#fff" /><text x="100" y="114" textAnchor="middle" fontSize="70" fontFamily={EN} fontWeight={900} fill={C.coral} stroke="none">?</text></g>),
  thumbs: (<g {...S}><rect x="30" y="92" width="36" height="78" rx="6" fill={C.sky} /><path d="M66 96 l30 -60 q18 0 16 22 l-6 30 h50 q16 2 12 20 l-14 50 q-4 12 -16 12 h-72z" fill={C.sun} /></g>),
  heart: (<g {...S}><path d="M100 170 l-62 -62 a36 36 0 0 1 62 -50 a36 36 0 0 1 62 50z" fill={C.coral} /><path d="M60 92 a18 18 0 0 1 22 -18" fill="none" stroke="#fff" strokeWidth="6" /></g>),
  laptop: (<g {...S}><rect x="40" y="50" width="120" height="80" rx="6" fill="#444" /><rect x="50" y="60" width="100" height="60" fill={C.sky} /><path d="M20 140 h160 l-12 20 h-136z" fill="#bbb" /><path d="M64 78 h40 M64 94 h60 M64 108 h30" stroke="#fff" strokeWidth="5" /></g>),
  clock: (<g {...S}><circle cx="100" cy="104" r="68" fill="#fff" /><circle cx="48" cy="40" r="18" fill={C.coral} /><circle cx="152" cy="40" r="18" fill={C.coral} /><line x1="100" y1="104" x2="100" y2="60" /><line x1="100" y1="104" x2="132" y2="116" /><circle cx="100" cy="104" r="6" fill={C.ink} /></g>),
  pause: (<g {...S}><circle cx="100" cy="100" r="70" fill={C.tealFg} /><rect x="72" y="64" width="18" height="72" rx="4" fill="#fff" /><rect x="110" y="64" width="18" height="72" rx="4" fill="#fff" /></g>),
  coin: (<g {...S}><ellipse cx="100" cy="132" rx="70" ry="22" fill="#d9a400" /><ellipse cx="100" cy="112" rx="70" ry="22" fill={C.sun} /><ellipse cx="100" cy="80" rx="54" ry="54" fill={C.sun} /><text x="100" y="104" textAnchor="middle" fontSize="70" fontFamily={BN} fontWeight={800} fill={C.ink} stroke="none">৳</text></g>),
  dice: (<g {...S}><rect x="34" y="50" width="96" height="96" rx="16" fill="#fff" transform="rotate(-12 82 98)" /><rect x="96" y="76" width="74" height="74" rx="12" fill={C.coral} transform="rotate(14 133 113)" /><circle cx="62" cy="80" r="8" fill={C.ink} stroke="none" /><circle cx="86" cy="104" r="8" fill={C.ink} stroke="none" /><circle cx="108" cy="128" r="8" fill={C.ink} stroke="none" /><circle cx="134" cy="112" r="7" fill="#fff" stroke="none" /></g>),
  receipt: (<g {...S}><path d="M50 24 h100 v150 l-12 -10 l-12 10 l-12 -10 l-14 10 l-12 -10 l-12 10 l-14 -10 l-12 10z" fill="#fff" /><path d="M66 56 h68 M66 80 h50 M66 104 h68 M66 128 h40" /><text x="134" y="150" textAnchor="middle" fontSize="40" fontFamily={BN} fontWeight={800} fill={C.coral} stroke="none">৳</text></g>),
  bkash: (<g {...S}><rect x="58" y="20" width="84" height="160" rx="14" fill="#fff" /><rect x="68" y="38" width="64" height="110" rx="4" fill="#e2136e" /><text x="100" y="112" textAnchor="middle" fontSize="60" fontFamily={BN} fontWeight={800} fill="#fff" stroke="none">৳</text><path d="M150 40 v30 M135 55 h30" stroke="#2a2" strokeWidth="9" /></g>),
  mail: (<g {...S}><rect x="26" y="52" width="148" height="100" rx="8" fill="#fff" /><path d="M26 56 l74 56 l74 -56" fill="none" /><circle cx="168" cy="52" r="22" fill={C.coral} /><text x="168" y="64" textAnchor="middle" fontSize="32" fontFamily={EN} fontWeight={900} fill="#fff" stroke="none">!</text></g>),
  crown: (<g {...S}><path d="M30 150 l-6 -90 l44 40 l32 -60 l32 60 l44 -40 l-6 90z" fill={C.sun} /><circle cx="100" cy="124" r="10" fill={C.coral} /><rect x="30" y="150" width="140" height="20" fill={C.orange} /></g>),
  hearts: (<g {...S}><rect x="58" y="20" width="84" height="160" rx="14" fill="#fff" /><rect x="68" y="38" width="64" height="110" rx="4" fill="#222" /><path d="M100 110 l-18 -18 a10 10 0 0 1 18 -14 a10 10 0 0 1 18 14z" fill={C.coral} stroke="none" /><path d="M150 50 l-8 -8 a5 5 0 0 1 8 -6 a5 5 0 0 1 8 6z M44 80 l-8 -8 a5 5 0 0 1 8 -6 a5 5 0 0 1 8 6z" fill={C.coral} strokeWidth="3" /></g>),
  game: (<g {...S}><path d="M40 70 h120 q30 0 30 50 q0 40 -24 40 q-16 0 -30 -24 h-72 q-14 24 -30 24 q-24 0 -24 -40 q0 -50 30 -50z" fill="#555" /><path d="M58 102 h30 M73 88 v30" stroke="#fff" /><circle cx="134" cy="96" r="8" fill={C.coral} stroke="none" /><circle cx="150" cy="114" r="8" fill={C.sky} stroke="none" /></g>),
  timer: (<g {...S}><circle cx="100" cy="112" r="64" fill="#fff" /><rect x="88" y="28" width="24" height="18" fill={C.coral} /><text x="100" y="138" textAnchor="middle" fontSize="70" fontFamily={EN} fontWeight={900} fill={C.ink} stroke="none">5′</text></g>),
  hourglass: (<g {...S}><path d="M56 30 h88 M56 170 h88 M64 30 q0 50 36 70 q-36 20 -36 70 M136 30 q0 50 -36 70 q36 20 36 70" fill="#fff" /><path d="M76 54 h48 q-6 26 -24 38 q-18 -12 -24 -38z M80 160 q20 -30 40 0z" fill={C.sun} stroke="none" /></g>),
  rice: (<g {...S}><path d="M30 96 h140 a70 60 0 0 1 -140 0z" fill="#fff" /><path d="M44 96 q56 -50 112 0" fill="#f4f1e6" /><path d="M78 60 q-10 -14 0 -28 M104 60 q-10 -14 0 -28" fill="none" strokeWidth="5" /><rect x="40" y="120" width="120" height="12" fill={C.sky} stroke="none" /></g>),
  microwave: (<g {...S}><rect x="20" y="46" width="160" height="110" rx="10" fill="#ddd" /><rect x="34" y="60" width="100" height="82" rx="6" fill={C.sun} opacity="0.9" /><rect x="146" y="64" width="22" height="14" fill={C.ink} /><circle cx="157" cy="104" r="7" fill={C.ink} /><circle cx="157" cy="128" r="7" fill={C.ink} /><path d="M60 120 q24 -20 48 0" fill="none" stroke={C.coral} /></g>),
  star: (<g {...S}><path d="M100 22 l22 48 l52 6 l-38 36 l10 52 l-46 -26 l-46 26 l10 -52 l-38 -36 l52 -6z" fill={C.sun} /></g>),
  chat: (<g {...S}><path d="M20 40 h100 v60 h-50 l-24 22 v-22 h-26z" fill="#fff" /><path d="M80 90 h100 v60 h-26 v22 l-24 -22 h-50z" fill={C.sky} /><path d="M40 62 h60 M40 80 h40 M100 112 h60 M100 130 h40" strokeWidth="5" /></g>),
  crowd: (<g {...S}>{Array.from({ length: 7 }, (_, i) => (<g key={i}><circle cx={30 + i * 24} cy={i === 3 ? 70 : 96} r={14} fill={i === 3 ? C.coral : "#999"} /><path d={`M${14 + i * 24} ${i === 3 ? 120 : 150} q16 -40 32 0`} fill={i === 3 ? C.coral : "#999"} /></g>))}</g>),
  kid: (<g {...S}><circle cx="86" cy="80" r="26" fill={C.sun} /><path d="M60 170 v-30 q26 -40 52 0 v30" fill={C.sky} /><line x1="116" y1="120" x2="146" y2="70" /><ellipse cx="152" cy="48" rx="22" ry="28" fill={C.coral} /></g>),
  umbrella: (<g {...S}><path d="M20 100 a80 70 0 0 1 160 0z" fill={C.coral} /><path d="M60 100 a40 60 0 0 1 80 0" fill={C.sun} /><line x1="100" y1="100" x2="100" y2="170" /><path d="M20 172 q40 -14 80 0 q40 14 80 0" fill="none" stroke={C.sky} /></g>),
  phoneoff: (<g {...S}><rect x="62" y="22" width="76" height="156" rx="14" fill="#fff" /><rect x="72" y="40" width="56" height="104" rx="4" fill="#333" /><path d="M40 40 l120 120" stroke={C.coral} strokeWidth="14" /></g>),
  home: (<g {...S}><path d="M28 96 l72 -62 l72 62" fill="none" /><path d="M48 90 v80 h104 v-80" fill={C.sun} /><rect x="86" y="120" width="28" height="50" fill={C.coral} /></g>),
  sunset: (<g {...S}><path d="M40 130 a60 60 0 0 1 120 0z" fill={C.orange} /><line x1="10" y1="132" x2="190" y2="132" /><path d="M30 152 h140 M56 170 h88" stroke={C.sky} />{[-60, -30, 0, 30, 60].map((a) => <line key={a} x1={100 + Math.sin((a * Math.PI) / 180) * 74} y1={130 - Math.cos((a * Math.PI) / 180) * 74} x2={100 + Math.sin((a * Math.PI) / 180) * 94} y2={130 - Math.cos((a * Math.PI) / 180) * 94} />)}</g>),
  pencil: (<g {...S}><path d="M40 150 l20 -50 l90 -90 l30 30 l-90 90z" fill={C.sun} /><path d="M40 150 l20 -50 l30 30z" fill="#f4d9b0" /><path d="M150 10 l30 30" stroke={C.coral} strokeWidth="14" /></g>),
  trophy: (<g {...S}><path d="M60 30 h80 v40 a40 40 0 0 1 -80 0z" fill={C.sun} /><path d="M60 44 h-24 q0 36 28 40 M140 44 h24 q0 36 -28 40" fill="none" /><rect x="90" y="110" width="20" height="30" fill={C.sun} /><rect x="64" y="140" width="72" height="24" fill={C.orange} /></g>),
  sprout: (<g {...S}><path d="M40 170 h120" /><path d="M100 170 v-70" /><path d="M100 110 q-50 0 -56 -46 q50 0 56 46z" fill="#6c3" /><path d="M100 96 q44 0 52 -42 q-46 0 -52 42z" fill="#8d4" /></g>),
  snap: (<g {...S}>{Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return <line key={i} x1={100 + Math.cos(a) * 30} y1={100 + Math.sin(a) * 30} x2={100 + Math.cos(a) * 80} y2={100 + Math.sin(a) * 80} stroke={i % 2 ? C.sun : C.coral} strokeWidth="12" />; })}<circle cx="100" cy="100" r="20" fill="#fff" /></g>),
  question: (<g {...S}><circle cx="100" cy="100" r="70" fill="#fff" /><text x="100" y="128" textAnchor="middle" fontSize="90" fontFamily={EN} fontWeight={900} fill={C.coral} stroke="none">?</text></g>),
};
const Icon: React.FC<{ name: string; size: number }> = ({ name, size }) => (
  <svg viewBox="0 0 200 200" width={size} height={size} style={{ overflow: "visible" }}>{ICONS[name] ?? ICONS.star}</svg>
);

// ------------------------------------------------------------------ helpers
const wordTimes = (l: BALine) => {
  const words = l.text.split(/\s+/).filter(Boolean);
  const total = words.reduce((s, w) => s + w.length, 0);
  const span = Math.max(0.3, (l.end - l.start) * 0.8);
  let acc = 0;
  return words.map((w) => {
    const at = l.start + (acc / total) * span;
    acc += w.length;
    return { w, at };
  });
};
const activeLine = (lines: BALine[], t: number, pre = 0.15, post = 0.25) => {
  let best: BALine | undefined;
  for (const l of lines) if (t >= l.start && t < l.end) best = l;
  if (best) return best;
  for (const l of lines) if (t >= l.start - pre && t <= l.end + post) best = l;
  return best;
};

// ------------------------------------------------------------------ backgrounds
const Stars: React.FC<{ n: number; color: string }> = ({ n, color }) => {
  const { frame, W, H } = useA();
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: n }, (_, i) => {
        const x = (random(`x${i}`) * W + frame * (0.2 + random(`s${i}`) * 0.6)) % W;
        const y = (random(`y${i}`) * H - frame * 0.15 * random(`v${i}`) + H) % H;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(frame / (12 + random(`t${i}`) * 30) + i));
        return <circle key={i} cx={x} cy={y} r={1 + random(`r${i}`) * 2.6} fill={color} opacity={tw} />;
      })}
    </svg>
  );
};

const TealBG: React.FC<{ warm?: boolean }> = ({ warm }) => {
  const { frame, bass } = useA();
  const g = warm
    ? `radial-gradient(circle at 50% ${60 + 4 * Math.sin(frame / 50)}%, #f4a261 0%, #b5546b 34%, #2a2045 75%)`
    : `radial-gradient(circle at 50% ${46 + 4 * Math.sin(frame / 60)}%, #145c58 0%, ${C.teal} 40%, #071f1e 85%)`;
  return (
    <AbsoluteFill style={{ background: g }}>
      <Stars n={110} color={warm ? "#ffe8c2" : "#bfeee4"} />
      <AbsoluteFill style={{ background: `radial-gradient(circle, rgba(255,255,255,${0.05 + bass * 0.08}) 0%, transparent 60%)` }} />
    </AbsoluteFill>
  );
};

const Cloud: React.FC<{ x: number; y: number; s: number; o?: number }> = ({ x, y, s, o = 1 }) => (
  <svg viewBox="0 0 300 140" width={300 * s} height={140 * s} style={{ position: "absolute", left: x, top: y, opacity: o, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.08))" }}>
    <path d="M40 120 a40 40 0 0 1 10 -78 a56 56 0 0 1 100 -20 a50 50 0 0 1 90 28 a36 36 0 0 1 20 70z" fill="#fff" />
  </svg>
);

const SkyBG: React.FC<{ fast?: boolean }> = ({ fast }) => {
  const { frame, W, H, bass, u } = useA();
  const rot = frame * (fast ? 0.6 : 0.25);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #7fe0e6 0%, ${C.sky} 55%, #f7d98b 100%)` }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <g transform={`translate(${W / 2} ${H * 0.62}) rotate(${rot})`}>
          {Array.from({ length: 18 }, (_, i) => (
            <path key={i} d={`M0 0 L${Math.cos((i / 18) * Math.PI * 2) * W * 1.4} ${Math.sin((i / 18) * Math.PI * 2) * W * 1.4} L${Math.cos(((i + 0.5) / 18) * Math.PI * 2) * W * 1.4} ${Math.sin(((i + 0.5) / 18) * Math.PI * 2) * W * 1.4}z`} fill="#fff" opacity={0.12} />
          ))}
        </g>
        <circle cx={W / 2} cy={H * 0.62} r={(150 + bass * 30) * u} fill={C.sun} />
        <circle cx={W / 2} cy={H * 0.62} r={(190 + bass * 40) * u} fill={C.sun} opacity={0.25} />
      </svg>
      {/* back clouds drift slow (parallax 0.2x) */}
      {[0, 1, 2].map((i) => (
        <Cloud key={i} x={((random(`bc${i}`) * W + frame * 0.6 * (i + 1)) % (W + 400)) - 300} y={H * (0.06 + i * 0.12)} s={u * (0.8 + i * 0.3)} o={0.75} />
      ))}
      {/* flat-lay paper texture strip at the bottom */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H * 0.16, background: "#f3c76b", borderTop: `${6 * u}px solid ${C.orange}` }} />
    </AbsoluteFill>
  );
};

const FrontClouds: React.FC = () => {
  const { frame, W, H, u } = useA();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {[0, 1].map((i) => (
        <Cloud key={i} x={W - (((frame * 2.2 * (i + 1) + random(`fc${i}`) * W) % (W + 700)))} y={H * (0.74 + i * 0.06)} s={u * (1.5 + i * 0.4)} />
      ))}
    </AbsoluteFill>
  );
};

const MARQ = "ভালো আছি • বাকি আছে • ";
const Marquee: React.FC<{ fg: string; dim?: number }> = ({ fg, dim = 1 }) => {
  const { frame, H, u, bass } = useA();
  const rows = 6;
  const rh = H / rows;
  return (
    <AbsoluteFill style={{ transform: "skewY(-6deg) scale(1.2)", opacity: dim }}>
      {Array.from({ length: rows }, (_, r) => {
        const dir = r % 2 ? 1 : -1;
        const outline = r % 2 === 0;
        const x = ((frame * (3 + r) * dir) % (1400 * u)) - 1400 * u;
        return (
          <div key={r} style={{ position: "absolute", top: r * rh, left: 0, whiteSpace: "nowrap", transform: `translateX(${x}px)`,
            fontFamily: BN, fontWeight: 800, fontStretch: "80%", fontSize: rh * 0.82, lineHeight: `${rh}px`,
            color: outline ? "transparent" : fg, WebkitTextStroke: outline ? `${2.5 * u}px ${fg}` : undefined, opacity: outline ? 0.7 : 0.18 + bass * 0.15 }}>
            {MARQ.repeat(6)}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const NeonFrames: React.FC = () => {
  const { frame, W, H, beat } = useA();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {[0, 1, 2, 3].map((i) => {
        const z = ((frame / 40 + i / 4) % 1);
        const s = 0.2 + z * 1.3;
        return (
          <div key={i} style={{ position: "absolute", width: W * 0.6, height: H * 0.6, borderRadius: 24, transform: `scale(${s}) rotate(${(i - 1.5) * 4}deg)`,
            border: `${6 + beat * 6}px solid transparent`, opacity: (1 - z) * 0.9,
            background: `linear-gradient(#0000,#0000) padding-box, linear-gradient(${frame * 3 + i * 90}deg, ${C.grad.join(",")}, ${C.grad[0]}) border-box` }} />
        );
      })}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ lyric renderers
const iridescent = (frame: number): React.CSSProperties => ({
  backgroundImage: `linear-gradient(${frame * 4}deg, ${C.grad[0]}, ${C.grad[1]}, ${C.grad[2]}, ${C.grad[0]})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
});
const stripes = (a: string, b: string, frame: number): React.CSSProperties => ({
  backgroundImage: `repeating-linear-gradient(-45deg, ${a} 0 10px, ${b} 10px 20px)`,
  backgroundPosition: `${frame}px 0`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
});

const exitOf = (l: BALine, t: number) => interpolate(t, [l.end, l.end + 0.25], [0, 1], { ...clamp, easing: IN });

/** A — chorus: words slam one by one, hard black/white, keyword gets the iridescent fill. */
const SlamLine: React.FC<{ l: BALine; invert: boolean }> = ({ l, invert }) => {
  const { t, fps, u, wide } = useA();
  const ws = wordTimes(l);
  const fg = invert ? C.black : C.white;
  const out = exitOf(l, t);
  const long = l.text.length > 16;
  const size = (wide ? (long ? 150 : 210) : long ? 150 : 210) * u;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: `0 ${60 * u}px` }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `${4 * u}px ${30 * u}px`, maxWidth: wide ? "88%" : "92%",
        opacity: 1 - out, transform: `scale(${1 + out * 0.4})`, filter: `blur(${out * 14}px)` }}>
        {ws.map(({ w, at }, k) => {
          const f = Math.round((t - at) * fps);
          const s = spring({ frame: f, fps, config: { damping: 12, stiffness: 200, mass: 0.6 } });
          const key = /বাকি|জীবন|রাজি|হাসি/.test(w);
          if (f < 0) return <span key={k} style={{ fontFamily: BN, fontWeight: 800, fontSize: size, opacity: 0 }}>{w}</span>;
          return (
            <span key={k} style={{ display: "inline-block", fontFamily: BN, fontWeight: 800, fontStretch: "85%", fontSize: size, lineHeight: 1.15, letterSpacing: "-0.01em",
              transform: `scale(${interpolate(s, [0, 1], [3, 1])})`, filter: `blur(${interpolate(s, [0, 1], [20, 0], clamp)}px)`, opacity: Math.min(1, s * 2),
              ...(key ? iridescent(t * 30) : { color: fg }), WebkitTextStroke: key ? undefined : undefined,
              textShadow: key ? undefined : invert ? "none" : `0 0 ${30 * u}px rgba(43,134,197,0.6)` }}>
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** B — thin setup words + heavy punch word, icon pops beside. Dialogue lines become chat bubbles. */
const PairLine: React.FC<{ l: BALine; warm?: boolean }> = ({ l, warm }) => {
  const { t, fps, u, wide, frame } = useA();
  const f = Math.round((t - l.start) * fps);
  const out = exitOf(l, t);
  const words = l.text.split(/\s+/);
  const punchN = words.length > 3 ? 2 : 1;
  const setup = words.slice(0, words.length - punchN).join(" ");
  const punch = words.slice(words.length - punchN).join(" ");
  const tIn = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: OUT });
  const pAt = Math.min(10, Math.round((l.end - l.start) * fps * 0.25));
  const ps = spring({ frame: f - pAt, fps, config: { damping: 12, stiffness: 200, mass: 0.6 } });
  const ic = spring({ frame: f - 4, fps, config: { damping: 8, stiffness: 150 } });
  const fg = warm ? "#ffe8c2" : C.cream;
  const accent = warm ? C.sun : C.tealFg;
  const big = (wide ? 150 : 150) * u;
  const small = (wide ? 78 : 66) * u;
  if (l.who) {
    // spoken dialogue bubble
    const left = l.who === "q";
    return (
      <AbsoluteFill style={{ alignItems: left ? "flex-start" : "flex-end", justifyContent: "center", padding: `0 ${wide ? 300 * u : 90 * u}px` }}>
        <div style={{ transform: `translateY(${(1 - tIn) * 60 * u}px) scale(${0.6 + 0.4 * ic})`, opacity: (1 - out) * tIn, transformOrigin: left ? "left bottom" : "right bottom",
          background: left ? C.cream : accent, color: left ? C.teal : C.teal, padding: `${24 * u}px ${54 * u}px`, borderRadius: `${50 * u}px ${50 * u}px ${left ? 50 * u : 6 * u}px ${left ? 6 * u : 50 * u}px`,
          fontFamily: BN, fontWeight: 700, fontSize: (wide ? 110 : 130) * u, boxShadow: `0 ${16 * u}px ${40 * u}px rgba(0,0,0,0.35)` }}>
          {l.text}
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: wide ? "row" : "column", gap: 50 * u, padding: `0 ${80 * u}px`, opacity: 1 - out,
      transform: `translateY(${-out * 80 * u}px) scale(${1 + interpolate(t - l.start, [0, 3], [0, 0.04], clamp)})`, filter: `blur(${out * 10}px)` }}>
      {l.icon && (
        <div style={{ transform: `scale(${Math.min(1.15, ic)}) rotate(${Math.sin(frame / 6) * 4 * (1 - Math.min(1, ic))}deg)` }}>
          <Icon name={l.icon} size={(wide ? 280 : 380) * u} />
        </div>
      )}
      <div style={{ textAlign: wide ? "left" : "center", maxWidth: wide ? "62%" : "100%" }}>
        {setup && (
          <div style={{ fontFamily: THIN, fontWeight: 300, fontSize: small, color: fg, letterSpacing: `${interpolate(tIn, [0, 1], [0.4, 0.06])}em`, opacity: tIn, lineHeight: 1.4 }}>
            {setup}
          </div>
        )}
        <div style={{ fontFamily: BN, fontWeight: 800, fontSize: big, lineHeight: 1.15, transform: `translateY(${(1 - ps) * 80 * u}px)`, opacity: Math.min(1, ps * 1.5),
          ...stripes(accent, fg, frame) }}>
          {punch}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** C — condensed ultra-bold yellow type on a torn paper strip, sticker prop, clouds in front. */
const CollageLine: React.FC<{ l: BALine; idx: number; fast?: boolean }> = ({ l, idx, fast }) => {
  const { t, fps, u, wide, frame, H } = useA();
  const f = Math.round((t - l.start) * fps);
  const out = exitOf(l, t);
  const side = idx % 2 ? 1 : -1;
  const sIn = spring({ frame: f, fps, config: { damping: 14, stiffness: 180, mass: 0.7 } });
  const ic = spring({ frame: f - 3, fps, config: { damping: 8, stiffness: 150 } });
  const ws = wordTimes(l);
  const size = (wide ? (l.text.length > 18 ? 132 : 160) : l.text.length > 18 ? 112 : 140) * u;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {/* sticker prop: sits behind the text strip (layered depth) */}
      {l.icon && (
        <div style={{ position: "absolute", top: wide ? H * 0.06 : H * 0.18, left: wide ? (side > 0 ? "62%" : "12%") : undefined,
          transform: `scale(${Math.min(1.15, ic) * (1 - out)}) rotate(${side * 8 + Math.sin(frame / 8) * 3}deg) translateY(${Math.sin(frame / 14) * 8 * u}px)`,
          background: "#fff", borderRadius: "50%", padding: 26 * u, boxShadow: `${10 * u}px ${12 * u}px 0 rgba(0,0,0,0.18)`, border: `${8 * u}px solid #fff` }}>
          <Icon name={l.icon} size={(wide ? 300 : 360) * u} />
        </div>
      )}
      <div style={{ position: "absolute", top: wide ? H * 0.5 : H * 0.48, left: 0, right: 0, display: "flex", justifyContent: "center",
        transform: `translateX(${(1 - sIn) * side * 1400 * u}px) rotate(${side * -2.5}deg) translateY(${-out * 120 * u}px)`, opacity: 1 - out }}>
        <div style={{ background: idx % 3 === 0 ? C.coral : idx % 3 === 1 ? C.ink : C.orange, padding: `${14 * u}px ${46 * u}px ${22 * u}px`, maxWidth: wide ? "84%" : "90%",
          clipPath: "polygon(1% 6%, 12% 0%, 30% 5%, 52% 0%, 74% 4%, 99% 0%, 100% 92%, 82% 100%, 60% 95%, 38% 100%, 18% 94%, 0% 100%)",
          display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${22 * u}px` }}>
          {ws.map(({ w, at }, k) => {
            const wf = Math.round((t - at) * fps);
            const s = spring({ frame: wf, fps, config: fast ? { damping: 12, stiffness: 220, mass: 0.5 } : { damping: 14, stiffness: 170 } });
            return (
              <span key={k} style={{ display: "inline-block", fontFamily: BN, fontWeight: 800, fontStretch: "75%", fontSize: size, lineHeight: 1.12, letterSpacing: "-0.02em",
                color: k % 4 === 3 ? "#fff" : C.sun, transform: `translateY(${(1 - s) * 60 * u}px) scale(${0.7 + 0.3 * s})`, opacity: wf < 0 ? 0 : Math.min(1, s * 1.6),
                textShadow: `${5 * u}px ${6 * u}px 0 ${C.ink}` }}>
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const GiantWord: React.FC<{ invert: boolean }> = ({ invert }) => {
  const { frame, u, beat, wide, secT } = useA();
  const word = Math.floor(secT / 2.4) % 2 ? "আছে" : "বাকি";
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: BN, fontWeight: 800, fontStretch: "75%", fontSize: (wide ? 900 : 760) * u, lineHeight: 1, whiteSpace: "nowrap",
        transform: `translateX(${Math.sin(frame / 50) * 120 * u}px) scale(${1 + beat * 0.06}) rotate(${-4 + Math.sin(frame / 80) * 2}deg)`,
        ...(invert ? { color: "#000" } : iridescent(frame * 3)) }}>
        {word}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ title + end
const TitleCard: React.FC<{ title: string }> = ({ title }) => {
  const { secT, fps, u, wide, frame, sec } = useA();
  const f = Math.round(secT * fps);
  const [a, b] = title.split(",").map((s) => s.trim());
  const sa = spring({ frame: f - 6, fps, config: { damping: 12, stiffness: 200, mass: 0.6 } });
  const sb = spring({ frame: f - 30, fps, config: { damping: 12, stiffness: 200, mass: 0.6 } });
  const left = sec.end - sec.start - secT;
  const out = interpolate(left, [0, 0.4], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: 1 - out }}>
      <div style={{ fontFamily: THIN, fontWeight: 300, fontSize: 60 * u, color: "#fff", letterSpacing: "0.3em", opacity: sa }}>~ ভালো থাকার গান ~</div>
      <div style={{ fontFamily: BN, fontWeight: 800, fontStretch: "80%", fontSize: (wide ? 260 : 200) * u, lineHeight: 1.05, color: "#fff", transform: `scale(${interpolate(sa, [0, 1], [3, 1])})`, filter: `blur(${(1 - sa) * 18}px)` }}>{a},</div>
      <div style={{ fontFamily: BN, fontWeight: 800, fontStretch: "80%", fontSize: (wide ? 300 : 230) * u, lineHeight: 1.05, transform: `scale(${interpolate(sb, [0, 1], [3, 1])})`, opacity: f < 30 ? 0 : 1, filter: `blur(${(1 - sb) * 18}px)`, ...iridescent(frame * 2) }}>{b}</div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ title: string; credits: BAProps["credits"]; durationSec: number }> = ({ title, credits, durationSec }) => {
  const { t, secT, fps, u, wide } = useA();
  const f = Math.round(secT * fps);
  const off = interpolate(t, [durationSec - 1.0, durationSec - 0.1], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18 * u, opacity: off }}>
      <div style={{ fontFamily: BN, fontWeight: 800, fontSize: (wide ? 150 : 120) * u, color: C.cream, transform: `scale(${spring({ frame: f, fps, config: { damping: 200 } })})` }}>{title}</div>
      <div style={{ width: interpolate(f, [8, 30], [0, 420 * u], clamp), height: 4 * u, background: C.tealFg, margin: `${10 * u}px 0` }} />
      {credits.map((c, i) => {
        const s = spring({ frame: f - 20 - i * 8, fps, config: { damping: 200 } });
        return (
          <div key={i} style={{ fontFamily: EN, fontSize: 40 * u, color: C.cream, opacity: s, transform: `translateY(${(1 - s) * 20 * u}px)` }}>
            <span style={{ fontWeight: 300, letterSpacing: "0.2em", fontSize: 28 * u, color: C.tealFg }}>{c.role.toUpperCase()}  </span>
            <span style={{ fontWeight: 700 }}>{c.name}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ composition
export const BhaloAchi: React.FC<BAProps> = (p) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = frame / fps;
  const i = Math.min(frame, p.bass.length - 1);
  let bi = -1;
  for (let k = 0; k < p.beats.length && p.beats[k] <= t; k++) bi = k;
  const beat = bi >= 0 ? Math.exp(-(t - p.beats[bi]) * 9) : 0;
  const sec = p.sections.find((s) => t >= s.start && t < s.end) ?? p.sections[p.sections.length - 1];
  const ctx: Ctx = { frame, t, fps, bass: p.bass[i] ?? 0, onset: p.onset[i] ?? 0, beat, beatIdx: bi, sec, secT: t - sec.start, W, H, wide: W > H, u: Math.min(W, H) / 1080 };
  const secLines = p.lines.filter((l) => l.end > sec.start - 0.3 && l.start < sec.end + 0.3);
  const l = activeLine(secLines, t);
  const idx = l ? p.lines.indexOf(l) : 0;
  // A-look: invert every 2 beats, flash on section start
  const invertA = sec.look === "A" && Math.floor(Math.max(0, bi) / 2) % 2 === 1;
  const flash = ctx.secT < 2 / fps;
  const shake = sec.look === "A" && ctx.bass > 0.75 ? (ctx.bass - 0.75) * 50 * ctx.u : 0;
  return (
    <A.Provider value={ctx}>
      <AbsoluteFill style={{ background: C.black, overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: `translate(${Math.sin(frame * 2.1) * shake}px, ${Math.cos(frame * 2.9) * shake}px)` }}>
          {(sec.look === "B" || sec.look === "E") && <TealBG />}
          {sec.look === "Bw" && <TealBG warm />}
          {sec.look === "C" && <SkyBG fast={sec.id.startsWith("rap")} />}
          {(sec.look === "A" || sec.look === "T") && (
            <AbsoluteFill style={{ background: invertA ? C.white : C.black }}>
              <Marquee fg={invertA ? C.black : C.white} dim={sec.look === "T" ? 0.8 : 0.55} />
              {!invertA && <NeonFrames />}
            </AbsoluteFill>
          )}
          {sec.look === "T" && <TitleCard title={p.title} />}
          {l && sec.look === "A" && <SlamLine key={idx} l={l} invert={invertA} />}
          {!l && sec.look === "A" && <GiantWord invert={invertA} />}
          {l && (sec.look === "B" || sec.look === "Bw" || sec.look === "E") && <PairLine key={idx} l={l} warm={sec.look === "Bw"} />}
          {l && sec.look === "C" && <CollageLine key={idx} l={l} idx={idx} fast={sec.id.startsWith("rap")} />}
          {sec.look === "C" && <FrontClouds />}
          {sec.look === "E" && !l && <EndCard title={p.title} credits={p.credits} durationSec={p.durationSec} />}
        </AbsoluteFill>
        {/* grain + vignette */}
        <AbsoluteFill style={{ background: "radial-gradient(circle, transparent 55%, rgba(0,0,0,0.35) 100%)", pointerEvents: "none" }} />
        {flash && <AbsoluteFill style={{ background: C.white, mixBlendMode: "difference" }} />}
        <Audio src={staticFile(p.song)} />
      </AbsoluteFill>
    </A.Provider>
  );
};
