import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { DISPLAY, PLAY, MONO } from "./fonts";
import { C, Line, clamp, easeOut, smooth, lerp, rand, backOut, band } from "./lib";

export { Figure } from "../nikhoj/kit";

// ================================================================ texture

/** Film grain from eight pre-baked tiles, as <Img> so every tile is waited for. */
export const Grain: React.FC<{ frame: number; opacity?: number }> = ({ frame, opacity = 0.2 }) => {
  const src = staticFile(`signal/grain${frame % 8}.png`);
  const tiles = [];
  for (let y = 0; y < 3; y++)
    for (let x = 0; x < 4; x++)
      tiles.push(<Img key={`${x}-${y}`} src={src} style={{ position: "absolute", left: x * 512 - ((frame * 37) % 64), top: y * 512 - ((frame * 23) % 64), width: 512, height: 512 }} />);
  return <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>{tiles}</AbsoluteFill>;
};

export const Scanlines: React.FC<{ opacity?: number; roll?: number }> = ({ opacity = 0.16, roll = 0 }) => (
  <AbsoluteFill style={{
    opacity, pointerEvents: "none",
    backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.9) 0px, rgba(0,0,0,0.9) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)",
    backgroundPosition: `0 ${roll}px`,
  }} />
);

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.7 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 48%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: "none" }} />
);

/** Warm light leak drifting across a corner. */
export const LightLeak: React.FC<{ t: number; amount?: number; hue?: string }> = ({ t, amount = 0.5, hue = "255,120,40" }) => {
  const x = 50 + Math.sin(t * 0.37) * 40, y = 30 + Math.cos(t * 0.23) * 30;
  return (
    <AbsoluteFill style={{
      opacity: amount, mixBlendMode: "screen", pointerEvents: "none",
      background: `radial-gradient(ellipse 55% 70% at ${x}% ${y}%, rgba(${hue},0.55) 0%, rgba(${hue},0.0) 70%), radial-gradient(ellipse 30% 40% at ${100 - x}% ${100 - y}%, rgba(255,40,140,0.25) 0%, rgba(255,40,140,0) 70%)`,
    }} />
  );
};

/** Floating dust specks. */
export const Dust: React.FC<{ t: number; n?: number; color?: string; opacity?: number }> = ({ t, n = 40, color = "#fff", opacity = 0.5 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", pointerEvents: "none", opacity }}>
    {Array.from({ length: n }).map((_, i) => {
      const x = (rand(i) * 1920 + t * (8 + rand(i + 4) * 20)) % 1920;
      const y = (rand(i + 9) * 1080 + Math.sin(t * 0.5 + i) * 30 + 1080) % 1080;
      return <circle key={i} cx={x} cy={y} r={0.8 + rand(i + 2) * 2.2} fill={color} opacity={0.3 + rand(i + 7) * 0.6} />;
    })}
  </svg>
);

export const Flash: React.FC<{ amount: number; color?: string }> = ({ amount, color = "#fff" }) =>
  amount > 0.003 ? <AbsoluteFill style={{ background: color, opacity: clamp(amount), pointerEvents: "none" }} /> : null;

/** Torn-paper edge as a clip-path polygon along one side. */
export const tornClip = (seed: number, side: "top" | "bottom" | "both" = "both", depth = 2.2) => {
  const top: string[] = [], bot: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = (i / 40) * 100;
    top.push(`${x}% ${side !== "bottom" ? rand(seed + i) * depth : 0}%`);
    bot.push(`${100 - x}% ${100 - (side !== "top" ? rand(seed + 77 + i) * depth : 0)}%`);
  }
  return `polygon(${top.join(",")},${bot.join(",")})`;
};

// ================================================================ type

export type KStyle = {
  font?: string; size?: number; weight?: number; color?: string; active?: string; shadow?: string;
  maxWidth?: number; align?: "center" | "left" | "right"; mode?: "slam" | "pop" | "type";
  lineHeight?: number; stroke?: string; tilt?: number; spread?: number; hideBefore?: boolean;
};

/** A lyric line revealed word-by-word on the sung timings. Words are split on
 *  spaces only, so each Bengali word is shaped as one run (conjuncts intact).
 *  slam: each word drops in big and snaps into place; pop: scale pop;
 *  type: words appear like a chat being typed. */
