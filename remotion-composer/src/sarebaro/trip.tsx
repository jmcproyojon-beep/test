import React from "react";
import { AbsoluteFill } from "remotion";
import { bassSmooth, beatPulse, lerp } from "./lib";

// The illusion background, in the artist's reference palette: neon bands
// (red, orange, yellow, green, cyan, blue, violet, magenta) separated by black
// lines, flowing continuously.
//   rings: wavy concentric loops around a centre (reference 1)
//   burst: zig-zag star rings radiating from a point, usually low (reference 2)
// Each band is a closed polygon; the stack is drawn from the outside in, and
// the base radii slide by a fraction of a band per frame, with the colour
// index advancing in step, so the motion is seamless. Bass swells the waves.

export const NEON = ["#FF1744", "#FF6D00", "#FFEA00", "#00E676", "#00E5FF", "#2979FF", "#D500F9", "#FF00A8"];

export type TripCfg = { mode: "rings" | "burst"; cx?: number; cy?: number; speed?: number; lobes?: number; amp?: number; step?: number; dim?: number; spin?: number };

export const Trip: React.FC<{ t: number; f: number; cfg: TripCfg }> = ({ t, f, cfg }) => {
  const { mode, cx = 960, cy = 540, speed = 0.8, lobes = mode === "rings" ? 7 : 18, step = mode === "rings" ? 46 : 52, dim = 0, spin = 0.05 } = cfg;
  const b = bassSmooth(f, 2), bp = beatPulse(t, 7);
  const amp = (cfg.amp ?? (mode === "rings" ? 0.13 : 0.2)) * (1 + b * 0.6 + bp * 0.25);
  const flow = t * speed;
  const frac = flow - Math.floor(flow);
  const base = Math.floor(flow);
  const maxR = Math.hypot(Math.max(cx, 1920 - cx), Math.max(cy, 1080 - cy)) * 1.25;
  const n = Math.ceil(maxR / step) + 2;
  const N = 160;
  const rings: React.ReactNode[] = [];
  for (let i = n; i >= 0; i--) {
    const R = (i + frac) * step;
    if (R < 4) continue;
    const pts: string[] = [];
    for (let k = 0; k < N; k++) {
      const a = (k / N) * Math.PI * 2 + t * spin;
      let w: number;
      if (mode === "rings") {
        w = Math.sin(a * lobes + t * 1.3 - R * 0.004) * 0.7 + Math.sin(a * (lobes - 3) - t * 0.9 + R * 0.006) * 0.3;
      } else {
        const z = (a * lobes) / (Math.PI * 2) + R * 0.002 - t * 0.2;
        w = 2 * Math.abs(2 * (z - Math.floor(z + 0.5))) - 1;     // triangle wave: spikes
      }
      const r = R * (1 + amp * w * Math.min(1, R / 260));
      pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
    }
    const col = NEON[(((i - base) % NEON.length) + NEON.length * 100) % NEON.length];
    rings.push(<polygon key={i} points={pts.join(" ")} fill={col} stroke="#000" strokeWidth={lerp(3, 7, Math.min(1, R / 900))} />);
  }
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>{rings}</svg>
      {dim > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} />}
    </AbsoluteFill>
  );
};
