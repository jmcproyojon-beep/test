import React, { createContext, useContext } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// ---------------------------------------------------------------------------
// "সাড়ে বারো" — distorted, funky lyric music video (1080x1920).
// A melting clock's fever dream of waking up at half past twelve. The whole
// stage runs through an SVG distortion filter (bass-driven displacement +
// RGB channel split); collage props illustrate each line; hooks fly through a
// clock tunnel with a glitching 12:30. Palette: obsidian, crimson, magenta,
// yellow, cyan with grain, scanlines and VHS tracking.
// ---------------------------------------------------------------------------

export type SBLine = { start: number; end: number; text: string; icon: string };
export type SBProps = {
  song: string;
  durationSec: number;
  beats: number[];
  bass: number[];
  rms: number[];
  onset: number[];
  sections: { id: string; start: number; end: number }[];
  lines: SBLine[];
  title: string;
  artist: string;
  editor: string;
};

const W = 1080;
const H = 1920;
const BN = "'Noto Sans Bengali', 'Noto Sans', sans-serif";
const EN = "'Noto Sans', 'DejaVu Sans', sans-serif";
const P = {
  black: "#0A0A0A",
  crimson: "#E60023",
  magenta: "#FF2BD6",
  yellow: "#FFD700",
  cyan: "#19F3FF",
  paper: "#F4EEDC",
  ink: "#141014",
};
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type Ctx = { frame: number; t: number; bass: number; rms: number; onset: number; beat: number; beatIdx: number; sec: string };
const A = createContext<Ctx>({ frame: 0, t: 0, bass: 0, rms: 0, onset: 0, beat: 0, beatIdx: 0, sec: "intro" });
const useA = () => useContext(A);

// --------------------------------------------------------------------------- distortion

const DistortDefs: React.FC = () => {
  const { frame, bass, onset, sec } = useA();
  const hook = sec.startsWith("hook");
  const warp = 6 + bass * (hook ? 46 : 26) + (onset > 0.8 ? 40 : 0);
  const split = 3 + bass * (hook ? 16 : 9) + (onset > 0.8 ? 14 : 0);
  const freq = 0.004 + 0.003 * Math.sin(frame / 40);
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id="distort" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency={`${freq} ${freq * 3}`} numOctaves={2} seed={Math.floor(frame / 3) % 97} result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale={warp} xChannelSelector="R" yChannelSelector="G" result="warp" />
        <feColorMatrix in="warp" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
        <feOffset in="r" dx={split} dy={split * 0.3} result="r2" />
        <feColorMatrix in="warp" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb" />
        <feOffset in="gb" dx={-split} dy={-split * 0.3} result="gb2" />
        <feBlend in="r2" in2="gb2" mode="screen" />
      </filter>
    </svg>
  );
};

const VHS: React.FC = () => {
  const { frame, onset } = useA();
  const barY = (frame * 23) % (H + 300) - 150;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 2px, transparent 2px, transparent 5px)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: barY, height: 90 + onset * 120,
        background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.10), rgba(25,243,255,0.12), transparent)", mixBlendMode: "screen" }} />
      {Array.from({ length: 140 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: rnd(i + frame * 3) * W, top: rnd(i * 7 + frame) * H, width: 3, height: 3,
          background: i % 3 ? "#fff" : P.yellow, opacity: 0.25 }} />
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)" }} />
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------------------- backgrounds

const SECTION_COLORS: Record<string, [string, string, string]> = {
  intro: [P.black, "#1a0010", P.crimson],
  wake: ["#2a0c00", "#ff6a00", P.yellow],
  clock: [P.black, "#2b0030", P.magenta],
  hook1: [P.black, "#30001a", P.crimson],
  chaos: ["#001a24", "#003a4a", P.cyan],
  mess: ["#1c0024", "#4a0060", P.magenta],
  late: ["#140014", "#2c0018", P.yellow],
  silence: [P.black, P.black, "#333"],
  hook2: [P.black, "#2a0030", P.cyan],
  end: [P.black, "#140014", P.crimson],
};

