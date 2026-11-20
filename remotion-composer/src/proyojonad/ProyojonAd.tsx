// Proyojon Abashon brand ad (≈45 s, 9:16): Sabbir & Nusrat cartoon story driven by the dialogue in vo.json.
// Scenes: Dhaka hook -> questions -> snap into the office -> desk model -> project montage (website banners)
//         -> dream plot -> signboard CTA -> end card with contacts.
import React from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ANEK_CSS } from "../rubelpromo/anekcss";
import { FONT_CSS } from "../portfolio/fontcss";
import { Sabbir, Nusrat, REST, Pose, HEAD_TOP } from "./Characters";
import VO from "./vo.json";

export const PA_FPS = 30, PA_W = 1080, PA_H = 1920;
export const PA_FRAMES = Math.ceil(VO.total * PA_FPS);
const W = PA_W, H = PA_H;
const L = VO.lines;
const BN = "Anek, sans-serif", EN = "InterTight, Inter, sans-serif";
const C = { green: "#0f5a2c", deep: "#0a3d1f", gold: "#f2c14e", cream: "#fbf6ea", ink: "#1b2a1f" };

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.cubic), out = Easing.out(Easing.cubic), back = Easing.out(Easing.back(1.8));
const iv = (t: number, a: number, b: number, x = 0, y = 1, e: (n: number) => number = io) => interpolate(t, [a, b], [x, y], { ...cl, easing: e });
const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(iv(t, a, a + fi), 1 - iv(t, b - fo, b));

// scene starts (seconds)
const S = { q: 6.25, snap: 11.4, office: 11.7, desk: 15.9, montage: 22.95, dream: 26.6, cta: 32.75, end: 39.9, total: VO.total };

// ---- pose keyframes: [time pose is reached, transition seconds, changes]
type K = [number, number, Partial<Pose>];
function poseAt(t: number, keys: K[]): Pose {
  let cur: Pose = { ...REST, ...keys[0][2] };
  for (let i = 1; i < keys.length; i++) {
    const [kt, d, o] = keys[i]; const nxt: Pose = { ...cur, ...o };
    if (t >= kt) { cur = nxt; continue; }
    if (t > kt - d) {
      const k = io((t - (kt - d)) / d); const r: Pose = { ...cur };
      (Object.keys(nxt) as (keyof Pose)[]).forEach((f) => {
        const a = cur[f], b = nxt[f];
        if (typeof a === "number" && typeof b === "number") (r as Record<string, unknown>)[f] = a + (b - a) * k;
        else (r as Record<string, unknown>)[f] = k < 0.5 ? a : b;
      });
      return r;
    }
    break;
  }
  return cur;
}
const talkAt = (spk: "s" | "n", fr: number) => {
  const e = VO.env[spk]; const g = (i: number) => e[Math.max(0, Math.min(e.length - 1, i))] ?? 0;
  return Math.min(1, (g(fr) * 0.6 + g(fr - 1) * 0.25 + g(fr + 1) * 0.15) * 1.25);
};

