import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY, PLAY, MONO } from "../signal/fonts";
import { Hero, P } from "./cast";
import { Flag, FlagCode } from "./ui";
import { C, Q, clamp, lerp, smooth, easeOut, backOut, ramp, win, pulse, rand, bn, beatPulse } from "./lib";

// The story, told as scenes rather than cards. Rubel (cartoon host) frames
// it — he opens on his phone, returns with his notebook for the lessons and
// closes it — and between, the boy from Bryne lives it: a Leeds night in
// 2000, snowy Bryne, the youth pitch where he's the smallest, a staircase
// through five cities, a record season, his routine against ours, the rainy
// years of waiting, and the 2026 World Cup on one stadium's big screen.
// The script's on-screen lines appear inside the world (signs, the
// scoreboard, a calendar, the notebook) or as a chapter's closing stamp.

export type SP = { t: number };
const W = 1080, H = 1920;

// --------------------------------------------------------------- helpers
const Cam: React.FC<{ t: number; a: number; b: number; from?: [number, number, number]; to?: [number, number, number]; children: React.ReactNode }> =
  ({ t, a, b, from = [1, 0, 0], to = [1.08, 0, 0], children }) => {
    const k = smooth((t - a) / (b - a));
    const s = lerp(from[0], to[0], k), x = lerp(from[1], to[1], k), y = lerp(from[2], to[2], k);
    return <g transform={`translate(${W / 2 + x} ${H / 2 + y}) scale(${s}) translate(${-W / 2} ${-H / 2})`}>{children}</g>;
  };

const Grad: React.FC<{ id: string; a: string; b: string; c?: string }> = ({ id, a, b, c }) => (
  <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} />{c && <stop offset="0.6" stopColor={b} />}<stop offset="1" stopColor={c ?? b} /></linearGradient></defs>
);

