import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "./fonts";
import { D, H, FPS, smooth, cuePulse, rand, clamp } from "./lib";
import { Grain, Vignette, Glitch, LightLeak } from "./kit";
import { Modem, Call, Chant, Hook, Rewind } from "./scenesA";
import { Verse1, PreChorus, Chorus } from "./scenesB";
import { Drop, Verse2 } from "./scenesC";
import { Breakdown, Bridge, Build, Outro } from "./scenesD";

// "Signal নাই" — Raparrubel. A fully animated, story-driven music video.
//
// Story: a boy who has every network and no connection. It opens on a 2004
// dial-up call that drops; a radio tower broadcasts "Signal নাই" to nobody.
// The verses rewind to the analog afternoons (coins, CDs, the school field);
// verse 2 splits the screen into আগে and এখন; the breakdown dials an old
// number; in the final build his friends call him downstairs and he goes
// offline. The last image: the four signal bars were his four friends.
//
// Every visual is drawn in code. Scene boundaries sit on cue points measured
// from the master (data.json hits / word times). The picture renders silent;
// the master is muxed afterwards.

type Scene = { from: number; to: number; render: (t: number, f: number) => React.ReactNode };

const S: Scene[] = [
  { from: 0, to: 13.55, render: (t, f) => <Modem t={t} f={f} /> },
  { from: 13.55, to: 16.6, render: (t, f) => <Call t={t} f={f} /> },
  { from: 16.6, to: 32.85, render: (t, f) => <Chant t={t} f={f} /> },
  { from: 32.85, to: 44.5, render: (t, f) => <Hook t={t} f={f} /> },
  { from: 44.5, to: 56.3, render: (t, f) => <Rewind t={t} f={f} /> },
  { from: 56.3, to: 78.85, render: (t, f) => <Verse1 t={t} f={f} /> },
  { from: 78.85, to: H.chorus1, render: (t, f) => <PreChorus t={t} f={f} /> },
  { from: H.chorus1, to: H.drop, render: (t, f) => <Chorus t={t} f={f} /> },
  { from: H.drop, to: 140.2, render: (t, f) => <Drop t={t} f={f} /> },
  { from: 140.2, to: H.breakdown, render: (t, f) => <Verse2 t={t} f={f} /> },
  { from: H.breakdown, to: H.bridge, render: (t, f) => <Breakdown t={t} f={f} /> },
  { from: H.bridge, to: 185.55, render: (t, f) => <Bridge t={t} f={f} /> },
  { from: 185.55, to: H.final, render: (t, f) => <Build t={t} f={f} /> },
  { from: H.final, to: H.callStop, render: (t, f) => <Chorus t={t} f={f} final /> },
  { from: H.callStop, to: D.duration + 1, render: (t, f) => <Outro t={t} f={f} /> },
];

// Impact frames (paloananimatekor: every major lyric shift or drop gets a
// flash, shake, glitch or inversion). kind: i = invert, g = glitch, s = shake.
const IMPACTS: { at: number; kind: string }[] = [
  { at: D.tags[0], kind: "g" }, { at: D.tags[1], kind: "g" },
  { at: 16.64, kind: "igs" }, { at: H.bassIn, kind: "gs" }, { at: 49.2, kind: "g" },
  { at: H.verse1, kind: "s" }, { at: H.chorus1, kind: "gs" }, { at: H.drop, kind: "igs" },
  { at: H.cut, kind: "g" }, { at: 139.45, kind: "igs" }, { at: H.verse2, kind: "gs" },
  { at: H.breakdown, kind: "g" }, { at: H.slam, kind: "igs" }, { at: H.final, kind: "gs" },
  { at: H.callStop, kind: "g" }, { at: H.back, kind: "s" }, { at: H.end, kind: "g" },
];

export const SignalMV: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const scene = S.find((s) => t >= s.from && t < s.to) ?? S[S.length - 1];
  let inv = false, gl = 0, sh = 0;
  for (const im of IMPACTS) {
    const dt = t - im.at;
    if (dt < -0.001 || dt > 0.5) continue;
    if (im.kind.includes("i") && dt < 0.1) inv = true;
    if (im.kind.includes("g")) gl = Math.max(gl, dt < 0.2 ? 1 - dt / 0.2 : 0);
    if (im.kind.includes("s")) sh = Math.max(sh, cuePulse(t, im.at, 9));
  }
  const dx = (rand(f) - 0.5) * 40 * sh, dy = (rand(f + 7) - 0.5) * 30 * sh;
  const open = 1 - smooth(t / 0.5);
  const close = smooth((t - (D.duration - 1.2)) / 1.0);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${1 + sh * 0.04})`, filter: inv ? "invert(1) hue-rotate(180deg)" : undefined }}>
        <Glitch amount={gl} seed={Math.floor(t * 30)}>{scene.render(t, f)}</Glitch>
      </AbsoluteFill>
      <LightLeak t={t} amount={0.25} />
      <Vignette strength={0.55} />
      <Grain frame={f} opacity={0.18} />
      <AbsoluteFill style={{ background: "#000", opacity: clamp(Math.max(open, close)) }} />
    </AbsoluteFill>
  );
};