// ---- Sabbir & Nusrat choreography
const SAB: K[] = [
  [0, 0, { smile: 0.9, brow: 0.5 }],
  [0.75, 0.25, { ra1: 60, ra2: 45, rh: "point", rf: 95, brow: 0.8, smile: 1, lean: 2 }],
  [2.5, 0.35, { ra1: 25, ra2: 65, rh: "open", rf: 20, la1: 25, la2: 65, lh: "open", lf: -20, lean: 4, brow: 0.6 }],
  [4.2, 0.4, { la1: 45, la2: 40, ra1: 18, ra2: 40, head: -4 }],
  [5.9, 0.35, { la1: 8, la2: 6, ra1: 8, ra2: 6, lean: 0, head: 0, brow: 0.2 }],
  [6.75, 0.3, { look: -1, head: -8, brow: 0.5, smile: 0.4 }],
  [7.55, 0.3, { look: 1, head: 8 }],
  [8.25, 0.35, { ra1: 170, ra2: 15, rh: "open", rf: -30, look: 0, head: 4, brow: 0.2, smile: 0.2 }],
  [9.3, 0.3, { ra1: 40, ra2: 60, rh: "open", rf: 70, la1: 40, la2: 60, lh: "open", lf: -70, brow: 1, head: 6, smile: 0.6 }],
  [11.1, 0.25, { ra1: 120, ra2: 50, rh: "snap", rf: 0, la1: 8, la2: 6, lh: "open", lf: 0, head: 0, smile: 1, brow: 0.6 }],
  [11.7, 0.1, { ra1: 8, ra2: 6, rh: "open", rf: 0, look: 1, head: 3, smile: 1, brow: 0.3 }],
  [16.5, 0.4, { lean: 7, brow: 1, mouthO: 0.25, look: 1 }],
  [18.6, 0.4, { lean: 4, mouthO: 0, smile: 1, la1: 20, la2: -40, ra1: 20, ra2: -40, lh: "fist", rh: "fist" }],
  [22.6, 0.3, { lean: 0, la1: 8, la2: 6, ra1: 8, ra2: 6, lh: "open", rh: "open", brow: 0.4 }],
  // dream
  [26.6, 0.01, { look: 0, head: 0, lean: 0, smile: 1, brow: 0.6 }],
  [27.35, 0.35, { la1: 125, la2: 0, ra1: 125, ra2: 0, lf: -60, rf: 60, brow: 1, hop: 0 }],
  [28.6, 0.6, { look: -1, head: -5 }], [29.4, 0.5, { look: 1, head: 5 }],
  [30.2, 0.4, { la1: 8, la2: 6, ra1: 8, ra2: 6, look: 1, head: 4, brow: 0.5 }],
  // cta
  [33.25, 0.3, { ra1: 30, ra2: 145, rh: "thumb", look: 0, head: 0, brow: 0.8, lean: 2 }],
  [36.3, 0.4, { ra1: 8, ra2: 6, rh: "open", look: 1, lean: 0 }],
  [39.6, 0.3, { ra1: 150, ra2: 20, rh: "open", rf: 10, look: 0 }],
];
const NUS: K[] = [
  [0, 0, { smile: 0.9 }],
  [12.25, 0.3, { la1: 150, la2: 20, lh: "open", lf: -10, brow: 0.6, smile: 1 }],
  [13.4, 0.35, { la1: 8, la2: 6, ra1: 10, ra2: -140, rh: "chest", rf: -60 }],
  [14.7, 0.35, { ra1: 8, ra2: 6, rh: "open", rf: 0, la1: 25, la2: 65, lf: -30 }],
  [16.5, 0.35, { la1: 50, la2: 40, lh: "point", lf: -95, look: -1, head: -5 }],
  [17.4, 0.35, { la1: 8, la2: 6, lh: "open", lf: 0, ra1: 50, ra2: 40, rh: "point", rf: 95, look: 1, head: 5 }],
  [18.2, 0.35, { ra1: 25, ra2: 65, rh: "open", rf: 20, la1: 25, la2: 65, lf: -20, look: 0, head: 0 }],
  [21.4, 0.35, { la1: 8, la2: 6, ra1: 10, ra2: -140, rh: "chest", rf: -60, smile: 1 }],
  // dream: walks in from the right
  [26.6, 0.01, { la1: 8, la2: 6, ra1: 8, ra2: 6, rh: "open", rf: 0, look: -1, head: -3 }],
  [30.3, 0.35, { ra1: 30, ra2: 70, rh: "open", rf: 40, look: 0, head: 3, brow: 0.6 }],
  [32.4, 0.35, { ra1: 8, ra2: 6 }],
  [36.8, 0.35, { ra1: 10, ra2: -140, rh: "chest", rf: -60, look: 0 }],
  [38.4, 0.35, { ra1: 30, ra2: 70, rh: "open", rf: 40 }],
  [39.6, 0.3, { ra1: 8, ra2: 6, la1: 150, la2: 20, lh: "open", lf: -10 }],
];
const wave = (t: number, a: number) => (t > a ? 16 * Math.sin((t - a) * 12) : 0);

// ---- shared bits
const rnd = (i: number) => { const x = Math.sin(i * 91.7 + 13.3) * 43758.5453; return x - Math.floor(x); };
const Star: React.FC<{ x: number; y: number; r: number; c?: string; o?: number; rot?: number }> = ({ x, y, r, c = "#fff6c2", o = 1, rot = 0 }) =>
  <path d={`M0 ${-r} L${r * .25} ${-r * .25} L${r} 0 L${r * .25} ${r * .25} L0 ${r} L${-r * .25} ${r * .25} L${-r} 0 L${-r * .25} ${-r * .25} Z`} transform={`translate(${x} ${y}) rotate(${rot})`} fill={c} opacity={o} />;

