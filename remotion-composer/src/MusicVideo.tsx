import React, { createContext, useContext, useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ---------------------------------------------------------------------------
// "নিখোঁজ সংবাদ" — animated lyric music video (1920x1080).
// Concept: a missing-person bulletin about yourself. A MISSING poster with an
// empty silhouette runs through the song and is stamped FOUND in the final
// chorus; a mirror opens and closes the film. Everything reacts to the audio
// (bass / loudness / onsets per frame, beat grid) passed in as props.
// ---------------------------------------------------------------------------

export type MVLine = { text: string; start: number; end: number; sec: string };
export type MVProps = {
  song: string;
  durationSec: number;
  beats: number[];
  bass: number[];
  rms: number[];
  onset: number[];
  sections: { id: string; start: number; end: number }[];
  lines: MVLine[];
  title: string;
  subtitle: string;
  artist: string;
  editor: string;
  /** for the vertical wrapper: it draws its own lyrics and plays the audio */
  hideLyrics?: boolean;
  muted?: boolean;
};

const W = 1920;
const H = 1080;
const BN = "'Noto Sans Bengali', 'Noto Sans', sans-serif";
const BN_SERIF = "'Noto Serif Bengali', 'Noto Sans Bengali', serif";
const EN = "'Noto Sans', 'DejaVu Sans', sans-serif";
const K = {
  night: "#07060d",
  ink: "#120f1f",
  neonPink: "#ff3d8b",
  neonCyan: "#27e0ff",
  neonViolet: "#9b5cff",
  amber: "#ffb547",
  red: "#e8343a",
  paper: "#efe6d2",
  paperDark: "#cfc2a6",
  green: "#3ddc84",
  gold: "#ffd23f",
};
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// --------------------------------------------------------------------------- audio context

type AudioCtx = { frame: number; fps: number; bass: number; rms: number; onset: number; beat: number; t: number; hideLyrics?: boolean };
const AudioState = createContext<AudioCtx>({ frame: 0, fps: 30, bass: 0, rms: 0, onset: 0, beat: 0, t: 0 });
const useA = () => useContext(AudioState);

const useLocalSpring = (delay: number, damping = 13) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness: 120, mass: 0.8 } });
};

// deterministic pseudo-random
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// --------------------------------------------------------------------------- shared visual pieces

