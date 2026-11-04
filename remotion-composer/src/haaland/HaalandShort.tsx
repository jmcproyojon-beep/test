import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../signal/fonts";
import { Grain } from "../signal/kit";
import { D, Q, FPS, smooth, pulse } from "./lib";
import { Brand, Timer, Captions } from "./ui";
import { Intro, Child, Stairs, Record, Routine, Wait, Run, Lessons, Outro } from "./story";

// "১০০ সেকেন্ডে শিখি — আর্লিং হালান্ড": a vertical (9:16) motion-graphics
// short for Reels / Shorts / TikTok, from Rubel Miah's script. Voice, music,
// effects and every cue come from client-builds/haaland-100s (see README).
// Told as a story (story.tsx): Rubel frames it, the boy from Bryne lives
// it. Scenes switch at the start of each voiced section with a quick zoom +
// flash on the whoosh.

const SCENES: [string, React.FC<{ t: number }>][] = [
  ["intro", Intro], ["child", Child], ["stairs", Stairs], ["record", Record], ["routine", Routine],
  ["wait", Wait], ["run", Run], ["lessons", Lessons], ["outro", Outro],
];
const START = D.sections.map((s, i) => (i === 0 ? 0 : s.start - 0.3));

export const HaalandShort: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  let i = 0;
  START.forEach((s, k) => { if (t >= s) i = k; });
  const Scene = SCENES[i][1];
  const since = t - START[i];
  const zoom = i === 0 ? 1 : 1 + 0.12 * Math.exp(-since * 8);
  const flash = i === 0 ? 0 : Math.exp(-since * 14) * 0.55;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}><Scene t={t} /></AbsoluteFill>
      <Grain frame={f} opacity={0.08} />
      <Brand t={t} />
      <Timer t={t} />
      <Captions t={t} />
      {flash > 0.01 && <AbsoluteFill style={{ background: "#fff", opacity: flash }} />}
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(1 - smooth(t / 0.3), smooth((t - (D.total - 0.6)) / 0.6)) }} />
    </AbsoluteFill>
  );
};