const Stamp: React.FC<{ t: number; at: number; out?: number; y?: number; children: React.ReactNode; bg?: string; color?: string; size?: number; rot?: number }> =
  ({ t, at, out = Infinity, y = 330, children, bg = "#FFF6E6", color = C.ink, size = 50, rot = -2 }) => {
    if (t < at) return null;
    const k = backOut((t - at) / 0.3), o = clamp((t - at) / 0.08) * (1 - smooth((t - out) / 0.25));
    if (o <= 0) return null;
    return (
      <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", opacity: o }}>
        <div style={{ transform: `rotate(${rot}deg) scale(${lerp(1.6, 1, k)})`, background: bg, color, border: `5px solid ${C.ink}`, borderRadius: 18,
          padding: `${size * 0.25}px ${size * 0.5}px ${size * 0.35}px`, fontFamily: DISPLAY, fontWeight: 800, fontSize: size, boxShadow: "0 8px 0 rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>{children}</div>
      </div>
    );
  };

const Bubble: React.FC<{ t: number; at: number; out?: number; x: number; y: number; children: React.ReactNode; size?: number; tail?: "l" | "r" }> =
  ({ t, at, out = Infinity, x, y, children, size = 48, tail = "l" }) => {
    if (t < at) return null;
    const k = backOut((t - at) / 0.25), o = 1 - smooth((t - out) / 0.2);
    if (o <= 0) return null;
    return (
      <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-100%) scale(${k})`, transformOrigin: tail === "l" ? "20% 100%" : "80% 100%", opacity: o,
        background: "#fff", border: `5px solid ${C.ink}`, borderRadius: 30, padding: `${size * 0.25}px ${size * 0.5}px ${size * 0.35}px`,
        fontFamily: DISPLAY, fontWeight: 800, fontSize: size, color: C.ink, whiteSpace: "nowrap", boxShadow: "0 6px 0 rgba(0,0,0,0.3)" }}>{children}</div>
    );
  };

export const Chapter: React.FC<{ t: number; at: number; n?: string; title: string }> = ({ t, at, n, title }) => {
  const o = win(t, at + 0.05, at + 2.2, 0.35);
  if (o <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ transform: `translateY(${(1 - easeOut((t - at) / 0.4)) * -30}px)`, display: "flex", alignItems: "center", gap: 18, background: "rgba(8,10,24,0.78)",
        border: `3px solid ${C.gold}`, borderRadius: 14, padding: "10px 30px 16px", fontFamily: DISPLAY, fontWeight: 800, color: "#fff", fontSize: 44 }}>
        {n && <span style={{ color: C.gold }}>অধ্যায় {n}</span>}{n && <span style={{ opacity: 0.6 }}>·</span>}{title}
      </div>
    </div>
  );
};

const Ball: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 40, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle r={r} fill="#fff" stroke={C.ink} strokeWidth={r * 0.12} />
    <path d={`M0 ${-r * 0.35} L${r * 0.33} ${-r * 0.1} L${r * 0.2} ${r * 0.3} L${-r * 0.2} ${r * 0.3} L${-r * 0.33} ${-r * 0.1} Z`} fill={C.ink} />
    {[0, 72, 144, 216, 288].map((a) => <line key={a} x1={0} y1={-r * 0.35} x2={0} y2={-r * 0.95} stroke={C.ink} strokeWidth={r * 0.08} transform={`rotate(${a})`} />)}
  </g>
);

const Goal: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width={w} height={h} fill="rgba(255,255,255,0.08)" />
    {Array.from({ length: Math.floor(w / 28) }).map((_, i) => <line key={i} x1={i * 28} y1={0} x2={i * 28} y2={h} stroke="#fff" strokeWidth={2} opacity={0.4} />)}
    {Array.from({ length: Math.floor(h / 28) }).map((_, i) => <line key={i} x1={0} y1={i * 28} x2={w} y2={i * 28} stroke="#fff" strokeWidth={2} opacity={0.4} />)}
    <path d={`M0 ${h} L0 0 L${w} 0 L${w} ${h}`} stroke="#fff" strokeWidth={12} fill="none" />
  </g>
);

const Trophy: React.FC<{ x: number; y: number; s?: number; col?: string }> = ({ x, y, s = 1, col = C.gold }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-60 -170 L60 -170 Q60 -70 0 -60 Q-60 -70 -60 -170 Z" fill={col} stroke={C.ink} strokeWidth={7} />
    <path d="M-60 -150 Q-110 -150 -95 -110 Q-85 -85 -55 -95 M60 -150 Q110 -150 95 -110 Q85 -85 55 -95" stroke={C.ink} strokeWidth={7} fill="none" />
    <rect x={-12} y={-62} width={24} height={40} fill={col} stroke={C.ink} strokeWidth={6} />
    <rect x={-50} y={-24} width={100} height={24} rx={6} fill={col} stroke={C.ink} strokeWidth={6} />
  </g>
);

const Rain: React.FC<{ t: number; amt?: number }> = ({ t, amt = 1 }) => (
  <g opacity={amt}>
    {Array.from({ length: 90 }).map((_, i) => {
      const y = ((t * 1100 * (0.7 + rand(i) * 0.6) + rand(i + 4) * 2100) % 2100) - 100;
      const x = rand(i + 9) * 1180 - y * 0.12;
      return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 70} stroke="#C9D6FF" strokeWidth={3} opacity={0.45} />;
    })}
  </g>
);

const Crowd: React.FC<{ t: number; y: number; h: number; cols?: string[]; cheer?: number }> = ({ t, y, h, cols = ["#BA0C2F", "#fff", "#00205B", C.gold], cheer = 0 }) => (
  <g>
    <rect x={0} y={y} width={W} height={h} fill="#141A33" />
    {Array.from({ length: Math.floor(h / 34) }).map((_, r) => Array.from({ length: 34 }).map((_, c) => {
      const i = r * 34 + c;
      const jump = cheer * Math.max(0, Math.sin(t * 9 + i * 0.7)) * 10;
      return <circle key={i} cx={16 + c * 32 + (r % 2) * 16} cy={y + 20 + r * 34 - jump} r={11} fill={cols[Math.floor(rand(i) * cols.length)]} opacity={0.85} />;
    }))}
  </g>
);

const Pitch: React.FC<{ y: number; night?: boolean }> = ({ y, night }) => (
  <g>
    <rect x={0} y={y} width={W} height={H - y} fill={night ? "#1E6B3A" : "#3FA34D"} />
    {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={0} y={y + i * ((H - y) / 6)} width={W} height={(H - y) / 12} fill="#000" opacity={0.06} />)}
    <path d={`M-100 ${H} L300 ${y + 40} L780 ${y + 40} L1180 ${H}`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.5} />
  </g>
);

const Floodlights: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {[0, 1, 2, 3].map((i) => <path key={i} d="M0 0 L-160 1300 L160 1300 Z" fill="#fff" opacity={0.05} transform={`translate(${120 + i * 280} -40) rotate(${Math.sin(t * 0.4 + i) * 12 + (i - 1.5) * 18})`} />)}
    {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={90 + i * 180} cy={110} r={16} fill="#fff" opacity={0.6 + 0.4 * Math.abs(Math.sin(t * 2 + i))} />)}
  </g>
);

const Scoreboard: React.FC<{ x: number; y: number; a: FlagCode; b: FlagCode; sa?: string; sb?: string; mid?: string; clock?: string; glow?: number }> = ({ x, y, a, b, sa, sb, mid, clock, glow = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-330} y={-90} width={660} height={180} rx={20} fill="#0B0B14" stroke={glow > 0.05 ? C.gold : "#666"} strokeWidth={8} />
    <Flag code={a} x={-230} y={0} w={120} r={8} /><Flag code={b} x={230} y={0} w={120} r={8} />
    <text x={0} y={28} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={mid ? 70 : 96} fill={C.gold}>{mid ?? `${sa}–${sb}`}</text>
    {clock && <text x={0} y={-50} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill="#fff">{clock}</text>}
  </g>
);

// =================================================================== INTRO
// Rubel at his desk at night, the neon "১০০ সেকেন্ডে শিখি" sign behind him.
// He shows the trend on his phone, then turns the phone round: the story
// starts inside it.
const RubelRoom: React.FC<{ t: number; dark?: number; neon?: number }> = ({ t, dark = 0, neon = 1 }) => (
  <g>
    <Grad id="rr" a="#2B2050" b="#1A1436" />
    <rect width={W} height={H} fill="url(#rr)" />
    <rect x={640} y={420} width={330} height={300} fill="#0E1650" stroke={C.ink} strokeWidth={10} />
    <circle cx={880} cy={500} r={34} fill={C.cream} opacity={0.9} /><circle cx={895} cy={490} r={30} fill="#0E1650" />
    <g transform="translate(110 420) rotate(-3)"><rect width={220} height={300} fill={C.sky} stroke={C.ink} strokeWidth={6} />
      <circle cx={110} cy={130} r={60} fill="#fff" stroke={C.ink} strokeWidth={5} /><text x={110} y={260} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill={C.ink}>⚽ ৯</text></g>
    <rect x={0} y={1380} width={W} height={540} fill="#3A2A20" />
    <rect x={60} y={1350} width={960} height={40} rx={8} fill="#6A4A30" stroke={C.ink} strokeWidth={6} />
    <AbsoluteFillish dark={dark} />
  </g>
);
const AbsoluteFillish: React.FC<{ dark: number }> = ({ dark }) => (dark > 0 ? <rect width={W} height={H} fill="#000" opacity={dark} /> : null);

export const Intro: React.FC<SP> = ({ t }) => {
  const neonOn = t >= Q.title;
  const flick = neonOn ? (t - Q.title < 0.4 ? (Math.floor((t - Q.title) * 20) % 2 ? 0.3 : 1) : 1) : 0.15;
  const phoneUp = ramp(t, Q.search - 0.2, 0.4);
  const turn = ramp(t, Q.name - 0.3, 0.35);
  const dive = Math.pow(clamp((t - (Q.sec_child - 1.1)) / 1.1), 2.4);
  const typed = "Erling Haaland".slice(0, Math.max(0, Math.floor((t - Q.search - 0.3) * 9)));
  const px = 720, py = lerp(1180, 900, phoneUp);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <g transform={`translate(${px} ${py + 120}) scale(${lerp(1, 6, dive)}) translate(${-px} ${-(py + 120)})`}>
          <RubelRoom t={t} />
          {/* neon sign */}
          <g opacity={flick}>
            <rect x={150} y={250} width={780} height={130} rx={65} fill="none" stroke={C.red} strokeWidth={10} />
            <text x={540} y={340} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={74} fill="#FFE3E3" stroke={C.red} strokeWidth={3}>১০০ সেকেন্ডে শিখি 🔥</text>
          </g>
          <Hero x={420} y={1380} s={2.1} outfit="host" pose={t < Q.search ? { ...P.stand(), armF: [1.55, 0.05] } : { ...P.stand(), armF: [2.1, 1.3] }}
            face={{ mouth: t < Q.search ? "grin" : turn > 0.5 ? "grin" : "o", eyes: turn > 0.5 ? "open" : "wide", look: 0.5 }} />
          {/* the phone */}
          {phoneUp > 0 && (
            <g transform={`translate(${px} ${py}) scale(${lerp(0.4, 1, phoneUp) * lerp(1, -1, Math.min(turn, 0.5) * 2) * (turn > 0.5 ? -1 : 1)} ${lerp(0.4, 1, phoneUp)})`}>
              <rect x={-150} y={-260} width={300} height={520} rx={36} fill="#111" stroke={C.ink} strokeWidth={6} />
              <rect x={-134} y={-240} width={268} height={480} rx={22} fill={turn > 0.5 ? "#0B1026" : "#fff"} />
              {turn <= 0.5 ? (
                <g>
                  <rect x={-120} y={-220} width={240} height={50} rx={25} fill="#EEE" />
                  <text x={-104} y={-186} fontFamily={MONO} fontSize={22} fill={C.ink}>🔍 {typed}</text>
                  {[0.25, 0.35, 0.3, 0.5, 0.65, 0.8, 1].map((h, i) => <rect key={i} x={-110 + i * 32} y={140 - 260 * h * ramp(t, Q.search + 0.6 + i * 0.1, 0.25)} width={24} height={260 * h * ramp(t, Q.search + 0.6 + i * 0.1, 0.25)} fill={i === 6 ? C.red : C.sky} />)}
                  <text x={0} y={200} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill={C.red}>#১ সার্চ</text>
                </g>
              ) : (
                <g>
                  <Hero x={0} y={150} s={0.95} outfit="kit" bun num="9" pose={{ ...P.stand(), armB: [-2.6, -0.3], armF: [2.6, 0.3] }} face={{ mouth: "grin" }} />
                  <text x={0} y={210} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill="#fff">আর্লিং হালান্ড</text>
                </g>
              )}
            </g>
          )}
        </g>
      </svg>
      <AbsoluteFill style={{ background: "#fff", opacity: Math.max(0, dive - 0.7) * 3 }} />
    </AbsoluteFill>
  );
};

// =================================================================== CHILD
// Leeds, 2000: a lit window, a baby. Snowy Bryne. Dad's framed photo. The
// youth pitch: the smallest boy. Team photo — and the same photo years later.
export const Child: React.FC<SP> = ({ t }) => {
  const s0 = Q.sec_child - 0.3;
  if (t < Q.bryne - 0.1) {
    return (
      <AbsoluteFill>
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <Cam t={t} a={s0} b={Q.bryne} from={[1, 0, 0]} to={[1.25, -60, 120]}>
            <Grad id="ln" a="#0E1435" b="#2A2350" />
            <rect width={W} height={H} fill="url(#ln)" />
            {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={rand(i) * W} cy={rand(i + 3) * 700} r={2} fill="#fff" opacity={0.6} />)}
            {Array.from({ length: 6 }).map((_, i) => (
              <g key={i} transform={`translate(${i * 190 - 30} ${820 + (i % 2) * 30})`}>
                <rect width={190} height={1100} fill="#8A3B2A" stroke={C.ink} strokeWidth={5} />
                {Array.from({ length: 16 }).map((_, j) => <line key={j} x1={0} y1={j * 26} x2={190} y2={j * 26} stroke="#6A2A1E" strokeWidth={2} />)}
                <path d="M-10 0 L95 -90 L200 0 Z" fill="#3A2A2A" stroke={C.ink} strokeWidth={5} />
                <rect x={40} y={110} width={110} height={130} fill={i === 3 ? "#FFD27A" : "#2A2F55"} stroke={C.ink} strokeWidth={5} />
              </g>
            ))}
            {/* inside the lit window: a crib */}
            <g transform="translate(615 935)">
              <rect x={-40} y={20} width={80} height={44} rx={8} fill="#fff" stroke={C.ink} strokeWidth={4} />
              <circle cx={-10} cy={20} r={16} fill={C.nordSkin} stroke={C.ink} strokeWidth={3} /><path d="M-18 6 q8 -10 16 0" stroke={C.blond} strokeWidth={6} fill="none" />
            </g>
            <g transform="translate(150 640)"><rect width={170} height={70} rx={10} fill="#1B5E20" stroke="#fff" strokeWidth={5} />
              <text x={85} y={50} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill="#fff">LEEDS</text></g>
            <g transform="translate(720 600)"><rect width={190} height={120} rx={10} fill="#fff" stroke={C.ink} strokeWidth={5} /><rect width={190} height={34} rx={10} fill={C.red} />
              <text x={95} y={100} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={58} fill={C.ink}>২০০০</text></g>
          </Cam>
        </svg>
        <Chapter t={t} at={s0} n="১" title="ছোট্ট শুরু" />
      </AbsoluteFill>
    );
  }
  if (t < Q.easy - 0.1) {
    const inHouse = t >= Q.dad - 0.1;
    return (
      <AbsoluteFill>
        <svg width={W} height={H} style={{ position: "absolute" }}>
          {!inHouse ? (
            <Cam t={t} a={Q.bryne} b={Q.dad} from={[1.1, 120, 0]} to={[1, -40, 0]}>
              <Grad id="by" a="#9CC9EE" b="#E8F2FA" />
              <rect width={W} height={H} fill="url(#by)" />
              <path d="M-100 1000 Q200 700 500 950 Q750 680 1200 960 L1200 1920 L-100 1920 Z" fill="#E9EEF5" stroke="#B8C6D8" strokeWidth={4} />
              {Array.from({ length: 5 }).map((_, i) => (
                <g key={i} transform={`translate(${60 + i * 210} ${1080 + (i % 2) * 40})`}>
                  <rect width={160} height={140} fill="#B3261E" stroke={C.ink} strokeWidth={5} /><path d="M-14 0 L80 -70 L174 0 Z" fill="#fff" stroke={C.ink} strokeWidth={5} />
                  <rect x={60} y={70} width={40} height={70} fill="#5A2A1E" />
                </g>
              ))}
              {Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M${i * 170} 1330 l40 -120 l40 120 Z`} fill="#2E5A3A" stroke={C.ink} strokeWidth={4} />)}
              <rect x={0} y={1320} width={W} height={600} fill="#F4F7FB" />
              <g transform="translate(820 1180)"><rect x={-6} y={0} width={12} height={150} fill="#555" /><rect x={-110} y={-60} width={220} height={70} rx={8} fill="#1D4E89" stroke="#fff" strokeWidth={5} />
                <text x={0} y={-12} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={42} fill="#fff">BRYNE</text></g>
              <Hero x={lerp(160, 460, clamp((t - Q.bryne) / 1.2))} y={1460} s={1.05} outfit="kit" bun pose={P.walk(t * 9)} face={{ mouth: "smile" }} />
              <Ball x={lerp(230, 530, clamp((t - Q.bryne) / 1.2))} y={1440} r={22} rot={t * 500} />
              {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={(rand(i) * W + t * 20) % W} cy={((t * 80 + rand(i + 7) * 1920) % 1920)} r={4} fill="#fff" />)}
            </Cam>
          ) : (
            <Cam t={t} a={Q.dad} b={Q.easy} from={[1, 0, 0]} to={[1.15, 0, -120]}>
              <rect width={W} height={H} fill="#E9D8B4" />
              <rect x={0} y={1350} width={W} height={570} fill="#9A6A42" />
              <g transform="translate(540 760)">
                <rect x={-210} y={-260} width={420} height={500} fill="#6A4028" stroke={C.ink} strokeWidth={8} />
                <rect x={-180} y={-230} width={360} height={440} fill="#7FB3E0" />
                <Hero x={0} y={200} s={1.25} outfit="kit" pose={{ ...P.stand(), armF: [2.4, 0.3] }} face={{ mouth: "grin" }} />
                <rect x={-130} y={250} width={260} height={50} fill="#F2E6CF" stroke={C.ink} strokeWidth={4} />
                <text x={0} y={285} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={30} fill={C.ink}>বাবা · প্রিমিয়ার লিগ</text>
              </g>
              <Hero x={420} y={1500} s={1.25} outfit="kit" bun flip={false} pose={{ ...P.stand(), armF: [0.9, 0.9] }} face={{ mouth: "o", look: 0.6, eyes: "wide" }} />
              <Ball x={470} y={1360} r={26} />
            </Cam>
          )}
        </svg>
      </AbsoluteFill>
    );
  }
  // the youth pitch
  const giant = easeOut((t - Q.giant) / 1.2);
  const photo = t >= Q.small - 0.1;
  const flash = pulse(t, Q.small, 10) + pulse(t, Q.giant + 0.3, 10);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <Grad id="yp" a="#8EC5F0" b="#DCEFFC" />
        <rect width={W} height={H} fill="url(#yp)" />
        <Pitch y={1000} />
        {!photo ? (
          <g>
            {[0, 1, 2].map((i) => {
              const x = lerp(1200, -200, clamp((t - Q.easy - i * 0.2) / 1.6));
              return <Hero key={i} x={x} y={1450 + i * 40} s={1.5} outfit="kid" pose={P.run(t * 12 + i)} face={{ mouth: "grin" }} />;
            })}
            <g transform={`translate(560 1480) rotate(${t > Q.easy + 0.7 ? -80 * easeOut((t - Q.easy - 0.7) / 0.3) : 0})`}>
              <Hero x={0} y={0} s={1.0} outfit="kit" bun pose={P.shock()} face={{ eyes: "wide", mouth: "o" }} />
            </g>
          </g>
        ) : (
          <g>
            {[0, 1, 3, 4].map((i) => (
              <Hero key={i} x={130 + i * 205} y={1500} s={1.45 * (1 - giant * 0.12)} outfit="kid" pose={P.stand()} face={{ mouth: giant > 0.5 ? "o" : "smile", eyes: giant > 0.5 ? "wide" : "open", look: giant > 0.5 ? (i < 2 ? 1 : -1) : 0 }} />
            ))}
            <Hero x={540} y={1500} s={lerp(0.85, 2.7, giant)} outfit="kit" bun pose={giant > 0.6 ? { ...P.stand(), armB: [-0.5, 0.2], armF: [0.5, -0.2] } : P.stand()} face={{ mouth: giant > 0.5 ? "grin" : "flat" }} />
            <g transform="translate(540 560)">
              <rect x={-110} y={-70} width={220} height={140} rx={16} fill="#333" stroke={C.ink} strokeWidth={6} /><circle r={46} fill="#111" stroke="#888" strokeWidth={8} />
            </g>
            <text x={540} y={420} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={54} fill={C.ink}>{giant > 0.3 ? "কয়েক বছর পর…" : "টিম ফটো · ব্রাইন"}</text>
          </g>
        )}
      </svg>
      <AbsoluteFill style={{ background: "#fff", opacity: Math.min(0.8, flash) }} />
      <Stamp t={t} at={Q.giant + 1.0} y={330} size={46}>ছোট দিয়ে শুরু ≠ ছোট হয়ে থাকা</Stamp>
    </AbsoluteFill>
  );
};

