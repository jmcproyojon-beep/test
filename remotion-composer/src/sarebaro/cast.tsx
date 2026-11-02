import React from "react";
import { C, lerp, clamp } from "./lib";

// The cast, drawn as jointed SVG puppets with an ink outline (a heavier stroke
// under each part, then the colour on top). Feet at (0,0), ~300 units tall.
// Limb angles are radians from straight down; positive swings forward (+x).

export type Limb = [number, number];           // [upper angle, bend]
export type Pose = { armB: Limb; armF: Limb; legB: Limb; legF: Limb; lean?: number; bob?: number };
export type Face = { eyes?: "open" | "closed" | "wide" | "sleepy"; mouth?: "smile" | "o" | "flat" | "shout" | "grin" | "sad"; look?: number; brows?: number; sweat?: number; spiky?: number };
export type Outfit = "home" | "office" | "guard" | "kid" | "boss";

export const P = {
  stand: (): Pose => ({ armB: [-0.15, 0.1], armF: [0.15, 0.1], legB: [-0.06, 0], legF: [0.06, 0] }),
  walk: (p: number, amp = 0.45): Pose => ({
    armB: [0.5 * Math.sin(p) * amp * 2, 0.3], armF: [-0.5 * Math.sin(p) * amp * 2, 0.3],
    legB: [-amp * Math.sin(p), 0.55 * Math.max(0, Math.sin(p + 1.4))], legF: [amp * Math.sin(p), 0.55 * Math.max(0, Math.sin(p + 1.4 + Math.PI))],
    bob: Math.abs(Math.cos(p)) * 5,
  }),
  run: (p: number): Pose => ({
    armB: [1.0 * Math.sin(p), -1.4], armF: [-1.0 * Math.sin(p), -1.4],
    legB: [-0.8 * Math.sin(p) + 0.2, 1.2 * Math.max(0, Math.sin(p + 1.3))], legF: [0.8 * Math.sin(p) + 0.2, 1.2 * Math.max(0, Math.sin(p + 1.3 + Math.PI))],
    lean: 0.18, bob: Math.abs(Math.cos(p)) * 14,
  }),
  shock: (): Pose => ({ armB: [-2.6, -0.3], armF: [2.6, 0.3], legB: [-0.35, 0], legF: [0.35, 0] }),
  shrug: (): Pose => ({ armB: [-0.8, 1.8], armF: [0.8, -1.8], legB: [-0.08, 0], legF: [0.08, 0] }),
  search: (t: number): Pose => ({ armB: [-1.3 + Math.sin(t * 6) * 0.3, 0.4], armF: [1.4 + Math.sin(t * 6 + 1) * 0.3, -0.4], legB: [-0.25, 0], legF: [0.25, 0], lean: Math.sin(t * 3) * 0.12 }),
  shout: (): Pose => ({ armB: [-0.2, 0.2], armF: [2.0, 1.9], legB: [-0.1, 0], legF: [0.15, 0], lean: 0.12 }),
  watch: (): Pose => ({ armB: [-0.15, 0.1], armF: [1.2, 2.0], legB: [-0.06, 0], legF: [0.06, 0] }),
  hold: (): Pose => ({ armB: [0.9, 0.9], armF: [1.0, 0.8], legB: [-0.06, 0], legF: [0.06, 0] }),
  sit: (): Pose => ({ armB: [0.7, 0.9], armF: [0.9, 1.2], legB: [1.5, 1.5], legF: [1.4, 1.4], bob: -62 }),
  kick: (k: number): Pose => ({ armB: [-0.9, 0.3], armF: [0.6, 0.4], legB: [-0.1, 0], legF: [lerp(0.1, 1.4, k), lerp(0.2, 0, k)], lean: -0.15 * k }),
  dizzy: (t: number): Pose => ({ armB: [-0.4 + Math.sin(t * 4) * 0.3, 0.5], armF: [0.4 + Math.cos(t * 4) * 0.3, -0.5], legB: [-0.12, 0.1], legF: [0.12, 0.1], lean: Math.sin(t * 3) * 0.2 }),
};

const seg = (x: number, y: number, a: number, len: number) => [x + Math.sin(a) * len, y + Math.cos(a) * len] as const;

