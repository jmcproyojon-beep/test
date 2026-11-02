import React from "react";
import { AbsoluteFill, Audio, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { A, BN, BDLine, Bus, clamp, Ctx, EN, H, Kind, Kite, P, Person, Rays, Sky, Skyline, Stars, useA, useFonts, W, wordTimes } from "./BabluDhaka";

// ---------------------------------------------------------------------------
// "Signal নাই" — তখন আর এখন. A story of Rafi: drowning in notifications in today's
// Dhaka, the signal drops, and memories of the 2000s (coin phones, CDs, school-field
// cricket, cassettes) pull him back to his friends — offline. 1920x1080, Bangla CC.
// ---------------------------------------------------------------------------

export type SNProps = {
  song: string;
  durationSec: number;
  beats: number[];
  bass: number[];
  onset: number[];
  lines: BDLine[];
  scenes: [string, number, number][];
  credits: { role: string; name: string }[];
};
type Era = "now" | "then" | "mix" | "big";
const ERA: Record<string, Era> = {
  modem: "then", roofCall: "now", title: "now", metro: "now", lookUp: "now", phoneShop: "then", cdRoom: "then", field: "then", videoGrid: "now",
  album: "mix", globe: "mix", antenna: "big", offline: "big", pixel: "big", vs1: "mix", vs2: "mix", zoomAdda: "now", contacts: "now",
  rainWindow: "then", emptyField: "then", cassette: "then", stairsCall: "now", galli: "big", humanSignal: "big", teaOutro: "now", end: "now",
};
const C = { neon: "#00f5d4", mag: "#f72585", vio: "#7209b7", ink: "#0b0c1e", sepia: "#f4e1c1", ink2: "#1e3a8a", amber: "#ffb703", grey: "#8d99ae" };

// ------------------------------------------------------------------ small props
const PhoneUI: React.FC<{ x: number; y: number; s?: number; bars?: number; children?: React.ReactNode; rot?: number }> = ({ x, y, s = 1, bars = 0, children, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <rect x={-120} y={-230} width={240} height={460} rx={34} fill={C.ink} stroke="#adb5bd" strokeWidth={6} />
    <rect x={-104} y={-200} width={208} height={400} rx={14} fill="#14213d" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={-90 + i * 14} y={-186 - i * 6} width={10} height={10 + i * 6} fill={i < bars ? C.neon : "#495057"} />)}
    {bars === 0 && <text x={30} y={-176} fontFamily={EN} fontWeight={800} fontSize={20} fill={C.mag}>No Service</text>}
    {children}
  </g>
);

