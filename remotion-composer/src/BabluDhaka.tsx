import React, { createContext, useContext, useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// ---------------------------------------------------------------------------
// "ভালো আছি, বাকি আছে!" — বাবলুর ঢাকা. A funky day in the life of Bablu, a Dhaka
// bachelor, drawn in rickshaw-art colours. 1920x1080. Lyrics karaoke on a painted
// rickshaw signboard, big painted letters on the choruses, speech bubbles for dialogue.
// ---------------------------------------------------------------------------

export type BDLine = { start: number; end: number; text: string; icon?: string; who?: "q" | "a" };
export type BDProps = {
  song: string;
  durationSec: number;
  beats: number[];
  bass: number[];
  onset: number[];
  lines: BDLine[];
  title: string;
  credits: { role: string; name: string }[];
  scenes?: [string, number, number][];
};

const W = 1920;
const H = 1080;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const BN = "'Anek Bangla', 'Noto Sans Bengali', sans-serif";
const EN = "'Montserrat', 'Noto Sans', sans-serif";
const P = {
  pink: "#ff2d87", yellow: "#ffd60a", blue: "#00b4ff", green: "#1db954", red: "#e63946", orange: "#ff8c1a",
  navy: "#14213d", purple: "#7b2ff7", cream: "#fff4d6", skin: "#c68642", ink: "#1a1423", teal: "#06d6a0", white: "#ffffff",
};

// scene timeline (seconds) — matched to the song's sections
type SceneId = "roofNight" | "call" | "title" | "room" | "teaCup" | "pocket" | "mirror" | "bazaar" | "traffic" | "boss" | "home" | "timelapse" | "stage" | "busRoof" | "dhol" | "mela" | "bkash" | "feed" | "late" | "tea" | "kitchen" | "bus" | "stageNight" | "busRoofNight" | "school" | "files" | "village" | "river" | "homecoming" | "roofFinal" | "parade" | "roofCalm" | "end";
const SCENES: [SceneId, number, number][] = [
  ["roofNight", 0, 12.4], ["call", 12.4, 25.6], ["title", 25.6, 43.5], ["room", 43.5, 53.4], ["pocket", 53.4, 63.3], ["traffic", 63.3, 72.6],
  ["home", 72.6, 84.6], ["stage", 84.6, 113.2], ["dhol", 113.2, 133.4], ["bkash", 133.4, 145.3], ["tea", 145.3, 151.2], ["kitchen", 151.2, 157.4],
  ["bus", 157.4, 164.6], ["stageNight", 164.6, 186.7], ["village", 186.7, 195.2], ["river", 195.2, 209.5], ["roofNight", 209.5, 215.6],
  ["roofFinal", 215.6, 261.6], ["roofCalm", 261.6, 274.2], ["end", 274.2, 999],
];
const BIG: SceneId[] = ["stage", "stageNight", "roofFinal", "dhol", "busRoof", "busRoofNight", "mela", "parade"];

// ------------------------------------------------------------------ fonts
const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const f = (fam: string, file: string, d: FontFaceDescriptors = {}) => new FontFace(fam, `url(${staticFile("bab/fonts/" + file)})`, d);
    Promise.all(
      [
        f("Anek Bangla", "anek-bangla-bengali-standard-normal.woff2", { weight: "100 800", stretch: "75% 125%", unicodeRange: "U+0951-0952,U+0964-0965,U+0980-09FE,U+200C-200D,U+25CC" }),
        f("Anek Bangla", "anek-bangla-latin-standard-normal.woff2", { weight: "100 800", stretch: "75% 125%" }),
        f("Montserrat", "montserrat-latin-wght-normal.woff2", { weight: "100 900" }),
      ].map((x) => x.load().then((ff) => document.fonts.add(ff)))
    )
      .catch(() => undefined)
      .finally(() => continueRender(h));
  }, [h]);
};

// ------------------------------------------------------------------ context
type Ctx = { bounds: number[]; frame: number; t: number; fps: number; bass: number; beat: number; bi: number; st: number; scene: SceneId; line?: BDLine; cue?: string; singing: boolean };
const A = createContext<Ctx>(null as unknown as Ctx);
const useA = () => useContext(A);

// ------------------------------------------------------------------ rickshaw-art primitives
const Flower: React.FC<{ x: number; y: number; r: number; c1?: string; c2?: string; spin?: number }> = ({ x, y, r, c1 = P.pink, c2 = P.yellow, spin = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${spin})`}>
    {Array.from({ length: 8 }, (_, i) => (
      <ellipse key={i} cx={0} cy={-r * 0.55} rx={r * 0.28} ry={r * 0.5} fill={i % 2 ? c1 : P.white} stroke={P.ink} strokeWidth={r * 0.05} transform={`rotate(${i * 45})`} />
    ))}
    <circle r={r * 0.32} fill={c2} stroke={P.ink} strokeWidth={r * 0.06} />
    <circle r={r * 0.12} fill={P.red} />
  </g>
);

const Rays: React.FC<{ cx: number; cy: number; colors: string[]; n?: number; speed?: number }> = ({ cx, cy, colors, n = 24, speed = 0.3 }) => {
  const { frame } = useA();
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${frame * speed})`}>
      {Array.from({ length: n }, (_, i) => {
        const a0 = (i / n) * Math.PI * 2;
        const a1 = ((i + 1) / n) * Math.PI * 2;
        const R = 2600;
        return <path key={i} d={`M0 0 L${Math.cos(a0) * R} ${Math.sin(a0) * R} L${Math.cos(a1) * R} ${Math.sin(a1) * R}z`} fill={colors[i % colors.length]} />;
      })}
    </g>
  );
};

// ------------------------------------------------------------------ people
type Kind = "bablu" | "f1" | "f2" | "ma" | "baba" | "driver";
type Pose = "idle" | "dance" | "phone" | "shrug" | "sleep" | "tea" | "point" | "sit" | "drum" | "wave" | "sad";
const LOOK: Record<Kind, { shirt: string; check: string; lower: string; lungi: boolean; hair: string }> = {
  bablu: { shirt: P.yellow, check: P.red, lower: P.blue, lungi: false, hair: "#111" },
  f1: { shirt: P.teal, check: P.navy, lower: "#5a3e2b", lungi: false, hair: "#222" },
  f2: { shirt: P.pink, check: P.white, lower: P.purple, lungi: true, hair: "#111" },
  ma: { shirt: P.red, check: P.green, lower: P.red, lungi: true, hair: "#111" },
  baba: { shirt: P.white, check: "#ddd", lower: P.white, lungi: false, hair: "#888" },
  driver: { shirt: "#7fb069", check: P.cream, lower: P.blue, lungi: true, hair: "#111" },
};