const Cloud: React.FC<{ x: number; y: number; s: number; o?: number }> = ({ x, y, s, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={110} ry={42} fill="#fff" /><circle cx={-40} cy={-22} r={46} fill="#fff" /><circle cx={30} cy={-36} r={58} fill="#fff" /><circle cx={80} cy={-8} r={36} fill="#fff" />
  </g>
);

// stylised Dhaka skyline
const SKY_B = Array.from({ length: 16 }, (_, i) => ({ x: -40 + i * 74 + rnd(i) * 20, w: 70 + rnd(i + 7) * 50, h: 260 + rnd(i + 3) * 380 }));
const MID_B = Array.from({ length: 9 }, (_, i) => ({ x: -60 + i * 135 + rnd(i + 30) * 30, w: 120 + rnd(i + 40) * 50, h: 330 + rnd(i + 50) * 420, c: ["#ffffff", "#e9f3fb", "#fdf1df", "#e3f6ec"][i % 4] }));
const City: React.FC<{ t: number; ground: number; dim?: number }> = ({ t, ground, dim = 0 }) => (
  <g>
    <defs>
      <linearGradient id="skyC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2fa6f2" /><stop offset="0.7" stopColor="#9fdcff" /><stop offset="1" stopColor="#d9f2ff" /></linearGradient>
      <radialGradient id="sunC"><stop offset="0" stopColor="#fffbe0" /><stop offset="0.5" stopColor="#ffe68a" /><stop offset="1" stopColor="rgba(255,230,138,0)" /></radialGradient>
    </defs>
    <rect x={0} y={0} width={W} height={H} fill="url(#skyC)" />
    <circle cx={850} cy={300} r={220} fill="url(#sunC)" />
    <circle cx={850} cy={300} r={78} fill="#fff6c6" />
    {[[120, 260, 1.1], [520, 180, 0.8], [760, 520, 0.9], [300, 600, 0.7]].map(([x, y, s], i) => <Cloud key={i} x={((x + t * (14 + i * 6)) % 1300) - 110} y={y} s={s} o={0.95} />)}
    {SKY_B.map((b, i) => <rect key={i} x={b.x} y={ground - 120 - b.h} width={b.w} height={b.h + 120} rx={8} fill="#a9cbe6" />)}
    {MID_B.map((b, i) => (
      <g key={i}>
        <rect x={b.x} y={ground - b.h} width={b.w} height={b.h} rx={10} fill={b.c} stroke="#7fa7c9" strokeWidth={4} />
        {Array.from({ length: Math.floor(b.h / 62) }, (_, r) => Array.from({ length: Math.max(2, Math.floor(b.w / 42)) }, (_, c) =>
          <rect key={r + "-" + c} x={b.x + 14 + c * ((b.w - 20) / Math.max(2, Math.floor(b.w / 42)))} y={ground - b.h + 22 + r * 62} width={20} height={34} rx={4} fill={(r + c + i) % 5 === 0 ? "#ffe9a8" : "#7fb6e0"} />))}
        {i % 3 === 0 && <rect x={b.x + b.w / 2 - 6} y={ground - b.h - 60} width={12} height={60} fill="#7fa7c9" />}
      </g>
    ))}
    {Array.from({ length: 12 }, (_, i) => <g key={i} transform={`translate(${i * 98 + 20} ${ground})`}><rect x={-6} y={-40} width={12} height={40} fill="#6b4a32" /><circle cx={0} cy={-70} r={44} fill={i % 2 ? "#3fae5a" : "#2f9a4c"} /></g>)}
    <rect x={0} y={ground} width={W} height={H - ground} fill="#7cc66e" />
    <rect x={0} y={ground + 90} width={W} height={150} fill="#9aa7ad" />
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={i * 150 + ((t * 120) % 150) - 150} y={ground + 160} width={80} height={10} rx={5} fill="#fff" opacity={0.8} />)}
    <rect x={0} y={ground + 240} width={W} height={H} fill="#68b65c" />
    {dim > 0 && <rect x={0} y={0} width={W} height={H} fill="#0b2340" opacity={dim} />}
  </g>
);

// floating question icons
const Pin3D: React.FC = () => (<g><ellipse cx={0} cy={96} rx={46} ry={12} fill="rgba(0,0,0,.18)" /><path d="M0 90 C -70 10 -70 -70 0 -80 C 70 -70 70 10 0 90 Z" fill="#ff4d5e" stroke="#9b1d2a" strokeWidth={6} /><circle cx={0} cy={-22} r={26} fill="#fff" /><path d="M -30 -50 Q -20 -70 0 -72" stroke="#ffd0d5" strokeWidth={9} fill="none" strokeLinecap="round" /></g>);
const Calc3D: React.FC = () => (<g><rect x={-62} y={-84} width={124} height={168} rx={20} fill="#5a6b7c" stroke="#2c3742" strokeWidth={6} /><rect x={-46} y={-66} width={92} height={36} rx={6} fill="#c9f2d4" />
  {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-46 + (i % 3) * 32} y={-18 + Math.floor(i / 3) * 32} width={24} height={24} rx={6} fill={i === 8 ? "#ff9a3c" : "#e9eef2"} />)}</g>);
const Bld3D: React.FC = () => (<g><path d="M -60 90 L -60 -80 L 0 -110 L 60 -80 L 60 90 Z" fill="#fff" stroke="#3a6f8f" strokeWidth={6} /><path d="M 60 -80 L 90 -60 L 90 100 L 60 90 Z" fill="#cfe2ee" stroke="#3a6f8f" strokeWidth={6} />
  {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-44 + (i % 2) * 52} y={-70 + Math.floor(i / 2) * 32} width={36} height={20} rx={4} fill="#7fc0ea" />)}</g>);
const Plot3D: React.FC = () => (<g><path d="M -100 30 L 0 -20 L 100 30 L 0 80 Z" fill="#6fcf5f" stroke="#2f7a2a" strokeWidth={6} /><path d="M -100 30 L -100 46 L 0 96 L 0 80 Z M 100 30 L 100 46 L 0 96 L 0 80 Z" fill="#8a5a3b" />
  <rect x={-6} y={-40} width={12} height={50} fill="#6b4a32" /><circle cx={0} cy={-62} r={34} fill="#2f9a4c" stroke="#1f6a33" strokeWidth={5} />
  {[[-70, 30], [0, -10], [70, 30], [0, 70]].map(([x, y], i) => <rect key={i} x={x - 4} y={y - 24} width={8} height={26} fill="#fff" stroke="#c22" strokeWidth={2} />)}</g>);