const Nokia: React.FC<{ x: number; y: number; s?: number; glow?: boolean }> = ({ x, y, s = 1, glow }) => {
  const { frame } = useA();
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${glow ? Math.sin(frame * 1.5) * 4 : 0})`}>
      <rect x={-70} y={-170} width={140} height={340} rx={40} fill="#2b2d42" stroke={P.ink} strokeWidth={6} />
      <rect x={-48} y={-130} width={96} height={80} rx={6} fill={glow ? "#b5e48c" : "#99a88c"} stroke={P.ink} strokeWidth={4} />
      {glow && <text x={0} y={-80} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={16} fill={P.ink}>1 Missed</text>}
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-46 + (i % 3) * 34} y={-10 + Math.floor(i / 3) * 34} width={24} height={20} rx={6} fill="#8d99ae" />)}
      <rect x={-40} y={-200} width={14} height={40} rx={6} fill="#2b2d42" />
    </g>
  );
};

const Cassette: React.FC<{ x: number; y: number; s?: number; spin?: boolean }> = ({ x, y, s = 1, spin = true }) => {
  const { frame } = useA();
  const r = spin ? frame * 4 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-260} y={-160} width={520} height={320} rx={24} fill="#3d405b" stroke={P.ink} strokeWidth={8} />
      <rect x={-210} y={-120} width={420} height={110} rx={12} fill={C.sepia} />
      <text x={0} y={-50} textAnchor="middle" fontFamily={BN} fontWeight={700} fontSize={40} fill={C.ink2}>পুরোনো গান — A</text>
      <rect x={-170} y={20} width={340} height={90} rx={45} fill="#22223b" />
      {[-90, 90].map((cx) => (
        <g key={cx} transform={`translate(${cx} 65) rotate(${r})`}>
          <circle r={38} fill={C.sepia} stroke={P.ink} strokeWidth={4} />
          {[0, 60, 120, 180, 240, 300].map((a) => <rect key={a} x={-4} y={-30} width={8} height={14} fill={P.ink} transform={`rotate(${a})`} />)}
        </g>
      ))}
    </g>
  );
};

const Notif: React.FC<{ x: number; y: number; text: string; c?: string; delay?: number }> = ({ x, y, text, c = C.neon, delay = 0 }) => {
  const { st, fps } = useA();
  const s = spring({ frame: Math.round((st - delay) * fps), fps, config: { damping: 12, stiffness: 180 } });
  if (st < delay) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-150} y={-36} width={300} height={72} rx={20} fill="rgba(255,255,255,0.92)" stroke={c} strokeWidth={5} />
      <circle cx={-112} cy={0} r={20} fill={c} />
      <text x={-80} y={10} fontFamily={BN} fontWeight={700} fontSize={28} fill={C.ink}>{text}</text>
    </g>
  );
};

const House: React.FC<{ x: number; y: number; s?: number; lit?: boolean }> = ({ x, y, s = 1, lit }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 0 v-200 h300 v200z" fill="#d4a373" stroke={P.ink} strokeWidth={6} />
    <path d="M-30 -200 L150 -320 L330 -200z" fill="#9a8c98" stroke={P.ink} strokeWidth={6} />
    <rect x={40} y={-150} width={80} height={70} fill={lit ? P.yellow : "#495057"} stroke={P.ink} strokeWidth={4} />
    <rect x={180} y={-110} width={70} height={110} fill="#6f4518" />
  </g>
);

// ------------------------------------------------------------------ scenes
const Modem: React.FC = () => {
  const { frame, st } = useA();
  const pct = Math.min(100, Math.round(st * 9));
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#1b1b2f" />
      <rect y={760} width={W} height={320} fill="#6b4f3a" />
      <g transform="translate(760 300)">
        <rect x={-300} y={-220} width={600} height={460} rx={30} fill="#d6ccc2" stroke={P.ink} strokeWidth={8} />
        <rect x={-250} y={-180} width={500} height={360} rx={20} fill="#0b3d2e" />
        <text x={-220} y={-120} fontFamily="monospace" fontSize={30} fill="#80ed99">Connecting... {pct}%</text>
        <rect x={-220} y={-90} width={440} height={30} fill="none" stroke="#80ed99" strokeWidth={4} />
        <rect x={-216} y={-86} width={4.32 * pct} height={22} fill="#80ed99" />
        <text x={-220} y={0} fontFamily="monospace" fontSize={26} fill="#80ed99" opacity={frame % 30 < 15 ? 1 : 0.3}>ATDT 01711-XXXXXX _</text>
        <rect x={-120} y={240} width={240} height={60} fill="#bcb8b1" stroke={P.ink} strokeWidth={6} />
      </g>
      <g transform="translate(1320 640)">
        <rect x={-200} y={-50} width={400} height={100} rx={18} fill="#e5e5e5" stroke={P.ink} strokeWidth={6} />
        {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={-140 + i * 56} cy={0} r={12} fill={(frame + i * 5) % 20 < 10 ? "#38b000" : "#2b2d42"} />)}
      </g>
      <Cassette x={1500} y={340} s={0.55} />
    </svg>
  );
};

const RoofCall: React.FC = () => {
  const { frame, line } = useA();
  return (
    <svg width={W} height={H}>
      <Sky top="#03045e" bottom="#3a0ca3" />
      <Stars />
      <Skyline y={780} night seed="sn1" />
      <rect y={860} width={W} height={220} fill="#5c677d" stroke={P.ink} strokeWidth={6} />
      <Person kind="rafi" x={760} y={960} s={1.15} pose="wave" mood={line ? "sing" : "sad"} />
      <PhoneUI x={1300} y={460} s={0.9} bars={frame % 40 < 4 ? 1 : 0} rot={Math.sin(frame / 10) * 4}>
        <text x={0} y={20} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={34} fill="#fff">Calling…</text>
        <circle cx={0} cy={110} r={34} fill={C.mag} />
      </PhoneUI>
      {[0, 1, 2].map((i) => <path key={i} d={`M${1450 + i * 30} ${300 - i * 30} q40 40 0 80`} stroke={C.neon} strokeWidth={6} fill="none" opacity={((frame / 6 + i) % 3) / 3} />)}
    </svg>
  );
};

const TitleCard: React.FC = () => {
  const { frame, st, beat } = useA();
  const glitch = frame % 23 < 3;
  const bars = ["#c0c0c0", "#c0c000", "#00c0c0", "#00c000", "#c000c0", "#c00000", "#0000c0"];
  return (
    <svg width={W} height={H}>
      {bars.map((c, i) => <rect key={i} x={(i * W) / 7} y={0} width={W / 7 + 1} height={H * 0.7} fill={c} opacity={0.85} />)}
      <rect y={H * 0.7} width={W} height={H * 0.3} fill="#111" />
      {Array.from({ length: 40 }, (_, i) => <rect key={i} x={0} y={(i * 27 + frame * 7) % H} width={W} height={3} fill="#000" opacity={0.25} />)}
      <g transform={`translate(${W / 2 + (glitch ? 18 : 0)} ${H * 0.42}) scale(${interpolate(st, [0, 0.4], [2.5, 1], clamp) * (1 + beat * 0.04)})`}>
        <rect x={-640} y={-170} width={1280} height={300} rx={24} fill={C.ink} opacity={0.88} />
        <text x={-8} y={60} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={210} fill={C.mag} opacity={0.8}>Signal নাই</text>
        <text x={8} y={52} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={210} fill={C.neon} opacity={0.8}>Signal নাই</text>
        <text x={0} y={56} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={210} fill="#fff">Signal নাই</text>
      </g>
      <text x={W / 2} y={H * 0.86} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={46} letterSpacing={14} fill="#fff">RAPAR RUBEL</text>
    </svg>
  );
};

const Metro: React.FC = () => {
  const { frame } = useA();
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#caf0f8" />
      <rect x={0} y={120} width={W} height={360} fill="#0077b6" />
      {Array.from({ length: 5 }, (_, i) => <rect key={i} x={80 + i * 380} y={160} width={300} height={260} rx={30} fill="#90e0ef" />)}
      {Array.from({ length: 5 }, (_, i) => <g key={i} transform={`translate(${-((frame * 14 + i * 380) % (W + 400)) + W} 0)`}><rect x={0} y={200} width={120} height={180} fill="#48cae4" opacity={0.6} /></g>)}
      <rect y={820} width={W} height={260} fill="#adb5bd" />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={160 + i * 320} y1={0} x2={160 + i * 320} y2={120} stroke="#6c757d" strokeWidth={10} />)}
      {[[260, "f1"], [560, "f2"], [1360, "tutul"], [1660, "driver"]].map(([x, k], i) => (
        <g key={i}>
          <Person kind={k as Kind} x={x as number} y={980} s={0.85} pose="tea" mood="sad" seed={i} />
          <rect x={(x as number) + 70} y={680} width={50} height={80} rx={8} fill="#000" />
          <rect x={(x as number) + 74} y={684} width={42} height={70} fill={C.neon} opacity={0.7 + Math.sin(frame / 5 + i) * 0.3} />
        </g>
      ))}
      <Person kind="rafi" x={960} y={990} s={0.95} pose="phone" mood="sad" />
      <Notif x={420} y={560} text="১২৫ টা নতুন মেসেজ" delay={0.3} />
      <Notif x={1500} y={540} text="৯৯+ লাইক" c={C.mag} delay={0.9} />
      <Notif x={960} y={300 + 300} text="Online: ৫০০ জন" delay={1.6} />
    </svg>
  );
};

const LookUp: React.FC = () => {
  const { st, frame } = useA();
  return (
    <svg width={W} height={H}>
      <Sky top="#ff9e00" bottom="#ffd6a5" />
      <circle cx={W / 2} cy={520} r={180} fill="#ff6d00" opacity={0.85} />
      <Skyline y={760} seed="sn2" />
      <rect y={760} width={W} height={320} fill="#6c757d" />
      <Person kind="rafi" x={W / 2 - 200} y={1000} s={1.05} pose={st > 2 ? "idle" : "phone"} mood={st > 2 ? "wow" : "sad"} />
      <PhoneUI x={W / 2 + 280} y={560} s={0.75} bars={0}>
        <text x={0} y={30} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={42} fill={C.mag}>Signal নাই</text>
      </PhoneUI>
      <Kite x={400} y={240} c={P.pink} seed={1} />
      {st > 2 && Array.from({ length: 12 }, (_, i) => <circle key={i} cx={W / 2 - 200 + Math.cos(i + frame / 20) * (200 + st * 30)} cy={500 + Math.sin(i + frame / 20) * 120} r={8} fill="#fff" opacity={0.6} />)}
    </svg>
  );
};

const PhoneShop: React.FC = () => {
  const { cue, frame, st } = useA();
  const missed = cue === "missed" || cue === "home";
  return (
    <svg width={W} height={H}>
      <Sky top="#ffd166" bottom="#f8961e" />
      <rect y={780} width={W} height={300} fill="#a68a64" />
      <g transform="translate(220 780)">
        <rect x={0} y={-520} width={640} height={520} fill="#e9c46a" stroke={P.ink} strokeWidth={6} />
        <rect x={-20} y={-600} width={680} height={90} fill="#e63946" stroke={P.ink} strokeWidth={6} />
        <text x={320} y={-540} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={56} fill="#fff">ফোন • ফ্যাক্স • ফটোকপি</text>
        <rect x={60} y={-430} width={200} height={260} fill="#264653" stroke={P.ink} strokeWidth={6} />
        <rect x={90} y={-400} width={140} height={60} fill="#b5e48c" />
        <text x={160} y={-360} textAnchor="middle" fontFamily={EN} fontWeight={700} fontSize={22} fill={P.ink}>৳ ২/মিনিট</text>
        <path d="M110 -310 q50 -50 100 0" stroke={P.ink} strokeWidth={14} fill="none" />
        <text x={460} y={-300} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={44} fill={C.ink2}>এখানে</text>
        <text x={460} y={-240} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={44} fill={C.ink2}>মোবাইলে</text>
        <text x={460} y={-180} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={44} fill={C.ink2}>কথা বলা যায়</text>
      </g>
      <Person kind="teen" x={1000} y={1000} s={1.0} pose={missed ? "phone" : "point"} mood="sing" />
      {!missed && Array.from({ length: 5 }, (_, i) => <g key={i} transform={`translate(${1150 + i * 40} ${700 - ((frame * 4 + i * 30) % 200)})`}><circle r={18} fill="#ffd60a" stroke={P.ink} strokeWidth={4} /><text y={7} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={18}>৳</text></g>)}
      <Nokia x={1450} y={520} s={1.1} glow={missed} />
      {missed && <House x={1500} y={980} s={0.7} lit={frame % 20 < 12} />}
      {missed && <path d={`M1450 680 Q1500 ${780 + Math.sin(st * 4) * 20} 1600 830`} stroke={P.yellow} strokeWidth={6} strokeDasharray="12 10" fill="none" />}
    </svg>
  );
};

const CdRoom: React.FC = () => {
  const { frame, cue, st } = useA();
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#e9d8a6" />
      <g transform="translate(1280 140)"><rect width={480} height={380} fill={st > 5 ? "#e76f51" : "#ffd166"} stroke={P.ink} strokeWidth={10} /><line x1={240} y1={0} x2={240} y2={380} stroke={P.ink} strokeWidth={8} /><line x1={0} y1={190} x2={480} y2={190} stroke={P.ink} strokeWidth={8} /></g>
      <rect y={760} width={W} height={320} fill="#9c6644" />
      <rect x={160} y={620} width={900} height={60} fill="#7f5539" stroke={P.ink} strokeWidth={6} />
      {/* CD with name in blue ink */}
      <g transform={`translate(420 470) rotate(${cue === "album" ? frame * 6 : 0})`}>
        <circle r={150} fill="#dee2e6" stroke={P.ink} strokeWidth={6} />
        <circle r={150} fill="url(#cdShine)" opacity={0.6} />
        <circle r={30} fill={P.white} stroke={P.ink} strokeWidth={4} />
        <text x={0} y={-70} textAnchor="middle" fontFamily={BN} fontWeight={700} fontSize={36} fill="#1d4ed8" transform="rotate(-10)">রাফির গান</text>
      </g>
      <defs><linearGradient id="cdShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f72585" /><stop offset="0.5" stopColor="#4cc9f0" /><stop offset="1" stopColor="#b5e48c" /></linearGradient></defs>
      <g transform="translate(800 560)"><rect x={-130} y={-60} width={260} height={120} rx={20} fill="#495057" stroke={P.ink} strokeWidth={6} /><circle cx={-70} cy={0} r={34} fill="#212529" /><circle cx={70} cy={0} r={34} fill="#212529" /></g>
      <Person kind="teen" x={1100} y={1000} s={1.0} pose={cue === "pen" ? "point" : "dance"} mood="sing" />
      {Array.from({ length: 6 }, (_, i) => <text key={i} x={760 + i * 60 + Math.sin(frame / 8 + i) * 20} y={460 - ((frame * 2 + i * 40) % 260)} fontSize={50} fill={[C.ink2, P.pink, P.green][i % 3]}>♪</text>)}
    </svg>
  );
};

const Field: React.FC = () => {
  const { frame, beat } = useA();
  const ball = (frame * 9) % 900;
  return (
    <svg width={W} height={H}>
      <Sky top="#8ecae6" bottom="#ffe8a3" />
      <g transform="translate(140 560)"><rect width={700} height={200} fill="#f1faee" stroke={P.ink} strokeWidth={6} /><path d="M-20 0 L350 -120 L720 0z" fill="#e63946" stroke={P.ink} strokeWidth={6} /><text x={350} y={120} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={50} fill={C.ink2}>উচ্চ বিদ্যালয়</text></g>
      <rect y={760} width={W} height={320} fill="#70a700" />
      <g transform="translate(1500 900)"><rect x={-30} y={-120} width={8} height={120} fill="#f1faee" /><rect x={-4} y={-120} width={8} height={120} fill="#f1faee" /><rect x={22} y={-120} width={8} height={120} fill="#f1faee" /></g>
      <Person kind="teen" x={1380} y={980} s={0.85} pose="point" mood="sing" />
      <circle cx={1300 - ball} cy={900 - Math.abs(Math.sin(ball / 140)) * 160} r={16} fill={P.red} stroke={P.ink} strokeWidth={4} />
      {[[400, "teen2"], [620, "tutul"], [860, "f1"], [1080, "teen2"]].map(([x, k], i) => <Person key={i} kind={k as Kind} x={x as number} y={1000} s={0.75} pose={beat > 0.5 && i % 2 ? "dance" : "wave"} seed={i} mood="sing" />)}
    </svg>
  );
};

const VideoGrid: React.FC = () => {
  const { frame, cue } = useA();
  const kinds: Kind[] = ["teen2", "tutul", "f1", "f2", "rafi", "driver"];
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#10002b" />
      {kinds.map((k, i) => {
        const x = 120 + (i % 3) * 580;
        const y = 70 + Math.floor(i / 3) * 440;
        return (
          <g key={i}>
            <rect x={x} y={y} width={520} height={400} rx={24} fill="#3c096c" stroke={C.neon} strokeWidth={4} />
            <svg x={x} y={y} width={520} height={400}><Person kind={k} x={260} y={540} s={0.9} pose="phone" mood="sad" seed={i} /></svg>
            <circle cx={x + 30} cy={y + 30} r={10} fill="#38b000" />
            <text x={x + 50} y={y + 40} fontFamily={EN} fontWeight={700} fontSize={24} fill="#fff">online</text>
          </g>
        );
      })}
      {cue === "nest" && (
        <g transform="translate(960 540)">
          <rect x={-300} y={-160} width={600} height={320} rx={30} fill={C.ink} opacity={0.9} />
          <path d="M0 -120 L-40 120 M0 -120 L40 120 M-30 0 h60" stroke="#adb5bd" strokeWidth={10} />
          <ellipse cx={0} cy={-120} rx={70} ry={24} fill="#7f5539" stroke={P.ink} strokeWidth={4} />
          <text y={140} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={40} fill={C.mag} opacity={frame % 20 < 12 ? 1 : 0.4}>নীড় খালি</text>
        </g>
      )}
    </svg>
  );
};

const Album: React.FC = () => {
  const { cue, frame } = useA();
  const now = cue === "sharp" || cue === "sad";
  return (
    <svg width={W} height={H}>
      <rect width={W / 2} height={H} fill="#e9d8a6" />
      <rect x={W / 2} width={W / 2} height={H} fill="#0b0c1e" />
      <text x={W / 4} y={80} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={50} fill={C.ink2}>তখন</text>
      <text x={(W * 3) / 4} y={80} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={50} fill={C.neon}>এখন</text>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${260 + i * 230} ${380 + (i % 2) * 120}) rotate(${(i - 1) * 8})`}>
          <rect x={-110} y={-130} width={220} height={260} fill="#fff" stroke={P.ink} strokeWidth={4} />
          <rect x={-95} y={-115} width={190} height={190} fill="#f4a261" style={{ filter: "blur(3px)" }} />
          <svg x={-95} y={-115} width={190} height={190}><Person kind={(["teen", "teen2", "tutul"] as Kind[])[i]} x={95} y={300} s={0.55} pose="wave" mood="sing" seed={i} /></svg>
        </g>
      ))}
      <g transform={`translate(${(W * 3) / 4} 540)`}>
        <rect x={-260} y={-420} width={520} height={860} rx={50} fill="#212529" stroke="#adb5bd" strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${-115 + (i % 2) * 230} ${-230 + Math.floor(i / 2) * 330})`}>
            <rect x={-105} y={-150} width={210} height={300} rx={10} fill="#4cc9f0" />
            <svg x={-105} y={-150} width={210} height={300}><Person kind={(["rafi", "f1", "f2", "tutul"] as Kind[])[i]} x={105} y={420} s={0.6} pose="phone" mood={now ? "sad" : "smile"} seed={i} /></svg>
            {now && <text x={0} y={130} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={24} fill="#fff">4K • HDR</text>}
          </g>
        ))}
      </g>
      <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke={C.amber} strokeWidth={10} />
      {Array.from({ length: 4 }, (_, i) => <circle key={i} cx={W / 2} cy={((frame * 6 + i * 270) % H)} r={10} fill={C.amber} />)}
    </svg>
  );
};

const Globe: React.FC = () => {
  const { st, frame, cue } = useA();
  const d = interpolate(st, [0, 3], [200, 760], clamp);
  return (
    <svg width={W} height={H}>
      <Sky top="#ffafcc" bottom="#ffd6a5" />
      <circle cx={W / 2} cy={420} r={interpolate(st, [0, 2.5], [260, 90], clamp)} fill="#48cae4" stroke={P.ink} strokeWidth={6} />
      <path d={`M${W / 2 - 60} 400 q30 -50 70 -20 q40 40 -20 70z`} fill="#70a700" transform={`rotate(${frame} ${W / 2} 420)`} />
      <rect y={800} width={W} height={280} fill="#80b918" />
      <Person kind="rafi" x={W / 2 - d} y={1000} s={0.95} pose="wave" mood="sad" />
      <Person kind="tutul" x={W / 2 + d} y={1000} s={0.95} pose="wave" mood="sad" flip />
      <line x1={W / 2 - d + 120} y1={760} x2={W / 2 + d - 120} y2={760} stroke={P.ink} strokeWidth={4} strokeDasharray="16 12" />
      <text x={W / 2} y={740} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={40} fill={P.ink}>{Math.round(d * 12)} কিমি</text>
      {cue === "afternoon" && <circle cx={W / 2} cy={620} r={110} fill="#ff8500" opacity={0.85} />}
    </svg>
  );
};

const Antenna: React.FC = () => {
  const { frame, st, beat } = useA();
  const pct = Math.min(100, Math.round(st * 9));
  return (
    <svg width={W} height={H}>
      <Rays cx={W / 2} cy={380} colors={[C.vio, C.mag, C.vio, "#4361ee"]} speed={0.6} />
      <Skyline y={760} seed="sn3" tint="#3a0ca3" />
      <rect y={820} width={W} height={260} fill="#4a4e69" stroke={P.ink} strokeWidth={6} />
      <g transform={`translate(1660 820) rotate(${Math.sin(frame / 15) * 4})`}><rect x={-6} y={-460} width={12} height={460} fill="#adb5bd" />{[0, 1, 2, 3].map((i) => <rect key={i} x={-120 + i * 10} y={-440 + i * 50} width={240 - i * 20} height={10} fill="#adb5bd" />)}</g>
      <Person kind="rafi" x={760} y={1000} s={0.95} pose="dance" mood="sing" />
      <Person kind="tutul" x={1040} y={1000} s={0.9} pose="dance" seed={1} mood="sing" />
      <Person kind="teen2" x={480} y={1000} s={0.9} pose="dance" seed={2} mood="sing" />
      <g transform={`translate(${W / 2} 560) scale(${1 + beat * 0.04})`}>
        <rect x={-420} y={-50} width={840} height={100} rx={50} fill={C.ink} stroke={C.neon} strokeWidth={6} />
        <rect x={-410} y={-40} width={8.2 * pct} height={80} rx={40} fill={C.neon} />
        <text x={0} y={18} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={44} fill="#fff" stroke={C.ink} strokeWidth={4} paintOrder="stroke">একটা বিকেল ডাউনলোড হচ্ছে… {pct}%</text>
      </g>
    </svg>
  );
};

const Offline: React.FC = () => {
  const { st, frame } = useA();
  const drop = interpolate(st, [0.3, 1.4], [0, 1], clamp);
  return (
    <svg width={W} height={H}>
      <Sky top="#ff9e00" bottom="#ff477e" />
      <Skyline y={780} seed="sn4" />
      <rect y={780} width={W} height={300} fill="#6c757d" />
      <g transform={`translate(${380} ${300 + drop * 480}) rotate(${drop * 540})`}><PhoneUI x={0} y={0} s={0.5} bars={0} /></g>
      <g transform="translate(380 900)"><path d="M-130 -90 h260 l-30 170 h-200z" fill="#bc6c25" stroke={P.ink} strokeWidth={6} /><text y={20} textAnchor="middle" fontFamily={EN} fontWeight={900} fontSize={40} fill="#fff">OFFLINE</text></g>
      {[0, 1, 2, 3].map((i) => <Person key={i} kind={(["rafi", "tutul", "teen2", "f1"] as Kind[])[i]} x={820 + i * 270} y={1000} s={0.9} pose="dance" seed={i} mood="sing" />)}
      {Array.from({ length: 20 }, (_, i) => <rect key={i} x={(random(`of${i}`) * W + frame * 3) % W} y={(frame * (3 + (i % 3)) + random(`oy${i}`) * 600) % 700} width={14} height={22} fill={[C.neon, C.mag, P.yellow][i % 3]} />)}
    </svg>
  );
};

const Pixel: React.FC = () => {
  const { frame, line, beat } = useA();
  const px = 24;
  const x = 300 + ((frame * 6) % 1200);
  const jump = Math.abs(Math.sin(frame / 9)) * 160;
  const freeze = line?.text === "নাই!";
  return (
    <svg width={W} height={H} shapeRendering="crispEdges">
      <rect width={W} height={H} fill={freeze ? "#000" : "#5c94fc"} />
      {!freeze && Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 200} y={760 - (i % 3) * 120 - 120} width={160} height={(i % 3) * 120 + 120} fill={["#fcbcb0", "#f8d878", "#b8f818"][i % 3]} stroke="#000" strokeWidth={6} />)}
      {!freeze && <rect y={760} width={W} height={320} fill="#c84c0c" />}
      {!freeze && Array.from({ length: 40 }, (_, i) => <rect key={i} x={i * 48} y={760} width={46} height={46} fill="#e09050" stroke="#000" strokeWidth={3} />)}
      {!freeze && [0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${((i * 480 + 1500 - frame * 6) % 1920 + 1920) % 1920} 420)`}>{[0, 1, 2, 3].map((b) => <rect key={b} x={b * 30} y={60 - b * 20} width={22} height={20 + b * 20} fill="#fff" stroke="#000" strokeWidth={4} />)}</g>)}
      {/* pixel Rafi */}
      <g transform={`translate(${freeze ? W / 2 - 60 : x} ${760 - 7 * px - (freeze ? 0 : jump)})`}>
        {["..hhh..", ".hhhhh.", ".sssss.", "bbbbbbb", ".bbbbb.", ".pp.pp.", ".pp.pp."].map((row, r) =>
          row.split("").map((c, k) => (c === "." ? null : <rect key={`${r}${k}`} x={k * px} y={r * px} width={px} height={px} fill={{ h: "#111", s: "#c68642", b: "#3a86ff", p: "#22223b" }[c]} />))
        )}
      </g>
      <text x={60} y={90} fontFamily="monospace" fontWeight={900} fontSize={54} fill="#fff">SIGNAL x {Math.floor(frame / 8) % 100}</text>
      {freeze && <text x={W / 2} y={460} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={120 + beat * 20} fill={C.mag}>NO SIGNAL</text>}
    </svg>
  );
};