const OUT: Record<Outfit, { torso: string; sleeve: string; leg: string; shoe: string; arm: string }> = {
  home: { torso: "#FFFFFF", sleeve: C.skin, leg: C.skin, shoe: C.magenta, arm: C.skin },
  office: { torso: C.cyan, sleeve: C.cyan, leg: "#3A00A0", shoe: "#000", arm: C.cyan },
  guard: { torso: C.orange, sleeve: C.orange, leg: "#B34700", shoe: "#000", arm: C.orange },
  kid: { torso: C.magenta, sleeve: C.magenta, leg: C.skin, shoe: C.sun, arm: C.skin },
  boss: { torso: C.violet, sleeve: C.violet, leg: "#3A0050", shoe: "#000", arm: C.violet },
};

const LungiPattern: React.FC = () => (
  <defs>
    <pattern id="lungi" width={24} height={24} patternUnits="userSpaceOnUse">
      <rect width={24} height={24} fill={C.lungiA} />
      <rect width={24} height={7} fill={C.lungiB} /><rect width={7} height={24} fill={C.lungiB} />
      <rect y={14} width={24} height={2} fill="#7FD1A1" opacity={0.6} /><rect x={14} width={2} height={24} fill="#7FD1A1" opacity={0.6} />
    </pattern>
  </defs>
);

