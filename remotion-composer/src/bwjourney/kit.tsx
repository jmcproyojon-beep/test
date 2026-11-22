import React from "react";
import { staticFile } from "remotion";
import { C, HEAD, SANS, clamp, lerp } from "../bhangariwala/lib";

// Drawing kit for the 60 s BhangariWala journey. Same palette and line weight as the
// earlier BhangariWala series (../bhangariwala), plus the people, box, phone app, trays,
// data icons and laptop layers this film needs. Everything is drawn about its origin.

export { C, HEAD, SANS };
// official logo, cut from the client's artwork (client-builds/bw-journey/logo)
export const BW = { mark: staticFile("bwj/logo-mark.png"), word: staticFile("bwj/logo-word.png"), markAR: 478 / 473, wordAR: 1578 / 255 };
export const bwReady = Promise.all([BW.mark, BW.word].map((src) => new Promise<void>((res) => {
  const i = new Image(); i.onload = () => { i.decode().then(() => res(), () => res()); }; i.onerror = () => res(); i.src = src;
})));
export const Mark: React.FC<{ size: number; x?: number; y?: number }> = ({ size, x = 0, y = 0 }) => (
  <image href={BW.mark} x={x - size / 2} y={y - size / 2 / BW.markAR} width={size} height={size / BW.markAR} />
);
export const Word: React.FC<{ width: number; x?: number; y?: number }> = ({ width, x = 0, y = 0 }) => (
  <image href={BW.word} x={x - width / 2} y={y - width / BW.wordAR / 2} width={width} height={width / BW.wordAR} />
);