/** আগে vs এখন split-screen; content driven by the current cue. */
const VS: React.FC = () => {
  const { cue, frame } = useA();
  const left = (
    <g>
      <rect width={W / 2} height={H} fill="#f4e1c1" />
      <text x={W / 4} y={110} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={80} fill={C.ink2}>আগে</text>
      {(cue === "ringtone" || cue === "scroll") && <Nokia x={W / 4} y={560} s={1.3} glow={frame % 20 < 10} />}
      {(cue === "game" || cue === "missed") && <><Person kind="teen" x={W / 4 - 140} y={960} s={0.8} pose="dance" mood="sing" /><Person kind="teen2" x={W / 4 + 140} y={960} s={0.8} pose="wave" seed={2} mood="sing" /><circle cx={W / 4} cy={600 - Math.abs(Math.sin(frame / 8)) * 200} r={30} fill={P.white} stroke={P.ink} strokeWidth={5} /></>}
      {(cue === "pendrive" || cue === "cloud") && <g transform={`translate(${W / 4} 560)`}><rect x={-80} y={-200} width={160} height={300} rx={24} fill="#e63946" stroke={P.ink} strokeWidth={6} /><rect x={-50} y={-280} width={100} height={90} fill="#adb5bd" stroke={P.ink} strokeWidth={6} /><text y={0} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={40} fill="#fff">2GB</text></g>}
      {(cue === "smile" || cue === "emoji") && <><Person kind="teen" x={W / 4 - 150} y={960} s={0.8} pose="wave" mood="sing" /><Person kind="tutul" x={W / 4 + 150} y={960} s={0.8} pose="wave" seed={1} mood="sing" flip /></>}
    </g>
  );
  const right = (
    <g transform={`translate(${W / 2} 0)`}>
      <rect width={W / 2} height={H} fill="#0b0c1e" />
      <text x={W / 4} y={110} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={80} fill={C.neon}>এখন</text>
      {(cue === "ringtone" || cue === "scroll") && <PhoneUI x={W / 4} y={580} s={1.2} bars={4}>{Array.from({ length: 6 }, (_, i) => <rect key={i} x={-90} y={-160 + ((i * 70 - frame * 8) % 420 + 420) % 420} width={180} height={56} rx={8} fill={[C.neon, C.mag, "#4361ee"][i % 3]} opacity={0.8} />)}</PhoneUI>}
      {(cue === "game" || cue === "missed") && <PhoneUI x={W / 4} y={580} s={1.2} bars={4}><text y={-40} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={40} fill={C.mag}>মিসড কল (১২)</text>{[0, 1, 2].map((i) => <rect key={i} x={-90} y={i * 60} width={180} height={44} rx={8} fill="#495057" />)}</PhoneUI>}
      {(cue === "pendrive" || cue === "cloud") && <g transform={`translate(${W / 4} 500)`}><path d="M-200 60 a90 90 0 0 1 40 -170 a120 120 0 0 1 230 -20 a90 90 0 0 1 130 190z" fill="#4cc9f0" stroke="#fff" strokeWidth={6} /><text y={30} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={44} fill="#fff">∞ TB</text></g>}
      {(cue === "smile" || cue === "emoji") && <g transform={`translate(${W / 4} 540) scale(${1 + Math.sin(frame / 5) * 0.05})`}><circle r={190} fill={P.yellow} stroke={P.ink} strokeWidth={8} /><circle cx={-60} cy={-40} r={20} fill={P.ink} /><circle cx={60} cy={-40} r={20} fill={P.ink} /><path d="M-90 50 q90 90 180 0" stroke={P.ink} strokeWidth={12} fill="none" /></g>}
    </g>
  );
  return (
    <svg width={W} height={H}>
      {left}
      {right}
      <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke={C.amber} strokeWidth={14} />
    </svg>
  );
};

