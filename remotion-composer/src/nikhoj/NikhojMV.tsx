import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "./fonts";
import { D, FPS, smooth } from "./lib";
import { Grain, Vignette } from "./kit";
import { Mirror, Title, City, Form } from "./scenesA";
import { Newspaper, Drop, Phone, Door } from "./scenesB";
import { Sunrise, Torn, Signs } from "./scenesC";

// নিখোঁজ সংবাদ — fully animated music video.
//
// Everything on screen is drawn here in code; nothing is taken from the
// release artwork. The story: a man with no face is reported missing by his
// own song. The mirror that opens the video doesn't recognise him; the
// choruses are front pages; in the last one his face comes back and
// নিরুদ্দেশ is struck out for ঠিকানা; the mirror that closes it finally does.
//
// Scene boundaries sit on cue points measured from the master (snaps and the
// section hits in data.json), not on rounded seconds. The picture renders
// silent; the master is muxed afterwards so the audio is untouched.

type Scene = { from: number; to: number; cut: boolean; render: (t: number, f: number) => React.ReactNode };

const S: Scene[] = [
  { from: 0, to: D.snaps.intro, cut: true, render: (t, f) => <Mirror t={t} f={f} /> },
  { from: D.snaps.intro, to: 59.0, cut: true, render: (t, f) => <Title t={t} f={f} /> },
  { from: 59.0, to: 81.3, cut: false, render: (t, f) => <City t={t} f={f} /> },
  { from: 81.3, to: D.hits.chorus1, cut: false, render: (t, f) => <Form t={t} f={f} /> },
  { from: D.hits.chorus1, to: 137.4, cut: true, render: (t, f) => <Newspaper t={t} f={f} v="one" /> },
  { from: 137.4, to: D.hits.verse2, cut: true, render: (t, f) => <Drop t={t} f={f} /> },
  { from: D.hits.verse2, to: 194.15, cut: true, render: (t, f) => <Phone t={t} f={f} /> },
  { from: 194.15, to: D.hits.chorus2, cut: false, render: (t, f) => <Door t={t} f={f} /> },
  { from: D.hits.chorus2, to: 238.6, cut: true, render: (t, f) => <Newspaper t={t} f={f} v="two" /> },
  { from: 238.6, to: 247.0, cut: true, render: (t, f) => <Torn t={t} f={f} /> },
  { from: 247.0, to: 277.4, cut: true, render: (t, f) => <Sunrise t={t} f={f} /> },
  { from: 277.4, to: D.hits.final, cut: false, render: (t, f) => <Signs t={t} f={f} /> },
  { from: D.hits.final, to: 330.5, cut: true, render: (t, f) => <Newspaper t={t} f={f} v="found" /> },
  { from: 330.5, to: D.duration + 1, cut: false, render: (t, f) => <Mirror t={t} f={f} outro /> },
];

export const NikhojMV: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const scene = S.find((s) => t >= s.from && t < s.to) ?? S[S.length - 1];
  // Scenes that don't open on a hit come up out of black over ~8 frames.
  const fadeIn = scene.cut || scene.from === 0 ? 0 : 1 - smooth((t - scene.from) / 0.28);
  const open = 1 - smooth(t / 1.4);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene.render(t, f)}
      <Vignette strength={0.6} />
      <Grain frame={f} opacity={0.2} />
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(fadeIn, open) }} />
    </AbsoluteFill>
  );
};
