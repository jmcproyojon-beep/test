import React from "react";
import { clamp, lerp } from "./lib";

// Cel-shaded 2.5D cast for "তুই নেই". Rubel follows the client's reference sheets (lean face, warm brown skin,
// thin drooping moustache, goatee, black wavy hair, plaid flat cap, cream crewneck, no jewellery); the four friends
// share his construction so the ensemble reads as one hand-drawn world.

export type Who = "rubel" | "nusrat" | "shuvo" | "mitu" | "arif" | "extra";
type P = [number, number];

export const INK = "#2A1E18";
const CAST: Record<Who, {
  skin: string; skinS: string; hair: string; top: string; topS: string; pants: string; shoe: string; h: number; w: number; style: string; lip: string;
}> = {
  rubel: { skin: "#C98652", skinS: "#A2643A", hair: "#17110E", top: "#EFE6D2", topS: "#D3C4A6", pants: "#3A3E45", shoe: "#F1EEE6", h: 1, w: 1, style: "rubel", lip: "#8C4A3A" },
  nusrat: { skin: "#C99069", skinS: "#A6704C", hair: "#17110E", top: "#C99B45", topS: "#A97E31", pants: "#EDE7DA", shoe: "#7A4E3A", h: 0.94, w: 0.92, style: "hijab", lip: "#9A4E46" },
  shuvo: { skin: "#B47A4E", skinS: "#8F5C36", hair: "#14100D", top: "#7E2F33", topS: "#5F2226", pants: "#2F3A4C", shoe: "#3B3B3B", h: 1.07, w: 0.96, style: "short", lip: "#7E4636" },
  mitu: { skin: "#C48C62", skinS: "#A06B45", hair: "#120D0B", top: "#8FA584", topS: "#718766", pants: "#F0ECE2", shoe: "#B9875C", h: 0.93, w: 0.9, style: "braid", lip: "#A24E4A" },
  arif: { skin: "#A86E43", skinS: "#85522E", hair: "#100C0A", top: "#B5573B", topS: "#8E412A", pants: "#465A78", shoe: "#E8E4DC", h: 0.94, w: 1.12, style: "curly", lip: "#7A4232" },
  extra: { skin: "#B98157", skinS: "#97633F", hair: "#1A1411", top: "#8E9AA0", topS: "#737F85", pants: "#3E4349", shoe: "#D9D4CB", h: 1, w: 1, style: "short", lip: "#7E4636" },
};
export const castColor = (w: Who) => CAST[w];

export type Face = {
  yaw?: number;          // -1 (looks screen-left) .. 1 (screen-right); |yaw| >= 0.95 = back of the head
  pitch?: number;        // -1 down .. 1 up (small)
  smile?: number; laugh?: number; sad?: number; brow?: number; blink?: number;
  gazeX?: number; gazeY?: number;
  open?: number;         // mouth opening 0..1 (singing / talking)
  wide?: number;         // -1 rounded (উ/ও) .. +1 spread (ই/এ)
  cap?: number;          // cap tilt in degrees (the camera friend's gesture)
  light?: number;        // -1 key light from screen-left, 1 from screen-right
};

/** plaid for Rubel's cap: grey-brown wool with rust and amber checks */
export const Defs: React.FC = () => (
  <defs>
    <pattern id="plaid" width={26} height={26} patternUnits="userSpaceOnUse" patternTransform="rotate(-4)">
      <rect width={26} height={26} fill="#776A61" />
      <rect x={0} y={0} width={26} height={26} fill="#8A7B70" opacity={0.35} />
      <rect x={5} y={0} width={3.2} height={26} fill="#93492F" opacity={0.85} />
      <rect x={0} y={5} width={26} height={3.2} fill="#93492F" opacity={0.85} />
      <rect x={16} y={0} width={1.4} height={26} fill="#C98A52" opacity={0.8} />
      <rect x={0} y={16} width={26} height={1.4} fill="#C98A52" opacity={0.8} />
      <rect x={21} y={0} width={2} height={26} fill="#4C423C" opacity={0.6} />
      <rect x={0} y={21} width={26} height={2} fill="#4C423C" opacity={0.6} />
    </pattern>
    <pattern id="checkShirt" width={22} height={22} patternUnits="userSpaceOnUse">
      <rect width={22} height={22} fill="#7E2F33" /><rect x={0} y={0} width={8} height={22} fill="#93424A" opacity={0.6} />
      <rect x={0} y={0} width={22} height={8} fill="#93424A" opacity={0.6} /><rect x={14} y={0} width={2} height={22} fill="#C9A089" opacity={0.5} />
      <rect x={0} y={14} width={22} height={2} fill="#C9A089" opacity={0.5} />
    </pattern>
  </defs>
);