const Grain: React.FC<{ strength?: number }> = ({ strength = 0.08 }) => {
  const { frame } = useA();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity: strength }}>
      <svg width={W} height={H}>
        <filter id={`g${frame % 4}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 50} />
        </filter>
        <rect width={W} height={H} filter={`url(#g${frame % 4})`} />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC<{ amount?: number }> = ({ amount = 0.7 }) => (
  <AbsoluteFill
    style={{ pointerEvents: "none", background: `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${amount}) 100%)` }}
  />
);

/** Simple head-and-shoulders silhouette. */
const Person: React.FC<{ x: number; y: number; s: number; fill?: string; stroke?: string; dashed?: boolean; opacity?: number }> = ({
  x, y, s, fill = "none", stroke = K.paper, dashed, opacity = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <circle cx={0} cy={-62} r={34} fill={fill} stroke={stroke} strokeWidth={4 / s} strokeDasharray={dashed ? `${10 / s} ${8 / s}` : undefined} />
    <path d="M -70 40 C -70 -10 -40 -22 0 -22 C 40 -22 70 -10 70 40 Z" fill={fill} stroke={stroke} strokeWidth={4 / s}
      strokeDasharray={dashed ? `${10 / s} ${8 / s}` : undefined} />
  </g>
);

const NeonCity: React.FC<{ hue?: number; speed?: number; glow?: number }> = ({ speed = 0.6, glow = 1 }) => {
  const { frame, bass } = useA();
  const layers = useMemo(
    () =>
      [0, 1, 2].map((L) =>
        Array.from({ length: 34 }, (_, i) => ({
          w: 70 + rnd(i * 7 + L) * 120,
          h: 160 + rnd(i * 13 + L * 3) * (260 + L * 140),
          gap: 6 + rnd(i * 5 + L) * 20,
        })),
      ),
    [],
  );
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b0820" />
          <stop offset="70%" stopColor="#2a0f3d" />
          <stop offset="100%" stopColor="#5a1846" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#sky)" />
      {layers.map((bs, L) => {
        let x = -((frame * speed * (L + 1) * 0.6) % 3000);
        const base = H - 120 + L * 40;
        const col = ["#1a1030", "#140c26", "#0d0818"][L];
        return (
          <g key={L}>
            {[0, 1].map((rep) =>
              bs.map((b, i) => {
                const bx = x + rep * 3000 + i * (b.w + b.gap) * (3000 / (34 * 170));
                const lit = rnd(i + L * 50 + Math.floor(frame / 20)) > 0.5;
                return (
                  <g key={`${rep}-${i}`}>
                    <rect x={bx} y={base - b.h} width={b.w} height={b.h + 200} fill={col} />
                    {Array.from({ length: Math.floor(b.h / 40) }, (_, r) => (
                      <rect key={r} x={bx + 12} y={base - b.h + 20 + r * 40} width={b.w - 24} height={6}
                        fill={(r + i) % 3 === 0 ? K.neonPink : (r + i) % 3 === 1 ? K.neonCyan : K.amber}
                        opacity={(lit ? 0.55 : 0.25) * glow * (0.8 + bass * 0.4)} />
                    ))}
                  </g>
                );
              }),
            )}
          </g>
        );
      })}
    </svg>
  );
};

/** Word-by-word Bangla lyric line. */
const Lyric: React.FC<{
  line: MVLine;
  size?: number;
  color?: string;
  accent?: string;
  font?: string;
  y?: number;
  align?: "center" | "left";
  x?: number;
  maxWidth?: number;
  box?: boolean;
  shadow?: string;
}> = ({ line, size = 72, color = "#fff", accent = K.neonPink, font = BN, y = 860, align = "center", x = 160, maxWidth = 1600, box, shadow }) => {
  const { t, bass, hideLyrics } = useA();
  if (hideLyrics) return null;
  const words = line.text.split(/\s+/);
  const dur = Math.max(0.6, line.end - line.start);
  const vis = interpolate(t, [line.start - 0.2, line.start, line.end + 0.25, line.end + 0.55], [0, 1, 1, 0], clamp);
  if (vis <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: align === "center" ? (W - maxWidth) / 2 : x,
        width: maxWidth,
        textAlign: align,
        opacity: vis,
        fontFamily: font,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.3,
        color,
        textShadow: shadow ?? `0 0 ${18 + bass * 18}px ${accent}, 0 4px 18px rgba(0,0,0,0.8)`,
      }}
    >
      <span style={box ? { background: "rgba(7,6,13,0.72)", padding: "6px 22px", borderRadius: 14, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" } : undefined}>
        {words.map((w, i) => {
          const at = line.start + (dur * i) / words.length;
          const p = interpolate(t, [at - 0.05, at + 0.18], [0, 1], clamp);
          return (
            <span key={i} style={{ display: "inline-block", marginRight: "0.28em", opacity: p,
              transform: `translateY(${(1 - p) * 26}px) scale(${0.9 + p * 0.1})`, color: p < 1 ? accent : color }}>
              {w}
            </span>
          );
        })}
      </span>
    </div>
  );
};

const LinesOf: React.FC<{ lines: MVLine[]; sec: string | string[]; render: (l: MVLine, i: number) => React.ReactNode }> = ({ lines, sec, render }) => {
  const secs = Array.isArray(sec) ? sec : [sec];
  return <>{lines.filter((l) => secs.includes(l.sec)).map((l, i) => <React.Fragment key={i}>{render(l, i)}</React.Fragment>)}</>;
};

/** The recurring MISSING poster. state: 0 = missing, 1 = found */
const Poster: React.FC<{ x: number; y: number; s: number; found?: number; rot?: number; title: string }> = ({ x, y, s, found = 0, rot = 0, title }) => {
  const { bass } = useA();
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-210} y={-290} width={420} height={580} fill={K.paper} stroke={K.paperDark} strokeWidth={6} />
      <rect x={-190} y={-270} width={380} height={80} fill={found > 0.5 ? K.green : K.red} />
      <text x={0} y={-215} textAnchor="middle" fontFamily={BN} fontWeight={900} fontSize={54} fill="#fff">
        {found > 0.5 ? "পাওয়া গেছে!" : "নিখোঁজ"}
      </text>
      <rect x={-130} y={-170} width={260} height={260} fill={found > 0 ? `rgba(255,210,63,${0.2 + found * 0.6})` : "#d9cfb9"} stroke="#9b8f76" strokeWidth={4} />
      <Person x={0} y={20} s={1.1} dashed={found < 0.5} stroke={found > 0.5 ? "#7a4d00" : "#7b705a"} fill={found > 0.5 ? `rgba(255,181,71,${found})` : "none"} />
      {found < 0.5 && (
        <text x={0} y={-40} textAnchor="middle" fontFamily={EN} fontWeight={900} fontSize={110} fill="#9b8f76" opacity={0.7}>?</text>
      )}
      <text x={0} y={140} textAnchor="middle" fontFamily={BN_SERIF} fontWeight={800} fontSize={40} fill="#2b2418">{title}</text>
      <text x={0} y={190} textAnchor="middle" fontFamily={BN} fontSize={26} fill="#4a4030">নাম: আমি  •  ঠিকানা: অজানা</text>
      <text x={0} y={232} textAnchor="middle" fontFamily={BN} fontSize={24} fill="#4a4030">শেষ দেখা গেছে: আয়নার সামনে</text>
      {/* stamp */}
      <g transform={`translate(110 -140) rotate(-14) scale(${0.85 + bass * 0.06})`} opacity={0.95}>
        <rect x={-95} y={-34} width={190} height={68} fill="none" stroke={found > 0.5 ? K.green : K.red} strokeWidth={6} rx={8} />
        <text x={0} y={14} textAnchor="middle" fontFamily={EN} fontWeight={900} fontSize={40} fill={found > 0.5 ? K.green : K.red}>
          {found > 0.5 ? "FOUND" : "MISSING"}
        </text>
      </g>
    </g>
  );
};