const Tunnel: React.FC<{ kind: "rect" | "clock" | "ring"; color: string; speed?: number }> = ({ kind, color, speed = 1 }) => {
  const { frame, bass, beat } = useA();
  const n = 14;
  return (
    <svg width={W} height={H} style={{ position: "absolute" }}>
      {Array.from({ length: n }, (_, k) => {
        const z = ((k + (frame * 0.035 * speed)) % n) / n; // 0 far .. 1 near
        const s = Math.pow(z, 2.2) * 2.6 + 0.02;
        const op = Math.min(1, z * 1.6) * (1 - Math.max(0, z - 0.85) * 6);
        const cx = W / 2 + Math.sin(frame / 50 + k) * 20 * (1 - z);
        const cy = H * 0.42 + Math.cos(frame / 60 + k) * 30 * (1 - z);
        const sw = 4 + z * 10 + bass * 8;
        const col = k % 3 === 0 ? color : k % 3 === 1 ? P.magenta : P.yellow;
        if (kind === "rect")
          return <rect key={k} x={cx - 520 * s} y={cy - 820 * s} width={1040 * s} height={1640 * s} fill="none" stroke={col} strokeWidth={sw} opacity={op}
            transform={`rotate(${(k * 7 + frame * 0.3) % 360} ${cx} ${cy})`} />;
        if (kind === "ring")
          return <circle key={k} cx={cx} cy={cy} r={700 * s * (1 + beat * 0.05)} fill="none" stroke={col} strokeWidth={sw} opacity={op} />;
        // clock faces with ticks
        return (
          <g key={k} opacity={op} transform={`translate(${cx} ${cy}) rotate(${frame * (k % 2 ? 1.5 : -1)})`}>
            <circle r={650 * s} fill="none" stroke={col} strokeWidth={sw} />
            {Array.from({ length: 12 }, (_, h) => {
              const a = (h / 12) * Math.PI * 2;
              return <line key={h} x1={Math.cos(a) * 560 * s} y1={Math.sin(a) * 560 * s} x2={Math.cos(a) * 630 * s} y2={Math.sin(a) * 630 * s}
                stroke={col} strokeWidth={sw} />;
            })}
          </g>
        );
      })}
    </svg>
  );
};

