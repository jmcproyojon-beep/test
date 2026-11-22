import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { C, HEAD, SANS, clamp, easeOut, expoOut, fontsReady, lerp, ramp } from "../bhangariwala/lib";
import { Mark, bwReady } from "./kit";
import { Part1, Part2, Part3 } from "./partsA";
import { Part4, Part5, Part6 } from "./partsB";
import raw from "./vo.json";

// BhangariWala: the complete e-waste journey. 60 s vertical explainer in six 10 s parts
// (each part also stands alone when cut at a multiple of 10 s). The client's voice track
// is placed one line per part by client-builds/bw-journey/build_vo.py, which also writes vo.json.

export const FPS = 30, W = 1080, H = 1920, FRAMES = 60 * FPS;
type Wd = { w: string; s: number; e: number; line: number };
const VO = raw as { words: Wd[] };

// on-screen hooks (Bangla, from the brief), the step title, and the step's closing line
const PARTS: { hook: string[]; title: string; end: string }[] = [
  { hook: ["পুরোনো electronics পড়ে আছে?", "এখান থেকেই শুরু দায়িত্বশীল", "recycling journey।"], title: "IDENTIFY & REQUEST PICKUP", end: "Separate → Request Pickup" },
  { hook: ["আপনাকে e-waste নিয়ে", "কোথাও যেতে হবে না।"], title: "DOORSTEP COLLECTION", end: "Doorstep Pickup → Secure Handover" },
  { hook: ["সব e-waste একরকম নয়।"], title: "SORTING", end: "SORT & CATEGORIZE" },
  { hook: ["Device পুরোনো হতে পারে—", "data নয়।"], title: "DATA PROTECTION", end: "Protect the Data" },
  { hook: ["একটি পুরোনো device-এর ভেতরেও আছে", "পুনর্ব্যবহারযোগ্য resource।"], title: "DISMANTLING & RECOVERY", end: "DISMANTLE → RECOVER" },
  { hook: ["শেষ নয়—এখান থেকেই শুরু", "নতুন সম্ভাবনা।"], title: "RESPONSIBLE RECYCLING", end: "Cleaner Bangladesh" },
];
const HOOK_END = 3.1, END_AT = 8.3;

