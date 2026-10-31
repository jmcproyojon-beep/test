import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { SERIF, SANS } from "./fonts";
import { C, Line, clamp, easeOut, smooth, band, lerp } from "./lib";

// ---------------------------------------------------------------- texture

/** Film grain from eight pre-baked tiles, cycled per frame. Uses <Img> so the
 *  render waits for every tile — a CSS background-image would not be waited
 *  for and could drop out on the first frames of each worker. */
export const Grain: React.FC<{ frame: number; opacity?: number }> = ({ frame, opacity = 0.22 }) => {
  const src = staticFile(`nikhoj/grain${frame % 8}.png`);
  const tiles = [];
  for (let y = 0; y < 3; y++)
    for (let x = 0; x < 4; x++)
      tiles.push(
        <Img key={`${x}-${y}`} src={src}
          style={{ position: "absolute", left: x * 512 - ((frame * 37) % 64), top: y * 512 - ((frame * 23) % 64), width: 512, height: 512 }} />,
      );
  return <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>{tiles}</AbsoluteFill>;
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.75 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)` }} />
);

export const Flash: React.FC<{ amount: number; color?: string }> = ({ amount, color = "#fff" }) =>
  amount > 0.002 ? <AbsoluteFill style={{ background: color, opacity: clamp(amount) }} /> : null;

// ---------------------------------------------------------------- lyrics

export type KaraokeStyle = {
  font?: string;
  size?: number;
  weight?: number;
  color?: string;
  active?: string;
  dim?: number;
  maxWidth?: number;
  align?: "center" | "left" | "right";
  shadow?: string;
  lineHeight?: number;
  rise?: number;
  pop?: number;
};

/** One lyric line, revealed word by word on the sung timings.
 *  Words are split on spaces only: each word is shaped as one run by Chrome,
 *  so Bengali conjuncts stay intact. Splitting inside a word would break them. */
export const Karaoke: React.FC<{ line: Line; t: number; st?: KaraokeStyle }> = ({ line, t, st = {} }) => {
  const {
    font = SERIF, size = 72, weight = 700, color = C.white, active = C.amber,
    dim = 0.22, maxWidth = 1500, align = "center", lineHeight = 1.45,
    shadow = "0 6px 24px rgba(0,0,0,0.55)", rise = 34, pop = 0.1,
  } = st;
  const enter = easeOut((t - (line.s - 0.14)) / 0.32);
  const exit = 1 - smooth((t - line.e) / 0.4);
  const op = clamp(Math.min(enter, exit));
  if (op <= 0.001) return null;
  return (
    <div style={{
      maxWidth, display: "flex", flexWrap: "wrap", gap: `0 ${size * 0.36}px`,
      justifyContent: align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end",
      opacity: op, transform: `translateY(${(1 - enter) * rise}px)`,
      fontFamily: font, fontWeight: weight, fontSize: size, lineHeight, textShadow: shadow,
    }}>
      {line.words.map((w, i) => {
        const started = t >= w.s;
        const live = started && t < w.e + 0.08;
        const since = t - w.s;
        const scale = started ? 1 + pop * Math.exp(-since * 11) : 0.97;
        const o = started ? 1 : dim;
        return (
          <span key={i} style={{
            display: "inline-block", color: live ? active : color, opacity: o,
            transform: `scale(${scale}) translateY(${started ? 0 : 6}px)`,
          }}>{w.w}</span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- character

export type Pose = {
  walk?: number;      // walk-cycle phase in radians; undefined = standing
  sit?: boolean;      // seated on a ledge, facing right
  reach?: number;     // 0..1 lifts the right arm toward a mirror / door
  shrug?: number;     // 0..1
  bob?: number;       // vertical bob, px
};

const seg = (x: number, y: number, ang: number, len: number) =>
  [x + Math.sin(ang) * len, y + Math.cos(ang) * len] as const;

/** The video's protagonist: a man with no face. He searches for himself
 *  through the song and only gets a face back in the final chorus.
 *  A jointed SVG silhouette — shoulders, torso, separate limbs held off the
 *  body — so he reads as a person even standing still, and can walk, sit
 *  and reach. Angles are from straight down; positive swings to +x. */
export const Figure: React.FC<{
  x: number; y: number; scale?: number; pose?: Pose; face?: number;
  fill?: string; rim?: string; flip?: boolean; opacity?: number; question?: number;
}> = ({ x, y, scale = 1, pose = {}, face = 0, fill = C.ink, rim = C.teal, flip = false, opacity = 1, question = 0 }) => {
  const p = pose.walk;
  const bob = pose.bob ?? 0;
  const sit = !!pose.sit;
  const hipY = (sit ? -48 : -96) + bob;
  const shY = hipY - 50;
  const headY = shY - 30;

  // legs: thigh angle a, knee bend k (shin angle = a - k)
  let aL = -0.1, aR = 0.1, kL = 0.04, kR = -0.04;
  // arms: upper angle u, elbow e
  let uL = -0.28, uR = 0.28, eL = -0.12, eR = 0.12;
  if (p !== undefined) {
    aL = 0.45 * Math.sin(p); aR = -0.45 * Math.sin(p);
    kL = 0.6 * Math.max(0, Math.sin(p + 1.3)); kR = 0.6 * Math.max(0, Math.sin(p + 1.3 + Math.PI));
    uL = -0.42 * Math.sin(p) - 0.12; uR = 0.42 * Math.sin(p) + 0.12; eL = 0.3; eR = 0.3;
  }
  if (sit) {
    aL = 1.5; kL = 1.42; aR = 1.38; kR = 1.25;      // thighs forward, shins hanging
    uL = 0.85; eL = 0.55; uR = 0.95; eR = 0.45;      // forearms resting on knees
  }
  if (pose.reach) { uR = lerp(uR, 2.3, pose.reach); eR = lerp(eR, 0.15, pose.reach); }
  const sh = pose.shrug ?? 0;
  if (sh) { uL = lerp(uL, -0.75, sh); uR = lerp(uR, 0.75, sh); eL = lerp(eL, 1.9, sh); eR = lerp(eR, -1.9, sh); }

  const leg = (side: number, a: number, k: number) => {
    const hx = side * 9;
    const [kx, ky] = seg(hx, hipY, a, 44);
    const [fx, fy] = seg(kx, ky, a - k, 44);
    return { d: `M${hx} ${hipY} L${kx} ${ky} L${fx} ${fy}`, fx, fy };
  };
  const arm = (side: number, u: number, e: number) => {
    const sx = side * 19;
    const [ex, ey] = seg(sx, shY + 6, u, 33);
    const [hx, hy] = seg(ex, ey, u + e, 30);
    return { d: `M${sx} ${shY + 6} L${ex} ${ey} L${hx} ${hy}`, hx, hy };
  };
  const L1 = leg(-1, aL, kL), L2 = leg(1, aR, kR);
  const A1 = arm(-1, uL, eL), A2 = arm(1, uR, eR);
  const torso = `M-23 ${shY + 4} Q-25 ${shY - 5} -15 ${shY - 7} L15 ${shY - 7} Q25 ${shY - 5} 23 ${shY + 4} L16 ${hipY + 4} Q0 ${hipY + 10} -16 ${hipY + 4} Z`;

  const body = (col: string, extra: number) => (
    <g stroke={col} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={L1.d} strokeWidth={16 + extra} /><path d={L2.d} strokeWidth={16 + extra} />
      <path d={A1.d} strokeWidth={12 + extra} /><path d={A2.d} strokeWidth={12 + extra} />
      <path d={torso} fill={col} strokeWidth={2 + extra} />
      <rect x={-6} y={shY - 16} width={12} height={14} fill={col} strokeWidth={extra} />
      <circle cx={0} cy={headY} r={22} fill={col} strokeWidth={extra} />
      <ellipse cx={L1.fx - 3} cy={L1.fy} rx={11} ry={6} fill={col} strokeWidth={extra} />
      <ellipse cx={L2.fx + 3} cy={L2.fy} rx={11} ry={6} fill={col} strokeWidth={extra} />
    </g>
  );

  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`} opacity={opacity}>
      <g opacity={0.6}>{body(rim, 7)}</g>
      {body(fill, 0)}
      {face > 0.01 && (
        <g opacity={face}>
          <circle cx={-8} cy={headY - 3} r={2.8} fill={C.cream} />
          <circle cx={8} cy={headY - 3} r={2.8} fill={C.cream} />
          <path d={`M-8 ${headY + 7} Q0 ${headY + 13} 8 ${headY + 7}`} stroke={C.cream} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        </g>
      )}
      {question > 0.01 && (
        <text x={0} y={headY + 10} textAnchor="middle" fontFamily={SANS} fontWeight={700}
          fontSize={28} fill={rim} opacity={question}>?</text>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- props

/** A rubber stamp that slams onto the page at `at`. */
export const Stamp: React.FC<{
  text: string; t: number; at: number; x: number; y: number;
  color?: string; rot?: number; size?: number; out?: number;
}> = ({ text, t, at, x, y, color = C.red, rot = -12, size = 92, out = Infinity }) => {
  if (t < at) return null;
  const k = easeOut((t - at) / 0.16);
  const scale = lerp(2.6, 1, k);
  const fade = 1 - smooth((t - out) / 0.35);
  return (
    <div style={{
      position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${scale})`,
      opacity: 0.9 * k * fade, border: `${size * 0.08}px solid ${color}`, borderRadius: size * 0.14,
      padding: `${size * 0.05}px ${size * 0.35}px`, color, fontFamily: SERIF, fontWeight: 700,
      fontSize: size, lineHeight: 1.35, mixBlendMode: "multiply", whiteSpace: "nowrap",
    }}>{text}</div>
  );
};

/** Frequency bars from the measured spectrum (8 bands, mirrored to 32 bars). */
export const Bars: React.FC<{ frame: number; x: number; y: number; w: number; h: number; color?: string; count?: number; opacity?: number }> =
  ({ frame, x, y, w, h, color = C.teal, count = 32, opacity = 1 }) => {
    const half = count / 2;
    const bars = [];
    for (let i = 0; i < count; i++) {
      const k = i < half ? half - 1 - i : i - half;
      const pos = (k / (half - 1)) * 7;
      const lo = Math.floor(pos), hi = Math.min(7, lo + 1);
      const v = lerp(band(frame, lo), band(frame, hi), pos - lo);
      const bh = Math.max(4, Math.pow(v, 1.3) * h);
      const bw = w / count;
      bars.push(<rect key={i} x={x + i * bw + bw * 0.18} y={y - bh} width={bw * 0.64} height={bh} rx={bw * 0.2} fill={color} />);
    }
    return <g opacity={opacity}>{bars}</g>;
  };