export const Hero: React.FC<{
  x: number; y: number; s?: number; pose?: Pose; face?: Face; outfit?: Outfit; flip?: boolean; rot?: number;
  mustache?: boolean; cap?: boolean; belly?: number; tie?: boolean; bandage?: boolean; watch?: boolean; opacity?: number;
}> = ({ x, y, s = 1, pose = P.stand(), face = {}, outfit = "home", flip = false, rot = 0, mustache, cap, belly = 0, tie, bandage, watch, opacity = 1 }) => {
  const o = OUT[outfit];
  const bob = pose.bob ?? 0;
  const hipY = -128 - bob;
  const shY = hipY - 92;
  const headY = shY - 44;
  const leg = (side: number, [a, k]: Limb) => {
    const hx = side * 13;
    const [kx, ky] = seg(hx, hipY, a, 62);
    const [fx, fy] = seg(kx, ky, a - k, 62);
    return { d: `M${hx} ${hipY} L${kx} ${ky} L${fx} ${fy}`, fx, fy, kx, ky };
  };
  const arm = (side: number, [u, e]: Limb) => {
    const sx = side * 26;
    const [ex, ey] = seg(sx, shY + 8, u, 50);
    const [hx, hy] = seg(ex, ey, u + e, 44);
    return { d: `M${sx} ${shY + 8} L${ex} ${ey}`, d2: `M${ex} ${ey} L${hx} ${hy}`, hx, hy };
  };
  const LB = leg(-1, pose.legB), LF = leg(1, pose.legF);
  const AB = arm(-1, pose.armB), AF = arm(1, pose.armF);
  const W = 9; // outline
  const limb = (d: string, col: string, w: number) => (
    <><path d={d} stroke={C.ink} strokeWidth={w + W} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={d} stroke={col} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" /></>
  );
  const foot = (L: { fx: number; fy: number }) => (
    <ellipse cx={L.fx + 9} cy={L.fy} rx={19} ry={10} fill={o.shoe} stroke={C.ink} strokeWidth={5} />
  );
  const hand = (A: { hx: number; hy: number }) => <circle cx={A.hx} cy={A.hy} r={11} fill={C.skin} stroke={C.ink} strokeWidth={5} />;
  const bw = 34 + belly * 14;
  const torso = `M${-30} ${shY} Q0 ${shY - 10} 30 ${shY} L${bw} ${hipY - 30} Q${bw + 2} ${hipY + 6} ${bw - 6} ${hipY + 8} L${-bw + 6} ${hipY + 8} Q${-bw - 2} ${hipY + 6} ${-bw} ${hipY - 30} Z`;
  // lungi: a tube from the hips to just above the feet, flaring with the stride
  const lb = Math.max(LB.fy, LF.fy) - 14;
  const lungi = `M${-bw + 2} ${hipY - 6} L${bw - 2} ${hipY - 6} L${Math.max(LF.fx, LB.fx) + 22} ${lb} L${Math.min(LF.fx, LB.fx) - 22} ${lb} Z`;
  const { eyes = "open", mouth = "smile", look = 0.3, brows = 0, sweat = 0, spiky = 0 } = face;
  const ex = look * 6;
  const eye = (cx: number) => {
    if (eyes === "closed") return <path d={`M${cx - 9} ${headY - 2} Q${cx} ${headY + 6} ${cx + 9} ${headY - 2}`} stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />;
    const r = eyes === "wide" ? 13 : 9;
    return (
      <g>
        <ellipse cx={cx} cy={headY - 4} rx={r} ry={r * 1.15} fill="#fff" stroke={C.ink} strokeWidth={3.5} />
        <circle cx={cx + ex} cy={headY - 3} r={eyes === "wide" ? 3.5 : 5} fill={C.ink} />
        {eyes === "sleepy" && <path d={`M${cx - r - 2} ${headY - 4} L${cx + r + 2} ${headY - 4} L${cx + r + 2} ${headY - 18} L${cx - r - 2} ${headY - 18} Z`} fill={C.skin} stroke={C.ink} strokeWidth={3} />}
      </g>
    );
  };
  const mouthD: Record<string, React.ReactNode> = {
    smile: <path d={`M${-12 + ex} ${headY + 16} Q${ex} ${headY + 26} ${12 + ex} ${headY + 16}`} stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />,
    grin: <path d={`M${-15 + ex} ${headY + 14} Q${ex} ${headY + 32} ${15 + ex} ${headY + 14} Z`} fill="#fff" stroke={C.ink} strokeWidth={4} />,
    o: <ellipse cx={ex} cy={headY + 20} rx={7} ry={9} fill="#3A0010" stroke={C.ink} strokeWidth={3.5} />,
    shout: <path d={`M${-15 + ex} ${headY + 12} Q${ex} ${headY + 42} ${15 + ex} ${headY + 12} Z`} fill="#3A0010" stroke={C.ink} strokeWidth={4} />,
    flat: <line x1={-10 + ex} y1={headY + 19} x2={10 + ex} y2={headY + 19} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />,
    sad: <path d={`M${-12 + ex} ${headY + 23} Q${ex} ${headY + 13} ${12 + ex} ${headY + 23}`} stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />,
  };
  const hair = spiky > 0.5
    ? `M-36 ${headY - 10} L-40 ${headY - 52} L-22 ${headY - 34} L-14 ${headY - 70} L0 ${headY - 38} L12 ${headY - 72} L20 ${headY - 36} L38 ${headY - 58} L36 ${headY - 10} Q0 ${headY - 40} -36 ${headY - 10} Z`
    : `M-37 ${headY - 4} Q-40 ${headY - 46} -6 ${headY - 46} Q30 ${headY - 52} 38 ${headY - 20} L44 ${headY - 30} L36 ${headY - 2} Q8 ${headY - 30} -20 ${headY - 22} L-30 ${headY - 6} Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${rot})`} opacity={opacity}>
      {outfit === "home" && <LungiPattern />}
      <g transform={`rotate(${((pose.lean ?? 0) * 180) / Math.PI} 0 ${hipY})`}>
        {/* back limbs */}
        {limb(AB.d, o.sleeve, 22)}{limb(AB.d2, o.arm, 20)}{hand(AB)}
        {outfit !== "home" && <>{limb(LB.d, o.leg, 26)}{foot(LB)}</>}
        {outfit !== "home" && <>{limb(LF.d, o.leg, 26)}{foot(LF)}</>}
        {outfit === "home" && <>{foot(LB)}{foot(LF)}<path d={lungi} fill="url(#lungi)" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" /></>}
        {/* torso */}
        <path d={torso} fill={o.torso} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        {outfit === "home" && <path d={`M-16 ${shY - 4} Q0 ${shY + 22} 16 ${shY - 4}`} fill={C.skin} stroke={C.ink} strokeWidth={4} />}
        {(outfit === "office" || outfit === "boss") && <path d={`M-12 ${shY - 4} L0 ${shY + 12} L12 ${shY - 4}`} fill="#fff" stroke={C.ink} strokeWidth={4} />}
        {tie && <path d={`M0 ${shY + 8} L-8 ${shY + 20} L0 ${shY + 64} L8 ${shY + 20} Z`} fill={C.crimson} stroke={C.ink} strokeWidth={4} />}
        {outfit === "guard" && <rect x={-bw} y={hipY - 18} width={bw * 2} height={12} fill="#5A4524" stroke={C.ink} strokeWidth={4} />}
        {/* head */}
        <rect x={-10} y={shY - 20} width={20} height={22} fill={C.skin} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={0} cy={headY} rx={38} ry={42} fill={C.skin} stroke={C.ink} strokeWidth={7} />
        <ellipse cx={-38} cy={headY + 2} rx={8} ry={11} fill={C.skin} stroke={C.ink} strokeWidth={5} />
        <path d={hair} fill={C.hair} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
        {cap && <><path d={`M-40 ${headY - 18} Q0 ${headY - 70} 40 ${headY - 18} Z`} fill="#00A152" stroke={C.ink} strokeWidth={5} /><rect x={20} y={headY - 24} width={34} height={9} rx={4} fill="#006B36" stroke={C.ink} strokeWidth={4} /></>}
        {eye(-14)}{eye(14)}
        {brows !== 0 && <><line x1={-24} y1={headY - 20 - brows * 4} x2={-6} y2={headY - 20 + brows * 3} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
          <line x1={6} y1={headY - 20 + brows * 3} x2={24} y2={headY - 20 - brows * 4} stroke={C.ink} strokeWidth={5} strokeLinecap="round" /></>}
        <path d={`M${2 + ex} ${headY + 2} q6 6 0 10`} stroke={C.skinD} strokeWidth={4} fill="none" strokeLinecap="round" />
        {mustache && <path d={`M${-18 + ex} ${headY + 12} Q${ex} ${headY + 4} ${18 + ex} ${headY + 12} Q${ex} ${headY + 18} ${-18 + ex} ${headY + 12} Z`} fill={C.hair} />}
        {mouthD[mouth]}
        {sweat > 0.01 && [0, 1].map((i) => (
          <path key={i} d={`M${30 + i * 10} ${headY - 24 + i * 22} q-7 12 0 15 q7 -3 0 -15 Z`} fill="#8FD3FF" stroke={C.ink} strokeWidth={2.5} opacity={sweat} />
        ))}
        {/* front arm last */}
        {limb(AF.d, o.sleeve, 22)}{limb(AF.d2, o.arm, 20)}{hand(AF)}
        {watch && <rect x={AF.hx - 12} y={AF.hy - 30} width={22} height={16} rx={4} fill={C.sun} stroke={C.ink} strokeWidth={4} />}
        {bandage && <rect x={AB.hx - 14} y={AB.hy - 26} width={28} height={20} rx={4} fill="#fff" stroke={C.ink} strokeWidth={4} />}
      </g>
    </g>
  );
};