// ================================================================== STAIRS
// One staircase climbing through five places — Bryne's pitch, Molde's
// fjord, Salzburg's Alps, Dortmund's yellow wall, Manchester's rain. A sign
// with a flag on each step. The lift beside it is out of order — he
// doesn't even look.
const CLUBS: [string, FlagCode, string, string, string][] = [
  ["ব্রাইন", "NO", "s_bryne", "#9CC9EE", "#E8F2FA"], ["মোল্ডে", "NO", "s_molde", "#5E8FBF", "#B9D7EE"],
  ["সালজবুর্গ", "AT", "s_salz", "#8FB8E8", "#F2F6FA"], ["ডর্টমুন্ড", "DE", "s_dort", "#2B2B2B", "#FFD400"], ["ম্যান সিটি", "EN", "s_city", "#5A6A80", "#A8B8CC"],
];
export const Stairs: React.FC<SP> = ({ t }) => {
  let step = -1;
  CLUBS.forEach(([, , k], i) => { if (t >= Q[k]) step = i; });
  const s0 = Q.sec_stairs - 0.3;
  const sx = (i: number) => 110 + i * 200, sy = (i: number) => 1500 - i * 190;
  const at = step >= 0 ? Q[CLUBS[step][2]] : s0;
  const k = easeOut((t - at) / 0.4);
  const prev = Math.max(0, step - 1);
  const px = step < 0 ? 60 : lerp(sx(prev) + 100, sx(step) + 100, k);
  const py = step < 0 ? 1690 : lerp(step === 0 ? 1690 : sy(prev), sy(step), k) - Math.sin(k * Math.PI) * 50;
  const camY = step < 0 ? 0 : lerp(0, 260, step / 4);
  const bg = CLUBS[Math.max(0, step)];
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <Grad id={`st${Math.max(0, step)}`} a={bg[3]} b={bg[4]} />
        <rect width={W} height={H} fill={`url(#st${Math.max(0, step)})`} />
        {step === 1 && <path d="M-50 900 L250 520 L500 900 L700 600 L1130 900 Z" fill="#4A6A8A" />}
        {step === 2 && <path d="M-50 1000 L200 480 L330 640 L520 380 L760 700 L900 540 L1130 1000 Z" fill="#E9EEF5" stroke="#9AA8BA" strokeWidth={5} />}
        {step === 3 && Array.from({ length: 8 }).map((_, r) => <rect key={r} x={0} y={600 + r * 60} width={W} height={30} fill="#FFD400" opacity={0.85} />)}
        {step === 4 && Array.from({ length: 8 }).map((_, i) => <rect key={i} x={i * 140} y={700 - rand(i) * 260} width={120} height={900} fill="#3A4558" stroke={C.ink} strokeWidth={4} />)}
        {step === 4 && <Rain t={t} amt={0.7} />}
        <g transform={`translate(0 ${camY})`}>
          {CLUBS.map(([name, code, key], i) => {
            const on = t >= Q[key];
            return (
              <g key={i}>
                <rect x={sx(i)} y={sy(i)} width={200} height={2200} fill={on ? "#D9C29A" : "#BBA67F"} stroke={C.ink} strokeWidth={6} />
                <rect x={sx(i)} y={sy(i)} width={200} height={22} fill="#F2E6CF" stroke={C.ink} strokeWidth={4} />
                {on && (
                  <g transform={`translate(${sx(i) + 100} ${sy(i) - 210}) scale(${backOut((t - Q[key]) / 0.3)})`}>
                    <rect x={-5} y={60} width={10} height={150} fill="#5A3A24" />
                    <rect x={-95} y={-10} width={190} height={78} rx={10} fill="#F2E6CF" stroke={C.ink} strokeWidth={5} />
                    <Flag code={code} x={-55} y={29} w={56} r={5} />
                    <text x={30} y={44} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={i === 2 || i === 4 ? 24 : 30} fill={C.ink}>{name}</text>
                  </g>
                )}
              </g>
            );
          })}
          {/* the lift — out of order */}
          <g transform="translate(930 520)">
            <rect x={-100} y={-140} width={200} height={300} rx={10} fill="#B8C2D6" stroke={C.ink} strokeWidth={7} />
            <line x1={0} y1={-130} x2={0} y2={150} stroke={C.ink} strokeWidth={5} />
            {t >= Q.lift && <g transform={`rotate(-12) scale(${backOut((t - Q.lift) / 0.3)})`}>
              <rect x={-90} y={-30} width={180} height={64} fill={C.red} stroke={C.ink} strokeWidth={5} />
              <text x={0} y={14} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={34} fill="#fff">লিফট নষ্ট</text>
            </g>}
          </g>
          <Hero x={px} y={py} s={1.15} outfit="kit" bun num="9" pose={step >= 0 && k < 1 ? P.run(t * 14) : t >= Q.lift ? { ...P.stand(), armF: [1.6, 0.2] } : P.stand()} face={{ mouth: "grin", look: t >= Q.lift ? 1 : 0 }} />
        </g>
      </svg>
      <Chapter t={t} at={s0} n="২" title="সিঁড়ি" />
      <Stamp t={t} at={Q.lift + 0.6} y={330} size={58} bg={C.gold}>লিফট না, সিঁড়ি! 🪜</Stamp>
    </AbsoluteFill>
  );
};

