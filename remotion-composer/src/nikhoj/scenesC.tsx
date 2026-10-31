import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { SERIF } from "./fonts";
import { Figure, Karaoke, Flash } from "./kit";
import {
  C, D, clamp, lerp, smooth, easeOut, rand, rms, lineAt, wordTime, inGap, beatPulse,
} from "./lib";
import { SceneProps } from "./scenesA";

// =============================================================== SUNRISE
// Bridge: "যে স্বপ্নটা ধুলো মেখে চুপটি করে রয়, তারই গায়ে হাত রাখলে আবার সকাল
// হয়." He sits on a rooftop ledge while the sun comes up over the city. Then
// "(Guitar sustains. Silence.)" — the world dims to the glow of the sun alone,
// breathing with the sustained note.

const ROOFS = Array.from({ length: 26 }).map((_, i) => ({
  x: i * 80 - 40 + rand(i) * 30, w: 60 + rand(i + 3) * 70, h: 60 + rand(i + 7) * 200, tank: rand(i + 9) > 0.65,
}));
const FAR = Array.from({ length: 40 }).map((_, i) => ({ x: i * 50, w: 40 + rand(i + 20) * 40, h: 80 + rand(i + 30) * 260 }));

export const Sunrise: React.FC<SceneProps> = ({ t, f }) => {
  const line = lineAt(t, ["Bridge"]);
  const k = smooth((t - 247) / 22);
  const sunY = lerp(860, 520, k);
  const sustain = smooth((t - 266.5) / 3.5) * (1 - smooth((t - 276.6) / 0.8));
  const dimAll = 1 - sustain * 0.72;
  const glow = 0.55 + rms(f) * 0.8;
  const sky = `linear-gradient(${lerp(0, 1, k) > 0.5 ? "#2b1d56" : "#141238"} 0%, #5a2a6b ${lerp(45, 30, k)}%, #e2633a ${lerp(78, 62, k)}%, #ffb35a 100%)`;
  return (
    <AbsoluteFill style={{ background: sky }}>
      <AbsoluteFill style={{ opacity: dimAll }}>
        <div style={{ position: "absolute", left: 1260 - 900, top: sunY - 900, width: 1800, height: 1800, borderRadius: "50%",
          background: `conic-gradient(from ${t * 4}deg, rgba(255,210,120,0.0), rgba(255,210,120,0.16), rgba(255,210,120,0.0) 8%, rgba(255,210,120,0.12) 16%, rgba(255,210,120,0) 24%, rgba(255,210,120,0.14) 34%, rgba(255,210,120,0) 44%, rgba(255,210,120,0.12) 58%, rgba(255,210,120,0) 70%, rgba(255,210,120,0.14) 84%, rgba(255,210,120,0))`,
          WebkitMaskImage: "radial-gradient(circle, #000 0%, rgba(0,0,0,0) 62%)" }} />
      </AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <circle cx={1260} cy={sunY} r={240} fill={C.amber} opacity={0.18 * glow} />
        <circle cx={1260} cy={sunY} r={150} fill={C.gold} opacity={0.35 * glow} />
        <circle cx={1260} cy={sunY} r={95} fill="#fff1c9" />
        <g opacity={dimAll}>
          {FAR.map((b, i) => <rect key={i} x={b.x} y={880 - b.h} width={b.w} height={b.h + 200} fill="#4a2148" />)}
          {Array.from({ length: 6 }).map((_, i) => {
            const bx = ((t * (22 + i * 6) + i * 340) % 2300) - 200;
            const by = 300 + i * 38 + Math.sin(t * 1.3 + i) * 12;
            const flap = Math.sin(t * 9 + i * 2) * 9;
            return <path key={i} d={`M${bx - 18} ${by + flap} Q${bx - 8} ${by - 6} ${bx} ${by} Q${bx + 8} ${by - 6} ${bx + 18} ${by + flap}`}
              stroke="#2a1530" strokeWidth={4} fill="none" strokeLinecap="round" />;
          })}
          {ROOFS.map((r, i) => (
            <g key={i}>
              <rect x={r.x} y={1080 - 150 - r.h * 0.4} width={r.w} height={400} fill="#1a0e20" />
              {r.tank && <rect x={r.x + 10} y={1080 - 150 - r.h * 0.4 - 40} width={34} height={40} fill="#1a0e20" />}
            </g>
          ))}
          <rect x={0} y={940} width={760} height={140} fill="#120a17" />
          <rect x={0} y={936} width={760} height={8} fill="#2a1830" />
        </g>
        <Figure x={430} y={986} scale={2.2} pose={{ sit: true }} rim={C.amber} opacity={lerp(1, 0.6, sustain)} />
      </svg>
      {line && (
        <div style={{ position: "absolute", top: 120, left: 120, width: 1100 }}>
          <Karaoke line={line} t={t} st={{ size: 72, weight: 400, align: "left", maxWidth: 1100,
            color: "#fff4e0", active: C.gold, shadow: "0 4px 30px rgba(80,20,10,0.6)" }} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// =============================================================== TORN
// The instrumental after chorus 2: the front page that reported him missing
// rips down the middle and the sky behind it is already getting light.

export const Torn: React.FC<SceneProps> = ({ t, f }) => {
  const rip = easeOut((t - 240.2) / 2.4);
  const tremble = (1 - rip) * beatPulse(t, 6) * 6;
  const jag = (side: 1 | -1) => {
    const pts: string[] = [];
    for (let i = 0; i <= 24; i++) {
      const y = (i / 24) * 100;
      const x = 50 + (rand(i * 3.3) - 0.5) * 6;
      pts.push(`${x}% ${y}%`);
    }
    return side < 0
      ? `polygon(0% 0%, ${pts.join(", ")}, 0% 100%)`
      : `polygon(100% 0%, ${pts.join(", ")}, 100% 100%)`;
  };
  const half = (side: 1 | -1) => (
    <div style={{ position: "absolute", inset: 0, clipPath: jag(side),
      transform: `translate(${side * rip * 1150}px, ${rip * 90}px) rotate(${side * rip * 9 + (rand(f) - 0.5) * tremble * 0.2}deg)` }}>
      <Img src={staticFile("nikhoj/paper.jpg")} style={{ width: 1920, height: 1080 }} />
      <div style={{ position: "absolute", left: 0, right: 0, background: "#ff9a85", mixBlendMode: "multiply", top: 0, bottom: 0, opacity: 0.32 }} />
      <div style={{ position: "absolute", top: 100, width: "100%", textAlign: "center", fontFamily: SERIF,
        fontWeight: 700, fontSize: 118, color: C.paperInk }}>নিখোঁজ সংবাদ</div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 270, borderTop: `6px solid ${C.paperInk}` }} />
    </div>
  );
  return (
    <AbsoluteFill>
      <Sunrise t={247 + (t - 247) * 0.15} f={f} />
      {half(-1)}{half(1)}
    </AbsoluteFill>
  );
};

// =============================================================== SIGNS
// Final build: "নামটা আমার, ছায়াটা কার? পথটা আমার, পায়ের ভার?" — a signpost
// grows one board per question, each swinging in on its word. "আয়না এবার
// কী বলবে?" — then the bass stops, and in the dark: "আমি বলব—"

const BOARDS: [string, string, number][] = [
  ["নাম", "নামটা", 300],
  ["ছায়া", "ছায়াটা", 470],
  ["পথ", "পথটা", 640],
];

export const Signs: React.FC<SceneProps> = ({ t, f }) => {
  const line = lineAt(t, ["Final Build"]);
  const stop = D.gaps.find(([a]) => a > 285 && a < 288);
  const dark = stop ? smooth((t - stop[0]) / 0.12) : 0;
  const lastLine = line?.text.startsWith("আমি বলব");
  const mirrorAt = wordTime("আয়না এবার", "আয়না", 276);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#0d0a24 0%, #2a1748 65%, #4a2140 100%)" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <rect x={0} y={960} width={1920} height={120} fill="#0a0612" />
        <rect x={400} y={240} width={22} height={720} fill="#2b2a3d" />
        {BOARDS.map(([label, word, y], i) => {
          const at = wordTime(word, word, 276);
          if (t < at) return null;
          const dt = t - at;
          const swing = -75 * Math.exp(-dt * 3.2) * Math.cos(dt * 9);
          return (
            <g key={label} transform={`translate(411 ${y}) rotate(${swing})`}>
              <rect x={0} y={-62} width={470} height={124} rx={12} fill="#173a33" stroke="#e8e2d0" strokeWidth={6} />
              <text x={50} y={22} fontFamily={SERIF} fontWeight={700} fontSize={70} fill="#f3ead7">{label}</text>
              <path d="M330 0 L420 0 M390 -26 L424 0 L390 26" stroke="#f3ead7" strokeWidth={10} fill="none"
                strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}
        {t >= mirrorAt && (
          <g opacity={smooth((t - mirrorAt) / 0.5)}>
            <ellipse cx={1480} cy={520} rx={150} ry={210} fill="#1d2e44" stroke="#9fb4c8" strokeWidth={14} />
            <rect x={1360} y={300} width={60} height={440} fill="#fff" opacity={0.08} transform="rotate(18 1480 520)" />
          </g>
        )}
        <Figure x={1080} y={962} scale={2.1} pose={{ shrug: line?.text.includes("?") ? 0.7 : 0 }} rim={C.magenta} question={1} />
      </svg>
      {line && !lastLine && (
        <div style={{ position: "absolute", bottom: 150, width: "100%", display: "flex", justifyContent: "center" }}>
          <Karaoke line={line} t={t} st={{ size: 92, maxWidth: 1700, active: C.magenta }} />
        </div>
      )}
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(dark, inGap(t) ? 1 : 0) }} />
      {line && lastLine && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Karaoke line={line} t={t} st={{ size: 84, weight: 400, active: C.white, color: "#d9d4ff" }} />
        </AbsoluteFill>
      )}
      <Flash amount={smooth((t - D.snaps.build) / 0.02) * Math.exp(-Math.max(0, t - D.snaps.build) * 9) * 0.6} />
    </AbsoluteFill>
  );
};
