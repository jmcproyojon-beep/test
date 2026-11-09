import React from "react";
import { C, HEAD, SANS, clamp, lerp, rand } from "./lib";

// Flat, premium line-icon kit. Every icon is drawn about the origin in a
// ~120 unit box; place it with <g transform="translate(x y) scale(s)">.

const SW = 5;
const st = { stroke: C.ink, strokeWidth: SW, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export type DevKind = "phone" | "laptop" | "monitor" | "charger" | "battery" | "cable" | "router" | "hdd";
export const DEVS: DevKind[] = ["phone", "laptop", "monitor", "charger", "battery", "cable", "router", "hdd"];

export const Dev: React.FC<{ kind: DevKind; old?: boolean; accent?: string }> = ({ kind, old = true, accent = C.green }) => {
  const body = old ? "#DCE3E4" : C.paper;
  const scr = old ? "#7F8D92" : C.screen;
  const crack = old ? <path d="M-8 -20 L2 -6 L-6 4 L6 20" fill="none" stroke="#fff" strokeWidth={3} opacity={0.9} /> : null;
  switch (kind) {
    case "phone":
      return (<g><rect x={-28} y={-50} width={56} height={100} rx={12} fill={body} {...st} />
        <rect x={-19} y={-38} width={38} height={70} rx={4} fill={scr} />{crack}
        <circle cx={0} cy={42} r={3.5} fill={C.ink} /></g>);
    case "laptop":
      return (<g><rect x={-46} y={-40} width={92} height={60} rx={7} fill={body} {...st} />
        <rect x={-37} y={-32} width={74} height={44} rx={3} fill={scr} />{old && <path d="M-20 -28 L-6 -10 L-14 2" fill="none" stroke="#fff" strokeWidth={3} />}
        <path d="M-58 22 H58 L50 36 H-50 Z" fill={body} {...st} /><line x1={-10} y1={29} x2={10} y2={29} {...st} strokeWidth={3} /></g>);
    case "monitor":
      return (<g><rect x={-55} y={-46} width={110} height={70} rx={7} fill={body} {...st} />
        <rect x={-46} y={-38} width={92} height={54} rx={3} fill={scr} />{old && <path d="M10 -36 L22 -18 L12 -6 L24 12" fill="none" stroke="#fff" strokeWidth={3} />}
        <path d="M-8 24 L-12 40 M8 24 L12 40" {...st} fill="none" /><line x1={-26} y1={42} x2={26} y2={42} {...st} /></g>);
    case "charger":
      return (<g><rect x={-24} y={-44} width={48} height={42} rx={9} fill={body} {...st} />
        <line x1={-10} y1={-44} x2={-10} y2={-58} {...st} /><line x1={10} y1={-44} x2={10} y2={-58} {...st} />
        <path d="M0 -2 C0 22 -36 14 -30 36 C-24 54 18 40 26 52" fill="none" {...st} />
        <circle cx={0} cy={-23} r={5} fill={accent} /></g>);
    case "battery":
      return (<g><rect x={-26} y={-42} width={52} height={88} rx={9} fill={body} {...st} />
        <rect x={-11} y={-52} width={22} height={10} rx={3} fill={C.ink} />
        {[0, 1, 2].map((i) => <rect key={i} x={-16} y={26 - i * 22} width={32} height={15} rx={3} fill={old ? (i === 0 ? C.red : "#C3CCCE") : accent} />)}</g>);
    case "cable":
      return (<g fill="none" {...st}><ellipse cx={0} cy={0} rx={38} ry={30} /><ellipse cx={2} cy={2} rx={26} ry={20} /><ellipse cx={4} cy={4} rx={14} ry={10} />
        <path d="M38 0 C52 6 52 26 40 34" /><rect x={30} y={32} width={20} height={14} rx={3} fill={body} />
        <path d="M-38 0 C-54 -10 -48 -32 -34 -38" /><rect x={-44} y={-50} width={18} height={14} rx={3} fill={body} /></g>);
    case "router":
      return (<g><rect x={-52} y={-8} width={104} height={40} rx={9} fill={body} {...st} />
        <line x1={-34} y1={-8} x2={-44} y2={-50} {...st} /><line x1={34} y1={-8} x2={44} y2={-50} {...st} />
        {[0, 1, 2, 3].map((i) => <circle key={i} cx={-30 + i * 14} cy={12} r={4} fill={i === 0 && !old ? accent : old ? C.gray : accent} />)}</g>);
    case "hdd":
      return (<g><rect x={-38} y={-50} width={76} height={100} rx={9} fill={body} {...st} />
        <circle cx={0} cy={-8} r={24} fill={old ? "#C9D1D3" : C.soft} {...st} strokeWidth={4} /><circle cx={0} cy={-8} r={5} fill={C.ink} />
        <path d="M18 18 L6 -4" {...st} strokeWidth={4} /><circle cx={-24} cy={36} r={3} fill={C.ink} /><circle cx={24} cy={36} r={3} fill={C.ink} /></g>);
  }
};

/** small round badge behind an icon (for icons sitting on the map) */
export const Badge: React.FC<{ r?: number; fill?: string; children: React.ReactNode }> = ({ r = 74, fill = C.paper, children }) => (
  <g><ellipse cx={0} cy={r * 0.92} rx={r * 0.7} ry={r * 0.16} fill="#000" opacity={0.12} />
    <circle r={r} fill={fill} stroke={C.line} strokeWidth={3} />{children}</g>
);

// ------------------------------------------------------------ waste paths
export const Bin: React.FC<{ t?: number }> = () => (
  <g><path d="M-44 -30 H44 L36 60 H-36 Z" fill="#DCE3E4" {...st} /><rect x={-52} y={-44} width={104} height={14} rx={5} fill={C.gray} {...st} />
    {/* mixed waste poking out: bottle, peel, a phone */}
    <rect x={-30} y={-78} width={16} height={36} rx={5} fill="#BFD6E2" {...st} strokeWidth={4} transform="rotate(-18 -22 -60)" />
    <path d="M-2 -46 C4 -70 18 -74 24 -64 C16 -62 10 -54 8 -44" fill="#E8C766" {...st} strokeWidth={4} />
    <g transform="translate(30 -56) rotate(24) scale(0.42)"><Dev kind="phone" /></g>
    {[-20, 0, 20].map((x) => <line key={x} x1={x} y1={-14} x2={x * 0.8} y2={46} stroke={C.mute} strokeWidth={3} />)}</g>
);

export const Sack: React.FC<{ t?: number }> = () => (
  <g><path d="M-48 58 C-60 10 -40 -30 -24 -40 L24 -40 C40 -30 60 10 48 58 Z" fill="#E7DDC8" {...st} />
    <path d="M-24 -40 C-14 -52 14 -52 24 -40" fill="none" {...st} />
    <g transform="translate(-20 -58) rotate(-20) scale(0.4)"><Dev kind="laptop" /></g>
    <g transform="translate(18 -62) rotate(18) scale(0.38)"><Dev kind="charger" /></g>
    <g transform="translate(2 -50) rotate(4) scale(0.34)"><Dev kind="router" /></g>
    <path d="M-30 14 L30 22 M-26 34 L28 30" stroke="#B9A986" strokeWidth={3} /></g>
);

export const Dismantle: React.FC<{ t: number }> = ({ t }) => (
  <g><g transform="translate(-14 22) scale(0.75)"><Dev kind="monitor" /></g>
    <g transform={`translate(38 -30) rotate(${-30 + Math.sin(t * 9) * 16})`}>
      <rect x={-6} y={-6} width={12} height={62} rx={4} fill="#B98E5E" {...st} strokeWidth={4} />
      <rect x={-22} y={-20} width={44} height={20} rx={4} fill={C.gray} {...st} strokeWidth={4} /></g>
    {[0, 1, 2].map((i) => <circle key={i} cx={-30 + i * 20} cy={-26 - ((t * 30 + i * 13) % 26)} r={7 + i * 2} fill={C.gray} opacity={0.35} />)}</g>
);

// ------------------------------------------------------------ effects
export const Soil: React.FC<{ t?: number }> = () => (
  <g><path d="M-56 0 H56 V44 H-56 Z" fill="#B88A5A" {...st} /><path d="M-56 18 H56" stroke="#8D6440" strokeWidth={4} />
    {[-34, -6, 26].map((x) => <circle key={x} cx={x} cy={32} r={4} fill="#7A5434" />)}
    <path d="M0 0 V-34 M0 -20 C-18 -26 -22 -40 -14 -46 C-4 -40 0 -30 0 -20 M0 -28 C14 -36 26 -34 28 -26 C18 -18 8 -22 0 -28" fill={C.lime} {...st} strokeWidth={4} /></g>
);
export const Water: React.FC<{ t?: number }> = () => (
  <g><path d="M0 -52 C18 -24 30 -8 30 10 A30 30 0 0 1 -30 10 C-30 -8 -18 -24 0 -52 Z" fill="#9FD3EC" {...st} />
    <path d="M-50 44 Q-38 36 -26 44 T-2 44 T22 44 T46 44" fill="none" {...st} strokeWidth={4} /><path d="M-12 4 A14 14 0 0 0 -2 20" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" /></g>
);
export const Air: React.FC<{ t?: number }> = () => (
  <g><path d="M-36 14 A20 20 0 0 1 -26 -22 A28 28 0 0 1 24 -26 A22 22 0 0 1 40 14 Z" fill="#E6ECEE" {...st} />
    <path d="M-50 32 H22 A10 10 0 1 0 12 22 M-40 46 H34" fill="none" {...st} strokeWidth={4} /></g>
);
export const DataFile: React.FC<{ t?: number }> = () => (
  <g><path d="M-36 -50 H18 L38 -30 V50 H-36 Z" fill={C.paper} {...st} /><path d="M18 -50 V-30 H38" fill="none" {...st} />
    {[-24, -10, 4].map((y, i) => <line key={y} x1={-24} y1={y} x2={i === 2 ? 4 : 24} y2={y} stroke={C.line} strokeWidth={5} strokeLinecap="round" />)}
    <rect x={-2} y={14} width={34} height={28} rx={5} fill={C.ink} /><path d="M6 14 V6 A9 9 0 0 1 24 6 V14" fill="none" {...st} strokeWidth={4} /></g>
);
export const Flame: React.FC<{ t: number }> = ({ t }) => {
  const k = 1 + Math.sin(t * 14) * 0.06;
  return (<g transform={`scale(1 ${k})`}><path d="M0 40 C-26 40 -30 14 -18 -4 C-14 8 -6 10 -6 10 C-10 -12 2 -30 12 -44 C12 -24 30 -12 26 14 C24 32 14 40 0 40 Z" fill="#F2A44A" {...st} strokeWidth={4} />
    <path d="M0 36 C-10 36 -12 24 -6 16 C-2 22 4 20 4 12 C12 20 12 34 0 36 Z" fill="#FBD772" /></g>);
};

export const WarnRing: React.FC<{ t: number; r?: number; k?: number }> = ({ t, r = 92, k = 1 }) => (
  <g opacity={k}>
    {[0, 1].map((i) => { const p = ((t * 0.7 + i * 0.5) % 1); return <circle key={i} r={r + p * 26} fill="none" stroke={C.warn} strokeWidth={4} opacity={(1 - p) * 0.55} />; })}
    <circle r={r} fill="none" stroke={C.warn} strokeWidth={5} strokeDasharray="14 10" transform={`rotate(${t * 20})`} />
  </g>
);

export const Shield: React.FC<{ k?: number }> = ({ k = 1 }) => (
  <g><path d="M0 -70 L58 -48 V2 C58 40 30 62 0 76 C-30 62 -58 40 -58 2 V-48 Z" fill={C.mint} stroke={C.greenD} strokeWidth={7} strokeLinejoin="round" />
    <rect x={-22} y={-6} width={44} height={36} rx={7} fill={C.green} />
    <path d="M-12 -6 V-18 A12 12 0 0 1 12 -18 V-6" fill="none" stroke={C.green} strokeWidth={7} />
    <path d="M-9 13 L-2 20 L11 6" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={34} strokeDashoffset={34 * (1 - k)} /></g>
);

// ------------------------------------------------------------ brand
/** three chasing arrows; p = draw progress 0..1 */
export const Recycle: React.FC<{ r?: number; p?: number; color?: string; sw?: number; rot?: number }> = ({ r = 60, p = 1, color = C.green, sw = 16, rot = 0 }) => {
  const arcs = [0, 120, 240].map((a0) => {
    const a = ((a0 + 14) * Math.PI) / 180, b = ((a0 + 14 + 92 * clamp(p * 3 - a0 / 120)) * Math.PI) / 180;
    if (b <= a + 0.01) return null;
    const P = (q: number) => [Math.cos(q) * r, Math.sin(q) * r];
    const [x1, y1] = P(a), [x2, y2] = P(b);
    const tip = P(b + 0.02), tx = -Math.sin(b), ty = Math.cos(b), nx = Math.cos(b), ny = Math.sin(b);
    const hs = sw * 1.25;
    return (
      <g key={a0}>
        <path d={`M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <path d={`M${tip[0] + tx * hs * 1.3} ${tip[1] + ty * hs * 1.3} L${tip[0] + nx * hs} ${tip[1] + ny * hs} L${tip[0] - nx * hs} ${tip[1] - ny * hs} Z`} fill={color} strokeLinejoin="round" stroke={color} strokeWidth={4} />
      </g>
    );
  });
  return <g transform={`rotate(${rot - 90})`}>{arcs}</g>;
};

/** Placeholder BhangariWala mark (swap for the official logo file when supplied). */
export const LogoMark: React.FC<{ s?: number; p?: number; spin?: number }> = ({ s = 1, p = 1, spin = 0 }) => (
  <g transform={`scale(${s})`}>
    <circle r={92} fill={C.green} opacity={clamp(p * 2)} />
    <circle r={92} fill="none" stroke={C.greenD} strokeWidth={6} opacity={clamp(p * 2)} />
    <Recycle r={54} p={p} color="#fff" sw={15} rot={spin} />
  </g>
);

export const Wordmark: React.FC<{ x?: number; y?: number; size?: number; k?: number; sub?: boolean; dark?: boolean }> = ({ x = 0, y = 0, size = 92, k = 1, sub = true, dark = false }) => (
  <g transform={`translate(${x} ${y})`} opacity={clamp(k * 1.4)}>
    <text textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={size} letterSpacing={-size * 0.02} fill={dark ? "#fff" : C.ink}
      transform={`translate(0 ${(1 - clamp(k)) * 18})`}>Bhangari<tspan fill={C.green}>Wala</tspan></text>
    {sub && <text y={size * 0.62} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={size * 0.27} letterSpacing={size * 0.06} fill={C.mute}
      opacity={clamp(k * 2 - 0.6)}>RESPONSIBLE E-WASTE COLLECTION</text>}
  </g>
);

// ------------------------------------------------------------ people & places
/** minimal stick-style person: round head, solid torso, line limbs */
export const Person: React.FC<{ x: number; y: number; s?: number; shirt?: string; wave?: number; orna?: boolean; walk?: number; carry?: boolean; skin?: string }> =
  ({ x, y, s = 1, shirt = C.green, wave = 0, orna = false, walk = 0, carry = false, skin = "#C68B5E" }) => {
    const sw = Math.sin(walk) * 16;
    const arm = carry ? -70 : wave ? -120 - Math.sin(wave) * 25 : 20;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <ellipse cx={0} cy={2} rx={34} ry={7} fill="#000" opacity={0.12} />
        <g stroke={C.ink} strokeWidth={9} strokeLinecap="round" fill="none">
          <line x1={-6} y1={-62} x2={-10 - sw * 0.5} y2={0} /><line x1={6} y1={-62} x2={10 + sw * 0.5} y2={0} />
          <line x1={-18} y1={-118} x2={-30} y2={-70} />
          <line x1={18} y1={-118} x2={18 + Math.sin((arm * Math.PI) / 180) * -40} y2={-118 + Math.cos((arm * Math.PI) / 180) * 48} />
        </g>
        <path d="M-22 -130 Q0 -140 22 -130 L18 -60 H-18 Z" fill={shirt} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        {orna && <path d="M-22 -128 L20 -76 L26 -88 L-10 -132 Z" fill="#E7B84A" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />}
        <circle cx={0} cy={-158} r={24} fill={skin} stroke={C.ink} strokeWidth={5} />
        <path d={orna ? "M-25 -160 C-24 -190 24 -190 25 -160 C26 -140 30 -128 20 -126 C22 -150 14 -170 0 -172 C-14 -170 -22 -150 -20 -126 C-30 -128 -26 -140 -25 -160 Z" : "M-24 -164 C-22 -186 22 -188 24 -164 C14 -172 -12 -174 -24 -164 Z"}
          fill="#1D1714" />
        <circle cx={-8} cy={-158} r={2.6} fill={C.ink} /><circle cx={8} cy={-158} r={2.6} fill={C.ink} />
        <path d="M-7 -147 Q0 -142 7 -147" stroke={C.ink} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      </g>
    );
  };

const windows = (x: number, y: number, cols: number, rows: number, w: number, h: number, gx: number, gy: number, lit: (i: number) => boolean) =>
  Array.from({ length: cols * rows }).map((_, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    return <rect key={i} x={x + c * (w + gx)} y={y + r * (h + gy)} width={w} height={h} rx={3} fill={lit(i) ? C.mint2 : "#E9EEEF"} stroke={C.ink2} strokeWidth={2.5} />;
  });

export const Apartment: React.FC<{ x: number; y: number; w?: number; h?: number; tone?: string; seed?: number }> = ({ x, y, w = 200, h = 380, tone = "#F7F9F9", seed = 1 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={-h} width={w} height={h} fill={tone} stroke={C.ink} strokeWidth={5} />
    <rect x={w * 0.62} y={-h - 34} width={w * 0.24} height={34} rx={4} fill="#DADFE0" stroke={C.ink} strokeWidth={4} />
    <line x1={w * 0.66} y1={-h} x2={w * 0.66} y2={-h - 4} stroke={C.ink} strokeWidth={4} />
    {windows(18, -h + 26, 3, Math.floor((h - 70) / 62), (w - 36 - 28) / 3, 38, 14, 24, (i) => rand(i + seed * 13) > 0.6)}
    {Array.from({ length: Math.floor((h - 70) / 62) }).map((_, r) => <rect key={r} x={w - 6} y={-h + 34 + r * 62} width={16} height={18} rx={2} fill="#D3DADB" stroke={C.ink} strokeWidth={3} />)}
    <rect x={w / 2 - 20} y={-46} width={40} height={46} rx={3} fill={C.ink2} />
  </g>
);

export const Office: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 190, h = 520 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={-h} width={w} height={h} fill="#E6F2EC" stroke={C.ink} strokeWidth={5} />
    {Array.from({ length: Math.floor(h / 34) - 1 }).map((_, r) => <line key={r} x1={0} y1={-h + 34 + r * 34} x2={w} y2={-h + 34 + r * 34} stroke="#AFCDBE" strokeWidth={3} />)}
    {[1, 2, 3].map((c) => <line key={c} x1={(w / 4) * c} y1={-h} x2={(w / 4) * c} y2={0} stroke="#AFCDBE" strokeWidth={3} />)}
    <path d={`M${w * 0.15} ${-h} L${w * 0.45} ${-h * 0.55}`} stroke="#fff" strokeWidth={10} opacity={0.6} />
    <rect x={w / 2 - 30} y={-56} width={60} height={56} fill={C.ink2} /><line x1={w / 2} y1={-56} x2={w / 2} y2={0} stroke="#fff" strokeWidth={3} />
  </g>
);

export const Shop: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 230 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={-250} width={w} height={250} fill="#F7F9F9" stroke={C.ink} strokeWidth={5} />
    {windows(20, -232, 3, 1, (w - 40 - 28) / 3, 40, 14, 0, (i) => i === 1)}
    <rect x={10} y={-170} width={w - 20} height={44} rx={6} fill={C.green} stroke={C.ink} strokeWidth={4} />
    <text x={w / 2} y={-140} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={26} fill="#fff" letterSpacing={2}>ইলেকট্রনিক্স</text>
    <path d={`M0 -126 H${w} L${w - 8} -100 H8 Z`} fill={C.paper} stroke={C.ink} strokeWidth={4} />
    {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M${(w / 6) * i} -126 h${w / 12} l-2 26 h-${w / 12 - 4} Z`} fill={C.green} opacity={0.85} />)}
    <rect x={18} y={-96} width={w - 36} height={96} fill="#DDE3E4" stroke={C.ink} strokeWidth={4} />
    {Array.from({ length: 6 }).map((_, i) => <line key={i} x1={18} y1={-84 + i * 14} x2={w - 18} y2={-84 + i * 14} stroke="#B5C0C2" strokeWidth={2} />)}
  </g>
);

export const House: React.FC<{ x: number; y: number; s?: number; tone?: string }> = ({ x, y, s = 1, tone = "#F7F9F9" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-110} width={140} height={110} fill={tone} stroke={C.ink} strokeWidth={5} />
    <path d="M-86 -106 L0 -170 L86 -106 Z" fill={C.green} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-50} y={-82} width={34} height={30} rx={3} fill={C.mint2} stroke={C.ink2} strokeWidth={3} />
    <rect x={14} y={-60} width={34} height={60} rx={3} fill={C.ink2} />
  </g>
);

export const Palm: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 0 C4 -60 -6 -120 6 -180" fill="none" stroke="#8B6A47" strokeWidth={12} strokeLinecap="round" />
    {[-150, -110, -60, -20, 20].map((a, i) => {
      const r = ((a + Math.sin(t * 1.6 + i) * 4) * Math.PI) / 180;
      return <path key={i} d={`M6 -180 Q${6 + Math.cos(r) * 50} ${-180 + Math.sin(r) * 50 - 18} ${6 + Math.cos(r) * 92} ${-180 + Math.sin(r) * 92 + 16}`} fill="none" stroke={C.green} strokeWidth={12} strokeLinecap="round" />;
    })}
  </g>
);