// ------------------------------------------------------------ captions
type Chunk = { s: number; e: number; words: Wd[] };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Wd[] = [];
  const push = () => { if (cur.length) out.push({ s: cur[0].s, e: cur[cur.length - 1].e, words: cur }); cur = []; };
  VO.words.forEach((w, i) => {
    const prev = VO.words[i - 1];
    const len = cur.reduce((n, x) => n + x.w.length + 1, 0);
    if (cur.length && (prev.line !== w.line || cur.length >= 4 || len + w.w.length > 26 || /[,।?]$/.test(prev.w))) push();
    cur.push(w);
  });
  push();
  for (let i = 0; i < out.length; i++) out[i].e = Math.min(out[i].e + 0.35, out[i + 1]?.s ?? out[i].e + 0.35);
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CHUNKS.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!c) return null;
  const k = easeOut((t - c.s + 0.05) / 0.16);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1446, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${(1 - k) * 14}px)` }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 14px", padding: "10px 30px 14px", borderRadius: 22,
        background: "rgba(30,42,48,0.9)", fontFamily: SANS, fontWeight: 700, fontSize: 46, lineHeight: 1.35, boxShadow: "0 10px 28px rgba(14,42,28,0.2)" }}>
        {c.words.map((w, i) => {
          const live = t >= w.s && t < w.e + 0.05, done = t >= w.e + 0.05;
          return <span key={i} style={{ color: live ? "#A6DD6A" : done ? "#fff" : "rgba(255,255,255,0.55)" }}>{w.w.replace(/।$/, "")}</span>;
        })}
      </div>
    </div>
  );
};

// ------------------------------------------------------------ chrome: logo, 6-step tracker, hook / step header
const NODE_X = (i: number) => 330 + i * 116;
const Tracker: React.FC<{ t: number }> = ({ t }) => {
  const part = Math.min(5, Math.floor(t / 10)), pt = t - part * 10;
  const k = ramp(t, 0.1, 0.5);
  return (
    <g opacity={k}>
      <g transform="translate(176 250)">
        <circle r={44} fill="#fff" stroke={C.mint2} strokeWidth={3} />
        <Mark size={74} />
      </g>
      <line x1={NODE_X(0)} y1={250} x2={NODE_X(5)} y2={250} stroke={C.line} strokeWidth={6} strokeLinecap="round" />
      <line x1={NODE_X(0)} y1={250} x2={NODE_X(Math.min(5, part + clamp(pt / 10)))} y2={250} stroke={C.green} strokeWidth={6} strokeLinecap="round" />
      {Array.from({ length: 6 }).map((_, i) => {
        const done = i < part || (i === part && pt > (part < 5 ? 9.6 : 7.4)), act = i === part && !done;
        const pop = act ? expoOut((pt - 0.05) / 0.5) : 1;
        const pulse = act ? (t * 0.9) % 1 : 0;
        return (
          <g key={i} transform={`translate(${NODE_X(i)} 250)`}>
            {act && <circle r={24 + pulse * 18} fill="none" stroke={C.green} strokeWidth={3} opacity={(1 - pulse) * 0.6} />}
            <circle r={act ? lerp(20, 26, pop) : 20} fill={done || act ? C.green : "#fff"} stroke={done || act ? C.greenD : C.line} strokeWidth={3} />
            {done && !act ? <path d="M-8 0 L-2 7 L9 -6" fill="none" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
              : <text y={act ? 9 : 7} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={act ? 24 : 20} fill={act ? "#fff" : C.mute}>{i + 1}</text>}
          </g>
        );
      })}
    </g>
  );
};

const Header: React.FC<{ t: number }> = ({ t }) => {
  const part = Math.min(5, Math.floor(t / 10)), pt = t - part * 10;
  const P = PARTS[part];
  const hookOut = ramp(pt, HOOK_END - 0.3, 0.3);
  const headIn = easeOut((pt - HOOK_END) / 0.45);
  const endK = ramp(pt, END_AT, 0.4), endA = ramp(pt, END_AT, 0.2), endB = ramp(pt, END_AT + 0.18, 0.35, easeOut);
  const brandHide = part === 5 ? ramp(pt, 7.0, 0.3) : 0;
  const n = P.hook.length;
  const lh = 62, y0 = 410 - ((n - 1) * lh) / 2;
  return (
    <g>
      {hookOut < 1 && P.hook.map((l, i) => {
        const k = easeOut((pt - 0.12 - i * 0.12) / 0.45);
        return (
          <text key={i} x={540} y={y0 + i * lh + (1 - k) * 26 - hookOut * 30} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={n > 2 ? 46 : 52}
            fill={i === n - 1 ? C.greenD : C.ink} opacity={k * (1 - hookOut)}>{l}</text>
        );
      })}
      {headIn > 0 && (
        <g opacity={headIn * (1 - brandHide)} transform={`translate(0 ${(1 - headIn) * 18})`}>
          <g transform={`translate(540 ${lerp(362, 352, endK)})`}>
            <rect x={-82} y={-21} width={164} height={42} rx={21} fill={C.green} />
            <text y={9} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={24} letterSpacing={3} fill="#fff">STEP {part + 1}</text>
          </g>
          <text x={540} y={428 - endA * 14} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={40} letterSpacing={2} fill={C.ink} opacity={1 - endA}>{P.title}</text>
          <text x={540} y={434 + (1 - endB) * 16} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={50} fill={C.greenD} opacity={endB}>{P.end}</text>
        </g>
      )}
    </g>
  );
};

const Footer: React.FC<{ t: number }> = ({ t }) => (
  <g opacity={ramp(t, 0.4, 0.6) * (1 - ramp(t, 56.8, 0.4)) * 0.85}>
    <line x1={300} y1={1712} x2={780} y2={1712} stroke={C.line} strokeWidth={2} />
    <text x={540} y={1762} textAnchor="middle" fontFamily={HEAD} fontWeight={700} fontSize={26} letterSpacing={3} fill={C.mute}>COLLECT RESPONSIBLY · RECYCLE BETTER</text>
  </g>
);

/** a part's scene, cross-faded with a slight push at the 10 s seams */
const Slot: React.FC<{ i: number; t: number; children: (pt: number) => React.ReactNode }> = ({ i, t, children }) => {
  const a = i * 10, b = a + 10;
  if (t < a - 0.35 || t > b + 0.35) return null;
  const kin = i === 0 ? 1 : ramp(t, a - 0.3, 0.55);
  const kout = i === 5 ? 0 : ramp(t, b - 0.25, 0.55);
  const s = lerp(0.965, 1, easeOut(kin)) * (1 + 0.05 * kout);
  return <g opacity={kin * (1 - kout)} transform={`translate(540 940) scale(${s}) translate(-540 -900)`}>{children(t - a)}</g>;
};

/** soft green sweep at every seam so the parts read as one journey */
const Seam: React.FC<{ t: number }> = ({ t }) => {
  const i = Math.round(t / 10);
  if (i < 1 || i > 5) return null;
  const d = t - i * 10;
  if (Math.abs(d) > 0.4) return null;
  const p = (d + 0.4) / 0.8;
  return <circle cx={540} cy={900} r={lerp(60, 1300, easeOut(p))} fill="none" stroke={C.lime} strokeWidth={lerp(40, 4, p)} opacity={0.22 * (1 - p)} />;
};

export const Journey: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => { Promise.all([fontsReady, bwReady]).then(() => continueRender(handle)); }, [handle]);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="jDots" width={36} height={36} patternUnits="userSpaceOnUse"><circle cx={2} cy={2} r={2} fill="#C9D3D6" opacity={0.5} /></pattern>
          <radialGradient id="jHi" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stopColor="#FFFFFF" stopOpacity={0.95} /><stop offset="1" stopColor="#FFFFFF" stopOpacity={0} /></radialGradient>
          <radialGradient id="jVig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.62" stopColor="#0E2A1C" stopOpacity={0} /><stop offset="1" stopColor="#0E2A1C" stopOpacity={0.13} /></radialGradient>
          <radialGradient id="jGlow"><stop offset="0" stopColor={C.lime} stopOpacity={0.55} /><stop offset="1" stopColor={C.lime} stopOpacity={0} /></radialGradient>
          <filter id="jSh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#0E2A1C" floodOpacity="0.16" /></filter>
        </defs>
        <rect width={W} height={H} fill="url(#jDots)" />
        <rect width={W} height={H} fill="url(#jHi)" />
        <Slot i={0} t={t}>{(pt) => <Part1 t={pt} />}</Slot>
        <Slot i={1} t={t}>{(pt) => <Part2 t={pt} />}</Slot>
        <Slot i={2} t={t}>{(pt) => <Part3 t={pt} />}</Slot>
        <Slot i={3} t={t}>{(pt) => <Part4 t={pt} />}</Slot>
        <Slot i={4} t={t}>{(pt) => <Part5 t={pt} />}</Slot>
        <Slot i={5} t={t}>{(pt) => <Part6 t={pt} />}</Slot>
        <Seam t={t} />
        <rect width={W} height={H} fill="url(#jVig)" />
        <Footer t={t} />
        <Tracker t={t} />
        <Header t={t} />
      </svg>
      <Captions t={t} />
      <Audio src={staticFile("bwj/mix.wav")} />
    </AbsoluteFill>
  );
};

export { clamp, lerp };