const SW = 5;
export const st = { stroke: C.ink, strokeWidth: SW, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const SKIN = "#C98E62", SKIN_D = "#A9714A", HAIR = "#23292C";

// ------------------------------------------------------------ people
type P = [number, number];
/** two-bone arm: shoulder -> hand target, elbow bending to `side` */
const arm = (S: P, T: P, side: number, l1 = 60, l2 = 58): [P, P] => {
  let dx = T[0] - S[0], dy = T[1] - S[1];
  let d = Math.hypot(dx, dy);
  const max = l1 + l2 - 0.5;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  const a = Math.atan2(dy, dx);
  const c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const e = a + side * Math.acos(c);
  return [[S[0] + Math.cos(e) * l1, S[1] + Math.sin(e) * l1], [S[0] + dx, S[1] + dy]];
};

export type Pose = { l?: P; r?: P };
/**
 * The two recurring characters. "cust" is the family member (white kameez, green orna);
 * "rep" is the BhangariWala team member (green polo with the logo, dark cap).
 * Origin at the feet; about 330 units tall. Hands are placed with pose.l / pose.r
 * (relative to the origin), so holding a box is just putting both hands on it.
 */
export const Figure: React.FC<{ x: number; y: number; s?: number; who: "cust" | "rep"; pose?: Pose; walk?: number; blink?: number; flip?: boolean; look?: number }> =
  ({ x, y, s = 1, who, pose = {}, walk = 0, blink = 0, flip = false, look = 0 }) => {
    const rep = who === "rep";
    const top = rep ? C.green : "#FBFBF8";
    const topD = rep ? C.greenD : "#DDE3DE";
    const pants = rep ? "#28343A" : "#E8ECE6";
    const sw = Math.sin(walk) * 14, lift = Math.max(0, Math.cos(walk)) * 6;
    const SL: P = [-38, -228], SR: P = [38, -228];
    const L = pose.l ?? [-52 - sw * 0.4, -118], R = pose.r ?? [52 + sw * 0.4, -118];
    const [eL, hL] = arm(SL, L, -1), [eR, hR] = arm(SR, R, 1);
    const sleeve = rep ? 0.6 : 1.45;   // in arm segments: polo short sleeve, kameez 3/4 sleeve
    const Arm = ({ S, E, Hd }: { S: P; E: P; Hd: P }) => (
      <g strokeLinecap="round" fill="none">
        <path d={`M${S[0]} ${S[1]} L${E[0]} ${E[1]} L${Hd[0]} ${Hd[1]}`} stroke={SKIN} strokeWidth={19} strokeLinejoin="round" />
        <path d={sleeve <= 1 ? `M${S[0]} ${S[1]} L${lerp(S[0], E[0], sleeve)} ${lerp(S[1], E[1], sleeve)}`
          : `M${S[0]} ${S[1]} L${E[0]} ${E[1]} L${lerp(E[0], Hd[0], sleeve - 1)} ${lerp(E[1], Hd[1], sleeve - 1)}`}
          stroke={top} strokeWidth={25} strokeLinejoin="round" />
        <circle cx={Hd[0]} cy={Hd[1]} r={12} fill={SKIN} stroke="none" />
      </g>
    );
    const eye = 1 - clamp(blink);
    return (
      <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
        <ellipse cx={0} cy={4} rx={62} ry={12} fill="#0E2A1C" opacity={0.13} />
        {/* legs */}
        <g strokeLinecap="round" fill="none">
          <path d={`M-15 -130 L${-18 - sw} ${-14 - (sw > 0 ? lift : 0)}`} stroke={pants} strokeWidth={rep ? 27 : 31} />
          <path d={`M15 -130 L${18 + sw} ${-14 - (sw < 0 ? lift : 0)}`} stroke={pants} strokeWidth={rep ? 27 : 31} />
        </g>
        {!rep && <g stroke={C.line} strokeWidth={3} fill="none"><path d={`M${-18 - sw - 14} -40 H${-18 - sw + 14}`} /><path d={`M${18 + sw - 14} -40 H${18 + sw + 14}`} /></g>}
        <ellipse cx={-22 - sw} cy={-6 - (sw > 0 ? lift : 0)} rx={20} ry={9} fill={HAIR} />
        <ellipse cx={22 + sw} cy={-6 - (sw < 0 ? lift : 0)} rx={20} ry={9} fill={HAIR} />
        {/* torso */}
        {rep ? (
          <g>
            <path d="M-44 -232 Q0 -246 44 -232 L40 -138 Q0 -128 -40 -138 Z" fill={top} stroke={C.greenDD} strokeWidth={3} />
            <path d="M-40 -150 Q0 -140 40 -150 L40 -132 Q0 -122 -40 -132 Z" fill="#1E2A30" />
            <path d="M-14 -240 L0 -212 L14 -240" fill="#fff" stroke={C.greenDD} strokeWidth={3} strokeLinejoin="round" />
            <rect x={6} y={-206} width={28} height={28} rx={6} fill="#fff" />
            <Mark size={24} x={20} y={-192} />
          </g>
        ) : (
          <g>
            <path d="M-42 -232 Q0 -246 42 -232 L56 -84 Q0 -72 -56 -84 Z" fill={top} stroke={topD} strokeWidth={3} />
            <path d="M-20 -238 Q0 -222 20 -238" fill="none" stroke={topD} strokeWidth={3} />
            {/* orna: green scarf over one shoulder */}
            <path d="M-40 -236 Q-6 -226 30 -236 L44 -226 Q4 -198 -34 -206 Z" fill={C.green} />
            <path d="M24 -232 L46 -230 L60 -120 L40 -112 Z" fill={C.greenD} />
          </g>
        )}
        <Arm S={SL} E={eL} Hd={hL} />
        <Arm S={SR} E={eR} Hd={hR} />
        {/* head */}
        <rect x={-10} y={-258} width={20} height={26} fill={SKIN_D} />
        <g transform={`translate(${look * 4} 0)`}>
          <circle cx={-38} cy={-284} r={8} fill={SKIN_D} /><circle cx={38} cy={-284} r={8} fill={SKIN_D} />
          <circle cx={0} cy={-288} r={40} fill={SKIN} />
          {rep ? (
            <g>
              <path d="M-42 -294 Q-40 -336 0 -336 Q40 -336 42 -294 Z" fill="#1E2A30" />
              <path d="M-6 -300 Q30 -304 62 -294 Q40 -288 -6 -292 Z" fill={C.green} transform={look < 0 ? "scale(-1 1)" : undefined} />
              <circle cx={0} cy={-318} r={7} fill={C.green} />
            </g>
          ) : (
            <g>
              <circle cx={0} cy={-334} r={17} fill={HAIR} />
              <path d="M-42 -284 Q-44 -332 0 -330 Q44 -332 42 -284 Q34 -310 0 -312 Q-30 -312 -42 -284 Z" fill={HAIR} />
            </g>
          )}
          <g fill={HAIR}>
            <ellipse cx={-14 + look * 3} cy={-286} rx={4.5} ry={5.5 * eye + 0.6} />
            <ellipse cx={14 + look * 3} cy={-286} rx={4.5} ry={5.5 * eye + 0.6} />
          </g>
          <path d={`M${-11 + look * 3} -268 Q${look * 3} -260 ${11 + look * 3} -268`} fill="none" stroke="#7A4A2E" strokeWidth={3.5} strokeLinecap="round" />
        </g>
      </g>
    );
  };

// ------------------------------------------------------------ box
/** BhangariWala collection box, 2.5D. Origin bottom-front centre. open 0..1 swings the flaps. */
export const Box: React.FC<{ x?: number; y?: number; s?: number; open?: number; children?: React.ReactNode; band?: string }> = ({ x = 0, y = 0, s = 1, open = 0, children, band = C.green }) => {
  const o = clamp(open);
  const ff: P = [lerp(30, -4, o), lerp(-30, 40, o)];      // front flap free-edge vector
  const bf: P = [lerp(-30, 10, o), lerp(30, -46, o)];     // back flap
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={14} cy={4} rx={104} ry={14} fill="#0E2A1C" opacity={0.14} />
      {/* side face */}
      <path d="M75 -110 L105 -140 L105 -30 L75 0 Z" fill="#D9E0DC" {...st} strokeWidth={4} />
      {/* top: hole when open */}
      <path d="M-75 -110 L-45 -140 L105 -140 L75 -110 Z" fill={o > 0.02 ? "#2B363B" : "#F4F7F5"} {...st} strokeWidth={4} />
      {o > 0.02 && <path d={`M-45 -140 L105 -140 L${105 + bf[0]} ${-140 + bf[1]} L${-45 + bf[0]} ${-140 + bf[1]} Z`} fill="#E9EEEA" {...st} strokeWidth={4} />}
      {children}
      {/* front */}
      <rect x={-75} y={-110} width={150} height={110} fill="#FFFFFF" {...st} strokeWidth={4} />
      <rect x={-73} y={-30} width={146} height={14} fill={band} />
      <Mark size={58} x={0} y={-66} />
      {o > 0.02 && <path d={`M-75 -110 L75 -110 L${75 + ff[0]} ${-110 + ff[1]} L${-75 + ff[0]} ${-110 + ff[1]} Z`} fill="#F4F7F5" {...st} strokeWidth={4} />}
    </g>
  );
};