// ---- office
const Office: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={0} y={0} width={W} height={1200} fill="#f6ecdc" />
    {Array.from({ length: 7 }, (_, i) => <rect key={i} x={i * 160} y={0} width={4} height={1200} fill="#efe1cb" />)}
    <rect x={70} y={160} width={940} height={860} rx={28} fill="#cdeeff" stroke="#c99d6f" strokeWidth={22} />
    <svg x={82} y={172} width={916} height={836} viewBox="0 600 1080 1050" preserveAspectRatio="xMidYMid slice"><City t={t} ground={1500} /></svg>
    <rect x={530} y={160} width={20} height={860} fill="#c99d6f" /><rect x={70} y={580} width={940} height={18} fill="#c99d6f" />
    <rect x={70} y={160} width={940} height={860} rx={28} fill="url(#glare)" />
    <defs><linearGradient id="glare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="rgba(255,255,255,.35)" /><stop offset="0.4" stopColor="rgba(255,255,255,0)" /><stop offset="0.6" stopColor="rgba(255,255,255,.18)" /><stop offset="0.7" stopColor="rgba(255,255,255,0)" /></linearGradient></defs>
    {/* plants */}
    {[[1000, 1210, 1], [60, 1230, 1.15]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
        {Array.from({ length: 9 }, (_, k) => <ellipse key={k} cx={Math.sin(k * 1.3) * 50} cy={-170 - (k % 4) * 45} rx={26} ry={70} transform={`rotate(${-50 + k * 13} ${Math.sin(k * 1.3) * 50} ${-150 - (k % 4) * 45})`} fill={k % 2 ? "#2f9a4c" : "#3fb35e"} stroke="#1f6a33" strokeWidth={4} />)}
        <path d="M -70 -110 L 70 -110 L 52 0 L -52 0 Z" fill="#f2f2f2" stroke="#8a8a8a" strokeWidth={5} />
      </g>
    ))}
    <rect x={0} y={1200} width={W} height={H - 1200} fill="#d2a679" />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={0} y={1200 + i * 82} width={W} height={4} fill="#b98b5d" />)}
  </g>
);
const Desk: React.FC = () => (
  <g>
    <rect x={300} y={1190} width={790} height={52} rx={10} fill="#7b4d31" stroke="#4a2c1b" strokeWidth={6} />
    <rect x={318} y={1240} width={760} height={420} fill="#9a6a45" stroke="#4a2c1b" strokeWidth={6} />
    <rect x={318} y={1240} width={760} height={24} fill="#6b4329" opacity={0.5} />
    <rect x={500} y={1350} width={420} height={170} rx={20} fill="#fff" stroke="#e1c28a" strokeWidth={8} />
    <image href={staticFile("proyojonad/logo.png")} x={520} y={1370} width={380} height={130} preserveAspectRatio="xMidYMid meet" />
  </g>
);
// mini models on the desk
const MiniTowers: React.FC<{ k: number }> = ({ k }) => (
  <g transform={`translate(520 1200) scale(${k})`} opacity={Math.min(1, k * 2)}>
    <ellipse cx={0} cy={4} rx={130} ry={16} fill="rgba(0,0,0,.18)" />
    {[[-70, 170], [0, 230], [70, 150]].map(([x, h], i) => (
      <g key={i}><rect x={x - 32} y={-h} width={64} height={h} rx={6} fill="#fff" stroke="#3a6f8f" strokeWidth={4} />
        {Array.from({ length: Math.floor(h / 30) }, (_, r) => <rect key={r} x={x - 22} y={-h + 12 + r * 30} width={44} height={14} rx={3} fill="#8cc8ef" />)}</g>
    ))}
  </g>
);
const MiniPlots: React.FC<{ k: number }> = ({ k }) => (
  <g transform={`translate(880 1200) scale(${k})`} opacity={Math.min(1, k * 2)}>
    <ellipse cx={0} cy={4} rx={140} ry={16} fill="rgba(0,0,0,.18)" />
    {[-1, 1].map((s) => <g key={s} transform={`translate(${s * 66} 0)`}><path d="M -60 -10 L 0 -38 L 60 -10 L 0 18 Z" fill="#6fcf5f" stroke="#2f7a2a" strokeWidth={4} />
      <rect x={-4} y={-70} width={8} height={40} fill="#6b4a32" /><circle cx={0} cy={-82} r={24} fill="#2f9a4c" stroke="#1f6a33" strokeWidth={4} /></g>)}
  </g>
);