const Person: React.FC<{ kind?: Kind; x: number; y: number; s?: number; pose?: Pose; flip?: boolean; mood?: "smile" | "sad" | "wow" | "sing"; seed?: number }> = ({
  kind = "bablu", x, y, s = 1, pose = "idle", flip = false, mood = "smile", seed = 0,
}) => {
  const { frame, beat, bi, singing } = useA();
  const L = LOOK[kind];
  const f = frame + seed * 7;
  let la = 8 + Math.sin(f / 20) * 4;
  let ra = -8 - Math.sin(f / 22) * 4;
  let dy = Math.sin(f / 18) * 3;
  let legL = 0;
  let legR = 0;
  let tilt = 0;
  if (pose === "dance") {
    const alt = (bi + seed) % 2 === 0;
    la = alt ? 150 + beat * 15 : 60;
    ra = alt ? -60 : -150 - beat * 15;
    dy = -beat * 26;
    legL = alt ? 18 * beat : -6;
    legR = alt ? 6 : -18 * beat;
    tilt = (alt ? 1 : -1) * 5;
  } else if (pose === "phone") { ra = -160; la = 20; }
  else if (pose === "shrug") { la = 60 + beat * 8; ra = -60 - beat * 8; }
  else if (pose === "tea") { ra = -110; la = 12; }
  else if (pose === "point") { ra = -95; }
  else if (pose === "drum") { la = 50 + (bi % 2 ? 30 * beat : 0); ra = -50 - (bi % 2 ? 0 : 30 * beat); dy = -beat * 10; }
  else if (pose === "wave") { ra = -150 + Math.sin(f / 4) * 20; }
  else if (pose === "sad") { la = 4; ra = -4; tilt = 4; }
  const blink = f % 97 < 4;
  const mouthOpen = mood === "sing" || (mood === "smile" && singing && kind === "bablu" && f % 8 < 4);
  const skin = kind === "ma" ? "#b5764a" : kind === "baba" ? "#a86b3c" : P.skin;
  const sleep = pose === "sleep";
  const sit = pose === "sit";
  const arm = (sx: number, a: number, key: string) => (
    <g key={key} transform={`rotate(${a} ${sx} -300)`}>
      <rect x={sx - 15} y={-300} width={30} height={135} rx={15} fill={L.shirt} stroke={P.ink} strokeWidth={5} />
      <circle cx={sx} cy={-158} r={17} fill={skin} stroke={P.ink} strokeWidth={5} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y + dy * s}) scale(${flip ? -s : s} ${s}) rotate(${sleep ? -90 : tilt})`}>
      <ellipse cx={0} cy={4} rx={80} ry={14} fill="rgba(0,0,0,0.18)" />
      {/* legs / lower */}
      {!sit && (L.lungi || kind === "ma" ? (
        <g>
          <path d="M-62 -186 L62 -186 L72 -6 L-72 -6z" fill={L.lower} stroke={P.ink} strokeWidth={6} />
          {kind !== "ma" && [-40, 0, 40].map((xx) => <line key={xx} x1={xx} y1={-184} x2={xx * 1.15} y2={-8} stroke={P.cream} strokeWidth={6} opacity={0.6} />)}
          {kind !== "ma" && [-140, -90, -40].map((yy) => <line key={yy} x1={-66} y1={yy} x2={66} y2={yy} stroke={P.cream} strokeWidth={6} opacity={0.6} />)}
          {kind === "ma" && <path d="M-72 -30 L72 -30 L72 -6 L-72 -6z" fill={P.green} />}
          <ellipse cx={-30} cy={-2} rx={26} ry={10} fill={P.ink} />
          <ellipse cx={30} cy={-2} rx={26} ry={10} fill={P.ink} />
        </g>
      ) : (
        <g>
          <g transform={`rotate(${legL} -24 -180)`}><rect x={-44} y={-182} width={40} height={180} rx={12} fill={L.lower} stroke={P.ink} strokeWidth={6} /><ellipse cx={-30} cy={-2} rx={30} ry={12} fill={P.ink} /></g>
          <g transform={`rotate(${legR} 24 -180)`}><rect x={4} y={-182} width={40} height={180} rx={12} fill={L.lower} stroke={P.ink} strokeWidth={6} /><ellipse cx={30} cy={-2} rx={30} ry={12} fill={P.ink} /></g>
        </g>
      ))}
      {sit && <path d="M-60 -186 h120 v40 h60 v146 h-40 v-110 h-140z" fill={L.lower} stroke={P.ink} strokeWidth={6} />}
      {/* torso */}
      {arm(-64, la, "l")}
      <rect x={-68} y={-335} width={136} height={kind === "baba" ? 260 : 165} rx={30} fill={L.shirt} stroke={P.ink} strokeWidth={6} />
      {kind !== "baba" && kind !== "ma" && [-34, 0, 34].map((xx) => <line key={xx} x1={xx} y1={-330} x2={xx} y2={-176} stroke={L.check} strokeWidth={6} opacity={0.55} />)}
      {kind !== "baba" && kind !== "ma" && [-290, -250, -210].map((yy) => <line key={yy} x1={-64} y1={yy} x2={64} y2={yy} stroke={L.check} strokeWidth={6} opacity={0.55} />)}
      {kind === "ma" && <path d="M-68 -335 L68 -200 L68 -170 L-68 -305z" fill={P.green} opacity={0.9} />}
      {kind === "f1" && <rect x={-70} y={-200} width={140} height={20} fill={P.orange} />}
      {arm(64, ra, "r")}
      {pose === "phone" && <rect x={40} y={-470} width={34} height={64} rx={8} fill={P.ink} transform="rotate(20 57 -438)" />}
      {pose === "tea" && <g transform="translate(130 -330)"><path d="M-22 -10 h44 l-6 40 h-32z" fill={P.white} stroke={P.ink} strokeWidth={5} /><path d="M-8 -20 q-6 -14 0 -26 M8 -20 q-6 -14 0 -26" stroke={P.white} strokeWidth={4} fill="none" opacity={0.7} /></g>}
      {/* head */}
      <rect x={-16} y={-360} width={32} height={34} fill={skin} />
      <circle cx={-58} cy={-395} r={13} fill={skin} stroke={P.ink} strokeWidth={5} />
      <circle cx={58} cy={-395} r={13} fill={skin} stroke={P.ink} strokeWidth={5} />
      <circle cx={0} cy={-398} r={58} fill={skin} stroke={P.ink} strokeWidth={6} />
      {kind !== "ma" && kind !== "baba" && <path d={kind === "f2" ? "M-60 -405 q-6 -70 60 -66 q70 -2 60 66 q-20 -38 -60 -40 q-40 0 -60 40z" : "M-60 -400 q0 -72 60 -72 q64 0 60 72 q-14 -34 -44 -40 q-36 12 -76 0z"} fill={L.hair} />}
      {kind === "bablu" && <path d="M-18 -470 q20 -26 44 -6 q-24 -2 -44 6z" fill={L.hair} />}
      {kind === "baba" && <g><path d="M-56 -420 a56 40 0 0 1 112 0z" fill={P.white} stroke={P.ink} strokeWidth={5} /><path d="M-48 -390 q48 120 96 0 q-48 30 -96 0z" fill="#ddd" stroke={P.ink} strokeWidth={4} /></g>}
      {kind === "ma" && <path d="M-74 -330 q-10 -150 74 -142 q84 -8 74 142 q-20 -90 -74 -96 q-54 6 -74 96z" fill={P.red} stroke={P.ink} strokeWidth={5} />}
      {kind === "ma" && <circle cx={0} cy={-420} r={5} fill={P.red} />}
      {/* face */}
      <g>
        <path d="M-34 -420 q12 -8 24 0 M10 -420 q12 -8 24 0" stroke={P.ink} strokeWidth={5} fill="none" />
        <ellipse cx={-21} cy={-400} rx={7} ry={blink || sleep ? 1.5 : 8} fill={P.ink} />
        <ellipse cx={21} cy={-400} rx={7} ry={blink || sleep ? 1.5 : 8} fill={P.ink} />
        {(kind === "bablu" || kind === "driver") && <path d="M-22 -372 q22 -10 44 0 q-22 6 -44 0z" fill={P.ink} />}
        {mouthOpen ? <ellipse cx={0} cy={-358} rx={14} ry={10 + (f % 8) * 0.8} fill="#7a1f2b" stroke={P.ink} strokeWidth={4} />
          : mood === "sad" ? <path d="M-16 -352 q16 -12 32 0" stroke={P.ink} strokeWidth={5} fill="none" />
          : mood === "wow" ? <circle cx={0} cy={-356} r={10} fill="#7a1f2b" stroke={P.ink} strokeWidth={4} />
          : <path d="M-22 -362 q22 20 44 0" stroke={P.ink} strokeWidth={5} fill="none" />}
        <circle cx={-36} cy={-376} r={8} fill={P.pink} opacity={0.35} />
        <circle cx={36} cy={-376} r={8} fill={P.pink} opacity={0.35} />
      </g>
      {sleep && <text x={70} y={-470} fontFamily={EN} fontWeight={900} fontSize={60} fill={P.white} transform="rotate(90 70 -470)">z z</text>}
    </g>
  );
};

// ------------------------------------------------------------------ Dhaka scenery
const Skyline: React.FC<{ y: number; night?: boolean; tint?: string; seed?: string; scale?: number; dx?: number }> = ({ y, night, tint, seed = "a", scale = 1, dx = 0 }) => {
  const { frame } = useA();
  const cols = night ? ["#2b2d42", "#3d405b", "#22223b", "#4a4e69"] : ["#f4a261", "#e9c46a", "#90be6d", "#f28482", "#84a59d", "#bde0fe", "#ffafcc"];
  let x = -60 + dx;
  const out: React.ReactNode[] = [];
  let i = 0;
  while (x < W + 80) {
    const w = (110 + random(`${seed}w${i}`) * 120) * scale;
    const h = (200 + random(`${seed}h${i}`) * 300) * scale;
    const c = tint ?? cols[i % cols.length];
    out.push(
      <g key={i}>
        <rect x={x} y={y - h} width={w} height={h + 400} fill={c} stroke={P.ink} strokeWidth={4} />
        {Array.from({ length: Math.floor(h / (50 * scale)) }, (_, r) =>
          Array.from({ length: Math.floor(w / (40 * scale)) }, (_, c2) => {
            const lit = night ? random(`${seed}l${i}${r}${c2}`) > 0.45 : true;
            return <rect key={`${r}-${c2}`} x={x + 12 * scale + c2 * 40 * scale} y={y - h + 20 * scale + r * 50 * scale} width={20 * scale} height={26 * scale} fill={night ? (lit ? P.yellow : "#1b1b2f") : "#cfe8ff"} opacity={night ? 0.85 : 0.9} stroke={P.ink} strokeWidth={2} />;
          })
        )}
        {/* black water tank on the roof */}
        {random(`${seed}t${i}`) > 0.4 && <rect x={x + w * 0.2} y={y - h - 34 * scale} width={44 * scale} height={34 * scale} rx={6} fill={P.ink} />}
        {random(`${seed}a${i}`) > 0.6 && <line x1={x + w * 0.7} y1={y - h} x2={x + w * 0.7} y2={y - h - 70 * scale} stroke={P.ink} strokeWidth={4} />}
      </g>
    );
    x += w + 6;
    i++;
  }
  // tangled electric wires
  return (
    <g>
      {out}
      {[0, 1, 2].map((k) => (
        <path key={k} d={`M0 ${y - 260 * scale + k * 26} Q${W / 2} ${y - 160 * scale + k * 30 + Math.sin(frame / 30 + k) * 6} ${W} ${y - 250 * scale + k * 22}`} stroke={P.ink} strokeWidth={3} fill="none" opacity={0.7} />
      ))}
    </g>
  );
};

const Wheel: React.FC<{ x: number; y: number; r: number; rot: number }> = ({ x, y, r, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle r={r} fill="none" stroke={P.ink} strokeWidth={10} />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={0} x2={Math.cos((i / 12) * Math.PI * 2) * r} y2={Math.sin((i / 12) * Math.PI * 2) * r} stroke={P.ink} strokeWidth={3} />)}
    <circle r={10} fill={P.yellow} stroke={P.ink} strokeWidth={4} />
  </g>
);

/** Side-view cycle rickshaw with a painted hood and back plate. (x,y) = ground under rear wheel. */
const Rickshaw: React.FC<{ x: number; y: number; s?: number; rolling?: boolean; driver?: boolean; children?: React.ReactNode; hue?: string }> = ({ x, y, s = 1, rolling = true, driver = true, children, hue = P.pink }) => {
  const { frame, beat } = useA();
  const rot = rolling ? frame * 6 : 0;
  return (
    <g transform={`translate(${x} ${y - beat * 4}) scale(${s})`}>
      <Wheel x={0} y={-75} r={75} rot={rot} />
      <Wheel x={-150} y={-75} r={75} rot={rot} />
      {/* seat box with art */}
      <path d="M-210 -170 h220 l-20 70 h-180z" fill={P.blue} stroke={P.ink} strokeWidth={6} />
      <rect x={-200} y={-160} width={190} height={40} fill={P.yellow} stroke={P.ink} strokeWidth={4} />
      <Flower x={-150} y={-140} r={18} />
      <Flower x={-60} y={-140} r={18} c1={P.blue} />
      {/* hood */}
      <path d="M-230 -170 q0 -200 140 -210 q120 4 120 210z" fill={hue} stroke={P.ink} strokeWidth={6} />
      {[0, 1, 2, 3].map((k) => <path key={k} d={`M${-214 + k * 10} -170 q${10 + k * 4} ${-180 + k * 26} ${124 - k * 2} ${-196 + k * 30}`} stroke={k % 2 ? P.yellow : P.white} strokeWidth={8} fill="none" />)}
      {/* passenger slot */}
      {children}
      {/* frame + front wheel */}
      <path d="M10 -110 L260 -120 L300 -75 M260 -120 L250 -230 h40" stroke={P.ink} strokeWidth={10} fill="none" strokeLinecap="round" />
      <Wheel x={300} y={-75} r={70} rot={rot} />
      <circle cx={250} cy={-230} r={14} fill={P.red} stroke={P.ink} strokeWidth={4} />
      {/* tassels */}
      {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={-220 + k * 50} y1={-172} x2={-222 + k * 50 + Math.sin(frame / 5 + k) * 6} y2={-140} stroke={k % 2 ? P.yellow : P.green} strokeWidth={6} />)}
      {driver && <Person kind="driver" x={210} y={-140} s={0.55} pose="idle" seed={3} />}
    </g>
  );
};

const CNG: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const { frame } = useA();
  return (
    <g transform={`translate(${x} ${y + Math.sin(frame / 3) * 2}) scale(${s})`}>
      <path d="M0 -60 q0 -160 120 -170 h150 q60 0 70 80 l10 90 z" fill={P.green} stroke={P.ink} strokeWidth={6} />
      <path d="M40 -200 h220 v-30 h-220z" fill="#145a32" stroke={P.ink} strokeWidth={5} />
      <rect x={130} y={-170} width={110} height={70} fill="#c8f7c5" stroke={P.ink} strokeWidth={4} />
      <path d="M0 -60 h360 v20 h-360z" fill={P.ink} />
      <circle cx={70} cy={-30} r={34} fill={P.ink} />
      <circle cx={290} cy={-30} r={34} fill={P.ink} />
      <circle cx={350} cy={-110} r={12} fill={P.yellow} />
    </g>
  );
};

const Bus: React.FC<{ x: number; y: number; s?: number; heads?: boolean }> = ({ x, y, s = 1, heads = true }) => {
  const { frame } = useA();
  return (
    <g transform={`translate(${x} ${y + Math.sin(frame / 4) * 3}) scale(${s})`}>
      <rect x={0} y={-330} width={760} height={280} rx={30} fill={P.red} stroke={P.ink} strokeWidth={7} />
      <rect x={0} y={-130} width={760} height={30} fill={P.yellow} />
      <path d="M20 -110 q60 -30 120 0 t120 0 t120 0 t120 0 t120 0 t120 0" stroke={P.green} strokeWidth={8} fill="none" />
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i}>
          <rect x={30 + i * 100} y={-300} width={80} height={110} rx={8} fill="#bde0fe" stroke={P.ink} strokeWidth={5} />
          {heads && <circle cx={70 + i * 100} cy={-220} r={22} fill={P.skin} stroke={P.ink} strokeWidth={3} />}
          {heads && <path d={`M${48 + i * 100} -228 q22 -26 44 0`} fill="#111" />}
        </g>
      ))}
      <text x={380} y={-142} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={40} fill={P.white}>গুলিস্তান ⇄ মিরপুর</text>
      <circle cx={140} cy={-40} r={50} fill={P.ink} />
      <circle cx={620} cy={-40} r={50} fill={P.ink} />
    </g>
  );
};

const Kite: React.FC<{ x: number; y: number; c: string; seed: number }> = ({ x, y, c, seed }) => {
  const { frame } = useA();
  const dx = Math.sin(frame / 40 + seed) * 40;
  const dy = Math.cos(frame / 33 + seed) * 30;
  return (
    <g transform={`translate(${x + dx} ${y + dy}) rotate(${Math.sin(frame / 20 + seed) * 10})`}>
      <path d="M0 -60 L45 0 L0 70 L-45 0z" fill={c} stroke={P.ink} strokeWidth={4} />
      <path d="M0 -60 V70 M-45 0 H45" stroke={P.ink} strokeWidth={3} />
      <path d={`M0 70 q20 60 -10 120 q-30 60 10 140`} stroke={P.ink} strokeWidth={2} fill="none" />
    </g>
  );
};

const SpeakerBubble: React.FC<{ x: number; y: number; text: string; dir?: 1 | -1; color?: string }> = ({ x, y, text, dir = 1, color = P.white }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-210} y={-80} width={420} height={120} rx={40} fill={color} stroke={P.ink} strokeWidth={6} />
    <path d={`M${dir * 40} 38 l${dir * 50} 60 l${dir * 10} -60z`} fill={color} stroke={P.ink} strokeWidth={6} />
    <rect x={-200} y={30} width={400} height={14} fill={color} />
    <text x={0} y={-2} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={58} fill={P.ink}>{text}</text>
  </g>
);

// ------------------------------------------------------------------ scenes
const Sky: React.FC<{ top: string; bottom: string }> = ({ top, bottom }) => (
  <>
    <defs>
      <linearGradient id={`sky${top.slice(1)}${bottom.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#sky${top.slice(1)}${bottom.slice(1)})`} />
  </>
);