export const Kinetic: React.FC<{ line: Line; t: number; st?: KStyle }> = ({ line, t, st = {} }) => {
  const {
    font = DISPLAY, size = 110, weight = 800, color = C.white, active = C.yellow,
    shadow = `6px 6px 0 ${C.crimson}`, maxWidth = 1700, align = "center", mode = "slam",
    lineHeight = 1.25, stroke, tilt = 0, spread = 0.3, hideBefore = false,
  } = st;
  const exit = 1 - smooth((t - line.e) / 0.35);
  if (exit <= 0.001 || t < line.s - 0.2) return null;
  return (
    <div style={{
      maxWidth, display: "flex", flexWrap: "wrap", gap: `0 ${size * spread}px`,
      justifyContent: align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end",
      fontFamily: font, fontWeight: weight, fontSize: size, lineHeight, opacity: exit,
      transform: `rotate(${tilt}deg) translateY(${(1 - exit) * -20}px)`,
    }}>
      {line.words.map((w, i) => {
        const since = t - w.s;
        const on = since >= 0;
        const k = mode === "slam" ? backOut(since / 0.16) : easeOut(since / 0.12);
        const live = on && t < w.e + 0.1;
        let tr = "";
        let o = 1;
        if (!on) {
          // upcoming words wait as a faint ghost, so the line is laid out
          // (and centred) as a whole from its first word
          o = hideBefore ? 0 : 0.16;
          tr = "none";
        } else if (mode === "slam") {
          tr = `scale(${lerp(1.7, 1, k)}) rotate(${(1 - clamp(k)) * (i % 2 ? 7 : -7)}deg)`;
          o = clamp(since / 0.05);
        } else if (mode === "pop") {
          tr = `scale(${1 + 0.18 * Math.exp(-since * 10)}) translateY(${(1 - k) * 30}px)`;
        } else {
          tr = `translateY(${(1 - k) * 14}px)`;
        }
        return (
          <span key={i} style={{
            display: "inline-block", color: live ? active : color, opacity: o, transform: tr,
            textShadow: shadow, WebkitTextStroke: stroke,
          }}>{w.w}</span>
        );
      })}
    </div>
  );
};

/** Chunky one-off word (titles, stamps). */
export const Slam: React.FC<{
  text: string; t: number; at: number; x?: number; y?: number; size?: number; color?: string;
  shadow?: string; font?: string; rot?: number; out?: number; weight?: number; center?: boolean;
}> = ({ text, t, at, x = 960, y = 540, size = 200, color = C.white, shadow = `10px 10px 0 ${C.crimson}`, font = DISPLAY, rot = 0, out = Infinity, weight = 800, center = true }) => {
  if (t < at) return null;
  const k = backOut((t - at) / 0.18);
  const fade = 1 - smooth((t - out) / 0.3);
  if (fade <= 0) return null;
  return (
    <div style={{
      position: "absolute", left: x, top: y, whiteSpace: "nowrap",
      transform: `${center ? "translate(-50%,-50%)" : ""} rotate(${rot + (1 - clamp(k)) * -8}deg) scale(${lerp(2.2, 1, k)})`,
      opacity: clamp((t - at) / 0.04) * fade, fontFamily: font, fontWeight: weight, fontSize: size,
      color, textShadow: shadow, lineHeight: 1.1,
    }}>{text}</div>
  );
};

/** Glitch: the children plus horizontal slices of themselves knocked sideways
 *  and tinted. Only mounted for a few frames around an impact. */
