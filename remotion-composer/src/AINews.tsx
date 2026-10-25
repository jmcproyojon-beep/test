import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
// @ts-ignore -- d3-geo ships no type declarations in this project
import { geoMercator, geoOrthographic, geoPath, geoGraticule10 } from "d3-geo";
// @ts-ignore -- topojson-client ships no type declarations in this project
import { feature } from "topojson-client";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- JSON topology shipped by world-atlas
import world110 from "world-atlas/countries-110m.json";

// ---------------------------------------------------------------------------
// Daily AI News: vertical news explainer driven by a recorded voiceover.
// Scene and caption timings come from props (seconds), measured from the voice track.
// ---------------------------------------------------------------------------

export type AINewsSentence = {
  text: string;
  start: number;
  end: number;
};

export type AINewsProps = {
  voice: string;
  music: string;
  host: string;
  amp: number[]; // voice loudness per frame, 0..1
  dateLabel: string;
  scenes: { start: number; end: number; tag: string }[];
  sentences: AINewsSentence[];
};

export const C = {
  bg0: "#05060f",
  bg1: "#0b1030",
  blue: "#3b82f6",
  cyan: "#22d3ee",
  purple: "#a855f7",
  pink: "#ec4899",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f8fafc",
  muted: "#94a3b8",
  panel: "rgba(15, 23, 60, 0.72)",
  line: "rgba(148, 163, 184, 0.25)",
};
export const BN = "'Noto Sans Bengali', 'Noto Sans', sans-serif";
export const EN = "'Noto Sans', 'DejaVu Sans', sans-serif";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Per-scene time scale: >1 plays a scene's animations faster so they fit a shorter slot. */
export const TimeScale = React.createContext(1);
export const useSceneFrame = () => useCurrentFrame() * React.useContext(TimeScale);

export const useAppear = (delay = 0, damping = 14) => {
  const frame = useSceneFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness: 110, mass: 0.9 } });
};