// ------------------------------------------------------------ small objects
export const Headphones: React.FC = () => (
  <g fill="none" {...st}>
    <path d="M-38 10 V-4 A38 38 0 0 1 38 -4 V10" strokeWidth={9} />
    <rect x={-50} y={4} width={22} height={40} rx={9} fill="#DCE3E4" />
    <rect x={28} y={4} width={22} height={40} rx={9} fill="#DCE3E4" />
  </g>
);
export const Mouse: React.FC = () => (
  <g><rect x={-24} y={-36} width={48} height={72} rx={24} fill="#DCE3E4" {...st} />
    <line x1={0} y1={-36} x2={0} y2={-10} {...st} strokeWidth={4} /><rect x={-4} y={-26} width={8} height={12} rx={4} fill={C.ink} /></g>
);
export const PCB: React.FC<{ w?: number; h?: number }> = ({ w = 110, h = 76 }) => (
  <g>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill="#2F7D45" {...st} strokeWidth={4} />
    <g stroke="#D9B55A" strokeWidth={3} fill="none" opacity={0.9}>
      <path d={`M${-w / 2 + 10} ${-h / 4} H${-6} V${h / 4} H${w / 2 - 12}`} /><path d={`M${-w / 2 + 10} ${h / 4} H${-20}`} /><path d={`M${12} ${-h / 2 + 8} V${-6} H${w / 2 - 10}`} />
    </g>
    <rect x={-20} y={-16} width={30} height={30} rx={3} fill="#1E2A30" />
    <rect x={w / 2 - 34} y={h / 2 - 26} width={20} height={14} rx={2} fill="#1E2A30" />
    {[0, 1, 2].map((i) => <circle key={i} cx={-w / 2 + 14 + i * 12} cy={-h / 2 + 12} r={3.5} fill="#D9B55A" />)}
  </g>
);
export const Ingot: React.FC = () => (
  <g><path d="M-44 10 L-30 -16 H30 L44 10 Z" fill="#C9D1D4" {...st} strokeWidth={4} /><path d="M-30 -16 L-24 -28 H24 L30 -16" fill="#E6EBEC" {...st} strokeWidth={4} /></g>
);
export const Pellets: React.FC<{ color?: string }> = ({ color = "#8FC8E8" }) => (
  <g>{[[-22, 6], [0, -8], [20, 8], [-6, 14], [10, -20], [-18, -14], [26, -8]].map(([x, y], i) =>
    <ellipse key={i} cx={x} cy={y} rx={9} ry={7} fill={i % 2 ? color : C.lime} stroke={C.ink} strokeWidth={2.5} />)}</g>
);
export const Gear: React.FC<{ r?: number; rot?: number; color?: string }> = ({ r = 24, rot = 0, color = C.green }) => (
  <g transform={`rotate(${rot})`}>
    {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={-5} y={-r - 8} width={10} height={14} rx={2} fill={color} transform={`rotate(${i * 45})`} />)}
    <circle r={r} fill={color} /><circle r={r * 0.4} fill="#fff" />
  </g>
);
export const Lock: React.FC<{ s?: number; color?: string }> = ({ s = 1, color = C.green }) => (
  <g transform={`scale(${s})`}>
    <path d="M-14 -4 V-16 A14 14 0 0 1 14 -16 V-4" fill="none" stroke={color} strokeWidth={7} />
    <rect x={-22} y={-6} width={44} height={36} rx={8} fill={color} /><circle cx={0} cy={10} r={5} fill="#fff" /><rect x={-2} y={10} width={4} height={10} fill="#fff" />
  </g>
);
export const Check: React.FC<{ r?: number; k?: number; fill?: string }> = ({ r = 34, k = 1, fill = C.green }) => (
  <g transform={`scale(${clamp(k) ** 0.5})`} opacity={clamp(k * 2)}>
    <circle r={r} fill={fill} stroke="#fff" strokeWidth={5} />
    <path d={`M${-r * 0.4} 0 L${-r * 0.1} ${r * 0.32} L${r * 0.44} ${-r * 0.3}`} fill="none" stroke="#fff" strokeWidth={r * 0.2} strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray={r * 1.6} strokeDashoffset={r * 1.6 * (1 - clamp(k * 1.4 - 0.3))} />
  </g>
);
export const Cross: React.FC<{ r?: number; k?: number }> = ({ r = 34, k = 1 }) => (
  <g transform={`scale(${clamp(k) ** 0.5})`} opacity={clamp(k * 2)}>
    <circle r={r} fill={C.red} stroke="#fff" strokeWidth={5} />
    <path d={`M${-r * 0.35} ${-r * 0.35} L${r * 0.35} ${r * 0.35} M${r * 0.35} ${-r * 0.35} L${-r * 0.35} ${r * 0.35}`} stroke="#fff" strokeWidth={r * 0.2} strokeLinecap="round" />
  </g>
);