// ------------------------------------------------------------------- props

/** Wall clock with a face. Always half past twelve unless `spin`. */
export const Clock: React.FC<{ x: number; y: number; r: number; spin?: number; wobble?: number; face?: boolean; rim?: string }> =
  ({ x, y, r, spin = 0, wobble = 0, face = true, rim = C.crimson }) => {
    const minA = 180 + spin * 360, hrA = 15 + spin * 30;
    return (
      <g transform={`translate(${x} ${y}) rotate(${wobble})`}>
        <circle r={r + r * 0.12} fill={rim} stroke={C.ink} strokeWidth={r * 0.06} />
        <circle r={r} fill={C.cream} stroke={C.ink} strokeWidth={r * 0.04} />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={0} y1={-r * 0.82} x2={0} y2={-r * (i % 3 ? 0.74 : 0.66)} stroke={C.ink} strokeWidth={r * (i % 3 ? 0.03 : 0.06)} transform={`rotate(${i * 30})`} strokeLinecap="round" />
        ))}
        {face && <>
          <ellipse cx={-r * 0.28} cy={-r * 0.12} rx={r * 0.09} ry={r * 0.12} fill={C.ink} />
          <ellipse cx={r * 0.28} cy={-r * 0.12} rx={r * 0.09} ry={r * 0.12} fill={C.ink} />
          <path d={`M${-r * 0.22} ${r * 0.3} Q0 ${r * 0.46} ${r * 0.22} ${r * 0.3}`} stroke={C.ink} strokeWidth={r * 0.05} fill="none" strokeLinecap="round" />
        </>}
        <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke={C.ink} strokeWidth={r * 0.08} strokeLinecap="round" transform={`rotate(${hrA})`} />
        <line x1={0} y1={0} x2={0} y2={-r * 0.78} stroke={C.crimson} strokeWidth={r * 0.05} strokeLinecap="round" transform={`rotate(${minA})`} />
        <circle r={r * 0.07} fill={C.ink} />
      </g>
    );
  };

