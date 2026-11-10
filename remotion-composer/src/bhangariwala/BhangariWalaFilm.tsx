import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";
import { Part1 } from "./part1";
import { Part2 } from "./part2";
import { Part3 } from "./part3";
import { LogoMark } from "./icons";
import { C, D, FPS, SANS, Word, clamp, easeOut, fontsReady, logoReady, ramp } from "./lib";

// "Bangladesh E-Waste -> BhangariWala" animated explainer: three 10 s parts
// in one continuous 30 s film (1080x1920). Each part also stands alone when
// cut at 10 s / 20 s.

const TITLES = ["BANGLADESH E-WASTE", "WHERE IT BEGINS", "A RESPONSIBLE JOURNEY"];

type Chunk = { s: number; e: number; words: Word[] };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  const push = () => { if (cur.length) out.push({ s: cur[0].s, e: cur[cur.length - 1].e, words: cur }); cur = []; };
  D.words.forEach((w, i) => {
    const prev = D.words[i - 1];
    const len = cur.reduce((n, x) => n + x.w.length + 1, 0);
    if (cur.length && (prev.part !== w.part || w.s - prev.e > 0.25 || cur.length >= 4 || len + w.w.length > 30 || /[,।?]$/.test(prev.w))) push();
    cur.push(w);
  });
  push();
  for (let i = 0; i < out.length; i++) out[i].e = Math.min(out[i].e + 0.3, out[i + 1]?.s ?? out[i].e + 0.3);
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CHUNKS.find((x) => t >= x.s - 0.04 && t < x.e);
  if (!c) return null;
  const k = easeOut((t - c.s + 0.04) / 0.14);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 1392, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${(1 - k) * 12}px)` }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 14px", padding: "10px 28px 14px", borderRadius: 20,
        background: "rgba(30,42,48,0.88)", fontFamily: SANS, fontWeight: 700, fontSize: 46, lineHeight: 1.35, boxShadow: "0 8px 24px rgba(14,42,28,0.18)" }}>
        {c.words.map((w, i) => {
          const live = t >= w.s && t < w.e + 0.05, done = t >= w.e + 0.05;
          return <span key={i} style={{ color: live ? "#7BD389" : done ? "#fff" : "rgba(255,255,255,0.55)" }}>{w.w}</span>;
        })}
      </div>
    </div>
  );
};

const Chrome: React.FC<{ t: number }> = ({ t }) => {
  const part = t < 10 ? 0 : t < 20 ? 1 : 2;
  const pt = t - part * 10;
  const k = ramp(pt, 0.25, 0.4) * (1 - ramp(pt, 9.55, 0.3));
  const mini = 1 - ramp(t, 20.0, 0.3);
  return (
    <g>
      <g transform="translate(540 236)" opacity={k}>
        <rect x={-250} y={-24} width={500} height={48} rx={24} fill={C.paper} stroke={C.line} strokeWidth={2} />
        <circle cx={-222} cy={0} r={8} fill={C.green} />
        <text x={-202} y={8} fontFamily={SANS} fontWeight={700} fontSize={21} letterSpacing={2.4} fill={C.ink}>PART {part + 1}/3<tspan fill={C.mute} dx={14}>{TITLES[part]}</tspan></text>
      </g>
      {mini > 0 && <g transform="translate(940 236) scale(0.27)" opacity={mini * ramp(t, 0.3, 0.4)}><LogoMark /></g>}
    </g>
  );
};

export const BhangariWalaFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => { Promise.all([fontsReady, logoReady]).then(() => continueRender(handle)); }, [handle]);
  const bright = ramp(t, 20.1, 0.8);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="bwDots" width={36} height={36} patternUnits="userSpaceOnUse"><circle cx={2} cy={2} r={2} fill="#C9D3D6" opacity={0.55} /></pattern>
          <radialGradient id="bwHi" cx="0.5" cy="0.42" r="0.7"><stop offset="0" stopColor="#FFFFFF" stopOpacity={0.95} /><stop offset="1" stopColor="#FFFFFF" stopOpacity={0} /></radialGradient>
          <radialGradient id="bwGlow" cx="0.5" cy="0.45" r="0.55"><stop offset="0" stopColor={C.mint} stopOpacity={0.9} /><stop offset="1" stopColor={C.mint} stopOpacity={0} /></radialGradient>
          <radialGradient id="bwVig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#0E2A1C" stopOpacity={0} /><stop offset="1" stopColor="#0E2A1C" stopOpacity={0.14} /></radialGradient>
          <linearGradient id="bwSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#EAF4F0" /><stop offset="1" stopColor="#F7FAF9" /></linearGradient>
          <filter id="bwVBlur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="0 5" /></filter>
        </defs>
        <rect width={1080} height={1920} fill="url(#bwDots)" opacity={1 - bright * 0.6} />
        <rect width={1080} height={1920} fill="url(#bwHi)" />
        <rect width={1080} height={1920} fill="url(#bwGlow)" opacity={bright} />
        {t < 10.3 && <Part1 t={t} />}
        {t >= 9.99 && t < 20.5 && <Part2 t={t} />}
        {t >= 20 && <Part3 t={t} />}
        <Chrome t={t} />
        <rect width={1080} height={1920} fill="url(#bwVig)" />
      </svg>
      <Captions t={t} />
    </AbsoluteFill>
  );
};

export { clamp };