const Mirror: React.FC<{ lag: number; copies?: number; aligned?: number; smile?: number }> = ({ lag, copies = 0, aligned = 0, smile = 0 }) => {
  const { frame, rms } = useA();
  const sway = Math.sin(frame / 25) * 30;
  const reflX = interpolate(aligned, [0, 1], [sway * lag + 30 * lag, 0]);
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <clipPath id="mirrorClip"><ellipse cx={960} cy={500} rx={300} ry={400} /></clipPath>
        <radialGradient id="glass" cx="45%" cy="35%">
          <stop offset="0%" stopColor="#2e3550" />
          <stop offset="100%" stopColor="#0c0e18" />
        </radialGradient>
      </defs>
      <ellipse cx={960} cy={500} rx={330} ry={430} fill="none" stroke="#b08a4a" strokeWidth={22} />
      <ellipse cx={960} cy={500} rx={300} ry={400} fill="url(#glass)" />
      <g clipPath="url(#mirrorClip)">
        {Array.from({ length: copies }, (_, i) => (
          <Person key={i} x={960 + (i - (copies - 1) / 2) * 120} y={720} s={1.7} stroke={K.neonViolet} opacity={0.35} />
        ))}
        <Person x={960 + reflX} y={720} s={2.2} stroke={aligned > 0.5 ? K.gold : "#cfd6ff"} fill={aligned > 0.5 ? "rgba(255,210,63,0.15)" : "none"} />
        {smile > 0 && (
          <path d={`M ${960 + reflX - 30} ${582} Q ${960 + reflX} ${582 + 22 * smile} ${960 + reflX + 30} ${582}`}
            fill="none" stroke={K.gold} strokeWidth={6} strokeLinecap="round" />
        )}
        <rect x={660} y={100} width={160} height={800} fill="rgba(255,255,255,0.05)" transform="rotate(18 960 500)" />
      </g>
      <ellipse cx={960} cy={500} rx={330 + rms * 10} ry={430 + rms * 10} fill="none" stroke={K.amber} strokeOpacity={0.25 + rms * 0.3} strokeWidth={4} />
      {/* the person in front of the mirror */}
      <Person x={960} y={1060} s={3.2} fill="#05040a" stroke="#05040a" />
    </svg>
  );
};