// --------------------------------------------------------------------------- background

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const dots = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        x: (i * 137.5) % 1080,
        y: (i * 263.3) % 1920,
        s: 1 + ((i * 7) % 3),
        v: 6 + ((i * 13) % 14),
      })),
    [],
  );
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 30%, ${C.bg1} 0%, ${C.bg0} 70%)`,
      }}
    >
      {/* perspective grid floor */}
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.35 }}>
        {Array.from({ length: 22 }, (_, i) => {
          const y = 1920 - ((i * 90 + t * 40) % 1980);
          return <line key={`h${i}`} x1={0} x2={1080} y1={y} y2={y} stroke={C.purple} strokeOpacity={0.18} />;
        })}
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`v${i}`} x1={i * 90} x2={i * 90} y1={0} y2={1920} stroke={C.blue} strokeOpacity={0.12} />
        ))}
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={(d.y - t * d.v * 3 + 1920 * 4) % 1920}
            r={d.s}
            fill={i % 3 ? C.cyan : C.purple}
            opacity={0.5}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------------------- chrome

export const TopBar: React.FC<{ dateLabel: string }> = ({ dateLabel }) => {
  const frame = useCurrentFrame();
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin(frame / 12));
  return (
    <div
      style={{
        position: "absolute",
        top: 34,
        left: 40,
        right: 40,
        height: 92,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: EN,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            background: `linear-gradient(90deg, ${C.blue}, ${C.purple})`,
            padding: "10px 22px",
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 40,
            color: C.text,
            letterSpacing: 2,
          }}
        >
          DAILY AI NEWS
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.text, fontSize: 30, fontWeight: 700 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: C.red, opacity: pulse }} />
          LIVE
        </div>
      </div>
      <div style={{ fontFamily: BN, fontSize: 32, color: C.muted, fontWeight: 700 }}>{dateLabel}</div>
    </div>
  );
};

export const Panel: React.FC<{ tag: string; children: React.ReactNode }> = ({ tag, children }) => {
  const a = useAppear(0, 16);
  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 40,
        width: 1000,
        height: 930,
        borderRadius: 36,
        background: C.panel,
        border: `2px solid ${C.line}`,
        boxShadow: `0 0 60px rgba(59,130,246,0.25), inset 0 0 80px rgba(168,85,247,0.08)`,
        overflow: "hidden",
        transform: `scale(${interpolate(a, [0, 1], [0.94, 1])})`,
        opacity: a,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          top: 26,
          left: 30,
          right: 30,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: EN,
            fontWeight: 800,
            fontSize: 34,
            color: C.text,
            letterSpacing: 1.5,
            padding: "10px 24px",
            borderRadius: 12,
            background: "rgba(5,6,15,0.65)",
            border: `2px solid ${C.cyan}`,
            transform: `translateY(${interpolate(useAppear(8), [0, 1], [-30, 0])}px)`,
            opacity: useAppear(8),
            textAlign: "center",
          }}
        >
          {tag}
        </div>
      </div>
    </div>
  );
};

export const HostCard: React.FC<{ host: string; amp: number[] }> = ({ host, amp }) => {
  const frame = useCurrentFrame();
  const a = useAppear(4, 18);
  const level = amp[Math.min(frame, amp.length - 1)] ?? 0;
  const smooth = (k: number) => amp[Math.max(0, Math.min(frame - k, amp.length - 1))] ?? 0;
  const talk = (level + smooth(1) + smooth(2)) / 3;
  const breathe = 1.04 + 0.012 * Math.sin(frame / 45);
  return (
    <div
      style={{
        position: "absolute",
        top: 1100,
        left: 60,
        width: 960,
        height: 540,
        borderRadius: 30,
        overflow: "hidden",
        border: `3px solid ${C.purple}`,
        boxShadow: `0 0 ${30 + talk * 40}px rgba(168,85,247,${0.35 + talk * 0.35})`,
        opacity: a,
        transform: `translateY(${interpolate(a, [0, 1], [60, 0])}px)`,
      }}
    >
      <Img
        src={staticFile(host)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${breathe}) translateY(${-talk * 2}px)`,
        }}
      />
      {/* lower third */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 96,
          background: "linear-gradient(90deg, rgba(37,99,235,0.95), rgba(124,58,237,0.9))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 30px",
        }}
      >
        <div style={{ fontFamily: BN, fontSize: 40, fontWeight: 700, color: C.text }}>AI নিউজ ডেস্ক</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, height: 60 }}>
          {Array.from({ length: 14 }, (_, i) => {
            const v = smooth(i % 5) * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + frame / 4)));
            return (
              <div
                key={i}
                style={{ width: 8, height: 8 + v * 50, borderRadius: 4, background: C.cyan, opacity: 0.9 }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const Captions: React.FC<{ sentences: AINewsSentence[] }> = ({ sentences }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const s = sentences.find((x) => t >= x.start - 0.05 && t <= x.end + 0.25);
  if (!s) return null;
  const local = (t - s.start) * 30;
  const op = interpolate(local, [0, 6], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 1662,
        left: 50,
        right: 50,
        minHeight: 140,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: op,
      }}
    >
      <div
        style={{
          fontFamily: BN,
          fontWeight: 700,
          fontSize: 42,
          lineHeight: 1.45,
          color: C.text,
          textAlign: "center",
          background: "rgba(5,6,15,0.78)",
          borderRadius: 18,
          padding: "14px 26px",
          borderLeft: `6px solid ${C.cyan}`,
        }}
      >
        {s.text}
      </div>
    </div>
  );
};

export const Ticker: React.FC<{ text?: string }> = ({ text: custom }) => {
  const frame = useCurrentFrame();
  const text =
    custom ??
    "NEW AI MODEL  •  FREE AI  •  SECURITY  •  MINIMAX M3.1 FLASH  •  OPENROUTER FREE TIER  •  LOCAL LANGUAGE AI  •  FIRECRAWL × GOOGLE CLOUD  •  AI SECURITY UPDATE  •  ";
  const x = -((frame * 4) % 2400);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 92,
        background: "rgba(5,6,15,0.92)",
        borderTop: `3px solid ${C.blue}`,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          zIndex: 2,
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 22px",
          background: C.red,
          fontFamily: EN,
          fontWeight: 800,
          fontSize: 30,
          color: C.text,
        }}
      >
        BREAKING
      </div>
      <div
        style={{
          whiteSpace: "nowrap",
          transform: `translateX(${x + 220}px)`,
          fontFamily: EN,
          fontWeight: 700,
          fontSize: 32,
          color: C.text,
        }}
      >
        {text + text + text}
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------- shared pieces