export const Glitch: React.FC<{ amount: number; children: React.ReactNode; seed?: number }> = ({ amount, children, seed = 0 }) => {
  if (amount < 0.05) return <>{children}</>;
  const slices = [0, 1, 2].map((i) => {
    const top = rand(seed * 7 + i) * 85, h = 3 + rand(seed * 3 + i + 9) * 12;
    const dx = (rand(seed + i * 5) - 0.5) * 260 * amount;
    return { top, h, dx, tint: i % 2 ? C.cyan : C.magenta };
  });
  return (
    <AbsoluteFill>
      {children}
      {slices.map((sl, i) => (
        <AbsoluteFill key={i} style={{ clipPath: `inset(${sl.top}% 0 ${Math.max(0, 100 - sl.top - sl.h)}% 0)`, transform: `translateX(${sl.dx}px)` }}>
          {children}
          <AbsoluteFill style={{ background: sl.tint, mixBlendMode: "multiply", opacity: 0.55 }} />
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

// ================================================================ props

/** Signal-strength icon. `level` 0..4 bars lit. `people` draws each bar as a
 *  person standing on a step: the video's last image. */
export const Bars: React.FC<{ x: number; y: number; h: number; level: number; color?: string; off?: string; people?: number; cross?: number }> =
  ({ x, y, h, level, color = C.white, off = "rgba(255,255,255,0.18)", people = 0, cross = 0 }) => {
    const w = h * 0.2, g = h * 0.08;
    return (
      <g transform={`translate(${x} ${y})`}>
        {[0, 1, 2, 3].map((i) => {
          const bh = h * (0.28 + i * 0.24);
          const lit = clamp(level - i);
          const bx = i * (w + g);
          return (
            <g key={i}>
              <rect x={bx} y={-bh} width={w} height={bh} rx={w * 0.12} fill={off} />
              <rect x={bx} y={-bh} width={w} height={bh} rx={w * 0.12} fill={color} opacity={lit * (1 - people)} />
              {people > 0.01 && (
                <g opacity={people}>
                  <rect x={bx} y={-bh * 0.42} width={w} height={bh * 0.42} fill={color} opacity={0.35} />
                  <Person x={bx + w / 2} y={-bh * 0.42} s={w / 46} fill={color} />
                </g>
              )}
            </g>
          );
        })}
        {cross > 0.01 && (
          <g opacity={cross} stroke={C.crimson} strokeWidth={h * 0.09} strokeLinecap="round">
            <line x1={-h * 0.08} y1={-h * 1.05} x2={4 * (w + g)} y2={h * 0.05} />
          </g>
        )}
      </g>
    );
  };

/** Simple standing person silhouette, feet at (x,y). */
export const Person: React.FC<{ x: number; y: number; s?: number; fill?: string; arm?: number; jump?: number }> =
  ({ x, y, s = 1, fill = C.ink, arm = 0, jump = 0 }) => (
    <g transform={`translate(${x} ${y - jump}) scale(${s})`} fill={fill}>
      <circle cx={0} cy={-150} r={19} />
      <path d={`M-20 -126 Q0 -133 20 -126 L23 -62 L-23 -62 Z`} />
      <rect x={-21} y={-66} width={18} height={66} rx={8} />
      <rect x={3} y={-66} width={18} height={66} rx={8} />
      <rect x={-34} y={-124} width={13} height={56} rx={6} transform={`rotate(${12 + arm * 140} -27 -120)`} />
      <rect x={21} y={-124} width={13} height={56} rx={6} transform={`rotate(${-12 - arm * 140} 27 -120)`} />
    </g>
  );

/** A 2000s brick phone: chunky body, green LCD, keypad. Screen content via children (local coords 0..150 x 0..120). */
export const BrickPhone: React.FC<{ x: number; y: number; s?: number; rot?: number; glow?: number; children?: React.ReactNode; body?: string }> =
  ({ x, y, s = 1, rot = 0, glow = 0.6, children, body = "#2A2F3A" }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-20} y={-340} width={26} height={90} rx={10} fill="#1C2028" />
      <rect x={-100} y={-270} width={200} height={540} rx={60} fill={body} stroke="#11141A" strokeWidth={6} />
      <rect x={-86} y={-250} width={172} height={500} rx={48} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
      <ellipse cx={0} cy={-226} rx={30} ry={7} fill="#11141A" />
      <rect x={-75} y={-200} width={150} height={120} rx={10} fill="#9FCF6B" />
      <rect x={-75} y={-200} width={150} height={120} rx={10} fill="#D8FF8F" opacity={glow * 0.5} />
      <g transform="translate(-75 -200)">
        <svg width={150} height={120} overflow="hidden">{children}</svg>
      </g>
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={-66 + (i % 3) * 48} y={-40 + Math.floor(i / 3) * 52} width={36} height={34} rx={12} fill="#3A4150" stroke="#1A1E26" strokeWidth={3} />
      ))}
    </g>
  );

/** Modern slab smartphone. Screen content via children (local coords 0..300 x 0..620). */
export const SmartPhone: React.FC<{ x: number; y: number; s?: number; rot?: number; children?: React.ReactNode; screen?: string }> =
  ({ x, y, s = 1, rot = 0, children, screen = "#0E1420" }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-165} y={-330} width={330} height={660} rx={46} fill="#0C0D10" stroke="#3A3F4A" strokeWidth={5} />
      <rect x={-150} y={-310} width={300} height={620} rx={34} fill={screen} />
      <g transform="translate(-150 -310)">
        <svg width={300} height={620} overflow="hidden">{children}</svg>
      </g>
      <rect x={-40} y={-302} width={80} height={18} rx={9} fill="#000" />
    </g>
  );