const Flash: React.FC<{ at: number; color?: string; len?: number }> = ({ at, color = "#fff", len = 0.35 }) => {
  const { t } = useA();
  const o = interpolate(t, [at - 0.02, at, at + len], [0, 0.9, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} /> : null;
};

const Glitch: React.FC<{ children: React.ReactNode; amount?: number }> = ({ children, amount = 1 }) => {
  const { onset, frame } = useA();
  const g = onset > 0.72 ? (onset - 0.72) * 3.5 * amount : 0;
  if (g <= 0) return <>{children}</>;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${g * 18}px)`, filter: "drop-shadow(6px 0 0 rgba(255,61,139,0.7))" }}>{children}</AbsoluteFill>
      {Array.from({ length: 5 }, (_, i) => {
        const y = Math.floor(rnd(frame + i) * H);
        return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: 8 + rnd(i + frame) * 30,
          background: i % 2 ? K.neonCyan : K.neonPink, opacity: 0.25 * g, mixBlendMode: "screen" }} />;
      })}
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------------------- sections

const IntroSec: React.FC<{ lines: MVLine[] }> = ({ lines }) => {
  const { t } = useA();
  const copies = t > 22.5 ? Math.min(6, Math.floor((t - 22.5) * 2.5) + 1) : 0;
  return (
    <AbsoluteFill style={{ background: K.night }}>
      <Mirror lag={interpolate(t, [0, 20], [0.3, 1.2], clamp)} copies={copies} />
      <LinesOf lines={lines} sec="Intro" render={(l, i) => (
        <Lyric line={l} size={i === 3 ? 64 : 50} y={i % 2 ? 930 : 70} color="#e9e6ff" accent={K.neonViolet} font={BN_SERIF} />
      )} />
      <Flash at={27.4} />
      <Grain strength={0.18} />
      <Vignette amount={0.85} />
    </AbsoluteFill>
  );
};

const GrooveSec: React.FC<{ title: string; subtitle: string; artist: string }> = ({ title, subtitle, artist }) => {
  const frame = useCurrentFrame();
  const { bass, beat } = useA();
  const a = useLocalSpring(30);
  const b = useLocalSpring(70);
  return (
    <AbsoluteFill>
      <NeonCity speed={0.5} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18 }}>
        <div style={{ fontFamily: EN, fontSize: 30, letterSpacing: 14, color: K.neonCyan, opacity: a }}>{artist.toUpperCase()} PRESENTS</div>
        <div style={{
          fontFamily: BN_SERIF, fontWeight: 900, fontSize: 190, color: "#fff",
          transform: `scale(${(0.8 + a * 0.2) * (1 + bass * 0.05 + beat * 0.03)})`, opacity: a,
          textShadow: `0 0 40px ${K.neonPink}, 0 0 90px ${K.neonViolet}`,
        }}>
          {title}
        </div>
        <div style={{ fontFamily: EN, fontSize: 44, letterSpacing: 20, color: K.amber, opacity: b }}>{subtitle.toUpperCase()}</div>
      </AbsoluteFill>
      {/* rubber-bass dots bouncing on the beat */}
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        {Array.from({ length: 16 }, (_, i) => (
          <circle key={i} cx={160 + i * 107} cy={980 - beat * 40 * (i % 2 ? 1 : 0.5) - Math.sin(frame / 8 + i) * 6}
            r={10 + bass * 10} fill={i % 2 ? K.neonPink : K.neonCyan} opacity={0.8} />
        ))}
      </svg>
      <Grain />
      <Vignette amount={0.5} />
    </AbsoluteFill>
  );
};

/** Newspaper-collage verse: one illustrated "clipping" per line. */
const Clip: React.FC<{ line: MVLine; i: number; total: number }> = ({ line, i }) => {
  const { t, beat } = useA();
  const on = interpolate(t, [line.start - 0.3, line.start + 0.15], [0, 1], clamp);
  const off = 1;
  if (on <= 0) return null;
  const cols = [[330, 230], [960, 210], [1590, 230], [330, 560], [960, 540], [1590, 560]];
  const [cx, cy] = cols[i % 6];
  const icons = [
    // clock with trapped noon sun
    <g key="c"><circle r={90} fill="#fff8e6" stroke="#2b2418" strokeWidth={8} /><circle r={30} fill={K.amber} /><line x1={0} y1={0} x2={0} y2={-70} stroke="#2b2418" strokeWidth={8} /><line x1={0} y1={0} x2={50} y2={0} stroke="#2b2418" strokeWidth={8} /></g>,
    // someone else spending my life: wallet / coins falling
    <g key="w"><rect x={-90} y={-60} width={180} height={120} rx={14} fill="#7a5a3a" /><Person x={60} y={-90} s={0.5} stroke="#2b2418" fill={K.neonPink} />{[0, 1, 2].map((k) => <circle key={k} cx={-40 + k * 40} cy={90 + ((t * 120 + k * 30) % 60)} r={14} fill={K.gold} />)}</g>,
    // pillow with moon
    <g key="p"><rect x={-110} y={-40} width={220} height={90} rx={40} fill="#e8e2ff" /><path d="M 30 -110 A 50 50 0 1 0 70 -40 A 38 38 0 1 1 30 -110 Z" fill={K.amber} /></g>,
    // window with hanging sky
    <g key="win"><rect x={-90} y={-100} width={180} height={200} fill="#87b7ff" stroke="#2b2418" strokeWidth={8} /><line x1={0} y1={-100} x2={0} y2={100} stroke="#2b2418" strokeWidth={8} /><line x1={-90} y1={0} x2={90} y2={0} stroke="#2b2418" strokeWidth={8} /><circle cx={-40} cy={-50} r={20} fill="#fff" /></g>,
    // neon city glass dawn
    <g key="neon">{[0, 1, 2, 3].map((k) => <rect key={k} x={-100 + k * 52} y={-40 - k * 18} width={44} height={140 + k * 18} fill={k % 2 ? K.neonCyan : K.neonPink} opacity={0.75} />)}<circle cx={0} cy={-90} r={36} fill={K.amber} opacity={0.8} /></g>,
    // guest in own house: door with person outside
    <g key="door"><rect x={-70} y={-110} width={140} height={220} fill="#5a3b28" /><circle cx={45} cy={0} r={8} fill={K.gold} /><Person x={110} y={60} s={0.7} stroke="#2b2418" fill="#b8b0a0" /></g>,
  ];
  return (
    <g opacity={on * off} transform={`translate(${cx} ${cy + (1 - on) * 60}) rotate(${(i % 2 ? 4 : -5) + beat * 1.5}) scale(0.72)`}>
      <rect x={-200} y={-220} width={400} height={420} fill={K.paper} stroke={K.paperDark} strokeWidth={5} />
      <rect x={-200} y={-220} width={400} height={50} fill="#2b2418" />
      <text x={0} y={-184} textAnchor="middle" fontFamily={EN} fontWeight={900} fontSize={26} fill={K.paper} letterSpacing={6}>DAILY MIRROR • {i + 1}</text>
      <g transform="translate(0 20)">{icons[i % icons.length]}</g>
    </g>
  );
};

const Verse1Sec: React.FC<{ lines: MVLine[] }> = ({ lines }) => {
  const v = lines.filter((l) => l.sec === "Verse 1");
  return (
    <AbsoluteFill style={{ background: "#1b1612" }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {Array.from({ length: 22 }, (_, i) => (
          <rect key={i} x={rnd(i) * W - 100} y={rnd(i + 9) * H - 100} width={260} height={180}
            fill={K.paperDark} opacity={0.07} transform={`rotate(${rnd(i + 3) * 40 - 20} ${rnd(i) * W} ${rnd(i + 9) * H})`} />
        ))}
        {v.map((l, i) => <Clip key={i} line={l} i={i} total={v.length} />)}
      </svg>
      <LinesOf lines={lines} sec="Verse 1" render={(l) => <Lyric line={l} size={70} y={830} color={K.paper} accent={K.amber} font={BN_SERIF} box />} />
      <Grain strength={0.14} />
      <Vignette />
    </AbsoluteFill>
  );
};

const Pre1Sec: React.FC<{ lines: MVLine[]; sec: string; rain?: boolean }> = ({ lines, sec, rain }) => {
  const frame = useCurrentFrame();
  const { t, rms } = useA();
  const zoom = 1 + frame / 2000;
  const fields = rain
    ? []
    : [
        { k: "নাম", v: "✓", at: lines.find((l) => l.sec === sec)?.start ?? 0 },
        { k: "ঠিকানা", v: "✓", at: (lines.find((l) => l.sec === sec)?.start ?? 0) + 1.2 },
        { k: "ছবি", v: "✓", at: (lines.find((l) => l.sec === sec)?.start ?? 0) + 2.4 },
        { k: "আসল রেশ", v: "?", at: (lines.find((l) => l.sec === sec)?.start ?? 0) + 4.4 },
      ];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #2a1745 0%, #07060d 75%)" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        {!rain && (
          <div style={{ position: "absolute", left: 560, top: 120, width: 800, height: 560, borderRadius: 24, background: "rgba(239,230,210,0.95)",
            boxShadow: `0 0 ${60 + rms * 60}px rgba(155,92,255,0.5)`, padding: 40, display: "flex", gap: 40 }}>
            <div style={{ width: 240, height: 300, background: "#d9cfb9", border: "4px dashed #7b705a", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: EN, fontSize: 140, color: "#7b705a" }}>?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 26, flex: 1 }}>
              <div style={{ fontFamily: EN, fontWeight: 900, fontSize: 30, letterSpacing: 6, color: "#2b2418" }}>IDENTITY CARD</div>
              {fields.map((f) => {
                const p = interpolate(t, [f.at, f.at + 0.3], [0, 1], clamp);
                return (
                  <div key={f.k} style={{ display: "flex", justifyContent: "space-between", borderBottom: "3px solid #9b8f76", paddingBottom: 8, opacity: 0.3 + p * 0.7 }}>
                    <span style={{ fontFamily: BN, fontWeight: 700, fontSize: 40, color: "#2b2418" }}>{f.k}</span>
                    <span style={{ fontFamily: EN, fontWeight: 900, fontSize: 44, color: f.v === "?" ? K.red : "#1f7a3a", transform: `scale(${p})` }}>{f.v}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {rain && (
          <svg width={W} height={H} style={{ position: "absolute" }}>
            <rect x={760} y={140} width={400} height={620} fill="#100c1c" stroke={K.amber} strokeWidth={6} />
            <path d={`M 760 140 L ${760 + 300} 190 L ${760 + 300} 820 L 760 760 Z`} fill="#3b2a1e" stroke={K.amber} strokeWidth={4} />
            <rect x={770} y={150} width={290} height={600} fill={`rgba(255,181,71,${0.12 + rms * 0.2})`} />
            {Array.from({ length: 90 }, (_, i) => {
              const x = 775 + rnd(i) * 380;
              const y = 150 + ((rnd(i + 3) * 600 + frame * (14 + rnd(i) * 10)) % 600);
              return <line key={i} x1={x} y1={y} x2={x - 4} y2={y + 26} stroke={K.neonCyan} strokeOpacity={0.6} strokeWidth={2} />;
            })}
          </svg>
        )}
      </AbsoluteFill>
      <LinesOf lines={lines} sec={sec} render={(l) => <Lyric line={l} size={66} y={820} accent={K.neonViolet} />} />
      <Grain />
      <Vignette amount={0.8} />
    </AbsoluteFill>
  );
};

const ChorusSec: React.FC<{ lines: MVLine[]; sec: string; title: string; wall?: boolean }> = ({ lines, sec, title, wall }) => {
  const { bass, beat, frame } = useA();
  const shake = bass > 0.75 ? (bass - 0.75) * 30 : 0;
  return (
    <AbsoluteFill>
      <Glitch>
        <AbsoluteFill style={{ transform: `translate(${Math.sin(frame * 1.7) * shake}px, ${Math.cos(frame * 2.3) * shake}px)` }}>
          <NeonCity speed={1.4} glow={1.4} />
          <svg width={W} height={H} style={{ position: "absolute" }}>
            {wall
              ? Array.from({ length: 9 }, (_, i) => (
                  <Poster key={i} x={260 + (i % 5) * 350 + (i > 4 ? 175 : 0)} y={i > 4 ? 640 : 330} s={0.62 + (i === 2 ? beat * 0.06 : 0)}
                    rot={rnd(i) * 14 - 7} title={title} />
                ))
              : <Poster x={960} y={400} s={1.05 + bass * 0.08 + beat * 0.04} rot={Math.sin(frame / 30) * 3} title={title} />}
          </svg>
          {/* BREAKING ticker */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 74, background: K.red, overflow: "hidden", display: "flex", alignItems: "center" }}>
            <div style={{ whiteSpace: "nowrap", transform: `translateX(${-((frame * 6) % 1600)}px)`, fontFamily: BN, fontWeight: 800, fontSize: 40, color: "#fff" }}>
              {"ব্রেকিং • নিখোঁজ: আমি • শেষ দেখা গেছে নিয়ন রাতে • খুঁজছে: আমি নিজেই • ".repeat(6)}
            </div>
          </div>
        </AbsoluteFill>
      </Glitch>
      <LinesOf lines={lines} sec={sec} render={(l) => (
        <Lyric line={l} size={l.text.startsWith("ও-ও") ? 120 : 76} y={l.text.startsWith("ও-ও") ? 420 : 812}
          accent={K.neonPink} shadow={`0 0 30px ${K.neonPink}, 0 6px 0 #000`} />
      )} />
      <Vignette amount={0.55} />
    </AbsoluteFill>
  );
};