export const Rickshaw: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-60, 50].map((cx) => <g key={cx}><circle cx={cx} cy={-34} r={32} fill="none" stroke={C.ink} strokeWidth={6} />
      <line x1={cx} y1={-34} x2={cx + Math.cos(t * 6) * 30} y2={-34 + Math.sin(t * 6) * 30} stroke={C.ink} strokeWidth={3} /></g>)}
    <path d="M10 -110 C10 -170 100 -170 100 -110 Z" fill={C.green} stroke={C.ink} strokeWidth={5} />
    <rect x={10} y={-110} width={90} height={42} fill={C.paper} stroke={C.ink} strokeWidth={5} />
    <path d="M-60 -34 L-10 -96 L30 -96 M-10 -96 L-30 -120 M30 -68 L50 -34" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
  </g>
);

export const Van: React.FC<{ x: number; y: number; s?: number; t?: number; flip?: boolean }> = ({ x, y, s = 1, t = 0, flip = false }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <ellipse cx={0} cy={4} rx={190} ry={14} fill="#000" opacity={0.12} />
    <path d="M-170 -40 V-190 Q-170 -200 -160 -200 H70 Q90 -200 100 -184 L150 -110 Q170 -100 170 -80 V-40 Z" fill={C.paper} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d="M78 -184 L130 -110 H78 Z" fill="#BFE0EE" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-170} y={-96} width={248} height={30} fill={C.green} />
    <g transform="translate(-136 -146) scale(0.3)"><LogoMark /></g>
    <text x={-102} y={-136} fontFamily={HEAD} fontWeight={800} fontSize={25} fill={C.ink}>
      Bhangari<tspan fill={C.green}>Wala</tspan></text>
    {[-100, 100].map((cx) => <g key={cx} transform={`translate(${cx} -36)`}><circle r={38} fill={C.ink} /><circle r={16} fill="#CED6D8" />
      <line x1={0} y1={0} x2={Math.cos(t * 12) * 14} y2={Math.sin(t * 12) * 14} stroke={C.ink} strokeWidth={4} /></g>)}
  </g>
);