export const countries = (feature as any)(world110, (world110 as any).objects.countries).features as any[];

export const Globe: React.FC<{ size: number; speed?: number; highlight?: string[]; trails?: boolean }> = ({
  size,
  speed = 0.25,
  highlight = [],
  trails = false,
}) => {
  const frame = useCurrentFrame();
  const proj = geoOrthographic()
    .scale(size / 2 - 6)
    .translate([size / 2, size / 2])
    .rotate([-90 + frame * speed, -12]);
  const path = geoPath(proj);
  return (
    <svg width={size} height={size}>
      <defs>
        <radialGradient id="globeGlow" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0b1030" />
        </radialGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 6} fill="url(#globeGlow)" stroke={C.cyan} strokeWidth={2} />
      <path d={path(geoGraticule10()) || ""} fill="none" stroke={C.blue} strokeOpacity={0.35} />
      {countries.map((f, i) => (
        <path
          key={i}
          d={path(f) || ""}
          fill={highlight.includes(String(f.id)) ? C.amber : "rgba(34,211,238,0.35)"}
          stroke={C.cyan}
          strokeOpacity={0.6}
          strokeWidth={0.6}
        />
      ))}
      {trails &&
        Array.from({ length: 5 }, (_, i) => {
          const ang = frame * 0.03 + (i * Math.PI * 2) / 5;
          const r = size / 2 + 20;
          return (
            <ellipse
              key={i}
              cx={size / 2}
              cy={size / 2}
              rx={r}
              ry={r * 0.28}
              fill="none"
              stroke={i % 2 ? C.purple : C.blue}
              strokeWidth={3}
              strokeDasharray="60 900"
              strokeDashoffset={-ang * 200}
              transform={`rotate(${-20 + i * 36} ${size / 2} ${size / 2})`}
              opacity={0.8}
            />
          );
        })}
    </svg>
  );
};

export const Chip: React.FC<{ text: string; color: string; delay: number; font?: string; size?: number }> = ({
  text,
  color,
  delay,
  font = EN,
  size = 34,
}) => {
  const a = useAppear(delay);
  return (
    <div
      style={{
        fontFamily: font,
        fontWeight: 800,
        fontSize: size,
        color: C.text,
        padding: "12px 24px",
        borderRadius: 14,
        background: `${color}33`,
        border: `2px solid ${color}`,
        transform: `scale(${interpolate(a, [0, 1], [0.6, 1])})`,
        opacity: a,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

export const Processor: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const glow = 0.5 + 0.5 * Math.sin(frame / 8);
  const pins = 9;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      {Array.from({ length: pins }, (_, i) => {
        const p = 40 + i * 15;
        const lit = (Math.floor(frame / 3) + i) % pins < 3;
        const col = lit ? C.cyan : "#334155";
        return (
          <g key={i}>
            <line x1={p} y1={10} x2={p} y2={40} stroke={col} strokeWidth={4} />
            <line x1={p} y1={160} x2={p} y2={190} stroke={col} strokeWidth={4} />
            <line x1={10} y1={p} x2={40} y2={p} stroke={col} strokeWidth={4} />
            <line x1={160} y1={p} x2={190} y2={p} stroke={col} strokeWidth={4} />
          </g>
        );
      })}
      <rect x={40} y={40} width={120} height={120} rx={14} fill="#0f172a" stroke={C.purple} strokeWidth={4} />
      <rect x={60} y={60} width={80} height={80} rx={8} fill={`rgba(168,85,247,${0.25 + glow * 0.35})`} stroke={C.cyan} strokeWidth={2} />
      <text x={100} y={112} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={30} fill={C.text}>
        AI
      </text>
    </svg>
  );
};

// --------------------------------------------------------------------------- scenes

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 330], [1.0, 1.12], clamp);
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      <div style={{ position: "absolute", left: 210, top: 150 }}>
        <Globe size={580} speed={0.35} trails />
      </div>
      <div style={{ position: "absolute", left: 400, top: 330, transform: `rotate(${frame * 0.3}deg)` }}>
        <Processor size={200} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 70,
          display: "flex",
          justifyContent: "center",
          gap: 18,
        }}
      >
        <Chip text="NEW AI MODEL" color={C.blue} delay={15} />
        <Chip text="FREE AI" color={C.green} delay={145} />
        <Chip text="SECURITY" color={C.amber} delay={200} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 160, display: "flex", justifyContent: "center" }}>
        <Chip text="৭০% পর্যন্ত কম খরচের দাবি" color={C.purple} delay={45} font={BN} size={40} />
      </div>
    </AbsoluteFill>
  );
};