const ZoomAdda: React.FC = () => {
  const { cue, st } = useA();
  const zoom = cue === "zoom" || cue === "tea";
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#1d3557" />
      {!zoom && (
        <PhoneUI x={W / 2} y={560} s={1.9} bars={4}>
          <rect x={-90} y={-150} width={150} height={44} rx={16} fill="#adb5bd" /><text x={-80} y={-120} fontFamily={BN} fontWeight={700} fontSize={22} fill={P.ink}>ব্যস্ত আছি</text>
          {st > 1 && <><rect x={-10} y={-90} width={100} height={44} rx={16} fill={C.neon} /><text x={10} y={-60} fontFamily={BN} fontWeight={700} fontSize={22} fill={P.ink}>হুম</text></>}
        </PhoneUI>
      )}
      {zoom && Array.from({ length: 6 }, (_, i) => {
        const x = 120 + (i % 3) * 580;
        const y = 70 + Math.floor(i / 3) * 440;
        return (
          <g key={i}>
            <rect x={x} y={y} width={520} height={400} rx={20} fill="#457b9d" stroke="#fff" strokeWidth={4} />
            <svg x={x} y={y} width={520} height={400}><Person kind={(["rafi", "tutul", "teen2", "f1", "f2", "driver"] as Kind[])[i]} x={260} y={560} s={0.9} pose="tea" mood="smile" seed={i} /></svg>
            <text x={x + 20} y={y + 380} fontFamily={EN} fontWeight={700} fontSize={22} fill="#fff">🔇 muted</text>
          </g>
        );
      })}
      {zoom && <text x={W / 2} y={H / 2 + 20} textAnchor="middle" fontFamily={EN} fontWeight={900} fontSize={70} fill="#fff" stroke={P.ink} strokeWidth={6} paintOrder="stroke">ZOOM ☕ ADDA</text>}
    </svg>
  );
};

