import React from "react";
import { AbsoluteFill } from "remotion";
import { Defs, Head, Person } from "./chars";

// model sheet: Rubel's turns, expressions and mouth shapes, and the ensemble (a check, not part of the film)
export const Sheet: React.FC = () => (
  <AbsoluteFill style={{ background: "#E9E1D3" }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <Defs />
      {[-0.7, -0.35, 0, 0.35, 0.7, 1].map((y, i) => <g key={i} transform={`translate(${170 + i * 190} 170) scale(1.05)`}><Head who="rubel" f={{ yaw: y, light: -1 }} /></g>)}
      {[{ smile: 0.8 }, { laugh: 1 }, { sad: 1, gazeY: 1 }, { open: 0.9, wide: -1 }, { open: 0.8, wide: 1 }, { open: 1, wide: 0 }, { blink: 1, sad: 0.6 }, { cap: -14, smile: 0.6 }].map((f, i) => (
        <g key={i} transform={`translate(${170 + i * 190} 430) scale(1.05)`}><Head who="rubel" f={f} /></g>))}
      {(["rubel", "nusrat", "shuvo", "mitu", "arif"] as const).map((w, i) => (
        <Person key={w} who={w} x={260 + i * 340} y={1060} s={0.47} f={{ yaw: [0.2, -0.3, 0.1, 0.3, -0.2][i], smile: 0.5 }} bag={w === "shuvo"} holdBall={w === "arif"} />
      ))}
    </svg>
  </AbsoluteFill>
);