// ================================================================== RECORD
// A match night that never ends: he scores and scores while the stadium
// screen counts to 36. Three trophies. Then — cut to Rubel asleep in class.
export const Record: React.FC<SP> = ({ t }) => {
  const s0 = Q.sec_record - 0.3;
  const n = Math.min(36, Math.floor(clamp((t - Q.goals) / 1.6) * 36));
  const kick = ((t - Q.goals) * 6) % 1;
  const cls = t >= Q.class - 0.1;
  const tro = t >= Q.treble - 0.1;
  if (cls) {
    return (
      <AbsoluteFill>
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <rect width={W} height={H} fill="#E8E2CF" />
          <rect x={120} y={380} width={840} height={420} fill="#2F4F3A" stroke="#6A4A30" strokeWidth={16} />
          <text x={540} y={560} textAnchor="middle" fontFamily={PLAY} fontWeight={700} fontSize={64} fill="#fff">উপস্থিতি: ৩/৩৬</text>
          <text x={540} y={660} textAnchor="middle" fontFamily={PLAY} fontWeight={700} fontSize={46} fill="#fff" opacity={0.8}>— ক্লাস টিচার 😑</text>
          <rect x={0} y={1360} width={W} height={560} fill="#B08A5A" />
          <rect x={250} y={1180} width={580} height={30} fill="#8A5A3A" stroke={C.ink} strokeWidth={6} />
          <g transform="translate(540 1330) rotate(-6)"><Hero x={0} y={0} s={1.7} outfit="host" pose={{ ...P.sit(), armF: [2.3, 1.3], armB: [2.2, 1.4] }} face={{ eyes: "closed", mouth: "o" }} /></g>
          <text x={700} y={860} fontFamily={DISPLAY} fontWeight={800} fontSize={74} fill={C.ink} opacity={0.6}>Z z z</text>
        </svg>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <rect width={W} height={H} fill="#0B1026" />
        <Floodlights t={t} />
        <Crowd t={t} y={560} h={360} cols={[C.sky, "#fff", "#1D3A6B", C.sky]} cheer={tro ? 1 : 0.4 + pulse(t, Q.goals + (n / 36) * 1.6, 3)} />
        {/* the big screen */}
        <g transform="translate(540 400)">
          <rect x={-300} y={-110} width={600} height={220} rx={16} fill="#0B0B14" stroke={C.gold} strokeWidth={8} />
          <text x={0} y={-50} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} fill="#fff">প্রিমিয়ার লিগ গোল</text>
          <text x={0} y={70} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={120} fill={C.gold}>{bn(t >= Q.goals ? n : 0)}</text>
        </g>
        <Pitch y={920} night />
        {!tro && <>
          <Goal x={300} y={1000} w={480} h={230} />
          <Hero x={360} y={1700} s={1.5} outfit="kit" bun num="9" pose={t >= Q.goals ? P.kick(Math.min(1, kick * 3)) : P.stand()} face={{ mouth: "grin", brows: 1 }} />
          {t >= Q.goals && t < Q.goals + 1.7 && <Ball x={lerp(470, 560 + Math.sin(n) * 150, kick)} y={lerp(1640, 1110, kick)} r={30} rot={t * 900} />}
        </>}
        {tro && (
          <g>
            <rect x={240} y={1420} width={600} height={70} fill="#fff" stroke={C.ink} strokeWidth={6} />
            <Hero x={540} y={1420} s={1.6} outfit="kit" bun num="9" pose={{ ...P.stand(), armB: [-2.6, -0.3], armF: [2.6, 0.3] }} face={{ mouth: "grin", eyes: "closed" }} />
            {[0, 1, 2].map((i) => {
              const at = Q.treble + i * 0.55;
              if (t < at) return null;
              return <g key={i} transform={`translate(0 ${-(1 - easeOut((t - at) / 0.35)) * 400})`}>
                <Trophy x={300 + i * 240} y={i === 1 ? 1000 : 1080} s={0.95} col={[C.gold, "#E8E8F0", C.sky][i]} />
                <text x={300 + i * 240} y={i === 1 ? 1050 : 1130} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={30} fill="#fff">{["লিগ", "এফএ কাপ", "চ্যাম্পিয়নস লিগ"][i]}</text>
              </g>;
            })}
            {Array.from({ length: 50 }).map((_, i) => {
              const dt = t - Q.treble - rand(i) * 1.5;
              if (dt < 0) return null;
              const y = (-50 + dt * (220 + rand(i + 3) * 200)) % 2000, x = rand(i + 7) * W + Math.sin(dt * 2 + i) * 40;
              return <rect key={i} x={x} y={y} width={14} height={24} fill={[C.gold, C.sky, "#fff", C.red][i % 4]} transform={`rotate(${dt * 300 + i * 40} ${x} ${y})`} />;
            })}
          </g>
        )}
      </svg>
      <Chapter t={t} at={s0} n="৩" title="রেকর্ড" />
      <Stamp t={t} at={Q.trebleWord} y={330} size={58} bg={C.gold}>৩৬ গোল | ট্রেবল 🏆🏆🏆</Stamp>
    </AbsoluteFill>
  );
};