// ---- golden landscape for the dream + CTA
const Landscape: React.FC<{ t: number; z: number; py: number }> = ({ t, z, py }) => {
  const layer = (depth: number, el: React.ReactNode) => <g transform={`translate(${W / 2} ${H / 2 + py * depth}) scale(${1 + (z - 1) * depth}) translate(${-W / 2} ${-H / 2})`}>{el}</g>;
  return (
    <g>
      <defs>
        <linearGradient id="skyD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6ec3ff" /><stop offset="0.45" stopColor="#ffe3a8" /><stop offset="0.62" stopColor="#ffc982" /></linearGradient>
        <linearGradient id="grassD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9bd36a" /><stop offset="1" stopColor="#4fa84a" /></linearGradient>
        <radialGradient id="sunD"><stop offset="0" stopColor="#fff7d6" /><stop offset="0.4" stopColor="#ffd77a" /><stop offset="1" stopColor="rgba(255,200,120,0)" /></radialGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="url(#skyD)" />
      {layer(0.15, <><circle cx={800} cy={760} r={300} fill="url(#sunD)" /><circle cx={800} cy={760} r={90} fill="#fff1c0" />
        {[[160, 300, 1], [600, 220, 0.8], [880, 420, 0.7]].map(([x, y, s], i) => <Cloud key={i} x={((x + t * 10) % 1300) - 100} y={y} s={s} o={0.85} />)}</>)}
      {layer(0.3, <>{Array.from({ length: 11 }, (_, i) => <rect key={i} x={-20 + i * 102} y={880 - 120 - rnd(i + 60) * 220} width={70 + rnd(i) * 30} height={400} rx={6} fill="#c9b6dc" opacity={0.9} />)}</>)}
      {layer(0.45, <>
        <path d={`M0 900 ${Array.from({ length: 23 }, (_, i) => `Q ${i * 50 + 25} ${840 - rnd(i + 80) * 50} ${i * 50 + 50} 900`).join(" ")} L ${W} 960 L 0 960 Z`} fill="#3f8a43" />
        <ellipse cx={330} cy={985} rx={330} ry={62} fill="#7cc8e8" stroke="#5aa9c9" strokeWidth={6} />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={140 + i * 60 + ((t * 30 + i * 20) % 40)} y={965 + (i % 3) * 14} width={50} height={5} rx={3} fill="#fff6d6" opacity={0.8} />)}
      </>)}
      {layer(0.7, <>
        <rect x={0} y={1000} width={W} height={H} fill="url(#grassD)" />
        <path d={`M0 1150 L ${W} 1060 L ${W} 1150 L 0 1250 Z`} fill="#a9b3b8" stroke="#7d878c" strokeWidth={5} />
        {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M ${i * 170 + 30} ${1200 - i * 15.6} l 80 -7 l 0 8 l -80 7 Z`} fill="#fff" opacity={0.85} />)}
        {Array.from({ length: 10 }, (_, i) => <g key={i} transform={`translate(${i * 120 + 40} ${1040 - i * 8})`}><rect x={-5} y={-40} width={10} height={40} fill="#6b4a32" /><circle cx={0} cy={-62} r={34} fill={i % 2 ? "#3fae5a" : "#2f9a4c"} /></g>)}
      </>)}
      {layer(1, <>
        {/* plot boundary pegs and ribbon on the foreground meadow */}
        <path d="M 90 1340 L 990 1300 L 1040 1880 L 40 1900 Z" fill="rgba(140,220,90,.35)" />
        <path d="M 90 1340 L 990 1300 L 1040 1880" fill="none" stroke="#ff5a4e" strokeWidth={7} strokeDasharray="26 14" />
        {[[90, 1340], [990, 1300], [540, 1320]].map(([x, y], i) => <rect key={i} x={x - 7} y={y - 46} width={14} height={50} fill="#fff" stroke="#b33" strokeWidth={3} />)}
        {Array.from({ length: 26 }, (_, i) => <path key={i} d={`M ${rnd(i + 200) * W} ${1400 + rnd(i + 300) * 480} q 4 -22 8 0 q 4 -16 8 0`} fill="none" stroke="#3a8a3a" strokeWidth={4} />)}
      </>)}
      {Array.from({ length: 4 }, (_, i) => { const bx = ((t * (60 + i * 12) + i * 260) % 1400) - 200, by = 380 + i * 60 + Math.sin(t * 2 + i) * 20, f = Math.sin(t * 14 + i) * 10;
        return <path key={i} d={`M ${bx - 22} ${by - f} Q ${bx - 10} ${by - 8} ${bx} ${by} Q ${bx + 10} ${by - 8} ${bx + 22} ${by - f}`} fill="none" stroke="#5a4a3a" strokeWidth={5} strokeLinecap="round" />; })}
    </g>
  );
};

const SignBoard: React.FC<{ k: number }> = ({ k }) => (
  <g transform={`translate(540 1300) scale(${k}) translate(-540 -1300)`} opacity={Math.min(1, k * 3)}>
    <rect x={330} y={980} width={22} height={330} fill="#8a5a3b" /><rect x={728} y={980} width={22} height={330} fill="#8a5a3b" />
    <rect x={250} y={700} width={580} height={330} rx={22} fill="#fff" stroke={C.green} strokeWidth={12} />
    <image href={staticFile("proyojonad/logo.png")} x={280} y={740} width={520} height={250} preserveAspectRatio="xMidYMid meet" />
  </g>
);

// speech bubble anchored over a head
const Bubble: React.FC<{ t: number; i: number; x: number; y: number; color: string }> = ({ t, i, x, y, color }) => {
  const ln = L[i]; const o = win(t, ln.s - 0.12, ln.e + 0.35, 0.18, 0.22); if (o <= 0) return null;
  const k = iv(t, ln.s - 0.12, ln.s + 0.2, 0.6, 1, back);
  const bx = Math.max(60, Math.min(W - 60, x));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, pointerEvents: "none", opacity: o }}>
      <div style={{ position: "absolute", left: Math.max(50, Math.min(W - 50 - 820, bx - 410)), width: 820, top: y - 30, transform: `translateY(-100%) scale(${k})`, transformOrigin: `${bx - Math.max(50, Math.min(W - 50 - 820, bx - 410))}px 100%`, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", background: "#fff", border: `6px solid ${color}`, borderRadius: 40, padding: "14px 34px 22px", fontFamily: BN, fontWeight: 800, fontSize: 56, lineHeight: 1.22, color: C.ink, textAlign: "center", boxShadow: "0 14px 34px rgba(0,0,0,.22)", maxWidth: 820 }}>
          {ln.text}
        </div>
      </div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><path d={`M ${bx - 26} ${y - 40} L ${x} ${y + 6} L ${bx + 26} ${y - 40}`} fill="#fff" stroke={color} strokeWidth={6} strokeLinejoin="round" /><rect x={bx - 24} y={y - 52} width={48} height={14} fill="#fff" /></svg>
    </div>
  );
};

const LogoChip: React.FC<{ o: number }> = ({ o }) => o <= 0 ? null : (
  <div style={{ position: "absolute", left: 36, top: 50, background: "rgba(255,255,255,.95)", borderRadius: 20, padding: "10px 18px", opacity: o, boxShadow: "0 6px 20px rgba(0,0,0,.18)" }}>
    <Img src={staticFile("proyojonad/logo.png")} style={{ height: 62, display: "block" }} />
  </div>
);

// ---- project montage (banners from proyojonabashon.com)
const BANNERS = ["ec6b8323-fff4-4eb9-8c10-cfaf2bd8da80", "eafa8c94-e863-438d-a5c8-e5481821b67e", "74a6fcb5-4467-4bda-a608-6cc02252f87b", "c234e9f7-e429-455a-915f-5d57c3eb8a97", "dcdb6b54-f6ec-4a31-bc66-0fb3d9a51f15"];
const Montage: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - S.montage, dur = S.dream - S.montage; const o = win(t, S.montage, S.dream + 0.2, 0.25, 0.35); if (o <= 0) return null;
  const pos = iv(lt, 0.3, dur - 0.4, 0, BANNERS.length - 1, Easing.inOut(Easing.sin));
  return (
    <AbsoluteFill style={{ opacity: o, background: `radial-gradient(110% 70% at 50% 40%, #16743a 0%, ${C.deep} 70%)` }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 18 }, (_, i) => { const x = rnd(i) * W, y = ((rnd(i + 9) * H + lt * (80 + rnd(i + 4) * 80)) % (H + 100)) - 50;
          return <ellipse key={i} cx={x} cy={y} rx={14} ry={30} transform={`rotate(${lt * 60 + i * 40} ${x} ${y})`} fill={i % 3 ? "#2e9a4c" : C.gold} opacity={0.5} />; })}
      </svg>
      <div style={{ position: "absolute", top: 170, left: 0, right: 0, textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 84, color: "#fff", transform: `translateY(${(1 - iv(lt, 0, 0.5, 0, 1, out)) * -60}px)` }}>আমাদের প্রজেক্ট</div>
      <div style={{ position: "absolute", top: 290, left: 0, right: 0, textAlign: "center", fontFamily: BN, fontWeight: 600, fontSize: 46, color: C.gold }}>ফ্ল্যাট • প্লট • ল্যান্ড শেয়ার</div>
      {BANNERS.map((b, i) => {
        const d = i - pos, ad = Math.abs(d); if (ad > 2.2) return null;
        return <div key={b} style={{ position: "absolute", left: W / 2 - 440, top: 560, width: 880, height: 587, borderRadius: 26, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,.5)", border: "6px solid rgba(255,255,255,.9)",
          transform: `translateX(${d * 620}px) scale(${1 - 0.22 * Math.min(1, ad)}) rotate(${d * 4}deg)`, zIndex: 10 - Math.round(ad * 3), opacity: 1 - 0.45 * Math.min(1, ad) }}>
          <Img src={staticFile(`proyojonad/web/${b}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>;
      })}
      <div style={{ position: "absolute", top: 1260, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18 }}>
        {["বসুন্ধরা", "জলসিঁড়ি", "পূর্বাচল"].map((s, i) => <div key={s} style={{ fontFamily: BN, fontWeight: 800, fontSize: 46, color: C.deep, background: C.gold, borderRadius: 40, padding: "6px 30px 14px", opacity: iv(lt, 0.6 + i * 0.25, 0.9 + i * 0.25), transform: `scale(${iv(lt, 0.6 + i * 0.25, 1.0 + i * 0.25, 0.5, 1, back)})` }}>📍 {s}</div>)}
      </div>
      <div style={{ position: "absolute", top: 1400, left: 0, right: 0, textAlign: "center", fontFamily: BN, fontWeight: 600, fontSize: 46, color: "#e9f7ec", opacity: iv(lt, 1.4, 1.9) }}>কেনা • বেচা • ভাড়া — সব এক জায়গায়</div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - S.end; if (lt < 0) return null;
  const a = (d: number) => iv(lt, d, d + 0.45, 0, 1, out);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 70, background: `linear-gradient(160deg, #13703a, ${C.deep})`, borderRadius: 40, border: `5px solid ${C.gold}`, padding: "30px 34px 34px", boxShadow: "0 30px 80px rgba(0,0,0,.4)", opacity: a(0), transform: `translateY(${(1 - a(0)) * -120}px)` }}>
      <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 64, color: "#fff", textAlign: "center" }}>প্রয়োজন আবাসন লিমিটেড</div>
      <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 44, color: C.gold, textAlign: "center", marginTop: 2 }}>আগামীর নিশ্চিত ঠিকানা</div>
      <div style={{ marginTop: 22, background: "#fff", borderRadius: 24, padding: "14px 22px", display: "flex", alignItems: "center", gap: 18, opacity: a(0.3), transform: `scale(${1 + 0.03 * Math.sin(lt * 7) * iv(lt, 1, 1.3)})` }}>
        <div style={{ width: 76, height: 76, borderRadius: 38, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={42} height={42} viewBox="0 0 24 24"><path fill="#fff" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" /></svg>
        </div>
        <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 66, color: C.deep }}>+880 1323 280004</div>
      </div>
      <div style={{ marginTop: 18, fontFamily: EN, fontWeight: 700, fontSize: 44, color: "#fff", textAlign: "center", opacity: a(0.6) }}>🌐 www.proyojonabashon.com</div>
      <div style={{ marginTop: 10, fontFamily: EN, fontWeight: 700, fontSize: 36, color: "#d9f0de", textAlign: "center", lineHeight: 1.3, opacity: a(0.9) }}>📍 Level-4, House: 23, Road: 16, Nikunja-2, Dhaka</div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
export const ProyojonAd: React.FC = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { Promise.all(["800 60px Anek", "600 40px Anek", "800 60px InterTight", "700 40px Inter"].map((f) => document.fonts.load(f, "অআ abc"))).then(() => continueRender(h), () => continueRender(h)); }, [h]);
  const fr = useCurrentFrame(); const t = fr / PA_FPS;
  const ps = poseAt(t, SAB), pn = poseAt(t, NUS);
  ps.ra2 += t > 8.25 && t < 9.1 ? 10 * Math.sin(t * 20) : 0;                       // scratching
  if (t > 12.25 && t < 13.3) pn.la2 += wave(t, 12.25);
  if (t > 39.6) { ps.ra2 += wave(t, 39.6); pn.la2 += wave(t, 39.7); }
  const ts = talkAt("s", fr), tn = talkAt("n", fr);
  const scene = t < S.office ? "city" : t < S.montage ? "office" : t < S.dream ? "montage" : "land";

  let content: React.ReactNode = null; let sabHead = { x: 0, y: 0 }, nusHead = { x: 0, y: 0 };
  if (scene === "city") {
    const enter = iv(t, 0.08, 0.6, -520, 540, Easing.out(Easing.back(1.2)));
    const hop = Math.sin(iv(t, 0.08, 0.6, 0, Math.PI)) * 160;
    const sx = enter, sy = 1840, ss = 1.02;
    const push = 1 + 0.06 * iv(t, 0.6, S.q) + 0.05 * iv(t, S.q, S.snap);
    const dim = 0.25 * iv(t, S.q, S.q + 0.5) * (1 - iv(t, S.snap, S.snap + 0.2));
    const icons: [React.FC, number, number, number][] = [[Pin3D, 6.65, 190, 900], [Calc3D, 7.5, 890, 920], [Bld3D, 8.25, 170, 1290], [Plot3D, 8.7, 900, 1300]];
    const burst = iv(t, S.snap, S.snap + 0.35);
    sabHead = { x: W / 2 + (sx - W / 2) * push, y: H / 2 + (sy + HEAD_TOP * ss - H / 2) * push };
    content = (
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${W / 2} ${H / 2}) scale(${push}) translate(${-W / 2} ${-H / 2})`}>
          <City t={t} ground={1500} dim={dim} />
          <Sabbir x={sx} y={sy} s={ss} p={{ ...ps, hop }} talk={ts} t={t} seed={1} />
        </g>
        {icons.map(([Ic, at, x, y], i) => {
          const k = iv(t, at, at + 0.35, 0, 1, back) * (1 - burst); if (k <= 0.001) return null;
          return <g key={i} transform={`translate(${x} ${y + Math.sin(t * 3 + i) * 14}) scale(${1.35 * k * (1 + burst * 0.6)}) rotate(${Math.sin(t * 2 + i) * 6})`}><Ic /></g>;
        })}
        {t > 9.2 && t < S.snap && [[330, 760], [760, 720], [880, 640]].map(([x, y], i) => <text key={i} x={x} y={y + Math.sin(t * 4 + i) * 10} fontFamily={EN} fontWeight={800} fontSize={90 + i * 10} fill="#ff7a3c" stroke="#fff" strokeWidth={6} paintOrder="stroke" opacity={iv(t, 9.2 + i * 0.2, 9.5 + i * 0.2)}>?</text>)}
        {t >= S.snap && Array.from({ length: 26 }, (_, i) => { const a = i * 0.9, r = burst * (220 + rnd(i) * 360); const [cx, cy] = [[190, 900], [890, 920], [170, 1290], [900, 1300]][i % 4];
          return <Star key={i} x={cx + Math.cos(a) * r} y={cy + Math.sin(a) * r} r={18 + rnd(i + 5) * 22} o={1 - burst * 0.9} rot={t * 200} />; })}
      </svg>
    );
  } else if (scene === "office") {
    const lt = t - S.office;
    const z = t < S.desk ? 1 + 0.08 * iv(t, S.office, S.desk) : 1.08 + 0.2 * iv(t, S.desk, S.desk + 1.2) - 0.06 * iv(t, 20.5, 22.9);
    const [cx, cy] = t < S.desk ? [560 + 60 * iv(t, S.office, S.desk), 1000] : [560 + 60 * (1 - iv(t, S.desk, S.desk + 1.2)) + 80 * iv(t, S.desk, S.desk + 1.2), 1000 + 130 * iv(t, S.desk, S.desk + 1.2)];
    const tr = (x: number, y: number) => ({ x: (x - cx) * z + W / 2, y: (y - cy) * z + H / 2 });
    const nX = 720, nY = 1590, nS = 0.86, sX = 215, sY = 1880, sS = 0.92;
    sabHead = tr(sX, sY + HEAD_TOP * sS); nusHead = tr(nX, nY + HEAD_TOP * nS);
    const tw = iv(t, 16.45, 16.85, 0, 1, back), pl = iv(t, 17.35, 17.75, 0, 1, back);
    content = (
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${W / 2} ${H / 2}) scale(${z}) translate(${-cx} ${-cy})`}>
          <Office t={t} />
          <Nusrat x={nX} y={nY} s={nS} p={pn} talk={tn} t={t} seed={2} />
          <Desk />
          <MiniTowers k={tw} /><MiniPlots k={pl} />
          {t > 18.1 && <g transform={`translate(700 ${1120 + Math.sin(t * 3) * 8}) scale(${iv(t, 18.1, 18.45, 0, 0.55, back)})`}><Pin3D /></g>}
          {t > 20.2 && <g transform={`translate(950 ${760 + Math.sin(t * 3 + 1) * 8}) scale(${iv(t, 20.2, 20.55, 0, 0.9, back)})`}>
            <circle r={70} fill={C.gold} stroke="#b8862a" strokeWidth={8} /><text y={26} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={84} fill={C.deep}>৳</text></g>}
          <Sabbir x={sX} y={sY} s={sS} p={ps} talk={ts} t={t} seed={1} />
        </g>
        {lt < 0.5 && Array.from({ length: 22 }, (_, i) => <Star key={i} x={rnd(i + 40) * W} y={rnd(i + 70) * H} r={14 + rnd(i) * 26} o={1 - lt / 0.5} rot={t * 180} />)}
        {[[16.45, 520, 1000], [17.35, 880, 1060]].map(([at, x, y], i) => t > at && t < at + 0.6 ? Array.from({ length: 8 }, (_, k) => { const r = iv(t, at, at + 0.6) * 160, a = k * 0.785; const p = tr(x + Math.cos(a) * r, y + Math.sin(a) * r); return <Star key={i + "-" + k} x={p.x} y={p.y} r={16} c={C.gold} o={1 - iv(t, at, at + 0.6)} />; }) : null)}
      </svg>
    );
  } else if (scene === "land") {
    const z = 1 + 0.7 * (1 - iv(t, S.dream, S.dream + 1.1, 0, 1, Easing.out(Easing.cubic)));
    const py = 520 * (1 - iv(t, S.dream, S.dream + 1.1, 0, 1, Easing.out(Easing.cubic)));
    const charIn = iv(t, S.dream + 0.55, S.dream + 0.95, 0, 1, out);
    const sX = 300, sY = 1830, sS = 0.92;
    const nX = iv(t, 29.55, 30.2, 1350, 790, Easing.out(Easing.quad)), nY = 1830, nS = 0.9;
    const step = t > 29.55 && t < 30.2 ? Math.abs(Math.sin((t - 29.55) * 14)) * 22 : 0;
    const sign = iv(t, S.cta + 0.05, S.cta + 0.55, 0, 1, back);
    sabHead = { x: sX, y: sY + HEAD_TOP * sS }; nusHead = { x: nX, y: nY + HEAD_TOP * nS };
    content = (
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Landscape t={t} z={z} py={py} />
        {sign > 0 && <SignBoard k={sign} />}
        <g opacity={charIn} transform={`translate(0 ${(1 - charIn) * 200})`}>
          <Sabbir x={sX} y={sY} s={sS} p={ps} talk={ts} t={t} seed={1} />
        </g>
        {t > 29.55 && <Nusrat x={nX} y={nY} s={nS} p={{ ...pn, hop: step }} talk={tn} t={t} seed={2} />}
        {t > 27.3 && t < 28.3 && Array.from({ length: 12 }, (_, i) => { const k = iv(t, 27.3, 28.3); return <Star key={i} x={sX + Math.cos(i * 0.52) * (120 + k * 380)} y={1100 + Math.sin(i * 0.52) * (80 + k * 260)} r={20} c="#fff3b0" o={1 - k} rot={t * 150} />; })}
      </svg>
    );
  }

  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: BN }}>
      <style>{FONT_CSS + ANEK_CSS}</style>
      {content}
      {scene === "montage" && <Montage t={t} />}
      {/* white flash on the snap */}
      <AbsoluteFill style={{ background: "#fffbea", opacity: win(t, S.snap + 0.02, S.office + 0.25, 0.15, 0.25) }} />
      {/* speech bubbles */}
      {L.map((ln) => {
        if (t < ln.s - 0.2 || t > ln.e + 0.6) return null;
        const hpos = ln.spk === "s" ? sabHead : nusHead;
        return <Bubble key={ln.i} t={t} i={ln.i} x={hpos.x} y={hpos.y} color={ln.spk === "s" ? "#3f8fd8" : C.green} />;
      })}
      <LogoChip o={(scene !== "montage" ? 1 : 0) * win(t, 0.4, S.end, 0.4, 0.3)} />
      <EndCard t={t} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - iv(t, 0, 0.25) + iv(t, S.total - 0.5, S.total) }} />
    </AbsoluteFill>
  );
};