// ------------------------------------------------------------ head
/** head about its centre; ~150 units tall from chin to cap top */
export const Head: React.FC<{ who: Who; f?: Face }> = ({ who, f = {} }) => {
  const c = CAST[who];
  const Y = clamp(f.yaw ?? 0, -1, 1), A = Math.abs(Y);
  const back = A >= 0.95;
  const light = f.light ?? -1;
  const fs = Y * 28;                               // features slide toward the turn
  const pitch = (f.pitch ?? 0) * 8;
  const X = (x: number, y: number) => x * (x * Y > 0 ? 1 - 0.24 * A : 1 + 0.04 * A) + Y * (y > 0 ? y * 0.12 : 0) + Y * 3;
  const pts: P[] = [[-53, -40], [-56, -10], [-55, 18], [-50, 44], [-40, 66], [-24, 84], [-8, 94], [8, 94], [24, 84], [40, 66], [50, 44], [55, 18], [56, -10], [53, -40], [38, -72], [0, -80], [-38, -72]];
  const face = "M" + pts.map(([x, y]) => `${X(x, y).toFixed(1)} ${y}`).join(" L") + " Z";
  const faceSmooth = (() => {
    const q = pts.map(([x, y]) => [X(x, y), y] as P);
    let d = `M${((q[0][0] + q[1][0]) / 2).toFixed(1)} ${((q[0][1] + q[1][1]) / 2).toFixed(1)}`;
    for (let i = 1; i <= q.length; i++) {
      const a = q[i % q.length], b = q[(i + 1) % q.length];
      d += ` Q${a[0].toFixed(1)} ${a[1]} ${((a[0] + b[0]) / 2).toFixed(1)} ${((a[1] + b[1]) / 2).toFixed(1)}`;
    }
    return d + " Z";
  })();
  const smile = f.smile ?? 0, laugh = f.laugh ?? 0, sad = f.sad ?? 0, blink = f.blink ?? 0;
  const eyeOpen = clamp(1 - blink) * (1 - laugh * 0.55) * (1 - smile * 0.15);
  const mx = fs * 1.05 + Y * 3, my = 60 + pitch * 0.3;
  const id = `h${who}${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const hairBack = () => {
    if (c.style === "hijab") return null;
    if (c.style === "rubel") {
      const o = -Y * 8;
      const side = (s: number) => `M${s * 50 + o} -52 C${s * 74 + o} -46 ${s * 80 + o} -20 ${s * 74 + o} 0 C${s * 84 + o} 14 ${s * 78 + o} 34 ${s * 68 + o} 42 C${s * 74 + o} 56 ${s * 62 + o} 70 ${s * 52 + o} 66 C${s * 50 + o} 50 ${s * 50 + o} 20 ${s * 48 + o} -10 Z`;
      return <g fill={c.hair} stroke={INK} strokeWidth={2.5} strokeLinejoin="round"><path d={side(-1)} /><path d={side(1)} />
        <path d={`M${-56 + o} 40 C${-40 + o} 70 ${40 + o} 70 ${56 + o} 40 L${46 + o} 60 C${20 + o} 80 ${-20 + o} 80 ${-46 + o} 60 Z`} stroke="none" /></g>;
    }
    if (c.style === "braid") return <path d={`M-60 -30 C-66 10 -60 40 -54 60 L54 60 C60 40 66 10 60 -30 Z`} fill={c.hair} />;
    return null;
  };
  if (back) {
    return (
      <g>
        {c.style === "hijab" ? (
          <path d="M-66 -40 C-70 -96 70 -96 66 -40 C72 10 70 70 84 120 L-84 120 C-70 70 -72 10 -66 -40 Z" fill="#2F6F73" stroke={INK} strokeWidth={3} />
        ) : (
          <g>
            <path d="M-60 -40 C-64 -96 64 -96 60 -40 C66 0 62 50 40 70 C20 82 -20 82 -40 70 C-62 50 -66 0 -60 -40 Z" fill={c.hair} stroke={INK} strokeWidth={3} />
            {c.style === "rubel" && Array.from({ length: 7 }).map((_, i) => (
              <path key={i} d={`M${-44 + i * 15} 50 q-6 18 4 28`} fill="none" stroke="#3A2E28" strokeWidth={3} strokeLinecap="round" />
            ))}
            {c.style === "braid" && Array.from({ length: 7 }).map((_, i) => <ellipse key={i} cx={0} cy={70 + i * 26} rx={14 - i} ry={15} fill={c.hair} stroke={INK} strokeWidth={2.5} />)}
          </g>
        )}
        {c.style === "rubel" && <Cap Y={Y} back tilt={f.cap ?? 0} />}
      </g>
    );
  }
  return (
    <g>
      {hairBack()}
      {c.style === "hijab" && <path d={`M${-70 + Y * 4} -30 C-80 -100 80 -100 ${70 + Y * 4} -30 C78 20 74 60 ${90} 120 L-90 120 C-74 60 -78 20 -70 -30 Z`} fill="#2F6F73" stroke={INK} strokeWidth={3} />}
      {/* ears */}
      {c.style !== "hijab" && [-1, 1].map((s) => (s * Y > 0.35 ? null : (
        <g key={s}><ellipse cx={X(s * 56, 10) + s * 4} cy={12} rx={10} ry={18} fill={c.skin} stroke={INK} strokeWidth={2.5} />
          <path d={`M${X(s * 56, 10) + s * 4} 2 q${s * 5} 10 0 18`} fill="none" stroke={c.skinS} strokeWidth={3} /></g>
      )))}
      {/* neck */}
      <path d={`M${-20 + Y * 6} 70 L${-23 + Y * 6} 132 L${23 + Y * 6} 132 L${20 + Y * 6} 70 Z`} fill={c.skinS} />
      <clipPath id={`${id}c`}><path d={faceSmooth} /></clipPath>
      <path d={faceSmooth} fill={c.skin} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <g clipPath={`url(#${id}c)`}>
        {/* cel shadow on the side away from the key light, and the cap's shadow on the brow */}
        <path d={`M${light < 0 ? 30 + fs * 0.6 : -30 + fs * 0.6} -80 C${light < 0 ? 10 + fs : -10 + fs} 0 ${light < 0 ? 30 + fs : -30 + fs} 60 ${light < 0 ? 6 + fs : -6 + fs} 90 L${light < 0 ? 90 : -90} 90 L${light < 0 ? 90 : -90} -80 Z`} fill={c.skinS} opacity={0.55} />
        <rect x={-80} y={-70} width={160} height={36} fill={c.skinS} opacity={c.style === "rubel" ? 0.6 : 0} />
        {(who === "rubel" || who === "arif") && <path d={`M${X(-50, 40)} 40 Q${mx} 128 ${X(50, 40)} 40 L${X(42, 70)} 78 Q${mx} 104 ${X(-42, 70)} 78 Z`} fill="#3A2A22" opacity={0.13} />}
        <ellipse cx={X(-30, 30) + fs * 0.2} cy={40} rx={14} ry={8} fill="#D9765A" opacity={0.12 + smile * 0.1} />
        <ellipse cx={X(30, 30) + fs * 0.2} cy={40} rx={14} ry={8} fill="#D9765A" opacity={0.12 + smile * 0.1} />
      </g>
      {c.style === "hijab" && <path d={`M${X(-58, -34)} -26 Q${fs * 0.4} -64 ${X(58, -34)} -26`} fill="none" stroke="#24585B" strokeWidth={8} />}
      {/* eyes */}
      {[-1, 1].map((s) => {
        const far = s * Y > 0;
        const ew = 16 * (far ? 1 - 0.45 * A : 1);
        const ex = fs + s * 23 * (1 - 0.32 * A), ey = 4 + pitch * 0.4;
        const op = eyeOpen;
        const gx = (f.gazeX ?? 0) * 5 + Y * 2, gy = (f.gazeY ?? 0) * 3;
        return (
          <g key={s}>
            {op > 0.12 ? (
              <g>
                <path d={`M${ex - ew} ${ey} Q${ex} ${ey - 12 * op} ${ex + ew} ${ey} Q${ex} ${ey + 8 * op} ${ex - ew} ${ey} Z`} fill="#F4EDE2" />
                <ellipse cx={clamp(ex + gx, ex - ew + 6, ex + ew - 6)} cy={ey - 1.5 * op + gy * op} rx={Math.min(7, ew * 0.5)} ry={Math.min(7, 5.6 * op + 0.5)} fill="#4A2C18" />
                <ellipse cx={clamp(ex + gx, ex - ew + 6, ex + ew - 6)} cy={ey - 1.5 * op + gy * op} rx={Math.min(3.4, ew * 0.25)} ry={Math.min(3.4, 3 * op)} fill="#120B07" />
                <circle cx={clamp(ex + gx, ex - ew + 6, ex + ew - 6) - 2} cy={ey - 3.6 * op} r={1.6} fill="#fff" opacity={0.9} />
                <path d={`M${ex - ew - 2} ${ey + 0.5} Q${ex} ${ey - 13 * op} ${ex + ew + 1} ${ey - 1}`} fill="none" stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
                <path d={`M${ex - ew * 0.7} ${ey + 6 * op} Q${ex} ${ey + 9 * op} ${ex + ew * 0.8} ${ey + 4 * op}`} fill="none" stroke={c.skinS} strokeWidth={2} />
              </g>
            ) : (
              <path d={`M${ex - ew} ${ey} Q${ex} ${ey + (laugh > 0.3 ? -5 : 3)} ${ex + ew} ${ey}`} fill="none" stroke={INK} strokeWidth={3.2} strokeLinecap="round" />
            )}
            {laugh > 0.2 && <path d={`M${ex - ew * 0.8} ${ey + 9} Q${ex} ${ey + 13} ${ex + ew * 0.8} ${ey + 9}`} fill="none" stroke={c.skinS} strokeWidth={2.5} opacity={laugh} />}
            {/* brow */}
            {(() => {
              const by = ey - 18 - (f.brow ?? 0) * 6 - laugh * 2;
              const inner = s * -1, lift = sad * 7;
              return <path d={`M${ex + inner * ew * 0.9} ${by - lift + 2} Q${ex} ${by - 4 - lift * 0.4} ${ex - inner * ew * 1.05} ${by + 1}`} fill="none" stroke={c.hair} strokeWidth={who === "rubel" || who === "arif" ? 6 : 4.5} strokeLinecap="round" />;
            })()}
          </g>
        );
      })}
      {who === "shuvo" && <g fill="none" stroke="#1E1E22" strokeWidth={3}>
        {[-1, 1].map((s) => <circle key={s} cx={fs + s * 23 * (1 - 0.32 * A)} cy={5} r={15 * (s * Y > 0 ? 1 - 0.4 * A : 1)} />)}
        <path d={`M${fs - 8} 4 Q${fs} 0 ${fs + 8} 4`} /></g>}
      {/* nose */}
      <path d={A < 0.15 ? `M${fs - 10} 36 Q${fs - 4} 41 ${fs} 38 Q${fs + 4} 41 ${fs + 10} 36` : `M${fs + Y * 2} 8 L${fs + Y * 16} 33 Q${fs + Y * 13} 40 ${fs + Y * 2} 39`}
        fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      {A < 0.15 && <path d={`M${fs + light * -6} 8 L${fs + light * -8} 30`} stroke={c.skinS} strokeWidth={4} strokeLinecap="round" opacity={0.7} />}
      <Mouth who={who} x={mx} y={my} f={f} A={A} />
      {/* hair at the temples / fringe */}
      {c.style === "rubel" && <g fill={c.hair}>
        <path d={`M${X(-54, -30) - 4} -44 q-14 16 -6 34 q4 6 10 2 q-4 -14 6 -30 Z`} /><path d={`M${X(54, -30) + 4} -44 q14 16 6 34 q-4 6 -10 2 q4 -14 -6 -30 Z`} />
      </g>}
      {c.style === "short" && <path d={`M${X(-56, -30)} -26 C-60 -94 60 -100 ${X(56, -30)} -26 C40 -60 ${fs - 10} -64 ${X(-56, -30)} -26 Z`} fill={c.hair} stroke={INK} strokeWidth={2.5} />}
      {c.style === "curly" && <g fill={c.hair} stroke={INK} strokeWidth={2}>{Array.from({ length: 9 }).map((_, i) => {
        const a = Math.PI * (1.05 + (i / 8) * 0.9); return <circle key={i} cx={Math.cos(a) * 54 + Y * 4} cy={Math.sin(a) * 62 - 30} r={17} />;
      })}<path d="M-54 -30 C-54 -88 54 -88 54 -30 Z" stroke="none" /></g>}
      {c.style === "braid" && <path d={`M${X(-56, -30)} -6 C-62 -96 62 -96 ${X(56, -30)} -6 C46 -52 ${fs + 6} -66 ${fs - 2} -68 C${fs - 20} -58 -40 -46 ${X(-56, -30)} -6 Z`} fill={c.hair} stroke={INK} strokeWidth={2.5} />}
      {c.style === "rubel" && <Cap Y={Y} tilt={f.cap ?? 0} />}
    </g>
  );
};