/** chevron arrow from (x1,y1) to (x2,y2), drawn to progress p, dashes flowing */
export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; p: number; t: number; color?: string; bend?: number; sw?: number; dash?: boolean }> =
  ({ x1, y1, x2, y2, p, t, color = C.red, bend = 0, sw = 8, dash = true }) => {
    if (p <= 0) return null;
    const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
    const q = clamp(p);
    const B = (u: number) => [(1 - u) ** 2 * x1 + 2 * (1 - u) * u * mx + u * u * x2, (1 - u) ** 2 * y1 + 2 * (1 - u) * u * my + u * u * y2];
    const pts = Array.from({ length: 25 }).map((_, i) => B((i / 24) * q));
    const d = "M" + pts.map((v) => v.map((n) => n.toFixed(1)).join(" ")).join(" L");
    const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 2];
    const a = Math.atan2(ey - py, ex - px), h = sw * 2.6;
    return (
      <g>
        <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={dash ? `${sw * 2} ${sw * 1.6}` : undefined} strokeDashoffset={dash ? -t * 60 : undefined} />
        <path d={`M${ex + Math.cos(a) * h * 0.6} ${ey + Math.sin(a) * h * 0.6} L${ex + Math.cos(a + 2.4) * h} ${ey + Math.sin(a + 2.4) * h} L${ex + Math.cos(a - 2.4) * h} ${ey + Math.sin(a - 2.4) * h} Z`} fill={color} />
      </g>
    );
  };

