import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { clamp, ramp } from "../tuinei/lib";
import { Defs } from "../tuinei/chars";
import { fontsReady } from "./kit";
import { SCENES } from "./scenes";

// Rapar Rubel: the journey. 1920x1080, 24 fps, 1:53.6, on "তুই নেই" (0:00-1:53.6, faded out before verse 2).
export const FPS = 24, DUR = 113.6, FRAMES = Math.round(DUR * FPS);

export const RRJourney: React.FC = () => {
  const frame = useCurrentFrame(), t = frame / FPS;
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => { fontsReady.then(() => continueRender(h)); }, [h]);
  const sc = SCENES.find((s) => t >= s.a && t < s.b) ?? SCENES[SCENES.length - 1];
  // a short dip between scenes, like the reference's soft cuts
  const edge = Math.min(t - sc.a, sc.b - t);
  const dip = sc.a > 0 && edge < 0.12 ? 1 - edge / 0.12 : 0;
  return (
    <AbsoluteFill style={{ background: "#081A1E" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <Defs />
        {sc.draw(t)}
      </svg>
      <Img src={staticFile("tuinei/paper.png")} style={{ position: "absolute", inset: 0, width: 1920, height: 1080, mixBlendMode: "soft-light", opacity: 0.6 }} />
      <Img src={staticFile(`tuinei/grain${frame % 4}.png`)} style={{ position: "absolute", inset: 0, width: 1920, height: 1080, mixBlendMode: "overlay", opacity: 0.16 }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(4,14,16,0.45) 100%)" }} />
      <AbsoluteFill style={{ background: "#081A1E", opacity: clamp(dip * 0.5 + ramp(t, DUR - 2.2, 2.0) + (1 - ramp(t, 0, 0.6))) }} />
      <Audio src={staticFile("rrj/music.wav")} />
    </AbsoluteFill>
  );
};