const Stars: React.FC = () => {
  const { frame } = useA();
  return <>{Array.from({ length: 70 }, (_, i) => <circle key={i} cx={random(`sx${i}`) * W} cy={random(`sy${i}`) * 520} r={1.5 + random(`sr${i}`) * 2.5} fill={P.white} opacity={0.4 + 0.6 * Math.abs(Math.sin(frame / 20 + i))} />)}</>;
};

const Roof: React.FC<{ y?: number; color?: string }> = ({ y = 880, color = "#8d99ae" }) => (
  <g>
    <rect x={0} y={y} width={W} height={H - y} fill={color} stroke={P.ink} strokeWidth={6} />
    <rect x={0} y={y - 60} width={W} height={60} fill="#adb5bd" stroke={P.ink} strokeWidth={6} />
    {Array.from({ length: 24 }, (_, i) => <rect key={i} x={i * 84} y={y - 60} width={40} height={60} fill="#6c757d" opacity={0.5} />)}
    {/* clothes line */}
    <path d={`M80 ${y - 260} Q600 ${y - 200} 1100 ${y - 250}`} stroke={P.ink} strokeWidth={3} fill="none" />
    {[220, 420, 640, 860].map((cx, i) => <rect key={cx} x={cx} y={y - 236 + (i % 2) * 10} width={90} height={110} fill={[P.pink, P.yellow, P.blue, P.green][i]} stroke={P.ink} strokeWidth={4} />)}
  </g>
);

const RoofNight: React.FC = () => {
  const { cue, line } = useA();
  const call = cue === "phone" || !!line;
  return (
    <svg width={W} height={H}>
      <Sky top="#0b1d51" bottom="#5b2a86" />
      <Stars />
      <circle cx={1580} cy={180} r={90} fill={P.cream} />
      <circle cx={1550} cy={160} r={90} fill="#0b1d51" opacity={0.15} />
      <Skyline y={760} night seed="n" />
      <Roof />
      <Person x={900} y={950} s={1.2} pose={call ? "phone" : "idle"} mood={line ? "sing" : "smile"} />
      <g transform="translate(1250 860)"><rect x={-60} y={-60} width={120} height={60} fill={P.orange} stroke={P.ink} strokeWidth={5} /><path d="M-40 -60 q0 -40 40 -40 q40 0 40 40" fill="none" stroke={P.ink} strokeWidth={5} /></g>
    </svg>
  );
};

const CallScene: React.FC = () => {
  const { frame, line, st } = useA();
  const ring = st < 1.2;
  return (
    <svg width={W} height={H}>
      <Rays cx={W / 2} cy={H / 2} colors={[P.navy, "#1d2d5c"]} speed={0.15} />
      <g transform={`translate(${W / 2} ${H / 2 + 20}) rotate(${ring ? Math.sin(frame * 1.8) * 6 : 0})`}>
        <rect x={-210} y={-420} width={420} height={840} rx={50} fill={P.ink} stroke={P.yellow} strokeWidth={10} />
        <rect x={-180} y={-370} width={360} height={720} rx={20} fill={P.teal} />
        <circle cx={0} cy={-200} r={90} fill={P.cream} stroke={P.ink} strokeWidth={6} />
        <circle cx={0} cy={-225} r={34} fill={P.navy} /><path d="M-60 -140 q60 -70 120 0z" fill={P.navy} />
        <text x={0} y={90} textAnchor="middle" fontFamily={EN} fontWeight={600} fontSize={30} fill={P.navy}>{ring ? "calling…" : `00:${String(Math.floor(st)).padStart(2, "0")}`}</text>
        <circle cx={-100} cy={250} r={50} fill={P.red} /><circle cx={100} cy={250} r={50} fill={P.green} />
      </g>
      <Flower x={300} y={260} r={80} spin={frame} />
      <Flower x={1620} y={820} r={90} c1={P.blue} spin={-frame} />
      {line?.who === "q" && <SpeakerBubble x={500} y={480} text={line.text} dir={1} />}
      {line?.who === "a" && <SpeakerBubble x={1420} y={480} text={line.text} dir={-1} color={P.yellow} />}
    </svg>
  );
};

const TitleScene: React.FC<{ title: string }> = ({ title }) => {
  const { st, fps, frame, beat } = useA();
  const roll = interpolate(st, [0, 3], [-900, 520], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const plate = spring({ frame: Math.round((st - 3.2) * fps), fps, config: { damping: 11, stiffness: 120 } });
  const [a, b] = title.split(",").map((s) => s.trim());
  return (
    <svg width={W} height={H}>
      <Rays cx={W / 2} cy={H * 0.45} colors={[P.pink, P.yellow, P.blue, P.yellow]} speed={0.4} />
      <Skyline y={900} seed="t" scale={0.8} />
      <rect y={900} width={W} height={180} fill="#495057" />
      <path d={`M0 990 H${W}`} stroke={P.yellow} strokeWidth={10} strokeDasharray="60 50" strokeDashoffset={-frame * 8} />
      <Rickshaw x={roll} y={1000} s={1.05} rolling={st < 3} />
      {/* painted back plate */}
      <g transform={`translate(${W / 2} ${H * 0.36}) scale(${plate * (1 + beat * 0.03)}) rotate(${(1 - plate) * -20})`}>
        <rect x={-700} y={-250} width={1400} height={500} rx={40} fill={P.navy} stroke={P.yellow} strokeWidth={16} />
        <rect x={-670} y={-220} width={1340} height={440} rx={28} fill="none" stroke={P.pink} strokeWidth={8} strokeDasharray="30 18" />
        {[[-620, -170], [620, -170], [-620, 170], [620, 170]].map(([fx, fy], i) => <Flower key={i} x={fx} y={fy} r={60} spin={frame * (i % 2 ? 2 : -2)} c1={i % 2 ? P.blue : P.pink} />)}
        <text x={0} y={-40} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={170} fill={P.yellow} stroke={P.ink} strokeWidth={8} paintOrder="stroke" style={{ filter: `drop-shadow(8px 8px 0 ${P.pink})` }}>{a},</text>
        <text x={0} y={150} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={190} fill={P.white} stroke={P.ink} strokeWidth={8} paintOrder="stroke" style={{ filter: `drop-shadow(8px 8px 0 ${P.blue})` }}>{b}</text>
      </g>
      <text x={W / 2} y={95} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={40} letterSpacing={12} fill={P.white} opacity={plate}>RAPAR RUBEL</text>
    </svg>
  );
};

const RoomScene: React.FC = () => {
  const { frame, cue, st } = useA();
  const awake = cue !== "moon";
  const sunUp = interpolate(st, [1.5, 3], [0, 1], clamp);
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#a8dadc" />
      <rect y={820} width={W} height={260} fill="#e9c46a" stroke={P.ink} strokeWidth={6} />
      {/* window with grill */}
      <g transform="translate(1180 160)">
        <rect width={520} height={420} fill={awake ? "#ffe066" : "#14213d"} stroke={P.ink} strokeWidth={10} />
        <circle cx={260} cy={300 - sunUp * 160} r={90} fill={P.orange} opacity={awake ? 1 : 0} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={i * 104} y1={0} x2={i * 104} y2={420} stroke={P.ink} strokeWidth={8} />)}
        <line x1={0} y1={210} x2={520} y2={210} stroke={P.ink} strokeWidth={8} />
      </g>
      {/* ceiling fan */}
      <g transform={`translate(640 70) rotate(${frame * 25})`}>
        {[0, 120, 240].map((a) => <rect key={a} x={-18} y={0} width={36} height={190} rx={12} fill="#6c757d" transform={`rotate(${a})`} />)}
        <circle r={28} fill={P.ink} />
      </g>
      {/* calendar */}
      <g transform="translate(240 200)"><rect width={190} height={220} fill={P.white} stroke={P.ink} strokeWidth={6} /><rect width={190} height={60} fill={P.red} /><text x={95} y={170} textAnchor="middle" fontFamily={EN} fontWeight={900} fontSize={110} fill={P.ink}>{cue === "calendar" ? "31" : "1"}</text></g>
      {/* mattress */}
      <rect x={300} y={780} width={900} height={90} rx={20} fill={P.pink} stroke={P.ink} strokeWidth={6} />
      <rect x={320} y={740} width={200} height={60} rx={20} fill={P.white} stroke={P.ink} strokeWidth={5} />
      {awake ? <Person x={820} y={830} s={1.05} pose={cue === "tea" ? "tea" : "shrug"} mood={cue === "calendar" ? "wow" : "sing"} /> : <Person x={760} y={720} s={1.0} pose="sleep" />}
      {cue === "tea" && <g transform="translate(1350 800)"><path d="M-80 -60 h160 l-20 120 h-120z" fill={P.white} stroke={P.ink} strokeWidth={6} /><text x={0} y={30} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={48} fill={P.red}>চা</text></g>}
    </svg>
  );
};