/** Speech / chat bubble (HTML). */
export const Bubble: React.FC<{
  x: number; y: number; t: number; at: number; text: React.ReactNode; side?: "l" | "r"; bg?: string; color?: string;
  size?: number; out?: number; font?: string; maxW?: number;
}> = ({ x, y, t, at, text, side = "l", bg = C.white, color = C.ink, size = 54, out = Infinity, font = PLAY, maxW = 760 }) => {
  if (t < at - 0.05) return null;
  const k = backOut((t - at) / 0.22);
  const fade = 1 - smooth((t - out) / 0.3);
  if (fade <= 0) return null;
  return (
    <div style={{
      position: "absolute", left: x, top: y, maxWidth: maxW, transformOrigin: side === "l" ? "0% 100%" : "100% 100%",
      transform: `translate(${side === "l" ? 0 : -100}%, -100%) scale(${lerp(0.3, 1, k)})`, opacity: clamp((t - at + 0.05) / 0.08) * fade,
      background: bg, color, fontFamily: font, fontWeight: 700, fontSize: size, lineHeight: 1.3,
      padding: `${size * 0.32}px ${size * 0.55}px`, borderRadius: size * 0.7,
      borderBottomLeftRadius: side === "l" ? size * 0.12 : size * 0.7, borderBottomRightRadius: side === "r" ? size * 0.12 : size * 0.7,
      boxShadow: `8px 8px 0 rgba(0,0,0,0.35)`, whiteSpace: "nowrap",
    }}>{text}</div>
  );
};

/** Radio rings around a point, pulsing outward. */
export const Rings: React.FC<{ cx: number; cy: number; t: number; n?: number; speed?: number; max?: number; color?: string; width?: number; opacity?: number }> =
  ({ cx, cy, t, n = 6, speed = 0.6, max = 1300, color = C.cyan, width = 6, opacity = 1 }) => (
    <g opacity={opacity}>
      {Array.from({ length: n }).map((_, i) => {
        const p = ((t * speed + i / n) % 1 + 1) % 1;
        return <circle key={i} cx={cx} cy={cy} r={20 + p * max} fill="none" stroke={color} strokeWidth={width * (1 - p * 0.6)} opacity={(1 - p) * 0.9} />;
      })}
    </g>
  );

/** Spectrum bars from the measured bands. */
export const Spectrum: React.FC<{ f: number; x: number; y: number; w: number; h: number; color?: string; count?: number; pixel?: number }> =
  ({ f, x, y, w, h, color = C.cyan, count = 24, pixel = 0 }) => {
    const half = count / 2, bw = w / count, out = [];
    for (let i = 0; i < count; i++) {
      const k = i < half ? half - 1 - i : i - half;
      const pos = (k / (half - 1)) * 7, lo = Math.floor(pos), hi = Math.min(7, lo + 1);
      const v = lerp(band(f, lo), band(f, hi), pos - lo);
      let bh = Math.max(4, Math.pow(v, 1.3) * h);
      if (pixel) bh = Math.max(pixel, Math.round(bh / pixel) * pixel);
      out.push(<rect key={i} x={x + i * bw + bw * 0.15} y={y - bh} width={bw * 0.7} height={bh} fill={color} />);
    }
    return <g>{out}</g>;
  };

/** Small mono HUD label. */
export const Hud: React.FC<{ x: number; y: number; children: React.ReactNode; size?: number; color?: string; anchor?: "l" | "r" }> =
  ({ x, y, children, size = 26, color = C.white, anchor = "l" }) => (
    <div style={{ position: "absolute", left: anchor === "l" ? x : undefined, right: anchor === "r" ? 1920 - x : undefined, top: y,
      fontFamily: MONO, fontSize: size, color, letterSpacing: 2, whiteSpace: "nowrap", textShadow: "0 0 10px rgba(0,0,0,0.6)" }}>{children}</div>
  );

export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