const Contacts: React.FC = () => {
  const { frame, cue, st } = useA();
  const cal = cue === "later" || cue === "tomorrow";
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#22223b" />
      <PhoneUI x={620} y={560} s={2} bars={4}>
        <svg x={-100} y={-170} width={200} height={360}>
          {Array.from({ length: 40 }, (_, i) => <g key={i} transform={`translate(0 ${i * 40 - ((frame * 9) % 1200)})`}><circle cx={18} cy={18} r={14} fill={["#4cc9f0", "#f72585", "#b5e48c"][i % 3]} /><rect x={40} y={10} width={140} height={14} rx={6} fill="#adb5bd" /></g>)}
        </svg>
      </PhoneUI>
      <Person kind="rafi" x={1300} y={1000} s={1.0} pose="shrug" mood="sad" />
      {cal && (
        <g transform="translate(1500 320)">
          <rect x={-180} y={-160} width={360} height={320} fill="#fff" stroke={P.ink} strokeWidth={8} />
          <rect x={-180} y={-160} width={360} height={80} fill={P.red} />
          <text y={70} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={110} fill={P.ink}>{st % 1 < 0.5 ? "পরে" : "কাল"}</text>
        </g>
      )}
    </svg>
  );
};

const RainWindow: React.FC = () => {
  const { frame, cue } = useA();
  const reply = cue === "reply";
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#3d405b" />
      <g transform="translate(1180 120)">
        <rect width={600} height={520} fill="#5f6f8c" stroke="#2b2d42" strokeWidth={14} />
        {Array.from({ length: 50 }, (_, i) => <line key={i} x1={(random(`rx${i}`) * 600)} y1={((frame * 14 + random(`ry${i}`) * 520) % 520)} x2={(random(`rx${i}`) * 600) - 6} y2={((frame * 14 + random(`ry${i}`) * 520) % 520) + 30} stroke="#cfe8ff" strokeWidth={3} opacity={0.7} />)}
        <line x1={300} y1={0} x2={300} y2={520} stroke="#2b2d42" strokeWidth={10} />
      </g>
      <rect y={760} width={W} height={320} fill="#6b4f3a" />
      <g transform="translate(560 640)">
        <rect x={-160} y={-80} width={320} height={160} rx={24} fill="#f1faee" stroke={P.ink} strokeWidth={6} />
        <path d="M-130 -80 q130 -120 260 0" stroke={P.ink} strokeWidth={22} fill="none" />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-90 + (i % 3) * 64} y={-50 + Math.floor(i / 3) * 34} width={48} height={24} rx={6} fill="#adb5bd" />)}
      </g>
      <g transform="translate(260 700) rotate(-6)"><rect x={-150} y={-90} width={300} height={180} fill={C.sepia} stroke={P.ink} strokeWidth={4} /><text y={0} textAnchor="middle" fontFamily={EN} fontWeight={700} fontSize={32} fill={C.ink2}>তুতুল: 7-24-36</text></g>
      <Person kind="rafi" x={960} y={1000} s={1.0} pose="phone" mood={reply ? "wow" : "sad"} />
      {reply && <g transform="translate(1200 820)"><rect x={-240} y={-70} width={480} height={140} rx={40} fill={C.sepia} stroke={C.ink2} strokeWidth={6} /><text y={20} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={54} fill={C.ink2}>কই ছিলি এতদিন?</text></g>}
    </svg>
  );
};