const PocketScene: React.FC = () => {
  const { frame, cue, beat } = useA();
  return (
    <svg width={W} height={H}>
      <Rays cx={W / 2} cy={H / 2} colors={[P.yellow, P.orange]} speed={0.2} />
      <Person x={W / 2} y={1000} s={1.5} pose={cue === "heartbreak" ? "sad" : "shrug"} mood={cue === "heartbreak" ? "sad" : "sing"} />
      {/* empty pockets out + moths */}
      <path d="M760 760 q-40 60 20 90 q40 -20 20 -90z" fill={P.white} stroke={P.ink} strokeWidth={5} />
      <path d="M1160 760 q40 60 -20 90 q-40 -20 -20 -90z" fill={P.white} stroke={P.ink} strokeWidth={5} />
      {[0, 1, 2].map((i) => <g key={i} transform={`translate(${700 + i * 260 + Math.sin(frame / 8 + i) * 40} ${560 - ((frame * 2 + i * 90) % 400)})`}><path d="M0 0 q-24 -20 -30 6 q20 10 30 -6 q24 -20 30 6 q-20 10 -30 -6" fill="#ccc" stroke={P.ink} strokeWidth={3} /></g>)}
      {/* thought bubble with heavy plan */}
      {(cue === "bulb" || cue === "pocket") && (
        <g transform={`translate(1460 260) scale(${1 + beat * 0.05})`}>
          <ellipse rx={260} ry={160} fill={P.white} stroke={P.ink} strokeWidth={6} />
          <text x={0} y={-30} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={50} fill={P.navy}>প্ল্যান:</text>
          <text x={0} y={40} textAnchor="middle" fontFamily={BN} fontWeight={700} fontSize={40} fill={P.red}>গাড়ি • বাড়ি • বিদেশ</text>
          <circle cx={-260} cy={180} r={26} fill={P.white} stroke={P.ink} strokeWidth={5} />
          <circle cx={-320} cy={240} r={14} fill={P.white} stroke={P.ink} strokeWidth={4} />
        </g>
      )}
      {(cue === "mask" || cue === "heartbreak") && Array.from({ length: 10 }, (_, i) => <path key={i} transform={`translate(${300 + i * 140} ${200 + Math.sin(frame / 10 + i) * 30}) scale(0.6)`} d="M0 40 l-40 -40 a24 24 0 0 1 40 -32 a24 24 0 0 1 40 32z" fill={P.pink} stroke={P.ink} strokeWidth={5} opacity={cue === "heartbreak" ? 0.9 : 0.4} />)}
    </svg>
  );
};

const TrafficScene: React.FC = () => {
  const { frame, cue } = useA();
  return (
    <svg width={W} height={H}>
      <Sky top="#ffb703" bottom="#fb8500" />
      <Skyline y={640} seed="tr" />
      <rect y={640} width={W} height={440} fill="#495057" />
      <path d={`M0 820 H${W}`} stroke={P.white} strokeWidth={8} strokeDasharray="70 60" />
      <Bus x={-120 + Math.sin(frame / 50) * 10} y={760} s={0.9} />
      <CNG x={700 + Math.sin(frame / 30) * 6} y={1000} s={1} />
      <Rickshaw x={1300} y={1040} s={0.8} rolling={false} hue={P.blue}>
        <Person x={-100} y={-160} s={0.5} pose={cue === "calendar" ? "shrug" : "idle"} mood="sad" />
      </Rickshaw>
      <Rickshaw x={1760} y={790} s={0.6} rolling={false} hue={P.green} />
      {/* honk symbols */}
      {[0, 1, 2].map((i) => <text key={i} x={300 + i * 520} y={360 + ((frame + i * 20) % 40)} fontFamily={EN} fontWeight={900} fontSize={70} fill={P.red} stroke={P.white} strokeWidth={4} paintOrder="stroke" opacity={(frame + i * 10) % 30 < 15 ? 1 : 0}>PEEP!</text>)}
      {(cue === "calendar" || cue === "hourglass") && <g transform="translate(1600 220)"><rect x={-120} y={-120} width={240} height={250} fill={P.white} stroke={P.ink} strokeWidth={6} /><rect x={-120} y={-120} width={240} height={60} fill={P.red} /><text y={90} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={90} fill={P.ink}>৳?</text></g>}
    </svg>
  );
};

const HomeScene: React.FC = () => {
  const { frame, cue, line } = useA();
  const talk = (who: "ma" | "baba") => (who === "baba" ? cue === "speech" || cue === "thumbs" : cue === "home" || cue === "laptop");
  const village = (
    <g>
      <rect width={W / 2} height={H} fill="#90e0ef" />
      <circle cx={760} cy={160} r={70} fill={P.yellow} />
      <rect y={720} width={W / 2} height={360} fill="#80b918" />
      <g transform="translate(140 720)"><path d="M0 0 v-220 h360 v220z" fill="#d4a373" stroke={P.ink} strokeWidth={6} /><path d="M-40 -220 L180 -360 L400 -220z" fill="#adb5bd" stroke={P.ink} strokeWidth={6} /><rect x={140} y={-130} width={80} height={130} fill="#6f4518" /></g>
      {[620, 880].map((bx) => <g key={bx} transform={`translate(${bx} 740) rotate(${Math.sin(frame / 30 + bx) * 3})`}><rect x={-10} y={-260} width={20} height={260} fill="#606c38" /><path d="M0 -250 q-120 -40 -160 40 q100 -30 160 -40 q120 -40 160 40 q-100 -30 -160 -40" fill="#38b000" stroke={P.ink} strokeWidth={4} /></g>)}
      <Person kind="baba" x={300} y={960} s={0.85} pose={talk("baba") ? "point" : "idle"} mood={talk("baba") ? "sing" : "smile"} />
      <Person kind="ma" x={560} y={970} s={0.85} pose={talk("ma") ? "wave" : "idle"} mood={talk("ma") ? "sing" : "smile"} />
    </g>
  );
  const office = (
    <g transform={`translate(${W / 2} 0)`}>
      <rect width={W / 2} height={H} fill="#dee2e6" />
      <rect x={60} y={120} width={300} height={200} fill="#adb5bd" stroke={P.ink} strokeWidth={5} />
      <g transform="translate(700 260)"><circle r={90} fill={P.white} stroke={P.ink} strokeWidth={6} /><line x1={0} y1={0} x2={Math.sin(frame / 6) * 60} y2={-Math.cos(frame / 6) * 60} stroke={P.ink} strokeWidth={6} /><line x1={0} y1={0} x2={Math.sin(frame / 70) * 40} y2={-Math.cos(frame / 70) * 40} stroke={P.red} strokeWidth={8} /></g>
      <rect x={60} y={760} width={840} height={40} fill="#6c584c" stroke={P.ink} strokeWidth={5} />
      <rect x={300} y={600} width={260} height={160} fill="#343a40" stroke={P.ink} strokeWidth={5} />
      {Array.from({ length: 5 }, (_, i) => <rect key={i} x={120 + (i % 3) * 30} y={720 - i * 26} width={160} height={26} fill={[P.white, "#f1faee", P.cream][i % 3]} stroke={P.ink} strokeWidth={3} />)}
      <Person x={720} y={1000} s={0.85} pose={cue === "pause" ? "sad" : "phone"} mood={line ? "sing" : "smile"} />
    </g>
  );
  return (
    <svg width={W} height={H}>
      {village}
      {office}
      <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke={P.yellow} strokeWidth={16} />
      <text x={W / 4} y={80} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={54} fill={P.navy}>গ্রামের বাড়ি</text>
      <text x={(W * 3) / 4} y={80} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={54} fill={P.navy}>ঢাকার অফিস</text>
    </svg>
  );
};

const StageScene: React.FC<{ night?: boolean }> = ({ night }) => {
  const { frame, beat, bi } = useA();
  const cols = night ? [P.purple, P.navy, P.pink, P.navy] : [P.pink, P.yellow, P.blue, P.yellow];
  return (
    <svg width={W} height={H}>
      <Rays cx={W / 2} cy={H * 0.55} colors={cols} speed={night ? 0.8 : 0.5} />
      {Array.from({ length: 8 }, (_, i) => <Flower key={i} x={120 + i * 240} y={1000 + Math.sin(frame / 8 + i) * 14} r={70 + (bi + i) % 2 * 10 * beat} spin={frame * 3 * (i % 2 ? 1 : -1)} c1={[P.pink, P.blue, P.green, P.orange][i % 4]} />)}
      {night && Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 340} y={0} width={60} height={H} fill={[P.pink, P.blue, P.yellow][i % 3]} opacity={0.12 + beat * 0.15} transform={`rotate(${Math.sin(frame / 20 + i) * 12} ${i * 340 + 30} 0)`} />)}
      <g transform={`translate(${W / 2 - 40} ${1010}) scale(${1 + beat * 0.02})`}>
        <Rickshaw x={0} y={0} s={1.15} rolling={false} hue={night ? P.purple : P.pink} />
      </g>
      <Person x={W / 2 - 170} y={720} s={0.95} pose="dance" mood="sing" />
      <Person kind="f1" x={W / 2 - 650} y={1010} s={0.9} pose="dance" seed={1} />
      <Person kind="f2" x={W / 2 + 610} y={1010} s={0.9} pose="dance" seed={2} />
    </svg>
  );
};