/** the plaid flat cap; the brim follows the head's turn */
const Cap: React.FC<{ Y: number; back?: boolean; tilt: number }> = ({ Y, back, tilt }) => {
  const b = Y * 18;
  return (
    <g transform={`rotate(${tilt} ${-Y * 30} -40) translate(0 -14)`}>
      <path d={`M${-68 - b * 0.3} -26 C${-74 - b * 0.2} -64 ${-40 - b * 0.4} -98 ${4 - b * 0.4} -98 C${46 - b * 0.4} -98 ${72 - b * 0.2} -70 ${68 - b * 0.3} -26 C${30} -36 ${-30} -36 ${-68 - b * 0.3} -26 Z`}
        fill="url(#plaid)" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d={`M${-50 - b * 0.4} -40 C${-30} -88 ${30} -92 ${52 - b * 0.4} -44`} fill="none" stroke="#000" strokeWidth={10} opacity={0.08} />
      <path d={`M${2 - b * 0.3} -97 L${b * 0.6} -32`} stroke="#4C423C" strokeWidth={2} opacity={0.6} />
      {!back && (
        <path d={`M${-62 + b} -30 Q${b} -44 ${62 + b} -30 Q${66 + b * 1.2} -18 ${54 + b * 1.1} -14 Q${b * 1.2} -26 ${-54 + b * 1.1} -14 Q${-66 + b * 1.2} -18 ${-62 + b} -30 Z`}
          fill="url(#plaid)" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      )}
      {!back && <path d={`M${-54 + b * 1.1} -15 Q${b * 1.2} -27 ${54 + b * 1.1} -15`} fill="none" stroke="#000" strokeWidth={4} opacity={0.25} />}
    </g>
  );
};

