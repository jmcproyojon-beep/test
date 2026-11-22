import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { FPS, clamp, noise, ramp } from "./lib";
import { Defs } from "./chars";
import { SHOTS_A, Shot } from "./shotsA";
import { SHOTS_B } from "./shotsB";

// "তুই নেই" (Tui Nei): music video, 1920x1080, 24 fps, on the client's master (public/tuinei/master.mp3).
// Present day: steady camera, natural daylight. Memories (mem: true): warmer grade, a closer lens, small
// hand-held corrections and film grain, as if filmed by the friend who is no longer in the frame.

export const DURATION = 224.856;
export const FRAMES = Math.ceil(DURATION * FPS);
export const SHOTS: Shot[] = [...SHOTS_A, ...SHOTS_B];

const MemoryLook: React.FC<{ t: number; settle?: [number, number]; children: React.ReactNode }> = ({ t, settle, children }) => {
  // settle: the hand-held drift and the closer lens ease out, so the staircase memory lands on the present's framing
  const k = settle ? 1 - ramp(t, settle[0], settle[1] - settle[0]) : 1;
  const hx = (noise(t * 0.9, 1) * 10 + noise(t * 3.1, 2) * 2.5) * k, hy = (noise(t * 0.8, 3) * 7 + noise(t * 2.7, 4) * 2) * k, r = noise(t * 0.6, 5) * 0.55 * k;
  return (
    <AbsoluteFill style={{ filter: "sepia(0.26) saturate(1.12) contrast(0.95) brightness(1.04)" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <Defs />
        <g transform={`translate(960 540) rotate(${r}) scale(${1 + 0.07 * k}) translate(${-960 + hx} ${-540 + hy})`}>{children}</g>
        <rect width={1920} height={1080} fill="#FFB866" opacity={0.08} />
      </svg>
    </AbsoluteFill>
  );
};

export const TuiNei: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const shot = SHOTS.find((s) => t >= s.a && t < s.b) ?? SHOTS[SHOTS.length - 1];
  const fadeOut = ramp(t, DURATION - 1.6, 1.5);
  return (
    <AbsoluteFill style={{ background: "#0E0B0A" }}>
      {shot.mem ? <MemoryLook t={t} settle={shot.settle}>{shot.draw(t)}</MemoryLook> : (
        <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
          <Defs />
          {shot.draw(t)}
        </svg>
      )}
      {/* painted paper tooth over everything; grain only on the memories */}
      <Img src={staticFile("tuinei/paper.png")} style={{ position: "absolute", inset: 0, width: 1920, height: 1080, mixBlendMode: "soft-light", opacity: 0.55 }} />
      {shot.mem && <Img src={staticFile(`tuinei/grain${frame % 4}.png`)} style={{ position: "absolute", inset: 0, width: 1920, height: 1080, mixBlendMode: "overlay", opacity: 0.22 }} />}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 58%, rgba(20,10,4,0.32) 100%)", opacity: shot.mem ? 1 : 0.55 }} />
      {fadeOut > 0 && <AbsoluteFill style={{ background: "#000", opacity: clamp(fadeOut) }} />}
      <Audio src={staticFile("tuinei/master.mp3")} />
    </AbsoluteFill>
  );
};