const DholScene: React.FC = () => {
  const { frame, beat, bi } = useA();
  return (
    <svg width={W} height={H}>
      <Rays cx={W / 2} cy={H / 2} colors={bi % 4 < 2 ? [P.green, P.red] : [P.yellow, P.pink]} n={18} speed={1} />
      <circle cx={W / 2} cy={H / 2} r={330 + beat * 60} fill="none" stroke={P.white} strokeWidth={14} opacity={0.6} />
      {Array.from({ length: 12 }, (_, i) => <Flower key={i} x={W / 2 + Math.cos(i / 12 * Math.PI * 2 + frame / 30) * 700} y={H / 2 + Math.sin(i / 12 * Math.PI * 2 + frame / 30) * 400} r={50} spin={frame * 4} c1={i % 2 ? P.blue : P.pink} />)}
      {/* dhol */}
      <g transform={`translate(${W / 2} 800) scale(${1 + beat * 0.08})`}>
        <ellipse cx={-200} cy={0} rx={60} ry={140} fill={P.cream} stroke={P.ink} strokeWidth={6} />
        <rect x={-200} y={-140} width={400} height={280} fill={P.red} stroke={P.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-200 + i * 50} -140 L${-175 + i * 50} 140`} stroke={P.yellow} strokeWidth={8} />)}
        <ellipse cx={200} cy={0} rx={60} ry={140} fill={P.cream} stroke={P.ink} strokeWidth={6} />
      </g>
      <Person x={W / 2} y={700} s={0.9} pose="drum" mood="sing" />
      {[300, 1620].map((sx, i) => <g key={sx} transform={`translate(${sx} 760) scale(${1 + beat * 0.12})`}><rect x={-110} y={-200} width={220} height={400} rx={20} fill={P.ink} /><circle cy={-90} r={70} fill="#495057" stroke={P.yellow} strokeWidth={8} /><circle cy={90} r={50} fill="#495057" stroke={P.pink} strokeWidth={8} /></g>)}
    </svg>
  );
};

const BkashScene: React.FC = () => {
  const { st, cue, frame, beat } = useA();
  const bal = Math.max(12, Math.round(25000 - Math.max(0, st - 1.4) * 2600));
  const rich = cue === "bkash" || cue === "crown";
  return (
    <svg width={W} height={H}>
      <Rays cx={W / 2} cy={H / 2} colors={["#e2136e", "#ff5fa2"]} speed={0.3} />
      <g transform={`translate(1350 560) rotate(${Math.sin(frame / 20) * 3})`}>
        <rect x={-230} y={-440} width={460} height={880} rx={50} fill={P.ink} stroke={P.white} strokeWidth={10} />
        <rect x={-200} y={-390} width={400} height={780} rx={20} fill={P.white} />
        <rect x={-200} y={-390} width={400} height={150} rx={20} fill="#e2136e" />
        <text x={0} y={-290} textAnchor="middle" fontFamily={EN} fontWeight={900} fontSize={52} fill={P.white}>bKash</text>
        <text x={0} y={-120} textAnchor="middle" fontFamily={BN} fontWeight={700} fontSize={40} fill={P.navy}>ব্যালেন্স</text>
        <text x={0} y={-20} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={100} fill={bal < 1000 ? P.red : P.green}>৳{bal.toLocaleString("en-IN")}</text>
        {["বিদ্যুৎ বিল", "বাসা ভাড়া", "ইন্টারনেট", "ধার শোধ"].map((b, i) => {
          const show = st > 1.4 + i * 0.8;
          return show ? <g key={b} transform={`translate(0 ${80 + i * 80})`}><rect x={-180} y={-34} width={360} height={64} rx={14} fill="#ffe5ec" stroke={P.red} strokeWidth={4} /><text x={0} y={12} textAnchor="middle" fontFamily={BN} fontWeight={700} fontSize={34} fill={P.red}>− {b}</text></g> : null;
        })}
      </g>
      <Person x={560} y={1000} s={1.3} pose={rich ? "dance" : "shrug"} mood={rich ? "sing" : "wow"} />
      {rich && <g transform={`translate(560 ${420 - beat * 20})`}><path d="M-90 40 l-10 -110 l50 50 l50 -80 l50 80 l50 -50 l-10 110z" fill={P.yellow} stroke={P.ink} strokeWidth={6} /></g>}
      {!rich && <g transform={`translate(${560 + st * 40} ${300 + st * 120}) rotate(${st * 60})`}><path d="M-90 40 l-10 -110 l50 50 l50 -80 l50 80 l50 -50 l-10 110z" fill={P.yellow} stroke={P.ink} strokeWidth={6} opacity={0.8} /></g>}
      {(cue === "hearts" || cue === "game") && Array.from({ length: 6 }, (_, i) => <path key={i} transform={`translate(${900 + i * 60} ${500 - ((frame * 3 + i * 40) % 300)}) scale(0.5)`} d="M0 40 l-40 -40 a24 24 0 0 1 40 -32 a24 24 0 0 1 40 32z" fill={P.pink} stroke={P.ink} strokeWidth={5} />)}
      {(cue === "timer" || cue === "clock") && <g transform="translate(900 260)"><circle r={110} fill={P.white} stroke={P.ink} strokeWidth={8} /><line x1={0} y1={0} x2={Math.sin(frame / 2) * 80} y2={-Math.cos(frame / 2) * 80} stroke={P.red} strokeWidth={8} /><text y={170} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={44} fill={P.white}>৫ মিনিট = আধবেলা</text></g>}
    </svg>
  );
};

const TeaScene: React.FC = () => {
  const { frame, cue } = useA();
  return (
    <svg width={W} height={H}>
      <Sky top="#ffd166" bottom="#ef476f" />
      <Skyline y={620} seed="te" scale={0.8} />
      <rect y={860} width={W} height={220} fill="#6c584c" />
      {/* tong — tea stall */}
      <g transform="translate(1180 880)">
        <rect x={0} y={-380} width={560} height={380} fill="#9c6644" stroke={P.ink} strokeWidth={6} />
        <path d="M-40 -380 h640 l-40 -100 h-560z" fill={P.blue} stroke={P.ink} strokeWidth={6} />
        <text x={280} y={-410} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={56} fill={P.white}>মামার টং</text>
        {[60, 160, 260].map((jx, i) => <g key={jx}><rect x={jx} y={-300} width={80} height={110} rx={14} fill="#caf0f8" stroke={P.ink} strokeWidth={4} opacity={0.9} /><circle cx={jx + 40} cy={-230} r={20} fill={[P.orange, P.yellow, P.pink][i]} /></g>)}
        <g transform="translate(420 -230)"><path d="M-50 0 q0 -70 50 -70 q50 0 50 70z" fill="#adb5bd" stroke={P.ink} strokeWidth={5} /><path d={`M-10 -90 q-14 -30 4 -60`} stroke={P.white} strokeWidth={6} fill="none" opacity={0.6 + Math.sin(frame / 5) * 0.3} /></g>
      </g>
      <rect x={160} y={880} width={820} height={30} fill="#7f5539" stroke={P.ink} strokeWidth={5} />
      <Person x={300} y={1000} s={0.8} pose="tea" kind="f1" seed={1} />
      <Person x={560} y={1000} s={0.85} pose={cue === "hourglass" ? "shrug" : "tea"} mood="sing" />
      <Person x={820} y={1000} s={0.8} pose={cue === "tea" ? "wave" : "tea"} kind="f2" seed={2} />
      {cue === "receipt" || cue === "question" ? <g transform="translate(560 300)"><circle r={120} fill={P.white} stroke={P.ink} strokeWidth={8} /><text y={46} textAnchor="middle" fontFamily={EN} fontWeight={900} fontSize={140} fill={P.red}>?</text></g> : null}
    </svg>
  );
};

const KitchenScene: React.FC = () => {
  const { frame, cue, beat } = useA();
  const mw = cue === "microwave" || cue === "star";
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#cdb4db" />
      <rect y={820} width={W} height={260} fill="#ffc8dd" />
      {/* fridge */}
      <g transform="translate(220 840)">
        <rect x={0} y={-640} width={360} height={640} rx={24} fill={P.white} stroke={P.ink} strokeWidth={7} />
        <rect x={10} y={-630} width={340} height={380} fill="#e0fbfc" />
        <g transform="translate(180 -420)"><path d="M-90 0 h180 a90 70 0 0 1 -180 0z" fill={P.white} stroke={P.ink} strokeWidth={5} /><path d="M-70 0 q70 -60 140 0" fill="#f8f9fa" stroke={P.ink} strokeWidth={3} /><text y={70} textAnchor="middle" fontFamily={BN} fontWeight={700} fontSize={26} fill={P.ink}>গতকালের ভাত</text></g>
      </g>
      {/* microwave */}
      <g transform="translate(1300 720)">
        <rect x={-260} y={-220} width={520} height={300} rx={20} fill="#adb5bd" stroke={P.ink} strokeWidth={7} />
        <rect x={-230} y={-190} width={360} height={240} rx={12} fill={mw ? `rgba(255,214,10,${0.6 + beat * 0.4})` : "#343a40"} stroke={P.ink} strokeWidth={5} />
        {mw && <g transform={`translate(-50 -70) rotate(${frame * 6})`}><Flower x={0} y={0} r={60} c1={P.orange} /></g>}
        <circle cx={200} cy={-120} r={22} fill={P.ink} /><circle cx={200} cy={-40} r={22} fill={P.ink} />
      </g>
      <Person x={860} y={1000} s={1.05} pose={mw ? "dance" : "point"} mood="sing" />
      {cue === "star" && Array.from({ length: 6 }, (_, i) => <path key={i} transform={`translate(${700 + i * 150} ${250 + Math.sin(frame / 7 + i) * 40}) scale(0.5)`} d="M0 -60 l18 40 l44 4 l-34 30 l10 44 l-38 -22 l-38 22 l10 -44 l-34 -30 l44 -4z" fill={P.yellow} stroke={P.ink} strokeWidth={5} />)}
    </svg>
  );
};

const BusScene: React.FC = () => {
  const { frame } = useA();
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#10002b" />
      {/* city lights streaking past outside */}
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={W - ((frame * (8 + (i % 5) * 3) + random(`bl${i}`) * W) % (W + 200))} cy={200 + random(`by${i}`) * 400} r={8 + random(`br${i}`) * 18} fill={[P.yellow, P.pink, P.blue][i % 3]} opacity={0.55} />)}
      {/* bus interior frame + window */}
      <path d={`M0 0 H${W} V${H} H0z M180 140 H1740 V700 H180z`} fill="#3c096c" fillRule="evenodd" stroke={P.ink} strokeWidth={8} />
      <line x1={960} y1={140} x2={960} y2={700} stroke={P.ink} strokeWidth={14} />
      <rect x={0} y={760} width={W} height={60} fill="#5a189a" />
      {/* standing crowd silhouettes */}
      {Array.from({ length: 9 }, (_, i) => <g key={i} transform={`translate(${120 + i * 210} ${1080 + Math.sin(frame / 10 + i) * 4})`}><circle cy={-330} r={50} fill="#240046" /><rect x={-60} y={-290} width={120} height={290} rx={30} fill="#240046" /></g>)}
      <Person x={960} y={1080} s={1.0} pose="sad" mood="sad" />
    </svg>
  );
};

const VillageScene: React.FC = () => {
  const { frame } = useA();
  return (
    <svg width={W} height={H}>
      <Sky top="#8ecae6" bottom="#e0fbfc" />
      <circle cx={1600} cy={180} r={90} fill={P.yellow} />
      <rect y={700} width={W} height={380} fill="#80b918" />
      <path d={`M0 700 Q480 660 960 700 T${W} 690`} fill="#70a700" />
      <Kite x={500} y={260} c={P.pink} seed={1} />
      <Kite x={1200} y={200} c={P.yellow} seed={2} />
      <Kite x={900} y={380} c={P.blue} seed={3} />
      {/* kids running */}
      {[0, 1, 2].map((i) => <Person key={i} kind={(["bablu", "f1", "f2"] as Kind[])[i]} x={(400 + i * 300 + frame * 2.5) % (W + 300) - 150} y={960} s={0.6} pose="wave" seed={i} />)}
      {/* pond */}
      <ellipse cx={1500} cy={900} rx={320} ry={80} fill="#48cae4" stroke={P.ink} strokeWidth={5} />
    </svg>
  );
};

const RiverScene: React.FC = () => {
  const { frame, cue } = useA();
  const adda = cue === "tea" || cue === "phoneoff" || cue === "umbrella" || cue === "sun";
  return (
    <svg width={W} height={H}>
      <Sky top="#ff7b00" bottom="#ffd6a5" />
      <circle cx={W / 2} cy={600} r={170} fill="#ff4800" opacity={0.85} />
      <rect y={600} width={W} height={480} fill="#0077b6" />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${(i * 260 + frame * 1.5) % W} ${660 + i * 40} q40 -14 80 0`} stroke="#90e0ef" strokeWidth={6} fill="none" />)}
      {/* nouka */}
      <g transform={`translate(${300 + (frame * 0.8) % 400} ${700 + Math.sin(frame / 15) * 6})`}>
        <path d="M-160 0 q160 70 320 0 l-30 -30 h-260z" fill="#7f5539" stroke={P.ink} strokeWidth={6} />
        <path d="M0 -30 V-260 L140 -60z" fill={P.white} stroke={P.ink} strokeWidth={5} />
      </g>
      {/* ghat steps with friends */}
      <path d={`M1100 1080 L1100 820 H${W} V1080z`} fill="#bc6c25" stroke={P.ink} strokeWidth={6} />
      {adda ? (
        <>
          <Person x={1280} y={900} s={0.75} pose="tea" mood="sing" />
          <Person kind="f1" x={1500} y={900} s={0.72} pose="tea" seed={1} />
          <Person kind="f2" x={1720} y={900} s={0.72} pose="wave" seed={2} />
          {cue === "phoneoff" && <g transform="translate(1400 760)"><rect x={-30} y={-50} width={60} height={100} rx={10} fill={P.ink} /><path d="M-50 -60 l100 120" stroke={P.red} strokeWidth={10} /></g>}
        </>
      ) : (
        <Person x={1450} y={900} s={0.85} pose={cue === "home" || cue === "heart" ? "wave" : "idle"} mood="sing" />
      )}
    </svg>
  );
};