const EmptyField: React.FC = () => {
  const { frame, st } = useA();
  return (
    <svg width={W} height={H}>
      <Sky top="#6c757d" bottom="#adb5bd" />
      {Array.from({ length: 70 }, (_, i) => <line key={i} x1={random(`ex${i}`) * W} y1={(frame * 18 + random(`ey${i}`) * H) % H} x2={random(`ex${i}`) * W - 8} y2={(frame * 18 + random(`ey${i}`) * H) % H + 40} stroke="#e0fbfc" strokeWidth={3} opacity={0.6} />)}
      <rect y={760} width={W} height={320} fill="#52796f" />
      <g transform="translate(1400 760)"><path d="M-150 0 L-110 -380 L110 -380 L150 0" stroke="#495057" strokeWidth={14} fill="none" /><g transform={`rotate(${Math.sin(frame / 14) * 18} 0 -380)`}><line x1={-40} y1={-380} x2={-40} y2={-140} stroke="#495057" strokeWidth={5} /><line x1={40} y1={-380} x2={40} y2={-140} stroke="#495057" strokeWidth={5} /><rect x={-60} y={-145} width={120} height={18} fill="#7f5539" /></g></g>
      {/* ghost memories of friends */}
      {[0, 1, 2].map((i) => <g key={i} opacity={0.18 + 0.18 * Math.sin(st * 2 + i)}><Person kind={(["teen", "teen2", "tutul"] as Kind[])[i]} x={420 + i * 260} y={980} s={0.8} pose="wave" seed={i} /></g>)}
      <Person kind="rafi" x={900} y={1010} s={0.95} pose="sad" mood="sad" />
    </svg>
  );
};

const CassetteScene: React.FC = () => {
  const { frame, beat } = useA();
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#5e503f" />
      <Cassette x={W / 2} y={460} s={1.5} />
      <g transform={`translate(${W / 2 + 330} ${460}) rotate(${frame * 6})`}><rect x={-6} y={-150} width={12} height={300} fill="#ffd166" stroke={P.ink} strokeWidth={3} /></g>
      {Array.from({ length: 8 }, (_, i) => <text key={i} x={300 + i * 180 + Math.sin(frame / 10 + i) * 30} y={980 - ((frame * 2 + i * 60) % 300)} fontSize={60 + beat * 10} fill={C.sepia} opacity={0.7}>♪</text>)}
    </svg>
  );
};

const StairsCall: React.FC = () => {
  const { line, cue, st } = useA();
  const down = cue === "down" || cue === "nomore";
  const x = down ? interpolate(st, [0, 6], [700, 1500], clamp) : 700;
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#e5e5e5" />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={600 + i * 130} y={420 + i * 70} width={130} height={700} fill={i % 2 ? "#ced4da" : "#adb5bd"} stroke={P.ink} strokeWidth={4} />)}
      <rect x={120} y={200} width={300} height={500} fill="#8d6e63" stroke={P.ink} strokeWidth={8} />
      <Person kind="rafi" x={x} y={down ? 420 + ((x - 600) / 130) * 70 + 20 : 440} s={0.9} pose={down ? "dance" : "phone"} mood="sing" />
      {cue === "nomore" && <g transform="translate(270 640)"><rect x={-130} y={-50} width={260} height={100} fill="#6d4c41" stroke={P.ink} strokeWidth={6} /><PhoneUI x={0} y={-30} s={0.25} bars={0} /><text y={110} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={40} fill={P.ink}>ড্রয়ারে বন্দি</text></g>}
      {line?.who === "a" && <text x={1700} y={300} textAnchor="middle" fontSize={90}>📣</text>}
    </svg>
  );
};

const Galli: React.FC = () => {
  const { frame, beat } = useA();
  const ball = (frame * 10) % 1100;
  return (
    <svg width={W} height={H}>
      <Sky top="#ff9e00" bottom="#ffd6a5" />
      <Skyline y={700} seed="sn5" />
      <rect y={700} width={W} height={380} fill="#6c757d" />
      <g transform="translate(1600 700)"><rect x={-180} y={-260} width={360} height={260} fill="#9c6644" stroke={P.ink} strokeWidth={6} /><path d="M-220 -260 h440 l-30 -70 h-380z" fill={C.neon} stroke={P.ink} strokeWidth={6} /><text y={-280} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={40} fill={P.ink}>টং</text></g>
      <g transform="translate(260 960)"><rect x={-40} y={-140} width={14} height={140} fill="#fff" /><rect x={-10} y={-140} width={14} height={140} fill="#fff" /><rect x={20} y={-140} width={14} height={140} fill="#fff" /></g>
      <Person kind="rafi" x={400} y={1000} s={0.9} pose="point" mood="sing" />
      <circle cx={420 + ball} cy={900 - Math.abs(Math.sin(ball / 150)) * 200} r={18} fill="#e63946" stroke={P.ink} strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => <Person key={i} kind={(["tutul", "teen2", "f1", "f2"] as Kind[])[i]} x={760 + i * 230} y={1000} s={0.85} pose="dance" seed={i} mood="sing" />)}
      {Array.from({ length: 6 }, (_, i) => <Kite key={i} x={200 + i * 300} y={150 + (i % 2) * 80} c={[P.pink, P.blue, P.yellow][i % 3]} seed={i} />)}
      <circle cx={W / 2} cy={200} r={60 + beat * 6} fill="#fff3b0" opacity={0.5} />
    </svg>
  );
};