// ================================================================= ROUTINE
// His day: lights out early, liver for dinner (a Bangladeshi দাদি nodding
// — "told you so"), meditation after a goal. Then ours: 3 AM, the phone.
export const Routine: React.FC<SP> = ({ t }) => {
  const s0 = Q.sec_routine - 0.3;
  const us = t >= Q.us - 0.05;
  const vs = (
    <div style={{ position: "absolute", top: 410, width: "100%", textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 60, color: "#fff", textShadow: `4px 4px 0 ${C.ink}`, opacity: ramp(t, Q.sleep, 0.3) }}>
      <span style={{ color: us ? "#9AA" : C.sky }}>হালান্ড</span> 🆚 <span style={{ color: us ? C.gold : "#9AA" }}>আমরা</span>
    </div>
  );
  let body: React.ReactNode;
  if (us) {
    const morning = t >= Q.mood - 0.2;
    body = (
      <svg width={W} height={H}>
        <rect width={W} height={H} fill={morning ? "#F6E7C8" : "#120B2A"} />
        <rect x={660} y={560} width={300} height={260} fill={morning ? "#9CC9EE" : "#0E1650"} stroke={C.ink} strokeWidth={10} />
        {!morning && <><circle cx={860} cy={640} r={40} fill={C.cream} /><circle cx={875} cy={630} r={36} fill="#0E1650" /></>}
        {morning && <circle cx={760} cy={650} r={50} fill={C.gold} />}
        <text x={150} y={680} fontFamily={MONO} fontWeight={700} fontSize={84} fill={morning ? C.ink : C.red}>{morning ? bn("9:47") : bn("3:00")}</text>
        <rect x={120} y={1180} width={840} height={200} rx={20} fill="#5A4A8A" stroke={C.ink} strokeWidth={7} />
        <rect x={130} y={1130} width={200} height={70} rx={30} fill="#fff" stroke={C.ink} strokeWidth={6} />
        <Hero x={560} y={1270} s={1.8} outfit="host" pose={{ ...P.sit(), armF: [2.4, 0.9], armB: [2.3, 1.0] }} face={{ eyes: morning ? "sleepy" : "wide", mouth: morning ? "sad" : "o", look: 0.2 }} />
        {!morning && <g transform="translate(612 860)"><rect x={-42} y={-74} width={84} height={148} rx={12} fill="#111" stroke={C.ink} strokeWidth={5} />
          <rect x={-34} y={-64} width={68} height={128} rx={6} fill={[C.magenta, C.sky, C.gold, C.green][Math.floor(t * 6) % 4]} />
          <circle cx={560 - 612} cy={880 - 860} r={150} fill={C.sky} opacity={0.12} /></g>}
      </svg>
    );
  } else if (t < Q.food - 0.1) {
    const charge = ramp(t, Q.sleep, 1.2);
    body = (
      <svg width={W} height={H}>
        <rect width={W} height={H} fill="#141B3A" />
        <rect x={680} y={560} width={280} height={240} fill="#0E1650" stroke={C.ink} strokeWidth={10} />
        <rect x={120} y={1180} width={840} height={200} rx={20} fill="#3B4F8A" stroke={C.ink} strokeWidth={7} />
        <rect x={140} y={1130} width={200} height={70} rx={30} fill="#fff" stroke={C.ink} strokeWidth={6} />
        <g transform="translate(240 1185) rotate(-90)"><Hero x={0} y={0} s={1.35} outfit="train" bun pose={P.stand()} face={{ eyes: "closed", mouth: "smile" }} /></g>
        <path d="M420 1140 Q680 1090 940 1150 L950 1190 L410 1190 Z" fill={C.sky} stroke={C.ink} strokeWidth={6} />
        <g transform="translate(540 820)">
          <rect x={-150} y={-60} width={280} height={120} rx={18} fill="none" stroke="#fff" strokeWidth={10} /><rect x={134} y={-24} width={22} height={48} rx={6} fill="#fff" />
          <rect x={-136} y={-46} width={252 * charge} height={92} rx={10} fill={C.green} />
          <text x={-10} y={20} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={56} fill="#fff">{bn(Math.round(100 * charge))}%</text>
        </g>
      </svg>
    );
  } else if (t < Q.zen - 0.1) {
    body = (
      <svg width={W} height={H}>
        <rect width={W} height={H} fill="#F3E2C0" />
        <rect x={0} y={1250} width={W} height={670} fill="#8A5A3A" />
        <rect x={100} y={1180} width={880} height={40} rx={8} fill="#6A4028" stroke={C.ink} strokeWidth={6} />
        <Hero x={330} y={1230} s={1.5} outfit="train" bun pose={{ ...P.stand(), armF: [1.3, 0.6] }} face={{ mouth: "smile", eyes: "open" }} />
        <g transform="translate(560 1160)"><ellipse rx={170} ry={44} fill="#fff" stroke={C.ink} strokeWidth={6} />
          <path d="M-110 -10 Q-80 -50 -20 -26 Q0 -6 -40 14 Q-100 24 -110 -10 Z" fill="#7A1F1F" stroke={C.ink} strokeWidth={5} />
          <path d="M20 -20 Q60 -50 90 -18 Q80 6 100 20 Q60 36 40 10 Z" fill="#8E2A2A" stroke={C.ink} strokeWidth={5} /></g>
        {t >= Q.dadi - 0.1 && <Hero x={lerp(1250, 830, easeOut((t - Q.dadi + 0.1) / 0.4))} y={1250} s={1.5} outfit="saree" gray flip pose={{ ...P.stand(), armF: [2.3 + Math.sin(t * 10) * 0.25, 0.4] }} face={{ mouth: "grin", eyes: "closed" }} />}
      </svg>
    );
  } else {
    body = (
      <svg width={W} height={H}>
        <rect width={W} height={H} fill="#0B1026" />
        <Floodlights t={t} />
        <Crowd t={t} y={560} h={340} cols={[C.sky, "#fff", "#1D3A6B"]} cheer={1} />
        <Pitch y={900} night />
        {[0, 1, 2].map((i) => <circle key={i} cx={540} cy={1250} r={200 + i * 80 + Math.sin(t * 2 + i) * 10} fill="none" stroke={C.gold} strokeWidth={6} opacity={0.5 - i * 0.12} />)}
        <Hero x={540} y={1480} s={1.9} outfit="kit" bun num="9" pose={{ ...P.sit(), armB: [0.9, 1.6], armF: [0.9, 1.6] }} face={{ eyes: "closed", mouth: "smile" }} />
      </svg>
    );
  }
  return (
    <AbsoluteFill>
      {body}
      {vs}
      <Chapter t={t} at={s0} n="৪" title="রুটিন" />
      {t >= Q.dadi && t < Q.zen && <Bubble t={t} at={Q.dadi + 0.3} out={Q.zen - 0.1} x={760} y={840} tail="r">বলছিলাম না? 👵</Bubble>}
      {us && t >= Q.mood && <Bubble t={t} at={Q.mood + 0.1} x={600} y={1000}>আজ মুড নেই 😩</Bubble>}
    </AbsoluteFill>
  );
};

