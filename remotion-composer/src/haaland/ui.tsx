import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY, PLAY, MONO } from "../signal/fonts";
import { C, D, Q, Word, clamp, lerp, smooth, easeOut, backOut, bn, beatPulse, rand } from "./lib";

// ------------------------------------------------------------------ flags
export type FlagCode = "NO" | "EN" | "AT" | "DE" | "BR" | "FR" | "SN" | "CI" | "IQ";
export const Flag: React.FC<{ code: FlagCode; x: number; y: number; w?: number; r?: number }> = ({ code, x, y, w = 120, r = 10 }) => {
  const h = w * 0.66;
  const v3 = (a: string, b: string, c: string) => <>{[a, b, c].map((col, i) => <rect key={i} x={(i * w) / 3} y={0} width={w / 3 + 0.5} height={h} fill={col} />)}</>;
  const h3 = (a: string, b: string, c: string) => <>{[a, b, c].map((col, i) => <rect key={i} x={0} y={(i * h) / 3} width={w} height={h / 3 + 0.5} fill={col} />)}</>;
  const body: Record<FlagCode, React.ReactNode> = {
    NO: <><rect width={w} height={h} fill="#BA0C2F" /><rect x={w * 0.28} width={w * 0.18} height={h} fill="#fff" /><rect y={h * 0.38} width={w} height={h * 0.24} fill="#fff" />
      <rect x={w * 0.32} width={w * 0.1} height={h} fill="#00205B" /><rect y={h * 0.44} width={w} height={h * 0.12} fill="#00205B" /></>,
    EN: <><rect width={w} height={h} fill="#fff" /><rect x={w * 0.43} width={w * 0.14} height={h} fill="#CE1124" /><rect y={h * 0.4} width={w} height={h * 0.2} fill="#CE1124" /></>,
    AT: h3("#ED2939", "#fff", "#ED2939"), DE: h3("#000", "#DD0000", "#FFCE00"), FR: v3("#0055A4", "#fff", "#EF4135"),
    SN: <>{v3("#00853F", "#FDEF42", "#E31B23")}<path transform={`translate(${w / 2} ${h / 2}) scale(${w / 160})`} d="M0 -14 L4 -4 L14 -4 L6 2 L9 12 L0 6 L-9 12 L-6 2 L-14 -4 L-4 -4 Z" fill="#00853F" /></>,
    CI: v3("#F77F00", "#fff", "#009E60"),
    IQ: <>{h3("#CE1126", "#fff", "#000")}<rect x={w * 0.3} y={h * 0.44} width={w * 0.4} height={h * 0.08} rx={3} fill="#007A3D" /></>,
    BR: <><rect width={w} height={h} fill="#009C3B" /><path d={`M${w / 2} ${h * 0.1} L${w * 0.92} ${h / 2} L${w / 2} ${h * 0.9} L${w * 0.08} ${h / 2} Z`} fill="#FFDF00" />
      <circle cx={w / 2} cy={h / 2} r={h * 0.22} fill="#002776" /></>,
  };
  return (
    <g transform={`translate(${x - w / 2} ${y - h / 2})`}>
      <clipPath id={`fc${code}${Math.round(x)}${Math.round(y)}`}><rect width={w} height={h} rx={r} /></clipPath>
      <g clipPath={`url(#fc${code}${Math.round(x)}${Math.round(y)})`}>{body[code]}</g>
      <rect width={w} height={h} rx={r} fill="none" stroke={C.ink} strokeWidth={4} />
    </g>
  );
};

// ------------------------------------------------------------------ background
/** Night-stadium backdrop: gradient, sweeping floodlight beams, pitch lines. */
export const Stadium: React.FC<{ t: number; tint?: string; top?: string; mono?: number }> = ({ t, tint = C.navy, top = C.night, mono = 0 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(${top} 0%, ${tint} 62%, #0A1A3A 100%)`, filter: mono ? `grayscale(${mono})` : undefined }}>
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      {[0, 1, 2, 3].map((i) => {
        const a = Math.sin(t * 0.35 + i * 1.7) * 18 + (i - 1.5) * 22;
        return <path key={i} d="M0 0 L-140 1500 L140 1500 Z" fill="#fff" opacity={0.05} transform={`translate(${120 + i * 280} -60) rotate(${a})`} />;
      })}
      {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={90 + i * 180} cy={70} r={14} fill="#fff" opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 2 + i))} />)}
      <g opacity={0.12} stroke="#fff" strokeWidth={4} fill="none">
        <path d="M-200 1920 L360 1300 L720 1300 L1280 1920" /><line x1={540} y1={1300} x2={540} y2={1920} /><ellipse cx={540} cy={1560} rx={260} ry={90} />
      </g>
      {Array.from({ length: 26 }).map((_, i) => (
        <circle key={i} cx={(rand(i) * 1080 + t * 12 * (0.5 + rand(i + 3))) % 1080} cy={200 + rand(i + 9) * 1500} r={1.5 + rand(i + 2) * 2.5} fill="#fff" opacity={0.25} />
      ))}
    </svg>
  </AbsoluteFill>
);