const HumanSignal: React.FC = () => {
  const { frame, beat } = useA();
  return (
    <svg width={W} height={H}>
      <Rays cx={W / 2} cy={800} colors={["#ff9e00", "#ffb703", "#ff9e00", "#fb8500"]} speed={0.4} />
      <rect y={880} width={W} height={200} fill="#4a4e69" />
      {/* four friends forming signal bars */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={620 + i * 180} y={880 - (i + 1) * 120 - beat * 20} width={120} height={(i + 1) * 120 + beat * 20} rx={14} fill={C.neon} opacity={0.35} />
          <Person kind={(["teen2", "tutul", "f1", "rafi"] as Kind[])[i]} x={680 + i * 180} y={880} s={0.45 + i * 0.13} pose="dance" seed={i} mood="sing" />
        </g>
      ))}
      <text x={W / 2} y={140} textAnchor="middle" fontFamily={EN} fontWeight={900} fontSize={70} fill="#fff" stroke={P.ink} strokeWidth={6} paintOrder="stroke">FULL SIGNAL = বন্ধু</text>
      {Array.from({ length: 30 }, (_, i) => <rect key={i} x={(random(`hs${i}`) * W + Math.sin(frame / 10 + i) * 40) % W} y={(frame * (3 + (i % 4)) + random(`hy${i}`) * H) % H} width={14} height={22} fill={[C.neon, C.mag, P.yellow, "#fff"][i % 4]} />)}
    </svg>
  );
};

const TeaOutro: React.FC = () => {
  const { line } = useA();
  return (
    <svg width={W} height={H}>
      <Sky top="#3a0ca3" bottom="#f77f00" />
      <Stars />
      <Skyline y={720} night seed="sn6" />
      <rect y={720} width={W} height={360} fill="#5c4033" />
      <rect x={300} y={860} width={1300} height={34} fill="#7f5539" stroke={P.ink} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => <Person key={i} kind={(["rafi", "tutul", "teen2", "f1"] as Kind[])[i]} x={480 + i * 320} y={1000} s={0.85} pose="tea" seed={i} mood={line && i === 0 ? "sing" : "smile"} />)}
      <g transform="translate(1720 700)"><rect x={-60} y={-90} width={120} height={90} fill="#adb5bd" stroke={P.ink} strokeWidth={5} /><text y={-30} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={22}>📵</text></g>
    </svg>
  );
};

const EndCard: React.FC<{ credits: SNProps["credits"] }> = ({ credits }) => {
  const { st, fps, frame } = useA();
  const s = spring({ frame: Math.round(st * fps), fps, config: { damping: 14 } });
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill={C.ink} />
      {Array.from({ length: 40 }, (_, i) => <rect key={i} x={0} y={(i * 27 + frame * 3) % H} width={W} height={2} fill="#fff" opacity={0.04} />)}
      <g transform={`translate(${W / 2} ${H / 2}) scale(${s})`}>
        {[0, 1, 2, 3].map((i) => <rect key={i} x={-120 + i * 64} y={-300 - i * 40} width={44} height={60 + i * 40} rx={8} fill={C.neon} />)}
        <text y={-110} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={150} fill="#fff">Signal নাই</text>
        <text y={-30} textAnchor="middle" fontFamily={BN} fontWeight={700} fontSize={40} fill={C.amber}>না রে... মানুষ পাইছি।</text>
        {credits.map((c, i) => (
          <g key={i} opacity={interpolate(st, [0.6 + i * 0.4, 1 + i * 0.4], [0, 1], clamp)}>
            <text y={70 + i * 110} textAnchor="middle" fontFamily={EN} fontWeight={600} fontSize={30} letterSpacing={8} fill={C.mag}>{c.role.toUpperCase()}</text>
            <text y={125 + i * 110} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={54} fill="#fff">{c.name}</text>
          </g>
        ))}
      </g>
    </svg>
  );
};

// ------------------------------------------------------------------ captions (Bangla CC)
const NowCaption: React.FC<{ l: BDLine }> = ({ l }) => {
  const { t, fps } = useA();
  const inS = spring({ frame: Math.round((t - l.start + 0.12) * fps), fps, config: { damping: 15, stiffness: 200 } });
  const out = interpolate(t, [l.end, l.end + 0.2], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 44 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, background: "rgba(11,12,30,0.86)", border: `3px solid ${C.neon}`, borderRadius: 30, padding: "16px 44px 20px 22px",
        boxShadow: `0 0 30px rgba(0,245,212,0.35)`, transform: `translateY(${(1 - inS) * 120 + out * 120}px)`, opacity: 1 - out, maxWidth: 1640 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg, ${C.neon}, ${C.mag})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, color: "#fff", flexShrink: 0 }}>♪</div>
        <Words l={l} on="#ffffff" off="rgba(255,255,255,0.35)" size={70} glow={C.neon} />
      </div>
    </AbsoluteFill>
  );
};

const ThenCaption: React.FC<{ l: BDLine }> = ({ l }) => {
  const { t, fps, frame } = useA();
  const inS = spring({ frame: Math.round((t - l.start + 0.12) * fps), fps, config: { damping: 15, stiffness: 180 } });
  const out = interpolate(t, [l.end, l.end + 0.2], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 46 }}>
      <div style={{ background: C.sepia, padding: "14px 60px 22px", maxWidth: 1600, transform: `rotate(${-1 + Math.sin(frame / 40) * 0.6}deg) translateY(${(1 - inS) * 120 + out * 120}px)`, opacity: 1 - out,
        boxShadow: "8px 10px 0 rgba(0,0,0,0.35)", backgroundImage: "repeating-linear-gradient(0deg, transparent 0 46px, rgba(30,58,138,0.18) 46px 48px)",
        clipPath: "polygon(0 4%, 6% 0, 20% 3%, 40% 0, 60% 4%, 80% 0, 100% 3%, 99% 96%, 85% 100%, 65% 96%, 45% 100%, 25% 96%, 5% 100%, 1% 95%)" }}>
        <Words l={l} on={C.ink2} off="rgba(30,58,138,0.28)" size={70} />
      </div>
    </AbsoluteFill>
  );
};