// ==================================================================== WAIT
// Grey years. He trains alone in the rain while the TV shows World Cups
// without Norway. Wind tears the calendar back to 1998 — then forward to
// 2026: the tunnel, Iraq, and colour floods back on the double.
export const Wait: React.FC<SP> = ({ t }) => {
  const s0 = Q.sec_wait - 0.3;
  const color = ramp(t, Q.double, 0.3);
  const mono = 0.9 * (1 - color);
  let body: React.ReactNode;
  if (t < Q.wc22 - 0.1 || (t >= Q.noquit - 0.1 && t < Q.y2026 - 0.1)) {
    const dawn = ramp(t, Q.work, 2.5);
    body = (
      <svg width={W} height={H}>
        <Grad id="wn" a={dawn > 0 ? "#3A4A7A" : "#0B0F22"} b="#1A2040" />
        <rect width={W} height={H} fill="url(#wn)" />
        <circle cx={850} cy={lerp(1000, 520, dawn)} r={90} fill="#FFD27A" opacity={dawn} />
        <Pitch y={1000} night />
        <Goal x={330} y={1060} w={420} h={210} />
        <Hero x={lerp(160, 900, ((t * 0.18) % 1))} y={1650} s={1.4} outfit="train" bun pose={P.run(t * 10)} face={{ mouth: "flat", sweat: 1 }} />
        <Rain t={t} />
      </svg>
    );
  } else if (t < Q.y1998 - 0.1) {
    const euro = t >= Q.euro - 0.1;
    body = (
      <svg width={W} height={H}>
        <rect width={W} height={H} fill="#1A1A22" />
        <rect x={140} y={560} width={800} height={500} rx={20} fill="#222" stroke="#555" strokeWidth={14} />
        <rect x={170} y={590} width={740} height={440} fill="#0B3A1E" />
        <Trophy x={540} y={900} s={1.2} col={C.gold} />
        <text x={540} y={980} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={46} fill="#fff">{euro ? "ইউরো ২০২৪" : "বিশ্বকাপ ২০২২"}</text>
        <rect x={170} y={590} width={740} height={60} fill="#000" opacity={0.5} />
        <text x={190} y={632} fontFamily={MONO} fontSize={28} fill="#fff">LIVE · নরওয়ে নেই ❌</text>
        <rect x={0} y={1300} width={W} height={620} fill="#3A2A2A" />
        <rect x={160} y={1350} width={760} height={150} rx={20} fill="#4A3A5A" stroke={C.ink} strokeWidth={6} />
        <Hero x={540} y={1460} s={1.6} outfit="train" bun pose={{ ...P.sit(), armF: [1.0, 1.5], armB: [1.0, 1.5] }} face={{ mouth: "flat", eyes: "open" }} />
      </svg>
    );
  } else if (t < Q.noquit - 0.1) {
    const back = clamp((t - Q.y1998 + 0.2) / 1.0);
    const yr = Math.round(lerp(2024, 1998, easeOut(back)));
    body = (
      <svg width={W} height={H}>
        <rect width={W} height={H} fill="#141822" />
        {Array.from({ length: 12 }).map((_, i) => {
          const dt = t - Q.y1998 + 0.2 - i * 0.08;
          if (dt < 0) return null;
          return <rect key={i} x={340 + dt * (400 + rand(i) * 500)} y={700 - dt * 300 + dt * dt * 400} width={300} height={320} fill="#fff" opacity={clamp(1 - dt)} transform={`rotate(${dt * 300} 490 860)`} />;
        })}
        <g transform="translate(540 860)">
          <rect x={-200} y={-200} width={400} height={400} rx={20} fill="#fff" stroke={C.ink} strokeWidth={8} />
          <rect x={-200} y={-200} width={400} height={90} rx={20} fill={C.red} />
          <text x={0} y={-140} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill="#fff">নরওয়ের শেষ বিশ্বকাপ</text>
          <text x={0} y={90} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={130} fill={C.ink}>{bn(yr)}</text>
        </g>
        <text x={540} y={1240} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={48} fill="#C9D6FF" opacity={ramp(t, Q.y1998 + 1.2, 0.4)}>হালান্ডের জন্মেরও আগে!</text>
      </svg>
    );
  } else if (t < Q.double - 0.05) {
    const tunnel = t < Q.iraq - 0.1;
    body = (
      <svg width={W} height={H}>
        {tunnel ? (
          <g>
            <rect width={W} height={H} fill="#0A0A10" />
            {Array.from({ length: 8 }).map((_, i) => { const k = 1 - i / 8; return <rect key={i} x={540 - 520 * k} y={960 - 900 * k} width={1040 * k} height={1800 * k} rx={60 * k} fill="none" stroke="#333" strokeWidth={8} />; })}
            <rect x={400} y={700} width={280} height={520} rx={20} fill="#FFF6E6" opacity={0.9} />
            <Hero x={540} y={lerp(1700, 1500, clamp((t - Q.y2026) / 2))} s={1.7} outfit="norway" bun num="9" pose={P.walk(t * 7)} face={{ mouth: "flat", eyes: "open" }} />
            <g transform="translate(540 500)"><rect x={-170} y={-60} width={340} height={120} rx={14} fill="#fff" stroke={C.ink} strokeWidth={6} />
              <text x={0} y={30} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={84} fill={C.ink}>{bn(Math.round(lerp(1998, 2026, clamp((t - Q.y2026 + 0.2) / 0.8))))}</text></g>
          </g>
        ) : (
          <g>
            <rect width={W} height={H} fill="#0B1026" />
            <Floodlights t={t} />
            <Crowd t={t} y={600} h={340} cols={["#BA0C2F", "#fff", "#00205B"]} cheer={0.3} />
            <Pitch y={940} night />
            <Scoreboard x={540} y={460} a="NO" b="IQ" mid="vs" clock="বিশ্বকাপ ২০২৬ · ম্যাচ ১" />
            <Hero x={540} y={1650} s={1.6} outfit="norway" bun num="9" pose={P.run(t * 9)} face={{ mouth: "flat", brows: 1 }} />
            <Ball x={620} y={1640} r={26} rot={t * 600} />
          </g>
        )}
      </svg>
    );
  } else {
    const g2 = t >= Q.double + 0.5;
    body = (
      <svg width={W} height={H}>
        <rect width={W} height={H} fill="#0B1026" />
        <Floodlights t={t} />
        <Crowd t={t} y={600} h={340} cols={["#BA0C2F", "#fff", "#00205B"]} cheer={1} />
        <Pitch y={940} night />
        <Scoreboard x={540} y={460} a="NO" b="IQ" mid={g2 ? "⚽⚽" : "⚽"} clock="হালান্ডের গোল" glow={1} />
        <Goal x={300} y={1000} w={480} h={230} />
        {[0, 1].map((i) => t >= Q.double + i * 0.5 && <Ball key={i} x={lerp(540, 400 + i * 260, easeOut((t - Q.double - i * 0.5) / 0.4))} y={lerp(1700, 1120, easeOut((t - Q.double - i * 0.5) / 0.4))} r={34} rot={t * 800} />)}
        <Hero x={540} y={1700} s={1.6} outfit="norway" bun num="9" pose={{ ...P.stand(), armB: [-2.6, -0.3], armF: [2.6, 0.3] }} face={{ mouth: "shout", eyes: "closed" }} />
      </svg>
    );
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `grayscale(${mono}) contrast(${1 + mono * 0.1})` }}>{body}</AbsoluteFill>
      <Chapter t={t} at={s0} n="৫" title="অপেক্ষা" />
      <Stamp t={t} at={Q.y2026 + 0.9} out={Q.iraq - 0.1} y={330} size={46} bg="#fff">১৯৯৮ → ২০২৬ | ২৮ বছরের অপেক্ষা</Stamp>
      <Stamp t={t} at={Q.double} y={330} size={72} bg={C.gold} rot={-4}>ডাবল গোল! ⚽⚽</Stamp>
    </AbsoluteFill>
  );
};