const DropSec: React.FC<{ lines: MVLine[] }> = ({ lines }) => {
  const { frame, bass, rms, onset, t } = useA();
  const strings = 6;
  return (
    <AbsoluteFill style={{ background: K.night }}>
      <Glitch amount={1.6}>
        <AbsoluteFill>
          <svg width={W} height={H}>
            {/* dotara strings vibrating with the bass */}
            {Array.from({ length: strings }, (_, s) => {
              const y = 260 + s * 110;
              const amp = (bass * 60 + onset * 30) * (1 - s * 0.08);
              let d = `M 0 ${y}`;
              for (let x = 0; x <= W; x += 40) d += ` L ${x} ${y + Math.sin(x / 70 + frame * 0.9 + s) * amp * Math.sin((x / W) * Math.PI)}`;
              return <path key={s} d={d} fill="none" stroke={s % 2 ? K.neonCyan : K.neonPink} strokeWidth={4} opacity={0.85} />;
            })}
            {/* radial equaliser */}
            {Array.from({ length: 64 }, (_, i) => {
              const a = (i / 64) * Math.PI * 2;
              const len = 60 + (rnd(i + Math.floor(frame / 2)) * 0.5 + 0.5) * rms * 260;
              return <line key={i} x1={960 + Math.cos(a) * 160} y1={540 + Math.sin(a) * 160} x2={960 + Math.cos(a) * (160 + len)} y2={540 + Math.sin(a) * (160 + len)}
                stroke={i % 3 ? K.neonViolet : K.amber} strokeWidth={8} strokeLinecap="round" />;
            })}
            <circle cx={960} cy={540} r={140 + bass * 30} fill="#120f1f" stroke={K.neonPink} strokeWidth={6} />
          </svg>
        </AbsoluteFill>
      </Glitch>
      <LinesOf lines={lines} sec="Instrumental Drop" render={(l) => (
        <Lyric line={l} size={150} y={460} accent={K.amber} shadow={`0 0 40px ${K.amber}, 0 0 90px ${K.neonPink}`} />
      )} />
      {t > 138.6 && t < 141 && <AbsoluteFill style={{ background: "#fff", opacity: interpolate(t, [138.6, 139.4], [0.8, 0], clamp) }} />}
      <Grain strength={0.12} />
    </AbsoluteFill>
  );
};