/** mouth + Rubel's moustache and goatee. open/wide come from the sung syllable (see lips.ts) */
const Mouth: React.FC<{ who: Who; x: number; y: number; f: Face; A: number }> = ({ who, x, y, f, A }) => {
  const c = CAST[who];
  const smile = f.smile ?? 0, laugh = f.laugh ?? 0, sad = f.sad ?? 0;
  const open = clamp(Math.max(f.open ?? 0, laugh * 0.75));
  const wide = clamp(f.wide ?? 0, -1, 1) + laugh * 0.6;
  const k = 1 - 0.3 * A;
  const w = (17 * (1 - 0.42 * Math.max(0, -wide)) + 5 * Math.max(0, wide) + smile * 4) * k;
  const h = open * 22 * (1 - 0.25 * Math.max(0, wide));
  const curl = (smile + laugh) * 5 - sad * 4;
  const facial = who === "rubel" || who === "arif";
  return (
    <g>
      {h > 2.2 ? (
        <g>
          <path d={`M${x - w} ${y - curl * 0.4} Q${x} ${y - h * 0.45 - 2} ${x + w} ${y - curl * 0.4} Q${x} ${y + h} ${x - w} ${y - curl * 0.4} Z`} fill="#4A1A16" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
          {(wide > 0.2 || laugh > 0.2) && <path d={`M${x - w * 0.8} ${y - h * 0.18} Q${x} ${y - h * 0.4} ${x + w * 0.8} ${y - h * 0.18} L${x + w * 0.7} ${y - h * 0.02} Q${x} ${y - h * 0.15} ${x - w * 0.7} ${y - h * 0.02} Z`} fill="#F2ECE2" />}
          {open > 0.45 && <ellipse cx={x} cy={y + h * 0.5} rx={w * 0.5} ry={h * 0.22} fill="#B4554D" />}
          <path d={`M${x - w * 0.8} ${y + h * 0.75} Q${x} ${y + h + 4} ${x + w * 0.8} ${y + h * 0.75}`} fill="none" stroke={c.lip} strokeWidth={3} opacity={0.6} />
        </g>
      ) : (
        <g>
          <path d={`M${x - w} ${y - curl * 0.6} Q${x} ${y + 2 + curl * 0.5} ${x + w} ${y - curl * 0.6}`} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
          <path d={`M${x - w * 0.7} ${y + 6} Q${x} ${y + 11} ${x + w * 0.7} ${y + 6}`} fill="none" stroke={c.lip} strokeWidth={4} opacity={0.5} strokeLinecap="round" />
        </g>
      )}
      {facial && who === "rubel" && (
        <g fill={c.hair}>
          {/* thin moustache with drooping ends */}
          <path d={`M${x - w - 7} ${y + 6 - curl * 0.5} Q${x - w - 6} ${y - 10} ${x - 6} ${y - 13 - open * 2} L${x} ${y - 11 - open * 2} L${x + 6} ${y - 13 - open * 2} Q${x + w + 6} ${y - 10} ${x + w + 7} ${y + 6 - curl * 0.5} Q${x + w + 1} ${y - 4} ${x + 4} ${y - 7 - open * 2} L${x - 4} ${y - 7 - open * 2} Q${x - w - 1} ${y - 4} ${x - w - 7} ${y + 6 - curl * 0.5} Z`} />
          {/* goatee */}
          <path d={`M${x - 15} ${y + 13 + h} Q${x} ${y + 8 + h} ${x + 15} ${y + 13 + h} Q${x + 17} ${y + 26 + h * 0.6} ${x + 4} ${y + 32 + h * 0.4} L${x - 4} ${y + 32 + h * 0.4} Q${x - 17} ${y + 26 + h * 0.6} ${x - 15} ${y + 13 + h} Z`} />
          <path d={`M${x - 3} ${y + 7 + h} L${x + 3} ${y + 7 + h} L${x} ${y + 13 + h} Z`} />
        </g>
      )}
      {facial && who === "arif" && <path d={`M${x - 26} ${y + 6} Q${x} ${y + 40} ${x + 26} ${y + 6}`} fill="none" stroke={c.hair} strokeWidth={5} opacity={0.35} />}
    </g>
  );
};