// ===================================================================== RUN
// The World Cup on one stadium. The big screen changes opponent; the sky
// changes with the result: France brings a storm and he's on his knees —
// "ভাই, কেবল তো শুরু!" — Brazil, 79th minute, fireworks; England, rain,
// and the whole stadium stands for him. The journey map fills in on top.
const MATCHES: [FlagCode, string, string, string, string, boolean][] = [
  ["SN", "sen", "সেনেগাল", "", "", true], ["FR", "fra", "ফ্রান্স", "১", "৪", false], ["CI", "civ", "আইভরি কোস্ট", "", "", true],
  ["BR", "bra", "ব্রাজিল", "২", "১", true], ["EN", "eng", "ইংল্যান্ড", "১", "২", false],
];
export const Run: React.FC<SP> = ({ t }) => {
  const s0 = Q.sec_run - 0.3;
  let m = 0;
  MATCHES.forEach(([, k], i) => { if (t >= Q[k] - 0.1) m = i; });
  const [code, key] = MATCHES[m];
  const storm = (m === 1 && t < Q.start + 0.4) || m === 4;
  const night = m === 3;
  const knees = m === 1 && t >= Q.fra41 && t < Q.start;
  const shake = pulse(t, Q.fra41, 7) * 24;
  const boom = pulse(t, Q.nb21, 2.5);
  const showScore = m === 3 ? true : t >= Q[key] + 0.9;
  // only the scores the script states are shown; other wins read "জয়"
  const mid = m === 3 ? (t >= Q.nb21 - 0.3 ? undefined : "vs") : !showScore ? "vs" : MATCHES[m][3] === "" ? "জয়!" : undefined;
  const sa = m === 3 ? "২" : MATCHES[m][3], sb = m === 3 ? "১" : MATCHES[m][4];
  const pose = knees ? { ...P.sit(), armB: [0.3, 0.2], armF: [0.3, 0.2] } as any
    : m === 4 && t >= Q.seven - 0.1 ? { ...P.stand(), armB: [-0.2, 0.1], armF: [2.4, 0.4] }
    : (m === 1 && t >= Q.start) || (m !== 1 && m !== 4) ? { ...P.stand(), armB: [-2.6, -0.3], armF: [2.6, 0.3] } : P.stand();
  return (
    <AbsoluteFill style={{ transform: `translate(${(rand(Math.floor(t * 30)) - 0.5) * shake}px, ${(rand(Math.floor(t * 30) + 3) - 0.5) * shake}px)` }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <rect width={W} height={H} fill={storm ? "#1A1E2A" : night ? "#070A1E" : "#2A4A8A"} />
        {!storm && <Floodlights t={t} />}
        <Crowd t={t} y={640} h={320} cols={["#BA0C2F", "#fff", "#00205B", C.gold]} cheer={storm ? (m === 4 && t >= Q.seven ? 1 : 0.05) : 0.8} />
        <Pitch y={960} night />
        <Scoreboard x={540} y={520} a="NO" b={code} sa={sa} sb={sb} mid={mid}
          clock={m === 3 ? (t >= Q.min11 ? `${bn(Math.min(90, 79 + Math.floor((t - Q.min11) * 4)))}'` : "") : MATCHES[m][2]} glow={m === 3 && t >= Q.nb21 ? 1 : 0} />
        {boom > 0.02 && Array.from({ length: 30 }).map((_, i) => {
          const a = (i / 30) * Math.PI * 2, r = (1 - boom) * 700;
          return <circle key={i} cx={540 + Math.cos(a) * r} cy={760 + Math.sin(a) * r * 0.6} r={22 * boom + 6} fill={[C.gold, C.orange, C.red, "#fff"][i % 4]} opacity={boom} />;
        })}
        <g transform={`translate(540 1700)`}>
          <Hero x={0} y={0} s={1.7} outfit="norway" bun num="9" pose={pose}
            face={{ mouth: knees ? "sad" : m === 4 ? "smile" : "grin", eyes: knees ? "closed" : "open", sweat: storm ? 1 : 0 }} />
        </g>
        {m === 4 && t >= Q.seven - 0.1 && (
          <g transform={`translate(${540 + 105} ${1700 - 380}) scale(${backOut((t - Q.seven + 0.1) / 0.3)})`}>
            <path d="M-30 -60 L30 -60 L36 20 L60 30 L60 50 L-40 50 L-40 0 Z" fill={C.gold} stroke={C.ink} strokeWidth={6} />
            <circle r={70} fill={C.gold} opacity={0.25} />
          </g>
        )}
        {storm && <Rain t={t} amt={0.9} />}
      </svg>
      {/* journey map */}
      <div style={{ position: "absolute", left: 40, right: 40, top: 300, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: ramp(t, Math.max(Q.sen, s0 + 2.3), 0.3) }}>
        {MATCHES.map(([c, k, name, , , won], i) => {
          const done = t >= Q[k] + 0.9 || (k === "bra" && t >= Q.nb21);
          const reached = t >= Q[k] - 0.1;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: reached ? 1 : 0.35, transform: `scale(${i === m ? 1.12 : 0.95})` }}>
              <svg width={96} height={66}><Flag code={c} x={48} y={33} w={88} r={6} /></svg>
              <div style={{ fontSize: 40, height: 46 }}>{done ? (won ? (k === "bra" ? "✅🔥" : "✅") : "❌") : ""}</div>
            </div>
          );
        })}
      </div>
      <Chapter t={t} at={s0} n="৬" title="স্বপ্নের দৌড়" />
      <Bubble t={t} at={Q.over} out={Q.start - 0.1} x={300} y={1180}>"গল্প শেষ!" 🙄</Bubble>
      <Bubble t={t} at={Q.start} out={Q.civ + 0.5} x={540} y={1260}>ভাই, কেবল তো শুরু! 💪</Bubble>
      <Stamp t={t} at={Q.qf} out={Q.eng - 0.2} y={830} size={44} bg={C.gold}>ইতিহাসে প্রথম · কোয়ার্টার ফাইনাল! 🔥</Stamp>
      <Stamp t={t} at={Q.seven} y={830} size={64} bg={C.gold}>হালান্ড: ৭ গোল ⚽</Stamp>
    </AbsoluteFill>
  );
};