const RoofFinal: React.FC = () => {
  const { frame, beat } = useA();
  return (
    <svg width={W} height={H}>
      <Sky top="#ff9e00" bottom="#ff477e" />
      <Rays cx={W / 2} cy={760} colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0)"]} speed={0.4} />
      <circle cx={W / 2} cy={760} r={220 + beat * 20} fill={P.yellow} />
      <Kite x={300} y={200} c={P.blue} seed={1} />
      <Kite x={1650} y={170} c={P.green} seed={2} />
      <Kite x={1100} y={110} c={P.purple} seed={3} />
      <Skyline y={760} seed="f" />
      <Roof />
      <Person kind="baba" x={360} y={1000} s={0.8} pose="dance" seed={3} mood="sing" />
      <Person kind="ma" x={620} y={1000} s={0.8} pose="dance" seed={4} mood="sing" />
      <Person x={W / 2} y={1010} s={1.0} pose="dance" mood="sing" />
      <Person kind="f1" x={1300} y={1000} s={0.85} pose="dance" seed={1} />
      <Person kind="f2" x={1560} y={1000} s={0.85} pose="dance" seed={2} />
      {Array.from({ length: 30 }, (_, i) => <rect key={i} x={(random(`c${i}`) * W + Math.sin(frame / 10 + i) * 30) % W} y={(frame * (3 + (i % 4)) + random(`cy${i}`) * H) % H} width={14} height={22} fill={[P.pink, P.yellow, P.blue, P.green][i % 4]} transform={`rotate(${frame * 5 + i * 40} ${(random(`c${i}`) * W) % W} ${(frame * (3 + (i % 4)) + random(`cy${i}`) * H) % H})`} />)}
    </svg>
  );
};

const RoofCalm: React.FC = () => (
  <svg width={W} height={H}>
    <Sky top="#2d00f7" bottom="#ff6d00" />
    <Stars />
    <Skyline y={760} night seed="c" />
    <Roof />
    <Person x={W / 2} y={960} s={1.2} pose="tea" mood="smile" />
  </svg>
);