// ------------------------------------------------------------ body
const ik = (S: P, T: P, l1: number, l2: number, side: number): [P, P] => {
  let dx = T[0] - S[0], dy = T[1] - S[1];
  let d = Math.hypot(dx, dy);
  const max = l1 + l2 - 0.5;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  const a = Math.atan2(dy, dx);
  const cc = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const e = a + side * Math.acos(cc);
  return [[S[0] + Math.cos(e) * l1, S[1] + Math.sin(e) * l1], [S[0] + dx, S[1] + dy]];
};

export type Body = {
  x: number; y: number; s?: number; who: Who; f?: Face;
  bodyYaw?: number; lean?: number;       // lean in degrees (upper body)
  l?: P; r?: P;                           // hand targets relative to the feet origin (unscaled units)
  legs?: "stand" | "walk" | "sit" | "hidden" | "stride"; phase?: number;
  bob?: number; holdBall?: boolean; bag?: boolean; dim?: number; palm?: "l" | "r"; palmS?: number; hold?: React.ReactNode;
};

/**
 * A full figure, origin at the feet, ~925 units tall at s=1 (head centre at y -830).
 * legs "walk": walking toward / away from camera; "stride": walking across frame; "sit": on a bench.
 */
export const Person: React.FC<Body> = (b) => {
  const c = CAST[b.who];
  const s = (b.s ?? 1) * c.h;
  const BY = clamp(b.bodyYaw ?? (b.f?.yaw ?? 0) * 0.5, -1, 1);
  const sw = 92 * c.w * (1 - 0.28 * Math.abs(BY));
  const ph = b.phase ?? 0;
  const walk = b.legs === "walk" || b.legs === "stride";
  const bob = (walk ? Math.abs(Math.sin(ph)) * -10 : 0) + (b.bob ?? 0);
  const sit = b.legs === "sit";
  const hipY = sit ? -300 : -460;
  const shY = hipY - 258 + bob;
  const shx = BY * 10;
  const SL: P = [-sw + 14 + shx, shY + 16], SR: P = [sw - 14 + shx, shY + 16];
  const L: P = b.l ?? [-sw + 2 + shx - (walk ? Math.sin(ph) * 40 : 0), shY + 300], R: P = b.r ?? [sw - 2 + shx + (walk ? Math.sin(ph) * 40 : 0), shY + 300];
  const [eL, hL] = ik(SL, L, 150, 140, 1), [eR, hR] = ik(SR, R, 150, 140, -1);
  const leg = (side: number) => {
    const hip: P = [side * 34 * c.w, hipY + bob * 0.5];
    let foot: P = [side * 42 * c.w, 0];
    if (b.legs === "stride") { const q = ph + (side > 0 ? Math.PI : 0); foot = [Math.sin(q) * 110, -Math.max(0, Math.cos(q)) * 34]; }
    if (b.legs === "walk") { const q = ph + (side > 0 ? Math.PI : 0); foot = [side * 40, -Math.max(0, Math.sin(q)) * 30]; }
    if (sit) foot = [side * 66, 0];
    const [knee] = sit ? [[side * 74, hipY + 34] as P] : ik(hip, foot, 232, 230, b.legs === "stride" ? -1 : side * 0.15 > 0 ? 1 : -1);
    return { hip, knee, foot };
  };
  const legs = [leg(-1), leg(1)];
  const sleeve = (S: P, E: P) => [lerp(S[0], E[0], 0.5), lerp(S[1], E[1], 0.5)] as P;
  const lean = b.lean ?? 0;
  const top = b.who === "shuvo" ? "url(#checkShirt)" : c.top;
  return (
    <g transform={`translate(${b.x} ${b.y}) scale(${s})`} opacity={1 - (b.dim ?? 0)}>
      <ellipse cx={0} cy={4} rx={120 * c.w} ry={18} fill="#1A1208" opacity={0.18} />
      {b.legs !== "hidden" && legs.map((g, i) => (
        <g key={i}>
          <path d={`M${g.hip[0]} ${g.hip[1]} L${g.knee[0]} ${g.knee[1]} L${g.foot[0]} ${g.foot[1] - 20}`} fill="none" stroke={INK} strokeWidth={58} strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M${g.hip[0]} ${g.hip[1]} L${g.knee[0]} ${g.knee[1]} L${g.foot[0]} ${g.foot[1] - 20}`} fill="none" stroke={c.pants} strokeWidth={52} strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M${g.foot[0] - 30} ${g.foot[1] - 4} Q${g.foot[0] - 30} ${g.foot[1] - 34} ${g.foot[0]} ${g.foot[1] - 34} Q${g.foot[0] + 38} ${g.foot[1] - 30} ${g.foot[0] + 40} ${g.foot[1] - 4} Z`} fill={c.shoe} stroke={INK} strokeWidth={4} />
          <path d={`M${g.foot[0] - 30} ${g.foot[1] - 6} H${g.foot[0] + 40}`} stroke="#B9B3A8" strokeWidth={6} />
        </g>
      ))}
      <g transform={`rotate(${lean} 0 ${hipY})`}>
        {b.bag && <path d={`M${-sw * 0.8} ${shY + 30} Q${-sw - 30} ${shY + 160} ${-sw * 0.6} ${shY + 250} L${sw * 0.2} ${shY + 250} L${sw * 0.3} ${shY + 40} Z`} fill="#2E3F5C" stroke={INK} strokeWidth={4} />}
        {/* torso */}
        <path d={`M${-sw + shx} ${shY + 18} Q${-sw + shx} ${shY - 6} ${-sw + 34 + shx} ${shY - 10} L${-26 + shx * 1.6} ${shY - 16} Q${shx * 1.6} ${shY - 2} ${26 + shx * 1.6} ${shY - 16} L${sw - 34 + shx} ${shY - 10} Q${sw + shx} ${shY - 6} ${sw + shx} ${shY + 18} L${sw * 0.86} ${hipY + 30} Q0 ${hipY + 44} ${-sw * 0.86} ${hipY + 30} Z`}
          fill={top} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d={`M${(BY > 0 ? -1 : 1) * sw * 0.86} ${hipY + 30} L${(BY > 0 ? -1 : 1) * (sw - 6) + shx} ${shY + 20} L${(BY > 0 ? -1 : 1) * (sw * 0.45)} ${shY + 40} L${(BY > 0 ? -1 : 1) * sw * 0.45} ${hipY + 36} Z`} fill={c.topS} opacity={b.who === "shuvo" ? 0.35 : 0.7} />
        {b.who === "shuvo" && <path d={`M${-30 + shx * 1.6} ${shY - 12} L${-12 + shx} ${hipY + 36} L${12 + shx} ${hipY + 36} L${30 + shx * 1.6} ${shY - 12} Z`} fill="#8D9096" stroke={INK} strokeWidth={3} />}
        {b.who === "arif" && <path d={`M${-30 + shx * 1.6} ${shY - 16} L${shx * 1.6} ${shY + 30} L${30 + shx * 1.6} ${shY - 16} L${18 + shx} ${shY - 4} L${shx * 1.6} ${shY + 12} L${-18 + shx} ${shY - 4} Z`} fill="#F1E4D8" stroke={INK} strokeWidth={3} />}
        {b.who === "mitu" && <path d={`M${-sw + 20 + shx} ${shY + 6} Q${shx} ${shY + 70} ${sw - 20 + shx} ${shY + 6} L${sw - 10 + shx} ${shY + 40} Q${shx} ${shY + 110} ${-sw + 30 + shx} ${shY + 40} Z`} fill="#F3EEE2" stroke={INK} strokeWidth={3} />}
        {b.who === "nusrat" && <path d={`M${-sw * 0.86} ${hipY + 30} L${-sw * 0.95} ${hipY + 150} L${sw * 0.95} ${hipY + 150} L${sw * 0.86} ${hipY + 30} Z`} fill={c.top} stroke={INK} strokeWidth={4} />}
        {b.who === "rubel" && <path d={`M${-24 + shx * 1.6} ${shY - 15} Q${shx * 1.6} ${shY + 6} ${24 + shx * 1.6} ${shY - 15}`} fill="none" stroke="#C9B994" strokeWidth={7} />}
        {b.who === "shuvo" && <g stroke="#1D2B44" strokeWidth={16} strokeLinecap="round"><line x1={-sw + 30 + shx} y1={shY - 6} x2={-sw + 40} y2={hipY - 20} /><line x1={sw - 30 + shx} y1={shY - 6} x2={sw - 40} y2={hipY - 20} /></g>}
        {/* arms */}
        {[[SL, eL, hL, -1], [SR, eR, hR, 1]].map(([S, E, Hd], i) => (
          <g key={i} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d={`M${(S as P)[0]} ${(S as P)[1]} L${(E as P)[0]} ${(E as P)[1]} L${(Hd as P)[0]} ${(Hd as P)[1]}`} stroke={INK} strokeWidth={42} />
            <path d={`M${(S as P)[0]} ${(S as P)[1]} L${(E as P)[0]} ${(E as P)[1]} L${(Hd as P)[0]} ${(Hd as P)[1]}`} stroke={c.skin} strokeWidth={36} />
            {(() => {
              const long = b.who === "shuvo" || b.who === "nusrat" || b.who === "mitu";
              const end = long ? lerp((E as P)[0], (Hd as P)[0], 0.75) : sleeve(S as P, E as P)[0];
              const endY = long ? lerp((E as P)[1], (Hd as P)[1], 0.75) : sleeve(S as P, E as P)[1];
              return <path d={long ? `M${(S as P)[0]} ${(S as P)[1]} L${(E as P)[0]} ${(E as P)[1]} L${end} ${endY}` : `M${(S as P)[0]} ${(S as P)[1]} L${end} ${endY}`} stroke={top} strokeWidth={50} />;
            })()}
            {b.palm === (i === 0 ? "l" : "r") ? (
              <g transform={`translate(${(Hd as P)[0]} ${(Hd as P)[1]}) scale(${b.palmS ?? 1})`}>
                {[-34, -12, 10, 30].map((dx, k) => <path key={k} d={`M${dx * 0.5} -6 L${dx} ${-44 + Math.abs(dx) * 0.3}`} stroke={INK} strokeWidth={17} />)}
                {[-34, -12, 10, 30].map((dx, k) => <path key={`f${k}`} d={`M${dx * 0.5} -6 L${dx} ${-44 + Math.abs(dx) * 0.3}`} stroke={c.skin} strokeWidth={11} />)}
                <path d="M-30 4 L-50 -14" stroke={INK} strokeWidth={17} /><path d="M-30 4 L-50 -14" stroke={c.skin} strokeWidth={11} />
                <ellipse cx={0} cy={4} rx={30} ry={26} fill={c.skin} stroke={INK} strokeWidth={4} />
                <path d="M-14 6 Q0 14 14 4" stroke={c.skinS} strokeWidth={3} />
              </g>
            ) : <circle cx={(Hd as P)[0]} cy={(Hd as P)[1]} r={22} fill={c.skin} stroke={INK} strokeWidth={4} />}
          </g>
        ))}
        {b.holdBall && <circle cx={hR[0]} cy={hR[1] - 18} r={17} fill="#A3262A" stroke={INK} strokeWidth={3} />}
        {b.hold && <g transform={`translate(${hR[0]} ${hR[1]})`}>{b.hold}</g>}
        <g transform={`translate(${shx * 1.6} ${shY - 114})`}><Head who={b.who} f={b.f} /></g>
      </g>
      {sit && b.legs !== "hidden" && (
        <g>
          <path d={`M${-sw * 0.92} ${hipY - 14} Q0 ${hipY - 30} ${sw * 0.92} ${hipY - 14} L${sw * 1.0 + 6} ${hipY + 40} Q${sw * 0.5} ${hipY + 66} 0 ${hipY + 46} Q${-sw * 0.5} ${hipY + 66} ${-sw * 1.0 - 6} ${hipY + 40} Z`}
            fill={c.pants} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M0 ${hipY - 20} L0 ${hipY + 44}`} stroke={INK} strokeWidth={3} opacity={0.5} />
          {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 74} cy={hipY + 36} rx={34} ry={26} fill={c.pants} stroke={INK} strokeWidth={4} />)}
        </g>
      )}
    </g>
  );
};

/** the absent friend's hand: reaches in from outside frame (always holding the camera, never seen) */
export const CamHand: React.FC<{ x: number; y: number; a: number; s?: number; pinch?: number }> = ({ x, y, a, s = 1, pinch = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
    <path d="M-260 -40 L-40 -34 L-40 34 L-260 46 Z" fill="#3D4F66" stroke={INK} strokeWidth={4} />
    <rect x={-60} y={-30} width={22} height={60} rx={8} fill="#2C3A4C" />
    <path d="M-44 -30 C-10 -40 30 -36 52 -24 C70 -16 82 -6 84 4 C70 6 56 0 44 -2 C56 10 50 26 34 32 C10 40 -24 38 -44 30 Z" fill="#B97A50" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {/* four fingers together, curling round the brim; the thumb underneath */}
    <path d={`M30 -24 C60 -34 96 ${-30 + pinch * 6} 112 ${-14 + pinch * 14} C116 -2 104 ${6 + pinch * 6} 92 ${2 + pinch * 4} C78 -4 58 -6 40 0 Z`} fill="#B97A50" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {[0, 1, 2].map((k) => <path key={k} d={`M${70 + k * 12} ${-26 + k * 2} q8 10 4 22`} fill="none" stroke="#8A5534" strokeWidth={2.5} />)}
    <path d={`M36 18 C56 26 76 ${26 - pinch * 8} 90 ${20 - pinch * 10}`} fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
    <path d={`M36 18 C56 26 76 ${26 - pinch * 8} 90 ${20 - pinch * 10}`} fill="none" stroke="#B97A50" strokeWidth={16} strokeLinecap="round" />
    {/* the woven red thread bracelet: the friend's only signature */}
    <path d="M-40 -32 Q-30 0 -40 32" fill="none" stroke="#A32A28" strokeWidth={9} />
    <path d="M-34 -32 Q-24 0 -34 32" fill="none" stroke="#1B1412" strokeWidth={4} strokeDasharray="6 5" />
  </g>
);