// ================================================================= LESSONS
// Back to Rubel's desk: he writes the four lessons in his notebook, each
// with a tiny drawing from the story, and ticks them off.
const LESSONS: [string, string][] = [["ছোট দিয়ে শুরু করা লজ্জার না", "🧒"], ["সাফল্য ধাপে ধাপে, শর্টকাটে না", "🪜"], ["সুযোগ দেরিতে এলেও প্রস্তুতি আগে", "⏳"], ["একটা হার মানে পুরো গল্প না", "⛈️"]];
export const Lessons: React.FC<SP> = ({ t }) => (
  <AbsoluteFill>
    <svg width={W} height={H} style={{ position: "absolute" }}><RubelRoom t={t} /></svg>
    <div style={{ position: "absolute", left: 70, right: 70, top: 400, height: 1000, background: "#FFFDF4", border: `6px solid ${C.ink}`, borderRadius: 18,
      boxShadow: "0 14px 0 rgba(0,0,0,0.35)", transform: `rotate(-1.5deg) translateY(${(1 - easeOut((t - Q.sec_lessons + 0.3) / 0.5)) * 900}px)`,
      backgroundImage: "repeating-linear-gradient(0deg, transparent 0 74px, #BCD3F0 74px 77px)", backgroundPosition: "0 52px" }}>
      <div style={{ position: "absolute", left: 90, top: 0, bottom: 0, width: 4, background: "#F2A0A0" }} />
      <div style={{ position: "absolute", left: 120, top: 40, fontFamily: PLAY, fontWeight: 700, fontSize: 64, color: C.red }}>আজ কী শিখলাম? ✍️</div>
      {LESSONS.map(([txt, icon], i) => {
        const at = Q[`L${i + 1}`];
        if (t < at - 0.05) return null;
        const k = clamp((t - at) / 0.9);
        return (
          <div key={i} style={{ position: "absolute", left: 120, right: 30, top: 200 + i * 195, display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ fontSize: 60 }}>{icon}</div>
            <div style={{ flex: 1, fontFamily: PLAY, fontWeight: 700, fontSize: 46, color: "#1E3A8A", lineHeight: 1.15, clipPath: `inset(0 ${100 - k * 100}% 0 0)` }}>{txt}</div>
            <div style={{ fontSize: 70, transform: `scale(${t >= at + 0.9 ? backOut((t - at - 0.9) / 0.25) : 0})` }}>✅</div>
          </div>
        );
      })}
    </div>
    <svg width={W} height={H} style={{ position: "absolute" }}>
      <Hero x={880} y={1700} s={1.3} outfit="host" pose={{ ...P.stand(), armF: [2.3, 0.7] }} face={{ mouth: "smile", look: -1 }} />
    </svg>
  </AbsoluteFill>
);

// =================================================================== OUTRO
// Rubel sits like Haaland, eyes closed — opens them, grins. Puts the phone
// down, the lamp goes off; the tag; "পরের পর্বে আবার দেখা হবে".
export const Outro: React.FC<SP> = ({ t }) => {
  const open = t >= Q.o_wc + 1.6;
  const off = ramp(t, Q.o_phone + 1.2, 0.3);
  const end = t >= Q.o_me - 0.1;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <RubelRoom t={t} dark={off * 0.45} />
        <g transform="translate(805 570)" opacity={open ? 0.9 : 0.3}><Trophy x={0} y={110} s={0.6} col={C.gold} /></g>
        {[0, 1, 2].map((i) => <circle key={i} cx={540} cy={1060} r={210 + i * 80 + Math.sin(t * 2 + i) * 10} fill="none" stroke={C.gold} strokeWidth={6} opacity={(0.42 - i * 0.12) * (1 - off * 0.5)} />)}
        <Hero x={540} y={1360} s={2.1} outfit="host" pose={end ? { ...P.stand(), armF: [2.3 + Math.sin(t * 9) * 0.3, 0.6] } : t >= Q.o_phone ? { ...P.sit(), armF: [1.4, 0.4] } : { ...P.sit(), armB: [0.9, 1.6], armF: [0.9, 1.6] }}
          face={{ eyes: open ? "open" : "closed", mouth: open ? "grin" : "smile", look: t >= Q.o_phone && t < Q.o_tag ? 1 : 0 }} />
        {t >= Q.o_phone && (
          <g transform={`translate(${lerp(700, 880, easeOut((t - Q.o_phone) / 0.6))} 1330)`}>
            <rect x={-40} y={-20} width={80} height={140} rx={12} fill="#111" stroke={C.ink} strokeWidth={5} transform="rotate(90)" />
            {t >= Q.o_tag && <g transform="translate(0 -120)"><rect x={-130} y={-40} width={260} height={70} rx={16} fill="#fff" stroke={C.ink} strokeWidth={4} />
              <text x={0} y={8} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={30} fill={C.ink}>🏷️ বন্ধুকে ট্যাগ!</text></g>}
          </g>
        )}
      </svg>
      <Stamp t={t} at={Q.o_wc} out={Q.o_phone - 0.1} y={330} size={56} bg={C.gold}>তোমার বিশ্বকাপও আসছে! 💪</Stamp>
      <Stamp t={t} at={Q.o_me} y={330} size={54} bg={C.sky}>রুবেল মিয়া · ১০০ সেকেন্ডে শিখি</Stamp>
      {t >= Q.o_end && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1580, display: "flex", justifyContent: "center", transform: `scale(${backOut((t - Q.o_end) / 0.35) * (1 + beatPulse(t, 6) * 0.04)})` }}>
          <div style={{ background: C.red, color: "#fff", border: `5px solid ${C.ink}`, borderRadius: 60, padding: "18px 40px 26px", fontFamily: DISPLAY, fontWeight: 800, fontSize: 50,
            boxShadow: "0 10px 0 rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>ফলো করো, পরের পর্ব আসছে 👉</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