const Background: React.FC = () => {
  const { sec, frame, bass } = useA();
  const [c0, c1, c2] = SECTION_COLORS[sec] ?? SECTION_COLORS.intro;
  const hue = sec === "hook2" ? (frame * 4) % 360 : sec === "hook1" ? (frame * 2) % 60 : 0;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, ${c1} 0%, ${c0} 70%)`, filter: `hue-rotate(${hue}deg)` }}>
      {sec === "silence" ? null : (
        <Tunnel kind={sec.startsWith("hook") || sec === "clock" ? "clock" : sec === "chaos" || sec === "late" ? "rect" : "ring"}
          color={c2} speed={sec.startsWith("hook") ? 2.2 + bass : 1} />
      )}
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------------------- collage props

/** Sticker / paper cut-out frame with torn edges. */
const Cutout: React.FC<{ r: number; color?: string; children: React.ReactNode; seed: number }> = ({ r, color = P.paper, children, seed }) => {
  const pts = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2;
    const rr = r * (0.9 + rnd(seed + i) * 0.14);
    return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
  }).join(" ");
  return (
    <g>
      <polygon points={pts} fill="#000" opacity={0.45} transform="translate(14 18)" />
      <polygon points={pts} fill={color} />
      {children}
    </g>
  );
};

const Icon: React.FC<{ id: string; p: number }> = ({ id, p }) => {
  const { frame, beat, bass } = useA();
  const wob = Math.sin(frame / 6) * 4;
  const S = (c: React.ReactNode, col = P.paper, seed = 1, r = 300) => <Cutout r={r} color={col} seed={seed}>{c}</Cutout>;
  switch (id) {
    case "sun":
    case "sunrise":
      return S(
        <g transform={`translate(0 ${id === "sunrise" ? interpolate(p, [0, 1], [120, 0]) : 0})`}>
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2 + frame / 30;
            return <line key={i} x1={Math.cos(a) * 140} y1={Math.sin(a) * 140} x2={Math.cos(a) * (220 + bass * 40)} y2={Math.sin(a) * (220 + bass * 40)}
              stroke={P.crimson} strokeWidth={22} strokeLinecap="round" />;
          })}
          <circle r={130} fill={P.yellow} stroke={P.ink} strokeWidth={10} />
          <path d="M -50 -10 q 15 -25 30 0 M 20 -10 q 15 -25 30 0" stroke={P.ink} strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d="M -45 45 q 45 35 90 0" stroke={P.ink} strokeWidth={10} fill="none" strokeLinecap="round" />
          <text x={150} y={-150} fontFamily={EN} fontWeight={900} fontSize={70} fill={P.crimson}>HOT!</text>
        </g>, "#ffe1c2", 3);
    case "moon":
      return S(
        <g>
          <path d="M 40 -170 A 170 170 0 1 0 150 90 A 130 130 0 1 1 40 -170 Z" fill={P.yellow} stroke={P.ink} strokeWidth={10} />
          <path d="M -40 10 q 20 15 40 0" stroke={P.ink} strokeWidth={9} fill="none" />
          {[0, 1, 2].map((k) => (
            <text key={k} x={90 + k * 55} y={-80 - k * 60 - ((frame * 2 + k * 30) % 60)} fontFamily={EN} fontWeight={900} fontSize={50 + k * 16} fill={P.magenta}>Z</text>
          ))}
        </g>, "#1b1b4a", 5);
    case "eye":
    case "sleepy": {
      const open = id === "sleepy" ? 0.25 + 0.15 * Math.sin(frame / 10) : Math.min(1, p * 1.6);
      return S(
        <g>
          <path d={`M -230 0 Q 0 ${-200 * open} 230 0 Q 0 ${200 * open} -230 0 Z`} fill="#fff" stroke={P.ink} strokeWidth={12} />
          <circle r={90 * open + 4} fill={P.cyan} stroke={P.ink} strokeWidth={8} cx={Math.sin(frame / 15) * 40} />
          <circle r={38 * open + 2} fill={P.ink} cx={Math.sin(frame / 15) * 40} />
          {Array.from({ length: 7 }, (_, i) => <line key={i} x1={-150 + i * 50} y1={-110 * open - 10} x2={-170 + i * 57} y2={-170 * open - 30} stroke={P.ink} strokeWidth={8} />)}
        </g>, P.paper, 7);
    }
    case "daynight":
      return S(
        <g>
          <path d="M 0 -200 A 200 200 0 0 1 0 200 Z" fill={P.yellow} />
          <path d="M 0 -200 A 200 200 0 0 0 0 200 Z" fill="#1b1b4a" />
          <circle cx={-80} cy={-40} r={14} fill="#fff" /><circle cx={-120} cy={60} r={9} fill="#fff" />
          <text x={0} y={30} textAnchor="middle" fontFamily={EN} fontWeight={900} fontSize={160} fill={P.crimson}>?</text>
        </g>, P.paper, 9);
    case "doorbell":
      return S(
        <g>
          <rect x={-90} y={-170} width={180} height={300} rx={30} fill="#ccc" stroke={P.ink} strokeWidth={10} />
          <circle r={60 + beat * 12} cy={-30} fill={P.crimson} stroke={P.ink} strokeWidth={10} />
          {[0, 1, 2].map((k) => <path key={k} d={`M ${110 + k * 35} -110 q 30 80 0 160`} stroke={P.magenta} strokeWidth={12} fill="none" opacity={(frame / 4 + k) % 3 < 2 ? 1 : 0.2} />)}
          {[0, 1, 2, 3].map((k) => <ellipse key={k} cx={-260 + k * 70 - (frame * 6) % 70} cy={200 + (k % 2) * 30} rx={22} ry={34} fill={P.ink} />)}
          <text x={-230} y={-200} fontFamily={EN} fontWeight={900} fontSize={70} fill={P.crimson}>DING!</text>
        </g>, P.paper, 11);
    case "clock":
    case "late":
      return S(
        <g transform={`rotate(${wob})`}>
          <circle r={210} fill="#fff" stroke={P.ink} strokeWidth={14} />
          {Array.from({ length: 12 }, (_, h) => {
            const a = (h / 12) * Math.PI * 2 - Math.PI / 2;
            return <text key={h} x={Math.cos(a) * 165} y={Math.sin(a) * 165 + 16} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={44} fill={P.ink}>{"১২৩৪৫৬৭৮৯"[h - 1] ?? (h === 0 ? "১২" : h === 10 ? "১০" : "১১")}</text>;
          })}
          <line x1={0} y1={0} x2={0} y2={-150} stroke={P.ink} strokeWidth={16} strokeLinecap="round" transform={`rotate(${id === "late" ? frame * 12 : 0})`} />
          <line x1={0} y1={0} x2={0} y2={130} stroke={P.crimson} strokeWidth={12} strokeLinecap="round" transform={`rotate(${id === "late" ? frame * 2 : 0})`} />
          <circle r={18} fill={P.crimson} />
          {/* bells */}
          <circle cx={-160} cy={-200} r={50} fill={P.crimson} stroke={P.ink} strokeWidth={8} transform={`rotate(${beat * 15} 0 0)`} />
          <circle cx={160} cy={-200} r={50} fill={P.crimson} stroke={P.ink} strokeWidth={8} transform={`rotate(${-beat * 15} 0 0)`} />
        </g>, P.yellow, 13);
    case "fridge":
      return S(
        <g>
          <rect x={-150} y={-230} width={300} height={460} rx={24} fill="#dff7ff" stroke={P.ink} strokeWidth={10} />
          <line x1={-150} y1={-60} x2={150} y2={-60} stroke={P.ink} strokeWidth={10} />
          <g transform={`translate(30 70) rotate(${wob * 2})`}>
            <path d="M -45 0 L 0 140 L 45 0 Z" fill="#d49b52" stroke={P.ink} strokeWidth={8} />
            <circle r={52} cy={-20} fill={P.magenta} stroke={P.ink} strokeWidth={8} />
            <circle r={40} cy={-80} fill={P.yellow} stroke={P.ink} strokeWidth={8} />
          </g>
          {/* dizzy spiral */}
          <path d={Array.from({ length: 40 }, (_, i) => { const a = i * 0.5 + frame / 5; const r = i * 3; return `${i ? "L" : "M"} ${-220 + Math.cos(a) * r} ${-240 + Math.sin(a) * r}`; }).join(" ")}
            stroke={P.magenta} strokeWidth={8} fill="none" />
        </g>, P.paper, 15);
    case "flies":
      return S(
        <g>
          <path d="M -90 60 Q -90 -140 0 -140 Q 90 -140 90 60 Z" fill={P.yellow} stroke={P.ink} strokeWidth={10} transform={`rotate(${Math.sin(frame) * 8})`} />
          {Array.from({ length: 6 }, (_, i) => {
            const a = frame / 6 + i;
            const x = Math.cos(a * 1.7) * 220; const y = Math.sin(a * 1.3) * 200;
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                <ellipse rx={14} ry={10} fill={P.ink} />
                <ellipse cx={-6} cy={-12} rx={10} ry={7} fill="#bdf" opacity={0.8} transform={`rotate(${Math.sin(frame * 3) * 40})`} />
              </g>
            );
          })}
          <text x={-260} y={-170} fontFamily={BN} fontWeight={900} fontSize={60} fill={P.crimson}>ভনভন!</text>
        </g>, P.paper, 17);
    case "tap":
      return S(
        <g>
          <path d="M -200 -100 H 40 V -40 H -200 Z" fill="#9aa" stroke={P.ink} strokeWidth={10} />
          <rect x={10} y={-60} width={60} height={110} fill="#9aa" stroke={P.ink} strokeWidth={10} />
          <rect x={-40} y={-160} width={120} height={40} rx={12} fill={P.crimson} stroke={P.ink} strokeWidth={8} transform={`rotate(${frame * 4} 20 -140)`} />
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d="M 0 0 q 12 18 0 28 q -12 -10 0 -28" fill={P.cyan} stroke={P.ink} strokeWidth={4} transform={`translate(40 ${70 + ((frame * 9 + i * 40) % 220)})`} />
          ))}
        </g>, P.paper, 19);
    case "clothes":
      return S(
        <g>
          <g transform={`translate(${-110 + Math.sin(frame / 7) * 40} ${-60 + Math.cos(frame / 9) * 30}) rotate(${frame * 3})`}>
            <path d="M -90 -60 L -40 -90 L 40 -90 L 90 -60 L 70 -20 L 45 -30 L 45 90 L -45 90 L -45 -30 L -70 -20 Z" fill={P.magenta} stroke={P.ink} strokeWidth={8} />
          </g>
          <g transform={`translate(${130 + Math.cos(frame / 6) * 40} ${110 + Math.sin(frame / 8) * 30}) rotate(${-frame * 4})`}>
            <path d="M -70 0 L -70 -70 L -20 -70 L -20 -20 L 80 0 L 80 30 L -70 30 Z" fill={P.cyan} stroke={P.ink} strokeWidth={8} />
          </g>
          {[0, 1, 2].map((k) => <text key={k} x={-220 + k * 170} y={-180 + (k % 2) * 40} fontFamily={EN} fontWeight={900} fontSize={90} fill={P.crimson} opacity={(frame / 8 + k) % 3 < 2 ? 1 : 0.3}>?</text>)}
        </g>, P.paper, 21);
    case "laptop":
      return S(
        <g>
          <rect x={-240} y={-40} width={480} height={180} rx={70} fill="#fff" stroke={P.ink} strokeWidth={10} />
          <g transform={`translate(0 ${10 + Math.sin(frame / 5) * 8})`}>
            <rect x={-150} y={-150} width={300} height={170} rx={10} fill={P.ink} stroke={P.ink} strokeWidth={8} />
            <rect x={-130} y={-132} width={260} height={130} fill={P.cyan} opacity={0.7 + bass * 0.3} />
          </g>
          <circle cx={170} cy={-170} r={60} fill="none" stroke={P.crimson} strokeWidth={12} />
          <line x1={212} y1={-128} x2={260} y2={-80} stroke={P.crimson} strokeWidth={14} strokeLinecap="round" />
        </g>, P.paper, 23);
    case "mess":
      return S(
        <g>
          {["#f55", P.yellow, P.cyan, P.magenta, "#9f6", "#fff"].map((c, i) => {
            const a = frame / 10 + i;
            return <rect key={i} x={-50} y={-35} width={100 + (i % 2) * 40} height={70} fill={c} stroke={P.ink} strokeWidth={6}
              transform={`translate(${Math.cos(a + i) * (120 + i * 18)} ${Math.sin(a * 1.3 + i) * (120 + i * 10)}) rotate(${frame * (i % 2 ? 5 : -4) + i * 40})`} />;
          })}
          <text x={0} y={20} textAnchor="middle" fontFamily={BN} fontWeight={900} fontSize={64} fill={P.ink}>এলোমেলো</text>
        </g>, P.paper, 25);
    case "yeah":
      return S(<text x={0} y={60} textAnchor="middle" fontFamily={EN} fontWeight={900} fontSize={220} fill={P.crimson} transform={`rotate(-8) scale(${1 + beat * 0.15})`}>YEAH!</text>, P.yellow, 27);
    case "office":
      return S(
        <g>
          <rect x={-170} y={-60} width={340} height={220} rx={20} fill="#6b4a2b" stroke={P.ink} strokeWidth={10} />
          <rect x={-60} y={-110} width={120} height={60} rx={14} fill="none" stroke={P.ink} strokeWidth={14} />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={-40} y={-50} width={80} height={100} fill="#fff" stroke={P.ink} strokeWidth={4}
              transform={`translate(${Math.cos(i + frame / 9) * 220} ${-120 + Math.sin(i * 2 + frame / 7) * 140}) rotate(${frame * 5 + i * 60})`} />
          ))}
        </g>, P.paper, 29);
    case "mouse":
      return S(
        <g>
          <ellipse cx={0} cy={40} rx={200} ry={150} fill="#ffd7b0" stroke={P.ink} strokeWidth={10} />
          <g transform={`translate(${Math.sin(frame / 4) * 110} ${40 + Math.cos(frame / 4) * 60})`}>
            <ellipse rx={50} ry={30} fill="#888" stroke={P.ink} strokeWidth={6} />
            <circle cx={40} cy={-22} r={16} fill="#888" stroke={P.ink} strokeWidth={5} />
            <path d="M -50 0 q -40 -20 -60 10" stroke={P.ink} strokeWidth={5} fill="none" />
          </g>
          <text x={-200} y={-150} fontFamily={BN} fontWeight={900} fontSize={60} fill={P.crimson}>খিদে!</text>
        </g>, P.paper, 31);
    case "grumpy":
      return S(
        <g>
          <circle r={190} fill={P.yellow} stroke={P.ink} strokeWidth={12} />
          <path d="M -110 -60 L -40 -30 M 110 -60 L 40 -30" stroke={P.ink} strokeWidth={14} strokeLinecap="round" />
          <circle cx={-70} cy={0} r={18} fill={P.ink} /><circle cx={70} cy={0} r={18} fill={P.ink} />
          <path d={`M -80 100 q 80 ${-60 - beat * 20} 160 0`} stroke={P.ink} strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d="M 120 -150 l 40 -40 m -20 60 l 50 -20" stroke={P.crimson} strokeWidth={12} />
        </g>, P.paper, 33);
    case "hurt":
      return S(
        <g>
          <path d="M -80 160 V -60 q 0 -30 30 -30 q 30 0 30 30 V -140 q 0 -30 30 -30 q 30 0 30 30 V -60 h 0 q 0 -30 30 -30 q 30 0 30 30 V 160 Z" fill="#ffd7b0" stroke={P.ink} strokeWidth={10} />
          <rect x={-95} y={20} width={210} height={60} fill="#fff" stroke={P.ink} strokeWidth={8} transform="rotate(-10)" />
          <line x1={-60} y1={40} x2={-60} y2={70} stroke={P.crimson} strokeWidth={10} transform="rotate(-10)" />
          <text x={-240} y={-170} fontFamily={BN} fontWeight={900} fontSize={70} fill={P.crimson} opacity={0.6 + beat * 0.4}>উফ!</text>
        </g>, P.paper, 35);
    case "fire":
      return S(
        <g>
          <path d="M -80 200 V 0 q 0 -30 30 -30 q 30 0 30 30 V -40 q 0 -30 30 -30 q 30 0 30 30 V 200 Z" fill="#ffd7b0" stroke={P.ink} strokeWidth={10} />
          {Array.from({ length: 5 }, (_, i) => {
            const h = 130 + rnd(i + Math.floor(frame / 2)) * 90 + bass * 60;
            return <path key={i} d={`M ${-90 + i * 40} -40 Q ${-110 + i * 40} ${-40 - h * 0.6} ${-70 + i * 40} ${-40 - h} Q ${-30 + i * 40} ${-40 - h * 0.5} ${-50 + i * 40} -40 Z`}
              fill={i % 2 ? P.yellow : P.crimson} stroke={P.ink} strokeWidth={5} />;
          })}
        </g>, "#2a0000", 37);
    default:
      return null;
  }
};

const PropStage: React.FC<{ lines: SBLine[] }> = ({ lines }) => {
  const { t, beat, bass, frame } = useA();
  const l = lines.find((x) => x.icon !== "hook" && x.icon !== "outro" && t >= x.start - 0.25 && t <= x.end + 0.6);
  if (!l) return null;
  const p = interpolate(t, [l.start - 0.25, l.start + 0.25], [0, 1], clamp);
  const out = interpolate(t, [l.end + 0.2, l.end + 0.6], [1, 0], clamp);
  const sc = interpolate(p, [0, 0.7, 1], [0.2, 1.12, 1]) * (1 + beat * 0.06 + bass * 0.03);
  return (
    <svg width={W} height={H} style={{ position: "absolute" }}>
      <g transform={`translate(${W / 2} ${H * 0.4}) scale(${sc * out}) rotate(${(1 - p) * -25 + Math.sin(frame / 12) * 3})`}>
        <Icon id={l.icon} p={p} />
      </g>
    </svg>
  );
};

// --------------------------------------------------------------------------- hook visuals

const HookStage: React.FC = () => {
  const { t, beat, bass, onset, frame } = useA();
  const flick = onset > 0.75 || (frame % 9 === 0 && bass > 0.6);
  const digits = "১২:৩০";
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, textAlign: "center", fontFamily: BN, fontWeight: 900,
        fontSize: 330 + beat * 50, color: flick ? P.black : P.yellow, WebkitTextStroke: `10px ${P.crimson}`,
        textShadow: `16px 0 ${P.magenta}, -16px 0 ${P.cyan}`, transform: `skewX(${Math.sin(t * 7) * 8}deg) rotate(${Math.sin(t * 3) * 4}deg)`,
        letterSpacing: 6 }}>
        {digits}
      </div>
      {/* melting drips under the digits */}
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {Array.from({ length: 9 }, (_, i) => {
          const x = 170 + i * 92;
          const len = 40 + ((frame * (2 + rnd(i) * 3) + i * 40) % 260);
          return <path key={i} d={`M ${x} 930 V ${930 + len} a 18 18 0 0 0 36 0 V 930 Z`} fill={i % 2 ? P.yellow : P.crimson} opacity={0.9} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------------------- lyrics

const Lyrics: React.FC<{ lines: SBLine[] }> = ({ lines }) => {
  const { t, bass, beat } = useA();
  const l = lines.find((x) => t >= x.start - 0.12 && t <= x.end + 0.2);
  if (!l) return null;
  const hook = l.icon === "hook";
  const words = l.text.split(/\s+/);
  const dur = Math.max(0.5, l.end - l.start);
  const idx = lines.indexOf(l);
  const size = hook ? 124 : l.text.length > 26 ? 84 : l.text.length > 14 ? 104 : 130;
  const colors = [P.yellow, P.cyan, P.magenta, "#fff"];
  const col = hook ? colors[idx % colors.length] : "#fff";
  const sp = 8 + bass * 18;
  return (
    <div style={{ position: "absolute", top: hook ? 1240 : 1360, left: 50, right: 50, textAlign: "center", fontFamily: BN, fontWeight: 900,
      fontSize: size, lineHeight: 1.22, color: col, whiteSpace: hook ? "nowrap" : undefined, transform: hook ? `scale(${1 + beat * 0.12}) rotate(${idx % 2 ? -3 : 3}deg)` : undefined,
      textShadow: `${sp}px 0 ${P.magenta}, ${-sp}px 0 ${P.cyan}, 0 10px 0 ${P.black}` }}>
      {hook && (
        <div style={{ position: "absolute", inset: "-20px -10px", background: P.crimson, transform: `skewX(-12deg) scaleX(${interpolate(t, [l.start - 0.1, l.start + 0.1], [0, 1], clamp)})`,
          zIndex: -1, boxShadow: `0 0 60px ${P.crimson}` }} />
      )}
      {words.map((w, i) => {
        const at = l.start + (dur * i) / words.length * (hook ? 0.6 : 1);
        const q = interpolate(t, [at - 0.04, at + 0.12], [0, 1], clamp);
        return (
          <span key={i} style={{ display: "inline-block", marginRight: "0.25em", opacity: q,
            transform: `translateY(${(1 - q) * 60}px) scale(${0.6 + q * 0.4}) rotate(${(1 - q) * (i % 2 ? 14 : -14)}deg)` }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

// --------------------------------------------------------------------------- intro / silence / end

const Intro: React.FC<{ title: string; artist: string }> = ({ title, artist }) => {
  const { t, frame } = useA();
  const on = interpolate(t, [0.2, 0.6], [0.01, 1], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: W, height: H * on, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
        background: `repeating-linear-gradient(${frame * 37}deg, #111 0px, #333 2px, #000 4px)` }}>
        <div style={{ fontFamily: EN, fontSize: 40, letterSpacing: 16, color: P.cyan, opacity: interpolate(t, [1.0, 1.6], [0, 1], clamp) }}>{artist.toUpperCase()}</div>
        <div style={{ fontFamily: BN, fontWeight: 900, fontSize: 210, color: P.yellow, WebkitTextStroke: `6px ${P.crimson}`,
          textShadow: `14px 0 ${P.magenta}, -14px 0 ${P.cyan}`, opacity: interpolate(t, [1.4, 1.8], [0, 1], clamp),
          transform: `translateX(${frame % 7 === 0 ? 30 : 0}px)` }}>
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Silence: React.FC = () => {
  const { frame } = useA();
  return (
    <AbsoluteFill style={{ background: P.black, alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: BN, fontWeight: 900, fontSize: 120, color: "#fff", opacity: frame % 15 < 8 ? 1 : 0.3 }}>টিক… টিক…</div>
    </AbsoluteFill>
  );
};

const End: React.FC<{ title: string; artist: string; editor: string; durationSec: number }> = ({ title, artist, editor, durationSec }) => {
  const { t } = useA();
  const card = interpolate(t, [122.6, 123.4], [0, 1], clamp);
  const off = interpolate(t, [durationSec - 1.2, durationSec - 0.2], [1, 0.004], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: card }}>
      <div style={{ width: W, height: H * off, background: P.black, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, overflow: "hidden" }}>
        <div style={{ fontFamily: BN, fontWeight: 900, fontSize: 200, color: P.yellow, WebkitTextStroke: `6px ${P.crimson}`, textShadow: `12px 0 ${P.magenta}, -12px 0 ${P.cyan}` }}>{title}</div>
        <div style={{ fontFamily: EN, fontSize: 42, color: "#fff", letterSpacing: 6 }}>{artist}</div>
        <div style={{ fontFamily: EN, fontSize: 34, color: P.cyan, letterSpacing: 4 }}>Edited by {editor}</div>
      </div>
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------------------- composition

export const SareBaro: React.FC<SBProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const i = Math.min(frame, p.bass.length - 1);
  let bi = -1;
  for (let k = 0; k < p.beats.length && p.beats[k] <= t; k++) bi = k;
  const beat = bi >= 0 ? Math.exp(-(t - p.beats[bi]) * 10) : 0;
  const sec = p.sections.find((s) => t >= s.start && t < s.end)?.id ?? "end";
  const ctx: Ctx = { frame, t, bass: p.bass[i] ?? 0, rms: p.rms[i] ?? 0, onset: p.onset[i] ?? 0, beat, beatIdx: bi, sec };
  const shake = ctx.bass > 0.7 ? (ctx.bass - 0.7) * 40 : 0;
  // impact frames: section starts and strong hits
  const sinceSec = Math.min(...p.sections.map((s) => (t >= s.start ? t - s.start : 99)));
  const invert = sinceSec < 0.1 || (ctx.onset > 0.92 && frame % 2 === 0);
  return (
    <A.Provider value={ctx}>
      <AbsoluteFill style={{ background: P.black }}>
        <DistortDefs />
        <AbsoluteFill style={{ filter: `url(#distort)${invert ? " invert(1)" : ""}`,
          transform: `translate(${Math.sin(frame * 1.9) * shake}px, ${Math.cos(frame * 2.7) * shake}px) scale(${1 + ctx.beat * 0.015})` }}>
          <Background />
          {sec === "intro" && <Intro title={p.title} artist={p.artist} />}
          {(sec === "hook1" || sec === "hook2") && <HookStage />}
          <PropStage lines={p.lines} />
          {sec === "silence" && <Silence />}
          {sec === "end" && <End title={p.title} artist={p.artist} editor={p.editor} durationSec={p.durationSec} />}
        </AbsoluteFill>
        <AbsoluteFill style={{ filter: invert ? "invert(1)" : undefined, transform: `translate(${Math.sin(frame * 1.9) * shake * 0.5}px, 0) skewX(${Math.sin(frame / 9) * 2}deg)` }}>
          <Lyrics lines={p.lines} />
        </AbsoluteFill>
        <VHS />
        <Sequence from={0}>
          <Audio src={staticFile(p.song)} />
        </Sequence>
      </AbsoluteFill>
    </A.Provider>
  );
};