// abstract data cards: never real content, just shapes
export const DataIcon: React.FC<{ kind: "photo" | "doc" | "account" | "folder"; s?: number }> = ({ kind, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <rect x={-40} y={-34} width={80} height={68} rx={14} fill="#fff" stroke={C.line} strokeWidth={3} />
    {kind === "photo" && <g><rect x={-26} y={-22} width={52} height={40} rx={6} fill={C.mint} /><path d="M-26 14 L-8 -4 L4 8 L12 0 L26 14 Z" fill={C.green} /><circle cx={12} cy={-10} r={6} fill={C.warn} /></g>}
    {kind === "doc" && <g><path d="M-18 -24 H8 L20 -12 V24 H-18 Z" fill={C.mint} stroke={C.greenD} strokeWidth={3} />{[-6, 4, 14].map((y) => <line key={y} x1={-10} y1={y} x2={12} y2={y} stroke={C.greenD} strokeWidth={3} strokeLinecap="round" />)}</g>}
    {kind === "account" && <g><circle cx={0} cy={-8} r={11} fill={C.green} /><path d="M-20 22 Q0 -2 20 22 Z" fill={C.green} /></g>}
    {kind === "folder" && <g><path d="M-26 -16 H-6 L0 -10 H26 V20 H-26 Z" fill={C.lime} stroke={C.greenD} strokeWidth={3} strokeLinejoin="round" /></g>}
  </g>
);

/** top-down sorting tray with a green outline and its label */
export const Tray: React.FC<{ x: number; y: number; w: number; h: number; label: string; k?: number; hot?: number; dim?: number; children?: React.ReactNode }> =
  ({ x, y, w, h, label, k = 1, hot = 0, dim = 0, children }) => {
    const lines = label.split("\n");
    return (
      <g transform={`translate(${x} ${y}) scale(${lerp(0.85, 1, clamp(k))})`} opacity={clamp(k * 1.6) * (1 - dim * 0.7)}>
        <rect x={-w / 2 + 6} y={-h / 2 + 10} width={w} height={h} rx={22} fill="#0E2A1C" opacity={0.1} />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={22} fill="#FFFFFF" stroke={C.green} strokeWidth={5 + hot * 4} />
        <rect x={-w / 2 + 12} y={-h / 2 + 52} width={w - 24} height={h - 64} rx={14} fill={C.mint} opacity={0.75} />
        {hot > 0 && <rect x={-w / 2 - 8} y={-h / 2 - 8} width={w + 16} height={h + 16} rx={28} fill="none" stroke={C.lime} strokeWidth={4} opacity={hot * 0.8} />}
        {lines.map((l, i) => (
          <text key={i} x={0} y={-h / 2 + 30 + (i - (lines.length - 1) / 2) * 21 + (lines.length > 1 ? 6 : 4)} textAnchor="middle" fontFamily={HEAD} fontWeight={800}
            fontSize={lines.length > 1 ? 19 : 22} letterSpacing={1.2} fill={C.greenDD}>{l}</text>
        ))}
        <g transform={`translate(0 ${26})`}>{children}</g>
      </g>
    );
  };

/** big phone frame; children are drawn in screen space (0,0 = screen top-left), w x h */
export const PhoneFrame: React.FC<{ w: number; h: number; children: React.ReactNode }> = ({ w, h, children }) => (
  <g>
    <rect x={-w / 2 + 14} y={-h / 2 + 26} width={w} height={h} rx={64} fill="#0E2A1C" opacity={0.18} />
    <rect x={-w / 2 - 16} y={-h / 2 - 16} width={w + 32} height={h + 32} rx={66} fill="#1E2A30" />
    <rect x={-w / 2 - 16} y={-h / 2 - 16} width={w + 32} height={h + 32} rx={66} fill="none" stroke="#3E4C53" strokeWidth={4} />
    <clipPath id="phoneClip"><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={50} /></clipPath>
    <g clipPath="url(#phoneClip)"><rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#F6F9F7" /><g transform={`translate(${-w / 2} ${-h / 2})`}>{children}</g></g>
    <rect x={-50} y={-h / 2 + 14} width={100} height={26} rx={13} fill="#1E2A30" />
  </g>
);

/** a text line in SVG */
export const T: React.FC<{ x: number; y: number; size: number; children: React.ReactNode; color?: string; w?: number; font?: string; anchor?: "start" | "middle" | "end"; ls?: number; op?: number }> =
  ({ x, y, size, children, color = C.ink, w = 700, font = SANS, anchor = "middle", ls = 0, op = 1 }) => (
    <text x={x} y={y} fontFamily={font} fontWeight={w} fontSize={size} fill={color} textAnchor={anchor} letterSpacing={ls} opacity={op}>{children}</text>
  );