const EndScene: React.FC<{ title: string; credits: BDProps["credits"] }> = ({ title, credits }) => {
  const { st, fps, frame } = useA();
  const s = spring({ frame: Math.round(st * fps), fps, config: { damping: 14 } });
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <Rays cx={W / 2} cy={H / 2} colors={[P.navy, "#1d2d5c"]} speed={0.2} />
        <g transform={`translate(${W / 2} ${H / 2}) scale(${s})`}>
          <rect x={-760} y={-330} width={1520} height={660} rx={40} fill={P.navy} stroke={P.yellow} strokeWidth={16} />
          <rect x={-730} y={-300} width={1460} height={600} rx={28} fill="none" stroke={P.pink} strokeWidth={8} strokeDasharray="30 18" />
          {[[-680, -250], [680, -250], [-680, 250], [680, 250]].map(([fx, fy], i) => <Flower key={i} x={fx} y={fy} r={56} spin={frame * 2} c1={i % 2 ? P.blue : P.pink} />)}
          <text x={0} y={-130} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={120} fill={P.yellow} stroke={P.ink} strokeWidth={6} paintOrder="stroke">{title}</text>
          {credits.map((c, i) => (
            <g key={i} opacity={interpolate(st, [0.6 + i * 0.4, 1.0 + i * 0.4], [0, 1], clamp)}>
              <text x={0} y={-10 + i * 120} textAnchor="middle" fontFamily={EN} fontWeight={600} fontSize={34} letterSpacing={8} fill={P.pink}>{c.role.toUpperCase()}</text>
              <text x={0} y={50 + i * 120} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={58} fill={P.white}>{c.name}</text>
            </g>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};


// ------------------------------------------------------------------ extra story scenes
const TeaCupScene: React.FC = () => {
  const { frame, st } = useA();
  return (
    <svg width={W} height={H}>
      <Rays cx={W / 2} cy={H / 2} colors={[P.orange, P.yellow]} speed={0.15} />
      <ellipse cx={W / 2} cy={980} rx={760} ry={90} fill={P.pink} stroke={P.ink} strokeWidth={8} />
      <path d={`M${W / 2 - 520} 300 h1040 v300 a520 380 0 0 1 -1040 0z`} fill={P.white} stroke={P.ink} strokeWidth={10} />
      <path d={`M${W / 2 + 520} 380 a150 130 0 1 1 0 260`} fill="none" stroke={P.ink} strokeWidth={30} />
      <path d={`M${W / 2 + 520} 380 a150 130 0 1 1 0 260`} fill="none" stroke={P.white} strokeWidth={18} />
      <ellipse cx={W / 2} cy={300} rx={520} ry={70} fill="#8b4513" stroke={P.ink} strokeWidth={8} />
      {/* calendar pages of 'yesterday' sinking */}
      {[0, 1, 2].map((i) => {
        const y = 260 + ((st * 40 + i * 50) % 120);
        return <g key={i} transform={`translate(${W / 2 - 220 + i * 210} ${y}) rotate(${Math.sin(frame / 12 + i) * 14})`} opacity={interpolate(y, [260, 380], [1, 0], clamp)}><rect x={-60} y={-70} width={120} height={140} fill={P.white} stroke={P.ink} strokeWidth={4} /><rect x={-60} y={-70} width={120} height={36} fill={P.red} /><text y={50} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={40} fill={P.ink}>কাল</text></g>;
      })}
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${W / 2 - 240 + i * 160} 200 q-30 -60 0 -120 q30 -60 0 -120`} stroke={P.white} strokeWidth={14} fill="none" opacity={0.5 + Math.sin(frame / 8 + i) * 0.3} />)}
      <Person x={W / 2} y={360 + Math.sin(frame / 10) * 8} s={0.5} pose="sad" mood="sad" />
    </svg>
  );
};

const MirrorScene: React.FC = () => {
  const { frame, cue } = useA();
  const sad = cue === "heartbreak" || cue === "mask";
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#ffcad4" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 170} y={0} width={80} height={H} fill="#f4acb7" opacity={0.5} />)}
      <rect y={860} width={W} height={220} fill="#9d8189" />
      <Person x={560} y={1000} s={1.3} pose="shrug" mood="smile" />
      {/* mirror shows the real face */}
      <g transform="translate(1340 520)">
        <ellipse rx={330} ry={420} fill="#d8f3dc" stroke={P.yellow} strokeWidth={26} />
        <ellipse rx={300} ry={390} fill="#b7e4c7" />
        <Person x={0} y={420} s={1.1} pose="sad" mood={sad ? "sad" : "smile"} flip />
        {sad && [0, 1].map((i) => <path key={i} d={`M${-22 + i * 44} ${-30 + ((frame * 2 + i * 20) % 60)} q6 14 0 22 q-6 -8 0 -22z`} fill={P.blue} />)}
        <path d="M-240 -260 l90 -80 M-200 -180 l60 -50" stroke={P.white} strokeWidth={14} opacity={0.6} />
      </g>
    </svg>
  );
};

const BazaarScene: React.FC = () => {
  const { frame, st, beat } = useA();
  const price = Math.round(60 + st * 18);
  return (
    <svg width={W} height={H}>
      <Sky top="#ffe066" bottom="#ffb703" />
      {/* tarp canopy */}
      <path d={`M0 0 H${W} V220 q-240 60 -480 0 q-240 60 -480 0 q-240 60 -480 0 q-240 60 -480 0z`} fill={P.blue} stroke={P.ink} strokeWidth={6} />
      <rect y={760} width={W} height={320} fill="#a68a64" />
      {/* baskets */}
      {[[260, "#e63946", "টমেটো"], [700, "#80b918", "লাউ"], [1140, "#ff8c1a", "পেঁয়াজ"], [1580, "#adb5bd", "ইলিশ"]].map(([x, c, n], i) => (
        <g key={i} transform={`translate(${x} 760)`}>
          <path d="M-170 0 h340 l-30 140 h-280z" fill="#bc6c25" stroke={P.ink} strokeWidth={6} />
          {Array.from({ length: 7 }, (_, k) => <ellipse key={k} cx={-120 + k * 40} cy={-14 - (k % 2) * 20} rx={i === 3 ? 70 : 30} ry={i === 3 ? 18 : 28} fill={c as string} stroke={P.ink} strokeWidth={4} />)}
          <g transform={`translate(0 -150) rotate(${Math.sin(frame / 9 + i) * 6}) scale(${1 + (i === Math.floor(st) % 4 ? beat * 0.2 : 0)})`}>
            <rect x={-110} y={-50} width={220} height={100} fill={P.white} stroke={P.ink} strokeWidth={5} />
            <text y={-6} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={34} fill={P.ink}>{n}</text>
            <text y={38} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={40} fill={P.red}>৳{price + i * 40}</text>
          </g>
        </g>
      ))}
      <Person x={W / 2 - 220} y={1040} s={0.95} pose="shrug" mood="wow" />
      <Person kind="driver" x={W / 2 + 220} y={1040} s={0.9} pose="point" seed={2} />
    </svg>
  );
};

const BossScene: React.FC = () => {
  const { st, fps } = useA();
  const stamp = spring({ frame: Math.round((st - 2.2) * fps), fps, config: { damping: 9, stiffness: 160 } });
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#e9ecef" />
      <rect x={1300} y={120} width={420} height={480} fill={P.white} stroke={P.ink} strokeWidth={8} />
      <rect x={1300} y={120} width={420} height={110} fill={P.red} />
      <text x={1510} y={200} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={60} fill={P.white}>ক্যালেন্ডার</text>
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 7 }, (_, c) => <rect key={`${r}${c}`} x={1320 + c * 56} y={250 + r * 66} width={44} height={50} fill={r === 2 && c === 5 ? P.yellow : "#dee2e6"} />))}
      <rect y={760} width={W} height={320} fill="#8d6e63" />
      <rect x={200} y={640} width={900} height={60} fill="#5d4037" stroke={P.ink} strokeWidth={6} />
      <Person kind="baba" x={650} y={640} s={0.9} pose="point" mood="sad" seed={5} />
      <Person x={1150} y={1040} s={1.0} pose="shrug" mood="wow" />
      <g transform={`translate(700 380) scale(${stamp}) rotate(-14)`} opacity={stamp}>
        <rect x={-260} y={-90} width={520} height={180} rx={20} fill="none" stroke={P.red} strokeWidth={16} />
        <text y={30} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={100} fill={P.red}>ছুটি নাই!</text>
      </g>
    </svg>
  );
};

const TimelapseScene: React.FC = () => {
  const { frame, st } = useA();
  const a = st * 2.2;
  const day = (Math.sin(a) + 1) / 2;
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill={`rgb(${Math.round(20 + day * 120)},${Math.round(30 + day * 160)},${Math.round(80 + day * 160)})`} />
      <circle cx={W / 2 + Math.cos(a) * 800} cy={760 - Math.sin(a) * 600} r={90} fill={P.yellow} />
      <circle cx={W / 2 - Math.cos(a) * 800} cy={760 + Math.sin(a) * 600} r={70} fill={P.cream} />
      <Skyline y={760} night={day < 0.4} seed="tl" />
      <rect y={760} width={W} height={320} fill="#6c757d" />
      {Array.from({ length: 14 }, (_, i) => <g key={i} opacity={0.55}><Person kind={(["f1", "f2", "driver"] as Kind[])[i % 3]} x={((i * 160 + frame * (18 + (i % 3) * 6)) % (W + 300)) - 150} y={1020} s={0.5} pose="idle" seed={i} /></g>)}
      <Person x={W / 2} y={1040} s={0.95} pose="sad" mood="sad" />
      <g transform="translate(1640 200)"><circle r={110} fill={P.white} stroke={P.ink} strokeWidth={8} /><line x2={Math.sin(frame / 2) * 80} y2={-Math.cos(frame / 2) * 80} stroke={P.ink} strokeWidth={8} /><line x2={Math.sin(frame / 24) * 50} y2={-Math.cos(frame / 24) * 50} stroke={P.red} strokeWidth={10} /></g>
    </svg>
  );
};

const BusRoofScene: React.FC<{ night?: boolean }> = ({ night }) => {
  const { frame } = useA();
  return (
    <svg width={W} height={H}>
      {night ? <Sky top="#10002b" bottom="#7b2cbf" /> : <Sky top="#00b4ff" bottom="#90e0ef" />}
      {night && <Stars />}
      <g transform={`translate(${-((frame * 6) % 400)} 0)`}><Skyline y={780} night={night} seed="br" dx={0} /></g>
      <rect y={780} width={W} height={300} fill="#495057" />
      <path d={`M0 960 H${W}`} stroke={P.yellow} strokeWidth={10} strokeDasharray="80 60" strokeDashoffset={frame * 14} />
      <Bus x={300} y={1020} s={1.75} heads={false} />
      <Person x={620} y={460} s={0.75} pose="dance" mood="sing" />
      <Person kind="f1" x={900} y={460} s={0.7} pose="dance" seed={1} />
      <Person kind="f2" x={1180} y={460} s={0.7} pose="dance" seed={2} />
      <Person kind="driver" x={1450} y={460} s={0.7} pose="dance" seed={3} />
    </svg>
  );
};

const MelaScene: React.FC = () => {
  const { frame, beat, bi } = useA();
  return (
    <svg width={W} height={H}>
      <Rays cx={W / 2} cy={H / 2} colors={bi % 2 ? [P.red, P.white] : [P.white, P.red]} n={20} speed={0.6} />
      {/* nagordola */}
      <g transform="translate(1500 470)">
        <path d="M0 0 L-180 520 M0 0 L180 520" stroke={P.ink} strokeWidth={16} />
        <g transform={`rotate(${frame * 2})`}>
          <circle r={330} fill="none" stroke={P.yellow} strokeWidth={16} />
          {Array.from({ length: 8 }, (_, i) => <line key={i} x2={Math.cos(i / 8 * Math.PI * 2) * 330} y2={Math.sin(i / 8 * Math.PI * 2) * 330} stroke={P.ink} strokeWidth={8} />)}
          {Array.from({ length: 8 }, (_, i) => <g key={i} transform={`translate(${Math.cos(i / 8 * Math.PI * 2) * 330} ${Math.sin(i / 8 * Math.PI * 2) * 330}) rotate(${-frame * 2})`}><rect x={-46} y={0} width={92} height={70} rx={10} fill={[P.pink, P.blue, P.green, P.orange][i % 4]} stroke={P.ink} strokeWidth={5} /></g>)}
        </g>
      </g>
      {/* Boishakhi masks */}
      {[[300, P.yellow], [620, P.blue]].map(([x, c], i) => (
        <g key={i} transform={`translate(${x} ${330 + Math.sin(frame / 10 + i) * 20}) scale(${1 + beat * 0.08})`}>
          <ellipse rx={140} ry={170} fill={c as string} stroke={P.ink} strokeWidth={8} />
          <ellipse cx={-50} cy={-30} rx={34} ry={44} fill={P.white} stroke={P.ink} strokeWidth={6} /><ellipse cx={50} cy={-30} rx={34} ry={44} fill={P.white} stroke={P.ink} strokeWidth={6} />
          <circle cx={-50} cy={-26} r={14} fill={P.ink} /><circle cx={50} cy={-26} r={14} fill={P.ink} />
          <path d="M-70 60 q70 60 140 0" fill={P.red} stroke={P.ink} strokeWidth={6} />
          <path d="M-140 -60 q-40 -120 40 -150 M140 -60 q40 -120 -40 -150" stroke={P.red} strokeWidth={14} fill="none" />
        </g>
      ))}
      <Person x={520} y={1040} s={0.9} pose="dance" mood="sing" />
      <Person kind="f2" x={820} y={1040} s={0.85} pose="dance" seed={2} />
    </svg>
  );
};

const FeedScene: React.FC = () => {
  const { frame, st } = useA();
  return (
    <svg width={W} height={H}>
      <rect width={W / 2} height={H} fill={P.pink} />
      <rect x={W / 2} width={W / 2} height={H} fill="#adb5bd" />
      <g transform="translate(480 540)">
        <rect x={-260} y={-460} width={520} height={920} rx={50} fill={P.ink} />
        <rect x={-230} y={-420} width={460} height={840} rx={20} fill={P.white} />
        {[0, 1, 2].map((i) => <g key={i} transform={`translate(0 ${-300 + i * 260 - ((st * 60) % 260)})`}><rect x={-200} y={-100} width={400} height={220} rx={16} fill={[P.yellow, P.teal, P.orange][i]} /><Person x={0} y={110} s={0.32} pose="dance" mood="sing" seed={i} /><text x={150} y={100} fontFamily={EN} fontWeight={900} fontSize={30} fill={P.red}>♥ {(9 + i) * 111}</text></g>)}
      </g>
      <text x={480} y={60} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={48} fill={P.white}>ফোনে</text>
      <text x={1440} y={60} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={48} fill={P.ink}>বাস্তবে</text>
      {/* real life: buried in work */}
      <rect x={1060} y={760} width={760} height={40} fill="#6c584c" />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={1120 + (i % 3) * 40} y={730 - i * 34} width={200} height={34} fill={[P.white, P.cream, "#e9ecef"][i % 3]} stroke={P.ink} strokeWidth={3} transform={`rotate(${Math.sin(frame / 6 + i) * 2} 1220 ${730 - i * 34})`} />)}
      <Person x={1560} y={1040} s={0.95} pose="shrug" mood="wow" />
    </svg>
  );
};

const LateScene: React.FC = () => {
  const { frame, st } = useA();
  const x = interpolate(st, [0, 2.6], [-200, 900], clamp);
  return (
    <svg width={W} height={H}>
      <Sky top="#ffd166" bottom="#f8961e" />
      <g transform={`translate(${-((frame * 10) % 600)} 0)`}><Skyline y={760} seed="lt" /></g>
      <rect y={760} width={W} height={320} fill="#6c757d" />
      <Person x={x} y={1040} s={0.95} pose="dance" mood="wow" />
      {[0, 1, 2].map((i) => <line key={i} x1={x - 200 - i * 60} y1={700 + i * 60} x2={x - 120 - i * 60} y2={700 + i * 60} stroke={P.white} strokeWidth={10} />)}
      <Person kind="f1" x={1500} y={1040} s={0.9} pose="shrug" seed={1} mood="sad" />
      <Person kind="f2" x={1740} y={1040} s={0.9} pose="point" seed={2} />
      <g transform="translate(1600 260)"><circle r={130} fill={P.white} stroke={P.ink} strokeWidth={8} /><line x2={Math.sin(frame / 3) * 100} y2={-Math.cos(frame / 3) * 100} stroke={P.red} strokeWidth={10} /><text y={200} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={50} fill={P.navy}>৫ মিনিট?!</text></g>
    </svg>
  );
};

const SchoolScene: React.FC = () => {
  const { frame } = useA();
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#caf0f8" />
      <rect x={260} y={120} width={1000} height={520} fill="#2d6a4f" stroke="#6f4518" strokeWidth={24} />
      <text x={760} y={320} textAnchor="middle" fontFamily={BN} fontWeight={700} fontSize={70} fill={P.white}>আমার স্বপ্ন:</text>
      <text x={760} y={440} textAnchor="middle" fontFamily={BN} fontWeight={700} fontSize={60} fill={P.yellow}>পাইলট • ডাক্তার • হিরো</text>
      <rect y={820} width={W} height={260} fill="#d4a373" />
      {[0, 1, 2].map((i) => <rect key={i} x={300 + i * 480} y={820} width={300} height={40} fill="#6f4518" />)}
      <Person kind="f1" x={380} y={1000} s={0.55} pose="wave" seed={1} />
      <Person x={900} y={1000} s={0.6} pose="wave" mood="sing" />
      <Person kind="f2" x={1400} y={1000} s={0.55} pose="idle" seed={2} />
      <g transform={`translate(1560 260) rotate(${Math.sin(frame / 10) * 10})`}><path d="M-120 0 l240 -30 l-60 30 l60 30z" fill={P.white} stroke={P.ink} strokeWidth={5} /></g>
      <Kite x={1700} y={520} c={P.pink} seed={4} />
    </svg>
  );
};

const FilesScene: React.FC = () => {
  const { frame, st } = useA();
  const n = Math.min(14, Math.floor(st * 5));
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#adb5bd" />
      <rect y={800} width={W} height={280} fill="#6c757d" />
      {Array.from({ length: n }, (_, i) => <rect key={i} x={560 + (i % 2) * 30 + Math.sin(i) * 20} y={760 - i * 46} width={360} height={44} fill={[P.white, P.cream, "#dee2e6"][i % 3]} stroke={P.ink} strokeWidth={4} />)}
      {Array.from({ length: Math.max(0, n - 3) }, (_, i) => <rect key={i} x={1060 + Math.sin(i * 2) * 30} y={760 - i * 46} width={340} height={44} fill={[P.cream, P.white][i % 2]} stroke={P.ink} strokeWidth={4} />)}
      <Person x={980} y={1040} s={1.0} pose="sad" mood="sad" />
      <g transform="translate(1640 220)"><circle r={120} fill={P.white} stroke={P.ink} strokeWidth={8} /><line x2={Math.sin(frame / 3) * 90} y2={-Math.cos(frame / 3) * 90} stroke={P.ink} strokeWidth={8} /></g>
    </svg>
  );
};

const HomecomingScene: React.FC = () => {
  const { st, frame, cue } = useA();
  const x = interpolate(st, [0, 2.4], [-150, 760], clamp);
  return (
    <svg width={W} height={H}>
      <Sky top="#ffafcc" bottom="#ffd6a5" />
      <circle cx={1500} cy={300} r={120} fill={P.orange} />
      <rect y={720} width={W} height={360} fill="#80b918" />
      <g transform="translate(1100 720)"><path d="M0 0 v-260 h460 v260z" fill="#d4a373" stroke={P.ink} strokeWidth={6} /><path d="M-50 -260 L230 -420 L510 -260z" fill="#adb5bd" stroke={P.ink} strokeWidth={6} /><rect x={180} y={-150} width={100} height={150} fill="#6f4518" /></g>
      <Person kind="ma" x={1180} y={990} s={0.9} pose={st > 2 ? "wave" : "idle"} mood="sing" />
      <Person kind="baba" x={1420} y={990} s={0.9} pose={st > 2 ? "wave" : "idle"} mood="smile" />
      <Person x={x} y={1000} s={0.95} pose={st > 2.4 ? "wave" : "dance"} mood="sing" />
      <g transform={`translate(${x - 120} 960)`}><rect x={-50} y={-90} width={100} height={90} rx={10} fill={P.red} stroke={P.ink} strokeWidth={5} /><path d="M-30 -90 q30 -40 60 0" fill="none" stroke={P.ink} strokeWidth={6} /></g>
      {(cue === "sunset" || cue === "heart") && Array.from({ length: 8 }, (_, i) => <path key={i} transform={`translate(${1000 + i * 70} ${600 - ((frame * 2 + i * 50) % 300)}) scale(0.5)`} d="M0 40 l-40 -40 a24 24 0 0 1 40 -32 a24 24 0 0 1 40 32z" fill={P.red} stroke={P.ink} strokeWidth={5} />)}
    </svg>
  );
};

const ParadeScene: React.FC = () => {
  const { frame, beat } = useA();
  return (
    <svg width={W} height={H}>
      <Rays cx={W / 2} cy={260} colors={[P.yellow, P.pink, P.blue, P.green]} speed={0.6} />
      <Skyline y={700} seed="pd" scale={0.7} />
      <rect y={700} width={W} height={380} fill="#495057" />
      {/* bunting */}
      <path d={`M0 330 Q${W / 2} 420 ${W} 330`} stroke={P.ink} strokeWidth={4} fill="none" />
      {Array.from({ length: 16 }, (_, i) => { const x = i * 124 + 40; const y = 330 + Math.sin((x / W) * Math.PI) * 88; return <path key={i} d={`M${x} ${y} l50 0 l-25 ${55 + Math.sin(frame / 6 + i) * 6}z`} fill={[P.pink, P.yellow, P.blue, P.green][i % 4]} stroke={P.ink} strokeWidth={3} />; })}
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${((i * 1100 + frame * 6) % (W + 1100)) - 600} 0)`}>
          <Rickshaw x={0} y={1050} s={1.25} hue={[P.pink, P.blue][i]}>
            <Person kind={(["bablu", "f1"] as Kind[])[i]} x={-100} y={-170} s={0.6} pose="dance" seed={i} mood="sing" />
          </Rickshaw>
        </g>
      ))}
      {Array.from({ length: 6 }, (_, i) => <Person key={i} kind={(["f2", "ma", "baba", "f1", "driver", "f2"] as Kind[])[i]} x={160 + i * 320} y={1075} s={0.55} pose="dance" seed={i + 3} />)}
      {Array.from({ length: 24 }, (_, i) => <Flower key={i} x={(random(`pf${i}`) * W + frame * 2) % W} y={(frame * (2 + (i % 3)) + random(`pfy${i}`) * 600) % 600} r={24 + beat * 6} spin={frame * 4} c1={[P.pink, P.blue, P.green][i % 3]} />)}
    </svg>
  );
};