/** a rounded label chip */
export const Chip: React.FC<{ x: number; y: number; text: string; k?: number; fill?: string; color?: string; size?: number; font?: string; weight?: number; pad?: number; w?: number; stroke?: string }> =
  ({ x, y, text, k = 1, fill = C.ink, color = "#fff", size = 30, font = SANS, weight = 700, pad = 22, w, stroke }) => {
    if (k <= 0) return null;
    const width = w ?? text.length * size * 0.62 + pad * 2;
    const h = size * 1.7;
    return (
      <g transform={`translate(${x} ${y}) scale(${lerp(0.7, 1, clamp(k))})`} opacity={clamp(k * 1.5)}>
        <rect x={-width / 2} y={-h / 2} width={width} height={h} rx={h / 2} fill={fill} stroke={stroke} strokeWidth={stroke ? 3 : 0} />
        <text y={size * 0.36} textAnchor="middle" fontFamily={font} fontWeight={weight} fontSize={size} fill={color} letterSpacing={size * 0.06}>{text}</text>
      </g>
    );
  };

/** a question mark drawn as a stroke, so it can be undrawn (p 1 -> 0) */
export const QMark: React.FC<{ p?: number; color?: string; s?: number }> = ({ p = 1, color = "#fff", s = 1 }) => {
  const L = 230;
  return (
    <g transform={`scale(${s})`}>
      <path d="M-34 -36 C-34 -84 34 -84 34 -40 C34 -12 2 -6 2 22" fill="none" stroke={color} strokeWidth={22} strokeLinecap="round"
        strokeDasharray={L} strokeDashoffset={L * (1 - clamp(p))} />
      <circle cx={2} cy={60} r={13 * clamp(p * 3 - 2)} fill={color} />
    </g>
  );
};