const Verse2Sec: React.FC<{ lines: MVLine[] }> = ({ lines }) => {
  const { frame, beat, bass, t } = useA();
  const v = lines.filter((l) => l.sec === "Verse 2");
  const cur = Math.max(0, v.findIndex((l) => t >= l.start - 0.3 && t <= l.end + 0.5));
  const group = Math.floor(cur / 2); // 5 couplets, one prop each
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0a1030 0%, #05040a 100%)" }}>
      {/* metro rail passing behind */}
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {Array.from({ length: 4 }, (_, c) => {
          const x = ((-(frame * 22) + c * 760) % 3040) + 1900;
          return (
            <g key={c} transform={`translate(${x - 1520} 120)`}>
              <rect width={720} height={220} rx={30} fill="#1d2a4a" stroke={K.neonCyan} strokeWidth={4} />
              {Array.from({ length: 5 }, (_, w) => (
                <g key={w}>
                  <rect x={30 + w * 136} y={40} width={110} height={110} rx={10} fill="#0b1328" />
                  <circle cx={85 + w * 136} cy={95} r={26} fill="#3a4a72" />
                </g>
              ))}
            </g>
          );
        })}
        <line x1={0} y1={350} x2={W} y2={350} stroke={K.neonCyan} strokeOpacity={0.4} strokeWidth={4} />
      </svg>
      {/* the phone with the scene's prop */}
      <div style={{ position: "absolute", left: 760, top: 380, width: 400, height: 420, borderRadius: 40, background: "#0f1424",
        border: `6px solid ${K.neonCyan}`, boxShadow: `0 0 ${40 + bass * 40}px rgba(39,224,255,0.45)`, overflow: "hidden",
        transform: `translateY(${-beat * 10}px)` }}>
        <svg width={388} height={408}>
          {group === 0 && (<g><circle cx={194} cy={190} r={110} fill={K.gold} /><circle cx={154} cy={160} r={14} fill="#2b2418" /><circle cx={234} cy={160} r={14} fill="#2b2418" /><path d="M 134 220 Q 194 280 254 220" stroke="#2b2418" strokeWidth={12} fill="none" strokeLinecap="round" /><text x={194} y={370} textAnchor="middle" fontFamily={BN} fontSize={34} fill="#fff">ভেতরটা আনফিল</text></g>)}
          {group === 1 && (<g>{[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={70 + (k % 3) * 125} cy={110 + Math.floor(k / 3) * 150} r={48} fill="#3a4a72" />)}<text x={194} y={380} textAnchor="middle" fontFamily={BN} fontSize={34} fill="#fff">চোখে কারও চোখ নেই</text></g>)}
          {group === 2 && (<g><rect x={124} y={150} width={140} height={110} rx={14} fill={K.neonViolet} /><path d="M 154 150 V 110 a 40 40 0 0 1 80 0 V 150" stroke={K.neonViolet} strokeWidth={14} fill="none" /><path d="M 90 330 a 50 50 0 0 1 60 -50 a 60 60 0 0 1 110 10 a 40 40 0 0 1 40 40 z" fill="#cfd6ff" /><text x={194} y={60} textAnchor="middle" fontFamily={EN} fontSize={30} fill="#fff">•••••••</text></g>)}
          {group === 3 && (<g><rect x={64} y={110} width={260} height={130} rx={10} fill="#1f7a3a" /><text x={194} y={170} textAnchor="middle" fontFamily={BN} fontSize={34} fontWeight={800} fill="#fff">স্টেশন</text><text x={194} y={215} textAnchor="middle" fontFamily={BN} fontSize={30} fill="#fff">নেই</text><line x1={64} y1={110} x2={324} y2={240} stroke={K.red} strokeWidth={10} /></g>)}
          {group >= 4 && (<g><circle cx={194} cy={190} r={120} fill="none" stroke={K.amber} strokeWidth={10} /><line x1={194} y1={190} x2={194 + Math.cos(frame / 10) * 100} y2={190 + Math.sin(frame / 10) * 100} stroke={K.amber} strokeWidth={10} strokeLinecap="round" /><text x={194} y={370} textAnchor="middle" fontFamily={EN} fontSize={34} fontWeight={800} fill="#fff">AUTOPILOT</text></g>)}
        </svg>
      </div>
      <LinesOf lines={lines} sec="Verse 2" render={(l) => <Lyric line={l} size={64} y={860} accent={K.neonCyan} box />} />
      <Grain />
      <Vignette amount={0.6} />
    </AbsoluteFill>
  );
};