// ------------------------------------------------------------------ lyrics
const wordTimes = (l: BDLine) => {
  const words = l.text.split(/\s+/).filter(Boolean);
  const total = words.reduce((s, w) => s + w.length, 0);
  const span = Math.max(0.3, (l.end - l.start) * 0.85);
  let acc = 0;
  return words.map((w) => {
    const at = l.start + (acc / total) * span;
    acc += w.length;
    return { w, at };
  });
};

/** Karaoke on a painted rickshaw signboard (lower third). */
const Signboard: React.FC<{ l: BDLine }> = ({ l }) => {
  const { t, fps, frame } = useA();
  const inS = spring({ frame: Math.round((t - l.start + 0.15) * fps), fps, config: { damping: 14, stiffness: 180 } });
  const out = interpolate(t, [l.end, l.end + 0.25], [0, 1], clamp);
  const ws = wordTimes(l);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 46 }}>
      <div style={{ position: "relative", transform: `translateY(${(1 - inS) * 160 + out * 160}px) rotate(${Math.sin(frame / 25) * 0.6}deg)`, opacity: 1 - out,
        background: P.navy, border: `8px solid ${P.yellow}`, outline: `5px dashed ${P.pink}`, outlineOffset: -20, borderRadius: 26, padding: "18px 90px 26px", maxWidth: 1600,
        boxShadow: `10px 12px 0 ${P.pink}` }}>
        <svg width={70} height={70} style={{ position: "absolute", left: -30, top: -30 }}><Flower x={35} y={35} r={32} spin={frame * 3} /></svg>
        <svg width={70} height={70} style={{ position: "absolute", right: -30, top: -30 }}><Flower x={35} y={35} r={32} c1={P.blue} spin={-frame * 3} /></svg>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 22px" }}>
          {ws.map(({ w, at }, k) => {
            const on = t >= at;
            const s = spring({ frame: Math.round((t - at) * fps), fps, config: { damping: 10, stiffness: 220, mass: 0.5 } });
            return (
              <span key={k} style={{ display: "inline-block", fontFamily: BN, fontWeight: 800, fontSize: 76, lineHeight: 1.2,
                color: on ? P.yellow : "rgba(255,244,214,0.42)", transform: on ? `translateY(${(1 - s) * -18}px) scale(${1 + (1 - s) * 0.25})` : undefined,
                textShadow: on ? `4px 4px 0 ${P.pink}` : "none" }}>
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Chorus: big painted rickshaw letters across the top, words pop in as sung. */
const PaintedChorus: React.FC<{ l: BDLine }> = ({ l }) => {
  const { t, fps, beat } = useA();
  const out = interpolate(t, [l.end, l.end + 0.2], [0, 1], clamp);
  const ws = wordTimes(l);
  const cols = [P.yellow, P.white, P.blue, P.green];
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 50 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 34px", maxWidth: 1760, opacity: 1 - out, transform: `scale(${1 + beat * 0.03})` }}>
        {ws.map(({ w, at }, k) => {
          const f = Math.round((t - at) * fps);
          const s = spring({ frame: f, fps, config: { damping: 9, stiffness: 200, mass: 0.6 } });
          return (
            <span key={k} style={{ display: "inline-block", fontFamily: BN, fontWeight: 800, fontStretch: "90%", fontSize: 150, lineHeight: 1.15, color: cols[k % cols.length],
              WebkitTextStroke: `7px ${P.ink}`, paintOrder: "stroke fill", textShadow: `9px 9px 0 ${P.pink}, 14px 14px 0 ${P.ink}`,
              opacity: f < 0 ? 0 : 1, transform: `translateY(${(1 - s) * -120}px) rotate(${(1 - s) * (k % 2 ? 12 : -12)}deg) scale(${0.6 + 0.4 * s})` }}>
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ transitions
const Wipe: React.FC = () => {
  const { t, frame, bounds } = useA();
  let p = -1;
  for (const s of bounds) if (s > 0 && Math.abs(t - s) < 0.2) p = (t - s + 0.2) / 0.4;
  if (p < 0) return null;
  const x = interpolate(p, [0, 1], [-W * 1.2, W * 1.2]);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${x} 0) skewX(-12)`}>
        <rect x={-W * 0.6} y={0} width={W * 1.2} height={H} fill={P.pink} />
        <rect x={-W * 0.6 + 60} y={0} width={80} height={H} fill={P.yellow} />
        <rect x={W * 0.6 - 140} y={0} width={80} height={H} fill={P.blue} />
        {Array.from({ length: 4 }, (_, i) => <Flower key={i} x={0} y={140 + i * 270} r={110} spin={frame * 6} c1={i % 2 ? P.blue : P.yellow} />)}
      </g>
    </svg>
  );
};

// ------------------------------------------------------------------ composition
export const BabluDhaka: React.FC<BDProps> = (p) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const i = Math.min(frame, p.bass.length - 1);
  let bi = -1;
  for (let k = 0; k < p.beats.length && p.beats[k] <= t; k++) bi = k;
  const beat = bi >= 0 ? Math.exp(-(t - p.beats[bi]) * 9) : 0;
  const SC = (p.scenes as [SceneId, number, number][] | undefined) ?? SCENES;
  const sc = SC.find(([, s, e]) => t >= s && t < e) ?? SC[SC.length - 1];
  const [scene, s0] = sc;
  let line: BDLine | undefined;
  for (const l of p.lines) if (t >= l.start && t < l.end) line = l;
  if (!line) for (const l of p.lines) if (t >= l.start - 0.12 && t <= l.end + 0.25) line = l;
  // cue: icon of the latest line that started inside this scene
  let cue: string | undefined;
  for (const l of p.lines) if (l.start <= t + 0.05 && l.start >= s0 - 0.2 && l.icon) cue = l.icon;
  const ctx: Ctx = { bounds: SC.map((x) => x[1]), frame, t, fps, bass: p.bass[i] ?? 0, beat, bi, st: t - s0, scene, line, cue, singing: !!line };
  const big = BIG.includes(scene);
  const zoom = 1 + beat * (big ? 0.012 : 0.004) + Math.min(0.04, (t - s0) * 0.003);
  return (
    <A.Provider value={ctx}>
      <AbsoluteFill style={{ background: P.navy, overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
          {scene === "roofNight" && <RoofNight />}
          {scene === "call" && <CallScene />}
          {scene === "title" && <TitleScene title={p.title} />}
          {scene === "room" && <RoomScene />}
          {scene === "pocket" && <PocketScene />}
          {scene === "traffic" && <TrafficScene />}
          {scene === "home" && <HomeScene />}
          {scene === "stage" && <StageScene />}
          {scene === "dhol" && <DholScene />}
          {scene === "bkash" && <BkashScene />}
          {scene === "tea" && <TeaScene />}
          {scene === "kitchen" && <KitchenScene />}
          {scene === "bus" && <BusScene />}
          {scene === "stageNight" && <StageScene night />}
          {scene === "village" && <VillageScene />}
          {scene === "river" && <RiverScene />}
          {scene === "roofFinal" && <RoofFinal />}
          {scene === "roofCalm" && <RoofCalm />}
          {scene === "teaCup" && <TeaCupScene />}
          {scene === "mirror" && <MirrorScene />}
          {scene === "bazaar" && <BazaarScene />}
          {scene === "boss" && <BossScene />}
          {scene === "timelapse" && <TimelapseScene />}
          {scene === "busRoof" && <BusRoofScene />}
          {scene === "busRoofNight" && <BusRoofScene night />}
          {scene === "mela" && <MelaScene />}
          {scene === "feed" && <FeedScene />}
          {scene === "late" && <LateScene />}
          {scene === "school" && <SchoolScene />}
          {scene === "files" && <FilesScene />}
          {scene === "homecoming" && <HomecomingScene />}
          {scene === "parade" && <ParadeScene />}
          {scene === "end" && <EndScene title={p.title} credits={p.credits} />}
        </AbsoluteFill>
        {line && !line.who && scene !== "call" && (big ? <PaintedChorus key={line.start} l={line} /> : <Signboard key={line.start} l={line} />)}
        {line && line.who && scene !== "call" && (
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            <SpeakerBubble x={line.who === "q" ? 520 : 1400} y={300} text={line.text} dir={line.who === "q" ? 1 : -1} color={line.who === "q" ? P.white : P.yellow} />
          </svg>
        )}
        <Wipe />
        <AbsoluteFill style={{ background: "radial-gradient(circle, transparent 60%, rgba(0,0,0,0.28) 100%)", pointerEvents: "none" }} />
        <Audio src={staticFile(p.song)} />
      </AbsoluteFill>
    </A.Provider>
  );
};
