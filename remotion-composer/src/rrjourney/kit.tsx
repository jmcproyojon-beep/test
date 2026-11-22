import React from "react";
import { staticFile } from "remotion";
import { clamp, easeOut, lerp, ramp } from "../tuinei/lib";

// Look of the Rapar Rubel journey: cinematic flat illustration in deep teal and burnt orange with grain,
// after the client's reference (an animated biography). Big chapter titles rise letter by letter.

export const PAL = {
  night: "#0C242A", teal: "#173E46", teal2: "#245861", teal3: "#3D7479", tealL: "#6F9C9C",
  orange: "#E2582A", orange2: "#F08A4B", peach: "#F4CFAE", cream: "#F2E2C6", ink: "#081A1E", gold: "#F2B25C", rust: "#9A3E22",
};

const BN = "U+0951-0952,U+0964-0965,U+0980-09FE,U+1CD0-1CF9,U+200C-200D,U+20B9,U+25CC,U+A8F1";
const LAT = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+2248,U+FEFF,U+FFFD";
export const HEADF = "RRHead";
// plain @font-face (rendered by Journey) instead of @remotion/fonts: its per-font delayRender stalled under parallel tabs
export const FONT_CSS = `
@font-face { font-family: ${HEADF}; font-weight: 800; src: url(${staticFile("bw/inter-tight-latin-800-normal.woff2")}) format("woff2"); unicode-range: ${LAT}; }
@font-face { font-family: ${HEADF}; font-weight: 800; src: url(${staticFile("bw/anek-bangla-bengali-800-normal.woff2")}) format("woff2"); unicode-range: ${BN}; }`;
export const fontsReady = () => Promise.race([
  Promise.all([document.fonts.load(`800 100px ${HEADF}`, "RAPAR"), document.fonts.load(`800 100px ${HEADF}`, "ঢাকা")]),
  new Promise((r) => setTimeout(r, 12000)),
]);

/** a chapter title: letters rise out of a mask one after another, hold, then lift away */
export const Title: React.FC<{ text: string; t: number; a: number; b: number; x: number; y: number; size: number; color?: string; anchor?: "start" | "middle" | "end"; stagger?: number }> =
  ({ text, t, a, b, x, y, size, color = PAL.orange, anchor = "middle", stagger = 0.09 }) => {
    if (t < a - 0.1 || t > b + 0.6) return null;
    const out = ramp(t, b - 0.35, 0.5);
    // grapheme clusters keep Bangla conjuncts and vowel signs together
    // Bangla rises as one word (splitting it into tspans can break conjunct shaping); Latin letter by letter
    const seg = /[\u0980-\u09FF]/.test(text) ? [text] : typeof Intl !== "undefined" && (Intl as any).Segmenter ? Array.from(new (Intl as any).Segmenter("bn", { granularity: "grapheme" }).segment(text), (s: any) => s.segment as string) : Array.from(text);
    return (
      <g>
        <defs><clipPath id={`tc${Math.round(a * 100)}`}><rect x={-4000} y={y - size * 1.05} width={8000} height={size * 1.42} /></clipPath></defs>
        <g clipPath={`url(#tc${Math.round(a * 100)})`}><g transform={`translate(0 ${(1 - easeOut((t - a) / 0.7)) * size * 0.7 - out * size * 0.5})`}>
          <text x={x} y={y} textAnchor={anchor} fontFamily={HEADF} fontWeight={800} fontSize={size} fill={color} letterSpacing={size * 0.01}>
            {seg.map((ch, i) => {
              const k = easeOut((t - a - i * stagger) / 0.55);
              return <tspan key={i} dy={0} style={{ opacity: clamp(k * 1.4) * (1 - out) }}>{ch}</tspan>;
            })}
          </text>
        </g></g>
      </g>
    );
  };

/** soft glow disc */
export const Glow: React.FC<{ x: number; y: number; r: number; color: string; o?: number }> = ({ x, y, r, color, o = 1 }) => (
  <g opacity={o}>
    <defs><radialGradient id={`g${color.slice(1)}`}><stop offset="0" stopColor={color} stopOpacity={0.9} /><stop offset="1" stopColor={color} stopOpacity={0} /></radialGradient></defs>
    <circle cx={x} cy={y} r={r} fill={`url(#g${color.slice(1)})`} />
  </g>
);

/** night / dusk grade applied over a scene, keeping glows drawn after it */
export const Tint: React.FC<{ color: string; o: number }> = ({ color, o }) => (
  <rect width={1920} height={1080} fill={color} opacity={o} style={{ mixBlendMode: "multiply" }} />
);