const BigCaption: React.FC<{ l: BDLine }> = ({ l }) => {
  const { t, fps, beat } = useA();
  const out = interpolate(t, [l.end, l.end + 0.2], [0, 1], clamp);
  const ws = wordTimes(l);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 40 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 30px", maxWidth: 1760, opacity: 1 - out, transform: `scale(${1 + beat * 0.03})` }}>
        {ws.map(({ w, at }, k) => {
          const f = Math.round((t - at) * fps);
          const s = spring({ frame: f, fps, config: { damping: 9, stiffness: 210, mass: 0.6 } });
          return (
            <span key={k} style={{ display: "inline-block", fontFamily: BN, fontWeight: 800, fontSize: 140, lineHeight: 1.15, opacity: f < 0 ? 0 : 1,
              backgroundImage: `linear-gradient(180deg, #ffffff 0%, ${C.neon} 45%, ${C.mag} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              WebkitTextStroke: "3px #0b0c1e", filter: `drop-shadow(0 0 18px ${C.mag}) drop-shadow(6px 6px 0 #0b0c1e)`,
              transform: `translateY(${(1 - s) * -90}px) scale(${0.6 + 0.4 * s}) skewX(${(1 - s) * -12}deg)` }}>
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Words: React.FC<{ l: BDLine; on: string; off: string; size: number; glow?: string }> = ({ l, on, off, size, glow }) => {
  const { t, fps } = useA();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 20px" }}>
      {wordTimes(l).map(({ w, at }, k) => {
        const lit = t >= at;
        const s = spring({ frame: Math.round((t - at) * fps), fps, config: { damping: 11, stiffness: 220, mass: 0.5 } });
        return (
          <span key={k} style={{ display: "inline-block", fontFamily: BN, fontWeight: 800, fontSize: size, lineHeight: 1.2, color: lit ? on : off,
            textShadow: lit && glow ? `0 0 16px ${glow}` : "none", transform: lit ? `translateY(${(1 - s) * -14}px)` : undefined }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

const CallCaption: React.FC<{ l: BDLine }> = ({ l }) => {
  const { t, fps } = useA();
  const s = spring({ frame: Math.round((t - l.start + 0.1) * fps), fps, config: { damping: 12, stiffness: 200 } });
  const left = l.who === "q";
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: left ? "flex-start" : "flex-end", padding: "120px 160px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, background: left ? "#ffffff" : C.neon, color: C.ink, borderRadius: 40, padding: "18px 44px",
        fontFamily: BN, fontWeight: 800, fontSize: 68, transform: `scale(${s})`, transformOrigin: left ? "left top" : "right top", boxShadow: "0 12px 30px rgba(0,0,0,0.4)" }}>
        <span style={{ fontSize: 46 }}>📞</span>{l.text}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ era looks + transitions
const Grain: React.FC = () => {
  const { frame } = useA();
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: 160 }, (_, i) => <rect key={i} x={random(`g${i}${frame % 6}`) * W} y={random(`gy${i}${frame % 6}`) * H} width={2} height={2} fill="#000" opacity={0.25} />)}
      {frame % 11 === 0 && <rect x={random(`sc${frame}`) * W} y={0} width={2} height={H} fill="#fff" opacity={0.2} />}
    </svg>
  );
};

const Transition: React.FC<{ scenes: SNProps["scenes"] }> = ({ scenes }) => {
  const { t, frame } = useA();
  for (let i = 1; i < scenes.length; i++) {
    const b = scenes[i][1];
    if (Math.abs(t - b) > 0.25) continue;
    const p = (t - b + 0.25) / 0.5;
    const from = ERA[scenes[i - 1][0]] ?? "now";
    const to = ERA[scenes[i][0]] ?? "now";
    if (to === "then" && from !== "then") {
      // VHS rewind into memory
      return (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <svg width={W} height={H}>
            {Array.from({ length: 14 }, (_, k) => <rect key={k} x={0} y={(random(`vr${k}${frame}`) * H)} width={W} height={10 + random(`vh${k}${frame}`) * 40} fill="#fff" opacity={0.25 * Math.sin(p * Math.PI)} />)}
            <text x={80} y={120} fontFamily="monospace" fontWeight={900} fontSize={80} fill="#fff" opacity={Math.sin(p * Math.PI)}>◀◀ REW</text>
          </svg>
          <AbsoluteFill style={{ background: "#f4e1c1", opacity: Math.sin(p * Math.PI) * 0.5, mixBlendMode: "multiply" }} />
        </AbsoluteFill>
      );
    }
    // glitch / no-signal cut
    const k = Math.sin(p * Math.PI);
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <svg width={W} height={H}>
          {Array.from({ length: 9 }, (_, j) => <rect key={j} x={random(`gx${j}${frame}`) * W * 0.6} y={random(`gy${j}${frame}`) * H} width={300 + random(`gw${j}${frame}`) * 900} height={20 + random(`gh${j}${frame}`) * 60} fill={[C.neon, C.mag, "#fff"][j % 3]} opacity={0.55 * k} />)}
          {to !== "then" && from === "then" && <text x={W / 2} y={H / 2} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={110} fill="#fff" opacity={k}>NO SIGNAL</text>}
        </svg>
      </AbsoluteFill>
    );
  }
  return null;
};

// ------------------------------------------------------------------ composition
export const SignalNai: React.FC<SNProps> = (p) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const i = Math.min(frame, p.bass.length - 1);
  let bi = -1;
  for (let k = 0; k < p.beats.length && p.beats[k] <= t; k++) bi = k;
  const beat = bi >= 0 ? Math.exp(-(t - p.beats[bi]) * 9) : 0;
  const sc = p.scenes.find(([, s, e]) => t >= s && t < e) ?? p.scenes[p.scenes.length - 1];
  const [scene, s0] = sc;
  let line: BDLine | undefined;
  for (const l of p.lines) if (t >= l.start && t < l.end) line = l;
  if (!line) for (const l of p.lines) if (t >= l.start - 0.1 && t <= l.end + 0.2) line = l;
  let cue: string | undefined;
  for (const l of p.lines) if (l.start <= t + 0.05 && l.start >= s0 - 0.2 && l.icon) cue = l.icon;
  const ctx = { bounds: p.scenes.map((x) => x[1]), frame, t, fps, bass: p.bass[i] ?? 0, beat, bi, st: t - s0, scene, line, cue, singing: !!line } as unknown as Ctx;
  const era = ERA[scene] ?? "now";
  const zoom = 1 + beat * (era === "big" ? 0.014 : 0.004) + Math.min(0.05, (t - s0) * 0.004);
  const sceneEl: Record<string, React.ReactNode> = {
    modem: <Modem />, roofCall: <RoofCall />, title: <TitleCard />, metro: <Metro />, lookUp: <LookUp />, phoneShop: <PhoneShop />, cdRoom: <CdRoom />, field: <Field />,
    videoGrid: <VideoGrid />, album: <Album />, globe: <Globe />, antenna: <Antenna />, offline: <Offline />, pixel: <Pixel />, vs1: <VS />, vs2: <VS />, zoomAdda: <ZoomAdda />,
    contacts: <Contacts />, rainWindow: <RainWindow />, emptyField: <EmptyField />, cassette: <CassetteScene />, stairsCall: <StairsCall />, galli: <Galli />,
    humanSignal: <HumanSignal />, teaOutro: <TeaOutro />, end: <EndCard credits={p.credits} />,
  };
  return (
    <A.Provider value={ctx}>
      <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: `scale(${zoom})`, filter: era === "then" ? "sepia(0.5) saturate(1.25) contrast(1.05)" : era === "now" ? "saturate(1.1) hue-rotate(-6deg)" : undefined }}>
          {sceneEl[scene] ?? null}
        </AbsoluteFill>
        {era === "then" && <Grain />}
        {era === "then" && <AbsoluteFill style={{ background: "radial-gradient(circle, transparent 50%, rgba(60,30,0,0.45) 100%)" }} />}
        {era === "now" && <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,245,212,0.04) 0 2px, transparent 2px 5px)" }} />}
        {line && line.who && <CallCaption key={line.start} l={line} />}
        {line && !line.who && scene !== "end" && (era === "big" ? <BigCaption key={line.start} l={line} /> : era === "then" ? <ThenCaption key={line.start} l={line} /> : <NowCaption key={line.start} l={line} />)}
        <Transition scenes={p.scenes} />
        <Audio src={staticFile(p.song)} />
      </AbsoluteFill>
    </A.Provider>
  );
};
