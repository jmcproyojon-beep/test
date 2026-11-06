import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../signal/fonts";
import { DISPLAY } from "../signal/fonts";
import { Kinetic, Grain } from "../signal/kit";
import { D, FPS, L, S, smooth, clamp, rand, lineAt, pulse, easeOut } from "./lib";
import { Strip } from "./paper";
import * as Sc from "./scenes";

// "মানবতার ডাক — শেষ আলো জ্বলবেই", Raparrubel (Rubel Miah).
// A paper-cutout documentary music video: one world cut up by borders and
// faceless power, its capitals and its people; the hero — the artist, cut
// from his own character sheet — stands up with them, and every nation sings
// together. Every shot starts on a lyric line (Whisper-timed, the artist's
// words). Silent render; the master is muxed afterwards.

const st = (has: string, n = 0) => L(has, n)?.s ?? 0;
type Shot = { from: number; render: (t: number, a: number, b: number) => React.ReactNode };
const SHOTS: Shot[] = [
  { from: 0, render: (t, a, b) => <Sc.Opening t={t} a={a} b={b} /> },
  { from: st("একটা পৃথিবী") - 0.5, render: (t, a, b) => <Sc.IntroWorld t={t} a={a} b={b} /> },
  { from: st("রাজপ্রাসাদের") - 0.4, render: (t, a, b) => <Sc.Palace t={t} a={a} b={b} /> },
  { from: st("ওয়াশিংটন") - 0.4, render: (t, a, b) => <Sc.Capitals t={t} a={a} b={b} /> },
  { from: st("যে শিশুটি") - 0.4, render: (t, a, b) => <Sc.SmallWorld t={t} a={a} b={b} /> },
  { from: st("যদি নামে") - 0.4, render: (t, a, b) => <Sc.HandsTogether t={t} a={a} b={b} /> },
  { from: S("Chorus") - 0.2, render: (t, a, b) => <Sc.Chorus t={t} a={a} b={b} n={0} /> },
  { from: S("Verse 2") - 0.4, render: (t, a, b) => <Sc.History t={t} a={a} b={b} /> },
  { from: st("কোন বিজয়ে") - 0.3, render: (t, a, b) => <Sc.Victory t={t} a={a} b={b} /> },
  { from: st("নিউইয়র্কের") - 0.3, render: (t, a, b) => <Sc.AssemblyHall t={t} a={a} b={b} /> },
  { from: S("Pre-Chorus 2") - 0.3, render: (t, a, b) => <Sc.HandsTogether t={t} a={a} b={b} second /> },
  { from: S("Chorus 2") - 0.2, render: (t, a, b) => <Sc.Chorus t={t} a={a} b={b} n={1} /> },
  { from: S("Bridge") - 0.4, render: (t, a, b) => <Sc.Voices t={t} a={a} b={b} /> },
  { from: st("একটি পৃথিবী") - 0.3, render: (t, a, b) => <Sc.OneWorld t={t} a={a} b={b} /> },
  { from: st("যুদ্ধ নয়") - 0.2, render: (t, a, b) => <Sc.Chants t={t} a={a} b={b} /> },
  { from: S("Final Chorus") - 0.2, render: (t, a, b) => <Sc.Chorus t={t} a={a} b={b} n={2} /> },
  { from: S("Outro") - 0.5, render: (t, a, b) => <Sc.Outro t={t} a={a} b={b} /> },
  // the climax after the outro repeats the hook (not on the sheet; see export_data.py)
  { from: S("Reprise") - 0.3, render: (t, a, b) => <Sc.Chorus t={t} a={a} b={b} n={3} /> },
  { from: 351.0, render: (t, a, b) => <Sc.Outro t={t} a={a} b={b} /> },
];
const HOOK = (text: string) => text.includes("আলো জ্বলবেই");

/** Torn kraft panel that sweeps across a cut. */
const Wipe: React.FC<{ k: number; seed: number }> = ({ k, seed }) => {
  if (k <= 0 || k >= 1) return null;
  const x = -2200 + k * 4300;
  const pts = Array.from({ length: 22 }).map((_, i) => `${(rand(seed + i) * 6).toFixed(1)}% ${(i / 21) * 100}%`).join(",");
  const pts2 = Array.from({ length: 22 }).map((_, i) => `${(94 + rand(seed + 50 + i) * 6).toFixed(1)}% ${100 - (i / 21) * 100}%`).join(",");
  return <div style={{ position: "absolute", top: -20, left: x, width: 2100, height: 1120, background: "#B89A6A", clipPath: `polygon(${pts},${pts2})`,
    boxShadow: "0 0 40px rgba(0,0,0,0.5)", filter: "drop-shadow(12px 0 14px rgba(0,0,0,0.45))" }} />;
};

export const ManobotarMV: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  let i = 0;
  SHOTS.forEach((s, k) => { if (t >= s.from) i = k; });
  const a = SHOTS[i].from, b = SHOTS[i + 1]?.from ?? D.duration;
  // the wipe straddles each cut
  const nextCut = SHOTS[i + 1]?.from ?? Infinity;
  const wk = Math.max(i > 0 ? (t - a + 0.35) / 0.7 : 0, (t - nextCut + 0.35) / 0.7);
  const line = lineAt(t, undefined, 0.3);
  const hook = line && HOOK(line.text);
  const open = 1 - smooth(t / 1.5), close = smooth((t - (D.duration - 1.5)) / 1.4);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SHOTS[i].render(t, a, b)}
      {/* lyrics: the chorus hook stamped big, every line on a paper strip */}
      {line && hook && (
        <Strip t={t} at={line.s} out={line.e + 0.3} y={170} size={96} bg="#FBF6EA" rot={-2}>{line.text}</Strip>
      )}
      {line && !hook && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 54, display: "flex", justifyContent: "center", opacity: clamp((t - line.s + 0.15) / 0.2) }}>
          <div style={{ background: "rgba(251,246,234,0.93)", padding: "8px 34px 14px", borderRadius: 6, transform: `rotate(-0.6deg)`, boxShadow: "6px 8px 0 rgba(0,0,0,0.3)" }}>
            <Kinetic line={line as any} t={t} st={{ size: 60, weight: 800, color: "#2A1A10", active: "#B3261E", shadow: "none", mode: "pop", maxWidth: 1600 }} />
          </div>
        </div>
      )}
      <Wipe k={wk} seed={i * 13} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
      <Grain frame={f} opacity={0.16} />
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(open, close) }} />
    </AbsoluteFill>
  );
};