const BridgeSec: React.FC<{ lines: MVLine[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const { rms, t } = useA();
  const sun = interpolate(frame, [0, 27 * 30], [760, 420], clamp);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #2a1838 0%, #b0533d 55%, #f2a65a 100%)" }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <circle cx={960} cy={sun} r={170} fill="#ffd9a0" opacity={0.9} />
        <circle cx={960} cy={sun} r={240 + rms * 40} fill="#ffd9a0" opacity={0.18} />
        <rect x={0} y={760} width={W} height={320} fill="#2a1626" />
        {/* the dream: a dusty glowing orb, and a hand reaching to it */}
        {Array.from({ length: 70 }, (_, i) => {
          const a = rnd(i) * Math.PI * 2;
          const r = 60 + rnd(i + 5) * 120 + Math.sin(frame / 30 + i) * 8;
          return <circle key={i} cx={1300 + Math.cos(a) * r} cy={600 + Math.sin(a) * r * 0.7 - ((frame * (0.3 + rnd(i))) % 200)} r={2 + rnd(i + 1) * 3} fill="#ffe7b8" opacity={0.6} />;
        })}
        <circle cx={1300} cy={600} r={70} fill="#ffe7b8" opacity={interpolate(t, [254, 262], [0.3, 0.95], clamp)} />
        <path d={`M ${560} 900 C 800 ${820 - rms * 40} 1000 ${700} ${interpolate(t, [254, 262], [1100, 1220], clamp)} 640`} stroke="#2a1626" strokeWidth={46} strokeLinecap="round" fill="none" />
        {/* single guitar string */}
        <line x1={0} y1={980} x2={W} y2={980 + Math.sin(frame * 1.3) * rms * 14} stroke="#ffd9a0" strokeWidth={3} opacity={0.8} />
        <Person x={560} y={980} s={2.4} fill="#160c16" stroke="#160c16" />
      </svg>
      <LinesOf lines={lines} sec="Bridge" render={(l) => <Lyric line={l} size={62} y={90} color="#fff4e2" accent={K.amber} font={BN_SERIF} />} />
      <Grain strength={0.1} />
      <Vignette amount={0.45} />
    </AbsoluteFill>
  );
};

const BuildSec: React.FC<{ lines: MVLine[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const { beat, rms } = useA();
  return (
    <AbsoluteFill style={{ background: K.night }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {Array.from({ length: 24 }, (_, i) => {
          const x = (i / 24) * W;
          const h = 40 + rnd(i + Math.floor(frame / 4)) * 160 * (0.3 + frame / 550);
          return <rect key={i} x={x + 10} y={H - h} width={W / 24 - 20} height={h} fill={i % 2 ? K.neonViolet : K.neonCyan} opacity={0.35} />;
        })}
        <Person x={960} y={760} s={2.6 + frame / 600} fill="#000" stroke={K.neonViolet} />
        <ellipse cx={960} cy={760} rx={200 + beat * 40 + rms * 60} ry={30} fill={K.neonViolet} opacity={0.25} />
      </svg>
      <LinesOf lines={lines} sec="Final Build" render={(l, i) => <Lyric line={l} size={90} y={120 + (i % 2) * 140} accent={K.neonCyan} font={BN_SERIF} />} />
      <Grain strength={0.16} />
      <Vignette amount={0.9} />
    </AbsoluteFill>
  );
};

const FinalSec: React.FC<{ lines: MVLine[]; title: string }> = ({ lines, title }) => {
  const frame = useCurrentFrame();
  const { bass, beat, t } = useA();
  const firstLine = lines.find((l) => l.sec === "Final Chorus");
  const found = interpolate(t, [(firstLine?.start ?? 289) + 2.5, (firstLine?.start ?? 289) + 3.2], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <NeonCity speed={1.0} glow={1.8} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, rgba(255,210,63,${0.15 + bass * 0.2}) 0%, transparent 60%)` }} />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {/* confetti */}
        {Array.from({ length: 120 }, (_, i) => {
          const x = rnd(i) * W + Math.sin(frame / 20 + i) * 30;
          const y = ((rnd(i + 7) * H + frame * (3 + rnd(i) * 5)) % (H + 40)) - 20;
          return <rect key={i} x={x} y={y} width={10} height={18} fill={[K.gold, K.neonPink, K.neonCyan, K.green][i % 4]}
            transform={`rotate(${frame * 6 + i * 30} ${x} ${y})`} opacity={found} />;
        })}
        <Poster x={960} y={400} s={1.05 + bass * 0.07 + beat * 0.04} found={found} rot={Math.sin(frame / 30) * 2} title={title} />
      </svg>
      <LinesOf lines={lines} sec="Final Chorus" render={(l) => (
        <Lyric line={l} size={l.text.startsWith("ও-ও") ? 120 : 76} y={l.text.startsWith("ও-ও") ? 420 : 812}
          accent={K.gold} shadow={`0 0 30px ${K.gold}, 0 6px 0 #000`} />
      )} />
      <Flash at={(firstLine?.start ?? 289) + 2.6} color={K.gold} len={0.5} />
      <Vignette amount={0.45} />
    </AbsoluteFill>
  );
};