// ------------------------------------------------------------------ cards / type
export const Card: React.FC<{ t: number; at: number; out?: number; x?: number; y: number; children: React.ReactNode; bg?: string; color?: string; size?: number; rot?: number; w?: number; from?: "l" | "r" | "u" }> =
  ({ t, at, out = Infinity, x = 540, y, children, bg = "#fff", color = C.ink, size = 56, rot = 0, w, from = "u" }) => {
    if (t < at - 0.05) return null;
    const k = backOut((t - at) / 0.32);
    const o = clamp((t - at + 0.05) / 0.1) * (1 - smooth((t - out) / 0.25));
    if (o <= 0) return null;
    const off = (1 - clamp(k)) * (from === "l" ? -500 : from === "r" ? 500 : 0);
    return (
      <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) translateX(${off}px) rotate(${rot}deg) scale(${from === "u" ? lerp(0.4, 1, k) : 1})`, opacity: o,
        background: bg, color, fontFamily: DISPLAY, fontWeight: 800, fontSize: size, lineHeight: 1.25, padding: `${size * 0.3}px ${size * 0.55}px`, borderRadius: size * 0.45,
        boxShadow: `0 10px 0 rgba(0,0,0,0.35)`, border: `5px solid ${C.ink}`, textAlign: "center", width: w, whiteSpace: w ? "normal" : "nowrap" }}>{children}</div>
    );
  };

// ------------------------------------------------------------------ chrome
export const Brand: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: 40, top: 120, display: "flex", alignItems: "center", gap: 14, background: C.red, border: `4px solid ${C.ink}`, borderRadius: 40,
    padding: "8px 26px 12px", boxShadow: "0 6px 0 rgba(0,0,0,0.35)", fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, color: "#fff",
    transform: `scale(${1 + beatPulse(t, 10) * 0.03})`, opacity: smooth((t - 0.3) / 0.4) }}>
    ১০০ সেকেন্ডে শিখি <span style={{ fontSize: 36 }}>🔥</span>
  </div>
);

const TIMER_END = Q.o_end + 0.6;
export const Timer: React.FC<{ t: number }> = ({ t }) => {
  const left = Math.max(0, TIMER_END - t);
  const s = Math.ceil(left - 1e-6);
  const txt = `${bn(Math.floor(s / 60))}:${bn(String(s % 60).padStart(2, "0"))}`;
  const k = 1 - left / TIMER_END;
  const R = 74, L = 2 * Math.PI * R;
  const done = left <= 0.001;
  const tick = Math.exp(-((t % 1) * 9));
  return (
    <div style={{ position: "absolute", right: 36, top: 92, width: 190, height: 190, opacity: smooth((t - 0.3) / 0.4) }}>
      <svg width={190} height={190}>
        <circle cx={95} cy={95} r={86} fill={C.ink} stroke="#fff" strokeWidth={5} />
        <circle cx={95} cy={95} r={R} fill="none" stroke="#2A3150" strokeWidth={14} />
        <circle cx={95} cy={95} r={R} fill="none" stroke={done ? C.red : left < 15 ? C.orange : C.green} strokeWidth={14} strokeLinecap="round"
          strokeDasharray={L} strokeDashoffset={L * k} transform="rotate(-90 95 95)" />
        <line x1={95} y1={2} x2={95} y2={-10} stroke="#fff" strokeWidth={10} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 52,
        color: done ? C.red : "#fff", transform: `scale(${1 + (done ? 0 : tick * 0.04)})` }}>{txt}</div>
    </div>
  );
};

// ------------------------------------------------------------------ captions
type Chunk = { s: number; e: number; words: Word[] };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  const push = () => { if (cur.length) out.push({ s: cur[0].s, e: cur[cur.length - 1].e, words: cur }); cur = []; };
  D.words.forEach((w, i) => {
    const prev = D.words[i - 1];
    const len = cur.reduce((n, x) => n + x.w.length + 1, 0);
    if (cur.length && (prev.sec !== w.sec || w.s - prev.e > 0.32 || cur.length >= 5 || len + w.w.length > 26)) push();
    cur.push(w);
  });
  push();
  for (let i = 0; i < out.length - 1; i++) out[i].e = Math.min(out[i].e + 0.35, out[i + 1].s);
  return out;
})();

export const Captions: React.FC<{ t: number; y?: number }> = ({ t, y = 1440 }) => {
  const c = CHUNKS.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!c) return null;
  const k = easeOut((t - c.s + 0.05) / 0.15);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: y, display: "flex", justifyContent: "center", transform: `translateY(${(1 - k) * 18}px)`, opacity: k }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px", padding: "12px 30px 18px", borderRadius: 22,
        background: "rgba(8,10,24,0.72)", fontFamily: DISPLAY, fontWeight: 800, fontSize: 66, lineHeight: 1.3 }}>
        {c.words.map((w, i) => {
          const live = t >= w.s && t < w.e + 0.06, done = t >= w.e + 0.06;
          return <span key={i} style={{ color: live ? C.gold : done ? "#fff" : "rgba(255,255,255,0.55)", transform: `scale(${live ? 1.08 : 1})`, display: "inline-block",
            textShadow: "0 4px 0 rgba(0,0,0,0.5)" }}>{w.w}</span>;
        })}
      </div>
    </div>
  );
};

export { rand, PLAY, MONO };