export const Bar: React.FC<{ label: string; value: number; color: string; delay: number }> = ({ label, value, color, delay }) => {
  const a = useAppear(delay, 20);
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontFamily: EN, fontSize: 30, color: C.muted, fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <div style={{ height: 34, background: "rgba(148,163,184,0.15)", borderRadius: 17, overflow: "hidden" }}>
        <div style={{ width: `${value * a * 100}%`, height: "100%", background: color, borderRadius: 17 }} />
      </div>
    </div>
  );
};

const SceneMiniMax: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = useAppear(5, 12);
  const tiles = [
    { t: "AI Agent", c: C.cyan },
    { t: "Coding", c: C.purple },
    { t: "Computer Use", c: C.pink },
  ];
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 130,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: EN,
          fontWeight: 900,
          fontSize: 96,
          color: C.text,
          letterSpacing: interpolate(reveal, [0, 1], [30, 2]),
          opacity: reveal,
          textShadow: `0 0 30px ${C.purple}`,
        }}
      >
        MiniMax
      </div>
      <div
        style={{
          position: "absolute",
          top: 250,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: EN,
          fontWeight: 800,
          fontSize: 54,
          background: `linear-gradient(90deg, ${C.cyan}, ${C.purple})`,
          WebkitBackgroundClip: "text",
          color: "transparent",
          opacity: useAppear(20),
        }}
      >
        M3.1 Flash
      </div>
      <div style={{ position: "absolute", top: 345, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Chip text="১৯ অক্টোবর • RELEASED" color={C.green} delay={30} font={BN} size={32} />
      </div>
      <div style={{ position: "absolute", top: 450, left: 60, right: 60, display: "flex", gap: 20 }}>
        {tiles.map((x, i) => {
          const a = useAppear(150 + i * 12);
          return (
            <div
              key={x.t}
              style={{
                flex: 1,
                height: 120,
                borderRadius: 18,
                border: `2px solid ${x.c}`,
                background: `${x.c}22`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: EN,
                fontWeight: 800,
                fontSize: 34,
                color: C.text,
                opacity: a,
                transform: `translateY(${interpolate(a, [0, 1], [40, 0])}px)`,
              }}
            >
              {x.t}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 610, left: 80, right: 80 }}>
        <Bar label="Speed vs previous version" value={0.86} color={`linear-gradient(90deg, ${C.blue}, ${C.cyan})`} delay={250} />
        <Bar label="Cost efficiency vs previous version" value={0.92} color={`linear-gradient(90deg, ${C.purple}, ${C.pink})`} delay={265} />
        <div
          style={{
            display: "inline-block",
            fontFamily: EN,
            fontWeight: 800,
            fontSize: 28,
            color: C.amber,
            border: `2px solid ${C.amber}`,
            borderRadius: 10,
            padding: "6px 16px",
            opacity: useAppear(280),
          }}
        >
          COMPANY CLAIMS • illustrative, not measured
        </div>
      </div>
      {/* code dashboard flicker */}
      <div
        style={{
          position: "absolute",
          right: 50,
          top: 140,
          fontFamily: "monospace",
          fontSize: 18,
          color: C.green,
          opacity: 0.35,
          lineHeight: 1.4,
          textAlign: "right",
        }}
      >
        {["agent.plan()", "tools.run('browser')", "code.fix(tests)", "status: done ✓"].slice(0, 1 + Math.floor(frame / 40) % 4).map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const SceneFree: React.FC = () => {
  const frame = useCurrentFrame();
  const prompt = "Write a Python function to summarise a CSV file";
  const typed = prompt.slice(0, Math.max(0, Math.floor((frame - 60) / 1.6)));
  const respStart = 60 + prompt.length * 1.6 + 15;
  const lines = [
    "import pandas as pd",
    "def summarise(path):",
    "    df = pd.read_csv(path)",
    "    return df.describe()",
  ];
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 130,
          left: 60,
          right: 60,
          height: 600,
          borderRadius: 24,
          background: "#0b1224",
          border: `2px solid ${C.line}`,
          overflow: "hidden",
          opacity: useAppear(5),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 24px", borderBottom: `1px solid ${C.line}` }}>
          <div style={{ fontFamily: EN, fontSize: 26, color: C.muted, fontWeight: 700 }}>Model:</div>
          <div
            style={{
              fontFamily: EN,
              fontSize: 28,
              fontWeight: 800,
              color: C.text,
              padding: "6px 16px",
              borderRadius: 10,
              border: `2px solid ${C.green}`,
              background: `${C.green}22`,
            }}
          >
            MiniMax M3.1 Flash · free
          </div>
          <div style={{ marginLeft: "auto", fontFamily: EN, fontSize: 24, color: C.muted }}>via OpenRouter</div>
        </div>
        <div style={{ padding: 24 }}>
          <div
            style={{
              fontFamily: EN,
              fontSize: 30,
              color: C.text,
              background: "rgba(59,130,246,0.18)",
              borderRadius: 14,
              padding: "14px 18px",
              minHeight: 46,
            }}
          >
            {typed}
            {frame % 30 < 15 && frame < respStart ? "▍" : ""}
          </div>
          <div style={{ marginTop: 22, fontFamily: "monospace", fontSize: 28, color: C.cyan, lineHeight: 1.6 }}>
            {lines.map((l, i) => (
              <div key={l} style={{ opacity: interpolate(frame, [respStart + i * 14, respStart + i * 14 + 8], [0, 1], clamp), whiteSpace: "pre" }}>
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 770, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 16 }}>
        <Chip text="Coding" color={C.purple} delay={160} />
        <Chip text="Research" color={C.blue} delay={172} />
        <Chip text="AI Prototype" color={C.cyan} delay={184} />
      </div>
      <div style={{ position: "absolute", top: 860, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Chip text="সীমিত দৈনিক ব্যবহার • Rate limits apply" color={C.amber} delay={200} font={BN} size={30} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 108,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: EN,
          fontSize: 20,
          color: C.muted,
          opacity: 0.8,
        }}
      >
        illustrative demo · not a screen recording
      </div>
    </AbsoluteFill>
  );
};

const SEA_IDS = ["360"]; // Indonesia
const BD = "050"; // Bangladesh
const SceneLocal: React.FC = () => {
  const frame = useCurrentFrame();
  const proj = geoMercator().center([104, 9]).scale(1250).translate([520, 500]);
  const path = geoPath(proj);
  const bdOn = interpolate(frame, [190, 220], [0, 1], clamp);
  const indo = countries.find((f) => String(f.id) === "360");
  const bd = countries.find((f) => String(f.id) === BD);
  const [ix, iy] = indo ? path.centroid(indo) : [600, 600];
  const [bx, by] = bd ? path.centroid(bd) : [200, 300];
  return (
    <AbsoluteFill>
      <svg width={1000} height={930} style={{ position: "absolute", left: 0, top: 0 }}>
        {countries.map((f, i) => {
          const id = String(f.id);
          const isIndo = SEA_IDS.includes(id);
          const isBd = id === BD;
          return (
            <path
              key={i}
              d={path(f) || ""}
              fill={isIndo ? `rgba(34,197,94,${0.35 + 0.25 * Math.sin(frame / 10)})` : isBd ? `rgba(245,158,11,${0.2 + bdOn * 0.6})` : "rgba(59,130,246,0.18)"}
              stroke={isIndo ? C.green : isBd ? C.amber : C.cyan}
              strokeOpacity={0.7}
              strokeWidth={isIndo || isBd ? 2 : 0.8}
            />
          );
        })}
        {/* six language nodes radiating from Indonesia */}
        {Array.from({ length: 6 }, (_, k) => {
          const a = useAppear(40 + k * 10);
          const ang = (k / 6) * Math.PI * 2 - Math.PI / 2;
          const r = 170 * a;
          const x = ix + Math.cos(ang) * r;
          const y = iy + Math.sin(ang) * r * 0.75;
          return (
            <g key={k} opacity={a}>
              <line x1={ix} y1={iy} x2={x} y2={y} stroke={C.green} strokeWidth={2} strokeDasharray="6 6" strokeDashoffset={-frame} />
              <circle cx={x} cy={y} r={30} fill="#052e16" stroke={C.green} strokeWidth={3} />
              <text x={x} y={y + 10} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={28} fill={C.text}>
                {"১২৩৪৫৬"[k]}
              </text>
            </g>
          );
        })}
        {/* future possibility: Bangladesh */}
        <g opacity={bdOn}>
          <circle cx={bx} cy={by} r={30 + 18 * Math.abs(Math.sin(frame / 12))} fill="none" stroke={C.amber} strokeWidth={4} />
          <line x1={bx} y1={by} x2={bx + 20} y2={by + 60} stroke={C.amber} strokeWidth={3} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 40, bottom: 60, display: "flex", flexDirection: "column", gap: 14 }}>
        <Chip text="GoTo • Indonesia" color={C.green} delay={20} />
        <Chip text="৬টি ভাষার AI মডেল • Open" color={C.green} delay={60} font={BN} size={32} />
      </div>
      <div style={{ position: "absolute", left: Math.min(Math.max(20, bx - 40), 560), top: by + 60, opacity: bdOn }}>
        <Chip text="বাংলা AI — ভবিষ্যৎ সম্ভাবনা" color={C.amber} delay={195} font={BN} size={32} />
      </div>
    </AbsoluteFill>
  );
};

const SceneFirecrawl: React.FC = () => {
  const frame = useCurrentFrame();
  const nodes = [
    { label: "Website", sub: "live pages", c: C.blue, y: 150 },
    { label: "Firecrawl", sub: "crawl + extract", c: C.amber, y: 330 },
    { label: "Structured data", sub: "JSON cards", c: C.cyan, y: 510 },
    { label: "Gemini AI Agent", sub: "on Google Cloud", c: C.purple, y: 690 },
  ];
  return (
    <AbsoluteFill>
      {nodes.map((n, i) => {
        const a = useAppear(10 + i * 40);
        return (
          <React.Fragment key={n.label}>
            {i > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: 497,
                  top: nodes[i - 1].y + 120,
                  width: 6,
                  height: 60 * a,
                  background: `linear-gradient(${nodes[i - 1].c}, ${n.c})`,
                }}
              />
            )}
            {i > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: 488,
                  top: nodes[i - 1].y + 120 + ((frame * 3 + i * 20) % 60),
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  background: n.c,
                  opacity: a * 0.9,
                  boxShadow: `0 0 18px ${n.c}`,
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                left: 200,
                width: 600,
                top: n.y,
                height: 120,
                borderRadius: 22,
                border: `3px solid ${n.c}`,
                background: `${n.c}22`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity: a,
                transform: `scale(${interpolate(a, [0, 1], [0.8, 1])})`,
              }}
            >
              <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 40, color: C.text }}>{n.label}</div>
              <div style={{ fontFamily: EN, fontSize: 24, color: C.muted }}>{n.sub}</div>
            </div>
          </React.Fragment>
        );
      })}
      {/* data cards flying in beside structured data */}
      {["{ title }", "{ price }", "{ date }"].map((t, i) => {
        const a = useAppear(110 + i * 12);
        return (
          <div
            key={t}
            style={{
              position: "absolute",
              left: i % 2 ? 830 : 30,
              top: 470 + i * 50,
              fontFamily: "monospace",
              fontSize: 24,
              color: C.cyan,
              border: `2px solid ${C.cyan}`,
              borderRadius: 10,
              padding: "6px 10px",
              background: "#082f49",
              opacity: a,
              transform: `translateX(${interpolate(a, [0, 1], [i % 2 ? 80 : -80, 0])}px)`,
            }}
          >
            {t}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const SceneSecurity: React.FC = () => {
  const frame = useCurrentFrame();
  const a = useAppear(10);
  const rows = [
    { name: "Approved AI tools", state: "ALLOWED", c: C.green },
    { name: "DeepSeek", state: "RESTRICTED", c: C.amber },
    { name: "Data protection checks", state: "REQUIRED", c: C.cyan },
  ];
  return (
    <AbsoluteFill>
      <svg width={260} height={300} viewBox="0 0 100 120" style={{ position: "absolute", left: 370, top: 130, opacity: a }}>
        <path
          d="M50 4 L92 20 V58 C92 86 72 106 50 116 C28 106 8 86 8 58 V20 Z"
          fill="rgba(59,130,246,0.25)"
          stroke={C.cyan}
          strokeWidth={3}
        />
        <rect x={36} y={56} width={28} height={24} rx={4} fill={C.cyan} />
        <path d="M41 56 V48 C41 38 59 38 59 48 V56" fill="none" stroke={C.cyan} strokeWidth={4} />
        <circle cx={50} cy={60} r={46 + 4 * Math.sin(frame / 10)} fill="none" stroke={C.blue} strokeOpacity={0.4} />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 460,
          left: 80,
          right: 80,
          fontFamily: EN,
          fontWeight: 800,
          fontSize: 30,
          color: C.muted,
          marginBottom: 12,
          opacity: useAppear(30),
        }}
      >
        US FEDERAL IT SYSTEMS · ACCESS POLICY
      </div>
      {rows.map((r, i) => {
        const ra = useAppear(50 + i * 25);
        return (
          <div
            key={r.name}
            style={{
              position: "absolute",
              top: 520 + i * 100,
              left: 80,
              right: 80,
              height: 80,
              borderRadius: 16,
              background: "rgba(15,23,42,0.85)",
              border: `2px solid ${C.line}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 26px",
              opacity: ra,
              transform: `translateX(${interpolate(ra, [0, 1], [60, 0])}px)`,
            }}
          >
            <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 32, color: C.text }}>{r.name}</div>
            <div
              style={{
                fontFamily: EN,
                fontWeight: 800,
                fontSize: 26,
                color: r.c,
                border: `2px solid ${r.c}`,
                borderRadius: 10,
                padding: "4px 14px",
              }}
            >
              {r.state}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 830, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Chip text="বিশ্বব্যাপী নিষেধাজ্ঞা নয়" color={C.green} delay={200} font={BN} size={36} />
      </div>
    </AbsoluteFill>
  );
};

const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 230, top: 120 }}>
        <Globe size={540} speed={0.5} trails />
      </div>
      <div
        style={{
          position: "absolute",
          top: 690,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: EN,
          fontWeight: 900,
          fontSize: 76,
          color: C.text,
          letterSpacing: interpolate(useAppear(10), [0, 1], [20, 3]),
          textShadow: `0 0 30px ${C.purple}`,
          opacity: useAppear(10),
        }}
      >
        DAILY AI NEWS
      </div>
      <div style={{ position: "absolute", top: 800, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Chip text="FOLLOW FOR MORE" color={C.pink} delay={40} />
      </div>
      {/* light trails */}
      <svg width={1000} height={930} style={{ position: "absolute", left: 0, top: 0 }}>
        {Array.from({ length: 6 }, (_, i) => {
          const x = ((frame * (8 + i * 2) + i * 170) % 1400) - 200;
          return (
            <line
              key={i}
              x1={x}
              y1={100 + i * 130}
              x2={x + 180}
              y2={60 + i * 130}
              stroke={i % 2 ? C.purple : C.blue}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.7}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const SCENES = [SceneHook, SceneMiniMax, SceneFree, SceneLocal, SceneFirecrawl, SceneSecurity, SceneOutro];

export const AINews: React.FC<AINewsProps> = ({ voice, music, host, amp, dateLabel, scenes, sentences }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg0 }}>
      <Background />
      {scenes.map((s, i) => {
        const Comp = SCENES[i];
        const from = Math.round(s.start * fps);
        const dur = Math.round((s.end - s.start) * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <Panel tag={s.tag}>
              <Comp />
            </Panel>
          </Sequence>
        );
      })}
      <TopBar dateLabel={dateLabel} />
      <HostCard host={host} amp={amp} />
      <Captions sentences={sentences} />
      <Ticker />
      <Audio src={staticFile(voice)} />
      <Audio
        src={staticFile(music)}
        volume={(f) =>
          0.13 *
          interpolate(f, [0, 20], [0, 1], clamp) *
          interpolate(f, [durationInFrames - 60, durationInFrames], [1, 0], clamp)
        }
      />
      {/* fade in from black */}
      <AbsoluteFill style={{ background: "black", opacity: interpolate(frame, [0, 10], [1, 0], clamp), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