const OutroSec: React.FC<{ lines: MVLine[]; title: string; subtitle: string; artist: string; editor: string; end: number }> = ({
  lines, title, subtitle, artist, editor, end,
}) => {
  const { t } = useA();
  const aligned = interpolate(t, [340, 344], [0, 1], clamp);
  const smile = interpolate(t, [346, 347.5], [0, 1], clamp);
  const credits = interpolate(t, [end - 4.5, end - 3.5], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #2a2238 0%, #07060d 70%)" }}>
      <Mirror lag={1 - aligned} aligned={aligned} smile={smile} />
      <LinesOf lines={lines} sec="Outro" render={(l, i) => (
        <Lyric line={l} size={i === 3 ? 72 : 50} y={i % 2 ? 930 : 70} color="#fff4e2" accent={K.gold} font={BN_SERIF} />
      )} />
      <Flash at={348.3} color={K.gold} len={0.6} />
      <AbsoluteFill style={{ background: `rgba(7,6,13,${credits * 0.9})`, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, opacity: credits }}>
        <div style={{ fontFamily: BN_SERIF, fontWeight: 900, fontSize: 150, color: "#fff", textShadow: `0 0 40px ${K.gold}` }}>{title}</div>
        <div style={{ fontFamily: EN, fontSize: 40, letterSpacing: 18, color: K.amber }}>{subtitle.toUpperCase()}</div>
        <div style={{ fontFamily: EN, fontSize: 34, color: "#cfc8e8", marginTop: 30 }}>{artist}  •  Edited by {editor}</div>
      </AbsoluteFill>
      <Grain strength={0.12} />
      <Vignette amount={0.75} />
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------------------- composition

const Section: React.FC<{ sections: MVProps["sections"]; id: string; children: React.ReactNode }> = ({ sections, id, children }) => {
  const { fps } = useVideoConfig();
  const s = sections.find((x) => x.id === id)!;
  return (
    <Sequence from={Math.round(s.start * fps)} durationInFrames={Math.round((s.end - s.start) * fps)}>
      {children}
    </Sequence>
  );
};

export const MusicVideo: React.FC<MVProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const i = Math.min(frame, p.bass.length - 1);
  const t = frame / fps;
  // beat pulse: decays over ~0.25 s after each beat
  let last = -10;
  for (let k = 0; k < p.beats.length && p.beats[k] <= t; k++) last = p.beats[k];
  const beat = Math.exp(-(t - last) * 9);
  const ctx: AudioCtx = { frame, fps, t, bass: p.bass[i] ?? 0, rms: p.rms[i] ?? 0, onset: p.onset[i] ?? 0, beat, hideLyrics: p.hideLyrics };
  return (
    <AudioState.Provider value={ctx}>
      <AbsoluteFill style={{ background: K.night }}>
        <Section sections={p.sections} id="intro"><IntroSec lines={p.lines} /></Section>
        <Section sections={p.sections} id="groove"><GrooveSec title={p.title} subtitle={p.subtitle} artist={p.artist} /></Section>
        <Section sections={p.sections} id="verse1"><Verse1Sec lines={p.lines} /></Section>
        <Section sections={p.sections} id="pre1"><Pre1Sec lines={p.lines} sec="Pre-Chorus" /></Section>
        <Section sections={p.sections} id="chorus1"><ChorusSec lines={p.lines} sec="Chorus" title={p.title} /></Section>
        <Section sections={p.sections} id="drop"><DropSec lines={p.lines} /></Section>
        <Section sections={p.sections} id="verse2"><Verse2Sec lines={p.lines} /></Section>
        <Section sections={p.sections} id="pre2"><Pre1Sec lines={p.lines} sec="Pre-Chorus 2" rain /></Section>
        <Section sections={p.sections} id="chorus2"><ChorusSec lines={p.lines} sec="Chorus 2" title={p.title} wall /></Section>
        <Section sections={p.sections} id="bridge"><BridgeSec lines={p.lines} /></Section>
        <Section sections={p.sections} id="build"><BuildSec lines={p.lines} /></Section>
        <Section sections={p.sections} id="final"><FinalSec lines={p.lines} title={p.title} /></Section>
        <Section sections={p.sections} id="outro">
          <OutroSec lines={p.lines} title={p.title} subtitle={p.subtitle} artist={p.artist} editor={p.editor} end={p.durationSec} />
        </Section>
        {/* short dips to black between sections */}
        {p.sections.slice(1).map((s) => {
          const o = interpolate(t, [s.start - 0.12, s.start, s.start + 0.18], [0, 0.85, 0], clamp);
          return o > 0 ? <AbsoluteFill key={s.id} style={{ background: "#000", opacity: o }} /> : null;
        })}
        {!p.muted && <Audio src={staticFile(p.song)} />}
      </AbsoluteFill>
    </AudioState.Provider>
  );
};