/** A cycle rickshaw with a painted back panel, rider pedalling. */
export const Rickshaw: React.FC<{ x: number; y: number; s?: number; t: number; flip?: boolean }> = ({ x, y, s = 1, t, flip }) => {
  const wheel = (cx: number, r: number) => (
    <g transform={`translate(${cx} ${-r})`}>
      <circle r={r} fill="none" stroke={C.ink} strokeWidth={7} />
      {[0, 30, 60, 90, 120, 150].map((a) => <line key={a} x1={-r} y1={0} x2={r} y2={0} stroke={C.ink} strokeWidth={2} transform={`rotate(${a + t * 400})`} />)}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {wheel(-120, 52)}{wheel(60, 52)}{wheel(260, 40)}
      <path d="M-170 -150 Q-170 -300 -40 -300 L40 -300 Q60 -230 60 -150 Z" fill={C.crimson} stroke={C.ink} strokeWidth={7} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-150 + i * 50} -290 Q${-130 + i * 50} -230 ${-150 + i * 50} -160`} stroke={C.sun} strokeWidth={6} fill="none" />)}
      <rect x={-175} y={-160} width={240} height={50} rx={10} fill={C.teal} stroke={C.ink} strokeWidth={6} />
      <rect x={-165} y={-112} width={180} height={50} fill={C.sun} stroke={C.ink} strokeWidth={5} />
      <circle cx={-75} cy={-87} r={14} fill={C.magenta} stroke={C.ink} strokeWidth={4} />
      <path d="M60 -120 L260 -40 M200 -140 L260 -40 M190 -150 L230 -150" stroke={C.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
      <rect x={170} y={-172} width={64} height={14} rx={6} fill={C.ink} />
      <line x1={200} y1={-160} x2={200} y2={-60} stroke={C.ink} strokeWidth={8} />
      <Hero x={200} y={-60} s={0.62} outfit="kid" pose={{ ...P.stand(), legB: [0.9 + Math.sin(t * 8) * 0.5, 1.2], legF: [0.9 - Math.sin(t * 8) * 0.5, 1.2], armF: [1.6, 0.2], armB: [1.5, 0.2], bob: 40 }} face={{ mouth: "flat" }} />
    </g>
  );
};

/** Green CNG auto-rickshaw. */
export const CNG: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-160 -60 L-160 -230 Q-150 -300 -40 -300 L120 -300 Q170 -290 180 -200 L190 -60 Z" fill={C.teal} stroke={C.ink} strokeWidth={7} />
    <path d="M-120 -260 L40 -260 L40 -170 L-120 -170 Z" fill={C.sky} stroke={C.ink} strokeWidth={5} />
    <rect x={60} y={-260} width={90} height={100} fill={C.sky} stroke={C.ink} strokeWidth={5} />
    <rect x={-160} y={-80} width={350} height={26} fill="#00A152" stroke={C.ink} strokeWidth={5} />
    {[-90, 130].map((cx, i) => <g key={i} transform={`translate(${cx} -40)`}><circle r={40} fill="#222" stroke={C.ink} strokeWidth={6} /><circle r={14} fill="#aaa" />
      <line x1={-30} x2={30} stroke="#777" strokeWidth={4} transform={`rotate(${t * 500})`} /></g>)}
  </g>
);

/** Dhaka crow. */
export const Crow: React.FC<{ x: number; y: number; s?: number; t: number; caw?: number; flip?: boolean }> = ({ x, y, s = 1, t, caw = 0, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d="M-30 0 Q-10 -30 20 -20 L40 -28 L32 -14 Q30 10 0 12 L-36 18 Z" fill="#140024" stroke={C.cyan} strokeWidth={3} />
    <path d={`M20 -22 L${44 + caw * 4} ${-18 - caw * 8} L38 -14 Z`} fill="#555" />
    <circle cx={22} cy={-20} r={3} fill="#fff" />
    <path d="M-6 12 L-8 26 M6 12 L4 26" stroke={C.ink} strokeWidth={3} />
    {caw > 0.2 && <text x={30} y={-40} fontSize={28} fontWeight={800} fill={C.ink} fontFamily="SigPlay">কা!</text>}
  </g>
);

export { clamp };
